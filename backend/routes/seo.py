from fastapi import APIRouter, Response, HTTPException
from fastapi.responses import PlainTextResponse
from datetime import datetime
import os

router = APIRouter(prefix="/seo", tags=["seo"])

db = None

def set_db(database):
    global db
    db = database

# Default SEO settings (fallback)
DEFAULT_SEO = {
    "global_seo": {
        "site_name": "Shadow Wolves Productions",
        "site_url": "https://shadowwolvesproductions.com",
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

async def get_seo_settings():
    """Fetch SEO settings from database or return defaults"""
    if db is None:
        return DEFAULT_SEO
    
    settings = await db.site_settings.find_one({"type": "global"}, {"_id": 0})
    if not settings or "seo" not in settings:
        return DEFAULT_SEO
    
    # Merge with defaults
    seo = settings["seo"]
    for key in DEFAULT_SEO:
        if key not in seo:
            seo[key] = DEFAULT_SEO[key]
    return seo

def get_base_url(seo_settings):
    """Get base URL from settings or environment"""
    if seo_settings.get("global_seo", {}).get("site_url"):
        return seo_settings["global_seo"]["site_url"].rstrip("/")
    return os.environ.get('SITE_URL', 'https://shadowwolvesproductions.com').rstrip("/")

@router.get("/robots.txt", response_class=PlainTextResponse)
async def get_robots_txt():
    """Serve robots.txt for search engine crawlers - reads from admin settings"""
    seo = await get_seo_settings()
    robots_settings = seo.get("robots", DEFAULT_SEO["robots"])
    base_url = get_base_url(seo)
    
    # If custom override exists, use that
    if robots_settings.get("robots_custom_override"):
        return Response(content=robots_settings["robots_custom_override"], media_type="text/plain")
    
    # Build robots.txt from settings
    lines = ["# Shadow Wolves Productions - Robots.txt", "User-agent: *"]
    
    if robots_settings.get("robots_allow_all", True):
        lines.append("Allow: /")
    else:
        lines.append("Disallow: /")
    
    lines.append("")
    lines.append("# Disallowed paths")
    
    # Parse disallow paths (one per line)
    disallow_paths = robots_settings.get("robots_disallow_paths", "")
    if disallow_paths:
        for path in disallow_paths.strip().split("\n"):
            path = path.strip()
            if path:
                lines.append(f"Disallow: {path}")
    
    # Always disallow these core paths regardless of settings
    core_disallows = ["/admin", "/admin/*", "/studio-access", "/studio-access/*", "/api", "/api/*"]
    for path in core_disallows:
        if f"Disallow: {path}" not in lines:
            lines.append(f"Disallow: {path}")
    
    lines.append("")
    lines.append(f"Sitemap: {base_url}/sitemap.xml")
    
    return Response(content="\n".join(lines), media_type="text/plain")


@router.get("/sitemap.xml", response_class=PlainTextResponse)
async def get_sitemap_xml():
    """Generate dynamic sitemap.xml based on database content and admin settings"""
    seo = await get_seo_settings()
    sitemap_settings = seo.get("sitemap", DEFAULT_SEO["sitemap"])
    
    # Check if sitemap is enabled
    if not sitemap_settings.get("sitemap_enabled", True):
        raise HTTPException(status_code=404, detail="Sitemap is disabled")
    
    base_url = get_base_url(seo)
    
    # Static pages always included
    static_pages = [
        {"loc": "/", "priority": "1.0", "changefreq": "weekly"},
        {"loc": "/films", "priority": "0.9", "changefreq": "weekly"},
        {"loc": "/armory", "priority": "0.8", "changefreq": "weekly"},
        {"loc": "/blog", "priority": "0.8", "changefreq": "daily"},
        {"loc": "/work-with-us", "priority": "0.7", "changefreq": "monthly"},
    ]
    
    # Dynamic film pages
    film_urls = []
    if sitemap_settings.get("include_films", True) and db is not None:
        try:
            query = {}
            if sitemap_settings.get("exclude_archived", True):
                query["is_archived"] = {"$ne": True}
            
            films = await db.films.find(query, {"slug": 1, "updated_at": 1, "_id": 0}).to_list(1000)
            for film in films:
                if film.get("slug"):
                    lastmod = datetime.now().strftime("%Y-%m-%d")
                    if isinstance(film.get("updated_at"), datetime):
                        lastmod = film["updated_at"].strftime("%Y-%m-%d")
                    film_urls.append({
                        "loc": f"/films/{film['slug']}",
                        "lastmod": lastmod,
                        "priority": "0.8",
                        "changefreq": "monthly"
                    })
        except Exception as e:
            print(f"Error fetching films for sitemap: {e}")
    
    # Dynamic blog post pages
    blog_urls = []
    if sitemap_settings.get("include_blog", True) and db is not None:
        try:
            query = {}
            if sitemap_settings.get("exclude_drafts", True):
                query["status"] = "Published"
            if sitemap_settings.get("exclude_archived", True):
                query["is_archived"] = {"$ne": True}
            
            posts = await db.blog_posts.find(query, {"slug": 1, "updated_at": 1, "_id": 0}).to_list(1000)
            for post in posts:
                if post.get("slug"):
                    lastmod = datetime.now().strftime("%Y-%m-%d")
                    if isinstance(post.get("updated_at"), datetime):
                        lastmod = post["updated_at"].strftime("%Y-%m-%d")
                    blog_urls.append({
                        "loc": f"/blog/{post['slug']}",
                        "lastmod": lastmod,
                        "priority": "0.7",
                        "changefreq": "weekly"
                    })
        except Exception as e:
            print(f"Error fetching blog posts for sitemap: {e}")
    
    # Dynamic armory product pages
    armory_urls = []
    if sitemap_settings.get("include_armory", True) and db is not None:
        try:
            query = {}
            if sitemap_settings.get("exclude_archived", True):
                query["is_archived"] = {"$ne": True}
            
            items = await db.den_items.find(query, {"slug": 1, "updated_at": 1, "_id": 0}).to_list(1000)
            for item in items:
                if item.get("slug"):
                    lastmod = datetime.now().strftime("%Y-%m-%d")
                    if isinstance(item.get("updated_at"), datetime):
                        lastmod = item["updated_at"].strftime("%Y-%m-%d")
                    armory_urls.append({
                        "loc": f"/armory/{item['slug']}",
                        "lastmod": lastmod,
                        "priority": "0.6",
                        "changefreq": "monthly"
                    })
        except Exception as e:
            print(f"Error fetching armory items for sitemap: {e}")
    
    # Build sitemap XML
    xml_parts = ['<?xml version="1.0" encoding="UTF-8"?>']
    xml_parts.append('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')
    
    # Add all URLs
    all_urls = static_pages + film_urls + blog_urls + armory_urls
    for url in all_urls:
        xml_parts.append("  <url>")
        xml_parts.append(f"    <loc>{base_url}{url['loc']}</loc>")
        if url.get("lastmod"):
            xml_parts.append(f"    <lastmod>{url['lastmod']}</lastmod>")
        if url.get("changefreq"):
            xml_parts.append(f"    <changefreq>{url['changefreq']}</changefreq>")
        if url.get("priority"):
            xml_parts.append(f"    <priority>{url['priority']}</priority>")
        xml_parts.append("  </url>")
    
    xml_parts.append("</urlset>")
    
    return Response(content="\n".join(xml_parts), media_type="application/xml")
