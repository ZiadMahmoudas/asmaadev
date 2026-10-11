TIGRESS V13 — Smooth normal scroll

Main fix:
- Removed JavaScript movement/pinning from the Chapters section.
- Removed the recursive lerp requestAnimationFrame loop.
- Chapters now covers Hero using only normal CSS sticky/document flow.
- Scroll is 1:1 with the user's wheel/touch gesture, so there is no release jump.
- JS updates Hero progress only once per browser scroll frame.
- Removed filter/transform animation from the full-screen sticky container to reduce GPU load.
- Kept a very small transform only on the leopard image for the Observer feel.
- Existing layout, carousel board, mobile crop, services and other sections are preserved.
