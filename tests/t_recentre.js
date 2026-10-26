/* ═══════════════════════════════════════════════════════════════════════════
   LE DOSSIER MARTIN, RELU COMME LE CGP (21/09/2026)

   « Comment peux-tu dire, dans les points forts, capacité d'emprunt disponible
   = 0 € ? Comment peux-tu dire qu'il a une trésorerie court terme trop importante
   alors qu'il va acquérir sa résidence principale d'ici un an et y consacrer une
   grosse partie de son épargne ? […] Tu ne peux pas dire que son épargne est à
   zéro quand il va prendre 1 200 €/mois de crédit pour sa RP. […] Il faut le
   féliciter d'acquérir sa RP, lui dire qu'il est jeune et qu'il est essentiel de
   préparer sa retraite par un PER et une assurance-vie, regarder pour une
   délégation d'assurance de prêt. Rien de plus. »
   Et : noter les incohérences dans un pop-up.

   Client type « Célibataire » (Thomas MARTIN) : locataire, projet RP 1 200 €/mois
   avec 40 000 € d'apport, 57 950 € d'épargne, objectif « investissement
   locatif », apport déclaré 30 000 à 50 000 €.
   ═══════════════════════════════════════════════════════════════════════════ */
const { chromium } = require('playwright');
const setN = async (el, v) => el.evaluate((n, val) => { const s = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set; s.call(n, val); n.dispatchEvent(new Event('input', { bubbles: true })); }, v);
let ko = 0;
const OK = (m) => console.log('OK   — ' + m);
const KO = (m) => { console.log('FAIL — ' + m); ko++; };
const norm = (t) => String(t || '').replace(/[  ]/g, ' ');

