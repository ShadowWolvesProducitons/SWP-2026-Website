from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime, timezone
import uuid
import os
import json
from pathlib import Path

router = APIRouter(prefix="/assets", tags=["assets"])
UPLOAD_DIR = Path(__file__).parent.parent / "uploads"

db = None

def set_db(database):
    global db
    db = database


class AssetCreate(BaseModel):
    filename: str
    asset_type: str = "other"  # image, pdf, script, deck, ebook, other (legacy field)
    categories: List[str] = []  # deck, script, poster, still, ebook, other (new multi-select)
    tags: List[str] = []
    collection: str = "website"  # films, website, armory, den
    folder: Optional[str] = None  # film/app id for folder organization
    related_project_id: Optional[str] = None
    visibility: str = "admin_only"  # public, investor_only, admin_only
    notes: Optional[str] = None


class AssetUpdate(BaseModel):
    asset_type: Optional[str] = None
    categories: Optional[List[str]] = None
    tags: Optional[List[str]] = None
    collection: Optional[str] = None
    folder: Optional[str] = None
    related_project_id: Optional[str] = None
    visibility: Optional[str] = None
    notes: Optional[str] = None


@router.post("")
async def upload_asset(
    file: UploadFile = File(...),
    asset_type: str = Form("other"),
    categories: str = Form("[]"),  # JSON array string
    tags: str = Form(""),
    visibility: str = Form("admin_only"),
    collection: str = Form("website"),
    folder: str = Form(""),
    related_project_id: str = Form(""),
    notes: str = Form("")
):
    """Upload a new asset to the library."""
    ext = Path(file.filename).suffix.lower()
    unique_filename = f"{uuid.uuid4()}{ext}"
    file_path = UPLOAD_DIR / unique_filename

    content = await file.read()
    if len(content) > 100 * 1024 * 1024:  # 100MB limit
        raise HTTPException(status_code=400, detail="File too large (max 100MB)")

    with open(file_path, "wb") as f:
        f.write(content)

    # Determine asset type from extension if not specified
    if asset_type == "other":
        img_exts = {'.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'}
        if ext in img_exts:
            asset_type = "image"
        elif ext == '.pdf':
            asset_type = "pdf"

    is_image = ext in {'.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'}
    file_url = f"/api/upload/images/{unique_filename}" if is_image else f"/api/upload/files/{unique_filename}"

    tag_list = [t.strip() for t in tags.split(",") if t.strip()] if tags else []
    
    # Parse categories JSON
    try:
        category_list = json.loads(categories) if categories else []
    except json.JSONDecodeError:
        category_list = []

    asset = {
        "id": str(uuid.uuid4()),
        "filename": unique_filename,
        "original_name": file.filename,
        "asset_type": asset_type,
        "categories": category_list,
        "tags": tag_list,
        "visibility": visibility,
        "collection": collection or "website",
        "folder": folder or None,
        "related_project_id": related_project_id or None,
        "notes": notes or None,
        "file_url": file_url,
        "file_size": len(content),
        "mime_type": file.content_type,
        "uploaded_by": "admin",
        "created_at": datetime.now(timezone.utc).isoformat()
    }

    await db.assets.insert_one(asset)
    del asset["_id"]
    return asset


@router.get("")
async def list_assets(
    asset_type: Optional[str] = None,
    visibility: Optional[str] = None,
    tag: Optional[str] = None,
    search: Optional[str] = None
):
    """List assets with optional filters."""
    query = {}
    if asset_type and asset_type != "all":
        query["asset_type"] = asset_type
    if visibility and visibility != "all":
        query["visibility"] = visibility
    if tag:
        query["tags"] = tag
    if search:
        query["$or"] = [
            {"original_name": {"$regex": search, "$options": "i"}},
            {"notes": {"$regex": search, "$options": "i"}},
            {"tags": {"$regex": search, "$options": "i"}}
        ]

    assets = await db.assets.find(query, {"_id": 0}).sort("created_at", -1).to_list(500)
    return assets


@router.get("/{asset_id}")
async def get_asset(asset_id: str):
    """Get a single asset by ID."""
    asset = await db.assets.find_one({"id": asset_id}, {"_id": 0})
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    return asset


@router.put("/{asset_id}")
async def update_asset(asset_id: str, data: AssetUpdate):
    """Update asset metadata."""
    update = {k: v for k, v in data.model_dump().items() if v is not None}
    if not update:
        raise HTTPException(status_code=400, detail="No fields to update")
    update["updated_at"] = datetime.now(timezone.utc).isoformat()
    result = await db.assets.update_one({"id": asset_id}, {"$set": update})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Asset not found")
    return {"message": "Asset updated"}


@router.delete("/{asset_id}")
async def delete_asset(asset_id: str):
    """Delete an asset and its file."""
    asset = await db.assets.find_one({"id": asset_id}, {"_id": 0})
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")

    # Try to delete the file
    file_path = UPLOAD_DIR / asset["filename"]
    if file_path.exists():
        try:
            os.remove(file_path)
        except Exception:
            pass

    await db.assets.delete_one({"id": asset_id})
    return {"message": "Asset deleted"}
