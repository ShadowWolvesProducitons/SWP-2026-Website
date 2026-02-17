from fastapi import APIRouter, Response
from fastapi.responses import PlainTextResponse
from datetime import datetime
import os

router = APIRouter(prefix="/seo", tags=["seo"])

db = None

def set_db(database):
    global db
    db = database

# Get base URL from environment or default
def get_base_url():
    # In production, this should be set to the actual domain
    return os.environ.get('SITE_URL', 'https://shadowwolvesproductions.com')

@router.get("/robots.txt", response_class=PlainTextResponse)
async def get_robots_txt():
    """Serve robots.txt for search engine crawlers"""
    base_url = get_base_url()
    content = f"""# Shadow Wolves Productions - Robots.txt
User-agent: *
Allow: /

# Disallow admin and private routes
Disallow: /admin
Disallow: /admin/*
Disallow: /studio-access
Disallow: /studio-access/*
Disallow: /api
Disallow: /api/*

# Allow specific public API endpoints if needed
# Allow: /api/films
# Allow: /api/blog

Sitemap: {base_url}/sitemap.xml
"""
    return Response(content=content, media_type="text/plain")


@router.get("/sitemap.xml", response_class=PlainTextResponse)
async def get_sitemap_xml():
    """Generate dynamic sitemap.xml based on database content"""
    base_url = get_base_url()
    
    # Static pages
    static_pages = [
        {"loc": "/", "priority": "1.0", "changefreq": "weekly"},
        {"loc": "/films", "priority": "0.9", "changefreq": "weekly"},
        {"loc": "/armory", "priority": "0.8", "changefreq": "weekly"},
        {"loc": "/blog", "priority": "0.8", "changefreq": "daily"},
        {"loc": "/work-with-us", "priority": "0.7", "changefreq": "monthly"},
    ]
    
    # Dynamic film pages
    film_urls = []
    if db is not None:
        try:
            films = await db.films.find(
                {"is_archived": {"$ne": True}},
                {"slug": 1, "updated_at": 1, "_id": 0}
            ).to_list(1000)
            for film in films:
                if film.get("slug"):
                    film_urls.append({
                        "loc": f"/films/{film['slug']}",
                        "lastmod": film.get("updated_at", datetime.now()).strftime("%Y-%m-%d") if isinstance(film.get("updated_at"), datetime) else datetime.now().strftime("%Y-%m-%d"),
                        "priority": "0.8",
                        "changefreq": "monthly"
                    })
        except Exception as e:
            print(f"Error fetching films for sitemap: {e}")
    
    # Dynamic blog post pages (published only)
    blog_urls = []
    if db is not None:
        try:
            posts = await db.blog_posts.find(
                {"status": "Published", "is_archived": {"$ne": True}},
                {"slug": 1, "updated_at": 1, "_id": 0}
            ).to_list(1000)
            for post in posts:
                if post.get("slug"):
                    blog_urls.append({
                        "loc": f"/blog/{post['slug']}",
                        "lastmod": post.get("updated_at", datetime.now()).strftime("%Y-%m-%d") if isinstance(post.get("updated_at"), datetime) else datetime.now().strftime("%Y-%m-%d"),
                        "priority": "0.7",
                        "changefreq": "weekly"
                    })
        except Exception as e:
            print(f"Error fetching blog posts for sitemap: {e}")
    
    # Dynamic armory product pages (published only)
    armory_urls = []
    if db is not None:
        try:
            items = await db.den_items.find(
                {"is_archived": {"$ne": True}},
                {"slug": 1, "updated_at": 1, "_id": 0}
            ).to_list(1000)
            for item in items:
                if item.get("slug"):
                    armory_urls.append({
                        "loc": f"/armory/{item['slug']}",
                        "lastmod": item.get("updated_at", datetime.now()).strftime("%Y-%m-%d") if isinstance(item.get("updated_at"), datetime) else datetime.now().strftime("%Y-%m-%d"),
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
