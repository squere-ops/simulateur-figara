/* ═══════════════════════════════════════════════════════════════════════════
   ANALYSE R2 — LES GISEMENTS GROSSISSENT LE BUDGET, ET LE BANDEAU COLLANT
   N'APPARAÎT PAS AVANT QU'ON PARLE D'ARGENT (21/09/2026)

   Le CGP : « si le client souhaite mettre entre 300 et 500 €/mois, et que l'on a
   été chercher 250 € de trésorerie supplémentaire, il faut que son budget
   mensuel passe de 550 à 750 €/mois grâce aux renégociations, et que cela se
   voie. Aussi, lorsque l'on arrive sur le document, je ne veux pas voir le
   bandeau de son épargne au tout début, ça n'a pas de sens. »

   Ce banc part du dossier de t_proj_pdf (fourchette déclarée 500 à 1 000 €),
   ouvre l'Analyse R2 et vérifie :
   1. en haut du document, le bandeau collant est CACHÉ ;
   2. une fois arrivé aux gisements, il est VISIBLE ;
   3. aucun levier coché : pas de bandeau « nouveau budget » ;
   4. délégation + arbitrage cochés : le bandeau « nouveau budget » affiche
      les DEUX bornes augmentées du même montant, recalculé depuis la règle.
   ═══════════════════════════════════════════════════════════════════════════ */
