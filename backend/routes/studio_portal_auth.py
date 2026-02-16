from fastapi import APIRouter, HTTPException, Query, Depends, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from datetime import datetime, timezone, timedelta
from typing import List, Optional
import uuid
import hashlib
import secrets
import jwt
import os

from models.studio_user import (
    StudioUser, StudioUserCreate, StudioUserUpdate, UserRole, UserStatus,
    AccessRequest, AccessRequestStatus, AuditLog, AuditEventType,
    get_role_permissions, should_auto_grant_all_projects,
    can_view_financials, can_view_scripts, can_view_deck
)

router = APIRouter(prefix="/studio-portal", tags=["studio-portal"])

# JWT Configuration
JWT_SECRET = os.environ.get("JWT_SECRET", "shadowwolves-studio-secret-2024")
JWT_ALGORITHM = "HS256"
JWT_EXPIRY_DAYS = 30

# Master password for admin demos
MASTER_ACCESS_PASSWORD = os.environ.get("MASTER_ACCESS_PASSWORD", "ShadowWolvesStudio2024!")

# Security
security = HTTPBearer(auto_error=False)

# Will be set from server.py
db = None


def set_db(database):
    global db
    db = database


# ============ HELPER FUNCTIONS ============

def hash_password(password: str) -> str:
    """Hash password using SHA256 with salt"""
    salt = "shadowwolves_salt_2024"
    return hashlib.sha256(f"{password}{salt}".encode()).hexdigest()


def verify_password(password: str, hashed: str) -> bool:
    """Verify password against hash"""
    return hash_password(password) == hashed


def generate_token() -> str:
    """Generate a secure random token"""
    return secrets.token_urlsafe(32)


