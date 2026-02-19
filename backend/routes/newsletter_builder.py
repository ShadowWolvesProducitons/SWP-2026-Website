from fastapi import APIRouter, HTTPException, BackgroundTasks
from typing import List, Optional
from models.newsletter_issue import NewsletterIssue, NewsletterIssueCreate, NewsletterIssueUpdate
from datetime import datetime, timezone
import os
import asyncio

router = APIRouter(prefix="/newsletter-builder", tags=["newsletter-builder"])

db = None

def set_db(database):
    global db
    db = database


# Master HTML template for newsletters
NEWSLETTER_MASTER_TEMPLATE = '''<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>{{subject}}</title>
  <!--[if mso]>
  <xml>
    <o:OfficeDocumentSettings>
      <o:AllowPNG/>
      <o:PixelsPerInch>96</o:PixelsPerInch>
    </o:OfficeDocumentSettings>
  </xml>
  <![endif]-->
</head>
<body style="margin:0;padding:0;background:#07080B;color:#E8EAF0;">
  <!-- Hidden preheader text -->
  <div style="display:none;font-size:1px;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;mso-hide:all;">
    {{preheader}}
  </div>

  <!-- Full width wrapper -->
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#07080B;">
    <tr>
      <td align="center" style="padding:18px 12px;">
        <!-- Container -->
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="width:600px;max-width:600px;">
          
          <!-- View in browser -->
          <tr>
            <td align="center" style="padding:0 0 10px 0;">
              <a href="{{viewInBrowserUrl}}" style="font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:16px;color:#9AA3B2;text-decoration:underline;">
                View this email in your browser
              </a>
            </td>
          </tr>

          <!-- Header Image -->
          <tr>
            <td style="padding:0;">
              <img src="{{headerImageUrl}}" width="600" alt="THE DEN — Shadow Wolves Productions" style="display:block;width:100%;max-width:600px;height:auto;border:0;outline:none;text-decoration:none;border-radius:14px;">
            </td>
          </tr>

          <!-- Spacer -->
          <tr><td style="height:18px;line-height:18px;font-size:18px;">&nbsp;</td></tr>

          <!-- Top meta line -->
          <tr>
            <td style="padding:0 6px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td align="left" style="font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:16px;color:#9AA3B2;">
                    {{issueLabel}}
                  </td>
                  <td align="right" style="font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:16px;color:#9AA3B2;">
                    {{dateLabel}}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Spacer -->
          <tr><td style="height:10px;line-height:10px;font-size:10px;">&nbsp;</td></tr>

          <!-- HERO / Title block -->
          {{heroSection}}

          <!-- Spacer -->
          <tr><td style="height:14px;line-height:14px;font-size:14px;">&nbsp;</td></tr>

          <!-- CONTENT BLOCKS -->
          {{contentBlocks}}

          <!-- Spacer -->
          <tr><td style="height:16px;line-height:16px;font-size:16px;">&nbsp;</td></tr>

          <!-- Studio Access CTA block -->
          {{studioCta}}

          <!-- Spacer -->
          <tr><td style="height:16px;line-height:16px;font-size:16px;">&nbsp;</td></tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding:0 12px 28px 12px;">
              <div style="font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:18px;color:#9AA3B2;">
                <strong style="color:#E8EAF0;">Shadow Wolves Productions</strong><br>
                Sydney, Australia
              </div>

              <div style="height:10px;line-height:10px;font-size:10px;">&nbsp;</div>

              <div style="font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:18px;color:#9AA3B2;">
                <a href="{{instagramUrl}}" style="color:#9AA3B2;text-decoration:underline;">Instagram</a>
                &nbsp; • &nbsp;
                <a href="{{youtubeUrl}}" style="color:#9AA3B2;text-decoration:underline;">YouTube</a>
                &nbsp; • &nbsp;
                <a href="{{imdbUrl}}" style="color:#9AA3B2;text-decoration:underline;">IMDb</a>
              </div>

              <div style="height:12px;line-height:12px;font-size:12px;">&nbsp;</div>

              <div style="font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:18px;color:#9AA3B2;">
                <a href="{{unsubscribeUrl}}" style="color:#9AA3B2;text-decoration:underline;">Unsubscribe</a>
              </div>

              <div style="height:14px;line-height:14px;font-size:14px;">&nbsp;</div>

              <div style="font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:16px;color:#6F788A;">
                You're receiving this because you subscribed to The Den updates.
              </div>
            </td>
          </tr>

        </table>
        <!-- /Container -->
      </td>
    </tr>
  </table>
  <!-- /Wrapper -->
</body>
</html>'''


