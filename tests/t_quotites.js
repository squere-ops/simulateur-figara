/* ═══════════════════════════════════════════════════════════════════════════
   LES QUOTITÉS D'ASSURANCE EMPRUNTEUR SONT LUES PAR LES ANALYSES (20/09/2026)

   Le CGP : « au niveau des crédits on informe systématiquement si le prêt est
   assuré à 100 % sur chaque tête ou autre. Pourtant dans tes analyses
   postérieures, tu réagis comme si tu n'étais pas au courant alors que tout a
   été renseigné. Fais les branchements. »

   Ce banc mesure le BRANCHEMENT, pas l'affichage : il appelle le moteur de
   succession sur un même dossier, quotité par quotité, et vérifie que l'actif
   transmissible bouge dans le sens de la règle arbitrée avec le CGP —
   au décès, le prêt assuré sur la tête du défunt est SOLDÉ à hauteur de sa
   quotité, donc sa dette ne se déduit plus de son actif transmissible.

   RÈGLE DE PRUDENCE : quotité inconnue (« je ne sais pas », champ vide) → rien
   n'est éteint. C'est le seul cas où la formule « quotités à vérifier » garde
   son sens, et le banc le contrôle aussi.
   ═══════════════════════════════════════════════════════════════════════════ */
const { chromium } = require('playwright');

let ko = 0;
const OK = (m) => console.log('   ✓ ' + m);
const KO = (m) => { console.log('   ✗ ' + m); ko++; };

/* Dossier minimal : couple marié, deux enfants, une RP de 400 000 € financée
   par un crédit de 200 000 €, détenue à 50/50. Rien d'autre — l'écart mesuré
   ne peut donc venir que de la quotité. */
const DOSSIER = {
  situation: 'marie', conjointQ: 'oui', civilite: 'M.',
  nom: 'TEST', prenom: 'Jean', dateNaissance: '1980-01-01',
  conjoint: { nom: 'TEST', prenom: 'Jeanne', dateNaissance: '1982-01-01' },
  enfantsQ: 'oui', enfants: [{ prenom: 'Alice', filiation: 'commun' }, { prenom: 'Bob', filiation: 'commun' }],
  logement: 'proprietaire', rpValeur: '400000', rpDetenteur: 'commun',
  rpCreditQ: 'oui', rpCrd: '200000', rpMensualite: '1000',
  biensQ: 'non', fonciersQ: 'non', avoirsQ: 'non', creditsQ: 'non', donationsQ: 'non',
};

