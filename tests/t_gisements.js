/* ═══════════════════════════════════════════════════════════════════════
   « OÙ TROUVER L'ÉPARGNE » — UN LEVIER NON RETENU NE COMPTE PAS.

   Constat du CGP : « pas logique, je coche le 3e bloc et j'ai un affichage
   aussi sur celui du milieu ». Deux defauts se cumulaient.
   (1) Les trois tuiles du bas SEMBLAIENT repondre aux trois cartes du haut,
       alors que la deuxieme etait le total des cartes 2 et 3 : un levier
       decoche paraissait compter.
   (2) Les leviers melangeaient DEUX NATURES qui ne s additionnent pas — des
       euros DISPONIBLES CHAQUE MOIS (delegation) et du CAPITAL A L HORIZON
       (arbitrage, redirection).

   Ce banc verifie la regle, pas la mise en page :
     · chaque famille porte SON total, jamais celui de l autre ;
     · un levier decoche affiche sa valeur AU CONDITIONNEL et n entre dans
       AUCUN total ;
     · les totaux sont recalcules A PARTIR DE LA REGLE, jamais lus du code.
   ═══════════════════════════════════════════════════════════════════════ */
const { chromium } = require('playwright');

/* valeurs imposees aux champs — les attendus en decoulent */
const MONT_ARB = 60000, TX_ARB_ACT = 2, VERS = 300, TX_VERS_ACT = 1.7;
const CAP_ASS = 200000, TX_ASS = 0.34, TX_DEL = 0.12;

/* memes formules que la regle du cabinet, reecrites ici a la main */
const capMens = (vMens, txAn, ans) => {
  const i = Math.pow(1 + txAn, 1 / 12) - 1;
  let c = 0; const n = Math.round(ans * 12);
  for (let j = 0; j < n; j++) c = (c + vMens) * (1 + i);
  return c;
};

