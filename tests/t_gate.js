const { chromium } = require('playwright');
const setNative = async (page, el, value) => {
  await el.evaluate((node, v) => {
    const proto = HTMLInputElement.prototype;
    Object.getOwnPropertyDescriptor(proto, 'value').set.call(node, v);
    node.dispatchEvent(new Event('input', { bubbles: true }));
  }, value);
};
(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const page = await browser.newPage({ viewport: { width: 1400, height: 950 } });
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
  // RIEN n'est rempli → Suivant doit BLOQUER sur l'étape 1
  await mod.locator('button:has-text("Suivant →")').first().click();
  await page.waitForTimeout(600);
  let t = await page.evaluate(() => document.body.innerText);
  const ok = (l, c) => console.log((c ? 'OK  ' : 'FAIL') + ' — ' + l);
  ok('reste sur étape 1 (blocage)', /étape 1 \/ 8/.test(t));
  ok('bandeau rouge « sans réponse »', /question(s)? sans réponse sur cette page/.test(t));
  const nbManque = await page.evaluate(() => document.querySelectorAll('[data-ncq="manque"]').length);
  console.log((nbManque > 0 ? 'OK  ' : 'FAIL') + ` — ${nbManque} question(s) marquées manquantes`);
  // Clic direct sur un onglet lointain → bloqué aussi
  await page.locator('button:has-text("Synthèse")').first().click();
  await page.waitForTimeout(600);
  t = await page.evaluate(() => document.body.innerText);
  ok('onglet Synthèse bloqué aussi (toujours étape 1)', /étape 1 \/ 8/.test(t));
  // On répond à tout → le passage se libère
  await mod.locator('button:has-text("Célibataire")').first().click();
  await page.waitForTimeout(250);
  await mod.locator('button:text-is("Locataire")').first().click();
  await page.waitForTimeout(350);
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
  await mod.locator('button:has-text("Suivant →")').first().click();
  await page.waitForTimeout(700);
  t = await page.evaluate(() => document.body.innerText);
  ok('tout répondu → passage à l\'étape 2', /étape 2 \/ 8/.test(t));
  ok('retour arrière toujours libre', await (async () => { await page.locator('button:has-text("État civil")').first().click(); await page.waitForTimeout(500); return /étape 1 \/ 8/.test(await page.evaluate(() => document.body.innerText)); })());
  await browser.close();
})().catch(e => { console.error('CRASH', e); process.exit(1); });
