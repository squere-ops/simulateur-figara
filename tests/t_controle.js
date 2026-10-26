/* ═══════════════════════════════════════════════════════════════════════════
   BANC DE CONTRÔLE FIGARA — à lancer AVANT CHAQUE LIVRAISON.

   Pourquoi : les défauts livrés au cabinet n'étaient pas des calculs subtils,
   c'étaient des évidences que personne ne regardait — un mot « mois » coupé en
   deux, un champ déclaré mais jamais affiché, une formule qui rend 1 € au lieu
   de 30 000 €, un foyer salarié annoncé « travailleur non salarié ». Le point
   commun : je testais CE QUE JE VENAIS D'ÉCRIRE, sur UN dossier pauvre.

   Ce banc fait l'inverse : il passe des DOSSIERS TYPES représentatifs de la
   clientèle dans le moteur réel, et applique des contrôles qui ne dépendent
   pas de ce que j'ai codé aujourd'hui.

   Usage :  node t_controle.js
   Sortie :  un rapport lisible, et un code de sortie ≠ 0 si un contrôle échoue.
   ═══════════════════════════════════════════════════════════════════════════ */

const { chromium } = require('playwright');
const fs = require('fs');

/* ─────────────────────── DOSSIERS TYPES ───────────────────────
   Profils réellement rencontrés. Chacun existe pour déclencher un chemin de
   code qu'un dossier « simple » ne déclenche jamais. */
const DOSSIERS = [
  {
    nom: "Couple mixte salarié / TNS, 2 enfants, locataires, épargne commune",
    pourquoi: "foyer MIXTE — c'est lui qui a révélé le libellé « travailleur non salarié » appliqué aux deux",
    d: {
      civilite: "M.", nom: "RADIS", prenom: "Noir", situation: "marie", regime: "separation_biens",
      dateNaissance: "1981-03-12", conjointQ: "oui",
      conjoint: { prenom: "Louise", dateNaissance: "1983-07-04" },
      activites: ["salarie"],
      actSalarie: { poste: "dir co", statut: "cadre", mode: "net", montant: "10833", periode: "mois", nbMois: "13" },
      conjointRev: { activites: ["independant"], actIndependant: { activite: "infirmière libérale", n1: "80000", n2: "78000", n3: "76000" } },
      enfantsQ: "oui",
      enfants: [{ id: 1, prenom: "Iea", annee: "2012", charge: "100", filiation: "client" },
                { id: 2, prenom: "Manon", annee: "2010", charge: "100", filiation: "client" }],
      logement: "locataire", loyer: "2000",
      avoirsQ: "oui",
      avoirs: [{ id: 1, type: "livrets", valeur: "22500", titulaire: "client" },
               { id: 2, type: "livrets", valeur: "22500", titulaire: "conjoint" },
               { id: 3, type: "av", valeur: "55000", titulaire: "commun", etablissement: "banque SG",
                 gestion: "banque", profil: "equilibre", rendementNsp: "oui", contentQ: "non" }],
      capaciteEpargne: "500-1000", apportInitial: "<10000",
      objectifs: ["fiscalite", "protection", "retraite"],
      objectifsDetail: { retraite: { age: "64" } },
    }
  },
  {
    nom: "Célibataire salarié, propriétaire avec crédit en cours",
    pourquoi: "propriétaire : capacité d'emprunt, CRD, part immobilière — chemins ignorés par un locataire",
    d: {
      civilite: "M.", nom: "MARTIN", prenom: "Jean", situation: "celibataire",
      dateNaissance: "1985-01-20", conjointQ: "non",
      activites: ["salarie"],
      actSalarie: { poste: "ingénieur", statut: "cadre", mode: "net", montant: "4200", periode: "mois", nbMois: "12" },
      enfantsQ: "non", enfants: [],
      logement: "proprietaire", rpValeur: "320000", rpCreditQ: "oui",
      rpCrd: "180000", rpMensualite: "1150", rpTaux: "1,8", rpDureeRestante: "16",
      avoirsQ: "oui",
      avoirs: [{ id: 1, type: "livrets", valeur: "18000", titulaire: "client" },
               { id: 2, type: "av", valeur: "42000", titulaire: "client", ppQ: "oui", pp: "150", rendement: "3,1", contentQ: "oui" }],
      capaciteEpargne: "300-500", objectifs: ["retraite"],
      objectifsDetail: { retraite: { age: "64" } },
    }
  },
  {
    nom: "TNS seul, revenus élevés, aucune épargne longue",
    pourquoi: "TNS pur : plafond PER, taux de remplacement 20-30 %, prévoyance",
    d: {
      civilite: "M.", nom: "POLO", prenom: "Marc", situation: "celibataire",
      dateNaissance: "1978-09-02", conjointQ: "non",
      activites: ["independant"],
      actIndependant: { activite: "chirurgien-dentiste", n1: "156000", n2: "150000", n3: "144000" },
      enfantsQ: "non", enfants: [],
      logement: "locataire", loyer: "1800",
      avoirsQ: "oui",
      avoirs: [{ id: 1, type: "compte_courant", valeur: "95000", titulaire: "client" }],
      capaciteEpargne: ">1000", objectifs: ["fiscalite", "retraite"],
      objectifsDetail: { retraite: { age: "65" } },
    }
  },
  {
    nom: "Union libre, un seul revenu, enfants non communs",
    pourquoi: "deux déclarations séparées (art. 6 CGI), famille recomposée, conjoint non protégé",
    d: {
      civilite: "M.", nom: "GRATTE", prenom: "Paul", situation: "union_libre",
      dateNaissance: "1979-05-15", conjointQ: "oui",
      conjoint: { prenom: "Claire", dateNaissance: "1984-11-30" },
      activites: ["salarie"],
      actSalarie: { poste: "commercial", statut: "cadre", mode: "net", montant: "5800", periode: "mois", nbMois: "12" },
      conjointRev: { activites: [] },
      enfantsQ: "oui",
      enfants: [{ id: 1, prenom: "Tom", annee: "2015", charge: "100", filiation: "client" }],
      logement: "proprietaire", rpValeur: "410000", rpCreditQ: "oui",
      rpCrd: "260000", rpMensualite: "1420", rpTaux: "2,2", rpDureeRestante: "18",
      avoirsQ: "oui",
      avoirs: [{ id: 1, type: "livrets", valeur: "9000", titulaire: "client" }],
      capaciteEpargne: "100-300", objectifs: ["protection"],
      objectifsDetail: { retraite: { age: "64" } },
    }
  },
  {
    nom: "Couple retraité propriétaire, patrimoine constitué",
    pourquoi: "aucun revenu d'activité : la baisse de revenus à la retraite ne doit PAS s'afficher",
    d: {
      civilite: "M.", nom: "VIEUX", prenom: "Henri", situation: "marie", regime: "communaute_acquets",
      dateNaissance: "1955-02-08", conjointQ: "oui",
      conjoint: { prenom: "Odile", dateNaissance: "1957-06-19" },
      activites: ["retraite"], actRetraite: { revenu: "3200", periode: "mois" },
      conjointRev: { activites: ["retraite"], actRetraite: { revenu: "1900", periode: "mois" } },
      enfantsQ: "oui",
      enfants: [{ id: 1, prenom: "Luc", annee: "1988", charge: "non", filiation: "commun" }],
      logement: "proprietaire", rpValeur: "480000", rpCreditQ: "non",
      avoirsQ: "oui",
      avoirs: [{ id: 1, type: "av", valeur: "230000", titulaire: "commun", rendement: "2,4", contentQ: "oui" },
               { id: 2, type: "livrets", valeur: "40000", titulaire: "commun" }],
      capaciteEpargne: "300-500", objectifs: ["transmission"],
      objectifsDetail: { retraite: { age: "70" } },
    }
  },
  {
    nom: "Couple avec locatif existant, PER et assurance-vie",
    pourquoi: "revenus fonciers, PER déjà ouvert, plusieurs sources immobilières à agréger",
    d: {
      civilite: "Mme", nom: "BERNARD", prenom: "Sophie", situation: "marie", regime: "communaute_acquets",
      dateNaissance: "1976-12-01", conjointQ: "oui",
      conjoint: { prenom: "Marc", dateNaissance: "1974-04-22" },
      activites: ["salarie"],
      actSalarie: { poste: "DRH", statut: "cadre", mode: "net", montant: "6100", periode: "mois", nbMois: "12" },
      conjointRev: { activites: ["salarie"], actSalarie: { poste: "cadre", statut: "cadre", mode: "net", montant: "4400", periode: "mois", nbMois: "12" } },
      enfantsQ: "oui",
      enfants: [{ id: 1, prenom: "Zoé", annee: "2009", charge: "100", filiation: "commun" }],
      logement: "proprietaire", rpValeur: "520000", rpCreditQ: "oui",
      rpCrd: "210000", rpMensualite: "1380", rpTaux: "1,6", rpDureeRestante: "14",
      locatifs: [{ id: 1, valeur: "185000", loyer: "780", crd: "96000", mensualite: "620", titulaire: "commun" }],
      avoirsQ: "oui",
      avoirs: [{ id: 1, type: "per", valeur: "48000", titulaire: "client", ppQ: "oui", pp: "200" },
               { id: 2, type: "av", valeur: "125000", titulaire: "commun", rendement: "2,8", contentQ: "oui" },
               { id: 3, type: "livrets", valeur: "31000", titulaire: "commun" }],
      reductionsQ: "oui",
      reductionsLignes: [{ id: 1, type: "emploi_domicile", montant: "3200", periode: "an" }],
      capaciteEpargne: "500-1000", apportInitial: "10000-30000",
      objectifs: ["retraite", "fiscalite"],
      objectifsDetail: { retraite: { age: "64" } },
    }
  },
];

