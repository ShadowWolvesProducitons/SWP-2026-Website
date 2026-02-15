from fastapi import APIRouter, HTTPException, BackgroundTasks
from typing import List, Optional
from models.newsletter import NewsletterSubscriber, NewsletterSubscriberCreate
from pydantic import BaseModel
from datetime import datetime, timezone
import os
import asyncio

router = APIRouter(prefix="/newsletter", tags=["newsletter"])

db = None

def set_db(database):
    global db
    db = database


class BulkEmailRequest(BaseModel):
    subject: str
    html_content: str
    test_mode: bool = False  # If true, only send to first subscriber as test


class BulkEmailResponse(BaseModel):
    total: int
    sent: int
    failed: int
    errors: List[str] = []


async def send_welcome_email(email: str, lead_magnet: str = None):
    """Send welcome email to new subscriber, optionally with lead magnet"""
    try:
        resend_api_key = os.environ.get('RESEND_API_KEY')
        if not resend_api_key:
            print("RESEND_API_KEY not set, skipping welcome email")
            return
        
        import resend
        resend.api_key = resend_api_key
        
        # Different content based on lead magnet
        logo_url = os.environ.get('SITE_URL', 'https://shadowwolvesproductions.com.au')
        header_img = f"{logo_url}/api/upload/images/header-banner.png"
        unsub_url = f"{logo_url}/api/newsletter/{email}"
        email_header = f'<div style="text-align: center; padding: 24px 40px 16px; border-bottom: 1px solid #1a1a1a;"><img src="{header_img}" alt="Shadow Wolves Productions" style="max-width: 280px; height: auto;" /></div>'
        email_footer = f'<div style="padding: 20px 40px; border-top: 1px solid #1a1a1a;"><p style="color: #555; font-size: 11px; text-align: center;"><a href="{unsub_url}" style="color: #233dff;">Unsubscribe</a></p></div>'

        if lead_magnet == 'producers_playbook':
            # Fetch PDF URL from assets library
            pdf_url = None
            if db is not None:
                asset = await db.assets.find_one({"asset_type": "pdf", "original_name": {"$regex": "playbook", "$options": "i"}}, {"_id": 0, "file_url": 1})
                if asset:
                    pdf_url = f"{logo_url}{asset['file_url']}"
            if not pdf_url:
                pdf_url = f"{logo_url}/api/upload/files/c8f36645-6f39-4307-88b6-9b9681a2925c.pdf"
            
            mockup_url = f"{logo_url}/api/upload/images/23806c86-8d26-4a08-9fff-138ab19a86bd.png"
            html_content = f"""
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #ffffff; padding: 0;">
                {email_header}
                <div style="padding: 32px 40px;">
                <h1 style="color: #ffffff; font-size: 28px; margin-bottom: 8px;">Welcome to the Pack</h1>
                <p style="color: #233dff; font-size: 14px; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 30px;">Your Producer's Playbook is ready</p>
                
                <p style="color: #9ca3af; line-height: 1.6; margin-bottom: 20px;">
                    Thanks for joining the Shadow Wolves mailing list. As promised, here's your free copy of the Producer's Playbook.
                </p>
                
                <div style="background: #111; border: 1px solid #333; border-radius: 12px; padding: 24px; margin: 24px 0; text-align: center;">
                    <img src="https://customer-assets.emergentagent.com/job_04afc1ac-41b6-4e3d-938f-409263bdaadd/artifacts/i8yb09b1_The%20Producer-s%20Playbook%20Mockup.png" alt="Producer's Playbook" style="width: 120px; height: auto; margin-bottom: 16px;" />
                    <p style="color: #ffffff; font-size: 18px; margin-bottom: 16px;">📄 Producer's Playbook</p>
                    <a href="{pdf_url}" style="display: inline-block; background: #233dff; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 50px; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Download PDF</a>
                </div>
                
                <p style="color: #666; font-size: 12px; margin-top: 30px;">
                    This link is for your use only. If you have trouble downloading, reply to this email.
                </p>
                
                <hr style="border: none; border-top: 1px solid #333; margin: 30px 0;" />
                
                <p style="color: #9ca3af; line-height: 1.6;">
                    You're now part of the pack. You'll receive updates on new projects, releases, and industry insights. We don't spam — only signal.
                </p>
                
                <p style="color: #233dff; margin-top: 30px;">— Shadow Wolves Productions</p>
                </div>
                {email_footer}
            </div>
            """
            subject = "Your Producer's Playbook is ready"
        else:
            html_content = f"""
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #ffffff; padding: 0;">
                {email_header}
                <div style="padding: 32px 40px;">
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
                {email_footer}
            </div>
            """
            subject = "Welcome to Shadow Wolves Productions"
        
        from_email = os.environ.get('FROM_EMAIL', 'onboarding@resend.dev')
        
        await asyncio.to_thread(resend.Emails.send, {
            "from": from_email,
            "to": email,
            "subject": subject,
            "html": html_content
        })
        
        print(f"Welcome email sent to {email} (lead_magnet: {lead_magnet})")
        
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
            # Send welcome email with lead magnet if provided
            background_tasks.add_task(send_welcome_email, subscriber_data.email, subscriber_data.lead_magnet)
            return updated
    
    subscriber_dict = subscriber_data.model_dump()
    subscriber = NewsletterSubscriber(**subscriber_dict)
    
    doc = subscriber.model_dump()
    doc['subscribed_at'] = doc['subscribed_at'].isoformat()
    
    await db.newsletter.insert_one(doc)
    
    # Send welcome email in background (with lead magnet if provided)
    background_tasks.add_task(send_welcome_email, subscriber.email, subscriber_data.lead_magnet)
    
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
    """Get all newsletter subscribers (admin) - with pagination limit"""
    query = {"is_active": True} if active_only else {}
    
    # Optimized: limit to 2000 subscribers for performance
    subscribers = await db.newsletter.find(query, {"_id": 0}).to_list(2000)
    
    for sub in subscribers:
        if isinstance(sub.get('subscribed_at'), str):
            sub['subscribed_at'] = datetime.fromisoformat(sub['subscribed_at'])
        if isinstance(sub.get('unsubscribed_at'), str):
            sub['unsubscribed_at'] = datetime.fromisoformat(sub['unsubscribed_at'])
    
    return subscribers


