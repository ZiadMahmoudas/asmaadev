TIGRESS V15 — Slider timer + drag snap fix

Fixed the story slider mechanics:

1) Loader and autoplay are now one system.
- Removed the independent JavaScript timeout.
- The active dot's CSS progress animation is the autoplay clock.
- When the progress reaches exactly 100%, animationend advances to the next slide.
- 03 wraps to 01 and restarts from zero.
- Hover/focus no longer pauses the loader while the slide timer keeps moving.

2) Real hand drag / swipe.
- Pointer Events support mouse, pen and touch.
- The active slide moves with the pointer.
- Horizontal drag snaps to the next/previous slide after distance or velocity threshold.
- Small drag snaps back.
- RTL/LTR direction is respected.
- Vertical touch remains normal page scrolling.
- Every manual change restarts the loader from zero.

Lenis and GLSL paper hover from V14 are preserved.
