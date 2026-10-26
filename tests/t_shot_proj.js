// Capture visuelle du harnais Projection.
//   node t_shot_proj.js [ancre] [sortie.png]
// ancre = texte a chercher ; la capture cadre a partir de la.
const { chromium } = require('playwright');
(async () => {
  const ancre = process.argv[2] || null;
  const out = process.argv[3] || '/tmp/proj.png';
  const b = await chromium.launch({ executablePath: process.env.PW_CHROMIUM || undefined });
  const p = await b.newPage({ viewport: { width: 1300, height: 1000 } });
  const errs = [];
  p.on('pageerror', e => errs.push(String(e)));
  await p.goto('http://localhost:8899/_test_proj.html', { waitUntil: 'networkidle' });
  await p.waitForTimeout(1200);
  if (errs.length) { console.log('PAGEERRORS:'); errs.forEach(e => console.log('  ' + e)); }
  else console.log('PAGEERRORS: aucune');
  if (ancre) {
    const ok = await p.evaluate((a) => {
      const el = Array.from(document.querySelectorAll('*')).find(
        e => e.children.length === 0 && !/^(SCRIPT|STYLE|TITLE|LINK|META)$/.test(e.tagName) && e.offsetParent !== null && e.textContent.trim().includes(a));
      if (!el) return false;
      el.scrollIntoView({ block: 'center' });
      return true;
    }, ancre);
    if (!ok) console.log('ANCRE INTROUVABLE : ' + ancre);
    await p.waitForTimeout(500);
    const box = await p.evaluate((a) => {
      const el = Array.from(document.querySelectorAll('*')).find(
        e => e.children.length === 0 && !/^(SCRIPT|STYLE|TITLE|LINK|META)$/.test(e.tagName) && e.offsetParent !== null && e.textContent.trim().includes(a));
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { x: 0, y: Math.max(0, r.top + window.scrollY - 420), w: document.documentElement.clientWidth, h: 900 };
    }, ancre);
    if (box) {
      await p.screenshot({ path: out, fullPage: true, clip: { x: box.x, y: box.y, width: box.w, height: box.h } });
      console.log('capture -> ' + out); await b.close(); return;
    }
  }
  await p.screenshot({ path: out });
  console.log('capture -> ' + out);
  await b.close();
})();
