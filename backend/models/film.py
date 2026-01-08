from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime, timezone
import uuid


class FilmBase(BaseModel):
    title: str
    film_type: str = "Feature"  # Short, Feature, Series, Documentary, Other
    status: str = "Development"  # Development, Packaging, Pre-Production, Filming, Post-Production, Marketing, Released
    featured: bool = False
    poster_url: Optional[str] = None
    logline: str = ""
    synopsis: str = ""
    genres: List[str] = []
    themes: List[str] = []
    imdb_url: Optional[str] = None
    watch_url: Optional[str] = None


class FilmCreate(FilmBase):
    pass


class FilmUpdate(BaseModel):
    title: Optional[str] = None
    film_type: Optional[str] = None
    status: Optional[str] = None
    featured: Optional[bool] = None
    poster_url: Optional[str] = None
    logline: Optional[str] = None
    synopsis: Optional[str] = None
    genres: Optional[List[str]] = None
    themes: Optional[List[str]] = None
    imdb_url: Optional[str] = None
    watch_url: Optional[str] = None


class Film(FilmBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Config:
        from_attributes = True
