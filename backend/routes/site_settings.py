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

# SEO Models
class GlobalSeoSettings(BaseModel):
    site_name: Optional[str] = "Shadow Wolves Productions"
    site_url: Optional[str] = "https://shadowwolvesproductions.com"
    default_meta_title_template: Optional[str] = "{pageTitle} | Shadow Wolves Productions"
    default_meta_description: Optional[str] = "Bold, genre-driven stories with teeth."
    default_og_image_url: Optional[str] = None
    focus_keyword_default: Optional[str] = None

class OrganizationSchemaSettings(BaseModel):
    org_name: Optional[str] = "Shadow Wolves Productions"
    org_logo_url: Optional[str] = None
    org_sameas_links: Optional[str] = ""  # Comma-separated URLs
    enable_movie_schema: bool = True
    enable_faq_schema: bool = True

class RobotsSettings(BaseModel):
    robots_allow_all: bool = True
    robots_disallow_paths: Optional[str] = "/admin\n/admin/*\n/studio-access\n/studio-access/*\n/api\n/api/*"
    robots_custom_override: Optional[str] = None

class SitemapSettings(BaseModel):
    sitemap_enabled: bool = True
    include_films: bool = True
    include_blog: bool = True
    include_armory: bool = True
    exclude_drafts: bool = True
    exclude_archived: bool = True

class SeoSettingsUpdate(BaseModel):
    global_seo: Optional[GlobalSeoSettings] = None
    organization_schema: Optional[OrganizationSchemaSettings] = None
    robots: Optional[RobotsSettings] = None
    sitemap: Optional[SitemapSettings] = None

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

# Default SEO settings
DEFAULT_SEO = {
    "global_seo": {
        "site_name": "Shadow Wolves Productions",
        "site_url": "https://shadowwolvesproductions.com",
        "default_meta_title_template": "{pageTitle} | Shadow Wolves Productions",
        "default_meta_description": "Bold, genre-driven stories with teeth — stories that entertain first, but leave a mark long after the screen goes black.",
        "default_og_image_url": None,
        "focus_keyword_default": None
    },
    "organization_schema": {
        "org_name": "Shadow Wolves Productions",
        "org_logo_url": None,
        "org_sameas_links": "",
        "enable_movie_schema": True,
        "enable_faq_schema": True
    },
    "robots": {
        "robots_allow_all": True,
        "robots_disallow_paths": "/admin\n/admin/*\n/studio-access\n/studio-access/*\n/api\n/api/*",
        "robots_custom_override": None
    },
    "sitemap": {
        "sitemap_enabled": True,
        "include_films": True,
        "include_blog": True,
        "include_armory": True,
        "exclude_drafts": True,
        "exclude_archived": True
    }
}

