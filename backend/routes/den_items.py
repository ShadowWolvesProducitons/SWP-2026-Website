from fastapi import APIRouter, HTTPException
from typing import List, Optional
from models.den_item import DenItem, DenItemCreate, DenItemUpdate, generate_slug
from datetime import datetime, timezone
import uuid

router = APIRouter(prefix="/den-items", tags=["den-items"])

db = None

def set_db(database):
    global db
    db = database


@router.get("", response_model=List[DenItem])
async def get_den_items(item_type: Optional[str] = None, include_archived: bool = False):
    """Get all den items, optionally filtered by type"""
    query = {}
    if item_type:
        query["item_type"] = item_type
    if not include_archived:
        query["is_archived"] = {"$ne": True}
    
    items = await db.den_items.find(query, {"_id": 0}).to_list(1000)
    
    for item in items:
        if isinstance(item.get('created_at'), str):
            item['created_at'] = datetime.fromisoformat(item['created_at'])
        if isinstance(item.get('updated_at'), str):
            item['updated_at'] = datetime.fromisoformat(item['updated_at'])
    
    # Sort: featured first, then by sort_order, then by created_at
    items.sort(key=lambda x: (
        not x.get('featured', False),
        x.get('sort_order', 999),
        x.get('created_at', datetime.min)
    ))
    
    return items


@router.get("/by-slug/{slug}", response_model=DenItem)
async def get_den_item_by_slug(slug: str):
    """Get a specific den item by slug (for landing pages)"""
    item = await db.den_items.find_one({"slug": slug, "is_archived": {"$ne": True}}, {"_id": 0})
    if not item:
        raise HTTPException(status_code=404, detail="Product not found")
    
    if isinstance(item.get('created_at'), str):
        item['created_at'] = datetime.fromisoformat(item['created_at'])
    if isinstance(item.get('updated_at'), str):
        item['updated_at'] = datetime.fromisoformat(item['updated_at'])
    
    return item


@router.get("/{item_id}", response_model=DenItem)
async def get_den_item(item_id: str):
    """Get a specific den item by ID"""
    item = await db.den_items.find_one({"id": item_id}, {"_id": 0})
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    if isinstance(item.get('created_at'), str):
        item['created_at'] = datetime.fromisoformat(item['created_at'])
    if isinstance(item.get('updated_at'), str):
        item['updated_at'] = datetime.fromisoformat(item['updated_at'])
    
    return item


@router.post("", response_model=DenItem)
async def create_den_item(item_data: DenItemCreate):
    """Create a new den item"""
    item_dict = item_data.model_dump()
    
    # Auto-generate slug if not provided
    if not item_dict.get('slug'):
        item_dict['slug'] = generate_slug(item_dict['title'])
    
    # Ensure slug is unique
    existing = await db.den_items.find_one({"slug": item_dict['slug']}, {"_id": 0})
    if existing:
        # Append a random suffix
        item_dict['slug'] = f"{item_dict['slug']}-{str(uuid.uuid4())[:6]}"
    
    item = DenItem(**item_dict)
    
    doc = item.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['updated_at'] = doc['updated_at'].isoformat()
    
    await db.den_items.insert_one(doc)
    return item


@router.put("/{item_id}", response_model=DenItem)
async def update_den_item(item_id: str, item_data: DenItemUpdate):
    """Update an existing den item"""
    existing = await db.den_items.find_one({"id": item_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Item not found")
    
    update_data = item_data.model_dump(exclude_unset=True)
    update_data['updated_at'] = datetime.now(timezone.utc).isoformat()
    
    await db.den_items.update_one(
        {"id": item_id},
        {"$set": update_data}
    )
    
    updated = await db.den_items.find_one({"id": item_id}, {"_id": 0})
    if isinstance(updated.get('created_at'), str):
        updated['created_at'] = datetime.fromisoformat(updated['created_at'])
    if isinstance(updated.get('updated_at'), str):
        updated['updated_at'] = datetime.fromisoformat(updated['updated_at'])
    
    return updated


@router.delete("/{item_id}")
async def delete_den_item(item_id: str, permanent: bool = False):
    """Delete (archive) a den item"""
    existing = await db.den_items.find_one({"id": item_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Item not found")
    
    if permanent:
        result = await db.den_items.delete_one({"id": item_id})
        return {"message": "Item permanently deleted"}
    else:
        await db.den_items.update_one(
            {"id": item_id},
            {"$set": {"is_archived": True, "updated_at": datetime.now(timezone.utc).isoformat()}}
        )
        return {"message": "Item archived"}
