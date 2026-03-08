/**
 * Visual & Scroll Bug Audit — NAS + Maulya sites
 * Checks: horizontal overflow, broken images, layout bugs, mobile, scroll
 */
const { chromium } = require('playwright');

const NAS = 'http://localhost:4001';
const MAULYA = 'http://localhost:4002';

const NAS_PAGES = [
  { url: `${NAS}/`, label: 'NAS Homepage' },
  { url: `${NAS}/products/`, label: 'NAS Products' },
  { url: `${NAS}/products/revalk/`, label: 'NAS Revalk' },
  { url: `${NAS}/method/`, label: 'NAS Method' },
  { url: `${NAS}/proof/`, label: 'NAS Proof' },
  { url: `${NAS}/studio/`, label: 'NAS Studio' },
  { url: `${NAS}/contact/`, label: 'NAS Contact' },
  { url: `${NAS}/press/`, label: 'NAS Press' },
];

const MAULYA_PAGES = [
  { url: `${MAULYA}/`, label: 'Maulya Home' },
  { url: `${MAULYA}/product/`, label: 'Maulya Product' },
  { url: `${MAULYA}/pilot/`, label: 'Maulya Pilot' },
  { url: `${MAULYA}/associates/`, label: 'Maulya Associates' },
  { url: `${MAULYA}/demo/`, label: 'Maulya Demo' },
];

const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'mobile', width: 390, height: 844 },
];

