from fastapi import APIRouter, HTTPException, Request, BackgroundTasks
from typing import List, Optional
from models.investor import (
    InvestorCredential, InvestorCredentialCreate, InvestorCredentialUpdate,
    InvestorProject, InvestorProjectCreate, InvestorProjectUpdate,
    InvestorDocument, InvestorDocumentCreate, InvestorDocumentUpdate,
    InvestorInquiry, InvestorInquiryCreate, InvestorInquiryUpdate,
    InvestorPortalSettings, DocumentDownloadLog,
    DocumentRequest, DocumentRequestCreate
)
from datetime import datetime, timezone
from pydantic import BaseModel
import os
import asyncio

router = APIRouter(prefix="/investors", tags=["investors"])

db = None

def set_db(database):
    global db
    db = database


async def send_inquiry_notification(inquiry: dict):
    """Send email notification for new investor inquiry"""
    try:
        resend_api_key = os.environ.get('RESEND_API_KEY')
        if not resend_api_key:
            print("RESEND_API_KEY not set, skipping inquiry notification")
            return
        
        import resend
        resend.api_key = resend_api_key
        
        html_content = f"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #ffffff; padding: 40px;">
            <h1 style="color: #ffffff; font-size: 24px; margin-bottom: 20px;">New Investor Inquiry</h1>
            <p style="color: #9ca3af; line-height: 1.6;">
                A new expression of interest has been submitted through the Investor Portal.
            </p>
            
            <div style="background: #1a1a1a; border: 1px solid #333; border-radius: 8px; padding: 20px; margin: 20px 0;">
                <p style="color: #ffffff; margin: 8px 0;"><strong>Name:</strong> {inquiry.get('name', 'N/A')}</p>
                <p style="color: #ffffff; margin: 8px 0;"><strong>Email:</strong> {inquiry.get('email', 'N/A')}</p>
                <p style="color: #ffffff; margin: 8px 0;"><strong>Investor Type:</strong> {inquiry.get('investor_type', 'N/A')}</p>
                <p style="color: #ffffff; margin: 8px 0;"><strong>Area of Interest:</strong> {inquiry.get('area_of_interest', 'N/A')}</p>
                {f'<p style="color: #9ca3af; margin: 16px 0 8px 0;"><strong>Message:</strong></p><p style="color: #ffffff; white-space: pre-wrap;">{inquiry.get("message")}</p>' if inquiry.get('message') else ''}
            </div>
            
            <p style="color: #233dff; margin-top: 30px;">— Shadow Wolves Productions</p>
        </div>
        """
        
        from_email = os.environ.get('FROM_EMAIL', 'onboarding@resend.dev')
        admin_email = os.environ.get('ADMIN_EMAIL', 'Brendan@shadowwolvesproductions.com.au')
        
        await asyncio.to_thread(resend.Emails.send, {
            "from": from_email,
            "to": admin_email,
            "subject": f"New Investor Inquiry: {inquiry.get('name', 'Unknown')}",
            "html": html_content
        })
        
        print(f"Inquiry notification sent for {inquiry.get('name')}")
        
    except Exception as e:
        print(f"Failed to send inquiry notification: {e}")


# ========== PORTAL AUTH ==========

class InvestorLoginRequest(BaseModel):
    password: Optional[str] = None
    access_code: Optional[str] = None


class InvestorLoginResponse(BaseModel):
    success: bool
    investor_name: Optional[str] = None
    investor_id: Optional[str] = None
    message: str


@router.post("/auth", response_model=InvestorLoginResponse)
async def investor_login(request: InvestorLoginRequest):
    """Authenticate investor with password or access code"""
    # Get portal settings
    settings = await db.investor_settings.find_one({}, {"_id": 0})
    
    if not settings or not settings.get('portal_enabled', True):
        raise HTTPException(status_code=403, detail="Investor portal is currently unavailable")
    
    # Try access code first
    if request.access_code:
        credential = await db.investor_credentials.find_one({
            "access_code": request.access_code,
            "is_active": True
        }, {"_id": 0})
        
        if credential:
            # Update access stats
            await db.investor_credentials.update_one(
                {"id": credential['id']},
                {
                    "$set": {"last_accessed": datetime.now(timezone.utc).isoformat()},
                    "$inc": {"access_count": 1}
                }
            )
            return InvestorLoginResponse(
                success=True,
                investor_name=credential.get('name'),
                investor_id=credential.get('id'),
                message="Access granted"
            )
    
    # Try global password
    if request.password:
        global_password = settings.get('global_password')
        if global_password and request.password == global_password:
            return InvestorLoginResponse(
                success=True,
                investor_name="Investor",
                investor_id=None,
                message="Access granted"
            )
    
    return InvestorLoginResponse(
        success=False,
        message="Invalid credentials"
    )


@router.get("/portal-status")
async def get_portal_status():
    """Check if investor portal is enabled"""
    settings = await db.investor_settings.find_one({}, {"_id": 0})
    return {
        "enabled": settings.get('portal_enabled', True) if settings else True,
        "require_code": settings.get('require_code', False) if settings else False
    }


# ========== PUBLIC INVESTOR DATA ==========

@router.get("/projects", response_model=List[InvestorProject])
async def get_investor_projects():
    """Get visible investor projects (development slate)"""
    projects = await db.investor_projects.find(
        {"is_visible": True}, 
        {"_id": 0}
    ).to_list(100)
    
    for p in projects:
        if isinstance(p.get('created_at'), str):
            p['created_at'] = datetime.fromisoformat(p['created_at'])
        if isinstance(p.get('updated_at'), str):
            p['updated_at'] = datetime.fromisoformat(p['updated_at'])
    
    projects.sort(key=lambda x: x.get('sort_order', 999))
    return projects


@router.get("/documents", response_model=List[InvestorDocument])
async def get_investor_documents():
    """Get visible investor documents (general docs only, not project-linked)"""
    docs = await db.investor_documents.find(
        {"is_visible": True, "$or": [{"project_id": None}, {"project_id": {"$exists": False}}]},
        {"_id": 0}
    ).to_list(100)
    
    for d in docs:
        if isinstance(d.get('created_at'), str):
            d['created_at'] = datetime.fromisoformat(d['created_at'])
    
    docs.sort(key=lambda x: x.get('sort_order', 999))
    return docs


@router.get("/projects/{project_id}/documents")
async def get_project_documents(project_id: str):
    """Get available document types for a specific project"""
    docs = await db.investor_documents.find(
        {"project_id": project_id, "is_visible": True},
        {"_id": 0}
    ).to_list(100)
    
    # Return available doc types for this project
    doc_types = list(set([d['doc_type'] for d in docs]))
    return {"project_id": project_id, "available_doc_types": doc_types, "documents": docs}


@router.post("/documents/{doc_id}/download")
async def log_document_download(doc_id: str, request: Request, investor_id: Optional[str] = None):
    """Log a document download"""
    doc = await db.investor_documents.find_one({"id": doc_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    
    # Get investor name if ID provided
    investor_name = None
    if investor_id:
        credential = await db.investor_credentials.find_one({"id": investor_id}, {"_id": 0})
        if credential:
            investor_name = credential.get('name')
    
    # Log the download
    log_entry = DocumentDownloadLog(
        document_id=doc_id,
        document_title=doc['title'],
        investor_id=investor_id,
        investor_name=investor_name,
        ip_address=request.client.host if request.client else None
    )
    
    log_dict = log_entry.model_dump()
    log_dict['downloaded_at'] = log_dict['downloaded_at'].isoformat()
    await db.document_downloads.insert_one(log_dict)
    
    # Increment download count
    await db.investor_documents.update_one(
        {"id": doc_id},
        {"$inc": {"download_count": 1}}
    )
    
    return {"message": "Download logged", "file_url": doc['file_url']}


@router.post("/inquiries", response_model=InvestorInquiry)
async def create_investor_inquiry(inquiry_data: InvestorInquiryCreate, background_tasks: BackgroundTasks):
    """Submit an investor expression of interest"""
    inquiry_dict = inquiry_data.model_dump()
    inquiry = InvestorInquiry(**inquiry_dict)
    
    doc = inquiry.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.investor_inquiries.insert_one(doc)
    
    # Send notification email in background
    background_tasks.add_task(send_inquiry_notification, inquiry_dict)
    
    return inquiry


# ========== ADMIN ENDPOINTS ==========

# Portal Settings
@router.get("/admin/settings", response_model=InvestorPortalSettings)
async def get_portal_settings():
    """Get investor portal settings (admin)"""
    settings = await db.investor_settings.find_one({}, {"_id": 0})
    if not settings:
        # Return defaults
        return InvestorPortalSettings()
    
    if isinstance(settings.get('updated_at'), str):
        settings['updated_at'] = datetime.fromisoformat(settings['updated_at'])
    
    return settings


@router.put("/admin/settings", response_model=InvestorPortalSettings)
async def update_portal_settings(settings: InvestorPortalSettings):
    """Update investor portal settings (admin)"""
    settings_dict = settings.model_dump()
    settings_dict['updated_at'] = datetime.now(timezone.utc).isoformat()
    
    await db.investor_settings.update_one(
        {},
        {"$set": settings_dict},
        upsert=True
    )
    
    return settings


# Credentials Management
@router.get("/admin/credentials", response_model=List[InvestorCredential])
async def get_all_credentials():
    """Get all investor credentials (admin)"""
    credentials = await db.investor_credentials.find({}, {"_id": 0}).to_list(100)
    
    for c in credentials:
        if isinstance(c.get('created_at'), str):
            c['created_at'] = datetime.fromisoformat(c['created_at'])
        if isinstance(c.get('last_accessed'), str):
            c['last_accessed'] = datetime.fromisoformat(c['last_accessed'])
    
    return credentials


@router.post("/admin/credentials", response_model=InvestorCredential)
async def create_credential(cred_data: InvestorCredentialCreate):
    """Create new investor credential (admin)"""
    # Generate access code if not provided
    if not cred_data.access_code:
        import secrets
        cred_data.access_code = secrets.token_urlsafe(12)
    
    cred_dict = cred_data.model_dump()
    credential = InvestorCredential(**cred_dict)
    
    doc = credential.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    if doc.get('last_accessed'):
        doc['last_accessed'] = doc['last_accessed'].isoformat()
    
    await db.investor_credentials.insert_one(doc)
    return credential


@router.put("/admin/credentials/{cred_id}", response_model=InvestorCredential)
async def update_credential(cred_id: str, update_data: InvestorCredentialUpdate):
    """Update investor credential (admin)"""
    existing = await db.investor_credentials.find_one({"id": cred_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Credential not found")
    
    update_dict = update_data.model_dump(exclude_unset=True)
    
    await db.investor_credentials.update_one(
        {"id": cred_id},
        {"$set": update_dict}
    )
    
    updated = await db.investor_credentials.find_one({"id": cred_id}, {"_id": 0})
    if isinstance(updated.get('created_at'), str):
        updated['created_at'] = datetime.fromisoformat(updated['created_at'])
    if isinstance(updated.get('last_accessed'), str):
        updated['last_accessed'] = datetime.fromisoformat(updated['last_accessed'])
    
    return updated


@router.delete("/admin/credentials/{cred_id}")
async def delete_credential(cred_id: str):
    """Delete investor credential (admin)"""
    result = await db.investor_credentials.delete_one({"id": cred_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Credential not found")
    return {"message": "Credential deleted"}


# Projects Management
@router.get("/admin/projects", response_model=List[InvestorProject])
async def get_all_projects():
    """Get all investor projects (admin)"""
    projects = await db.investor_projects.find({}, {"_id": 0}).to_list(100)
    
    for p in projects:
        if isinstance(p.get('created_at'), str):
            p['created_at'] = datetime.fromisoformat(p['created_at'])
        if isinstance(p.get('updated_at'), str):
            p['updated_at'] = datetime.fromisoformat(p['updated_at'])
    
    projects.sort(key=lambda x: x.get('sort_order', 999))
    return projects


@router.post("/admin/projects", response_model=InvestorProject)
async def create_project(project_data: InvestorProjectCreate):
    """Create investor project (admin)"""
    project_dict = project_data.model_dump()
    project = InvestorProject(**project_dict)
    
    doc = project.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['updated_at'] = doc['updated_at'].isoformat()
    
    await db.investor_projects.insert_one(doc)
    return project


@router.put("/admin/projects/{project_id}", response_model=InvestorProject)
async def update_project(project_id: str, update_data: InvestorProjectUpdate):
    """Update investor project (admin)"""
    existing = await db.investor_projects.find_one({"id": project_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Project not found")
    
    update_dict = update_data.model_dump(exclude_unset=True)
    update_dict['updated_at'] = datetime.now(timezone.utc).isoformat()
    
    await db.investor_projects.update_one(
        {"id": project_id},
        {"$set": update_dict}
    )
    
    updated = await db.investor_projects.find_one({"id": project_id}, {"_id": 0})
    if isinstance(updated.get('created_at'), str):
        updated['created_at'] = datetime.fromisoformat(updated['created_at'])
    if isinstance(updated.get('updated_at'), str):
        updated['updated_at'] = datetime.fromisoformat(updated['updated_at'])
    
    return updated


@router.delete("/admin/projects/{project_id}")
async def delete_project(project_id: str):
    """Delete investor project (admin)"""
    result = await db.investor_projects.delete_one({"id": project_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Project not found")
    return {"message": "Project deleted"}


# Documents Management
@router.get("/admin/documents", response_model=List[InvestorDocument])
async def get_all_documents():
    """Get all investor documents (admin)"""
    docs = await db.investor_documents.find({}, {"_id": 0}).to_list(100)
    
    for d in docs:
        if isinstance(d.get('created_at'), str):
            d['created_at'] = datetime.fromisoformat(d['created_at'])
    
    return docs


@router.post("/admin/documents", response_model=InvestorDocument)
async def create_document(doc_data: InvestorDocumentCreate):
    """Create investor document (admin)"""
    doc_dict = doc_data.model_dump()
    document = InvestorDocument(**doc_dict)
    
    doc = document.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.investor_documents.insert_one(doc)
    return document


@router.put("/admin/documents/{doc_id}", response_model=InvestorDocument)
async def update_document(doc_id: str, update_data: InvestorDocumentUpdate):
    """Update investor document (admin)"""
    existing = await db.investor_documents.find_one({"id": doc_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Document not found")
    
    update_dict = update_data.model_dump(exclude_unset=True)
    
    await db.investor_documents.update_one(
        {"id": doc_id},
        {"$set": update_dict}
    )
    
    updated = await db.investor_documents.find_one({"id": doc_id}, {"_id": 0})
    if isinstance(updated.get('created_at'), str):
        updated['created_at'] = datetime.fromisoformat(updated['created_at'])
    
    return updated


@router.delete("/admin/documents/{doc_id}")
async def delete_document(doc_id: str):
    """Delete investor document (admin)"""
    result = await db.investor_documents.delete_one({"id": doc_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Document not found")
    return {"message": "Document deleted"}


# Inquiries Management
@router.get("/admin/inquiries", response_model=List[InvestorInquiry])
async def get_all_inquiries(status: Optional[str] = None):
    """Get all investor inquiries (admin)"""
    query = {}
    if status:
        query["status"] = status
    
    inquiries = await db.investor_inquiries.find(query, {"_id": 0}).to_list(100)
    
    for i in inquiries:
        if isinstance(i.get('created_at'), str):
            i['created_at'] = datetime.fromisoformat(i['created_at'])
    
    inquiries.sort(key=lambda x: x.get('created_at', datetime.min), reverse=True)
    return inquiries


@router.put("/admin/inquiries/{inquiry_id}", response_model=InvestorInquiry)
async def update_inquiry(inquiry_id: str, update_data: InvestorInquiryUpdate):
    """Update investor inquiry (admin)"""
    existing = await db.investor_inquiries.find_one({"id": inquiry_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Inquiry not found")
    
    update_dict = update_data.model_dump(exclude_unset=True)
    
    await db.investor_inquiries.update_one(
        {"id": inquiry_id},
        {"$set": update_dict}
    )
    
    updated = await db.investor_inquiries.find_one({"id": inquiry_id}, {"_id": 0})
    if isinstance(updated.get('created_at'), str):
        updated['created_at'] = datetime.fromisoformat(updated['created_at'])
    
    return updated


@router.delete("/admin/inquiries/{inquiry_id}")
async def delete_inquiry(inquiry_id: str):
    """Delete investor inquiry (admin)"""
    result = await db.investor_inquiries.delete_one({"id": inquiry_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Inquiry not found")
    return {"message": "Inquiry deleted"}


# Download Logs
@router.get("/admin/download-logs")
async def get_download_logs():
    """Get document download logs (admin)"""
    logs = await db.document_downloads.find({}, {"_id": 0}).to_list(500)
    
    for log in logs:
        if isinstance(log.get('downloaded_at'), str):
            log['downloaded_at'] = datetime.fromisoformat(log['downloaded_at'])
    
    logs.sort(key=lambda x: x.get('downloaded_at', datetime.min), reverse=True)
    return logs
