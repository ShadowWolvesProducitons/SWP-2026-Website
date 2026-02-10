# Shadow Wolves Productions - Product Requirements Document

## Original Problem Statement
Professional, cinematic website for "Shadow Wolves Productions" evolved into a full-stack platform with React frontend, FastAPI backend, MongoDB. Features include public site, admin console, investor portal, email notifications, AI tools, analytics, and lead magnet.

## Architecture
- **Frontend:** React + TailwindCSS + Framer Motion + Tiptap
- **Backend:** FastAPI + Motor (async MongoDB)
- **Database:** MongoDB
- **Integrations:** Resend (email), OpenAI via emergentintegrations (AI image gen), pypdf + reportlab (PDF watermark)

## Core Pages & Features
### Public Site
- Home, About, Films, The Armory (product catalog), The Den (blog), Work With Us, Contact
- Individual product landing pages with canonical template (/armory/:slug)
- Lead Magnet popup ("Producer's Playbook")
- Genre filter dropdown on Films page

### Studio Admin Console (/admin)
- Analytics Dashboard with email campaign stats
- Films, Armory, Blog (The Den) management
- **Activity Tab** (merged Messages + Submissions + CineConnect interests) with filter chips
- Newsletter management with bulk send
- Email templates
- **Investor management** with settings, access codes, slate projects, blog posts, activity log

### Investor Portal (/investors)
- Multi-step login with NDA acceptance
- Development Slate with per-project document access
- **Studio Updates** (private blog) section
- Smart document download with PDF watermarking
- Investment Model overview
- Expression of Interest form

## What's Been Implemented (as of Feb 10, 2026)

### Completed Features
- Full public site with all pages
- Admin console with all tabs including merged Activity tab
- Investor portal with structured journey, NDA, smart downloads
- AI image generation in blog editor
- The Armory with individual product landing pages (slug-based routing)
- **Canonical App Landing Page Template** with sections: Hero, What It Is, Core Actions, What You Get, Features, How It Works, Who It's For, Why It Works, What It's Not, Tags, Final CTA
- **Unified Armory Admin Modal** — accordion-based Product Page Builder with 5 sections (Product Basics, Product Page Content, Media, Purchase & Access, SEO) + AI SEO Assist
- **CineConnect Register Interest** button on Work With Us page
- **Back button** on product pages and admin panel
- **Hidden admin link** (triple-click company name in footer)
- **Investor private blog** — Studio Updates visible in portal, manageable from admin
- **Connection error fix** — improved error handling across LeadMagnetPopup and InvestorPortal
- **Get The Playbook fix** — button now triggers popup directly via custom event
- Database query optimizations (8 critical fixes)
- Deployment readiness (.gitignore fix, health check)

### Admin Credentials
- Admin: /admin, Password: shadowwolves2024
- Investor: /investors, Password: investor2024
- Test Access Code: SMITH2024

## Prioritized Backlog

### P1 - Remaining Tasks
- Email System Expansion (Lead Magnet Delivery, Unsubscribe Confirmation, Investor Access Granted, Submission Confirmation templates)
- E-commerce for The Armory (Stripe integration)

### P2 - Future
- CineConnect Database (full cast/crew feature)
- Social media integration
- SEO improvements
- `font-['Cinzel']` CSS refactoring to global class
- Producer's Playbook PDF: move from artifact URL to /frontend/public/assets

## Code Architecture
```
/app
├── backend/
│   ├── models/
│   │   ├── den_item.py        # Canonical template fields (who_its_for, why_it_works, etc.)
│   │   └── investor.py
│   ├── routes/
│   │   ├── ai.py, blog.py, contact.py, den_items.py
│   │   ├── investors.py       # Includes investor blog CRUD
│   │   ├── newsletter.py, submissions.py, upload.py, webhooks.py
│   ├── utils/watermark.py
│   └── server.py
└── frontend/src/
    ├── components/
    │   ├── admin/
    │   │   ├── AdminActivityTab.jsx    # Merged Messages/Submissions/CineConnect
    │   │   ├── AdminArmoryTab.jsx      # Accordion-based Product Page Builder
    │   │   ├── AdminInvestorTab.jsx    # With Blog Posts panel
    │   │   └── ...other admin tabs
    │   ├── Footer.jsx                  # Triple-click admin link
    │   ├── Header.jsx
    │   └── LeadMagnetPopup.jsx         # Custom event trigger
    ├── pages/
    │   ├── About.jsx, Blog.jsx, Films.jsx, Home.jsx
    │   ├── AdminDashboard.jsx          # Back to Website button
    │   ├── InvestorPortal.jsx          # Studio Updates section
    │   ├── ProductPage.jsx             # Canonical template with all sections
    │   ├── TheDen.jsx, WorkWithUs.jsx  # CineConnect section
    │   └── ...
    └── App.js
```
