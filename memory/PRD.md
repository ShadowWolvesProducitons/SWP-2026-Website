# Shadow Wolves Productions - Studio Access Portal PRD

## Original Problem Statement
Build a comprehensive "Studio Access Portal" and modernize the public-facing website and admin console for Shadow Wolves Productions, an independent film production company.

## Core Requirements

### 1. Studio Access Portal
- Secure, role-based portal for investors and directors
- Self-serve access request flow at `/request-access`
- Login system with email verification
- Dashboard with content gated by user role
- Asset library with watermarked PDFs

### 2. Admin Console
- Streamlined 6-tab navigation: Dashboard, Films, The Armory, The Den, Assets, Studio
- Asset Library with collection-aware folder navigation
- Blog editor with rich text (Tiptap)
- Product management for The Armory
- User management for Studio Portal access
- **NEW: SEO & Indexing Settings** under Studio > SEO

### 3. Public Website
- Films page with route-driven modal (`/films/:slug`)
- The Den (Blog) with SEO optimization
- Work With Us page with FAQ accordion
- SEO foundations (robots.txt, sitemap.xml, JSON-LD schemas)
- Image lazy-loading for performance

## What's Been Implemented

### Completed Features (February 2025)

#### Admin Console Refactor
- [x] 6-tab navigation structure
- [x] Asset Library with folder navigation for all collections (Films, Website, Armory, Den)
- [x] Context-aware folder dropdowns in Edit Asset modal
- [x] Blog content loading fix (fetches full post via individual endpoint)
- [x] Product file upload for Downloads/eBooks in Armory
- [x] User management for Studio Portal

#### Request Access Page
- [x] Scrollable form layout
- [x] Projects filtered by `studio_access_enabled`
- [x] "Other" option with text input
- [x] Fixed scroll issue when accessed from Film Modal (body overflow reset)

#### FAQ Accordion Section
- [x] 12 FAQ items with accordion functionality
- [x] Positioned after CineConnect, before Newsletter
- [x] JSON-LD FAQPage schema for SEO (admin controllable)

#### SEO Admin Controls (NEW)
- [x] **Global SEO Settings**: Site name, URL, meta title template, description, OG image
- [x] **Organization Schema**: Org name, logo, sameAs links, enable/disable Movie & FAQ schemas
- [x] **Robots.txt Settings**: Allow all toggle, disallow paths, custom override
- [x] **Sitemap Settings**: Enable toggle, include films/blog/armory, exclude drafts/archived
- [x] **Test Rich Results**: Button opens Google Rich Results Test
- [x] **Preview links**: Direct links to preview robots.txt and sitemap.xml
- [x] **Production URL Consistency**: All SEO outputs (robots.txt, sitemap.xml, canonicals) use admin-configured production URL
- [x] **Proper URL Slugification**: Blog URLs in sitemap use properly slugified URLs (no spaces)

#### Image Optimization (February 2025)
- [x] Server-side image compression + automatic WebP conversion
- [x] Compression stats in upload response (original_size, compressed_size, savings_percent)
- [x] Option to disable WebP conversion (convert_webp=false parameter)
- [x] Support for JPG, PNG, GIF, BMP, TIFF formats
- [x] Maximum dimension resize (2000px) to prevent oversized images
- [x] Native lazy loading on blog images
- [x] Native lazy loading on product page images
- [x] Native lazy loading on TheDen product cards

#### Dynamic SEO Endpoints
- [x] `/api/seo/robots.txt` - Reads from admin settings, uses production URL
- [x] `/api/seo/sitemap.xml` - Dynamic generation with proper slug URLs
- [x] `/api/site-settings/seo` - GET/PUT for SEO configuration

#### Blog Post Page UI Improvements (February 2025)
- [x] Full-width content layout (removed max-w-3xl restriction)
- [x] Tags styled as rounded chips with electric-blue border
- [x] Canonical URLs use production site URL from settings

### Backlog (P2/P3)
- [ ] Studio Portal User Updates Feed (deferred)
- [ ] E-commerce Integration (Stripe for The Armory)
- [ ] CineConnect Database build-out

## Technical Architecture

