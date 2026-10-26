/* ═══════════════════════════════════════════════════════════════════════
   SAISIE RÉELLE DANS « OÙ TROUVER L'ÉPARGNE » — frappe touche par touche.

   Pourquoi ce test : un composant déclaré DANS le corps d'un autre est une
   fonction NEUVE à chaque rendu ; React démonte l'input et en remonte un
   autre, donc le focus part À CHAQUE FRAPPE. Le champ « répond » aux tests
   qui écrivent la valeur d'un coup (fill / setNative) et reste inutilisable
   à la main. Ce test tape caractère par caractère, comme le CGP.
   ═══════════════════════════════════════════════════════════════════════ */
const { chromium } = require('playwright');

(async () => {
  const b = await chromium.launch({ executablePath: process.env.PW_CHROMIUM || undefined });
  const p = await b.newPage({ viewport: { width: 1300, height: 1000 } });
  const errs = [];
  p.on('pageerror', e => errs.push(String(e).slice(0, 200)));
  await p.goto('http://127.0.0.1:8899/_test_proj.html', { waitUntil: 'networkidle' });
  await p.waitForTimeout(1200);

  let ko = 0;
  const KO = m => { ko++; console.log('   ✗ ' + m); };
  const OK = m => console.log('   ✓ ' + m);

  /* on cible les champs par le TEXTE qui les précède dans la carte */
  const CIBLES = [
    { carte: "Délégation d'assurance emprunteur", avant: 'Capital emprunté', tape: '150000' },
    { carte: "Délégation d'assurance emprunteur", avant: 'Durée restante',   tape: '17' },
    { carte: "Délégation d'assurance emprunteur", avant: 'Taux actuel',      tape: '0,42' },
    { carte: "Arbitrage du capital placé",        avant: 'Montant',          tape: '48000' },
    { carte: "Arbitrage du capital placé",        avant: 'Rendement actuel', tape: '3,4' },
    { carte: "Redirection des versements",        avant: 'Versement',        tape: '275' },
    { carte: "Redirection des versements",        avant: 'Rendement actuel', tape: '2,8' },
  ];

  /* les cartes doivent être cochées pour que la saisie ait un sens */
  for (const t of ['Délégation d\'assurance emprunteur', 'Arbitrage du capital placé', 'Redirection des versements']) {
    const coche = await p.evaluate((titre) => {
      const el = Array.from(document.querySelectorAll('span')).find(e => e.textContent.trim() === titre);
      if (!el) return 'titre introuvable';
      const carte = el.closest('div[class*="rounded-xl"]');
      const cb = carte && carte.querySelector('input[type=checkbox]');
      if (!cb) return 'case introuvable';
      if (!cb.checked) cb.click();
      return 'ok';
    }, t);
    if (coche !== 'ok') KO('carte « ' + t + " » : " + coche);
  }
  await p.waitForTimeout(300);

  for (const c of CIBLES) {
    const sel = await p.evaluate((c) => {
      const el = Array.from(document.querySelectorAll('span')).find(e => e.textContent.trim() === c.carte);
      const carte = el && el.closest('div[class*="rounded-xl"]');
      if (!carte) return null;
      const inputs = Array.from(carte.querySelectorAll('input[type=text], input:not([type])'));
      /* le champ visé est le premier input qui suit le libellé dans le texte */
      const txt = carte.innerText;
      const i = inputs.findIndex(inp => {
        let n = inp.previousSibling, acc = '';
        while (n && acc.length < 40) { acc = (n.textContent || n.nodeValue || '') + acc; n = n.previousSibling; }
        return acc.trim().endsWith(c.avant);
      });
      if (i < 0) return null;
      inputs.forEach((inp, k) => inp.setAttribute('data-cible', k === i ? 'oui' : 'non'));
      return true;
    }, c);
    if (!sel) { KO(c.carte + ' · ' + c.avant + ' : champ introuvable'); continue; }

    try {
      const champ = p.locator('[data-cible="oui"]').first();
      await champ.click({ timeout: 4000 });
      await p.keyboard.press('Control+a');
      await p.keyboard.press('Delete');
      /* FRAPPE TOUCHE PAR TOUCHE — c'est le seul mode qui révèle un remontage */
      for (const ch of c.tape) { await p.keyboard.type(ch); await p.waitForTimeout(35); }
      const lu = await champ.inputValue({ timeout: 4000 });
      const focusOk = await p.evaluate(() => document.activeElement && document.activeElement.getAttribute('data-cible') === 'oui');
      if (lu !== c.tape) KO(c.carte + ' · ' + c.avant + ' : tapé « ' + c.tape + ' », le champ contient « ' + lu + ' »');
      else if (!focusOk) KO(c.carte + ' · ' + c.avant + ' : le champ a PERDU LE FOCUS pendant la frappe');
      else OK(c.carte + ' · ' + c.avant + ' = ' + lu);
    } catch (e) {
      /* le champ s'est volatilisé en cours de frappe : c'est la signature d'un
         composant redéclaré à chaque rendu, donc démonté puis remonté */
      KO(c.carte + ' · ' + c.avant + ' : le champ DISPARAÎT pendant la frappe (composant remonté à chaque rendu)');
    }
    await p.evaluate(() => document.querySelectorAll('[data-cible]').forEach(e => e.removeAttribute('data-cible')));
  }

  /* La case « versé sur un livret » ne doit pas basculer la carte PAR PROPAGATION
     du clic. Attention : elle PEUT changer l'état affiché de la carte de façon
     légitime — quand l'épargne est versée sur un livret et que la précaution du
     foyer est insuffisante, la redirection est BLOQUÉE par la règle du cabinet et
     la carte s'affiche décochée. Le test distingue les deux : il ne conclut à une
     bascule parasite que si le blocage n'entre pas en jeu. */
  const liv = await p.evaluate(() => {
    const el = Array.from(document.querySelectorAll('span')).find(e => e.textContent.trim() === 'versé sur un livret');
    if (!el) return 'libellé introuvable';
    const cb = el.parentElement.querySelector('input[type=checkbox]');
    if (!cb) return 'case introuvable';
    const carte = el.closest('div[class*="rounded-xl"]');
    const principal = carte.querySelector('input[type=checkbox]');
    const bloqAv = /Redirection bloquée/i.test(document.body.innerText);
    const avant = principal.checked;
    cb.click();
    const bloqAp = /Redirection bloquée/i.test(document.body.innerText);
    if (principal.checked === avant) return 'ok';
    if (bloqAv !== bloqAp) return 'blocage';
    return 'la carte a basculé';
  });
  if (liv === 'ok') OK('« versé sur un livret » ne bascule pas la carte');
  else if (liv === 'blocage') OK('« versé sur un livret » : la carte change d\'état parce que la règle de précaution bloque la redirection — comportement voulu');
  else KO('« versé sur un livret » : ' + liv);

  if (errs.length) KO('erreur JavaScript : ' + errs[0]);
  else OK('aucune erreur JavaScript');

  console.log(ko === 0 ? '\nSAISIE : tous les champs répondent' : '\nSAISIE : ' + ko + ' DÉFAUT(S)');
  await b.close();
  process.exit(ko === 0 ? 0 : 1);
})();
