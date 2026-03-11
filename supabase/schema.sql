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
  owner_id uuid,
  owner_email text,
  profile_image_url text,
  gallery_image_urls text[] default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.businesses
  add column if not exists owner_id uuid,
  add column if not exists owner_email text,
  add column if not exists profile_image_url text,
  add column if not exists gallery_image_urls text[] default '{}',
  add column if not exists updated_at timestamptz not null default now();

create index if not exists businesses_owner_id_idx on public.businesses(owner_id);
