# BTWN (MVP)

Simple UCLA small-business directory built with Next.js + Supabase.

## 1) Environment

Copy and fill env vars:

```bash
cp .env.example .env.local
```

Required values:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_SECRET`

## 2) Database setup (Supabase SQL editor)

Run:

```sql
-- see full file: supabase/schema.sql
create table if not exists public.businesses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null,
  description text not null default '',
  instagram text,
  website text,
  phone text,
  email text,
  location text not null,
  created_at timestamptz not null default now()
);
```

## 3) Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## 4) Project structure (where code goes)

- `app/`:
  - Frontend pages and UI
  - Examples: `app/page.js`, `app/explore/page.js`, `app/business/[id]/page.js`
- `app/api/`:
  - Backend API routes (server code)
  - Examples: `app/api/businesses/route.js`, `app/api/businesses/[id]/route.js`
- `lib/`:
  - Shared server helpers and business logic
  - Examples: Supabase client setup, payload normalization/validation
- `supabase/`:
  - Database SQL files and schema docs
  - Example: `supabase/schema.sql`
- `.env.local`:
  - Local secrets/keys only (never commit)

## Included routes/pages

- Home: `/`
- Explore: `/explore`
- Detail: `/business/:id`
- Admin add form: `/admin/add-business`
- API list/create: `/api/businesses`
- API detail: `/api/businesses/:id`
