/* ═══════════════════════════════════════════════════════════════════════════
   LES QUATRE CLIENTS TYPES DE LA VERSION DÉMO (21/09/2026)

   Le CGP : « est-ce qu'il est possible d'enregistrer deux ou trois clients
   types afin que je ne doive pas systématiquement re-remplir tout de A à Z ?
   Un célibataire, un pacsé, un marié, un veuf. » Fiches validées le 21/09.

   Ce banc vérifie :
   0. sans le drapeau démo (production), les boutons N'EXISTENT PAS ;
   1. avec le drapeau, les quatre boutons sont là ;
   2. chaque client type se charge, la synthèse s'ouvre sans erreur, et le
      document fait sortir CE POUR QUOI la fiche a été bâtie (un chiffre ou un
      mot lu dans la synthèse — un champ mal nommé dans la fiche le rend muet).
   ═══════════════════════════════════════════════════════════════════════════ */
const { chromium } = require('playwright');
const setN = async (el, v) => el.evaluate((n, val) => { const s = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set; s.call(n, val); n.dispatchEvent(new Event('input', { bubbles: true })); }, v);

let ko = 0;
const OK = (m) => console.log('OK   — ' + m);
const KO = (m) => { console.log('FAIL — ' + m); ko++; };

const ouvrirAudit = async (page) => {
  await page.goto('http://localhost:8899/test_local.html?etude=1', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1400);
  if (await page.locator('text=Accéder au simulateur').count()) {
    const inps = page.locator('input');
    await setN(inps.nth(0), 'UP'); await setN(inps.nth(1), 'T');
    await page.locator('button:has-text("Accéder au simulateur")').first().click();
    await page.waitForTimeout(900);
  }
  await page.locator('button:has-text("Nouveau client")').first().click();
  await page.waitForTimeout(700);
  const b = page.locator('button, [role=button]').filter({ hasText: /complète|complet/i }).first();
  if (await b.count()) { try { await b.click({ timeout: 2000 }); } catch (e) {} }
  await page.waitForTimeout(700);
};

/* ce que chaque fiche doit faire sortir dans la synthèse (constat puis RDV 2) */
const ATTENDUS = {
  celib: [
    ['nom', /Thomas MARTIN|MARTIN/],
    ['revenus 3 800 €', /3[\s  ]?800/],
    ['loyer 950 €', /950/],
    ['crédit auto', /auto/i],
  ],
  pacse: [
    ['les deux prénoms', /Julie[\s\S]*Nicolas|Nicolas[\s\S]*Julie/],
    ['revenus du foyer 7 300 €', /7[\s  ]?300/],
    ['PACS', /pacs/i],
    ['deux enfants', /Léa|Hugo/],
  ],
  marie: [
    ['les deux prénoms', /Philippe[\s\S]*Catherine|Catherine[\s\S]*Philippe/],
    ['trois enfants', /Camille|Antoine|Chloé/],
    /* la question bonus annonce la TMI CALCULÉE par le moteur (30 % pour ce foyer :
       147 600 € sur 4 parts). La fiche validée disait 41 % à tort : le banc lit la
       TMI du bloc fiscal et vérifie que la question dit la même chose. */
    ['question bonus à la TMI du bloc fiscal', 'TMI'],
    ['locatif 780 €', /780/],
  ],
  veuf: [
    ['nom', /Monique BERNARD|BERNARD/],
    ['pension 2 400 €', /2[\s  ]?400/],
    ['veuve', /veu[fv]/i],
    ['assurance-vie 180 000 €', /180[\s  ]?000/],
  ],
};

