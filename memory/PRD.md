# Shadow Wolves Productions - Product Requirements Document

## Original Problem Statement
Professional, cinematic website for "Shadow Wolves Productions" evolved into a full-stack platform with React frontend, FastAPI backend, MongoDB. Features include public site, admin console, investor portal, email notifications, AI tools, analytics, and lead magnet.

## Architecture
- **Frontend:** React + TailwindCSS + Framer Motion + Tiptap
- **Backend:** FastAPI + Motor (async MongoDB)
- **Database:** MongoDB
- **Integrations:** Resend (email), OpenAI via emergentintegrations (AI image gen + product content), pypdf + reportlab (PDF watermark)

## What's Been Implemented

### Bug Fixes — Armory, Blog, AI Cover (Feb 14, 2026)
- **Armory Page:** Compact 6-column grid matching Films page. ProductCard rewritten as poster-style overlay cards (no content section below).
- **Blog/Den Page:** Alternating zigzag layout — even posts show image-left/content-right, odd posts reverse. Wolf placeholder for posts without cover images. Container widened to max-w-5xl.
- **AI Cover Image:** Fixed `generate_images()` call — removed unsupported `size` parameter. Blog AI image generation now works correctly.

### Armory Product Page Builder Refactor (Feb 14, 2026)
- 5-Tab Modal: Basics, Pricing & Access, Content, Media, SEO
- AI Content Generation with overwrite protection
- Section-Level AI Regeneration (sparkle icons)
- SEO AI Generation with preview/apply controls
- Pricing Model System (Free/One-time/Subscription)
- Backend schema updated with new pricing fields

### Comprehensive UI/UX Update (Feb 15, 2026)
**Items 0-5 (Quick fixes):**
- Unsubscribe link in all newsletter/email sends (per-subscriber URL)
- Header logo image added to all email templates (welcome + newsletter)
- Producer's Playbook PDF migrated to central Assets Library (LeadMagnetPopup fetches from API)
- Slug regenerate button on Basics tab (data-testid='regenerate-slug-btn')
- AI generation now returns Post Title as a selectable field
- Tiptap editor toolbar made sticky (stays visible while scrolling content)

**Items 6-8 (UI/UX fixes):**
- Armory product cards: top 3/4 square image (object-contain auto-fit), bottom 1/4 info strip
- Image dimension hints added to all upload fields (Blog: 1200x630, Armory: 800x800)
- Producer's Playbook image on The Den page "Get the Playbook" section with blue glow effect
- Blog cards made compact (horizontal cards with small square thumbnail)
- Fixed blog cover images using correct field name (cover_image_url)

**Items 9-11 (Site-wide theming):**
- Generated unique cinematic header background images for all 7 pages (About, Films, Armory, Den, Investors, Work With Us, Contact)
- Created shared PageHeader component for consistent header styling
- All page titles use Cinzel font matching Films page style
- Button theme verified as pill-shaped (rounded-full) across public pages
- 100% test pass rate (backend: 12/12, frontend: 16/16)

### Films System Refactor (Feb 16, 2026)
**Part 1 - Public Project Overview:**
- Refactored FilmModal: poster in 2:3 ratio with `object-contain`, removed old CTAs, added "View Project" button
- Created new public project page at `/films/{slug}`:
  - Hero section: poster, title (Cinzel font), genre tags, status badge, tagline, "Request Materials" CTA
  - Logline section
  - Extended Synopsis section (expandable)
  - Tone & Style section (3-5 paragraphs + mood image grid)
  - Project Status section (current stage, format, "looking for")
  - Final CTA block ("Interested in {title}?")
- SEO-friendly with `react-helmet` meta tags
- URL slug auto-generation from title
- Admin film modal expanded to 4-tab layout: Basics | Content | Media | Studio Access

