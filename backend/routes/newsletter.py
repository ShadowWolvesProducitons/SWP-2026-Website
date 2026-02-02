from fastapi import APIRouter, HTTPException, BackgroundTasks
from typing import List
from models.newsletter import NewsletterSubscriber, NewsletterSubscriberCreate
from datetime import datetime, timezone
import os
import asyncio

router = APIRouter(prefix="/newsletter", tags=["newsletter"])

db = None

def set_db(database):
    global db
    db = database


async def send_welcome_email(email: str):
    """Send welcome email to new subscriber"""
    try:
        resend_api_key = os.environ.get('RESEND_API_KEY')
        if not resend_api_key:
            print("RESEND_API_KEY not set, skipping welcome email")
            return
        
        import resend
        resend.api_key = resend_api_key
        
        html_content = """
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #ffffff; padding: 40px;">
            <h1 style="color: #ffffff; font-size: 24px; margin-bottom: 20px;">Welcome to the Pack</h1>
            <p style="color: #9ca3af; line-height: 1.6;">
                You've joined the Shadow Wolves mailing list. You'll be the first to hear about new projects, 
                releases, and behind-the-scenes updates.
            </p>
            <p style="color: #9ca3af; line-height: 1.6; margin-top: 20px;">
                We don't spam. We only reach out when we have something worth saying.
            </p>
            <p style="color: #233dff; margin-top: 30px;">— Shadow Wolves Productions</p>
        </div>
        """
        
        from_email = os.environ.get('FROM_EMAIL', 'onboarding@resend.dev')
        
        await asyncio.to_thread(resend.Emails.send, {
            "from": from_email,
            "to": email,
            "subject": "Welcome to Shadow Wolves Productions",
            "html": html_content
        })
        
        print(f"Welcome email sent to {email}")
        
    except Exception as e:
        print(f"Failed to send welcome email: {e}")


@router.post("", response_model=NewsletterSubscriber)
async def subscribe(subscriber_data: NewsletterSubscriberCreate, background_tasks: BackgroundTasks):
    """Subscribe to newsletter"""
    # Check if already subscribed
    existing = await db.newsletter.find_one({"email": subscriber_data.email}, {"_id": 0})
    
    if existing:
        if existing.get('is_active'):
            raise HTTPException(status_code=400, detail="Email already subscribed")
        else:
            # Reactivate subscription
            await db.newsletter.update_one(
                {"email": subscriber_data.email},
                {"$set": {"is_active": True, "unsubscribed_at": None}}
            )
            updated = await db.newsletter.find_one({"email": subscriber_data.email}, {"_id": 0})
            return updated
    
    subscriber_dict = subscriber_data.model_dump()
    subscriber = NewsletterSubscriber(**subscriber_dict)
    
    doc = subscriber.model_dump()
    doc['subscribed_at'] = doc['subscribed_at'].isoformat()
    
    await db.newsletter.insert_one(doc)
    
    # Send welcome email in background
    background_tasks.add_task(send_welcome_email, subscriber.email)
    
    return subscriber


@router.delete("/{email}")
async def unsubscribe(email: str):
    """Unsubscribe from newsletter"""
    existing = await db.newsletter.find_one({"email": email}, {"_id": 0})
    
    if not existing:
        raise HTTPException(status_code=404, detail="Email not found")
    
    await db.newsletter.update_one(
        {"email": email},
        {"$set": {
            "is_active": False,
            "unsubscribed_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    return {"message": "Successfully unsubscribed"}


@router.get("", response_model=List[NewsletterSubscriber])
async def get_subscribers(active_only: bool = True):
    """Get all newsletter subscribers (admin)"""
    query = {"is_active": True} if active_only else {}
    
    subscribers = await db.newsletter.find(query, {"_id": 0}).to_list(1000)
    
    for sub in subscribers:
        if isinstance(sub.get('subscribed_at'), str):
            sub['subscribed_at'] = datetime.fromisoformat(sub['subscribed_at'])
        if isinstance(sub.get('unsubscribed_at'), str):
            sub['unsubscribed_at'] = datetime.fromisoformat(sub['unsubscribed_at'])
    
    return subscribers
