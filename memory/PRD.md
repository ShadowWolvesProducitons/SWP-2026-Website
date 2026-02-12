# Shadow Wolves Productions - Product Requirements Document

## Original Problem Statement
Professional, cinematic website for "Shadow Wolves Productions" evolved into a full-stack platform with React frontend, FastAPI backend, MongoDB. Features include public site, admin console, investor portal, email notifications, AI tools, analytics, and lead magnet.

## Architecture
- **Frontend:** React + TailwindCSS + Framer Motion + Tiptap
- **Backend:** FastAPI + Motor (async MongoDB)
- **Database:** MongoDB
- **Integrations:** Resend (email), OpenAI via emergentintegrations (AI image gen), pypdf + reportlab (PDF watermark)

## What's Been Implemented

### Admin Assets Library (Feb 12, 2026)
- **Centralized Asset Management:** All files uploaded anywhere in admin auto-catalogue to the Assets Library
- **Backend Integration:** `/api/upload/image` and `/api/upload/file` endpoints now accept `source` and `tags` parameters
- **Auto-cataloguing:** Every upload automatically creates an entry in the `assets` MongoDB collection
- **Asset Picker Component:** Reusable `AssetPicker.jsx` for selecting existing assets from library
- **Features:** Search, filter by type (Images/PDFs/Other), visibility controls (Admin/Public/Investor), preview modal
- **Source Tracking:** Assets tagged with origin (armory, blog, investor-project, etc.)

### Investor Auto-Invite System (Feb 12, 2026)
- **Public Request Form:** `/investors` page with access request form
- **Token-Based Signup:** Unique invite links sent via Resend email
- **Dual Auth:** New email/password login + legacy password fallback (`investor2024`)
- **Security Fix:** Changed invite URLs from query params to clean paths (`/investors/signup/:token`)

### CSS Refactor (Feb 12, 2026)
- Abstracted `font-['Cinzel']` to global `.font-cinzel` class across ~20 files

### Product Pages — Two-Column Layout
- **Desktop:** Left column (scrollable content), Right column (sticky purchase block)
- **Mobile:** Purchase block at top, sticky CTA bar at bottom
- **Purchase block:** Product name, positioning line, price, primary CTA, demo link, micro reassurance, Share, Save for Later

### Armory Admin Modal — Tabbed Product Page Builder
- **5 Tabs:** Basics, Content, Media, Access, SEO
- **Quick Fill Templates:** Type-specific content prompts (Apps, Courses, Templates, Downloads, eBooks)
- **SEO tab:** Focus Keyword, SEO Title/Description with char count, Google/Social Preview, SEO Checklist

### Other Completed Features
- Full public site (Home, About, Films, Armory, Den/Blog, Work With Us, Contact)
- Admin console with Activity tab (merged Messages/Submissions/CineConnect)
- Investor portal with NDA, smart document downloads, Studio Updates (private blog)
- CineConnect Register Interest button
- Hidden admin link (triple-click footer company name)
- AI image generation, lead magnet popup, genre filter dropdown

### Credentials
- Admin: /admin, Password: shadowwolves2024
- Investor: /investors/login, Email/Password OR Password: investor2024

## Prioritized Backlog

### P0 (In Progress)
- **Investor Portal Refactor:**
  - Simplify navigation: Overview, Development Slate, Updates, Documents, Request Materials
  - Build Overview dashboard with summary tiles
  - Fix Development Slate poster display (aspect ratio 2:3, `object-fit: contain`)
  - Add filter chips to Studio Updates page

### P1
- Update Header Image to specified local asset
- Admin Panel Quick Actions (Mark as Read, Assign Status, Add Note in Activity tab)
- Email System Expansion (Lead Magnet Delivery, Submission Confirmation templates)

### P2
- E-commerce for The Armory (Stripe)
- CineConnect Database (cast/crew)
- Migrate Producer's Playbook PDF to Assets Library (currently uses temp URL)

