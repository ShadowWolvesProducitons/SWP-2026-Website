from fastapi import FastAPI, APIRouter
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List
import uuid
from datetime import datetime, timezone

# Import routes
from routes import (
    films_router, admin_router, upload_router, 
    den_items_router, blog_posts_router,
    set_films_db, set_den_items_db, set_blog_posts_db
)
from routes.upload import set_db as set_upload_db
from routes.submissions import router as submissions_router, set_db as set_submissions_db
from routes.investors import router as investors_router, set_db as set_investors_db
from routes.newsletter import router as newsletter_router, set_db as set_newsletter_db
from routes.contact import router as contact_router, set_db as set_contact_db
from routes.email_templates import router as email_templates_router, set_db as set_email_templates_db
from routes.ai import router as ai_router, set_db as set_ai_db
from routes.analytics import router as analytics_router, set_db as set_analytics_db
from routes.webhooks import router as webhooks_router, set_db as set_webhooks_db
from routes.assets import router as assets_router, set_db as set_assets_db
from routes.site_settings import router as site_settings_router, set_db as set_site_settings_db


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Set database for routes
set_films_db(db)
set_den_items_db(db)
set_blog_posts_db(db)
set_submissions_db(db)
set_investors_db(db)
set_newsletter_db(db)
set_contact_db(db)
set_email_templates_db(db)
set_analytics_db(db)
set_webhooks_db(db)
set_assets_db(db)
set_upload_db(db)
set_ai_db(db)
set_site_settings_db(db)

# Create the main app
app = FastAPI(title="Shadow Wolves Productions API")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str


# Basic routes
@api_router.get("/")
async def root():
    return {"message": "Shadow Wolves Productions API"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.model_dump()
    status_obj = StatusCheck(**status_dict)
    
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    
    _ = await db.status_checks.insert_one(doc)
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    
    return status_checks


# Include all routers
api_router.include_router(films_router)
api_router.include_router(admin_router)
api_router.include_router(upload_router)
api_router.include_router(den_items_router)
api_router.include_router(blog_posts_router)
api_router.include_router(submissions_router)
api_router.include_router(investors_router)
api_router.include_router(newsletter_router)
api_router.include_router(contact_router)
api_router.include_router(email_templates_router)
api_router.include_router(ai_router)
api_router.include_router(analytics_router)
api_router.include_router(webhooks_router)
api_router.include_router(assets_router)

# Include the main API router
app.include_router(api_router)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
