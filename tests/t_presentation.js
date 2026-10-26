const { chromium } = require('playwright');
const { passerFenetres } = require('./_aide');

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
  await passerFenetres(page);
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


  /* ═══════════════════════════════════════════════════════════════════════
     MODE PRÉSENTATION (v220) — contrôle sur le comportement RÉEL de l'écran.
     Ce banc ne lit pas le code : il entre en présentation, compte ce qui est
     VISIBLE, navigue, saisit, et ressort.
     ═══════════════════════════════════════════════════════════════════════ */
  let ko = 0;
  const OK = (m) => console.log('OK   — ' + m);
  const KO = (m) => { ko++; console.log('FAIL — ' + m); };
  const chk = (c, m) => (c ? OK(m) : KO(m));

  const etat = () => page.evaluate(() => {
    const zone = document.querySelector('.nc-syn-zone');
    if (!zone) return { err: 'pas de zone' };
    const vis = (el) => el.offsetParent !== null && el.getBoundingClientRect().height > 2;
    const blocs = [];
    Array.prototype.forEach.call(zone.children, (el, zi) => {
      if (el.hasAttribute('data-nc-pres-ui') || el.hasAttribute('data-nc-pres-skip')) return;
      if (el.hasAttribute('data-nc-pres-host')) {
        Array.prototype.forEach.call(el.children, (c, hi) => {
          if (c.hasAttribute('data-nc-pres-keep')) return;
          blocs.push({ k: 'h' + hi, chap: c.getAttribute('data-nc-chap'), vis: vis(c) });
        });
      } else blocs.push({ k: 'z' + zi, chap: el.getAttribute('data-nc-chap'), vis: vis(el) });
    });
    const bar = document.querySelector('[data-nc-pres-ui]');
    const lib = bar ? (bar.innerText || '').replace(/\s+/g, ' ').trim() : '';
    const m = lib.match(/chapitre\s+(\d+)\s*\/\s*(\d+)/i);
    return {
      pres: document.body.classList.contains('nc-pres'),
      nbBlocs: blocs.length,
      marques: blocs.filter(b => b.chap).length,
      visibles: blocs.filter(b => b.vis).length,
      titresVisibles: blocs.filter(b => b.vis).map(b => b.chap || '(suite)'),
      idx: m ? +m[1] : null, total: m ? +m[2] : null,
      titreBarre: bar ? (bar.innerText || '').split('\n').filter(x => x.trim()).slice(-2)[0] : null,
      barVisible: !!bar,
      enTeteCache: (() => { const c = document.querySelector('.nc-pres-card'); if (!c) return null;
        return Array.prototype.filter.call(c.children, (x) => !x.classList.contains('nc-pres-scroll') && x.offsetParent !== null).length === 0; })(),
    };
  });

  const volets = [
    { l: 'Audit et synthèse', v: 'constat' },
    { l: 'Analyse R2', v: 'proj' },
    { l: 'Simulation', v: 'preco' },
  ];

  // ── état AVANT : sert de référence pour la sortie ──
  const avant = await etat();
  console.log('\n=== AVANT PRÉSENTATION ===');
  console.log(JSON.stringify(avant));
  chk(avant.pres === false, "l'écran normal ne porte pas la classe de présentation");
  chk(avant.visibles === avant.nbBlocs, `tous les blocs sont visibles hors présentation (${avant.visibles}/${avant.nbBlocs})`);

  await page.locator('button:has-text("Présenter")').first().click();
  await page.waitForTimeout(800);

  for (const vol of volets) {
    if (vol.v !== 'constat') {
      await page.locator('[data-nc-pres-ui] button:has-text("' + vol.l + '")').first().click();
      await page.waitForTimeout(1100);
    }
    const e = await etat();
    console.log('\n=== VOLET ' + vol.v.toUpperCase() + ' EN PRÉSENTATION ===');
    console.log(JSON.stringify(e));
    chk(e.pres === true, `[${vol.v}] la classe de présentation est posée`);
    chk(e.barVisible, `[${vol.v}] la barre de présentation est là`);
    chk(e.enTeteCache === true, `[${vol.v}] en-tête, fil d'ariane et pied de fenêtre sont retirés de l'écran`);
    chk(e.total !== null && e.total >= 4, `[${vol.v}] ${e.total} chapitres annoncés`);
    chk(e.total === e.marques || e.total === e.marques + 1, `[${vol.v}] le nombre de chapitres suit les marques posées (marques=${e.marques}, chapitres=${e.total})`);
    chk(e.idx === 1, `[${vol.v}] on entre sur le premier chapitre`);
    // UN SEUL chapitre à l'écran : les blocs visibles doivent être ceux du chapitre courant
    chk(e.visibles > 0 && e.visibles < e.nbBlocs, `[${vol.v}] un seul chapitre à l'écran (${e.visibles} bloc(s) visibles sur ${e.nbBlocs})`);
    chk(/Ouverture/i.test(String(e.titreBarre)) || e.titresVisibles.indexOf('Ouverture') !== -1, `[${vol.v}] la page de garde ouvre la présentation`);

    // ── navigation : avancer puis reculer ──
    const t1 = e.titresVisibles.join('|');
    await page.locator('[data-nc-pres-ui] button:has-text("›")').first().click();
    await page.waitForTimeout(500);
    const e2 = await etat();
    chk(e2.idx === 2, `[${vol.v}] la flèche droite avance au chapitre 2 (lu : ${e2.idx})`);
    chk(e2.titresVisibles.join('|') !== t1, `[${vol.v}] le contenu affiché a changé`);
    chk(e2.visibles > 0, `[${vol.v}] le chapitre 2 affiche quelque chose`);
    /* ═══ CE QUI TIENT SUR UNE MÊME DIAPOSITIVE (18/09/2026, CGP) ═══
       Quatre blocs ne doivent PLUS ouvrir de chapitre : ils complètent le précédent
       (logement, épargne mensuelle, patrimoine net, questions). Le contrôle porte sur
       la LISTE des chapitres, titre par titre — pas sur leur nombre seul. */
    if (vol.v === 'constat') {
      const attendus = ['Ouverture', 'État civil', 'Revenus et charges', 'Épargne',
        'Fiscalité', 'Les chiffres du dossier', 'Objectifs et questions',
        'Objectifs et participation', 'Préparer le prochain rendez-vous'];
      const lus = await page.evaluate(() => Array.prototype.map.call(
        document.querySelectorAll('.nc-syn-zone [data-nc-chap]'), n => n.getAttribute('data-nc-chap')));
      console.log('CHAPITRES CONSTAT:', JSON.stringify(lus));
      chk(lus.length === attendus.length && lus.every((x, i) => x === attendus[i]),
        'les chapitres du constat sont ceux arbitrés avec le CGP (9, fusions comprises)');
    }
    // clavier
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(450);
    const e3 = await etat();
    chk(e3.idx === 3, `[${vol.v}] la touche → avance (lu : ${e3.idx})`);
    await page.keyboard.press('ArrowLeft');
    await page.waitForTimeout(450);
    const e4 = await etat();
    chk(e4.idx === 2, `[${vol.v}] la touche ← recule (lu : ${e4.idx})`);
    // dernier chapitre : la flèche droite ne doit pas dépasser
    await page.keyboard.press('End');
    await page.waitForTimeout(500);
    const e5 = await etat();
    chk(e5.idx === e5.total, `[${vol.v}] Fin va au dernier chapitre (${e5.idx}/${e5.total})`);
    chk(e5.visibles > 0, `[${vol.v}] le dernier chapitre n'est pas vide`);
    await page.keyboard.press('Home');
    await page.waitForTimeout(450);
  }

  // ── la saisie reste possible pendant la présentation (décision du CGP) ──
  await page.locator('[data-nc-pres-ui] button:has-text("Analyse R2")').first().click();
  await page.waitForTimeout(1100);
  const saisie = await page.evaluate(async () => {
    /* 20/09/2026 : on avançait de DEUX chapitres en dur pour tomber sur celui qui porte
       les cases à cocher. L'Analyse R2 a été réordonnée (page de garde → objectifs et
       moyens → analyse du dossier → où trouver l'épargne → solutions retenues) et ce
       compte ne tombait plus juste : le banc atterrissait sur « Analyse du dossier »,
       qui ne contient aucun champ, et concluait à tort que la saisie était bloquée.
       On avance maintenant JUSQU'AU chapitre nommé, quel que soit son rang. */
    /* le bouton est re-rendu à chaque changement de chapitre : le re-chercher à
       chaque tour, sinon on clique sur un nœud détaché et on n'avance plus. */
    const suivant = () => Array.from(document.querySelectorAll('[data-nc-pres-ui] button')).find(b => b.textContent.trim() === '›');
    const zone = () => document.querySelector('.nc-syn-zone');
    const aDesChamps = () => {
      const z = zone(); if (!z) return false;
      return Array.from(z.querySelectorAll('input, select, textarea')).some(e => e.offsetParent !== null);
    };
    for (let i = 0; i < 10 && !aDesChamps(); i++) { const bt = suivant(); if (!bt) break; bt.click(); await new Promise(r => setTimeout(r, 350)); }
    return aDesChamps();
  });
  await page.waitForTimeout(700);
  const inter = await page.evaluate(() => {
    const zone = document.querySelector('.nc-syn-zone');
    const cases = Array.from(zone.querySelectorAll('input[type=checkbox]')).filter(e => e.offsetParent !== null);
    const champs = Array.from(zone.querySelectorAll('input:not([type=checkbox]), select, textarea')).filter(e => e.offsetParent !== null);
    return { cases: cases.length, champs: champs.length };
  });
  console.log('\n=== INTERACTIVITÉ ===');
  console.log(JSON.stringify(inter));
  chk(inter.cases + inter.champs > 0, `des contrôles restent manipulables en présentation (${inter.cases} case(s), ${inter.champs} champ(s))`);
  if (inter.champs > 0) {
    // une touche tapée dans un champ ne doit PAS changer de chapitre
    const idxAvant = (await etat()).idx;
    await page.evaluate(() => {
      const zone = document.querySelector('.nc-syn-zone');
      const c = Array.from(zone.querySelectorAll('input:not([type=checkbox]), select, textarea')).filter(e => e.offsetParent !== null)[0];
      if (c) c.focus();
    });
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(400);
    const idxApres = (await etat()).idx;
    chk(idxAvant === idxApres, `une flèche tapée dans un champ ne fait pas défiler la présentation (${idxAvant} → ${idxApres})`);
  }

  // ── sortie : l'écran revient exactement à son état d'origine ──
  await page.keyboard.press('Escape');
  await page.waitForTimeout(800);
  const apres = await etat();
  console.log('\n=== APRÈS SORTIE ===');
  console.log(JSON.stringify(apres));
  chk(apres.pres === false, 'Échap sort de la présentation');
  chk(apres.barVisible === false, 'la barre de présentation disparaît');
  chk(apres.visibles === apres.nbBlocs, `tous les blocs sont revenus (${apres.visibles}/${apres.nbBlocs})`);

  /* ── PREUVE QUE LE BANC SAIT ÉCHOUER : on force l'affichage de tous les
       chapitres, le contrôle « un seul chapitre » doit alors tomber. ── */
  await page.locator('button:has-text("Présenter")').first().click();
  await page.waitForTimeout(700);
  /* mutation du MÉCANISME lui-même : on retire la feuille de style écrite par la
     barre de présentation. Tous les chapitres doivent alors réapparaître, et le
     contrôle « un seul chapitre » doit tomber — sinon il ne regarde rien. */
  const styleRetire = await page.evaluate(() => {
    const st = document.querySelector('[data-nc-pres-ui] style');
    if (!st) return false;
    st.setAttribute('data-mutation', '1');
    st.textContent = '';
    return true;
  });
  if (!styleRetire) KO('AUTO-TEST impossible : la règle de masquage est introuvable');
  await page.waitForTimeout(400);
  const mut = await etat();
  const detecte = !(mut.visibles > 0 && mut.visibles < mut.nbBlocs);
  chk(detecte, `AUTO-TEST : en montrant tout, le contrôle « un seul chapitre » échoue bien (${mut.visibles}/${mut.nbBlocs})`);

  await page.keyboard.press('Escape');
  await page.waitForTimeout(400);

  console.log('\nPAGEERRORS:', errs.length ? errs.slice(0, 3).join(' | ') : 'aucune');
  if (errs.length) ko++;
  console.log(ko === 0 ? '\nPRÉSENTATION : TOUT EST VERT' : `\nPRÉSENTATION : ${ko} CONTRÔLE(S) EN ÉCHEC`);
  await browser.close();
  process.exit(ko === 0 ? 0 : 1);
})();
