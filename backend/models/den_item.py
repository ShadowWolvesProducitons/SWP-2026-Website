from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime, timezone
import uuid


class DenItemBase(BaseModel):
    title: str
    item_type: str  # Apps, Templates, Downloads, Courses, eBooks
    featured: bool = False
    short_description: str = ""
    long_description: Optional[str] = None
    thumbnail_url: Optional[str] = None
    primary_link_url: Optional[str] = None
    file_url: Optional[str] = None  # For downloadable files
    price: Optional[str] = None
    is_free: bool = True
    tags: List[str] = []
    sort_order: int = 0
    is_archived: bool = False


class DenItemCreate(DenItemBase):
    pass


class DenItemUpdate(BaseModel):
    title: Optional[str] = None
    item_type: Optional[str] = None
    featured: Optional[bool] = None
    short_description: Optional[str] = None
    long_description: Optional[str] = None
    thumbnail_url: Optional[str] = None
    primary_link_url: Optional[str] = None
    file_url: Optional[str] = None
    price: Optional[str] = None
    is_free: Optional[bool] = None
    tags: Optional[List[str]] = None
    sort_order: Optional[int] = None
    is_archived: Optional[bool] = None


class DenItem(DenItemBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Config:
        from_attributes = True
