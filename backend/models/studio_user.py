from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime, timezone
from enum import Enum
import uuid


class UserRole(str, Enum):
    ADMIN = "admin"
    INVESTOR = "investor"
    SALES_AGENT = "sales_agent"
    DIRECTOR = "director"
    PRODUCER = "producer"
    EXECUTIVE_PRODUCER = "executive_producer"
    CAST = "cast"
    CREW = "crew"
    TALENT_MANAGER = "talent_manager"
    OTHER = "other"


class UserStatus(str, Enum):
    PENDING_VERIFICATION = "pending_verification"
    ACTIVE = "active"
    REVOKED = "revoked"


class StudioUserBase(BaseModel):
    full_name: str
    email: str
    role: UserRole = UserRole.OTHER
    status: UserStatus = UserStatus.PENDING_VERIFICATION
    project_permissions: List[str] = []  # List of project IDs user can access
    has_all_projects_access: bool = False  # For investors or admin override
    other_role_description: str = ""  # If role is "other"
    company: str = ""
    message: str = ""  # Initial message from access request


class StudioUserCreate(StudioUserBase):
    pass


class StudioUserUpdate(BaseModel):
    full_name: Optional[str] = None
    role: Optional[UserRole] = None
    status: Optional[UserStatus] = None
    project_permissions: Optional[List[str]] = None
    has_all_projects_access: Optional[bool] = None
    other_role_description: Optional[str] = None
    company: Optional[str] = None


