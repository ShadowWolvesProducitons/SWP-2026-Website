# Shadow Wolves Productions - Product Requirements Document

## Original Problem Statement
Professional, cinematic website for "Shadow Wolves Productions" evolved into a full-stack platform with React frontend, FastAPI backend, MongoDB. Features include public site, admin console, investor portal, email notifications, AI tools, analytics, and lead magnet.

## Architecture
- **Frontend:** React + TailwindCSS + Framer Motion + Tiptap
- **Backend:** FastAPI + Motor (async MongoDB)
- **Database:** MongoDB
- **Integrations:** Resend (email), OpenAI via emergentintegrations (AI image gen), pypdf + reportlab (PDF watermark)

## What's Been Implemented (as of Feb 10, 2026)

### Product Pages — Two-Column Layout
- **Desktop:** Left column (scrollable content), Right column (sticky purchase block)
- **Mobile:** Purchase block at top, sticky CTA bar at bottom
- **Purchase block:** Product name, positioning line, price, primary CTA, demo link, micro reassurance, Share, Save for Later

### Armory Admin Modal — Tabbed Product Page Builder
- **5 Tabs:** Basics, Content, Media, Access, SEO
- **Quick Fill Templates:** When creating a new product, a "Quick Fill" button pre-populates all Content fields with type-specific prompts (Apps, Courses, Templates, Downloads, eBooks). Each template includes structured placeholder copy for What This Is, Core Actions, What You Get, Features, How It Works, Who It's For, Why It Works, Tags, and CTA. Auto-switches to Content tab after applying.
- **Content tab:** Hero/Above the Fold, What This Is, Core Actions, What You Get, Features, How It Works, Who It's For, Why It Works, Final CTA, Tags
- **SEO tab:** Focus Keyword, SEO Title/Description with char count bars, OG Image, Google Preview, Social Card Preview, 9-item SEO Checklist, Generate SEO button
- "What It's Not" section removed from Content tab per user request

### Other Completed Features
- Full public site (Home, About, Films, Armory, Den/Blog, Work With Us, Contact)
- Admin console with Activity tab (merged Messages/Submissions/CineConnect)
- Investor portal with NDA, smart document downloads, Studio Updates (private blog)
- CineConnect Register Interest button
- Hidden admin link (triple-click footer company name)
- AI image generation, lead magnet popup, genre filter dropdown
- Database query optimizations, deployment readiness

### Credentials
- Admin: /admin, Password: shadowwolves2024
- Investor: /investors, Password: investor2024
- Test Access Code: SMITH2024

## Prioritized Backlog

### P1
- Email System Expansion (4 templates)
- E-commerce for The Armory (Stripe)

### P2
- CineConnect Database (cast/crew)
- CSS refactoring (font-['Cinzel'] to global class)
- Producer's Playbook PDF → /frontend/public/assets
