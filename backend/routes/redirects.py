from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import RedirectResponse
from pydantic import BaseModel, validator
from typing import Optional, List, Literal
from datetime import datetime, timezone
import uuid
import re

router = APIRouter(prefix="/redirects", tags=["redirects"])

db = None

def set_db(database):
    global db
    db = database


# ============ MODELS ============

class RedirectRuleCreate(BaseModel):
    from_path: str
    to_url: str
    status_code: int = 301
    match_type: Literal["EXACT", "PREFIX"] = "EXACT"
    preserve_query: bool = True
    priority: int = 100
    is_enabled: bool = True
    note: Optional[str] = None

    @validator('from_path')
    def validate_from_path(cls, v):
        if not v.startswith('/'):
            raise ValueError('from_path must start with /')
        return v.rstrip('/') or '/'  # Normalize: remove trailing slash except for root

    @validator('to_url')
    def validate_to_url(cls, v):
        if not (v.startswith('https://') or v.startswith('http://') or v.startswith('/')):
            raise ValueError('to_url must be an absolute URL (https://...) or root-relative path (/...)')
        return v

    @validator('status_code')
    def validate_status_code(cls, v):
        if v not in [301, 302]:
            raise ValueError('status_code must be 301 or 302')
        return v


class RedirectRuleUpdate(BaseModel):
    from_path: Optional[str] = None
    to_url: Optional[str] = None
    status_code: Optional[int] = None
    match_type: Optional[Literal["EXACT", "PREFIX"]] = None
    preserve_query: Optional[bool] = None
    priority: Optional[int] = None
    is_enabled: Optional[bool] = None
    note: Optional[str] = None

    @validator('from_path')
    def validate_from_path(cls, v):
        if v is not None and not v.startswith('/'):
            raise ValueError('from_path must start with /')
        return v.rstrip('/') or '/' if v else v

    @validator('to_url')
    def validate_to_url(cls, v):
        if v is not None and not (v.startswith('https://') or v.startswith('http://') or v.startswith('/')):
            raise ValueError('to_url must be an absolute URL (https://...) or root-relative path (/...)')
        return v

    @validator('status_code')
    def validate_status_code(cls, v):
        if v is not None and v not in [301, 302]:
            raise ValueError('status_code must be 301 or 302')
        return v


class RedirectRule(BaseModel):
    id: str
    from_path: str
    to_url: str
    status_code: int
    match_type: str
    preserve_query: bool
    priority: int
    is_enabled: bool
    note: Optional[str]
    created_at: str
    updated_at: str


# ============ API ENDPOINTS ============

@router.get("/rules", response_model=List[RedirectRule])
async def get_redirect_rules():
    """Get all redirect rules"""
    rules = await db.redirect_rules.find({}, {"_id": 0}).sort([("priority", 1), ("created_at", -1)]).to_list(500)
    return rules


@router.get("/rules/{rule_id}", response_model=RedirectRule)
async def get_redirect_rule(rule_id: str):
    """Get a single redirect rule"""
    rule = await db.redirect_rules.find_one({"id": rule_id}, {"_id": 0})
    if not rule:
        raise HTTPException(status_code=404, detail="Redirect rule not found")
    return rule


@router.post("/rules", response_model=RedirectRule)
async def create_redirect_rule(data: RedirectRuleCreate):
    """Create a new redirect rule"""
    # Check for existing rule with same from_path
    existing = await db.redirect_rules.find_one({"from_path": data.from_path}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail=f"A redirect rule for '{data.from_path}' already exists")

    # Check for redirect loop (simple check - from_path shouldn't match to_url path)
    if data.to_url.startswith('/') and data.from_path == data.to_url:
        raise HTTPException(status_code=400, detail="Redirect loop detected: from_path and to_url cannot be the same")

    rule = {
        "id": str(uuid.uuid4()),
        "from_path": data.from_path,
        "to_url": data.to_url,
        "status_code": data.status_code,
        "match_type": data.match_type,
        "preserve_query": data.preserve_query,
        "priority": data.priority,
        "is_enabled": data.is_enabled,
        "note": data.note,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }

    await db.redirect_rules.insert_one(rule)
    
    created = await db.redirect_rules.find_one({"id": rule["id"]}, {"_id": 0})
    return created


