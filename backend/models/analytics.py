from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, timezone
import uuid


class EmailEvent(BaseModel):
    """Track email events from Resend webhooks"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email_id: str  # Resend email ID
    campaign_id: Optional[str] = None  # Link to newsletter campaign
    recipient: str
    event_type: str  # sent, delivered, opened, clicked, bounced, etc.
    link_url: Optional[str] = None  # For click events
    user_agent: Optional[str] = None
    ip_address: Optional[str] = None
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class CampaignStats(BaseModel):
    """Aggregated stats for a campaign"""
    campaign_id: str
    subject: str
    sent_at: datetime
    total_sent: int = 0
    delivered: int = 0
    opened: int = 0
    clicked: int = 0
    bounced: int = 0
    open_rate: float = 0.0
    click_rate: float = 0.0
