TL;DR: Remove legacy intro CSS rules and transitions so opening/closing is controlled only by requestAnimationFrame updates, with the overlay hidden directly by JavaScript after fade completion.

Steps
1. Remove the unused CSS selector `.intro-overlay.intro-out .intro-image` from `index.html`.
2. Remove CSS transitions from `.intro-progress` and `.intro-progress-fill` so progress and fade state are fully driven by JS, avoiding any residual transition timing or jitter.
3. Add or retain `will-change` hints on `.intro-image` (and optionally `.intro-overlay`) so opacity/filter/transform stays on the compositor layer during the fade.
4. Keep the JS logic in `animateIntro` and `completeIntro` as the single finish path: fade values via JS, then set `introOverlay.style.display = 'none'`, `visibility = 'hidden'`, and `pointerEvents = 'none'` immediately when fade completes.
5. Verify that no other CSS selectors or JS references depend on `.intro-out` or CSS transition events for opening/closing.

Relevant file
- `d:\金声玉振网页相关\index.html` — CSS and embedded JS around the intro overlay and animateIntro sequence.

Verification
- Ensure the intro overlay fades out smoothly without jump or ghosting.
- Confirm `introOverlay` is hidden by JS after fade completion.
- Check that `.intro-out` is no longer referenced anywhere in the document.
