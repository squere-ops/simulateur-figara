/* ═══════════════════════════════════════════════════════════════════════
   TOUS LES RÉGIMES LOCATIFS — chacun doit produire SON avantage fiscal.

   Pourquoi : ncCalcFisc rend `impotNet`, mais la Projection lisait `ir.net`.
   Résultat, l'impôt de référence valait 0 : la fiscalité des loyers était
   nulle ET toute réduction d'impôt était plafonnée « à l'impôt dû », donc à
   zéro. Malraux affichait 0 € de réduction — le CGP l'a vu à l'écran.
   Un seul régime testé n'aurait rien prouvé : ce banc les passe TOUS, et
   compare à un calcul refait À PARTIR DE LA RÈGLE, jamais du code.
   ═══════════════════════════════════════════════════════════════════════ */
const { chromium } = require('playwright');

/* paramètres du harnais — repris tels quels dans les attendus */
const PB = 150000, TRAVAUX = 55000;

const CAS = [
  { k: 'nu',       nom: 'Nu au réel',              travaux: 0,
    attendu: null, /* pas d'avantage propre : on vérifie seulement l'absence d'erreur */ },
  { k: 'meuble',   nom: 'Meublé au réel',          travaux: 0,
    /* art. 39 C II : l'amortissement ne peut pas creer de deficit. Sur ce dossier
       le resultat avant amortissement est negatif, donc l'amortissement DEDUIT
       vaut legitimement 0 et part en report (ARD). C'est l'ARD qu'il faut sonder :
       une sonde sur « deduit an 1 » ferait echouer un code juste. */
    sonde: 'Amortissement en report', min: 1 },
  { k: 'denorm',   nom: 'Denormandie',             travaux: TRAVAUX,
    sonde: "Réduction d'impôt obtenue",
    /* art. 199 novovicies : 18 % sur 9 ans, base = prix + frais + travaux dans la
       limite de 300 000 €, soit 39 240 € au total. MAIS le dispositif entre dans le
       PLAFOND GLOBAL DES NICHES de 10 000 €/an, deja occupe a hauteur de 7 000 € par
       l'emploi a domicile du dossier type : il ne reste que 3 000 €/an, sur 9 ans.
       Le reste est definitivement perdu — c'est la regle, pas un defaut. */
    exact: 3000 * 9 },
  { k: 'malraux',  nom: 'Malraux',                 travaux: TRAVAUX,
    sonde: "Réduction d'impôt obtenue",
    /* art. 199 tervicies : 30 % en site patrimonial remarquable avec PSMV,
       assiette = travaux, plafonnée à 400 000 € sur 4 ans */
    exact: Math.round(Math.min(TRAVAUX, 400000) * 0.30) },
  { k: 'mh',       nom: 'Monument historique',     travaux: TRAVAUX,
    sonde: 'Imputé sur le revenu global', min: 1 },
  { k: 'lli',      nom: 'Locatif intermédiaire',   travaux: 0,
    sonde: 'TVA à 10 % au lieu de 20 %', min: 1 },
  { k: 'jeanbrun', nom: 'Bailleur privé (Jeanbrun)', travaux: 0,
    sonde: 'Amortissement déduit par an',
    /* statut du bailleur privé : 3,5 % (neuf) de 80 % du prix, plafond 8 000 €/an */
    exact: Math.round(Math.min(PB * 0.80 * 0.035, 8000)) },
];

