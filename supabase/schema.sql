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
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.businesses
  add column if not exists owner_id uuid,
  add column if not exists updated_at timestamptz not null default now();

create index if not exists businesses_owner_id_idx on public.businesses(owner_id);
