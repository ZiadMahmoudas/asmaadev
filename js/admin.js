import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const cfg = window.TIGRESS_SUPABASE || {};
const defaults = structuredClone(window.TIGRESS_CMS_DEFAULTS || {});
const ready = cfg.url && cfg.anonKey && !cfg.url.includes('YOUR_PROJECT_REF') && !cfg.anonKey.includes('YOUR_SUPABASE');
const $ = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => [...r.querySelectorAll(s)];
const clone = value => value === undefined ? undefined : JSON.parse(JSON.stringify(value));
const deepMerge = (base, patch) => {
  if (Array.isArray(base)) return Array.isArray(patch) ? clone(patch) : clone(base);
  if (!base || typeof base !== 'object') return patch === undefined ? base : patch;
  const out = { ...base };
  if (!patch || typeof patch !== 'object') return out;
  Object.keys(patch).forEach(key => {
    out[key] = (base[key] && typeof base[key] === 'object' && !Array.isArray(base[key])) ? deepMerge(base[key], patch[key]) : clone(patch[key]);
  });
  return out;
};
let state = clone(defaults);
let rowMeta = { version: 0, updated_at: null };
let supabase = null;
let autosaveTimer = 0;
let saving = false;
let dirty = false;

const mediaLabels = {
  logoBrown:'Logo داكن/ذهبي', logoWhite:'Logo أبيض', footerLogo:'Logo الفوتر', aboutImage:'صورة من نحن', favicon:'Favicon', ogImage:'صورة المشاركة OG', portfolioPdf:'ملف البورتفوليو PDF'
};
const settingsLabels = { contactEmail:'البريد الإلكتروني', phone:'رقم الاتصال', whatsapp:'رقم واتساب بدون +', instagram:'رابط إنستقرام', instagramHandle:'اسم إنستقرام الظاهر', tiktok:'رابط تيك توك', tiktokHandle:'اسم تيك توك الظاهر', snapchat:'رابط سناب شات', snapchatHandle:'اسم سناب الظاهر', defaultLanguage:'اللغة الافتراضية' };
const statsLabels = { years:'سنوات الخبرة', clients:'عدد العملاء', departments:'عدد الأقسام' };
const seoLabels = { title:'Title', description:'Meta Description', ogTitle:'OG Title', ogDescription:'OG Description' };

function toast(message, type='ok') {
  const el=$('#toast'); el.textContent=message; el.className=`toast ${type} show`; clearTimeout(el._t); el._t=setTimeout(()=>el.classList.remove('show'),2600);
}
function status(text, mode='') { const el=$('#syncStatus'); el.textContent=text; el.className=`status-pill ${mode}`; }
function markDirty(){ dirty=true; status('تعديلات غير منشورة'); syncRaw(); if($('#autoSaveToggle')?.checked){ clearTimeout(autosaveTimer); autosaveTimer=setTimeout(save,900); } }
function syncRaw(){ const el=$('#rawJson'); if(el && document.activeElement!==el) el.value=JSON.stringify(state,null,2); }
function field(label, value, attrs='') { return `<div class="field"><label>${label}</label><input ${attrs} value="${escapeHtml(value ?? '')}"></div>`; }
function escapeHtml(v){return String(v??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}
function normalizeState(){ state=deepMerge(defaults,state||{}); state.schemaVersion=1; }

function configured(){ return ready; }
if(!configured()) $('#setupNote').classList.remove('hidden');

if (configured()) {
  supabase = createClient(cfg.url, cfg.anonKey, { auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true} });
  bootAuth();
} else {
  $('#loginForm').addEventListener('submit',e=>{e.preventDefault();$('#loginError').textContent='وصّل Supabase أولًا من js/supabase-config.js';});
}

async function bootAuth(){
  const {data:{session}}=await supabase.auth.getSession();
  if(session) await enterDashboard(session.user); else showLogin();
  supabase.auth.onAuthStateChange((_event,session)=>{ if(!session) showLogin(); });
}

