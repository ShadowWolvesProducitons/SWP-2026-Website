from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, validator
from typing import Optional, List
from datetime import datetime, timezone
import uuid

router = APIRouter(prefix="/pages", tags=["pages"])

db = None

def set_db(database):
    global db
    db = database


# ============ MODELS ============

class PageCreate(BaseModel):
    title: str
    slug: str
    content: Optional[str] = ""
    meta_title: Optional[str] = None
    meta_description: Optional[str] = None
    is_published: bool = False
    show_in_nav: bool = False
    nav_order: int = 100

    @validator('slug')
    def validate_slug(cls, v):
        # Ensure slug starts with / and has no spaces
        v = v.strip().lower().replace(' ', '-')
        if not v.startswith('/'):
            v = '/' + v
        return v


class PageUpdate(BaseModel):
    title: Optional[str] = None
    slug: Optional[str] = None
    content: Optional[str] = None
    meta_title: Optional[str] = None
    meta_description: Optional[str] = None
    is_published: Optional[bool] = None
    show_in_nav: Optional[bool] = None
    nav_order: Optional[int] = None

    @validator('slug')
    def validate_slug(cls, v):
        if v is not None:
            v = v.strip().lower().replace(' ', '-')
            if not v.startswith('/'):
                v = '/' + v
        return v


class PageReorder(BaseModel):
    page_ids: List[str]  # List of page IDs in the new order


class Page(BaseModel):
    id: str
    title: str
    slug: str
    content: str
    meta_title: Optional[str]
    meta_description: Optional[str]
    is_published: bool
    show_in_nav: bool
    nav_order: int
    created_at: str
    updated_at: str


# ============ API ENDPOINTS ============

@router.get("/", response_model=List[Page])
async def get_pages():
    """Get all pages ordered by nav_order"""
    pages = await db.pages.find({}, {"_id": 0}).sort("nav_order", 1).to_list(100)
    return pages


@router.get("/{page_id}", response_model=Page)
async def get_page(page_id: str):
    """Get a single page by ID"""
    page = await db.pages.find_one({"id": page_id}, {"_id": 0})
    if not page:
        raise HTTPException(status_code=404, detail="Page not found")
    return page


@router.get("/by-slug/{slug:path}", response_model=Page)
async def get_page_by_slug(slug: str):
    """Get a page by its slug"""
    if not slug.startswith('/'):
        slug = '/' + slug
    page = await db.pages.find_one({"slug": slug, "is_published": True}, {"_id": 0})
    if not page:
        raise HTTPException(status_code=404, detail="Page not found")
    return page


@router.post("/", response_model=Page)
async def create_page(data: PageCreate):
    """Create a new page"""
    # Check for duplicate slug
    existing = await db.pages.find_one({"slug": data.slug}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail=f"A page with slug '{data.slug}' already exists")

    # Get max nav_order
    max_order_page = await db.pages.find_one({}, {"_id": 0, "nav_order": 1}, sort=[("nav_order", -1)])
    next_order = (max_order_page.get("nav_order", 0) + 10) if max_order_page else 10

    page = {
        "id": str(uuid.uuid4()),
        "title": data.title,
        "slug": data.slug,
        "content": data.content or "",
        "meta_title": data.meta_title,
        "meta_description": data.meta_description,
        "is_published": data.is_published,
        "show_in_nav": data.show_in_nav,
        "nav_order": data.nav_order if data.nav_order != 100 else next_order,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }

    await db.pages.insert_one(page)
    
    created = await db.pages.find_one({"id": page["id"]}, {"_id": 0})
    return created


@router.put("/{page_id}", response_model=Page)
async def update_page(page_id: str, data: PageUpdate):
    """Update a page"""
    existing = await db.pages.find_one({"id": page_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Page not found")

    update_data = data.dict(exclude_unset=True)
    
    # Check for duplicate slug if slug is being changed
    if 'slug' in update_data and update_data['slug'] != existing['slug']:
        duplicate = await db.pages.find_one({
            "slug": update_data['slug'],
            "id": {"$ne": page_id}
        }, {"_id": 0})
        if duplicate:
            raise HTTPException(status_code=400, detail=f"A page with slug '{update_data['slug']}' already exists")

    update_data['updated_at'] = datetime.now(timezone.utc).isoformat()

    await db.pages.update_one(
        {"id": page_id},
        {"$set": update_data}
    )

    updated = await db.pages.find_one({"id": page_id}, {"_id": 0})
    return updated


@router.delete("/{page_id}")
async def delete_page(page_id: str):
    """Delete a page"""
    result = await db.pages.delete_one({"id": page_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Page not found")
    return {"message": "Page deleted"}


@router.put("/{page_id}/toggle-publish")
async def toggle_page_publish(page_id: str):
    """Toggle a page's published status"""
    existing = await db.pages.find_one({"id": page_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Page not found")

    new_status = not existing.get('is_published', False)
    
    await db.pages.update_one(
        {"id": page_id},
        {"$set": {
            "is_published": new_status,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }}
    )

    return {"is_published": new_status}


@router.post("/reorder")
async def reorder_pages(data: PageReorder):
    """Reorder pages by providing list of page IDs in new order"""
    for index, page_id in enumerate(data.page_ids):
        await db.pages.update_one(
            {"id": page_id},
            {"$set": {
                "nav_order": (index + 1) * 10,
                "updated_at": datetime.now(timezone.utc).isoformat()
            }}
        )
    
    return {"message": "Pages reordered successfully"}
