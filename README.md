# BTWN (MVP)

Simple UCLA small-business directory built with Next.js + Supabase.

## 1) Environment

Copy and fill env vars:
#redploy1
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

`businesses` now includes owner and image fields used for account-based editing and uploads:
- `owner_id`
- `profile_image_url`, `gallery_image_urls` (for onboarding uploads)

If your table already existed, re-run `supabase/schema.sql` to apply the `alter table ... add column if not exists ...` statements.

**Storage (optional):** Profile and gallery photos are stored in Supabase Storage. The API creates the `business-images` bucket on first upload if it doesn’t exist. If you see storage errors, create a public bucket named `business-images` in Supabase Dashboard → Storage.

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
- `/business/:id?review=1` Review mode
- `/business/:id/edit` Owner-only edit page
- `/admin/add-business` Onboarding + add business (login required)
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

- If you see `Schema missing owner_id`:
  1. Run this in Supabase SQL Editor:
     ```sql
     alter table public.businesses add column if not exists owner_id uuid;
     create index if not exists businesses_owner_id_idx on public.businesses(owner_id);
     ```
  2. Retry add/edit requests.
