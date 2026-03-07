# CHANGELOG

## 2026-03-06

- `/Users/sriramrk/NotAloneStudios/projects/nas-website/index.html`
  - Rebuilt the homepage into a premium editorial landing flow with a cleaner carousel, teaser-only slide content, and a dedicated internal ZenOps entry path.
  - Removed the homepage-level ZenOps content dump and replaced it with a tighter flagship-products band.

- `/Users/sriramrk/NotAloneStudios/projects/nas-website/products/zenops/index.html`
  - Rebuilt the dedicated ZenOps page into the primary conversion-first sales surface with tighter screenshot handling, clearer hierarchy, and a more premium blue product treatment.
  - Reduced screenshot dominance across hero, proof, onboarding, demo, and deep-dive sections.

- `/Users/sriramrk/NotAloneStudios/projects/nas-website/products/index.html`
  - Promoted the internal ZenOps product page as the primary CTA and demoted live-access routes into secondary actions.

- `/Users/sriramrk/NotAloneStudios/projects/nas-website/proof/index.html`
  - Reworked the proof page into a curated evidence surface with smaller screenshot cards, tighter captions, and clearer routing into the dedicated ZenOps page.

- `/Users/sriramrk/NotAloneStudios/projects/nas-website/products/revalk/index.html`
  - Rebuilt the Revalk page around the V3 Study OS positioning: Explore → Collect → Master, exam-proximity tiering, concrete concept bundles, calmer trust language, and a cleaner partner strip.
  - Reduced screenshot dominance and tuned the page for mobile-first readability instead of an oversized desktop-first layout.

- `/Users/sriramrk/NotAloneStudios/projects/nas-website/assets/site.css`
  - Added a page-scoped premium overhaul layer for NAS, ZenOps, products, and proof pages, including desktop/mobile layout control and stricter screenshot sizing rules.
  - Added a dedicated Revalk V3 styling layer with premium cream/stone treatment, tighter hero and proof layouts, and responsive tier/flow/concept-bundle sections.

- `/Users/sriramrk/NotAloneStudios/projects/nas-website/products/zenops/index.html`
  - Rebuilt the ZenOps page into a conversion-first flow with associate access as the primary CTA, workspace/login as support, demo as tertiary, proof-first screenshots, earlier outcomes/pipeline sections, and the V1/V2 narrative moved near the bottom.
  - Added live ZenOps marketing screenshots for hero, workflow proof, associate onboarding, and demo callout.

- `/Users/sriramrk/NotAloneStudios/projects/nas-website/index.html`
  - Rewrote the homepage ZenOps carousel slide around the new CTA stack and mobile-first product framing.
  - Added a dedicated ZenOps featured band below the hero so associate-first messaging is visible without relying on the carousel alone.
  - Updated ZenOps CTA placements in the products section and final CTA band.

- `/Users/sriramrk/NotAloneStudios/projects/nas-website/products/index.html`
  - Updated the ZenOps product card to point to the live associate access/workspace/login/demo funnel instead of the old internal route + contact anchor flow.

- `/Users/sriramrk/NotAloneStudios/projects/nas-website/proof/index.html`
  - Replaced the ZenOps proof CTA with the new public access/login funnel and low-priority demo link.
  - Changed the demo link to route into the dedicated ZenOps demo landing section instead of jumping straight to the demo root.

- `/Users/sriramrk/NotAloneStudios/projects/nas-website/contact/index.html`
  - Reframed the ZenOps contact form around associate access review and pilot onboarding instead of walkthrough language.
  - Tightened fields to collect role, onboarding need, access scope, and the current operational blocker.
  - Changed the ZenOps submission path into a native POST handoff to `/api/partner/request-access/handoff`, including a source tag for NAS marketing traffic.

- `/Users/sriramrk/NotAloneStudios/projects/nas-website/assets/site.css`
  - Added styling for the new ZenOps proof, pipeline, details, CTA-link, and homepage featured-band components.
  - Shifted the ZenOps page toward a cooler product-specific blue tone so it no longer reads like the neutral NAS corporate palette.

- `/Users/sriramrk/NotAloneStudios/projects/nas-website/assets/site.js`
  - Changed the homepage feature carousel autoplay so hover pauses immediately and touch interactions pause long enough for users to read instead of restarting right away.
  - Removed the temporary client-side ZenOps relay once the real handoff endpoint was available, leaving native form submission plus submit tracking.

- `/Users/sriramrk/NotAloneStudios/projects/nas-website/public_clean/`
  - Synced the updated homepage, products pages, shared CSS/JS, and ZenOps marketing screenshots into the static deploy folder.

- `/Users/sriramrk/NotAloneStudios/projects/nas-website/public_hostinger/`
  - Synced the updated homepage, ZenOps page, proof page, products page, shared CSS/JS, and ZenOps marketing screenshots into the Hostinger-ready deploy folder.

- `/Users/sriramrk/NotAloneStudios/projects/nas-website/NotAloneStudios_public_clean.zip`
  - Regenerated from the updated `public_clean/` folder after the ZenOps CTA, demo, and contact-flow changes.

- `/Users/sriramrk/NotAloneStudios/projects/nas-website/NotAloneStudios_hostinger_ready.zip`
  - Regenerated from the updated `public_hostinger/` folder after the ZenOps CTA, demo, and contact-flow changes.

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
