(() => {
  'use strict';

  const qs=(s,r=document)=>r.querySelector(s);
  const qsa=(s,r=document)=>[...r.querySelectorAll(s)];
  const config=window.TIGRESS_CONFIG||{};
  const wa=String(config.whatsapp||'').replace(/\D/g,'');

  const albums={
    rugs:{
      ar:'تصميم وتفصيل أفخر أنواع السجاد',
      en:'Design & tailoring of premium rugs',
      files:[1,2,3,4,5,6].map(n=>`assets/luxury/rugs/${String(n).padStart(2,'0')}.webp`)
    },
    furniture:{
      ar:'تصميم وتنفيذ أجمل قطع الأثاث',
      en:'Design & execution of bespoke furniture',
      files:[1,2,3,4,5,6].map(n=>`assets/luxury/furniture/${String(n).padStart(2,'0')}.webp`)
    },
    chandeliers:{
      ar:'تصميم وتنفيذ الثريات الكلاسيك بجميع المقاسات',
      en:'Classic chandeliers in custom sizes',
      files:[1,2,3,4,5,6].map(n=>`assets/luxury/chandeliers/${String(n).padStart(2,'0')}.webp`)
    },
    lighting:{
      ar:'تصميم وتنفيذ جميع أنواع الإنارات',
      en:'Design & execution of all lighting types',
      files:[1,2,3,4,5,6].map(n=>`assets/luxury/lighting/${String(n).padStart(2,'0')}.webp`)
    },
    accessories:{
      ar:'نقتني لك أجمل قطع الإكسسوارات لتزيّن مساحتك',
      en:'Curated accessories to complete your space',
      files:[1,2,3,4,5,6].map(n=>`assets/luxury/accessories/${String(n).padStart(2,'0')}.webp`)
    }
  };

  const bookModal=qs('#luxBookModal');
  const book=qs('#luxBook');
  const bookTitle=qs('#luxBookTitle');
  const counter=qs('#luxBookCounter');
  const pdfModal=qs('#portfolioModal');
  let leaves=[];
  let current=0;
  let currentAlbum=null;
  let resetting=false;

  const lang=()=>document.documentElement.lang==='en'?'en':'ar';
  const stopScroll=()=>{document.body.classList.add('lux-modal-open');window.tigressLenis?.stop?.();};
  const startScroll=()=>{document.body.classList.remove('lux-modal-open');window.tigressLenis?.start?.();};

  function makeBook(album){
    currentAlbum=album;
    current=0;
    resetting=false;
    book.innerHTML='';
    book.classList.remove('book-open','is-resetting');
    bookTitle.textContent=album[lang()];
    const files=album.files;
    const leafCount=Math.ceil(files.length/2);

    for(let i=0;i<leafCount;i++){
      const leaf=document.createElement('div');
      leaf.className='lux-book-page';
      leaf.style.zIndex=String(leafCount-i+5);
      leaf.dataset.leaf=String(i);

      const front=document.createElement('div');
      front.className='lux-page-face lux-page-front';
      const fi=document.createElement('img');
      fi.src=files[i*2]||files[0]; fi.alt='';
      front.appendChild(fi);

      const back=document.createElement('div');
      back.className='lux-page-face lux-page-back';
      const bi=document.createElement('img');
      bi.src=files[i*2+1]||files[files.length-1]; bi.alt='';
      back.appendChild(bi);

      leaf.append(front,back);
      book.appendChild(leaf);
    }
    leaves=qsa('.lux-book-page',book);
    updateCounter();
  }

  function updateCounter(){
    const total=currentAlbum?.files?.length||0;
    const page=Math.min(total, current*2+1);
    counter.textContent=`${String(page).padStart(2,'0')} / ${String(total).padStart(2,'0')}`;
    book.classList.toggle('book-open',current>0);
  }

  function nextPage(){
    if(resetting||!leaves.length)return;
    if(current < leaves.length){
      leaves[current].classList.add('is-open');
      leaves[current].style.zIndex=String(30+current);
      current++;
      updateCounter();
      return;
    }
    // After the last page: reset the book back to page one, then continue normally.
    resetting=true;
    book.classList.add('is-resetting');
    leaves.slice().reverse().forEach((leaf,i)=>{
      setTimeout(()=>leaf.classList.remove('is-open'),i*55);
    });
    setTimeout(()=>{
      current=0;
      leaves.forEach((leaf,i)=>leaf.style.zIndex=String(leaves.length-i+5));
      book.classList.remove('book-open','is-resetting');
      updateCounter();
      resetting=false;
    },Math.max(430,leaves.length*55+260));
  }

  function prevPage(){
    if(resetting||!leaves.length)return;
    if(current>0){
      current--;
      leaves[current].classList.remove('is-open');
      leaves[current].style.zIndex=String(leaves.length-current+5);
      updateCounter();
      return;
    }
    // From page one, loop to the end, then flip one leaf back.
    resetting=true;
    book.classList.add('is-resetting');
    leaves.forEach((leaf,i)=>{
      leaf.classList.add('is-open');
      leaf.style.zIndex=String(30+i);
    });
    current=leaves.length;
    updateCounter();
    setTimeout(()=>{
      book.classList.remove('is-resetting');
      resetting=false;
      prevPage();
    },260);
  }

  function openBook(key){
    const album=albums[key]; if(!album)return;
    makeBook(album);
    bookModal.hidden=false;
    bookModal.setAttribute('aria-hidden','false');
    stopScroll();
  }
  function closeBook(){
    bookModal.hidden=true;
    bookModal.setAttribute('aria-hidden','true');
    startScroll();
  }
  function openPdf(){
    pdfModal.hidden=false;
    pdfModal.setAttribute('aria-hidden','false');
    stopScroll();
  }
  function closePdf(){
    pdfModal.hidden=true;
    pdfModal.setAttribute('aria-hidden','true');
    startScroll();
  }

  qsa('[data-album]').forEach(btn=>btn.addEventListener('click',()=>openBook(btn.dataset.album)));
  qs('[data-pdf-open]')?.addEventListener('click',openPdf);
  qsa('[data-lux-close]').forEach(el=>el.addEventListener('click',closeBook));
  qsa('[data-pdf-close]').forEach(el=>el.addEventListener('click',closePdf));
  qsa('[data-book-next]').forEach(el=>el.addEventListener('click',nextPage));
  qsa('[data-book-prev]').forEach(el=>el.addEventListener('click',prevPage));

  // Direct interaction with the book: right half = next, left half = previous.
  qs('#luxBookStage')?.addEventListener('click',event=>{
    if(event.target.closest('button'))return;
    const rect=book.getBoundingClientRect();
    if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)return;
    const x=(event.clientX-rect.left)/rect.width;
    if(x>=.5)nextPage(); else prevPage();
  });

  // Optional WhatsApp enquiry from cards with data-lux-wa if added later.
  qsa('[data-lux-wa]').forEach(btn=>btn.addEventListener('click',event=>{
    if(!wa)return;
    event.preventDefault();
    const title=btn.dataset.luxWa;
    const text=lang()==='ar'
      ? `السلام عليكم، أرغب في الاستفسار عن خدمة: ${title}`
      : `Hello, I would like to ask about: ${title}`;
    window.open(`https://wa.me/${wa}?text=${encodeURIComponent(text)}`,'_blank','noopener');
  }));

  document.addEventListener('keydown',event=>{
    if(event.key==='Escape'){
      if(!bookModal.hidden)closeBook();
      if(!pdfModal.hidden)closePdf();
    }
    if(!bookModal.hidden){
      if(event.key==='ArrowRight')nextPage();
      if(event.key==='ArrowLeft')prevPage();
    }
  });

  // Keep modal title in sync when site language changes.
  const observer=new MutationObserver(()=>{
    if(currentAlbum)bookTitle.textContent=currentAlbum[lang()];
  });
  observer.observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
})();