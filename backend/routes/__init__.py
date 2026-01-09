from .films import router as films_router, set_db as set_films_db
from .admin import router as admin_router
from .upload import router as upload_router
from .den_items import router as den_items_router, set_db as set_den_items_db
from .blog_posts import router as blog_posts_router, set_db as set_blog_posts_db

__all__ = [
    "films_router", "admin_router", "upload_router", 
    "den_items_router", "blog_posts_router",
    "set_films_db", "set_den_items_db", "set_blog_posts_db"
]
