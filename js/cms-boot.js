(() => {
  'use strict';

  const cfg = window.TIGRESS_SUPABASE || {};
  const siteId = cfg.siteId || 'main';
  const cacheKey = `tigress:cms:${siteId}:v1`;

  const safeJSON = (value) => {
    try { return JSON.parse(value); } catch { return null; }
  };

  const qsa = (selector, root = document) => [...root.querySelectorAll(selector)];
  const qs = (selector, root = document) => root.querySelector(selector);

  function normalizeHref(href) {
    return String(href || '#').trim() || '#';
  }

  function targetAttrs(link, targetBlank) {
    if (!link) return;
    if (targetBlank) {
      link.target = '_blank';
      link.rel = 'noopener';
    } else {
      link.removeAttribute('target');
      link.removeAttribute('rel');
    }
  }

  function buildHero(hero) {
    const host = qs('#heroShowcaseSlides');
    if (!host || !Array.isArray(hero) || !hero.length) return;

    const enabled = hero.filter(item => item && item.enabled !== false && item.image);
    if (!enabled.length) return;

    host.innerHTML = '';
    enabled.forEach((item, index) => {
      const article = document.createElement('article');
      article.className = 'hero-showcase-slide' + (index === 0 ? ' is-active' : '');
      article.dataset.heroSlide = String(index);

      const img = document.createElement('img');
      img.src = item.image;
      img.alt = item.alt || '';
      img.decoding = 'async';
      if (index === 0) img.fetchPriority = 'high';
      else img.loading = 'lazy';

      const shade = document.createElement('div');
      shade.className = 'hero-showcase-shade';

      const content = document.createElement('div');
      content.className = 'hero-showcase-content wrap';
      const copy = document.createElement('div');
      copy.className = 'hero-showcase-copy';

      const title = document.createElement('h2');
      title.dataset.ar = item.title?.ar || '';
      title.dataset.en = item.title?.en || '';
      const lang = document.documentElement.lang === 'en' ? 'en' : 'ar';
      title.textContent = title.dataset[lang] || title.dataset.ar || title.dataset.en;
      copy.appendChild(title);

      const actions = document.createElement('div');
      actions.className = 'hero-showcase-actions';
      const createAction = (action, primary) => {
        if (!action || !action.href) return null;
        const a = document.createElement('a');
        a.className = `hero-showcase-cta ${primary ? 'hero-showcase-cta-primary' : 'hero-showcase-cta-ghost'}`;
        a.href = normalizeHref(action.href);
        targetAttrs(a, !!action.targetBlank);
        const span = document.createElement('span');
        span.dataset.ar = action.label?.ar || '';
        span.dataset.en = action.label?.en || '';
        span.textContent = span.dataset[lang] || span.dataset.ar || span.dataset.en;
        a.appendChild(span);
        if (primary) {
          const icon = document.createElement('i');
          icon.className = 'fa-solid fa-arrow-left';
          a.appendChild(icon);
        }
        return a;
      };
      const primary = createAction(item.primary, true);
      const secondary = createAction(item.secondary, false);
      if (primary) actions.appendChild(primary);
      if (secondary) actions.appendChild(secondary);
      if (actions.childElementCount) copy.appendChild(actions);

      content.appendChild(copy);
      article.append(img, shade, content);
      host.appendChild(article);
    });
  }

  function applyMedia(media = {}) {
    const setSrc = (selector, src) => {
      if (!src) return;
      qsa(selector).forEach(el => { if (el.tagName === 'IMG') el.src = src; });
    };
    setSrc('.logo-brown', media.logoBrown);
    setSrc('.logo-white', media.logoWhite);
    setSrc('.footer-brand img', media.footerLogo || media.logoWhite);
    setSrc('.about-clean-image', media.aboutImage);

    if (media.favicon) {
      const icon = qs('link[rel~="icon"]');
      if (icon) icon.href = media.favicon;
    }
    if (media.ogImage) {
      const og = qs('meta[property="og:image"]');
      if (og) og.content = media.ogImage;
    }
    if (media.portfolioPdf) {
      qsa('a[href*="tigress-portfolio.pdf"], a[data-t="navPortfolio"]').forEach(a => {
        a.href = media.portfolioPdf;
        a.target = '_blank';
        a.rel = 'noopener';
      });
    }
  }

  function applySettings(settings = {}) {
    window.TIGRESS_CONFIG = Object.assign({}, window.TIGRESS_CONFIG || {}, settings);
    window.TIGRESS_CMS_CONFIG = Object.assign({}, window.TIGRESS_CMS_CONFIG || {}, settings);

    const wa = String(settings.whatsapp || '').replace(/\D/g, '');
    const phone = String(settings.phone || '').trim();
    const email = String(settings.contactEmail || '').trim();
    if (wa) {
      qsa('#floatingWhatsApp,#contactWa,.service-wa-cta').forEach(a => {
        if (!a.classList.contains('service-wa-cta')) a.href = `https://wa.me/${wa}`;
      });
      const b = qs('#contactWa b'); if (b) b.textContent = settings.phone || settings.whatsapp;
    }
    if (phone) {
      qsa('#floatingCall,#contactCall').forEach(a => a.href = `tel:${phone}`);
      const b = qs('#contactCall b'); if (b) b.textContent = phone.replace(/^\+966/, '0').replace(/(\d{3})(\d{3})(\d{4})$/, '$1 $2 $3');
    }
    if (email) {
      qsa('a[href^="mailto:"]').forEach(a => a.href = `mailto:${email}`);
      qsa('.contact-ref-card[href^="mailto:"] b,.footer-contact-col a[href^="mailto:"] span').forEach(el => el.textContent = email);
    }
    if (settings.instagram) qsa('a[href*="instagram.com"]').forEach(a => a.href = settings.instagram);
    if (settings.tiktok) qsa('a[href*="tiktok.com"]').forEach(a => a.href = settings.tiktok);
    if (settings.snapchat) qsa('a[href*="snapchat.com"]').forEach(a => a.href = settings.snapchat);
    if (settings.instagramHandle) qsa('.social-ref-row a[href*="instagram.com"] small').forEach(el => el.textContent = settings.instagramHandle);
    if (settings.tiktokHandle) qsa('.social-ref-row a[href*="tiktok.com"] small').forEach(el => el.textContent = settings.tiktokHandle);
    if (settings.snapchatHandle) qsa('.contact-snapchat-card b').forEach(el => el.textContent = settings.snapchatHandle);
  }

  function applyStats(stats = {}) {
    const values = [stats.years, stats.clients, stats.departments];
    qsa('[data-count]').forEach((el, i) => {
      const value = Number(values[i]);
      if (!Number.isFinite(value)) return;
      el.dataset.count = String(value);
      el.textContent = String(value);
      delete el.dataset.counted;
    });
  }

  function applySEO(seo = {}) {
    if (seo.title) document.title = seo.title;
    const desc = qs('meta[name="description"]'); if (desc && seo.description) desc.content = seo.description;
    const ogTitle = qs('meta[property="og:title"]'); if (ogTitle && seo.ogTitle) ogTitle.content = seo.ogTitle;
    const ogDesc = qs('meta[property="og:description"]'); if (ogDesc && seo.ogDescription) ogDesc.content = seo.ogDescription;
  }

  function applyContent(content, meta = {}) {
    if (!content || typeof content !== 'object') return;
    window.TIGRESS_CMS_TEXTS = content.texts || window.TIGRESS_CMS_TEXTS || {};
    if (content.settings) applySettings(content.settings);
    if (content.media) applyMedia(content.media);
    if (content.stats) applyStats(content.stats);
    if (content.seo) applySEO(content.seo);
    if (Array.isArray(content.hero)) buildHero(content.hero);
    window.TIGRESS_CMS_CURRENT = content;
    document.dispatchEvent(new CustomEvent('tigress:cms-content', { detail: { content, meta } }));
    document.dispatchEvent(new CustomEvent('tigress:hero-rebuild', { detail: { content, meta } }));
  }

  window.TIGRESS_APPLY_CMS = applyContent;
  window.TIGRESS_CMS_CACHE_KEY = cacheKey;

  try {
    const cached = safeJSON(localStorage.getItem(cacheKey));
    if (cached?.content) {
      window.TIGRESS_CMS_CACHE = cached;
      applyContent(cached.content, { source: 'cache', updatedAt: cached.updated_at });
    }
  } catch (_) {}
})();