const fs = require('fs');
let src = fs.readFileSync(__dirname + '/t_proj_pdf.js', 'utf8');
/* on réutilise la saisie du dossier de t_proj_pdf, jusqu'à l'ouverture de l'onglet */
const coupe = src.indexOf("  await page.locator('button:has-text(\"Analyse R2\")').first().click();");
if (coupe < 0) { console.log('FAIL — ancre introuvable dans t_proj_pdf.js'); process.exit(1); }
src = src.slice(0, coupe) + `
  await page.locator('button:has-text("Analyse R2")').first().click();
  await page.waitForTimeout(1300);
  let ko = 0;
  const OK = (m) => console.log('OK   — ' + m);
  const KO = (m) => { console.log('FAIL — ' + m); ko++; };
  const nfr = (t) => { const m = String(t || '').replace(/[\\s\\u00a0\\u202f]/g, '').match(/-?\\d+/g); return m ? m.map(x => parseInt(x, 10)) : []; };

  const sticky = () => page.evaluate(() => {
    const el = document.querySelector('[data-nc-bar-sticky="1"]');
    return el ? getComputedStyle(el).visibility : 'absent';
  });
  const allerA = (sel) => page.evaluate((s) => {
    const el = document.querySelector(s);
    if (el) el.scrollIntoView({ block: 'start' });
    return !!el;
  }, sel);
  const enHaut = () => page.evaluate(() => {
    const el = document.querySelector('.nc-cover');
    if (el) el.scrollIntoView({ block: 'start' });
  });

  /* 1 · en haut du document */
  await enHaut(); await page.waitForTimeout(600);
  const v1 = await sticky();
  if (v1 === 'visible') KO('le bandeau collant enveloppe · employée · reste est visible en haut du document (page de garde)');
  else OK('en haut du document, le bandeau collant est caché (' + v1 + ')');

  /* 2 · aux gisements */
  await allerA('[data-nc-bar-seuil="1"]'); await page.waitForTimeout(600);
  await page.evaluate(() => { const el = document.querySelector('[data-nc-bar-seuil="1"]'); if (el) el.scrollIntoView({ block: 'center' }); });
  await page.waitForTimeout(600);
  const v2 = await sticky();
  /* le bandeau imprimé « fixe » peut être à l'écran en même temps : le collant se
     masque alors volontairement (règle du 14/09). On descend un peu plus bas que lui. */
  await page.evaluate(() => { const el = document.querySelector('[data-nc-proj-solutions="1"]'); if (el) el.scrollIntoView({ block: 'end' }); });
  await page.waitForTimeout(600);
  const v3 = await sticky();
  if (v2 !== 'visible' && v3 !== 'visible') KO('arrivé aux gisements puis aux solutions, le bandeau collant ne revient pas (' + v2 + ' / ' + v3 + ')');
  else OK('arrivé au budget, le bandeau collant réapparaît');

  /* 3 · aucun levier coché */
  const aucun = await page.evaluate(() => !!document.querySelector('[data-nc-budget-final="1"]'));
  if (aucun) KO('aucun gisement coché, et le bandeau « nouveau budget » s\\'affiche quand même');
  else OK('aucun gisement coché : pas de bandeau « nouveau budget »');

  /* 4 · délégation + arbitrage cochés */
  const carte = (titre) => page.locator('div').filter({ has: page.locator('span', { hasText: titre }) }).filter({ has: page.locator('input[type=checkbox]') }).last();
  const saisir = async (titre, lib, v) => {
    const ok = await page.evaluate(([t, l, val]) => {
      const sp = Array.from(document.querySelectorAll('span')).find(e => e.textContent.trim() === t);
      if (!sp) return 'carte';
      let c = sp; for (let i = 0; i < 8 && c && c.querySelectorAll('input:not([type=checkbox])').length < 2; i++) c = c.parentElement;
      if (!c) return 'conteneur';
      const txt = Array.from(c.childNodes);
      const inputs = Array.from(c.querySelectorAll('input:not([type=checkbox])'));
      /* le libellé précède son champ dans le flux : on prend le premier champ après le libellé */
      const html = c.innerText;
      const idx = { 'Capital emprunté': 0, 'Durée restante': 1, 'Taux actuel': 2, 'délégation': 3, 'Montant': 0, 'Rendement actuel': 1 }[l];
      const inp = inputs[idx];
      if (!inp) return 'champ ' + l;
      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
      setter.call(inp, val); inp.dispatchEvent(new Event('input', { bubbles: true }));
      return 'ok';
    }, [titre, lib, v]);
    return ok;
  };
  const cocher = (titre) => page.evaluate((t) => {
    const sp = Array.from(document.querySelectorAll('span')).find(e => e.textContent.trim() === t);
    let c = sp; for (let i = 0; i < 8 && c && c.querySelectorAll('input:not([type=checkbox])').length < 2; i++) c = c.parentElement;
    const cb = c && c.querySelector('input[type=checkbox]');
    if (cb && !cb.checked) cb.click();
    return !!cb;
  }, titre);

  const CAP = 200000, DUREE = 15, TXA = 0.34, TXD = 0.12;
  const r1 = [await saisir("Délégation d'assurance emprunteur", 'Capital emprunté', String(CAP)),
              await saisir("Délégation d'assurance emprunteur", 'Durée restante', String(DUREE)),
              await saisir("Délégation d'assurance emprunteur", 'Taux actuel', String(TXA).replace('.', ',')),
              await saisir("Délégation d'assurance emprunteur", 'délégation', String(TXD).replace('.', ','))];
  await cocher("Délégation d'assurance emprunteur");
  await cocher('Arbitrage du capital placé');
  await page.waitForTimeout(900);
  console.log('SAISIE délégation :', r1.join(','));

  const lu = await page.evaluate(() => {
    const el = document.querySelector('[data-nc-budget-final="1"]');
    if (!el) return null;
    return { txt: el.innerText.replace(/[\\s\\u00a0\\u202f]+/g, ' ') };
  });
  /* montants recalculés depuis la règle, avec les valeurs lues dans les champs */
  const regle = await page.evaluate(() => {
    const val = (t, idx) => {
      const sp = Array.from(document.querySelectorAll('span')).find(e => e.textContent.trim() === t);
      let c = sp; for (let i = 0; i < 8 && c && c.querySelectorAll('input:not([type=checkbox])').length < 2; i++) c = c.parentElement;
      const inp = Array.from(c.querySelectorAll('input:not([type=checkbox])'))[idx];
      return inp ? parseFloat(String(inp.value).replace(/\\s/g, '').replace(',', '.')) : NaN;
    };
    const tMedTxt = (document.body.innerText.match(/hypothèse cabinet \\(([\\d,]+) %\\)/) || [])[1] || '5,2';
    const tMed = parseFloat(tMedTxt.replace(',', '.')) / 100;
    const ass = Math.max(0, (val("Délégation d'assurance emprunteur", 2) - val("Délégation d'assurance emprunteur", 3)) / 100 * val("Délégation d'assurance emprunteur", 0) / 12);
    const arb = val('Arbitrage du capital placé', 0) * Math.max(0, tMed - val('Arbitrage du capital placé', 1) / 100) / 12;
    return { ass, arb, tot: ass + arb };
  });
  console.log('RÈGLE :', JSON.stringify(regle));
  if (!lu) KO('délégation et arbitrage cochés : le bandeau « nouveau budget » n\\'apparaît pas');
  else {
    console.log('LU :', lu.txt);
    const n = nfr(lu.txt);
    /* fourchette déclarée 500 à 1 000 : bornes attendues 500 + tot et 1 000 + tot */
    const bas = Math.round(500 + regle.tot), haut = Math.round(1000 + regle.tot);
    const proche = (x) => n.some(v => Math.abs(v - x) <= 2);
    if (!proche(bas) || !proche(haut)) KO('nouveau budget : attendu ' + bas + ' à ' + haut + ' €/mois (500 à 1 000 + ' + Math.round(regle.tot) + ') — lu « ' + lu.txt.slice(0, 120) + ' »');
    else OK('nouveau budget : ' + bas + ' à ' + haut + ' €/mois = 500 à 1 000 de la poche + ' + Math.round(regle.tot) + ' € trouvés — les DEUX bornes montent');
    if (!proche(Math.round(regle.tot))) KO('le montant trouvé (' + Math.round(regle.tot) + ' €) n\\'est pas écrit dans le bandeau');
    else OK('le montant trouvé est écrit (' + Math.round(regle.tot) + ' €)');
    if (!/délégation/i.test(lu.txt) || !/arbitrage/i.test(lu.txt)) KO('le détail levier par levier manque dans le bandeau');
    else OK('le détail levier par levier est écrit (délégation, arbitrage)');
  }

  /* le bandeau imprimé « fixe » (enveloppe) dit la même chose */
  const fixe = await page.evaluate(() => { const b = document.querySelector('[data-nc-barre="fixe"]'); return b ? b.innerText.replace(/[\\s\\u00a0\\u202f]+/g, ' ') : null; });
  if (!fixe) KO('bandeau enveloppe imprimé introuvable');
  else {
    const n = nfr(fixe);
    const haut = Math.round(1000 + regle.tot), bas = Math.round(500 + regle.tot);
    if (!n.some(v => Math.abs(v - haut) <= 2) || !n.some(v => Math.abs(v - bas) <= 2)) KO('l\\'enveloppe du bandeau des solutions ne suit pas : attendu ' + bas + ' à ' + haut + ' — lu « ' + fixe.slice(0, 140) + ' »');
    else OK('l\\'enveloppe des solutions affiche la même fourchette augmentée (' + bas + ' à ' + haut + ')');
  }

  await page.screenshot({ path: 'shot_budget.png', fullPage: false });
  console.log('\\nPAGEERRORS:', errs.length ? errs.slice(0, 3).join(' | ') : 'aucune');
  await browser.close();
  console.log(ko ? '\\nBUDGET : ' + ko + ' DÉFAUT(S)' : '\\nBUDGET : LES GISEMENTS GROSSISSENT LE BUDGET, LE BANDEAU ATTEND SON HEURE');
  process.exit(ko ? 1 : 0);
})();
`;
eval(src);
