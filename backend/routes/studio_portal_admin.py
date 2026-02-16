from fastapi import APIRouter, HTTPException, Depends, Query
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timezone
import uuid

from models.studio_user import (
    UserRole, UserStatus, StudioUserUpdate, AuditEventType,
    PortalUpdate, UpdateVisibility, UpdateTag,
    PortalAsset, AssetVisibility, AssetType
)
from routes.studio_portal_auth import get_current_user, log_audit_event

router = APIRouter(prefix="/admin/studio-portal", tags=["admin-studio-portal"])

# Will be set from server.py
db = None


def set_db(database):
    global db
    db = database


async def require_admin(user: dict = Depends(get_current_user)):
    """Require admin role"""
    if user.get("role") != UserRole.ADMIN.value:
        raise HTTPException(status_code=403, detail="Admin access required")
    return user


# ============ USER MANAGEMENT ============

@router.get("/users")
async def list_users(
    status: Optional[str] = None,
    role: Optional[str] = None,
    search: Optional[str] = None,
    admin: dict = Depends(require_admin)
):
    """List all studio portal users"""
    query = {}
    
    if status:
        query["status"] = status
    if role:
        query["role"] = role
    if search:
        query["$or"] = [
            {"full_name": {"$regex": search, "$options": "i"}},
            {"email": {"$regex": search, "$options": "i"}}
        ]
    
    users = await db.studio_users.find(
        query,
        {"_id": 0, "password_hash": 0, "verification_token": 0, "reset_token": 0}
    ).sort("created_at", -1).to_list(200)
    
    return {"users": users}


@router.get("/users/{user_id}")
async def get_user(user_id: str, admin: dict = Depends(require_admin)):
    """Get specific user details"""
    user = await db.studio_users.find_one(
        {"id": user_id},
        {"_id": 0, "password_hash": 0, "verification_token": 0, "reset_token": 0}
    )
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Get user's access requests
    requests = await db.access_requests.find(
        {"user_id": user_id},
        {"_id": 0}
    ).to_list(10)
    
    # Get user's audit logs
    logs = await db.audit_logs.find(
        {"user_id": user_id},
        {"_id": 0}
    ).sort("timestamp", -1).to_list(20)
    
    return {
        "user": user,
        "access_requests": requests,
        "recent_activity": logs
    }


class UpdateUserInput(BaseModel):
    role: Optional[UserRole] = None
    status: Optional[UserStatus] = None
    project_permissions: Optional[List[str]] = None
    has_all_projects_access: Optional[bool] = None


@router.put("/users/{user_id}")
async def update_user(
    user_id: str,
    data: UpdateUserInput,
    admin: dict = Depends(require_admin)
):
    """Update user role, status, or project access"""
    user = await db.studio_users.find_one({"id": user_id})
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    update_data = {"updated_at": datetime.now(timezone.utc).isoformat()}
    audit_details = {}
    
    if data.role is not None:
        update_data["role"] = data.role.value
        audit_details["role_changed"] = {"from": user.get("role"), "to": data.role.value}
    
    if data.status is not None:
        update_data["status"] = data.status.value
        audit_details["status_changed"] = {"from": user.get("status"), "to": data.status.value}
        
        # Log revocation specifically
        if data.status == UserStatus.REVOKED:
            await log_audit_event(
                AuditEventType.ACCESS_REVOKED,
                user_id=user_id,
                user_email=user.get("email"),
                admin_id=admin["id"],
                details={"reason": "Admin revoked access"}
            )
    
    if data.project_permissions is not None:
        update_data["project_permissions"] = data.project_permissions
        audit_details["projects_changed"] = {
            "from": user.get("project_permissions", []),
            "to": data.project_permissions
        }
    
    if data.has_all_projects_access is not None:
        update_data["has_all_projects_access"] = data.has_all_projects_access
        audit_details["all_projects_access"] = data.has_all_projects_access
    
    await db.studio_users.update_one(
        {"id": user_id},
        {"$set": update_data}
    )
    
    # Log changes
    if data.role is not None:
        await log_audit_event(
            AuditEventType.ROLE_CHANGED,
            user_id=user_id,
            user_email=user.get("email"),
            admin_id=admin["id"],
            details=audit_details
        )
    
    if data.project_permissions is not None or data.has_all_projects_access is not None:
        await log_audit_event(
            AuditEventType.PROJECT_ACCESS_CHANGED,
            user_id=user_id,
            user_email=user.get("email"),
            admin_id=admin["id"],
            details=audit_details
        )
    
    return {"message": "User updated successfully"}