$('#loginForm').addEventListener('submit', async e=>{
  e.preventDefault(); $('#loginError').textContent='';
  const email=$('#loginEmail').value.trim(), password=$('#loginPassword').value;
  status('جاري الدخول','saving');
  const {data,error}=await supabase.auth.signInWithPassword({email,password});
  if(error){$('#loginError').textContent=error.message;status('فشل الدخول');return;}
  await enterDashboard(data.user);
});
$('#logoutBtn')?.addEventListener('click',()=>supabase?.auth.signOut());

async function isAdmin(user){
  const {data,error}=await supabase.from('site_admins').select('user_id').eq('user_id',user.id).maybeSingle();
  return !error && !!data;
}
async function enterDashboard(user){
  if(!await isAdmin(user)){
    await supabase.auth.signOut();
    $('#loginError').textContent='الحساب صحيح لكنه غير مضاف كـ Admin في site_admins.';
    return;
  }
  $('#loginView').classList.add('hidden'); $('#dashboard').classList.remove('hidden');
  await loadContent(); renderAll(); status('متصل','ok');
}
function showLogin(){ $('#dashboard').classList.add('hidden'); $('#loginView').classList.remove('hidden'); }

async function loadContent(){
  status('جاري تحميل المحتوى','saving');
  const {data,error}=await supabase.from('site_content').select('content,version,updated_at').eq('site_id',cfg.siteId||'main').maybeSingle();
  if(error){toast(error.message,'error'); state=clone(defaults); return;}
  if(data?.content && Object.keys(data.content).length){ state=deepMerge(defaults,data.content); rowMeta={version:data.version||0,updated_at:data.updated_at}; }
  else { state=clone(defaults); }
  normalizeState();
}

async function save(){
  if(saving||!supabase)return; saving=true; dirty=false; status('جاري النشر','saving');
  collectAllInputs();
  const payload={site_id:cfg.siteId||'main',content:state,version:(rowMeta.version||0)+1,updated_at:new Date().toISOString()};
  const {data,error}=await supabase.from('site_content').upsert(payload,{onConflict:'site_id'}).select('version,updated_at').single();
  saving=false;
  if(error){dirty=true;status('تعذر الحفظ');toast(error.message,'error');return;}
  rowMeta=data||payload; status('منشور الآن','ok'); updateLast(); toast('تم الحفظ والنشر فورًا'); syncRaw();
}
$('#saveBtn').addEventListener('click',save);
$('#resetBtn').addEventListener('click',()=>{ if(confirm('ترجع كل الحقول للنسخة الأصلية الموجودة في الكود؟')){state=clone(defaults);renderAll();markDirty();}});

function updateLast(){ $('#lastUpdate').textContent=rowMeta.updated_at?`آخر تحديث: ${new Date(rowMeta.updated_at).toLocaleString('ar-EG')}`:''; }

function renderAll(){
  normalizeState(); renderHero(); renderTexts(); renderMedia(); renderSettings(); renderSEO(); syncRaw(); updateMetrics(); updateLast();
}
function updateMetrics(){ $('#metricDb').textContent='متصل'; $('#metricHero').textContent=state.hero.filter(x=>x.enabled!==false).length; $('#metricTexts').textContent=state.editableKeys?.length||Object.keys(state.texts.ar||{}).length; }