def render_hero_section(issue: dict) -> str:
    """Render the hero/intro section"""
    if not issue.get('hero_title') and not issue.get('hero_intro'):
        return ''
    
    return f'''<tr>
  <td style="padding:22px 22px 18px 22px;background:#0C0E14;border:1px solid #1A1F2B;border-radius:14px;">
    <div style="font-family:Georgia,'Times New Roman',serif;font-size:26px;line-height:32px;color:#F2F3F7;font-weight:700;letter-spacing:0.5px;">
      {issue.get('hero_title', '')}
    </div>
    <div style="height:10px;line-height:10px;font-size:10px;">&nbsp;</div>
    <div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:22px;color:#C7CDDA;">
      {issue.get('hero_intro', '')}
    </div>
    <div style="height:14px;line-height:14px;font-size:14px;">&nbsp;</div>
    <div style="font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:16px;color:#9AA3B2;">
      {issue.get('hero_chips', '')}
    </div>
  </td>
</tr>'''


def render_main_story_block(block: dict) -> str:
    """Render a main story block"""
    cta_html = ''
    if block.get('cta_url') and block.get('cta_text'):
        cta_html = f'''<table role="presentation" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td bgcolor="#2F62FF" style="border-radius:999px;">
              <a href="{block['cta_url']}" style="display:inline-block;padding:12px 18px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:16px;color:#FFFFFF;text-decoration:none;border-radius:999px;font-weight:700;">
                {block['cta_text']}
              </a>
            </td>
          </tr>
        </table>
        <div style="height:10px;line-height:10px;font-size:10px;">&nbsp;</div>
        <div style="font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:18px;color:#9AA3B2;">
          {block.get('cta_microcopy', '')}
        </div>'''
    
    image_html = ''
    if block.get('image_url'):
        image_html = f'''<tr>
          <td style="padding:18px 18px 0 18px;">
            <img src="{block['image_url']}" width="564" alt="{block.get('image_alt', '')}" style="display:block;width:100%;height:auto;border:0;outline:none;text-decoration:none;border-radius:12px;">
          </td>
        </tr>'''
    
    return f'''<tr>
  <td style="padding:0;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#0A0C11;border:1px solid #161B25;border-radius:14px;">
      {image_html}
      <tr>
        <td style="padding:16px 22px 6px 22px;">
          <div style="font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:16px;color:#9AA3B2;text-transform:uppercase;letter-spacing:1px;">
            {block.get('eyebrow', '')}
          </div>
          <div style="height:8px;line-height:8px;font-size:8px;">&nbsp;</div>
          <div style="font-family:Georgia,'Times New Roman',serif;font-size:20px;line-height:26px;color:#F2F3F7;font-weight:700;">
            {block.get('headline', '')}
          </div>
          <div style="height:10px;line-height:10px;font-size:10px;">&nbsp;</div>
          <div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:22px;color:#C7CDDA;">
            {block.get('body', '')}
          </div>
        </td>
      </tr>
      <tr>
        <td style="padding:12px 22px 20px 22px;">
          {cta_html}
        </td>
      </tr>
    </table>
  </td>
</tr>
<tr><td style="height:14px;line-height:14px;font-size:14px;">&nbsp;</td></tr>'''


def render_image_text_block(block: dict, is_left: bool = True) -> str:
    """Render an image+text card block"""
    link_html = ''
    if block.get('link_url') and block.get('link_text'):
        link_html = f'''<div style="height:10px;line-height:10px;font-size:10px;">&nbsp;</div>
            <a href="{block['link_url']}" style="font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:18px;color:#2F62FF;text-decoration:underline;font-weight:700;">
              {block['link_text']}
            </a>'''
    
    image_html = ''
    if block.get('image_url'):
        image_html = f'''<tr>
          <td style="padding:16px 16px 0 16px;">
            <img src="{block['image_url']}" width="268" alt="{block.get('image_alt', '')}" style="display:block;width:100%;height:auto;border-radius:12px;border:0;">
          </td>
        </tr>'''
    
    return f'''<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#0A0C11;border:1px solid #161B25;border-radius:14px;">
      {image_html}
      <tr>
        <td style="padding:14px 18px 18px 18px;">
          <div style="font-family:Georgia,'Times New Roman',serif;font-size:16px;line-height:22px;color:#F2F3F7;font-weight:700;">
            {block.get('title', '')}
          </div>
          <div style="height:8px;line-height:8px;font-size:8px;">&nbsp;</div>
          <div style="font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:20px;color:#C7CDDA;">
            {block.get('body', '')}
          </div>
          {link_html}
        </td>
      </tr>
    </table>'''


