# Website Current State

Date: 2026-03-07
Repo: `/Users/sriramrk/NotAloneStudios`
Primary site source: `/Users/sriramrk/NotAloneStudios/projects/nas-website`

## Summary

The NAS marketing site has been reworked into a cleaner premium layout with a clearer split between:

- NAS homepage as the studio-level entry point
- ZenOps dedicated page as the primary product sales surface
- Revalk dedicated page as a premium V3 study-product page
- Products page as the portfolio index
- Proof page as curated evidence, not a screenshot dump

The redesign is now much more structured than the earlier version:

- homepage no longer carries the full ZenOps sales story
- ZenOps now has a proper internal destination at `/products/zenops/`
- Revalk now has a dedicated V3 page with clearer product positioning
- screenshot sizing is more controlled
- mobile layouts were explicitly tightened, not just left to desktop collapse

## Current Information Architecture

### Homepage
Path: `/`

Current role:

- premium NAS brand/studio landing page
- still uses a 3-slide carousel
- Studio remains the first slide
- ZenOps is the second slide and now routes internally first

Current ZenOps behavior on homepage:

- primary CTA: `Explore ZenOps` -> `/products/zenops/`
- secondary CTA: `Request Access` -> ZenOps request-access route
- lower flagship-products section also links first to `/products/zenops/`

This is a major change from the earlier state where homepage sections were carrying too much ZenOps detail directly.

### ZenOps dedicated page
Path: `/products/zenops/`

Current role:

- primary marketing and conversion page for ZenOps
- cooler blue product-specific theme
- conversion-first structure

Current section order:

1. Hero
2. Proof-first strip
3. Why it matters
4. Prevents / Ensures outcomes
5. Four workflow pillars
6. Associate onboarding support block
7. Demo landing block
8. Deep dive / V1-V2 narrative
9. Final CTA

Current CTA hierarchy on the dedicated page:

- primary: `Request Associate Access`
- secondary: `Open ZenOps Workspace`
- support: `Client & Ops Login`
- tertiary/support: `Try Demo` / `Open Demo Landing`

### Products page
Path: `/products/`

Current role:

- cleaner portfolio overview
- ZenOps positioned as flagship product
- internal ZenOps page promoted ahead of live app links

Current ZenOps CTAs:

- primary: `Explore ZenOps` -> `/products/zenops/`
- secondary: `Request Associate Access`
- support links: workspace, login, demo

### Revalk dedicated page
Path: `/products/revalk/`

Current role:

- primary marketing page for Revalk V3
- premium study-product surface rather than a generic feature page
- calmer cream/stone palette distinct from ZenOps

Current section order:

1. Hero
2. What Revalk helps you do
3. Exam-Proximity tiering
4. Explore -> Collect -> Master
5. What you get per concept
6. Before / After proof
7. Trust + architecture
8. Early access timeline
9. Partner / platform strip
10. FAQ
11. Final CTA

Current CTA hierarchy on the dedicated page:

- primary: `Join Early Access`
- secondary: `See Screenshots`
- partner/support: `Request Pilot / Partnership`

### Proof page
Path: `/proof/`

Current role:

- curated proof page
- reduced screenshot bulk
- clearer captions
- explicitly routes users back into the dedicated ZenOps page

### Contact page
Path: `/contact/`

Current role:

- intake surface for ZenOps, Revalk, and Studio
- ZenOps card is tuned to associate onboarding and pilot intake

Current ZenOps form behavior:

- posts to `https://zenops.notalonestudios.com/api/partner/request-access/handoff`
- includes hidden source value: `nas-contact-zenops`
- intended to hand off into the ZenOps onboarding flow

## Visual / Design State

Current direction:

- editorial-luxe rather than generic startup SaaS
- warmer NAS background and neutral product-studio palette
- cooler ZenOps page palette with cobalt/slate treatment
- calmer Revalk page palette with stone/ivory treatment
- reduced screenshot height across homepage, ZenOps page, and proof page
- cleaner CTA grouping

Current design improvements already implemented:

- homepage ZenOps duplication removed
- internal ZenOps route is now visible and used
- Revalk V3 content and hierarchy rebuilt
- screenshot framing tightened
- mobile CTA groups stack more cleanly
- carousel pauses on hover, touch, and focus

## Deploy Artifacts

Current generated artifacts:

- `/Users/sriramrk/NotAloneStudios/projects/nas-website/NotAloneStudios_hostinger_ready.zip`
- `/Users/sriramrk/NotAloneStudios/projects/nas-website/NotAloneStudios_public_clean.zip`

Deploy folder mirrors:

- `/Users/sriramrk/NotAloneStudios/projects/nas-website/public_hostinger`
- `/Users/sriramrk/NotAloneStudios/projects/nas-website/public_clean`

Recommended upload artifact for Hostinger:

- `NotAloneStudios_hostinger_ready.zip`

## QA Status

Checked in browser during the redesign pass:

- homepage at `1440x900` and `390x844`
- ZenOps page at `1440x900` and `390x844`
- Revalk page at `1440x900` and `390x844`
- products page at `1440x900`
- proof page at `1440x900`
- contact page at `390x844`

Smoke-check results on packaged `public_hostinger` output:

- no horizontal overflow on checked routes
- no console errors on the checked routes

Also added favicon links on rebuilt public pages to avoid the browser requesting a missing default favicon path.

## Known Gaps / Remaining Work

These areas are still not at the same overhaul level as the rebuilt homepage + ZenOps surfaces:

- `/studio/` has not yet been redesigned to the same premium standard
- contact page structure is serviceable and aligned to ZenOps onboarding, but not visually overhauled to the same depth as home/products/proof/ZenOps

## Practical Current Status

If someone asks “what state is the site in right now?” the short answer is:

- homepage: redesigned and cleaner
- ZenOps page: now the real destination
- Revalk page: rebuilt around V3 positioning
- products page: corrected to point internally first
- proof page: curated and reduced
- mobile: significantly improved, not just tolerated
- deploy zip: ready

The next natural polish pass, if needed, is to bring `studio` and the contact page up to the same finish level.
