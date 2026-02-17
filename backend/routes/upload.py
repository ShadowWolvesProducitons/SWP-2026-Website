from fastapi import APIRouter, UploadFile, File, HTTPException, Form
from fastapi.responses import FileResponse
from datetime import datetime, timezone
from typing import Optional
import os
import uuid
from pathlib import Path
import shutil

from services.image_processor import compress_image, get_compression_stats

router = APIRouter(prefix="/upload", tags=["upload"])

# Database reference (set from server.py)
db = None

def set_db(database):
    global db
    db = database

# Upload directory
UPLOAD_DIR = Path(__file__).parent.parent / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)

# Allowed file extensions
ALLOWED_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.tiff'}
MAX_FILE_SIZE = 15 * 1024 * 1024  # 15MB (before compression)


async def add_to_asset_library(filename: str, original_name: str, file_url: str, 
                               file_size: int, mime_type: str, asset_type: str = "image",
                               tags: list = None, source: str = "upload"):
    """Auto-add uploaded file to the assets library"""
    if db is None:
        return None
    
    asset = {
        "id": str(uuid.uuid4()),
        "filename": filename,
        "original_name": original_name,
        "asset_type": asset_type,
        "tags": tags or [source],
        "visibility": "admin_only",
        "related_project_id": None,
        "notes": f"Auto-added from {source}",
        "file_url": file_url,
        "file_size": file_size,
        "mime_type": mime_type,
        "uploaded_by": "admin",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    try:
        await db.assets.insert_one(asset)
        del asset["_id"]
        return asset
    except Exception:
        return None


@router.post("/image")
async def upload_image(
    file: UploadFile = File(...),
    auto_library: bool = Form(True),
    source: str = Form("upload"),
    tags: str = Form("")
):
    """Upload an image file. Auto-adds to asset library by default."""
    # Validate file extension
    ext = Path(file.filename).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"File type not allowed. Allowed types: {', '.join(ALLOWED_EXTENSIONS)}"
        )
    
    # Generate unique filename
    unique_filename = f"{uuid.uuid4()}{ext}"
    file_path = UPLOAD_DIR / unique_filename
    
    # Save file
    try:
        content = await file.read()
        if len(content) > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=400,
                detail=f"File too large. Maximum size is {MAX_FILE_SIZE // (1024*1024)}MB"
            )
        with open(file_path, "wb") as buffer:
            buffer.write(content)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")
    
    file_url = f"/api/upload/images/{unique_filename}"
    
    # Auto-add to asset library
    asset = None
    if auto_library and db is not None:
        tag_list = [t.strip() for t in tags.split(",") if t.strip()] if tags else []
        tag_list.append(source) if source and source not in tag_list else None
        asset = await add_to_asset_library(
            filename=unique_filename,
            original_name=file.filename,
            file_url=file_url,
            file_size=len(content),
            mime_type=file.content_type or "image/jpeg",
            asset_type="image",
            tags=tag_list,
            source=source
        )
    
    return {
        "filename": unique_filename,
        "url": file_url,
        "asset_id": asset["id"] if asset else None
    }


@router.get("/images/{filename}")
async def get_image(filename: str):
    """Serve an uploaded image"""
    file_path = UPLOAD_DIR / filename
    
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Image not found")
    
    # Security check - prevent path traversal
    if not file_path.resolve().is_relative_to(UPLOAD_DIR.resolve()):
        raise HTTPException(status_code=403, detail="Access denied")
    
    return FileResponse(file_path)


@router.delete("/images/{filename}")
async def delete_image(filename: str):
    """Delete an uploaded image"""
    file_path = UPLOAD_DIR / filename
    
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Image not found")
    
    # Security check
    if not file_path.resolve().is_relative_to(UPLOAD_DIR.resolve()):
        raise HTTPException(status_code=403, detail="Access denied")
    
    try:
        os.remove(file_path)
        return {"message": "Image deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete file: {str(e)}")


# File upload (PDFs, documents, etc.)
ALLOWED_FILE_EXTENSIONS = {'.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt', '.zip'}
MAX_DOC_SIZE = 50 * 1024 * 1024  # 50MB

@router.post("/file")
async def upload_file(
    file: UploadFile = File(...),
    auto_library: bool = Form(True),
    source: str = Form("upload"),
    tags: str = Form("")
):
    """Upload a document file (PDF, etc.). Auto-adds to asset library by default."""
    ext = Path(file.filename).suffix.lower()
    if ext not in ALLOWED_FILE_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"File type not allowed. Allowed: {', '.join(ALLOWED_FILE_EXTENSIONS)}"
        )
    
    unique_filename = f"{uuid.uuid4()}{ext}"
    file_path = UPLOAD_DIR / unique_filename
    
    try:
        content = await file.read()
        if len(content) > MAX_DOC_SIZE:
            raise HTTPException(
                status_code=400,
                detail=f"File too large. Maximum size is {MAX_DOC_SIZE // (1024*1024)}MB"
            )
        with open(file_path, "wb") as buffer:
            buffer.write(content)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")
    
    file_url = f"/api/upload/files/{unique_filename}"
    
    # Determine asset type from extension
    asset_type = "pdf" if ext == ".pdf" else "other"
    
    # Auto-add to asset library
    asset = None
    if auto_library and db is not None:
        tag_list = [t.strip() for t in tags.split(",") if t.strip()] if tags else []
        tag_list.append(source) if source and source not in tag_list else None
        asset = await add_to_asset_library(
            filename=unique_filename,
            original_name=file.filename,
            file_url=file_url,
            file_size=len(content),
            mime_type=file.content_type or "application/octet-stream",
            asset_type=asset_type,
            tags=tag_list,
            source=source
        )
    
    return {
        "filename": unique_filename,
        "original_name": file.filename,
        "url": file_url,
        "asset_id": asset["id"] if asset else None
    }


@router.get("/files/{filename}")
async def get_file(filename: str):
    """Serve an uploaded file"""
    file_path = UPLOAD_DIR / filename
    
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")
    
    if not file_path.resolve().is_relative_to(UPLOAD_DIR.resolve()):
        raise HTTPException(status_code=403, detail="Access denied")
    
    return FileResponse(file_path, filename=filename)
