from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import FileResponse
import os
import uuid
from pathlib import Path
import shutil

router = APIRouter(prefix="/upload", tags=["upload"])

# Upload directory
UPLOAD_DIR = Path(__file__).parent.parent / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)

# Allowed file extensions
ALLOWED_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.gif', '.webp'}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB


@router.post("/image")
async def upload_image(file: UploadFile = File(...)):
    """Upload an image file"""
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
        with open(file_path, "wb") as buffer:
            content = await file.read()
            if len(content) > MAX_FILE_SIZE:
                raise HTTPException(
                    status_code=400,
                    detail=f"File too large. Maximum size is {MAX_FILE_SIZE // (1024*1024)}MB"
                )
            buffer.write(content)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")
    
    # Return the URL path to access the image
    return {
        "filename": unique_filename,
        "url": f"/api/upload/images/{unique_filename}"
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
async def upload_file(file: UploadFile = File(...)):
    """Upload a document file (PDF, etc.)"""
    ext = Path(file.filename).suffix.lower()
    if ext not in ALLOWED_FILE_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"File type not allowed. Allowed: {', '.join(ALLOWED_FILE_EXTENSIONS)}"
        )
    
    unique_filename = f"{uuid.uuid4()}{ext}"
    file_path = UPLOAD_DIR / unique_filename
    
    try:
        with open(file_path, "wb") as buffer:
            content = await file.read()
            if len(content) > MAX_DOC_SIZE:
                raise HTTPException(
                    status_code=400,
                    detail=f"File too large. Maximum size is {MAX_DOC_SIZE // (1024*1024)}MB"
                )
            buffer.write(content)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")
    
    return {
        "filename": unique_filename,
        "original_name": file.filename,
        "url": f"/api/upload/files/{unique_filename}"
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
