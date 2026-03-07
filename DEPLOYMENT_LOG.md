# Deployment & Rebrand Log - March 2026

## Summary of Changes
This log documents the global rebranding process and the launch of the standalone `maulya.in` marketing site.

### 1. Global Rebrand: ZenOps → Maulya
- **Text Replacement**: Performed a full-repo find-and-replace of "ZenOps" with "Maulya" across HTML, CSS, JS, and MD files.
- **Directory Migration**: Renamed `products/zenops/` to `products/maulya/`. Updated all asset paths accordingly.
- **Redirects**: Implemented 0-second HTML meta-redirects on legacy ZenOps paths.
- **SEO & Continuity**: Added "Formerly ZenOps" notes (transitory) and updated all OG tags/Meta descriptions.

### 2. Standalone Site Launch: maulya.in
- **New Project**: Created `projects/maulya.in/` as an independent static site.
- **Routes Implemented**:
  - `/` (Home)
  - `/product/`
  - `/demo/`
  - `/associates/`
  - `/pilot/`
- **Link Consolidation**: Verified all CTAs point to absolute `app.maulya.in` and `demo.maulya.in` endpoints.
- **Cross-Linking**: Updated the NAS Studio site (`notalonestudios.com`) to link externally to the new `maulya.in` domain.

### 3. Conversion & UI Enhancements
- **Hero Segmentation**: Added a 3-way toggle (Operator/Aspirant/Partner) to the NAS homepage for personalized landing experiences.
- **Behavioral Layers**:
  - **Zeigarnik Pill**: Persistence pill tracking system-map progress.
  - **Peak-End Seal Band**: Emotional closing bands on product pages.
  - **Hook Engine**: One-question diagnostic to route users to the correct product/contact lane.
- **Mobile Audit**: Fixed horizontal overflow, button padding, and touch-scrolling for the hero segment switcher on viewports down to 390px.

### 4. Infrastructure & Deployment
- **Zip Packaging**: Generated `Maulya_hostinger_ready.zip` and `NotAloneStudios_hostinger_ready.zip` for manual File Manager upload.
- **Migration Documentation**: Created `MIGRATION.md` detailing DNS A-records and Traefik redirect labels for the VPS environment.

## Verification Status
- **Mobile**: Verified no horizontal scroll on iPhone 12/13 (390px).
- **Links**: All internal and cross-domain links verified with `grep` and manual audit.
- **Build**: Clean production folders generated without `.DS_Store` or other metadata junk.

---
**Done by: Antigravity AI**
**Status: Ready for Production Deploy**