**Part 2 - Studio Access Page:**
- Token-based access control at `/studio-access/{slug}?token=...`
- Standalone layout (no main site header/footer)
- Confidential banner showing user name
- Project Snapshot: genre, format, target budget, status, audience, comparables
- Financial Overview: budget range, financing structure, tax incentives
- Pitch Deck section with watermarked PDF download
- Script Access with NDA confirmation modal
- Next Steps CTAs: "Schedule Call", "Express Interest"
- Access logging and token management
- Backend routes: /api/studio-access/tokens, /api/studio-access/verify, /api/studio-access/watermark

**Film Model Extensions:**
- slug, extended_synopsis, tone_style_text, mood_images
- format, target_audience, comparables, looking_for
- target_budget_range, financing_structure, incentives
- pitch_deck_url, script_url, studio_access_enabled

**New Collections:**
- studio_access_tokens: token management with expiry
- studio_access_logs: action logging

**Test Results:** Backend 14/14, Frontend 12/12

### Site Settings Admin Panel (Feb 15, 2026)
- Created new "Site Settings" tab in Admin Console
- Page header editing with:
  - Live preview of header appearance
  - Image upload functionality
  - Horizontal position slider (0-100%)
  - Vertical position slider (0-100%) - adjusts which part of image is visible
  - Overlay darkness slider (0-100%)
  - Save per page, with "Preview Page" link
- Settings stored in MongoDB site_settings collection
- PageHeader component now fetches settings from database
- Supports all pages: Films, Armory, Den, Investors, Work With Us, Contact, About

### Studio Access Portal (Feb 16, 2026)
**New unified role-based portal replacing old Investor Portal:**

**User Flow:**
1. **Request Access** (`/request-access`): Public form with role selection (Investor, Director, Producer, EP, Sales Agent, Cast, Crew, Talent Manager, Other), project interest selection, and terms agreement
2. **Email Verification**: Verification email sent via Resend with token-based link
3. **Set Password** (`/verify-access?token=...`): Complete account setup after email verification
4. **Login** (`/studio-access/login`): Standard email/password authentication with JWT tokens
5. **Forgot Password** (`/reset-password?token=...`): Password reset flow

**Portal Pages (all at `/studio-access/*`):**
- **Dashboard** (`/studio-access`): Welcome message, role badge, projects grid, recent updates, recent assets
- **Projects** (`/studio-access/projects`): Searchable project list with 2:3 poster cards and status badges
- **Project Detail** (`/studio-access/projects/{slug}`): Full project info with role-based content visibility:
  - Overview with logline and extended synopsis
  - Documents section (Pitch Deck, Script downloads with watermarking)
  - Financial Overview (investors/producers only)
  - Project-specific updates and assets
- **Updates** (`/studio-access/updates`): Role-filtered news feed with tag filtering
- **Assets** (`/studio-access/assets`): Downloadable documents with type filtering and watermark notice
- **Account** (`/studio-access/account`): Profile editing (name, company) and password change

**Role-Based Permissions:**
- Admin: Full access to everything
- Investor: Full access to financials, scripts, deck, all projects
- Executive Producer/Producer: Full access to financials, scripts, deck
- Sales Agent: Deck access only (no financials or scripts)
- Director: Scripts and deck access (no financials)
- Cast/Crew/Talent Manager: Limited access (per-project only)

**Backend Implementation:**
- `/api/studio-portal/request-access`: Create user with pending verification
- `/api/studio-portal/verify-token`, `/api/studio-portal/set-password`: Email verification flow
- `/api/studio-portal/login`: JWT authentication
- `/api/studio-portal/me`: Get/update current user
- `/api/studio-portal/dashboard`, `/api/studio-portal/projects`, `/api/studio-portal/updates`, `/api/studio-portal/assets`: Protected data endpoints
- `/api/studio-portal/projects/{slug}/download/{doc_type}`: Watermarked document downloads
- Audit logging for all user actions

**Test Results:** Frontend 15/15 (100% pass rate)

**Test Credentials:**
- Studio Portal: investor@test.com / TestPassword123 (Investor role)