@router.get("")
async def get_site_settings():
    """Get all site settings including SEO"""
    if db is None:
        raise HTTPException(status_code=500, detail="Database not initialized")
    
    settings = await db.site_settings.find_one({"type": "global"}, {"_id": 0})
    if not settings:
        # Return defaults
        return {
            "id": "default",
            "headers": DEFAULT_HEADERS,
            "seo": DEFAULT_SEO,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
    
    # Ensure SEO defaults are present
    if "seo" not in settings:
        settings["seo"] = DEFAULT_SEO
    else:
        # Merge with defaults for any missing fields
        for key in DEFAULT_SEO:
            if key not in settings["seo"]:
                settings["seo"][key] = DEFAULT_SEO[key]
            elif isinstance(DEFAULT_SEO[key], dict):
                for subkey in DEFAULT_SEO[key]:
                    if subkey not in settings["seo"][key]:
                        settings["seo"][key][subkey] = DEFAULT_SEO[key][subkey]
    
    return settings

@router.get("/seo")
async def get_seo_settings():
    """Get SEO settings only"""
    if db is None:
        raise HTTPException(status_code=500, detail="Database not initialized")
    
    settings = await db.site_settings.find_one({"type": "global"}, {"_id": 0})
    if not settings or "seo" not in settings:
        return DEFAULT_SEO
    
    # Merge with defaults
    seo = settings["seo"]
    for key in DEFAULT_SEO:
        if key not in seo:
            seo[key] = DEFAULT_SEO[key]
        elif isinstance(DEFAULT_SEO[key], dict):
            for subkey in DEFAULT_SEO[key]:
                if subkey not in seo[key]:
                    seo[key][subkey] = DEFAULT_SEO[key][subkey]
    
    return seo

@router.put("/seo")
async def update_seo_settings(seo_update: SeoSettingsUpdate):
    """Update SEO settings"""
    if db is None:
        raise HTTPException(status_code=500, detail="Database not initialized")
    
    current = await db.site_settings.find_one({"type": "global"})
    
    update_data = {}
    if seo_update.global_seo:
        update_data["seo.global_seo"] = seo_update.global_seo.model_dump()
    if seo_update.organization_schema:
        update_data["seo.organization_schema"] = seo_update.organization_schema.model_dump()
    if seo_update.robots:
        update_data["seo.robots"] = seo_update.robots.model_dump()
    if seo_update.sitemap:
        update_data["seo.sitemap"] = seo_update.sitemap.model_dump()
    
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    if current:
        await db.site_settings.update_one(
            {"type": "global"},
            {"$set": update_data}
        )
    else:
        # Create new with defaults + updates
        new_settings = {
            "id": str(uuid.uuid4()),
            "type": "global",
            "headers": DEFAULT_HEADERS,
            "seo": DEFAULT_SEO.copy(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        # Apply updates
        if seo_update.global_seo:
            new_settings["seo"]["global_seo"] = seo_update.global_seo.model_dump()
        if seo_update.organization_schema:
            new_settings["seo"]["organization_schema"] = seo_update.organization_schema.model_dump()
        if seo_update.robots:
            new_settings["seo"]["robots"] = seo_update.robots.model_dump()
        if seo_update.sitemap:
            new_settings["seo"]["sitemap"] = seo_update.sitemap.model_dump()
        
        await db.site_settings.insert_one(new_settings)
    
    return {"success": True, "message": "SEO settings updated"}

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


# Lead Magnet Settings
class LeadMagnetSettings(BaseModel):
    enabled: bool = True
    title: str = "Producer's Playbook"
    description: str = "Download our comprehensive guide to independent film production."
    button_text: str = "Get Your Free Copy"
    file_url: Optional[str] = None
    file_type: str = "pdf"  # 'pdf' or 'link'
    external_link: Optional[str] = None
    popup_delay_seconds: int = 15
    show_on_exit_intent: bool = True


DEFAULT_LEAD_MAGNET = {
    "enabled": True,
    "title": "Producer's Playbook",
    "description": "Download our comprehensive guide to independent film production.",
    "button_text": "Get Your Free Copy",
    "file_url": None,
    "file_type": "pdf",
    "external_link": None,
    "popup_delay_seconds": 15,
    "show_on_exit_intent": True
}


@router.get("/lead-magnet")
async def get_lead_magnet_settings():
    """Get lead magnet settings"""
    if db is None:
        raise HTTPException(status_code=500, detail="Database not initialized")
    
    settings = await db.site_settings.find_one({"type": "global"}, {"_id": 0})
    if settings and "lead_magnet" in settings:
        return settings["lead_magnet"]
    
    return DEFAULT_LEAD_MAGNET


@router.put("/lead-magnet")
async def update_lead_magnet_settings(settings: LeadMagnetSettings):
    """Update lead magnet settings"""
    if db is None:
        raise HTTPException(status_code=500, detail="Database not initialized")
    
    lead_magnet_data = settings.model_dump()
    
    current = await db.site_settings.find_one({"type": "global"})
    
    if current:
        await db.site_settings.update_one(
            {"type": "global"},
            {
                "$set": {
                    "lead_magnet": lead_magnet_data,
                    "updated_at": datetime.now(timezone.utc).isoformat()
                }
            }
        )
    else:
        await db.site_settings.insert_one({
            "id": str(uuid.uuid4()),
            "type": "global",
            "headers": DEFAULT_HEADERS,
            "lead_magnet": lead_magnet_data,
            "updated_at": datetime.now(timezone.utc).isoformat()
        })
    
    return {"success": True, "settings": lead_magnet_data}

