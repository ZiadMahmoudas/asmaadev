(() => {
  'use strict';

  const root=document.querySelector('#hero.hero-showcase');
  if(!root)return;

  const prev=root.querySelector('#heroShowcasePrev');
  const next=root.querySelector('#heroShowcaseNext');
  const counter=root.querySelector('#heroShowcaseCounter');
  const fill=root.querySelector('#heroShowcaseProgressFill');
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const cycle=6800;
  let slides=[];
  let current=0;
  let timer=0;
  let visible=true;
  let dragging=false;
  let sx=0,sy=0,dx=0;

  root.style.setProperty('--hero-cycle',cycle+'ms');

  const lang=()=>document.documentElement.lang==='en'?'en':'ar';

  function refreshSlides(){
    slides=[...root.querySelectorAll('.hero-showcase-slide')];
    const activeIndex=slides.findIndex(slide=>slide.classList.contains('is-active'));
    current=activeIndex>=0?activeIndex:Math.min(current,Math.max(0,slides.length-1));
  }

  function translate(){
    const key=lang()==='en'?'en':'ar';
    root.querySelectorAll('[data-ar][data-en]').forEach(el=>{
      el.textContent=el.dataset[key]||el.dataset.ar||el.dataset.en||el.textContent;
    });
    prev?.setAttribute('aria-label',key==='ar'?'السابق':'Previous slide');
    next?.setAttribute('aria-label',key==='ar'?'التالي':'Next slide');
  }

  function restartClock(){
    clearTimeout(timer);
    root.classList.remove('is-running');
    if(reduced||!visible||slides.length<2)return;
    root.classList.add('is-running');
    timer=window.setTimeout(()=>show(current+1),cycle);
  }

  function show(index,{restart=true}={}){
    refreshSlides();
    if(!slides.length)return;
    current=(index+slides.length)%slides.length;
    slides.forEach((slide,i)=>{
      const active=i===current;
      slide.classList.toggle('is-active',active);
      slide.setAttribute('aria-hidden',String(!active));
    });
    if(counter) counter.textContent=String(current+1).padStart(2,'0')+' / '+String(slides.length).padStart(2,'0');
    if(restart)restartClock();
  }

  fill?.addEventListener('animationend',event=>{
    if(event.animationName!=='heroShowcaseProgress'||!visible)return;
    show(current+1);
  });

  prev?.addEventListener('click',()=>show(current-1));
  next?.addEventListener('click',()=>show(current+1));

  root.addEventListener('keydown',event=>{
    if(event.key==='ArrowRight'){show(current+1);event.preventDefault();}
    if(event.key==='ArrowLeft'){show(current-1);event.preventDefault();}
  });

  root.addEventListener('pointerdown',event=>{
    if(event.target.closest('a,button'))return;
    dragging=true;sx=event.clientX;sy=event.clientY;dx=0;
  });
  root.addEventListener('pointermove',event=>{
    if(!dragging)return;
    dx=event.clientX-sx;
    const dy=event.clientY-sy;
    if(Math.abs(dy)>Math.abs(dx)*1.15){dragging=false;dx=0;}
  },{passive:true});
  root.addEventListener('pointerup',()=>{
    if(!dragging)return;
    dragging=false;
    if(Math.abs(dx)>55)show(current+(dx<0?1:-1));
    dx=0;
  });
  root.addEventListener('pointercancel',()=>{dragging=false;dx=0;});

  if('IntersectionObserver' in window){
    const io=new IntersectionObserver(entries=>{
      visible=entries[0].isIntersecting;
      if(visible)restartClock();
      else{clearTimeout(timer);root.classList.remove('is-running');}
    },{threshold:.15});
    io.observe(root);
  }

  document.addEventListener('visibilitychange',()=>{
    if(document.hidden){clearTimeout(timer);root.classList.remove('is-running');}
    else if(visible)restartClock();
  });

  new MutationObserver(translate).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
  document.addEventListener('tigress:hero-rebuild',()=>{
    refreshSlides();
    translate();
    show(0);
  });
  window.TIGRESS_HERO_REFRESH=()=>{refreshSlides();translate();show(current);};

  refreshSlides();
  translate();
  show(current);
})();