### Home/About Page Merge (Feb 15, 2026)
- Merged About page content into Home page
- New page structure:
  1. Hero section with video background
  2. Manifesto section: "We don't chase trends / We don't ask permission / We don't make noise for the sake of it"
  3. "Shadow Wolves Productions exists to create bold, genre-driven stories with teeth." (single line)
  4. Stats section (15+ Films, 25+ Awards, 5+ Projects, 20+ Years)
  5. "What We Do" section with glowing cards (Development, Pre-Production, Post-Production)
  6. Additional Support chips with subtle glows (Script Coverage, Development Notes, Pitch Materials, Creative Consulting)
  7. Quote separator: "If it doesn't scare us a little, it's probably not worth making." (left-aligned)
  8. "What We're Building" section
  9. "Work With Us" / "Invest With Us" CTA buttons
  10. "Join The Pack" newsletter section
- Removed: Feature Films section, "What We Believe" section, "How We Work" section
- Changed page title from "HOME" to "ABOUT"
- Updated navigation: removed separate "About" link, renamed "Home" to "About" pointing to `/`
- Updated footer: Quick Links now shows "About" instead of "Home"
- `/about` route now redirects to `/`

### UI Improvements (Feb 15, 2026)
- Added faint blue glow to service cards and support chips for better clickability cues
- Increased PageHeader height (py-20 md:py-28) to show more of the background images
- Changed background image positioning to `object-top` so the important parts are visible
- Generated new Investors page header - professional conference room with city skyline
- Fixed Lead Magnet PDF lookup with more robust search query (searches both original_name and filename)

### Admin Tab Unification (Feb 15, 2026)
- Updated Armory filter tabs to pill style (rounded-full) - "All", "Apps", "Templates", "Downloads", "Courses", "eBooks"
- Updated Armory modal tabs to pill style (rounded-full) - "Basics", "Pricing & Access", "Content", "Media", "SEO"
- Updated Blog modal tabs to pill style (rounded-full) - "Basics", "Content", "Media", "SEO"
- Active tabs now use blue background instead of underline style for consistency with public-facing buttons

### Blog Post Builder Refactor + Newsletter (Feb 14, 2026)
- Restructured blog Edit Post modal to 4-tab layout: Basics | Content | Media | SEO
- Unified theme matching The Armory modal (same tab bar, field components, footer)
- Added "Generate Blog Post Metadata" AI button on Content tab (opens overlay with 7 selectable sections)
- Added CTA Text + CTA Microcopy fields to blog posts
- Featured/Pinned toggle added to Basics tab
- Removed: Canonical URL, Social Share Image fields
- "Send as Newsletter" button on published blog posts — generates email with excerpt, cover image, tags, and "Read Full Story" CTA linking back to the blog page
- Backend model updated: added featured, cta_text, cta_microcopy fields
- Backend AI endpoint updated to return cta_text and cta_microcopy
- 100% test pass rate (backend: 12/12, frontend: 25/25)

### Blog SEO AI Generation (Feb 14, 2026)
- Added "Generate SEO from Content" button to blog Edit Post modal (SEO tab)
- New backend endpoint: POST /api/ai/generate-blog-seo
- AI generates: SEO Title, Meta Description, Excerpt, Tags, Meta Keywords
- Result preview with individual Apply buttons + Apply All
- Google Preview section, character count progress bars, SEO Checklist
- Mirrors Armory's AI generation UX pattern
- 100% test pass rate (backend: 5/5, frontend: 14/14)

### Header & Assets (Feb 14, 2026)
- Header banner enlarged (h-20) with reduced padding
- Producer's Playbook mockup migrated to local Assets Library

### Admin Assets Library (Feb 12, 2026)
- Centralized asset management with auto-cataloging
- Browse Library button across all admin modals

