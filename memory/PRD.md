# Shadow Wolves Productions - Product Requirements Document

## Original Problem Statement
Professional, cinematic website for "Shadow Wolves Productions" evolved into a full-stack platform with React frontend, FastAPI backend, MongoDB. Features include public site, admin console, investor portal, email notifications, AI tools, analytics, and lead magnet.

## Architecture
- **Frontend:** React + TailwindCSS + Framer Motion + Tiptap
- **Backend:** FastAPI + Motor (async MongoDB)
- **Database:** MongoDB
- **Integrations:** Resend (email), OpenAI via emergentintegrations (AI image gen + product content), pypdf + reportlab (PDF watermark)

## What's Been Implemented

### Armory Product Page Builder Refactor (Feb 14, 2026)
- **5-Tab Modal:** Basics, Pricing & Access, Product Page Content, Media, SEO
- **AI Content Generation:** Full product page content generation via OpenAI GPT-4o-mini
  - Global "Generate Product Page Content" button opens overlay with pre-filled inputs
  - Generates: positioning line, description, audience, features/deliverables, CTA, tags, SEO
  - Overwrite protection: Apply All / Apply Selected / Cancel
- **Section-Level AI Regeneration:** Sparkle icons on individual fields for targeted regen
  - Supported sections: positioning line, what this is, features, what you get, CTA, SEO fields
  - Inline preview with Apply/Cancel before overwriting
- **SEO AI Generation:** "Generate SEO from Content" button with preview/apply controls
- **Pricing Model System:** Dropdown (Free/One-time/Subscription) with conditional fields
  - One-time: Price + Price Note
  - Subscription: Monthly/Annual Price, Billing Note, Trial Days
- **Backend Schema Update:** Added pricing_model, monthly_price, annual_price, billing_note, includes_trial, trial_days, focus_keyword to DenItem model
- **Conditional Content Sections:** Apps show Features + Core Actions; others show What You Get + How It Works
- **Editable List Items:** Click-to-edit inline for all list editors
- **Auto Slug Generation:** Slug auto-updates from title until manually edited

### Backend AI Endpoints (Feb 14, 2026)
- `POST /api/ai/generate-product-content` — Full content generation
- `POST /api/ai/regenerate-product-section` — Single section regeneration
- `POST /api/ai/generate-product-seo` — SEO from existing content

### Header Banner Adjustment (Feb 14, 2026)
- Enlarged header banner image from h-12 to h-20 for better readability
- Reduced header padding from fixed h-20 container to py-2

### Producer's Playbook Mockup Migration (Feb 14, 2026)
- Migrated mockup image from temporary external URL to local storage
- Added to Assets Library in MongoDB

### Admin Assets Library (Feb 12, 2026)
- Centralized Asset Management with auto-cataloging
- Asset Picker Component for reuse across all admin modals
- Browse Library button in Armory, Films, Blog, Investor modals

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

### Console Warnings (Non-blocking)
- Duplicate tiptap extension names in blog editor
- UNSAFE_componentWillMount in react-helmet
