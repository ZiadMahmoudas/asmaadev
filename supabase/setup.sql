-- TIGRESS CMS / Supabase setup
-- Run once in Supabase Dashboard -> SQL Editor.

create table if not exists public.site_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.site_content (
  site_id text primary key,
  content jsonb not null default '{}'::jsonb,
  version bigint not null default 0,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id)
);

alter table public.site_admins enable row level security;
alter table public.site_content enable row level security;

revoke all on table public.site_admins from anon, authenticated;
revoke all on table public.site_content from anon, authenticated;
grant select on table public.site_admins to authenticated;
grant select on table public.site_content to anon, authenticated;
grant insert, update on table public.site_content to authenticated;

-- Public website can read the one content row.
drop policy if exists "Public can read site content" on public.site_content;
create policy "Public can read site content"
on public.site_content for select
to anon, authenticated
using (true);

-- Signed-in users can only discover whether THEY are an admin.
drop policy if exists "Admins can read own admin row" on public.site_admins;
create policy "Admins can read own admin row"
on public.site_admins for select
to authenticated
using ((select auth.uid()) = user_id);

-- Only users listed in site_admins can publish content.
drop policy if exists "Admins can insert site content" on public.site_content;
create policy "Admins can insert site content"
on public.site_content for insert
to authenticated
with check (exists (select 1 from public.site_admins a where a.user_id = (select auth.uid())));

drop policy if exists "Admins can update site content" on public.site_content;
create policy "Admins can update site content"
on public.site_content for update
to authenticated
using (exists (select 1 from public.site_admins a where a.user_id = (select auth.uid())))
with check (exists (select 1 from public.site_admins a where a.user_id = (select auth.uid())));

insert into public.site_content(site_id,content,version)
values ('main','{}'::jsonb,0)
on conflict (site_id) do nothing;

-- Public CDN bucket for site images/PDFs. Upload/delete are still protected by RLS.
insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values (
  'tigress-media',
  'tigress-media',
  true,
  26214400,
  array['image/jpeg','image/png','image/webp','image/svg+xml','application/pdf']
)
on conflict (id) do update set
  public=excluded.public,
  file_size_limit=excluded.file_size_limit,
  allowed_mime_types=excluded.allowed_mime_types;

-- Storage permissions for admins only.
drop policy if exists "Tigress admins upload media" on storage.objects;
create policy "Tigress admins upload media"
on storage.objects for insert
to authenticated
with check (
  bucket_id='tigress-media'
  and exists (select 1 from public.site_admins a where a.user_id=(select auth.uid()))
);

drop policy if exists "Tigress admins update media" on storage.objects;
create policy "Tigress admins update media"
on storage.objects for update
to authenticated
using (
  bucket_id='tigress-media'
  and exists (select 1 from public.site_admins a where a.user_id=(select auth.uid()))
)
with check (
  bucket_id='tigress-media'
  and exists (select 1 from public.site_admins a where a.user_id=(select auth.uid()))
);

drop policy if exists "Tigress admins delete media" on storage.objects;
create policy "Tigress admins delete media"
on storage.objects for delete
to authenticated
using (
  bucket_id='tigress-media'
  and exists (select 1 from public.site_admins a where a.user_id=(select auth.uid()))
);

-- Enable Postgres Changes for this one low-volume CMS table.
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname='supabase_realtime' and schemaname='public' and tablename='site_content'
  ) then
    alter publication supabase_realtime add table public.site_content;
  end if;
end $$;

-- AFTER creating the admin user from Authentication -> Users -> Add user,
-- run this line once after replacing the email:
-- insert into public.site_admins(user_id)
-- select id from auth.users where email='admin@example.com'
-- on conflict (user_id) do nothing;
