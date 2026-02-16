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


class FilmBase(BaseModel):
    title: str
    slug: str = ""
    film_type: str = "Feature"  # Short, Feature, Series, Documentary, Other
    status: str = "Development"  # Development, Packaging, Pre-Production, Filming, Post-Production, Marketing, Released
    featured: bool = False
    poster_url: Optional[str] = None
    tagline: str = ""  # Single sentence hook for hero
    logline: str = ""  # Single paragraph logline
    extended_synopsis: str = ""  # Longer synopsis, collapsed by default on public page
    tone_style_text: str = ""  # 3-5 paragraphs about vision and tone
    mood_images: List[str] = []  # 4-6 mood-setting still URLs
    genres: List[str] = []  # Limited to 3
    format: str = ""  # e.g., "Feature Film", "Limited Series", "Short"
    target_audience: str = ""  # Target demographic description
    comparables: str = ""  # Comparable films/shows
    looking_for: List[str] = []  # e.g., ["Producers", "Equity Partners", "Distribution"]
    target_budget_range: str = ""  # e.g., "$2M - $5M"
    financing_structure: str = ""  # High-level financing overview
    incentives: str = ""  # Tax incentives, rebates info
    pitch_deck_url: Optional[str] = None  # PDF URL for studio access
    script_url: Optional[str] = None  # PDF URL for studio access (gated)
    imdb_url: Optional[str] = None
    watch_url: Optional[str] = None
    watch_url_title: Optional[str] = None  # e.g., "Trailer", "Watch Now"
    studio_access_enabled: bool = False  # Enable studio access page


class FilmCreate(FilmBase):
    pass


class FilmUpdate(BaseModel):
    title: Optional[str] = None
    slug: Optional[str] = None
    film_type: Optional[str] = None
    status: Optional[str] = None
    featured: Optional[bool] = None
    poster_url: Optional[str] = None
    tagline: Optional[str] = None
    logline: Optional[str] = None
    extended_synopsis: Optional[str] = None
    tone_style_text: Optional[str] = None
    mood_images: Optional[List[str]] = None
    genres: Optional[List[str]] = None
    format: Optional[str] = None
    target_audience: Optional[str] = None
    comparables: Optional[str] = None
    looking_for: Optional[List[str]] = None
    target_budget_range: Optional[str] = None
    financing_structure: Optional[str] = None
    incentives: Optional[str] = None
    pitch_deck_url: Optional[str] = None
    script_url: Optional[str] = None
    imdb_url: Optional[str] = None
    watch_url: Optional[str] = None
    watch_url_title: Optional[str] = None
    studio_access_enabled: Optional[bool] = None


class Film(FilmBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Config:
        from_attributes = True
