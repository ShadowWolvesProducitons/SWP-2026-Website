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
