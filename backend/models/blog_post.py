from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime, timezone
import uuid
import re


def generate_slug(title: str) -> str:
    """Generate URL-friendly slug from title"""
    slug = title.lower().strip()
    slug = re.sub(r'[^\w\s-]', '', slug)
    slug = re.sub(r'[\s_-]+', '-', slug)
    slug = slug.strip('-')
    return slug


class BlogPostBase(BaseModel):
    title: str
    slug: Optional[str] = None
    excerpt: Optional[str] = None
    cover_image_url: Optional[str] = None
    content: str = ""
    tags: List[str] = []
    status: str = "Draft"  # Draft, Published
    published_at: Optional[datetime] = None
    is_archived: bool = False
    # SEO Fields
    seo_title: Optional[str] = None  # Custom page title for SEO
    seo_description: Optional[str] = None  # Meta description
    seo_keywords: Optional[str] = None  # Meta keywords
    canonical_url: Optional[str] = None  # Canonical URL if different
    og_image_url: Optional[str] = None  # Open Graph image (defaults to cover_image_url)
    no_index: bool = False  # Prevent search engine indexing


class BlogPostCreate(BlogPostBase):
    pass


class BlogPostUpdate(BaseModel):
    title: Optional[str] = None
    slug: Optional[str] = None
    excerpt: Optional[str] = None
    cover_image_url: Optional[str] = None
    content: Optional[str] = None
    tags: Optional[List[str]] = None
    status: Optional[str] = None
    published_at: Optional[datetime] = None
    is_archived: Optional[bool] = None


class BlogPost(BlogPostBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Config:
        from_attributes = True
