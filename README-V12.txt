TIGRESS V12 — Observer-driven cover

This version changes the transition logic itself.

The Chapters section is no longer only positioned with a fixed negative margin.
JavaScript uses the Hero observer progress to move the REAL Chapters section:

0% → 50% Hero progress:
  Chapters rises faster than normal scroll.

50% → 100%:
  Chapters stays exactly at viewport top and completely covers Hero.

100%:
  The extra transform returns to 0 at the exact moment Chapters' natural
  document position is at viewport top, so normal scrolling resumes without a jump.

This means:
- no uncovered Hero strip
- no fake dark curtain
- no blank panel created just to cover the image
- the section content itself moves with the Observer
