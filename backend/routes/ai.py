from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone
import os
import base64
import uuid
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

router = APIRouter(prefix="/ai", tags=["ai"])

# Database reference (set from server.py)
db = None

def set_db(database):
    global db
    db = database

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
        
        images = await image_gen.generate_images(
            prompt=optimized_prompt,
            model="gpt-image-1",
            number_of_images=1,
            quality="low"
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
        
        # Step 4: Auto-add to asset library
        if db is not None:
            asset = {
                "id": str(uuid.uuid4()),
                "filename": filename,
                "original_name": f"AI Cover: {request.title[:30]}",
                "asset_type": "image",
                "tags": ["ai-generated", "blog", "cover"] + (request.tags or []),
                "visibility": "admin_only",
                "related_project_id": None,
                "notes": f"AI-generated blog cover. Prompt: {optimized_prompt[:200]}...",
                "file_url": image_url,
                "file_size": len(image_bytes),
                "mime_type": "image/png",
                "uploaded_by": "ai",
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            try:
                await db.assets.insert_one(asset)
            except Exception:
                pass  # Non-blocking - image still works if asset save fails
        
        return CoverImageResponse(
            image_url=image_url,
            prompt_used=optimized_prompt
        )
        
    except ImportError as e:
        raise HTTPException(status_code=500, detail=f"Missing dependency: {str(e)}. Please install emergentintegrations.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Image generation failed: {str(e)}")


# ═══════════════════════════════════════════════════════════════
# Product Content AI Generation System
# ═══════════════════════════════════════════════════════════════

PRODUCT_SYSTEM_PROMPT = """You are generating structured product page content for Shadow Wolves Productions' "The Armoury".

Tone: Cinematic, Direct, No fluff, Confident, Short, scannable.

Avoid: Buzzwords like "ultimate" or "revolutionary". Avoid overly long paragraphs. Avoid corporate jargon.

Content logic:
- If type = App → emphasize Features + Core Actions
- If type = Course/Template/Download/eBook → emphasize What You Get + How It Works

SEO rules:
- SEO title must be 60 characters or fewer
- SEO description must be 160 characters or fewer
- Focus keyword naturally included

Return valid JSON only. No markdown code fences, no commentary."""


class ProductContentRequest(BaseModel):
    product_name: str
    product_type: str
    pricing_model: str = "free"
    price: Optional[str] = None
    primary_url: Optional[str] = None
    short_description: str
    who_its_for: Optional[str] = None
    key_outcomes: Optional[str] = None
    tone: Optional[str] = "Cinematic, direct, no fluff"
    constraints: Optional[str] = None


class ProductSectionRequest(BaseModel):
    section: str
    product_name: str
    product_type: str
    existing_content: dict = {}


class ProductSeoRequest(BaseModel):
    title: str
    positioning_line: Optional[str] = ""
    what_this_is: Optional[str] = ""
    tags: Optional[list] = []


def _parse_json_response(text: str) -> dict:
    """Parse JSON from LLM response, handling markdown fences."""
    import json as json_mod
    cleaned = text.strip()
    if cleaned.startswith("```"):
        lines = cleaned.split("\n")
        lines = [l for l in lines if not l.strip().startswith("```")]
        cleaned = "\n".join(lines).strip()
    try:
        return json_mod.loads(cleaned)
    except Exception:
        start = cleaned.find("{")
        end = cleaned.rfind("}") + 1
        if start >= 0 and end > start:
            return json_mod.loads(cleaned[start:end])
        raise


async def _get_chat(api_key: str):
    from emergentintegrations.llm.openai import LlmChat
    chat = LlmChat(
        api_key=api_key,
        session_id=str(uuid.uuid4()),
        system_message=PRODUCT_SYSTEM_PROMPT,
    )
    return chat.with_model(provider="openai", model="gpt-4o-mini")


@router.post("/generate-product-content")
async def generate_product_content(request: ProductContentRequest):
    """Generate full product page content using AI."""
    api_key = os.environ.get("EMERGENT_LLM_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="EMERGENT_LLM_KEY not configured")

    is_app = request.product_type == "Apps"
    type_specific = (
        '"features": ["feature 1", "feature 2", ...], "core_actions": ["step 1", "step 2", ...],'
        if is_app
        else '"what_you_get": ["item 1", "item 2", ...], "how_it_works": ["step 1", "step 2", ...],'
    )

    user_prompt = f"""Generate complete product page content for:

Product Name: {request.product_name}
Product Type: {request.product_type}
Pricing: {request.pricing_model}{f' — {request.price}' if request.price else ''}
{f'URL: {request.primary_url}' if request.primary_url else ''}
Description: {request.short_description}
{f'Target Audience: {request.who_its_for}' if request.who_its_for else ''}
{f'Key Outcomes: {request.key_outcomes}' if request.key_outcomes else ''}
{f'Tone: {request.tone}' if request.tone and request.tone != 'Cinematic, direct, no fluff' else ''}
{f'Constraints: {request.constraints}' if request.constraints else ''}

Return JSON with exactly these keys:
{{
  "positioning_line": "one punchy line under the product name",
  "what_this_is": "1-2 paragraphs max 600 chars",
  "who_its_for": ["audience 1", "audience 2", "audience 3"],
  {type_specific}
  "how_it_works_notes": "2-3 short clarifying lines",
  "cta_text": "final CTA statement",
  "cta_microcopy": "one line of reassurance",
  "tags": ["tag1", "tag2", ... up to 10 tags],
  "focus_keyword": "primary SEO keyword",
  "seo_title": "max 60 chars",
  "seo_description": "max 160 chars"
}}"""

    try:
        from emergentintegrations.llm.chat import UserMessage

        chat = await _get_chat(api_key)
        response = await chat.send_message(UserMessage(text=user_prompt))
        result = _parse_json_response(response)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI generation failed: {str(e)}")


@router.post("/regenerate-product-section")
async def regenerate_product_section(request: ProductSectionRequest):
    """Regenerate a single section of product page content."""
    api_key = os.environ.get("EMERGENT_LLM_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="EMERGENT_LLM_KEY not configured")

    ctx = request.existing_content
    ctx_str = f"""Product: {request.product_name} ({request.product_type})
Positioning: {ctx.get('short_description', '')}
What it is: {ctx.get('what_it_is', '')[:200]}
Tags: {', '.join(ctx.get('tags', [])[:5])}"""

    section_prompts = {
        "positioning_line": f"Generate ONE punchy positioning line (under 80 chars) for this product.\n{ctx_str}\nReturn JSON: {{\"value\": \"the line\"}}",
        "what_this_is": f"Generate a 1-2 paragraph description (max 600 chars) for this product.\n{ctx_str}\nReturn JSON: {{\"value\": \"the text\"}}",
        "features": f"Generate 4-6 feature bullet points for this product.\n{ctx_str}\nReturn JSON: {{\"value\": [\"feature 1\", ...]}}",
        "what_you_get": f"Generate 4-6 deliverable/outcome bullet points.\n{ctx_str}\nReturn JSON: {{\"value\": [\"item 1\", ...]}}",
        "core_actions": f"Generate 3-5 short action steps.\n{ctx_str}\nReturn JSON: {{\"value\": [\"step 1\", ...]}}",
        "how_it_works": f"Generate 3-5 numbered how-it-works steps.\n{ctx_str}\nReturn JSON: {{\"value\": [\"step 1\", ...]}}",
        "cta": f"Generate a CTA text and microcopy.\n{ctx_str}\nReturn JSON: {{\"cta_text\": \"...\", \"cta_microcopy\": \"...\"}}",
        "focus_keyword": f"Suggest ONE primary SEO keyword.\n{ctx_str}\nReturn JSON: {{\"value\": \"keyword\"}}",
        "seo_title": f"Generate an SEO title (max 60 chars).\n{ctx_str}\nReturn JSON: {{\"value\": \"title\"}}",
        "seo_description": f"Generate an SEO description (max 160 chars).\n{ctx_str}\nReturn JSON: {{\"value\": \"description\"}}",
    }

    prompt = section_prompts.get(request.section)
    if not prompt:
        raise HTTPException(status_code=400, detail=f"Unknown section: {request.section}")

    try:
        from emergentintegrations.llm.chat import UserMessage

        chat = await _get_chat(api_key)
        response = await chat.send_message(UserMessage(text=prompt))
        result = _parse_json_response(response)
        return {"section": request.section, **result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Section regeneration failed: {str(e)}")


# ═══════════════════════════════════════════════════════════════
# Blog SEO AI Generation System
# ═══════════════════════════════════════════════════════════════

BLOG_SEO_SYSTEM_PROMPT = """You are generating SEO, metadata, and content helpers for Shadow Wolves Productions' blog "The Den".

Brand: Shadow Wolves Productions — film production company.
Tone: Dark, cinematic, bold, genre-focused (horror, thriller, drama, indie film).
Audience: Filmmakers, horror fans, indie creators, industry professionals.

Rules:
- Title should be compelling, concise, and attention-grabbing for the brand
- SEO title must be ≤60 characters, compelling and keyword-rich
- Meta description must be ≤160 characters, action-oriented
- Tags should be relevant, lowercase, 3-8 tags
- Keywords should be comma-separated, relevant to content and brand
- Excerpt should be 1-2 sentences, engaging summary for blog previews

Return valid JSON only. No markdown code fences, no commentary."""


class BlogSeoRequest(BaseModel):
    title: str
    content: Optional[str] = ""
    tags: Optional[list] = []
    excerpt: Optional[str] = ""


@router.post("/generate-blog-seo")
async def generate_blog_seo(request: BlogSeoRequest):
    """Generate SEO metadata for a blog post from its content."""
    api_key = os.environ.get("EMERGENT_LLM_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="EMERGENT_LLM_KEY not configured")

    content_preview = request.content[:2000] if request.content else ""
    tags_str = ", ".join(request.tags) if request.tags else "None"

    user_prompt = f"""Generate SEO metadata and content helpers for this blog post:

Title: {request.title}
Existing Tags: {tags_str}
Existing Excerpt: {request.excerpt or 'None'}
Content:
{content_preview}

Return JSON with exactly these keys:
{{
  "seo_title": "max 60 chars, compelling, keyword-rich",
  "seo_description": "max 160 chars, action-oriented meta description",
  "excerpt": "1-2 sentence engaging summary for blog card previews (max 200 chars)",
  "tags": ["tag1", "tag2", ... up to 8 lowercase tags],
  "seo_keywords": "comma-separated keywords for meta keywords tag",
  "cta_text": "compelling call-to-action statement for end of the blog post (e.g. 'Ready to start your next project?')",
  "cta_microcopy": "one line of reassurance or next step below the CTA button (e.g. 'No sign-up required. Start creating today.')"
}}"""

    try:
        from emergentintegrations.llm.openai import LlmChat
        from emergentintegrations.llm.chat import UserMessage

        chat = LlmChat(
            api_key=api_key,
            session_id=str(uuid.uuid4()),
            system_message=BLOG_SEO_SYSTEM_PROMPT,
        )
        chat = chat.with_model(provider="openai", model="gpt-4o-mini")
        response = await chat.send_message(UserMessage(text=user_prompt))
        result = _parse_json_response(response)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Blog SEO generation failed: {str(e)}")


@router.post("/generate-product-seo")
async def generate_product_seo(request: ProductSeoRequest):
    """Generate SEO fields from existing content."""
    api_key = os.environ.get("EMERGENT_LLM_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="EMERGENT_LLM_KEY not configured")

    user_prompt = f"""Generate SEO data for this product page:

Title: {request.title}
Positioning: {request.positioning_line}
Description: {request.what_this_is[:400] if request.what_this_is else ''}
Tags: {', '.join(request.tags[:10]) if request.tags else ''}

Return JSON:
{{
  "focus_keyword": "primary keyword",
  "seo_title": "max 60 chars, include keyword naturally",
  "seo_description": "max 160 chars, compelling meta description"
}}"""

    try:
        from emergentintegrations.llm.chat import UserMessage

        chat = await _get_chat(api_key)
        response = await chat.send_message(UserMessage(text=user_prompt))
        result = _parse_json_response(response)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"SEO generation failed: {str(e)}")

