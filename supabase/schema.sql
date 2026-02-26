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
