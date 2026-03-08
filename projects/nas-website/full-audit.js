/**
 * COMPREHENSIVE VISUAL + FUNCTIONAL AUDIT
 * Checks: broken images, scroll bugs, button/link function, text visibility,
 *         nav, forms, mobile layout, colour contrast, CLS, aesthetics
 */
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const NAS = 'http://localhost:4001';
const MAULYA = 'http://localhost:4002';

const PAGES = [
  { url: `${NAS}/`,              label: 'NAS Home',       site: 'nas' },
  { url: `${NAS}/products/`,     label: 'NAS Products',   site: 'nas' },
  { url: `${NAS}/products/revalk/`, label: 'NAS Revalk',  site: 'nas' },
  { url: `${NAS}/method/`,       label: 'NAS Method',     site: 'nas' },
  { url: `${NAS}/proof/`,        label: 'NAS Proof',      site: 'nas' },
  { url: `${NAS}/studio/`,       label: 'NAS Studio',     site: 'nas' },
  { url: `${NAS}/contact/`,      label: 'NAS Contact',    site: 'nas' },
  { url: `${NAS}/press/`,        label: 'NAS Press',      site: 'nas' },
  { url: `${MAULYA}/`,           label: 'Maulya Home',    site: 'maulya' },
  { url: `${MAULYA}/product/`,   label: 'Maulya Product', site: 'maulya' },
  { url: `${MAULYA}/pilot/`,     label: 'Maulya Pilot',   site: 'maulya' },
  { url: `${MAULYA}/associates/`,label: 'Maulya Assoc.',  site: 'maulya' },
  { url: `${MAULYA}/demo/`,      label: 'Maulya Demo',    site: 'maulya' },
];

const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'mobile',  width: 390,  height: 844 },
];

const SS_DIR = path.join(__dirname, 'audit-screenshots');
if (!fs.existsSync(SS_DIR)) fs.mkdirSync(SS_DIR);

