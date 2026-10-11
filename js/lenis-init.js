(() => {
  'use strict';

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced || typeof window.Lenis !== 'function') return;

  const lenis = new window.Lenis({
    smoothWheel: true,
    syncTouch: false,
    wheelMultiplier: 0.86,
    touchMultiplier: 1,
    lerp: 0.085,
    infinite: false,
    autoResize: true
  });

  window.tigressLenis = lenis;
  document.documentElement.classList.add('has-lenis');

  let rafId = 0;
  const raf = (time) => {
    lenis.raf(time);
    rafId = requestAnimationFrame(raf);
  };
  rafId = requestAnimationFrame(raf);

  // Let Lenis own ordinary hash links. Special service CTAs preventDefault
  // themselves and are handled by app.js.
  document.addEventListener('click', (event) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const anchor = event.target.closest('a[href^="#"]');
    if (!anchor) return;

    const href = anchor.getAttribute('href');
    if (!href || href === '#') return;

    const target = document.querySelector(href);
    if (!target) return;

    event.preventDefault();
    const offset = target.id === 'hero' ? 0 : -78;
    lenis.scrollTo(target, {
      offset,
      duration: 1.05,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
    });

    if (history.pushState) history.pushState(null, '', href);
  });

  window.addEventListener('pagehide', () => {
    if (rafId) cancelAnimationFrame(rafId);
    if (typeof lenis.destroy === 'function') lenis.destroy();
  }, { once: true });
})();
