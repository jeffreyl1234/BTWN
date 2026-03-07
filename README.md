# BTWN (MVP)

Simple UCLA small-business directory built with Next.js + Supabase.

## 1) Environment

Copy and fill env vars:

```bash
cp .env.example .env.local
```

Required values for data APIs:
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

Required values for signup/login in the UI:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` or `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY`

## 2) Database setup (Supabase SQL editor)

Run the full schema in [`supabase/schema.sql`](./supabase/schema.sql).

`businesses` now includes owner fields used for account-based editing:
- `owner_id`
- `owner_email`

If your table already existed, re-run `supabase/schema.sql` to apply the `alter table ... add column if not exists ...` statements.

## 3) Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## 4) Routes

- `/` Home
- `/explore` Browse businesses
- `/business/:id` Business detail
- `/business/:id/edit` Owner-only edit page
- `/admin/add-business` Add business (login required)
- `/signup` Account creation
- `/login` Login
- `/account` Owner dashboard

## 5) API routes

- `GET /api/businesses`
- `POST /api/businesses`
  - login required
  - creates owner-linked listings
- `GET /api/businesses/:id`
- `PATCH /api/businesses/:id` (owner-only)
- `GET /api/me/businesses` (owner dashboard)

## Troubleshooting

- If you see `Could not find the table 'public.businesses' in the schema cache`:
  1. Run the SQL in [`supabase/schema.sql`](./supabase/schema.sql) in Supabase SQL Editor.
  2. Wait a few seconds for schema cache refresh.
  3. Retry the request (or refresh the app).