def render_simple_text_block(block: dict) -> str:
    """Render a simple text block"""
    headline_html = ''
    if block.get('headline'):
        headline_html = f'''<div style="font-family:Georgia,'Times New Roman',serif;font-size:18px;line-height:24px;color:#F2F3F7;font-weight:700;">
          {block['headline']}
        </div>
        <div style="height:10px;line-height:10px;font-size:10px;">&nbsp;</div>'''
    
    return f'''<tr>
  <td style="padding:22px;background:#0C0E14;border:1px solid #1A1F2B;border-radius:14px;">
    {headline_html}
    <div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:22px;color:#C7CDDA;">
      {block.get('body', '')}
    </div>
  </td>
</tr>
<tr><td style="height:14px;line-height:14px;font-size:14px;">&nbsp;</td></tr>'''


def render_two_up_blocks(blocks: list) -> str:
    """Render two image_text blocks side by side"""
    if len(blocks) < 2:
        return ''
    
    left_block = render_image_text_block(blocks[0], True)
    right_block = render_image_text_block(blocks[1], False)
    
    return f'''<tr>
  <td style="padding:0;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
      <tr>
        <td width="50%" valign="top" style="padding-right:7px;">
          {left_block}
        </td>
        <td width="50%" valign="top" style="padding-left:7px;">
          {right_block}
        </td>
      </tr>
    </table>
  </td>
</tr>
<tr><td style="height:14px;line-height:14px;font-size:14px;">&nbsp;</td></tr>'''


def render_studio_cta(show: bool, request_access_url: str) -> str:
    """Render the studio access CTA block"""
    if not show:
        return ''
    
    return f'''<tr>
  <td style="padding:22px;background:#0C0E14;border:1px solid #1A1F2B;border-radius:14px;">
    <div style="font-family:Georgia,'Times New Roman',serif;font-size:18px;line-height:24px;color:#F2F3F7;font-weight:700;">
      Want full access?
    </div>
    <div style="height:8px;line-height:8px;font-size:8px;">&nbsp;</div>
    <div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:22px;color:#C7CDDA;">
      Access to pitch decks, scripts, and studio updates is available through Studio Access.
    </div>
    <div style="height:14px;line-height:14px;font-size:14px;">&nbsp;</div>
    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td bgcolor="#2F62FF" style="border-radius:999px;">
          <a href="{request_access_url}" style="display:inline-block;padding:12px 18px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:16px;color:#FFFFFF;text-decoration:none;border-radius:999px;font-weight:700;">
            Request Access
          </a>
        </td>
      </tr>
    </table>
  </td>
</tr>'''


def render_content_blocks(blocks: list) -> str:
    """Render all content blocks"""
    html_parts = []
    i = 0
    
    while i < len(blocks):
        block = blocks[i]
        block_type = block.get('type', '')
        
        if block_type == 'main_story':
            html_parts.append(render_main_story_block(block))
            i += 1
        elif block_type == 'image_text':
            # Check if next block is also image_text for two-up layout
            if i + 1 < len(blocks) and blocks[i + 1].get('type') == 'image_text':
                html_parts.append(render_two_up_blocks([blocks[i], blocks[i + 1]]))
                i += 2
            else:
                # Single image_text block - render full width
                single_html = render_image_text_block(block)
                html_parts.append(f'<tr><td style="padding:0;">{single_html}</td></tr><tr><td style="height:14px;line-height:14px;font-size:14px;">&nbsp;</td></tr>')
                i += 1
        elif block_type == 'simple_text':
            html_parts.append(render_simple_text_block(block))
            i += 1
        else:
            i += 1
    
    return '\n'.join(html_parts)


