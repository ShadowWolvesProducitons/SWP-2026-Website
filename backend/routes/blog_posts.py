from fastapi import APIRouter, HTTPException
from typing import List, Optional
from models.blog_post import BlogPost, BlogPostCreate, BlogPostUpdate, generate_slug
from datetime import datetime, timezone
import uuid

router = APIRouter(prefix="/blog", tags=["blog"])

db = None

def set_db(database):
    global db
    db = database


@router.get("", response_model=List[BlogPost])
async def get_blog_posts(status: Optional[str] = None, include_archived: bool = False):
    """Get all blog posts, optionally filtered by status"""
    query = {}
    if status:
        query["status"] = status
    if not include_archived:
        query["is_archived"] = {"$ne": True}
    
    # Optimized: exclude large content field for list view, limit to 200
    posts = await db.blog_posts.find(query, {"_id": 0, "content": 0}).to_list(200)
    
    for post in posts:
        if isinstance(post.get('created_at'), str):
            post['created_at'] = datetime.fromisoformat(post['created_at'])
        if isinstance(post.get('updated_at'), str):
            post['updated_at'] = datetime.fromisoformat(post['updated_at'])
        if isinstance(post.get('published_at'), str):
            post['published_at'] = datetime.fromisoformat(post['published_at'])
    
    # Sort: published_at descending for published, created_at for drafts
    posts.sort(key=lambda x: x.get('published_at') or x.get('created_at', datetime.min), reverse=True)
    
    return posts


@router.get("/slug/{slug}", response_model=BlogPost)
async def get_blog_post_by_slug(slug: str):
    """Get a blog post by slug (for public pages)"""
    post = await db.blog_posts.find_one({"slug": slug, "status": "Published", "is_archived": {"$ne": True}}, {"_id": 0})
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    if isinstance(post.get('created_at'), str):
        post['created_at'] = datetime.fromisoformat(post['created_at'])
    if isinstance(post.get('updated_at'), str):
        post['updated_at'] = datetime.fromisoformat(post['updated_at'])
    if isinstance(post.get('published_at'), str):
        post['published_at'] = datetime.fromisoformat(post['published_at'])
    
    return post


@router.get("/{post_id}", response_model=BlogPost)
async def get_blog_post(post_id: str):
    """Get a specific blog post by ID (for admin)"""
    post = await db.blog_posts.find_one({"id": post_id}, {"_id": 0})
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    if isinstance(post.get('created_at'), str):
        post['created_at'] = datetime.fromisoformat(post['created_at'])
    if isinstance(post.get('updated_at'), str):
        post['updated_at'] = datetime.fromisoformat(post['updated_at'])
    if isinstance(post.get('published_at'), str):
        post['published_at'] = datetime.fromisoformat(post['published_at'])
    
    return post


@router.post("", response_model=BlogPost)
async def create_blog_post(post_data: BlogPostCreate):
    """Create a new blog post"""
    post_dict = post_data.model_dump()
    
    # Auto-generate slug if not provided
    if not post_dict.get('slug'):
        post_dict['slug'] = generate_slug(post_dict['title'])
    
    # Check slug uniqueness
    existing = await db.blog_posts.find_one({"slug": post_dict['slug']}, {"_id": 0})
    if existing:
        post_dict['slug'] = f"{post_dict['slug']}-{str(uuid.uuid4())[:8]}"
    
    # Set published_at if publishing
    if post_dict.get('status') == 'Published' and not post_dict.get('published_at'):
        post_dict['published_at'] = datetime.now(timezone.utc)
    
    post = BlogPost(**post_dict)
    
    doc = post.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['updated_at'] = doc['updated_at'].isoformat()
    if doc.get('published_at'):
        doc['published_at'] = doc['published_at'].isoformat()
    
    await db.blog_posts.insert_one(doc)
    return post


@router.put("/{post_id}", response_model=BlogPost)
async def update_blog_post(post_id: str, post_data: BlogPostUpdate):
    """Update an existing blog post"""
    existing = await db.blog_posts.find_one({"id": post_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Post not found")
    
    update_data = post_data.model_dump(exclude_unset=True)
    update_data['updated_at'] = datetime.now(timezone.utc).isoformat()
    
    # Auto-set published_at when publishing
    if update_data.get('status') == 'Published' and existing.get('status') != 'Published':
        if not update_data.get('published_at'):
            update_data['published_at'] = datetime.now(timezone.utc).isoformat()
    
    # Handle published_at serialization
    if update_data.get('published_at') and isinstance(update_data['published_at'], datetime):
        update_data['published_at'] = update_data['published_at'].isoformat()
    
    await db.blog_posts.update_one(
        {"id": post_id},
        {"$set": update_data}
    )
    
    updated = await db.blog_posts.find_one({"id": post_id}, {"_id": 0})
    if isinstance(updated.get('created_at'), str):
        updated['created_at'] = datetime.fromisoformat(updated['created_at'])
    if isinstance(updated.get('updated_at'), str):
        updated['updated_at'] = datetime.fromisoformat(updated['updated_at'])
    if isinstance(updated.get('published_at'), str):
        updated['published_at'] = datetime.fromisoformat(updated['published_at'])
    
    return updated


@router.delete("/{post_id}")
async def delete_blog_post(post_id: str, permanent: bool = False):
    """Delete (archive) a blog post"""
    existing = await db.blog_posts.find_one({"id": post_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Post not found")
    
    if permanent:
        await db.blog_posts.delete_one({"id": post_id})
        return {"message": "Post permanently deleted"}
    else:
        await db.blog_posts.update_one(
            {"id": post_id},
            {"$set": {"is_archived": True, "updated_at": datetime.now(timezone.utc).isoformat()}}
        )
        return {"message": "Post archived"}