### Other Completed Features
- Full public site (Home, About, Films, Armory, Den/Blog, Work With Us)
- Admin console with Activity tab, inline quick actions
- Investor portal with NDA, Overview dashboard, filter chips
- Investor Auto-Invite System (Resend email)
- CineConnect Register Interest
- AI image generation for blog covers
- Lead magnet popup system
- Site-wide 2:3 aspect ratio standardization

### Films Status Filter & Page Merge (Feb 16, 2026)
- **Status Filter Chips**: Added "Browse by Stage" dropdown on /films page with status options: All, Development, Packaging, Pre-Production, Filming, Post-Production, Marketing, Released
- **Filter Independence**: Genre and Status filters work independently (can filter by genre OR status, not combined)
- **Clear Filters**: Button appears when any filter is active to reset both
- **Contact + Work With Us Merge**: Merged /contact into /work-with-us with two-lane toggle design:
  - "Submit a Project" lane: Full project submission form (Name, Email, Role, Submission Type, Format, Genres, Project Stage, Logline, Link, Message, Legal acknowledgements)
  - "General Enquiry" lane: Contact form (Name, Email, Phone, Topic dropdown, Message)
  - CineConnect card in right column
  - Single Newsletter section at bottom
- **/contact redirect**: Route redirects to /work-with-us
- **Navigation updated**: Removed "Contact" link from header and footer
- **Watermark Improvements**: Changed PDF watermarks from dense tiled text to single large diagonal watermark per page (8% opacity, user name in uppercase)
- **Download Logging**: Enhanced audit logging to capture user name, company, email, and timestamp on document downloads

### Admin Studio Portal Management (Feb 16, 2026)
- **New Admin Tab:** Added "Studio Portal" tab to Admin Console
- **User Management UI:** List all portal users with search, role filter, and status filter
- **User Cards:** Expandable cards showing user details (Company, Joined date, Last Login, Project Access)
- **Edit Access:** Inline editing of user role, status, and project permissions
- **Revoke Access:** One-click revoke access functionality
- **Stats Dashboard:** Cards showing Total Users, Active Users, Downloads, Revoked count
- **Audit Log:** Table view of all portal events (logins, downloads, verifications) with timestamps
- **Backend Console Endpoints:** New `/api/admin/studio-portal/console/*` endpoints using admin password auth

### Credentials
- Admin: /admin, Password: shadowwolves2024
- Investor Portal (Legacy): /investors/login, Password: investor2024
- Studio Portal: /studio-access/login, Test User: investor@test.com / TestPassword123

## Prioritized Backlog

### P0 (Completed)
- ✅ Films System Refactor Part 1 (Public Project Overview)
- ✅ Films System Refactor Part 2 (Studio Access Page)
- ✅ Studio Access Portal (Full user-facing portal implementation)
- ✅ Status Filter Chips on /films page
- ✅ Work With Us + Contact Page Merge
- ✅ Watermark Enhancement (single diagonal per page)
- ✅ Admin Management UI for Studio Portal (User Management + Audit Log)
- ✅ Admin Console Refactor (Feb 17, 2026)
  - Reduced top-level tabs to 6: Dashboard, Films, The Armory, The Den, Assets, Studio
  - Merged Activity tab into Dashboard (with Overview, Activity Feed, Email Campaigns sections)
  - Created new Studio master tab with sub-navigation: Portal, Comms, Settings
  - Merged Newsletter + Email Templates into Studio > Comms
  - Moved Site Settings into Studio > Settings
  - Added collection filters to Assets tab (All, Films, Website, Armory, Den)
  - Removed Templates category from Armory (merged into Downloads)
  - Removed Contact and Investors from Site Settings pages list
  - Added legacy route redirects for old URLs

### P1
- Multi-select Project Access for Studio Portal users
- Updates Feed Content Management (admin interface to create/edit portal updates)
- Asset Library Portal Integration (connect Assets Library to portal downloads)
- Audit Log Viewer Enhancements (filtering, export)

### P2
- E-commerce for The Armory (Stripe)
- CineConnect Database (cast/crew full build-out)
- Deprecate Old Investor Portal (/investors routes)