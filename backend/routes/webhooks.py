from fastapi import APIRouter, Request, HTTPException
from datetime import datetime, timezone
import uuid
import hashlib
import hmac
import os

router = APIRouter(prefix="/webhooks", tags=["webhooks"])

db = None

def set_db(database):
    global db
    db = database


@router.post("/resend")
async def resend_webhook(request: Request):
    """
    Handle Resend webhook events for email tracking.
    Events: email.sent, email.delivered, email.opened, email.clicked, email.bounced, email.complained
    """
    try:
        payload = await request.json()
    except:
        raise HTTPException(status_code=400, detail="Invalid JSON payload")
    
    # Extract event data
    event_type = payload.get('type')
    data = payload.get('data', {})
    
    if not event_type or not data:
        raise HTTPException(status_code=400, detail="Missing event type or data")
    
    # Extract relevant fields
    email_id = data.get('email_id', '')
    recipient = data.get('to', [''])[0] if isinstance(data.get('to'), list) else data.get('to', '')
    
    # For click events, get the clicked URL
    link_url = data.get('click', {}).get('link') if event_type == 'email.clicked' else None
    
    # Try to find the campaign this email belongs to
    # We'll match by looking at recent campaigns and the recipient
    campaign_id = None
    recent_campaigns = await db.newsletter_campaigns.find({}).sort("sent_at", -1).to_list(10)
    for campaign in recent_campaigns:
        # This is a simple match - in production you'd track email_id -> campaign_id mapping
        campaign_id = campaign.get('id') or str(campaign.get('_id', ''))
        break
    
    # Store the event
    event_doc = {
        'id': str(uuid.uuid4()),
        'email_id': email_id,
        'campaign_id': campaign_id,
        'recipient': recipient,
        'event_type': event_type,
        'link_url': link_url,
        'user_agent': data.get('user_agent'),
        'ip_address': data.get('ip'),
        'timestamp': datetime.now(timezone.utc).isoformat(),
        'raw_data': payload
    }
    
    await db.email_events.insert_one(event_doc)
    
    print(f"Recorded email event: {event_type} for {recipient}")
    
    return {"status": "ok", "event": event_type}


@router.get("/resend/test")
async def test_webhook():
    """Test endpoint to verify webhook is accessible"""
    return {"status": "ok", "message": "Resend webhook endpoint is active"}