function renderHero(){
  const host=$('#heroList'); host.innerHTML='';
  state.hero.forEach((slide,i)=>{
    const card=document.createElement('article'); card.className='hero-card'; card.dataset.index=i;
    card.innerHTML=`<div><div class="hero-thumb"><img src="${escapeHtml(slide.image)}" alt=""></div><label class="upload-label" style="margin-top:10px">رفع صورة جديدة<input type="file" accept="image/*" data-hero-upload="${i}"></label><div class="upload-progress" data-progress="hero-${i}"></div></div><div class="hero-fields"><div style="display:flex;justify-content:space-between;gap:10px;align-items:center"><strong>Slide ${String(i+1).padStart(2,'0')}</strong><label class="check-row"><input type="checkbox" data-hero-enabled="${i}" ${slide.enabled!==false?'checked':''}> مفعّلة</label></div><div class="lang-pair"><div class="lang-field ar field"><label>العنوان العربي</label><textarea data-hero-field="title.ar" data-index="${i}">${escapeHtml(slide.title?.ar)}</textarea></div><div class="lang-field en field"><label>English title</label><textarea dir="ltr" data-hero-field="title.en" data-index="${i}">${escapeHtml(slide.title?.en)}</textarea></div></div><div class="grid-2"><div class="field"><label>رابط الزر الأساسي</label><input dir="ltr" data-hero-field="primary.href" data-index="${i}" value="${escapeHtml(slide.primary?.href||'#quote')}"></div><div class="lang-pair"><div class="lang-field ar field"><label>اسم الزر</label><input data-hero-field="primary.label.ar" data-index="${i}" value="${escapeHtml(slide.primary?.label?.ar)}"></div><div class="lang-field en field"><label>Button</label><input dir="ltr" data-hero-field="primary.label.en" data-index="${i}" value="${escapeHtml(slide.primary?.label?.en)}"></div></div></div><div class="grid-2"><div class="field"><label>رابط الزر الثاني</label><input dir="ltr" data-hero-field="secondary.href" data-index="${i}" value="${escapeHtml(slide.secondary?.href||'#creative')}"></div><div class="lang-pair"><div class="lang-field ar field"><label>اسم الزر الثاني</label><input data-hero-field="secondary.label.ar" data-index="${i}" value="${escapeHtml(slide.secondary?.label?.ar)}"></div><div class="lang-field en field"><label>Secondary</label><input dir="ltr" data-hero-field="secondary.label.en" data-index="${i}" value="${escapeHtml(slide.secondary?.label?.en)}"></div></div></div><div class="hero-actions"><button class="btn btn-small" data-move="up" data-index="${i}">↑ لفوق</button><button class="btn btn-small" data-move="down" data-index="${i}">↓ لتحت</button><button class="btn btn-small btn-danger" data-delete-hero="${i}">حذف</button></div></div>`;
    host.appendChild(card);
  });
}
$('#addHeroBtn').addEventListener('click',()=>{
  state.hero.push({image:'assets/hero/quality.webp',alt:'',title:{ar:'عنوان جديد',en:'New headline'},primary:{label:{ar:'اطلب عرض سعر',en:'Request a quote'},href:'#quote',targetBlank:false},secondary:{label:{ar:'تعرّف على خدماتنا',en:'Explore our services'},href:'#creative',targetBlank:false},enabled:true});
  renderHero();markDirty();
});

function textGroupFor(key){
  if(/^nav|^footer|^quickLinks|^backToTop|^rights|^mobileWorld/.test(key))return'nav';
  if(/^about|^check|^stat|^years|^vision|^mission/.test(key))return'about';
  if(/^creative|^svc\d|^orderService|^type(Contracting|Interior|Commercial|Renovation|Luxury|Supervision|Booths)/.test(key))return'services';
  if(/^quote|^nameLabel|^nameHolder|^phoneLabel|^city|^message|^consent|^sendWhatsApp|^typeLabel|^typeChoose|^typeOther/.test(key))return'quote';
  if(/^contact|^social|^whatsappLabel|^callLabel|^emailLabelShort|^floating/.test(key))return'contact';
  return'other';
}
function renderTexts(){
  const host=$('#textsGrid'); host.innerHTML='';
  const query=($('#textSearch').value||'').trim().toLowerCase(), group=$('#textGroup').value;
  const keys=state.editableKeys?.length?state.editableKeys:Object.keys(state.texts.ar||{});
  keys.forEach(key=>{
    const ar=state.texts.ar?.[key]??'', en=state.texts.en?.[key]??'';
    const g=textGroupFor(key); if(group!=='all'&&g!==group)return;
    if(query && !`${key} ${ar} ${en}`.toLowerCase().includes(query))return;
    const card=document.createElement('div'); card.className='text-card'; card.innerHTML=`<div class="text-key">${escapeHtml(key)}</div><div class="lang-pair"><div class="lang-field ar field"><textarea data-text-lang="ar" data-text-key="${escapeHtml(key)}">${escapeHtml(ar)}</textarea></div><div class="lang-field en field"><textarea dir="ltr" data-text-lang="en" data-text-key="${escapeHtml(key)}">${escapeHtml(en)}</textarea></div></div>`; host.appendChild(card);
  });
}
$('#textSearch').addEventListener('input',renderTexts); $('#textGroup').addEventListener('change',renderTexts);

