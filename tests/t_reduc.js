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
  // Règle v152 : aucune question sans réponse ne laisse passer — le test répond
  // « Non » à toutes les questions encore ouvertes de la page avant de naviguer.
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

  // Étape 1 minimal
  await setNative(page, page.locator('input[placeholder="DUPONT"]:visible').last(), 'REDUCTEST');
  await setNative(page, page.locator('input[placeholder="Marie"]:visible').last(), 'Rita');
  await mod.locator('button:has-text("Célibataire")').first().click();
  await page.waitForTimeout(300);
  await mod.locator('button:text-is("Locataire")').first().click();
  await page.waitForTimeout(300);

  // Étape 3 : salarié 90 000 €/an
  await repondreNonPartout(page);
  await page.locator('button:has-text("Activité & revenus")').first().click();
  await page.waitForTimeout(600);
  await mod.locator('button:has-text("Salarié")').first().click();
  await page.waitForTimeout(400);
  await setNative(page, page.locator('span:text-is("Salaire fixe")').first().locator('xpath=ancestor::div[2]//input[not(@type="range")]').first(), '90000');
  await page.waitForTimeout(400);

  // Étape 4 : fiscalité — réductions
  await repondreNonPartout(page);
  await page.locator('button:has-text("Fiscalité")').first().click();
  await page.waitForTimeout(700);
  const impotAvant = await page.evaluate(() => {
    const m2 = document.body.innerText.match(/Impôt net à payer[\s\S]{0,160}?([\d\s\u202f\u00a0]{2,12})€/);
    return m2 ? m2[1].replace(/[^0-9]/g, '') : null;
  });
  console.log('IMPOT AVANT:', impotAvant);
  // Bénéficiez-vous de réductions ? Oui
  await page.locator('text=Bénéficiez-vous de réductions ou crédits d\'impôt ?').locator('xpath=following::button[normalize-space()="Oui"][1]').click();
  await page.waitForTimeout(500);
  // + Ajouter une réduction — ligne 1 : PER
  await mod.locator('button:has-text("Ajouter une réduction d\'impôt")').first().click();
  await page.waitForTimeout(400);
  await mod.locator('button:text-is("PER")').last().click();
  await page.waitForTimeout(400);
  // Bloc « PER en place » : versements 100 €/mois
  await page.locator('text=Versez-vous chaque mois ?').locator('xpath=following::button[normalize-space()="Oui"][1]').click();
  await page.waitForTimeout(400);
  const perInp = page.locator('text=Combien ?').locator('xpath=following::input[not(@type="range")][1]').first();
  await setNative(page, perInp, '100');
  await page.waitForTimeout(600);

  let t4 = await page.evaluate(() => document.body.innerText.replace(/[  ]/g, ' '));
  const has = (lbl, re, txt) => console.log((re.test(txt) ? 'OK  ' : 'FAIL') + ' — ' + lbl);
  has('PER auto : 1 200 €/an déduits', /Déduction de 1 200 €\/an du revenu imposable/, t4);
  has('économie = TMI × 1 200 affichée', /économie d'impôt ≈\s*\d[\d ]* €\/an \(1 200 € × TMI \d+ %\)/, t4);
  has('mention reprise auto des versements', /repris automatiquement des versements PER \(100 €\/mois × 12\)/, t4);
  has('total : 1 200 € déduits du revenu', /1 200 € déduits du revenu/, t4);

  // Ligne 2 : Dons 500 €/an
  await mod.locator('button:has-text("Ajouter une réduction d\'impôt")').first().click();
  await page.waitForTimeout(400);
  await mod.locator('button:text-is("Dons")').last().click();
  await page.waitForTimeout(400);
  await setNative(page, page.locator('text=Réduction / avantage n°2').locator('xpath=following::input[not(@type="range")][1]').first(), '500');
  await page.waitForTimeout(600);

  t4 = await page.evaluate(() => document.body.innerText.replace(/[  ]/g, ' '));
  has('2e ligne : − 500 € retranchés', /− 500 € retranchés de l'impôt chaque année/, t4);
  has('total : 500 € retranchés de l\'impôt', /500 € retranchés de l'impôt/, t4);
  has('bouton toujours présent (en ajouter une autre)', /\+ Ajouter une réduction d'impôt/, t4);

  const impotApres = await page.evaluate(() => {
    const m2 = document.body.innerText.match(/Impôt net à payer[\s\S]{0,160}?([\d\s\u202f\u00a0]{2,12})€/);
    return m2 ? m2[1].replace(/[^0-9]/g, '') : null;
  });
  console.log('IMPOT APRES:', impotApres);
  // 17 404 € (81 000 € / 1 part) − 360 € (PER 1 200 × TMI 30 %) − 500 € (dons) = 16 544 €
  console.log((impotApres === '16544' ? 'OK  ' : 'FAIL') + ` — impôt recalculé immédiatement : ${impotApres} € (attendu 16 544 = 17 404 − 360 − 500)`);

  // ÉTAPE 5 : le PER déclaré en fiscalité doit ressortir — rappel + reprise 1 clic
  await repondreNonPartout(page);
  await page.locator('button:has-text("Patrimoine & épargne")').first().click();
  await page.waitForTimeout(600);
  await page.locator("text=Avez-vous de l'épargne ou des placements ?").locator('xpath=following::button[normalize-space()="Oui"][1]').click();
  await page.waitForTimeout(500);
  let t5 = await page.evaluate(() => document.body.innerText);
  has('rappel PER déclaré en fiscalité (étape 5)', /Un PER a été déclaré à l'étape Fiscalité/, t5);
  await mod.locator('button:has-text("Reprendre ce PER ici")').first().click();
  await page.waitForTimeout(500);
  t5 = await page.evaluate(() => document.body.innerText);
  console.log((!/Un PER a été déclaré à l'étape Fiscalité/.test(t5) ? 'OK  ' : 'FAIL') + ' — rappel disparu après reprise (avoir PER créé)');
  // v152 : le versement n'est plus demandé une 2e fois — affiché en lecture seule
  console.log((/déjà renseigné à l'étape Fiscalité — se modifie là-bas/.test(t5) ? 'OK  ' : 'FAIL') + ' — versement PER en lecture seule dans le placement (plus de double question)');
  console.log((/100 €\/mois/.test(t5.replace(/[\u202f\u00a0]/g,' ')) ? 'OK  ' : 'FAIL') + ' — montant 100 €/mois repris affiché');
  // SYNTHÈSE : ligne PER de facto tant que l'encours n'est pas saisi
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
  await page.waitForTimeout(1000);
  const TS = await page.evaluate(() => document.querySelector('.nc-syn-zone') ? document.querySelector('.nc-syn-zone').innerText : '');
  has('ligne PER (déclaré en fiscalité) dans les placements', /PER \(déclaré en fiscalité\)/, TS);
  has('encours « à compléter »', /à compléter/, TS);
  has('badge déclaré en fiscalité — 100 €/mois versés', /déclaré en fiscalité — 100 €\/mois versés/, TS);
  await page.screenshot({ path: 'shot_reduc.png', fullPage: false });
  console.log('PAGEERRORS:', errs.length ? errs.join(' || ') : 'aucune');
  await browser.close();
})().catch(e => { console.error('CRASH', e); process.exit(1); });