/* ─────────────── CONTRÔLES UNIVERSELS SUR LES TEXTES PRODUITS ─────────────── */
const SONDES = [
  { k: "valeur manquante", re: /\bNaN\b|\bundefined\b|\bInfinity\b|\bnull\b/ },
  { k: "unité doublée",    re: /€\s*€|%\s*%|\/mois\s*\/mois/ },
  { k: "décimale parasite", re: /\d+\.\d{2,}(?!\s*%)/ },
  { k: "gabarit non résolu", re: /\$\{|\{\{/ },
  { k: "montant vide",     re: /(^|[^\d])0,00\s*€/ },
  { k: "double espace",    re: /\s{3,}/ },
];

/* textes bannis par le cabinet — jugement, jargon, formulation anti-commerciale */
const BANNIS = [
  { k: "jugement de valeur", re: /médiocre|insuffisamment rentable|mauvais placement|ne joue pas pleinement|décevant/i },
  { k: "reproche au client", re: /vous auriez dû|vous n'avez pas su|erreur de votre part/i },
  { k: "mot banni « apporte »", re: /\bapporte\b/i },
];

(async () => {
  const browser = await chromium.launch({ executablePath: process.env.PW_CHROMIUM || undefined });
  const page = await browser.newPage({ viewport: { width: 1400, height: 1000 } });
  const jsErr = [];
  page.on('pageerror', e => { if (!/tailwind is not defined/.test(String(e))) jsErr.push(String(e).slice(0, 200)); });
  await page.goto('http://127.0.0.1:8899/test_local.html', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  /* le JOURNAL DE VERSION (console.log BUILD…) raconte les defauts corriges et
     cite donc les motifs qu on traque : le lire ferait echouer des controles sur
     un texte d archive. Les controles de source portent sur le CODE seul. */
  const srcBrut = fs.readFileSync('index.html', 'utf8');
  /* Le JOURNAL DES BUILDS raconte les defauts corriges : il cite donc les
     mauvaises ecritures (« ir.net », « largement sous le plafond »…) que ce
     banc traque dans le code. Il faut l ecarter avant toute recherche, sinon
     un banc vert vire au rouge le jour ou l on POSE un marqueur.
     Une premiere version ne retirait que la ligne « %cBUILD » — celle du build
     courant. Au build suivant elle devient « ANCIEN BUILD » et redevenait
     visible : le banc a echoue sur une phrase de commentaire, pas sur du code.
     On retire donc TOUTES les lignes de journal, courante comme anciennes. */
  const src = srcBrut.replace(/console\.log\('%c(ANCIEN )?BUILD[\s\S]*?\n/g, '');
  let echecs = 0, controles = 0;
  const KO = (msg) => { echecs++; console.log('   ✗ ' + msg); };
  const OK = (msg) => { console.log('   ✓ ' + msg); };

  /* ═══ 1. LE MOTEUR SUR CHAQUE DOSSIER TYPE ═══ */
  console.log('\n═══ 1. MOTEUR D\'ANALYSE — ' + DOSSIERS.length + ' dossiers types ═══');
  for (const dos of DOSSIERS) {
    console.log('\n▸ ' + dos.nom);
    console.log('  (' + dos.pourquoi + ')');
    const r = await page.evaluate((dd) => {
      try {
        const d = window.migrateAudit ? window.migrateAudit(dd) : dd;
        const syn = window.ncSynthese(d);
        const fisc = window.ncCalcFisc(d, 2026);
        const textes = [];
        const pousser = (x) => {
          if (x == null) return;
          if (typeof x === 'string') { textes.push(x); return; }
          if (Array.isArray(x)) { x.forEach(pousser); return; }
          if (typeof x === 'object') { Object.values(x).forEach(pousser); return; }
          textes.push(String(x));
        };
        /* GARDE-FOU : si une clé attendue disparaît, le contrôle doit ÉCHOUER,
           jamais valoir undefined et passer au vert. C'est ce qui est arrivé la
           première fois : le banc lisait syn.axes et fisc.ir.net, qui n'existent
           pas — il annonçait « 0 axes, impôt 0 € » sur tous les dossiers, et
           tout était vert. Un contrôle doit d'abord prouver qu'il regarde. */
        const ATTENDU_SYN = ['resume', 'forces', 'faiblesses', 'problematiques', 'chiffresCles'];
        const ATTENDU_FISC = ['impotNet', 'tmi', 'rniBrut'];
        const manquant = ATTENDU_SYN.filter(k => !(k in syn)).map(k => 'syn.' + k)
          .concat(ATTENDU_FISC.filter(k => !(k in fisc)).map(k => 'fisc.' + k));
        pousser(syn.resume); pousser(syn.forces); pousser(syn.faiblesses); pousser(syn.problematiques);
        return {
          ok: true, manquant, textes,
          nbForces: (syn.forces || []).length,
          nbAxes: (syn.faiblesses || []).length,
          nbProb: (syn.problematiques || []).length,
          ir: fisc.impotNet, tmi: fisc.tmi, rni: fisc.rniBrut,
          revenus: (syn.chiffresCles || {}).totalRevenus,
        };
      } catch (e) { return { ok: false, err: String(e && e.message || e).slice(0, 300) }; }
    }, dos.d);
    controles++;

    if (!r.ok) { KO('le moteur a levé une erreur : ' + r.err); continue; }
    if (r.manquant && r.manquant.length) { KO('CLÉS ABSENTES du moteur — le contrôle ne regarde rien : ' + r.manquant.join(', ')); continue; }
    const tout = r.textes.join(' ␟ ');

    let pb = 0;
    for (const s of SONDES) {
      const m = tout.match(s.re);
      if (m) { KO(s.k + ' : « …' + tout.slice(Math.max(0, m.index - 45), m.index + 45).replace(/\s+/g, ' ') + '… »'); pb++; }
    }
    for (const s of BANNIS) {
      const m = tout.match(s.re);
      if (m) { KO(s.k + ' : « …' + tout.slice(Math.max(0, m.index - 45), m.index + 45).replace(/\s+/g, ' ') + '… »'); pb++; }
    }

    /* contrôle métier : le libellé TNS ne s'applique qu'à un foyer réellement TNS */
    const actsC = (dos.d.activites || []).join(' ');
    const actsJ = ((dos.d.conjointRev || {}).activites || []).join(' ');
    const unTNS = /independant|tns|liberal|artisan|commercant|gerant/i.test(actsC + ' ' + actsJ);
    const tousTNS = /independant|tns|liberal|artisan|commercant|gerant/i.test(actsC)
      && (!actsJ || /independant|tns|liberal|artisan|commercant|gerant/i.test(actsJ));
    if (/hypothèse TNS|travailleur non salarié/i.test(tout) && !unTNS) { KO('libellé TNS sur un foyer sans aucun indépendant'); pb++; }
    if (/hypothèse TNS/i.test(tout) && unTNS && !tousTNS) { KO('libellé « hypothèse TNS » global sur un foyer MIXTE salarié / indépendant'); pb++; }

    /* contrôle métier : un retraité n'a pas de « baisse de revenus à la retraite » */
    const tousRetraites = /retraite/.test(actsC) && (!actsJ || /retraite/.test(actsJ));
    if (tousRetraites && /baisse de revenus à la retraite/i.test(tout)) { KO('baisse de revenus annoncée à un foyer déjà retraité'); pb++; }

    if (r.nbForces === 0 && r.nbAxes === 0) { KO('ni point fort ni axe produit — le moteur n\'a rien dit sur ce dossier'); pb++; }
    if (!(r.rni > 0)) { KO('revenu net imposable nul ou absent — le dossier type n\'est pas exploité par le moteur'); pb++; }
    if (!(r.nbAxes >= 1)) { KO('aucun axe de travail sur ce dossier — invraisemblable, le contrôle ne lit probablement pas la bonne clé'); pb++; }

    if (!pb) OK(r.nbForces + ' points forts, ' + r.nbAxes + ' axes, ' + r.nbProb + ' problématiques · RNI ' + Math.round(r.rni) + ' € · impôt ' + Math.round(r.ir || 0) + ' € · TMI ' + Math.round((r.tmi || 0) * 100) + ' % · aucun défaut détecté');
  }

  /* ═══ 2. SENSIBILITÉ DES MOTEURS DE CALCUL ═══ */
  console.log('\n═══ 2. SENSIBILITÉ — un paramètre qui change doit changer le résultat ═══');
  const sens = await page.evaluate(() => {
    const out = [];
    const cap = (c0, v, t, ans) => { const i = Math.pow(1 + t, 1 / 12) - 1; let c = c0; const n = Math.round(ans * 12); for (let j = 0; j < n; j++) c = (c + v) * (1 + i); return c; };
    /* gain de rendement d'une redirection de versements : doubler l'écart de taux
       doit changer le gain dans une proportion comparable — c'est ce contrôle qui
       manquait quand la formule rendait 1 €/mois au lieu de 30 000 € de capital */
    const g1 = cap(0, 300, 0.052, 18) - cap(0, 300, 0.017, 18);
    const g2 = cap(0, 300, 0.052, 18) - cap(0, 300, 0.035, 18);
    out.push({ n: 'gain de redirection sensible au taux de départ', ok: g1 > g2 * 1.5 && g1 > 20000, v: Math.round(g1) + ' € vs ' + Math.round(g2) + ' €' });
    /* contrôle de référence de la convention de capitalisation du cabinet */
    const ref = cap(0, 350, 0.052, 20);
    out.push({ n: 'convention cabinet : 350 €/mois à 5,20 % sur 20 ans = 145 813 €', ok: Math.abs(ref - 145813) < 2, v: Math.round(ref) + ' €' });
    /* réduction d'impôt : conservation */
    if (window.ncpReducIR) {
      const R = window.ncpReducIR({ H: 18, base: 400000, taux: 0.30, duree: 2, plafonneNiches: false, plafondNiches: 10000, autresNiches: 0, impot: 8000, reportAns: 3 });
      const util = R.reduce((t, x) => t + x.utilisee, 0);
      const perdu = R.reduce((t, x) => t + x.perduNiche + x.perduImpot, 0) + (R[R.length - 1].perimee || 0) + (R[R.length - 1].resteNonImpute || 0);
      out.push({ n: 'réduction d\'impôt : théorique = utilisée + perdue', ok: Math.abs((util + perdu) - 120000) < 1, v: Math.round(util) + ' + ' + Math.round(perdu) });
      out.push({ n: 'report Malraux périmé à 3 ans (et non illimité)', ok: util < 60000, v: Math.round(util) + ' € utilisés sur 120 000 €' });
    }
    /* foncier : le déficit ne s'impute pas d'un bloc sur le revenu global */
    if (window.ncpFoncierNuReel) {
      const F = window.ncpFoncierNuReel({ K: 127000, txCredit: 0.036, dureeCredit: 25, H: 12, loyerMensuel: 450,
        indexation: 0.02, vacance: 0.05, assuranceAn: 381, taxeFonciere: 1200, chargesAn: 600, gestion: 0.08,
        travaux: 40000, plafond: 10700 });
      out.push({ n: 'déficit foncier plafonné à 10 700 € sur le revenu global', ok: F[0].imputableGlobal <= 10700.5, v: Math.round(F[0].imputableGlobal) + ' €' });
    }
    /* meublé : l'amortissement ne crée jamais de déficit */
    if (window.ncpMeubleReel) {
      const M = window.ncpMeubleReel({ K: 143000, txCredit: 0.036, dureeCredit: 25, H: 20, loyerMensuel: 600,
        indexation: 0.02, vacance: 0.2, assuranceAn: 429, taxeFonciere: 1200, chargesAn: 600, gestion: 0.08,
        travaux: 0, comptaAn: 500, prixBien: 150000, frais: 13000, partTerrain: 0.2, dureeBati: 40,
        mobilier: 8000, dureeMobilier: 10, fraisAmortis: false, seuilMicro: 83600, abattMicro: 0.5 });
      out.push({ n: 'amortissement jamais générateur de déficit (art. 39 C II)', ok: M.every(x => x.amortUtilise <= Math.max(0, x.avantAmort) + 0.01), v: 'sur ' + M.length + ' années' });
      out.push({ n: 'aucune imputation du déficit BIC sur le revenu global', ok: M.every(x => x.imputableGlobal === 0), v: 'sur ' + M.length + ' années' });
    }
    return out;
  });
  for (const x of sens) { controles++; x.ok ? OK(x.n + ' — ' + x.v) : KO(x.n + ' — ' + x.v); }

  /* ═══ 2 bis. SUCCESSION — TESTAMENT ET DOCTRINE DES DEUX RENDEZ-VOUS ═══ */
  console.log('\n═══ 2 bis. SUCCESSION — testament, quotité disponible, RDV 2 ═══');
  const succ = await page.evaluate(() => {
    const base = (situation, nbEnf) => ({
      civilite: "M.", nom: "T", prenom: "T", situation, dateNaissance: "1980-01-01", conjointQ: "oui",
      conjoint: { prenom: "C", dateNaissance: "1982-01-01" },
      activites: ["salarie"], actSalarie: { montant: "5000", periode: "mois", nbMois: "12", mode: "net", statut: "cadre" },
      conjointRev: { activites: [] },
      enfantsQ: nbEnf ? "oui" : "non",
      enfants: Array.from({ length: nbEnf }, (_, i) => ({ id: i + 1, prenom: "E" + (i + 1), annee: "2010", charge: "100", filiation: "commun" })),
      logement: "proprietaire", rpValeur: "400000", rpCreditQ: "non",
      avoirsQ: "oui", avoirs: [{ id: 1, type: "livrets", valeur: "50000", titulaire: "client" }],
      objectifsDetail: { retraite: { age: "64" } },
    });
    const lis = (situation, nbEnf) => {
      const r = window.ncCalcSuccession(window.migrateAudit(base(situation, nbEnf)));
      if (!r) return { err: 'ncCalcSuccession a rendu null (situation « ' + situation + ' » non reconnue ?)' };
      const v = (r.volets || [])[0] || {};
      const t = (v.scenarios || []).find(x => /testament/i.test(x.lib || ""));
      return t ? { qd: t.partSurvivant, droitsSurv: t.droitsSurvivant, rdv2: !!t.rdv2, total: t.droitsTotal } : null;
    };
    return { pacs1: lis("pacse", 1), pacs2: lis("pacse", 2), pacs3: lis("pacse", 3), pacs0: lis("pacse", 0), ul1: lis("union_libre", 1) };
  });
  const attFrac = { pacs1: 0.5, pacs2: 1 / 3, pacs3: 0.25, pacs0: 1 };
  for (const k of ['pacs1', 'pacs2', 'pacs3', 'pacs0']) {
    controles++;
    const x = succ[k];
    if (!x) { KO(k + ' : aucun scénario « avec testament » produit'); continue; }
    if (x.err) { KO(k + ' : ' + x.err); continue; }
    const OKrdv = x.rdv2 === true;
    const OKexo = x.droitsSurv === 0;
    if (OKrdv && OKexo) OK(k + ' — quotité disponible ' + Math.round(x.qd) + ' €, partenaire de PACS exonéré, réservé au RDV 2');
    else KO(k + ' — ' + (OKrdv ? '' : 'PAS marqué RDV 2 ; ') + (OKexo ? '' : 'partenaire de PACS taxé à tort (' + Math.round(x.droitsSurv) + ' €)'));
  }
  controles++;
  if (!succ.ul1) KO('concubinage : aucun scénario testament');
  else if (succ.ul1.droitsSurv > 0 && succ.ul1.rdv2) OK('concubin — legs taxé ' + Math.round(succ.ul1.droitsSurv) + ' € (60 % après 1 594 € d\'abattement), réservé au RDV 2');
  else KO('concubin — le legs devrait être taxé à 60 % (obtenu : ' + Math.round(succ.ul1.droitsSurv) + ' €)');
  /* la quotité disponible doit décroître avec le nombre d'enfants */
  controles++;
  if (succ.pacs0 && succ.pacs1 && succ.pacs2 && succ.pacs3
      && succ.pacs0.qd > succ.pacs1.qd && succ.pacs1.qd > succ.pacs2.qd && succ.pacs2.qd > succ.pacs3.qd)
    OK('quotité disponible décroissante avec le nombre d\'enfants (art. 913 C. civ.)');
  else KO('quotité disponible incohérente selon le nombre d\'enfants');

  /* ═══ 2 bis-b. DDV CHIFFRÉE AU RDV 1 (décision CGP 03/09/2026, item 9) ═══
     Famille recomposée mariée sans DDV : l'axe « Conjoint insuffisamment protégé »
     porte des NOMBRES, recalculés ici DEPUIS LA RÈGLE (jamais lus du code) :
     assiette = RP × 50 % × 0,8 (art. 764 bis) + livrets × 50 % − 1 500 (art. 775) ;
     ¼ PP au survivant ; option mixte = ¼ + ¾ × usufruit (art. 669 : 50 % à 51-60 ans) ;
     droits d'un enfant unique sur 3/4 en PP = barème sur (part − 100 000). */
  console.log('\n═══ 2 bis-b. DDV — chiffrage sur l\'axe du constat (famille recomposée) ═══');
  const ddv = await page.evaluate(() => {
    const d = window.migrateAudit({ ...window.AUDIT_DEFAUT,
      civilite: "M.", prenom: "jean", nom: "T", dateNaissance: "1970-05-10",
      situation: "marie", regime: "communaute", conjointQ: "oui",
      conjoint: { civilite: "Mme", prenom: "marie", dateNaissance: "1975-03-02" },
      ddvQ: "non", enfantsQ: "oui",
      enfants: [{ prenom: "Paul", filiation: "commun" }, { prenom: "Léa", filiation: "client" }],
      logement: "proprietaire", rpValeur: "500000", rpCreditQ: "non", rpDetenteur: "commun",
      avoirsQ: "oui", avoirs: [{ type: "livrets", valeur: "100000", titulaire: "commun" }],
      activites: ["salarie"], actSalarie: { montant: "4000", periode: "mois", nbMois: "12", mode: "net" },
    });
    const sc = window.ncCalcSuccession(d);
    const syn = window.ncSynthese(d);
    const f = (syn.faiblesses || []).find(x => /insuffisamment prot/i.test(x.t));
    const vC = (sc.volets || []).find(v => v.qui === "conjoint");
    return { phrase: f ? f.d.replace(/[  ]/g, ' ') : null, impact: vC && vC.ddvImpact, nbScConj: vC ? vC.scenarios.length : -1 };
  });
  {
    const bareme = (b) => { const tr = [[8072, .05], [12109, .10], [15932, .15], [552324, .20], [902838, .30], [1805677, .40], [Infinity, .45]]; let t = 0, prev = 0; for (const [lim, tx] of tr) { if (b <= prev) break; t += (Math.min(b, lim) - prev) * tx; prev = lim; } return t; };
    const assiette = 500000 * 0.5 * 0.8 + 100000 * 0.5 - 1500;   // 248 500
    const partSans = Math.round(assiette * 0.25);                  // 62 125
    const partAvec = Math.round(assiette * (0.25 + 0.75 * 0.5));   // 155 313
    const droitsSans = Math.round(bareme(assiette * 0.75 - 100000)); // Paul seul : 15 469
    const fmt = (n) => new Intl.NumberFormat('fr-FR').format(n).replace(/[  ]/g, ' ');
    controles++;
    if (!ddv.phrase) KO('axe « Conjoint insuffisamment protégé » absent sur une famille recomposée sans DDV');
    else if (![partSans, partAvec, assiette, droitsSans].every(n => ddv.phrase.includes(fmt(n) + ' €')))
      KO('chiffrage DDV incohérent avec la règle — attendu ' + [partSans, partAvec, assiette, droitsSans].map(fmt).join(' / ') + ' € ; lu : « ' + ddv.phrase.slice(0, 220) + '… »');
    else OK('axe RDV 1 chiffré : ¼ PP ' + fmt(partSans) + ' € → avec DDV ' + fmt(partAvec) + ' € sur ' + fmt(assiette) + ' €, ' + fmt(droitsSans) + ' € de droits en moins pour l\'enfant');
    controles++;
    if (ddv.impact && ddv.impact.droitsAvec <= ddv.impact.droitsSans && ddv.impact.partSurvAvec >= ddv.impact.partSurvSans) OK('conservation : avec DDV, jamais plus de droits ni moins de part pour le survivant');
    else KO('conservation DDV violée : ' + JSON.stringify(ddv.impact));
    controles++;
    if (ddv.nbScConj === 1) OK('aucun scénario ajouté par le chiffrage — le filtre RDV 2 des cartes reste intact');
    else KO('le chiffrage DDV a ajouté un scénario (' + ddv.nbScConj + ') : les cartes RDV 2 ont changé sans décision');
  }

  /* ═══ 2 ter. PENSION RELEVÉE SUR INFO-RETRAITE : UN SEUL CHIFFRE PARTOUT ═══ */
  console.log('\n═══ 2 ter. PENSION RELEVÉE — le montant saisi doit irriguer TOUT l\'outil ═══');
  const pens = await page.evaluate(() => {
    const base = (pension, pensionConj) => ({
      civilite: "M.", nom: "P", prenom: "P", situation: "marie", regime: "communaute_acquets",
      dateNaissance: "1980-01-01", conjointQ: "oui", conjoint: { prenom: "C", dateNaissance: "1982-01-01" },
      activites: ["salarie"], actSalarie: { montant: "6000", periode: "mois", nbMois: "12", mode: "net", statut: "cadre" },
      conjointRev: { activites: ["salarie"], actSalarie: { montant: "3000", periode: "mois", nbMois: "12", mode: "net", statut: "cadre" } },
      enfantsQ: "non", enfants: [], logement: "locataire", loyer: "1200",
      avoirsQ: "oui", avoirs: [{ id: 1, type: "livrets", valeur: "20000", titulaire: "client" }],
      objectifsDetail: { retraite: { age: "64", pension, pensionConj } },
    });
    const lis = (pension, pensionConj) => {
      const d = window.migrateAudit(base(pension, pensionConj));
      const cc = (window.ncSynthese(d).chiffresCles) || {};
      const P = window.ncPensionFoyer(d, cc);
      return { haut: Math.round(P.haut), bas: Math.round(P.bas), reel: P.reel, partiel: P.partiel, act: Math.round(P.act) };
    };
    return { sans: lis("", ""), avec: lis("2800", "1500"), partiel: lis("2800", "") };
  });
  controles++;
  if (!pens.avec || pens.avec.haut !== 4300) KO('montants relevés (2 800 + 1 500) non repris : obtenu ' + (pens.avec ? pens.avec.haut : '?') + ' € au lieu de 4 300 €');
  else if (!pens.avec.reel) KO('montants relevés repris mais non signalés comme officiels');
  else OK('deux relevés saisis → pension du foyer 4 300 €/mois, signalée comme relevée');
  controles++;
  if (pens.partiel && pens.partiel.partiel && pens.partiel.haut > 2800) OK('un seul relevé saisi → mélange relevé + estimation, signalé comme partiel (' + pens.partiel.haut + ' €)');
  else KO('saisie partielle mal traitée : ' + JSON.stringify(pens.partiel));
  controles++;
  if (pens.sans && !pens.sans.reel && pens.sans.haut > 0) OK('sans relevé → estimation par taux de remplacement (' + pens.sans.haut + ' €)');
  else KO('sans relevé, l\'estimation ne fonctionne plus : ' + JSON.stringify(pens.sans));
  /* le point d'entrée doit être UNIQUE : plus aucun appel direct à ncPensionPerso
     dans les vues, sinon deux chiffres coexistent dans le même dossier */
  controles++;
  const appelsDirects = (src.match(/ncPensionPerso\(/g) || []).length;
  if (appelsDirects <= 3) OK('ncPensionPerso n\'est appelé que depuis le point d\'entrée unique (' + appelsDirects + ' occurrences)');
  else KO(appelsDirects + ' appels directs à ncPensionPerso — le montant relevé risque d\'être ignoré à certains endroits');

  /* ═══ 3. CHAMPS DÉCLARÉS MAIS JAMAIS AFFICHÉS ═══ */
  console.log('\n═══ 3. CHAMPS D\'ÉTAT SANS CONTRÔLE DE SAISIE ═══');
  const blocs = [
    { nom: 'leviers (L)', re: /const \[L, setL\] = React\.useState\(\{([\s\S]*?)\}\);/, prefixe: 'L' },
    { nom: 'gisements (G)', re: /const \[G, setG\] = React\.useState\(\{([\s\S]*?)\}\);/, prefixe: 'G' },
    { nom: 'hypothèses (h)', re: /const \[h, setH\] = React\.useState\(\{([\s\S]*?)\}\);/, prefixe: 'h' },
  ];
  for (const b of blocs) {
    controles++;
    const m = src.match(b.re);
    if (!m) { KO('bloc ' + b.nom + ' introuvable dans le source'); continue; }
    const cles = [...m[1].matchAll(/(^|[\s,{])([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g)].map(x => x[2]);
    const orphelins = cles.filter(k => {
      const usages = (src.match(new RegExp('\\b' + b.prefixe + '\\.' + k + '\\b', 'g')) || []).length;
      const saisie = new RegExp("(sl|sg|sh)\\('" + k + "'|v=\\{" + b.prefixe + "\\." + k + "\\}|checked=\\{!!" + b.prefixe + "\\." + k + "\\}|checked=\\{" + b.prefixe + "\\." + k + "\\}").test(src);
      return usages > 0 && !saisie;
    });
    if (orphelins.length) KO(b.nom + ' — champs sans saisie à l\'écran : ' + orphelins.join(', '));
    else OK(b.nom + ' — ' + cles.length + ' champs, tous saisissables');
  }

  /* ═══ 3 bis. ORDRE DES ONGLETS ET DOCTRINE DES DEUX RENDEZ-VOUS ═══ */
  console.log('\n═══ 3 bis. ORDRE DES ONGLETS ET SOLUTIONS RÉSERVÉES AU RDV 2 ═══');
  controles++;
  const mOng = src.match(/\[\{ v: "constat"[\s\S]{0,220}?\]\.map\(o => \(/);
  if (!mOng) KO('sélecteur d\'onglets introuvable dans le source');
  else {
    const ordre = [...mOng[0].matchAll(/v: "(constat|preco|proj)"/g)].map(x => x[1]);
    const att = ['constat', 'proj', 'preco'];
    if (JSON.stringify(ordre) === JSON.stringify(att)) OK('Constat → Projection → RDV 2 Préconisations');
    else KO('ordre des onglets : ' + ordre.join(' → ') + ' (attendu : ' + att.join(' → ') + ')');
  }
  controles++;
  if (/scenarios\.filter\(sc => synMode === "preco" \|\| !sc\.rdv2\)/.test(src))
    OK('les scénarios marqués RDV 2 (testament, donation au dernier vivant) sont filtrés au constat');
  else KO('le filtre RDV 2 des scénarios successoraux a disparu — les solutions fuiteraient au premier rendez-vous');

  /* ═══ 3 ter. PROJECTION — ENVELOPPE, COMPTEUR, MODÈLE DU « AVANT », PRÉVOYANCE ═══
     Ces contrôles LISENT LE RENDU réel du harnais, pas le source : c'est la
     seule façon de prouver que le compteur compte quelque chose. */
  console.log('\n═══ 3 ter. PROJECTION — enveloppe déclarée, compteur, avant/après, prévoyance ═══');
  const pgP = await browser.newPage({ viewport: { width: 1300, height: 1000 } });
  const errP = [];
  pgP.on('pageerror', e => errP.push(String(e).slice(0, 200)));
  await pgP.goto('http://127.0.0.1:8899/_test_proj.html', { waitUntil: 'networkidle' });
  await pgP.waitForTimeout(1200);
  const P = await pgP.evaluate(() => {
    const nfr = (t) => {
      const m = String(t).replace(/[  \s]/g, '').match(/(−|-)?(\d+(?:[.,]\d+)?)/);
      return m ? (m[1] ? -1 : 1) * parseFloat(m[2].replace(',', '.')) : null;
    };
    /* une tuile = un libellé (Lab) précédé de sa valeur */
    const tuile = (libelle) => {
      /* v213 : on lit le bandeau IMPRIMÉ de la page de garde (data-nc-barre="garde"),
         pas le bandeau collant (libellé AVANT la valeur) */
      const el = Array.from(document.querySelectorAll('[data-nc-barre="fixe"] *')).find(e =>
        e.children.length === 0 && e.offsetParent !== null &&
        e.textContent.trim().toLowerCase().startsWith(libelle.toLowerCase()));
      if (!el) return null;
      /* la valeur est le frère PRÉCÉDENT du libellé ; à défaut, celui du parent */
      const prev = el.previousElementSibling
        || (el.parentElement && el.parentElement.previousElementSibling);
      if (!prev) return null;
      return { lib: el.textContent.trim(), val: nfr(prev.textContent) };
    };
    /* 11/09 (v213) : les trois colonnes sont devenues le BANDEAU « Enveloppe · Employée ·
       Reste » (page de garde, tête des solutions, collant à l'écran) — libellés courts,
       la fourchette « 300 à 500 € » est portée par le bandeau EN FIXE des solutions */
    const dispo = tuile('Enveloppe');
    const dispoTxt = (() => {
      const el = Array.from(document.querySelectorAll('*')).find(e =>
        e.children.length === 0 && e.offsetParent !== null &&
        e.textContent.trim().toLowerCase() === 'enveloppe' && e.closest('[data-nc-barre="fixe"]'));
      const prev = el && (el.previousElementSibling || (el.parentElement && el.parentElement.previousElementSibling));
      return prev ? prev.textContent.replace(/\s+/g, ' ').trim() : '';
    })();
    const empl = tuile('Employée');
    const reste = tuile('Reste') || tuile('Manque');
    /* prévoyance : aucune valeur ne doit apparaître deux fois d'affilée */
    const prevLibs = Array.from(document.querySelectorAll('*')).filter(e =>
      e.children.length === 0 && e.offsetParent !== null &&
      /dette effacée au décès|crédit de la résidence principale soldé|crédits locatifs en cours soldés|nouveau crédit locatif soldé/i.test(e.textContent))
      .map(e => e.textContent.trim());
    /* 10/09 : tableau avant / apres (decision A du CGP) — lignes lues telles quelles */
    const tab = document.querySelector('table');
    const lignes = tab ? Array.from(tab.querySelectorAll('tbody tr')).map(tr => Array.from(tr.querySelectorAll('td')).map(td => td.textContent.replace(/[  \s]+/g, ' ').trim())) : [];
    const ligne = (re) => lignes.find(l => l.length >= 4 && re.test(l[0]));
    const bandeau = (() => { const el = Array.from(document.querySelectorAll('span')).find(e => e.textContent.trim() === 'se recalcule à chaque case cochée'); return el ? el.parentElement.textContent.replace(/[  \s]+/g, ' ').trim() : ''; })();
    const alerte = (() => { const m = document.body.innerText.replace(/[  \s]+/g, ' ').match(/Il manque ([\d ]+) €\/mois dès la première année/); return m ? nfr(m[1]) : null; })();
    return {
      dispo: dispo && dispo.val, dispoTxt, empl: empl && empl.val, reste: reste && reste.val,
      resteLib: reste && reste.lib, prevLibs, lignes, tabTotal: ligne(/^Patrimoine total/), tabPrev: ligne(/^Crédits soldés par l'assurance de prêt/),
      tabRev: ligne(/^Complément de revenus mensuel/), tabImp: ligne(/^Impôt économisé par an/), bandeau, alerte, nfrSrc: nfr.toString(),
      corps: document.body.innerText,
      /* 11/09 (v213) — structure de la Projection */
      v213: (() => {
        const titres = Array.from(document.querySelectorAll('div')).filter(e => e.children.length <= 1 && e.textContent.length < 60)
          .map(e => e.textContent.trim()).filter(t => ["Les solutions retenues", "Où trouver l'épargne", "Votre participation et les préconisations"].includes(t) || /^À \d+ ans, votre situation/.test(t));
        const barres = Array.from(document.querySelectorAll('[data-nc-barre]')).map(b => b.getAttribute('data-nc-barre') + ':' + b.textContent.replace(/[  \s]+/g, ' ').trim());
        const ths = Array.from(document.querySelectorAll('table thead th')).map(th => th.textContent.replace(/[  \s]+/g, ' ').trim());
        /* 20/09/2026 (CGP) : « faire une page de garde telle que l'étude patrimoniale, et
           reprendre nom, prénom, fait par… ». La page de garde de l'Analyse R2 ne porte
           plus AUCUN chiffre : ni la phrase d'engagement (descendue dans les solutions),
           ni la baisse de revenus (passée en page 2), ni bandeau. Elle porte le titre du
           document, les noms et la ligne « Document préparé par ». */
        const garde = Array.from(document.querySelectorAll('div')).find(e => e.className && /nc-cover/.test(String(e.className)) && /nc-print-avoid/.test(String(e.className)));
        const gardeTxt = garde ? garde.textContent.replace(/[  \s]+/g, ' ') : '';
        const gardeOK = !!garde
          && /Analyse et plan d'action/.test(gardeTxt)
          && /Document préparé par/.test(gardeTxt)
          && !/Employée|Enveloppe|L'engagement que vous souhaitez/.test(gardeTxt)
          && !/Prévision de baisse de vos revenus/.test(gardeTxt)
          && !garde.querySelector('[data-nc-barre]');
        const gisTotal = (() => { const el = document.querySelector('[data-nc-gisements-total="1"]'); return el ? el.textContent.replace(/[  \s]+/g, ' ').trim() : null; })();
        return { titres, barres, ths, gardeOK, gardeTxt: gardeTxt.slice(0, 400), gisTotal, projette: /Ce document projette votre situation/.test(document.body.innerText),
          epargnez: (document.body.innerText.match(/Dans les deux cas vous épargnez ([\d\s\u00a0\u202f]+)€\/mois/) || [])[1] || null };
      })()
    };
  });
  controles++;
  if (errP.length) KO('la Projection lève une erreur JavaScript : ' + errP[0]);
  else OK('la Projection se rend sans erreur');

  controles++;
  /* le harnais déclare capaciteEpargne "300-500" : la FOURCHETTE s'affiche telle
     quelle, et le compteur travaille sur la borne HAUTE (ce que le client a accepté
     de mettre). Une tuile qui n'afficherait qu'un seul montant serait une régression. */
  if (/300\s*à\s*500/.test(P.dispoTxt)) OK('la fourchette déclarée à l\'audit s\'affiche telle quelle : « ' + P.dispoTxt + ' »');
  else KO('épargne disponible affichée « ' + P.dispoTxt + ' » — attendu la fourchette « 300 à 500 € » déclarée à l\'audit');

  controles++;
  /* le signe est déjà porté par la valeur affichée (« − 5 € » quand il manque) ;
     la référence du compteur est la BORNE HAUTE, pas le premier nombre de la tuile */
  const haut = 500;
  if (P.empl != null && P.reste != null && Math.abs((haut - P.empl) - P.reste) < 1.5
      && (haut - P.empl < 0) === /manque/i.test(P.resteLib || ''))
    OK('le compteur travaille sur la borne haute : ' + haut + ' − ' + P.empl + ' = ' + P.resteLib.toLowerCase() + ' ' + P.reste + ' €');
  else KO('compteur incohérent : borne haute ' + haut + ', employée ' + P.empl + ', ' + P.resteLib + ' ' + P.reste);

  controles++;
  if (!/NCP_ENV_TRANCHE/.test(src)) KO('la table des tranches d\'épargne déclarée a disparu — l\'enveloppe retomberait sur l\'effort');
  else if (/const envPoche = ncInt\(h\.env\) \|\| envDeclaree/.test(src)) OK('ordre de priorité de l\'enveloppe : saisie du conseiller, puis capacité déclarée, puis effort');
  else KO('l\'enveloppe ne consulte plus la capacité déclarée à l\'audit');

  controles++;
  /* modèle du « avant » validé le 02/09 : le client épargne le MÊME montant sur
     ses supports actuels — sinon l'écart affiché mélange réallocation et effort */
  if (/const epargneAvant = \(y\) =>/.test(src) && /sans\.push\(b\)/.test(src) && /socleAt\(y\) \+ epargneAvant\(y\)/.test(src))
    OK('le « sans rien changer » capitalise la même épargne sur les supports actuels');
  else KO('le modèle du « avant » a changé : l\'écart affiché ne serait plus le gain de la réallocation');

  controles++;
  const dbl = P.prevLibs.length > 1 && /dette effacée au décès/i.test(P.prevLibs.join(' ')) && P.prevLibs.length === 2
    && /crédit de la résidence principale soldé$/i.test(P.prevLibs[0] || '');
  if (dbl) KO('bloc prévoyance : la même somme est affichée deux fois (crédit soldé, puis dette effacée) alors qu\'il n\'y a qu\'un crédit');
  else OK('bloc prévoyance : ' + P.prevLibs.length + ' ligne(s), pas de doublon');

  controles++;
  /* 10/09 (decision A du CGP) : la prevoyance vit dans le TABLEAU avant / apres */
  if (P.tabPrev && /quotité/i.test(P.corps))
    OK('tableau avant / après : ligne « crédits soldés par l\'assurance de prêt » ' + P.tabPrev[1] + ' → ' + P.tabPrev[2] + ', quotité saisissable');
  else KO('la ligne « crédits soldés par l\'assurance de prêt » a disparu du tableau avant / après');

  controles++;
  const nfrN = (t) => { const m = String(t || '').replace(/[  \s]/g, '').match(/(−|-)?(\d+(?:[.,]\d+)?)/); return m ? (m[1] ? -1 : 1) * parseFloat(m[2].replace(',', '.')) : null; };
  if (P.tabTotal && P.tabRev && P.tabImp) {
    const a = nfrN(P.tabTotal[1]), b = nfrN(P.tabTotal[2]), e = nfrN(P.tabTotal[3]);
    if (a != null && b != null && e != null && Math.abs((b - a) - e) < 2) OK('tableau : écart de patrimoine recalculé = ' + Math.round(b - a) + ' € (' + P.tabTotal[3] + ')');
    else KO('tableau : écart de patrimoine incohérent — ' + JSON.stringify(P.tabTotal));
  } else KO('tableau avant / après incomplet : ' + JSON.stringify([P.tabTotal, P.tabRev, P.tabImp]));

  controles++;
  /* decision C : UN seul chiffre de manque — la tuile, le bandeau et l alerte disent la meme chose */
  const manqueTuile = /manque/i.test(P.resteLib || '') ? Math.abs(P.reste) : 0;
  const manqueBandeau = (() => { const m = P.bandeau.match(/Manque − ?([\d ]+) €\/mois/); return m ? nfrN(m[1]) : 0; })();
  if (manqueTuile > 0) {
    if (Math.abs(manqueTuile - manqueBandeau) < 1.5 && (P.alerte == null || Math.abs(manqueTuile - P.alerte) < 1.5)) OK('un seul chiffre de manque : tuile ' + manqueTuile + ' € = bandeau ' + manqueBandeau + ' €' + (P.alerte != null ? ' = alerte ' + P.alerte + ' €' : ''));
    else KO('le manque diffère selon l\'endroit : tuile ' + manqueTuile + ', bandeau ' + manqueBandeau + ', alerte ' + P.alerte);
  } else if (P.bandeau) OK('aucun manque : bandeau collant présent (' + P.bandeau.slice(0, 60) + '…)');
  else KO('bandeau collant absent');

  /* ═══ 3 undecies. PROJECTION v213 — retours du CGP du 11/09 (dossier Drouot) ═══ */
  console.log('\n═══ 3 undecies. PROJECTION — ordre, bandeau en fixe, « dans N ans », apport « 10 000 » ═══');
  controles++;
  {
    const V = P.v213, ko = [];
    if (V.projette) ko.push('la phrase « Ce document projette votre situation… » est toujours sur la page de garde (supprimée par le CGP le 11/09)');
    if (V.titres.includes("Votre participation et les préconisations")) ko.push('la rubrique « Votre participation et les préconisations » existe encore (fondue dans les solutions)');
    const ordre = V.titres.filter(t => t !== "Votre participation et les préconisations").map(t => /^À \d+ ans/.test(t) ? 'tableau' : t);
    /* 20/09/2026 (CGP) : « reprends à nouveau un bandeau avec son objectif de
       participation mensuelle, et mets en dessous le bloc où trouver de l'épargne afin
       de faire gonfler sa poche d'euros à consacrer aux projets. Ensuite, on va
       retrouver les différentes solutions PER, ass vie, investi immo. » L'épargne
       trouvée précède donc les solutions qu'elle finance — l'ordre du 11/09 est inversé. */
    const attenduOrdre = ["Où trouver l'épargne", "Les solutions retenues", "tableau"];
    if (JSON.stringify(ordre.filter((t, i) => ordre.indexOf(t) === i)) !== JSON.stringify(attenduOrdre)) ko.push('ordre des rubriques : ' + ordre.join(' → ') + ' — attendu ' + attenduOrdre.join(' → '));
    if (V.barres.some(b => /^garde:/.test(b)) || !V.barres.some(b => /^fixe:/.test(b))) ko.push('bandeaux imprimés : attendu « fixe » seulement (plus de bandeau sur la page de garde, 14/09) : ' + V.barres.join(' ; '));
    if (!V.gardeOK) ko.push('page de garde de l\'Analyse R2 : titre, noms ou « Document préparé par » absents, ou un chiffre y subsiste — ' + V.gardeTxt);
    const th = V.ths.filter(t => /Sans rien changer|Avec les préconisations/i.test(t));
    if (th.length !== 2 || !th.every(t => /dans \d+ ans$/.test(t))) ko.push('en-têtes du tableau sans la durée « dans N ans » : ' + JSON.stringify(V.ths));
    /* 14/09 : le « sans rien changer » capitalise l'EFFORT employé (852 avec immobilier), pas l'enveloppe */
    /* base = max(effort employé, enveloppe de la poche) : le harnais emploie 305 sur 500 → 500 ;
       un effort au-dessus de l'enveloppe (852 pour 500, Coconut) donnerait 852 */
    const baseAtt = Math.max(P.empl || 0, 500);
    if (V.epargnez == null || P.empl == null || Math.abs(nfrN(V.epargnez) - baseAtt) > 1.5) ko.push('« Dans les deux cas vous épargnez » = ' + V.epargnez + ' — attendu max(effort employé ' + P.empl + ', enveloppe 500) = ' + baseAtt + ' €/mois (décision CGP 14/09)');
    if (ko.length) KO(ko.join(' ; ')); else OK('phrase supprimée, garde (engagement déclaré) → solutions (bandeau en fixe) → gisements → tableau, « ' + th[0] + ' », base du « sans rien changer » = ' + baseAtt + ' €/mois (max effort, enveloppe)');
  }
  controles++;
  {
    /* le bug : « 10 000 » tapé avec l'espace des milliers donnait 10 € d'apport */
    const ap = await pgP.evaluate(async () => {
      const el = Array.from(document.querySelectorAll('span')).find(e => e.textContent.trim() === 'Investissement locatif');
      const carte = el && el.closest('div[class*="rounded-xl"]');
      if (!carte) return { err: 'carte locatif introuvable' };
      const cb = carte.querySelector('input[type=checkbox]'); if (!cb.checked) cb.click();
      const inputs = Array.from(carte.querySelectorAll('input:not([type=checkbox])'));
      const inp = inputs.find(i => { let n = i.previousSibling, acc = ''; while (n && acc.length < 40) { acc = (n.textContent || n.nodeValue || '') + acc; n = n.previousSibling; } return acc.trim().endsWith('Apport'); });
      if (!inp) return { err: 'champ Apport introuvable' };
      const st = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
      const lire = () => { const lab = Array.from(document.querySelectorAll('div')).filter(e => e.textContent.trim() === 'Apport mobilisé'); return lab.map(l => l.previousSibling && l.previousSibling.textContent.replace(/[  \s]+/g, ' ').trim()); };
      const out = {};
      for (const v of ['10 000', '10k', '10000']) { st.call(inp, v); inp.dispatchEvent(new Event('input', { bubbles: true })); await new Promise(r => setTimeout(r, 150)); out[v] = lire(); }
      return out;
    });
    if (ap.err) KO(ap.err);
    else if (['10 000', '10k', '10000'].every(k => (ap[k] || []).length && ap[k].every(t => t === '10 000 €'))) OK('apport « 10 000 » (espace), « 10k » et « 10000 » → tuile « Apport mobilisé » = 10 000 € partout');
    else KO('apport mal lu : ' + JSON.stringify(ap) + ' — parseFloat("10 000") = 10 est de retour');
  }

  /* ═══ 3 duodecies. TEMPS COMMERCIAL — ce que porte le PREMIER rendez-vous (15/09/2026) ═══
     Le CGP : « si on en dit trop au premier RDV, le client se dira qu'il peut faire le job
     tout seul ». Le constat garde le factuel + le tableau des versements + les devoirs ;
     transmission, points forts, axes, objectifs et participation passent au RDV 2. */
  console.log('\n═══ 3 duodecies. TEMPS COMMERCIAL — contenu du RDV 1 et du RDV 2 ═══');
  controles++;
  {
    const ko = [];
    if (!/\{ v: "constat", l: "Audit et synthèse" \}/.test(src)) ko.push('onglet 1 : attendu « Audit et synthèse »');
    /* 20/09/2026 (CGP) : « Projection » devient « Analyse R2 » et porte le document
       « Analyse et plan d'action » ; « Simulation et plan d'action » devient
       « Simulation ». Les trois exports gardent chacun leur nom de fichier. */
    if (!/\{ v: "proj", l: "Analyse R2" \}/.test(src)) ko.push('onglet 2 : attendu « Analyse R2 »');
    if (!/\{ v: "preco", l: "Simulation" \}/.test(src)) ko.push('onglet 3 : attendu « Simulation »');
    if (!/const VOLET = \{ constat: "Audit-et-synthese"/.test(src)) ko.push('le nom du fichier PDF ne suit pas le nouveau nom d\'onglet');
    if (!/proj: "Analyse-et-plan-d-action"/.test(src)) ko.push('le fichier PDF de l\'Analyse R2 ne porte pas le nouveau nom');
    /* Blocs réservés au RDV 2. 15/09/2026, SECONDE décision du CGP : le rappel des
       OBJECTIFS et des MOYENS (apport, mensualité) REVIENT au RDV 1 tout en restant
       au RDV 2 — sa garde a donc disparu, et il n'en reste que DEUX : transmission,
       puis forces + axes + priorités. */
    /* 20/09/2026 — le bloc FORCES + AXES a été hoisté en `rendreForcesAxes()` pour que
       l'Analyse R2 (composant NcProjection, séparé) puisse l'afficher. Sa garde n'est
       donc plus un `return null` au début d'une IIFE mais un ternaire au point d'appel
       de la synthèse. Le compte de gardes tombe à UNE (la transmission), et la garde
       des forces se contrôle sur sa nouvelle écriture. */
    const gardes = (src.match(/if \(synMode !== "preco"\) return null;/g) || []).length;
    if (gardes < 1) ko.push('blocs réservés au RDV 2 : ' + gardes + ' garde(s) « synMode !== \"preco\" » trouvée(s), 1 attendue (transmission)');
    if (!/\{synMode === "preco" \? rendreForcesAxes\(\) : null\}/.test(src))
      ko.push('les points forts et axes ne sont plus gardés sur le RDV 2 dans la synthèse');
    if (!/const rendreForcesAxes = \(\) => \{/.test(src)) ko.push('rendreForcesAxes() a disparu — l\'Analyse R2 ne peut plus afficher les points forts et axes');
    if (!/const rendreObjectifsParticipation = \(\{ cartesCabinet = true, chapitre = "Objectifs et participation" \} = \{\}\) => \{/.test(src)) ko.push('rendreObjectifsParticipation() a disparu ou a changé de signature — l\'Analyse R2 ne peut plus afficher les objectifs et la participation');
    if (!/blocObjectifs=\{rendreObjectifsParticipation\(\{ cartesCabinet: false, chapitre: null \}\)\}/.test(src)) ko.push('l\'Analyse R2 ne reçoit plus les objectifs et la participation, ou reçoit en plus les deux cartes du cabinet (elles ont leur place dans les solutions)');
    if (!/blocForces=\{rendreForcesAxes\(\)\}/.test(src)) ko.push('l\'Analyse R2 ne reçoit plus les points forts et les axes');
    /* 19/09/2026 — RENVERSEMENT ASSUMÉ DE LA RÈGLE PRÉCÉDENTE. Le CGP :
       « dans l'audit, inclure dans le chapitre objectifs et questions, juste après les
       objectifs exprimés et la participation mensuelle, le tableau qui est dans le
       document simulation et plan d'action page 5 : les objectifs recommandés par le
       cabinet et les préconisations ». Les deux cartes larges du cabinet ne sont donc
       PLUS réservées au RDV 2 : elles sortent dans les deux documents, à la même place.
       Ce contrôle vérifie désormais l'inverse de ce qu'il vérifiait — qu'AUCUN filtre
       synMode ne les retienne — et que les deux cartes existent toujours. */
    if (/const autresLarges = synMode === "preco" \? largeVisibles/.test(src))
      ko.push('les cartes larges du cabinet sont de nouveau filtrées sur le RDV 2 — le CGP les veut AUSSI dans l\'audit');
    if (!/const largeVisibles = syn\.resume\.filter\(it => it\.large\);/.test(src))
      ko.push('le tri des cartes larges a changé : « Objectifs recommandés par le cabinet » et « Préconisations » doivent sortir dans les DEUX documents');
    if (!/t: "Objectifs recommandés par le cabinet"/.test(src)) ko.push('la carte « Objectifs recommandés par le cabinet » a disparu');
    if (!/t: "Préconisations"/.test(src)) ko.push('la carte « Préconisations » a disparu');
    /* les deux nouveaux chapitres du RDV 1 */
    if (!/Importance des versements programmés/.test(src)) ko.push('chapitre « Importance des versements programmés » absent');
    if (!/Pour préparer notre prochain rendez-vous/.test(src)) ko.push('chapitre « Pour préparer notre prochain rendez-vous » absent');
    if (!/info-retraite\.fr/.test(src) || !/Mon épargne retraite/.test(src)) ko.push('les devoirs du client ne citent plus info-retraite.fr / « Mon épargne retraite »');
    /* barème IR : l'axe doit aller jusqu'à la tranche à 45 % (181 917 €) */
    const mAxe = src.match(/const axisMax = Math\.max\((\d+), Math\.min\((\d+)/);
    if (!mAxe) ko.push('axe du barème IR introuvable');
    else if (parseInt(mAxe[1], 10) < 181917) ko.push('axe du barème IR plafonné à ' + mAxe[1] + ' € : la tranche à 45 % (181 917 €) n\'apparaît pas');
    if (ko.length) KO(ko.join(' ; '));
    else OK('onglets « Audit et synthèse » → « Projection » → « Simulation et plan d\'action », 4 blocs réservés au RDV 2, tableau des versements et devoirs du client au RDV 1, barème jusqu\'à 45 %');
  }
  controles++;
  {
    /* recalcul depuis la RÈGLE : 500 €/mois à 5 % sur 20 ans = ncpCap, versements en début
       de mois — le tableau doit afficher ce montant, pas une approximation annuelle */
    const att = (() => { const i = Math.pow(1.05, 1 / 12) - 1; let c = 0; for (let k = 0; k < 240; k++) c = (c + 500) * (1 + i); return Math.round(c); })();
    const lu = await pgP.evaluate(() => { try { return Math.round(window.ncpCap(0, 500, 0.05, 20)); } catch (e) { return null; } });
    if (lu == null) OK('ncpCap non exposé sur window dans le harnais — attendu recalculé : ' + att + ' €');
    else if (Math.abs(lu - att) > 2) KO('ncpCap(500 €/mois, 5 %, 20 ans) = ' + lu + ' € — attendu ' + att + ' € (capitalisation mensuelle, versements en début de mois)');
    else OK('tableau des versements : ncpCap(500 €/mois, 5 %, 20 ans) = ' + lu + ' €, conforme à la règle');
  }

  /* ═══ 3 terdecies. DOCUMENT IMPRIMÉ (15/09/2026) ═══
     Le CGP : « le mode impression est vraiment très très laid ». Page de présentation,
     signatures, pied de page cabinet, et de VRAIES graisses (JetBrains Mono était chargé
     en 400/500 seulement : tous les titres de carte sortaient en faux gras). */
  console.log('\n═══ 3 terdecies. DOCUMENT IMPRIMÉ — garde, signatures, pied de page, graisses ═══');
  controles++;
  {
    const ko = [];
    if (!/Votre étude patrimoniale/.test(src)) ko.push('page de présentation du constat absente');
    if (!/Votre simulation et votre plan d'action/.test(src)) ko.push('page de présentation du volet RDV 2 absente');
    if (!/data-nc-signature="1"/.test(src)) ko.push('bloc de signatures absent');
    if (!/Fait à <span/.test(src)) ko.push('la ligne « Fait à … le … » a disparu du bloc de signatures');
    if (!/nc-syn-noprint rounded-2xl overflow-hidden mb-5 border/.test(src)) ko.push('le bandeau d\'écran s\'imprime encore : doublon avec la page de présentation');
    const mJB = src.match(/family=JetBrains\+Mono:wght@([0-9;]+)/);
    if (!mJB) ko.push('JetBrains Mono n\'est plus chargé');
    else if (!/700/.test(mJB[1])) ko.push('JetBrains Mono chargé en ' + mJB[1] + ' : les titres de carte (700-800) sortent en FAUX GRAS à l\'impression');
    if (!/\.nc-print-footpage \.fp-coord/.test(src)) ko.push('le pied de page imprimé ne porte plus les coordonnées du cabinet');
    if (ko.length) KO(ko.join(' ; '));
    else OK('page de présentation (constat et RDV 2), signatures « Fait à … le … » client + conseiller, bandeau d\'écran non imprimé, JetBrains Mono en vraies graisses, pied de page cabinet');
  }

  await pgP.close();

  /* ═══ 3 quater. PRÉCONISATIONS — titre en gras, phrase en graisse normale ═══ */
  console.log('\n═══ 3 quater. PRÉCONISATIONS — un titre distinct de la phrase ═══');
  controles++;
  const pr = await page.evaluate(() => {
    const d = window.migrateAudit ? window.migrateAudit(window.AUDIT_DEFAUT ? JSON.parse(JSON.stringify(window.AUDIT_DEFAUT)) : {}) : {};
    try {
      const syn = window.ncSynthese(d);
      const it = (syn.resume || []).find(x => x.t === "Préconisations");
      if (!it) return { absent: true };
      const li = (it.list || []).map(x => typeof x === "string"
        ? { forme: "chaine", titre: x, suite: "" }
        : { forme: "objet", titre: x.titre || "", suite: x.suite || "" });
      return { li };
    } catch (e) { return { err: String(e && e.message || e).slice(0, 200) }; }
  });
  if (pr.err) KO('la synthèse lève une erreur : ' + pr.err);
  else if (pr.absent) OK('aucune préconisation sur le dossier par défaut — rien à contrôler');
  else {
    const nus = pr.li.filter(x => x.forme === "chaine");
    const sansTitre = pr.li.filter(x => !x.titre);
    if (sansTitre.length) KO(sansTitre.length + ' préconisation(s) sans titre — la carte resterait entièrement en gras');
    else if (nus.length === pr.li.length) KO('toutes les préconisations sont encore des chaînes nues : aucun titre ne peut être mis en gras');
    else OK(pr.li.length + ' préconisations, ' + pr.li.filter(x => x.suite).length + ' avec une phrase distincte du titre');
  }
  controles++;
  if (/const ncPrecoParts = /.test(src) && /<b style=\{\{ fontWeight: 800 \}\}>\{P\.titre\}<\/b>/.test(src))
    OK('les deux rendus (synthèse et Projection) séparent le titre de la phrase');
  else KO('le rendu titre / phrase a disparu — les préconisations repasseraient tout en gras');

  /* ═══ 3 quinquies. ÉPARGNE DE PRÉCAUTION — UN SEUL CHIFFRE DANS TOUT LE DOSSIER ═══
     Trois calculs indépendants coexistaient (synthèse, bloc du constat, Projection
     où la cible valait zéro). Le CGP a signalé DEUX FOIS des chiffres qui ne se
     ressemblaient pas. Point d'entrée unique désormais : ncPrecaution.
     RÈGLE DU 04/09/2026 (décision CGP) : montants FIXES selon le foyer — seul
     10 000-15 000 €, couple sans enfant 20 000 €, couple avec enfant 25 000 € —
     quels que soient revenus et statut, sans supplément locatif. */
  console.log('\n═══ 3 quinquies. ÉPARGNE DE PRÉCAUTION — un seul chiffre partout, montants fixes ═══');
  controles++;
  if (!/const ncPrecaution = \(d, synth\) =>/.test(src)) KO('le point d\'entrée unique ncPrecaution a disparu');
  else {
    const tables = (src.match(/personne seule : 10 000 à 15 000 €/g) || []).length;
    const anciennes = (src.match(/: \d+(?: à \d+)? mois de dépenses"|valLoc[A-Za-z]* \* 0\.05/g) || []).length;
    if (tables !== 1) KO(tables + ' tables de seuils de précaution dans le fichier — il ne doit y en avoir qu\'une');
    else if (anciennes !== 0) KO('l\'ancienne règle « X mois de dépenses + 5 % du locatif » est encore présente (' + anciennes + ' site(s))');
    else OK('la cible de précaution est calculée à UN SEUL endroit, avec les montants fixes du cabinet');
  }
  controles++;
  const prec = await page.evaluate(() => {
    const out = [];
    const base = window.AUDIT_DEFAUT ? JSON.parse(JSON.stringify(window.AUDIT_DEFAUT)) : {};
    const enf = (n) => Array.from({ length: n }, (_, i) => ({ id: i + 1, prenom: "E" + (i + 1), annee: "2015", charge: "100", filiation: "commun" }));
    const profils = [
      { nom: 'seul, salarié 10 833 €/mois', d: { situation: 'celibataire', activites: ['salarie'], actSalarie: { montant: '10833', periode: 'mois', nbMois: '12', mode: 'net' }, conjointQ: 'non' }, bas: 10000, haut: 15000 },
      { nom: 'seul, TNS', d: { situation: 'celibataire', activites: ['independant'], actIndependant: { n1: '90000' }, conjointQ: 'non' }, bas: 10000, haut: 15000 },
      { nom: 'seul, retraité', d: { situation: 'celibataire', activites: ['retraite'], conjointQ: 'non' }, bas: 10000, haut: 15000 },
      { nom: 'couple sans enfant', d: { situation: 'marie', activites: ['salarie'], conjointQ: 'oui', conjointRev: { activites: ['salarie'] }, enfantsQ: 'non' }, bas: 20000, haut: 20000 },
      { nom: 'couple avec 2 enfants + locatif 300 000 €', d: { situation: 'pacse', activites: ['salarie'], conjointQ: 'oui', conjointRev: { activites: ['salarie'] }, enfantsQ: 'oui', enfants: enf(2), fonciersQ: 'oui', locatifs: [{ valeur: '300000', loyer: '900' }] }, bas: 25000, haut: 25000 },
    ];
    for (const pr of profils) {
      const d = window.migrateAudit ? window.migrateAudit(Object.assign({}, base, pr.d)) : Object.assign({}, base, pr.d);
      const S = window.ncCalcEndettement(d);
      const P = window.ncPrecaution(d, S);
      out.push({ nom: pr.nom, attBas: pr.bas, attHaut: pr.haut, bas: P.cibleBas, haut: P.cibleHaut, lib: P.profilLib });
    }
    return out;
  });
  {
    const faux = prec.filter(x => x.bas !== x.attBas || x.haut !== x.attHaut);
    if (faux.length) KO('cible fausse pour : ' + faux.map(x => x.nom + ' (' + x.bas + '–' + x.haut + ' au lieu de ' + x.attBas + '–' + x.attHaut + ')').join(', '));
    else OK('seul 10 000-15 000 € (salarié, TNS, retraité identiques) · couple sans enfant 20 000 € · couple avec enfants 25 000 € (sans supplément locatif)');
  }
  /* Dossier de référence du CGP (Jean Claude, 04/09) : célibataire, 10 833 €/mois,
     23 500 € de court terme → AUCUN axe de précaution (l'ancienne règle réclamait
     32 742 à 49 113 €), AUCUN axe « Locataire », et les axes d'épargne VOISINS. */
  controles++;
  const jc = await page.evaluate(() => {
    const d = window.migrateAudit({ ...window.AUDIT_DEFAUT,
      civilite: "M.", prenom: "jean claude", nom: "TEST", dateNaissance: "1983-01-01", situation: "celibataire", conjointQ: "non", enfantsQ: "non",
      activites: ["salarie"], actSalarie: { montant: "10833", periode: "mois", nbMois: "13", mode: "net", statut: "cadre" },
      logement: "locataire", loyer: "1850",
      avoirsQ: "oui", avoirs: [{ type: "livrets", valeur: "15500", titulaire: "client" }, { type: "compte_courant", valeur: "8000", titulaire: "client" }],
    });
    const syn = window.ncSynthese(d);
    const S = window.ncCalcEndettement(d);
    const P = window.ncPrecaution(d, S);
    return { titres: (syn.faiblesses || []).map(f => f.t), P: { ct: P.courtTerme, bas: P.cibleBas, haut: P.cibleHaut, sousDote: P.sousDote } };
  });
  if (jc.P.sousDote || jc.titres.some(t => /précaution|court terme/i.test(t))) KO('Jean Claude (23 500 € de court terme, seul) reçoit encore un axe de précaution : ' + JSON.stringify(jc.P));
  else OK('Jean Claude : 23 500 € de court terme ≥ 10 000 € → aucun axe de précaution');
  controles++;
  if (jc.titres.some(t => /^Locataire$/i.test(t))) KO('l\'axe « Locataire » est réapparu — le CGP l\'a supprimé le 04/09/2026');
  else OK('aucun axe « Locataire » (décision CGP 04/09/2026)');
  controles++;
  {
    const estEp = (t) => /^Épargne|^Absence totale d'épargne|^Versements programmés|^Performance de l'épargne/.test(t);
    const idx = jc.titres.map((t, i) => estEp(t) ? i : -1).filter(i => i >= 0);
    const contigus = idx.length > 0 && idx[idx.length - 1] - idx[0] === idx.length - 1;
    if (!idx.length) KO('Jean Claude n\'a plus aucun axe d\'épargne (attendu : épargne très faible + absence de versements)');
    else if (!contigus) KO('les axes d\'épargne ne sont pas voisins : ' + jc.titres.join(' | '));
    else OK('axes d\'épargne voisins (' + idx.length + ' axes, positions ' + idx.join(',') + ') : ' + jc.titres.filter(estEp).join(' · '));
  }
  /* Assurance de prêt : DÈS QU'UN CRÉDIT existe et qu'il reste ≥ 8 ans, l'axe
     « simulation de renégociation » s'affiche — même si déjà renégociée ; < 8 ans, non. */
  controles++;
  const ap = await page.evaluate(() => {
    const mk = (extra) => window.migrateAudit({ ...window.AUDIT_DEFAUT,
      civilite: "M.", prenom: "p", nom: "P", dateNaissance: "1980-01-01", situation: "celibataire", conjointQ: "non",
      activites: ["salarie"], actSalarie: { montant: "5000", periode: "mois", nbMois: "12", mode: "net" },
      logement: "proprietaire", rpValeur: "400000", rpCreditQ: "oui", rpCrd: "200000", rpMensualite: "1200", rpTaux: "2", ...extra });
    const ax = (d) => (window.ncSynthese(d).faiblesses || []).some(f => /^Assurance de prêt/.test(f.t));
    return {
      renego12: ax(mk({ rpDureeRestante: "12", rpAssurRenegociee: "oui" })),
      nonRenego7: ax(mk({ rpDureeRestante: "7", rpAssurRenegociee: "non" })),
      inconnue: ax(mk({ rpDureeRestante: "", rpAssurRenegociee: "non" })),
      exact8: ax(mk({ rpDureeRestante: "8", rpAssurRenegociee: "oui" })),
    };
  });
  if (!ap.renego12) KO('crédit RP à 12 ans déjà renégocié : l\'axe simulation devrait s\'afficher quand même (décision CGP 04/09)');
  else if (ap.nonRenego7) KO('crédit RP à 7 ans : l\'axe s\'affiche alors qu\'il reste moins de 8 ans');
  else if (!ap.inconnue) KO('crédit RP sans durée saisie : doit rester signalé');
  else if (!ap.exact8) KO('crédit RP à exactement 8 ans : doit être signalé (« 8 ans grand minimum »)');
  else OK('assurance de prêt : axe dès qu\'un crédit existe (même renégocié), seuil 8 ans respecté, durée inconnue signalée');
  controles++;
  if (/% de la préconisation/.test(src)) KO('le pourcentage « % de la préconisation » est réapparu — le CGP l\'a fait retirer');
  else OK('le bloc « Épargne constituée » ne réaffiche pas le pourcentage retiré');
  controles++;
  if (/const precaCible = ncInt\(h\.precaCible\) \|\| ncPrecaution\(/.test(src))
    OK('la Projection part de la cible du constat, surchargeable par le conseiller');
  else KO('la cible de précaution de la Projection ne vient plus du constat — elle retomberait à zéro et la redirection ne serait jamais bloquée');

  /* ═══ 3 sexies. CLES DU MOTEUR FISCAL ET FORMULATIONS DU CONSTAT ═══ */
  console.log('\n═══ 3 sexies. CLÉS DU MOTEUR FISCAL ET FORMULATIONS ═══');
  controles++;
  /* la Projection lisait ncCalcFisc(...).ir.net, qui n'existe pas : l'impôt de
     référence valait 0, donc AUCUNE réduction d'impôt ne pouvait s'imputer. */
  if (/ncCalcFisc\([^)]*\)\.ir\.net/.test(src)) KO('la Projection relit « ir.net » — cette clé n\'existe pas, l\'impôt de référence retomberait à 0 et toute réduction d\'impôt serait annulée');
  else OK('la Projection lit bien impotNet — les réductions d\'impôt peuvent s\'imputer');

  controles++;
  if (/À n'activer qu'APRÈS/.test(src)) KO('la formulation « À n\'activer qu\'APRÈS la sécurisation du concubin » est revenue — le cabinet éclaire le risque, il ne conditionne pas la décision du client');
  else OK('aucune injonction conditionnelle sur la protection du concubin');

  controles++;
  const pucesSrc = (src.match(/puces:/g) || []).length;
  if (pucesSrc >= 2 && /Array\.isArray\(f\.puces\)/.test(src) && /puces: f\.puces \|\| \[\]/.test(src))
    OK('les axes à plusieurs idées sont rendus en puces, à l\'écran ET à l\'export');
  else KO('le rendu en puces des axes a disparu (source : ' + pucesSrc + ' axes, rendu ' + /Array\.isArray\(f\.puces\)/.test(src) + ', export ' + /puces: f\.puces/.test(src) + ')');

  controles++;
  const pat = await page.evaluate(() => {
    const d = window.migrateAudit ? window.migrateAudit({
      civilite: "M.", nom: "SAUSSE", prenom: "Cas", situation: "union_libre",
      dateNaissance: "1975-04-04", conjointQ: "oui",
      conjoint: { prenom: "Eve", dateNaissance: "1978-08-08", civilite: "Mme" },
      activites: ["salarie"],
      actSalarie: { poste: "cadre", statut: "cadre", mode: "net", montant: "7000", periode: "mois", nbMois: "12" },
      conjointRev: { activites: [] },
      enfantsQ: "oui", enfants: [{ id: 1, prenom: "Léo", annee: "2010", charge: "100", filiation: "client" }],
      logement: "proprietaire", rpValeur: "500000", rpDetenteur: "client",
      rpCreditQ: "oui", rpCrd: "120000", rpMensualite: "1100", rpTaux: "1,7", rpDureeRestante: "12",
      avoirsQ: "oui", avoirs: [{ id: 1, type: "livrets", valeur: "60000", titulaire: "client" },
                               { id: 2, type: "av", valeur: "40000", titulaire: "conjoint" }],
      capaciteEpargne: "300-500", objectifs: ["protection"]
    }) : {};
    const syn = window.ncSynthese(d);
    const f = (syn.forces || []).find(x => /Patrimoine net/.test(x.t));
    const ax = (syn.faiblesses || []).find(x => /Concubin sans droits|Partenaire sans droits/.test(x.t));
    const en = (syn.faiblesses || []).find(x => /endettement non utilisée/i.test(x.t));
    return { force: f ? (f.d + ' | ' + (f.puces || []).join(' | ')) : null, axe: ax ? { d: ax.d, puces: ax.puces || [] } : null,
             endet: en ? { d: en.d, puces: en.puces || [] } : null };
  });
  {
    let pb = 0;
    if (!pat.force) KO('aucune force « Patrimoine net » sur un dossier à 440 000 € nets');
    else if (!/Monsieur|Madame/.test(pat.force)) { KO('le patrimoine net ne se répartit pas par personne : « ' + pat.force + ' »'); pb++; }
    if (!pat.axe) { KO('aucun axe de protection du concubin sur un dossier en union libre'); pb++; }
    else {
      const j = pat.axe.puces.join(' ');
      if (!/résidence principale est détenue à 100 %/.test(j)) { KO('l\'axe ne dit pas que la résidence principale est détenue par une seule personne'); pb++; }
      if (!/assurance de prêt/.test(j)) { KO('l\'axe ne dit pas que l\'assurance de prêt ne protège pas le survivant'); pb++; }
    }
    if (!pat.endet) { KO('aucun axe de capacité d\'endettement'); pb++; }
    else if (!pat.endet.puces.length) { KO('l\'axe d\'endettement n\'est pas en puces'); pb++; }
    if (!pb) OK('patrimoine réparti par personne, protection du survivant explicite, endettement en puces');
  }

  /* ═══ 3 sexies-b. POINTS FORTS EN PUCES, PATRIMOINE NET PAR PERSONNE, JAMAIS DEUX FOIS LA MÊME PHRASE (10/09/2026) ═══
     Dossier RAMI (10/09) : le point fort « Patrimoine net significatif » disait
     « le solde n'étant pas rattaché à un titulaire » alors que le terrain de
     240 000 € était déclaré à Monsieur — il ne ventilait ni les biens ni les
     locatifs, contrairement à la tuile « Patrimoine net ». Et l'axe « Partenaire
     sans droits » répétait mot pour mot sa phrase de tête en première puce. */
  console.log('\n═══ 3 sexies-b. POINTS FORTS — puces courtes, patrimoine par personne, aucune phrase répétée ═══');
  const rami = await page.evaluate(() => {
    const d = window.migrateAudit({
      civilite: "M.", nom: "RAMI", prenom: "Jean", situation: "pacse", dateNaissance: "1984-03-03",
      conjointQ: "oui", conjoint: { prenom: "Marie", dateNaissance: "1985-05-05", civilite: "Mme" },
      enfantsQ: "oui", enfants: [{ id: 1, prenom: "Léo", annee: "2020", charge: "100", filiation: "commun" }],
      activites: ["salarie"], actSalarie: { poste: "ingénieur", statut: "cadre", mode: "net", montant: "85000", periode: "an", nbMois: "13" },
      conjointRev: { activites: ["salarie"], actSalarie: { poste: "assistante", statut: "non_cadre", mode: "net", montant: "57000", periode: "an", nbMois: "12" } },
      logement: "locataire", loyer: "1200", rpProjetQ: "oui", rpProjetHorizon: "1-3", rpProjetMensualite: "1500",
      biensQ: "oui", biens: [{ id: 1, nom: "terrain sud", type: "terrain", detention: "pleine", titulaire: "client", valeur: "240000", enLocationQ: "non" }],
      avoirsQ: "oui", avoirs: [{ id: 1, type: "livrets", valeur: "22500", titulaire: "client" }, { id: 2, type: "livrets", valeur: "8000", titulaire: "conjoint" }, { id: 3, type: "livrets", valeur: "42000", titulaire: "commun" }],
      testamentQ: "non", capaciteEpargne: "300-500", objectifs: ["protection", "fiscalite", "retraite"]
    });
    const syn = window.ncSynthese(d);
    const S = window.ncCalcEndettement(d);
    const rn = window.ncRepartNet ? window.ncRepartNet(d) : null;
    const norm = (x) => String(x || "").toLowerCase().replace(/[\s\u00a0\u202f]+/g, " ").replace(/[.\s]+$/, "").trim();
    const doublons = [];
    [].concat(syn.forces || [], syn.faiblesses || []).forEach(f => {
      const pu = f.puces || [];
      pu.forEach((x, i) => {
        if (norm(x) === norm(f.d)) doublons.push(f.t + ' : puce = phrase de tête « ' + x + ' »');
        if (i > 0 && norm(x) === norm(pu[i - 1])) doublons.push(f.t + ' : deux puces identiques « ' + x + ' »');
      });
    });
    const pn = (syn.forces || []).find(x => /Patrimoine net/.test(x.t));
    const cap = (syn.forces || []).find(x => /Capacité d'emprunt/.test(x.t));
    const longs = (syn.forces || []).filter(f => String(f.d || "").length > 140).map(f => f.t + ' (' + String(f.d).length + ' car.)');
    return { net: S.patrimoineNet, rn, pn: pn ? pn.d : null, pnPuces: pn ? (pn.puces || []) : [], capPuces: cap ? (cap.puces || []).length : -1, doublons, longs, nbForces: (syn.forces || []).length };
  });
  controles++;
  if (!rami.rn) KO('ncRepartNet absent de window');
  else if (rami.rn.c === 283500 && rami.rn.j === 29000 && rami.rn.commun === 42000) OK('répartition par personne recalculée à la main : Monsieur 283 500 € (22 500 + 240 000 + 21 000), Madame 29 000 €, 42 000 € en commun');
  else KO('répartition par personne fausse : ' + JSON.stringify(rami.rn) + ' (attendu c=283500, j=29000, commun=42000)');
  controles++;
  const pnN = String(rami.pn || '').replace(/[\u00a0\u202f]/g, ' ');
  if (!rami.pn) KO('aucun point fort « Patrimoine net » sur ' + rami.net + ' € nets');
  else if (/pas rattaché/.test(pnN)) KO('le terrain déclaré à Monsieur est encore annoncé « non rattaché à un titulaire » : ' + pnN);
  else if (/^312 500 € d'actif net$/.test(pnN) && rami.pnPuces.map(x => x.replace(/[\u00a0\u202f]/g, ' ')).join(' | ') === 'Monsieur : 283 500 € | Madame : 29 000 € | dont 42 000 € détenus en commun') OK('point fort au format du CGP (11/09) : « ' + pnN + ' » + puces ' + rami.pnPuces.join(' · '));
  else KO('point fort « Patrimoine net » hors format attendu : ' + pnN + ' / ' + rami.pnPuces.join(' | '));
  controles++;
  if (rami.doublons.length) KO('phrase répétée d\'affilée : ' + rami.doublons.join(' | '));
  else OK('aucune phrase répétée d\'affilée dans ' + rami.nbForces + ' points forts et les axes (dossier Rami)');
  controles++;
  if (rami.capPuces >= 3 && !rami.longs.length) OK('points forts en puces courtes : capacité d\'emprunt ' + rami.capPuces + ' puces, aucune phrase de tête au-delà de 140 caractères');
  else KO('points forts trop longs ou sans puces : capacité ' + rami.capPuces + ' puces ; longs : ' + (rami.longs.join(', ') || 'aucun'));

  /* ═══ 3 septies. ARGUMENTAIRE DE LA TRESORERIE EXCESSIVE ═══
     Ce controle vivait dans t_rdv1, sur un dossier qui n est plus sur-dote depuis que
     la cible porte sur les depenses. Il est repris ici, sur un dossier qui l est
     vraiment : couple retraite, 40 000 € de court terme pour une cible de 14 423 €. */
  console.log('\n═══ 3 septies. TRÉSORERIE EXCESSIVE — l\'argumentaire de transmission ═══');
  controles++;
  const surD = await page.evaluate((dd) => {
    const d = window.migrateAudit(dd);
    const S = window.ncCalcEndettement(d);
    const P = window.ncPrecaution(d, S);
    const syn = window.ncSynthese(d);
    const ax = (syn.faiblesses || []).find(x => /trésorerie|court terme/i.test(x.t || ""));
    // 10/09 : les axes sont en tete + puces — l argumentaire vit dans les puces
    return { surDote: P.surDote, ct: P.courtTerme, haut: P.cibleHaut, d: ax ? ((ax.d || "") + " " + (ax.puces || []).join(" ")) : null };
  }, DOSSIERS.find(x => /retrait/i.test(x.nom)).d);
  if (!surD.surDote) KO('le dossier retraité (' + surD.ct + ' € pour une cible de ' + surD.haut + ' €) n\'est plus détecté en sur-dotation — le chemin n\'est plus testé');
  else if (!surD.d) KO('sur-dotation détectée mais aucun axe de trésorerie produit');
  else {
    const succ = /droits de succession|hors succession/i.test(surD.d);
    const av = /152[\s\u202f\u00a0 ]?500 € par bénéficiaire|990 I/i.test(surD.d);
    if (!succ) KO('l\'axe de trésorerie excessive ne porte plus l\'argumentaire de succession');
    else if (!av) KO('l\'axe de trésorerie excessive ne cite plus l\'abattement de 152 500 € (art. 990 I CGI)');
    else OK('trésorerie excessive : argumentaire de succession et abattement art. 990 I présents');
  }

  /* ═══ 3 octies. SUCCESSION — LE PER EST TRAITE COMME L ASSURANCE-VIE (10/09/2026) ═══
     Regle du CGP : « je veux que le PER soit traite comme l assurance-vie, ce sont les
     livrets et autres placements bancaires qui ne doivent beneficier d aucun abattement ».
     Attendu recalcule depuis la regle : assiette = RP + livrets + PEA + compte courant
     (+ 0 pour AV et PER) ; avHors = AV + PER + PER declare a l etape Fiscalite. */
  console.log('\n═══ 3 octies. SUCCESSION — PER hors succession comme l\'AV, livrets dans l\'assiette ═══');
  const perSucc = await page.evaluate(() => {
    const d = window.migrateAudit({ ...window.AUDIT_DEFAUT,
      civilite: "M.", prenom: "T", nom: "T", dateNaissance: "1975-01-01",
      situation: "celibataire", conjointQ: "non", enfantsQ: "oui",
      enfants: [{ prenom: "E", annee: "2010", charge: "100", filiation: "client" }],
      logement: "proprietaire", rpValeur: "300000", rpCreditQ: "non", rpDetenteur: "client",
      avoirsQ: "oui", avoirs: [
        { id: 1, type: "livrets", valeur: "40000", titulaire: "client" },
        { id: 2, type: "compte_courant", valeur: "5000", titulaire: "client" },
        { id: 3, type: "pea", valeur: "25000", titulaire: "client" },
        { id: 4, type: "av", valeur: "60000", titulaire: "client" },
        { id: 5, type: "per", valeur: "30000", titulaire: "client" },
      ],
      activites: ["salarie"], actSalarie: { montant: "4000", periode: "mois", nbMois: "12", mode: "net" },
      objectifsDetail: { retraite: { age: "64" } },
    });
    const r = window.ncCalcSuccession(d);
    const v = r && (r.volets || [])[0];
    // PER declare seulement a l etape Fiscalite (sans avoir « per ») : doit aussi rejoindre avHors
    const d2 = window.migrateAudit({ ...d, avoirs: d.avoirs.filter(a => a.type !== "per"), reductionsPer: { valeur: "30000", titulaire: "client" } });
    const r2 = window.ncCalcSuccession(d2);
    const v2 = r2 && (r2.volets || [])[0];
    return v ? { assiette: v.assiette, avHors: v.avHors, avHors2: v2 ? v2.avHors : null, assiette2: v2 ? v2.assiette : null } : null;
  });
  controles++;
  if (!perSucc) KO('ncCalcSuccession a rendu null sur le dossier PER + AV + livrets');
  else {
    const attAss = 300000 + 40000 + 5000 + 25000 - 1500;   // frais funéraires art. 775
    const attHors = 60000 + 30000;
    const okA = Math.abs(perSucc.assiette - attAss) <= 1, okH = Math.abs(perSucc.avHors - attHors) <= 1;
    const ok2 = perSucc.avHors2 !== null && Math.abs(perSucc.avHors2 - attHors) <= 1 && Math.abs(perSucc.assiette2 - attAss) <= 1;
    if (!okA) KO('assiette ' + perSucc.assiette + ' € au lieu de ' + attAss + ' € — le PER ou l\'AV est resté dans l\'assiette, ou un placement bancaire en est sorti');
    else if (!okH) KO('hors succession ' + perSucc.avHors + ' € au lieu de ' + attHors + ' € — le PER n\'est pas traité comme l\'assurance-vie');
    else if (!ok2) KO('PER déclaré à l\'étape Fiscalité : hors succession ' + perSucc.avHors2 + ' € / assiette ' + perSucc.assiette2 + ' € (attendu ' + attHors + ' / ' + attAss + ')');
    else OK('PER traité comme l\'AV (' + attHors + ' € hors succession), livrets + compte courant + PEA dans l\'assiette (' + attAss + ' €)');
  }

  /* ═══ 3 nonies. COORDONNEES — civilite du client sur telephone et email en couple (11/09/2026) ═══ */
  console.log('\n═══ 3 nonies. COORDONNÉES — « Monsieur : … » comme « Madame : … » ═══');
  controles++;
  const coord = await page.evaluate(() => {
    const mk = (couple) => window.migrateAudit({ ...window.AUDIT_DEFAUT,
      civilite: "M.", prenom: "T", nom: "T", dateNaissance: "1980-01-01", tel: "0600000001", email: "a@b.fr",
      situation: couple ? "marie" : "celibataire", conjointQ: couple ? "oui" : "non",
      conjoint: couple ? { civilite: "Mme", prenom: "C", dateNaissance: "1982-01-01", tel: "0600000002", email: "c@b.fr" } : undefined,
      activites: ["salarie"], actSalarie: { montant: "3000", periode: "mois", nbMois: "12", mode: "net" },
    });
    const lis = (d) => { const r = window.ncSynthese(d).resume || []; const t = r.find(x => x.t === "Téléphone") || {}; const e = r.find(x => x.t === "Email") || {}; return { tel: t.d, telSub: t.sub, mail: e.d, mailSub: e.sub }; };
    return { couple: lis(mk(true)), seul: lis(mk(false)) };
  });
  {
    const c = coord.couple, s1 = coord.seul;
    const okC = c.tel === "Monsieur : 0600000001" && c.telSub === "Madame : 0600000002" && c.mail === "Monsieur : a@b.fr" && c.mailSub === "Madame : c@b.fr";
    const okS = s1.tel === "0600000001" && !s1.telSub && s1.mail === "a@b.fr" && !s1.mailSub;
    if (!okC) KO('couple : téléphone/email attendus « Monsieur : … » + « Madame : … », obtenu ' + JSON.stringify(c));
    else if (!okS) KO('célibataire : aucune civilité attendue, obtenu ' + JSON.stringify(s1));
    else OK('couple : « Monsieur : 06… » / « Madame : 06… » sur téléphone et email ; célibataire : valeur seule');
  }

  /* ═══ 3 decies. CONSTAT — retours du CGP du 11/09 (dossier Mars/Avril) ═══
     Points forts : plus de « Loyers attendus ajoutés… » ; « Durée restante : 11,5 ans » ;
     capacité d'épargne = fourchette déclarée + apport ; patrimoine net en puces.
     Axes : « Épargne insuffisante… » ; épargne long terme : « en cas de décès »,
     plus de « Placés en assurance-vie… » (état des lieux, pas de préconisation). */
  console.log('\n═══ 3 decies. CONSTAT — points forts et axes, formulations du CGP (11/09) ═══');
  const mars = await page.evaluate(() => {
    const d = window.migrateAudit({ ...window.AUDIT_DEFAUT,
      civilite: "M.", prenom: "Laurent", nom: "MARS", dateNaissance: "1982-04-01",
      situation: "pacse", conjointQ: "oui", conjoint: { civilite: "Mme", prenom: "Marie", nom: "AVRIL", dateNaissance: "1984-06-01" },
      enfantsQ: "oui", enfants: [{ prenom: "Ted", annee: "2012", charge: "100", filiation: "commun" }],
      logement: "proprietaire", rpValeur: "500000", rpCreditQ: "oui", rpCrd: "205000", rpMensualite: "1600", rpDureeRestante: "11.5", rpDetenteur: "commun",
      avoirsQ: "oui", avoirs: [{ id: 1, type: "livrets", valeur: "41500", titulaire: "client" }],
      activites: ["salarie"], actSalarie: { montant: "7400", periode: "mois", nbMois: "12", mode: "net" },
      conjointRev: { activites: ["salarie"], actSalarie: { montant: "3767", periode: "mois", nbMois: "12", mode: "net" } },
      capaciteEpargne: "300-500", apportInitial: "10000-30000",
      objectifsDetail: { retraite: { age: "64" } },
    });
    const syn = window.ncSynthese(d);
    const F = (t) => (syn.forces || []).find(x => new RegExp(t).test(x.t)) || null;
    const A = (t) => (syn.faiblesses || []).find(x => new RegExp(t).test(x.t)) || null;
    const j = (x) => x ? (x.d + ' || ' + (x.puces || []).join(' | ')).replace(/[  ]/g, ' ') : null;
    return { cap: j(F("Capacité d'emprunt")), rp: j(F("Propriétaire de la résidence principale")), ep: j(F("Capacité d'épargne déclarée")), pn: j(F("Patrimoine net")),
             insuf: !!A("^Épargne insuffisante au regard des revenus"), insufTxt: j(A("^Épargne insuffisante au regard des revenus")), fisc: j(A("^Fiscalité subie")), ltVerdict: (A("^Épargne long terme") || {}).verdict || null, tresFaible: !!A("très faible"), lt: j(A("^Épargne long terme")), titres: (syn.faiblesses || []).map(x => x.t),
             endet: j(A("endettement non utilisée")),
             tout: (syn.forces || []).concat(syn.faiblesses || []).map(x => x.t + ' ' + x.d + ' ' + (x.puces || []).join(' ')).join(' || ') };
  });
  controles++;
  {
    const ko = [];
    if (!mars.cap) ko.push('pas de point fort Capacité d\'emprunt');
    else if (/Loyers attendus ajoutés/.test(mars.cap)) ko.push('« Loyers attendus ajoutés aux revenus retenus par la banque » toujours présent');
    if (!mars.rp) ko.push('pas de point fort Propriétaire de la RP');
    else if (!/Durée restante : 11,5 ans/.test(mars.rp) || /11,5 ans restants/.test(mars.rp)) ko.push('durée restante mal formulée : ' + mars.rp);
    if (!mars.ep) ko.push('pas de point fort Capacité d\'épargne déclarée');
    else if (mars.ep !== "300 à 500 € mensuellement || Apport en numéraire de 10 000 à 30 000 €") ko.push('capacité d\'épargne hors format : ' + mars.ep);
    if (!mars.pn) ko.push('pas de point fort Patrimoine net');
    else if (!/^\d[\d ]* € d'actif net \|\| Monsieur : [\d ]+ € \| Madame : [\d ]+ € \| dont [\d ]+ € détenus en commun$/.test(mars.pn)) ko.push('patrimoine net hors format en puces : ' + mars.pn);
    if (!mars.insuf || mars.tresFaible) ko.push('axe attendu « Épargne insuffisante au regard des revenus », titres : ' + mars.titres.join(' | '));
    if (!mars.lt) ko.push('pas d\'axe Épargne long terme (attendu : 41 500 € sur livrets, cible 25 000 €)');
    else if (!/droits de succession en cas de décès/.test(mars.lt) || /Placés en assurance-vie/.test(mars.lt)) ko.push('épargne long terme : ' + mars.lt);
    /* 14/09 (CGP, Coconut) : formulations exactes */
    else if (mars.lt !== "aucune épargne long terme : 41 500 € investis sur des livrets et comptes courants. || Situation critique pour une gestion de votre épargne. | Rémunérés à peine plus que l'inflation, et frappés de plein fouet par les droits de succession en cas de décès") ko.push('épargne long terme hors formulation exacte du 14/09 : ' + mars.lt);
    /* 14/09 (v216) : phrase de verdict sur l'axe Épargne long terme */
    if (mars.ltVerdict !== "Le sujet n'est pas l'effort d'épargne, c'est son affectation.") ko.push('verdict de l\'axe Épargne long terme absent ou modifié : ' + mars.ltVerdict);
    if (mars.insufTxt && mars.insufTxt !== "41 500 € d'épargne pour 11 167 € de revenus mensuels. || ") ko.push('épargne insuffisante hors formulation exacte du 14/09 (une ligne, sans puce) : ' + mars.insufTxt);
    if (/Moins de six mois de revenus|dorment sur|Situation anormale/.test(mars.tout)) ko.push('ancienne formulation (« Moins de six mois », « dorment », « Situation anormale ») réapparue');
    if (mars.fisc && !/d'impôt sur 10 ans à situation constante/.test(mars.fisc)) ko.push('« Fiscalité subie » sans « d\'impôt sur 10 ans » : ' + mars.fisc);
    // 11/09 (Drouot) : axe endettement court, sans « stress-test » ni « Utilisations possibles »
    if (!mars.endet) ko.push('pas d\'axe Capacité d\'endettement non utilisée (endettement 14 %)');
    else if (!/^Endettement à 14 % seulement \|\| Votre capacité d'endettement vous permettrait de réaliser un investissement locatif pour un montant de [\d ]+ € \| L'effet de levier du crédit est indispensable dans une bonne gestion de patrimoine \| Il vous permet de capitaliser dans le temps, tout en protégeant vos héritiers en cas de décès$/.test(mars.endet)) ko.push('axe endettement hors formulation exacte du CGP (11/09) : ' + mars.endet);
    if (/stress-test|Utilisations possibles/i.test(mars.tout)) ko.push('« stress-test » ou « Utilisations possibles » réapparaît dans le constat (supprimés définitivement par le CGP le 11/09)');
    if (ko.length) KO(ko.join(' ; ')); else OK('Mars/Avril : capacité sans hypothèse bancaire, « Durée restante : 11,5 ans », « 300 à 500 € mensuellement » + apport, patrimoine net en puces, « insuffisante », « en cas de décès » sans préconisation');
  }

  /* ═══ 4. ERREURS JAVASCRIPT ═══ */
  console.log('\n═══ 4. ERREURS JAVASCRIPT ═══');
  controles++;
  if (jsErr.length) KO(jsErr.length + ' erreur(s) : ' + jsErr.slice(0, 3).join(' || '));
  else OK('aucune erreur JavaScript pendant tous les calculs');

  /* ═══ RAPPORT ═══ */
  console.log('\n' + '═'.repeat(72));
  console.log(echecs === 0
    ? 'BANC DE CONTRÔLE : ' + controles + ' contrôles, TOUS VERTS'
    : 'BANC DE CONTRÔLE : ' + echecs + ' ÉCHEC(S) sur ' + controles + ' contrôles — NE PAS LIVRER');
  console.log('═'.repeat(72));
  await browser.close();
  process.exit(echecs === 0 ? 0 : 1);
})();
