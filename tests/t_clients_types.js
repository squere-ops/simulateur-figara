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
const { passerFenetres, pourquoiBloque } = require('./_aide');
const setN = async (el, v) => el.evaluate((n, val) => { const s = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set; s.call(n, val); n.dispatchEvent(new Event('input', { bubbles: true })); }, v);

let ko = 0;
const OK = (m) => console.log('OK   — ' + m);
const KO = (m) => { console.log('FAIL — ' + m); ko++; };

const ouvrirAudit = async (page) => {
  await page.goto((process.env.PW_PAGE || 'http://localhost:8899/test_local.html') + '?etude=1', { waitUntil: 'networkidle' });
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
/* 26/10/2026 : les quatre fiches ont été réécrites depuis le 23/09 (Faure, Roussel, Lambert,
   Moreau — v266/v269). Les attentes suivent NC_CLIENTS_TYPES dans index.html : si une fiche
   change, on met à jour ici en lisant le code, pas de mémoire. */
const ATTENDUS = {
  celib: [
    ['nom', /Julien FAURE|FAURE/],
    ['salaire 4 225 € (3 900 × 13 mois)', /4[\s  ]?225/],
    ['loyer 980 €', /980/],
    ['crédit auto', /auto|véhicule/i],
  ],
  pacse: [
    ['les deux prénoms', /Claire[\s\S]*Maxime|Maxime[\s\S]*Claire/],
    ['revenus du foyer 7 500 €', /7[\s  ]?500/],
    ['PACS', /pacs/i],
    ['deux enfants', /Jade|Noé/],
  ],
  marie: [
    ['les deux prénoms', /Olivier[\s\S]*Isabelle|Isabelle[\s\S]*Olivier/],
    ['trois enfants', /Manon|Hugo|Lina/],
    ['question bonus à la TMI du bloc fiscal', 'TMI'],
    ['locatif 690 €', /690/],
  ],
  veuf: [
    ['nom', /Jacqueline MOREAU|MOREAU/],
    ['veuve', /veu[fv]/i],
    ['livret 22 950 €', /22[\s  ]?950/],
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
    await page.waitForTimeout(600);
    /* 26/10/2026 : la confirmation « Remplacer le dossier en cours ? » est désormais une fenêtre
       maison (plus un confirm() natif) — on clique « Remplacer ». */
    { const r = page.locator('button:text-is("Remplacer")').first(); if (await r.count()) { await r.click(); await page.waitForTimeout(600); } }
    await page.waitForTimeout(400);
    await passerFenetres(page);
    const syn = page.locator('button:has-text("Synthèse")').first();
    try { await syn.click({ timeout: 8000 }); }
    catch (e) {
      console.log('CLIC SYNTHESE IMPOSSIBLE — écran :', (await page.evaluate(() => document.body.innerText)).replace(/\n+/g, ' | ').slice(-600));
      KO(cle + ' : le bouton Synthèse est recouvert ou absent'); continue;
    }
    await page.waitForTimeout(1600);

    /* 21/09/2026 : la fenêtre des incohérences peut s'ouvrir en quittant les objectifs —
       le banc la franchit par « Continuer quand même » (elle a son propre banc). */
    { const bInc = page.locator('[data-nc-inco="1"] button:has-text("Continuer quand même")'); if (await bInc.count()) { await bInc.first().click(); await page.waitForTimeout(1600); } }
    await passerFenetres(page);
    if (process.env.PW_DEBUG) {
      console.log('BLOQUE?', JSON.stringify(await pourquoiBloque(page)));
      console.log('ETAT:', JSON.stringify(await page.evaluate(() => {
        const bs = Array.from(document.querySelectorAll('button'));
        const t = (b) => b.innerText.trim().replace(/\s+/g, ' ');
        return { ficheOuverte: bs.some(b => /Enregistrer et fermer/.test(t(b))), synth: bs.filter(b => /Synthèse/.test(t(b))).map(b => t(b) + (b.offsetParent ? '' : '(cachée)')), etapeActive: bs.filter(b => /text-white/.test(b.className) && /^[1-8] |^(État civil|Famille|Activité|Patrimoine|Fiscalité|Objectifs|Profil|Synthèse)/.test(t(b))).map(t), niveau: bs.filter(b => /Audit patrimonial complet|Fiche rapide/.test(t(b))).map(b => t(b).slice(0, 28) + (/border-red/.test(b.className) ? '[actif]' : '')), corps: document.body.innerText.replace(/\n+/g, ' | ').slice(-700) };
      })));
    }
    /* un éventuel garde-fou (capacité d'épargne) : on le signale, sans le contourner */
    const garde = await page.evaluate(() => /capacité d'épargne/i.test(document.body.innerText) && !document.querySelector('.nc-syn-zone'));
    if (garde) { KO(cle + ' : un garde-fou bloque l\'accès à la synthèse'); continue; }
    let txt = await page.evaluate(() => (document.querySelector('.nc-syn-zone') || { innerText: '' }).innerText);
    /* RDV 2 pour les attendus qui n'y figurent qu'au second rendez-vous */
    const s2 = page.locator('button:text-is("Analyse R2")').first();
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
      else { KO(cle + ' : « ' + lib + ' » absent de la synthèse — un champ de la fiche est mal nommé ou mal rempli'); if (process.env.PW_DEBUG) console.log('   lignes revenus :', txt.split('\n').filter(l => /revenu|salaire|€/i.test(l)).slice(0, 12).map(l => l.trim().slice(0, 90)).join(' | ')); }
    }
  }

  console.log('\nPAGEERRORS:', errs.length ? errs.slice(0, 3).join(' | ') : 'aucune');
  if (errs.length) ko++;
  await browser.close();
  console.log(ko ? '\nCLIENTS TYPES : ' + ko + ' DÉFAUT(S)' : '\nCLIENTS TYPES : LES QUATRE SE CHARGENT ET PARLENT');
  process.exit(ko ? 1 : 0);
})();
