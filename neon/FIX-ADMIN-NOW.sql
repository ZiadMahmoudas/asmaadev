-- TIGRESS one-time repair for an existing site_admins table created with UUID user_id.
-- Run on database: neondb.

-- Existing RLS policies depend on user_id, so drop them before changing the column type.
drop policy if exists "Admins can read own admin row" on public.site_admins;
drop policy if exists "Admins can insert site content" on public.site_content;
drop policy if exists "Admins can update site content" on public.site_content;

-- Neon Managed Better Auth user IDs are text. Make the CMS admin key match neon_auth.user.id.
alter table public.site_admins
  alter column user_id type text
  using user_id::text;

-- Recreate the policies using text IDs.
create policy "Admins can read own admin row"
on public.site_admins for select
to authenticated
using ((select auth.user_id()) = user_id);

create policy "Admins can insert site content"
on public.site_content for insert
to authenticated
with check (
  exists (
    select 1 from public.site_admins a
    where a.user_id = (select auth.user_id())
  )
);

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

-- Add Asma's existing Neon Auth user as an admin.
insert into public.site_admins(user_id)
select id
from neon_auth.user
where lower(email) = lower('asma@gmail.com')
on conflict (user_id) do nothing;

-- Verification: this should return one row for asma@gmail.com.
select a.user_id, u.email
from public.site_admins a
join neon_auth.user u on u.id = a.user_id
where lower(u.email) = lower('asma@gmail.com');
