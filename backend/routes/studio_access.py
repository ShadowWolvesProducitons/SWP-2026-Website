from fastapi import APIRouter, HTTPException, Query, Depends
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from datetime import datetime, timezone
from typing import Optional
import uuid
import os
import io
from pathlib import Path

router = APIRouter(prefix="/studio-access", tags=["studio-access"])

# Will be set from server.py
db = None

def set_db(database):
    global db
    db = database


class StudioAccessToken(BaseModel):
    id: str
    film_id: str
    film_slug: str
    token: str
    user_name: str
    user_email: str
    company: Optional[str] = ""
    created_at: str
    expires_at: Optional[str] = None
    access_count: int = 0
    last_accessed: Optional[str] = None
    revoked: bool = False


class CreateAccessRequest(BaseModel):
    film_id: str
    user_name: str
    user_email: str
    company: Optional[str] = ""
    expires_days: Optional[int] = 30  # Default 30 days


class AccessLogEntry(BaseModel):
    id: str
    token_id: str
    film_id: str
    action: str  # "viewed", "downloaded_deck", "downloaded_script", "nda_agreed"
    user_name: str
    user_email: str
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    timestamp: str


@router.post("/tokens")
async def create_access_token(request: CreateAccessRequest):
    """Create a new studio access token for a user"""
    # Verify film exists and has studio access enabled
    film = await db.films.find_one({"id": request.film_id}, {"_id": 0})
    if not film:
        raise HTTPException(status_code=404, detail="Film not found")
    
    if not film.get('studio_access_enabled', False):
        raise HTTPException(status_code=400, detail="Studio access not enabled for this film")
    
    # Generate unique token
    token = str(uuid.uuid4())
    
    # Calculate expiry
    expires_at = None
    if request.expires_days:
        from datetime import timedelta
        expires_at = (datetime.now(timezone.utc) + timedelta(days=request.expires_days)).isoformat()
    
    token_doc = {
        "id": str(uuid.uuid4()),
        "film_id": request.film_id,
        "film_slug": film.get('slug', ''),
        "token": token,
        "user_name": request.user_name,
        "user_email": request.user_email,
        "company": request.company or "",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "expires_at": expires_at,
        "access_count": 0,
        "last_accessed": None,
        "revoked": False
    }
    
    await db.studio_access_tokens.insert_one(token_doc)
    del token_doc["_id"]
    
    return {
        "token": token,
        "access_url": f"/studio-access/{film.get('slug', request.film_id)}?token={token}",
        "expires_at": expires_at
    }


@router.get("/tokens")
async def list_access_tokens(film_id: Optional[str] = None):
    """List all studio access tokens, optionally filtered by film"""
    query = {}
    if film_id:
        query["film_id"] = film_id
    
    tokens = await db.studio_access_tokens.find(query, {"_id": 0}).to_list(100)
    return tokens


