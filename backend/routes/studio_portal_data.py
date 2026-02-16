from fastapi import APIRouter, HTTPException, Depends, Request
from fastapi.responses import StreamingResponse
from typing import List, Optional
from datetime import datetime, timezone
import io

from models.studio_user import (
    UserRole, UserStatus, PortalUpdate, UpdateVisibility, UpdateTag,
    PortalAsset, AssetVisibility, AssetType, AuditEventType,
    get_role_permissions, can_view_financials, can_view_scripts, can_view_deck
)
from routes.studio_portal_auth import get_current_user, log_audit_event

router = APIRouter(prefix="/studio-portal", tags=["studio-portal-data"])

# Will be set from server.py
db = None


def set_db(database):
    global db
    db = database


# ============ HELPER FUNCTIONS ============

async def get_user_accessible_projects(user: dict) -> List[str]:
    """Get list of project IDs the user can access"""
    if user.get("has_all_projects_access") or user.get("role") == UserRole.ADMIN.value:
        # Get all project IDs
        films = await db.films.find({}, {"id": 1, "_id": 0}).to_list(100)
        return [f["id"] for f in films]
    
    return user.get("project_permissions", [])


def can_user_see_update(user: dict, update: dict) -> bool:
    """Check if user can see a specific update based on visibility rules"""
    visibility = update.get("visibility", UpdateVisibility.ALL.value)
    user_role = UserRole(user.get("role", UserRole.OTHER.value))
    
    if visibility == UpdateVisibility.ALL.value:
        return True
    
    if visibility == UpdateVisibility.INVESTORS_ONLY.value:
        return user_role in [UserRole.ADMIN, UserRole.INVESTOR]
    
    if visibility == UpdateVisibility.PRODUCTION_TEAM.value:
        return user_role in [UserRole.ADMIN, UserRole.DIRECTOR, UserRole.PRODUCER, UserRole.EXECUTIVE_PRODUCER]
    
    if visibility == UpdateVisibility.SALES.value:
        return user_role in [UserRole.ADMIN, UserRole.SALES_AGENT, UserRole.INVESTOR]
    
    if visibility == UpdateVisibility.TALENT.value:
        return user_role in [UserRole.ADMIN, UserRole.CAST, UserRole.CREW, UserRole.TALENT_MANAGER]
    
    if visibility == UpdateVisibility.CUSTOM.value:
        visibility_roles = update.get("visibility_roles", [])
        return user_role.value in visibility_roles or user_role == UserRole.ADMIN
    
    return False


def can_user_see_asset(user: dict, asset: dict, accessible_projects: List[str]) -> bool:
    """Check if user can see a specific asset"""
    visibility = asset.get("visibility", AssetVisibility.PORTAL.value)
    user_role = UserRole(user.get("role", UserRole.OTHER.value))
    
    # Admin sees everything
    if user_role == UserRole.ADMIN:
        return True
    
    if visibility == AssetVisibility.PUBLIC.value:
        return True
    
    if visibility == AssetVisibility.PORTAL.value:
        # Check project restriction
        asset_projects = asset.get("project_ids", [])
        if asset_projects:
            return any(p in accessible_projects for p in asset_projects)
        return True
    
    if visibility == AssetVisibility.ROLE_RESTRICTED.value:
        visibility_roles = asset.get("visibility_roles", [])
        if user_role.value not in visibility_roles:
            return False
        # Also check project restriction
        asset_projects = asset.get("project_ids", [])
        if asset_projects:
            return any(p in accessible_projects for p in asset_projects)
        return True
    
    if visibility == AssetVisibility.PROJECT_RESTRICTED.value:
        asset_projects = asset.get("project_ids", [])
        return any(p in accessible_projects for p in asset_projects)
    
    return False


# ============ DASHBOARD ============