class StudioUser(StudioUserBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    password_hash: Optional[str] = None
    verification_token: Optional[str] = None
    verification_token_expires: Optional[str] = None
    reset_token: Optional[str] = None
    reset_token_expires: Optional[str] = None
    last_login: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

    class Config:
        from_attributes = True


# Access Request Model (for tracking)
class AccessRequestStatus(str, Enum):
    PENDING = "pending"
    VERIFIED = "verified"
    REJECTED = "rejected"


class AccessRequest(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    full_name: str
    email: str
    role_requested: UserRole
    other_role_description: str = ""
    projects_requested: List[str] = []  # Project IDs
    message: str = ""
    agreed_to_terms: bool = True
    status: AccessRequestStatus = AccessRequestStatus.PENDING
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    verified_at: Optional[str] = None


# Audit Log Model
class AuditEventType(str, Enum):
    USER_LOGIN = "user_login"
    USER_LOGOUT = "user_logout"
    PASSWORD_SET = "password_set"
    PASSWORD_RESET = "password_reset"
    ASSET_DOWNLOAD = "asset_download"
    ROLE_CHANGED = "role_changed"
    ACCESS_REVOKED = "access_revoked"
    ACCESS_GRANTED = "access_granted"
    PROJECT_ACCESS_CHANGED = "project_access_changed"
    MASTER_ACCESS_USED = "master_access_used"
    VERIFICATION_SENT = "verification_sent"
    VERIFICATION_COMPLETED = "verification_completed"


class AuditLog(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    event_type: AuditEventType
    user_id: Optional[str] = None
    user_email: Optional[str] = None
    admin_id: Optional[str] = None  # If action performed by admin
    project_id: Optional[str] = None
    asset_id: Optional[str] = None
    details: dict = {}  # Additional context
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


# Update/News Model for Portal Feed
class UpdateVisibility(str, Enum):
    ALL = "all"
    INVESTORS_ONLY = "investors_only"
    PRODUCTION_TEAM = "production_team"  # Director, Producer, EP
    SALES = "sales"
    TALENT = "talent"  # Cast, Crew, Talent Manager
    CUSTOM = "custom"


class UpdateTag(str, Enum):
    MILESTONE = "milestone"
    FINANCE = "finance"
    PACKAGING = "packaging"
    CASTING = "casting"
    CREW = "crew"
    FESTIVALS = "festivals"
    DISTRIBUTION = "distribution"
    GENERAL = "general"


class PortalUpdate(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    body: str  # Rich text/HTML
    tags: List[UpdateTag] = []
    project_id: Optional[str] = None  # If project-specific
    visibility: UpdateVisibility = UpdateVisibility.ALL
    visibility_roles: List[UserRole] = []  # If visibility is CUSTOM
    created_by: Optional[str] = None  # Admin user ID
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    published: bool = True


# Asset Visibility Model
class AssetVisibility(str, Enum):
    PUBLIC = "public"  # Can be used on public pages
    PORTAL = "portal"  # Requires login
    ROLE_RESTRICTED = "role_restricted"  # Select roles
    PROJECT_RESTRICTED = "project_restricted"  # Select projects


class AssetType(str, Enum):
    PITCH_DECK = "pitch_deck"
    SCRIPT = "script"
    EBOOK = "ebook"
    IMAGE = "image"
    VIDEO = "video"
    DOCUMENT = "document"
    OTHER = "other"


class PortalAsset(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str = ""
    file_url: str
    file_type: str = ""  # mime type
    file_size: int = 0  # bytes
    asset_type: AssetType = AssetType.DOCUMENT
    thumbnail_url: Optional[str] = None
    
    # Visibility settings
    visibility: AssetVisibility = AssetVisibility.PORTAL
    visibility_roles: List[UserRole] = []  # If role_restricted
    project_ids: List[str] = []  # Assigned projects
    
    # Watermark settings
    requires_watermark: bool = True
    
    # Metadata
    tags: List[str] = []
    created_by: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    archived: bool = False


# Permission Matrix Helper
ROLE_PERMISSIONS = {
    UserRole.ADMIN: {
        "financials": True,
        "scripts": True,
        "deck": True,
        "updates": True,
        "all_projects": True
    },
    UserRole.INVESTOR: {
        "financials": True,
        "scripts": True,
        "deck": True,
        "updates": True,
        "all_projects": True  # Auto-access to all projects
    },
    UserRole.EXECUTIVE_PRODUCER: {
        "financials": True,
        "scripts": True,
        "deck": True,
        "updates": True,
        "all_projects": False
    },
    UserRole.PRODUCER: {
        "financials": True,
        "scripts": True,
        "deck": True,
        "updates": True,
        "all_projects": False
    },
    UserRole.SALES_AGENT: {
        "financials": False,  # Limited
        "scripts": False,  # Optional
        "deck": True,
        "updates": True,
        "all_projects": False
    },
    UserRole.DIRECTOR: {
        "financials": False,
        "scripts": True,
        "deck": True,
        "updates": True,
        "all_projects": False
    },
    UserRole.CAST: {
        "financials": False,
        "scripts": False,  # Limited
        "deck": False,
        "updates": False,  # Limited
        "all_projects": False
    },
    UserRole.CREW: {
        "financials": False,
        "scripts": False,  # Limited
        "deck": False,
        "updates": False,  # Limited
        "all_projects": False
    },
    UserRole.TALENT_MANAGER: {
        "financials": False,
        "scripts": False,  # Limited
        "deck": False,
        "updates": False,  # Limited
        "all_projects": False
    },
    UserRole.OTHER: {
        "financials": False,
        "scripts": False,
        "deck": False,
        "updates": False,
        "all_projects": False
    }
}


def get_role_permissions(role: UserRole) -> dict:
    """Get permissions for a role"""
    return ROLE_PERMISSIONS.get(role, ROLE_PERMISSIONS[UserRole.OTHER])


def can_view_financials(role: UserRole) -> bool:
    return get_role_permissions(role).get("financials", False)


def can_view_scripts(role: UserRole) -> bool:
    return get_role_permissions(role).get("scripts", False)


def can_view_deck(role: UserRole) -> bool:
    return get_role_permissions(role).get("deck", False)


def should_auto_grant_all_projects(role: UserRole) -> bool:
    return get_role_permissions(role).get("all_projects", False)