(async () => {
  const browser = await chromium.launch({ executablePath: process.env.PW_CHROMIUM || undefined });
  const page = await browser.newPage();
  const errs = [];
  page.on('pageerror', e => { if (!/tailwind is not defined/.test(String(e))) errs.push(String(e)); });
  await page.goto((process.env.PW_PAGE || 'http://localhost:8899/test_local.html') + '?etude=1', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  const lire = (quot) => page.evaluate(([D, q]) => {
    const d = JSON.parse(JSON.stringify(D));
    d.rpAssurQuotite = q;
    const sc = window.ncCalcSuccession(d);
    if (!sc) return null;
    const v = sc.volets.find(x => x.qui === 'client');
    return {
      assiette: v.assiette, soldee: v.detteSoldee, restante: v.detteRestante,
      connues: sc.quotitesConnues,
      droits: Math.round((v.scenarios[0] || {}).droitsTotal || 0),
    };
  }, [DOSSIER, quot]);

  console.log('\n═══ 1 · LE MOTEUR LIT-IL SEULEMENT LA QUOTITÉ ? ═══');
  const nsp = await lire('nsp');
  const cent = await lire('100_100');
  if (!nsp || !cent) { KO('ncCalcSuccession ne rend rien sur le dossier de test'); }
  else {
    console.log('   nsp     :', JSON.stringify(nsp));
    console.log('   100/100 :', JSON.stringify(cent));
    if (nsp.assiette === cent.assiette) KO('la quotité ne change RIEN à l\'actif transmissible : le branchement n\'est pas fait');
    else OK('la quotité change l\'actif transmissible (' + nsp.assiette + ' € → ' + cent.assiette + ' €)');
  }

  console.log('\n═══ 2 · QUOTITÉ INCONNUE : LECTURE PRUDENTE ═══');
  if (nsp) {
    /* part du client dans la dette : 200 000 € × 50 % = 100 000 € */
    if (Math.abs(nsp.soldee) > 1) KO('quotité inconnue : ' + nsp.soldee + ' € seraient soldés — rien ne doit l\'être');
    else OK('quotité inconnue : aucun capital soldé');
    if (Math.abs(nsp.restante - 100000) > 1) KO('quotité inconnue : dette restante ' + nsp.restante + ' € — attendu 100 000 € (200 000 € × 50 % de détention)');
    else OK('quotité inconnue : la dette du défunt reste déduite en entier (100 000 €)');
    if (nsp.connues !== false) KO('le dossier se croit renseigné alors que la quotité vaut « je ne sais pas »');
    else OK('le dossier sait que la quotité lui manque');
  }

  console.log('\n═══ 3 · 100 % SUR CHAQUE TÊTE : LE PRÊT EST SOLDÉ ═══');
  if (cent) {
    if (Math.abs(cent.soldee - 100000) > 1) KO('100/100 : ' + cent.soldee + ' € soldés — attendu 100 000 €');
    else OK('100/100 : 100 000 € de capital restant dû soldés au décès');
    if (Math.abs(cent.restante) > 1) KO('100/100 : il reste ' + cent.restante + ' € de dette — attendu 0 €');
    else OK('100/100 : plus aucune dette déduite de l\'actif transmissible');
    if (cent.assiette - nsp.assiette < 99000) KO('100/100 : l\'actif transmissible ne gagne que ' + (cent.assiette - nsp.assiette) + ' € — attendu ≈ 100 000 €');
    else OK('100/100 : l\'actif transmissible gagne ' + (cent.assiette - nsp.assiette) + ' €');
    if (cent.connues !== true) KO('la quotité est renseignée, le dossier ne le voit pas');
    else OK('le dossier se sait renseigné');
  }

  console.log('\n═══ 4 · 50/50 : LA MOITIÉ S\'ÉTEINT ═══');
  const moitie = await lire('50_50');
  if (moitie) {
    console.log('   50/50   :', JSON.stringify(moitie));
    if (Math.abs(moitie.soldee - 50000) > 1) KO('50/50 : ' + moitie.soldee + ' € soldés — attendu 50 000 € (la moitié de la part du défunt)');
    else OK('50/50 : 50 000 € soldés, 50 000 € restent à déduire');
  }

  console.log('\n═══ 5 · 100 % SUR L\'AUTRE TÊTE : RIEN NE S\'ÉTEINT AU DÉCÈS DU CLIENT ═══');
  const autre = await lire('100_conjoint');
  if (autre) {
    if (Math.abs(autre.soldee) > 1) KO('100 % conjoint : ' + autre.soldee + ' € soldés au décès du client — attendu 0 €');
    else OK('100 % conjoint : rien n\'est soldé au décès du client, sa dette reste déduite');
    if (Math.abs(autre.assiette - nsp.assiette) > 1) KO('100 % conjoint : l\'actif du client diffère du cas prudent (' + autre.assiette + ' vs ' + nsp.assiette + ')');
    else OK('100 % conjoint : l\'actif transmissible du client est inchangé');
  }

  console.log('\n═══ 6 · LE CURSEUR DE LA PROJECTION PART DE LA SAISIE ═══');
  const curseur = await page.evaluate((D) => {
    const f = (q) => { const d = JSON.parse(JSON.stringify(D)); d.rpAssurQuotite = q; return window.ncQuotDefaut(d); };
    return { nsp: f('nsp'), cent: f('100_100'), moitie: f('50_50'), trente: f('30_70') };
  }, DOSSIER);
  console.log('   ', JSON.stringify(curseur));
  if (curseur.nsp !== 100) KO('quotité inconnue : le curseur devrait rester à 100 (valeur historique) — lu ' + curseur.nsp);
  else OK('quotité inconnue : le curseur reste à 100, le conseiller garde la main');
  if (curseur.cent !== 100) KO('100/100 : curseur attendu 100 — lu ' + curseur.cent);
  else OK('100/100 : curseur à 100');
  if (curseur.moitie !== 50) KO('50/50 : curseur attendu 50 — lu ' + curseur.moitie);
  else OK('50/50 : le curseur suit la saisie (50)');
  if (curseur.trente !== 70) KO('30/70 : curseur attendu 70 (la plus forte des deux têtes) — lu ' + curseur.trente);
  else OK('30/70 : le curseur prend la plus forte des deux têtes (70)');

  console.log('\nPAGEERRORS:', errs.length ? errs.slice(0, 3).join(' | ') : 'aucune');
  if (errs.length) ko++;
  await browser.close();
  console.log(ko ? '\nQUOTITÉS : ' + ko + ' DÉFAUT(S)' : '\nQUOTITÉS : LE BRANCHEMENT EST FAIT');
  process.exit(ko ? 1 : 0);
})();
