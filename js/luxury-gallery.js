(() => {
  'use strict';

  const qs = (s, r = document) => r.querySelector(s);
  const qsa = (s, r = document) => [...r.querySelectorAll(s)];
  const config = window.TIGRESS_CONFIG || {};
  const wa = String(config.whatsapp || '').replace(/\D/g, '');

  // Change only the number here when you add/remove images.
  // Files must be sequential: 01.webp, 02.webp, 03.webp ...
  const makeFiles = (folder, total) =>
    Array.from({ length: total }, (_, i) =>
      `assets/luxury/${folder}/${String(i + 1).padStart(2, '0')}.webp`
    );

  const albums = {
    rugs: {
      ar: 'تصميم وتفصيل أفخر أنواع السجاد',
      en: 'Design & tailoring of premium rugs',
      files: makeFiles('rugs', 6)
    },
    furniture: {
      ar: 'تصميم وتنفيذ أجمل قطع الأثاث',
      en: 'Design & execution of bespoke furniture',
      files: makeFiles('furniture', 13)
    },
    chandeliers: {
      ar: 'تصميم وتنفيذ الثريات الكلاسيك بجميع المقاسات',
      en: 'Classic chandeliers in custom sizes',
      files: makeFiles('chandeliers', 2)
    },
    lighting: {
      ar: 'تصميم وتنفيذ جميع أنواع الإنارات',
      en: 'Design & execution of all lighting types',
      files: makeFiles('lighting', 22)
    },
    accessories: {
      ar: 'نقتني لك أجمل قطع الإكسسوارات لتزيّن مساحتك',
      en: 'Curated accessories to complete your space',
      files: makeFiles('accessories', 6)
    }
  };

  const bookModal = qs('#luxBookModal');
  const book = qs('#luxBook');
  const counter = qs('#luxBookCounter');
  const pdfModal = qs('#portfolioModal');

  let leaves = [];
  let current = 0;
  let currentAlbum = null;
  let resetting = false;

  const lang = () => document.documentElement.lang === 'en' ? 'en' : 'ar';

  const stopScroll = () => {
    document.body.classList.add('lux-modal-open');
    window.tigressLenis?.stop?.();
  };

  const startScroll = () => {
    document.body.classList.remove('lux-modal-open');
    window.tigressLenis?.start?.();
  };

  function getAlbumTitle(album) {
    return album?.[lang()] || '';
  }

  function getCountLabel(count) {
    return lang() === 'ar' ? `${count} صورة` : `${count} IMAGES`;
  }

  function getBrowseLabel() {
    return lang() === 'ar' ? 'تصفّح الألبوم' : 'Browse album';
  }

  function getHintLabel() {
    return lang() === 'ar' ? 'اضغط لفتح الكتاب' : 'Open the collection';
  }

  /*
   * Makes every outside album card use:
   * - the exact same first image used inside the book
   * - the same title source
   * - the same metadata/action structure
   *
   * No need to duplicate markup manually in index.html.
   */
  function syncLibraryCards() {
    qsa('[data-album]').forEach(btn => {
      const key = btn.dataset.album;
      const album = albums[key];
      if (!album) return;

      const art = qs('.volume-art', btn);
      const img = qs('.volume-art img', btn);

      if (img && album.files[0]) {
        img.src = album.files[0];
        img.alt = getAlbumTitle(album);
        img.loading = 'lazy';
        img.decoding = 'async';
      }

      let meta = qs('.volume-meta', btn);
      if (!meta) {
        meta = document.createElement('span');
        meta.className = 'volume-meta lux-generated-meta';
        if (art) art.insertAdjacentElement('afterend', meta);
        else btn.appendChild(meta);
      }

      let countEl = qs('.lux-card-count', meta);
      let titleEl = qs('.lux-card-title', meta);
      let hintEl = qs('.lux-card-hint', meta);

      if (!countEl) {
        countEl = document.createElement('small');
        countEl.className = 'lux-card-count';
        meta.appendChild(countEl);
      }

      if (!titleEl) {
        titleEl = document.createElement('strong');
        titleEl.className = 'lux-card-title';
        meta.appendChild(titleEl);
      }

      if (!hintEl) {
        hintEl = document.createElement('em');
        hintEl.className = 'lux-card-hint';
        meta.appendChild(hintEl);
      }

      countEl.textContent = getCountLabel(album.files.length);
      titleEl.textContent = getAlbumTitle(album);
      hintEl.textContent = getHintLabel();

      let action = qs('.volume-action', btn);
      if (!action) {
        action = document.createElement('span');
        action.className = 'volume-action';
        btn.appendChild(action);
      }

      action.innerHTML = `
        <span class="lux-card-action-text"></span>
        <i class="fa-solid fa-book-open" aria-hidden="true"></i>
      `;
      qs('.lux-card-action-text', action).textContent = getBrowseLabel();

      btn.setAttribute(
        'aria-label',
        `${getAlbumTitle(album)} — ${getBrowseLabel()}`
      );
    });
  }

  function createPageImage(src, alt = '') {
    const img = document.createElement('img');
    img.src = src;
    img.alt = alt;
    img.decoding = 'async';
    img.draggable = false;
    return img;
  }

  function makeBook(album) {
    if (!book || !album) return;

    currentAlbum = album;
    current = 0;
    resetting = false;

    book.innerHTML = '';
    book.classList.remove('book-open', 'is-resetting');

    const files = album.files || [];
    const leafCount = Math.ceil(files.length / 2);

    for (let i = 0; i < leafCount; i++) {
      const frontSrc = files[i * 2];
      const backSrc = files[i * 2 + 1];

      const leaf = document.createElement('div');
      leaf.className = 'lux-book-page';
      leaf.style.zIndex = String(leafCount - i + 5);
      leaf.dataset.leaf = String(i);

      const front = document.createElement('div');
      front.className = 'lux-page-face lux-page-front';

      if (frontSrc) {
        const fi = createPageImage(frontSrc, '');
        if (i > 0) fi.loading = 'lazy';
        front.appendChild(fi);
      } else {
        front.classList.add('lux-page-empty');
      }

      // First image = book cover.
      if (i === 0) {
        front.classList.add('lux-cover-page');

        const caption = document.createElement('div');
        caption.className = 'lux-cover-caption';

        const title = document.createElement('strong');
        title.className = 'lux-cover-title';
        title.textContent = getAlbumTitle(album);

        const volume = document.createElement('span');
        volume.className = 'lux-cover-volume';
        volume.textContent = lang() === 'ar' ? 'المجلد 01' : 'VOLUME 01';

        caption.append(title, volume);
        front.appendChild(caption);
      }

      const back = document.createElement('div');
      back.className = 'lux-page-face lux-page-back';

      if (backSrc) {
        const bi = createPageImage(backSrc, '');
        bi.loading = 'lazy';
        back.appendChild(bi);
      } else {
        // Important for odd image counts:
        // do NOT repeat the last image on the back.
        back.classList.add('lux-page-empty');
      }

      leaf.append(front, back);
      book.appendChild(leaf);
    }

    leaves = qsa('.lux-book-page', book);

    // Prevent Arabic bidi from visually turning "01 / 22" into "22 / 01".
    if (counter) {
      counter.dir = 'ltr';
      counter.style.direction = 'ltr';
      counter.style.unicodeBidi = 'isolate';
    }

    updateCounter();
  }

  function updateCounter() {
    if (!counter) return;

    const total = currentAlbum?.files?.length || 0;

    if (!total) {
      counter.textContent = '00 / 00';
      return;
    }

    // Closed cover.
    if (current === 0) {
      counter.textContent = `01 / ${String(total).padStart(2, '0')}`;
    } else {
      // Open book shows a left/back page and (normally) the next right/front page.
      const leftPage = current * 2;
      const rightPage = Math.min(total, leftPage + 1);

      if (leftPage >= total || leftPage === rightPage) {
        counter.textContent =
          `${String(Math.min(leftPage, total)).padStart(2, '0')} / ${String(total).padStart(2, '0')}`;
      } else {
        counter.textContent =
          `${String(leftPage).padStart(2, '0')}–${String(rightPage).padStart(2, '0')} / ${String(total).padStart(2, '0')}`;
      }
    }

    book?.classList.toggle('book-open', current > 0);
  }

  function nextPage() {
    if (resetting || !leaves.length) return;

    if (current < leaves.length) {
      const leaf = leaves[current];
      leaf.classList.add('is-open');
      leaf.style.zIndex = String(100 + current);
      current++;
      updateCounter();
      return;
    }

    // Last page -> smoothly return to the cover.
    resetting = true;
    book.classList.add('is-resetting');

    leaves.slice().reverse().forEach((leaf, i) => {
      setTimeout(() => leaf.classList.remove('is-open'), i * 42);
    });

    setTimeout(() => {
      current = 0;
      leaves.forEach((leaf, i) => {
        leaf.style.zIndex = String(leaves.length - i + 5);
      });
      book.classList.remove('book-open', 'is-resetting');
      updateCounter();
      resetting = false;
    }, Math.max(430, leaves.length * 42 + 260));
  }

  function prevPage() {
    if (resetting || !leaves.length) return;

    if (current > 0) {
      current--;
      const leaf = leaves[current];
      leaf.classList.remove('is-open');
      leaf.style.zIndex = String(leaves.length - current + 5);
      updateCounter();
      return;
    }

    // From cover -> go to the end, then move back one spread.
    resetting = true;
    book.classList.add('is-resetting');

    leaves.forEach((leaf, i) => {
      leaf.classList.add('is-open');
      leaf.style.zIndex = String(100 + i);
    });

    current = leaves.length;
    updateCounter();

    setTimeout(() => {
      book.classList.remove('is-resetting');
      resetting = false;
      prevPage();
    }, 260);
  }

  function openBook(key) {
    const album = albums[key];
    if (!album || !bookModal) return;

    makeBook(album);
    bookModal.hidden = false;
    bookModal.setAttribute('aria-hidden', 'false');
    stopScroll();
  }

  function closeBook() {
    if (!bookModal) return;
    bookModal.hidden = true;
    bookModal.setAttribute('aria-hidden', 'true');
    startScroll();
  }

  function openPdf() {
    if (!pdfModal) return;
    pdfModal.hidden = false;
    pdfModal.setAttribute('aria-hidden', 'false');
    stopScroll();
  }

  function closePdf() {
    if (!pdfModal) return;
    pdfModal.hidden = true;
    pdfModal.setAttribute('aria-hidden', 'true');
    startScroll();
  }

  // Make cards consistent immediately.
  syncLibraryCards();

  qsa('[data-album]').forEach(btn => {
    btn.addEventListener('click', () => openBook(btn.dataset.album));
  });

  qs('[data-pdf-open]')?.addEventListener('click', openPdf);
  qsa('[data-lux-close]').forEach(el => el.addEventListener('click', closeBook));
  qsa('[data-pdf-close]').forEach(el => el.addEventListener('click', closePdf));
  qsa('[data-book-next]').forEach(el => el.addEventListener('click', nextPage));
  qsa('[data-book-prev]').forEach(el => el.addEventListener('click', prevPage));

  // Click directly on the book.
  qs('#luxBookStage')?.addEventListener('click', event => {
    if (event.target.closest('button')) return;
    if (!book) return;

    const rect = book.getBoundingClientRect();

    if (
      event.clientX < rect.left ||
      event.clientX > rect.right ||
      event.clientY < rect.top ||
      event.clientY > rect.bottom
    ) return;

    const x = (event.clientX - rect.left) / rect.width;

    // Physical interaction stays intuitive:
    // right half = next, left half = previous.
    if (x >= 0.5) nextPage();
    else prevPage();
  });

  qsa('[data-lux-wa]').forEach(btn => {
    btn.addEventListener('click', event => {
      if (!wa) return;

      event.preventDefault();
      const title = btn.dataset.luxWa || '';

      const text = lang() === 'ar'
        ? `السلام عليكم، أرغب في الاستفسار عن خدمة: ${title}`
        : `Hello, I would like to ask about: ${title}`;

      window.open(
        `https://wa.me/${wa}?text=${encodeURIComponent(text)}`,
        '_blank',
        'noopener'
      );
    });
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      if (bookModal && !bookModal.hidden) closeBook();
      if (pdfModal && !pdfModal.hidden) closePdf();
    }

    if (bookModal && !bookModal.hidden) {
      if (event.key === 'ArrowRight') nextPage();
      if (event.key === 'ArrowLeft') prevPage();
    }
  });

  // Update BOTH outside cards and inside cover when AR/EN changes.
  const observer = new MutationObserver(() => {
    syncLibraryCards();

    if (!currentAlbum || !book) return;

    const title = qs('.lux-cover-title', book);
    const volume = qs('.lux-cover-volume', book);

    if (title) title.textContent = getAlbumTitle(currentAlbum);
    if (volume) {
      volume.textContent = lang() === 'ar' ? 'المجلد 01' : 'VOLUME 01';
    }
  });

  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['lang', 'dir']
  });
})();