const num = (t) => {
  if (t == null) return null;
  const m = String(t).replace(/[    ]/g, '').match(/-?\d+/);
  return m ? parseInt(m[0], 10) : null;
};

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const p = await b.newPage({ viewport: { width: 1300, height: 1400 } });
  const errs = [];
  p.on('pageerror', e => errs.push(String(e).slice(0, 200)));
  await p.goto('http://127.0.0.1:8899/_test_proj.html', { waitUntil: 'networkidle' });
  await p.waitForTimeout(1200);

  let ko = 0;
  const KO = m => { ko++; console.log('   ✗ ' + m); };
  const OK = m => console.log('   ✓ ' + m);

  /* ——— outils de lecture ——— */
  const totalFamille = (titre) => p.evaluate((t) => {
    const norm = (x) => String(x).replace(/[   ]/g, ' ').trim().toLowerCase();
    const el = Array.from(document.querySelectorAll('span')).find(e => norm(e.textContent) === norm(t));
    if (!el) return { err: 'famille introuvable' };
    const entete = el.parentElement;
    const val = entete.querySelector('span:last-child');
    return { txt: val ? val.textContent : null };
  }, titre);

  /* la carte : sa valeur, et si elle est affichee AU CONDITIONNEL (italique) */
  const carte = (titre) => p.evaluate((t) => {
    const el = Array.from(document.querySelectorAll('span')).find(e => e.textContent.trim() === t);
    if (!el) return { err: 'carte introuvable' };
    const c = el.closest('div[class*="rounded-xl"]');
    const cb = c.querySelector('input[type=checkbox]');
    /* la valeur est le dernier bloc en serif de la carte */
    const blocs = Array.from(c.querySelectorAll('div')).filter(d => /Lora/.test(d.getAttribute('style') || ''));
    const v = blocs.length ? blocs[blocs.length - 1] : null;
    const st = v ? v.getAttribute('style') || '' : '';
    return {
      coche: !!(cb && cb.checked),
      txt: v ? v.textContent : null,
      conditionnel: /font-style:\s*italic/.test(st),
      sous: c.innerText
    };
  }, titre);

  const cocher = (titre, veut) => p.evaluate(([t, v]) => {
    const el = Array.from(document.querySelectorAll('span')).find(e => e.textContent.trim() === t);
    if (!el) return 'introuvable';
    const cb = el.closest('div[class*="rounded-xl"]').querySelector('input[type=checkbox]');
    if (cb.checked !== v) cb.click();
    return 'ok';
  }, [titre, veut]);

  const saisir = (titreCarte, avant, valeur) => p.evaluate(([tc, av, val]) => {
    const el = Array.from(document.querySelectorAll('span')).find(e => e.textContent.trim() === tc);
    if (!el) return 'carte introuvable';
    const c = el.closest('div[class*="rounded-xl"]');
    const inputs = Array.from(c.querySelectorAll('input[type=text], input:not([type])'));
    const cible = inputs.find(inp => {
      let n = inp.previousSibling, acc = '';
      while (n && acc.length < 40) { acc = (n.textContent || n.nodeValue || '') + acc; n = n.previousSibling; }
      return acc.trim().endsWith(av);
    });
    if (!cible) return 'champ introuvable';
    const st = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
    st.call(cible, String(val)); cible.dispatchEvent(new Event('input', { bubbles: true }));
    return 'ok';
  }, [titreCarte, avant, valeur]);

  const T_ASS = "Délégation d'assurance emprunteur";
  const T_ARB = "Arbitrage du capital placé";
  const T_RED = "Redirection des versements";
  const F1 = "Trésorerie libérée chaque mois";
  const F2 = "Meilleur rendement sur la durée";

  /* ——— HORIZON : lu dans les CHAMPS D HYPOTHESE, pas dans une phrase ———
     Une premiere version cherchait « dans N ans » dans le texte de la page :
     la valeur trouvee changeait selon les leviers coches, puisque plusieurs
     blocs conditionnels emploient cette tournure. Un attendu calcule sur un
     mauvais horizon peut passer par tolerance et masquer un vrai defaut.
     On lit donc les deux ages saisis, seule source stable. */
  const ctx = await p.evaluate(() => {
    /* la LIGNE d hypothese « Age · depart en retraite vise » porte exactement
       deux champs : l age actuel puis l age de depart. On les prend la, et
       nulle part ailleurs — « 25 ans » de duree de credit est suivi du meme
       mot « ans » et se faisait passer pour l age actuel. */
    const lig = Array.from(document.querySelectorAll('tr,div'))
      .filter(e => /\u00c2ge\s*\u00b7\s*d\u00e9part en retraite vis\u00e9/i.test(e.textContent || ''))
      .sort((a, b) => (a.textContent || '').length - (b.textContent || '').length)[0];
    if (!lig) return { err: 'ligne des ages introuvable' };
    const ch = Array.from(lig.querySelectorAll('input')).filter(i => /^\d{2}$/.test(String(i.value).trim()));
    if (ch.length < 2) return { err: 'la ligne des ages ne porte plus deux champs' };
    return { ageAct: parseInt(ch[0].value, 10), ageFin: parseInt(ch[1].value, 10) };
  });
  if (ctx.err || !ctx.ageAct || !ctx.ageFin) { KO("horizon illisible : " + (ctx.err || (ctx.ageAct + ' \u2192 ' + ctx.ageFin))); }
  const H = (ctx.ageFin && ctx.ageAct) ? ctx.ageFin - ctx.ageAct : null;
  if (!H || H <= 0) { KO("horizon de projection incoh\u00e9rent : " + ctx.ageAct + " \u2192 " + ctx.ageFin); }
  const TMED = 5.2;
  OK("horizon lu dans les champs d'hypoth\u00e8se : " + ctx.ageAct + " \u2192 " + ctx.ageFin + " ans, soit " + H + " ans");

  /* ═══ 1 · AUCUN LEVIER RETENU : LES DEUX FAMILLES SONT A ZERO ═══ */
  for (const t of [T_ASS, T_ARB, T_RED]) await cocher(t, false);
  await p.waitForTimeout(500);
  {
    const a = await totalFamille(F1), bq = await totalFamille(F2);
    if (a.err || bq.err) KO('familles absentes : ' + (a.err || '') + ' ' + (bq.err || ''));
    else if (!/—/.test(a.txt) || !/—/.test(bq.txt)) KO('aucun levier coché, pourtant un total s\'affiche : « ' + a.txt + ' » / « ' + bq.txt + ' »');
    else OK('aucun levier retenu : les deux familles affichent —');
  }

  /* ═══ 2 · UN SEUL LEVIER COCHE : LE VOISIN DECOCHE NE COMPTE PAS ═══
     C est exactement le reproche du CGP. On coche la REDIRECTION seule, on
     donne a l ARBITRAGE un montant qui produirait un gain considerable, et
     le total de la famille doit rester celui de la seule redirection. */
  await saisir(T_ARB, 'Montant', MONT_ARB);
  await saisir(T_ARB, 'Rendement actuel', String(TX_ARB_ACT).replace('.', ','));
  await saisir(T_RED, 'Versement', VERS);
  await saisir(T_RED, 'Rendement actuel', String(TX_VERS_ACT).replace('.', ','));
  await cocher(T_RED, true);
  await p.waitForTimeout(700);
  {
    /* 20/09/2026 (CGP) — RÈGLE DE L'ÉCONOMIE MENSUELLE, RÉÉCRITE.
       « Les vraies économies sont le calcul des intérêts placés à 1,7 % vs 5,2 %,
       le capital ne doit pas rentrer dans le calcul. »
       L'ancien attendu était le gain de CAPITAL à l'horizon divisé par 12 × H : un
       gain composé sur vingt ans ramené à une moyenne, qui ne correspondait à aucun
       euro gagné dans le mois et qui variait avec la durée retenue.
       Le nouvel attendu est l'ÉCART D'INTÉRÊTS de la première année :
       — arbitrage : montant × (taux cabinet − taux actuel) ÷ 12 ;
       — redirection : l'assiette n'est pas un capital mais CE QUI AURA ÉTÉ VERSÉ
         DANS L'ANNÉE (versement × 12), décision du CGP du 20/09.
       Le capital à l'horizon reste contrôlé : il garde sa place en seconde ligne. */
    const attenduRedCap = Math.round(capMens(VERS, TMED / 100, H) - capMens(VERS, TX_VERS_ACT / 100, H));
    const attenduRed = Math.round((VERS * 12) * (TMED / 100 - TX_VERS_ACT / 100) / 12);
    const tot = num((await totalFamille(F2)).txt);
    const cArb = await carte(T_ARB);
    const attenduArbPotCap = Math.round(MONT_ARB * (Math.pow(1 + TMED / 100, H) - Math.pow(1 + TX_ARB_ACT / 100, H)));
    const attenduArbPot = Math.round(MONT_ARB * (TMED / 100 - TX_ARB_ACT / 100) / 12);

    if (tot == null) KO('le total de « ' + F2 + ' » ne se lit plus');
    else if (Math.abs(tot - attenduRed) > Math.max(2, attenduRed * 0.02))
      KO('redirection seule cochée : total de famille = ' + tot + ' €/mois — attendu ' + attenduRed + ' €/mois (écart d\'intérêts sur ' + (VERS * 12) + ' € versés dans l\'année, ÷ 12). L\'arbitrage décoché est compté.');
    else if (!String((await totalFamille(F2)).txt).replace(/[\s\u00a0\u202f]/g, '').match(/\d+/g).some(n => Math.abs(parseInt(n, 10) - attenduRedCap) <= Math.max(2, attenduRedCap * 0.02)))
      KO('le gain à l\'horizon (' + attenduRedCap + ' €) n\'apparaît plus en second dans le total de famille');
    else OK('redirection seule cochée : le total vaut ' + tot + ' €/mois (' + attenduRedCap + ' € dans ' + H + ' ans) — l\'arbitrage décoché n\'y entre pas');

    if (cArb.coche) KO("l'arbitrage s'est coché tout seul");
    else if (num(cArb.txt) == null) KO("l'arbitrage décoché n'annonce plus son potentiel : le client ne voit pas ce qu'il laisse de côté");
    else if (Math.abs(num(cArb.txt) - attenduArbPot) > Math.max(2, attenduArbPot * 0.02))
      KO('potentiel de l\'arbitrage = ' + num(cArb.txt) + ' €/mois — attendu ' + attenduArbPot + ' €/mois (écart d\'intérêts : ' + MONT_ARB + ' € × ' + (TMED - TX_ARB_ACT).toFixed(1) + ' % ÷ 12)');
    else if (!cArb.conditionnel) KO("le potentiel de l'arbitrage s'affiche comme une valeur acquise : rien ne le distingue d'un levier retenu");
    else if (!/si vous l'activez/i.test(cArb.sous)) KO("le potentiel de l'arbitrage ne porte pas la mention « si vous l'activez »");
    else OK('arbitrage décoché : ' + num(cArb.txt) + ' €/mois annoncés au conditionnel, en italique, avec « si vous l\'activez »');
  }

  /* ═══ 3 · LES DEUX LEVIERS DE LA FAMILLE : LE TOTAL EST LEUR SOMME ═══ */
  await cocher(T_ARB, true);
  await p.waitForTimeout(700);
  {
    const attenduCap = Math.round(
      MONT_ARB * (Math.pow(1 + TMED / 100, H) - Math.pow(1 + TX_ARB_ACT / 100, H))
      + capMens(VERS, TMED / 100, H) - capMens(VERS, TX_VERS_ACT / 100, H));
    /* somme des DEUX écarts d'intérêts, chacun ramené au mois (règle du 20/09) */
    const attendu = Math.round(MONT_ARB * (TMED / 100 - TX_ARB_ACT / 100) / 12)
                  + Math.round((VERS * 12) * (TMED / 100 - TX_VERS_ACT / 100) / 12);
    const tot = num((await totalFamille(F2)).txt);
    if (tot == null) KO('le total de « ' + F2 + ' » ne se lit plus');
    else if (Math.abs(tot - attendu) > Math.max(2, attendu * 0.02))
      KO('les deux leviers cochés : total = ' + tot + ' €/mois — attendu ' + attendu + ' €/mois (somme des deux écarts d\'intérêts, ÷ 12)');
    else OK('les deux leviers cochés : total = ' + tot + ' €/mois, somme des deux ramenée au mois — conforme à la règle');
  }

  /* ═══ 4 · LES DEUX FAMILLES NE SE MELANGENT JAMAIS ═══
     Un capital a l horizon et une tresorerie mensuelle ne s additionnent pas.
     La famille 1 doit rester en €/MOIS et ignorer les milliers d euros de la
     famille 2 — c est le melange qui rendait la rangee de tuiles illisible. */
  await saisir(T_ASS, 'Capital emprunté', CAP_ASS);
  await saisir(T_ASS, 'Taux actuel', String(TX_ASS).replace('.', ','));
  await cocher(T_ASS, true);
  await p.waitForTimeout(700);
  {
    const attenduMens = Math.round((TX_ASS / 100 - TX_DEL / 100) * CAP_ASS / 12);
    const f1 = await totalFamille(F1);
    const v = num(f1.txt);
    if (v == null) KO('le total de « ' + F1 + ' » ne se lit plus');
    else if (!/\/mois/.test(String(f1.txt).replace(/[  ]/g, ' ')))
      KO('le total de la trésorerie ne porte pas « /mois » : rien ne dit que ce n\'est pas un capital');
    else if (Math.abs(v - attenduMens) > 2)
      KO('trésorerie libérée = ' + v + ' €/mois — attendu ' + attenduMens + ' €/mois (écart de taux × capital ÷ 12)');
    else if (v > 5000)
      KO('trésorerie libérée = ' + v + ' € — un capital à l\'horizon s\'est glissé dans la famille mensuelle');
    else OK('trésorerie libérée = ' + v + ' €/mois — conforme à la règle, sans mélange avec le capital');
  }

  /* ═══ 5 · LES TUILES TROMPEUSES ONT DISPARU ═══
     « Ce que ca represente par mois » additionnait une tresorerie reellement
     disponible et un capital ramene au mois : deux natures sous un seul chiffre. */
  {
    const t = await p.evaluate(() => document.body.innerText);
    if (/Ce que ça représente par mois/i.test(t))
      KO('la tuile « Ce que ça représente par mois » est de retour : elle additionne une trésorerie et un capital ramené au mois');
    else OK('plus de total qui mélange trésorerie mensuelle et capital à l\'horizon');
  }

  if (errs.length) KO('erreur JavaScript : ' + errs[0]);
  else OK('aucune erreur JavaScript');

  console.log(ko === 0 ? '\nGISEMENTS : chaque famille porte son total, un levier décoché ne compte pas'
                       : '\nGISEMENTS : ' + ko + ' DÉFAUT(S)');
  await b.close();
  process.exit(ko === 0 ? 0 : 1);
})();