### Frontend
- React 18 with React Router v6
- Tailwind CSS + Shadcn/UI components
- react-helmet-async for SEO
- Tiptap rich text editor
- Framer Motion for animations
- **SeoContext** for centralized SEO settings

### Backend
- FastAPI (Python)
- MongoDB with Motor async driver
- JWT authentication
- File upload with watermarking (PyPDF, ReportLab)

### Key Files
- `/app/frontend/src/contexts/SeoContext.jsx` - SEO settings context and helpers
- `/app/frontend/src/components/admin/AdminSeoSettingsTab.jsx` - SEO admin UI
- `/app/frontend/src/pages/WorkWithUs.jsx` - FAQ section
- `/app/frontend/src/components/admin/AdminAssetsTab.jsx` - Asset library
- `/app/backend/routes/seo.py` - Dynamic SEO endpoints
- `/app/backend/routes/site_settings.py` - SEO settings storage
- `/app/backend/services/image_processor.py` - Image compression and WebP conversion
- `/app/backend/routes/upload.py` - Image upload with compression
- `/app/backend/routes/assets.py` - Asset upload with compression

## API Endpoints

### Image Upload
- `POST /api/upload/image` - Upload image with auto compression & WebP conversion
  - `convert_webp` (bool, default: true) - Convert to WebP format
  - Returns: filename, url, original_size, compressed_size, savings_percent, format
- `POST /api/assets` - Upload asset with auto compression & WebP conversion
  - Same `convert_webp` parameter available
  - Returns compression stats in response

### SEO
- `GET /api/seo/robots.txt` - Dynamic robots.txt from settings
- `GET /api/seo/sitemap.xml` - Dynamic sitemap from settings
- `GET /api/site-settings/seo` - Get SEO settings
- `PUT /api/site-settings/seo` - Update SEO settings

### Blog
- `GET /api/blog` - List posts (content excluded)
- `GET /api/blog/{id}` - Full post with content
- `PUT /api/blog/{id}` - Update post

### Assets
- `GET /api/assets` - List all assets
- `PUT /api/assets/{id}` - Update asset metadata

## Database Collections
- `films` - Film projects
- `blog_posts` - The Den articles
- `den_items` - Armory products
- `assets` - File assets with collection/folder metadata
- `studio_users` - Portal user accounts
- `site_settings` - SEO and site configuration (type: "global")

## SEO Settings Schema
```json
{
  "global_seo": {
    "site_name": "string",
    "site_url": "string",
    "default_meta_title_template": "string",
    "default_meta_description": "string",
    "default_og_image_url": "string",
    "focus_keyword_default": "string"
  },
  "organization_schema": {
    "org_name": "string",
    "org_logo_url": "string",
    "org_sameas_links": "string (newline-separated)",
    "enable_movie_schema": "boolean",
    "enable_faq_schema": "boolean"
  },
  "robots": {
    "robots_allow_all": "boolean",
    "robots_disallow_paths": "string (newline-separated)",
    "robots_custom_override": "string"
  },
  "sitemap": {
    "sitemap_enabled": "boolean",
    "include_films": "boolean",
    "include_blog": "boolean",
    "include_armory": "boolean",
    "exclude_drafts": "boolean",
    "exclude_archived": "boolean"
  }
}
```

## Credentials
- Admin URL: `/admin`
- Admin Auth: **Email-based authentication** (no more environment variable passwords!)

## Admin Authentication System (February 2026)

### Overview
Replaced the problematic environment-variable-based password system with a secure email-based authentication flow.

### How It Works
1. Admin visits `/admin` and clicks **"Request Access"**
2. Enters their name and email
3. Receives an email with a secure setup link (expires in 24 hours)
4. Clicks link, goes to `/admin/setup-password?token=...`
5. Sets their password
6. Can now log in with email + password

### Features
- [x] Email + password login form
- [x] "Request Access" form for new admins
- [x] Secure email with setup link via Resend
- [x] Password setup page with token verification
- [x] Token expiration (24 hours)
- [x] Session management with tokens
- [x] Support for multiple admin users

### API Endpoints
- `POST /api/admin-auth/request-access` - Request admin access
- `GET /api/admin-auth/verify-token/{token}` - Verify setup token
- `POST /api/admin-auth/set-password` - Set password after email verification
- `POST /api/admin-auth/login` - Login with email + password
- `GET /api/admin-auth/check` - Check if any admins exist