@router.post("/send-bulk", response_model=BulkEmailResponse)
async def send_bulk_email(request: BulkEmailRequest):
    """Send bulk email to all active subscribers"""
    resend_api_key = os.environ.get('RESEND_API_KEY')
    if not resend_api_key:
        raise HTTPException(status_code=500, detail="RESEND_API_KEY not configured")
    
    import resend
    resend.api_key = resend_api_key
    from_email = os.environ.get('FROM_EMAIL', 'onboarding@resend.dev')
    
    # Get active subscribers
    subscribers = await db.newsletter.find({"is_active": True}, {"_id": 0}).to_list(1000)
    
    if not subscribers:
        raise HTTPException(status_code=400, detail="No active subscribers found")
    
    # In test mode, only send to first subscriber
    if request.test_mode:
        subscribers = subscribers[:1]
    
    # Wrap content in styled template with header + unsubscribe
    logo_url = os.environ.get('SITE_URL', 'https://shadowwolvesproductions.com.au')
    header_img = f"{logo_url}/api/upload/images/header-banner.png"
    styled_html = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #ffffff; padding: 0;">
        <div style="text-align: center; padding: 24px 40px 16px; border-bottom: 1px solid #1a1a1a;">
            <img src="{header_img}" alt="Shadow Wolves Productions" style="max-width: 280px; height: auto;" />
        </div>
        <div style="padding: 32px 40px;">
            {request.html_content}
        </div>
        <div style="padding: 24px 40px; border-top: 1px solid #1a1a1a;">
            <p style="color: #666; font-size: 11px; text-align: center; margin: 0 0 8px;">
                Shadow Wolves Productions &bull; Film. Create. Dominate.
            </p>
            <p style="color: #555; font-size: 11px; text-align: center; margin: 0;">
                <a href="{{{{unsubscribe_url}}}}" style="color: #233dff; text-decoration: underline;">Unsubscribe</a>
            </p>
        </div>
    </div>
    """

    # Replace unsubscribe placeholder per subscriber
    def make_html_for(subscriber_email):
        unsub = f"{logo_url}/api/newsletter/{subscriber_email}"
        return styled_html.replace("{{unsubscribe_url}}", unsub)
    
    # Generate campaign ID for tracking
    import uuid
    campaign_id = str(uuid.uuid4())
    
    sent = 0
    failed = 0
    errors = []
    email_ids = []
    
    for subscriber in subscribers:
        try:
            per_sub_html = make_html_for(subscriber['email'])
            result = await asyncio.to_thread(resend.Emails.send, {
                "from": from_email,
                "to": subscriber['email'],
                "subject": request.subject,
                "html": per_sub_html
            })
            sent += 1
            # Track email ID for analytics
            if result and hasattr(result, 'id'):
                email_ids.append({'email_id': result.id, 'recipient': subscriber['email']})
            # Small delay to avoid rate limiting
            await asyncio.sleep(0.1)
        except Exception as e:
            failed += 1
            error_msg = f"{subscriber['email']}: {str(e)}"
            errors.append(error_msg)
            print(f"Failed to send to {subscriber['email']}: {e}")
    
    # Log the campaign with ID for tracking
    campaign_log = {
        "id": campaign_id,
        "subject": request.subject,
        "sent_at": datetime.now(timezone.utc).isoformat(),
        "total_recipients": len(subscribers),
        "sent": sent,
        "failed": failed,
        "test_mode": request.test_mode,
        "email_ids": email_ids
    }
    await db.newsletter_campaigns.insert_one(campaign_log)
    
    return BulkEmailResponse(
        total=len(subscribers),
        sent=sent,
        failed=failed,
        errors=errors[:10]  # Limit errors returned
    )
