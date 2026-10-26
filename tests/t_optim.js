/* ═══════════════════════════════════════════════════════════════════════
   OPTIMISATION DU RATTACHEMENT DES ENFANTS — union libre.

   En union libre, les enfants se rattachent à UNE seule déclaration. Le choix
   change l'impôt TOTAL du couple, parfois de plus de 1 800 €, et rien ne disait
   lequel était le meilleur : le CGP devait basculer à la main et comparer.

   Ce test vérifie DEUX situations opposées, chacune recalculée à la main :
   — foyer équilibré : les deux personnes saturent le plafond du quotient
     familial, le rattachement ne change RIEN. Un outil qui annoncerait un gain
     ici serait faux ;
   — foyer déséquilibré : la demi-part ne sert presque à rien chez celui qui a
     de faibles revenus, le gain est réel.
   ═══════════════════════════════════════════════════════════════════════ */
const { chromium } = require('playwright');
const fs = require('fs');

const dossier = (montantConjoint) => ({
  civilite: "M.", nom: "BRUN", prenom: "Jean", situation: "union_libre",
  dateNaissance: "1983-01-01", conjointQ: "oui",
  conjoint: { prenom: "Eve", dateNaissance: "1985-01-01", civilite: "Mme" },
  activites: ["salarie"],
  actSalarie: { poste: "cadre", statut: "cadre", mode: "net", montant: "9000", periode: "mois", nbMois: "12" },
  conjointRev: { activites: ["salarie"], actSalarie: { poste: "cadre", statut: "cadre", mode: "net", montant: montantConjoint, periode: "mois", nbMois: "12" } },
  enfantsQ: "oui", enfants: [{ id: 1, prenom: "Lou", annee: "2014", charge: "100", filiation: "commun" }],
  logement: "locataire", loyer: "1200"
});

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const p = await b.newPage({ viewport: { width: 1300, height: 900 } });
  const errs = [];
  p.on('pageerror', e => { if (!/tailwind/.test(String(e))) errs.push(String(e).slice(0, 200)); });
  await p.goto('http://127.0.0.1:8899/test_local.html', { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(3000);

  let ko = 0;
  const KO = m => { ko++; console.log('   ✗ ' + m); };
  const OK = m => console.log('   ✓ ' + m);

  const mesure = async (mc) => p.evaluate((dd) => {
    const base = window.migrateAudit(dd);
    const an = new Date().getFullYear();
    const t = (v) => window.ncCalcFisc({ ...base, rattachementEnfants: v }, an).impotNet;
    return { client: t("client"), conjoint: t("conjoint") };
  }, dossier(mc));

  /* 1. foyer équilibré — 9 000 € et 4 133 € par mois */
  const eq = await mesure("4133");
  if (Math.abs(eq.client - eq.conjoint) < 1)
    OK('foyer équilibré : le rattachement ne change pas l\'impôt (' + Math.round(eq.client) + ' €) — les deux saturent le plafond du quotient familial');
  else KO('foyer équilibré : écart de ' + Math.round(Math.abs(eq.client - eq.conjoint)) + ' € annoncé alors que les deux demi-parts sont plafonnées à l\'identique');

  /* 2. foyer déséquilibré — 9 000 € et 1 500 € par mois */
  const de = await mesure("1500");
  const gain = Math.round(de.conjoint - de.client);
  if (gain > 500)
    OK('foyer déséquilibré : ' + gain + ' € de gain à rattacher au revenu le plus élevé (' + Math.round(de.client) + ' € contre ' + Math.round(de.conjoint) + ' €)');
  else KO('foyer déséquilibré : gain de ' + gain + ' € seulement — la demi-part devrait être nettement plus utile chez le haut revenu');

  /* 3. le bouton existe et agit */
  const src = fs.readFileSync('index.html', 'utf8').replace(/console\.log\('%cBUILD[\s\S]*?\n/, '');
  if (/Optimiser — \{nf\(gain\)\} € d'impôt en moins/.test(src)
      && /onClick=\{\(\) => set\("rattachementEnfants", meilleur\)\}/.test(src))
    OK('le bouton d\'optimisation est présent et applique le rattachement le plus favorable');
  else KO('le bouton d\'optimisation du rattachement a disparu');

  /* 4. il ne doit JAMAIS proposer d'optimiser ce qui l'est déjà */
  if (/gain >= 1 && meilleur !== actuel \? \(/.test(src))
    OK('le bouton ne s\'affiche que si un autre rattachement est réellement meilleur');
  else KO('le bouton s\'afficherait même quand le rattachement actuel est déjà le meilleur');

  if (errs.length) KO('erreur JavaScript : ' + errs[0]);
  else OK('aucune erreur JavaScript');

  console.log(ko === 0 ? '\nOPTIMISATION : conforme' : '\nOPTIMISATION : ' + ko + ' DÉFAUT(S)');
  await b.close();
  process.exit(ko === 0 ? 0 : 1);
})();
