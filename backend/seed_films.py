"""Seed script to populate initial film data from mock"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from pathlib import Path
import os
import uuid
from datetime import datetime, timezone

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Initial film data (migrated from frontend mock.js)
SEED_FILMS = [
    {
        "id": str(uuid.uuid4()),
        "title": "Midnight Eclipse",
        "status": "In Development",
        "featured": True,
        "poster_url": None,
        "poster_color": "#8B0000",
        "logline": "Some secrets should stay buried.",
        "synopsis": "A psychological thriller that follows a detective's descent into madness as she investigates a series of murders that mirror an ancient prophecy.\n\nSet against the backdrop of a city shrouded in perpetual twilight, the line between reality and nightmare blurs as she confronts her own demons.\n\nWhat begins as a routine investigation becomes a journey into the darkest corners of the human psyche.",
        "themes": ["Trauma", "Identity", "Fear", "Madness"],
        "imdb_url": "https://www.imdb.com/title/tt0000001",
        "watch_url": None,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "id": str(uuid.uuid4()),
        "title": "The Last Horizon",
        "status": "In Production",
        "featured": True,
        "poster_url": None,
        "poster_color": "#1a4d6f",
        "logline": "In a world without sky, hope becomes rebellion.",
        "synopsis": "In a post-apocalyptic world where humanity has retreated underground, a group of explorers ventures to the surface seeking a new home.\n\nWhat they discover challenges everything they believed about their past and future. The surface holds truths that were meant to stay hidden.\n\nTheir journey becomes a reckoning with the choices that led humanity to the depths.",
        "themes": ["Hope", "Discovery", "Survival", "Legacy"],
        "imdb_url": "https://www.imdb.com/title/tt0000002",
        "watch_url": None,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "id": str(uuid.uuid4()),
        "title": "Crimson Oath",
        "status": "Released",
        "featured": False,
        "poster_url": None,
        "poster_color": "#5a0000",
        "logline": "Loyalty has a price, and someone always pays.",
        "synopsis": "Two rival families control the city's underworld, bound by an ancient oath that was meant to keep peace.\n\nWhen a new generation seeks to break free from the cycle of violence, they must confront the ghosts of their past.\n\nBut some oaths are written in blood, and breaking them comes at a cost no one is prepared to pay.",
        "themes": ["Loyalty", "Betrayal", "Legacy", "Violence"],
        "imdb_url": "https://www.imdb.com/title/tt0000003",
        "watch_url": None,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "id": str(uuid.uuid4()),
        "title": "Whispers in the Dark",
        "status": "In Development",
        "featured": False,
        "poster_url": None,
        "poster_color": "#0f0f1a",
        "logline": "The house remembers what you tried to forget.",
        "synopsis": "A paranormal investigator returns to her childhood home after her sister's mysterious disappearance.\n\nAs she uncovers dark family secrets, she realizes the house has been waiting for her return. Every room holds a memory, and some memories refuse to stay buried.\n\nThe investigation becomes personal as the line between the living and the dead blurs.",
        "themes": ["Grief", "Family", "Secrets", "Haunting"],
        "imdb_url": "https://www.imdb.com/title/tt0000004",
        "watch_url": None,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "id": str(uuid.uuid4()),
        "title": "Golden Age",
        "status": "In Production",
        "featured": True,
        "poster_url": None,
        "poster_color": "#D4AF37",
        "logline": "Art worth making is art worth fighting for.",
        "synopsis": "The inspiring true story of a visionary filmmaker who revolutionized cinema in the 1960s, battling industry giants and societal prejudice.\n\nAgainst impossible odds, they fought to create art that would change the world forever. Every frame was a rebellion, every cut a statement.\n\nThis is the story of what it takes to leave a legacy that outlives you.",
        "themes": ["Ambition", "Art", "Resistance", "Vision"],
        "imdb_url": "https://www.imdb.com/title/tt0000005",
        "watch_url": None,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "id": str(uuid.uuid4()),
        "title": "Shadow Protocol",
        "status": "Released",
        "featured": False,
        "poster_url": None,
        "poster_color": "#1a1a2e",
        "logline": "The truth doesn't set you free — it destroys you.",
        "synopsis": "An elite intelligence operative discovers a conspiracy that reaches the highest levels of government.\n\nRacing against time, she must decide between following orders and exposing the truth. Every ally becomes a suspect, every mission a trap.\n\nIn a world built on lies, the truth is the most dangerous weapon.",
        "themes": ["Conspiracy", "Truth", "Power", "Sacrifice"],
        "imdb_url": "https://www.imdb.com/title/tt0000006",
        "watch_url": None,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
]


async def seed_database():
    """Seed the database with initial film data"""
    mongo_url = os.environ['MONGO_URL']
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ['DB_NAME']]
    
    # Check if films already exist
    existing_count = await db.films.count_documents({})
    if existing_count > 0:
        print(f"Database already contains {existing_count} films. Skipping seed.")
        print("To re-seed, first clear the films collection.")
        client.close()
        return
    
    # Insert seed data
    result = await db.films.insert_many(SEED_FILMS)
    print(f"Successfully seeded {len(result.inserted_ids)} films into the database.")
    
    client.close()


if __name__ == "__main__":
    asyncio.run(seed_database())
