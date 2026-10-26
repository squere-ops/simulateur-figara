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
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const page = await browser.newPage({ viewport: { width: 1400, height: 950 } });
  const errs = [];
  page.on('pageerror', e => { if (!/tailwind is not defined/.test(String(e))) errs.push(String(e)); });
  await page.goto('http://localhost:8899/test_local.html?etude=1', { waitUntil: 'networkidle' });
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

  // Étape 1 : célibataire locataire
  await setNative(page, page.locator('input[placeholder="DUPONT"]:visible').last(), 'SUCCTEST');
  await setNative(page, page.locator('input[placeholder="Marie"]:visible').last(), 'Paul');
  await mod.locator('button:has-text("Célibataire")').first().click();
  await page.waitForTimeout(300);
  await mod.locator('button:text-is("Locataire")').first().click();
  await page.waitForTimeout(300);

  // Étape 2 : 1 enfant Léa + donation 50 000 € en 2021
  await repondreNonPartout(page);
  await page.locator('button:has-text("Famille")').first().click();
  await page.waitForTimeout(600);
  await page.locator('text=Avez-vous des enfants ?').locator('xpath=following::button[normalize-space()="Oui"][1]').click();
  await page.waitForTimeout(400);
  await mod.locator('button:text-is("1")').first().click();
  await page.waitForTimeout(400);
  await setNative(page, page.locator('input[placeholder="Prénom"]:visible').first(), 'Léa');
  await setNative(page, page.locator('input[placeholder="2012"]:visible').first(), '2000');
  await page.waitForTimeout(300);
  await page.locator('text=Des donations ont-elles déjà été réalisées ?').locator('xpath=following::button[normalize-space()="Oui"][1]').click();
  await page.waitForTimeout(500);
  const t2 = await page.evaluate(() => document.body.innerText);
  const has2 = (lbl, re) => console.log((re.test(t2) ? 'OK  ' : 'FAIL') + ' — ' + lbl);
  await setNative(page, page.locator('input[placeholder*="Bénéficiaire"]:visible').first(), 'Léa');
  await setNative(page, page.locator('input[placeholder="Année"]:visible').first(), '2021');
  await setNative(page, page.locator('input[placeholder*="Bénéficiaire"]:visible').first().locator('xpath=following::input[not(@type="range")][2]').first(), '50000');
  await page.waitForTimeout(500);
  const t2b = await page.evaluate(() => document.body.innerText);
  console.log((/rappel fiscal : abattement de 100 000 € entamé/.test(t2b) ? 'OK  ' : 'FAIL') + ' — note rappel fiscal < 15 ans sous la donation');

  // Étape 3 : salarié 120 000 €/an (nécessaire au bloc fiscal, pour tester l'ordre)
  await repondreNonPartout(page);
  await page.locator('button:has-text("Activité & revenus")').first().click();
  await page.waitForTimeout(600);
  await mod.locator('button:has-text("Salarié")').first().click();
  await page.waitForTimeout(400);
  await setNative(page, page.locator('span:text-is("Salaire fixe")').first().locator('xpath=ancestor::div[2]//input[not(@type="range")]').first(), '120000');
  await page.waitForTimeout(400);

  // Étape 5 : compte courant 400 000 €
  await repondreNonPartout(page);
  await page.locator('button:has-text("Patrimoine & épargne")').first().click();
  await page.waitForTimeout(600);
  await page.locator("text=Avez-vous de l'épargne ou des placements ?").locator('xpath=following::button[normalize-space()="Oui"][1]').click();
  await page.waitForTimeout(600);
  await page.locator('text=Type de placement').first().locator('xpath=following::select[1]').selectOption('compte_courant');
  await page.waitForTimeout(400);
  await setNative(page, page.locator('text=Encours').first().locator('xpath=following::input[not(@type="range")][1]').first(), '400000');
  await page.waitForTimeout(400);

  // Synthèse
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
  const T = await page.evaluate(() => (document.querySelector('.nc-syn-zone') ? document.querySelector('.nc-syn-zone').innerText : 'PAS DE SYNTHESE').replace(/[  ]/g, ' '));
  const has = (lbl, re) => console.log((re.test(T) ? 'OK  ' : 'FAIL') + ' — ' + lbl);
  has('bloc « Transmission — et si un décès survenait ? »', /TRANSMISSION — ET SI UN DÉCÈS SURVENAIT \?/i);
  has('volet « Si Monsieur décédait »', /Si Monsieur décédait/i);
  has('patrimoine transmissible 398 500 € (frais funéraires déduits)', /(Patrimoine transmissible estimé[\s\S]{0,30}398[\s]?500 €|398[\s]?500 €[\s\S]{0,40}Patrimoine transmissible estimé)/i);
  has('scénario tout aux enfants en PP', /Tout aux enfants en pleine propriété/i);
  // 400 000 − abattement restant 50 000 (donation 2021) → 350 000 taxable → 68 194 €
  has('droits exacts 67 894 € (rappel fiscal + art. 775)', /67[\s\u202f\u00a0]?894[\s\u202f\u00a0]?€ de droits/);
  has('ligne Léa avec donation rappelée', /Léa — part 398[\s\u202f\u00a0]?500[\s\u202f\u00a0]?€ · donation de 50[\s\u202f\u00a0]?000[\s\u202f\u00a0]?€ rappelée \(moins de 15 ans\)/i);
  has('leviers : donations 15 ans + AV avant 70 ans', /donations échelonnées tous les 15 ans[\s\S]{0,120}assurance-vie alimentée avant 70 ans/i);
  has('mention notaire', /la liquidation réelle d'une succession relève du notaire/i);
  has('ordre : Situation fiscale AVANT Transmission', (() => { const a = T.search(/SITUATION FISCALE DU FOYER/i), b = T.search(/TRANSMISSION — ET SI UN DÉCÈS/i); return a >= 0 && b >= 0 && a < b; })() ? /./ : /$^/);
  // Bouton détail du calcul → ouvrir et vérifier la décomposition
  await page.locator('button:has-text("détail du calcul")').first().click();
  await page.waitForTimeout(500);
  const TD = await page.evaluate(() => (document.querySelector('.nc-syn-zone')||{innerText:''}).innerText.replace(/[\u202f\u00a0]/g, ' '));
  const hasD = (lbl, re) => console.log((re.test(TD) ? 'OK  ' : 'FAIL') + ' — ' + lbl);
  hasD('détail : part − abattement = base taxable', /part 398 500 € − abattement 50 000 € \(art\. 779 : 100 000 € dont 50 000 € consommés par la donation rappelée\) = base taxable 348 500 €/i);
  hasD('détail : tranche 5 % affichée (403,60 €)', /403,60 €/);
  hasD('détail : tranche 20 % affichée (66 513,60 €)', /66 513,60 €/);
  hasD('détail : total Droits de Léa 67 894,35 €', /Droits de Léa[\s\S]{0,20}67 894,35 €/i);
  await page.screenshot({ path: 'shot_succ.png', fullPage: true });
  await page.evaluate(() => { window.print = () => {}; });
  await page.locator('button:has-text("Enregistrer en PDF")').first().click();
  await page.waitForTimeout(400);
  const hintBtn = page.locator('button:has-text("J\'ai compris")');
  if (await hintBtn.count()) { await hintBtn.first().click(); await page.waitForTimeout(400); }
  await page.pdf({ path: 'export_succ.pdf', format: 'A4', printBackground: true });
  console.log('PDF genere');
  console.log('PAGEERRORS:', errs.length ? errs.join(' || ') : 'aucune');
  await browser.close();
})().catch(e => { console.error('CRASH', e); process.exit(1); });
