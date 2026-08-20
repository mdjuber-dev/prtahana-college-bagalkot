# Prarthana PU College - Architecture

## Summary

Full-stack web application for Prarthana PU Science College, Bagalkot. Single-repo deployment with a React + Vite frontend and Express + Node.js backend, both serving from the same origin in production. PostgreSQL (Neon) for data persistence. Supabase Edge Functions for Google Sheets integration.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                          CLIENTS                                   │
│                                                                     │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐         │
│  │   Browser    │    │  Mobile App  │    │  Admin Panel │         │
│  │  (Public)    │    │  (Any)       │    │  (Protected) │         │
│  └──────┬───────┘    └──────┬───────┘    └──────┬───────┘         │
│         │                   │                   │                 │
└─────────┼───────────────────┼───────────────────┼─────────────────┘
          │                   │                   │
          ▼                   │                   │
  ┌──────────────────────────────────────────────────┐ │
  │              PRODUCTION (single origin)          │ │
  │                                                  │ │
  │  ┌──────────────────┐  ┌──────────────────┐     │ │
  │  │  Express API     │  │ Static Assets    │     │ │
  │  │  (server/)       │  │ (public/)         │     │ │
  │  │                  │  │                   │     │ │
  │  │  /api/*          │  │  /images/*        │     │ │
  │  │  /sitemap.xml    │  │  /logo.png         │     │ │
  │  │  SPA fallback    │  │  /favicon-*        │     │ │
  │  └────────┬─────────┘  └──────────────────┘     │ │
  │           │                                      │ │
  │           ▼                                      │ │
  │  ┌────────────────────────────────────────┐     │ │
  │  │       PostgreSQL (Neon)                │     │ │
  │  │                                        │     │ │
  │  │  Tables:                               │     │ │
  │  │   - admissions                        │     │ │
  │  │   - announcements                     │     │ │
  │  │   - general_enquiries                 │     │ │
  │  │   - career_jobs                      │     │ │
  │  │   - career_applications              │     │ │
  │  │   - site_cms                         │     │ │
  │  │   - dashboard_configs                │     │ │
  │  │   - gallery                          │     │ │
  │  │   - admin_users                      │     │ │
  │  └────────────────────────────────────────┘     │ │
  └──────────────────────────────────────────────────┘ │
          │                                           │
          └───────────────────────────────────────────┘
                           │
          ┌────────────────▼────────────────┐
          │          DEV MODE              │
          │                                  │
          │  Vite Dev Server (5173)         │
          │   ── proxy /api ─→ Express 3000  │
          │   ── proxy /images ─→ 3000      │
          │                                  │
          │  Express Backend (3000)          │
          │   ── PostgreSQL (Neon)           │
          └──────────────────────────────────┘
```

## Components

### Frontend (`src/`)

- **Framework**: React 18 + TypeScript + Vite 5
- **Routing**: React Router DOM v6
- **Styling**: Tailwind CSS with custom design tokens
- **State**: React Context (`cms-context.tsx`), localStorage for admin auth
- **Build**: `npm run build` → `dist/` (2484 modules, static files)

**Key directories:**
- `src/pages/` - Route page components (public + admin)
- `src/components/` - Reusable UI components and section blocks
- `src/lib/` - API client, types, utilities, config
- `src/lib/api.ts` - Centralized API client with JWT auth, retry logic

### Backend (`server/index.js`)

- **Runtime**: Node.js + Express
- **Database**: PostgreSQL via `pg` Pool (Neon)
- **Auth**: JWT (HMAC-SHA256), `ADMIN_PASSWORD` env var, `admin_users` table for email validation
- **Static Serving**: Serves `public/` directory and `dist/` (production)
- **SPA Fallback**: Catch-all route serves `index.html` for non-API routes

**API Endpoints:**

| Resource | GET | POST | PATCH | DELETE | Auth |
|---|---|---|---|---|---|
| `/api/health` | ✓ | | | | None |
| `/api/admissions` | ✓ | ✓ (public) | ✓ | ✓ | Admin |
| `/api/announcements` | ✓ | ✓ | ✓ | ✓ | Admin (write), Public (read) |
| `/api/general-enquiries` | ✓ | ✓ (public) | ✓ | ✓ | Admin |
| `/api/enquiries` | ✓ | | | | Admin |
| `/api/career-jobs` | ✓ | ✓ | ✓ | ✓ | Admin (write), Public (read) |
| `/api/career-applications` | ✓ | ✓ (public) | ✓ | ✓ | Admin |
| `/api/site-cms` | ✓ | | | | Public (read), Admin (write) |
| `/api/site-cms/:key` | ✓ | | ✓ (PUT) | | Public (read), Admin (write) |
| `/api/dashboard-configs` | ✓ | ✓ | ✓ | | Admin |
| `/api/gallery` | ✓ | ✓ | ✓ | ✓ | Admin (write), Public (read) |
| `/sitemap.xml` | ✓ | | | | None |

### Database (PostgreSQL on Neon)

- **Migrations**: `supabase/migrations/` (20 files, Chronological naming)
- **Schema**: All tables in `public` schema with Row Level Security (RLS)
- **Admin Access**: `admin_users` table + `is_admin()` function for auth checks

### Supabase Edge Functions

- `submit-to-google-sheets` - Forwards admission/enquiry data to Google Apps Script
- Deployed for production; not needed in local dev (Express handles everything)

### Environment Variables

| Variable | Dev | Production |
|---|---|---|
| `DATABASE_URL` | Neon PostgreSQL | Neon PostgreSQL |
| `ADMIN_PASSWORD` | `admin@prarthanapu` | (set via Render/Neon) |
| `VITE_API_BASE_URL` | `http://localhost:3000` | `https://prarthanapucollegebagalkot.in` |
| `PORT` | `3000` | `3000` (via Render) |
| `SESSION_SECRET` | (from .env) | (set via Render) |

## Data Flow

### Public Admission Form Submission
```
1. User fills form → frontend POSTs to /api/admissions
2. server/index.js sanitizeAdmissionPayload() validates input
3. insertRow("admissions", payload, admissionColumns) inserts to PostgreSQL
4. PostgreSQL auto-generates application_id, reference_code
5. Response returns inserted row with all defaults applied
6. (Optional) Client triggers Supabase Edge Function → Google Sheets
```

### Admin Panel
```
1. Admin logs in → POST /api/auth/login → receives JWT token
2. Token stored in localStorage
3. All admin API calls include Bearer token
4. requireAdmin middleware verifies token via verifyToken()
5. Admin can CRUD: admissions, announcements, enquiries, jobs, applications, CMS, gallery, dashboard
```

### CMS Configuration
```
1. Public pages read CMS via GET /api/site-cms/:key (no auth)
2. Admin edits via PUT /api/site-cms/:key (upsert via INSERT ON CONFLICT)
3. CMS stores JSONB `value` column with nested config
4. Frontend merges CMS data with hardcoded siteConfig defaults
```

### Announcement Popup
```
1. On any non-admin page, AnnouncementPopup component mounts
2. Fetches GET /api/announcements (public, status='published')
3. Finds first non-dismissed featured/published announcement
4. Shows popup after 3-second delay
5. User can dismiss (localStorage) or click CTA
```

## Deployment

- **Frontend**: Built via `npm run build`, static files served by Express
- **Backend**: `node server/index.js` on Render (port from env)
- **Database**: Neon PostgreSQL (serverless)
- **Domain**: `prarthanapucollegebagalkot.in`
- **SSL**: Handled by Render
