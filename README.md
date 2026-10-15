# Chef Patrick's Kitchen

The public website and admin dashboard for Chef Patrick's Kitchen, a Filipino and Chinese catering company in Caloocan and Tondo (since 2009).

- **Website**: home, about, menu, packages, events, venues, gallery and contact, with GSAP scroll animation, Lenis smooth scrolling and page transitions.
- **Admin** (`/admin`): dashboard with revenue chart and statistics; management of the menu, catering packages, events, reservations, inquiries, gallery, testimonials, venues and website settings; staff accounts.
- **Backend**: REST API (Next.js route handlers) on **PostgreSQL** (Supabase).

## Stack

| Part | Technology |
|---|---|
| Framework | Next.js 15 (App Router) + React 19 + TypeScript |
| Styling | Tailwind CSS 4 |
| Website motion | GSAP 3 (ScrollTrigger, SplitText, Flip), Lenis |
| Admin UI | Framer Motion, Recharts, Phosphor Icons |
| Database | PostgreSQL 13+ / Supabase via `pg` (parameterized queries only) |
| Auth | Email + password (bcrypt), database sessions in an httpOnly cookie, admin/staff roles |

The project keeps one Next.js app for both the website and the backend: the API lives in `src/app/api`, the database code in `src/lib/server`, and the React admin in `src/app/admin` + `src/components/admin`.

## Requirements

- Node.js 20 or newer
- A PostgreSQL database: a free [Supabase](https://supabase.com) project, or PostgreSQL installed locally

## Setup

```bash
npm install
cp .env.example .env.local      # then fill in the values (see below)
npm run db:setup                # creates the tables, loads the content and the first admin account
npm run db:demo                 # optional: sample reservations, events, inquiries for the dashboard
npm run dev                     # http://localhost:3000  ·  admin: http://localhost:3000/admin
```

### Environment variables (`.env.local`)

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string. Supabase: **Connect** → **Session pooler**, with your database password filled in |
| `ADMIN_NAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` | First admin account, created by `npm run db:setup` when no users exist (password: 8+ characters) |
| `ADMIN_SECRET` | Long random string (generate with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`) |
| `UPLOAD_DIR` | Optional. Where admin photo uploads are stored (default `./uploads`) |

Never commit `.env.local`. It is git-ignored.

### Using Supabase

1. Create a project at supabase.com and note the **database password** you choose.
2. Open **Connect** (top of the dashboard) → **Session pooler**, copy the connection string, put your password in place of `[YOUR-PASSWORD]`, and set it as `DATABASE_URL` in `.env.local`.
3. Run `npm run db:setup` (and `npm run db:demo` for sample dashboard data).

Alternatively, paste `database/schema.sql` and then `database/seed.sql` into the Supabase **SQL Editor** and run them; then run `npm run db:setup` once to create the admin account.

Every table has Row Level Security switched on with no policies, so Supabase's public REST API can't read them (the admin users and customer bookings stay private). The app connects with the database password and is not affected.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Development server. Run only one at a time; if it reports "Module not found" after big changes, stop it, delete `.next` and start again. |
| `npm run build` / `npm start` | Production build and server |
| `npm run typecheck` | TypeScript check |
| `npm run db:setup` | Create the tables and load the content (safe to re-run). `-- --reset-content` reloads `database/seed.sql` |
| `npm run db:demo` | Add sample dashboard data (dates relative to today). `-- --clear` removes it |

## Demo data

`npm run db:demo` adds clearly marked sample records (`is_demo = 1`): reservations, events with contract amounts (which drive the revenue chart), inquiries, and sample prices and sales on five dishes. Remove them with **Website Settings → Demo data → Remove demo data** or `npm run db:demo -- --clear`. Real content (menu, packages, gallery, venues) is never touched.

**Also sample, and to confirm with the business before launch:** catering package prices (the old site published none) and the testimonials (marked "Sample" on the website).

## Project structure

```text
database/
  schema.sql            tables (users, sessions, menu, packages, events, reservations, inquiries, gallery, venues, testimonials, settings)
  seed.sql              the site's real content (menu, packages, gallery, venues, settings)
scripts/
  db-setup.mjs          applies schema + seed, creates the first admin
  db-demo.mjs           adds / clears demo dashboard data
src/
  app/
    (site)/             public pages
    admin/              admin pages (login + (panel) for signed-in pages)
    api/
      auth/             login, logout, me
      admin/            REST endpoints (dashboard, revenue, search, notifications, menu, packages,
                        events, reservations (+ CSV export), inquiries, gallery, venues, testimonials,
                        settings, users, account, uploads, demo)
      reservations/     public booking form
      inquiries/        public "ask us anything" form
      uploads/[name]/   serves uploaded photos
  components/
    admin/              shell (sidebar, header), dashboard panels, forms, management pages, UI kit
    home/ layout/ motion/ forms/ ...   public website
  lib/
    server/             PostgreSQL pool, auth, validation, http helpers, uploads, repositories (SQL)
    admin/api.ts        typed API client for the admin
    content.ts          public-site content (reads the database, falls back to built-in content)
    data/               built-in content (used for seeding and as a fallback)
  types/                shared types
```

## API conventions

- Responses: `{ ok: true, data, meta? }` or `{ ok: false, error, fields? }` (`fields` holds per-field validation messages).
- Lists support `?page=&pageSize=`, `?q=` search, `?status=` filters and `?sort=&dir=asc|desc` where useful.
- `/api/admin/*` requires a signed-in session; deleting records and changing website settings or staff accounts require the **admin** role.
- Login, password changes and the public forms are rate limited. Uploads are checked by file content (JPEG, PNG, WebP, AVIF), max 8 MB.

## Deployment notes

Run on a server that keeps files and can reach the database (a VPS, or your own machine with `npm run build && npm start`). Set the environment variables there, run `npm run db:setup` once, and back up both the database and the `uploads/` folder regularly.
