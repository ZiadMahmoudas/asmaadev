/* TIGRESS — observer-powered single-page experience. Plain, dependency-free JavaScript. */
(() => {
  'use strict';
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const options = Object.assign({contactEmail:'',phone:'',whatsapp:'',sliderDelayMs:6600,defaultLanguage:'ar'}, window.TIGRESS_CONFIG || {});
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const header = $('#siteHeader');
  const hero = $('[data-hero-scene]');
  const menuButton = $('#menuBtn');
  const mobileNav = $('#mobileNav');
  const carousel = $('#storiesCarousel');
  const slides = $$('.story-slide', carousel);
  const dots = $$('.story-dot', carousel);
  const status = $('#formResult');
  let language = (options.defaultLanguage === 'en') ? 'en' : 'ar';
  let currentSlide = 0;
  let sliderTimer = 0;
  let sliderVisible = false;
  let previousY = window.scrollY;
  let scrollFrame = false;
  let heroVisible = true;
  let menuOpen = false;

  const en = {
    skip:'Skip to content',navHome:'Home',navStory:'The Story',navAbout:'About',navExplore:'Our World',navCreative:'Services',navContact:'Let’s Talk',
    heroKicker:'WHEN BOLDNESS BECOMES ART',heroA:'A presence',heroB:'unlike any other.',heroDesc:'Some stories are too extraordinary for words alone. We give details a voice, boldness a place, and ideas a presence that leaves a mark.',discover:'Discover the Story',scrollLabel:'Scroll to explore',
    storyKicker:'CHAPTER TWO / THE WORLD OF TIGRESS',storyTitle:'A story born <em>to be bold.</em>',storyDesc:'Three perspectives. One singular world. Where even the smallest details carry a signature.',
    story1H:'Beauty has<br><em>a wild side.</em>',story1P:'Not every presence needs words. Sometimes a single glance starts the story.',story2H:'Strength is in<br><em>the details.</em>',story2P:'Line, color and balance: every element carries a thought and a feeling.',story3H:'A mark that<br><em>stays with you.</em>',story3P:'An authentic identity needs no repetition to be recognized.',
    aboutKicker:'01 — ABOUT US',aboutTitle:'More than twenty years<br><em>in construction & building.</em>',aboutP1:'Ramz Tashyeed Contracting is a Saudi company based in Buraidah, with more than twenty years of experience in contracting, finishing and interior decoration for residential, commercial, administrative and government projects.',aboutP2:'We have built a reputation based on quality and efficiency. Our goal is lasting client satisfaction through precise engineering planning and an integrated team of qualified engineers and technicians.',aboutLink:'Explore creative spaces',
    visionH:'Our vision',visionP:'Keeping pace with rapid development and adopting modern technologies and designs to deliver innovative solutions with high standards of efficiency and quality.',missionH:'Our mission',missionP:'Deliver advanced services, continuously develop our skills, execute projects to our highest potential and build long-term relationships based on trust and genuine partnership.',
    worldKicker:'02 — OUR ESSENCE',worldTitle:'Three principles.<br><em>One identity.</em>',boldH:'Boldness',boldP:'We go beyond what is familiar to find the space where new ideas begin.',trueH:'Authenticity',trueP:'Honest expression, without imitation or unnecessary noise.',impactH:'Impact',impactP:'Little details that stay with you long after the moment.',
    creativeKicker:'02 — OUR SERVICES',creativeTitle:'Integrated solutions for every project stage',creativeDesc:'A complete range of services delivered with efficiency and professional execution.',c1h:'Visual identity',c1p:'A clear, compelling visual language that grows from the core idea.',c2h:'Art direction',c2p:'Thoughtful choices in imagery, color and composition that shape the mood.',c3h:'Creative design',c3p:'Designs balancing simplicity and personality, speaking without excess.',c4h:'Visual stories',c4p:'Ideas transformed into memorable compositions and short stories.',c5h:'Experiences',c5p:'Movement, rhythm and texture, extending the experience beyond a still image.',c6h:'Signature details',c6p:'That point where form meets meaning and the story becomes recognizable.',startNow:'Start now',typeVisualIdentity:'Visual identity',typeArtDirection:'Art direction',typeCreativeDesign:'Creative design',typeVisualStories:'Visual stories',typeExperience:'Experience & details',typeSignature:'Signature details',
    signatureKicker:'04 — OUR SIGNATURE',signatureTitle:'Every detail<br><em>leaves a mark.</em>',signatureP:'Impact isn’t about adding more. It is about choosing what deserves to remain: an assured presence and an unmistakable eye for detail.',signatureCTA:'Start your story',
    contactKicker:'CONTACT US',contactTitle:'We’re happy to hear from you',contactP:'Reach us through any of the available channels.',nameLabel:'Your name',nameHolder:'Your full name',emailLabel:'Email address',typeLabel:'Service type',typeChoose:'Choose a service (optional)',typeBrand:'Visual identity',typeDesign:'Creative design',typeOther:'Something else',messageLabel:'Project details',messageHolder:'Building type, approximate area, expected timing…',prepareEmail:'Prepare email',copyMessage:'Copy message',formHint:'We open your email application; no personal information is sent to a server by this page.',footerCopy:'The art of detail. The courage to express. A presence that stays.',backToTop:'Back to the beginning',rights:'All rights reserved.',partnersKicker:'STORY PARTNERS',partnersTitle:'Brands',partnersAccent:'that trusted the journey',quickLinks:'Quick links',footerContact:'Contact',footerContactLine:'Send your project details through the form',footerEmailLine:'Add the receiving email in the config file',footerPartnersLine:'Explore the partner brands marquee',check1:'Quality and professionalism in execution',check2:'Integrated engineering and technical team',check3:'Precise planning on sound engineering foundations',check4:'Work aligned with Saudi Vision 2030',yearsText:'years of experience',aboutMotto:'Quality and professionalism in execution',stat1:'years of experience',stat2:'clients who trust us',stat3:'specialized departments',svc1h:'General contracting',svc1p:'Comprehensive construction and excavation services, plus interior and exterior finishing for residential, commercial and administrative buildings.',svc1a:'Construction works',svc1b:'Excavation works',svc1c:'Interior & exterior finishing',svc1d:'Commercial & government projects',svc2h:'Electromechanical',svc2p:'Integrated electromechanical systems for buildings according to approved standards and specifications.',svc2a:'Electrical systems',svc2b:'HVAC systems',svc2c:'Plumbing systems',svc2d:'Fire systems',svc3h:'Booth design & execution',svc3p:'Complete exhibition, event and festival booth solutions from design and fabrication to installation.',svc3a:'Design',svc3b:'Fabrication',svc3c:'Installation',svc3d:'Exhibitions & events',svc4h:'Painting',svc4p:'Interior and exterior decorative painting using leading products and finishes.',svc4a:'Interior paint',svc4b:'Exterior paint',svc4c:'Decorative paint',svc4d:'Gypsum decoration',svc5h:'Design & decor',svc5p:'Interior design solutions for residential and administrative spaces, from concept to execution.',svc5a:'Interior design',svc5b:'Gypsum works',svc5c:'Execution & fit-out',svc5d:'Residential & office spaces',svc6h:'Site management & supervision',svc6p:'Project site management and execution supervision to ensure quality, specifications and schedule compliance.',svc6a:'Site management',svc6b:'Execution supervision',svc6c:'Quality control',svc6d:'Schedule monitoring',orderService:'Request service',quoteKicker:'04 — REQUEST A QUOTE',quoteTitle:'Tell us about your project',quoteP:'Fill in the details and our team will contact you. Submitting opens WhatsApp with a ready message.',phoneLabel:'Mobile number',cityLabel:'City',cityHolder:'Example: Buraidah',consentText:'I agree to use my data to contact me regarding this request.',sendWhatsApp:'Send request via WhatsApp',whatsappLabel:'WhatsApp',callLabel:'Call',emailLabelShort:'Email',addressLabel:'Address',addressText:'Buraidah — Inner Eastern Ring Road — Umm Al-Mumineen Aisha Road, Saudi Arabia',floatingWa:'Message us on WhatsApp',floatingCall:'Call us',typeContracting:'General contracting',typeElectromechanical:'Electromechanical',typeBooths:'Booth design & execution',typePainting:'Painting',typeDecor:'Design & decor',typeSupervision:'Site management & supervision',mobileWorld:'THE WORLD OF TIGRESS',heroWorldLabel:'THE WORLD OF',heroWildLabel:'WILD IN SPIRIT.<br>TIMELESS BY DESIGN.',heroEstablished:'EST. IN IDEAS',storyNum1:'01 — THE INSTINCT',storyNum2:'02 — THE DETAIL',storyNum3:'03 — THE SIGNATURE',worldLabel1:'01 / THE BOLD',worldLabel2:'02 / THE TRUE',worldLabel3:'03 / THE MARK',marquee1:'BOLD BY NATURE',marquee2:'UNMISTAKABLY TIGRESS',marquee3:'ART IN EVERY DETAIL',socialInstagram:'Instagram',socialTikTok:'TikTok',socialSnapchat:'Snapchat'
  };
  const ar = {
    skip:'تخطي إلى المحتوى',navHome:'الرئيسية',navStory:'الحكاية',navAbout:'من نحن',navExplore:'عالمنا',navCreative:'خدماتنا',navContact:'لنتحدث',
    heroKicker:'حين تتحوّل الجرأة إلى فن',heroA:'حضورٌ',heroB:'يصنع الفرق.',heroDesc:'بعض الحكايات لا تُروى بالكلمات وحدها. نمنح التفاصيل صوتًا، وللجرأة مكانًا، ونصنع حضورًا لا يمرّ دون أن يترك أثرًا.',discover:'اكتشف الحكاية',scrollLabel:'اسحب لتكتشف',
    storyKicker:'الفصل الثاني / عالم TIGRESS',storyTitle:'حكايةٌ تبدأ <em>بالجرأة.</em>',storyDesc:'ثلاثة مشاهد، عالم واحد. حيث تستحيل التفاصيل الصغيرة إلى لغة تحمل بصمتنا.',
    story1H:'الجمال له<br><em>جانب جريء.</em>',story1P:'ليس كل حضور بحاجة إلى كلمات؛ أحيانًا تكفي نظرة لتبدأ الحكاية.',story2H:'قوتنا في<br><em>التفاصيل.</em>',story2P:'الخطّ واللون والتوازن؛ كل عنصر يحمل فكرة ويترك إحساسًا.',story3H:'والأثر يبقى<br><em>بعد الحكاية.</em>',story3P:'هوية حقيقية لا تحتاج أن تكرر اسمها حتى تُعرَف.',
    aboutKicker:'01 — من نحن',aboutTitle:'خبرة تتجاوز عشرين عاماً<br><em>في البناء والتشييد.</em>',aboutP1:'رمز تشييد للمقاولات شركة سعودية مقرها بريدة، تمتد خبرتها لأكثر من عشرين عاماً في تنفيذ مشاريع المقاولات والتشطيبات والديكور الداخلي للمباني السكنية والتجارية والإدارية، إضافة إلى المشاريع الحكومية.',aboutP2:'بنينا خلال هذه السنوات سمعة قائمة على الجودة والكفاءة، وهدفنا الثابت رضا عملائنا وكسب ثقتهم على المدى الطويل. نعتمد على تخطيط دقيق مبني على أسس هندسية مدروسة، ويقف خلف كل مشروع فريق متكامل من المهندسين والفنيين المؤهلين.',aboutLink:'اكتشف مساحات الإبداع',
    visionH:'رؤيتنا',visionP:'مواكبة التطور المتسارع وتبنّي أحدث التقنيات والتصاميم العصرية لنقدّم حلولاً مبتكرة تتجاوز تحديات مشاريع عملائنا بأعلى معايير الكفاءة والجودة.',missionH:'رسالتنا',missionP:'تقديم خدمات متقدمة، وتطوير مهاراتنا باستمرار، وإنجاز المشاريع بأقصى إمكاناتنا، وبناء علاقات طويلة الأمد قائمة على الثقة والشراكة الحقيقية.',
    worldKicker:'02 — جوهرنا',worldTitle:'ثلاثة مبادئ.<br><em>شخصية واحدة.</em>',boldH:'الجرأة',boldP:'لا نكتفي بما هو مألوف؛ نبحث عن المساحة التي تبدأ عندها الأفكار الجديدة.',trueH:'الأصالة',trueP:'التعبير الصادق عمّا نحن عليه، من دون تقليد أو ضوضاء.',impactH:'الأثر',impactP:'التفاصيل التي تبقى في الذاكرة طويلًا بعد انتهاء المشهد.',
    creativeKicker:'02 — خدماتنا',creativeTitle:'حلول متكاملة لكل مراحل مشروعك',creativeDesc:'نمتلك خبرة طويلة في مجال البناء والإنشاءات لنقدّم مجموعة شاملة من الخدمات تلبي احتياجات عملائنا بكفاءة واحترافية عالية.',c1h:'الهوية البصرية',c1p:'لغة متماسكة تبدأ بالفكرة، وتظهر في كل تفصيلة من تفاصيل الهوية.',c2h:'التوجه الفني',c2p:'اختيارات دقيقة للصور، والألوان، والتكوين؛ تمنح الفكرة روحها الخاصة.',c3h:'التصميم الإبداعي',c3p:'تصاميم تُوازن بين البساطة والشخصية، وتعبّر دون أن تشرح أكثر من اللازم.',c4h:'المحتوى البصري',c4p:'حكايات قصيرة وأفكار محسوسة تتحوّل إلى مشاهد لها حضور لا يُنسى.',c5h:'التفاصيل والتجربة',c5p:'نفكر في الإيقاع والحركة والملمس، لنخلق تجربة تتجاوز الصورة الثابتة.',c6h:'البصمة النهائية',c6p:'نقطة التقاء الشكل والمعنى؛ ما يجعل الحكاية معروفة من أول نظرة.',startNow:'ابدأ الآن',typeVisualIdentity:'الهوية البصرية',typeArtDirection:'التوجه الفني',typeCreativeDesign:'التصميم الإبداعي',typeVisualStories:'المحتوى البصري',typeExperience:'التفاصيل والتجربة',typeSignature:'البصمة النهائية',
    signatureKicker:'04 — توقيعنا الخاص',signatureTitle:'كل تفصيلة<br><em>تترك أثرًا.</em>',signatureP:'القيمة ليست في كثرة العناصر، بل في اختيار ما يستحق أن يبقى. هذا هو عالم Tigress: حضور واثق، وحسّ فني لا يشبه سواه.',signatureCTA:'ابدأ حكايتك',
    contactKicker:'تواصل معنا',contactTitle:'يسعدنا تواصلك',contactP:'تواصل معنا بأحد الوسائل المتاحة.',nameLabel:'الاسم',nameHolder:'اسمك الكامل',emailLabel:'البريد الإلكتروني',typeLabel:'نوع الخدمة',typeChoose:'اختر الخدمة (اختياري)',typeBrand:'هوية بصرية',typeDesign:'تصميم إبداعي',typeOther:'مشروع آخر',messageLabel:'تفاصيل المشروع',messageHolder:'نوع المبنى، المساحة التقريبية، الموعد المتوقع…',prepareEmail:'جهّز رسالة البريد',copyMessage:'انسخ الرسالة',formHint:'يتم تجهيز الرسالة في تطبيق البريد على جهازك؛ لا يتم إرسال بياناتك إلى خادم من هذه الصفحة.',footerCopy:'فنّ التفاصيل. جرأة التعبير. حضور يظل في الذاكرة.',backToTop:'العودة إلى البداية',rights:'جميع الحقوق محفوظة.',partnersKicker:'شركاء الحكاية',partnersTitle:'علامات تجارية',partnersAccent:'وثقت بنا',quickLinks:'روابط سريعة',footerContact:'تواصل معنا',footerContactLine:'أرسل تفاصيل فكرتك من النموذج',footerEmailLine:'أضف بريد الاستقبال من ملف الإعدادات',footerPartnersLine:'استعرض العلامات في شريط الشركاء',check1:'الجودة والاحترافية في التنفيذ',check2:'فريق متكامل من المهندسين والفنيين',check3:'تخطيط دقيق على أسس هندسية مدروسة',check4:'أعمال متوائمة مع رؤية المملكة 2030',yearsText:'عاماً من الخبرة',aboutMotto:'الجودة والاحترافية في التنفيذ',stat1:'عاماً من الخبرة',stat2:'عميلاً يثق بنا',stat3:'أقسام متخصصة',svc1h:'المقاولات العامة',svc1p:'خدمات بناء شاملة وأعمال الحفر وتنفيذ جميع أعمال التشطيبات الداخلية والخارجية للمباني السكنية والتجارية والإدارية.',svc1a:'البناء والإنشاءات',svc1b:'أعمال الحفر',svc1c:'التشطيبات الداخلية والخارجية',svc1d:'المشاريع التجارية والحكومية',svc2h:'الكهروميكانيك',svc2p:'تنفيذ الأنظمة الكهروميكانيكية المتكاملة للمباني وفق المواصفات والمعايير المعتمدة.',svc2a:'أنظمة الكهرباء',svc2b:'أنظمة التكييف',svc2c:'أنظمة السباكة',svc2d:'أنظمة الحريق',svc3h:'تصميم وتنفيذ البوثات',svc3p:'حلول متكاملة لبوثات المعارض والفعاليات والمهرجانات تشمل التصميم والتصنيع والتركيب، ببوثات مخصصة تعكس هوية علامتك التجارية.',svc3a:'التصميم',svc3b:'التصنيع',svc3c:'التركيب',svc3d:'المعارض والمؤتمرات والمهرجانات',svc4h:'الدهانات',svc4p:'تنفيذ جميع أنواع الدهانات الديكورية الداخلية والخارجية بمنتجات أهم العلامات التجارية.',svc4a:'دهانات داخلية',svc4b:'دهانات خارجية',svc4c:'دهانات ديكورية',svc4d:'ديكورات جبسية',svc5h:'التصميم والديكور',svc5p:'فريق من مهرة مصممي الديكور الداخلي يقدّم تصاميم مميزة ومبتكرة للمساحات السكنية والإدارية.',svc5a:'التصميم الداخلي',svc5b:'الديكورات الجبسية',svc5c:'التنفيذ والتجهيز',svc5d:'المساحات السكنية والإدارية',svc6h:'إدارة المواقع والإشراف',svc6p:'إدارة مواقع المشاريع والإشراف على التنفيذ لضمان الجودة والالتزام بالمخططات والمواصفات.',svc6a:'إدارة المواقع',svc6b:'الإشراف على التنفيذ',svc6c:'ضبط الجودة',svc6d:'متابعة الجدول الزمني',orderService:'اطلب الخدمة',quoteKicker:'04 — طلب عرض سعر',quoteTitle:'حدّثنا عن مشروعك',quoteP:'املأ البيانات وسيتواصل معك فريقنا. عند الإرسال سيُفتح واتساب برسالة جاهزة لتسريع التواصل.',phoneLabel:'رقم الجوال',cityLabel:'المدينة',cityHolder:'مثال: بريدة',consentText:'أوافق على استخدام بياناتي للتواصل معي بخصوص طلبي وفق سياسة الخصوصية.',sendWhatsApp:'أرسل الطلب عبر واتساب',whatsappLabel:'واتساب',callLabel:'اتصال',emailLabelShort:'البريد الإلكتروني',addressLabel:'العنوان',addressText:'بريدة – الدائري الشرقي الداخلي – طريق أم المؤمنين عائشة، المملكة العربية السعودية',floatingWa:'راسلنا على واتساب',floatingCall:'اتصل بنا',typeContracting:'المقاولات العامة',typeElectromechanical:'الكهروميكانيك',typeBooths:'تصميم وتنفيذ البوثات',typePainting:'الدهانات',typeDecor:'التصميم والديكور',typeSupervision:'إدارة المواقع والإشراف',mobileWorld:'عالم TIGRESS',heroWorldLabel:'عالم TIGRESS',heroWildLabel:'جريئة بروحها.<br>خالدة بتفاصيلها.',heroEstablished:'وُلدت من فكرة',storyNum1:'01 — الغريزة',storyNum2:'02 — التفاصيل',storyNum3:'03 — البصمة',worldLabel1:'01 / الجرأة',worldLabel2:'02 / الأصالة',worldLabel3:'03 / الأثر',marquee1:'جريئة بالفطرة',marquee2:'TIGRESS لا تُخطئها العين',marquee3:'فنّ في كل تفصيلة',socialInstagram:'إنستقرام',socialTikTok:'تيك توك',socialSnapchat:'سناب شات'
  };
  const HTML_TRANSLATIONS = new Set(['storyTitle','story1H','story2H','story3H','aboutTitle','worldTitle','creativeTitle','signatureTitle','contactTitle','heroWildLabel']);
  function setLocale(next) {
    language = next;
    const content = next === 'en' ? en : ar;
    document.documentElement.lang = next;
    document.documentElement.dir = next === 'en' ? 'ltr' : 'rtl';
    $$('[data-t]').forEach(el => {
      const key = el.dataset.t;
      if (content[key] === undefined) return;
      if (HTML_TRANSLATIONS.has(key)) el.innerHTML = content[key];
      else el.textContent = content[key];
    });
    $$('[data-placeholder]').forEach(el => {el.placeholder = content[el.dataset.placeholder] || '';});
    $('#langDisplay').textContent = next === 'ar' ? 'EN' : 'عربي';
    $('#langSwitch').setAttribute('aria-label', next === 'ar' ? 'Switch to English' : 'التبديل إلى العربية');
    menuButton.setAttribute('aria-label', next === 'ar' ? 'فتح القائمة' : 'Open menu');
    status.textContent = '';
    updateDirectionalIcons();
  }
  function updateDirectionalIcons(){
    const prevIcon=$('#prevSlide i'),nextIcon=$('#nextSlide i');
    if(prevIcon && nextIcon){
      prevIcon.className='fa-solid '+(language==='ar'?'fa-chevron-right':'fa-chevron-left');
      nextIcon.className='fa-solid '+(language==='ar'?'fa-chevron-left':'fa-chevron-right');
    }
  }
  $('#langSwitch').addEventListener('click', () => setLocale(language === 'ar' ? 'en' : 'ar'));
  setLocale(language);
  $('#year').textContent = String(new Date().getFullYear());

  function closeMenu() {
    menuOpen = false;
    header.classList.remove('menu-is-open');
    document.body.classList.remove('menu-open');
    menuButton.setAttribute('aria-expanded','false');
    mobileNav.inert = true;
  }
  function toggleMenu() {
    menuOpen = !menuOpen;
    header.classList.toggle('menu-is-open',menuOpen);
    header.classList.remove('is-hidden');
    document.body.classList.toggle('menu-open',menuOpen);
    menuButton.setAttribute('aria-expanded',String(menuOpen));
    mobileNav.inert = !menuOpen;
  }
  menuButton.addEventListener('click', toggleMenu);
  $$('#mobileNav a').forEach(a => a.addEventListener('click',closeMenu));
  document.addEventListener('keydown',event => {if(event.key === 'Escape' && menuOpen){closeMenu();menuButton.focus();}});
  window.addEventListener('resize',() => {if (window.innerWidth > 960 && menuOpen) closeMenu();},{passive:true});

  function clamp01(n){return Math.min(1,Math.max(0,n));}
  let heroTarget=0,heroCurrent=0,heroRaf=0;
  function calculateHeroTarget(){
    const distance=Math.max(1,hero.offsetHeight-window.innerHeight);
    heroTarget=clamp01((window.scrollY-hero.offsetTop)/distance);
  }
  function paintHero(){
    const diff=heroTarget-heroCurrent;
    heroCurrent += diff * .085;
    if(Math.abs(diff)<.0007) heroCurrent=heroTarget;
    hero.style.setProperty('--scroll-progress',heroCurrent.toFixed(4));
    hero.style.setProperty('--enter','1');
    $('#heroProgressFill').style.width=Math.round(heroCurrent*100)+'%';
    $('#heroProgressText').textContent=String(Math.round(heroCurrent*100)).padStart(2,'0')+'%';
    if(heroVisible && Math.abs(heroTarget-heroCurrent)>.0008) heroRaf=requestAnimationFrame(paintHero);
    else heroRaf=0;
  }
  function updateHero(){
    if(reduced){hero.style.setProperty('--scroll-progress','0');return;}
    calculateHeroTarget();
    if(heroVisible && !heroRaf) heroRaf=requestAnimationFrame(paintHero);
  }
  function handleScroll() {
    scrollFrame=false;
    const y=Math.max(window.scrollY,0);
    const delta=y-previousY;
    header.classList.toggle('is-scrolled',y>35);
    if(menuOpen||y<115) header.classList.remove('is-hidden');
    else if(delta>5&&y>160) header.classList.add('is-hidden');
    else if(delta<-5) header.classList.remove('is-hidden');
    if(Math.abs(delta)>=1) previousY=y;
    updateHero();
  }
  window.addEventListener('scroll',()=>{if(!scrollFrame){scrollFrame=true;requestAnimationFrame(handleScroll);}},{passive:true});
  if('IntersectionObserver' in window){
    const heroObserver=new IntersectionObserver(entries=>{
      heroVisible=entries[0].isIntersecting;
      if(heroVisible){calculateHeroTarget();if(!heroRaf)heroRaf=requestAnimationFrame(paintHero);}
      else if(heroRaf){cancelAnimationFrame(heroRaf);heroRaf=0;}
    },{threshold:0,rootMargin:'100px 0px 100px 0px'});
    heroObserver.observe(hero);
  }
  hero.style.setProperty('--enter','1');
  handleScroll();

  const revealItems=$$('.inview');
  const directions=['up','right','left','up','down'];
  revealItems.forEach((el,i)=>{
    if(!el.dataset.reveal) el.dataset.reveal=directions[i%directions.length];
    el.style.setProperty('--reveal-delay',Math.min((i%6)*65,325)+'ms');
  });
  if('IntersectionObserver' in window && !reduced){
    document.documentElement.classList.add('js-ready');
    const appear=new IntersectionObserver(entries=>{
      entries.forEach(entry=>{
        entry.target.classList.toggle('is-visible',entry.isIntersecting);
      });
    },{threshold:.075,rootMargin:'0px 0px -8% 0px'});
    revealItems.forEach(el=>appear.observe(el));
  }else{
    revealItems.forEach(el=>el.classList.add('is-visible'));
  }
  if(reduced)document.documentElement.classList.add('reduce-motion');

  function restartDotProgress(){
    dots.forEach(dot=>dot.classList.remove('progressing'));
    const active=dots[currentSlide];
    if(active){
      void active.offsetWidth;
      active.classList.add('progressing');
    }
  }
  function goTo(index,{restart=true}={}) {
    // Explicit wrap so slide 03 always resets cleanly to slide 01.
    if(index >= slides.length) currentSlide=0;
    else if(index < 0) currentSlide=slides.length-1;
    else currentSlide=index;
    slides.forEach((slide,i) => {
      const active = i === currentSlide;
      slide.classList.toggle('is-active',active);
      slide.setAttribute('aria-hidden',String(!active));
      slide.setAttribute('aria-label',`${i+1} ${language === 'ar' ? 'من' : 'of'} ${slides.length}`);
      if ('inert' in slide) slide.inert = !active;
    });
    dots.forEach((dot,i) => {
      const active=i===currentSlide;
      dot.classList.toggle('current',active);
      if(active)dot.setAttribute('aria-current','true');else dot.removeAttribute('aria-current');
    });
    if(restart)restartDotProgress();
  }
  function stopAutoplay(){
    if(sliderTimer)window.clearTimeout(sliderTimer);
    sliderTimer=0;
  }
  function scheduleAutoplay(){
    stopAutoplay();
    if(!sliderVisible || document.hidden || reduced)return;
    const delay=Math.max(3800,Number(options.sliderDelayMs)||6600);
    carousel.style.setProperty('--story-delay',delay+'ms');
    sliderTimer=window.setTimeout(()=>{
      goTo(currentSlide===slides.length-1?0:currentSlide+1);
      scheduleAutoplay();
    },delay);
  }
  function startAutoplay(){
    // Hover/focus can pause; leaving resumes a fresh, full-duration cycle.
    if(carousel.matches(':hover') || carousel.contains(document.activeElement))return;
    scheduleAutoplay();
  }
  dots.forEach(dot=>dot.addEventListener('click',()=>{goTo(Number(dot.dataset.goto));scheduleAutoplay();}));
  $('#prevSlide').addEventListener('click',()=>{goTo(currentSlide-1);scheduleAutoplay();});
  $('#nextSlide').addEventListener('click',()=>{goTo(currentSlide===slides.length-1?0:currentSlide+1);scheduleAutoplay();});
  carousel.addEventListener('mouseenter',stopAutoplay);
  carousel.addEventListener('mouseleave',()=>{restartDotProgress();scheduleAutoplay();});
  carousel.addEventListener('focusin',stopAutoplay);
  carousel.addEventListener('focusout',()=>window.setTimeout(()=>{if(!carousel.contains(document.activeElement)){restartDotProgress();scheduleAutoplay();}},20));
  carousel.addEventListener('keydown',event => {
    if(event.key==='ArrowRight'){goTo(currentSlide+(language==='ar'?-1:1));scheduleAutoplay();event.preventDefault();}
    if(event.key==='ArrowLeft'){goTo(currentSlide+(language==='ar'?1:-1));scheduleAutoplay();event.preventDefault();}
  });
  let tx=0,ty=0;
  carousel.addEventListener('touchstart',event=>{tx=event.changedTouches[0].screenX;ty=event.changedTouches[0].screenY;},{passive:true});
  carousel.addEventListener('touchend',event=>{
    const dx=event.changedTouches[0].screenX-tx,dy=event.changedTouches[0].screenY-ty;
    if(Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy)*1.2){
      goTo(currentSlide+((dx<0?1:-1)*(language==='ar'?-1:1)));
      scheduleAutoplay();
    }
  },{passive:true});
  if ('IntersectionObserver' in window) {
    const slideObserver = new IntersectionObserver(entries=>{
      sliderVisible=entries[0].isIntersecting;
      if(sliderVisible){restartDotProgress();startAutoplay();}else stopAutoplay();
    },{threshold:.16});
    slideObserver.observe(carousel);
  } else {sliderVisible=true;startAutoplay();}
  document.addEventListener('visibilitychange',()=>document.hidden?stopAutoplay():startAutoplay());
  goTo(0);

  // Update active nav link using real section intersection.
  if ('IntersectionObserver' in window) {
    const navObserver = new IntersectionObserver(entries=>{
      entries.forEach(entry=>{
        if (!entry.isIntersecting)return;
        $$('.nav-item').forEach(item=>item.classList.toggle('current',item.getAttribute('href')==='#'+entry.target.id));
      });
    },{rootMargin:'-30% 0px -60% 0px'});
    $$('#hero,#chapters,#about,#world,#creative').forEach(el=>navObserver.observe(el));
  }

  // Service-card CTAs: jump to the form and preselect the exact service.
  const serviceSelect=$('#projectType');
  $$('.service-ref-cta[data-service-pick], .service-cta[data-service-pick]').forEach(link=>{
    link.addEventListener('click',event=>{
      const value=link.dataset.servicePick;
      if(serviceSelect && [...serviceSelect.options].some(option=>option.value===value)){
        serviceSelect.value=value;
        serviceSelect.dispatchEvent(new Event('change',{bubbles:true}));
        serviceSelect.classList.remove('service-picked-select');
        void serviceSelect.offsetWidth;
        serviceSelect.classList.add('service-picked-select');
        window.setTimeout(()=>serviceSelect.classList.remove('service-picked-select'),1500);
      }
      const target=$('#quote');
      const formCard=$('#contactForm');
      if(target){
        event.preventDefault();
        target.scrollIntoView({behavior:reduced?'auto':'smooth',block:'start'});
        if(formCard){
          formCard.classList.remove('service-picked');
          void formCard.offsetWidth;
          formCard.classList.add('service-picked');
          window.setTimeout(()=>formCard.classList.remove('service-picked'),900);
        }
        window.setTimeout(()=>serviceSelect?.focus({preventScroll:true}),reduced?0:650);
      }
    });
  });

  const form=$('#contactForm');
  function digits(value){return String(value||'').replace(/\D/g,'');}
  function makeInquiry(){
    const name=$('#fullName')?.value.trim()||'';
    const phone=$('#phone')?.value.trim()||'';
    const type=$('#projectType')?.selectedOptions[0]?.textContent.trim()||'';
    const city=$('#city')?.value.trim()||'';
    const message=$('#message')?.value.trim()||'';
    const consent=$('#consent')?.checked;
    if(!name || !phone || digits(phone).length<8 || !consent){
      status.textContent=language==='ar'?'أكمل الاسم ورقم الجوال ووافق على استخدام البيانات أولًا.':'Enter your name and phone number, then accept the contact consent.';
      if(!name) $('#fullName')?.focus(); else if(!phone || digits(phone).length<8) $('#phone')?.focus(); else $('#consent')?.focus();
      return null;
    }
    const lines=language==='ar' ? [
      'السلام عليكم، أرغب بطلب خدمة.',
      '',
      'الاسم: '+name,
      'رقم الجوال: '+phone,
      'الخدمة: '+type,
      city ? 'المدينة: '+city : '',
      message ? 'تفاصيل المشروع: '+message : ''
    ] : [
      'Hello, I would like to request a service.',
      '',
      'Name: '+name,
      'Phone: '+phone,
      'Service: '+type,
      city ? 'City: '+city : '',
      message ? 'Project details: '+message : ''
    ];
    return lines.filter(Boolean).join('\n');
  }
  form?.addEventListener('submit',event=>{
    event.preventDefault();
    const text=makeInquiry(); if(!text)return;
    const wa=digits(options.whatsapp||'966542755566');
    if(!wa){status.textContent=language==='ar'?'أضف رقم واتساب في js/config.js أولًا.':'Add a WhatsApp number in js/config.js first.';return;}
    status.textContent=language==='ar'?'جاري فتح واتساب برسالة الطلب…':'Opening WhatsApp with your request…';
    window.open('https://wa.me/'+wa+'?text='+encodeURIComponent(text),'_blank','noopener');
  });
  // Optional floating WhatsApp / phone actions.

  const floatWrap=$('#floatingActions'),floatWa=$('#floatingWhatsApp'),floatCall=$('#floatingCall');
  const rawWa=digits(options.whatsapp||'966542755566');
  const rawPhone=String(options.phone||'+966542755566').trim();
  const waHref='https://wa.me/'+rawWa;
  if(floatWa)floatWa.href=waHref;
  if(floatCall)floatCall.href='tel:'+rawPhone;
  ['quoteWa','contactWa'].forEach(id=>{const el=$('#'+id);if(el)el.href=waHref;});
  ['quoteCall','contactCall'].forEach(id=>{const el=$('#'+id);if(el)el.href='tel:'+rawPhone;});

  // Count-up animation for reference statistics.
  const counters=$$('[data-count]');
  if('IntersectionObserver' in window && !reduced){
    const countObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{
      if(!entry.isIntersecting || entry.target.dataset.counted)return;
      entry.target.dataset.counted='1';
      const target=Number(entry.target.dataset.count)||0,start=performance.now(),duration=950;
      const tick=now=>{const p=Math.min(1,(now-start)/duration),e=1-Math.pow(1-p,3);entry.target.textContent=String(Math.round(target*e));if(p<1)requestAnimationFrame(tick);};
      requestAnimationFrame(tick);countObserver.unobserve(entry.target);
    }),{threshold:.55});
    counters.forEach(el=>countObserver.observe(el));
  }else counters.forEach(el=>el.textContent=el.dataset.count);

})();
