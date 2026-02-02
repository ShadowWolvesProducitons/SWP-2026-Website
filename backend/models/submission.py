from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
from datetime import datetime, timezone
import uuid


class SubmissionBase(BaseModel):
    name: str
    email: EmailStr
    role: str
    submission_type: str
    genres: List[str] = []
    project_stage: str
    logline: str
    external_link: Optional[str] = None
    message: Optional[str] = None


class SubmissionCreate(SubmissionBase):
    pass


class SubmissionUpdate(BaseModel):
    status: Optional[str] = None  # New, Reviewed, Archived
    admin_notes: Optional[str] = None


class Submission(SubmissionBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    status: str = "New"  # New, Reviewed, Archived
    admin_notes: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Config:
        from_attributes = True
