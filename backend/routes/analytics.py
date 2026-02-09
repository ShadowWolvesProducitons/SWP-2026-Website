from fastapi import APIRouter, HTTPException, Request
from typing import List, Optional
from datetime import datetime, timezone, timedelta
from pydantic import BaseModel
import os

router = APIRouter(prefix="/analytics", tags=["analytics"])

db = None

def set_db(database):
    global db
    db = database


class DashboardStats(BaseModel):
    total_films: int = 0
    total_blog_posts: int = 0
    total_subscribers: int = 0
    total_submissions: int = 0
    total_messages: int = 0
    total_investor_inquiries: int = 0
    new_subscribers_30d: int = 0
    new_submissions_30d: int = 0
    new_messages_30d: int = 0
    pending_submissions: int = 0
    pending_messages: int = 0


class CampaignAnalytics(BaseModel):
    id: str
    subject: str
    sent_at: str
    total_recipients: int
    sent: int
    failed: int
    delivered: int = 0
    opened: int = 0
    clicked: int = 0
    bounced: int = 0
    open_rate: float = 0.0
    click_rate: float = 0.0


class EmailEventData(BaseModel):
    email_id: str
    recipient: str
    event_type: str
    link_url: Optional[str] = None
    timestamp: str


@router.get("/dashboard", response_model=DashboardStats)
async def get_dashboard_stats():
    """Get overall dashboard statistics"""
    thirty_days_ago = (datetime.now(timezone.utc) - timedelta(days=30)).isoformat()
    
    # Get counts from all collections
    stats = DashboardStats()
    
    # Total counts
    stats.total_films = await db.films.count_documents({})
    stats.total_blog_posts = await db.blog_posts.count_documents({})
    stats.total_subscribers = await db.newsletter.count_documents({"is_active": True})
    stats.total_submissions = await db.submissions.count_documents({})
    stats.total_messages = await db.contacts.count_documents({})
    stats.total_investor_inquiries = await db.investor_inquiries.count_documents({})
    
    # New in last 30 days
    stats.new_subscribers_30d = await db.newsletter.count_documents({
        "subscribed_at": {"$gte": thirty_days_ago}
    })
    stats.new_submissions_30d = await db.submissions.count_documents({
        "submitted_at": {"$gte": thirty_days_ago}
    })
    stats.new_messages_30d = await db.contacts.count_documents({
        "created_at": {"$gte": thirty_days_ago}
    })
    
    # Pending items
    stats.pending_submissions = await db.submissions.count_documents({"status": "pending"})
    stats.pending_messages = await db.contacts.count_documents({"status": "new"})
    
    return stats


@router.get("/campaigns", response_model=List[CampaignAnalytics])
async def get_campaign_analytics():
    """Get analytics for all email campaigns"""
    campaigns = await db.newsletter_campaigns.find({}, {"_id": 0}).sort("sent_at", -1).to_list(50)
    
    result = []
    for campaign in campaigns:
        campaign_id = campaign.get('id') or str(campaign.get('_id', ''))
        
        # Get event counts for this campaign (optimized with projection)
        events = await db.email_events.find(
            {"campaign_id": campaign_id}, 
            {"_id": 0, "event_type": 1, "recipient": 1}
        ).to_list(5000)
        
        delivered = sum(1 for e in events if e.get('event_type') == 'email.delivered')
        opened = len(set(e.get('recipient') for e in events if e.get('event_type') == 'email.opened'))
        clicked = len(set(e.get('recipient') for e in events if e.get('event_type') == 'email.clicked'))
        bounced = sum(1 for e in events if e.get('event_type') == 'email.bounced')
        
        total_sent = campaign.get('sent', 0) or campaign.get('total_recipients', 0)
        
        analytics = CampaignAnalytics(
            id=campaign_id,
            subject=campaign.get('subject', 'Unknown'),
            sent_at=campaign.get('sent_at', ''),
            total_recipients=campaign.get('total_recipients', 0),
            sent=campaign.get('sent', 0),
            failed=campaign.get('failed', 0),
            delivered=delivered or total_sent,  # Assume delivered if no webhook yet
            opened=opened,
            clicked=clicked,
            bounced=bounced,
            open_rate=round((opened / total_sent * 100) if total_sent > 0 else 0, 1),
            click_rate=round((clicked / total_sent * 100) if total_sent > 0 else 0, 1)
        )
        result.append(analytics)
    
    return result