(async () => {
  const browser = await chromium.launch({ executablePath: process.env.PW_CHROMIUM || undefined });

  /* ═══ 0 · PRODUCTION : AUCUN BOUTON ═══ */
  {
    const page = await browser.newPage({ viewport: { width: 1440, height: 950 } });
    await ouvrirAudit(page);
    const n = await page.locator('[data-nc-clients-types="1"]').count();
    if (n) KO('en production (sans drapeau démo), les boutons « client type » s\'affichent');
    else OK('en production, aucun bouton « client type »');
    await page.close();
  }

  /* ═══ 0 bis · FICHIER OUVERT EN LOCAL (file://) : LES BOUTONS SONT LÀ ═══
     21/09/2026 : le CGP ouvre index.html depuis son dossier. C'est la version
     production, mais sur SON poste : les boutons doivent y apparaître. */
  {
    const page = await browser.newPage({ viewport: { width: 1440, height: 950 } });
    page.on('dialog', dl => dl.accept());
    await page.goto('file://' + __dirname + '/test_local.html?etude=1', { waitUntil: 'load' });
    await page.waitForTimeout(2500);
    if (await page.locator('text=Accéder au simulateur').count()) {
      const inps = page.locator('input');
      await setN(inps.nth(0), 'UP'); await setN(inps.nth(1), 'T');
      await page.locator('button:has-text("Accéder au simulateur")').first().click();
      await page.waitForTimeout(900);
    }
    const nc = page.locator('button:has-text("Nouveau client")').first();
    if (await nc.count()) {
      await nc.click(); await page.waitForTimeout(700);
      const bc = page.locator('button, [role=button]').filter({ hasText: /complète|complet/i }).first();
      if (await bc.count()) { try { await bc.click({ timeout: 2000 }); } catch (e) {} }
      await page.waitForTimeout(700);
      const n = await page.locator('[data-nc-clients-types="1"]').count();
      if (!n) KO('fichier ouvert en local (file://) : les boutons « client type » n\'apparaissent pas');
      else OK('fichier ouvert en local (file://) : les boutons « client type » sont là');
    } else KO('fichier ouvert en local : l\'application ne se charge pas');
    await page.close();
  }

  /* ═══ 1 et 2 · DÉMO : LES QUATRE CLIENTS ═══ */
  const page = await browser.newPage({ viewport: { width: 1440, height: 950 } });
  await page.addInitScript(() => { window.__NC_FORCE_DEMO = true; });
  const errs = [];
  page.on('pageerror', e => { if (!/tailwind is not defined/.test(String(e))) errs.push(String(e)); });
  page.on('console', m => { if (m.type() === 'error' && /render error/i.test(m.text())) errs.push(m.text().slice(0, 300)); });
  page.on('dialog', dl => dl.accept());
  await ouvrirAudit(page);

  const boutons = await page.evaluate(() => Array.from(document.querySelectorAll('[data-nc-client-type]')).map(b => b.getAttribute('data-nc-client-type')));
  if (JSON.stringify(boutons) !== JSON.stringify(['celib', 'pacse', 'marie', 'veuf'])) KO('version démo : boutons attendus celib, pacse, marie, veuf — lus ' + JSON.stringify(boutons));
  else OK('version démo : les quatre boutons sont là');

  for (const cle of ['celib', 'pacse', 'marie', 'veuf']) {
    console.log('\n═══ ' + cle.toUpperCase() + ' ═══');
    /* revenir à l'étape 1 pour recharger */
    const e1 = page.locator('button:has-text("État civil")').first();
    if (await e1.count()) { await e1.click(); await page.waitForTimeout(600); }
    const b = page.locator('[data-nc-client-type="' + cle + '"]');
    if (!(await b.count())) { KO(cle + ' : bouton introuvable'); continue; }
    await b.click();
    await page.waitForTimeout(900);
    const syn = page.locator('button:has-text("Synthèse")').first();
    await syn.click();
    await page.waitForTimeout(1600);

    /* 21/09/2026 : la fenêtre des incohérences peut s'ouvrir en quittant les objectifs —
       le banc la franchit par « Continuer quand même » (elle a son propre banc). */
    { const bInc = page.locator('[data-nc-inco="1"] button:has-text("Continuer quand même")'); if (await bInc.count()) { await bInc.first().click(); await page.waitForTimeout(1600); } }
    /* un éventuel garde-fou (capacité d'épargne) : on le signale, sans le contourner */
    const garde = await page.evaluate(() => /capacité d'épargne/i.test(document.body.innerText) && !document.querySelector('.nc-syn-zone'));
    if (garde) { KO(cle + ' : un garde-fou bloque l\'accès à la synthèse'); continue; }
    let txt = await page.evaluate(() => (document.querySelector('.nc-syn-zone') || { innerText: '' }).innerText);
    /* RDV 2 pour les attendus qui n'y figurent qu'au second rendez-vous */
    const s2 = page.locator('button:has-text("Simulation")').first();
    if (await s2.count()) { await s2.click(); await page.waitForTimeout(1200); txt += '\n' + await page.evaluate(() => (document.querySelector('.nc-syn-zone') || { innerText: '' }).innerText); }
    const s1 = page.locator('button:has-text("Audit et synthèse")').first();
    if (await s1.count()) { await s1.click(); await page.waitForTimeout(800); }
    if (txt.length < 500) { KO(cle + ' : la synthèse est vide (' + txt.length + ' caractères)'); continue; }
    for (const [lib, re] of ATTENDUS[cle]) {
      if (re === 'TMI') {
        const tmiBloc = (txt.match(/TRANCHE MARGINALE \(TMI\)\s*(\d+)/i) || [])[1];
        const tmiQ = (txt.match(/rendement de (\d+)[\s\u00a0\u202f]?%/) || [])[1];
        if (!tmiBloc || !tmiQ) KO(cle + ' : TMI du bloc fiscal (' + tmiBloc + ') ou question bonus (' + tmiQ + ') introuvable');
        else if (tmiBloc !== tmiQ) KO(cle + ' : la question bonus annonce ' + tmiQ + ' % alors que le bloc fiscal calcule ' + tmiBloc + ' %');
        else OK(cle + ' : question bonus à ' + tmiQ + ' %, la TMI calculée par le moteur');
        continue;
      }
      if (re.test(txt)) OK(cle + ' : ' + lib);
      else KO(cle + ' : « ' + lib + ' » absent de la synthèse — un champ de la fiche est mal nommé ou mal rempli');
    }
  }

  console.log('\nPAGEERRORS:', errs.length ? errs.slice(0, 3).join(' | ') : 'aucune');
  if (errs.length) ko++;
  await browser.close();
  console.log(ko ? '\nCLIENTS TYPES : ' + ko + ' DÉFAUT(S)' : '\nCLIENTS TYPES : LES QUATRE SE CHARGENT ET PARLENT');
  process.exit(ko ? 1 : 0);
})();
