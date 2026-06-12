-- Trove: initial schema, RLS, signup trigger, grants, and storage policies.
-- Run this in the Supabase SQL editor.
--
-- Prereqs (dashboard):
--   1. Create the private storage bucket "trove-media" (Storage → New bucket).
--   2. Expose the "trove" schema (Settings → API → Exposed schemas) after
--      this migration creates it.

create extension if not exists "citext";
create extension if not exists "pgcrypto"; -- for gen_random_uuid()

create schema if not exists trove;

-- ---------- enums ----------
do $$ begin
  create type trove.gem_type as enum ('image', 'video', 'link');
exception when duplicate_object then null; end $$;

-- ---------- tables ----------
create table if not exists trove.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text check (display_name is null or length(display_name) between 1 and 80),
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists trove.troves (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (length(name) between 1 and 80),
  description text,
  cover_gem_id uuid,
  position int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists trove.gems (
  id uuid primary key default gen_random_uuid(),
  trove_id uuid not null references trove.troves(id) on delete cascade,
  -- Denormalized from troves.user_id: keeps RLS predicates join-free.
  user_id uuid not null references auth.users(id) on delete cascade,
  type trove.gem_type not null,
  storage_path text,
  mime_type text,
  url text,
  description text,
  og_title text,
  og_description text,
  og_thumbnail_url text,
  og_site_name text,
  width int check (width is null or width > 0),
  height int check (height is null or height > 0),
  position int not null default 0,
  created_at timestamptz not null default now(),
  -- Either it's a file gem (storage_path set) or a link (url set).
  constraint gem_payload_present check (
    (type in ('image', 'video') and storage_path is not null)
    or (type = 'link' and url is not null)
  )
);

create table if not exists trove.tags (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name citext not null check (length(name) between 1 and 40),
  unique (user_id, name)
);

create table if not exists trove.gem_tags (
  gem_id uuid not null references trove.gems(id) on delete cascade,
  tag_id uuid not null references trove.tags(id) on delete cascade,
  primary key (gem_id, tag_id)
);

-- Add the deferred FK from troves.cover_gem_id once gems exists.
do $$ begin
  alter table trove.troves
    add constraint troves_cover_gem_fk
    foreign key (cover_gem_id) references trove.gems(id) on delete set null;
exception when duplicate_object then null; end $$;

-- ---------- indexes ----------
create index if not exists troves_user_position_idx
  on trove.troves (user_id, position);
create index if not exists gems_trove_position_idx
  on trove.gems (trove_id, position);
create index if not exists gems_user_created_idx
  on trove.gems (user_id, created_at desc);
create index if not exists gem_tags_tag_idx
  on trove.gem_tags (tag_id);
create index if not exists tags_user_idx
  on trove.tags (user_id);

-- ---------- updated_at trigger ----------
create or replace function trove.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

drop trigger if exists troves_set_updated_at on trove.troves;
create trigger troves_set_updated_at
  before update on trove.troves
  for each row execute function trove.set_updated_at();

drop trigger if exists profiles_set_updated_at on trove.profiles;
create trigger profiles_set_updated_at
  before update on trove.profiles
  for each row execute function trove.set_updated_at();

-- ---------- signup trigger ----------
-- Prefills the profile from Google OAuth metadata on first sign-in.
create or replace function trove.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into trove.profiles (id, display_name, avatar_url)
  values (
    new.id,
    nullif(new.raw_user_meta_data ->> 'full_name', ''),
    nullif(new.raw_user_meta_data ->> 'avatar_url', '')
  )
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function trove.handle_new_user();

-- ---------- RLS ----------
alter table trove.profiles enable row level security;
alter table trove.troves   enable row level security;
alter table trove.gems     enable row level security;
alter table trove.tags     enable row level security;
alter table trove.gem_tags enable row level security;

-- profiles: self-select, self-update (insert happens via the signup trigger).
do $$ begin
  create policy "profiles select own" on trove.profiles
    for select using (id = (select auth.uid()));
  create policy "profiles update own" on trove.profiles
    for update using (id = (select auth.uid()))
    with check (id = (select auth.uid()));
exception when duplicate_object then null; end $$;

-- troves: self-only, all verbs.
do $$ begin
  create policy "troves select own" on trove.troves
    for select using (user_id = (select auth.uid()));
  create policy "troves insert own" on trove.troves
    for insert with check (user_id = (select auth.uid()));
  create policy "troves update own" on trove.troves
    for update using (user_id = (select auth.uid()))
    with check (user_id = (select auth.uid()));
  create policy "troves delete own" on trove.troves
    for delete using (user_id = (select auth.uid()));
exception when duplicate_object then null; end $$;

-- gems: self-only, all verbs.
do $$ begin
  create policy "gems select own" on trove.gems
    for select using (user_id = (select auth.uid()));
  create policy "gems insert own" on trove.gems
    for insert with check (user_id = (select auth.uid()));
  create policy "gems update own" on trove.gems
    for update using (user_id = (select auth.uid()))
    with check (user_id = (select auth.uid()));
  create policy "gems delete own" on trove.gems
    for delete using (user_id = (select auth.uid()));
exception when duplicate_object then null; end $$;

-- tags: self-only, all verbs.
do $$ begin
  create policy "tags select own" on trove.tags
    for select using (user_id = (select auth.uid()));
  create policy "tags insert own" on trove.tags
    for insert with check (user_id = (select auth.uid()));
  create policy "tags update own" on trove.tags
    for update using (user_id = (select auth.uid()))
    with check (user_id = (select auth.uid()));
  create policy "tags delete own" on trove.tags
    for delete using (user_id = (select auth.uid()));
exception when duplicate_object then null; end $$;

-- gem_tags: scoped via the parent gem's owner.
do $$ begin
  create policy "gem_tags select own" on trove.gem_tags
    for select using (
      exists (
        select 1 from trove.gems g
        where g.id = gem_id and g.user_id = (select auth.uid())
      )
    );
  create policy "gem_tags insert own" on trove.gem_tags
    for insert with check (
      exists (
        select 1 from trove.gems g
        where g.id = gem_id and g.user_id = (select auth.uid())
      )
    );
  create policy "gem_tags delete own" on trove.gem_tags
    for delete using (
      exists (
        select 1 from trove.gems g
        where g.id = gem_id and g.user_id = (select auth.uid())
      )
    );
exception when duplicate_object then null; end $$;

-- ---------- grants ----------
-- Only authenticated users touch this schema; RLS scopes the rows.
grant usage on schema trove to authenticated;
grant all on all tables    in schema trove to authenticated;
grant all on all sequences in schema trove to authenticated;
alter default privileges in schema trove
  grant all on tables    to authenticated;
alter default privileges in schema trove
  grant all on sequences to authenticated;

-- ---------- storage policies ----------
-- Bucket "trove-media" must already exist (create it in the dashboard as
-- PRIVATE). Files are addressed at <user_id>/<uuid>.<ext>; the first path
-- segment must match the authenticated user.
do $$ begin
  create policy "trove: read own media" on storage.objects for select
    to authenticated
    using (
      bucket_id = 'trove-media'
      and (storage.foldername(name))[1] = (select auth.uid())::text
    );
  create policy "trove: insert own media" on storage.objects for insert
    to authenticated
    with check (
      bucket_id = 'trove-media'
      and (storage.foldername(name))[1] = (select auth.uid())::text
    );
  create policy "trove: delete own media" on storage.objects for delete
    to authenticated
    using (
      bucket_id = 'trove-media'
      and (storage.foldername(name))[1] = (select auth.uid())::text
    );
exception when duplicate_object then null; end $$;
