from fastapi import APIRouter, HTTPException, BackgroundTasks
from typing import List, Optional
from models.submission import Submission, SubmissionCreate, SubmissionUpdate
from datetime import datetime, timezone
import os

router = APIRouter(prefix="/submissions", tags=["submissions"])

db = None

def set_db(database):
    global db
    db = database


async def send_notification_email(submission: dict):
    """Send email notification for new submission"""
    try:
        # Check if Resend API key is available
        resend_api_key = os.environ.get('RESEND_API_KEY')
        if not resend_api_key:
            print("RESEND_API_KEY not set, skipping email notification")
            return
        
        import resend
        resend.api_key = resend_api_key
        
        # Format the email content
        html_content = f"""
        <h2>New Submission Received</h2>
        <p><strong>Name:</strong> {submission['name']}</p>
        <p><strong>Email:</strong> {submission['email']}</p>
        <p><strong>Role:</strong> {submission['role']}</p>
        <p><strong>Type:</strong> {submission['submission_type']}</p>
        <p><strong>Genres:</strong> {', '.join(submission['genres'])}</p>
        <p><strong>Stage:</strong> {submission['project_stage']}</p>
        <p><strong>Logline:</strong> {submission['logline']}</p>
        {f"<p><strong>Link:</strong> <a href='{submission['external_link']}'>{submission['external_link']}</a></p>" if submission.get('external_link') else ""}
        {f"<p><strong>Message:</strong> {submission['message']}</p>" if submission.get('message') else ""}
        <hr>
        <p><em>View all submissions in the admin dashboard.</em></p>
        """
        
        # Get admin email from env or use default
        admin_email = os.environ.get('ADMIN_EMAIL', 'admin@shadowwolvesproductions.com.au')
        from_email = os.environ.get('FROM_EMAIL', 'noreply@shadowwolvesproductions.com.au')
        
        resend.Emails.send({
            "from": from_email,
            "to": admin_email,
            "subject": f"New Submission: {submission['submission_type']} from {submission['name']}",
            "html": html_content
        })
        
        print(f"Email notification sent for submission from {submission['name']}")
        
    except Exception as e:
        print(f"Failed to send email notification: {e}")


@router.post("", response_model=Submission)
async def create_submission(submission_data: SubmissionCreate, background_tasks: BackgroundTasks):
    """Create a new submission"""
    # Validate logline length
    if len(submission_data.logline) > 300:
        raise HTTPException(status_code=400, detail="Logline must be under 300 characters")
    
    # Validate message length
    if submission_data.message and len(submission_data.message) > 500:
        raise HTTPException(status_code=400, detail="Message must be under 500 characters")
    
    submission_dict = submission_data.model_dump()
    submission = Submission(**submission_dict)
    
    doc = submission.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['updated_at'] = doc['updated_at'].isoformat()
    
    await db.submissions.insert_one(doc)
    
    # Send email notification in background
    background_tasks.add_task(send_notification_email, doc)
    
    return submission


@router.get("", response_model=List[Submission])
async def get_submissions(status: Optional[str] = None, include_archived: bool = False):
    """Get all submissions (admin only)"""
    query = {}
    if status:
        query["status"] = status
    if not include_archived:
        query["status"] = {"$ne": "Archived"}
    
    submissions = await db.submissions.find(query, {"_id": 0}).to_list(1000)
    
    for sub in submissions:
        if isinstance(sub.get('created_at'), str):
            sub['created_at'] = datetime.fromisoformat(sub['created_at'])
        if isinstance(sub.get('updated_at'), str):
            sub['updated_at'] = datetime.fromisoformat(sub['updated_at'])
    
    # Sort by created_at descending (newest first)
    submissions.sort(key=lambda x: x.get('created_at', datetime.min), reverse=True)
    
    return submissions


@router.get("/{submission_id}", response_model=Submission)
async def get_submission(submission_id: str):
    """Get a specific submission by ID"""
    submission = await db.submissions.find_one({"id": submission_id}, {"_id": 0})
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")
    
    if isinstance(submission.get('created_at'), str):
        submission['created_at'] = datetime.fromisoformat(submission['created_at'])
    if isinstance(submission.get('updated_at'), str):
        submission['updated_at'] = datetime.fromisoformat(submission['updated_at'])
    
    return submission


@router.put("/{submission_id}", response_model=Submission)
async def update_submission(submission_id: str, update_data: SubmissionUpdate):
    """Update submission status/notes (admin only)"""
    existing = await db.submissions.find_one({"id": submission_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Submission not found")
    
    update_dict = update_data.model_dump(exclude_unset=True)
    update_dict['updated_at'] = datetime.now(timezone.utc).isoformat()
    
    await db.submissions.update_one(
        {"id": submission_id},
        {"$set": update_dict}
    )
    
    updated = await db.submissions.find_one({"id": submission_id}, {"_id": 0})
    if isinstance(updated.get('created_at'), str):
        updated['created_at'] = datetime.fromisoformat(updated['created_at'])
    if isinstance(updated.get('updated_at'), str):
        updated['updated_at'] = datetime.fromisoformat(updated['updated_at'])
    
    return updated


@router.delete("/{submission_id}")
async def delete_submission(submission_id: str, permanent: bool = False):
    """Archive or permanently delete a submission"""
    existing = await db.submissions.find_one({"id": submission_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Submission not found")
    
    if permanent:
        await db.submissions.delete_one({"id": submission_id})
        return {"message": "Submission permanently deleted"}
    else:
        await db.submissions.update_one(
            {"id": submission_id},
            {"$set": {"status": "Archived", "updated_at": datetime.now(timezone.utc).isoformat()}}
        )
        return {"message": "Submission archived"}
