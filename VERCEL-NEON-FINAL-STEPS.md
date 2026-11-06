# TIGRESS: final Neon + Vercel setup

Production site: https://tigress-designs.vercel.app/
Admin after deployment: https://tigress-designs.vercel.app/admin

## 1. Keep one database
Your current Managed Better Auth URL ends in `/neondb/auth`, so use **neondb** for the CMS tables as well.

In Neon Console -> SQL Editor, select database **neondb**, then run `neon/setup.sql`.
The separate `Tigress` database can be left alone until everything is verified, then removed if unused.

## 2. Better Auth settings
Settings -> Better Auth -> Domains:
- Add `https://tigress-designs.vercel.app`
- Keep Allow Localhost ON while developing.
- Keep Sign-in with Email ON.
- Keep Sign-up with Email ON only while creating the first admin; turn it OFF afterward for an admin-only CMS.
- Google OAuth, Organizations, Webhooks, Magic Link, Phone Auth, OAuth Provider are not required for this CMS.

Auth URL is already filled into `js/neon-config.js` from the provided screenshot.

## 3. Data API
Open Neon Console -> Data API and copy the Data API endpoint for **neondb**.
It should end with `/neondb/rest/v1`.
Paste it into `js/neon-config.js` as `dataApiUrl`.

Do NOT create a Credential for the browser frontend. The frontend uses Neon Auth JWT + RLS.

## 4. First admin account
Create one user through Neon Auth while email signup is temporarily enabled.
Then, in SQL Editor with database **neondb**, run:

```sql
insert into public.site_admins(user_id)
select id
from neon_auth.user
where email = 'YOUR-ADMIN-EMAIL'
on conflict (user_id) do nothing;
```

Verify:

```sql
select a.user_id, u.email
from public.site_admins a
join neon_auth.user u on u.id = a.user_id;
```

Then turn **Sign-up with Email OFF** in Better Auth. Keep **Sign-in with Email ON**.

## 5. Deploy to Vercel
Deploy this folder/repo to the existing `tigress-designs` Vercel project.
`vercel.json` enables clean URLs, so the admin URL is `/admin`.

## 6. Test
Public page:
- Open `/` and verify static content loads.

Admin:
- Open `/admin`
- Sign in with the admin account
- Change one text field
- Save & Publish
- Refresh `/` and verify the new content appears.

## 7. Media uploads
Image/PDF uploads are intentionally left disabled until the database/auth flow is confirmed.
Existing image paths still work.
Once the CMS is confirmed, enable Neon Object Storage + the provided `media-upload` function and fill `uploadFunctionUrl`.

### Easiest first-user flow
After deploying and while Sign-up with Email is ON, open:
`https://tigress-designs.vercel.app/setup-admin`
Create your one admin account. Then add the email to `site_admins` with the SQL above, turn Sign-up with Email OFF, and use `/admin` from then on.
