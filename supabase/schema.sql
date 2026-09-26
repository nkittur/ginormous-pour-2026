-- The Ginormous Pour: database schema.
-- Paste this whole file into the Supabase SQL editor and run it once.

create extension if not exists pgcrypto;

create table if not exists public.beers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  brewery text,
  style text,
  brought_by text,
  monster text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.raters (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.matches (
  id uuid primary key default gen_random_uuid(),
  rater_id uuid not null references public.raters(id),
  beer_a uuid not null references public.beers(id),
  beer_b uuid not null references public.beers(id),
  winner_id uuid not null references public.beers(id),
  margin int not null default 2 check (margin between 1 and 3),
  created_at timestamptz not null default now(),
  check (winner_id = beer_a or winner_id = beer_b),
  check (beer_a <> beer_b)
);

create index if not exists matches_created_at_idx on public.matches (created_at);

-- Party mode: anyone with the link can read everything and add rows.
-- Nobody can edit or delete through the anon key.
alter table public.beers enable row level security;
alter table public.raters enable row level security;
alter table public.matches enable row level security;

drop policy if exists "anon read beers" on public.beers;
drop policy if exists "anon add beers" on public.beers;
drop policy if exists "anon read raters" on public.raters;
drop policy if exists "anon add raters" on public.raters;
drop policy if exists "anon read matches" on public.matches;
drop policy if exists "anon add matches" on public.matches;

create policy "anon read beers"   on public.beers   for select to anon using (true);
create policy "anon add beers"    on public.beers   for insert to anon with check (true);
create policy "anon read raters"  on public.raters  for select to anon using (true);
create policy "anon add raters"   on public.raters  for insert to anon with check (true);
create policy "anon read matches" on public.matches for select to anon using (true);
create policy "anon add matches"  on public.matches for insert to anon with check (true);

-- To wipe the board for a new event, run (as the project owner):
--   truncate public.matches, public.raters, public.beers;
