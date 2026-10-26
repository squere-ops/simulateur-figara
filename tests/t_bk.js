const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ executablePath: process.env.PW_CHROMIUM || undefined });
  const page = await browser.newPage({ viewport: { width: 1400, height: 950 } });
  await page.goto('http://localhost:8899/test_local.html?etude=1', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  if (await page.locator('text=Accéder au simulateur').count()) {
    const inps = page.locator('input');
    await inps.nth(0).fill('UP'); await inps.nth(1).fill('T');
    await page.locator('button:has-text("Accéder au simulateur")').first().click();
    await page.waitForTimeout(1000);
  }
  await page.locator('button:has-text("Nouveau client")').first().click();
  await page.waitForTimeout(700);
  const b = page.locator('button, [role=button]').filter({ hasText: /complète|complet/i }).first();
  if (await b.count()) { try { await b.click({ timeout: 2000 }); } catch (e) {} }
  await page.waitForTimeout(500);
  const mod = page.locator('div.fixed.inset-0').last();
  await mod.locator('button:has-text("Marié")').first().click();
  await page.waitForTimeout(300);
  await page.locator('text=Renseigner le conjoint ?').locator('xpath=following::button[normalize-space()="Oui"][1]').click();
  await page.waitForTimeout(500);
  const t = await mod.evaluate(el => el.innerText);
  const occ = (t.match(/BANQUE PRINCIPALE/gi) || []).length;
  console.log('OCCURRENCES "banque principale":', occ, occ === 2 ? '(OK : 1 client + 1 conjoint)' : 'ANORMAL');
  console.log((!/Banque du conjoint\n/.test(t) && !/BANQUE PRINCIPALE DU CLIENT/.test(t) ? 'OK  ' : 'FAIL') + ' — doublon supprimé');
  await browser.close();
})().catch(e => { console.error('CRASH', e); process.exit(1); });
