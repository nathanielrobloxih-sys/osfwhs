-- ============================================================
--  OSFUSA White House - Supabase schema (shares the C-SPAN project)
--  All tables prefixed with wh_ so nothing collides with C-SPAN's tables
-- ============================================================

-- 1. Posts (News / Executive Orders / Memos)
create table if not exists wh_posts (
  id uuid primary key default gen_random_uuid(),
  category text not null check (category in ('news', 'eo', 'memo')),
  title text not null,
  body text not null,
  image_url text,
  eo_number text,
  source text default 'web',
  pinned boolean default false,
  created_at timestamptz default now()
);

-- 2. Gallery
create table if not exists wh_gallery (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  caption text,
  created_at timestamptz default now()
);

-- 3. Leadership roster
create table if not exists wh_leadership (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  title text not null,
  photo_url text,
  sort_order int default 0
);

-- 4. Settings (key/value store)
create table if not exists wh_settings (
  key text primary key,
  value text
);
insert into wh_settings (key, value) values
  ('app_status', 'open'),
  ('app_closed_message', 'Applications are currently closed. Check back soon.'),
  ('open_positions', ''),
  ('discord_invite', '')
on conflict (key) do nothing;

-- 5. Applications
create table if not exists wh_applications (
  id uuid primary key default gen_random_uuid(),
  roblox_username text not null,
  discord_username text not null,
  roblox_profile_link text,
  timezone text,
  has_mic text,
  position text,
  wh_experience text,
  strength_weakness text,
  why_hire text,
  ack_no_contact text,
  ack_denied_anytime text,
  ack_no_reason text,
  status text default 'Submitted',
  notes text,
  submitted_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 6. Custom staff roles for the White House site specifically
create table if not exists wh_admin_roles (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  permissions text[] not null default '{}'
);

-- 7. Staff profiles for the White House site - tied to the SAME Supabase Auth
--    users as C-SPAN (one shared Auth system per project), but a separate
--    profile row/role here so WH access is independent of C-SPAN access.
--    Use a different email per site for the same person if they need both
--    (e.g. you@osfcspan.local vs you@osfwh.local).
create table if not exists wh_staff_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  role text not null default 'Owner'
);

-- ============================================================
--  Row Level Security - same model as C-SPAN: public reads,
--  authenticated-only writes.
-- ============================================================

alter table wh_posts enable row level security;
alter table wh_gallery enable row level security;
alter table wh_leadership enable row level security;
alter table wh_settings enable row level security;
alter table wh_applications enable row level security;
alter table wh_admin_roles enable row level security;
alter table wh_staff_profiles enable row level security;

create policy "public read wh_posts" on wh_posts for select using (true);
create policy "authenticated write wh_posts" on wh_posts for insert with check (auth.role() = 'authenticated');
create policy "authenticated update wh_posts" on wh_posts for update using (auth.role() = 'authenticated');
create policy "authenticated delete wh_posts" on wh_posts for delete using (auth.role() = 'authenticated');

create policy "public read wh_gallery" on wh_gallery for select using (true);
create policy "authenticated write wh_gallery" on wh_gallery for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "public read wh_leadership" on wh_leadership for select using (true);
create policy "authenticated write wh_leadership" on wh_leadership for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "public read wh_settings" on wh_settings for select using (true);
create policy "authenticated write wh_settings" on wh_settings for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "public insert wh_applications" on wh_applications for insert with check (true);
create policy "public read wh_applications" on wh_applications for select using (true);
create policy "authenticated update wh_applications" on wh_applications for update using (auth.role() = 'authenticated');

create policy "authenticated read wh_admin_roles" on wh_admin_roles for select using (auth.role() = 'authenticated');
create policy "authenticated write wh_admin_roles" on wh_admin_roles for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "authenticated read wh_staff_profiles" on wh_staff_profiles for select using (auth.role() = 'authenticated');

-- ============================================================
--  Bootstrap your first WH Owner account (one-time, manual):
--  1. Since "Confirm email" is likely already off for osfcspan, skip that step.
--  2. Authentication -> Users -> Add User (use a WH-specific email,
--     e.g. you@osfwh.local, even if it's the same person as your C-SPAN login)
--  3. Copy that user's ID, then run:
--     insert into wh_staff_profiles (id, email, role)
--     values ('PASTE_USER_ID_HERE', 'you@osfwh.local', 'Owner');
-- ============================================================
