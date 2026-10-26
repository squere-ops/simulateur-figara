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
  for (let k = 0; k < 10; k++) {
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
    await setNative(page, inps.nth(0), 'Universel Patrimoine');
    await setNative(page, inps.nth(1), 'Test');
    await page.locator('button:has-text("Accéder au simulateur")').first().click();
    await page.waitForTimeout(1200);
  }
  await page.locator('button:has-text("Nouveau client")').first().click();
  await page.waitForTimeout(800);
  const btn = page.locator('button, [role=button]').filter({ hasText: /complète|complet/i }).first();
  if (await btn.count()) { try { await btn.click({ timeout: 2000 }); } catch (e) {} }
  await page.waitForTimeout(600);
  const mod = page.locator('div.fixed.inset-0').last();

  // Étape 1 : marié, conjoint renseigné (Madame née 01/05/1984 → 42 ans), locataire
  await setNative(page, page.locator('input[placeholder="DUPONT"]:visible').last(), 'COUPLETEST');
  await setNative(page, page.locator('input[placeholder="Marie"]:visible').last(), 'Marc');
  const dn1 = page.locator('input[type="date"]:visible').first();
  if (await dn1.count()) await setNative(page, dn1, '1980-01-01');
  await mod.locator('button:has-text("Marié(e)")').first().click();
  await page.waitForTimeout(400);
  await page.locator('text=Renseigner le conjoint ?').locator('xpath=following::button[normalize-space()="Oui"][1]').click();
  await page.waitForTimeout(500);
  const dns = page.locator('input[type="date"]:visible');
  if (await dns.count() > 1) await setNative(page, dns.nth(1), '1984-05-01');
  await page.waitForTimeout(300);
  await mod.locator('button:text-is("Locataire")').first().click();
  await page.waitForTimeout(300);

  // Étape 2 : 2 enfants communs
  await repondreNonPartout(page);
  await page.locator('button:has-text("Famille")').first().click();
  await page.waitForTimeout(600);
  await page.locator('text=Avez-vous des enfants ?').locator('xpath=following::button[normalize-space()="Oui"][1]').click();
  await page.waitForTimeout(400);
  await mod.locator('button:text-is("2")').first().click();
  await page.waitForTimeout(400);
  const prenoms = page.locator('input[placeholder="Prénom"]:visible');
  await setNative(page, prenoms.nth(0), 'Léa');
  await setNative(page, prenoms.nth(1), 'Tom');
  await page.waitForTimeout(300);

  // Étape 5 : compte courant COMMUN 1 000 000 € (titulaire non précisé → 50/50)
  await repondreNonPartout(page);
  await page.locator('button:has-text("Patrimoine & épargne")').first().click();
  await page.waitForTimeout(600);
  await page.locator("text=Avez-vous de l'épargne ou des placements ?").locator('xpath=following::button[normalize-space()="Oui"][1]').click();
  await page.waitForTimeout(600);
  await page.locator('text=Type de placement').first().locator('xpath=following::select[1]').selectOption('compte_courant');
  await page.waitForTimeout(400);
  await setNative(page, page.locator('text=Encours').first().locator('xpath=following::input[not(@type="range")][1]').first(), '1000000');
  await page.waitForTimeout(400);

  // Synthèse
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
  const T = await page.evaluate(() => (document.querySelector('.nc-syn-zone') ? document.querySelector('.nc-syn-zone').innerText : 'PAS').replace(/[  ]/g, ' '));
  const has = (lbl, re) => console.log((re.test(T) ? 'OK  ' : 'FAIL') + ' — ' + lbl);
  has('deux volets : Si Monsieur / Si Madame décédait', /Si Monsieur décédait[\s\S]+Si Madame décédait/i);
  has('assiette 498 500 € (moitié du commun, art. 775 déduit)', /498 500 €/);
  has('option 1/4 PP de Madame', /Option Madame : 1\/4 en pleine propriété/i);
  has('droits option PP = 31 164 €', /31 164 € de droits/);
  has('option 100 % usufruit de Madame', /Option Madame : 100 % usufruit/i);
  has('usufruit 60 % (42 ans, art. 669)', /usufruit 60 % \(42 ans, art\. 669 CGI\)/i);
  has('option usufruit = 0 € de droits', /0 € de droits/);
  has('conjoint exonéré (art. 796-0 bis)', /exonéré\(e\) de droits de succession \(art\. 796-0 bis CGI\)/i);
  has('extinction usufruit au second décès (art. 1133)', /l'usufruit s'éteint sans droits \(art\. 1133\)/i);
  // v157 : option mixte DDV chiffrée — 498 500 × 0,75 × 0,40 = 149 550 → 74 775/enfant → 0 €
  has('scénario DDV : 1/4 PP + 3/4 usufruit affiché', /Avec une donation au dernier vivant : 1\/4 PP \+ 3\/4 usufruit/i);
  has('option mixte art. 1094-1 expliquée', /option mixte ouverte par la donation entre époux \(art\. 1094-1 C\. civ\.\)/i);
  has('note DDV non confirmée + droits évités vs 1/4 PP', /donation au dernier vivant NON confirmée[\s\S]{0,220}droits évités par rapport au 1\/4 en pleine propriété/i);
  await page.evaluate(() => { window.print = () => {}; });
  await page.locator('button:has-text("Enregistrer en PDF")').first().click();
  await page.waitForTimeout(400);
  const hintBtn = page.locator('button:has-text("J\'ai compris")');
  if (await hintBtn.count()) { await hintBtn.first().click(); await page.waitForTimeout(400); }
  await page.pdf({ path: 'export_succ2.pdf', format: 'A4', printBackground: true });
  console.log('PDF genere');
  console.log('PAGEERRORS:', errs.length ? errs.join(' || ') : 'aucune');
  await browser.close();
})().catch(e => { console.error('CRASH', e); process.exit(1); });
