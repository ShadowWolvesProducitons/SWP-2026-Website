from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime, timezone
import uuid
import re


def generate_slug(title: str) -> str:
    """Generate URL-friendly slug from title"""
    slug = title.lower()
    slug = re.sub(r'[^a-z0-9\s-]', '', slug)
    slug = re.sub(r'[\s_]+', '-', slug)
    slug = re.sub(r'-+', '-', slug)
    slug = slug.strip('-')
    return slug


class DenItemBase(BaseModel):
    title: str
    slug: Optional[str] = None  # URL slug like "house-heroes"
    item_type: str  # Apps, Templates, Downloads, Courses, eBooks
    featured: bool = False
    short_description: str = ""
    long_description: Optional[str] = None
    # Landing page content
    hero_image_url: Optional[str] = None  # Large banner image for landing page
    thumbnail_url: Optional[str] = None  # Small thumbnail for listing
    screenshots: List[str] = []  # Gallery images
    features: List[str] = []  # Feature bullet points
    # Links and files
    primary_link_url: Optional[str] = None  # App store / main link
    file_url: Optional[str] = None  # For downloadable files
    demo_url: Optional[str] = None  # Demo/preview link
    video_url: Optional[str] = None  # Promo video embed
    # Pricing
    price: Optional[str] = None
    price_note: Optional[str] = None  # e.g., "one-time purchase", "per month"
    is_free: bool = True
    # Meta
    tags: List[str] = []
    seo_title: Optional[str] = None  # Custom SEO title
    seo_description: Optional[str] = None  # Custom meta description
    sort_order: int = 0
    is_archived: bool = False
    is_published: bool = True  # Whether the landing page is live


class DenItemCreate(DenItemBase):
    pass


class DenItemUpdate(BaseModel):
    title: Optional[str] = None
    slug: Optional[str] = None
    item_type: Optional[str] = None
    featured: Optional[bool] = None
    short_description: Optional[str] = None
    long_description: Optional[str] = None
    hero_image_url: Optional[str] = None
    thumbnail_url: Optional[str] = None
    screenshots: Optional[List[str]] = None
    features: Optional[List[str]] = None
    primary_link_url: Optional[str] = None
    file_url: Optional[str] = None
    demo_url: Optional[str] = None
    video_url: Optional[str] = None
    price: Optional[str] = None
    price_note: Optional[str] = None
    is_free: Optional[bool] = None
    tags: Optional[List[str]] = None
    seo_title: Optional[str] = None
    seo_description: Optional[str] = None
    sort_order: Optional[int] = None
    is_archived: Optional[bool] = None
    is_published: Optional[bool] = None


class DenItem(DenItemBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Config:
        from_attributes = True
