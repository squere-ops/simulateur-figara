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
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const page = await browser.newPage({ viewport: { width: 1400, height: 950 } });
  const errs = [];
  page.on('pageerror', e => { if (!/tailwind is not defined/.test(String(e))) errs.push(String(e)); });
  const ok = (l, c) => console.log((c ? 'OK  ' : 'FAIL') + ' — ' + l);
  await page.goto('http://localhost:8899/test_local.html?etude=1', { waitUntil: 'networkidle' });
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
  await setNative(page, page.locator('input[placeholder="DUPONT"]:visible').last(), 'INDIVQ');
  await setNative(page, page.locator('input[placeholder="Marie"]:visible').last(), 'Syl');
  await mod.locator('button:has-text("Célibataire")').first().click();
  await page.waitForTimeout(300);
  await mod.locator('button:text-is("Locataire")').first().click();
  await page.waitForTimeout(400);
  await setNative(page, page.locator('div:text-is("Montant du loyer")').first().locator('xpath=..//input').first(), '1200');
  await page.waitForTimeout(300);
  await repondreNonPartout(page);
  await page.locator('button:has-text("Activité & revenus")').first().click();
  await page.waitForTimeout(600);
  await mod.locator('button:has-text("Salarié")').first().click();
  await page.waitForTimeout(400);
  await setNative(page, page.locator('span:text-is("Salaire fixe")').first().locator('xpath=ancestor::div[2]//input[not(@type="range")]').first(), '60000');
  await page.waitForTimeout(400);
  await repondreNonPartout(page);
  // Étape 5 : Patrimoine & épargne — autre bien en indivision
  await page.locator('button:has-text("Patrimoine & épargne")').first().click();
  await page.waitForTimeout(700);
  await page.locator("text=Possédez-vous d'autres biens immobiliers").locator('xpath=following::button[normalize-space()="Oui"][1]').click();
  await page.waitForTimeout(500);
  await setNative(page, page.locator('input[placeholder="Nom libre (ex. terrain à Melun)"]:visible').first(), 'Maison bretagne');
  // Détention → Indivision
  const selDet = page.locator('select').filter({ has: page.locator('option:text-is("Indivision (quote-part)")') }).first();
  await selDet.selectOption('indivision');
  await page.waitForTimeout(400);
  // Valeur totale 300 000
  const cnt = await page.locator('div:text-is("Valeur totale du bien (toutes quotes-parts)")').count();
  console.log('DBG label count:', cnt);
  const inpsDbg = page.locator('div:text-is("Valeur totale du bien (toutes quotes-parts)")').first().locator('xpath=ancestor::div[1]//input[not(@type="range")]');
  console.log('DBG inputs under container:', await inpsDbg.count());
  await setNative(page, inpsDbg.first(), '300000');
  await page.waitForTimeout(400);
  console.log('DBG val after set:', await inpsDbg.first().inputValue());
  // VERROU : quote-part absente → passage à l'étape suivante bloqué
  await repondreNonPartout(page);
  await page.locator('button:has-text("Objectifs")').first().click();
  await page.waitForTimeout(600);
  const bloque = await page.evaluate(() => !!document.querySelector('[data-ncq="manque"]') && !/OBJECTIFS PRIORITAIRES|Classez/i.test((document.querySelector('div.fixed.inset-0')||{innerText:''}).innerText.slice(0, 400)));
  const surEtape5 = await page.locator("text=Possédez-vous d'autres biens immobiliers").count();
  ok('verrou : impossible de passer aux Objectifs sans la quote-part', surEtape5 > 0);
  // Renseigner quote-part 50 % + avec qui
  await setNative(page, page.locator('input[placeholder="50"]:visible').first(), '50');
  await page.waitForTimeout(300);
  await setNative(page, page.locator('input[placeholder="ex. sa sœur — ou : sa sœur et son frère"]:visible').first(), 'sa sœur');
  await page.waitForTimeout(300);
  const aide = await page.evaluate(() => document.body.innerText.replace(/[\u202f\u00a0]/g, ' '));
  ok('aide fiche : « 50 % = 150 000 € » affiché sous la valeur', /50 % = 150 000 €/.test(aide));
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
  await page.waitForTimeout(1200);
  const T = await page.evaluate(() => (document.querySelector('.nc-syn-zone')||{innerText:''}).innerText.replace(/[\u202f\u00a0]/g, ' '));
  ok('tuile : quote-part 50 % = 150 000 € (valeur totale 300 000 €)', /quote-part 50 % = 150 000 € \(valeur totale 300 000 €\)/.test(T));
  ok('tuile : INDIVISION avec sa sœur + « seule la quote-part est comptée »', /INDIVISION — quote-part 50 %, avec sa sœur — seule la quote-part est comptée au bilan/.test(T));
  ok('actif : immobilier 150 000 € (pas 300 000)', /immobilier 150 000 €/.test(T) && !/immobilier 300 000 €/.test(T));
  ok('patrimoine net = 150 000 €', /Patrimoine net\s*\n\s*150 000 €/i.test(T));
  // v168 : locataire AVEC patrimoine immobilier par ailleurs + endettement maîtrisé sans « intacte »
  ok('faiblesse Locataire : patrimoine par ailleurs reconnu (150 000 €)', /la résidence principale n'est pas détenue, mais un patrimoine immobilier de 150 000 € est constitué par ailleurs/.test(T));
  ok('plus jamais « aucun patrimoine immobilier constitué » à tort', !/aucun patrimoine immobilier constitué/.test(T));
  ok('plus jamais « capacité de financement est intacte »', !/capacité de financement est intacte/.test(T));
  ok('AUCUN NaN', !/NaN/.test(T));
  console.log('PAGEERRORS:', errs.length ? errs.join(' | ') : 'aucune');
  await browser.close();
})().catch(e => { console.error('CRASH', e); process.exit(1); });