@router.get("/campaigns/{campaign_id}/events", response_model=List[EmailEventData])
async def get_campaign_events(campaign_id: str, event_type: Optional[str] = None):
    """Get detailed events for a specific campaign"""
    query = {"campaign_id": campaign_id}
    if event_type:
        query["event_type"] = event_type
    
    events = await db.email_events.find(query, {"_id": 0}).sort("timestamp", -1).to_list(1000)
    
    return [EmailEventData(
        email_id=e.get('email_id', ''),
        recipient=e.get('recipient', ''),
        event_type=e.get('event_type', ''),
        link_url=e.get('link_url'),
        timestamp=e.get('timestamp', '')
    ) for e in events]


@router.get("/subscriber-growth")
async def get_subscriber_growth():
    """Get subscriber growth over time (last 12 months)"""
    # Optimized: limit to last 12 months of data with projection
    twelve_months_ago = (datetime.now(timezone.utc) - timedelta(days=365)).isoformat()
    subscribers = await db.newsletter.find(
        {"subscribed_at": {"$gte": twelve_months_ago}}, 
        {"_id": 0, "subscribed_at": 1, "is_active": 1}
    ).to_list(5000)
    
    # Group by month
    monthly_data = {}
    for sub in subscribers:
        sub_date = sub.get('subscribed_at', '')
        if sub_date:
            if isinstance(sub_date, str):
                try:
                    dt = datetime.fromisoformat(sub_date.replace('Z', '+00:00'))
                except:
                    continue
            else:
                dt = sub_date
            
            month_key = dt.strftime('%Y-%m')
            if month_key not in monthly_data:
                monthly_data[month_key] = {'new': 0, 'total': 0}
            monthly_data[month_key]['new'] += 1
    
    # Calculate running total
    sorted_months = sorted(monthly_data.keys())
    running_total = 0
    result = []
    for month in sorted_months[-12:]:  # Last 12 months
        running_total += monthly_data[month]['new']
        result.append({
            'month': month,
            'new_subscribers': monthly_data[month]['new'],
            'total_subscribers': running_total
        })
    
    return result


@router.get("/recent-activity")
async def get_recent_activity(limit: int = 20):
    """Get recent activity across all areas"""
    activities = []
    
    # Recent subscribers
    subscribers = await db.newsletter.find({}, {"_id": 0}).sort("subscribed_at", -1).to_list(5)
    for sub in subscribers:
        activities.append({
            'type': 'subscriber',
            'description': f"New subscriber: {sub.get('email', 'Unknown')}",
            'timestamp': sub.get('subscribed_at', ''),
            'icon': 'users'
        })
    
    # Recent submissions
    submissions = await db.submissions.find({}, {"_id": 0}).sort("submitted_at", -1).to_list(5)
    for sub in submissions:
        activities.append({
            'type': 'submission',
            'description': f"New submission from {sub.get('name', 'Unknown')}",
            'timestamp': sub.get('submitted_at', ''),
            'icon': 'inbox'
        })
    
    # Recent messages
    messages = await db.contacts.find({}, {"_id": 0}).sort("created_at", -1).to_list(5)
    for msg in messages:
        activities.append({
            'type': 'message',
            'description': f"Message from {msg.get('name', 'Unknown')}",
            'timestamp': msg.get('created_at', ''),
            'icon': 'message-square'
        })
    
    # Recent investor inquiries
    inquiries = await db.investor_inquiries.find({}, {"_id": 0}).sort("created_at", -1).to_list(5)
    for inq in inquiries:
        activities.append({
            'type': 'investor',
            'description': f"Investor inquiry from {inq.get('name', 'Unknown')}",
            'timestamp': inq.get('created_at', ''),
            'icon': 'briefcase'
        })
    
    # Sort all activities by timestamp and return top N
    activities.sort(key=lambda x: x.get('timestamp', ''), reverse=True)
    return activities[:limit]
