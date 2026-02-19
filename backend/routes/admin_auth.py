from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime, timezone, timedelta
import uuid
import hashlib
import os
import secrets
import asyncio

router = APIRouter(prefix="/admin-auth", tags=["admin-auth"])

db = None

def set_db(database):
    global db
    db = database


# Password hashing using SHA-256 with salt
def hash_password(password: str) -> str:
    """Hash password with salt"""
    salt = os.environ.get("PASSWORD_SALT", "admin_salt_2024")
    return hashlib.sha256(f"{password}{salt}".encode()).hexdigest()


def verify_password(password: str, password_hash: str) -> bool:
    """Verify password against hash"""
    return hash_password(password) == password_hash


def generate_token() -> str:
    """Generate a secure random token"""
    return secrets.token_urlsafe(32)


# ============ MODELS ============

class RequestAccessInput(BaseModel):
    name: str
    email: EmailStr


class SetPasswordInput(BaseModel):
    token: str
    password: str


class LoginInput(BaseModel):
    email: EmailStr
    password: str


class AdminUser(BaseModel):
    id: str
    name: str
    email: str
    password_hash: Optional[str] = None
    status: str = "pending"  # pending, active, revoked
    access_token: Optional[str] = None
    token_expires: Optional[str] = None
    created_at: str
    updated_at: str


# ============ EMAIL SENDING ============

async def send_admin_access_email(email: str, name: str, token: str):
    """Send admin access setup email"""
    try:
        resend_api_key = os.environ.get('RESEND_API_KEY')
        if not resend_api_key:
            print("RESEND_API_KEY not set, skipping email")
            return False
        
        import resend
        resend.api_key = resend_api_key
        
        frontend_url = os.environ.get('FRONTEND_URL', os.environ.get('SITE_URL', 'https://www.shadowwolvesproductions.com.au'))
        setup_url = f"{frontend_url}/admin/setup-password?token={token}"
        from_email = os.environ.get('FROM_EMAIL', 'onboarding@resend.dev')
        
        html_content = f"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #ffffff; padding: 40px;">
            <h1 style="color: #ffffff; font-size: 24px; margin-bottom: 20px;">Admin Access Request</h1>
            <p style="color: #9ca3af; line-height: 1.6;">
                Hi {name},
            </p>
            <p style="color: #9ca3af; line-height: 1.6;">
                Your request for admin access to Shadow Wolves Productions has been received.
                Click the button below to set up your password and activate your admin account.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="{setup_url}" style="display: inline-block; background: #233dff; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 50px; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">
                    Set Up Password
                </a>
            </div>
            
            <p style="color: #666; font-size: 12px; margin-top: 30px;">
                This link will expire in 24 hours. If you didn't request admin access, please ignore this email.
            </p>
            
            <hr style="border: none; border-top: 1px solid #333; margin: 30px 0;" />
            
            <p style="color: #233dff; margin-top: 30px;">— Shadow Wolves Productions</p>
        </div>
        """
        
        await asyncio.to_thread(resend.Emails.send, {
            "from": from_email,
            "to": email,
            "subject": "Admin Access - Set Up Your Password",
            "html": html_content
        })
        
        print(f"Admin access email sent to {email}")
        return True
        
    except Exception as e:
        print(f"Failed to send admin access email: {e}")
        return False


# ============ API ENDPOINTS ============

@router.post("/request-access")
async def request_admin_access(data: RequestAccessInput, background_tasks: BackgroundTasks):
    """Request admin access - sends email with setup link"""
    email = data.email.lower()
    
    # Check if user already exists
    existing = await db.admin_users.find_one({"email": email}, {"_id": 0})
    
    if existing:
        if existing.get("status") == "active":
            raise HTTPException(status_code=400, detail="An admin account with this email already exists. Please use the login form.")
        elif existing.get("status") == "pending":
            # Resend the email with a new token
            token = generate_token()
            expires = (datetime.now(timezone.utc) + timedelta(hours=24)).isoformat()
            
            await db.admin_users.update_one(
                {"email": email},
                {"$set": {
                    "access_token": token,
                    "token_expires": expires,
                    "name": data.name,
                    "updated_at": datetime.now(timezone.utc).isoformat()
                }}
            )
            
            background_tasks.add_task(send_admin_access_email, email, data.name, token)
            return {"message": "Access request received. Check your email for the setup link."}
    
    # Create new pending admin user
    token = generate_token()
    expires = (datetime.now(timezone.utc) + timedelta(hours=24)).isoformat()
    
    admin_user = {
        "id": str(uuid.uuid4()),
        "name": data.name,
        "email": email,
        "password_hash": None,
        "status": "pending",
        "access_token": token,
        "token_expires": expires,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.admin_users.insert_one(admin_user)
    
    # Send email in background
    background_tasks.add_task(send_admin_access_email, email, data.name, token)
    
    return {"message": "Access request received. Check your email for the setup link."}


@router.get("/verify-token/{token}")
async def verify_access_token(token: str):
    """Verify if a token is valid"""
    user = await db.admin_users.find_one({"access_token": token}, {"_id": 0})
    
    if not user:
        raise HTTPException(status_code=400, detail="Invalid or expired token")
    
    # Check if token has expired
    if user.get("token_expires"):
        expires = datetime.fromisoformat(user["token_expires"])
        if datetime.now(timezone.utc) > expires:
            raise HTTPException(status_code=400, detail="Token has expired. Please request access again.")
    
    return {
        "valid": True,
        "email": user.get("email"),
        "name": user.get("name")
    }


@router.post("/set-password")
async def set_admin_password(data: SetPasswordInput):
    """Set password for admin account after email verification"""
    user = await db.admin_users.find_one({"access_token": data.token}, {"_id": 0})
    
    if not user:
        raise HTTPException(status_code=400, detail="Invalid or expired token")
    
    # Check if token has expired
    if user.get("token_expires"):
        expires = datetime.fromisoformat(user["token_expires"])
        if datetime.now(timezone.utc) > expires:
            raise HTTPException(status_code=400, detail="Token has expired. Please request access again.")
    
    # Validate password
    if len(data.password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters")
    
    # Update user with password and activate
    password_hash = hash_password(data.password)
    
    await db.admin_users.update_one(
        {"access_token": data.token},
        {"$set": {
            "password_hash": password_hash,
            "status": "active",
            "access_token": None,
            "token_expires": None,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    return {"message": "Password set successfully. You can now log in."}


@router.post("/login")
async def admin_login(data: LoginInput):
    """Login with email and password"""
    email = data.email.lower()
    
    user = await db.admin_users.find_one({"email": email}, {"_id": 0})
    
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    if user.get("status") != "active":
        raise HTTPException(status_code=401, detail="Account is not active. Please complete the setup process.")
    
    if not user.get("password_hash"):
        raise HTTPException(status_code=401, detail="Password not set. Please complete the setup process.")
    
    if not verify_password(data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Generate session token
    session_token = generate_token()
    
    # Update last login
    await db.admin_users.update_one(
        {"email": email},
        {"$set": {
            "last_login": datetime.now(timezone.utc).isoformat(),
            "session_token": session_token
        }}
    )
    
    return {
        "success": True,
        "message": "Login successful",
        "token": session_token,
        "user": {
            "name": user.get("name"),
            "email": user.get("email")
        }
    }


@router.get("/check")
async def check_admin_exists():
    """Check if any admin users exist"""
    count = await db.admin_users.count_documents({"status": "active"})
    return {"has_admins": count > 0}
