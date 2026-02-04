from fastapi import APIRouter, HTTPException
from typing import List, Optional
from models.email_template import EmailTemplate, EmailTemplateCreate, EmailTemplateUpdate
from datetime import datetime, timezone

router = APIRouter(prefix="/email-templates", tags=["email-templates"])

db = None

def set_db(database):
    global db
    db = database


# Default templates to seed if none exist
DEFAULT_TEMPLATES = [
    {
        "name": "welcome_email",
        "display_name": "Newsletter Welcome Email",
        "subject": "Welcome to Shadow Wolves Productions",
        "description": "Sent to new newsletter subscribers",
        "html_content": """<h1 style="color: #ffffff; font-size: 24px; margin-bottom: 20px;">Welcome to the Pack</h1>
<p style="color: #9ca3af; line-height: 1.6;">
    You've joined the Shadow Wolves mailing list. You'll be the first to hear about new projects, 
    releases, and behind-the-scenes updates.
</p>
<p style="color: #9ca3af; line-height: 1.6; margin-top: 20px;">
    We don't spam. We only reach out when we have something worth saying.
</p>
<p style="color: #233dff; margin-top: 30px;">— Shadow Wolves Productions</p>"""
    },
    {
        "name": "contact_notification",
        "display_name": "Contact Form Notification",
        "subject": "New Contact: {{name}} - {{service}}",
        "description": "Sent to admin when someone submits the contact form. Variables: {{name}}, {{email}}, {{phone}}, {{service}}, {{message}}",
        "html_content": """<h1 style="color: #ffffff; font-size: 24px; margin-bottom: 20px;">New Contact Message</h1>
<p style="color: #9ca3af; line-height: 1.6;">
    A new message has been received through the website contact form.
</p>

<div style="background: #1a1a1a; border: 1px solid #333; border-radius: 8px; padding: 20px; margin: 20px 0;">
    <p style="color: #ffffff; margin: 8px 0;"><strong>Name:</strong> {{name}}</p>
    <p style="color: #ffffff; margin: 8px 0;"><strong>Email:</strong> {{email}}</p>
    <p style="color: #ffffff; margin: 8px 0;"><strong>Phone:</strong> {{phone}}</p>
    <p style="color: #ffffff; margin: 8px 0;"><strong>Project Type:</strong> {{service}}</p>
</div>

<div style="background: #1a1a1a; border: 1px solid #333; border-radius: 8px; padding: 20px; margin: 20px 0;">
    <p style="color: #9ca3af; margin-bottom: 8px;"><strong>Message:</strong></p>
    <p style="color: #ffffff; white-space: pre-wrap;">{{message}}</p>
</div>

<p style="color: #233dff; margin-top: 30px;">— Shadow Wolves Productions</p>"""
    },
    {
        "name": "submission_notification",
        "display_name": "Work With Us Notification",
        "subject": "New Submission: {{submission_type}} from {{name}}",
        "description": "Sent to admin for new project submissions. Variables: {{name}}, {{email}}, {{role}}, {{submission_type}}, {{genres}}, {{project_stage}}, {{logline}}, {{external_link}}, {{message}}",
        "html_content": """<h1 style="color: #ffffff; font-size: 24px; margin-bottom: 20px;">New Submission Received</h1>
<p style="color: #9ca3af; line-height: 1.6;">
    A new project submission has been received through the Work With Us form.
</p>

<div style="background: #1a1a1a; border: 1px solid #333; border-radius: 8px; padding: 20px; margin: 20px 0;">
    <p style="color: #ffffff; margin: 8px 0;"><strong>Name:</strong> {{name}}</p>
    <p style="color: #ffffff; margin: 8px 0;"><strong>Email:</strong> {{email}}</p>
    <p style="color: #ffffff; margin: 8px 0;"><strong>Role:</strong> {{role}}</p>
    <p style="color: #ffffff; margin: 8px 0;"><strong>Type:</strong> {{submission_type}}</p>
    <p style="color: #ffffff; margin: 8px 0;"><strong>Genres:</strong> {{genres}}</p>
    <p style="color: #ffffff; margin: 8px 0;"><strong>Stage:</strong> {{project_stage}}</p>
</div>

<div style="background: #1a1a1a; border: 1px solid #333; border-radius: 8px; padding: 20px; margin: 20px 0;">
    <p style="color: #233dff; font-weight: bold; margin-bottom: 8px;">Logline:</p>
    <p style="color: #ffffff; font-style: italic;">"{{logline}}"</p>
</div>

<p style="color: #233dff; margin-top: 30px;">— Shadow Wolves Productions</p>"""
    },
    {
        "name": "investor_inquiry_notification",
        "display_name": "Investor Inquiry Notification",
        "subject": "New Investor Inquiry: {{name}}",
        "description": "Sent to admin for new investor inquiries. Variables: {{name}}, {{email}}, {{investor_type}}, {{area_of_interest}}, {{message}}",
        "html_content": """<h1 style="color: #ffffff; font-size: 24px; margin-bottom: 20px;">New Investor Inquiry</h1>
<p style="color: #9ca3af; line-height: 1.6;">
    A new expression of interest has been submitted through the Investor Portal.
</p>

<div style="background: #1a1a1a; border: 1px solid #333; border-radius: 8px; padding: 20px; margin: 20px 0;">
    <p style="color: #ffffff; margin: 8px 0;"><strong>Name:</strong> {{name}}</p>
    <p style="color: #ffffff; margin: 8px 0;"><strong>Email:</strong> {{email}}</p>
    <p style="color: #ffffff; margin: 8px 0;"><strong>Investor Type:</strong> {{investor_type}}</p>
    <p style="color: #ffffff; margin: 8px 0;"><strong>Area of Interest:</strong> {{area_of_interest}}</p>
</div>

<div style="background: #1a1a1a; border: 1px solid #333; border-radius: 8px; padding: 20px; margin: 20px 0;">
    <p style="color: #9ca3af; margin-bottom: 8px;"><strong>Message:</strong></p>
    <p style="color: #ffffff; white-space: pre-wrap;">{{message}}</p>
</div>

<p style="color: #233dff; margin-top: 30px;">— Shadow Wolves Productions</p>"""
    },
    {
        "name": "newsletter_campaign",
        "display_name": "Newsletter Campaign Template",
        "subject": "{{subject}}",
        "description": "Base template for bulk newsletter emails. Variables: {{content}}",
        "html_content": """{{content}}

<hr style="border: none; border-top: 1px solid #333; margin: 30px 0;" />
<p style="color: #666; font-size: 12px; text-align: center;">
    You received this email because you subscribed to Shadow Wolves Productions newsletter.
    <br />
    <a href="#" style="color: #233dff;">Unsubscribe</a>
</p>"""
    }
]


