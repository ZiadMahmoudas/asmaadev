TIGRESS V14 — LENIS + GLSL PAPER

Added:
1. Lenis smooth wheel scrolling.
   - Loaded from jsDelivr.
   - Native scrolling remains the fallback if the CDN is unavailable.
   - Touch smoothing is disabled to keep phones responsive.
   - Existing sticky Hero/cover geometry from V13 is preserved.
   - Hash navigation and service-form jumps use Lenis when available.

2. Real raw-WebGL/GLSL hover for the Signature artwork.
   - Subdivided mesh (34 x 42) bends around the pointer.
   - Vertex shader creates localized flex/page-curl movement.
   - Fragment shader adds paper-like refraction, crease highlight/shadow and edge shading.
   - CSS perspective adds a subtle physical print lift.
   - Automatically disabled on touch/mobile and prefers-reduced-motion.
   - Falls back to a lightweight CSS hover if WebGL is unavailable.

Files:
- js/lenis-init.js
- js/paper-glsl.js
