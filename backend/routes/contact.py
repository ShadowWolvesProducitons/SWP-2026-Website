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
        resend.api_key = resend_api_key
        
        html_content = f"""
        <h2>New Contact Message</h2>
        <p><strong>Name:</strong> {message['name']}</p>
        <p><strong>Email:</strong> <a href="mailto:{message['email']}">{message['email']}</a></p>
        {f"<p><strong>Phone:</strong> {message['phone']}</p>" if message.get('phone') else ""}
        {f"<p><strong>Project Type:</strong> {message['service']}</p>" if message.get('service') else ""}
        <hr>
        <p><strong>Message:</strong></p>
        <p>{message['message']}</p>
        <hr>
        <p><em>Reply directly to this email or view in admin dashboard.</em></p>
        """
        
        admin_email = os.environ.get('ADMIN_EMAIL', 'admin@shadowwolvesproductions.com.au')
        from_email = os.environ.get('FROM_EMAIL', 'noreply@shadowwolvesproductions.com.au')
        
        resend.Emails.send({
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
