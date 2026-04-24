from fastapi import APIRouter, Request, HTTPException
from datetime import datetime, timezone
import uuid

router = APIRouter(prefix="/webhooks", tags=["webhooks"])

db = None

def set_db(database):
    global db
    db = database


@router.post("/postmark")
async def postmark_webhook(request: Request):
    """
    Handle Postmark webhook events for email tracking.
    Events: Delivery, Bounce, SpamComplaint, Open, Click, SubscriptionChange
    """
    try:
        payload = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON payload")
    
    record_type = payload.get('RecordType', '')
    if not record_type:
        raise HTTPException(status_code=400, detail="Missing RecordType")
    
    # Map Postmark event types to our internal event names
    event_map = {
        'Delivery': 'email.delivered',
        'Bounce': 'email.bounced',
        'SpamComplaint': 'email.complained',
        'Open': 'email.opened',
        'Click': 'email.clicked',
    }
    
    event_type = event_map.get(record_type, f'email.{record_type.lower()}')
    
    recipient = payload.get('Recipient', '')
    message_id = payload.get('MessageID', '')
    link_url = payload.get('OriginalLink') if record_type == 'Click' else None
    
    # Try to find the campaign this email belongs to
    campaign_id = None
    recent_campaigns = await db.newsletter_campaigns.find({}).sort("sent_at", -1).to_list(10)
    for campaign in recent_campaigns:
        campaign_id = campaign.get('id') or str(campaign.get('_id', ''))
        break
    
    event_doc = {
        'id': str(uuid.uuid4()),
        'email_id': message_id,
        'campaign_id': campaign_id,
        'recipient': recipient,
        'event_type': event_type,
        'link_url': link_url,
        'user_agent': payload.get('UserAgent'),
        'ip_address': payload.get('Geo', {}).get('IP') if isinstance(payload.get('Geo'), dict) else None,
        'timestamp': datetime.now(timezone.utc).isoformat(),
        'raw_data': payload
    }
    
    await db.email_events.insert_one(event_doc)
    
    print(f"Recorded Postmark event: {event_type} for {recipient}")
    
    return {"status": "ok", "event": event_type}


@router.get("/postmark/test")
async def test_postmark_webhook():
    """Test endpoint to verify Postmark webhook is accessible"""
    return {"status": "ok", "message": "Postmark webhook endpoint is active"}
