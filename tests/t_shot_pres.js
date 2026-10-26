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
  // 15/09/2026 : COUPLE — le CGP veut lire QUI verse (« Monsieur 200 €, Madame 100 € »).
  const marie = mod.locator('button:has-text("Marié")').first();
  if (await marie.count()) { await marie.click(); await page.waitForTimeout(500); }
  try {
    const selReg = page.locator('select').filter({ has: page.locator('option[value="separation"]') }).first();
    if (await selReg.count()) await selReg.selectOption('separation');
    else {
      const bSep = mod.locator('button:has-text("Séparation de biens")').first();
      if (await bSep.count()) { await bSep.click({ timeout: 1500 }); await page.waitForTimeout(300); }
    }
  } catch (e) {}
  await page.waitForTimeout(300);
  const cjQ = page.locator('text=Renseigner le conjoint ?').locator('xpath=following::button[normalize-space()="Oui"][1]');
  if (await cjQ.count()) { await cjQ.first().click(); await page.waitForTimeout(500); }
  {
    const cjPre = page.locator('input[placeholder="Jean"]:visible');
    if (await cjPre.count()) await setNative(page, cjPre.last(), 'Sophie');
    const dts = page.locator('input[type="date"]:visible');
    if (await dts.count() > 1) await setNative(page, dts.nth(1), '1983-05-01');
  }
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


  // ─── versement mensuel sur le livret : 200 €/mois ───
  {
    const ouiVers = page.locator('div:has(> div:text-is("Versement mensuel ?")) button:text-is("Oui")').first();
    if (await ouiVers.count()) { await ouiVers.click(); await page.waitForTimeout(400); }
    else {
      const o = page.locator('text=Versement mensuel ?').locator('xpath=following::button[normalize-space()="Oui"][1]');
      if (await o.count()) { await o.first().click(); await page.waitForTimeout(400); }
    }
    const champ = page.locator('text=Versement mensuel ?').locator('xpath=following::input[1]');
    if (await champ.count()) { await setNative(page, champ.first(), '200'); await page.waitForTimeout(300); }
  }
  console.log('PP1:', (await page.evaluate(() => (document.body.innerText.match(/200[^\n]{0,40}/g) || []).slice(0,3).join(' || '))));

  // détenteur du livret : Monsieur
  {
    const r = await page.evaluate(() => {
      const sels = Array.from(document.querySelectorAll('select')).filter(s => s.offsetParent !== null
        && Array.from(s.options).some(o => o.value === 'client'));
      if (!sels.length) return 'aucun select detenteur';
      const s = sels[sels.length - 1];
      const setter = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set;
      setter.call(s, 'client');
      s.dispatchEvent(new Event('change', { bubbles: true }));
      return 'ok ' + s.value;
    });
    console.log('DETENTEUR livret:', r);
    await page.waitForTimeout(500);
  }

  // ─── deuxième placement : assurance vie 30 000 €, 100 €/mois ───
  {
    const plus = page.locator('button:has-text("Ajouter un placement"), button:has-text("Ajouter")').last();
    if (await plus.count()) { await plus.click(); await page.waitForTimeout(700); }
    // le DERNIER select de la page est maintenant celui du détenteur du 1er placement :
    // viser explicitement un select qui propose le TYPE « av ».
    const rT = await page.evaluate(() => {
      const sels = Array.from(document.querySelectorAll('select')).filter(s => s.offsetParent !== null
        && Array.from(s.options).some(o => o.value === 'av'));
      if (!sels.length) return 'aucun select type';
      const s = sels[sels.length - 1];
      const setter = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set;
      setter.call(s, 'av');
      s.dispatchEvent(new Event('change', { bubbles: true }));
      return 'ok ' + s.value;
    });
    console.log('TYPE av:', rT);
    await page.waitForTimeout(800);
    const rng2 = page.locator('input[type="range"]').last();
    if (await rng2.count()) { await setNative(page, rng2, '30000'); await page.waitForTimeout(400); }
    const ouiVers2 = page.locator('text=Versement mensuel ?').locator('xpath=following::button[normalize-space()="Oui"][1]');
    if (await ouiVers2.count()) { await ouiVers2.last().click(); await page.waitForTimeout(400); }
    const champ2 = page.locator('text=Versement mensuel ?').locator('xpath=following::input[1]');
    if (await champ2.count()) { await setNative(page, champ2.last(), '100'); await page.waitForTimeout(300); }
    // détenteur de l'assurance vie : Madame
    const r2 = await page.evaluate(() => {
      const sels = Array.from(document.querySelectorAll('select')).filter(s => s.offsetParent !== null
        && Array.from(s.options).some(o => o.value === 'conjoint'));
      if (!sels.length) return 'aucun select detenteur';
      const s = sels[sels.length - 1];
      const setter = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set;
      setter.call(s, 'conjoint');
      s.dispatchEvent(new Event('change', { bubbles: true }));
      return 'ok ' + s.value;
    });
    console.log('DETENTEUR av:', r2);
    await page.waitForTimeout(500);
  }

  // ─── ÉTAPE 6 : objectifs ───
  await repondreNonPartout(page);
  await page.locator('button:has-text("Objectifs")').first().click();
  await page.waitForTimeout(800);
  for (const lib of ['Retraite', 'Protection', 'Fiscalité', 'Transmission']) {
    const c = page.locator('button:has-text("' + lib + '")').first();
    if (await c.count()) { try { await c.click({ timeout: 1500 }); await page.waitForTimeout(250); } catch (e) {} }
  }

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


  // ═══ CAPTURES : le mode présentation, chapitre par chapitre ═══
  const lire = () => page.evaluate(() => {
    const bar = document.querySelector('[data-nc-pres-ui]');
    const zone = document.querySelector('.nc-syn-zone');
    const vis = [];
    const ok = (el) => el.offsetParent !== null && el.getBoundingClientRect().height > 2;
    Array.prototype.forEach.call(zone.children, (el) => {
      if (el.hasAttribute('data-nc-pres-ui') || el.hasAttribute('data-nc-pres-skip')) return;
      if (el.hasAttribute('data-nc-pres-host')) {
        Array.prototype.forEach.call(el.children, (c) => { if (!c.hasAttribute('data-nc-pres-keep') && ok(c)) vis.push((c.innerText || '').replace(/\s+/g, ' ').slice(0, 90)); });
      } else if (ok(el)) vis.push((el.innerText || '').replace(/\s+/g, ' ').slice(0, 90));
    });
    const m = (bar ? bar.innerText : '').match(/chapitre\s+(\d+)\s*\/\s*(\d+)/i);
    return { idx: m ? +m[1] : null, total: m ? +m[2] : null, vis };
  });

  // le document complet d'abord (contrôle des nouveaux blocs RDV 1)
  /* 21/09/2026 : le document est lu COMME LE CLIENT LE VOIT — sans les boutons de
     correction du conseiller (✎ ✕ ↺, « + Ajouter une question »), qui ne s'impriment pas. */
  const TC = await page.evaluate(() => {
    const z = document.querySelector('.nc-syn-zone');
    const caches = Array.from(z.querySelectorAll('.nc-syn-noprint'));
    const avant = caches.map(e => e.style.display);
    caches.forEach(e => { e.style.display = 'none'; });
    const t = z.innerText.replace(/[\u00a0\u202f]/g, ' ');
    caches.forEach((e, k) => { e.style.display = avant[k]; });
    return t;
  });
  const att = (lbl, re) => console.log((re.test(TC) ? 'OK  ' : 'FAIL') + ' — ' + lbl);
  console.log('\n═══ NOUVEAUX BLOCS DU RDV 1 ═══');
  att('bloc « Votre épargne mensuelle actuelle »', /Votre épargne mensuelle actuelle/i);
  /* 17/09/2026 — le bloc reprend l'écriture de « Vos revenus mensuels » (demande du
     CGP) : une COLONNE PAR PERSONNE, le contrat à GAUCHE et le montant à DROITE.
     L'ordre lu est donc « MONSIEUR … Livrets … 200 € », et non plus « 200 € … Livret ».
     Les contrôles portent sur l'INFORMATION (qui verse, quoi, combien), pas sur
     l'ordre des mots. */
  att('le livret et son versement', /Livret[\s\S]{0,60}200 €/i);
  att("l'assurance vie et son versement", /Assurance[- ]vie[\s\S]{0,80}100 €/i);
  // 15/09/2026 (CGP) : « sois précis » — QUI verse doit être écrit noir sur blanc
  att('Monsieur nommé sur le versement de 200 €', /MONSIEUR[\s\S]{0,60}Livret[\s\S]{0,40}200 €/i);
  att('Madame nommée sur le versement de 100 €', /MADAME[\s\S]{0,60}Assurance[- ]vie[\s\S]{0,40}100 €/i);
  // 16/09/2026 (CGP) : la ligne « dont Monsieur … · Madame … » a été supprimée —
  // l'information est déjà dans les cartes juste au-dessus.
  console.log((!/dont Monsieur [\d\s\u00a0\u202f]+€/i.test(TC) ? 'OK  ' : 'FAIL') + " — plus de récapitulatif par personne (doublon supprimé)");
  att('total versé chaque mois', /Total versé chaque mois[\s\S]{0,40}300 €\/mois/i);
  att('bloc des versements programmés', /IMPORTANCE DES VERSEMENTS PROGRAMMÉS/i);
  att('rappel des objectifs au RDV 1', /Objectifs exprimés|Objectif exprimé/i);
  att('moyens : participation mensuelle', /Participation mensuelle/i);
  att('bloc « Les questions »', /(^|\n)les questions[ \t]*\n/i);
  // 15/09/2026 (CGP) : « je préfère 5 questions très pertinentes que 10 moins intéressantes »
  const blocQ = (TC.split(/(^|\n)les questions[ \t]*\n/i).slice(-1)[0] || '').split('POUR PRÉPARER NOTRE PROCHAIN')[0];
  /* compter les NUMÉROS, pas les points d'interrogation : une question validée par le
     CGP peut en contenir deux (« … ? Et vos enfants ? »). */
  const nbQ = (blocQ.split('\n').map(x => x.trim()).filter(x => /^[1-9]$/.test(x))).length;
  /* 18/09/2026 (CGP) : « on intègre une question 6 en bonus » — le placement
     déductible au taux de la TMI. Le plafond passe donc à SIX, dont cinq au plus
     issues du tirage : la sixième est toujours la bonus, et elle vient en dernier. */
  console.log(((nbQ >= 1 && nbQ <= 6) ? 'OK  ' : 'FAIL') + ` — ${nbQ} question(s) posées, six au maximum (cinq + la bonus)`);
  /* 15/09/2026 (CGP) : registre professionnel — le constat chiffré d'abord, puis la
     question. Aucune incise, aucune rhétorique, jamais deux questions imbriquées. */
  const lignesQ = blocQ.split('\n').map(x => x.trim()).filter(x => x.length > 12);
  const fautes = [];
  lignesQ.forEach(l => {
    if (/—/.test(l)) fautes.push('incise (tiret cadratin) : ' + l.slice(0, 60));
    if ((l.match(/\?/g) || []).length > 1) fautes.push('deux questions dans une : ' + l.slice(0, 60));
    if (/pourquoi sont-ils là|si ce n'est pas avant/i.test(l)) fautes.push('tournure rhétorique : ' + l.slice(0, 60));
  });
  console.log((fautes.length === 0 ? 'OK  ' : 'FAIL') + ' — registre professionnel' + (fautes.length ? ' [' + fautes.join(' | ') + ']' : ''));
  /* 18/09/2026 — DEUX OUVERTURES DE PLUS, dictées par le CGP : « Savez-vous que… »
     (l'article 990 I, le placement déductible) et « Si la banque vous faisait un
     prêt… ». La question bonus se termine par une précision APRÈS le point
     d'interrogation (« Le montant est plafonné : … ») : c'est voulu, l'ouverture
     suffit donc à la valider. */
  console.log(((lignesQ.filter(l => /^[A-ZÀÉÈ].*\.\s.*\?$/.test(l)
      || /^(Que |Comment |Quelle |Connaissez|Rattachement|Savez-vous|Si |En cas de |Dans |Vous conservez )/.test(l)).length === lignesQ.length) ? 'OK  ' : 'FAIL')
      + ' — chaque question commence par un constat ou une tournure de conseil');
  console.log(JSON.stringify(blocQ.split('\n').map(x => x.trim()).filter(Boolean)));
  console.log((/il manque\s+[\d\s\u00a0\u202f]+€/i.test(TC) ? 'FAIL' : 'OK  ') + " — plus de « il manque X € » dans l'épargne constituée");
  att('devoirs du client', /Pour préparer notre prochain rendez-vous/i);
  const iEp = TC.toUpperCase().indexOf('VOTRE ÉPARGNE MENSUELLE ACTUELLE');
  const iVp = TC.toUpperCase().indexOf('IMPORTANCE DES VERSEMENTS');
  const iOb = TC.toUpperCase().indexOf('PARTICIPATION MENSUELLE');
  const iTz = TC.search(/(^|\n)les questions[ \t]*\n/i);
  const iDv = TC.toUpperCase().indexOf('POUR PRÉPARER NOTRE PROCHAIN');
  console.log('ORDRE:', JSON.stringify({ iEp, iVp, iOb, iTz, iDv }));
  console.log(((iEp < iVp && iVp < iOb && iOb < iTz && iTz < iDv) ? 'OK  ' : 'FAIL') + ' — ordre demandé : épargne actuelle → versements → objectifs/moyens → teaser → devoirs');

  await page.locator('button:has-text("Présenter")').first().click();
  await page.waitForTimeout(900);
  const e0 = await lire();
  console.log('\nCHAPITRES:', e0.total);
  for (let i = 0; i < e0.total; i++) {
    const e = await lire();
    console.log(' · ' + e.idx + '/' + e.total + ' → ' + e.vis.join(' ⟂ ').slice(0, 130));
    await page.screenshot({ path: 'pres_' + String(i + 1).padStart(2, '0') + '.png' });
    if (i < e0.total - 1) { await page.keyboard.press('ArrowRight'); await page.waitForTimeout(420); }
  }
  console.log('\nPAGEERRORS:', errs.length ? errs.slice(0, 3).join(' | ') : 'aucune');
  await browser.close();
})();
