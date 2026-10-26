const { chromium } = require('playwright');
const { passerFenetres } = require('./_aide');
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
  const browser = await chromium.launch({ executablePath: process.env.PW_CHROMIUM || undefined });
  const page = await browser.newPage({ viewport: { width: 1400, height: 950 } });
  const errs = [];
  page.on('pageerror', e => { if (!/tailwind is not defined/.test(String(e))) errs.push(String(e)); });
  await page.goto((process.env.PW_PAGE || 'http://localhost:8899/test_local.html') + '?etude=1', { waitUntil: 'networkidle' });
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
  await setNative(page, page.locator('input[placeholder="DUPONT"]:visible').last(), 'PENSQ');
  await setNative(page, page.locator('input[placeholder="Marie"]:visible').last(), 'Syl');
  await mod.locator('button:has-text("Célibataire")').first().click();
  await page.waitForTimeout(300);
  await mod.locator('button:has-text("Logé à titre gratuit")').first().click();
  await page.waitForTimeout(400);
  await repondreNonPartout(page);
  // Étape 2 : Famille — 2 enfants (27 et 17 ans), pension perçue 300 + versée 900
  await page.locator('button:has-text("Famille")').first().click();
  await page.waitForTimeout(600);
  await page.locator('text=Avez-vous des enfants ?').locator('xpath=following::button[normalize-space()="Oui"][1]').click();
  await page.waitForTimeout(400);
  await mod.locator('button:text-is("2")').first().click();
  await page.waitForTimeout(400);
  const an = new Date().getFullYear();
  await setNative(page, page.locator('input[placeholder="Prénom"]:visible').nth(0), 'Aina');
  await setNative(page, page.locator('input[placeholder="2012"]:visible').nth(0), String(an - 27));
  await setNative(page, page.locator('input[placeholder="Prénom"]:visible').nth(1), 'Tom');
  await setNative(page, page.locator('input[placeholder="2012"]:visible').nth(1), String(an - 17));
  await page.waitForTimeout(300);
  await page.locator('text=Percevez-vous ou versez-vous une pension alimentaire ?').locator('xpath=following::button[normalize-space()="Oui"][1]').click();
  await page.waitForTimeout(400);
  await setNative(page, page.locator('div:text-is("Pension perçue")').first().locator('xpath=..//input').first(), '300');
  await setNative(page, page.locator('div:text-is("Pension versée")').first().locator('xpath=..//input').first(), '900');
  await page.waitForTimeout(300);
  await repondreNonPartout(page);
  // Étape 3 : Activité — salarié 110 000 €/an ≈ 9 167 €/mois
  await page.locator('button:has-text("Activité & revenus")').first().click();
  await page.waitForTimeout(600);
  await mod.locator('button:has-text("Salarié")').first().click();
  await page.waitForTimeout(400);
  await setNative(page, page.locator('span:text-is("Salaire fixe")').first().locator('xpath=ancestor::div[2]//input[not(@type="range")]').first(), '110000');
  await page.waitForTimeout(400);
  await repondreNonPartout(page);
  await page.locator('button:has-text("Synthèse")').first().click();
  await passerFenetres(page);
  await page.waitForTimeout(900);
  if (await page.evaluate(() => /un instant/i.test(document.body.innerText))) {
    const p35 = page.locator('button:has-text("300 – 500")').last();
    if (await p35.count()) { await p35.click(); await page.waitForTimeout(300); }
    const val = page.locator('button:has-text("Valider")').last();
    if (await val.count()) await val.click();
    await page.waitForTimeout(900);
  }
  await page.waitForTimeout(1200);
  const T = await page.evaluate(() => (document.querySelector('.nc-syn-zone')||{innerText:''}).innerText.replace(/[\u202f\u00a0]/g, ' '));
  const ok = (l, c) => console.log((c ? 'OK  ' : 'FAIL') + ' — ' + l);
  ok('bloc logement : « Logé(e) à titre gratuit » affiché', /Logé\(e\) à titre gratuit/.test(T));
  ok("note forfait 600 € nommée + suppression à l'achat RP", /forfait de 600 €\/mois retenu dans l'endettement/.test(T) && /disparaît en cas d'achat de la résidence principale/.test(T));
  ok('mensualité dispo : « achat RP (forfait logement supprimé) »', /achat RP \(forfait logement supprimé\)/.test(T));
  ok("tuile capacité : « forfait logement de 600 € disparaît »", /forfait logement de 600 € disparaît à l'achat/.test(T));
  ok('AUCUN NaN', !/NaN/.test(T));
  console.log('PAGEERRORS:', errs.length ? errs.join(' | ') : 'aucune');
  await browser.close();
})().catch(e => { console.error('CRASH', e); process.exit(1); });
