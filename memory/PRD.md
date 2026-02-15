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
- Admin modal tab themes already unified (both use border-b-2 underline)
- 100% test pass rate (backend: 12/12, frontend: 16/16)

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
- Full public site (Home, About, Films, Armory, Den/Blog, Work With Us, Contact)
- Admin console with Activity tab, inline quick actions
- Investor portal with NDA, Overview dashboard, filter chips
- Investor Auto-Invite System (Resend email)
- CineConnect Register Interest
- AI image generation for blog covers
- Lead magnet popup system
- Site-wide 2:3 aspect ratio standardization

### Credentials
- Admin: /admin, Password: shadowwolves2024
- Investor: /investors/login, Password: investor2024

## Prioritized Backlog

### P1
- Email System Expansion (Lead Magnet Delivery, Submission Confirmation templates via Resend)

### P2
- E-commerce for The Armory (Stripe)
- CineConnect Database (cast/crew full build-out)