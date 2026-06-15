create table if not exists public.keyboard_parts (
  id text primary key,
  type text not null,
  name text not null,
  data jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists keyboard_parts_type_name_unique
  on public.keyboard_parts (type, lower(name));

create table if not exists public.keyboard_builds (
  id text primary key,
  user_id text not null default 'demo-user',
  name text not null,
  data jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists keyboard_builds_user_created_idx
  on public.keyboard_builds (user_id, created_at desc);

alter table public.keyboard_parts enable row level security;
alter table public.keyboard_builds enable row level security;

drop policy if exists "Public read keyboard parts" on public.keyboard_parts;
create policy "Public read keyboard parts"
  on public.keyboard_parts for select
  using (true);

drop policy if exists "Public read demo builds" on public.keyboard_builds;
create policy "Public read demo builds"
  on public.keyboard_builds for select
  using (user_id = 'demo-user');

-- Writes are performed from Next.js Route Handlers with SUPABASE_SERVICE_ROLE_KEY.