@router.delete("/tokens/{token_id}")
async def revoke_access_token(token_id: str):
    """Revoke a studio access token"""
    result = await db.studio_access_tokens.update_one(
        {"id": token_id},
        {"$set": {"revoked": True}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Token not found")
    return {"message": "Token revoked successfully"}


@router.get("/verify/{slug}")
async def verify_access(slug: str, token: str = Query(...)):
    """Verify access token and return film data for studio access page"""
    # Find the token
    token_doc = await db.studio_access_tokens.find_one(
        {"film_slug": slug, "token": token, "revoked": False},
        {"_id": 0}
    )
    
    if not token_doc:
        raise HTTPException(status_code=401, detail="Invalid or expired access token")
    
    # Check expiry
    if token_doc.get('expires_at'):
        expires = datetime.fromisoformat(token_doc['expires_at'])
        if datetime.now(timezone.utc) > expires:
            raise HTTPException(status_code=401, detail="Access token has expired")
    
    # Get film data
    film = await db.films.find_one({"slug": slug}, {"_id": 0})
    if not film:
        raise HTTPException(status_code=404, detail="Film not found")
    
    if not film.get('studio_access_enabled', False):
        raise HTTPException(status_code=403, detail="Studio access not available for this project")
    
    # Update access count and last accessed
    await db.studio_access_tokens.update_one(
        {"id": token_doc['id']},
        {
            "$inc": {"access_count": 1},
            "$set": {"last_accessed": datetime.now(timezone.utc).isoformat()}
        }
    )
    
    # Log access
    await log_access(token_doc['id'], film['id'], "viewed", token_doc['user_name'], token_doc['user_email'])
    
    # Return combined data
    return {
        "film": film,
        "user": {
            "name": token_doc['user_name'],
            "email": token_doc['user_email'],
            "company": token_doc.get('company', '')
        }
    }


async def log_access(token_id: str, film_id: str, action: str, user_name: str, user_email: str, ip_address: str = None, user_agent: str = None):
    """Log an access event"""
    log_entry = {
        "id": str(uuid.uuid4()),
        "token_id": token_id,
        "film_id": film_id,
        "action": action,
        "user_name": user_name,
        "user_email": user_email,
        "ip_address": ip_address,
        "user_agent": user_agent,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
    await db.studio_access_logs.insert_one(log_entry)


@router.get("/logs")
async def get_access_logs(film_id: Optional[str] = None, token_id: Optional[str] = None, limit: int = 50):
    """Get studio access logs"""
    query = {}
    if film_id:
        query["film_id"] = film_id
    if token_id:
        query["token_id"] = token_id
    
    logs = await db.studio_access_logs.find(query, {"_id": 0}).sort("timestamp", -1).to_list(limit)
    return logs


@router.post("/watermark/{slug}/{doc_type}")
async def get_watermarked_document(
    slug: str,
    doc_type: str,  # "pitch_deck" or "script"
    token: str = Query(...)
):
    """Generate and return a watermarked PDF document"""
    # Verify access
    token_doc = await db.studio_access_tokens.find_one(
        {"film_slug": slug, "token": token, "revoked": False},
        {"_id": 0}
    )
    
    if not token_doc:
        raise HTTPException(status_code=401, detail="Invalid or expired access token")
    
    # Check expiry
    if token_doc.get('expires_at'):
        expires = datetime.fromisoformat(token_doc['expires_at'])
        if datetime.now(timezone.utc) > expires:
            raise HTTPException(status_code=401, detail="Access token has expired")
    
    # Get film
    film = await db.films.find_one({"slug": slug}, {"_id": 0})
    if not film:
        raise HTTPException(status_code=404, detail="Film not found")
    
    # Determine which document to watermark
    if doc_type == "pitch_deck":
        doc_url = film.get('pitch_deck_url')
        doc_name = f"{film['title']}_Pitch_Deck"
        action = "downloaded_deck"
    elif doc_type == "script":
        doc_url = film.get('script_url')
        doc_name = f"{film['title']}_Script"
        action = "downloaded_script"
    else:
        raise HTTPException(status_code=400, detail="Invalid document type")
    
    if not doc_url:
        raise HTTPException(status_code=404, detail="Document not available")
    
    # Get the actual file path
    # doc_url is like /api/upload/files/xxx.pdf
    filename = doc_url.split('/')[-1]
    file_path = Path(__file__).parent.parent / "uploads" / filename
    
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Document file not found")
    
    # Generate watermark info
    watermark_text = f"CONFIDENTIAL - {token_doc['user_name']} ({token_doc['user_email']}) - {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')}"
    
    try:
        # Watermark the PDF
        watermarked_pdf = await watermark_pdf(str(file_path), watermark_text)
        
        # Log the download
        await log_access(token_doc['id'], film['id'], action, token_doc['user_name'], token_doc['user_email'])
        
        # Return watermarked PDF
        return StreamingResponse(
            io.BytesIO(watermarked_pdf),
            media_type="application/pdf",
            headers={
                "Content-Disposition": f'attachment; filename="{doc_name}_CONFIDENTIAL.pdf"'
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to watermark document: {str(e)}")


async def watermark_pdf(pdf_path: str, watermark_text: str) -> bytes:
    """Add watermark to each page of a PDF"""
    try:
        from pypdf import PdfReader, PdfWriter
        from reportlab.pdfgen import canvas
        from reportlab.lib.pagesizes import letter
        from reportlab.lib.colors import Color
        import io
        
        # Create watermark PDF
        watermark_buffer = io.BytesIO()
        c = canvas.Canvas(watermark_buffer, pagesize=letter)
        width, height = letter
        
        # Set watermark properties
        c.setFillColor(Color(0.5, 0.5, 0.5, alpha=0.3))
        c.setFont("Helvetica", 10)
        
        # Add diagonal watermark text
        c.saveState()
        c.translate(width/2, height/2)
        c.rotate(45)
        
        # Tile the watermark
        for y_offset in range(-int(height), int(height), 100):
            for x_offset in range(-int(width), int(width), 300):
                c.drawString(x_offset, y_offset, watermark_text)
        
        c.restoreState()
        
        # Add footer watermark
        c.setFillColor(Color(0.3, 0.3, 0.3, alpha=0.5))
        c.setFont("Helvetica-Bold", 8)
        c.drawString(20, 15, watermark_text)
        
        c.save()
        watermark_buffer.seek(0)
        
        # Read original PDF
        reader = PdfReader(pdf_path)
        watermark_reader = PdfReader(watermark_buffer)
        watermark_page = watermark_reader.pages[0]
        
        # Create output PDF
        writer = PdfWriter()
        
        for page in reader.pages:
            page.merge_page(watermark_page)
            writer.add_page(page)
        
        # Write to bytes
        output_buffer = io.BytesIO()
        writer.write(output_buffer)
        output_buffer.seek(0)
        
        return output_buffer.read()
    
    except ImportError as e:
        raise Exception(f"PDF libraries not available: {str(e)}")
    except Exception as e:
        raise Exception(f"Watermarking failed: {str(e)}")


class NDAConfirmation(BaseModel):
    nda_agreed: bool
    confidentiality_agreed: bool


@router.post("/nda-confirm/{slug}")
async def confirm_nda(slug: str, confirmation: NDAConfirmation, token: str = Query(...)):
    """Record NDA confirmation before script access"""
    if not confirmation.nda_agreed or not confirmation.confidentiality_agreed:
        raise HTTPException(status_code=400, detail="All agreements must be accepted")
    
    # Verify token
    token_doc = await db.studio_access_tokens.find_one(
        {"film_slug": slug, "token": token, "revoked": False},
        {"_id": 0}
    )
    
    if not token_doc:
        raise HTTPException(status_code=401, detail="Invalid access token")
    
    # Get film
    film = await db.films.find_one({"slug": slug}, {"_id": 0})
    if not film:
        raise HTTPException(status_code=404, detail="Film not found")
    
    # Log NDA confirmation
    await log_access(token_doc['id'], film['id'], "nda_agreed", token_doc['user_name'], token_doc['user_email'])
    
    # Store NDA confirmation
    await db.studio_access_tokens.update_one(
        {"id": token_doc['id']},
        {"$set": {
            "nda_confirmed": True,
            "nda_confirmed_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    return {"message": "NDA confirmation recorded", "script_access_granted": True}