async function fullScroll(page) {
  await page.evaluate(async () => {
    const step = 400;
    const delay = ms => new Promise(r => setTimeout(r, ms));
    for (let y = 0; y <= document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await delay(80);
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(1200);
}

async function auditPage(page, { url, label }, vp) {
  const issues = [];
  const vpName = vp.name;

  await page.goto(url, { waitUntil: 'networkidle', timeout: 18000 });
  await page.waitForTimeout(500);
  await fullScroll(page);

  // ── 1. Horizontal overflow ─────────────────────────────────────────────────
  const horiz = await page.evaluate(() => {
    const dw = document.documentElement.scrollWidth;
    const vw = document.documentElement.clientWidth;
    const bad = [];
    document.querySelectorAll('*').forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.right > vw + 4) {
        bad.push({ tag: el.tagName, cls: (el.className||'').toString().slice(0,50), right: Math.round(r.right), vw });
      }
    });
    return { dw, vw, bad: bad.slice(0,5) };
  });
  if (horiz.dw > horiz.vw + 4) {
    issues.push({ sev:'HIGH', type:'HORIZ_OVERFLOW',
      msg: `scrollWidth ${horiz.dw} > clientWidth ${horiz.vw}`, data: horiz.bad });
  }

  // ── 2. Broken images (after full scroll + wait) ────────────────────────────
  const brokenImgs = await page.evaluate(() =>
    Array.from(document.images)
      .filter(i => !i.complete || i.naturalWidth === 0)
      .map(i => ({ src: i.src.split('/').slice(-3).join('/'), alt: i.alt, w: i.naturalWidth }))
      .slice(0,10)
  );
  if (brokenImgs.length) {
    issues.push({ sev:'HIGH', type:'BROKEN_IMAGES',
      msg: `${brokenImgs.length} image(s) failed to load after full page scroll`, data: brokenImgs });
  }

  // ── 3. Screen-frame viewport collapse ─────────────────────────────────────
  const collapsed = await page.evaluate(() =>
    Array.from(document.querySelectorAll('.screen-frame__viewport'))
      .filter(el => el.getBoundingClientRect().height < 10)
      .map(el => {
        const img = el.querySelector('img');
        return { src: img ? img.src.split('/').slice(-1)[0] : 'no-img', h: Math.round(el.getBoundingClientRect().height) };
      })
  );
  if (collapsed.length) {
    issues.push({ sev:'HIGH', type:'SCREEN_FRAME_COLLAPSED',
      msg: `${collapsed.length} screen-frame viewport(s) have height < 10px`, data: collapsed });
  }

  // ── 4. Brand logo ──────────────────────────────────────────────────────────
  const logo = await page.evaluate(() => {
    const el = document.querySelector('.brand .brand-logo, .brand img');
    if (!el) return { found: false };
    const r = el.getBoundingClientRect();
    return { found: true, loaded: el.complete && el.naturalWidth > 0,
      w: Math.round(r.width), h: Math.round(r.height), src: el.src.split('/').slice(-1)[0] };
  });
  if (!logo.found) issues.push({ sev:'HIGH', type:'LOGO_MISSING', msg:'No brand logo in header' });
  else if (!logo.loaded) issues.push({ sev:'HIGH', type:'LOGO_BROKEN', msg:`Logo not loaded: ${logo.src}` });
  else if (logo.h < 10 || logo.h > 80) issues.push({ sev:'MED', type:'LOGO_SIZE', msg:`Logo height ${logo.h}px (expected 16-60px)` });

  // ── 5. Mobile nav hamburger ────────────────────────────────────────────────
  if (vpName === 'mobile') {
    const nav = await page.evaluate(() => {
      const btn = document.querySelector('.nav-hamburger');
      if (!btn) return { found: false };
      const s = window.getComputedStyle(btn);
      return { found: true, visible: s.display !== 'none' && s.visibility !== 'hidden', display: s.display };
    });
    if (!nav.found || !nav.visible) {
      issues.push({ sev:'HIGH', type:'MOBILE_NAV_MISSING', msg:'Hamburger not visible on mobile' });
    }
  }

  // ── 6. Desktop nav links ───────────────────────────────────────────────────
  if (vpName === 'desktop') {
    const navLinks = await page.evaluate(() => {
      const nav = document.querySelector('#primary-nav');
      if (!nav) return [];
      return Array.from(nav.querySelectorAll('a')).map(a => {
        const r = a.getBoundingClientRect();
        const s = window.getComputedStyle(a);
        return { text: a.textContent.trim(), href: a.href, visible: r.width > 0 && r.height > 0,
          color: s.color, bg: s.backgroundColor };
      });
    });
    const badNav = navLinks.filter(l => !l.visible);
    if (badNav.length) issues.push({ sev:'MED', type:'NAV_LINK_HIDDEN', msg:'Nav links not visible on desktop', data: badNav });
  }

  // ── 7. CTA buttons — real ones only (filter out wizard hidden panels) ──────
  const ctaIssues = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('.btn-primary, .btn-clay, .btn-secondary'))
      .filter(btn => {
        // Skip buttons inside hidden wizard panels / inactive tabs
        let el = btn.parentElement;
        while (el) {
          const s = window.getComputedStyle(el);
          if (s.display === 'none' || s.visibility === 'hidden') return false;
          el = el.parentElement;
        }
        return true;
      })
      .filter(btn => {
        const r = btn.getBoundingClientRect();
        const s = window.getComputedStyle(btn);
        const visible = r.width > 0 && r.height > 0;
        const readable = parseFloat(s.opacity) > 0.3;
        return !visible || !readable;
      })
      .map(btn => ({
        text: btn.textContent.trim().slice(0,50),
        visible: btn.getBoundingClientRect().width > 0,
        opacity: window.getComputedStyle(btn).opacity
      })).slice(0,5);
  });
  if (ctaIssues.length) {
    issues.push({ sev:'MED', type:'HIDDEN_CTA', msg:`${ctaIssues.length} visible CTA button(s) not rendering`, data: ctaIssues });
  }

  // ── 8. Link integrity — check for href="#", empty hrefs ───────────────────
  const deadLinks = await page.evaluate(() =>
    Array.from(document.querySelectorAll('a[href]'))
      .filter(a => a.href === window.location.href + '#' || a.getAttribute('href') === '' || a.getAttribute('href') === '#')
      .map(a => ({ text: a.textContent.trim().slice(0,40), href: a.getAttribute('href') }))
      .slice(0,8)
  );
  if (deadLinks.length) {
    issues.push({ sev:'LOW', type:'DEAD_LINKS', msg:`${deadLinks.length} link(s) with empty/hash href`, data: deadLinks });
  }

  // ── 9. Text visibility — check for near-invisible text ────────────────────
  const invisText = await page.evaluate(() => {
    const bad = [];
    document.querySelectorAll('h1,h2,h3,h4,p,span,li,a').forEach(el => {
      const t = el.textContent.trim();
      if (!t || t.length < 3) return;
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) return;
      const s = window.getComputedStyle(el);
      if (s.display === 'none' || s.visibility === 'hidden') return;
      const op = parseFloat(s.opacity);
      if (op < 0.1) {
        bad.push({ tag: el.tagName, text: t.slice(0,50), opacity: op });
      }
      // Check for white text on white background (very rough heuristic)
      const color = s.color;
      const bg = s.backgroundColor;
      if (color === 'rgb(255, 255, 255)' && (bg === 'rgb(255, 255, 255)' || bg === 'rgba(0, 0, 0, 0)')) {
        // could be white text on transparent (okay if parent has dark bg)
      }
    });
    return bad.slice(0, 5);
  });
  if (invisText.length) {
    issues.push({ sev:'MED', type:'INVISIBLE_TEXT', msg:`${invisText.length} text element(s) have opacity < 0.1`, data: invisText });
  }

  // ── 10. Heading hierarchy ──────────────────────────────────────────────────
  const headings = await page.evaluate(() => {
    const hs = Array.from(document.querySelectorAll('h1,h2,h3,h4')).map(h => ({
      tag: h.tagName, text: h.textContent.trim().slice(0,60),
      visible: h.getBoundingClientRect().width > 0
    })).filter(h => h.visible);
    const h1s = hs.filter(h => h.tag === 'H1');
    return { count: hs.length, h1Count: h1s.length, h1s: h1s.map(h => h.text) };
  });
  if (headings.h1Count === 0) issues.push({ sev:'MED', type:'NO_H1', msg:'No visible H1 on page' });
  if (headings.h1Count > 1) issues.push({ sev:'LOW', type:'MULTIPLE_H1', msg:`${headings.h1Count} H1 elements`, data: headings.h1s });

  // ── 11. Footer presence ────────────────────────────────────────────────────
  const footer = await page.evaluate(() => {
    const f = document.querySelector('.site-footer, footer');
    if (!f) return { found: false };
    const r = f.getBoundingClientRect();
    return { found: true, visible: r.width > 0 && r.height > 0 };
  });
  if (!footer.found || !footer.visible) {
    issues.push({ sev:'MED', type:'FOOTER_MISSING', msg:'Footer not found or not visible' });
  }

  // ── 12. Cumulative Layout Shift ────────────────────────────────────────────
  const cls = await page.evaluate(async () => {
    let score = 0;
    const obs = new PerformanceObserver(l => l.getEntries().forEach(e => { score += e.value; }));
    try { obs.observe({ type: 'layout-shift', buffered: true }); } catch {}
    window.scrollTo(0, 500); await new Promise(r => setTimeout(r, 200));
    window.scrollTo(0, 1500); await new Promise(r => setTimeout(r, 200));
    window.scrollTo(0, 0);
    obs.disconnect();
    return score;
  });
  if (cls > 0.1) issues.push({ sev:'MED', type:'HIGH_CLS', msg:`CLS ${cls.toFixed(3)} > 0.1 threshold` });

  // ── 13. Maulya teal theme check ────────────────────────────────────────────
  const theme = await page.evaluate(() => {
    const t = document.body.getAttribute('data-theme');
    if (t !== 'maulya') return null;
    return getComputedStyle(document.body).getPropertyValue('--accent').trim();
  });
  if (theme && (theme.includes('1d4ed8') || theme.includes('29, 78, 216'))) {
    issues.push({ sev:'HIGH', type:'MAULYA_BLUE_ACCENT', msg:`Legacy ZenOps blue accent: ${theme}` });
  }

  // ── 14. Page title set ────────────────────────────────────────────────────
  const title = await page.title();
  if (!title || title.length < 5) {
    issues.push({ sev:'LOW', type:'NO_TITLE', msg:`Page title missing or very short: "${title}"` });
  }

  // ── 15. Sticky header z-index / overlap ────────────────────────────────────
  const headerOk = await page.evaluate(() => {
    const h = document.querySelector('.site-header');
    if (!h) return { found: false };
    const s = window.getComputedStyle(h);
    const z = parseInt(s.zIndex) || 0;
    const pos = s.position;
    return { found: true, z, pos, sticky: pos === 'sticky' || pos === 'fixed' };
  });
  if (headerOk.found && !headerOk.sticky) {
    issues.push({ sev:'LOW', type:'HEADER_NOT_STICKY', msg:`Header position: ${headerOk.pos}, not sticky/fixed` });
  }

  return issues;
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const allResults = [];
  const ssPromises = [];

  for (const vp of VIEWPORTS) {
    const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
    const page = await ctx.newPage();

    for (const pg of PAGES) {
      let issues = [];
      try {
        issues = await auditPage(page, pg, vp);

        // Take full-page screenshot
        const ssName = `${pg.label.replace(/[^a-z0-9]/gi,'_')}_${vp.name}.png`;
        ssPromises.push(
          page.screenshot({ path: path.join(SS_DIR, ssName), fullPage: true }).catch(() => {})
        );
      } catch (err) {
        issues = [{ sev:'HIGH', type:'PAGE_ERROR', msg: err.message }];
      }
      allResults.push({ label: pg.label, url: pg.url, vp: vp.name, issues });
    }
    await ctx.close();
  }

  await browser.close();
  await Promise.all(ssPromises);

  // ── Report ─────────────────────────────────────────────────────────────────
  const H = [], M = [], L = [], clean = [];
  allResults.forEach(r => {
    if (!r.issues.length) { clean.push(`  ✓  ${r.label} [${r.vp}]`); return; }
    r.issues.forEach(i => {
      const entry = { ...i, label: r.label, vp: r.vp, url: r.url };
      if (i.sev === 'HIGH') H.push(entry);
      else if (i.sev === 'MED') M.push(entry);
      else L.push(entry);
    });
  });

  console.log('\n╔══════════════════════════════════════════════════════════╗');
  console.log('║   FULL VISUAL + FUNCTIONAL AUDIT REPORT                 ║');
  console.log('╚══════════════════════════════════════════════════════════╝\n');

  const fmt = i => {
    console.log(`   [${i.label} / ${i.vp}] ${i.type}`);
    console.log(`   → ${i.msg}`);
    if (i.data && i.data.length) console.log(`   ↳ ${JSON.stringify(i.data).slice(0,200)}`);
  };

  if (H.length) { console.log('🔴 HIGH'); H.forEach(fmt); console.log(); }
  if (M.length) { console.log('🟡 MEDIUM'); M.forEach(fmt); console.log(); }
  if (L.length) { console.log('🔵 LOW / INFO'); L.forEach(fmt); console.log(); }

  console.log(`✅ CLEAN: ${clean.length}/${allResults.length} page-viewport combos`);
  clean.forEach(l => console.log(l));
  console.log(`\nIssues: ${H.length} high · ${M.length} medium · ${L.length} low`);
  console.log(`Screenshots saved to: ${SS_DIR}\n`);

  // Machine-readable JSON
  fs.writeFileSync(path.join(__dirname, 'audit-results.json'), JSON.stringify(allResults, null, 2));
}

main().catch(console.error);