async def ensure_default_templates():
    """Create default templates if they don't exist"""
    for template_data in DEFAULT_TEMPLATES:
        existing = await db.email_templates.find_one({"name": template_data["name"]})
        if not existing:
            template = EmailTemplate(**template_data)
            doc = template.model_dump()
            doc['created_at'] = doc['created_at'].isoformat()
            doc['updated_at'] = doc['updated_at'].isoformat()
            await db.email_templates.insert_one(doc)
            print(f"Created default email template: {template_data['name']}")


@router.get("", response_model=List[EmailTemplate])
async def get_templates():
    """Get all email templates"""
    # Ensure defaults exist
    await ensure_default_templates()
    
    templates = await db.email_templates.find({}, {"_id": 0}).to_list(100)
    
    for t in templates:
        if isinstance(t.get('created_at'), str):
            t['created_at'] = datetime.fromisoformat(t['created_at'])
        if isinstance(t.get('updated_at'), str):
            t['updated_at'] = datetime.fromisoformat(t['updated_at'])
    
    return templates


@router.get("/{template_name}")
async def get_template_by_name(template_name: str):
    """Get a specific template by name"""
    template = await db.email_templates.find_one({"name": template_name}, {"_id": 0})
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    
    if isinstance(template.get('created_at'), str):
        template['created_at'] = datetime.fromisoformat(template['created_at'])
    if isinstance(template.get('updated_at'), str):
        template['updated_at'] = datetime.fromisoformat(template['updated_at'])
    
    return template


@router.put("/{template_id}", response_model=EmailTemplate)
async def update_template(template_id: str, update_data: EmailTemplateUpdate):
    """Update an email template"""
    existing = await db.email_templates.find_one({"id": template_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Template not found")
    
    update_dict = update_data.model_dump(exclude_unset=True)
    update_dict['updated_at'] = datetime.now(timezone.utc).isoformat()
    
    await db.email_templates.update_one(
        {"id": template_id},
        {"$set": update_dict}
    )
    
    updated = await db.email_templates.find_one({"id": template_id}, {"_id": 0})
    if isinstance(updated.get('created_at'), str):
        updated['created_at'] = datetime.fromisoformat(updated['created_at'])
    if isinstance(updated.get('updated_at'), str):
        updated['updated_at'] = datetime.fromisoformat(updated['updated_at'])
    
    return updated


@router.post("/reset/{template_name}")
async def reset_template(template_name: str):
    """Reset a template to its default content"""
    default = next((t for t in DEFAULT_TEMPLATES if t["name"] == template_name), None)
    if not default:
        raise HTTPException(status_code=404, detail="No default template found for this name")
    
    await db.email_templates.update_one(
        {"name": template_name},
        {"$set": {
            "subject": default["subject"],
            "html_content": default["html_content"],
            "updated_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    return {"message": f"Template '{template_name}' reset to default"}


@router.post("/preview")
async def preview_template(template_name: str, variables: dict = {}):
    """Preview a template with sample variables"""
    template = await db.email_templates.find_one({"name": template_name}, {"_id": 0})
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    
    # Replace variables in subject and content
    subject = template['subject']
    content = template['html_content']
    
    for key, value in variables.items():
        placeholder = "{{" + key + "}}"
        subject = subject.replace(placeholder, str(value))
        content = content.replace(placeholder, str(value))
    
    return {
        "subject": subject,
        "html_content": content
    }
