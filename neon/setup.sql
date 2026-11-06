-- TIGRESS CMS / Neon setup
-- 1) Enable Managed Better Auth and Data API for this branch first.
-- 2) Run this file in Neon Console -> SQL Editor on database: neondb.
-- IMPORTANT: your current Managed Better Auth endpoint is /neondb/auth, so keep CMS tables in neondb too.

create table if not exists public.site_admins (
  user_id text primary key,
  created_at timestamptz not null default now()
);

create table if not exists public.site_content (
  site_id text primary key,
  content jsonb not null default '{}'::jsonb,
  version bigint not null default 0,
  updated_at timestamptz not null default now(),
  updated_by text
);

alter table public.site_admins enable row level security;
alter table public.site_content enable row level security;

-- Data API roles. Explicit grants keep the intent clear.
revoke all on table public.site_admins from anonymous, authenticated;
revoke all on table public.site_content from anonymous, authenticated;
grant select on table public.site_admins to authenticated;
grant select on table public.site_content to anonymous, authenticated;
grant insert, update on table public.site_content to authenticated;

-- Public website: anyone may read the CMS content row.
drop policy if exists "Public can read site content" on public.site_content;
create policy "Public can read site content"
on public.site_content for select
to anonymous, authenticated
using (true);

-- Signed-in user can only see their own admin membership row.
drop policy if exists "Admins can read own admin row" on public.site_admins;
create policy "Admins can read own admin row"
on public.site_admins for select
to authenticated
using ((select auth.user_id()) = user_id);

-- Only users listed in site_admins may publish content.
drop policy if exists "Admins can insert site content" on public.site_content;
create policy "Admins can insert site content"
on public.site_content for insert
to authenticated
with check (
  exists (
    select 1 from public.site_admins a
    where a.user_id = (select auth.user_id())
  )
);

drop policy if exists "Admins can update site content" on public.site_content;
create policy "Admins can update site content"
on public.site_content for update
to authenticated
using (
  exists (
    select 1 from public.site_admins a
    where a.user_id = (select auth.user_id())
  )
)
with check (
  exists (
    select 1 from public.site_admins a
    where a.user_id = (select auth.user_id())
  )
);

insert into public.site_content(site_id,content,version)
values ('main','{}'::jsonb,0)
on conflict (site_id) do nothing;

-- AFTER creating the admin user in Neon Auth, replace the email and run once:
-- insert into public.site_admins(user_id)
-- select id from neon_auth.user where email='admin@example.com'
-- on conflict (user_id) do nothing;

-- Verify:
-- select a.user_id, u.email
-- from public.site_admins a
-- join neon_auth.user u on u.id = a.user_id;
