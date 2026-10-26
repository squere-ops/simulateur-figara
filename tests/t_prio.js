const { chromium } = require('playwright');
const setNative = async (page, el, value) => {
  await el.evaluate((node, v) => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(node, v);
    node.dispatchEvent(new Event('input', { bubbles: true }));
  }, value);
};
const repondreNonPartout = async (page) => {
  for (let k = 0; k < 10; k++) {
    const n = await page.evaluate(() => {
      const els = Array.from(document.querySelectorAll('[data-ncq="manque"]')).filter(e => e.offsetParent !== null);
      for (const el of els) {
        const b = Array.from(el.querySelectorAll('button')).find(x => x.textContent.trim() === 'Non');
        if (b) { b.click(); return 1; }
      }
      return 0;
    });
    if (!n) break;
    await page.waitForTimeout(200);
  }
};
(async () => {
  const browser = await chromium.launch({ executablePath: process.env.PW_CHROMIUM || undefined });
  const page = await browser.newPage({ viewport: { width: 1400, height: 950 } });
  const errs = [];
  page.on('pageerror', e => { if (!/tailwind is not defined/.test(String(e))) errs.push(String(e)); });
  await page.goto((process.env.PW_PAGE || 'http://localhost:8899/test_local.html') + '?etude=1', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1400);
  if (await page.locator('text=Accéder au simulateur').count()) {
    const inps = page.locator('input');
    await setNative(page, inps.nth(0), 'UP'); await setNative(page, inps.nth(1), 'T');
    await page.locator('button:has-text("Accéder au simulateur")').first().click();
    await page.waitForTimeout(1000);
  }
  await page.locator('button:has-text("Nouveau client")').first().click();
  await page.waitForTimeout(700);
  const btn = page.locator('button, [role=button]').filter({ hasText: /complète|complet/i }).first();
  if (await btn.count()) { try { await btn.click({ timeout: 2000 }); } catch (e) {} }
  await page.waitForTimeout(500);
  const mod = page.locator('div.fixed.inset-0').last();
  await setNative(page, page.locator('input[placeholder="DUPONT"]:visible').last(), 'PRIOTEST');
  await setNative(page, page.locator('input[placeholder="Marie"]:visible').last(), 'Zoé');
  await mod.locator('button:has-text("Célibataire")').first().click();
  await page.waitForTimeout(250);
  await mod.locator('button:text-is("Locataire")').first().click();
  await page.waitForTimeout(300);
  await repondreNonPartout(page);
  await page.locator('button:has-text("Objectifs")').first().click();
  await page.waitForTimeout(700);
  // Sélectionner 3 objectifs dans cet ordre : retraite, fiscalité, transmettre
  await mod.locator('button:has-text("Préparer la retraite")').first().click();
  await page.waitForTimeout(350);
  await mod.locator('button:has-text("Réduire la fiscalité")').first().click();
  await page.waitForTimeout(350);
  await mod.locator('button:has-text("Transmettre")').first().click();
  await page.waitForTimeout(450);
  let t6 = await page.evaluate(() => document.body.innerText.replace(/[\u202f\u00a0]/g, ' '));
  const ok = (l, c) => console.log((c ? 'OK  ' : 'FAIL') + ' — ' + l);
  ok('bloc de classement affiché', /Dans quel ordre souhaitez-vous les travailler/i.test(t6));
  ok('badge priorité n° 1 présent', /priorité n° 1/i.test(t6));
  // Descendre « Préparer la retraite » d'un rang → fiscalité passe n° 1
  await mod.locator('div:has(> span:text-is("1"))').first().locator('button:text-is("↓")').first().click();
  await page.waitForTimeout(400);
  t6 = await page.evaluate(() => document.body.innerText.replace(/[\u202f\u00a0]/g, ' '));
  ok('après ↓ : Réduire la fiscalité devient n° 1', /Réduire la fiscalité[\s\S]{0,40}priorité n° 1/i.test(t6));
  await repondreNonPartout(page);
  await page.locator('button:has-text("Synthèse")').first().click();
  await page.waitForTimeout(900);
  if (await page.evaluate(() => /un instant/i.test(document.body.innerText))) {
    const p35 = page.locator('button:has-text("300 – 500")').last();
    if (await p35.count()) { await p35.click(); await page.waitForTimeout(300); }
    const val = page.locator('button:has-text("Valider")').last();
    if (await val.count()) await val.click();
    await page.waitForTimeout(900);
  }
  await page.waitForTimeout(1000);
  const T = await page.evaluate(() => (document.querySelector('.nc-syn-zone')||{innerText:''}).innerText);
  ok('synthèse : 1. Réduire la fiscalité', /1\. Réduire la fiscalité/.test(T));
  ok('synthèse : 2. Préparer la retraite', /2\. Préparer la retraite/.test(T));
  ok('synthèse : 3. Transmettre', /3\. Transmettre/.test(T));
  ok('mention classés par ordre de priorité', /classés par ordre de priorité avec le client/.test(T));
  console.log('PAGEERRORS:', errs.length ? errs.join(' || ') : 'aucune');
  await browser.close();
})().catch(e => { console.error('CRASH', e); process.exit(1); });