@router.delete("/users/{user_id}")
async def delete_user(user_id: str, admin: dict = Depends(require_admin)):
    """Delete a user (soft delete by setting status to revoked)"""
    result = await db.studio_users.update_one(
        {"id": user_id},
        {"$set": {"status": UserStatus.REVOKED.value, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    user = await db.studio_users.find_one({"id": user_id})
    
    await log_audit_event(
        AuditEventType.ACCESS_REVOKED,
        user_id=user_id,
        user_email=user.get("email") if user else None,
        admin_id=admin["id"],
        details={"action": "deleted"}
    )
    
    return {"message": "User access revoked"}


# ============ ACCESS REQUESTS ============

@router.get("/access-requests")
async def list_access_requests(
    status: Optional[str] = None,
    admin: dict = Depends(require_admin)
):
    """List all access requests"""
    query = {}
    if status:
        query["status"] = status
    
    requests = await db.access_requests.find(
        query,
        {"_id": 0}
    ).sort("created_at", -1).to_list(200)
    
    return {"requests": requests}


# ============ UPDATES MANAGEMENT ============

class CreateUpdateInput(BaseModel):
    title: str
    body: str
    tags: List[UpdateTag] = []
    project_id: Optional[str] = None
    visibility: UpdateVisibility = UpdateVisibility.ALL
    visibility_roles: List[UserRole] = []
    published: bool = True


@router.get("/updates")
async def list_all_updates(admin: dict = Depends(require_admin)):
    """List all updates (admin view)"""
    updates = await db.portal_updates.find(
        {},
        {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    
    return {"updates": updates}


@router.post("/updates")
async def create_update(data: CreateUpdateInput, admin: dict = Depends(require_admin)):
    """Create a new portal update"""
    update = PortalUpdate(
        title=data.title,
        body=data.body,
        tags=data.tags,
        project_id=data.project_id,
        visibility=data.visibility,
        visibility_roles=[r.value for r in data.visibility_roles],
        created_by=admin["id"],
        published=data.published
    )
    
    await db.portal_updates.insert_one(update.model_dump())
    
    return {"message": "Update created", "id": update.id}


@router.put("/updates/{update_id}")
async def edit_update(
    update_id: str,
    data: CreateUpdateInput,
    admin: dict = Depends(require_admin)
):
    """Edit an update"""
    result = await db.portal_updates.update_one(
        {"id": update_id},
        {"$set": {
            "title": data.title,
            "body": data.body,
            "tags": [t.value for t in data.tags],
            "project_id": data.project_id,
            "visibility": data.visibility.value,
            "visibility_roles": [r.value for r in data.visibility_roles],
            "published": data.published,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Update not found")
    
    return {"message": "Update saved"}


@router.delete("/updates/{update_id}")
async def delete_update(update_id: str, admin: dict = Depends(require_admin)):
    """Delete an update"""
    result = await db.portal_updates.delete_one({"id": update_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Update not found")
    
    return {"message": "Update deleted"}


# ============ ASSETS MANAGEMENT ============

class CreateAssetInput(BaseModel):
    name: str
    description: str = ""
    file_url: str
    file_type: str = ""
    file_size: int = 0
    asset_type: AssetType = AssetType.DOCUMENT
    thumbnail_url: Optional[str] = None
    visibility: AssetVisibility = AssetVisibility.PORTAL
    visibility_roles: List[UserRole] = []
    project_ids: List[str] = []
    requires_watermark: bool = True
    tags: List[str] = []


@router.get("/assets")
async def list_all_assets(
    archived: bool = False,
    admin: dict = Depends(require_admin)
):
    """List all assets (admin view)"""
    assets = await db.portal_assets.find(
        {"archived": archived},
        {"_id": 0}
    ).sort("created_at", -1).to_list(200)
    
    return {"assets": assets}


@router.post("/assets")
async def create_asset(data: CreateAssetInput, admin: dict = Depends(require_admin)):
    """Create a new portal asset"""
    asset = PortalAsset(
        name=data.name,
        description=data.description,
        file_url=data.file_url,
        file_type=data.file_type,
        file_size=data.file_size,
        asset_type=data.asset_type,
        thumbnail_url=data.thumbnail_url,
        visibility=data.visibility,
        visibility_roles=[r.value for r in data.visibility_roles],
        project_ids=data.project_ids,
        requires_watermark=data.requires_watermark,
        tags=data.tags,
        created_by=admin["id"]
    )
    
    await db.portal_assets.insert_one(asset.model_dump())
    
    return {"message": "Asset created", "id": asset.id}


@router.put("/assets/{asset_id}")
async def edit_asset(
    asset_id: str,
    data: CreateAssetInput,
    admin: dict = Depends(require_admin)
):
    """Edit an asset"""
    result = await db.portal_assets.update_one(
        {"id": asset_id},
        {"$set": {
            "name": data.name,
            "description": data.description,
            "file_url": data.file_url,
            "file_type": data.file_type,
            "file_size": data.file_size,
            "asset_type": data.asset_type.value,
            "thumbnail_url": data.thumbnail_url,
            "visibility": data.visibility.value,
            "visibility_roles": [r.value for r in data.visibility_roles],
            "project_ids": data.project_ids,
            "requires_watermark": data.requires_watermark,
            "tags": data.tags,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Asset not found")
    
    return {"message": "Asset saved"}


@router.put("/assets/{asset_id}/archive")
async def archive_asset(asset_id: str, admin: dict = Depends(require_admin)):
    """Archive an asset"""
    result = await db.portal_assets.update_one(
        {"id": asset_id},
        {"$set": {"archived": True, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Asset not found")
    
    return {"message": "Asset archived"}


@router.delete("/assets/{asset_id}")
async def delete_asset(asset_id: str, admin: dict = Depends(require_admin)):
    """Permanently delete an asset"""
    result = await db.portal_assets.delete_one({"id": asset_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Asset not found")
    
    return {"message": "Asset deleted"}


# ============ AUDIT LOGS ============

@router.get("/audit-logs")
async def get_audit_logs(
    event_type: Optional[str] = None,
    user_id: Optional[str] = None,
    limit: int = 100,
    admin: dict = Depends(require_admin)
):
    """Get audit logs"""
    query = {}
    if event_type:
        query["event_type"] = event_type
    if user_id:
        query["user_id"] = user_id
    
    logs = await db.audit_logs.find(
        query,
        {"_id": 0}
    ).sort("timestamp", -1).to_list(limit)
    
    return {"logs": logs}


# ============ STATS ============

@router.get("/stats")
async def get_portal_stats(admin: dict = Depends(require_admin)):
    """Get portal statistics"""
    total_users = await db.studio_users.count_documents({})
    active_users = await db.studio_users.count_documents({"status": UserStatus.ACTIVE.value})
    pending_users = await db.studio_users.count_documents({"status": UserStatus.PENDING_VERIFICATION.value})
    revoked_users = await db.studio_users.count_documents({"status": UserStatus.REVOKED.value})
    
    # Count by role
    role_counts = {}
    for role in UserRole:
        count = await db.studio_users.count_documents({"role": role.value, "status": UserStatus.ACTIVE.value})
        if count > 0:
            role_counts[role.value] = count
    
    total_updates = await db.portal_updates.count_documents({})
    total_assets = await db.portal_assets.count_documents({"archived": False})
    
    # Recent downloads
    recent_downloads = await db.audit_logs.count_documents({
        "event_type": AuditEventType.ASSET_DOWNLOAD.value
    })
    
    return {
        "users": {
            "total": total_users,
            "active": active_users,
            "pending": pending_users,
            "revoked": revoked_users,
            "by_role": role_counts
        },
        "content": {
            "updates": total_updates,
            "assets": total_assets
        },
        "activity": {
            "total_downloads": recent_downloads
        }
    }


# ============ CREATE ADMIN USER ============

class CreateAdminInput(BaseModel):
    full_name: str
    email: str
    password: str


@router.post("/create-admin")
async def create_admin_user(data: CreateAdminInput):
    """Create an admin user (for initial setup)"""
    from routes.studio_portal_auth import hash_password
    
    # Check if any admin exists
    existing_admin = await db.studio_users.find_one({"role": UserRole.ADMIN.value})
    
    # Check if email exists
    existing_email = await db.studio_users.find_one({"email": data.email.lower()})
    if existing_email:
        raise HTTPException(status_code=400, detail="Email already exists")
    
    admin = {
        "id": str(uuid.uuid4()),
        "full_name": data.full_name,
        "email": data.email.lower(),
        "role": UserRole.ADMIN.value,
        "status": UserStatus.ACTIVE.value,
        "password_hash": hash_password(data.password),
        "project_permissions": [],
        "has_all_projects_access": True,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.studio_users.insert_one(admin)
    
    return {"message": "Admin user created", "email": data.email.lower()}
