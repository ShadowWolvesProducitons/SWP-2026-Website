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
- SEO & Indexing Settings under Studio > SEO

### 3. Public Website
- Films page with route-driven modal (`/films/:slug`)
- The Den (Blog) with SEO optimization
- Work With Us page with FAQ accordion
- SEO foundations (robots.txt, sitemap.xml, JSON-LD schemas)
- Image lazy-loading for performance

## What's Been Implemented

### Completed Features

#### Admin Console
- [x] 6-tab navigation structure
- [x] Asset Library with folder navigation
- [x] Blog content loading fix
- [x] Product file upload for Armory
- [x] User management for Studio Portal
- [x] Activity Feed with bulk actions (select all, delete, mark read)
- [x] Site Settings reorganized into tabs (Page Headers, Lead Magnet, Redirects)

#### Admin Authentication
- [x] Password-based admin login at `/admin`
- [x] Secret access via triple-click footer copyright
- [x] Password: `Shadow_Wolves01!`

#### Newsletter Builder
- [x] Block-based editor with master HTML template
- [x] Three block types: Main Story, Image+Text Card, Simple Text
- [x] HTML preview, Save Draft, Send Test, Send Campaign
- [x] Audience segment selector

#### Redirect System
- [x] DB-driven 301/302 redirects with priority and matching
- [x] CRUD API at `/api/redirects/rules/*`
- [x] Toggle enable/disable per rule

#### SEO
- [x] Dynamic robots.txt and sitemap.xml
- [x] Admin SEO controls
- [x] Production URL consistency

#### Image Optimization
- [x] Server-side compression + WebP conversion
- [x] Native lazy loading across all pages

#### Studio Portal
- [x] Full-width layout for all portal pages (Account, Dashboard, Projects, Updates, Assets)
- [x] Request Access page widened to 960px for uniformity

#### GitHub Integration (Feb 15, 2026)
- [x] Pulled latest code from GitHub repo
- [x] Fixed syntax error in RequestAccess.jsx from GitHub merge

## Technical Architecture

### Frontend
- React 18 with React Router v6
- Tailwind CSS + Shadcn/UI components
- react-helmet-async for SEO
- Tiptap rich text editor
- Framer Motion for animations
- SeoContext for centralized SEO settings
- Custom adminStyles.js for admin panel styling

### Backend
- FastAPI (Python)
- MongoDB with Motor async driver
- JWT authentication
- File upload with watermarking (PyPDF, ReportLab)
- Resend for emails

### Key Database Collections
- `films`, `blog_posts`, `den_items`, `assets`
- `studio_users`, `admin_users`
- `site_settings`, `newsletter_issues`, `redirect_rules`

## Credentials
- Admin URL: `/admin` (triple-click footer copyright)
- Admin Password: `Shadow_Wolves01!`

#### Frontend UI Overhaul (Feb 15, 2026)
- [x] Home: Removed "What We're Building" section, removed Services heading, centred Additional Support chips
- [x] Home: Fixed newsletter email input (replaced broken swp-input class with inline styles)
- [x] Films: Redesigned film cards — 5-column glass grid, poster zoom, FEATURED badge removed (brighter border instead)
- [x] All public pages: Fixed parallax background (Home, Films, TheDen, WorkWithUs)
- [x] All public pages: Removed bottom whitespace (minHeight removed)
- [x] SupportModal: Removed emoji characters from headings
- [x] WorkWithUs: Fixed newsletter email input

- [x] All public pages: Subtle parallax scroll depth effect (bg moves at 12% scroll speed, GPU-accelerated)
- [x] WorkWithUs: Renamed CineConnect → Spot'd (sidebar card, FAQ answer, link to getspotd.app)

- [x] Email service migrated from Resend → Postmark (all 7 route files + webhook + frontend references)

- [x] Code review fixes: XSS (DOMPurify), hardcoded secrets, undefined vars, mutable defaults, hook deps, template literal syntax

## Backlog (Prioritized)
- [ ] P0: Dynamic Pages System with drag-and-drop reordering
- [ ] P1: Rename "CineConnect" to "Spot'd" in frontend (WorkWithUs sidebar + FAQ)
- [ ] P3: HTML Code Editor in Blog Posts
- [ ] P1: E-commerce Integration (Stripe for The Armory)
- [ ] P2: Spot'd Integration (www.getspotd.app - cast & crew database for indie filmmakers)
- [ ] P2: Verify Resend Webhook on production
- [ ] P2: Asset Library Delete Button Bug (paused by user)
- [ ] P3: AdminDashboardTab refactor (split Activity Feed)
