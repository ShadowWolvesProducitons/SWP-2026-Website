from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime, timezone
import uuid


class FilmBase(BaseModel):
    title: str
    status: str = "In Development"  # In Development, In Production, Released
    featured: bool = False
    poster_url: Optional[str] = None
    logline: str = ""
    synopsis: str = ""
    themes: List[str] = []
    imdb_url: Optional[str] = None
    watch_url: Optional[str] = None
    poster_color: str = "#1a1a2e"  # Fallback color for poster


class FilmCreate(FilmBase):
    pass


class FilmUpdate(BaseModel):
    title: Optional[str] = None
    status: Optional[str] = None
    featured: Optional[bool] = None
    poster_url: Optional[str] = None
    logline: Optional[str] = None
    synopsis: Optional[str] = None
    themes: Optional[List[str]] = None
    imdb_url: Optional[str] = None
    watch_url: Optional[str] = None
    poster_color: Optional[str] = None


class Film(FilmBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Config:
        from_attributes = True
