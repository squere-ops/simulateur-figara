const { chromium } = require('playwright');

const setNative = async (page, el, value) => {
  await el.evaluate((node, v) => {
    const proto = node.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    const setter = Object.getOwnPropertyDescriptor(proto, 'value').set;
    setter.call(node, v);
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
  console.log('CK accueil');
  await page.locator('button:has-text("Nouveau client")').first().click();
  await page.waitForTimeout(800);
  const modalTxt = await page.evaluate(() => document.body.innerText.slice(0, 4000));
  if (/complet|complète/i.test(modalTxt)) {
    const btn = page.locator('button, [role=button]').filter({ hasText: /complète|complet/i }).first();
    if (await btn.count()) { try { await btn.click({ timeout: 2000 }); } catch (e) {} }
  }
  await page.waitForTimeout(600);
  const mod = page.locator('div.fixed.inset-0').last();

  console.log('CK modal ouvert');
  // ÉTAPE 1 — état civil : UNION LIBRE + conjoint renseigné + locataire
  await setNative(page, page.locator('input[placeholder="DUPONT"]:visible').last(), 'ULTEST');
  await setNative(page, page.locator('input[placeholder="Marie"]:visible').last(), 'Paul');
  const dn = page.locator('input[type="date"]:visible').first();
  if (await dn.count()) await setNative(page, dn, '1984-05-01');
  await setNative(page, page.locator('input[placeholder="06 12 34 56 78"]:visible').last(), '06 99 88 77 66');
  await setNative(page, page.locator('input[placeholder="contact@email.fr"]:visible').last(), 'ul@test.fr');
  await mod.locator('button:has-text("Union libre")').first().click();
  await page.waitForTimeout(400);
  // Renseigner le conjoint ? Oui (ancre exacte — plusieurs groupes Oui/Non dans le modal)
  await page.locator('text=Renseigner le conjoint ?').locator('xpath=following::button[normalize-space()="Oui"][1]').click();
  await page.waitForTimeout(500);
  await mod.locator('button:text-is("Locataire")').first().click();
  await page.waitForTimeout(400);
  const loyerInp = page.locator('div:has(> div:text-is("Montant du loyer")) input').first();
  if (await loyerInp.count()) await setNative(page, loyerInp, '1100');
  await page.waitForTimeout(300);

  console.log('CK etape1 ok');
  // ÉTAPE 3 — activité : salarié 90 000 €/an (Monsieur seul)
  await repondreNonPartout(page);
  await page.locator('button:has-text("Activité & revenus")').first().click();
  await page.waitForTimeout(600);
  const sal = mod.locator('button:has-text("Salarié")').first();
  if (await sal.count()) await sal.click();
  await page.waitForTimeout(500);
  const salInp = page.locator('span:text-is("Salaire fixe")').first().locator('xpath=ancestor::div[2]//input[not(@type="range")]').first();
  if (await salInp.count()) await setNative(page, salInp, '90000');
  await page.waitForTimeout(400);
  // revenus du conjoint : salariée 40 000 €/an — le calcul duo doit scinder
  const cjRev = page.locator('text=/conjoint.*revenus|revenus.*conjoint/i').locator('xpath=following::button[normalize-space()="Oui"][1]');
  if (await cjRev.count()) { try { await cjRev.click({ timeout: 1500 }); await page.waitForTimeout(400);
    const salBtns = page.locator('button:has-text("Salarié")');
    if (await salBtns.count() > 1) { await salBtns.nth(1).click(); await page.waitForTimeout(400); }
    const salInps = page.locator('span:text-is("Salaire fixe")');
    if (await salInps.count() > 1) await setNative(page, salInps.nth(1).locator('xpath=ancestor::div[2]//input[not(@type="range")]').first(), '40000');
  } catch (e) { console.log('conjoint rev: ' + e.message.slice(0, 60)); } }
  await page.waitForTimeout(400);

  console.log('CK etape3 ok');
  // ÉTAPE 4 — fiscalité : encart union libre
  await repondreNonPartout(page);
  await page.locator('button:has-text("Fiscalité")').first().click();
  await page.waitForTimeout(800);
  const t4 = await page.evaluate(() => document.body.innerText);
  const has4 = (lbl, re) => console.log((re.test(t4) ? 'OK  ' : 'FAIL') + ' — ' + lbl);
  has4('encart « Union libre — deux déclarations séparées »', /UNION LIBRE — DEUX DÉCLARATIONS SÉPARÉES/i);
  has4('mention art. 6 CGI', /art\. 6 CGI/);
  has4('tuile Déclaration de Monsieur', /Déclaration de Monsieur/i);
  has4('tuile Déclaration de Madame', /Déclaration de Madame/i);

  /* OPTIMISATION DU RATTACHEMENT (02/09) — le choix change l'impot TOTAL du couple.
     Le bloc doit soit proposer d'optimiser, soit dire que c'est deja optimal, soit
     dire que le rattachement ne change rien : le SILENCE est le seul echec. */
  /* ce dossier type n'a PAS d'enfant : le bloc de rattachement ne doit donc pas
     s'afficher. On ne contrôle l'optimisation que lorsqu'elle a lieu d'être. */
  const aEnfants = /Les enfants sont rattachés à la déclaration/i.test(t4);
  if (!aEnfants) console.log("OK   — pas d'enfant au dossier : aucun rattachement proposé, c'est correct");
  else {
    const optDit = /Optimiser — [\d  ]+ € d'impôt en moins|Rattachement optimal|ne change pas l'impôt du couple/.test(t4);
    console.log((optDit ? 'OK  ' : 'FAIL') + " — le bloc se prononce sur le rattachement le plus favorable");
  }
  if (/Optimiser — /.test(t4)) {
    /* le bouton doit AGIR : apres clic, l'impot total baisse du gain annonce */
    const gainAnnonce = parseInt((t4.match(/Optimiser — ([\d  ]+) €/) || [])[1].replace(/[^\d]/g, ''), 10);
    const avant = await page.evaluate(() => {
      const m = document.body.innerText.match(/Impôt estimé ≈ ([\d  ]+) €/g) || [];
      return m.map(x => parseInt(x.replace(/[^\d]/g, ''), 10)).reduce((a, b) => a + b, 0);
    });
    await page.locator('button:has-text("Optimiser —")').first().click();
    await page.waitForTimeout(700);
    const apres = await page.evaluate(() => {
      const m = document.body.innerText.match(/Impôt estimé ≈ ([\d  ]+) €/g) || [];
      return m.map(x => parseInt(x.replace(/[^\d]/g, ''), 10)).reduce((a, b) => a + b, 0);
    });
    const baisse = avant - apres;
    console.log((Math.abs(baisse - gainAnnonce) <= 2 ? 'OK  ' : 'FAIL')
      + ` — le bouton applique réellement le gain annoncé (${gainAnnonce} € annoncés, ${baisse} € constatés)`);
  }

  // ÉTAPE 6 — objectifs : réflexion séparée + participations distinctes
  await repondreNonPartout(page);
  await page.locator('button:has-text("Objectifs")').first().click();
  await page.waitForTimeout(700);
  const t6a = await page.evaluate(() => document.body.innerText);
  console.log((/réflexion patrimoniale est-elle commune ou chacun de son côté/i.test(t6a) ? 'OK  ' : 'FAIL') + ' — question réflexion visible (union libre)');
  await mod.locator('button:has-text("Chacun de son côté")').first().click();
  await page.waitForTimeout(400);
  const t6b = await page.evaluate(() => document.body.innerText);
  console.log((/Participation de Monsieur/i.test(t6b) && /Participation de Madame/i.test(t6b) ? 'OK  ' : 'FAIL') + ' — deux saisies de participation');
  // Monsieur : 500 – 1 000 (premier bloc), Madame : 100 – 300 (second bloc)
  const blocM = mod.locator('div:has(> div:text-is("Participation de Monsieur"))').last();
  await blocM.locator('button:has-text("500 – 1 000")').first().click();
  await page.waitForTimeout(300);
  const blocF = mod.locator('div:has(> div:text-is("Participation de Madame"))').last();
  await blocF.locator('button:has-text("100 – 300")').first().click();
  await page.waitForTimeout(300);

  // ÉTAPE 7 — profil de risque : UN questionnaire PAR CONCUBIN (v159)
  await repondreNonPartout(page);
  await page.locator('button:has-text("Profil de risque")').first().click();
  await page.waitForTimeout(700);
  const t7 = await page.evaluate(() => document.body.innerText);
  console.log((/Questionnaire de :/.test(t7) ? 'OK  ' : 'FAIL') + ' — sélecteur de personne (union libre)');
  console.log((/Monsieur — à faire/.test(t7) && /Madame — à faire/.test(t7) ? 'OK  ' : 'FAIL') + ' — deux questionnaires distincts, état affiché par personne');
  await page.locator('button:has-text("Madame — à faire")').first().click();
  await page.waitForTimeout(400);
  await mod.locator('button:has-text("Reporter le résultat")').first().click();
  await page.waitForTimeout(500);
  await mod.locator('button:text-is("Équilibré")').first().click();
  await page.waitForTimeout(300);
  await page.locator('text=Note SRI (1 à 7)').locator('xpath=following::button[normalize-space()="4"][1]').click();
  await page.waitForTimeout(400);
  const t7b = await page.evaluate(() => document.body.innerText);
  console.log((/Madame ✓ Équilibré · SRI 4/.test(t7b) ? 'OK  ' : 'FAIL') + ' — badge Madame ✓ Équilibré · SRI 4');
  console.log((/Monsieur — à faire/.test(t7b) ? 'OK  ' : 'FAIL') + ' — questionnaire de Monsieur indépendant (toujours à faire)');

  // ÉTAPE 8 — synthèse
  await repondreNonPartout(page);
  await page.locator('button:has-text("Synthèse")').first().click();
  await page.waitForTimeout(900);
  if (await page.evaluate(() => /un instant/i.test(document.body.innerText))) {
    const val = page.locator('button:has-text("Valider")').first();
    if (await val.count()) await val.click();
    else await page.locator('text=passer quand même').first().click();
    await page.waitForTimeout(900);
  }
  await page.waitForTimeout(1200);
  const txt = await page.evaluate(() => document.querySelector('.nc-syn-zone') ? document.querySelector('.nc-syn-zone').innerText : 'PAS DE SYNTHESE');
  const T = txt.replace(/ | /g, ' ');
  const has = (lbl, re) => console.log((re.test(T) ? 'OK  ' : 'FAIL') + ' — ' + lbl);
  has('identité : deux déclarations fiscales séparées', /deux déclarations fiscales séparées/i);
  has('ligne Réflexion patrimoniale — chacun de son côté', /Réflexion patrimoniale[\s\S]{0,40}chacun de son côté/i);
  has('carte fiscale duo (union libre)', /deux déclarations séparées \(union libre\)/i);
  has('note art. 6 CGI en synthèse', /art\. 6 CGI/);
  has('participation Monsieur 500 à 1 000', /Participation de Monsieur[\s\S]{0,60}500 à 1 000 €\/mois/i);
  has('participation Madame 100 à 300', /Participation de Madame[\s\S]{0,60}100 à 300 €\/mois/i);
  has('répartition impôt Monsieur/Madame', /Monsieur [\d\s]+€ · Madame [\d\s]+€/);
  has('carte profil de risque PAR PERSONNE (union libre)', /un questionnaire par personne \(union libre\)/i);
  has('Madame Équilibré · Monsieur non réalisé', (/Équilibré/.test(T) && /questionnaire non réalisé — à proposer/.test(T)) ? /./ : /$^/);

  await page.screenshot({ path: 'shot_ul.png', fullPage: true });
  // Export PDF réel
  await page.evaluate(() => { window.print = () => {}; });
  await page.locator('button:has-text("Enregistrer en PDF")').first().click();
  await page.waitForTimeout(400);
  const hintBtn = page.locator('button:has-text("J\'ai compris")');
  if (await hintBtn.count()) { await hintBtn.first().click(); await page.waitForTimeout(400); }
  await page.pdf({ path: 'export_ul.pdf', format: 'A4', printBackground: true });
  console.log('PDF genere');
  console.log('PAGEERRORS:', errs.length ? errs.join(' || ') : 'aucune');
  const clipOf = async (txt) => await page.evaluate((t) => {
    const els = [...document.querySelectorAll('.nc-syn-zone div')];
    const el = els.find(e => e.textContent.includes(t) && e.getBoundingClientRect().height < 900 && e.getBoundingClientRect().height > 60);
    if (!el) return null;
    el.scrollIntoView({ block: 'center' });
    const r = el.getBoundingClientRect();
    return { x: Math.max(0, r.x - 8), y: Math.max(0, r.y - 8), width: Math.min(1380, r.width + 16), height: Math.min(880, r.height + 16) };
  }, txt);
  const c1 = await clipOf('Vos placements — état des lieux');
  if (c1) await page.screenshot({ path: 'shot_v162_ul_plac.png', clip: c1 });
  console.log('SHOT', !!c1);
  await browser.close();
})().catch(e => { console.error('CRASH', e); process.exit(1); });
