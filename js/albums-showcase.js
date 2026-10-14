(() => {
  'use strict';

  const viewport = document.querySelector('.albums-slider-viewport');
  const track = document.querySelector('#albumsSliderTrack');
  if (!viewport || !track) return;

  const prev = document.querySelector('[data-albums-prev]');
  const next = document.querySelector('[data-albums-next]');
  const albumData = Array.isArray(window.TIGRESS_ALBUMS) ? window.TIGRESS_ALBUMS : [];
  if (!albumData.length) return;

  const lang = () => document.documentElement.lang === 'en' ? 'en' : 'ar';
  const coverSrc = album =>
    `assets/luxury/${album.folder}/${String(album.cover || 1).padStart(2, '0')}.webp`;

  /*
   * Cards are generated from js/albums-data.js.
   * To add an album, edit ONLY that file; no HTML/CSS/slider changes are required.
   */
  function cardMarkup(album, itemIndex) {
    const title = album[lang()] || album.ar || album.en || album.key;
    const countLabel = lang() === 'ar' ? `${album.total} صورة` : `${album.total} IMAGES`;
    const browseLabel = lang() === 'ar' ? 'تصفّح الألبوم' : 'Browse album';

    return `
      <button class="album-slide-card" data-album="${album.key}" data-album-item="${itemIndex}" type="button" aria-label="${title}">
        <span class="album-slide-media">
          <img alt="" decoding="async" loading="lazy" src="${coverSrc(album)}" draggable="false">
        </span>
        <span class="album-slide-shade"></span>
        <span class="album-slide-index">${String(itemIndex + 1).padStart(2, '0')}</span>
        <span class="album-slide-content">
          <small class="album-slide-count">TIGRESS COLLECTION · ${album.total}</small>
          <strong class="album-slide-title">${title}</strong>
          <span class="album-slide-open"><span>${browseLabel}</span><i class="fa-solid fa-book-open" aria-hidden="true"></i></span>
        </span>
      </button>`;
  }

  track.innerHTML = albumData.map(cardMarkup).join('');

  let originals = [...track.querySelectorAll('.album-slide-card')];
  const count = originals.length;

  // Five identical sets: two before + originals + two after.
  // This keeps both arrows endless while every click still opens the correct album.
  const makeSet = setIndex => originals.map((card, itemIndex) => {
    const clone = card.cloneNode(true);
    clone.dataset.loopClone = 'true';
    clone.dataset.loopSet = String(setIndex);
    clone.dataset.loopItem = String(itemIndex);
    clone.tabIndex = -1;
    clone.setAttribute('aria-hidden', 'true');
    return clone;
  });

  track.prepend(...makeSet(0), ...makeSet(1));
  track.append(...makeSet(3), ...makeSet(4));

  const allCards = () => [...track.querySelectorAll('.album-slide-card')];
  let index = count * 2; // first card in the real/middle set
  let locked = false;

  function metrics() {
    const card = allCards()[0];
    const gap = parseFloat(getComputedStyle(track).gap) || 20;
    return { step: (card?.getBoundingClientRect().width || 360) + gap };
  }

  function paint(animate = true) {
    const { step } = metrics();
    track.classList.toggle('no-transition', !animate);
    track.style.transform = `translate3d(${-index * step}px,0,0)`;
    if (!animate) requestAnimationFrame(() => track.classList.remove('no-transition'));
  }

  function normalize() {
    if (index >= count * 3) {
      index -= count;
      paint(false);
    } else if (index < count * 2) {
      index += count;
      paint(false);
    }
    locked = false;
  }

  function move(delta) {
    if (locked) return;
    locked = true;
    index += delta; // exactly ONE album per click
    paint(true);
  }

  prev?.addEventListener('click', () => move(-1));
  next?.addEventListener('click', () => move(1));

  track.addEventListener('transitionend', event => {
    if (event.propertyName === 'transform') normalize();
  });

  // No mouse grab/drag: a card click is always a card click.
  track.addEventListener('dragstart', event => event.preventDefault());

  viewport.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft') { event.preventDefault(); move(1); }
    if (event.key === 'ArrowRight') { event.preventDefault(); move(-1); }
  });

  function localizeCards() {
    allCards().forEach(card => {
      const album = albumData.find(item => item.key === card.dataset.album);
      if (!album) return;
      const title = album[lang()] || album.ar || album.en || album.key;
      const browseLabel = lang() === 'ar' ? 'تصفّح الألبوم' : 'Browse album';
      const titleEl = card.querySelector('.album-slide-title');
      const openEl = card.querySelector('.album-slide-open span');
      if (titleEl) titleEl.textContent = title;
      if (openEl) openEl.textContent = browseLabel;
      card.setAttribute('aria-label', title);
    });
  }

  new MutationObserver(localizeCards).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['lang', 'dir']
  });

  let resizeTimer = 0;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => paint(false), 80);
  }, { passive: true });

  requestAnimationFrame(() => paint(false));
})();
