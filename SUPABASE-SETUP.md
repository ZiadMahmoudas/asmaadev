# TIGRESS CMS — Supabase setup

النسخة دي فيها Dashboard كاملة على: **`/admin.html`**.

## 1) أنشئ مشروع Supabase
من Supabase اعمل Project جديد.

## 2) شغّل ملف SQL
افتح **SQL Editor** والصق محتوى:

`supabase/setup.sql`

وشغّله مرة واحدة. الملف ينشئ:
- `site_content` للمحتوى.
- `site_admins` لتحديد من يقدر يعدّل.
- Storage bucket باسم `tigress-media`.
- RLS policies.
- Realtime على جدول المحتوى.

## 3) أنشئ حساب الأدمن
من **Authentication → Users → Add user** أنشئ المستخدم بالبريد وكلمة المرور.

بعدها في SQL Editor شغّل:

```sql
insert into public.site_admins(user_id)
select id from auth.users where email='YOUR_ADMIN_EMAIL'
on conflict (user_id) do nothing;
```

واستبدل `YOUR_ADMIN_EMAIL` ببريد الأدمن الحقيقي.

## 4) ضع بيانات المشروع
افتح:

`js/supabase-config.js`

وضع:
- Project URL
- Publishable key / anon key

**ممنوع** وضع `service_role` أو أي Secret key داخل الموقع.

## 5) افتح Dashboard
بعد رفع المشروع افتح:

`https://YOUR-DOMAIN/admin.html`

سجّل دخول الأدمن. أول مرة ستظهر نسخة الموقع الحالية داخل Dashboard. اضغط **حفظ ونشر** مرة واحدة لتصبح النسخة الحالية هي النسخة الموجودة في Supabase.

## كيف السرعة معمولة؟
1. الـHTML الحالي يظهر فورًا، فلا يوجد loading screen للمستخدم.
2. آخر نسخة CMS محفوظة في `localStorage` وتُطبّق قبل تشغيل أغلب JavaScript في الزيارات التالية.
3. في الخلفية يحصل Fetch لصف واحد فقط من Supabase.
4. الصفحات المفتوحة تشترك في Realtime؛ عند الضغط على **حفظ ونشر** يصل التغيير مباشرة من غير Refresh.
5. الصور الكبيرة تتحول إلى WebP قبل الرفع، وتُرفع باسم جديد مع cache طويل، لذلك CDN يظل سريعًا ولا توجد مشكلة صورة قديمة بسبب cache.

## ملاحظة مهمة
أول زيارة لجهاز لم يفتح الموقع من قبل ستعرض نسخة الـHTML الحالية فورًا ثم تطابقها مع Supabase في الخلفية. بعد أول زيارة يصبح الـcache المحلي أسرع جدًا. لو احتجت لاحقًا zero-flicker حتى لأول زيارة بعد كل تعديل، وقتها ننقل نفس الواجهة إلى SSR/Edge، لكن للنسخة الستاتيك الحالية هذا التصميم يحافظ على السرعة من غير إعادة بناء الموقع.