def render_newsletter_html(issue: dict, recipient_email: str = None) -> str:
    """Render the complete newsletter HTML from an issue"""
    site_url = os.environ.get('SITE_URL', os.environ.get('FRONTEND_URL', 'https://www.shadowwolvesproductions.com.au'))
    
    # Default URLs
    header_image_url = issue.get('header_image_url') or f"{site_url}/api/upload/images/header-banner.png"
    unsubscribe_url = f"{site_url}/api/newsletter/{recipient_email}" if recipient_email else f"{site_url}/unsubscribe"
    view_in_browser_url = f"{site_url}/newsletter/{issue.get('id', '')}"
    request_access_url = f"{site_url}/request-access"
    
    # Social links
    instagram_url = "https://www.instagram.com/shadowwolvesproductions/"
    youtube_url = "https://www.youtube.com/@shadowwolvesproductions"
    imdb_url = "https://www.imdb.com/company/co0874521/"
    
    # Render sections
    hero_section = render_hero_section(issue)
    content_blocks = render_content_blocks(issue.get('blocks', []))
    studio_cta = render_studio_cta(issue.get('show_studio_cta', True), request_access_url)
    
    # Replace placeholders
    html = NEWSLETTER_MASTER_TEMPLATE
    html = html.replace('{{subject}}', issue.get('subject', ''))
    html = html.replace('{{preheader}}', issue.get('preheader', ''))
    html = html.replace('{{viewInBrowserUrl}}', view_in_browser_url)
    html = html.replace('{{headerImageUrl}}', header_image_url)
    html = html.replace('{{issueLabel}}', issue.get('issue_label', ''))
    html = html.replace('{{dateLabel}}', issue.get('date_label', ''))
    html = html.replace('{{heroSection}}', hero_section)
    html = html.replace('{{contentBlocks}}', content_blocks)
    html = html.replace('{{studioCta}}', studio_cta)
    html = html.replace('{{instagramUrl}}', instagram_url)
    html = html.replace('{{youtubeUrl}}', youtube_url)
    html = html.replace('{{imdbUrl}}', imdb_url)
    html = html.replace('{{unsubscribeUrl}}', unsubscribe_url)
    
    return html


# ============ API ROUTES ============

@router.get("/issues", response_model=List[NewsletterIssue])
async def get_newsletter_issues(status: str = None):
    """Get all newsletter issues, optionally filtered by status"""
    query = {}
    if status:
        query['status'] = status
    
    issues = await db.newsletter_issues.find(query, {"_id": 0}).sort("created_at", -1).to_list(100)
    
    for issue in issues:
        if isinstance(issue.get('created_at'), str):
            issue['created_at'] = datetime.fromisoformat(issue['created_at'])
        if isinstance(issue.get('updated_at'), str):
            issue['updated_at'] = datetime.fromisoformat(issue['updated_at'])
        if isinstance(issue.get('sent_at'), str):
            issue['sent_at'] = datetime.fromisoformat(issue['sent_at'])
    
    return issues


@router.get("/issues/{issue_id}")
async def get_newsletter_issue(issue_id: str):
    """Get a specific newsletter issue by ID"""
    issue = await db.newsletter_issues.find_one({"id": issue_id}, {"_id": 0})
    if not issue:
        raise HTTPException(status_code=404, detail="Newsletter issue not found")
    
    if isinstance(issue.get('created_at'), str):
        issue['created_at'] = datetime.fromisoformat(issue['created_at'])
    if isinstance(issue.get('updated_at'), str):
        issue['updated_at'] = datetime.fromisoformat(issue['updated_at'])
    
    return issue


@router.post("/issues", response_model=NewsletterIssue)
async def create_newsletter_issue(issue_data: NewsletterIssueCreate):
    """Create a new newsletter issue (draft)"""
    issue = NewsletterIssue(**issue_data.model_dump())
    
    doc = issue.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['updated_at'] = doc['updated_at'].isoformat()
    
    await db.newsletter_issues.insert_one(doc)
    
    created = await db.newsletter_issues.find_one({"id": issue.id}, {"_id": 0})
    if isinstance(created.get('created_at'), str):
        created['created_at'] = datetime.fromisoformat(created['created_at'])
    if isinstance(created.get('updated_at'), str):
        created['updated_at'] = datetime.fromisoformat(created['updated_at'])
    
    return created


