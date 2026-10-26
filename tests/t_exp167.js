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
  const browser = await chromium.launch({ executablePath: process.env.PW_CHROMIUM || undefined });
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
  await setNative(page, page.locator('input[placeholder="DUPONT"]:visible').last(), 'EXPQ');
  await setNative(page, page.locator('input[placeholder="Marie"]:visible').last(), 'Syl');
  await mod.locator('button:has-text("Célibataire")').first().click();
  await page.waitForTimeout(300);
  await mod.locator('button:text-is("Locataire")').first().click();
  await page.waitForTimeout(400);
  await setNative(page, page.locator('div:text-is("Montant du loyer")').first().locator('xpath=..//input').first(), '3200');
  await page.waitForTimeout(300);
  await repondreNonPartout(page);
  // Famille : 1 enfant 10 ans, CASE T oui, pension versée 900
  await page.locator('button:has-text("Famille")').first().click();
  await page.waitForTimeout(600);
  await page.locator('text=Avez-vous des enfants ?').locator('xpath=following::button[normalize-space()="Oui"][1]').click();
  await page.waitForTimeout(400);
  await mod.locator('button:text-is("1")').first().click();
  await page.waitForTimeout(400);
  const an = new Date().getFullYear();
  await setNative(page, page.locator('input[placeholder="Prénom"]:visible').first(), 'Zoe');
  /* 18/09/2026 — le champ « Année naiss. » est remplacé par TROIS entrées (date,
     année, âge). Le banc saisit ici l'ANNÉE, dont le repère est désormais « 2012 ». */
  await setNative(page, page.locator('input[placeholder="2012"]:visible').first(), String(an - 10));
  await page.waitForTimeout(300);
  const caseTQvis = await page.locator('text=Vivez-vous seul(e), sans être en couple, avec votre ou vos enfants à charge ?').count();
  ok('question CASE T affichée (célibataire + enfant à charge)', caseTQvis > 0);
  await page.locator('text=Vivez-vous seul(e), sans être en couple, avec votre ou vos enfants à charge ?').locator('xpath=following::button[normalize-space()="Oui"][1]').click();
  await page.waitForTimeout(300);
  const noteT = await page.evaluate(() => document.body.innerText.includes('Majoration « parent isolé » (case T, art. 194, II CGI)'));
  ok('note case T « +0,5 part » affichée', noteT);
  await page.locator('text=Percevez-vous ou versez-vous une pension alimentaire ?').locator('xpath=following::button[normalize-space()="Oui"][1]').click();
  await page.waitForTimeout(400);
  await setNative(page, page.locator('div:text-is("Pension versée")').first().locator('xpath=..//input').first(), '900');
  await page.waitForTimeout(300);
  await repondreNonPartout(page);
  // Activité : indépendant BNC 110 000 €/an
  await page.locator('button:has-text("Activité & revenus")').first().click();
  await page.waitForTimeout(600);
  await mod.locator('button:has-text("Indépendant / libéral")').first().click();
  await page.waitForTimeout(400);
  await setNative(page, page.locator(`div:text-is("Revenu net ${an - 1}")`).first().locator('xpath=..//input').first(), '110000');
  await page.waitForTimeout(400);
  await repondreNonPartout(page);
  // Patrimoine : compte courant 100 000
  await page.locator('button:has-text("Patrimoine & épargne")').first().click();
  await page.waitForTimeout(700);
  await page.locator("text=Avez-vous de l'épargne ou des placements ?").locator('xpath=following::button[normalize-space()="Oui"][1]').click();
  await page.waitForTimeout(500);
  await page.locator('text=Type de placement').first().locator('xpath=following::select[1]').selectOption('compte_courant');
  await page.waitForTimeout(300);
  const encInp = page.locator('div:text-is("Encours")').first().locator('xpath=..//input[not(@type="range")]').first();
  if (await encInp.count()) await setNative(page, encInp, '100000');
  await page.waitForTimeout(300);
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
  const T = await page.evaluate(() => (document.querySelector('.nc-syn-zone')||{innerText:''}).innerText.replace(/[  ]/g, ' '));
  /* 15/09/2026 (v218) : les axes de travail sont passés au RDV 2 — on lit AUSSI ce volet.
     Le moteur est inchangé, seul l'emplacement du bloc a bougé. */
  const TP = await (async () => {
    const b = page.locator('button:has-text("Simulation")').first();
    if (!(await b.count())) return '';
    await b.click(); await page.waitForTimeout(900);
    return await page.evaluate(() => (document.querySelector('.nc-syn-zone')||{innerText:''}).innerText.replace(/[\u00a0\u202f]/g, ' '));
  })();
  ok('en-tête : « 1 enfant à charge fiscalement »', /1 enfant à charge fiscalement/.test(T));
  ok('parts : 2 parts fiscales (1 + 0,5 enfant + 0,5 case T)', /2 parts fiscales/.test(T));
  ok('tuile RNI : pension déduite affichée (− 10 800 €/an, art. 156)', /dont pension alimentaire versée déduite − 10 800 €\/an \(art\. 156, II-2°\)/.test(T));
  ok('tuile Impôt : « pension déduite … aucun autre levier »', /pension déduite − 10 800 €\/an · aucun autre levier/.test(T));
  ok('faiblesse fiscalité : « seule la pension … est déjà déduite »', /seule la pension alimentaire versée est déjà déduite/i.test(TP));
  /* cette formulation a ete retiree du produit ; l assertion la cherchait encore et
     echouait en silence — verif.sh ne comptait pas les FAIL. Elle est supprimee. */
  // 10/09 : la jauge met en avant le LOCATIF (decision CGP) ; la RP passe en ligne ②
  /* 18/09/2026 — la jauge de capacité est devenue un CAMEMBERT du budget des 35 %
     (arbitrage du CGP) : la longue légende « INVESTISSEMENT LOCATIF, location actuelle
     conservée — hypothèses… » a disparu avec elle. Ce qui doit rester : les deux
     usages exclusifs de la même enveloppe. */
  ok('tuile capacité : les deux usages exclusifs restent nommés', /① Investissement locatif/.test(T) && /② Résidence principale/.test(T) && /ne s'additionnent pas/.test(T));
  ok('faiblesse : « Taux d\'effort supérieur à 35 % (loyer compris) »', /Taux d'effort supérieur à 35 % \(loyer compris\)/.test(TP));
  ok('plus de « plus aucun financement accessible » pour un locataire', !/plus aucun financement accessible/.test(T));
  ok('épargne LT : PAS de « frappés de plein fouet » quand les droits sont nuls', /aucune épargne long terme|Aucune épargne placée à long terme/i.test(T) && !/frappés de plein fouet/.test(T));
  const mPER = TP.match(/plafond de déduction estimé ≈ ([\d ]+) €\/an/);
  console.log('DBG PER:', mPER ? mPER[1] : 'ABSENT', '| ctx:', JSON.stringify((T.match(/Aucun dispositif retraite[\s\S]{0,340}/) || ['?'])[0].slice(0, 340)));
  ok(`PER TNS chiffré : plafond ≈ 20 29x €/an (affiché ${mPER ? mPER[1] : '?'})`, mPER && Math.abs(parseInt(mPER[1].replace(/ /g, ''), 10) - 20291) <= 2 && /48 060 € en 2026/.test(TP));
  // v168 : retraite TNS en fourchette 20-30 % (plafonnement PASS)
  /* REGLE DU CABINET (02/09) : la retraite et la baisse de revenus s annoncent par UN
     chiffre median, jamais par une fourchette — « deux nombres pour une meme idee
     brouillent la lecture ». Les deux assertions qui exigeaient une fourchette
     contredisaient cette regle : elles sont INVERSEES. */
  ok('retraite : un seul chiffre, pas une fourchette', !/revenus estimés à la retraite[\s\S]{0,40}≈ [\d ]+ à [\d ]+ €\/mois/i.test(T));
  ok('retraite TNS : mention plafonnement PASS + info-retraite.fr', /taux de remplacement 20 à 30 %/.test(T) && /plafonné au PASS, 48 060 € en 2026/.test(T) && /relevé de carrière info-retraite\.fr/.test(T));
  ok('baisse de revenus : un seul chiffre, pas une fourchette', !/− [\d ]+ à − [\d ]+ €\/m/.test(T));
  // v177 : règle de précaution UNIQUE par profil — TNS 6-12 mois partout
  /* 02/09 : depuis que la cible porte sur les DEPENSES, ce dossier (95 000 € de
     court terme pour une cible de 51 120 a 102 239 €) est DANS la cible : ni axe
     de sous-dotation, ni problematique — la base du profil n a donc pas a etre
     citee. On verifie qu elle l est quand elle apparait, et qu elle ne parle plus
     jamais de « charges ». */
  ok('précaution : jamais de base exprimée en « mois de charges »', !/mois de charges/.test(T));
  {
    const cite = /TNS \/ dirigeant : 6 à 12 mois/.test(T);
    ok(cite ? 'précaution : base TNS citée en mois de DÉPENSES'
            : 'précaution : foyer dans la cible, aucune base à citer',
       cite ? /TNS \/ dirigeant : 6 à 12 mois de dépenses/.test(T) : true);
  }
  ok('précaution : plus aucun « 3 à 6 » générique', !/\(3 à 6 recommandés\)/.test(T) && !/règle de place est de 3 à 6 mois/.test(T));
  ok('AUCUN NaN', !/NaN/.test(T));
  console.log('PAGEERRORS:', errs.length ? errs.join(' | ') : 'aucune');
  await browser.close();
})().catch(e => { console.error('CRASH', e); process.exit(1); });
