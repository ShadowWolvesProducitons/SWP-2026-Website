from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from pydantic import BaseModel
import bcrypt
import os
import secrets

router = APIRouter(prefix="/admin", tags=["admin"])

security = HTTPBasic()


class AdminLogin(BaseModel):
    password: str


class AdminToken(BaseModel):
    success: bool
    message: str


def get_admin_password_hash():
    """Get or create admin password hash from environment"""
    return os.environ.get('ADMIN_PASSWORD_HASH', '')


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash"""
    try:
        return bcrypt.checkpw(
            plain_password.encode('utf-8'),
            hashed_password.encode('utf-8')
        )
    except Exception:
        return False


@router.post("/login", response_model=AdminToken)
async def admin_login(credentials: AdminLogin):
    """Verify admin password"""
    stored_hash = get_admin_password_hash()
    
    if not stored_hash:
        raise HTTPException(
            status_code=500,
            detail="Admin password not configured"
        )
    
    if verify_password(credentials.password, stored_hash):
        return AdminToken(success=True, message="Authentication successful")
    else:
        raise HTTPException(
            status_code=401,
            detail="Invalid password"
        )


@router.get("/verify")
async def verify_session():
    """Simple endpoint to verify admin is configured"""
    stored_hash = get_admin_password_hash()
    return {"configured": bool(stored_hash)}
