const { chromium } = require('playwright');
const setNative = async (page, el, value) => {
  await el.evaluate((node, v) => { Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(node, v); node.dispatchEvent(new Event('input', { bubbles: true })); }, value);
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
  const ok = (l, c) => console.log((c ? 'OK  ' : 'FAIL') + ' — ' + l);
  const T = async () => await page.evaluate(() => document.body.innerText);
  await mod.locator('button:has-text("Divorcé(e)")').first().click();
  await page.waitForTimeout(600);
  let t = await T();
  // v171 (décision cabinet) : divorcé = AUCUNE question spécifique — les 4 points
  // de contrôle du divorce (v158) sont supprimés : jugement rendu, règles fixées.
  ok('divorcé : plus AUCUNE question DDV', !/donation au dernier vivant avait-elle été consentie/i.test(t));
  ok('divorcé : plus de « Points de contrôle liés au divorce »', !/Points de contrôle liés au divorce/i.test(t));
  ok('divorcé : plus de question prestation compensatoire', !/prestation compensatoire est-elle en jeu/i.test(t));
  ok('divorcé : plus de question liquidation / testament / clause AV', !/liquidation du régime matrimonial est-elle achevée/i.test(t) && !/testament antérieur au profit de l'ex-conjoint/i.test(t) && !/désigne-t-elle nommément l'ex-conjoint/i.test(t));
  // Veuf : question au passé présente
  await mod.locator('button:has-text("Veuf(ve)")').first().click();
  await page.waitForTimeout(600);
  t = await T();
  ok('veuf : question DDV au passé', /Une donation au dernier vivant avait-elle été consentie \?/.test(t));
  ok('veuf : plus de bloc divorce', !/Points de contrôle liés au divorce/.test(t));
  // Célibataire : rien
  await mod.locator('button:has-text("Célibataire")').first().click();
  await page.waitForTimeout(500);
  t = await T();
  ok('célibataire : aucune question DDV', !/donation au dernier vivant/i.test(t));
  await browser.close();
})().catch(e => { console.error('CRASH', e); process.exit(1); });
