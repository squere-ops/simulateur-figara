const { chromium } = require('playwright');
const setNative = async (page, el, value) => {
  await el.evaluate((node, v) => {
    const proto = node.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    Object.getOwnPropertyDescriptor(proto, 'value').set.call(node, v);
    node.dispatchEvent(new Event('input', { bubbles: true }));
    node.dispatchEvent(new Event('change', { bubbles: true }));
  }, value);
};
(async () => {
  const browser = await chromium.launch({ executablePath: process.env.PW_CHROMIUM || undefined });
  const page = await browser.newPage({ viewport: { width: 1400, height: 950 } });
  await page.goto('http://localhost:8899/test_local.html?etude=1', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
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
  // Propriétaire : la valeur RP doit avoir un champ libre → 150 000 €
  await mod.locator('button:text-is("Propriétaire")').first().click();
  await page.waitForTimeout(400);
  const rpLibre = page.locator('text=Valeur estimée du bien').first().locator('xpath=following::input[not(@type="range")][1]').first();
  await setNative(page, rpLibre, '150000');
  await page.waitForTimeout(300);
  let t = await page.evaluate(() => document.body.innerText.replace(/[\u202f\u00a0]/g, ' '));
  console.log((/150 000 €/.test(t) ? 'OK  ' : 'FAIL') + ' — valeur RP 150 000 € saisie librement (sous le minimum du curseur)');
  console.log((/en dessous ou au-delà des bornes du curseur/.test(t) ? 'OK  ' : 'FAIL') + ' — aide « en dessous ou au-delà des bornes »');
  // Étape 5 : bien locatif à 20 000 € (parking)
  await page.locator('button:has-text("Activité & revenus")').first().click();
  await page.waitForTimeout(600);
  const ouiLoc = page.locator('text=/revenus fonciers|immobilier locatif/i').first().locator('xpath=following::button[normalize-space()="Oui"][1]');
  if (await ouiLoc.count()) { try { await ouiLoc.first().click({ timeout: 2000 }); await page.waitForTimeout(600); } catch(e) {} }
  const valLoc = page.locator('text=Valeur estimée').first().locator('xpath=following::input[not(@type="range")][1]').first();
  if (await valLoc.count()) {
    await setNative(page, valLoc, '20000');
    await page.waitForTimeout(300);
    t = await page.evaluate(() => document.body.innerText.replace(/[\u202f\u00a0]/g, ' '));
    console.log((/20 000 €/.test(t) ? 'OK  ' : 'FAIL') + ' — bien locatif à 20 000 € (parking) saisissable');
  } else console.log('SKIP — bloc locatif non trouvé');
  await page.screenshot({ path: 'shot_v152.png', fullPage: false });
  await browser.close();
})().catch(e => { console.error('CRASH', e); process.exit(1); });