### Database Model (admin_users collection)
```json
{
  "id": "uuid",
  "name": "Admin Name",
  "email": "admin@example.com",
  "password_hash": "sha256 hash",
  "status": "pending|active|revoked",
  "access_token": "secure token for setup",
  "token_expires": "datetime",
  "created_at": "datetime",
  "updated_at": "datetime",
  "last_login": "datetime"
}
```

### Key Files
- `/app/backend/routes/admin_auth.py` - All auth endpoints
- `/app/frontend/src/pages/AdminLogin.jsx` - Login + Request Access forms
- `/app/frontend/src/pages/AdminSetupPassword.jsx` - Password setup page

## Newsletter Builder (February 2026)

### Overview
A complete block-based newsletter building system integrated into the admin console at **Admin > Studio > Comms > Newsletters**.

### Features Implemented
- [x] Newsletter issue list view with status badges (Draft/Sent)
- [x] Create/Edit newsletter modal with three tabs: Basics, Content, Settings
- [x] Three content block types:
  - **Main Story**: Image, Eyebrow, Headline, Body, CTA Button (with URL and microcopy)
  - **Image + Text Card**: Image, Title, Body, Link (designed for two-up layout)
  - **Simple Text Block**: Optional Headline, Body text
- [x] Block reordering with Move Up/Down controls
- [x] Asset picker integration for images
- [x] HTML preview in modal (renders full email template)
- [x] Save Draft functionality
- [x] Send Test Email functionality
- [x] Send Campaign functionality (to all subscribers or portal users)
- [x] Audience segment selector with live subscriber counts
- [x] Master HTML template matching user-provided design (SWP-Newsletter_Master.html)

### API Endpoints
- `GET /api/newsletter-builder/issues` - List all newsletter issues
- `GET /api/newsletter-builder/issues?status=draft` - Filter by status
- `POST /api/newsletter-builder/issues` - Create new newsletter
- `GET /api/newsletter-builder/issues/{id}` - Get single issue
- `PUT /api/newsletter-builder/issues/{id}` - Update issue
- `DELETE /api/newsletter-builder/issues/{id}` - Delete issue
- `POST /api/newsletter-builder/issues/{id}/preview` - Generate HTML preview
- `POST /api/newsletter-builder/issues/{id}/send` - Send campaign
- `POST /api/newsletter-builder/issues/{id}/send?test_email=x@y.com` - Send test email
- `GET /api/newsletter-builder/segments` - Get audience segments with counts

### Database Model (newsletter_issues collection)
```json
{
  "id": "uuid",
  "title": "Internal title",
  "subject": "Email subject line",
  "preheader": "Preview text",
  "header_image_url": "URL or null for default",
  "issue_label": "INSIDE THE DEN // Issue 01",
  "date_label": "19 Feb 2026",
  "hero_title": "Newsletter hero title",
  "hero_intro": "Introduction text",
  "hero_chips": "Tags separated by bullets",
  "blocks": [
    {"type": "main_story", "headline": "...", "body": "...", ...},
    {"type": "image_text", "title": "...", "body": "...", ...},
    {"type": "simple_text", "headline": "...", "body": "..."}
  ],
  "segment": "all|portal_users",
  "status": "draft|sent",
  "show_studio_cta": true,
  "sent_at": "datetime",
  "sent_count": 15,
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

### Key Files
- `/app/backend/routes/newsletter_builder.py` - All newsletter builder APIs
- `/app/backend/models/newsletter_issue.py` - Pydantic models
- `/app/frontend/src/components/admin/AdminNewsletterBuilder.jsx` - List view component
- `/app/frontend/src/components/admin/NewsletterBuilderModal.jsx` - Editor modal

## Next Steps
1. Validate JSON-LD with Google Rich Results Test (button available in admin)
2. Configure production site URL in SEO settings
3. Add social profile links in Organization Schema
4. Test sitemap submission to Google Search Console

## Image Compression Stats
Typical compression results observed:
- **JPG → WebP**: 80-95% file size reduction
- **PNG → WebP**: 70-90% file size reduction
- **JPG (no WebP)**: 50-80% file size reduction
- **PNG (no WebP)**: 20-50% file size reduction