@router.get("/dashboard")
async def get_dashboard(user: dict = Depends(get_current_user)):
    """Get dashboard data for current user"""
    accessible_projects = await get_user_accessible_projects(user)
    
    # Get accessible projects with details
    projects = []
    if accessible_projects:
        projects = await db.films.find(
            {"id": {"$in": accessible_projects}},
            {"_id": 0}
        ).to_list(20)
    
    # Get recent updates (filtered)
    all_updates = await db.portal_updates.find(
        {"published": True},
        {"_id": 0}
    ).sort("created_at", -1).to_list(50)
    
    # Filter updates by visibility and project access
    recent_updates = []
    for update in all_updates:
        if not can_user_see_update(user, update):
            continue
        
        # Check project access if project-specific
        if update.get("project_id"):
            if update["project_id"] not in accessible_projects:
                continue
        
        recent_updates.append(update)
        if len(recent_updates) >= 5:
            break
    
    # Get recent assets (filtered)
    all_assets = await db.portal_assets.find(
        {"archived": False},
        {"_id": 0}
    ).sort("created_at", -1).to_list(50)
    
    recent_assets = []
    for asset in all_assets:
        if can_user_see_asset(user, asset, accessible_projects):
            recent_assets.append(asset)
            if len(recent_assets) >= 6:
                break
    
    return {
        "user": {
            "full_name": user.get("full_name"),
            "role": user.get("role"),
            "email": user.get("email")
        },
        "projects": projects,
        "recent_updates": recent_updates,
        "recent_assets": recent_assets,
        "permissions": get_role_permissions(UserRole(user.get("role")))
    }


# ============ PROJECTS ============

@router.get("/projects")
async def get_accessible_projects(user: dict = Depends(get_current_user)):
    """Get all projects the user can access"""
    accessible_project_ids = await get_user_accessible_projects(user)
    
    if not accessible_project_ids:
        return {"projects": [], "message": "No projects assigned yet."}
    
    projects = await db.films.find(
        {"id": {"$in": accessible_project_ids}},
        {"_id": 0}
    ).to_list(100)
    
    return {"projects": projects}


@router.get("/projects/{slug}")
async def get_project_detail(slug: str, user: dict = Depends(get_current_user)):
    """Get detailed project information (gated by access)"""
    # Get project
    project = await db.films.find_one({"slug": slug}, {"_id": 0})
    
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Check access
    accessible_project_ids = await get_user_accessible_projects(user)
    if project["id"] not in accessible_project_ids:
        raise HTTPException(status_code=403, detail="You don't have access to this project")
    
    user_role = UserRole(user.get("role", UserRole.OTHER.value))
    permissions = get_role_permissions(user_role)
    
    # Build response with only permitted data
    response = {
        "project": {
            "id": project.get("id"),
            "title": project.get("title"),
            "slug": project.get("slug"),
            "status": project.get("status"),
            "genres": project.get("genres", []),
            "poster_url": project.get("poster_url"),
            "tagline": project.get("tagline"),
            "format": project.get("format"),
            "target_audience": project.get("target_audience"),
            "comparables": project.get("comparables")
        },
        "permissions": permissions
    }
    
    # Add logline/synopsis (always visible)
    if project.get("logline"):
        response["project"]["logline"] = project["logline"]
    if project.get("extended_synopsis"):
        response["project"]["extended_synopsis"] = project["extended_synopsis"]
    if project.get("tone_style_text"):
        response["project"]["tone_style_text"] = project["tone_style_text"]
    if project.get("mood_images"):
        response["project"]["mood_images"] = project["mood_images"]
    
    # Pitch deck (role-based)
    if permissions.get("deck") and project.get("pitch_deck_url"):
        response["has_pitch_deck"] = True
    
    # Script (role-based)
    if permissions.get("scripts") and project.get("script_url"):
        response["has_script"] = True
    
    # Financial overview (role-based)
    if permissions.get("financials"):
        response["financials"] = {
            "target_budget_range": project.get("target_budget_range"),
            "financing_structure": project.get("financing_structure"),
            "incentives": project.get("incentives")
        }
    
    # Get project-specific updates
    all_updates = await db.portal_updates.find(
        {"project_id": project["id"], "published": True},
        {"_id": 0}
    ).sort("created_at", -1).to_list(20)
    
    project_updates = [u for u in all_updates if can_user_see_update(user, u)]
    if project_updates:
        response["updates"] = project_updates
    
    # Get project-specific assets
    all_assets = await db.portal_assets.find(
        {"project_ids": project["id"], "archived": False},
        {"_id": 0}
    ).to_list(50)
    
    project_assets = [a for a in all_assets if can_user_see_asset(user, a, [project["id"]])]
    if project_assets:
        response["assets"] = project_assets
    
    return response


