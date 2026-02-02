from pydantic import BaseModel, Field, EmailStr
from typing import Optional
from datetime import datetime, timezone
import uuid


class ContactMessageBase(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    service: Optional[str] = None  # Project type
    message: str


class ContactMessageCreate(ContactMessageBase):
    pass


class ContactMessageUpdate(BaseModel):
    status: Optional[str] = None  # New, Read, Replied, Archived
    admin_notes: Optional[str] = None


class ContactMessage(ContactMessageBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    status: str = "New"  # New, Read, Replied, Archived
    admin_notes: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Config:
        from_attributes = True
