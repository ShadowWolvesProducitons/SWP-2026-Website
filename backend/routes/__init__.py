from .films import router as films_router, set_db as set_films_db
from .admin import router as admin_router
from .upload import router as upload_router

__all__ = ["films_router", "admin_router", "upload_router", "set_films_db"]
