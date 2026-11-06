# TIGRESS CMS — Neon setup (HTML/JS only)

المشروع تم تحويله من Supabase إلى Neon مع بقاء الواجهة Static HTML/JS.

## ما الذي يستخدمه المشروع؟

- Neon Data API: قراءة/حفظ `site_content` مباشرة من المتصفح مع RLS.
- Managed Better Auth: دخول الأدمن.
- Neon Object Storage: صور/PDF.
- Neon Function: توليد presigned upload URL بعد التأكد أن المستخدم Admin، لذلك لا توجد أي مفاتيح Storage سرية داخل HTML.

> لا تضع `DATABASE_URL` أو `AWS_SECRET_ACCESS_KEY` أو Neon API Key داخل `js/neon-config.js` إطلاقًا.

## 1) اختر قاعدة البيانات الصحيحة

لو أنت داخل Project `Task-manager` وعندك `task_manager_db`، تأكد أن Data API/Auth مربوطان بنفس قاعدة البيانات التي ستنفذ عليها SQL.

## 2) فعّل Auth + Data API + Storage + Function

الأسهل من فولدر المشروع:

```bash
npm install
npx neon@latest auth
neon link
neon deploy
```

إذا `neon auth` أو بعض أوامر CLI اختلف اسمها في نسختك، يمكنك تفعيل Managed Better Auth وData API من Neon Console ثم تشغيل `neon link` و`neon deploy` للباقي.

بعد `neon deploy` ستجد خدمات Auth/Data API/Object Storage/Function على branch الحالي.

## 3) نفّذ SQL

افتح Neon Console -> SQL Editor، واختر قاعدة البيانات المستخدمة ثم نفّذ الملف:

`neon/setup.sql`

## 4) أنشئ مستخدم الأدمن

من Neon Console -> Auth / Better Auth -> Users أنشئ المستخدم بالبريد وكلمة المرور.

بعدها في SQL Editor شغّل (غيّر البريد):

```sql
insert into public.site_admins(user_id)
select id from neon_auth.user where email='YOUR_ADMIN_EMAIL'
on conflict (user_id) do nothing;
```

للتأكد:

```sql
select a.user_id, u.email
from public.site_admins a
left join neon_auth.user u on u.id=a.user_id;
```

## 5) Trusted Origins

في إعدادات Neon Auth أضف دومين الموقع ضمن Trusted Origins، مثال:

- `https://example.com`
- وللتجربة المحلية: `http://localhost:5500` أو البورت الذي تستخدمه.

## 6) انسخ الـURLs العامة فقط

من Neon Console انسخ:

- Auth URL
- Data API URL
- URL الخاص بـ Function `media-upload`

ثم افتح `js/neon-config.js` واكتب:

```js
window.TIGRESS_NEON = {
  dataApiUrl: 'https://.../rest/v1',
  authUrl: 'https://.../auth',
  uploadFunctionUrl: 'https://...your-neon-function...',
  siteId: 'main',
  bucket: 'tigress-media'
};
```

هذه الثلاثة URLs ليست Database password. لا تضع Connection String هنا.

## 7) اختبر

شغّل الموقع بسيرفر محلي (لا تفتح HTML بـ file://):

```bash
python -m http.server 5500
```

ثم:

- الموقع: `http://localhost:5500/index.html`
- الأدمن: `http://localhost:5500/admin.html`

سجّل دخول الأدمن، عدّل نصًا واضغط حفظ ونشر. افتح الموقع في تبويب آخر؛ المحتوى يقرأ من Neon ويتم تحديث النسخة المفتوحة تلقائيًا كل 30 ثانية أو عند العودة للتبويب.

## ملاحظات الأمان

- `js/neon-config.js`: Public URLs فقط.
- `DATABASE_URL` وAWS credentials تبقى داخل Neon Function Environment ولا تصل للمتصفح.
- RLS يسمح للعامة بالقراءة فقط من `site_content`.
- الكتابة تحتاج مستخدم authenticated وموجود في `site_admins`.
- رفع الملفات يحتاج JWT صالح + عضوية Admin، ثم يُعطى المتصفح presigned URL مدته 5 دقائق.