@router.put("/issues/{issue_id}", response_model=NewsletterIssue)
async def update_newsletter_issue(issue_id: str, update_data: NewsletterIssueUpdate):
    """Update a newsletter issue"""
    existing = await db.newsletter_issues.find_one({"id": issue_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Newsletter issue not found")
    
    if existing.get('status') == 'sent':
        raise HTTPException(status_code=400, detail="Cannot edit a sent newsletter")
    
    update_dict = update_data.model_dump(exclude_unset=True)
    update_dict['updated_at'] = datetime.now(timezone.utc).isoformat()
    
    await db.newsletter_issues.update_one(
        {"id": issue_id},
        {"$set": update_dict}
    )
    
    updated = await db.newsletter_issues.find_one({"id": issue_id}, {"_id": 0})
    if isinstance(updated.get('created_at'), str):
        updated['created_at'] = datetime.fromisoformat(updated['created_at'])
    if isinstance(updated.get('updated_at'), str):
        updated['updated_at'] = datetime.fromisoformat(updated['updated_at'])
    
    return updated


@router.delete("/issues/{issue_id}")
async def delete_newsletter_issue(issue_id: str):
    """Delete a newsletter issue"""
    existing = await db.newsletter_issues.find_one({"id": issue_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Newsletter issue not found")
    
    await db.newsletter_issues.delete_one({"id": issue_id})
    return {"message": "Newsletter issue deleted"}


@router.post("/issues/{issue_id}/preview")
async def preview_newsletter(issue_id: str):
    """Generate preview HTML for a newsletter issue"""
    issue = await db.newsletter_issues.find_one({"id": issue_id}, {"_id": 0})
    if not issue:
        raise HTTPException(status_code=404, detail="Newsletter issue not found")
    
    html = render_newsletter_html(issue, "preview@example.com")
    return {"html": html}


@router.post("/issues/{issue_id}/send")
async def send_newsletter(issue_id: str, test_email: str = None):
    """Send newsletter to subscribers or a test email"""
    issue = await db.newsletter_issues.find_one({"id": issue_id}, {"_id": 0})
    if not issue:
        raise HTTPException(status_code=404, detail="Newsletter issue not found")
    
    resend_api_key = os.environ.get('RESEND_API_KEY')
    if not resend_api_key:
        raise HTTPException(status_code=500, detail="RESEND_API_KEY not configured")
    
    import resend
    resend.api_key = resend_api_key
    from_email = os.environ.get('FROM_EMAIL', 'onboarding@resend.dev')
    
    # Get recipients
    if test_email:
        recipients = [{"email": test_email}]
    else:
        # Get active subscribers based on segment
        segment = issue.get('segment', 'all')
        if segment == 'all':
            recipients = await db.newsletter.find({"is_active": True}, {"_id": 0, "email": 1}).to_list(5000)
        elif segment == 'portal_users':
            recipients = await db.studio_users.find({"is_active": True}, {"_id": 0, "email": 1}).to_list(5000)
        else:
            recipients = await db.newsletter.find({"is_active": True}, {"_id": 0, "email": 1}).to_list(5000)
    
    if not recipients:
        raise HTTPException(status_code=400, detail="No recipients found")
    
    sent = 0
    failed = 0
    errors = []
    
    for recipient in recipients:
        try:
            email_addr = recipient.get('email')
            html = render_newsletter_html(issue, email_addr)
            
            await asyncio.to_thread(resend.Emails.send, {
                "from": from_email,
                "to": email_addr,
                "subject": issue.get('subject', 'Newsletter'),
                "html": html
            })
            sent += 1
            # Small delay to avoid rate limiting
            await asyncio.sleep(0.1)
        except Exception as e:
            failed += 1
            errors.append(f"{recipient.get('email')}: {str(e)}")
    
    # Update issue status if not test mode
    if not test_email:
        await db.newsletter_issues.update_one(
            {"id": issue_id},
            {"$set": {
                "status": "sent",
                "sent_at": datetime.now(timezone.utc).isoformat(),
                "sent_count": sent
            }}
        )
    
    return {
        "total": len(recipients),
        "sent": sent,
        "failed": failed,
        "errors": errors[:10],
        "test_mode": bool(test_email)
    }


@router.get("/segments")
async def get_segments():
    """Get available audience segments with counts"""
    subscriber_count = await db.newsletter.count_documents({"is_active": True})
    portal_user_count = await db.studio_users.count_documents({"is_active": True})
    
    return {
        "segments": [
            {"id": "all", "label": "All Subscribers", "count": subscriber_count},
            {"id": "portal_users", "label": "Studio Portal Users", "count": portal_user_count}
        ]
    }
