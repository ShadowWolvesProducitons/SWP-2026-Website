from pydantic import BaseModel, Field
from typing import Optional, List, Literal
from datetime import datetime, timezone
import uuid


# Block types for newsletter content
class MainStoryBlock(BaseModel):
    type: Literal["main_story"] = "main_story"
    image_url: Optional[str] = None
    image_alt: Optional[str] = None
    eyebrow: Optional[str] = None
    headline: str = ""
    body: str = ""
    cta_url: Optional[str] = None
    cta_text: Optional[str] = None
    cta_microcopy: Optional[str] = None


class ImageTextBlock(BaseModel):
    type: Literal["image_text"] = "image_text"
    image_url: Optional[str] = None
    image_alt: Optional[str] = None
    title: str = ""
    body: str = ""
    link_url: Optional[str] = None
    link_text: Optional[str] = None


class SimpleTextBlock(BaseModel):
    type: Literal["simple_text"] = "simple_text"
    headline: Optional[str] = None
    body: str = ""


# Union type for all block types
ContentBlock = MainStoryBlock | ImageTextBlock | SimpleTextBlock


class NewsletterIssue(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    # Basic info
    title: str  # Internal title for identification
    subject: str  # Email subject line
    preheader: Optional[str] = None  # Preview text in email clients
    
    # Header section
    header_image_url: Optional[str] = None
    issue_label: Optional[str] = None  # e.g., "INSIDE THE DEN // Issue 01"
    date_label: Optional[str] = None  # e.g., "19 Feb 2026"
    
    # Hero/intro section
    hero_title: Optional[str] = None
    hero_intro: Optional[str] = None
    hero_chips: Optional[str] = None  # e.g., "Casting Calls - Crew Intel - Tools"
    
    # Content blocks - array of different block types
    blocks: List[dict] = Field(default_factory=list)
    
    # Audience segment
    segment: str = "all"  # "all", "subscribers", "portal_users", etc.
    
    # Status
    status: str = "draft"  # "draft", "scheduled", "sent"
    sent_at: Optional[datetime] = None
    sent_count: Optional[int] = None
    
    # CTA settings (footer)
    show_studio_cta: bool = True
    
    # Timestamps
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class NewsletterIssueCreate(BaseModel):
    title: str
    subject: str
    preheader: Optional[str] = None
    header_image_url: Optional[str] = None
    issue_label: Optional[str] = None
    date_label: Optional[str] = None
    hero_title: Optional[str] = None
    hero_intro: Optional[str] = None
    hero_chips: Optional[str] = None
    blocks: List[dict] = Field(default_factory=list)
    segment: str = "all"
    show_studio_cta: bool = True


class NewsletterIssueUpdate(BaseModel):
    title: Optional[str] = None
    subject: Optional[str] = None
    preheader: Optional[str] = None
    header_image_url: Optional[str] = None
    issue_label: Optional[str] = None
    date_label: Optional[str] = None
    hero_title: Optional[str] = None
    hero_intro: Optional[str] = None
    hero_chips: Optional[str] = None
    blocks: Optional[List[dict]] = None
    segment: Optional[str] = None
    show_studio_cta: Optional[bool] = None
    status: Optional[str] = None
