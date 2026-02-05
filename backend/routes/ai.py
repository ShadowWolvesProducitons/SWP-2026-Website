from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
import os
import base64
import uuid
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

router = APIRouter(prefix="/ai", tags=["ai"])

UPLOAD_DIR = Path(__file__).parent.parent / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)


class CoverImageRequest(BaseModel):
    title: str
    content: Optional[str] = ""
    tags: Optional[list] = []
    excerpt: Optional[str] = ""


class CoverImageResponse(BaseModel):
    image_url: str
    prompt_used: str


# Prompt template for generating cover image prompts
COVER_IMAGE_PROMPT_TEMPLATE = """You are an expert art director and prompt engineer for AI image generation.
Your job: convert the given blog post into ONE best possible cover-image prompt.

INPUT (blog data):
- Title: {title}
- Tags/Categories: {tags}
- Excerpt/Summary: {excerpt}
- Content Preview: {content_preview}

BRAND CONTEXT:
- Brand: Shadow Wolves Productions (film production company)
- Tone: Dark, cinematic, bold, genre-focused (horror, thriller, drama)
- Colors: Black (#0a0a0a), Electric Blue (#233dff), White text
- Aesthetic: Cinematic, moody, high contrast, professional

TASK:
1) Identify the single strongest visual concept that represents the blog post.
2) Choose ONE primary subject and ONE environment/background that communicates the theme instantly.
3) The image should feel like a premium blog hero/cover image - cinematic and visually striking.
4) Avoid literal clichés. Prefer symbolic, cinematic, high-signal imagery.
5) No text, logos, or typography in the image.
6) Leave some negative space on left or top for potential title overlay.

OUTPUT REQUIREMENTS:
- Output ONLY the final image prompt text (no headings, no bullet points, no commentary).
- Include: subject, environment, mood/lighting, style, composition framing.
- Style should be: cinematic photography, dramatic lighting, shallow depth of field, film grain.
- Keep it under 800 characters.
- No copyrighted characters or celebrity likeness.

Generate the cover image prompt now:"""


@router.post("/generate-cover-image", response_model=CoverImageResponse)
async def generate_cover_image(request: CoverImageRequest):
    """Generate an AI cover image for a blog post"""
    
    api_key = os.environ.get('EMERGENT_LLM_KEY')
    if not api_key:
        raise HTTPException(status_code=500, detail="EMERGENT_LLM_KEY not configured")
    
    try:
        # Step 1: Generate optimized prompt using GPT
        from emergentintegrations.llm.openai import LlmChat
        from emergentintegrations.llm.chat import UserMessage
        import uuid as uuid_lib
        
        # Prepare context
        content_preview = request.content[:1500] if request.content else ""
        tags_str = ", ".join(request.tags) if request.tags else "General"
        
        prompt_request = COVER_IMAGE_PROMPT_TEMPLATE.format(
            title=request.title,
            tags=tags_str,
            excerpt=request.excerpt or "",
            content_preview=content_preview
        )
        
        # Create chat instance with required parameters
        chat = LlmChat(
            api_key=api_key,
            session_id=str(uuid_lib.uuid4()),
            system_message="You are an expert art director and prompt engineer for AI image generation."
        )
        chat = chat.with_model(provider="openai", model="gpt-4o-mini")
        
        # Get optimized image prompt using send_message with UserMessage
        user_msg = UserMessage(text=prompt_request)
        optimized_prompt = await chat.send_message(user_msg)
        
        optimized_prompt = optimized_prompt.strip()
        
        # Step 2: Generate image using GPT Image 1 at blog banner size (2240x1290)
        from emergentintegrations.llm.openai.image_generation import OpenAIImageGeneration
        
        image_gen = OpenAIImageGeneration(api_key=api_key)
        
        # Generate at 1792x1024 (closest to 2240x1290 aspect ratio supported by DALL-E)
        # This will be displayed as blog banner
        images = await image_gen.generate_images(
            prompt=optimized_prompt,
            model="gpt-image-1",
            number_of_images=1,
            size="1792x1024"  # Landscape format for blog banner
        )
        
        if not images or len(images) == 0:
            raise HTTPException(status_code=500, detail="No image was generated")
        
        # Step 3: Save image to uploads folder
        image_bytes = images[0]
        filename = f"ai-cover-{uuid.uuid4().hex[:12]}.png"
        filepath = UPLOAD_DIR / filename
        
        with open(filepath, "wb") as f:
            f.write(image_bytes)
        
        # Return the correct API path for serving images
        image_url = f"/api/upload/images/{filename}"
        
        return CoverImageResponse(
            image_url=image_url,
            prompt_used=optimized_prompt
        )
        
    except ImportError as e:
        raise HTTPException(status_code=500, detail=f"Missing dependency: {str(e)}. Please install emergentintegrations.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Image generation failed: {str(e)}")
