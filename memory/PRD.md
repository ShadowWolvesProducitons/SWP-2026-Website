# Shadow Wolves Productions - Product Requirements Document

## Original Problem Statement
Professional, cinematic website for "Shadow Wolves Productions" evolved into a full-stack platform with React frontend, FastAPI backend, MongoDB. Features include public site, admin console, investor portal, email notifications, AI tools, analytics, and lead magnet.

## Architecture
- **Frontend:** React + TailwindCSS + Framer Motion + Tiptap
- **Backend:** FastAPI + Motor (async MongoDB)
- **Database:** MongoDB
- **Integrations:** Resend (email), OpenAI via emergentintegrations (AI image gen), pypdf + reportlab (PDF watermark)

## What's Been Implemented

### Header Banner Adjustment (Feb 14, 2026)
- Enlarged header banner image from h-12 to h-20 for better readability
- Reduced header padding from fixed h-20 container to py-2 for tighter layout

### Producer's Playbook Mockup Migration (Feb 14, 2026)
- Migrated mockup image from temporary external URL to local `/api/upload/images/producers-playbook-mockup.png`
- Added mockup image to the Assets Library in MongoDB with proper tags

### Full Regression Test (Feb 14, 2026)
- Backend: 100% pass rate (17/17 tests)
- Frontend: 92% pass rate (22/24 tests, 2 minor Playwright-specific checkbox issues)
- Test report: `/app/test_reports/iteration_11.json`

### Admin Assets Library (Feb 12, 2026)
- Centralized Asset Management: All files uploaded anywhere in admin auto-catalogue to the Assets Library
- Backend Integration: `/api/upload/image` and `/api/upload/file` endpoints accept `source` and `tags` parameters
- Auto-cataloguing: Every upload automatically creates an entry in the `assets` MongoDB collection
- Asset Picker Component: Reusable `AssetPicker.jsx` for selecting existing assets from library
- Features: Search, filter by type (Images/PDFs/Other), visibility controls, preview modal
- Source Tracking: Assets tagged with origin (armory, blog, investor-project, etc.)

### Browse Library Feature (Feb 12, 2026)
- "Browse Library" button integrated into all admin modals (Armory, Films, Blog, Investors)

### Site-Wide Aspect Ratio Fix (Feb 12, 2026)
- All poster/product images standardized to 2:3 aspect ratio with object-contain

### Admin Quick Actions (Feb 12, 2026)
- Inline "Mark as Read" and "Add Note" actions on Activity tab

### Investor Portal Refactor (Feb 12, 2026)
- New Overview dashboard with summary tiles
- Simplified navigation
- Filter chips on Updates page

### Investor Auto-Invite System (Feb 12, 2026)
- Public request form, token-based signup, dual auth (email/password + legacy)

### Other Completed Features
- Full public site (Home, About, Films, Armory, Den/Blog, Work With Us, Contact)
- Admin console with Activity tab (merged Messages/Submissions/CineConnect)
- Investor portal with NDA, smart document downloads, Studio Updates
- CineConnect Register Interest button
- Hidden admin link (triple-click footer company name)
- AI image generation, lead magnet popup, genre filter dropdown
- Product page two-column layout
- Armory admin modal with tabbed product page builder (5 tabs + SEO)

### Credentials
- Admin: /admin, Password: shadowwolves2024
- Investor: /investors/login, Email/Password OR Password: investor2024

## Prioritized Backlog

### P1
- Email System Expansion (Lead Magnet Delivery, Submission Confirmation templates via Resend)

### P2
- E-commerce for The Armory (Stripe)
- CineConnect Database (cast/crew full build-out)

### Console Warnings (Non-blocking)
- Duplicate tiptap extension names ['link', 'underline'] in blog editor
- UNSAFE_componentWillMount in react-helmet SideEffect component