const nb = (t) => { const m = String(t).replace(/[   ]/g, '').match(/-?\d+/); return m ? parseInt(m[0], 10) : null; };

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

  /* cocher l'investissement locatif */
  await p.evaluate(() => {
    const el = Array.from(document.querySelectorAll('span')).find(e => e.textContent.trim() === 'Investissement locatif');
    const carte = el.closest('div[class*="rounded-xl"]');
    const cb = carte.querySelector('input[type=checkbox]');
    if (!cb.checked) cb.click();
  });
  await p.waitForTimeout(400);

  for (const c of CAS) {
    const choisi = await p.evaluate((k) => {
      const sel = Array.from(document.querySelectorAll('select')).find(s => Array.from(s.options).some(o => o.value === k));
      if (!sel) return false;
      const st = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set;
      st.call(sel, k); sel.dispatchEvent(new Event('change', { bubbles: true }));
      return true;
    }, c.k);
    if (!choisi) { KO(c.nom + ' : régime absent du sélecteur'); continue; }
    await p.waitForTimeout(500);

    /* travaux : saisis pour les régimes qui en vivent */
    await p.evaluate((v) => {
      const inputs = Array.from(document.querySelectorAll('input'));
      const i = inputs.find(inp => { let n = inp.previousSibling, a = ''; while (n && a.length < 30) { a = (n.textContent || n.nodeValue || '') + a; n = n.previousSibling; } return /Travaux an 1/.test(a); });
      if (!i) return;
      const st = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
      st.call(i, String(v)); i.dispatchEvent(new Event('input', { bubbles: true }));
    }, c.travaux);
    await p.waitForTimeout(600);

    const vu = await p.evaluate(() => {
      const t = document.body.innerText;
      const lire = (lib) => {
        const i = t.toLowerCase().indexOf(lib.toLowerCase());
        if (i < 0) return undefined;
        /* la valeur précède son libellé dans la tuile */
        const avant = t.slice(Math.max(0, i - 60), i).trim().split('\n').filter(Boolean);
        return avant.length ? avant[avant.length - 1] : null;
      };
      return { lire: lire.toString(), t };
    });
    const norm = (x) => String(x).replace(/[\u00a0\u202f\u2009]/g, ' ').toLowerCase();
    const valeurDe = (lib) => {
      const t = vu.t;
      const i = norm(t).indexOf(norm(lib));
      if (i < 0) return undefined;
      const avant = t.slice(Math.max(0, i - 60), i).trim().split('\n').filter(Boolean);
      return avant.length ? nb(avant[avant.length - 1]) : null;
    };

    if (!c.sonde) { OK(c.nom + ' : aucun avantage propre attendu, rendu sans erreur'); continue; }
    const v = valeurDe(c.sonde);
    if (v === undefined) { KO(c.nom + ' : la tuile « ' + c.sonde + ' » ne s\'affiche pas'); continue; }
    if (c.exact != null) {
      if (Math.abs(v - c.exact) > Math.max(2, c.exact * 0.01)) KO(c.nom + ' : ' + c.sonde + ' = ' + v + ' € — attendu ' + c.exact + ' € (recalculé depuis la règle)');
      else OK(c.nom + ' : ' + c.sonde + ' = ' + v + ' € — conforme à la règle');
    } else if (!(v >= (c.min || 1))) {
      KO(c.nom + ' : ' + c.sonde + ' = ' + v + ' — l\'avantage du régime est NUL, il ne remonte pas');
    } else OK(c.nom + ' : ' + c.sonde + ' = ' + v);
  }

  /* ═══ L'EFFORT MENSUEL DOIT INCLURE LES CHARGES D'EXPLOITATION ═══
     Jusqu'au 02/09 il ne retenait que « mensualité − loyer net de vacance » :
     taxe foncière, charges de copropriété et frais de gestion étaient oubliés,
     soit ~198 €/mois sur ce bien. Le CGP l'a vu à l'œil : « un investissement
     immobilier revient entre 350 et 600 €, ça n'existe plus à 160 € ».
     Attendu recalculé À LA MAIN, hors fiscalité (qui ne peut qu'alléger) :
       mensualité 143 000 € sur 25 ans à 3,6 %          =  723,6 €
       + assurance emprunteur 0,30 %/an sur le capital  =   35,8 €
       − loyer 600 € net de 20 % de vacance             = −480,0 €
       + taxe foncière 1 200 + charges 600 par an       = + 150,0 €
       + gestion 8 % des loyers encaissés (5 760 €/an)  = +  38,4 €
                                                          ≈ 467,8 €/mois en année 1 */
  await p.evaluate((k) => {
    const sel = Array.from(document.querySelectorAll('select')).find(s => Array.from(s.options).some(o => o.value === k));
    const st = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set;
    st.call(sel, k); sel.dispatchEvent(new Event('change', { bubbles: true }));
  }, 'nu');
  await p.waitForTimeout(400);
  await p.evaluate(() => {
    const inputs = Array.from(document.querySelectorAll('input'));
    const i = inputs.find(inp => { let n = inp.previousSibling, a = ''; while (n && a.length < 30) { a = (n.textContent || n.nodeValue || '') + a; n = n.previousSibling; } return /Travaux an 1/.test(a); });
    if (i) { const st = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set; st.call(i, '0'); i.dispatchEvent(new Event('input', { bubbles: true })); }
  });
  await p.waitForTimeout(700);
  {
    const t = await p.evaluate(() => document.body.innerText);
    /* la valeur precede son libelle ; on la lit dans les 40 caracteres qui precedent */
    const i = t.toLowerCase().indexOf('effort mensuel net moyen');
    const avant = i < 0 ? '' : t.slice(Math.max(0, i - 40), i);
    const mm = avant.replace(/[\u00a0\u202f]/g, ' ').match(/(-?[\d ]+)\s*€\s*$/);
    const eff = mm ? parseInt(mm[1].replace(/[^\d-]/g, ''), 10) : null;
    if (eff == null) KO("l'effort mensuel du locatif ne s'affiche plus");
    else if (eff < 300) KO("effort mensuel de " + eff + " € — les charges d'exploitation (taxe foncière, copropriété, gestion) ne sont pas comptées : un investissement à ce prix n'existe pas aux taux actuels");
    else if (eff > 700) KO("effort mensuel de " + eff + " € — anormalement élevé, une charge est comptée deux fois");
    else OK("effort mensuel net moyen de " + eff + " € — charges d'exploitation comprises, ordre de grandeur du marché");
  }

  if (errs.length) KO('erreur JavaScript : ' + errs[0]);
  else OK('aucune erreur JavaScript sur les ' + CAS.length + ' régimes');

  console.log(ko === 0 ? '\nRÉGIMES : chacun produit son avantage' : '\nRÉGIMES : ' + ko + ' DÉFAUT(S)');
  await b.close();
  process.exit(ko === 0 ? 0 : 1);
})();
