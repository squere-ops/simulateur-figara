/* Imprime le document « Audit et synthèse » d'un client type (démo) en A4 et Letter.
   Usage : node t_pdf_type.js celib   → doc_type_celib_A4.pdf, doc_type_celib_Letter.pdf
   Sert à relire, page par page, ce que le CGP obtient avec un client type. */
const { chromium } = require('playwright');
const { passerFenetres } = require('./_aide');
const setN = async (el, v) => el.evaluate((n, val) => { const s = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set; s.call(n, val); n.dispatchEvent(new Event('input', { bubbles: true })); }, v);
const cle = process.argv[2] || 'celib';
(async () => {
  const browser = await chromium.launch({ executablePath: process.env.PW_CHROMIUM || undefined });
  const page = await browser.newPage({ viewport: { width: 1400, height: 950 } });
  await page.addInitScript(() => { window.__NC_FORCE_DEMO = true; });
  page.on('dialog', dl => dl.accept());
  const errs = [];
  page.on('pageerror', e => { if (!/tailwind is not defined/.test(String(e))) errs.push(String(e)); });
  await page.goto((process.env.PW_PAGE || 'http://localhost:8899/test_local.html') + '?etude=1', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1300);
  if (await page.locator('text=Accéder au simulateur').count()) {
    const inps = page.locator('input'); await setN(inps.nth(0), 'UP'); await setN(inps.nth(1), 'T');
    await page.locator('button:has-text("Accéder au simulateur")').first().click(); await page.waitForTimeout(900);
  }
  await page.locator('button:has-text("Nouveau client")').first().click(); await page.waitForTimeout(700);
  const b = page.locator('button, [role=button]').filter({ hasText: /complète|complet/i }).first();
  if (await b.count()) { try { await b.click({ timeout: 2000 }); } catch (e) {} }
  await page.waitForTimeout(700);
  await page.locator('[data-nc-client-type="' + cle + '"]').click(); await page.waitForTimeout(900);
  await page.locator('button:has-text("Synthèse")').first().click(); await page.waitForTimeout(1800);
  await passerFenetres(page);

  /* 21/09/2026 : la fenêtre des incohérences peut s'ouvrir en quittant les objectifs —
     le banc la franchit par « Continuer quand même » (elle a son propre banc). */
  { const bInc = page.locator('[data-nc-inco="1"] button:has-text("Continuer quand même")'); if (await bInc.count()) { await bInc.first().click(); await page.waitForTimeout(1600); } }
  await page.evaluate(() => {
    window.print = () => {};
    const rm = Element.prototype.remove;
    Element.prototype.remove = function () { if (this.id === 'nc-print-holder') return; return rm.call(this); };
    const clRm = DOMTokenList.prototype.remove;
    DOMTokenList.prototype.remove = function (...c) {
      if (c.indexOf('nc-print-syn') !== -1 || c.indexOf('nc-print-syn-root') !== -1) return;
      return clRm.apply(this, c);
    };
  });
  await page.locator('button:has-text("Enregistrer en PDF")').first().click(); await page.waitForTimeout(500);
  const hint = page.locator('button:has-text("J\'ai compris")');
  if (await hint.count()) { await hint.first().click(); await page.waitForTimeout(500); }
  await page.waitForTimeout(1200);
  for (const fmt of ['A4', 'Letter']) await page.pdf({ path: 'doc_type_' + cle + '_' + fmt + '.pdf', format: fmt, printBackground: true });
  console.log('PAGEERRORS:', errs.length ? errs.join(' | ') : 'aucune');
  await browser.close();
})();
