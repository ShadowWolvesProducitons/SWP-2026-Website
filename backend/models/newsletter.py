from pydantic import BaseModel, Field, EmailStr
from typing import Optional
from datetime import datetime, timezone
import uuid


class NewsletterSubscriberBase(BaseModel):
    email: EmailStr
    name: Optional[str] = None
    source: Optional[str] = "website"
    lead_magnet: Optional[str] = None


class NewsletterSubscriberCreate(NewsletterSubscriberBase):
    pass


class NewsletterSubscriber(NewsletterSubscriberBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    is_active: bool = True
    subscribed_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    unsubscribed_at: Optional[datetime] = None

    class Config:
        from_attributes = True
