// Reproduction du dossier TEST Jean (couple, RP + maison Bretagne NP, 2 AV, crédit auto)
// puis vérification VISUELLE (Tailwind réel) + export PDF page par page.
const { chromium } = require('playwright');
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
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const page = await browser.newPage({ viewport: { width: 1440, height: 950 } });
  const errs = [];
  page.on('pageerror', e => { if (!/tailwind is not defined/.test(String(e))) errs.push(String(e)); });
  page.on('console', m => { if (m.type()==='error') console.log('CONSOLE.ERROR:', m.text().slice(0,600)); });
  await page.goto('http://localhost:8899/test_local.html?etude=1', { waitUntil: 'networkidle' });
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
  const chk = async (tag) => {
    const open = await page.evaluate(() => !!document.querySelector('.nc-syn-zone') || /étape \d \/ 7/i.test(document.body.innerText) || document.body.innerText.includes('État civil'));
    console.log('CHK', tag, 'modal:', open);
    if (!open) { await page.screenshot({ path: '/tmp/dbg_' + tag + '.png' }); }
  };
  await page.waitForTimeout(500);
  await chk('avant_e1');

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
  const credQ = page.locator('text=crédit en cours').locator('xpath=following::button[normalize-space()="Oui"][1]');
  if (await credQ.count()) { try { await credQ.click({ timeout: 1500 }); await page.waitForTimeout(300); } catch (e) {} }

  await chk('apres_e1');
  // ÉTAPE 2 — Famille : 2 enfants
  await repondreNonPartout(page);
  await page.locator('button:has-text("Famille")').first().click();
  await page.waitForTimeout(500);

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

  await chk('apres_e3');
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

  await chk('apres_e5');
  // ÉTAPE 7 — synthèse
  await repondreNonPartout(page);
  await page.locator('button:has-text("Synthèse")').first().click();
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
  const T = await page.evaluate(() => document.querySelector('.nc-syn-zone') ? document.querySelector('.nc-syn-zone').innerText : 'PAS DE SYNTHESE');
  console.log('SYN?', T.slice(0, 120).replace(/\n/g, ' | '));
  console.log('IDZONE:', T.slice(0, 900).replace(/\n/g, ' | '));
  console.log('LIGNE ID:', (T.split('\n').find(l => /ans/.test(l)) || 'absente'));
  const has = (l, re) => console.log((re.test(T) ? 'OK  ' : 'FAIL') + ' — ' + l);
  const not = (l, re) => console.log((!re.test(T) ? 'OK  ' : 'FAIL') + ' — ' + l);
  has('« et Madame » (fini avec)', /Monsieur, \d+ ans et Madame/);
  {
    const f = await page.evaluate(() => {
      const zone = document.querySelector('.nc-syn-zone');
      const sp = Array.from(zone.querySelectorAll('span')).find(e => /Madame Jeanine/.test(e.textContent) && e.children.length === 0);
      const titre = Array.from(zone.querySelectorAll('div')).filter(e => e.textContent.trim() === 'Les chiffres du dossier').pop();
      const cs = sp ? getComputedStyle(sp) : null, ct = titre ? getComputedStyle(titre) : null;
      return { conj: cs && cs.fontFamily, lig: cs && cs.fontVariantLigatures, titre: ct && ct.fontFamily, ligT: ct && ct.fontVariantLigatures };
    });
    console.log('POLICES:', JSON.stringify(f));
    console.log((f.conj && /Lora/.test(f.conj) ? 'OK  ' : 'FAIL') + ' — nom du conjoint en Lora dans l\'en-tête');
    console.log((f.lig === 'none' && f.ligT === 'none' && /Lora/.test(f.titre || '') ? 'OK  ' : 'FAIL') + ' — ligatures coupées (en-tête et « Les chiffres du dossier », en Lora)');
    const hd = page.locator('.nc-syn-zone').getByText('Madame Jeanine').first().locator('xpath=ancestor::div[2]');
    await hd.screenshot({ path: '/tmp/entete.png' });
  }
  has('téléphone du client préfixé « Monsieur : »', /Monsieur : 0677688994/);
  has('téléphone du conjoint « Madame : »', /Madame : 0611223344/);
  has('email du client préfixé « Monsieur : »', /Monsieur : jean@test.com/);
  has('email du conjoint « Madame : »', /Madame : jeanine@test.com/);
  {
    const z = page.locator('.nc-syn-zone').getByText('Coordonnées', { exact: true }).first();
    if (await z.count()) { const gp = z.locator('xpath=..'); await gp.screenshot({ path: '/tmp/coord.png' }); console.log('CAPTURE coordonnées -> /tmp/coord.png'); }
    const pos = await page.evaluate(() => {
      const t = Array.from(document.querySelectorAll('.nc-syn-zone div')).filter(e => /^ADRESSE$/i.test(e.textContent.trim()))[0];
      if (!t) return null; const tuile = t.closest('.rounded-lg'); const val = tuile.querySelector('.text-\\[12\\.5px\\]');
      const rt = tuile.getBoundingClientRect(), rv = val.getBoundingClientRect();
      return { haut: Math.round(rv.top - rt.top), bas: Math.round(rt.bottom - rv.bottom), hTuile: Math.round(rt.height) };
    });
    const tailles = await page.evaluate(() => {
      const t = Array.from(document.querySelectorAll('.nc-syn-zone div')).filter(e => /^TÉLÉPHONE$/i.test(e.textContent.trim()))[0];
      if (!t) return null; const tuile = t.closest('.rounded-lg');
      const lignes = Array.from(tuile.querySelectorAll('div')).filter(e => /Monsieur : |Madame : /.test(e.textContent) && e.children.length <= 3 && !e.querySelector('div'));
      return lignes.map(e => e.textContent.trim().slice(0, 12) + ' ' + getComputedStyle(e).fontSize);
    });
    console.log('TAILLES tél:', JSON.stringify(tailles));
    console.log((tailles && tailles.length === 2 && tailles[0].split(' ').pop() === tailles[1].split(' ').pop() ? 'OK  ' : 'FAIL') + ' — Monsieur et Madame à la même taille dans la tuile Téléphone');
    console.log('ADRESSE position:', JSON.stringify(pos));
    if (pos) console.log((pos.bas < pos.haut + 8 && pos.bas > 4 ? 'OK  ' : 'FAIL') + ' — adresse descendue : espace au-dessus ' + pos.haut + ' px, en dessous ' + pos.bas + ' px');
  }
  has('groupe Le foyer', /Le foyer/i);
  has('groupe Coordonnées', /Coordonnées/i);
  has('maison Bretagne (titre, RS abrégé)', /« maison Bretagne » \(RS\) — 550[\s  ]?000 €/);
  has('appartient à Madame (paire)', /Appartient à\s*\n?\s*Madame/i);
  has('détention nue-propriété (paire)', /NUE-PROPRIÉTÉ \(valeur de la part\)/);
  has('total unique (Épargne constituée — total)', /Épargne constituée — total/i);
  has('placements groupés par détenteur (séparation)', /à préciser[\s\S]{0,30}182[\s\u202f\u00a0]?500[\s\u202f\u00a0]?€/i);
  not('colonne Détenteur supprimée (groupement)', /Détenteur/);
  has('crédit auto (titre)', /Crédit auto — 350 €\/mois/);
  has('fin juin 2027 (paire)', /Fin\s*\n?\s*juin 2027/i);
  has('Participation mensuelle & apport envisagés', /Participation mensuelle & apport envisagés/i);
  not('mot « effort » banni', /[Ee]ffort/);
  has('capacité proprio : projection locative uniquement', /projection locative uniquement \(règle cabinet\)/i);
  has('épargne scindée : Court terme / Long terme', /Court terme \(livrets, comptes\)/);
  has('tuile Activité — Madame (non renseignée)', /Activité — Madame[\s\S]{0,40}non renseignée/i);
  not('plus de ligne Total épargne (doublon)', /Total épargne/i);
  not('bloc bleu épuré (plus de texte intérieur)', /Ces constats appellent/);
  not('matrice indicative supprimée', /Matrice indicative/);
  not('bloc Et maintenant supprimé', /Et maintenant/);
  
  { const TT = await page.evaluate(() => (document.querySelector('.nc-syn-zone')||{innerText:''}).innerText);
    console.log((/maison Bretagne[\s\S]{0,300}Appartient à/i.test(TT) ? 'OK  ' : 'FAIL') + ' — bien « maison Bretagne » : ligne Appartient à visible (règle Brest : rattachement pour tous les biens)'); }
  console.log('PAGEERRORS:', errs.length ? errs.join(' || ') : 'aucune');

  // ═══ PROJECTION : export PDF A4 (v213 — page de garde, bandeau en fixe, ordre) ═══
  await page.locator('button:has-text("Analyse R2")').first().click();
  await page.waitForTimeout(1200);
  // cocher le locatif pour que « Apport mobilisé » et la carte soient présents
  await page.evaluate(() => { const el = Array.from(document.querySelectorAll('span')).find(e => e.textContent.trim() === 'Investissement locatif'); const cb = el && el.closest('div[class*="rounded-xl"]').querySelector('input[type=checkbox]'); if (cb && !cb.checked) cb.click(); });
  await page.waitForTimeout(500);
  // scroll dans la modale jusqu'aux gisements puis capture du viewport
  await page.evaluate(() => { const el = Array.from(document.querySelectorAll('div')).find(e => e.textContent.trim() === "Où trouver l'épargne"); el.scrollIntoView({ block: 'start' }); });
  await page.waitForTimeout(700);
  await page.screenshot({ path: process.argv[2] || 'shot_sticky.png' });
  const info = await page.evaluate(() => { const el = Array.from(document.querySelectorAll('span')).find(e => e.textContent.trim() === 'se recalcule à chaque case cochée'); let n = el; while (n && n.style.position !== 'sticky') n = n.parentElement; const r = n.getBoundingClientRect(); const sc = (() => { let p = n.parentElement; while (p) { const o = getComputedStyle(p).overflowY; if (/auto|scroll/.test(o)) return p; p = p.parentElement; } return null; })(); return { top: r.top, vis: getComputedStyle(n).visibility, scroller: sc ? sc.className.slice(0,80) + ' top=' + sc.getBoundingClientRect().top : 'window' }; });
  console.log('STICKY', JSON.stringify(info));
  await browser.close();
})().catch(e => { console.error('CRASH', e); process.exit(1); });
