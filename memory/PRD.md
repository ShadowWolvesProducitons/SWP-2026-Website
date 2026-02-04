# Shadow Wolves Productions - Product Requirements Document

## Original Problem Statement
Build a professional, cinematic website for Shadow Wolves Productions - a creator-led, genre-focused film production company. The site has evolved from a static portfolio into a full-stack studio-grade platform with comprehensive content management.

**Brand Tone:** Dark, confident, selective, creator-led. No corporate fluff. No inspirational clichés.  
**Tagline:** "WE DON'T FOLLOW. WE HUNT."

---

## Core Requirements

### Public-Facing Website

| Page | Route | Status | Description |
|------|-------|--------|-------------|
| Homepage | `/` | ✅ Complete | Hero, featured films, services, newsletter |
| Films | `/films` | ✅ Complete | Gallery with genre filters, cinematic lower-third hover effects, modal viewer |
| About/Manifesto | `/about` | ✅ Complete | Creative manifesto, philosophy, what we do/believe/don't do |
| The Armory | `/services` | ✅ Complete | E-commerce style product cards for apps, templates, downloads |
| The Den (Blog) | `/blog` | ✅ Complete | Blog index with SEO-friendly individual post pages |
| Work With Us | `/work-with-us` | ✅ Complete | Structured submission system with form validation |
| Contact | `/contact` | ✅ Complete | Contact form (backend) + functional newsletter signup |
| Investor Portal | `/investors` | ✅ Complete | Password-protected private portal |

### Studio Admin Console (`/admin`)

| Tab | Status | Features |
|-----|--------|----------|
| Films | ✅ Complete | Full CRUD, image upload, genres, status, featured toggle |
| The Armory | ✅ Complete | CRUD for apps, templates, downloads, courses, ebooks |
| The Den (Blog) | ✅ Complete | Tiptap rich text editor with full SEO, YouTube embeds, draft/published states |
| Messages | ✅ Complete | View/manage contact form messages with status workflow |
| Submissions | ✅ Complete | View/manage submissions with status workflow |
| Newsletter | ✅ Complete | View subscribers, export emails, unsubscribe management, **bulk email sending** |
| Email Templates | ✅ Complete | Customize all email notifications with Tiptap HTML editor |
| Investors | ✅ Complete | Portal settings, access codes, slate projects, documents, inquiries |

### Investor Portal Sections

| Section | Status | Description |
|---------|--------|-------------|
| Overview | ✅ Complete | Studio philosophy, development-first mindset |
| Development Slate | ✅ Complete | Projects with poster, hook, description, budget range |
| Investment Model | ✅ Complete | Project-by-project and slate investment options |
| Track Record | ✅ Complete | Achievements and completed works |
| Documents | ✅ Complete | Secure downloads with logging |
| Expression of Interest | ✅ Complete | Private inquiry form |

---

## Technical Architecture

### Stack
- **Frontend:** React 19, TailwindCSS, Shadcn/UI, React Router
- **Backend:** FastAPI, Pydantic, Motor (async MongoDB)
- **Database:** MongoDB
- **Rich Text:** Tiptap
- **SEO:** React Helmet

### Key Collections
- `films` - Film entries
- `den_items` - Armory products
- `blog_posts` - Blog content (HTML from Tiptap)
- `submissions` - Work With Us submissions
- `newsletter` - Newsletter subscribers
- `investor_settings` - Portal configuration
- `investor_credentials` - Access codes
- `investor_projects` - Development slate
- `investor_documents` - Downloadable files
- `investor_inquiries` - Expression of interest forms
- `document_downloads` - Download logging

### Design System
- **Heading Font:** Cinzel (serif)
- **Primary Color:** Electric Blue (#233dff)
- **Background:** Black (#0a0a0a)
- **Card Background:** Smoke Gray (#1a1a1a)

---

## Access Credentials

| Portal | URL | Credentials |
|--------|-----|-------------|
| Admin | `/admin` | Password: `shadowwolves2024` |
| Investor | `/investors` | Password: `investor2024` (or access code) |

---

## Third-Party Integrations

| Service | Status | Notes |
|---------|--------|-------|
| Resend (Email) | ✅ Active | Domain `newsletter.shadowwolvesproductions.com.au` verified. Sends welcome emails, admin notifications, and bulk newsletters |
| Tiptap YouTube | ✅ Active | YouTube video embedding in blog posts |

---

## What's Been Implemented

### December 2025 - Initial Build
- Full-stack application with React frontend and FastAPI backend
- Films page with genre filtering and cinematic modal
- Admin console with Films CRUD

### January 2026 - CMS Expansion
- The Armory (products) with admin management
- The Den (blog) with Tiptap rich text editor
- E-commerce style product cards

### February 2026 - Studio Infrastructure Expansion
- **About/Manifesto page** - Complete creative manifesto
- **Work With Us/Submissions** - Structured submission form with backend storage
- **Investor Portal** - Password + access code auth, 6 sections, admin controls
- **Newsletter** - Functional subscription connected to database
- **Admin Submissions tab** - View/manage with status workflow
- **Admin Investors tab** - Full portal management with sub-tabs
- **Admin Messages tab** - View contact form submissions
- **Admin Newsletter tab** - View subscribers with export, unsubscribe, and bulk email features
- **Bulk Email Campaigns** - Compose and send newsletters to all subscribers with test mode
- **Blog YouTube Embed** - Tiptap YouTube extension for embedding videos
- **Resend Email Integration** - Welcome emails for newsletter signups (requires domain verification)

---

## Known Limitations

1. **File uploads** - Stored locally in `/app/backend/uploads/`
2. **Rate limits** - Resend free tier allows 2 emails/second

---

## Backlog / Future Tasks

### P1 - High Priority
- [ ] E-commerce for The Armory (payment integration)
- [ ] Contact form backend submission (vs mailto)

### P2 - Medium Priority
- [ ] Email templates for submissions/inquiries
- [ ] Admin dashboard analytics/stats
- [ ] Investor document watermarking

### P3 - Low Priority
- [ ] Social media integration
- [ ] SEO improvements
- [ ] Performance optimization

---

## Admin Component Reference

```
/app/frontend/src/components/admin/
├── AdminFilmsTab.jsx       - Film CRUD management
├── AdminArmoryTab.jsx      - Product/resource management
├── AdminBlogTab.jsx        - Blog with Tiptap editor + YouTube
├── AdminMessagesTab.jsx    - Contact form submissions
├── AdminSubmissionsTab.jsx - Work With Us submissions
├── AdminNewsletterTab.jsx  - Newsletter subscriber management
└── AdminInvestorTab.jsx    - Investor portal management
```
