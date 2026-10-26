// Reproduction du dossier TEST Jean (couple, RP + maison Bretagne NP, 2 AV, crédit auto)
// puis vérification VISUELLE (Tailwind réel) + export PDF page par page.
const { chromium } = require('playwright');
const { passerFenetres } = require('./_aide');
const setN = async (el, v) => el.evaluate((n, val) => { const s = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set; s.call(n, val); n.dispatchEvent(new Event('input', { bubbles: true })); }, v);

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
  const page = await browser.newPage({ viewport: { width: 1440, height: 950 } });
  const errs = [];
  page.on('pageerror', e => { if (!/tailwind is not defined/.test(String(e))) errs.push(String(e)); });
  page.on('console', m => { if (m.type()==='error') console.log('CONSOLE.ERROR:', m.text().slice(0,600)); });
  await page.goto((process.env.PW_PAGE || 'http://localhost:8899/test_local.html') + '?etude=1', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  if (await page.locator('text=Accéder au simulateur').count()) {
    const inps = page.locator('input');
    await setN(inps.nth(0), 'UP'); await setN(inps.nth(1), 'T');
    await page.locator('button:has-text("Accéder au simulateur")').first().click();
    await page.waitForTimeout(1000);
  }
  await page.locator('button:has-text("Nouveau client")').first().click();
  await page.waitForTimeout(700);
  const mt = await page.evaluate(() => document.body.innerText.slice(0, 4000));
  if (/complet|complète/i.test(mt)) {
    const b = page.locator('button, [role=button]').filter({ hasText: /complète|complet/i }).first();
    if (await b.count()) { try { await b.click({ timeout: 2000 }); } catch (e) {} }
  }
  const chkModal = async (tag) => {
    const open = await page.evaluate(() => !!document.querySelector('.nc-syn-zone') || /étape \d \/ 7/i.test(document.body.innerText) || document.body.innerText.includes('État civil'));
    console.log('CHK', tag, 'modal:', open);
    if (!open) { await page.screenshot({ path: '/tmp/dbg_' + tag + '.png' }); }
  };
  await page.waitForTimeout(500);
  await chkModal('avant_e1');

  // ÉTAPE 1 — état civil, couple marié, adresse, coordonnées, RP propriétaire
  await setN(page.locator('input[placeholder="DUPONT"]:visible').last(), 'TEST');
  await setN(page.locator('input[placeholder="Marie"]:visible').last(), 'Jean');
  await setN(page.locator('input[type="date"]:visible').first(), '1980-03-01');
  await setN(page.locator('input[placeholder="06 12 34 56 78"]:visible').last(), '0677688994');
  await setN(page.locator('input[placeholder="contact@email.fr"]:visible').last(), 'jean@test.com');
  await page.locator('button:has-text("Marié")').first().click();
  await page.waitForTimeout(400);
  // régime séparation si proposé
  const sep = page.locator('button:has-text("Séparation de biens"), option:has-text("Séparation")');
  try {
    const selReg = page.locator('select').filter({ has: page.locator('option[value="separation"]') }).first();
    if (await selReg.count()) await selReg.selectOption('separation');
    else {
      const bSep = page.locator('div.fixed.inset-0').last().locator('button:has-text("Séparation de biens")').first();
      if (await bSep.count()) { await bSep.click({ timeout: 1500 }); await page.waitForTimeout(300); }
    }
  } catch (e) {}
  // conjoint : répondre Oui à « Renseigner le conjoint ? » puis remplir
  const cjQ = page.locator('text=Renseigner le conjoint ?').locator('xpath=following::button[normalize-space()="Oui"][1]');
  if (await cjQ.count()) { await cjQ.click(); await page.waitForTimeout(400); }
  const cj = page.locator('input[placeholder="Jean"]:visible');
  if (await cj.count()) await setN(cj.last(), 'Jeanine');
  const dates = page.locator('input[type="date"]:visible');
  if (await dates.count() > 1) await setN(dates.nth(1), '1981-05-01');
  // 11/09 : téléphone et email du conjoint (les seconds champs de ce placeholder)
  const telCj = page.locator('div:has-text("Téléphone du conjoint")').last().locator('xpath=following::input[1]');
  console.log('champ tel conjoint:', await telCj.count());
  if (await telCj.count()) await setN(telCj.first(), '0611223344');
  const mailCj = page.locator('div:has-text("Email du conjoint")').last().locator('xpath=following::input[1]');
  if (await mailCj.count()) await setN(mailCj.first(), 'jeanine@test.com');
  // adresse
  const adrQ = page.locator("text=Renseigner l'adresse ?").locator('xpath=following::button[normalize-space()="Oui"][1]');
  if (await adrQ.count()) { await adrQ.click(); await page.waitForTimeout(300);
    await setN(page.locator('input[placeholder="212 av. de la Division Leclerc"]:visible').first(), '212 Avenue de la tuape');
    await setN(page.locator('input[placeholder="Code postal"]:visible').first(), '75016');
    await page.waitForTimeout(600);
  }
  // logement propriétaire
  await page.locator('button:text-is("Propriétaire")').first().click();
  await page.waitForTimeout(400);
  // valeur RP 700k via slider proche
  const rngRP = page.locator('input[type="range"]').first();
  if (await rngRP.count()) await setN(rngRP, '700000');
  // crédit RP oui
  const credQ = page.locator('text=Un crédit est-il en cours sur ce bien ?').locator('xpath=following::button[normalize-space()="Oui"][1]');
  if (await credQ.count()) { try { await credQ.first().click({ timeout: 2000 }); await page.waitForTimeout(700); } catch (e) { console.log('credQ: ' + e.message.slice(0, 60)); } }
  else console.log('credQ : question introuvable');

  // ── 15/09/2026 : on laisse le dossier DANS L'IGNORANCE, volontairement ──
  //    quotité d'assurance du crédit RP → « Je ne sais pas »
  await page.waitForTimeout(500);
  const rq0 = await page.evaluate(() => {
    const tous = Array.from(document.querySelectorAll('select'));
    window.__dbgSelects = tous.map(s => (s.offsetParent ? 'VIS' : 'CACHE') + ':' + Array.from(s.options).map(o => o.value).join(','));
    window.__dbgLabels = Array.from(document.querySelectorAll('div,span')).filter(e => /Assurance — quotités|Assurance de prêt renégociée/i.test(e.textContent || '') && e.children.length === 0).map(e => e.textContent.trim());
    const sels = tous.filter(s => s.offsetParent !== null
      && Array.from(s.options).some(o => o.value === '100_100'));
    if (!sels.length) return 'aucun select quotite';
    const s = sels[0];
    const lib = (Array.from(s.options).find(o => o.value === 'nsp') || {}).text || '(absent)';
    const setter = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set;
    setter.call(s, 'nsp');
    s.dispatchEvent(new Event('change', { bubbles: true }));
    return 'ok · libellé = ' + lib;
  });
  console.log('QUOTITE:', rq0);
  console.log('DBG selects:', JSON.stringify(await page.evaluate(() => (window.__dbgSelects || []).slice(0, 12))));
  console.log('DBG labels:', JSON.stringify(await page.evaluate(() => window.__dbgLabels || [])));
  await page.waitForTimeout(400);
  //    assurance de prêt renégociée → « Je ne sais pas »
  const ra0 = await page.evaluate(() => {
    const lab = Array.from(document.querySelectorAll('span')).find(e => /Assurance de prêt renégociée/i.test(e.textContent || ''));
    if (!lab) return 'libellé introuvable';
    const zone = lab.parentElement;
    const b = Array.from(zone.querySelectorAll('button')).find(x => /(je )?ne sai[st] pas/i.test(x.textContent || ''));
    if (!b) return 'bouton absent : ' + Array.from(zone.querySelectorAll('button')).map(x => x.textContent.trim()).join(' | ');
    b.click();
    return 'ok';
  });
  console.log('ASSURANCE PRET:', ra0);
  await page.waitForTimeout(400);

  await chkModal('apres_e1');
  /* ÉTAPE 2 — Famille : DEUX ENFANTS. 17/09/2026 — ils sont désormais réellement
     saisis : le commentaire annonçait deux enfants, le banc répondait « Non » à
     toutes les questions et le dossier n'en avait aucun. Sans enfant, impossible de
     contrôler la question de transmission (article 990 I). */
  await repondreNonPartout(page);
  await page.locator('button:has-text("Famille")').first().click();
  await page.waitForTimeout(600);
  {
    const q = page.locator('text=Avez-vous des enfants ?');
    if (await q.count()) {
      await q.locator('xpath=following::button[normalize-space()="Oui"][1]').click();
      await page.waitForTimeout(400);
      const mod0 = page.locator('div.fixed.inset-0').last();
      const b2 = mod0.locator('button:text-is("2")').first();
      if (await b2.count()) { await b2.click(); await page.waitForTimeout(500); }
      const an0 = new Date().getFullYear();
      const pren = page.locator('input[placeholder="Prénom"]:visible');
      /* 18/09/2026 — TROIS FAÇONS DE RENSEIGNER LA NAISSANCE. Le banc en exerce DEUX :
         le premier enfant par sa DATE COMPLÈTE (âge exact au jour près), le second par
         son ÂGE (converti en année de naissance). Les deux doivent remonter dans la
         synthèse. */
      const dates = page.locator('input[type="date"]:visible');
      const annes = page.locator('input[placeholder="2012"]:visible');
      const ages = page.locator('input[placeholder="14"]:visible');
      if (await pren.count() > 0) {
        await setN(pren.nth(0), 'Lea');
        const nbD = await dates.count();
        await setN(dates.nth(nbD - 2 >= 0 ? nbD - 2 : 0), String(an0 - 13) + '-01-15');
      }
      if (await pren.count() > 1) {
        await setN(pren.nth(1), 'Tom');
        await setN(ages.nth(1), '10');
      }
      await page.waitForTimeout(500);
      const lusEnf = await page.evaluate(() => Array.from(document.querySelectorAll('input[placeholder="2012"]')).map(i => i.value));
      console.log('ANNEES DEDUITES:', JSON.stringify(lusEnf));
    }
  }
  await repondreNonPartout(page);
  await page.waitForTimeout(300);

  // ÉTAPE 3 — Activité & revenus : M. salarié 145k/an, Mme salariée 175k/an
  await repondreNonPartout(page);
  await page.locator('button:has-text("Activité & revenus")').first().click();
  await page.waitForTimeout(600);
  await page.locator('button:has-text("Salarié")').first().click();
  await page.waitForTimeout(400);
  await setN(page.locator('span:text-is("Salaire fixe")').locator('xpath=ancestor::div[2]//input[not(@type="range")]').first(), '145000');
  // conjoint a-t-il des revenus ? Oui
  const cjRev = page.locator('text=/conjoint.*revenus|revenus.*conjoint/i').locator('xpath=following::button[normalize-space()="Oui"][1]');
  if (await cjRev.count()) { try { await cjRev.click({ timeout: 1500 }); await page.waitForTimeout(400);
    const salBtns = page.locator('button:has-text("Salarié")');
    if (await salBtns.count() > 1) { await salBtns.nth(1).click(); await page.waitForTimeout(400); }
    const salInps = page.locator('span:text-is("Salaire fixe")');
    if (await salInps.count() > 1) await setN(salInps.nth(1).locator('xpath=ancestor::div[2]//input[not(@type="range")]').first(), '175000');
  } catch (e) { console.log('conjoint rev: ' + e.message.slice(0, 60)); } }

  await chkModal('apres_e3');
  // ÉTAPE 5 — Patrimoine : maison Bretagne NP 550k, crédit auto fin 2027, livret + 2 AV
  await repondreNonPartout(page);
  await page.locator('button:has-text("Patrimoine & épargne")').first().click();
  await page.waitForTimeout(600);
  await page.locator("text=Possédez-vous d'autres biens immobiliers").locator('xpath=following::button[normalize-space()="Oui"][1]').click();
  await page.waitForTimeout(500);
  await setN(page.locator('input[placeholder="Nom libre (ex. terrain à Melun)"]').first(), 'maison Bretagne');
  const selDet = page.locator('select').filter({ has: page.locator('option[value="nue_propriete"]') }).first();
  await selDet.selectOption('nue_propriete');
  await page.waitForTimeout(300);
  // v132 : saisie par le CHAMP LIBRE (plus par le curseur) + détenteur Madame
  await setN(page.locator('text=Valeur de la nue-propriété détenue').locator('xpath=following::input[not(@type="range")][1]').first(), '550000');
  const selTit = page.locator('select').filter({ has: page.locator('option:text-is("Commun / indivision")') }).first();
  if (await selTit.count()) await selTit.selectOption('conjoint');
  await page.waitForTimeout(300);
  // crédit auto
  await page.locator("text=Avez-vous d'autres crédits en cours").locator('xpath=following::button[normalize-space()="Oui"][1]').click();
  await page.waitForTimeout(400);
  await page.locator('button:text-is("Auto")').first().click();
  await setN(page.locator('text=Mensualité').locator('xpath=following::input[@type="range"][1]').first(), '350');
  const selMois = page.locator('select').filter({ has: page.locator('option:text-is("juin")') }).first();
  await selMois.selectOption({ label: 'juin' });
  const selAn = page.locator('select').filter({ has: page.locator('option:text-is("2027")') }).first();
  await selAn.selectOption('2027');
  // épargne : livret A (défaut livrets) + 2 AV
  await page.locator("text=Avez-vous de l'épargne ou des placements ?").locator('xpath=following::button[normalize-space()="Oui"][1]').click();
  await page.waitForTimeout(500);
  await setN(page.locator('input[type="range"]').last(), '22500');
  // AV 1
  await page.locator('button:has-text("Ajouter un avoir")').first().click();
  await page.waitForTimeout(400);
  let selT = page.locator('select').filter({ has: page.locator('option[value="av"]') }).last();
  await selT.selectOption('av');
  await page.waitForTimeout(300);
  await setN(page.locator('input[type="range"]').last(), '70000');
  // AV 2
  await page.locator('button:has-text("Ajouter un avoir")').first().click();
  await page.waitForTimeout(400);
  selT = page.locator('select').filter({ has: page.locator('option[value="av"]') }).last();
  await selT.selectOption('av');
  await page.waitForTimeout(300);
  await setN(page.locator('input[type="range"]').last(), '90000');
  await page.waitForTimeout(300);

  await chkModal('apres_e5');
  // ÉTAPE 7 — synthèse
  await repondreNonPartout(page);
  await page.locator('button:has-text("Synthèse")').first().click();
  await passerFenetres(page);
  await page.waitForTimeout(900);
  console.log('APRES SYN CLICK:', (await page.evaluate(() => document.body.innerText.slice(-900))).replace(/\n+/g, ' | '));
  if (await page.evaluate(() => /un instant/i.test(document.body.innerText))) {
    await page.locator('button:has-text("500 – 1 000")').first().click();
    await page.waitForTimeout(200);
    await page.locator('button:has-text("Valider")').first().click();
    await page.waitForTimeout(800);
  }
  await page.waitForTimeout(1500);

  await page.screenshot({ path: '/tmp/dbg_syn.png', fullPage: false });
  console.log('ETAT:', (await page.evaluate(() => document.body.innerText.slice(0, 600))).replace(/\n+/g, ' | '));

  /* ═══════════════════════════════════════════════════════════════════════
     DEVOIRS DU CLIENT — la liste doit suivre CE QUE LE DOSSIER NE SAIT PAS.
     Dossier : couple marié propriétaire avec crédit RP. On laisse
     volontairement la quotité d'assurance et l'assurance de prêt sur
     « je ne sais pas », et le rendement du placement inconnu.
     ═══════════════════════════════════════════════════════════════════════ */
  let ko = 0;
  const OK = (m) => console.log('OK   — ' + m);
  const KO = (m) => { ko++; console.log('FAIL — ' + m); };
  const chk = (c, m) => (c ? OK(m) : KO(m));
  const zoneTxt = () => page.evaluate(() => (document.querySelector('.nc-syn-zone') || { innerText: '' }).innerText.replace(/[  ]/g, ' '));

  const T1 = await zoneTxt();
  console.log('\n=== DEVOIRS, DOSSIER AVEC TROIS INCONNUES ===');
  console.log(T1.split('Pour préparer notre prochain rendez-vous')[1] ? T1.split('Pour préparer notre prochain rendez-vous')[1].slice(0, 900).replace(/\n+/g, ' | ') : 'BLOC ABSENT');
  chk(/Pour préparer notre prochain rendez-vous/i.test(T1), 'le bloc des devoirs est présent');
  chk(/(je )?ne sai[st] pas/i.test(String(rq0)), "l'option de quotité s'intitule « Ne sait pas » (libellé retenu le 26/10/2026 ; lu : " + rq0 + ')');
  chk(ra0 === 'ok', "« Assurance de prêt renégociée ? » propose « Ne sait pas »");
  chk(/quotités de votre assurance de prêt/i.test(T1), 'la quotité inconnue ressort dans les devoirs');
  chk(/conditions particulières|certificat d'adhésion/i.test(T1), 'la pièce demandée pour la quotité est nommée');
  chk(/Tableau d'amortissement et offre de prêt/i.test(T1), "l'assurance de prêt inconnue demande le tableau d'amortissement et l'offre de prêt");
  chk(/simulation chiffrée de votre assurance emprunteur/i.test(T1), 'le devoir dit à quoi servent ces pièces');
  chk(/relevé de situation de vos contrats/i.test(T1), 'le placement sans rendement connu demande son relevé de situation');
  chk(/estimation de retraite/i.test(T1) && /Mon épargne retraite/i.test(T1), 'les deux devoirs retraite restent en tête');

  /* ── PREUVE QUE LE BANC SAIT ÉCHOUER : on renseigne la quotité, ce devoir-là
       doit DISPARAÎTRE, les autres rester. ── */
  const mod2 = page.locator('div.fixed.inset-0').last();
  { const b = mod2.locator('button:has-text("État civil")').first(); if (await b.count()) { await b.click(); await page.waitForTimeout(900); } }
  const rq1 = await page.evaluate(() => {
    const sels = Array.from(document.querySelectorAll('select')).filter(s => s.offsetParent !== null
      && Array.from(s.options).some(o => o.value === '100_100'));
    if (!sels.length) return 'aucun select quotite';
    const s = sels[0];
    const setter = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set;
    setter.call(s, '100_100');
    s.dispatchEvent(new Event('change', { bubbles: true }));
    return 'ok';
  });
  console.log('QUOTITE renseignée:', rq1);
  await page.waitForTimeout(600);
  { const b = mod2.locator('button:has-text("Synthèse")').first(); if (await b.count()) { await b.click(); await passerFenetres(page); await page.waitForTimeout(1500); } }
  const T2 = await zoneTxt();
  chk(rq1 === 'ok' && !/quotités de votre assurance de prêt/i.test(T2), 'AUTO-TEST : quotité renseignée → ce devoir disparaît');
  chk(/Tableau d'amortissement et offre de prêt/i.test(T2), "le devoir de l'assurance de prêt, lui, reste");

  /* ═══ LES QUESTIONS DU PROCHAIN RENDEZ-VOUS (17/09/2026, règles du CGP) ═══
     Ce dossier compte DEUX ENFANTS : la question de transmission doit sortir, avec
     l'abattement de l'article 990 I calculé sur le dossier (152 500 € par
     bénéficiaire, soit 305 000 €). On vérifie aussi la règle de fond : aucune
     question d'investissement si le client ne peut pas emprunter. */
  /* innerText applique text-transform : le titre sort en MAJUSCULES. On découpe donc
     avec une expression régulière insensible à la casse. */
  const blocQ = ((T2.split(/(^|\n)les questions[ \t]*\n/i).slice(-1)[0] || '').split(/pour préparer/i)[0] || '');
  console.log('\n=== QUESTIONS ===\n' + blocQ.trim().replace(/\n+/g, ' | ').slice(0, 1200));
  /* ═══ LES NOTES PRÉCÈDENT LES QUESTIONS (18/09/2026, CGP) ═══
     « Peux-tu mettre les notes qui sont prises au-dessus des questions ? » Contrôle
     de POSITION : on compare les deux repères dans l'ordre de lecture du document. */
  const posNotes = await page.evaluate(() => {
    const z = document.querySelector('.nc-syn-zone');
    if (!z) return { err: 'zone absente' };
    const t = z.innerText;
    return { notes: t.search(/notes du rendez-vous/i), questions: t.search(/(^|\n)les questions[ \t]*\n/i) };
  });
  console.log('ORDRE NOTES/QUESTIONS:', JSON.stringify(posNotes));
  if (posNotes.notes === -1) {
    console.log("INFO — ce dossier n'a pas de notes saisies : contrôle de position non applicable");
  } else {
    chk(posNotes.questions > posNotes.notes, 'les notes du rendez-vous sont placées AU-DESSUS des questions');
  }

  /* ═══ AUCUN DÉBORDEMENT HORIZONTAL (18/09/2026) ═══
     Ce dossier porte un crédit auto qui se termine sous 24 mois : il produit la ligne
     « Note » de « Autres crédits », une phrase entière dans une colonne de chiffres.
     En `nowrap` elle débordait, et Chrome mettait alors TOUTE LA PAGE à l'échelle —
     le document sortait rétréci d'un tiers. Le contrôle mesure le débordement réel. */
  const debordZ = await page.evaluate(() => {
    const z = document.querySelector('.nc-syn-zone');
    if (!z) return { pire: 0, err: 'zone absente' };
    const base = z.getBoundingClientRect();
    let pire = 0, coupable = '';
    z.querySelectorAll('*').forEach(n => {
      const r = n.getBoundingClientRect();
      const dd = Math.round(r.right - base.right);
      if (dd > pire) { pire = dd; coupable = (n.textContent || '').trim().slice(0, 70); }
    });
    return { pire, coupable, note: /se termine sous 24 mois/i.test(z.innerText) };
  });
  console.log('DEBORDEMENT:', JSON.stringify(debordZ));
  chk(debordZ.note === true, "la ligne « Note » du crédit qui se termine est bien présente (sinon le contrôle ne prouve rien)");
  /* 18/09/2026 (CGP) : « supprime dans la note l'allusion à la VEFA ». La demande
     porte sur le bloc « Logement, immobilier & crédits » — le contrôle y est donc
     borné. La même règle cabinet est rappelée ailleurs, sous le compteur du taux
     d'endettement, où l'allusion subsiste : à trancher avec le CGP. */
  const blocLog = (T2.split(/logement, immobilier & crédits/i)[1] || '').split(/vos placements/i)[0] || '';
  chk(blocLog.length > 20, "le bloc « Logement, immobilier & crédits » a bien été isolé pour le contrôle");
  chk(!/VEFA/i.test(blocLog), "la note du crédit qui se termine ne parle plus de VEFA");
  chk(debordZ.pire <= 2, "aucun débordement horizontal — lu : " + debordZ.pire + " px (" + debordZ.coupable + ")");

  /* les deux âges doivent remonter dans « Votre foyer », quelle que soit la façon
     dont la naissance a été renseignée. */
  /* 18/09/2026 — la DATE elle-même doit ressortir dans l'analyse : « quel intérêt de
     la renseigner si tu ne la reprends pas ? » (CGP). On exige donc la date ET l'âge. */
  const anLea = new Date().getFullYear() - 13;
  chk(new RegExp('Lea\\s*—\\s*15/01/' + anLea + ',\\s*13\\s*ans', 'i').test(T2),
      "l'enfant saisi par sa DATE DE NAISSANCE ressort AVEC sa date (15/01/" + anLea + ") et son âge exact (13 ans)");
  chk(/Tom,\s*10\s*ans/i.test(T2), "l'enfant saisi par son ÂGE remonte à 10 ans, sans date inventée");
  chk(!/Tom\s*—\s*\d{2}\/\d{2}\/\d{4}/.test(T2), "aucune date n'est inventée pour l'enfant saisi par son âge");
  chk(/990\s*I/i.test(blocQ), "la question de transmission cite l'article 990 I du CGI");
  /* 18/09/2026 — le montant n'est plus multiplié par le nombre d'enfants : l'abattement
     vaut 152 500 € PAR BÉNÉFICIAIRE, et c'est ainsi que le CGP le dit en rendez-vous. */
  /* 18/09/2026 — tournures RACCOURCIES par le CGP : l'article 990 I se pose seul, et
     la question fiscale n'est plus qu'un chiffre jeté sur la table. */
  chk(/Connaissez-vous l'article 990 I du code général des impôts \?/i.test(blocQ),
      "la question de transmission est posée seule : « Connaissez-vous l'article 990 I… ? »");
  chk(/Que vous évoque le chiffre de [\d\s\u00a0\u202f]+€/i.test(blocQ),
      "la question fiscale est réduite au chiffre : « Que vous évoque le chiffre de X € ? »");
  chk(/En cas de décès, sans (testament|donation au dernier vivant|disposition)/i.test(blocQ),
      "la question de protection pose la CONDITION d'abord");
  chk(/Dans \d+ ans, vous aurez \d+ ans/i.test(blocQ) || !/à environ/.test(blocQ),
      "la question retraite annonce l'échéance avant l'âge");
  chk(/Si la banque vous faisait un prêt d'environ/i.test(blocQ), "la question de levier demande dans quoi il investirait");
  /* la question bonus : le taux annoncé EST la TMI du foyer, jamais un taux générique. */
  const tmiLu = (blocQ.match(/rendement de (\d+)\s*% garanti par l'État/i) || [])[1];
  const tmiDoc = (T2.match(/TRANCHE MARGINALE[\s\S]{0,40}?(\d+)\s*%/i) || [])[1];
  console.log('BONUS TMI:', JSON.stringify({ questionnaire: tmiLu, blocFiscal: tmiDoc }));
  if (tmiLu) chk(tmiLu === tmiDoc, "la question bonus annonce EXACTEMENT la TMI du foyer (" + tmiDoc + " %)");
  else console.log("INFO — TMI sous 30 % : la question bonus ne sort pas, c'est la règle");
  const capaciteQ = await page.evaluate(() => {
    const z = document.querySelector('.nc-syn-zone');
    const t = z ? z.innerText : '';
    const m = t.match(/La banque vous prêterait encore/);
    const m2 = t.match(/Mensualité disponible[\s\S]{0,400}?(\d[\d\s\u00a0\u202f]*)\s*€\/mois/);
    return { question: !!m, dispo: m2 ? m2[1].replace(/[^\d]/g, '') : null };
  });
  console.log('CAPACITE:', JSON.stringify(capaciteQ));
  chk(!capaciteQ.question || (capaciteQ.dispo === null || parseInt(capaciteQ.dispo, 10) > 0),
      "RÈGLE CABINET : aucune question d'investissement si le client n'a pas de place pour emprunter");

  /* ═══ LES CASES À COCHER (17/09/2026, demande du CGP) ═══
     « Est-il possible de rendre cliquables les cases, afin de cocher celles qui nous
     intéressent pour le rendez-vous, et retrouver cela à l'impression ou à l'envoi ? »
     Le banc coche une pièce, vérifie que la coche apparaît, QUITTE la synthèse puis y
     revient — l'état doit avoir survécu — et contrôle enfin que la coche est bien
     présente dans le CLONE D'IMPRESSION, c'est-à-dire dans le PDF. */
  const listeAdmin = ['Pièce d\'identité', 'Justificatif de domicile', "Justificatif d'origine des fonds", 'RIB du compte à prélever'];
  listeAdmin.forEach(l => chk(T2.indexOf(l) !== -1, 'pièce administrative présente : ' + l));
  chk(/Également sur le site/i.test(T2) && /Voir mes contrats/i.test(T2), "le chemin info-retraite.fr est écrit en toutes lettres");

  const coche = async () => await page.evaluate(() => {
    const z = document.querySelector('.nc-syn-zone');
    if (!z) return 'pas de zone';
    const lignes = Array.from(z.querySelectorAll('div')).filter(n => /^Pièce d'identité/.test((n.innerText || '').trim()) && n.querySelector('svg, span'));
    const cible = lignes[lignes.length - 1];
    if (!cible) return 'ligne absente';
    cible.click();
    return 'ok';
  });
  const estCochee = async () => await page.evaluate(() => {
    const z = document.querySelector('.nc-syn-zone');
    const lignes = Array.from(z.querySelectorAll('div')).filter(n => /^Pièce d'identité/.test((n.innerText || '').trim()));
    const cible = lignes[lignes.length - 1];
    return !!(cible && cible.querySelector('svg path'));
  });
  console.log('CLIC sur « Pièce d\'identité » :', await coche());
  await page.waitForTimeout(500);
  chk(await estCochee(), 'AUTO-TEST : un clic coche la case');

  { const b = mod2.locator('button:has-text("État civil")').first(); if (await b.count()) { await b.click(); await page.waitForTimeout(700); } }
  { const b = mod2.locator('button:has-text("Synthèse")').first(); if (await b.count()) { await b.click(); await passerFenetres(page); await page.waitForTimeout(1400); } }
  chk(await estCochee(), "l'état coché survit à un aller-retour dans le dossier");

  const dansLeClone = await page.evaluate(() => {
    const z = document.querySelector('.nc-syn-zone');
    if (!z) return 'pas de zone';
    const c = z.cloneNode(true);
    const lignes = Array.from(c.querySelectorAll('div')).filter(n => /^Pièce d'identité/.test((n.textContent || '').trim()));
    const cible = lignes[lignes.length - 1];
    return cible && cible.querySelector('svg path') ? 'ok' : 'coche absente du clone';
  });
  chk(dansLeClone === 'ok', "la coche est reprise par le clone d'impression (donc par le PDF) — lu : " + dansLeClone);

  console.log('\nPAGEERRORS:', errs.length ? errs.slice(0, 3).join(' | ') : 'aucune');
  if (errs.length) ko++;
  console.log(ko === 0 ? '\nDEVOIRS : TOUT EST VERT' : `\nDEVOIRS : ${ko} CONTRÔLE(S) EN ÉCHEC`);
  await browser.close();
  process.exit(ko === 0 ? 0 : 1);
})();
