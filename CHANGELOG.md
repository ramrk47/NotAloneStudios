# CHANGELOG

## 2026-02-24

- `/Users/dr.156/NotAloneStudios/index.html`
  - Replaced the home hero with a 3-slide carousel (Studio video, ZenOps, Revalk).
  - Moved evidence rail + product mini cards + stats into a new home support section below the hero.

- `/Users/dr.156/NotAloneStudios/assets/site.css`
  - Added carousel slide styles, controls, and responsive layouts for desktop/tablet/mobile.
  - Styled the Studio slide video as part of the carousel card (solves boxed hero-video issue by moving video into a purposeful carousel block).

- `/Users/dr.156/NotAloneStudios/assets/site.js`
  - Added static JS carousel behavior (autoplay, prev/next, dots, visibility-aware media playback, reduced-motion-safe autoplay behavior).

- `/Users/dr.156/NotAloneStudios/index.html`
  - Replaced the framed hero video panel with a masked ambient “living surface” video layer behind the hero content.
  - Added logo + bridge activation overlay elements tied to the hero video surface.

- `/Users/dr.156/NotAloneStudios/assets/site.css`
  - Neutralized `.panel-shell` so it no longer forces a light surface/muted text.
  - Added explicit post-panel `.v1-surface` and `.v2-surface` contrast rules (background, text, links, chips/badges).
  - Added small overflow guards (`html/body overflow-x`, `max-width` on bridge/evidence rail containers).
  - Added hero living-surface mask, scrim, bridge activation strip, and responsive/reduced-motion styles.

- `/Users/dr.156/NotAloneStudios/assets/site.js`
  - Simplified FAQ panel state syncing into a shared helper to avoid repeated panel-height logic.
  - Preserved existing reveal/bridge/chip/workflow behaviors.
  - Added hero video play/pause on viewport visibility and scroll-linked “bridge activation” visual mapping.

- `/Users/dr.156/NotAloneStudios/products/zenops/index.html`
  - Verified ZenOps V1/V2 hero panels already use the correct surface classes (`panel-shell v1-surface`, `panel-shell v2-surface`); no markup change required.

- `/Users/dr.156/NotAloneStudios/public_clean/`
  - Created Hostinger-ready static deploy folder containing only `index.html`, `assets/`, and `products/`.

- `/Users/dr.156/NotAloneStudios/NotAloneStudios_public_clean.zip`
  - Packaged deploy zip from `public_clean/`.
