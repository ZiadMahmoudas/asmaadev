/*
 * TIGRESS album registry — V12
 *
 * لإضافة ألبوم جديد لاحقاً:
 * 1) أنشئ مجلدًا داخل assets/luxury/ باسم الـ folder.
 * 2) ضع الصور بأسماء متسلسلة: 01.webp, 02.webp, 03.webp ...
 * 3) انسخ كائنًا واحدًا فقط داخل القائمة أدناه وعدّل:
 *    key / folder / total / ar / en
 *
 * السلايدر والـ popup يقرآن من هذه القائمة نفسها تلقائياً.
 */
window.TIGRESS_ALBUMS = [
  {
    key: 'furniture',
    folder: 'furniture',
    total: 13,
    ar: 'تصميم وتنفيذ أجمل قطع الأثاث',
    en: 'Design & execution of bespoke furniture'
  },
  {
    key: 'lighting',
    folder: 'lighting',
    total: 22,
    ar: 'تصميم وتنفيذ جميع أنواع الإنارات',
    en: 'Design & execution of all lighting types'
  },
  {
    key: 'chandeliers',
    folder: 'chandeliers',
    total: 2,
    ar: 'تصميم وتنفيذ الثريات الكلاسيك بجميع المقاسات',
    en: 'Classic chandeliers in custom sizes'
  }
];