(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const page = await browser.newPage({ viewport: { width: 1440, height: 950 } });
  await page.addInitScript(() => { window.__NC_FORCE_DEMO = true; });
  const errs = [];
  page.on('pageerror', e => { if (!/tailwind is not defined/.test(String(e))) errs.push(String(e)); });
  page.on('dialog', dl => dl.accept());
  await page.goto('http://localhost:8899/test_local.html?etude=1', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1300);
  if (await page.locator('text=Accéder au simulateur').count()) {
    const inps = page.locator('input'); await setN(inps.nth(0), 'UP'); await setN(inps.nth(1), 'T');
    await page.locator('button:has-text("Accéder au simulateur")').first().click(); await page.waitForTimeout(900);
  }
  await page.locator('button:has-text("Nouveau client")').first().click(); await page.waitForTimeout(700);
  const b = page.locator('button, [role=button]').filter({ hasText: /complète|complet/i }).first();
  if (await b.count()) { try { await b.click({ timeout: 2000 }); } catch (e) {} }
  await page.waitForTimeout(700);
  await page.locator('[data-nc-client-type="celib"]').click(); await page.waitForTimeout(900);

  /* ═══ 1 · LA FENÊTRE DES INCOHÉRENCES ═══ */
  console.log('\n═══ 1 · INCOHÉRENCES ═══');
  await page.locator('button:has-text("Synthèse")').first().click(); await page.waitForTimeout(1200);
  const inco = await page.evaluate(() => { const m = document.querySelector('[data-nc-inco="1"]'); return m ? m.innerText : null; });
  if (!inco) KO('aucune fenêtre d\'incohérences en quittant les objectifs');
  else {
    const t = norm(inco);
    if (!/Investissement locatif/.test(t) || !/résidence principale/i.test(t)) KO('incohérence « investissement locatif » absente ou sans sa raison'); else OK('incohérence : investissement locatif impossible sans sacrifier la résidence principale');
    if (!/Apport initial mobilisable/.test(t) || !/40 000 €/.test(t) || !/17 950 €/.test(t)) KO('incohérence « apport » absente ou mal chiffrée (attendu : 40 000 € d\'apport RP, 17 950 € restants) — lu « ' + t.slice(0, 300) + ' »');
    else OK('incohérence : apport de 30 à 50 k€ impossible — 40 000 € partent dans la RP, 17 950 € restent');
    /* « Corriger la saisie » referme sans avancer */
    await page.locator('[data-nc-inco="1"] button:has-text("Corriger la saisie")').click(); await page.waitForTimeout(600);
    const encore = await page.evaluate(() => !!document.querySelector('.nc-syn-zone'));
    if (encore) KO('« Corriger la saisie » a ouvert la synthèse au lieu de rester sur la saisie'); else OK('« Corriger la saisie » reste sur la saisie');
    await page.locator('button:has-text("Synthèse")').first().click(); await page.waitForTimeout(1000);
    await page.locator('[data-nc-inco="1"] button:has-text("Continuer quand même")').click(); await page.waitForTimeout(1800);
  }

  const zone = () => page.evaluate(() => {
    const z = document.querySelector('.nc-syn-zone'); if (!z) return '';
    const c = Array.from(z.querySelectorAll('.nc-syn-noprint')); const av = c.map(e => e.style.display);
    c.forEach(e => { e.style.display = 'none'; }); const t = z.innerText; c.forEach((e, k) => { e.style.display = av[k]; }); return t;
  });

  /* ═══ 2 · L'AUDIT (RDV 1) ═══ */
  console.log('\n═══ 2 · AUDIT ═══');
  const A = norm(await zone());
  const bloc = (T, titre) => { const i = T.toUpperCase().indexOf(titre.toUpperCase()); if (i < 0) return ''; const r = T.slice(i + titre.length); const j = r.search(/\n[A-ZÉÈ][A-ZÉÈ '’&\-]{6,}\n/); return j > 0 ? r.slice(0, j) : r.slice(0, 900); };
  const obj = bloc(A, 'Objectifs recommandés par le cabinet');
  const pre = bloc(A, 'Préconisations');
  if (/capacité d'endettement/i.test(obj)) KO('objectifs recommandés : « utiliser votre capacité d\'endettement » alors qu\'elle est mobilisée par la RP');
  else OK('objectifs recommandés : plus de capacité d\'endettement à utiliser');
  if (!/PER/.test(obj) || !/assurance-vie/i.test(obj) || !/délégation/i.test(obj)) KO('objectifs recommandés : attendu retraite (PER + assurance-vie) et délégation d\'assurance — lu « ' + obj.slice(0, 250) + ' »');
  else OK('objectifs recommandés : retraite par PER et assurance-vie, délégation d\'assurance de prêt');
  if (/investissement immobilier locatif/i.test(pre)) KO('préconisations : investissement locatif proposé alors qu\'il n\'y a plus de place');
  else OK('préconisations : plus d\'investissement locatif');
  const nbPre = (pre.match(/\n(Ouverture|Versements|Audit|Délégation|Création|L'ouverture|Réalisation)/g) || []).length;
  if (!/PER/.test(pre) || !/assurance-vie/i.test(pre) || !/Délégation d'assurance emprunteur/.test(pre)) KO('préconisations : attendu PER, assurance-vie, délégation — lu « ' + pre.slice(0, 250) + ' »');
  else OK('préconisations : PER, assurance-vie, délégation d\'assurance emprunteur');
  if (/info-retraite/i.test(pre)) KO('préconisations : « rien de plus » — la création d\'espace info-retraite.fr y figure encore');
  else OK('préconisations : rien de plus');
  const qs = bloc(A, 'Les questions');
  const nums = (qs.split('\n').map(x => x.trim()).filter(x => /^[1-9]$/.test(x))).length;
  if (nums > 2) KO('questions : ' + nums + ' questions — attendu la retraite et la bonus seulement');
  else OK('questions : ' + nums + ' (retraite + bonus)');

  /* ═══ 3 · SECOND RENDEZ-VOUS : POINTS FORTS ET AXES ═══ */
  console.log('\n═══ 3 · POINTS FORTS ET AXES ═══');
  const s2 = page.locator('button:has-text("Simulation")').first();
  await s2.click(); await page.waitForTimeout(1300);
  const P = norm(await zone());
  const forts = bloc(P, 'Les points forts du dossier');
  const axes = bloc(P, "Les axes de travail et d'amélioration");
  if (/Capacité d'emprunt disponible/.test(forts)) KO('points forts : « capacité d\'emprunt disponible » encore là');
  else OK('points forts : plus de capacité d\'emprunt à 0 €');
  if (!/Acquisition de votre résidence principale/.test(forts)) KO('points forts : l\'acquisition de la résidence principale n\'est pas saluée');
  else OK('points forts : acquisition de la résidence principale saluée');
  if (!/capital remboursé/i.test(forts)) KO('points forts : l\'épargne immobilière (capital remboursé) n\'est pas dite');
  else OK('points forts : épargne immobilière — capital remboursé chaque mois');
  if (/trésorerie beaucoup trop importante/i.test(P)) KO('« trésorerie beaucoup trop importante » alors que l\'apport part dans la RP');
  else OK('plus de « trésorerie trop importante »');
  if (/Absence totale d'épargne mensuelle/i.test(P)) KO('« absence totale d\'épargne mensuelle » alors qu\'il rembourse du capital chaque mois');
  else OK('plus d\'« absence totale d\'épargne mensuelle »');
  if (!/Préparer votre retraite/.test(axes) || !/Assurance de votre prêt/.test(axes)) KO('axes : attendu « Préparer votre retraite » et « Assurance de votre prêt » — lu « ' + axes.slice(0, 250) + ' »');
  else OK('axes : préparer la retraite, assurance du prêt');
  const nbAxes = (axes.match(/\n(Préparer votre retraite|Assurance de votre prêt|[A-ZÉ][^\n]{3,60} — )/g) || []).length;
  if (/Fiscalité subie|Taux d'effort|Pas d'assurance-vie|Aucun dispositif retraite/.test(axes)) KO('axes : « rien de plus » — il reste des axes hors des trois sujets');
  else OK('axes : rien de plus');

  /* ═══ 4 · 21/09 (suite) — ÉPARGNE APRÈS LE PROJET, FINANCIER AVANT / APRÈS ═══ */
  console.log('\n═══ 4 · APRÈS LE PROJET RP ═══');
  await page.locator('button:has-text("Audit et synthèse")').first().click(); await page.waitForTimeout(1200);
  const E = await page.evaluate(() => { const e = document.querySelector('[data-nc-epargne-apres-rp="1"]'); return e ? e.innerText : null; });
  if (!E) KO('bloc « Épargne après le projet de résidence principale » absent');
  else {
    const t = norm(E);
    if (!/17 950 €/.test(t) || !/40 000 €/.test(t) || !/57 950 €/.test(t)) KO('épargne après le projet : attendu 57 950 € → 17 950 € (40 000 € d\'apport) — lu « ' + t.slice(0, 200) + ' »');
    else OK('épargne après le projet : 57 950 € aujourd\'hui, 40 000 € d\'apport, 17 950 € restent — avec son curseur');
  }
  const A2 = norm(await zone());
  const fin = (A2.split(/LE FINANCIER/i)[1] || '').slice(0, 500);
  if (!/Aujourd'hui/i.test(fin) || !/Après le projet RP/i.test(fin)) KO('« Le financier » : attendu avant ET après le projet RP — lu « ' + fin.slice(0, 200) + ' »');
  else OK('« Le financier » : aujourd\'hui et après le projet RP');
  if (/Sortie totale de trésorerie/i.test(A2)) KO('« Sortie totale de trésorerie » dans le document'); else OK('document : plus de « Sortie totale de trésorerie »');

  /* ═══ 5 · RÈGLE DES 25 % — même dossier SANS projet RP (endettement 31,6 %) ═══ */
  console.log('\n═══ 5 · RÈGLE DES 25 % ═══');
  await page.locator('button:has-text("État civil")').first().click(); await page.waitForTimeout(900);
  const bNon = page.locator("text=Un projet d'achat de résidence principale").first().locator('xpath=following::button[normalize-space()="Non"][1]');
  const nonProjet = (await bNon.count()) > 0;
  if (nonProjet) { await bNon.click(); }
  if (!nonProjet) KO('impossible de répondre « Non » au projet RP pour tester la règle des 25 %');
  else {
    await page.waitForTimeout(600);
    await page.locator('button:has-text("Synthèse")').first().click(); await page.waitForTimeout(1200);
    { const bInc = page.locator('[data-nc-inco="1"] button:has-text("Continuer quand même")'); if (await bInc.count()) { await bInc.first().click(); await page.waitForTimeout(1500); } }
    const r25 = await page.evaluate(() => { const e = document.querySelector('[data-nc-regle-25="1"]'); return e ? e.innerText : null; });
    if (!r25) KO('endettement au-dessus de 25 % : la règle « à valider avec le courtier en crédit » n\'apparaît pas');
    else OK('au-dessus de 25 % d\'endettement : « projet immobilier locatif à valider avec les éléments précis du dossier et le courtier en crédit »');
  }

  console.log('\nPAGEERRORS:', errs.length ? errs.slice(0, 3).join(' | ') : 'aucune');
  if (errs.length) ko++;
  await browser.close();
  console.log(ko ? '\nDOSSIER MARTIN : ' + ko + ' DÉFAUT(S)' : '\nDOSSIER MARTIN : LU APRÈS L\'ACHAT, RECENTRÉ, INCOHÉRENCES SIGNALÉES');
  process.exit(ko ? 1 : 0);
})();
