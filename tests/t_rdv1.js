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

  // Porte d'entrée cabinet/nom (premier accès)
  if (await page.locator('text=Accéder au simulateur').count()) {
    const inps = page.locator('input');
    await setNative(page, inps.nth(0), 'Universel Patrimoine');
    await setNative(page, inps.nth(1), 'Test');
    await page.locator('button:has-text("Accéder au simulateur")').first().click();
    await page.waitForTimeout(1200);
  }
  console.log('ACCUEIL:', (await page.evaluate(() => document.body.innerText)).slice(0, 400).replace(/\n+/g, ' | '));

  // Ouvrir Nouveau client
  await page.locator('button:has-text("Nouveau client")').first().click();
  await page.waitForTimeout(800);
  // Si un choix de niveau apparaît, prendre l'étude complète
  const modalTxt = await page.evaluate(() => document.body.innerText.slice(0, 4000));
  if (/complet|complète/i.test(modalTxt)) {
    const btn = page.locator('button, [role=button]').filter({ hasText: /complète|complet/i }).first();
    if (await btn.count()) { try { await btn.click({ timeout: 2000 }); } catch (e) {} }
  }
  await page.waitForTimeout(600);

  // ÉTAPE 1 — état civil
  console.log('NB_DUPONT:', await page.locator('input[placeholder="DUPONT"]').count(), 'visibles:', await page.locator('input[placeholder="DUPONT"]:visible').count());
  await setNative(page, page.locator('input[placeholder="DUPONT"]:visible').last(), 'RGEAF');
  await setNative(page, page.locator('input[placeholder="Marie"]:visible').last(), 'erfvd');
  const dn = page.locator('input[type="date"]:visible').first();
  if (await dn.count()) await setNative(page, dn, '1981-03-01');
  await setNative(page, page.locator('input[placeholder="06 12 34 56 78"]:visible').last(), '06 11 22 33 44');
  await setNative(page, page.locator('input[placeholder="contact@email.fr"]:visible').last(), 'client@test.fr');
  // Célibataire / Locataire : scopés au MODAL (le fond de page a aussi ces libellés)
  const mod = page.locator('div.fixed.inset-0').last();
  const celib = mod.locator('button:has-text("Célibataire")').first();
  if (await celib.count()) await celib.click();
  await page.waitForTimeout(300);
  await mod.locator('button:text-is("Locataire")').first().click();
  await page.waitForTimeout(400);
  const loyerInp = page.locator('div:has(> div:text-is("Montant du loyer")) input').first();
  if (await loyerInp.count()) await setNative(page, loyerInp, '1200');
  else {
    // fallback : premier input après le libellé
    const li = page.locator('text=Montant du loyer').locator('xpath=following::input[1]');
    await setNative(page, li.first(), '1200');
  }
  await page.waitForTimeout(300);

  // ÉTAPE 3 — activité & revenus
  await repondreNonPartout(page);
  await page.locator('button:has-text("Activité & revenus")').first().click();
  await page.waitForTimeout(600);
  const sal = page.locator('button:has-text("Salarié")').first();
  if (await sal.count()) await sal.click();
  await page.waitForTimeout(500);
  const m13 = page.locator('button:text-is("13 mois")').first();
  if (await m13.count()) await m13.click();
  // Salaire : input à proximité du libellé "Salaire fixe" — défaut €/an → 150 000
  const salInp = page.locator('span:text-is("Salaire fixe")').locator('xpath=ancestor::div[2]//input[not(@type="range")]').first();
  await setNative(page, salInp, '150000');
  await page.waitForTimeout(400);
  console.log('SAL_ZONE:', (await page.evaluate(() => {
    const el = [...document.querySelectorAll('span')].find(x => x.textContent.trim() === 'Salaire fixe');
    return el ? el.closest('div').parentElement.parentElement.innerText.replace(/\n/g, ' | ') : 'introuvable';
  })).slice(0, 300));

  // ÉTAPE 5 — patrimoine & épargne : livret 22 500
  await repondreNonPartout(page);
  await page.locator('button:has-text("Patrimoine & épargne")').first().click();
  await page.waitForTimeout(600);
  const qEp = page.locator('div:has-text("Avez-vous de l\'épargne ou des placements ?")').locator('button:text-is("Oui")').last();
  await qEp.click();
  await page.waitForTimeout(400);
  // 10/09 : un nouveau placement s'ouvre sur « — Choisir — » (decision CGP) : on choisit Livrets
  { const selT = page.locator('text=Type de placement').first().locator('xpath=following::select[1]'); if (await selT.count()) await selT.selectOption('livrets'); }
  await page.waitForTimeout(600);
  // montant du livret : slider → setter natif, sinon champ €
  const rng = page.locator('input[type="range"]').last();
  if (await rng.count()) await setNative(page, rng, '22500');
  await page.waitForTimeout(400);
  console.log('AVOIR_TXT:', (await page.evaluate(() => document.body.innerText.match(/22\s?500[^\n]*/g) || 'aucun 22500')).toString().slice(0, 200));

  // ÉTAPE 7 — synthèse (garde-fou capacité en route)
  await repondreNonPartout(page);
  await page.locator('button:has-text("Synthèse")').first().click();
  await page.waitForTimeout(800);
  const guard = await page.evaluate(() => /un instant/i.test(document.body.innerText));
  if (guard) {
    const p35 = page.locator('button:has-text("300 – 500")').first();
    if (await p35.count()) { await p35.click(); await page.waitForTimeout(300); }
    const val = page.locator('button:has-text("Valider")').first();
    if (await val.count()) await val.click();
    else await page.locator('text=passer quand même').first().click();
    await page.waitForTimeout(900);
  }
  await page.waitForTimeout(1200);

  const txt = await page.evaluate(() => document.querySelector('.nc-syn-zone') ? document.querySelector('.nc-syn-zone').innerText : 'PAS DE SYNTHESE');
  const T = txt.replace(/ | /g, ' ');

  const has = (lbl, re) => console.log((re.test(T) ? 'OK  ' : 'FAIL') + ' — ' + lbl);
  const not = (lbl, re) => console.log((!re.test(T) ? 'OK  ' : 'FAIL') + ' — ' + lbl);
  /* 15/09/2026 (v218) : points forts, axes, objectifs, participation et transmission sont
     passes au RDV 2 (onglet « Simulation et plan d action »). Les assertions de CONTENU les
     lisent donc dans ce volet — le moteur, lui, n a pas change. */
  const allerPreco = async () => {
    const b = page.locator('button:has-text("Simulation")').first();
    if (await b.count()) { await b.click(); await page.waitForTimeout(900); }
    return await page.evaluate(() => (document.querySelector('.nc-syn-zone') || { innerText: '' }).innerText.replace(/[\u00a0\u202f]/g, ' '));
  };


  // 1. Nom : trois emplacements LÉGITIMES depuis v219 — bandeau d'écran, page de
  //    présentation, bloc de signatures. Au-delà, c'est un doublon parasite.
  /* 16/09/2026 (CGP, screen 1) : le bloc « Votre foyer » affiche désormais le NOM de
     chaque personne en tête de sa colonne — c'est le modèle qu'il a validé. Le nom
     apparaît donc quatre fois : bandeau d'écran, page de garde, colonnes du foyer,
     signature. La règle « une seule fois » de fin août est remplacée par celle-ci. */
  const nbNom = (T.match(/RGEAF/gi) || []).length;
  console.log((nbNom === 4 ? 'OK  ' : 'FAIL') + ` — nom présent ${nbNom} fois (attendu 4 : bandeau écran, page de garde, colonne du foyer, signature)`);
  // 2. Coordonnées
  has('domicile affiché même vide (« non renseigné »)', /Domicile\s*\n?\s*non renseigné/i);
  has('ligne Téléphone', /Téléphone\s*\n?\s*06 11 22 33 44/i);
  has('courriel affiché', /Courriel\s*\n?\s*client@test\.fr/i);
  // 3. Placements sans doublon
  not('plus de "(100 %)" dans les chips', /\(100 %\)/);
  not('plus de phrase "% de l\'épargne est en"', /% de l'épargne est en placements/);
  // 4. Jauges court / long terme
  has('carte Épargne constituée fusionnée (placements)', /Épargne constituée/i);
  /* 02/09 : deux CARTES distinctes remplacent les deux lignes empilees — le titre
     est « Court terme », la nature du support passe en sous-titre. */
  has('carte Court terme', /Court terme/i);
  has('sous-titre des supports court terme', /livrets, comptes courants/);
  has('carte Long terme', /Long terme/i);
  has('barre de répartition court \/ long', /% disponible/);
  /* le pourcentage « X % de la préconisation » a ete RETIRE a la demande du CGP :
     l assertion s inverse, il ne doit PLUS apparaitre */
  console.log((/% de la préconisation/.test(T) ? 'FAIL' : 'OK  ') + " — le pourcentage de la préconisation reste retiré");
  not('plus de commentaire dans Épargne constituée', /Beaucoup trop d'épargne en court terme/);
  has('long terme à zéro signalé en clair', /Aucune épargne placée à long terme/);
  const nbTotals = (T.match(/Total épargne/gi) || []).length;
  console.log((nbTotals === 0 ? 'OK  ' : 'FAIL') + ` — plus de doublon Total épargne [${nbTotals}]`);
  has('total unique dans Épargne constituée', /Épargne constituée — total/i);
  // 5. Mensualité double
  has('mensualité achat RP (loyer supprimé)', /achat RP \(loyer supprimé\)/);
  has('mensualité locatif (loyer conservé)', /locatif \(loyer conservé\)/);
  /* 18/09/2026 — LES COMPTEURS SONT DEVENUS DES CAMEMBERTS. Le CGP : « pour les
     chiffres du dossier, tu écris trop… je veux quelque chose de visuel, avec aucun
     texte ou le minimum ». Les phrases explicatives qui portaient ces informations
     ont donc disparu ; ce sont les LÉGENDES des camemberts qui les portent désormais.
     Les contrôles suivent l'information, pas l'ancienne phrase. */
  // 6. Les hypothèses de rendement locatif quittent le constat (elles restent dans « Voir les hypothèses »)
  not('plus de paragraphe « retour de loyer attendu » dans le constat', /retour de loyer attendu : 4 %/);
  // 7. Le camembert d'endettement NOMME le poste qui consomme les revenus
  const nbCpt = (T.match(/TAUX D'ENDETTEMENT[\s\S]{0,260}?Loyer/gi) || []).length;
  console.log((nbCpt >= 1 ? 'OK  ' : 'FAIL') + ` — camembert d'endettement : le loyer est nommé dans la légende [${nbCpt}]`);
  has('camembert d\'endettement : la marge jusqu\'à 35 % est lisible', /Marge jusqu'à 35 %/i);
  has('camembert de mensualité : ce qui reste est nommé', /Encore disponible/i);
  not('jauge précaution doublon supprimée', /repère : 3 mois de revenus minimum/);
  has('camembert Le financier : 100 % et la poche nommée', /LE FINANCIER[\s\S]{0,200}100 %[\s\S]{0,200}Financier/i);
  /* 19/09/2026 (CGP) : « actif total / passif / patrimoine net » ne se détache plus de
     la rangée de compteurs qui le précède — le trio porte data-nc-colle-precedent, qui
     reporte le saut de page EN AMONT. Contrôle de présence de la marque : sans elle, le
     trio peut se retrouver seul en haut d'une page. */
  {
    const colle = await page.evaluate(() => !!document.querySelector('.nc-syn-zone [data-nc-colle-precedent="1"]'));
    console.log((colle ? 'OK  ' : 'FAIL') + " — le trio actif / passif / patrimoine net est collé à la rangée de compteurs");
    if (!colle) ko++;
  }
  not('plus de compteur « Immobilier » (remplacé par Le financier, 10/09)', /part de l'immobilier dans le patrimoine/);
  // 8. Ordre : participation avec les objectifs, forces au-dessus des axes
  const TP = await allerPreco();
  const hasP = (lbl, re) => console.log((re.test(TP) ? 'OK  ' : 'FAIL') + ' — ' + lbl + ' [RDV 2]');
  const U = TP.toUpperCase();
  const iPart = U.indexOf('PARTICIPATION MENSUELLE');
  const iForts = U.indexOf('LES POINTS FORTS DU DOSSIER');
  const iVig = U.indexOf("LES AXES DE TRAVAIL ET D'AMÉLIORATION");
  console.log((iPart !== -1 && iForts !== -1 && iPart < iForts ? 'OK  ' : 'FAIL') + ` — participation avant points forts (part=${iPart}, forts=${iForts})`);
  console.log((iForts !== -1 && iVig > iForts ? 'OK  ' : 'FAIL') + ' — points forts puis axes de travail (empilés)');
  const stacked = await page.evaluate(() => {
    const els = [...document.querySelectorAll('.nc-syn-zone .grid.grid-cols-1')];
    return els.some(g => /points forts du dossier/i.test(g.innerText) && /axes de travail/i.test(g.innerText));
  });
  console.log((stacked ? 'OK  ' : 'FAIL') + ' — conteneur points forts/axes en 1 colonne');
  // 9. chiffres : mensualités attendues 4375 / 3175 (12500 revenus, 1200 loyer)
  has('4 375 € (achat RP)', /4 375 €/);
  has('3 175 € (locatif)', /3 175 €/);

  await page.screenshot({ path: 'shot_syn_v119.png', fullPage: true });
  /* capture cadree du bloc « Epargne constituee » — le CGP l a juge brouillon */
  {
    const box = await page.evaluate(() => {
      const el = Array.from(document.querySelectorAll('*')).find(e =>
        e.children.length === 0 && !/^(SCRIPT|STYLE|TITLE|LINK|META)$/.test(e.tagName)
        && e.offsetParent !== null && /Épargne constituée/i.test(e.textContent || ''));
      if (!el) return null;
      /* on remonte jusqu au conteneur du bloc, PAS plus haut : on s arrete des
         que la hauteur depasse 150 px (le bloc entier) */
      let c = el;
      while (c.parentElement && c.getBoundingClientRect().height < 150) c = c.parentElement;
      c.scrollIntoView({ block: 'center' });
      const r = c.getBoundingClientRect();
      return { x: Math.max(0, r.left - 16), y: Math.max(0, r.top - 16), width: Math.min(1400, r.width + 32), height: r.height + 32 };
    });
    if (box) { await page.waitForTimeout(400); await page.screenshot({ path: 'shot_epargne.png', clip: box }); console.log('CAPTURE epargne -> shot_epargne.png'); }
    else console.log('CAPTURE epargne : bloc introuvable');
  }
  // ——— Export PDF réel (print stubé, holder actif pendant 800 ms) ———
  await page.evaluate(() => { window.print = () => {}; });
  await page.locator('button:has-text("Enregistrer en PDF")').first().click();
  await page.waitForTimeout(400);
  const hintBtn = page.locator('button:has-text("J\'ai compris")');
  if (await hintBtn.count()) { await hintBtn.first().click(); await page.waitForTimeout(400); }

  const st = await page.evaluate(() => ({
    cls: document.body.classList.contains('nc-print-syn'),
    holder: !!document.getElementById('nc-print-holder'),
    padding: document.getElementById('nc-print-holder') ? document.getElementById('nc-print-holder').style.padding : null,
  }));
  console.log('ETAT EXPORT:', JSON.stringify(st));
  await page.pdf({ path: 'export_v119.pdf', format: 'A4', printBackground: true });
  console.log('PDF genere');
  console.log('FINPAGE:', JSON.stringify(await page.evaluate(() => window.__ncFinPage || null)));
  console.log('DOMFIN:', JSON.stringify(await page.evaluate(() => {
    const h = document.getElementById('nc-print-holder');
    if (!h) return null;
    const men = [...h.querySelectorAll('div')].filter(n => (n.dataset||{}).ncNoBreak === '1');
    const m = men[men.length-1];
    const prev = m ? m.previousElementSibling : null;
    return { nbMen: men.length, menTop: m ? Math.round(m.offsetTop) : null, menH: m ? Math.round(m.offsetHeight) : null,
             prevTag: prev ? prev.tagName + '/' + (prev.className||'') + '/h=' + Math.round(prev.offsetHeight) : null,
             holderH: Math.round(h.scrollHeight), zoom: h.style.zoom };
  })));
  /* 04/09/2026 (décision CGP) : cible FIXE — personne seule 10 000 à 15 000 €.
     Ce célibataire a 22 500 € de court terme : dans la cible (sur-dotation seulement
     au-delà de 1,5 × 15 000 = 22 500 €, non atteint) → le point fort s'affiche. */
  hasP("point fort 'précaution constituée' (22 500 € ≥ 10 000 €, règle fixe du 04/09)", /Épargne de précaution constituée/);
  // v167 : l'argument « frappés de plein fouet » n'apparaît QUE si la simulation
  // successorale chiffre des droits > 0 ; sinon l'axe bascule sur la disponibilité
  // et la transmission hors succession (clause bénéficiaire, art. 990 I).
  /* 02/09 : depuis que la cible de precaution porte sur les DEPENSES du foyer et non
     plus sur les charges bancaires, ce dossier (22 500 € pour une cible de 33 795 a
     50 692 €) n est plus en SUR-dotation : l axe « tresorerie trop importante » ne
     doit donc PAS sortir, et son argumentaire non plus. Le controle ferme de cet
     argumentaire est porte par le banc, sur un dossier reellement sur-dote
     (couple retraite, 40 000 € pour une cible de 14 423 €). */
  {
    const surDote = /trésorerie beaucoup trop importante/i.test(T);
    if (!surDote) console.log("OK   — foyer sous-doté : aucun axe « trésorerie trop importante », c'est correct");
    else {
      has('axe trésorerie avec argumentaire succession (variante selon droits)', /frappés de plein fouet par les droits de succession|se transmettant hors succession/);
      has('argument AV-PER art. 990 I (152 500 € ou clause sur mesure)', /152[\s\u202f\u00a0 ]?500 € par bénéficiaire|clause bénéficiaire sur mesure \(art\. 990 I CGI\)/);
    }
  }
  console.log('PAGEERRORS:', errs.length ? errs.join(' || ') : 'aucune');
  await browser.close();
})().catch(e => { console.error('CRASH', e); process.exit(1); });