function renderMedia(){
  const host=$('#mediaGrid');host.innerHTML='';
  Object.entries(mediaLabels).forEach(([key,label])=>{
    const value=state.media[key]||''; const isPdf=key==='portfolioPdf';
    const card=document.createElement('div');card.className='media-card';card.innerHTML=`<h3>${label}</h3><div class="media-preview">${isPdf?'<span style="font-size:44px;color:var(--gold)">PDF</span>':`<img src="${escapeHtml(value)}" alt="">`}</div><div class="field"><label>الرابط / المسار</label><input dir="ltr" data-media-url="${key}" value="${escapeHtml(value)}"></div><label class="upload-label">${isPdf?'رفع PDF':'رفع صورة'}<input type="file" ${isPdf?'accept="application/pdf"':'accept="image/*"'} data-media-upload="${key}"></label><div class="upload-progress" data-progress="media-${key}"></div>`;host.appendChild(card);
  });
}

function renderSettings(){
  const host=$('#settingsFields');host.innerHTML='';
  Object.entries(settingsLabels).forEach(([key,label])=>{ const div=document.createElement('div'); div.className='field'; div.innerHTML=`<label>${label}</label><input ${key==='defaultLanguage'?'':'dir="ltr"'} data-setting="${key}" value="${escapeHtml(state.settings[key]||'')}">`;host.appendChild(div);});
  const s=$('#statsFields');s.innerHTML='';Object.entries(statsLabels).forEach(([key,label])=>{const div=document.createElement('div');div.className='field';div.innerHTML=`<label>${label}</label><input type="number" min="0" data-stat="${key}" value="${Number(state.stats[key]||0)}">`;s.appendChild(div);});
}
function renderSEO(){
  const host=$('#seoFields');host.innerHTML='';Object.entries(seoLabels).forEach(([key,label])=>{const div=document.createElement('div');div.className='field';div.innerHTML=`<label>${label}</label>${key.toLowerCase().includes('description')?`<textarea data-seo="${key}">${escapeHtml(state.seo[key]||'')}</textarea>`:`<input data-seo="${key}" value="${escapeHtml(state.seo[key]||'')}">`}`;host.appendChild(div);});
}

function setPath(obj,path,value){ const parts=path.split('.');let cur=obj;for(let i=0;i<parts.length-1;i++){cur[parts[i]]??={};cur=cur[parts[i]];}cur[parts.at(-1)]=value; }
function collectAllInputs(){
  $$('[data-text-key]').forEach(el=>{state.texts[el.dataset.textLang][el.dataset.textKey]=el.value;});
  $$('[data-setting]').forEach(el=>state.settings[el.dataset.setting]=el.value);
  $$('[data-stat]').forEach(el=>state.stats[el.dataset.stat]=Number(el.value||0));
  $$('[data-seo]').forEach(el=>state.seo[el.dataset.seo]=el.value);
  $$('[data-media-url]').forEach(el=>state.media[el.dataset.mediaUrl]=el.value);
  $$('[data-hero-field]').forEach(el=>{const i=Number(el.dataset.index);if(state.hero[i])setPath(state.hero[i],el.dataset.heroField,el.value);});
  $$('[data-hero-enabled]').forEach(el=>{const i=Number(el.dataset.heroEnabled);if(state.hero[i])state.hero[i].enabled=el.checked;});
}

document.addEventListener('input',e=>{if(e.target.matches('[data-text-key],[data-setting],[data-stat],[data-seo],[data-media-url],[data-hero-field]')){collectAllInputs();markDirty();}});
document.addEventListener('change',e=>{if(e.target.matches('[data-hero-enabled]')){collectAllInputs();markDirty();}});

