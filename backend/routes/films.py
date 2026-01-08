from fastapi import APIRouter, HTTPException, UploadFile, File
from typing import List
from models.film import Film, FilmCreate, FilmUpdate
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


@router.get("", response_model=List[Film])
async def get_films():
    """Get all films, sorted by featured first, then by created_at"""
    films = await db.films.find({}, {"_id": 0}).to_list(1000)
    
    # Convert datetime strings back to datetime objects
    for film in films:
        if isinstance(film.get('created_at'), str):
            film['created_at'] = datetime.fromisoformat(film['created_at'])
        if isinstance(film.get('updated_at'), str):
            film['updated_at'] = datetime.fromisoformat(film['updated_at'])
    
    # Sort: featured first, then by created_at descending
    films.sort(key=lambda x: (not x.get('featured', False), x.get('created_at', datetime.min)), reverse=False)
    films.sort(key=lambda x: not x.get('featured', False))
    
    return films


@router.get("/{film_id}", response_model=Film)
async def get_film(film_id: str):
    """Get a specific film by ID"""
    film = await db.films.find_one({"id": film_id}, {"_id": 0})
    if not film:
        raise HTTPException(status_code=404, detail="Film not found")
    
    if isinstance(film.get('created_at'), str):
        film['created_at'] = datetime.fromisoformat(film['created_at'])
    if isinstance(film.get('updated_at'), str):
        film['updated_at'] = datetime.fromisoformat(film['updated_at'])
    
    return film


@router.post("", response_model=Film)
async def create_film(film_data: FilmCreate):
    """Create a new film"""
    film_dict = film_data.model_dump()
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
    update_data['updated_at'] = datetime.now(timezone.utc).isoformat()
    
    await db.films.update_one(
        {"id": film_id},
        {"$set": update_data}
    )
    
    # Fetch and return updated film
    updated = await db.films.find_one({"id": film_id}, {"_id": 0})
    if isinstance(updated.get('created_at'), str):
        updated['created_at'] = datetime.fromisoformat(updated['created_at'])
    if isinstance(updated.get('updated_at'), str):
        updated['updated_at'] = datetime.fromisoformat(updated['updated_at'])
    
    return updated


@router.delete("/{film_id}")
async def delete_film(film_id: str):
    """Delete a film"""
    result = await db.films.delete_one({"id": film_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Film not found")
    return {"message": "Film deleted successfully"}
