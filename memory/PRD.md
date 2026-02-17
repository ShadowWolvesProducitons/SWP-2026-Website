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
- [x] `/api/seo/robots.txt` - Reads from admin settings
- [x] `/api/seo/sitemap.xml` - Dynamic generation based on settings
- [x] `/api/site-settings/seo` - GET/PUT for SEO configuration

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

## API Endpoints

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
- Admin Password: `shadowwolves2024`

## Next Steps
1. Validate JSON-LD with Google Rich Results Test (button available in admin)
2. Configure production site URL in SEO settings
3. Add social profile links in Organization Schema
4. Test sitemap submission to Google Search Console
