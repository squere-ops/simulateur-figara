const { chromium } = require('playwright');
const setNative = async (page, el, value) => {
  await el.evaluate((node, v) => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(node, v);
    node.dispatchEvent(new Event('input', { bubbles: true }));
  }, value);
};
(async () => {
  const browser = await chromium.launch({ executablePath: process.env.PW_CHROMIUM || undefined });
  const page = await browser.newPage({ viewport: { width: 1400, height: 950 } });
  const errs = [];
  page.on('pageerror', e => { if (!/tailwind is not defined/.test(String(e))) errs.push(String(e)); });
  await page.goto('http://localhost:8899/test_local.html?etude=1', { waitUntil: 'networkidle' });
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
  await mod.locator('button:has-text("Célibataire")').first().click();
  await page.waitForTimeout(250);
  await mod.locator('button:text-is("Propriétaire")').first().click();
  await page.waitForTimeout(500);
  await setNative(page, page.locator('text=Valeur estimée du bien').first().locator('xpath=following::input[not(@type="range")][1]').first(), '530000');
  await page.waitForTimeout(300);
  await page.locator("text=Un crédit est-il en cours sur ce bien ?").locator('xpath=following::button[normalize-space()="Oui"][1]').click();
  await page.waitForTimeout(500);
  const ok = (l, c) => console.log((c ? 'OK  ' : 'FAIL') + ' — ' + l);
  const T = async () => (await page.evaluate(() => document.body.innerText)).replace(/[  ]/g, ' ');
  // CAS EXPERT : 255 000 € · 1,45 % · 11 ans · mensualité 1 700 € → ne boucle pas (≈ 2 090 €)
  await setNative(page, page.locator('text=Capital restant dû').first().locator('xpath=following::input[not(@type="range")][1]').first(), '255000');
  await page.waitForTimeout(300);
  await setNative(page, page.locator('div:has(> div:text-is("Taux du crédit")) input[type="range"]').first(), '1.45');
  await page.waitForTimeout(300);
  await setNative(page, page.locator('div:has(> div:text-is("Durée restante")) input[type="range"]').first(), '11');
  await page.waitForTimeout(400);
  let t = await T();
  ok('3 paramètres → mensualité proposée ≈ 2 090 €/mois', /Mensualité calculée : ≈ 2 09\d €\/mois/.test(t));
  // saisir la mensualité fausse 1 700 → alerte incohérence
  await setNative(page, page.locator('div:has(> div:text-is("Mensualité")) input[type="range"]').first(), '1700');
  await page.waitForTimeout(400);
  t = await T();
  ok('4 paramètres faux → « ne bouclent pas »', /Ces paramètres ne bouclent pas/.test(t));
  ok('mensualité théorique ≈ 2 09x € affichée', /⇒ ≈ 2 09\d €\/mois \(saisi : 1 700 €\)/.test(t));
  ok('CRD équivalent ≈ 207-208 k€ proposé', /correspond à ≈ 20[78] \d{3} € de capital restant dû/.test(t));
  ok('mention relevé d\'amortissement', /trancher au relevé d'amortissement/.test(t));
  // bouton « Utiliser X €/mois » → tout boucle
  await page.locator('button').filter({ hasText: /Utiliser 2[\s\u202f\u00a0]?09\d[\s\u202f\u00a0]?€\/mois/ }).first().click();
  await page.waitForTimeout(400);
  t = await T();
  ok('après correction en un clic : ✓ Le crédit boucle', /✓ Le crédit boucle/.test(t));
  console.log('PAGEERRORS:', errs.length ? errs.join(' || ') : 'aucune');
  await browser.close();
})().catch(e => { console.error('CRASH', e); process.exit(1); });