document.addEventListener('click',e=>{
  const move=e.target.closest('[data-move]');if(move){collectAllInputs();const i=Number(move.dataset.index),j=move.dataset.move==='up'?i-1:i+1;if(j>=0&&j<state.hero.length){[state.hero[i],state.hero[j]]=[state.hero[j],state.hero[i]];renderHero();markDirty();}return;}
  const del=e.target.closest('[data-delete-hero]');if(del){const i=Number(del.dataset.deleteHero);if(confirm('حذف الـSlide؟')){state.hero.splice(i,1);renderHero();markDirty();}return;}
});

async function optimizeImage(file){
  if(!file.type.startsWith('image/')||file.type==='image/svg+xml'||file.size<350000)return{blob:file,ext:(file.name.split('.').pop()||'bin').toLowerCase()};
  const bmp=await createImageBitmap(file); const max=2200; const scale=Math.min(1,max/Math.max(bmp.width,bmp.height)); const canvas=document.createElement('canvas');canvas.width=Math.round(bmp.width*scale);canvas.height=Math.round(bmp.height*scale);const ctx=canvas.getContext('2d');ctx.drawImage(bmp,0,0,canvas.width,canvas.height);const blob=await new Promise(r=>canvas.toBlob(r,'image/webp',0.86));return{blob:blob||file,ext:blob?'webp':(file.name.split('.').pop()||'bin')};
}
async function uploadFile(file,folder,progressKey){
  const progress=$(`[data-progress="${progressKey}"]`);if(progress)progress.textContent='جاري التجهيز والرفع…';
  try{
    const optimized=file.type==='application/pdf'?{blob:file,ext:'pdf'}:await optimizeImage(file);
    const safe=(file.name.replace(/\.[^.]+$/,'').replace(/[^a-zA-Z0-9_-]+/g,'-').slice(0,40)||'asset');
    const path=`site/${folder}/${Date.now()}-${safe}.${optimized.ext}`;
    const {error}=await supabase.storage.from(cfg.bucket||'tigress-media').upload(path,optimized.blob,{cacheControl:'31536000',upsert:false,contentType:optimized.blob.type||file.type});
    if(error)throw error;
    const {data}=supabase.storage.from(cfg.bucket||'tigress-media').getPublicUrl(path);
    if(progress)progress.textContent='تم الرفع ✓'; return data.publicUrl;
  }catch(err){if(progress)progress.textContent='فشل الرفع: '+err.message;toast(err.message,'error');return null;}
}

document.addEventListener('change',async e=>{
  const heroInput=e.target.closest('[data-hero-upload]');
  if(heroInput&&heroInput.files[0]){const i=Number(heroInput.dataset.heroUpload);const url=await uploadFile(heroInput.files[0],`hero-${i}`,`hero-${i}`);if(url){state.hero[i].image=url;renderHero();markDirty();}return;}
  const mediaInput=e.target.closest('[data-media-upload]');
  if(mediaInput&&mediaInput.files[0]){const key=mediaInput.dataset.mediaUpload;const url=await uploadFile(mediaInput.files[0],key,`media-${key}`);if(url){state.media[key]=url;renderMedia();markDirty();}}
});

$('#applyJsonBtn').addEventListener('click',()=>{try{state=deepMerge(defaults,JSON.parse($('#rawJson').value));renderAll();markDirty();toast('تم تطبيق JSON');}catch(e){toast('JSON غير صالح: '+e.message,'error');}});

$$('.nav-btn').forEach(btn=>btn.addEventListener('click',()=>{const view=btn.dataset.view;$$('.nav-btn').forEach(x=>x.classList.toggle('active',x===btn));$$('.section-view').forEach(s=>s.classList.toggle('active',s.dataset.section===view));$('#sidebar').classList.remove('open');if(view==='advanced')syncRaw();}));
$('#mobileMenuBtn').addEventListener('click',()=>$('#sidebar').classList.toggle('open'));
