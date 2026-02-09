from fastapi import APIRouter, HTTPException, BackgroundTasks
from typing import List, Optional
from models.contact import ContactMessage, ContactMessageCreate, ContactMessageUpdate
from datetime import datetime, timezone
import os

router = APIRouter(prefix="/contact", tags=["contact"])

db = None

def set_db(database):
    global db
    db = database


async def send_contact_notification(message: dict):
    """Send email notification for new contact message"""
    try:
        resend_api_key = os.environ.get('RESEND_API_KEY')
        if not resend_api_key:
            print("RESEND_API_KEY not set, skipping email notification")
            return
        
        import resend
        import asyncio
        resend.api_key = resend_api_key
        
        html_content = f"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #ffffff; padding: 40px;">
            <h1 style="color: #ffffff; font-size: 24px; margin-bottom: 20px;">New Contact Message</h1>
            <p style="color: #9ca3af; line-height: 1.6;">
                A new message has been received through the website contact form.
            </p>
            
            <div style="background: #1a1a1a; border: 1px solid #333; border-radius: 8px; padding: 20px; margin: 20px 0;">
                <p style="color: #ffffff; margin: 8px 0;"><strong>Name:</strong> {message['name']}</p>
                <p style="color: #ffffff; margin: 8px 0;"><strong>Email:</strong> <a href="mailto:{message['email']}" style="color: #233dff;">{message['email']}</a></p>
                {f"<p style='color: #ffffff; margin: 8px 0;'><strong>Phone:</strong> {message['phone']}</p>" if message.get('phone') else ""}
                {f"<p style='color: #ffffff; margin: 8px 0;'><strong>Project Type:</strong> {message['service']}</p>" if message.get('service') else ""}
            </div>
            
            <div style="background: #1a1a1a; border: 1px solid #333; border-radius: 8px; padding: 20px; margin: 20px 0;">
                <p style="color: #9ca3af; margin-bottom: 8px;"><strong>Message:</strong></p>
                <p style="color: #ffffff; white-space: pre-wrap;">{message['message']}</p>
            </div>
            
            <p style="color: #233dff; margin-top: 30px;">— Shadow Wolves Productions</p>
        </div>
        """
        
        admin_email = os.environ.get('ADMIN_EMAIL', 'Brendan@shadowwolvesproductions.com.au')
        from_email = os.environ.get('FROM_EMAIL', 'onboarding@resend.dev')
        
        await asyncio.to_thread(resend.Emails.send, {
            "from": from_email,
            "to": admin_email,
            "reply_to": message['email'],
            "subject": f"Contact: {message['name']} - {message.get('service', 'General Inquiry')}",
            "html": html_content
        })
        
        print(f"Contact notification sent for message from {message['name']}")
        
    except Exception as e:
        print(f"Failed to send contact notification: {e}")


@router.post("", response_model=ContactMessage)
async def create_contact_message(message_data: ContactMessageCreate, background_tasks: BackgroundTasks):
    """Submit a contact message"""
    message_dict = message_data.model_dump()
    message = ContactMessage(**message_dict)
    
    doc = message.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.contact_messages.insert_one(doc)
    
    # Send email notification in background
    background_tasks.add_task(send_contact_notification, doc)
    
    return message


@router.get("", response_model=List[ContactMessage])
async def get_contact_messages(status: Optional[str] = None, include_archived: bool = False):
    """Get all contact messages (admin only)"""
    query = {}
    
    # Build query based on filters
    if status and not include_archived:
        # Both status filter and exclude archived
        query["$and"] = [{"status": status}, {"status": {"$ne": "Archived"}}]
    elif status:
        # Just status filter
        query["status"] = status
    elif not include_archived:
        # Just exclude archived
        query["status"] = {"$ne": "Archived"}
    
    messages = await db.contact_messages.find(query, {"_id": 0}).to_list(500)
    
    for msg in messages:
        if isinstance(msg.get('created_at'), str):
            msg['created_at'] = datetime.fromisoformat(msg['created_at'])
    
    # Sort by created_at descending (newest first)
    messages.sort(key=lambda x: x.get('created_at', datetime.min), reverse=True)
    
    return messages


@router.get("/{message_id}", response_model=ContactMessage)
async def get_contact_message(message_id: str):
    """Get a specific contact message by ID"""
    message = await db.contact_messages.find_one({"id": message_id}, {"_id": 0})
    if not message:
        raise HTTPException(status_code=404, detail="Message not found")
    
    if isinstance(message.get('created_at'), str):
        message['created_at'] = datetime.fromisoformat(message['created_at'])
    
    return message


@router.put("/{message_id}", response_model=ContactMessage)
async def update_contact_message(message_id: str, update_data: ContactMessageUpdate):
    """Update contact message status/notes (admin only)"""
    existing = await db.contact_messages.find_one({"id": message_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Message not found")
    
    update_dict = update_data.model_dump(exclude_unset=True)
    
    await db.contact_messages.update_one(
        {"id": message_id},
        {"$set": update_dict}
    )
    
    updated = await db.contact_messages.find_one({"id": message_id}, {"_id": 0})
    if isinstance(updated.get('created_at'), str):
        updated['created_at'] = datetime.fromisoformat(updated['created_at'])
    
    return updated


@router.post("/cineconnect-interest")
async def register_cineconnect_interest(data: dict, background_tasks: BackgroundTasks):
    """Register interest in CineConnect"""
    from uuid import uuid4
    interest = {
        "id": str(uuid4()),
        "name": data.get("name", ""),
        "email": data.get("email", ""),
        "type": "cineconnect_interest",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.cineconnect_interests.insert_one(interest)
    del interest["_id"]

    # Notify admin in background
    async def notify_admin():
        try:
            resend_api_key = os.environ.get('RESEND_API_KEY')
            if not resend_api_key:
                return
            import resend
            import asyncio
            resend.api_key = resend_api_key
            admin_email = os.environ.get('ADMIN_EMAIL', 'Brendan@shadowwolvesproductions.com.au')
            from_email = os.environ.get('FROM_EMAIL', 'onboarding@resend.dev')
            await asyncio.to_thread(resend.Emails.send, {
                "from": from_email,
                "to": admin_email,
                "subject": f"CineConnect Interest: {interest['name']}",
                "html": f"""<div style="font-family:Arial;max-width:600px;margin:0 auto;background:#0a0a0a;color:#fff;padding:40px;">
                    <h1 style="color:#fff;">New CineConnect Interest</h1>
                    <p style="color:#9ca3af;">{interest['name']} ({interest['email']}) has registered interest in CineConnect.</p>
                    <p style="color:#233dff;margin-top:30px;">— Shadow Wolves Productions</p>
                </div>"""
            })
        except Exception as e:
            print(f"Failed to send CineConnect notification: {e}")

    background_tasks.add_task(notify_admin)
    return {"message": "Interest registered successfully"}


@router.get("/cineconnect-interest")
async def get_cineconnect_interests():
    """Get all CineConnect interests (admin)"""
    interests = await db.cineconnect_interests.find({}, {"_id": 0}).to_list(500)
    return interests


@router.delete("/{message_id}")
async def delete_contact_message(message_id: str, permanent: bool = False):
    """Archive or permanently delete a contact message"""
    existing = await db.contact_messages.find_one({"id": message_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Message not found")
    
    if permanent:
        await db.contact_messages.delete_one({"id": message_id})
        return {"message": "Message permanently deleted"}
    else:
        await db.contact_messages.update_one(
            {"id": message_id},
            {"$set": {"status": "Archived"}}
        )
        return {"message": "Message archived"}
