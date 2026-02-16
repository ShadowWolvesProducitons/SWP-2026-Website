from fastapi import APIRouter, HTTPException, UploadFile, File
from typing import List
from models.film import Film, FilmCreate, FilmUpdate, generate_slug
from datetime import datetime, timezone
import uuid
import os
import shutil
from pathlib import Path

router = APIRouter(prefix="/films", tags=["films"])

# Will be set from server.py
db = None

def set_db(database):
    global db
    db = database


def process_film_dates(film: dict) -> dict:
    """Convert datetime strings back to datetime objects"""
    if isinstance(film.get('created_at'), str):
        film['created_at'] = datetime.fromisoformat(film['created_at'])
    if isinstance(film.get('updated_at'), str):
        film['updated_at'] = datetime.fromisoformat(film['updated_at'])
    return film


async def ensure_unique_slug(slug: str, exclude_id: str = None) -> str:
    """Ensure slug is unique, append number if necessary"""
    base_slug = slug
    counter = 1
    while True:
        query = {"slug": slug}
        if exclude_id:
            query["id"] = {"$ne": exclude_id}
        existing = await db.films.find_one(query)
        if not existing:
            return slug
        slug = f"{base_slug}-{counter}"
        counter += 1


@router.get("", response_model=List[Film])
async def get_films():
    """Get all films, sorted by featured first, then by created_at"""
    films = await db.films.find({}, {"_id": 0}).to_list(100)
    
    for film in films:
        process_film_dates(film)
    
    # Sort: featured first, then by created_at descending
    films.sort(key=lambda x: (not x.get('featured', False), x.get('created_at', datetime.min)), reverse=False)
    films.sort(key=lambda x: not x.get('featured', False))
    
    return films


@router.get("/by-slug/{slug}")
async def get_film_by_slug(slug: str):
    """Get a specific film by slug (for public pages)"""
    film = await db.films.find_one({"slug": slug}, {"_id": 0})
    if not film:
        raise HTTPException(status_code=404, detail="Film not found")
    
    process_film_dates(film)
    return film


@router.get("/{film_id}", response_model=Film)
async def get_film(film_id: str):
    """Get a specific film by ID"""
    film = await db.films.find_one({"id": film_id}, {"_id": 0})
    if not film:
        raise HTTPException(status_code=404, detail="Film not found")
    
    process_film_dates(film)
    return film


@router.post("", response_model=Film)
async def create_film(film_data: FilmCreate):
    """Create a new film"""
    film_dict = film_data.model_dump()
    
    # Auto-generate slug if not provided
    if not film_dict.get('slug'):
        film_dict['slug'] = generate_slug(film_dict['title'])
    
    # Ensure slug is unique
    film_dict['slug'] = await ensure_unique_slug(film_dict['slug'])
    
    film = Film(**film_dict)
    
    # Convert to dict for MongoDB
    doc = film.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['updated_at'] = doc['updated_at'].isoformat()
    
    await db.films.insert_one(doc)
    return film


@router.put("/{film_id}", response_model=Film)
async def update_film(film_id: str, film_data: FilmUpdate):
    """Update an existing film"""
    existing = await db.films.find_one({"id": film_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Film not found")
    
    # Only update provided fields
    update_data = film_data.model_dump(exclude_unset=True)
    
    # If title changed and no slug provided, regenerate slug
    if 'title' in update_data and 'slug' not in update_data:
        update_data['slug'] = generate_slug(update_data['title'])
        update_data['slug'] = await ensure_unique_slug(update_data['slug'], exclude_id=film_id)
    elif 'slug' in update_data:
        update_data['slug'] = await ensure_unique_slug(update_data['slug'], exclude_id=film_id)
    
    update_data['updated_at'] = datetime.now(timezone.utc).isoformat()
    
    await db.films.update_one(
        {"id": film_id},
        {"$set": update_data}
    )
    
    # Fetch and return updated film
    updated = await db.films.find_one({"id": film_id}, {"_id": 0})
    process_film_dates(updated)
    return updated


@router.delete("/{film_id}")
async def delete_film(film_id: str):
    """Delete a film"""
    result = await db.films.delete_one({"id": film_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Film not found")
    return {"message": "Film deleted successfully"}


@router.post("/{film_id}/regenerate-slug")
async def regenerate_slug(film_id: str):
    """Regenerate slug from title"""
    film = await db.films.find_one({"id": film_id}, {"_id": 0})
    if not film:
        raise HTTPException(status_code=404, detail="Film not found")
    
    new_slug = generate_slug(film['title'])
    new_slug = await ensure_unique_slug(new_slug, exclude_id=film_id)
    
    await db.films.update_one(
        {"id": film_id},
        {"$set": {"slug": new_slug, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    return {"slug": new_slug}
