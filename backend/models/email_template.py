from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime, timezone
import uuid


class EmailTemplate(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str  # e.g., "welcome_email", "contact_notification", etc.
    display_name: str  # e.g., "Welcome Email", "Contact Notification"
    subject: str
    html_content: str
    description: Optional[str] = None
    is_active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class EmailTemplateCreate(BaseModel):
    name: str
    display_name: str
    subject: str
    html_content: str
    description: Optional[str] = None
    is_active: bool = True


class EmailTemplateUpdate(BaseModel):
    display_name: Optional[str] = None
    subject: Optional[str] = None
    html_content: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None
