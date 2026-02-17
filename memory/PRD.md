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

### 3. Public Website
- Films page with route-driven modal (`/films/:slug`)
- The Den (Blog) with SEO optimization
- Work With Us page with FAQ accordion
- SEO foundations (robots.txt, sitemap.xml, JSON-LD schemas)

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
- [x] JSON-LD FAQPage schema for SEO

#### SEO Foundations
- [x] robots.txt (static in public/ + API endpoint)
- [x] sitemap.xml (static + dynamic API at `/api/seo/sitemap.xml`)
- [x] Organization JSON-LD schema on Home page
- [x] Movie JSON-LD schema on Films detail pages
- [x] FAQPage JSON-LD schema on Work With Us page
- [x] Canonical URLs on all major pages
- [x] Meta titles and descriptions

### In Progress
- [ ] Image lazy-loading optimization
- [ ] Internal linking audit

### Backlog (P2/P3)
- [ ] User Management multi-project access UI (redesign to dropdown with checkboxes)
- [ ] Build Updates Feed for user-facing Studio Portal
- [ ] E-commerce Integration (Stripe for The Armory)
- [ ] CineConnect Database build-out

## Technical Architecture

### Frontend
- React 18 with React Router v6
- Tailwind CSS + Shadcn/UI components
- react-helmet-async for SEO
- Tiptap rich text editor
- Framer Motion for animations

### Backend
- FastAPI (Python)
- MongoDB with Motor async driver
- JWT authentication
- File upload with watermarking (PyPDF, ReportLab)

### Key Files
- `/app/frontend/src/pages/WorkWithUs.jsx` - FAQ section
- `/app/frontend/src/components/admin/AdminAssetsTab.jsx` - Asset library
- `/app/frontend/src/components/admin/AdminBlogTab.jsx` - Blog editor
- `/app/backend/routes/seo.py` - SEO API endpoints

## API Endpoints

### SEO
- `GET /api/seo/robots.txt` - Robots.txt content
- `GET /api/seo/sitemap.xml` - Dynamic sitemap XML

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

## Credentials
- Admin URL: `/admin`
- Admin Password: `shadowwolves2024`

## Next Steps
1. Test all JSON-LD schemas with Google Rich Results Test
2. Implement image lazy-loading
3. Review internal linking structure
4. Consider multi-project access UI redesign
