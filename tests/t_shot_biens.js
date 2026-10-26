const { chromium } = require('playwright');
const setNative = async (page, el, value) => {
  await el.evaluate((node, v) => {
    const proto = node.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    Object.getOwnPropertyDescriptor(proto, 'value').set.call(node, v);
    node.dispatchEvent(new Event('input', { bubbles: true }));
    node.dispatchEvent(new Event('change', { bubbles: true }));
  }, value);
};
const repondreNonPartout = async (page) => {
  for (let k = 0; k < 12; k++) {
    const n = await page.evaluate(() => {
      const els = Array.from(document.querySelectorAll('[data-ncq="manque"]')).filter(e => e.offsetParent !== null);
      for (const el of els) {
        const btn = Array.from(el.querySelectorAll('button')).find(b => b.textContent.trim() === 'Non');
        if (btn) { btn.click(); return 1; }
      }
      return 0;
    });
    if (!n) break;
    await page.waitForTimeout(250);
  }
};
(async () => {
  const FILE = process.argv[2] || 'test_local.html', OUT = process.argv[3] || '/tmp/biens.png';
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const page = await browser.newPage({ viewport: { width: 1400, height: 1100 } });
  await page.goto('http://localhost:8899/' + FILE + '?etude=1', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  if (await page.locator('text=Accéder au simulateur').count()) {
    const inps = page.locator('input');
    await setNative(page, inps.nth(0), 'UP'); await setNative(page, inps.nth(1), 'T');
    await page.locator('button:has-text("Accéder au simulateur")').first().click();
    await page.waitForTimeout(1200);
  }
  await page.locator('button:has-text("Nouveau client")').first().click();
  await page.waitForTimeout(800);
  const b = page.locator('button, [role=button]').filter({ hasText: /complète|complet/i }).first();
  if (await b.count()) { try { await b.click({ timeout: 2000 }); } catch (e) {} }
  await page.waitForTimeout(600);
  const mod = page.locator('div.fixed.inset-0').last();
  await setNative(page, page.locator('input[placeholder="DUPONT"]:visible').last(), 'SHOT');
  await setNative(page, page.locator('input[placeholder="Marie"]:visible').last(), 'Syl');
  await mod.locator('button:has-text("Célibataire")').first().click();
  await page.waitForTimeout(300);
  await mod.locator('button:text-is("Locataire")').first().click();
  await page.waitForTimeout(400);
  await repondreNonPartout(page);
  await page.locator('button:has-text("Activité & revenus")').first().click();
  await page.waitForTimeout(600);
  await mod.locator('button:has-text("Salarié")').first().click();
  await page.waitForTimeout(400);
  await repondreNonPartout(page);
  await page.locator('button:has-text("Patrimoine & épargne")').first().click();
  await page.waitForTimeout(700);
  await page.locator("text=Possédez-vous d'autres biens immobiliers").locator('xpath=following::button[normalize-space()="Oui"][1]').click();
  await page.waitForTimeout(500);
  const det = page.locator('button:has-text("Détails (crédit, objectif de vente")').first();
  console.log('bouton Détails visible:', await det.count());
  await det.click(); await page.waitForTimeout(400);
  // crédit oui
  const q = page.locator('text=Un crédit sur ce bien ?').first();
  const qc = await q.count(); console.log('Crédit en cours label:', qc);
  if (qc) { await q.locator('xpath=following::button[normalize-space()="Oui"][1]').click(); await page.waitForTimeout(400); }
  const q2 = page.locator('text=Objectif de vente ?').first();
  if (await q2.count()) { await q2.locator('xpath=following::button[normalize-space()="Oui"][1]').click(); await page.waitForTimeout(400); }
  const card = page.locator("text=Possédez-vous d'autres biens immobiliers").first().locator('xpath=ancestor::div[2]');
  const box = await card.boundingBox(); console.log('card box', JSON.stringify(box));
  await card.screenshot({ path: OUT });
  const txt = await card.innerText(); console.log(txt.replace(/\s+/g,' ').slice(0, 900));
  await browser.close();
})();