@router.put("/rules/{rule_id}", response_model=RedirectRule)
async def update_redirect_rule(rule_id: str, data: RedirectRuleUpdate):
    """Update a redirect rule"""
    existing = await db.redirect_rules.find_one({"id": rule_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Redirect rule not found")

    update_data = data.dict(exclude_unset=True)
    
    # Check for duplicate if from_path is being changed
    if 'from_path' in update_data:
        duplicate = await db.redirect_rules.find_one({
            "from_path": update_data['from_path'],
            "id": {"$ne": rule_id}
        }, {"_id": 0})
        if duplicate:
            raise HTTPException(status_code=400, detail=f"A redirect rule for '{update_data['from_path']}' already exists")

    update_data['updated_at'] = datetime.now(timezone.utc).isoformat()

    await db.redirect_rules.update_one(
        {"id": rule_id},
        {"$set": update_data}
    )

    updated = await db.redirect_rules.find_one({"id": rule_id}, {"_id": 0})
    return updated


@router.delete("/rules/{rule_id}")
async def delete_redirect_rule(rule_id: str):
    """Delete a redirect rule"""
    result = await db.redirect_rules.delete_one({"id": rule_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Redirect rule not found")
    return {"message": "Redirect rule deleted"}


@router.put("/rules/{rule_id}/toggle")
async def toggle_redirect_rule(rule_id: str):
    """Toggle a redirect rule's enabled status"""
    existing = await db.redirect_rules.find_one({"id": rule_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Redirect rule not found")

    new_status = not existing.get('is_enabled', True)
    
    await db.redirect_rules.update_one(
        {"id": rule_id},
        {"$set": {
            "is_enabled": new_status,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }}
    )

    return {"is_enabled": new_status}


# ============ REDIRECT MIDDLEWARE FUNCTION ============

# Skip these paths from redirect processing
SKIP_PATHS = ['/api', '/admin', '/studio-access', '/_next', '/assets', '/static']
SKIP_FILES = ['robots.txt', 'sitemap.xml', 'favicon.ico']


async def check_redirect(request_path: str, query_string: str = "") -> Optional[dict]:
    """
    Check if a redirect rule matches the request path.
    Returns redirect info dict or None if no match.
    Called by middleware.
    """
    if db is None:
        return None

    # Normalize path
    normalized_path = request_path.rstrip('/') or '/'

    # Skip certain paths
    for skip in SKIP_PATHS:
        if normalized_path.startswith(skip):
            return None
    
    # Skip certain files
    if any(normalized_path.endswith(f) or normalized_path == f'/{f}' for f in SKIP_FILES):
        return None

    try:
        # Find matching enabled redirect rules
        # First try EXACT match
        exact_match = await db.redirect_rules.find_one({
            "is_enabled": True,
            "match_type": "EXACT",
            "from_path": normalized_path
        }, {"_id": 0})

        if exact_match:
            target_url = exact_match['to_url']
            if exact_match['preserve_query'] and query_string:
                separator = '&' if '?' in target_url else '?'
                target_url = f"{target_url}{separator}{query_string}"
            return {
                "url": target_url,
                "status_code": exact_match['status_code']
            }

        # Try PREFIX match (find longest matching prefix with lowest priority)
        prefix_matches = await db.redirect_rules.find({
            "is_enabled": True,
            "match_type": "PREFIX"
        }, {"_id": 0}).sort([("priority", 1)]).to_list(100)

        best_match = None
        best_prefix_len = 0

        for rule in prefix_matches:
            prefix = rule['from_path']
            if normalized_path.startswith(prefix):
                if len(prefix) > best_prefix_len:
                    best_prefix_len = len(prefix)
                    best_match = rule

        if best_match:
            # For prefix matches, append the remaining path
            remaining = normalized_path[len(best_match['from_path']):]
            target_url = best_match['to_url'] + remaining
            
            if best_match['preserve_query'] and query_string:
                separator = '&' if '?' in target_url else '?'
                target_url = f"{target_url}{separator}{query_string}"
            
            return {
                "url": target_url,
                "status_code": best_match['status_code']
            }

        return None

    except Exception as e:
        # Fail open - don't break the site
        print(f"Redirect check error: {e}")
        return None
