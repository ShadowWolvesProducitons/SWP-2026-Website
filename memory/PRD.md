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
| Homepage | `/` | ✅ Complete | Hero, featured films, **minimal service cards with modal**, newsletter |
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
| Dashboard | ✅ Complete | Analytics overview, stats cards, recent activity feed, email campaign analytics |
| Films | ✅ Complete | Full CRUD, image upload, genres, status, featured toggle |
| The Armory | ✅ Complete | CRUD for apps, templates, downloads, courses, ebooks |
| The Den (Blog) | ✅ Complete | Tiptap rich text editor with full SEO, YouTube embeds, **AI cover image generation**, draft/published states |
| Messages | ✅ Complete | View/manage contact form messages with status workflow |
| Submissions | ✅ Complete | View/manage submissions with status workflow |
| Newsletter | ✅ Complete | View subscribers, export emails, unsubscribe management, **bulk email sending** |
| Email Templates | ✅ Complete | Customize all email notifications with Tiptap HTML editor |
| Investors | ✅ Complete | Portal settings, access codes, slate projects, documents, inquiries |

### Investor Portal Sections

| Section | Status | Description |
|---------|--------|-------------|
| Overview | ✅ Complete | Studio philosophy, development-first mindset |
| Development Slate | ✅ Complete | Projects with poster, hook, description, budget range + **Request Materials chips** |
| Investment Model | ✅ Complete | Project-by-project and slate investment options |
| Expression of Interest | ✅ Complete | Private inquiry form with **conditional project dropdown** |

*Note: Track Record and Documents sections removed per user request. Documents are now accessed via Request Materials chips within each project.*

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
- `investor_inquiries` - Expression of interest forms (with project selection)
- `document_downloads` - Download logging
- `document_requests` - **New:** Document request tracking (investor details for pitch decks, screeners, scripts)

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
| OpenAI GPT Image 1 | ✅ Active | AI cover image generation for blog posts via Emergent LLM key |

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
- **Investor Portal** - Password + access code auth, 4 sections, admin controls
- **Newsletter** - Functional subscription connected to database
- **Admin Submissions tab** - View/manage with status workflow
- **Admin Investors tab** - Full portal management with sub-tabs
- **Admin Messages tab** - View contact form submissions
- **Admin Newsletter tab** - View subscribers with export, unsubscribe, and bulk email features
- **Bulk Email Campaigns** - Compose and send newsletters to all subscribers with test mode
- **Email Campaign Analytics** - Track sent, delivered, opened, clicked, bounced with open/click rates
- **Admin Analytics Dashboard** - Overview stats, recent activity feed, campaign performance
- **Resend Webhook Integration** - Real-time email event tracking
- **Blog YouTube Embed** - Tiptap YouTube extension for embedding videos
- **Resend Email Integration** - Welcome emails for newsletter signups (requires domain verification)
- **AI Cover Image Generation** - GPT-powered cover images for blog posts
- **Lead Magnet Popup** - Producer's Playbook download with newsletter signup

### February 2026 - Investor Portal Overhaul
- **Removed Track Record section** - Investors can find this via IMDB/research
- **Removed standalone Documents section** - Documents now per-project
- **Request Materials in Development Slate** - Per-project chips: Request Pitch Deck, Request Screener, Request Script
- **Smart Download System:**
  - **Personal Access Code users** → Direct "Download" buttons, auto-watermarked with their name, instant download
  - **Global password users** → "Request" form (name, email, company, phone) then watermarked download
- **Auto PDF Watermarking** - All downloaded PDFs are watermarked with investor name, company, timestamp
- **Download Logging** - Every download is logged with investor details and timestamp
- **Project Selection in Expression of Interest** - Conditional dropdown when "Single Project" is selected
- **AI Image URL Fix** - Fixed broken images by correcting API path

---

## Known Limitations

1. **File uploads** - Stored locally in `/app/backend/uploads/`
2. **Rate limits** - Resend free tier allows 2 emails/second

---

## Backlog / Future Tasks

### P1 - High Priority
- [ ] E-commerce for The Armory (payment integration)
- [ ] Upload actual PDF documents for projects in admin (pitch decks, scripts, screeners)

### P2 - Medium Priority  
- [ ] Admin view for document download logs (who downloaded what, when)
- [ ] Investor credential management UI improvements

### P3 - Low Priority
- [ ] Social media integration
- [ ] SEO improvements
- [ ] Performance optimization
- [ ] Abstract font-['Cinzel'] into global CSS class

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
