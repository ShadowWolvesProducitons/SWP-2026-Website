from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
from datetime import datetime, timezone
import uuid


# Investor Access Credentials
class InvestorCredentialBase(BaseModel):
    name: str
    email: Optional[EmailStr] = None
    access_type: str = "code"  # "password" or "code"
    access_code: Optional[str] = None  # For invite-only access
    is_active: bool = True
    notes: Optional[str] = None


class InvestorCredentialCreate(InvestorCredentialBase):
    pass


class InvestorCredentialUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    access_code: Optional[str] = None
    is_active: Optional[bool] = None
    notes: Optional[str] = None


class InvestorCredential(InvestorCredentialBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    last_accessed: Optional[datetime] = None
    access_count: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Config:
        from_attributes = True


# Investor Projects (Development Slate)
class InvestorProjectBase(BaseModel):
    title: str
    genre: str
    status: str  # Script, Proof, Financing, In Development
    hook: str  # One-line hook
    description: str  # Why this project exists
    poster_url: Optional[str] = None
    budget_range: Optional[str] = None
    is_visible: bool = True
    sort_order: int = 0


class InvestorProjectCreate(InvestorProjectBase):
    pass


class InvestorProjectUpdate(BaseModel):
    title: Optional[str] = None
    genre: Optional[str] = None
    status: Optional[str] = None
    hook: Optional[str] = None
    description: Optional[str] = None
    poster_url: Optional[str] = None
    budget_range: Optional[str] = None
    is_visible: Optional[bool] = None
    sort_order: Optional[int] = None


class InvestorProject(InvestorProjectBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Config:
        from_attributes = True


# Investor Documents (now project-linked)
class InvestorDocumentBase(BaseModel):
    title: str
    doc_type: str  # Pitch Deck, Screener, Script, Lookbook, Overview, Other
    project_id: Optional[str] = None  # Links document to specific project (null = general doc)
    description: Optional[str] = None
    file_url: str
    is_watermarked: bool = False
    is_visible: bool = True
    sort_order: int = 0


class InvestorDocumentCreate(InvestorDocumentBase):
    pass


class InvestorDocumentUpdate(BaseModel):
    title: Optional[str] = None
    doc_type: Optional[str] = None
    project_id: Optional[str] = None
    description: Optional[str] = None
    file_url: Optional[str] = None
    is_watermarked: Optional[bool] = None
    is_visible: Optional[bool] = None
    sort_order: Optional[int] = None


class InvestorDocument(InvestorDocumentBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    download_count: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Config:
        from_attributes = True


# Document Download Log
class DocumentDownloadLog(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    document_id: str
    document_title: str
    project_id: Optional[str] = None
    investor_id: Optional[str] = None
    investor_name: Optional[str] = None
    investor_email: Optional[str] = None
    ip_address: Optional[str] = None
    downloaded_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# Document Request (for investors requesting docs with their details)
class DocumentRequestBase(BaseModel):
    project_id: str
    project_title: str
    doc_type: str  # Pitch Deck, Screener, Script
    name: str
    email: EmailStr
    company: Optional[str] = None
    phone: Optional[str] = None


class DocumentRequestCreate(DocumentRequestBase):
    pass


class DocumentRequest(DocumentRequestBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    status: str = "pending"  # pending, approved, denied
    admin_notes: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    class Config:
        from_attributes = True


# Investor Expression of Interest
class InvestorInquiryBase(BaseModel):
    name: str
    email: EmailStr
    investor_type: str  # Individual, Family Office, VC, Strategic, Other
    area_of_interest: str  # Single Project, Slate Investment, Strategic Partnership
    message: Optional[str] = None


class InvestorInquiryCreate(InvestorInquiryBase):
    pass


class InvestorInquiryUpdate(BaseModel):
    status: Optional[str] = None  # New, Contacted, In Discussion, Archived
    admin_notes: Optional[str] = None


class InvestorInquiry(InvestorInquiryBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    status: str = "New"
    admin_notes: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Config:
        from_attributes = True


# Investor Portal Settings
class InvestorPortalSettings(BaseModel):
    portal_enabled: bool = True
    global_password: Optional[str] = None  # For simple password access
    require_code: bool = False  # Whether to require invite codes
    welcome_message: Optional[str] = None
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