def create_jwt_token(user_id: str, email: str, role: str) -> str:
    """Create JWT token for authenticated user"""
    payload = {
        "user_id": user_id,
        "email": email,
        "role": role,
        "exp": datetime.now(timezone.utc) + timedelta(days=JWT_EXPIRY_DAYS),
        "iat": datetime.now(timezone.utc)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def decode_jwt_token(token: str) -> dict:
    """Decode and validate JWT token"""
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    """Get current authenticated user from JWT token"""
    if not credentials:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    payload = decode_jwt_token(credentials.credentials)
    
    # Verify user still exists and is active
    user = await db.studio_users.find_one(
        {"id": payload["user_id"], "status": UserStatus.ACTIVE.value},
        {"_id": 0, "password_hash": 0}
    )
    
    if not user:
        raise HTTPException(status_code=401, detail="User not found or access revoked")
    
    return user


async def log_audit_event(
    event_type: AuditEventType,
    user_id: str = None,
    user_email: str = None,
    admin_id: str = None,
    project_id: str = None,
    asset_id: str = None,
    details: dict = None,
    ip_address: str = None,
    user_agent: str = None
):
    """Log an audit event"""
    log_entry = AuditLog(
        event_type=event_type,
        user_id=user_id,
        user_email=user_email,
        admin_id=admin_id,
        project_id=project_id,
        asset_id=asset_id,
        details=details or {},
        ip_address=ip_address,
        user_agent=user_agent
    )
    await db.audit_logs.insert_one(log_entry.model_dump())


# ============ REQUEST ACCESS ============

class RequestAccessInput(BaseModel):
    full_name: str
    email: EmailStr
    role: UserRole
    other_role_description: str = ""
    projects_requested: List[str] = []
    message: str = ""
    agreed_to_terms: bool = True


@router.post("/request-access")
async def request_access(data: RequestAccessInput, request: Request):
    """Public endpoint: Request access to the studio portal"""
    if not data.agreed_to_terms:
        raise HTTPException(status_code=400, detail="You must agree to the terms")
    
    # Check if user already exists
    existing = await db.studio_users.find_one({"email": data.email.lower()})
    if existing:
        if existing.get("status") == UserStatus.ACTIVE.value:
            raise HTTPException(status_code=400, detail="An account with this email already exists. Please login.")
        elif existing.get("status") == UserStatus.PENDING_VERIFICATION.value:
            raise HTTPException(status_code=400, detail="A verification email has already been sent. Please check your inbox.")
        elif existing.get("status") == UserStatus.REVOKED.value:
            raise HTTPException(status_code=400, detail="Your access has been revoked. Please contact admin.")
    
    # Generate verification token
    verification_token = generate_token()
    token_expires = (datetime.now(timezone.utc) + timedelta(hours=72)).isoformat()
    
    # Determine project access based on role
    has_all_projects = should_auto_grant_all_projects(data.role)
    project_permissions = []
    
    if has_all_projects:
        # Investors get all projects automatically
        pass
    elif data.projects_requested:
        # Other roles get only requested projects
        project_permissions = data.projects_requested
    
    # Create user
    user = StudioUser(
        full_name=data.full_name,
        email=data.email.lower(),
        role=data.role,
        status=UserStatus.PENDING_VERIFICATION,
        project_permissions=project_permissions,
        has_all_projects_access=has_all_projects,
        other_role_description=data.other_role_description,
        message=data.message,
        verification_token=verification_token,
        verification_token_expires=token_expires
    )
    
    await db.studio_users.insert_one(user.model_dump())
    
    # Create access request record
    access_request = AccessRequest(
        user_id=user.id,
        full_name=data.full_name,
        email=data.email.lower(),
        role_requested=data.role,
        other_role_description=data.other_role_description,
        projects_requested=data.projects_requested,
        message=data.message,
        agreed_to_terms=data.agreed_to_terms
    )
    await db.access_requests.insert_one(access_request.model_dump())
    
    # Log event
    await log_audit_event(
        AuditEventType.VERIFICATION_SENT,
        user_id=user.id,
        user_email=data.email.lower(),
        details={"role": data.role.value, "projects": data.projects_requested},
        ip_address=request.client.host if request.client else None
    )
    
    # Send verification email via Resend
    try:
        from services.email_service import send_verification_email
        verification_url = f"{os.environ.get('FRONTEND_URL', 'https://film-system.preview.emergentagent.com')}/verify-access?token={verification_token}"
        await send_verification_email(data.email, data.full_name, verification_url)
    except Exception as e:
        print(f"Failed to send verification email: {e}")
        # Don't fail the request, user can request resend
    
    return {
        "message": "Access request submitted. Please check your email to verify your account.",
        "email": data.email.lower()
    }


@router.post("/resend-verification")
async def resend_verification(email: str):
    """Resend verification email"""
    user = await db.studio_users.find_one({"email": email.lower()})
    
    if not user:
        raise HTTPException(status_code=404, detail="No pending request found for this email")
    
    if user.get("status") != UserStatus.PENDING_VERIFICATION.value:
        raise HTTPException(status_code=400, detail="Account is already verified or access has been revoked")
    
    # Generate new token
    verification_token = generate_token()
    token_expires = (datetime.now(timezone.utc) + timedelta(hours=72)).isoformat()
    
    await db.studio_users.update_one(
        {"email": email.lower()},
        {"$set": {
            "verification_token": verification_token,
            "verification_token_expires": token_expires
        }}
    )
    
    # Send email
    try:
        from services.email_service import send_verification_email
        verification_url = f"{os.environ.get('FRONTEND_URL', 'https://film-system.preview.emergentagent.com')}/verify-access?token={verification_token}"
        await send_verification_email(email, user.get("full_name", ""), verification_url)
    except Exception as e:
        print(f"Failed to send verification email: {e}")
    
    return {"message": "Verification email resent"}


# ============ VERIFY & SET PASSWORD ============

class VerifyTokenInput(BaseModel):
    token: str


@router.post("/verify-token")
async def verify_token(data: VerifyTokenInput):
    """Verify the email verification token"""
    user = await db.studio_users.find_one({"verification_token": data.token})
    
    if not user:
        raise HTTPException(status_code=400, detail="Invalid or expired verification token")
    
    # Check expiry
    if user.get("verification_token_expires"):
        expires = datetime.fromisoformat(user["verification_token_expires"])
        if datetime.now(timezone.utc) > expires:
            raise HTTPException(status_code=400, detail="Verification token has expired. Please request a new one.")
    
    return {
        "valid": True,
        "email": user.get("email"),
        "full_name": user.get("full_name"),
        "user_id": user.get("id")
    }


class SetPasswordInput(BaseModel):
    token: str
    password: str
    confirm_password: str


@router.post("/set-password")
async def set_password(data: SetPasswordInput, request: Request):
    """Set password after email verification"""
    if data.password != data.confirm_password:
        raise HTTPException(status_code=400, detail="Passwords do not match")
    
    if len(data.password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters")
    
    user = await db.studio_users.find_one({"verification_token": data.token})
    
    if not user:
        raise HTTPException(status_code=400, detail="Invalid verification token")
    
    # Check expiry
    if user.get("verification_token_expires"):
        expires = datetime.fromisoformat(user["verification_token_expires"])
        if datetime.now(timezone.utc) > expires:
            raise HTTPException(status_code=400, detail="Verification token has expired")
    
    # Update user
    password_hash = hash_password(data.password)
    
    await db.studio_users.update_one(
        {"id": user["id"]},
        {"$set": {
            "password_hash": password_hash,
            "status": UserStatus.ACTIVE.value,
            "verification_token": None,
            "verification_token_expires": None,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    # Update access request
    await db.access_requests.update_one(
        {"user_id": user["id"]},
        {"$set": {
            "status": AccessRequestStatus.VERIFIED.value,
            "verified_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    # Log event
    await log_audit_event(
        AuditEventType.VERIFICATION_COMPLETED,
        user_id=user["id"],
        user_email=user.get("email"),
        ip_address=request.client.host if request.client else None
    )
    
    # Create JWT token
    token = create_jwt_token(user["id"], user["email"], user["role"])
    
    return {
        "message": "Password set successfully. You are now logged in.",
        "token": token,
        "user": {
            "id": user["id"],
            "email": user["email"],
            "full_name": user["full_name"],
            "role": user["role"]
        }
    }


# ============ LOGIN ============

class LoginInput(BaseModel):
    email: EmailStr
    password: str


@router.post("/login")
async def login(data: LoginInput, request: Request):
    """Login with email and password"""
    user = await db.studio_users.find_one({"email": data.email.lower()})
    
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    if user.get("status") == UserStatus.PENDING_VERIFICATION.value:
        raise HTTPException(status_code=401, detail="Please verify your email first")
    
    if user.get("status") == UserStatus.REVOKED.value:
        raise HTTPException(status_code=401, detail="Your access has been revoked")
    
    if not user.get("password_hash"):
        raise HTTPException(status_code=401, detail="Please complete account setup first")
    
    if not verify_password(data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Update last login
    await db.studio_users.update_one(
        {"id": user["id"]},
        {"$set": {"last_login": datetime.now(timezone.utc).isoformat()}}
    )
    
    # Log event
    await log_audit_event(
        AuditEventType.USER_LOGIN,
        user_id=user["id"],
        user_email=user["email"],
        ip_address=request.client.host if request.client else None
    )
    
    # Create JWT token
    token = create_jwt_token(user["id"], user["email"], user["role"])
    
    return {
        "token": token,
        "user": {
            "id": user["id"],
            "email": user["email"],
            "full_name": user["full_name"],
            "role": user["role"],
            "has_all_projects_access": user.get("has_all_projects_access", False)
        }
    }


# ============ MASTER ACCESS (ADMIN DEMO) ============

class MasterAccessInput(BaseModel):
    password: str
    admin_email: str  # Must be a known admin


@router.post("/master-access")
async def master_access(data: MasterAccessInput, request: Request):
    """Admin master access for demos"""
    if data.password != MASTER_ACCESS_PASSWORD:
        raise HTTPException(status_code=401, detail="Invalid master password")
    
    # Verify admin exists
    admin = await db.studio_users.find_one({
        "email": data.admin_email.lower(),
        "role": UserRole.ADMIN.value,
        "status": UserStatus.ACTIVE.value
    })
    
    if not admin:
        raise HTTPException(status_code=401, detail="Admin account not found")
    
    # Log master access usage
    await log_audit_event(
        AuditEventType.MASTER_ACCESS_USED,
        user_id=admin["id"],
        user_email=admin["email"],
        details={"method": "master_password"},
        ip_address=request.client.host if request.client else None
    )
    
    # Create token
    token = create_jwt_token(admin["id"], admin["email"], admin["role"])
    
    return {
        "token": token,
        "user": {
            "id": admin["id"],
            "email": admin["email"],
            "full_name": admin["full_name"],
            "role": admin["role"]
        },
        "warning": "Master access used - logged for audit"
    }


# ============ FORGOT PASSWORD ============

class ForgotPasswordInput(BaseModel):
    email: EmailStr


@router.post("/forgot-password")
async def forgot_password(data: ForgotPasswordInput):
    """Request password reset"""
    user = await db.studio_users.find_one({"email": data.email.lower()})
    
    # Don't reveal if user exists
    if not user or user.get("status") != UserStatus.ACTIVE.value:
        return {"message": "If an account exists with this email, a reset link will be sent."}
    
    # Generate reset token
    reset_token = generate_token()
    token_expires = (datetime.now(timezone.utc) + timedelta(hours=24)).isoformat()
    
    await db.studio_users.update_one(
        {"id": user["id"]},
        {"$set": {
            "reset_token": reset_token,
            "reset_token_expires": token_expires
        }}
    )
    
    # Send reset email
    try:
        from services.email_service import send_password_reset_email
        reset_url = f"{os.environ.get('FRONTEND_URL', 'https://film-system.preview.emergentagent.com')}/reset-password?token={reset_token}"
        await send_password_reset_email(data.email, user.get("full_name", ""), reset_url)
    except Exception as e:
        print(f"Failed to send reset email: {e}")
    
    return {"message": "If an account exists with this email, a reset link will be sent."}


class ResetPasswordInput(BaseModel):
    token: str
    password: str
    confirm_password: str


@router.post("/reset-password")
async def reset_password(data: ResetPasswordInput, request: Request):
    """Reset password with token"""
    if data.password != data.confirm_password:
        raise HTTPException(status_code=400, detail="Passwords do not match")
    
    if len(data.password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters")
    
    user = await db.studio_users.find_one({"reset_token": data.token})
    
    if not user:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")
    
    # Check expiry
    if user.get("reset_token_expires"):
        expires = datetime.fromisoformat(user["reset_token_expires"])
        if datetime.now(timezone.utc) > expires:
            raise HTTPException(status_code=400, detail="Reset token has expired")
    
    # Update password
    password_hash = hash_password(data.password)
    
    await db.studio_users.update_one(
        {"id": user["id"]},
        {"$set": {
            "password_hash": password_hash,
            "reset_token": None,
            "reset_token_expires": None,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    # Log event
    await log_audit_event(
        AuditEventType.PASSWORD_RESET,
        user_id=user["id"],
        user_email=user["email"],
        ip_address=request.client.host if request.client else None
    )
    
    return {"message": "Password reset successfully. Please login with your new password."}


# ============ CURRENT USER ============

@router.get("/me")
async def get_me(user: dict = Depends(get_current_user)):
    """Get current user profile"""
    return {
        "user": user,
        "permissions": get_role_permissions(UserRole(user["role"]))
    }


@router.put("/me")
async def update_me(
    full_name: str = None,
    company: str = None,
    user: dict = Depends(get_current_user)
):
    """Update current user profile"""
    update_data = {"updated_at": datetime.now(timezone.utc).isoformat()}
    
    if full_name:
        update_data["full_name"] = full_name
    if company is not None:
        update_data["company"] = company
    
    await db.studio_users.update_one(
        {"id": user["id"]},
        {"$set": update_data}
    )
    
    return {"message": "Profile updated"}


class ChangePasswordInput(BaseModel):
    current_password: str
    new_password: str
    confirm_password: str


@router.post("/change-password")
async def change_password(
    data: ChangePasswordInput,
    request: Request,
    user: dict = Depends(get_current_user)
):
    """Change password for logged in user"""
    if data.new_password != data.confirm_password:
        raise HTTPException(status_code=400, detail="Passwords do not match")
    
    if len(data.new_password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters")
    
    # Get user with password hash
    full_user = await db.studio_users.find_one({"id": user["id"]})
    
    if not verify_password(data.current_password, full_user.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="Current password is incorrect")
    
    # Update password
    password_hash = hash_password(data.new_password)
    
    await db.studio_users.update_one(
        {"id": user["id"]},
        {"$set": {
            "password_hash": password_hash,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    await log_audit_event(
        AuditEventType.PASSWORD_SET,
        user_id=user["id"],
        user_email=user["email"],
        ip_address=request.client.host if request.client else None
    )
    
    return {"message": "Password changed successfully"}
