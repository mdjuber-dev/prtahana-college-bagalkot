# Architecture — Prarthana PU Science College, Bagalkot

Production site: <https://prarthanapucollegebagalkot.in>

## Stack

| Layer | Technology | Hosting |
| --- | --- | --- |
| Frontend | React 18 + TypeScript + Vite | Cloudflare (static SPA) |
| Backend API | Node.js + Express | Render |
| Database | PostgreSQL | Neon (managed Postgres) |
| Media storage | PostgreSQL `media_uploads.data` (base64) + ephemeral disk cache | Neon / Render disk |
| Edge worker | Cloudflare Worker (SPA fallback) | Cloudflare |
| Secrets | Platform env vars only (`.env` is gitignored) | — |

## Repositories / Git remotes

- `origin` → `mdjuber-dev/prtahana-college-bagalkot.git` (primary working repo)
- `client` → `prarthanapusciencecollegeweb/prarthanaclgbgk.git`

## Request flow

```
Browser
  → Cloudflare (prarthanapucollegebagalkot.in)
       ├─ /assets, /images, robots.txt, sitemap.xml, static → served from Worker assets (dist)
       ├─ /admin, /about, … (SPA paths) → index.html (SPA fallback)
       └─ /api/*  → NOT proxied here; the browser calls the API directly:
                       https://prarthanaclgbgk.onrender.com/api/*
```

The frontend never exposes `/api` on the production domain. The React app calls the
Render backend directly over `https://prarthanaclgbgk.onrender.com`. CORS on the backend
allow-lists the production origin (`prarthanapucollegebagalkot.in` + `www`) and (dev only)
`localhost`.

## API base URL (important)

`src/lib/api.ts → getBaseUrl()` resolves the backend host:

1. `VITE_API_BASE_URL` (set in `.env.production` to the Render URL).
2. Vite injects it at build time; a mistyped or frontend-only host is **rejected in
   production builds** and falls back to the canonical Render URL, so a bad env value can
   never break the site.
3. Dev fallback: `http://localhost:3000`.

## Key frontend files

- `src/App.tsx` — route table; lazy-loaded pages; wraps everything in `CMSProvider`.
- `src/lib/api.ts` — fetch client, typed `ApiError` (status-aware), session-storage token.
- `src/lib/site-config.ts` — static config: name, address, contacts, **map coordinates**,
  `pageMeta` (per-route SEO), `mapsEmbed`, `mapsPlaceUrl`, `mapsDirectionsUrl`.
- `src/lib/cms-context.tsx` — loads `/api/site-cms`; falls back to static config; merges
  stored CMS over defaults.
- `src/lib/admin-auth.ts` — `getCurrentAdminAccess()`; a *network* failure does **not**
  sign the admin out (only 401/403 does).
- `src/components/shared/seo-head.tsx` — emits `<title>`, meta, canonical, OG/Twitter,
  robots, and JSON-LD. Dynamically resolves metadata for `/admin/*`,
  `/announcements/:id`, `/careers/:slug` so admin screens are `noindex` and dynamic pages
  get a self-canonical URL.
- `src/components/shared/navbar.tsx` — fluid sizing (clamp-based) so all 10 links + Apply
  Now fit on one row from 1280px up; collapses to a hamburger below that.
- `src/components/popup/announcement-popup.tsx` — shows the highest-priority **presentable**
  announcement once per browser session after a 3s delay; skips blank/incomplete rows.
- `src/pages/contact-page.tsx` — Google Map embed (zoom 17) using the official college
  coordinates, with "Open in Google Maps" and "Get Directions" links.

## Key backend files (`server/index.js`)

- `verifyToken(token)` — HMAC-signed stateless session (base64url payload + signature).
  Malformed/forged tokens return `null` → `401` (never a 500).
- `requireAdmin` — rejects unauthenticated requests with `401`.
- Public endpoints: `/api/health`, `/api/announcements`, `/api/gallery`, `/api/career-jobs`,
  `/api/site-cms`, `/api/media`, `/api/chatbot-knowledge`, `/api/contact`,
  `/api/admission`, `/api/career-applications`, `/api/general-enquiry`,
  `/api/auth/login`, `/api/auth/me`.
- Admin endpoints (require token): `/api/admissions`, `/api/enquiries`,
  `/api/career-applications*`, `/api/dashboard-configs`, `/api/admin-users`,
  `/api/announcements` (`?admin=true`), `/api/gallery/list` (`?admin=true`),
  `/api/media/library`, `/api/media/upload`, `/api/site-cms/*`, `/api/settings/*`,
  `/api/analytics/*`.
- Resume serving (`/api/career-applications/:id/resume`): **reads from the database first**
  (`media_uploads.data`), then falls back to the disk cache. This matters because Render's
  filesystem is ephemeral — without the DB read, resumes uploaded after a deploy would be
  lost.
- Seeding: `initAnnouncementsTable()` only inserts sample rows when the table is genuinely
  new (detected via `tableExists`). It never re-seeds an existing table, so production data
  is never overwritten or duplicated.

## Data safety rules (enforced during this audit)

- No production DB data was modified, deleted, or fabricated.
- Admin credentials were not changed.
- Seeding is guarded so it cannot re-inject demo rows into a live table.

## Build & deploy

```bash
npm install
npm run build        # tsc -b && vite build  → dist/
# Frontend: deploy dist/ to Cloudflare (existing Worker + custom domain)
# Backend:  push server/ to Render (auto-deploys), which runs `npm install && npm start`
```

`wrangler.toml` — Worker name `prarthana-pu-college`, assets dir `dist`,
`custom_domain = prarthanapucollegebagalkot.in`.
