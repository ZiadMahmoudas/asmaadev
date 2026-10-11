# TIGRESS — Observer Edition

A complete responsive, static, RTL/EN landing site with original Tigress artwork, interactive story slider, custom typography, mobile menu, and scroll storytelling.

## OPEN IT
Double-click `index.html` in Chrome or Edge. Everything structural works locally without npm, build tools or servers. You can also use `start-preview.bat` on Windows to open a local Python preview server if Python is installed.

## Original fonts
For font redistribution reasons, original font binaries are **not** packaged. Copy the two original OTF files from your `ASMAWork.zip` to `fonts/` exactly as described in `fonts/ADD-YOUR-ORIGINAL-FONTS-HERE.txt`. Optional IBM Plex Sans Arabic (Google Fonts) is used as a fallback when online. FontAwesome icons are loaded optionally via CDN; essential UI icons are local inline SVGs and remain visible offline.

## HERO OBSERVER
`js/app.js` installs an `IntersectionObserver` on `[data-hero-scene]` to only calculate its scroll progress while visible. CSS variables animate the artwork scale, position and type; `requestAnimationFrame` throttles updates. Reduced-motion settings disable scroll transformations and hide no content. `.inview` elements have another observer with graceful fallback.

## SITE STRUCTURE
Hero (observed) -> Story Slider -> About (vision & mission) -> Core Values -> Six Creative Areas -> Brand Marquee -> Signature -> Contact -> Footer.

## Header
Brown Tigress logo against cream at the top. On scroll header turns dark and swaps to the white logo. Moving down hides it, scrolling up shows it. Menu state keeps the header present so phone users can always navigate.

## Content & form
Content is TIGRESS-themed and based on your original visual brand storytelling; fictional portfolio clients and performance statistics were intentionally not invented. The contact form prepares a mailto message. Put an actual receiving address in `js/config.js` before publishing. Without an email address, the form explains that the inquiry can be copied rather than claiming successful delivery.

## Files
`index.html` — all visible page sections and structured content
`css/style.css` — responsive system/animation
`js/app.js` — header, observer, slider, locale, contact
`js/config.js` — safe non-secret settings
`assets/` — artwork and logos supplied by you

### Responsive and accessible
Designed to work from 360px to 1920px, includes focus styles, reduced motion, semantic headings, slider keys, swipe support, and mobile scroll behavior.
