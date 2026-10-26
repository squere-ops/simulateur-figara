const { chromium } = require('playwright');
const { passerFenetres } = require('./_aide');
const setNative = async (page, el, value) => {
  await el.evaluate((node, v) => {
    const proto = node.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    Object.getOwnPropertyDescriptor(proto, 'value').set.call(node, v);
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
  const browser = await chromium.launch({ executablePath: process.env.PW_CHROMIUM || undefined });
  const page = await browser.newPage({ viewport: { width: 1400, height: 950 } });
  const errs = [];
  page.on('pageerror', e => { if (!/tailwind is not defined/.test(String(e))) errs.push(String(e)); });
  // Piège (03/09/2026) : une erreur React attrapée par l'ErrorBoundary NE remonte
  // PAS en 'pageerror' (c'est tout le sens d'un ErrorBoundary) — seul un
  // console.error('[FIGARA] render error', ...) la trahit. 'pageerror' seul
  // laisse passer un écran "Une erreur technique est survenue" sans le voir.
  page.on('console', msg => { if (msg.type() === 'error' && /\[FIGARA\] render error/.test(msg.text())) errs.push('[FIGARA render error] ' + msg.text()); });
  await page.goto((process.env.PW_PAGE || 'http://localhost:8899/test_local.html') + '?etude=1', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  if (await page.locator('text=Accéder au simulateur').count()) {
    const inps = page.locator('input');
    await setNative(page, inps.nth(0), 'Universel Patrimoine');
    await setNative(page, inps.nth(1), 'Test');
    await page.locator('button:has-text("Accéder au simulateur")').first().click();
    await page.waitForTimeout(1200);
  }
  await page.locator('button:has-text("Nouveau client")').first().click();
  await page.waitForTimeout(800);
  const btn = page.locator('button, [role=button]').filter({ hasText: /complète|complet/i }).first();
  if (await btn.count()) { try { await btn.click({ timeout: 2000 }); } catch (e) {} }
  await page.waitForTimeout(600);
  const mod = page.locator('div.fixed.inset-0').last();

  // Étape 1 : locataire, loyer 1 500, PROJET D'ACHAT RP oui, mensualité envisagée 2 000
  await setNative(page, page.locator('input[placeholder="DUPONT"]:visible').last(), 'PROJETRP');
  await setNative(page, page.locator('input[placeholder="Marie"]:visible').last(), 'Luc');
  await mod.locator('button:has-text("Célibataire")').first().click();
  await page.waitForTimeout(300);
  await page.locator('text=Banque principale').first().locator('xpath=following::select[1]').selectOption('Crédit Agricole');
  await page.waitForTimeout(300);
  await mod.locator('button:text-is("Locataire")').first().click();
  await page.waitForTimeout(400);
  const loyerInp = page.locator('div:has(> div:text-is("Montant du loyer")) input').first();
  await setNative(page, loyerInp, '1500');
  await page.waitForTimeout(300);
  await page.locator("text=Un projet d'achat de résidence principale ?").locator('xpath=following::button[normalize-space()="Oui"][1]').click();
  await page.waitForTimeout(400);
  const horiz = mod.locator('button:has-text("1 – 3 ans")').first();
  if (await horiz.count()) { await horiz.click(); await page.waitForTimeout(250); }
  const mensInp = page.locator('text=Mensualité de crédit envisagée').locator('xpath=following::input[@type="range"][1]').first();
  await setNative(page, mensInp, '2000');
  await page.waitForTimeout(400);
  // Régression du 03/09/2026 : le bloc "Coût global de l'opération" (visible dès que
  // mensualité ET durée sont renseignées) plantait l'écran ("Une erreur technique est
  // survenue") faute d'un `eur` défini dans ce composant — jamais couvert car ce test
  // ne touchait avant que le seul curseur Mensualité, où le bloc ne s'affiche pas
  // encore (il attend aussi une durée > 0). Durée/Apport/Taux DOIVENT être renseignés
  // pour exercer ce bloc.
  const dureeInp = page.locator('text=Durée du crédit envisagée').locator('xpath=following::input[@type="range"][1]').first();
  await setNative(page, dureeInp, '20');
  await page.waitForTimeout(300);
  const apportInp = page.locator('text=Apport prévu').locator('xpath=following::input[@type="range"][1]').first();
  await setNative(page, apportInp, '50000');
  await page.waitForTimeout(300);
  const tauxInp = page.locator('text=Taux du crédit envisagé').locator('xpath=following::input[@type="range"][1]').first();
  await setNative(page, tauxInp, '3.5');
  await page.waitForTimeout(400);
  console.log((!(await page.evaluate(() => /erreur technique/i.test(document.body.innerText))) ? 'OK  ' : 'FAIL') + ' — pas d\'écran d\'erreur après saisie durée/apport/taux du projet RP');
  // Régression du 03/09/2026 (2e bug le même jour) : ce curseur, seul de tout le bloc
  // à manipuler un pourcentage décimal (step 0.05), oubliait le prop `dec` de <Slider>
  // — le composant traitait alors "3.5" comme un entier en supprimant le point
  // (parseInt sur les chiffres seuls), affichant "350 %" au lieu de "3,5 %" et rendant
  // le curseur inutilisable au-delà de quelques crans. Verrouiller l'affichage exact.
  const tauxLabel = await page.locator('text=Taux du crédit envisagé').locator('xpath=following::span[contains(@class,"num")][1]').first().innerText();
  console.log((tauxLabel.trim() === '3,5 %' ? 'OK  ' : 'FAIL') + ` — curseur Taux affiche "3,5 %" (lu : "${tauxLabel.trim()}")`);
  const coutT = await page.evaluate(() => document.body.innerText.replace(/[  ]/g, ' '));
  console.log((/Coût global de l'opération/i.test(coutT) ? 'OK  ' : 'FAIL') + ' — carte "Coût global de l\'opération" affichée');
  console.log((/344 852/.test(coutT) ? 'OK  ' : 'FAIL') + ' — capital empruntable 344 852 € (2 000 €/mois, 20 ans, 3,5 %)');
  console.log((/394 852/.test(coutT) ? 'OK  ' : 'FAIL') + ' — budget d\'acquisition 394 852 € (capital + apport 50 000 €)');
  /* 21/09/2026 (CGP, second rappel) : « Sortie totale de trésorerie » retirée aussi de la carte « Coût global ». */
  console.log((/Sortie totale de trésorerie/i.test(coutT) ? 'FAIL' : 'OK  ') + ' — carte Coût global : plus de ligne « Sortie totale de trésorerie »');

  // Étape 3 : salarié 120 000 €/an (10 000 €/mois nets retenus)
  await repondreNonPartout(page);
  await page.locator('button:has-text("Activité & revenus")').first().click();
  await page.waitForTimeout(600);
  await mod.locator('button:has-text("Salarié")').first().click();
  await page.waitForTimeout(400);
  await setNative(page, page.locator('span:text-is("Salaire fixe")').first().locator('xpath=ancestor::div[2]//input[not(@type="range")]').first(), '120000');
  await page.waitForTimeout(400);

  // Étape 5 : épargne salariale chez Amundi + compte courant Crédit Agricole
  // (règle 29/08 : la banque ressort dans la tuile Activité, JAMAIS celle de l'épargne salariale)
  await repondreNonPartout(page);
  await page.locator('button:has-text("Patrimoine & épargne")').first().click();
  await page.waitForTimeout(600);
  await page.locator("text=Avez-vous de l'épargne ou des placements ?").locator('xpath=following::button[normalize-space()="Oui"][1]').click();
  await page.waitForTimeout(600);
  await page.locator('text=Type de placement').first().locator('xpath=following::select[1]').selectOption('epargne_salariale');
  await page.waitForTimeout(400);
  await page.locator('button:has-text("fiche du placement")').first().click();
  await page.waitForTimeout(500);
  await setNative(page, page.locator('input[placeholder="Ex. Generali, Crédit Agricole…"]:visible').last(), 'Amundi');
  await page.waitForTimeout(300);
  await page.locator('button:has-text("C\'est noté")').last().click();
  await page.waitForTimeout(400);

  // Synthèse
  await repondreNonPartout(page);
  await page.locator('button:has-text("Synthèse")').first().click();
  await passerFenetres(page);
  await page.waitForTimeout(900);
  if (await page.evaluate(() => /un instant/i.test(document.body.innerText))) {
    const p35 = page.locator('button:has-text("300 – 500")').last();
    if (await p35.count()) { await p35.click(); await page.waitForTimeout(300); }
    const ap = page.locator('button:has-text("10 000 – 30 000 €")').last();
    if (await ap.count()) { await ap.click(); await page.waitForTimeout(300); }
    const gT = await page.evaluate(() => document.body.innerText.replace(/[\u202f\u00a0]/g, ' '));
    console.log((/Et quel apport initial pourriez-vous mobiliser au départ ?/.test(gT) ? 'OK  ' : 'FAIL') + ' — question apport initial dans le garde-fou de fin d\'audit');
    const val = page.locator('button:has-text("Valider")').last();
    if (await val.count()) await val.click();
    await page.waitForTimeout(900);
  }
  await page.waitForTimeout(1200);
  const T = await page.evaluate(() => (document.querySelector('.nc-syn-zone') ? document.querySelector('.nc-syn-zone').innerText : 'PAS DE SYNTHESE').replace(/[  ]/g, ' '));
  /* 15/09/2026 (v218) : points forts, axes et participation déclarée sont passés au RDV 2
     (onglet « Simulation et plan d'action »). On lit ce volet pour ces assertions. */
  const TP = await (async () => {
    const b = page.locator('button:text-is("Analyse R2")').first();
    if (!(await b.count())) return '';
    await b.click(); await page.waitForTimeout(900);
    const t = await page.evaluate(() => (document.querySelector('.nc-syn-zone') || { innerText: '' }).innerText.replace(/[\u00a0\u202f]/g, ' '));
    const r = page.locator('button:has-text("Audit et synthèse")').first();
    if (await r.count()) { await r.click(); await page.waitForTimeout(700); }
    return t;
  })();
  const hasP = (lbl, re) => console.log((re.test(TP) ? 'OK  ' : 'FAIL') + ' — ' + lbl + ' [RDV 2]');
  const has = (lbl, re) => console.log((re.test(T) ? 'OK  ' : 'FAIL') + ' — ' + lbl);
  const not = (lbl, re) => console.log((!re.test(T) ? 'OK  ' : 'FAIL') + ' — ' + lbl);
  has('ligne de charges « Crédit RP futur (projet d\'achat) »', /Crédit RP futur \(projet d'achat\)/i);
  has('raison : retenu à la place du loyer actuel de 1 500 €', /retenu à la place du loyer actuel de 1 500 €/i);
  has('jauge gauche : titre AUJOURD\'HUI + loyer actuel 1 500 €/mois', /AUJOURD'HUI[\s\S]{0,40}loyer actuel 1 500 €\/mois/i);
  has('jauge droite : titre AVEC LE PROJET RP + futur crédit 2 000 €/mois', /AVEC LE PROJET RP[\s\S]{0,40}futur crédit 2 000 €\/mois/i);
  has('taux projeté 20,0 % affiché', /20,0 %/);
  has('taux actuel 15,0 % affiché', /15,0 %/);
  has('note règle cabinet dans le bloc Résidence principale', /retenue dans l'endettement à la place du loyer actuel/i);
  // v170 : la note client est courte et factuelle — le raisonnement interne ne s'imprime plus.
  has('note projet RP courte et factuelle (v170)', /cette mensualité envisagée est retenue dans l'endettement à la place du loyer actuel/i);
  console.log((!/bloquerait le futur achat|deux opérations restent compatibles/i.test(T) ? 'OK  ' : 'FAIL') + " — plus de raisonnement interne dans la note (v170)");
  // 04/09/2026 (décision CGP) : plus d'axe « Locataire » — le projet RP reste visible dans les charges et le bloc Logement.
  console.log((!/LES AXES DE TRAVAIL[\s\S]*?\bLocataire\b\s*—/i.test(T) ? 'OK  ' : 'FAIL') + ' — aucun axe « Locataire » dans les axes de travail (décision CGP 04/09)');
  has('mensualité dispo : titre Aujourd\'hui + avec le loyer actuel', /AUJOURD'HUI[\s\S]{0,40}avec le loyer actuel/i);
  // dispo35 = 3 500 − 2 000 = 1 500 €
  has('mensualité disponible projetée 1 500 €', /1 500 €/);
  hasP('tuile Apport initial mobilisable', /Apport initial mobilisable/i);
  hasP('fourchette 10 000 à 30 000 € reprise', /10 000 à 30 000 €/);
  // 10/09 : locataire AVEC projet RP — la capacité chiffre le projet et met en avant
  // la place restante pour du locatif (décision CGP) ; points forts en conséquence.
  has('capacité : ligne « Votre projet de résidence principale » avec le budget 394 852 €', /Votre projet de résidence principale[\s\S]{0,120}394[\s ]852 €/);
  has('capacité : ligne « Place restante pour du locatif »', /Place restante pour du locatif/);
  not("capacité : plus de jauge « achat de la RÉSIDENCE PRINCIPALE exclusivement »", /RÉSIDENCE PRINCIPALE exclusivement/);
  hasP('point fort capacité : « une fois le projet RP financé »', /une fois le projet RP financé/);
  hasP('point fort endettement : « Montant finançable pour du locatif : Oui »', /Montant finançable pour du locatif : Oui/);
  hasP('point fort endettement daté « avec le projet RP »', /de taux d'endettement avec le projet RP/);
  has('synthèse : crédit envisagé 20 ans à 3,5 %', /20 ans à 3,5 %/);
  has('synthèse : budget d\'acquisition 394 852 €', /394 852 €/);
  /* 21/09/2026 (CGP) : « supprime, lorsqu'il y a un projet d'achat de RP, la ligne
     Sortie totale de trésorerie — aucun intérêt ». Elle reste à l'écran de saisie
     (contrôlée plus haut) mais ne doit PLUS figurer dans le document. */
  { const T0 = await page.evaluate(() => (document.querySelector('.nc-syn-zone') || { innerText: '' }).innerText);
    console.log((/Sortie totale de trésorerie/i.test(T0) ? 'FAIL' : 'OK  ') + ' — synthèse : plus de ligne « Sortie totale de trésorerie »'); }
  /* 29/08 (Zidans) : la banque figure dans l'identification, l'épargne salariale n'y
     donne jamais son établissement (il est imposé par l'employeur).
     16/09/2026 : le bloc a été refait au modèle « Votre foyer » (une colonne par
     personne, une ligne « Banque ») — les repères de découpe suivent. */
  const idZone = (T.split(/VOTRE FOYER/i)[1] || '').split(/RÉGIME MATRIMONIAL/i)[0] || '';
  console.log((/Banque\s*\n?\s*Crédit Agricole/i.test(idZone) ? 'OK  ' : 'FAIL') + ' — banque dans la colonne de la personne (Crédit Agricole)');
  console.log((!/Amundi/i.test(idZone) ? 'OK  ' : 'FAIL') + ' — épargne salariale : établissement absent de l\'identification');
  console.log((!/BANQUES/.test(idZone) ? 'OK  ' : 'FAIL') + ' — pas de tuile « Banques » regroupée');
  await page.screenshot({ path: 'shot_rp.png', fullPage: true });
  // Export PDF réel
  await page.evaluate(() => { window.print = () => {}; });
  await page.locator('button:has-text("Enregistrer en PDF")').first().click();
  await page.waitForTimeout(400);
  const hintBtn = page.locator('button:has-text("J\'ai compris")');
  if (await hintBtn.count()) { await hintBtn.first().click(); await page.waitForTimeout(400); }
  /* 10/09/2026 — PROJECTION : le PDF imprimait « Nu au réel » pour un bien Jeanbrun
     (cloneNode ne copie pas l'option choisie d'un <select>). On coche le locatif,
     on choisit Jeanbrun, on exporte, et on lit le clone imprimé. */
  await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => /^Analyse R2$/.test(x.innerText.trim())); if (b) b.click(); });
  await page.waitForTimeout(900);
  const cbLoc = await page.evaluate(() => { const el = [...document.querySelectorAll('span')].find(e => e.textContent.trim() === 'Investissement locatif'); if (!el) return 'introuvable'; const cb = el.closest('div[class*="rounded-xl"]').querySelector('input[type=checkbox]'); if (!cb.checked) cb.click(); return 'ok'; });
  await page.waitForTimeout(500);
  const selJb = page.locator('select').filter({ has: page.locator('option:text-is("Bailleur privé (Jeanbrun)")') }).first();
  if (await selJb.count()) { await selJb.selectOption('jeanbrun'); await page.waitForTimeout(500); }
  await page.locator('button:has-text("Enregistrer en PDF")').first().click();
  await page.waitForTimeout(700);
  const selPrint = await page.evaluate(() => { const h = document.getElementById('nc-print-holder'); if (!h) return 'PAS DE CLONE'; const s = [...h.querySelectorAll('select')].find(x => [...x.options].some(o => /Jeanbrun/.test(o.text))); if (!s) return 'PAS DE SELECT'; return s.options[s.selectedIndex] ? s.options[s.selectedIndex].text : '?'; });
  console.log((cbLoc === 'ok' && /Jeanbrun/.test(selPrint) ? 'OK  ' : 'FAIL') + ` — PDF projection : régime imprimé « ${selPrint} » (locatif coché : ${cbLoc})`);
  await page.pdf({ path: 'export_rp.pdf', format: 'A4', printBackground: true });
  console.log('PDF genere');
  console.log('PAGEERRORS:', errs.length ? errs.join(' || ') : 'aucune');
  await browser.close();
})().catch(e => { console.error('CRASH', e); process.exit(1); });