async function auditPage(page, { url, label }, vpName) {
  const issues = [];

  await page.goto(url, { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(600);

  // ── 1. Horizontal overflow (scroll bugs) ──────────────────────────────────
  const horizOverflow = await page.evaluate(() => {
    const docWidth = document.documentElement.scrollWidth;
    const viewWidth = document.documentElement.clientWidth;
    const overflowers = [];
    document.querySelectorAll('*').forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.right > viewWidth + 2) {
        overflowers.push({
          tag: el.tagName,
          cls: el.className?.toString().slice(0, 60),
          right: Math.round(rect.right),
          viewWidth,
        });
      }
    });
    return { docWidth, viewWidth, overflowers: overflowers.slice(0, 5) };
  });

  if (horizOverflow.docWidth > horizOverflow.viewWidth + 2) {
    issues.push({
      type: 'HORIZONTAL_OVERFLOW',
      severity: 'HIGH',
      detail: `Page scrollWidth ${horizOverflow.docWidth} > clientWidth ${horizOverflow.viewWidth}`,
      offenders: horizOverflow.overflowers,
    });
  }

  // ── 2. Broken images ──────────────────────────────────────────────────────
  const brokenImgs = await page.evaluate(async () => {
    const imgs = Array.from(document.images);
    return imgs
      .filter(img => !img.complete || img.naturalWidth === 0)
      .map(img => ({ src: img.src?.split('/').slice(-3).join('/'), alt: img.alt }))
      .slice(0, 10);
  });

  if (brokenImgs.length) {
    issues.push({
      type: 'BROKEN_IMAGES',
      severity: 'MEDIUM',
      detail: `${brokenImgs.length} broken image(s)`,
      offenders: brokenImgs,
    });
  }

  // ── 3. Elements with negative margins causing layout bugs ─────────────────
  const negativeMargin = await page.evaluate(() => {
    const suspects = [];
    document.querySelectorAll('section, .card, .proof-card, .screen-frame, header, footer').forEach(el => {
      const s = window.getComputedStyle(el);
      const negMargins = ['marginTop','marginBottom','marginLeft','marginRight']
        .filter(p => parseFloat(s[p]) < -100);
      if (negMargins.length) {
        suspects.push({ tag: el.tagName, cls: el.className?.toString().slice(0, 50), props: negMargins });
      }
    });
    return suspects;
  });

  if (negativeMargin.length) {
    issues.push({
      type: 'SUSPICIOUS_NEGATIVE_MARGINS',
      severity: 'LOW',
      detail: 'Large negative margins detected',
      offenders: negativeMargin.slice(0, 3),
    });
  }

  // ── 4. Overlapping z-index / stacking bugs ────────────────────────────────
  const zStackIssues = await page.evaluate(() => {
    const header = document.querySelector('.site-header');
    if (!header) return [];
    const headerZ = parseInt(window.getComputedStyle(header).zIndex) || 0;
    const issues = [];
    document.querySelectorAll('.card, .screen-frame, .surface-strong, .page-hero').forEach(el => {
      const z = parseInt(window.getComputedStyle(el).zIndex) || 0;
      if (z > headerZ && headerZ > 0) {
        issues.push({ tag: el.tagName, cls: el.className?.toString().slice(0, 50), z, headerZ });
      }
    });
    return issues;
  });

  if (zStackIssues.length) {
    issues.push({
      type: 'Z_INDEX_STACK_CONFLICT',
      severity: 'LOW',
      detail: 'Elements with higher z-index than header',
      offenders: zStackIssues.slice(0, 3),
    });
  }

  // ── 5. Brand logo rendering ───────────────────────────────────────────────
  const logoCheck = await page.evaluate(() => {
    const brand = document.querySelector('.brand .brand-logo, .brand img');
    if (!brand) return { found: false };
    const rect = brand.getBoundingClientRect();
    const loaded = brand.complete && brand.naturalWidth > 0;
    return { found: true, loaded, w: Math.round(rect.width), h: Math.round(rect.height), src: brand.src?.split('/').slice(-2).join('/') };
  });

  if (!logoCheck.found) {
    issues.push({ type: 'LOGO_MISSING', severity: 'HIGH', detail: 'No brand logo found in header' });
  } else if (!logoCheck.loaded) {
    issues.push({ type: 'LOGO_NOT_LOADED', severity: 'HIGH', detail: `Logo not loaded: ${logoCheck.src}` });
  } else if (logoCheck.h < 10 || logoCheck.h > 80) {
    issues.push({ type: 'LOGO_SIZE_SUSPICIOUS', severity: 'MEDIUM', detail: `Logo height ${logoCheck.h}px (expected 20-60px)` });
  }

  // ── 6. Nav hamburger on mobile ────────────────────────────────────────────
  if (vpName === 'mobile') {
    const navCheck = await page.evaluate(() => {
      const burger = document.querySelector('.nav-hamburger');
      const nav = document.querySelector('#primary-nav');
      if (!burger) return { hasBurger: false };
      const burgerVisible = window.getComputedStyle(burger).display !== 'none';
      const navHidden = window.getComputedStyle(nav).display === 'none' || nav.getAttribute('aria-expanded') === 'false';
      return { hasBurger: true, burgerVisible, navHidden };
    });
    if (!navCheck.hasBurger || !navCheck.burgerVisible) {
      issues.push({ type: 'MOBILE_NAV_HAMBURGER_MISSING', severity: 'HIGH', detail: 'Hamburger button not visible on mobile' });
    }
  }

  // ── 7. CTA buttons visible and clickable ─────────────────────────────────
  const ctaCheck = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('.btn-primary'));
    return btns.map(btn => {
      const rect = btn.getBoundingClientRect();
      const s = window.getComputedStyle(btn);
      return {
        text: btn.textContent.trim().slice(0, 40),
        visible: rect.width > 0 && rect.height > 0,
        display: s.display,
        opacity: parseFloat(s.opacity),
        inViewport: rect.top >= 0 && rect.top < window.innerHeight * 3
      };
    }).filter(b => !b.visible || b.opacity < 0.5).slice(0, 3);
  });

  if (ctaCheck.length) {
    issues.push({ type: 'INVISIBLE_CTA_BUTTONS', severity: 'MEDIUM', detail: 'Some primary CTA buttons not fully visible', offenders: ctaCheck });
  }

  // ── 8. Check that maulya theme is teal not blue ───────────────────────────
  const themeCheck = await page.evaluate(() => {
    const body = document.body;
    const theme = body.getAttribute('data-theme');
    if (theme !== 'maulya') return null;
    const accent = getComputedStyle(body).getPropertyValue('--accent').trim();
    const bgColor = getComputedStyle(body).backgroundColor;
    return { accent, bgColor };
  });

  if (themeCheck) {
    // Check if accent is blue (ZenOps legacy)
    if (themeCheck.accent.includes('1d4ed8') || themeCheck.accent.includes('29, 78, 216')) {
      issues.push({ type: 'MAULYA_LEGACY_BLUE_ACCENT', severity: 'HIGH', detail: `Legacy blue accent: ${themeCheck.accent}. Expected teal #0f766e.` });
    }
  }

  // ── 9. Screen frame images loading ───────────────────────────────────────
  const screenFrameImgs = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('.screen-frame img'))
      .filter(img => !img.complete || img.naturalWidth === 0)
      .map(img => ({ src: img.src?.split('/').slice(-2).join('/'), alt: img.alt }))
      .slice(0, 5);
  });

  if (screenFrameImgs.length) {
    issues.push({ type: 'SCREEN_FRAME_BROKEN_IMGS', severity: 'MEDIUM', detail: `${screenFrameImgs.length} screen frame image(s) not loaded`, offenders: screenFrameImgs });
  }

  // ── 10. Scroll jank: check for scroll event listeners causing repaints ───
  const scrollCheck = await page.evaluate(async () => {
    let maxShiftBefore = 0;
    const obs = new PerformanceObserver(list => {
      list.getEntries().forEach(e => { if (e.value > maxShiftBefore) maxShiftBefore = e.value; });
    });
    try { obs.observe({ type: 'layout-shift', buffered: true }); } catch {}
    // Scroll the page
    window.scrollTo(0, 300);
    await new Promise(r => setTimeout(r, 100));
    window.scrollTo(0, 800);
    await new Promise(r => setTimeout(r, 100));
    window.scrollTo(0, 0);
    obs.disconnect();
    return { cls: maxShiftBefore.toFixed(4) };
  });

  if (parseFloat(scrollCheck.cls) > 0.1) {
    issues.push({ type: 'CUMULATIVE_LAYOUT_SHIFT', severity: 'MEDIUM', detail: `CLS score ${scrollCheck.cls} (threshold: 0.1)` });
  }

  return issues;
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const results = [];

  for (const vp of VIEWPORTS) {
    const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
    const page = await ctx.newPage();

    for (const pageInfo of [...NAS_PAGES, ...MAULYA_PAGES]) {
      try {
        const issues = await auditPage(page, pageInfo, vp.name);
        results.push({ page: pageInfo.label, viewport: vp.name, url: pageInfo.url, issues });
      } catch (err) {
        results.push({ page: pageInfo.label, viewport: vp.name, url: pageInfo.url, issues: [{ type: 'PAGE_ERROR', severity: 'HIGH', detail: err.message }] });
      }
    }
    await ctx.close();
  }

  await browser.close();

  // ── Report ───────────────────────────────────────────────────────────────
  console.log('\n╔══════════════════════════════════════════════════════════╗');
  console.log('║   VISUAL & SCROLL BUG AUDIT REPORT                      ║');
  console.log('╚══════════════════════════════════════════════════════════╝\n');

  const high = [], medium = [], low = [], clean = [];

  results.forEach(r => {
    if (r.issues.length === 0) {
      clean.push(`  ✓  ${r.page} [${r.viewport}]`);
    } else {
      r.issues.forEach(issue => {
        const line = { ...issue, page: r.page, viewport: r.viewport };
        if (issue.severity === 'HIGH') high.push(line);
        else if (issue.severity === 'MEDIUM') medium.push(line);
        else low.push(line);
      });
    }
  });

  if (high.length) {
    console.log('🔴 HIGH SEVERITY');
    high.forEach(i => {
      console.log(`   [${i.page} / ${i.viewport}] ${i.type}`);
      console.log(`   → ${i.detail}`);
      if (i.offenders) console.log(`   Offenders: ${JSON.stringify(i.offenders).slice(0, 200)}`);
    });
    console.log();
  }

  if (medium.length) {
    console.log('🟡 MEDIUM SEVERITY');
    medium.forEach(i => {
      console.log(`   [${i.page} / ${i.viewport}] ${i.type}`);
      console.log(`   → ${i.detail}`);
      if (i.offenders) console.log(`   Offenders: ${JSON.stringify(i.offenders).slice(0, 200)}`);
    });
    console.log();
  }

  if (low.length) {
    console.log('🔵 LOW / INFO');
    low.forEach(i => {
      console.log(`   [${i.page} / ${i.viewport}] ${i.type}: ${i.detail}`);
    });
    console.log();
  }

  console.log(`✅ CLEAN (no issues): ${clean.length} page/viewport combos`);
  clean.forEach(l => console.log(l));

  console.log('\n──────────────────────────────────────────────────────────');
  console.log(`Total pages checked: ${results.length} (${[...NAS_PAGES,...MAULYA_PAGES].length} pages × ${VIEWPORTS.length} viewports)`);
  console.log(`Issues: ${high.length} high · ${medium.length} medium · ${low.length} low`);
  console.log('──────────────────────────────────────────────────────────\n');
}

main().catch(console.error);