# ============ UPDATES FEED ============

@router.get("/updates")
async def get_updates(
    project_id: Optional[str] = None,
    tag: Optional[str] = None,
    limit: int = 20,
    user: dict = Depends(get_current_user)
):
    """Get updates feed filtered by role and project access"""
    accessible_project_ids = await get_user_accessible_projects(user)
    
    # Build query
    query = {"published": True}
    if project_id:
        if project_id not in accessible_project_ids:
            raise HTTPException(status_code=403, detail="No access to this project")
        query["project_id"] = project_id
    
    if tag:
        query["tags"] = tag
    
    all_updates = await db.portal_updates.find(
        query,
        {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    
    # Filter by visibility and project access
    filtered_updates = []
    for update in all_updates:
        if not can_user_see_update(user, update):
            continue
        
        # Check project access if project-specific
        if update.get("project_id") and update["project_id"] not in accessible_project_ids:
            continue
        
        filtered_updates.append(update)
        if len(filtered_updates) >= limit:
            break
    
    # Get unique tags for filter
    all_tags = set()
    for u in filtered_updates:
        all_tags.update(u.get("tags", []))
    
    return {
        "updates": filtered_updates,
        "available_tags": list(all_tags)
    }


# ============ ASSETS ============

@router.get("/assets")
async def get_assets(
    project_id: Optional[str] = None,
    asset_type: Optional[str] = None,
    user: dict = Depends(get_current_user)
):
    """Get assets filtered by permission"""
    accessible_project_ids = await get_user_accessible_projects(user)
    
    # Build query
    query = {"archived": False}
    if project_id:
        if project_id not in accessible_project_ids:
            raise HTTPException(status_code=403, detail="No access to this project")
        query["project_ids"] = project_id
    
    if asset_type:
        query["asset_type"] = asset_type
    
    all_assets = await db.portal_assets.find(
        query,
        {"_id": 0}
    ).sort("created_at", -1).to_list(200)
    
    # Filter by visibility
    filtered_assets = [a for a in all_assets if can_user_see_asset(user, a, accessible_project_ids)]
    
    return {"assets": filtered_assets}


@router.post("/assets/{asset_id}/download")
async def download_asset(
    asset_id: str,
    request: Request,
    user: dict = Depends(get_current_user)
):
    """Download asset with watermark"""
    from pathlib import Path
    
    asset = await db.portal_assets.find_one({"id": asset_id}, {"_id": 0})
    
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    
    # Check access
    accessible_project_ids = await get_user_accessible_projects(user)
    if not can_user_see_asset(user, asset, accessible_project_ids):
        raise HTTPException(status_code=403, detail="You don't have access to this asset")
    
    # Get file path
    file_url = asset.get("file_url", "")
    filename = file_url.split("/")[-1]
    file_path = Path(__file__).parent.parent / "uploads" / filename
    
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")
    
    # Log download
    await log_audit_event(
        AuditEventType.ASSET_DOWNLOAD,
        user_id=user["id"],
        user_email=user.get("email"),
        asset_id=asset_id,
        details={"asset_name": asset.get("name"), "file": filename},
        ip_address=request.client.host if request.client else None
    )
    
    # Check if watermark required
    if asset.get("requires_watermark", True) and file_path.suffix.lower() == ".pdf":
        # Watermark PDF
        watermark_text = f"CONFIDENTIAL - {user.get('full_name')} ({user.get('email')}) - {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')}"
        
        try:
            watermarked_pdf = await watermark_pdf(str(file_path), watermark_text)
            
            return StreamingResponse(
                io.BytesIO(watermarked_pdf),
                media_type="application/pdf",
                headers={
                    "Content-Disposition": f'attachment; filename="{asset.get("name", "document")}_CONFIDENTIAL.pdf"'
                }
            )
        except Exception as e:
            print(f"Watermarking failed: {e}")
            # Fall through to regular download
    
    # Return file without watermark
    from fastapi.responses import FileResponse
    return FileResponse(
        str(file_path),
        filename=f"{asset.get('name', filename)}",
        media_type=asset.get("file_type", "application/octet-stream")
    )


async def watermark_pdf(pdf_path: str, user_name: str, user_email: str = None, company: str = None) -> bytes:
    """Add a single diagonal watermark per page - less intrusive, more readable"""
    from pypdf import PdfReader, PdfWriter
    from reportlab.pdfgen import canvas
    from reportlab.lib.pagesizes import letter
    from reportlab.lib.colors import Color
    
    # Read original PDF to get page dimensions
    reader = PdfReader(pdf_path)
    
    # Create watermark overlay (single diagonal name per page)
    watermark_buffer = io.BytesIO()
    c = canvas.Canvas(watermark_buffer, pagesize=letter)
    width, height = letter
    
    # Single, large, subtle diagonal watermark
    c.setFillColor(Color(0.5, 0.5, 0.5, alpha=0.08))  # Very subtle - 8% opacity
    c.setFont("Helvetica-Bold", 60)  # Large font
    
    c.saveState()
    c.translate(width/2, height/2)
    c.rotate(45)
    
    # Single centered watermark with user name
    c.drawCentredString(0, 0, user_name.upper())
    
    c.restoreState()
    c.save()
    watermark_buffer.seek(0)
    
    # Read watermark
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


# ============ PROJECT DOCUMENT DOWNLOADS ============

@router.post("/projects/{slug}/download/{doc_type}")
async def download_project_document(
    slug: str,
    doc_type: str,  # "pitch_deck" or "script"
    request: Request,
    user: dict = Depends(get_current_user)
):
    """Download project pitch deck or script with watermark"""
    from pathlib import Path
    
    # Get project
    project = await db.films.find_one({"slug": slug}, {"_id": 0})
    
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Check project access
    accessible_project_ids = await get_user_accessible_projects(user)
    if project["id"] not in accessible_project_ids:
        raise HTTPException(status_code=403, detail="You don't have access to this project")
    
    user_role = UserRole(user.get("role", UserRole.OTHER.value))
    permissions = get_role_permissions(user_role)
    
    # Check permission and get file
    if doc_type == "pitch_deck":
        if not permissions.get("deck"):
            raise HTTPException(status_code=403, detail="You don't have permission to access pitch decks")
        file_url = project.get("pitch_deck_url")
        doc_name = f"{project['title']}_Pitch_Deck"
    elif doc_type == "script":
        if not permissions.get("scripts"):
            raise HTTPException(status_code=403, detail="You don't have permission to access scripts")
        file_url = project.get("script_url")
        doc_name = f"{project['title']}_Script"
    else:
        raise HTTPException(status_code=400, detail="Invalid document type")
    
    if not file_url:
        raise HTTPException(status_code=404, detail="Document not available")
    
    # Get file path
    filename = file_url.split("/")[-1]
    file_path = Path(__file__).parent.parent / "uploads" / filename
    
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")
    
    # Log download
    await log_audit_event(
        AuditEventType.ASSET_DOWNLOAD,
        user_id=user["id"],
        user_email=user.get("email"),
        project_id=project["id"],
        details={"document_type": doc_type, "project": project["title"]},
        ip_address=request.client.host if request.client else None
    )
    
    # Watermark PDF
    watermark_text = f"CONFIDENTIAL - {user.get('full_name')} ({user.get('email')}) - {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')}"
    
    try:
        watermarked_pdf = await watermark_pdf(str(file_path), watermark_text)
        
        return StreamingResponse(
            io.BytesIO(watermarked_pdf),
            media_type="application/pdf",
            headers={
                "Content-Disposition": f'attachment; filename="{doc_name}_CONFIDENTIAL.pdf"'
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to prepare document: {str(e)}")
