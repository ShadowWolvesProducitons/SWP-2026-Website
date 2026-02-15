from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime, timezone
import uuid

router = APIRouter(prefix="/site-settings", tags=["site-settings"])

db = None

def set_db(database):
    global db
    db = database

# Models
class HeaderSettings(BaseModel):
    page: str
    image_url: Optional[str] = None
    position_x: int = 50  # 0-100 percentage
    position_y: int = 30  # 0-100 percentage
    overlay_opacity: int = 85  # 0-100
    title: Optional[str] = None
    subtitle: Optional[str] = None

class SiteSettingsResponse(BaseModel):
    id: str
    headers: Dict[str, Any]
    updated_at: str

# Default header settings
DEFAULT_HEADERS = {
    "about": {"position_x": 50, "position_y": 30, "overlay_opacity": 85},
    "films": {"position_x": 50, "position_y": 30, "overlay_opacity": 85},
    "armory": {"position_x": 50, "position_y": 30, "overlay_opacity": 85},
    "den": {"position_x": 50, "position_y": 30, "overlay_opacity": 85},
    "investors": {"position_x": 50, "position_y": 30, "overlay_opacity": 85},
    "workwithus": {"position_x": 50, "position_y": 30, "overlay_opacity": 85},
    "contact": {"position_x": 50, "position_y": 30, "overlay_opacity": 85},
}

@router.get("")
async def get_site_settings():
    """Get all site settings"""
    if db is None:
        raise HTTPException(status_code=500, detail="Database not initialized")
    
    settings = await db.site_settings.find_one({"type": "global"}, {"_id": 0})
    if not settings:
        # Return defaults
        return {
            "id": "default",
            "headers": DEFAULT_HEADERS,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
    return settings

@router.get("/headers/{page}")
async def get_header_settings(page: str):
    """Get header settings for a specific page"""
    if db is None:
        raise HTTPException(status_code=500, detail="Database not initialized")
    
    settings = await db.site_settings.find_one({"type": "global"}, {"_id": 0})
    if settings and "headers" in settings and page in settings["headers"]:
        return settings["headers"][page]
    
    # Return defaults for this page
    return DEFAULT_HEADERS.get(page, {"position_x": 50, "position_y": 30, "overlay_opacity": 85})

@router.put("/headers/{page}")
async def update_header_settings(page: str, settings: HeaderSettings):
    """Update header settings for a specific page"""
    if db is None:
        raise HTTPException(status_code=500, detail="Database not initialized")
    
    # Get current settings or create new
    current = await db.site_settings.find_one({"type": "global"})
    
    header_data = {
        "image_url": settings.image_url,
        "position_x": settings.position_x,
        "position_y": settings.position_y,
        "overlay_opacity": settings.overlay_opacity,
        "title": settings.title,
        "subtitle": settings.subtitle,
    }
    
    if current:
        # Update existing
        await db.site_settings.update_one(
            {"type": "global"},
            {
                "$set": {
                    f"headers.{page}": header_data,
                    "updated_at": datetime.now(timezone.utc).isoformat()
                }
            }
        )
    else:
        # Create new
        headers = DEFAULT_HEADERS.copy()
        headers[page] = header_data
        await db.site_settings.insert_one({
            "id": str(uuid.uuid4()),
            "type": "global",
            "headers": headers,
            "updated_at": datetime.now(timezone.utc).isoformat()
        })
    
    return {"success": True, "page": page, "settings": header_data}

@router.post("/headers/{page}/upload")
async def set_header_image(page: str, image_url: str):
    """Set header image URL for a page"""
    if db is None:
        raise HTTPException(status_code=500, detail="Database not initialized")
    
    current = await db.site_settings.find_one({"type": "global"})
    
    if current:
        await db.site_settings.update_one(
            {"type": "global"},
            {
                "$set": {
                    f"headers.{page}.image_url": image_url,
                    "updated_at": datetime.now(timezone.utc).isoformat()
                }
            }
        )
    else:
        headers = DEFAULT_HEADERS.copy()
        headers[page] = {**DEFAULT_HEADERS.get(page, {}), "image_url": image_url}
        await db.site_settings.insert_one({
            "id": str(uuid.uuid4()),
            "type": "global",
            "headers": headers,
            "updated_at": datetime.now(timezone.utc).isoformat()
        })
    
    return {"success": True, "page": page, "image_url": image_url}
