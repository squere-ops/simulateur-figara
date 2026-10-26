---
name: simulateur-figara-dev
description: "Développer, tester et livrer le simulateur patrimonial FIGARA (index.html, React mono-fichier du cabinet Universel Patrimoine). À utiliser dès qu'il faut modifier, corriger, tester ou livrer le simulateur, son audit patrimonial, sa synthèse ou ses exports PDF."
---

# Simulateur FIGARA — développement, test et livraison

Ce skill porte le savoir de FABRICATION. Pour la doctrine patrimoniale et fiscale,
c'est le skill `analyse-etude-patrimoniale` qui fait foi — le lire aussi dès qu'un
calcul métier est en jeu.

---

## LA RÈGLE QUI PRIME SUR TOUTES LES AUTRES

**Rien ne part au cabinet tant que `./verif.sh` n'est pas vert.** Pas « j'ai
regardé », pas « ça devrait aller » : la commande passe, ou on ne livre pas. Son
résultat se montre au CGP AVEC la livraison — il doit voir ce qui a été testé, pas
un « tout est OK » sans preuve.

Le 02/09/2026 le CGP a dû demander : « il ne faut te faire absolument aucune
confiance, c'est bien cela ? ». Il avait raison de poser la question. Les défauts
livrés n'étaient pas des calculs subtils — un mot « mois » coupé en deux, des
champs déclarés mais jamais affichés, une formule rendant 1 € au lieu de 30 000 €,
un foyer salarié annoncé « travailleur non salarié ». Le point commun : **tester ce
qu'on vient d'écrire, sur un dossier pauvre.** Le remède n'est pas de promettre
d'être plus attentif, c'est un banc qui regarde à notre place.

### Un contrôle doit d'abord prouver qu'il regarde

La première version du banc lisait `syn.axes` et `fisc.ir.net` — qui n'existent
pas. Elle annonçait « 0 axes, impôt 0 € » sur les six dossiers et **tout était
vert**. Un contrôle cassé rend exactement le même silence qu'une application saine.
Donc, systématiquement :

- **garde-fou de clés** : si une clé attendue du moteur disparaît, le contrôle
  ÉCHOUE, il ne vaut jamais `undefined` en silence ;
- **valeurs de vraisemblance** : un dossier type doit produire un RNI > 0, au moins
  un axe, un impôt cohérent — sinon le contrôle ne lit pas ce qu'il croit lire ;
- **auto-test du détecteur** : injecter un défaut volontaire et vérifier qu'il est
  vu, avant de faire confiance à son silence.

### Lire le RENDU, pas seulement le source (02/09/2026)

Un contrôle qui vérifie la présence d'une formule dans `index.html` prouve que le
code existe, pas qu'il produit le bon nombre à l'écran. Le compteur « reste à
allouer » affichait un zéro parfaitement cohérent avec son code — et ne comptait
rien. Depuis, le banc **ouvre le harnais et relit les valeurs affichées** :
enveloppe, effort, reste, libellés de la prévoyance. C'est le seul contrôle qui
regarde ce que le client verra.

### Un recalcul TRANSCRIT ne vérifie rien

Réécrire le même algorithme dans un autre langage reproduit le même raisonnement
faux : les deux versions concordent et l'erreur passe. Le second chemin repart de
la RÈGLE (texte officiel, définition, logique métier), jamais du code déjà écrit.
Un report Malraux traité comme illimité au lieu de 3 ans a survécu à un recalcul
Python transcrit — 80 000 € d'avantage inexistant. **Contrôle de conservation** sur
tout mécanisme qui répartit, plafonne ou reporte : total théorique = somme de
toutes les destinations.

---

## LE DISPOSITIF DE VÉRIFICATION

### `./verif.sh` — une commande, un verdict

1. syntaxe (`node syn.js`) ;
2. régénération de `test_local.html` (**`./regen.sh`**, jamais `node syn.js` seul :
   il ne régénère PAS `test_local.html` — on testerait un fichier périmé) et du
   harnais `_test_proj.html` (`regen_proj.py`) ;
3. **banc de contrôle** (`node t_controle.js`) — 69 contrôles (3 decies : formulations exactes du constat, dont celles du 14/09 ; 3 undecies : structure de la Projection, base du « sans rien changer », apport « 10 000 » ; 3 duodecies : temps commercial RDV 1 / RDV 2 et `ncpCap` recalculé depuis la règle ; 3 terdecies : document imprimé) ;
4. **débordements et valeurs coupées** sur les trois volets (`node t_deb_syn.js`) ;
5. **saisie réelle, frappe touche par touche**, dans « Où trouver l'épargne » (`t_saisie.js`) ;
6. **gisements : un levier décoché ne compte dans aucun total** (`t_gisements.js`) ;
7. **les sept régimes locatifs produisent leur avantage fiscal** (`t_regimes.js`) ;
8. **optimisation du rattachement des enfants** en union libre (`t_optim.js`) ;
9. **ordre de lecture du bloc fiscal** (`node t_ordre_fiscal.js`) ;
10. suites de non-régression (`t_rdv1.js`, `t_exp167.js`) ;
11. **projet d'achat RP** — durée/apport/taux, ex-plantage du 03/09, capacité
    « projet RP + place restante pour du locatif », et régime locatif imprimé
    dans le PDF de la projection (`t_rp.js`) ;
12. **mode présentation** (`t_presentation.js`) — entre en présentation sur les
    trois volets, compte ce qui est VISIBLE (un seul chapitre à la fois), navigue
    à la souris puis au clavier, vérifie qu'une flèche tapée dans un champ ne fait
    pas défiler, que `Échap` sort et que l'écran revient à son état d'origine.
    Son AUTO-TEST vide la feuille de style écrite par la barre : tous les
    chapitres doivent réapparaître, sinon le contrôle ne regarde rien ;
13. **nouveaux blocs du premier rendez-vous** (`t_shot_pres.js`) — passe sur un
    COUPLE marié en séparation de biens, pose le livret sur Monsieur (200 €/mois)
    et l'assurance vie sur Madame (100 €/mois), exige les DEUX NOMS à côté des
    deux montants, le total, la ligne « dont Monsieur … · Madame … », l'ORDRE des
    cinq blocs (épargne actuelle → versements programmés → objectifs et moyens →
    questions du prochain rendez-vous → devoirs du client), l'absence de
    « il manque X € », et **compte les points d'interrogation du bloc questions :
    cinq au maximum**. Il produit aussi `pres_NN.png`, une capture par chapitre,
    **à relire** après toute retouche de la mise en page ;
14. **devoirs du client** (`t_devoirs.js`) — dossier couple propriétaire avec
    crédit RP, laissé VOLONTAIREMENT dans l'ignorance : quotité d'assurance
    « je ne sais pas », assurance de prêt « je ne sais pas », rendement du
    placement inconnu. Le banc vérifie que chaque pièce est réclamée ET nommée,
    puis **renseigne la quotité et exige que CE devoir disparaisse** pendant que
    les autres restent (c'est son auto-test).

Sortie non nulle = ne pas livrer.

**Une suite qui n'est pas comptée ne protège de rien.** `t_rdv1` et `t_exp167`
impriment « FAIL — … » sans code de sortie ; `verif.sh` ne cherchait que « KO ».
Sept assertions périmées ont dormi plusieurs livraisons, dont deux qui
**contredisaient une règle validée par le CGP**. Les `FAIL` sont désormais comptés
(`NF1=$(grep -c "^FAIL" …)`). Toute suite ajoutée doit sortir en code non nul
**ou** être comptée explicitement.

### `t_controle.js` — le banc

Les fonctions du moteur sont accessibles depuis `window` (`ncSynthese`,
`ncCalcFisc`, `ncDetailRNI`, `ncPensionFoyer`, `ncCalcSuccession`, `ncp*`,
`migrateAudit`, `AUDIT_DEFAUT`) : on les appelle directement en `page.evaluate`,
sans parcourir le questionnaire. Six **dossiers types**, chacun là pour déclencher
un chemin qu'un dossier simple n'atteint jamais :

| Dossier | Ce qu'il déclenche |
|---|---|
| Couple mixte salarié / TNS, 2 enfants, locataires, épargne commune | libellé de statut par personne, bloc commun centré |
| Célibataire salarié propriétaire avec crédit | capacité d'emprunt, CRD, part immobilière |
| TNS seul à revenus élevés | plafond PER, remplacement 20-30 %, prévoyance |
| Union libre, un seul revenu, enfants non communs | deux déclarations (art. 6 CGI), conjoint non protégé |
| Couple retraité propriétaire | aucune « baisse de revenus à venir » ne doit s'afficher |
| Couple avec locatif, PER et assurance-vie | fonciers, trois sources immobilières, niches |

**Attention aux clés de saisie** : le revenu d'un indépendant est
`actIndependant.n1` (bénéfice ANNUEL), pas `actAutre.revenu` ; la situation est
`pacse`, pas `pacs`. Un dossier type mal formé passe au vert sans rien tester — le
contrôle de vraisemblance l'attrape.

Sondes appliquées à tous les textes produits : `NaN`, `undefined`, `Infinity`,
`null`, unité doublée, décimale parasite (`415017.538`), gabarit non résolu,
formulations bannies. Contrôles métier : libellé TNS cohérent avec la composition
du foyer, pas de baisse de revenus annoncée à un retraité.

**Contrôle des champs orphelins** : tout champ déclaré dans un `useState` sans
contrôle de saisie dans le JSX est signalé. C'est le défaut de v182 — travaux,
taxe foncière, charges et gestion existaient dans l'état, invisibles à l'écran.

**Contrôles de règles métier verrouillées** — à ne jamais retirer : ordre des
onglets (Constat → Projection → RDV 2), filtre des scénarios `rdv2`, unicité du
point d'entrée `ncPensionFoyer` (aucun appel direct à `ncPensionPerso` ailleurs),
quotité disponible selon le nombre d'enfants, exonération du partenaire pacsé,
60 % du concubin, **PER hors succession comme l'AV et livrets dans l'assiette**
(3 octies, v208). Chaque règle nouvelle arrachée en séance repart avec son test.

**Section « Projection » du banc (rendu réel)** : enveloppe issue de la capacité
déclarée, cohérence `disponible − employée = reste`, modèle du « avant »,
tableau avant / après (ligne assurance de prêt, écart de patrimoine recalculé),
un seul chiffre de manque (tuile = bandeau collant = alerte).

### `t_gisements.js` — « Où trouver l'épargne » : deux natures, deux totaux

Le CGP, capture à l'appui : *« pas logique, je coche le 3e bloc et j'ai un
affichage aussi sur celui du milieu »*. Deux défauts se cumulaient.

1. La rangée de trois tuiles du bas **semblait** répondre aux trois cartes du
   haut, alors que la deuxième était le **total des cartes 2 et 3** : un levier
   décoché paraissait compter.
2. Les leviers mélangeaient **deux natures qui ne s'additionnent pas** — des
   euros **disponibles chaque mois** (délégation d'assurance) et du **capital à
   l'horizon** (arbitrage, redirection). La tuile « Ce que ça représente par
   mois » ramenait même un capital au mois pour l'ajouter à une trésorerie
   réelle : personne ne pouvait suivre.

Le banc vérifie la règle, pas la mise en page : totaux **recalculés à partir de
la règle** (jamais lus du code), redirection cochée **seule** avec un arbitrage
doté d'un montant élevé — le total doit rester celui de la seule redirection —,
trésorerie toujours en **€/mois**, et absence de la tuile mélangeante.

**Deux pièges de méthode rencontrés en l'écrivant** :

- *Ancrer un attendu sur une phrase de la page.* La première version lisait
  l'horizon dans « dans N ans » : cette tournure apparaît dans plusieurs blocs
  **conditionnels**, donc la valeur changeait selon les cases cochées. Un attendu
  calculé sur un mauvais horizon **passe par tolérance** et masque un vrai
  défaut. Ancrer sur les **champs de saisie** — ici la ligne « Âge · départ en
  retraite visé ». Attention : « 25 ans » de durée de crédit est suivi du même
  mot « ans » et se fait passer pour l'âge actuel ; filtrer sur la **ligne**.
- *Un test vert ne prouve rien tant qu'on ne l'a pas fait échouer.* Chaque banc
  nouveau se valide **par mutation** : on casse volontairement le moteur du
  harnais (ici `gainRendCap: gainArbPot + gainRedPot`), on vérifie que le test
  passe au rouge, puis on restaure. Sans cette preuve, on ne sait pas si le test
  regarde quelque chose.

### `t_deb_syn.js` — débordements, sur TOUT le document

Il ne couvrait que la Projection : le « €/mo | is » du Constat est parti en
livraison. Il parcourt maintenant les trois volets. Deux leçons de méthode :

- `getClientRects().length` n'est **pas** un indicateur de coupure (il renvoie
  plusieurs rectangles pour des inline non coupés). Comparer la **hauteur à la
  hauteur de ligne**, et ignorer ce qui est déjà en `white-space: nowrap`.
- ne tester que les **feuilles** dont le texte est une **valeur pure** (nombre +
  unité) : une tuile « 30 994 € / SANS RIEN FAIRE » occupe légitimement deux
  lignes, « 22 500 € » jamais.

### `t_shot_proj.js` — capture ciblée du harnais

`node t_shot_proj.js "texte d'ancre" /tmp/x.png` cadre la zone autour d'un texte.
**Piège** : `document.querySelectorAll('*')` rend aussi le `<script type="text/babel">`,
dont le `textContent` contient TOUT le source — n'importe quelle ancre y est
trouvée en premier et la capture reste bloquée en haut de page. Filtrer
`SCRIPT|STYLE|TITLE|LINK|META` et exiger `offsetParent !== null`.

### `mk_rami.py` + `t_rami_proj.js` — un harnais sur un dossier riche (10/09/2026)

`_test_proj.html` porte un dossier pauvre (célibataire, sans enfant). `python3
mk_rami.py` en fabrique `_test_rami.html` (locataire pacsé avec enfant, projet RP,
terrain, épargne commune) — à relancer après chaque `regen_proj.py`, sinon il
teste une copie figée. `node t_rami_proj.js DOSSIER_PNG` coche PER + AV + locatif
Jeanbrun et imprime enveloppe, fiscalité, alerte et tableau avant / après. C'est
là que se lisent les lignes succession (absentes du dossier pauvre).

---

## RÈGLES DE CONDUITE — non négociables

1. **Ne JAMAIS rétablir ni réintroduire quoi que ce soit qui a été supprimé** sans
   accord explicite préalable. Chaque changement non validé coûte au cabinet une
   facture de son développeur.
2. **Questionner au moindre doute.** Ne jamais décider seul d'une méthode, d'une
   hypothèse ou d'un chiffre.
3. **Vérifier son travail AVANT de le livrer.** Protocole complet dans le skill
   `analyse-etude-patrimoniale` ; ici, c'est `./verif.sh`.
4. **ÉCRIRE DANS LES SKILLS À CHAQUE FIN DE CHANTIER, SANS QU'ON LE DEMANDE.** Le
   CGP a dû l'exiger : « fais-le systématiquement, je ne dois pas avoir à te
   relancer ». La technique ici, la doctrine dans le skill métier.
5. **NE JAMAIS toucher au site figara_web** (VPS OVH) : géré par le développeur du
   cabinet.
6. **Secrets** : des mots de passe ont été exposés dans une session antérieure. Ne
   jamais les répéter ni les réutiliser ; recommander une rotation si le sujet
   revient.
7. **UN SEUL fichier à la livraison.** Le CGP (10/09) : « tu viens de m'envoyer
   2 fichiers à télécharger et ouvrir ! faut-il que je lui fasse suivre les
   deux ? ». Une note pour le développeur = un seul PDF ; une livraison du
   simulateur = le seul `index.html`. Et tout ce qui part vers le développeur est
   **vérifié sur le code réel de la version qu'il a** (numéros de ligne, noms de
   variables disponibles à cet endroit, chiffres attendus après correctif) :
   « je paye le développeur à chaque demande… je n'ai donc pas le droit à
   l'erreur et toi non plus ».
8. **Les skills se mettent à jour par `propose_skills`** (kind `improvement`,
   `target`, SKILL.md COMPLET) — écrire le fichier sur disque ne change rien.
   Le skill métier (~140 Ko) dépasse la limite de sortie de l'outil : le
   préparer par script, le `diff` contre la copie synchronisée, le livrer par
   `SendUserFile` avec les zones modifiées (numéros de ligne), et le dire. Après
   une compaction de contexte, relire la copie synchronisée AVANT de reproposer :
   la précondition « lu dans cette session » n'est pas mémorisée — et si le CGP a
   sauvé une proposition entre-temps, la copie synchronisée est plus récente que
   la préparation : repartir d'elle, jamais de la préparation.

---

## LE FICHIER

`index.html` — React 18 mono-fichier, ~16 000 lignes, Babel standalone dans le
navigateur. Pas de build : le fichier livré est le fichier exécuté.

| Branche | Destination | Base Supabase |
|---|---|---|
| `main` | Vercel, production | base de production |
| `demo` | GitHub Pages, testeurs | base de démonstration |

**Marqueur de version** : `console.log('%cBUILD vNNN (…)`. **PRÉFIXER** la nouvelle
entrée en transformant `BUILD vNNN (` en `ANCIEN BUILD vNNN (` — remplacer le
segment jusqu'au premier « ANCIEN » écrase l'entrée précédente (v182 perdue ainsi).

---

## RITUEL DE LIVRAISON

1. **Éditer** par script Python en heredoc, avec `assert s.count(ancre)==1` avant
   chaque remplacement. Jamais de réécriture d'un bloc de mémoire : on ancre sur le
   texte exact et on vérifie l'unicité.
2. **`./verif.sh`** — tout vert, sinon on corrige.
3. **Captures INSPECTÉES**, pas seulement prises — reproche explicite du CGP.
4. **Mettre les skills à jour.**
5. **Livrer** : `SendUserFile` puis `device_commit_files` (force).
6. **Commit plumbing** pour `main` puis `demo`.
7. **Récapituler**, montrer le résultat du banc, rappeler les deux push.

---

## COMMIT PLUMBING SUR LE MAC — obligatoire

Le montage **interdit `unlink`** : `git checkout`, `commit`, `reset`, `merge` sont
interdits. On passe par la plomberie.

```bash
cd $HOME/mnt/simulateur-figara
mkdir -p _to_delete
CL(){ for f in $(find .git -name "*.lock" -o -name "tmp_obj_*" 2>/dev/null); do
        mv "$f" "_to_delete/$(basename $f).$RANDOM" 2>/dev/null; done; }

CL; git add index.html; CL
t=$(git write-tree); CL
c=$(GIT_AUTHOR_NAME="…" GIT_AUTHOR_EMAIL="…" GIT_COMMITTER_NAME="…" GIT_COMMITTER_EMAIL="…" \
     git commit-tree $t -p main -m "vNNN: …"); CL
git update-ref refs/heads/main $c; CL
```

`CL` avant ET après chaque commande git. Les avertissements
`unable to unlink … Operation not permitted` sont normaux.

**Commit `demo`** : substituer URL et clé par celles de la démo, commiter avec
`-p refs/heads/main`, puis **inverser** pour laisser la copie locale en production.

```bash
PU=$(git show main:index.html | grep -o 'https://[a-z0-9]*\.supabase\.co' | sort -u)
DU=$(git show demo:index.html | grep -o 'https://[a-z0-9]*\.supabase\.co' | sort -u)
PK=$(git show main:index.html | grep -o 'sb_publishable_[A-Za-z0-9_-]*' | sort -u)
DK=$(git show demo:index.html | grep -o 'sb_publishable_[A-Za-z0-9_-]*' | sort -u)
# jamais perl -i (rename interdit sur le montage) : passer par un fichier temporaire
perl -pe "s#\Q$PU\E#$DU#g; s#\Q$PK\E#$DK#g" index.html > _to_delete/idx.tmp && cat _to_delete/idx.tmp > index.html
# attendu 1 1 0 0 — LIRE le résultat, puis commiter dans une commande SÉPARÉE
echo $(grep -Fc "$DU" index.html) $(grep -Fc "$DK" index.html) $(grep -Fc "$PU" index.html) $(grep -Fc "$PK" index.html)
```

Délimiteur **`#`** obligatoire : avec `/`, le `//` de l'URL casse la substitution
et on obtient un commit demo MIXTE (URL prod + clé démo) — arrivé le 04/09, il a
fallu remettre la référence `demo` en arrière. **`perl -i` peut échouer sur ce
montage** (`failed to rename work file 'XXwHzru0' … Operation not permitted`,
11/09) : la substitution est alors muette, `COUNTS` vaut `0 0 1 1`, et un commit
enchaîné sans test produit un `demo` avec les clés de PRODUCTION (arrivé, réparé
par `git update-ref refs/heads/demo <ancien sha>`). Deux règles : écrire via
`perl -pe … > _to_delete/idx.tmp && cat _to_delete/idx.tmp > index.html` (jamais
`-i`), et **ne JAMAIS enchaîner le commit demo dans la même commande que la
substitution** — lire `COUNTS`, puis commiter seulement s'il vaut `1 1 0 0`. Le
fichier de travail orphelin se déplace dans `_to_delete/`. Contrôle final : `git diff main demo`
doit ne montrer que **2 lignes** (URL et clé), `git read-tree refs/heads/main`
pour nettoyer l'index, puis `git status --short` vide.

**Push** : impossible d'ici (trousseau macOS). Rappeler au CGP `git push` puis
`git push --force origin demo`. Une erreur `remote: Internal Server Error` peut
masquer un succès : vérifier par `git fetch` avant de conclure à un échec.

---

## PIÈGES DÉJÀ RENCONTRÉS

### Le dernier `select` de la page n'est pas celui qu'on croit (15/09/2026)
`page.locator('select').last().selectOption('av')` marchait tant qu'il n'y avait
qu'un placement ; dès qu'un DEUXIÈME est ajouté, le dernier `select` est celui du
DÉTENTEUR du premier, et le test meurt en « did not find some options » après
30 s. Viser un select par ce qu'il PROPOSE, jamais par sa position :
`Array.from(document.querySelectorAll('select')).filter(s => s.offsetParent &&
[...s.options].some(o => o.value === 'av')).pop()`. Même règle pour la quotité
(`option[value="100_100"]`) et le détenteur (`option[value="conjoint"]`).

### Un test qui « ne trouve pas la question » ment sur la cause (15/09/2026)
`t_devoirs` annonçait « aucun select quotité » et « libellé introuvable » : la
vraie cause était trois écrans plus haut — le clic sur « Un crédit est-il en
cours sur ce bien ? » n'avait jamais eu lieu (le localisateur cherchait
« crédit en cours », le libellé exact est « Un crédit est-il en cours sur ce
bien ? »), donc tout le bloc crédit restait replié. Avant de corriger le
symptôme, **faire cracher au test l'état réel** (liste des `select` visibles et
de leurs options, libellés présents) : trois lignes de `page.evaluate` ont
remplacé trois allers-retours.

### `display: revert` ne rend pas sa mise en page à un bloc (15/09/2026)
Premier jet du mode présentation : masquer tous les blocs par `display: none`
puis « ré-afficher » le chapitre courant par `display: revert`. Un `div.grid`
Tailwind revient alors en `block` : les colonnes s'empilent. La règle tient en
une phrase — **on masque ce qu'on ne montre pas, on ne ré-affiche jamais rien** :
`:not(:nth-child(n+A):nth-child(-n+B))` cible les voisins, et le chapitre courant
n'est jamais touché. Le même piège a fait passer l'AUTO-TEST du banc au vert à
tort : la mutation injectait `display: revert !important` dans une règle MOINS
spécifique que celle du produit, donc sans effet. Une mutation doit frapper le
MÉCANISME (ici : vider la feuille de style écrite par la barre), pas essayer de
le contredire.

### `innerText` applique `text-transform` (15/09/2026)
Les titres du produit sont en CSS `uppercase`. Chrome renvoie « CHAPITRE 3 / 13 »
dans `innerText` alors que le JSX écrit « Chapitre ». Un banc qui lisait
`/Chapitre (\d+) \/ (\d+)/` a annoncé `null` sur deux volets sur trois — et les
contrôles de navigation, qui comparaient `null === null`, passaient au vert.
Toute regex sur `innerText` : `/i`.

### Ce qui flotte autour de la fenêtre n'est pas dans la fenêtre (15/09/2026)
La pastille « étape 8 / 8 » et le bouton Bloc-notes sont restés à l'écran deux
corrections de suite parce qu'ils ne sont ni dans la carte, ni enfants directs de
la zone de défilement, mais dans le wrapper `.max-w-4xl`. Ne pas deviner la
nidification : la **sonde** (`t_pres_probe.js`) imprime la chaîne d'ancêtres de
`.nc-syn-zone` et les enfants de chaque niveau — trente secondes qui remplacent
trois allers-retours.

### `git commit-tree` n'a pas d'identité par défaut (15/09/2026)
Sur le Mac, le plumbing échoue en `Author identity unknown` : aucune config
globale. Reprendre l'identité du dernier commit
(`git log -1 --format='%an|%ae'`) et l'exporter dans `GIT_AUTHOR_NAME`,
`GIT_AUTHOR_EMAIL`, `GIT_COMMITTER_NAME`, `GIT_COMMITTER_EMAIL`. Chaque commande
git laisse ensuite un `.git/index.lock` et des `.git/objects/*/tmp_obj_*`
impossibles à supprimer (montage) : les déplacer dans `_to_delete/locks_HHMMSS/`
après chaque commande, sinon la suivante refuse de démarrer.

### Un régime de foyer traité comme un régime de bien (02/09/2026)
**Le micro-foncier et le régime réel ne cohabitent JAMAIS dans un même foyer.** Le
micro-foncier s'applique à TOUS les revenus fonciers ou à aucun. Dans l'audit,
`ncRegimeLoc` rend d'abord `l.regime`, le choix manuel **par bien** : rien
n'empêche aujourd'hui de poser un bien au micro et un autre au réel, ce qui est
fiscalement impossible. Et dans la Projection, un nouveau bien au réel devrait
**faire basculer au réel les biens existants** — le client perd son abattement de
30 % sur un bien qu'il n'a pas touché. À arbitrer avec le CGP avant de coder :
le régime doit devenir un attribut du FOYER, pas du bien. Doctrine complète dans
`analyse-etude-patrimoniale`, `references/fiscalite-locative.md` section 0.

### Un indicateur déduit de ce qu'il est censé mesurer (02/09/2026)
L'enveloppe d'épargne se calculait comme le total des solutions cochées : le
compteur « reste à allouer » valait donc TOUJOURS zéro, et le bloc entier ne
servait à rien tout en paraissant juste. **Un compteur doit puiser sa référence
ailleurs que dans ce qu'il décompte** — ici, la capacité déclarée à l'audit.

### Deux natures de gain ne s'additionnent jamais (03/09/2026)
Un euro **disponible chaque mois** (trésorerie libérée par une délégation
d'assurance) et un **capital à l'horizon** (gain de rendement d'un arbitrage) ne
se mettent pas sous un même total. La tuile « Ce que ça représente par mois »
ramenait un capital au mois pour l'ajouter à une trésorerie réelle : le chiffre
ne correspondait à rien d'encaissable. **Chaque famille porte son propre total,
dans son unité, avec la phrase qui dit ce que ce total devient** — l'une alimente
l'enveloppe dès la mise en place, l'autre se lit à l'horizon.

### Un total ne doit compter que ce qui est retenu (03/09/2026)
Le CGP : *« pas logique, je coche le 3e bloc et j'ai un affichage aussi sur celui
du milieu »*. Trois tuiles alignées sous trois cartes **font croire** qu'elles se
répondent une à une ; la deuxième était en réalité le total des cartes 2 et 3.
Règle : **une valeur affichée sous une carte décochée doit se lire au
conditionnel** — plus petite, en italique, en gris, avec la mention « si vous
l'activez » — et n'entrer dans **aucun** total. Montrer ce que le client laisse
de côté est utile ; le lui compter comme acquis est faux.

### Un total affiché à côté de son unique composante
Le bloc de prévoyance listait « crédit de la résidence principale soldé » puis
« dette effacée au décès » — la même somme, deux fois, quand il n'y a qu'un crédit.
Un total ne s'ajoute qu'**à partir de deux composantes**.

### Le harnais doit reproduire la grille d'espacement Tailwind (02/09/2026)
Le harnais recopiait les classes une par une : `ml-2`, `gap-x-7`, `px-4` manquaient,
donc des textes apparaissaient collés alors qu'ils ne le sont pas en production —
et, symétriquement, de vraies collisions pouvaient passer inaperçues. Un petit
script en tête de `_test_proj.html` **génère** `m/p/gap/w/h` sur toute l'échelle
(0 → 24, pas de 4 px). Ne pas le retirer ; ne pas retourner au recopiage manuel.
**Ne jamais corriger un défaut visuel du harnais dans `index.html` avant d'avoir
vérifié que le défaut existe aussi en production.**

### Le journal des BUILD piège les bancs qui lisent le source (03/09/2026)
Le journal raconte les défauts corrigés : il **cite donc les mauvaises écritures**
que le banc traque (`ir.net`, « largement sous le plafond »…). `t_controle.js`
retirait la ligne `%cBUILD` — celle du build courant. Au build suivant elle
devient `ANCIEN BUILD` et **redevenait visible** : le banc virait au rouge sur une
phrase de commentaire, le jour même où l'on posait un marqueur. Retirer **toutes**
les lignes de journal avant toute recherche dans le source :
`/console\.log\('%c(ANCIEN )?BUILD[\s\S]*?\n/g`.

### Les helpers `eur` / `nfL` / `nfC` sont LOCAUX à leur composant (03/09/2026)
Il n'y a pas de formateur global : chaque composant (ou IIFE) déclare le sien.
Un JSX ajouté dans `NouveauClientModal` qui appelle `eur(...)` sans l'avoir
déclaré plante à l'affichage — et seulement quand la branche s'affiche (ici, dès
que mensualité ET durée du projet RP sont saisies). Avant d'utiliser un helper,
`grep` sa déclaration DANS le composant courant ; sinon le déclarer localement.

### `<Slider>` : prop `dec` obligatoire pour un pas décimal (03/09/2026)
Sans `dec`, le composant traite la valeur comme un entier (« 3.5 » → 350 %) et
le curseur devient inutilisable. Tout slider à `step` décimal (taux, pourcentages
fins) reçoit `dec`. Bornes des curseurs = chiffres MÉTIER : le taux d'un crédit
plafonne à 7 % (CGP, 03/09), pas à 650.

### Les quatre compteurs de « Les chiffres du dossier » (10/09/2026)
Le CGP : « c'est un peu l'anarchie ». Cause : les cartes empilaient titre,
jauge(s), notes et lignes de détail sans hauteur commune — une carte à double
jauge (titres au-dessus) posait ses arcs 34 px plus bas qu'une carte à jauge
simple. Règle : chaque carte encadre sa ou ses jauges dans `.nc-zone-jauge`
(`min-height: 196px; width: 100%`, contenu calé en haut `justify-start`), un
compteur seul reçoit `solo` (`paddingTop: NC_JAUGE_TITRE = 34`) pour retomber au
niveau des doubles jauges, et **les lignes de détail restent HORS de la zone** —
sinon la zone grandit et désaligne la carte voisine (« Mensualité disponible »
faisait 256 px). Contrôle : `getBoundingClientRect().top` des `svg` égal sur une
même ligne, et `scrollHeight` de chaque zone ≤ 196.

### Un pourcentage de patrimoine doit être DATÉ quand un projet le change (10/09/2026)
« 77 % d'immobilier » sur un dossier avec projet d'achat de RP à 1-3 ans : le CGP
ne sait pas si c'est avant ou après l'achat. Toute part calculée sur l'actif
d'aujourd'hui, affichée à côté d'un projet qui va la bouleverser, porte la
mention « aujourd'hui, avant l'achat de la résidence principale (projet à …) ».
`d.rpProjetHorizon` vaut `"<1" | "1-3" | "3-5" | ">5"` — le traduire (table
`HZ`), jamais l'afficher brut (`"1-3 ans"` existe encore ligne ~9498, tuile
Projet RP : à corriger sur accord).

### Simulateur Reverse : ses propres frais (07/09/2026)
`ReverseCalculator` a son état `fraisPct` (défaut `'4.75'`) et applique
`net = 1 - frais` aux versements (PU, PP, apports) ; il **ignore
`inputs.fraisSouscription`** de l'étape Produit. Les frais changent bien l'effort
(0 → 10 % : 2 199 → 2 457 €/mois) mais PAS le capital cible (par conception).
`Number('4,75')` est `NaN` → champ vidé → 0 % : une virgule française annule les
frais en silence. Deux options posées au CGP (initialiser depuis les frais du
produit ; accepter la virgule) — **en attente de réponse**.

### `cloneNode(true)` perd l'option choisie d'un `<select>` (10/09/2026)
Le PDF est un clone du DOM. React pose `selectedIndex` et `checked` en
PROPRIÉTÉ, jamais en attribut : le clone imprime la PREMIÈRE option (« Nu au
réel » pour un bien déclaré Jeanbrun — dossier Rami) et perdrait l'état des
cases. `exporterPdfSynthese` recopie désormais, élément par élément, l'état des
`select` et des `input` de la zone vers le clone. `t_rp.js` lit le régime dans
`#nc-print-holder`. Toute nouvelle saisie dans la synthèse (select, case, champ)
est couverte par cette recopie — ne pas la contourner.

### Deux calculs pour une même valeur = deux vérités (10/09/2026)
Le point fort « Patrimoine net significatif » ventilait RP + placements ; la
tuile « Patrimoine net » ventilait RP + biens + locatifs + placements + PER +
crédits. Un terrain de 240 000 € déclaré à Monsieur ressortait « non rattaché à
un titulaire » dans le premier et à Monsieur dans la seconde. Règle : **une
valeur affichée à deux endroits vient d'UNE fonction** — ici `ncRepartNet(d)`
(module, sur `window`, `{c, j, commun}`), contrôlée à la main par le banc
(283 500 / 29 000 / 42 000).

### Jamais deux fois la même phrase d'affilée (10/09/2026)
L'axe « Partenaire sans droits » répétait sa phrase de tête en première puce.
Le CGP : « ça n'a pas de sens ». Deux gardes : `ncSansDoublon(tete, puces)` au
rendu (points forts ET axes — normalisation casse/espaces/point final), et le
banc (3 sexies-b) qui refuse une puce égale à la tête ou à la puce précédente.
Quand la tête pose le constat, la puce apporte la RAISON, pas la répétition.

### Points forts et axes en puces courtes (10/09/2026)
« Oublie les grandes phrases, va droit au but en mode bullet point, et ce pour
chaque point. » Un point fort = `t` (titre) + `d` (UN chiffre de tête, semi-gras,
≤ 140 caractères — le banc le vérifie) + `puces[]` (faits courts). Même forme pour
les AXES depuis v204 (« fonctionne en bullet point encore plus ») : constat court
en tête, puis chiffre, règle, geste en puces. Les `puces` sont rendues à l'écran
et exportées dans le JSON. Format imposé pour le patrimoine net : « 312 500 €
d'actif net, Monsieur x €, Madame y €, dont z € en commun. » Piège vu en
réécrivant : `profPrecLib` contient DÉJÀ les montants — ne pas les répéter à côté.

### Un locataire avec projet RP ne se voit plus « proposer » une RP (10/09/2026)
Le CGP : « tu es en train de lui expliquer qu'il peut s'acheter une RP alors même
qu'il t'a donné son projet à moins d'un an… ». `ncProjetRP(d)` (module, sur
`window`) chiffre le projet déclaré (`{actif, mens, ans, tx, apport, capital,
budget, chiffre}`) ; la carte « Capacité d'emprunt » d'un locataire AVEC projet
affiche ① le projet tel quel, ② la **place restante pour du locatif** (`capLoc`,
calculé sur `dispo35` qui porte déjà la mensualité du futur crédit RP) — c'est le
lead. Sans projet : jauge locatif, RP en ligne ②. Le point fort dit « Montant
finançable pour du locatif : Oui » et date le taux d'endettement (« avec le projet
RP » / « aujourd'hui »). Contrôlé dans `t_rp.js`.

### Le même effort partout (10/09/2026)
L'effort TOTAL de la projection comptait le locatif en BRUT (`effLoc = mensualité
− loyer net`) alors que la carte affiche l'effort RÉEL (`effAn(0)` : charges,
fiscalité, réduction) et que le solde annuel le retient aussi : « 584 € employés »
à côté d'une carte à 393 € et d'une alerte à 255 €. Règle : **une grandeur
affichée à plusieurs endroits sort d'une seule expression** — `effortBrut` lit
`effAn(0)` ; tuile, bandeau collant et alerte disent le même manque (le banc le
vérifie).

### Un dépassement d'enveloppe est une alerte, pas une perte (10/09/2026)
`treso(y)` capitalisait un solde NÉGATIF : les solutions dépassant l'enveloppe
amputaient le patrimoine « avec » (≈ −60 000 € à l'horizon, dossier Rami), et les
deux colonnes se rejoignaient. Décision D du CGP : seul un solde positif est
capitalisé, le manque s'affiche en alerte et se cherche dans les gisements.

### Une déduction n'est pas une réduction (10/09/2026)
Jeanbrun et Monument historique n'ouvrent aucune réduction d'impôt : ils
réduisent l'impôt SUR LES LOYERS (amortissement, déficit). Pour les montrer, on
recalcule la même opération en location nue classique (`foncNu`, mêmes loyers et
charges) : `ecoRegimeTot = coûtNu − coûtRégime`, moyenne annuelle intégrée à
« Impôt économisé par an » et ligne dédiée dans « Fiscalité de l'opération ».

### Livrets = 1,7 % (`tLiv`), JAMAIS 2,5 % (10/09/2026, v207)
Le CGP : « sur ses livrets il est parti pour avoir 1,7 % (et non 2,5 % comme je
te l'ai dit 10 000 fois, mets ça dans les skills) ». Tout ce que le client laisse
sur ses livrets — épargne de précaution, enveloppe « sans rien changer »,
versements non redirigés — capitalise à `tLiv` = 1,7 %, pleinement taxable en
succession, sans abattement de 152 500 €. `tAv0` (2,5 %) ne sert qu'aux
placements financiers EXISTANTS (AV, PEA…). Dans `NcProjection` :
`epargneAvant` à `tLiv`, `gainReallocation` mesuré contre `tLiv`, textes
« à gauche sur vos livrets (1,7 %) », cartes « 1,7 % → 5,2 % ». Le banc Rami
(`t_rami_proj.js`) relit ces chiffres. Toute nouvelle grandeur « avant » qui
capitalise doit lire `tLiv` — grep `tAv0` avant de livrer.

### Répondre au CGP sur le COMPORTEMENT, pas sur le code (10/09/2026, v206)
« Tu m'as confirmé cela et pourtant rien n'a changé !! pourquoi ? » J'avais
confirmé le défaut « — Choisir — » d'un nouveau placement en lisant le
placeholder du `<Select>` ; or `addList("avoirs", …)` créait la ligne avec
`type: "livrets"` — le placeholder n'était jamais affiché. Règle : **une réponse
au CGP se vérifie sur le comportement réel (harnais, banc, capture), jamais sur
la lecture d'un morceau de code**. Une fonctionnalité « confirmée » sans preuve
d'exécution coûte une demande de plus au cabinet. Corollaire : quand le défaut
devient vide, les suites qui saisissaient un placement (`t_rdv1`, `t_ordre_fiscal`)
doivent choisir le type explicitement.

### Succession : PER = assurance-vie, livrets et placements bancaires SANS abattement (10/09/2026, v207-v208)
« Dans avant, le client épargne sur des livrets, cela rentrera donc dans les
droits de succession, alors que là tu pars du principe que non ! » puis, tranché
en v208 : « je veux que le PER soit traité comme l'assurance-vie, ce sont les
livrets et autres placements bancaires qui ne doivent bénéficier d'aucun
abattement ». Règle portée par `ncCalcSuccession` (UN moteur pour le constat,
le RDV 1 et la projection) : `type === "av" || type === "per"` → `avHors`
(art. 990 I, 152 500 € par bénéficiaire, 20 % au-delà) ; le PER déclaré
seulement à l'étape Fiscalité (`d.reductionsPer`) rejoint aussi `avHors` ;
`livrets`, `compte_courant`, `pea`, `cto`, `epargne_salariale`, `autre` restent
dans l'assiette, sans abattement. Le dossier horizon du « sans rien changer »
range `epargneAvant` en `livrets` ; celui du « avec » range le nouveau PER en
`per` et la nouvelle AV en `av`. Libellés : « Transmis hors succession
(assurance-vie et PER) ». Banc 3 octies (attendu recalculé depuis la règle :
assiette 368 500 €, hors succession 90 000 €, validé par mutation). Sur Rami,
les droits « avec » restent un peu plus hauts à cause du locatif ajouté
(+158 k€ taxables) : effet réel, pas un bug.

### « Où trouver l'épargne » : le gain se lit par mois, sur la période, avec les taux (10/09/2026, v207)
« Que l'on puisse mesurer l'économie mensuelle et sur la période… comprendre
comment on fait cette économie (rendement avant 1,7 % et après x %). » Chaque
carte redirection / arbitrage porte un `effSub` (10,5 px) de la forme « + gain
sur H ans, soit ≈ X €/mois · 1,7 % → 5,2 % · capital avant → capital après au
lieu de Y ». Bloc compacté : intro d'une ligne, pieds courts, composant `Carte`
en `py-3`, `mb-2`, `lineHeight 1.9`. Le CGP veut « plus compact, plus lisible » :
un chiffre, sa cause, pas de phrase. **v213 (11/09)** : « on cherche de l'épargne
mensuelle… ce qui nous intéresse le plus est ce que le client va pouvoir
économiser tous les mois » — le **€/mois est le chiffre principal** de chaque
carte et de chaque famille (rendement : gain à l'horizon ÷ 12 ÷ H, « en
moyenne »), « soit + X € dans N ans » en second ; `Carte petit`, trois cartes sur
une ligne, plus de bandeaux `Fam` (composant conservé, inutilisé).

### Vocabulaire : « matelas » est interdit (10/09/2026, v206)
« Le mot matelas n'est pas très pro du tout. » Écrire « Épargne de précaution
recommandée » ; l'objectif s'intitule « Précaution — réserve de sécurité ».
Même famille bannie : tout mot familier ou imagé dans un texte remis au client.

### Coordonnées du conjoint (10/09/2026, v206)
Téléphone et email du conjoint (facultatifs) sont saisis dans le bloc conjoint,
juste avant « Nationalité du conjoint » — clés `d.conjoint.tel` et
`d.conjoint.email` (via `setAct("conjoint", …)`) — et rendus dans les tuiles de
coordonnées via la prop `sub`. Toute donnée d'identification du déclarant doit exister pour le
conjoint — vérifier la paire à chaque champ ajouté.

### La règle CSS `*` remet Inter sur les `<span>` d'un bloc en serif (11/09/2026, v209)
`* { font-family: 'Inter' … }` en tête du fichier s'applique à CHAQUE élément : un
`<span>` imbriqué dans un bloc dont la police serif (Fraunces alors, Lora depuis
v214) est posée en style inline n'hérite PAS — il repasse en Inter. PDF Bon/Riu :
« Madame Jeanne RIU » en sans à côté de « Monsieur Jean BON » en serif. Tout
enfant qui doit rester en serif porte `style={{ fontFamily: "inherit" }}`
(en-tête de la synthèse, page de garde de la projection). Même cause : les
valeurs des tuiles du foyer (« valeurs en serif », 28/08) sortent en Inter depuis
toujours — question posée au CGP (laisser Inter ou passer en serif), **ne pas
trancher seul**. Et Fraunces dessinait une ligature « ff » (« chiffres »)
refusée par le CGP : `font-variant-ligatures: none` dans la règle `*` (conservé).

### La police d'affichage est LORA, plus Fraunces (11/09/2026, v214 — décision D du CGP)
« Jacques », « projection » : le J / j de Fraunces est un glyphe à queue
(swash) dans TOUTES ses variantes (WONK 0, SOFT 0, opsz 144 compris) — ce n'était
pas un bug d'affichage, rien à corriger par CSS. Comparaison rendue avec les
polices npm (`@fontsource-variable/fraunces`, `@fontsource/lora`,
`@fontsource/playfair-display` — Google Fonts est bloqué par le proxy) : seule
**Lora** a un J sur la ligne de base (Playfair descend aussi). Le CGP a choisi
Lora sur l'image (« D ») : `<link>` Google Fonts ligne 46
(`Lora:ital,wght@0,400…1,700`), ~120 `fontFamily` (`'Lora','Playfair Display',serif`),
les `<text>` SVG, les classes `.pres-*`. **Fraunces ne doit plus revenir.**
Conséquences vues en livrant : Lora est plus haute que Fraunces — un
`lineHeight: 1.05-1.1` sous `overflow: hidden` coupe les jambages (tuiles
`Tuile` → 1.25, bandeau → 1.2 ; `t_deb_syn` l'a vu) ; Lora s'arrête à 700, un
`fontWeight: 800` retombe sur 700 (pas de gras synthétique, c'est voulu). Lora
est installée dans le conteneur (`/usr/share/fonts/truetype/google-fonts/`), donc
les captures et PDF locaux la rendent vraiment — les tests lisent `/Lora/` dans
les styles (`t_gisements`, `t_coord`, `t_proj_pdf`). Et la règle CSS `*` a
encore frappé : le `<span>` du conjoint sur la page de garde de la projection
sortait en Inter → `fontFamily: "inherit"` sur les spans imbriqués ; contrôle
dans `t_proj_pdf.js` (« noms du client et du conjoint en Lora »).

### Un PDF « coupé en bas » peut être un problème de FORMAT PAPIER (11/09/2026)
La pagination est calculée pour A4 (`@page { size: A4 }`, `pageDispo` =
1066 px / échelle). Le PDF du CGP était en **US Letter** (612 × 792 pt, `pdfinfo`) :
67 px de moins par page, la dernière rangée de chaque page touche le bord. Avant
de toucher à la pagination : `pdfinfo` sur le PDF reçu (Page size, Creator), puis
exporter le même dossier en A4 depuis le harnais et comparer. Deux issues
proposées au CGP (choisir A4 dans la fenêtre d'impression ; ou caler `pageDispo`
sur Letter) — en attente. Pour exporter le CONSTAT depuis Playwright, `t_coord.js` (et `t_proj_pdf.js`, même dossier Jean, onglet Projection → `export_proj_a4.pdf` ; attendre 1,5 s après le premier export avant le second, sinon le nettoyage du premier retire le mode impression)
stubbe `window.print` par une fonction qui LÈVE une erreur : le nettoyage du clone
(800 ms après) n'est jamais programmé et `page.pdf` peut être appelé deux fois
(A4 puis Letter). Un `page.pdf` après le délai imprime l'écran, pas le clone.

### Coordonnées en couple : « Monsieur : … » comme « Madame : … » (11/09/2026, v209)
Téléphone et Email portent la civilité du client dès qu'il est en couple
(`avecCiv`, dans les `phrases` de `ncSynthese`) ; célibataire : valeur seule. La
tuile Adresse, seule sans seconde ligne, descend sa valeur (`my-auto` dans une
tuile `flex flex-col`) pour équilibrer la rangée. Banc 3 nonies. v210 : la ligne
du conjoint (`sub`) a la MÊME taille que celle du client (12,5 px) — « mets
Monsieur et Madame à la même taille » ; `t_coord.js` compare les `fontSize`.

### Le constat est un ÉTAT DES LIEUX lu par le client (11/09/2026, v211)
Dossier Mars/Avril, six retours du CGP sur les points forts et les axes :
- **une hypothèse de calcul n'est pas un point fort** — « Loyers attendus
  ajoutés aux revenus retenus par la banque » (« en quoi cela est un point fort
  du dossier ?????? hors sujet complet ») : supprimé de « Capacité d'emprunt » ;
- **aucune phrase adressée au conseiller** dans un document que le client lit —
  « Milieu de la fourchette indiquée par le client : 300 – 500 €/mois » et
  « De quoi financer un projet structurant… » supprimés. « Capacité d'épargne
  déclarée » = la fourchette telle que déclarée (« 300 à 500 € mensuellement »,
  `CAP_LIB_F`), puis « Apport en numéraire de 10 000 à 30 000 € »
  (`NC_APPORT_LIB`, montant exact si `libre`, rien si `aucun`) ;
- **un chiffre par ligne** : « Patrimoine net significatif » = total en tête,
  puis puces « Monsieur : x € », « Madame : y € », « dont z € détenus en commun »
  (« je n'aime pas ces présentations où tu me fais une phrase avec plein d'infos
  à la queue leu leu ») — le format phrase du 10/09 est remplacé ;
- « Durée restante : 11,5 ans », jamais « 11,5 ans restants » ;
- « Épargne **insuffisante** au regard des revenus », jamais « très faible » ;
- **pas de préconisation dans le constat** : dans l'axe « Épargne long terme »,
  « droits de succession **en cas de décès** » et la puce « Placés en
  assurance-vie ou en PER… » supprimée. L'axe voisin « trésorerie beaucoup trop
  importante » garde la formulation exacte du 28/08 (abattement 152 500 €) tant
  que le CGP n'a pas tranché — question posée.
Banc 3 decies : dossier Mars/Avril reconstruit, chaînes attendues exactes.

### Axe « Capacité d'endettement non utilisée » : formulation EXACTE du cabinet (11/09/2026, v212)
Dossier Drouot, « je le trouve bien trop long ». Le CGP a dicté le texte, gravé
tel quel (deux retouches de forme : « permettrait », « investissement ») :
tête « Endettement à 14 % seulement » (+ « avec le projet RP » si projet), puces
« Votre capacité d'endettement vous permettrait de réaliser un investissement
locatif pour un montant de X € » (+ « une fois le projet RP financé »),
« L'effet de levier du crédit est indispensable dans une bonne gestion de
patrimoine », « Il vous permet de capitaliser dans le temps, tout en protégeant
vos héritiers en cas de décès » ; en union libre seulement, une ligne de
vigilance sur le concubin. **Supprimées DÉFINITIVEMENT** (décision du CGP) :
« Avant tout engagement : stress-test vacance locative, hausse des taux et
décès de l'emprunteur » — aussi dans la note union libre de la carte Capacité
d'emprunt — et « Utilisations possibles : préparer des revenus complémentaires
à la retraite, ou de futures donations ». Le banc 3 decies refuse toute
réapparition de « stress-test » / « Utilisations possibles » dans le constat.

### Constat, formulations EXACTES du 14/09/2026 (dossier Coconut, v215)
Dictées par le CGP, gravées telles quelles (banc 3 decies, chaînes exactes) :
- « **Épargne insuffisante au regard des revenus** — 65 500 € d'épargne pour
  15 334 € de revenus mensuels. » — UNE ligne, **aucune puce** (« Moins de six mois
  de revenus : une anomalie… » supprimée définitivement) ;
- « **Épargne long terme** — aucune épargne long terme : 65 500 € investis sur des
  livrets et comptes courants. » puis puces « Situation critique pour une gestion de
  votre épargne. » et « Rémunérés à peine plus que l'inflation, et frappés de plein
  fouet par les droits de succession en cas de décès » (« dorment », « Situation
  anormale » bannis ; la fin « droits de succession » reste conditionnée à des
  droits > 0, règle expert du 31/08) ;
- « **Moyenne des Français : 18 % des revenus, dont 9 % en épargne financière** » —
  le CGP l'avait demandé : les 18 % (INSEE) incluent le remboursement du capital
  des crédits, seuls 9 % sont de l'épargne financière ; ne jamais écrire « 18 % »
  seul ;
- « Plus de X € **d'impôt** sur 10 ans à situation constante » (axe Fiscalité subie).

### Projection v215 (14/09/2026, dossier Coconut) — logique de lecture
- **Page de garde** : plus AUCUN bandeau ni chiffre calculé — « d'où sortent les
  305 € ? il faut une logique de lecture ». Sous objectifs / préconisations, la
  phrase d'engagement sur le DÉCLARÉ : « L'engagement que vous souhaitez consacrer
  au développement et à l'optimisation de votre situation patrimoniale : 300 à
  500 €/mois et un capital de moins de 10 000 €. » (`data-nc-engagement`,
  `engagement.cap` / `.capJ` / `.ap`). Le bandeau enveloppe · employée · reste
  n'existe plus qu'en tête des solutions (`fixe`) et en bande collante à l'écran.
- **Bande collante** : pleine largeur, opaque, collée au bord haut du défilement
  (`top: -20` = `py-5` de la modale — Chrome cale le sticky sur la boîte de
  CONTENU du conteneur, pas sur son padding ; enfant absolu `left/right: -32` =
  `px-8`). Avant : elle flottait au milieu des cartes en les coupant.
- **« Où trouver l'épargne »** : sous les deux résumés, UN bloc qui additionne —
  « 238 €/mois d'épargne à réorienter » = trésorerie libérée + rendement ramené au
  mois (`data-nc-gisements-total`). Question ouverte : doit-il alimenter
  l'enveloppe (aujourd'hui seule la trésorerie réelle `ecoAss` y entre) ?
- **Base du « sans rien changer »** : `baseAvant = max(effort net an 1, envPoche)`
  — « 852 €/mois avec de l'immobilier et non 500 € ». Même argent des deux côtés :
  à gauche tout sur les livrets à `tLiv` ; à droite `finMens` (PER + AV) à `tMed`,
  le reste = effort de l'immobilier à crédit, plus le solde `treso` s'il existe.
  `gainReallocation` ne porte que sur `finMens`. Conséquence assumée : avec un gros
  locatif, la ligne « Placements financiers » peut être PLUS BASSE à droite — le
  patrimoine est dans l'immobilier ; c'est le total qu'on lit.
- **Complément de revenus mensuel « à vie »** : rente au rendement du support —
  `avPla × tLiv/12` à gauche, `natPla × tMed/12` à droite, + loyers nets. Avant,
  les deux colonnes utilisaient `tMed` (« tu as pris un complément de revenus qui
  n'est pas bon »).
- **Succession à l'horizon** : `nbBenef = nbEnfants` du dossier (étape Famille) ;
  il n'existe PAS de champ « bénéficiaires de la clause » (990 I) — question posée
  au CGP. Droits « avec » ≈ droits « sans » quand un locatif à crédit est ajouté :
  PER/AV nouveaux sortent de l'assiette (− 157 k€) mais le bien projeté y entre en
  PLEINE valeur (crédit soldé par l'assurance de prêt) — effet réel, à expliquer,
  pas un bug.

### Axes du constat : chiffre fort et phrase de verdict (14/09/2026, v216)
Le CGP a montré une analyse qu'il aime (accroche chiffrée, tableau CONSTAT | EFFET,
conclusion « le problème n'est pas fiscal, il est civil ») : « inspire-toi de cela
sans tout bouleverser ». Intégration MINIMALE dans l'outil : `ncChiffreFort(d)`
met en gras encre le premier chiffre de la phrase de tête de chaque axe ; un axe
peut porter `verdict` (une phrase, rendue en retrait avec un filet or, exportée
dans le JSON). Deux verdicts posés : « Le sujet n'est pas l'effort d'épargne,
c'est son affectation. » (Épargne long terme) et « Le problème n'est pas fiscal,
il est civil — c'est le chantier à traiter en premier, et il coûte quasiment
zéro. » (Partenaire / concubin sans droits). Pas de tableau CONSTAT | EFFET dans
l'outil ; le patron complet vit dans le skill métier (analyses écrites). Banc
3 decies vérifie le verdict de l'axe Épargne long terme.

### Le chiffre principal d'une carte est celui que le client encaisse (14/09/2026, v217)
Carte « Réduction sur versement » (étape Produit, `Step2Produit`) : le CGP a
demandé « l'économie générée en plus gros ». Règle générale : quand une carte porte
un pourcentage et un montant en euros, **les euros sont le chiffre principal**
(`text-3xl`, « 4 560 € économisés »), le pourcentage passe en second (« soit −51 %
de frais sur versement »). Pour capturer cette étape en test : `Nouveau client →
Fiche rapide → Suivant`, puis baisser le `input[type=range]` qui suit le label
« Frais sur versement » (sinon `reductionCommerciale = 0` et la carte n'existe pas).

### Le TEMPS COMMERCIAL commande le contenu des onglets (15/09/2026, v218)
Le CGP : « si on en dit trop au premier RDV, le client n'aura pas envie de nous revoir,
il se dira qu'il peut faire le job tout seul sur internet ». Onglets : **« Audit et
synthèse » · « Projection » · « Simulation et plan d'action »** (`synMode` reste
`constat` / `proj` / `preco` ; seuls les libellés et `VOLET` — le nom du fichier PDF —
changent). Le **RDV 1** porte : le foyer / l'immobilier / les placements, « Les chiffres
du dossier », la situation fiscale, puis deux chapitres créés pour lui — « Importance des
versements programmés » et « Pour préparer notre prochain rendez-vous ». Passent au
**RDV 2** (garde `if (synMode !== "preco") return null;` en tête de leur IIFE, rien n'est
supprimé) : transmission, objectifs exprimés + participation déclarée, points forts + axes
+ « Vos priorités ». Trois gardes couvrent ces quatre blocs (forces et axes partagent une
IIFE) — le banc 3 duodecies les compte.
- **Tableau des versements programmés** : lignes demandées par le CGP — épargne actuelle
  (`synth.ppMensuels`), capacité déclarée (borne haute de la tranche, cumulée si
  `reflexionPatrimoine === "separee"`), puis « un cran au-dessus » (palier suivant de
  `[100, 200, 300, 500, 750, 1000, 1500, 2000, 3000, 5000]`). Colonnes 1,7 % / 5 % / 7 %
  sur 15 et 20 ans, calculées par **`ncpCap`** (le moteur de la projection), jamais
  reprogrammées. Écrire les libellés de taux **à la main** (`"1,7 %"`) : `0.017 * 100`
  donne `1,7000000000000002 %`, parti en capture. Le mot **« effort » reste banni** du
  constat (`t_coord` l'attrape) : écrire « la même somme, placée autrement ».
- **Devoirs du client** : deux cases à cocher — estimation de retraite sur info-retraite.fr,
  puis onglet « Mon épargne retraite » → « Voir mes contrats » → copie d'écran.
- **Barème IR** : `axisMax` plancher à 200 000 € pour que la tranche à **45 %**
  (181 917 €) soit toujours visible.
- **Les suites qui lisent la synthèse doivent viser le bon onglet** : `t_rdv1`, `t_exp167`,
  `t_rp` et `t_coord` cliquent « Simulation et plan d'action » pour les assertions
  déplacées (helper `allerPreco()` / `TP`). Un FAIL après un déplacement de bloc n'est pas
  une régression du moteur — vérifier d'abord où le texte est rendu.

### Le document IMPRIMÉ n'est pas l'écran (15/09/2026, v219)
Le CGP, après impression papier : « le mode impression est vraiment très très laid ».
Quatre causes, toutes corrigées — et une leçon de méthode.
- **FAUX GRAS** : `pdffonts` sur le PDF exporté est le seul juge. Le lien Google Fonts
  chargeait `JetBrains+Mono:wght@400;500` alors que TOUS les titres de carte l'emploient
  en 700-800 : le navigateur fabriquait un gras synthétique, immonde sur papier. Charger
  les graisses réellement utilisées. **Réflexe : après toute retouche typographique,
  `pdffonts export_constat_a4.pdf`** — une police absente y apparaît remplacée
  (`DejaVuSans` = repli du conteneur).
- **Mes captures ne montraient pas ce que voit le CGP** : Google Fonts est bloqué par le
  proxy, donc Inter et JetBrains Mono tombaient en DejaVu dans TOUS mes rendus. Les polices
  sont désormais installées dans le conteneur (`npm @fontsource/inter`,
  `@fontsource/jetbrains-mono`, `@fontsource/lora` → `fontTools` woff2 → `~/.fonts` →
  `fc-cache -f`). À refaire si le conteneur est recréé, sinon on juge un rendu faux.
- **Page de présentation** en tête du constat ET du volet RDV 2, sur le modèle de la
  Projection (logo + nom du cabinet, filet doré, titre, noms, date, pied). Le bandeau
  d'écran porte `nc-syn-noprint` : sinon il fait doublon (mêmes noms, même date).
  Le premier bloc de contenu porte `data-nc-force-break="1"`.
- **Signatures** (`data-nc-signature`) en fin de document : « Fait à … le … » puis un cadre
  par personne — Monsieur, Madame (si couple) et le conseiller, dont le nom vient des
  réglages. Mention « Lu et approuvé » sous les cadres client.
- **Pied de page** : il existait déjà (`nc-print-footpage`, cabinet + conseiller +
  téléphone + email + adresse) mais **ne montre que ce qui est renseigné dans « Vos
  informations »** — un pied vide n'est pas un bug d'impression. `t_coord` remplit
  désormais `localStorage.figara_conseiller` pour que le PDF de test porte un vrai pied.
- **Point ouvert** : la numérotation des pages (« page X / Y ») — Chrome n'applique pas
  `@page { @bottom-center }`, il faudrait l'injecter depuis la pagination JS. Non fait.

### `t_coord.js` porte 4 assertions périmées depuis avant v212 (11/09/2026)
« maison Bretagne (titre, RS abrégé) », « placements groupés par détenteur »,
« crédit auto (titre) », « épargne scindée : Court terme / Long terme » sortent
en FAIL sur v212 comme sur v214 — vérifié en rejouant la suite sur
`git show 90db289:index.html`. Elles ne sont PAS dans `verif.sh` : ce ne sont pas
des régressions de la session, mais des attendus à réécrire ou à retirer sur
accord du CGP. Réflexe conservé : avant d'attribuer un FAIL à une modification,
rejouer la même suite sur la version livrée précédente.

### « Tu as réduit la fenêtre… » : prouver avant de toucher (11/09/2026)
Le CGP a vu le bloc « Détails (crédit, objectif de vente, note…) » des autres
biens réduit. `git log -S` sur le composant et sur le bloc : inchangés depuis
v69 ; rendu comparé v197 / v208 par capture (`t_shot_biens.js`) : mêmes
dimensions, replié et déplié. Réponse : les faits, une demande de capture, et
**aucune modification** — corriger un défaut qu'on ne reproduit pas, c'est en
créer un.

### Hoisting Babel `var` / `const` (3 fois)
Une `const` utilisée avant sa déclaration vaut `NaN` ou lève une erreur silencieuse
— une cible TNS jamais appliquée, deux alertes disparues ensemble parce que
`NaN >= 0` et `NaN < 0` sont tous deux faux. Vérifier l'ordre de déclaration dès
qu'un calcul rend `NaN` ou qu'un affichage conditionnel s'évanouit.

### Les boutons sont MASQUÉS à l'impression
`body.nc-print-syn #nc-print-holder button { display: none !important; }`. Tout
sélecteur en `<button>` **disparaît du PDF** : il doit exposer son état en texte
via `<span className="nc-print-only">`. Un `<select>` ne s'imprime avec sa valeur
que grâce à la recopie d'état du clone (voir le piège `cloneNode` plus haut).

### Un clic dans un champ ne doit pas basculer sa carte
Une `Carte` cliquable avec `onClick={toggle}` intercepte les clics des champs :
le CGP ne pouvait plus modifier montants et rendements. Ignorer tout clic dont la
cible est `input, select, button, label, textarea`, et poser `onMouseDown`
stopPropagation sur les champs.

### Un montant ne doit jamais se couper en fin de ligne
`Intl.NumberFormat` produit selon les moteurs une espace fine, insécable ou
ordinaire. Normaliser en U+00A0 (`ncNbsp`) dans TOUS les formateurs, et poser
`white-space: nowrap` sur les groupes « montant + unité » des phrases.

### Incohérence dimensionnelle dans une formule
« Gain de rendement » calculé comme `versement mensuel × écart de taux`
(300 €/mois × 0,2 %) : un versement multiplié par un taux ne veut rien dire. Le
résultat annonçait 1 €/mois là où le gain réel est de 30 312 € de capital.
**Toujours vérifier l'unité du résultat** : un gain de capital se calcule par
différence de capitalisation à l'horizon, pas par un produit d'un flux et d'un taux.

### Un drapeau global pour une propriété individuelle
`tns = tns || pp.tns` : un seul indépendant dans le foyer et le document annonçait
« travailleur non salarié » pour les deux, alors que le CALCUL, lui, était
individualisé. Suivre le statut PAR PERSONNE dès que le libellé le nomme.

### Champs déclarés mais jamais affichés
Des champs peuvent exister dans l'état sans aucune saisie à l'écran. Le banc le
détecte désormais ; ne pas retirer ce contrôle.

### Valeur résiduelle d'un champ masqué
Un champ caché par un changement de mode continue d'alimenter les calculs. Le
neutraliser ET masquer sa saisie — un champ visible mais neutralisé fait croire au
CGP qu'il doit le remplir.

### Chiffre mis en avant qui ne reflète pas le calcul
L'effort mensuel de l'année 1 était l'effort BRUT : il ignorait fiscalité et
réduction d'impôt. Un indicateur mis en avant doit être le résultat du moteur, pas
une formule approchée maintenue à côté.

### Montants non arrondis, alertes sur résidus d'arrondi
Un calcul intermédiaire non arrondi ressort tel quel dans un champ
(`415017.538 €`) : arrondir à la source. Un seuil `< 0` déclenche une alerte
« il manque 0 € » pour quelques centimes : poser une tolérance.

### Indentation des ancres, extraction de fonctions, résidus
Fonctions au niveau module : **4 espaces** ; code dans les composants : **8**. Une
signature déstructurée `function F({ a, b })` ferme le comptage d'accolades dès la
première : trouver d'abord la parenthèse fermante des paramètres. Couper jusqu'à la
« première occurrence » d'un motif laisse l'ancien bloc si le motif apparaît
plusieurs fois (`Unexpected token 'else'`).

### Le harnais isolé doit être régénéré ET complet
`regen_proj.py` : y déclarer toute nouvelle fonction `ncp*` et toute constante
(`ncNbsp`, `NCP_*`, `ncPensionFoyer`). L'ancre de tête doit couvrir **toutes** les
constantes réinjectées, sinon elles sont déclarées deux fois. Y recopier aussi les
règles CSS dont dépend le test (`.nc-ctitre`, `.nc-print-only`, règles
d'impression). Un harnais non régénéré teste une copie figée. Une fonction du
moteur appelée par la projection mais absente du harnais échoue EN SILENCE quand
elle est dans un `try/catch` (les lignes succession du tableau avaient disparu :
`NC_SUCC_TRANCHES is not defined`) — tester la fonction seule en
`page.evaluate` avant de conclure qu'elle rend `null`.

### La synthèse « Constat » n'a AUCUN harnais dédié (03/09/2026)
`_test_proj.html` / `t_gisements.js` couvrent `NcProjection`. `t_controle.js`
n'exerce que le MOTEUR (`window.ncSynthese`, `window.ncCalcFisc`…) via
`page.evaluate`, jamais le DOM du bloc synthèse (étape 8, `niveau === "complet"`)
— ni son en-tête, ni les tuiles, ni la fenêtre de correction. Une modification
purement visuelle de ce bloc (couleur, alignement, fenêtre modale) n'est donc
prouvée verte par `./verif.sh` que pour la NON-RÉGRESSION du reste (syntaxe,
moteur, autres écrans) — pas pour son propre rendu. Faute de harnais UI pour
cette page, vérifier au minimum : 1) que les fonctions pures utilisées sont
exposées sur `window` (elles le sont toutes, le fichier n'a pas de modules) et
leur donner des entrées réelles via `page.evaluate` (ex. `window.ncCapNom(...)`,
`window.ncSynthese(dossierExemple)` puis lire le texte produit) ; 2) relire le
JSX modifié pour confirmer qu'il réutilise un pattern DÉJÀ éprouvé ailleurs dans
le fichier (ex. la fenêtre `hypoOpen` pour toute nouvelle modale) plutôt qu'un
pattern inédit. Un harnais Playwright qui pilote réellement l'assistant jusqu'à
l'étape 8 (au lieu d'appeler le moteur directement) reste à construire — utile
si de nouvelles retouches de ce bloc se répètent. En attendant, `t_rp.js` pilote
l'assistant de bout en bout (locataire + projet RP) et lit le texte de
`.nc-syn-zone` : y ajouter les assertions qui concernent ce profil.

### Espaces insécables (`\xa0`) invisibles dans les old_string d'édition (03/09/2026)
Le code écrit couramment `${eur(x)} %` ou `"...80 %"` (espace INSÉCABLE
avant `%` ou `€`, pas un espace normal) — invisible à l'œil et dans un `Read`,
mais un `old_string` avec un espace normal ne matche PAS et échoue silencieusement
avec « String not found » même quand le texte affiché est identique. Réflexe : si
une édition contenant un nombre suivi de `%`/`€` échoue une fois de façon
inattendue, vérifier l'octet exact (`python3 -c "print(repr(...))"` sur la ligne)
avant de réessayer une troisième fois avec la même supposition. Pour une
réécriture de LIGNE entière, ancrer par regex sur le début de ligne
(`re.finditer(r'^      if \(…', s, re.M)`) en remplaçant ` %` / ` €` du motif par
`[\s  ]%` — c'est ce qui a permis de réécrire 17 axes d'un coup.

### Prénoms et civilité du conjoint : toujours passer par `ncCapNom` (03/09/2026)
`d.prenom` / `d.conjoint.prenom` sont stockés tels que saisis (souvent tout en
minuscules) et ne DOIVENT jamais être affichés bruts dans un document remis au
client — capitaliser avec `ncCapNom()` (module scope, gère aussi les tirets et
apostrophes : « jean-pierre » → « Jean-Pierre »). De même, la civilité du CONJOINT
ne se déduit PAS de celle du client : lire `(d.conjoint || {}).civilite`, avec
comme repli le sexe opposé à celui du client si absente. Le bug initial (en-tête
de la synthèse) affichait le conjoint sans aucune civilité et les deux prénoms
en minuscules — cf. BUILD v198.

### Un nombre de parts fiscales doit TOUJOURS passer par `.replace(".", ",")`
`F.parts` (ex. `2.5`) est un NOMBRE JS, pas un texte formaté : tout endroit qui
l'affiche doit faire `String(F.parts).replace(".", ",")`, jamais `${F.parts}`
brut — sinon le client lit « 2.5 parts fiscales » (point US) au lieu de « 2,5 ».
Un site avait déjà la bonne règle (branche union libre) le jour où l'autre
branche (couple non union libre) affichait encore le point — la coexistence des
deux formes dans le même fichier est un signal à chercher activement.

### `window.prompt()` est interdit dans un document remis au client (03/09/2026)
Trop exigu, non stylable, bloque tout le reste de la page pendant l'édition.
Pattern de remplacement, déjà en place pour la fenêtre `hypoOpen` (hypothèses de
capacité d'emprunt) et repris pour `editOpen` (correction d'un point fort/axe) :
un état `useState(null)` au niveau du composant racine de l'audit, une modale
`{etat && (<div className="fixed inset-0 z-[...] ...">...)}` rendue en sibling
JSX vers la fin du retour du composant, fermeture au clic sur l'overlay
(`onClick` sur le fond, `stopPropagation` sur la carte). Toujours choisir un
`z-index` supérieur à celui des modales déjà en place si les deux peuvent, en
théorie, coexister.

### Libellé de champ de SAISIE ≠ libellé de tuile en synthèse (03/09/2026)
La charte (`text-[10px] uppercase tracking-wider font-bold text-stone-400`,
réservée aux libellés de champ de saisie du formulaire cabinet) a été copiée par
erreur sur des libellés de TUILE dans le document remis au client (« État
civil », « Activité — Monsieur », « Le foyer », « Coordonnées », étape 8) : sur
un écran de saisie du conseiller, un gris presque invisible est acceptable
(lecture rapide, contexte connu) ; sur un document que le CLIENT lit, ça ne
l'est pas. Règle retenue : dans le bloc synthèse/PDF, un libellé de tuile passe
en encre pleine (`#1d2735`), jamais en `text-stone-400` seul — cf. la note déjà
ancienne sur `.nc-ctitre` (v179) pour les titres de carte, même principe
appliqué ici aux libellés plus petits qui n'ont pas droit au filet doré.

### « Apport 10 000 » lu comme 10 € (11/09/2026, v213)
`nb()` de `NcProjection` faisait `parseFloat("10 000")` → **10** : l'espace des
milliers coupait la lecture, « 10k » donnait 10 ; la tuile « Apport mobilisé »
affichait 10 € pour 10 000 saisis. `nb()` retire désormais espaces (y compris
insécables), « € », et accepte le suffixe « k » (× 1000). Contrôle 3 undecies
du banc : tape « 10 000 », « 10k », « 10000 » dans le champ Apport et lit la
tuile. Règle générale : **tout champ `Mini` reçoit ce que le CGP tape** — espaces,
virgule, « k » — jamais un `parseFloat` nu.

### 196 882 € de « placements financiers sans rien changer » (11/09/2026)
Le CGP recomposait 32 000 € de livret + 305 €/mois × 21 ans à 1,7 % et trouvait
53 342 €. L'outil donne 196 882 € = 32 000 × 1,017^21 (45 592 €) + **500 €/mois**
(l'enveloppe `envPoche`, décision du 02/09 « même effort des deux côtés ») × 21 ans
à 1,7 % (151 290 €). Les 53 342 € du CGP correspondent à 305 € **par an**
(32 000 + 305 × 21 = 38 405 € versés + 14 937 € d'intérêts) ; 104 507 € à 5,2 %
de même. Quand un chiffre est contesté : recalculer avec `ncpCap` (capitalisation
mensuelle, `(1+t)^(1/12) − 1`), décomposer, et dire quelle base l'outil prend.
Question laissée ouverte au CGP : « sans rien changer » capitalise l'enveloppe
entière (500) ou seulement la part employée (305) ?

### v242 (19/09) — UNE CARTE FLEX SEULE SUR SA LIGNE S'ÉTIRE SUR TOUTE LA LARGEUR

Le CGP : « dans les blocs capacité d'emprunt et financier, fais-les sur la
moitié de la page et pas sur toute la largeur ».

Les quatre compteurs des « chiffres du dossier » vivent dans `.nc-duo`, un
conteneur `flex-wrap`, où chaque carte valait `flex: 1 1 calc(50% - 6px)`.
**`flex-grow: 1` est un piège différé** : tant que les cartes vont par deux,
chaque ligne est pleine et personne ne voit rien. Mais la pagination coupe la
rangée quand la page est finie — et si elle coupe entre la 3e et la 4e carte,
la 3e reste SEULE sur sa ligne et la 4e part SEULE dans la rangée sœur. Une
carte seule sur sa ligne, avec `flex-grow: 1`, prend toute la largeur : donut
collé à gauche, légende jetée à droite. C'est exactement ce que le CGP a vu.

`flex-grow` passe à **0** : `.nc-duo > * { flex: 0 1 calc(50% - 6px); min-width: calc(50% - 6px); }`
Une carte vaut une demi-page, seule ou non.

**MESURE** (à refaire à chaque doute, en média `print`, sur le clone) : on
clone la rangée à vide, on y déplace la dernière carte, on mesure sa largeur.
Avec le correctif : 352 px sur 758. Avec `flex-grow: 1` réinjecté par une
feuille de style de test : 713 px. Le contrôle vaut d'être écrit ainsi — il
prouve la cause au lieu de la supposer.

**Règle générale** : dans ce fichier, tout conteneur `flex-wrap` dont le nombre
d'enfants peut devenir impair, ou que la pagination peut couper, doit porter
`flex-grow: 0`. Les intercalaires d'impression (`.nc-print-break`,
`.nc-pied-physique`, `.nc-print-air`) gardent `width: 100%` et ne sont pas
concernés.

### v242 (19/09) — INFO-RETRAITE.FR EN PASTILLE ENCADRÉE

Le CGP : « dès que tu parles d'info-retraite, fais un encadré comme un bouton
afin de le rendre plus visible ». Dans le bloc des pièces à réclamer, la
constante `SITE` n'est plus un simple `<b>` rouge mais une pastille :

```jsx
const SITE = (
  <b style={{
    display: "inline-block", color: "#b91c1c", background: "#fef2f2",
    border: "1.5px solid #b91c1c", borderRadius: 6,
    padding: "1px 7px", lineHeight: 1.35, whiteSpace: "nowrap",
  }}>info-retraite.fr</b>
);
```

`inline-block` et non un vrai `<button>` ni un bloc : le document part à
l'impression, la pastille doit couler dans la ligne sans casser la
justification ni provoquer de débordement horizontal (cf. l'incident du
`white-space: nowrap` de la v240 — ici le `nowrap` ne porte que sur douze
caractères, il est sans risque).

Les mentions en NOTE DE BAS DE BLOC (10,5 px italique, « Montants relevés sur
info-retraite.fr ») ne sont PAS encadrées : une pastille dans une note grise
serait plus lourde que lisible. Point à rouvrir avec le CGP s'il le demande.

### v242 (19/09) — LES DEUX CARTES DU CABINET ENTRENT DANS L'AUDIT

Le CGP : « dans l'audit, inclure dans le chapitre objectifs et questions, juste
après les objectifs exprimés et la participation mensuelle, le tableau qui est
dans le document simulation et plan d'action page 5 : les objectifs recommandés
par le cabinet et les préconisations, sans changer la suite de l'audit ».

**RENVERSEMENT ASSUMÉ DE LA RÈGLE DU 15/09.** Les deux cartes larges
(« Objectifs recommandés par le cabinet », `#0f766e` ; « Préconisations »,
`#6d28d9`) étaient réservées au RDV 2 par un filtre `synMode === "preco"`. Ce
filtre disparaît :

```js
const largeVisibles = syn.resume.filter(it => it.large);
const objExp = largeVisibles.find(it => it.t === "Objectifs exprimés" || it.t === "Objectif exprimé");
const autresLarges = largeVisibles.filter(it => it !== objExp);
```

Les trois seules entrées `large: true` de `syn.resume` sont ces deux cartes plus
« Objectifs exprimés » — il n'y a donc aucun effet de bord.

**LE BANC VÉRIFIAIT L'ANCIENNE RÈGLE.** `t_controle.js` (étape 3, section
« TEMPS COMMERCIAL ») exigeait littéralement
`const autresLarges = synMode === "preco" ? largeVisibles`. Son assertion est
RETOURNÉE : elle interdit désormais ce filtre et exige la présence des deux
cartes. **Leçon** : quand le CGP renverse une règle, le banc qui la gardait
doit être retourné dans le MÊME commit, sinon la livraison passe au rouge sans
qu'aucun défaut n'existe.

### v243 (20/09) — BRANCHER UNE DONNÉE DÉJÀ SAISIE : LA QUOTITÉ D'ASSURANCE

Le CGP : « au niveau des crédits on informe systématiquement si le prêt est
assuré à 100 % sur chaque tête ou autre. Pourtant dans tes analyses
postérieures, tu réagis comme si tu n'étais pas au courant alors que tout a été
renseigné. »

**LE DÉFAUT-TYPE À CHERCHER PARTOUT** : un champ existe à la saisie, il est
stocké, et un seul consommateur le lit — celui qui signale son ABSENCE. Ici la
quotité était lue uniquement par la liste des pièces à réclamer, pour dire
« nous ne savons pas ». Tout le reste du logiciel continuait d'écrire
« quotités à vérifier ». **Avant de poser un nouveau champ, vérifier que
l'ancien est branché.**

Trois fonctions partagées, au niveau module, à côté de `ncTit` :

- `ncQuotPart(code, enCouple)` → `{ client, conjoint }` en fractions, ou `null`
  si la quotité est inconnue (`nsp`, champ vide). Hors couple → `{1, 0}` : le
  champ n'est même pas posé à la saisie, la quotité vaut 100 % par construction.
  Codes : `100_100`, `100_client`, `100_conjoint`, `50_50`, `70_30`, `30_70`.
- `ncQuotDefaut(d)` → la plus forte part assurée sur une tête, tous prêts en
  cours confondus ; 100 si rien n'est connu. Sert de valeur de départ au
  curseur de la projection, qui valait 100 en dur.
- `ncQuotitesConnues(d)` → `false` dès qu'un prêt en cours a une quotité
  inconnue. C'est LA condition qui autorise encore la formule prudente.

**LA RESTRUCTURATION DE `ncCalcSuccession`.** La dette était NETTÉE dans le
patrimoine dès la saisie (`ventS(valeur − crd, …)`) : impossible ensuite de
savoir quelle tête l'assurance couvrait. Chaque dette est désormais une ligne
de `dettes[]` : `{ part: { client, conjoint }, q: ncQuotPart(...) }`. Deux
lectures en découlent :

```js
const detteDe = (qui) => dettes.reduce((s, x) => s + x.part[qui] * (1 - (x.q ? x.q[qui] : 0)), 0);
```

**RÈGLE ARBITRÉE AVEC LE CGP (20/09/2026)** : au décès, le prêt assuré sur la
tête du défunt est SOLDÉ à hauteur de sa quotité — sa dette ne se déduit plus
de son actif transmissible. En 50/50, la moitié s'éteint. Quotité inconnue →
rien ne s'éteint (lecture prudente), et c'est le seul cas où « quotités à
vérifier » garde son sens.

L'ordre de l'article 768 est conservé : l'abattement de 20 % (art. 764 bis)
porte sur la valeur vénale de la RP, les dettes se déduisent ENSUITE — mais la
dette déduite est celle qui SURVIT à l'assurance.

**MESURES DE RÉFÉRENCE** (banc `t_quotites.js`, étape 15/16), couple marié,
RP 400 000 € détenue à 50/50, crédit 200 000 € :

| quotité | soldé | restant | actif transmissible du client |
|---|---|---|---|
| inconnue | 0 € | 100 000 € | 58 500 € |
| 50/50 | 50 000 € | 50 000 € | 108 500 € |
| 100 % sur chaque tête | 100 000 € | 0 € | 158 500 € |
| 100 % conjoint | 0 € | 100 000 € | 58 500 € (inchangé) |

Chaque volet de succession porte `detteSoldee`, `detteRestante` et
`quotitesConnues` : le document affiche le chiffre au lieu de la formule.

### v243 (20/09) — L'ÉCONOMIE MENSUELLE D'UN GISEMENT EST UN ÉCART D'INTÉRÊTS

Le CGP : « les vraies économies sont le calcul des intérêts placés à 1,7 % vs
5,2 %, le capital ne doit pas rentrer dans le calcul ».

Ce qui s'affichait en €/mois sur « Arbitrage du capital placé » et
« Redirection des versements » était **le capital supplémentaire à l'horizon
divisé par le nombre de mois** (`gainArbCap / (12 × H)`). Un gain composé sur
vingt ans ramené à une moyenne : il ne correspond à aucun euro gagné dans le
mois, et il GROSSIT quand on allonge l'horizon — un chiffre qui bouge quand on
change une hypothèse sans rapport est toujours suspect.

Règle définitive :

```js
const ecartArb = Math.max(0, tMed - txArbAct);
const ecartRed = Math.max(0, tMed - txVersAct);
const ecoArbAn = montArb * ecartArb;            // arbitrage : un CAPITAL déjà là
const ecoRedAn = (versMens * 12) * ecartRed;    // redirection : ce qui aura été VERSÉ dans l'année
const mArb = ecoArbAn / 12, mRed = ecoRedAn / 12;
```

**L'assiette de la redirection est une décision du CGP (20/09/2026)** : un
versement mensuel n'est pas un capital, on applique l'écart de taux à ce qui
aura été versé sur douze mois. (L'encours moyen — la moitié du versé — a été
écarté.)

Le capital supplémentaire à l'horizon (`gainArbCap`, `gainRedCap`) reste
calculé et garde sa place en seconde ligne : c'est une information juste, ce
n'est simplement pas une économie mensuelle.

### v243 (20/09) — PARTAGER UN BLOC ENTRE LA SYNTHÈSE ET NcProjection

« Objectifs exprimés + participation » et « points forts + axes » vivaient au
milieu du JSX de la synthèse. `NcProjection` est un composant SÉPARÉ : il ne
pouvait pas les atteindre, et les recopier aurait créé deux jeux de libellés à
tenir à jour.

Solution retenue, la moins risquée dans un mono-fichier : **hoister le corps
des deux IIFE en deux fonctions de rendu du composant parent**
(`rendreObjectifsParticipation`, `rendreForcesAxes`), puis les passer à
`NcProjection` en props tout rendues (`blocObjectifs`, `blocForces`). Elles ont
besoin de `set` et de `setEditOpen` — les corrections à l'écran (✎ ✕ ↑ ↓) —
qui n'existent que dans le parent : un composant à part aurait demandé de faire
descendre ces deux fonctions.

Pièges rencontrés en le faisant :

- **Le `return (` d'une IIFE ne rend qu'UN élément.** Ajouter un bloc frère
  après la page de garde casse la compilation (`Unexpected token, expected ","`).
  Envelopper dans un fragment : `return (<>…</>);`.
- **Deux `data-nc-chap` imbriqués = un chapitre fantôme** en mode présentation.
  Le bloc partagé porte déjà sa marque : `rendreObjectifsParticipation` prend un
  paramètre `chapitre` (passé à `null` pour l'Analyse R2), et le conteneur des
  points forts ne reçoit AUCUNE marque de son appelant.
- **Un banc qui clique `›` doit re-chercher le bouton à chaque tour** : React le
  re-rend au changement de chapitre, et cliquer un nœud détaché n'avance plus.
  `t_presentation.js` avançait « de deux chapitres » en dur — un compte qui ne
  survit à aucun réordonnancement. Il avance maintenant JUSQU'AU premier
  chapitre qui porte des champs.

**LE RÉFLEXE QUI A SERVI TROIS FOIS CE JOUR-LÀ** : renommer un onglet casse tous
les bancs qui le cliquent par son libellé (`t_rdv1`, `t_rp`, `t_exp167`,
`t_coord`, `t_presentation`, `t_pres_probe`, `t_sticky_app`). Après un
renommage : `grep -rn 'has-text("<ancien libellé>")' t_*.js`.

Et : **`regen_proj.py` doit connaître toute nouvelle constante de module
utilisée par `NcProjection`**, sinon `_test_proj.html` lève un
`ReferenceError` que seul le banc de contrôle voit. La liste des motifs est en
tête du script.

### v244 (21/09) — CE QUE LES GISEMENTS TROUVENT GROSSIT LE BUDGET DU CLIENT

Le CGP : « si le client souhaite mettre entre 300 et 500 €/mois et que l'on a
été chercher 250 € de trésorerie supplémentaire, il faut que son budget mensuel
passe de 550 à 750 €/mois grâce aux renégociations, et que cela se voie. »

Avant : `ENV = envPoche + ecoAss` — seule la délégation d'assurance entrait, et
sur la seule borne HAUTE. La fourchette affichait donc « 300 à 750 », jamais
« 550 à 750 ». Arbitrage et redirection n'entraient nulle part.

Maintenant, dans le moteur de `NcProjection` :

```js
const gainsMens = ecoAss + ecoArbAn / 12 + ecoRedAn / 12;   // les TROIS leviers cochés
const ENV       = envPoche  + gainsMens;                    // borne haute
const envBasTot = envBasEff + gainsMens;                    // borne basse — elle monte aussi
```

**Piège d'ordre** : l'enveloppe est calculée bien AVANT les cartes des
gisements. Les écarts d'intérêts (`ecoArbAn`, `ecoRedAn`, et leurs `…Pot`) ont
donc été remontés juste après les entrées (`redActif`) ; l'ancienne définition
près des cartes a été supprimée (doublon → `Identifier has already been
declared` sinon).

Affichage :
- bandeau vert **« Votre nouveau budget mensuel »** (`data-nc-budget-final`)
  juste après « Où trouver l'épargne », seulement si `gainsMens > 0` :
  fourchette augmentée, part de la poche, montant trouvé, détail par levier ;
- le bandeau des solutions : fourchette `envBasTot à ENV`, sous-ligne
  « X à Y de votre poche + Z trouvés par les gisements », item « Trouvé »
  (ex-« Libéré », qui ne comptait que la délégation).

**Le tableau avant / après n'est PAS touché** : il part de
`baseAvant = max(effort, envPoche)`, sans les gisements, qui y ont leur ligne
propre (`gainRendCap`). Les faire entrer dans `baseAvant` compterait deux fois
le même gain. À revoir avec la refonte du tableau.

Banc : `t_budget.js` (étape 16/17). Il réutilise la saisie de `t_proj_pdf.js`
(coupée à l'ouverture de l'onglet, puis `eval`) et recalcule l'attendu depuis la
règle avec les valeurs LUES dans les champs. Mesure de référence : fourchette
500 à 1 000, délégation 37 € + arbitrage 360 € → 897 à 1 397 €/mois.

**Remonter jusqu'au conteneur d'une carte de gisement** : le titre est dans un
`<label>` qui contient déjà la case à cocher. Monter « jusqu'à trouver une case »
s'arrête au label, qui n'a aucun champ. Monter jusqu'à trouver AU MOINS DEUX
champs non-case.

### v244 (21/09) — UN BANDEAU COLLANT N'A RIEN À FAIRE SUR LA PAGE DE GARDE

Le CGP : « lorsque l'on arrive sur le document, je ne veux pas voir le bandeau
de son épargne au tout début, ça n'a pas de sens ! »

Le bandeau collant enveloppe · employée · reste s'affichait dès l'ouverture de
l'onglet, par-dessus la page de garde. Il est désormais caché tant que la
section « Où trouver l'épargne » n'a pas été atteinte :

```js
const io = new IntersectionObserver(([e]) => {
  setBarPret(e.isIntersecting || e.boundingClientRect.top < 0);   // atteinte OU dépassée
}, { threshold: 0 });
```

et `visibility: (barVu || !barPret) ? "hidden" : "visible"`.

**Le témoin est la section elle-même** (`ref={seuilBarRef}` +
`data-nc-bar-seuil`). Une première version posait une `<div>` vide de 1 px :
le mode présentation la comptait comme un BLOC, et son contrôle « tous les
blocs sont revenus » tombait à 8/9. **Ne jamais ajouter d'élément vide comme
enfant direct d'un document paginé ou présentable** — accrocher le ref à un
élément qui existe déjà.

### Verrous git laissés par le commit précédent

Le commit v244 a d'abord échoué : `cannot lock ref 'HEAD': Unable to create
'.git/HEAD.lock': File exists` — un `HEAD.lock` laissé par le commit v243
(device_bash ne peut pas supprimer). **Déplacer les verrous AVANT le commit,
pas seulement après** :

```sh
mkdir -p _to_delete/lkNNN
for f in .git/HEAD.lock .git/index.lock .git/refs/heads/main.lock .git/refs/heads/demo.lock; do
  [ -e "$f" ] && mv "$f" _to_delete/lkNNN/$(basename $f).$(date +%s%N)
done
```

et recommencer entre `update-ref main` et `update-ref demo` : chaque
`update-ref` en laisse un nouveau.

### v245 (21/09) — LES QUATRE CLIENTS TYPES DE LA VERSION DÉMO

Le CGP : « est-ce qu'il est possible d'enregistrer deux ou trois clients types
afin que je ne doive pas systématiquement re-remplir tout de A à Z ? Un
célibataire, un pacsé, un marié, un veuf. » Fiches proposées PAR ÉCRIT, validées
par le CGP (« parfait ») AVANT d'être codées.

- `NC_CLIENTS_TYPES` (à côté d'`AUDIT_DEFAUT`) : Thomas MARTIN, Julie et Nicolas
  LEROY, Philippe et Catherine DURAND, Monique BERNARD. Âges et années de
  naissance calculés depuis l'année en cours (`ncDateNaiss`), pour que les âges
  restent vrais dans deux ans.
- `NC_CT_COMMUN` : les réponses que l'audit pose à tout le monde
  (`adresseQ`, `pensionQ`, `mobiliersQ`, `reductionsQ`, `impotQ` = « non »).
  **Sans elles, la règle cabinet du 29/08 (une question sans réponse = pas de
  page suivante) bloquait l'accès à la synthèse dès la page 1.** Trouvées par une
  sonde qui parcourt les sept pages et relève les `[data-ncq="manque"]` visibles
  — la méthode à réutiliser pour tout nouveau client type.
- `chargerClientType` : `AUDIT_DEFAUT` puis la fiche par-dessus, avec fusion CLÉ
  PAR CLÉ de `objectifsDetail`, `conjointRev` et `conjoint` (une fiche qui ne
  décrit qu'un objectif ne doit pas effacer la structure des autres).
  `window.confirm` si une saisie est en cours — les bancs posent
  `page.on('dialog', d => d.accept())`.

**VERSION DÉMO SEULEMENT, SANS CASSER LE CONTRÔLE « 1 1 0 0 ».** La branche demo
substitue l'identifiant Supabase au commit ; le contrôle exige que chaque
identifiant complet apparaisse exactement une fois. `NC_DEMO` ne lit donc que le
PRÉFIXE du projet démo (`SUPABASE_URL.indexOf("liudyjdd")`) : ni la branche main
ni la branche demo ne voient changer leur décompte. Les bancs forcent l'affichage
par `page.addInitScript(() => { window.__NC_FORCE_DEMO = true; })`.

**UNE FICHE VALIDÉE PEUT ÊTRE FAUSSE — LE MOTEUR A RAISON.** La fiche des Durand
annonçait une TMI à 41 %. 147 600 € de revenus sur 4 parts tombent à 30 % : le
moteur le calcule. La TMI n'est PAS forcée (`tmiManuel`), même dans un dossier de
démonstration, et le CGP en a été averti. Le banc compare la question bonus à la
TMI LUE dans le bloc fiscal, jamais à un chiffre écrit en dur.

Banc `t_clients_types.js` (étape 17/18) : absents en production, les quatre se
chargent, la synthèse s'ouvre sans blocage et fait sortir ce pour quoi chaque
fiche a été bâtie.

### RÈGLE DE LIVRAISON — NE PAS NOYER LE CGP SOUS LES FICHIERS (21/09)

Le CGP : « pourquoi tu me mets à chaque fois des tonnes de trucs à télécharger et
ouvrir ? » Chaque version envoyait dans la conversation `index.html`, deux PDF de
contrôle, des captures et les deux skills — alors que tout était déjà écrit dans
son dépôt et dans Téléchargements.

- **Seul `index.html` passe par la conversation** : `device_commit_files` exige
  un `fileUuid` issu de `SendUserFile` (le chemin `stagedPath` sous
  `/mnt/user-data/outputs/` est refusé : « No such file … in this session »).
  Un seul fichier, `display: "attach"`, légende « rien à ouvrir ».
- **Les captures et PDF de contrôle restent dans l'espace de travail** : ce sont
  des vérifications, pas des livrables.
- **Un PDF ne part que s'il y a une mise en page à regarder**, un seul, et on le
  nomme.
- **Les skills partent UNE fois, en fin de session**, dans un seul envoi.

### v246 (21/09) — LE CGP TRAVAILLE EN `file://`, PAS SUR LE SITE DE DÉMO

« Je ne vois toujours pas ! » — son URL : `file:///Users/sylvainquere/Documents/GitHub/simulateur-figara/index.html`.
Il ouvre le fichier de la branche **main** (production) directement depuis son
dossier : une fonction réservée à la démo lui est donc INVISIBLE. `NC_DEMO` est
vrai aussi quand `location.protocol === "file:"` ; servi par figara.fr (https),
jamais. Banc : `t_clients_types.js` charge `test_local.html` en `file://`.

**Deux réflexes en tirent :**
- avant de dire « c'est en ligne », vérifier que c'est POUSSÉ :
  `git rev-list --count origin/main..main` et `origin/demo..demo` sur le Mac.
  Au 21/09, 15 commits (v231 → v245) n'avaient jamais été poussés : le CGP
  testait sur son fichier local, pas sur le site ;
- ne jamais mettre de numéros de commit ni de texte hors commande dans un bloc
  que le CGP colle dans le Terminal (`zsh: command not found: main`). Le bloc à
  copier ne contient QUE les commandes.

### v247–v248 (21/09) — CORRECTIONS DU CONSEILLER, ET LE MOTEUR QUI SE PROJETTE

**Camemberts jumeaux (v247).** Deux `NcDonut` côte à côte dans une carte d'une
demi-page laissaient une colonne de quelques pixels à chaque légende (« Crédit
auto 1 » une lettre par ligne) ; la carte montait à 400 px et l'égaliseur étirait
les cartes de la page suivante. `NcDonut` prend `vertical` : anneau en haut,
légende dessous. Ne se voyait qu'avec un projet RP (ou un crédit qui se termine) :
**relire l'impression des clients types, pas seulement du dossier de test.**
`t_pdf_type.js celib` imprime le document d'un client type.

**Corrections du conseiller (v247).** `d.docEdits` = `{ clé: { t, hide } }`,
`d.docAjouts` = `{ obj: [], preco: [], q: [] }`. Clé d'une ligne = `zone::` +
début du texte coupé au premier chiffre (les montants bougent) ; clé d'une
question = sa famille. Composants `CtlDoc`, `CtlAjout`, `AjouterLigne`, marqués
`data-nc-doc-ctl` / `data-nc-doc-ajout` : cachés en présentation (`body.nc-pres`),
retirés du clone d'impression. La fenêtre `editOpen` accepte `onSave`. Un banc qui
lit le document « comme le client » doit masquer `.nc-syn-noprint` avant
`innerText` (cf. `t_shot_pres.js`). Banc `t_doc_edits.js`.

**Le moteur se projette (v248).** Dans `ncSynthese`, bloc « RAISONNER APRÈS
L'ACHAT » : `pRPsyn`, `apportRPsyn`, `epargneImmo` (capital remboursé le 1er mois :
mensualité − capital × taux/12), `creditsEnCours`, `recentre = capLocMax < 80000
&& (projet RP chiffré || crédits en cours)`. `courtTermeM` est désormais le court
terme APRÈS l'apport. Le point fort, l'objectif et la préconisation « capacité »
exigent `!projetRPsyn || capLocMax >= 80000`. Si `recentre`, forces, faiblesses,
problématiques, cartes du cabinet et questions sont REMPLACÉES juste avant le
retour. `syn.incoherences` alimente la fenêtre `data-nc-inco` ouverte par
`goEtape` en quittant l'étape 6 (une fois par liste, `incoVu`). Les bancs qui
cliquent « Synthèse » depuis un client type franchissent cette fenêtre par
« Continuer quand même ». Banc `t_recentre.js` (étape 19/20).

**Piège :** `S.epargne` n'existe pas — l'épargne constituée est
`S.epargneConstituee` (locale `epargne` dans `ncSynthese`). Le banc l'a vu :
« il ne resterait que 0 € d'épargne ».

### v249 (21/09) — « JE T'AI DEMANDÉ DE SUPPRIMER… » : CHERCHER TOUTES LES OCCURRENCES

La v247 avait retiré « Sortie totale de trésorerie » du document, mais la même
ligne vivait aussi dans la carte « Coût global de l'opération » de l'écran de
saisie — c'est celle-là que le CGP voyait. **Quand il demande de supprimer un
libellé : `grep -n` sur tout le fichier et traiter CHAQUE occurrence**, écran
compris, sauf consigne contraire explicite. Le banc `t_rp` contrôle les deux.

Aussi en v249 : bloc compact `data-nc-epargne-apres-rp` (une ligne, barre de
8 px, curseur) — la version haute faisait déborder le chapitre Épargne et
laissait une page au tiers : **tout bloc ajouté se relit à l'impression d'un
client type** (`node t_pdf_type.js celib`). « Le financier » en jumeaux avant /
après via `ncProjetRP(d)`. Règle des 25 % : `data-nc-regle-25` sous la carte
capacité (si `synth.taux > 0,25` et `capLoc > 0`), et suffixe de la préconisation
locative. Pour un banc, répondre « Non » à une question précise :
`page.locator("text=<libellé>").first().locator('xpath=following::button[normalize-space()="Non"][1]')`.

---

## LE MODE PRÉSENTATION (écran de rendez-vous) — v220

Décision du CGP du 15/09/2026 : **« Écran = présentation, PDF = impression »**.
Deux sorties, un seul document — l'écran ne reconstruit rien.

**Choix validés par le CGP, à ne pas rouvrir seul** : navigation CHAPITRE PAR
CHAPITRE en plein écran ; disponible sur les TROIS volets ; la page de garde est
l'écran d'ouverture ; **tout reste manipulable** (cases à cocher, classement des
priorités, corrections en ligne) — c'est un écran de travail à deux, pas une
projection figée.

### Le mécanisme, et pourquoi il est ainsi

- **Aucun bloc n'est déplacé ni dupliqué.** Les chapitres sont des rangées de
  blocs qui existent déjà. Un bloc porteur de `data-nc-chap="Titre"` OUVRE un
  chapitre ; les blocs suivants sans marque le COMPLÈTENT.
- Les chapitres sont **lus dans le DOM réel** (`useEffect` + `MutationObserver`
  sur `.nc-syn-zone`), jamais déduits du code : c'est la seule façon de rester
  juste quand un bloc est conditionnel (transmission, profil de risque,
  protection du conjoint, notes du rendez-vous).
- Le masquage est écrit **à la volée** par la barre de présentation, dans un
  `<style>` : `…> *:not([data-nc-pres-keep]):not(:nth-child(n+A):nth-child(-n+B))
  { display: none !important; }`.
  **Ne JAMAIS redéfinir `display` sur un bloc montré** : `display: revert`
  ramènerait un `grid`/`flex` Tailwind à `block` et casserait la mise en page.
  On masque les autres, on ne « ré-affiche » jamais.
- Attributs, tous posés en JSX (donc gérés par React, ils survivent au rendu) :

  | Attribut | Sur quoi | Rôle |
  |---|---|---|
  | `data-nc-pres-host="1"` | le conteneur du volet (`div.mb-5`) et la racine de `NcProjection` | ses enfants directs sont les blocs à découper |
  | `data-nc-chap="Titre"` | un bloc de premier niveau | ouvre un chapitre, et donne son titre à la barre |
  | `data-nc-pres-keep="1"` | bandeau collant de la Projection | toujours visible, hors découpage |
  | `data-nc-pres-skip="1"` | bandeau d'écran, signatures, mentions légales | jamais présenté (pièces d'impression) |
  | `data-nc-pres-ui="1"` | la barre elle-même | exclue de tous les masquages |

- Habillage : classes `nc-pres-root` / `nc-pres-card` / `nc-pres-scroll` ajoutées
  conditionnellement sur la modale, et `body.nc-pres` pour le CSS. L'en-tête, le
  fil d'Ariane, le pied de fenêtre, la pastille « étape 8 / 8 » et le bouton
  Bloc-notes sortent de l'écran.
- Un chapitre court est **centré verticalement** par `margin: auto` dans un
  conteneur `flex column` — surtout pas `justify-content: center`, qui tronque un
  chapitre plus haut que l'écran.
- `min-height: 0` sur la page de garde : elle est dimensionnée pour une feuille
  A4 (1040 px) et laisserait sinon un grand vide sous le titre.
- Clavier : `←`/`→` et `Page préc.`/`Page suiv.` changent de chapitre, `Début`/`Fin`
  vont aux extrémités, `Échap` sort **toujours** (seule issue clavier, elle ne
  dépend pas du curseur). **`↑`/`↓` restent au défilement** : un chapitre peut
  dépasser l'écran. Un champ en cours de saisie garde la main sur toutes les
  autres touches (`INPUT|TEXTAREA|SELECT`, `isContentEditable`).

### L'envoi au client (v221)

Un navigateur **ne sait pas joindre un fichier à un mail**. La seule mécanique
honnête, validée par le CGP : le bouton « Envoyer au client » déclenche
l'enregistrement du PDF, puis — une fois la fenêtre d'impression refermée — ouvre
la messagerie du poste (`mailto:`) avec destinataire (`d.email`), objet et corps
déjà écrits ; le conseiller y glisse le PDF. Le relais passe par un `useRef`
(`mailApresPdf`) lu dans le `setTimeout` de fin d'impression. Le bouton existe
dans le bandeau d'écran ET dans la barre de présentation. Ne jamais promettre un
envoi automatique : il faudrait un service serveur (clé d'API, adresse
expéditrice, coût) — c'est un arbitrage du cabinet, pas une ligne de code.

### L'ordre du volet « Audit et synthèse » (v221, CGP)

Ouverture · Le foyer · Logement et crédits · Placements · Revenus et charges ·
Endettement · Patrimoine net · Situation fiscale · **Votre épargne mensuelle
actuelle** · **Importance des versements programmés** · **Objectifs et moyens**
(ce que le client met en face : apport et mensualité) · **Les sujets du prochain
rendez-vous** · **Pour préparer notre prochain rendez-vous**.

- « Votre épargne mensuelle actuelle » lit le versement programmé **placement par
  placement** (`a.ppQ === "oui"`, `a.pp`). Le reliquat entre ce détail et
  `synth.ppMensuels` (qui intègre le PER déclaré à l'étape Fiscalité) sort sur sa
  propre ligne — sinon les deux chiffres se contrediraient à l'écran.
- Le bloc « objectifs et moyens » figure **dans les deux volets** (choix du CGP) ;
  seules les cartes du cabinet (objectifs recommandés, préconisations) restent
  réservées au RDV 2 (`autresLarges = synMode === "preco" ? … : []`). Il ne reste
  donc plus que **deux** gardes `if (synMode !== "preco") return null;`.
- Le teaser ne donne que **le nombre de sujets et leurs titres** — aucun chiffre,
  aucune préconisation. Le premier rendez-vous nomme, il ne traite pas.

---

## LE DOCUMENT DU PREMIER RENDEZ-VOUS — v221 → v224

Ordre imposé de la fin du volet « Audit et synthèse » (décisions du CGP du
15/09/2026, à ne pas réordonner seul) :

**Votre épargne mensuelle actuelle → Importance des versements programmés →
Objectifs et moyens → Les questions du prochain rendez-vous → Pour préparer
notre prochain rendez-vous.**

### Ce que chaque bloc lit dans le dossier

| Bloc | Source | Piège |
|---|---|---|
| Épargne mensuelle actuelle | `a.ppQ === "oui"` et `a.pp`, **placement par placement**, + détenteur `a.titulaire` | le total du moteur `synth.ppMensuels` intègre le PER déclaré à l'étape Fiscalité : le reliquat sort sur SA PROPRE LIGNE, sinon les deux chiffres se contredisent à l'écran |
| Objectifs et moyens | `syn.resume` (carte « Objectifs exprimés ») + `d.capacite*` / `d.apportInitial` | le bloc est dans les DEUX volets ; seules les cartes du cabinet restent au RDV 2 (`autresLarges = synMode === "preco" ? … : []`) |
| Questions du prochain RDV | `syn.faiblesses`, via une table `{p, re, q}` | **cinq au maximum**, triées par `p` (priorité arbitrée par le CGP), jamais par l'ordre du moteur ; un axe sans question écrite NE SORT PAS |
| Devoirs du client | des CHAMPS VIDES ou « je ne sais pas », jamais un chiffre calculé | quatre déclencheurs : quotité inconnue (couple), assurance de prêt non renégociée ou inconnue, rendement de placement inconnu, prévoyance TNS non connue |

### Le doute se saisit

`QUOTITE_OPTS` porte `{ v: "nsp", l: "Je ne sais pas" }` (et non « À vérifier »),
et « Assurance de prêt renégociée ? » utilise `NC_ASSUR_RENEG_OPTS`
(Oui / Non / Je ne sais pas) au lieu d'un `OuiNon`. **Toute question du
questionnaire qui peut rester sans réponse doit proposer « Je ne sais pas »** :
le doute appelle les mêmes pièces que le manque. Attention : `l.assurQ === "non"`
alimente le levier « délégation d'assurance » des gisements — `"nsp"` ne doit
PAS y entrer (on ne chiffre pas une économie sur une information qu'on n'a pas).

### Envoi au client

`mailApresPdf` (un `useRef`) est posé par `envoyerAuClient`, lu dans le
`setTimeout` de fin d'impression de `exporterPdfSynthese`, et ouvre alors un
`mailto:` pré-rempli (destinataire `d.email`, objet, corps). Un navigateur ne
sait pas joindre un fichier à un mail : ne jamais promettre un envoi
automatique — il faudrait un service serveur, c'est un arbitrage du cabinet.

---

## CHARTE GRAPHIQUE

| Élément | Valeur |
|---|---|
| Fond de page | `#f5f5f4` |
| Feuilles | blanc, `rounded-2xl`, bordure discrète |
| Vert principal | `#047857` |
| Dégradé d'accent | `#10b981 → #047857` |
| Carte mise en avant | `linear-gradient(135deg,#ecfdf5,#fff)`, bordure `#a7f3d0` |
| Or | `#b8924e` · Encre `#0a0908` · Rouge `#b91c1c` |

**Titres de carte** : `.nc-ctitre` — JetBrains Mono, 9,5 pt, `letter-spacing`
0,20 em, majuscules, 800, filet dégradé or, suffixe en `.sfx`. **Chiffres et titres serif** :
Lora (v214, plus Fraunces), `tabular-nums`. **Libellés de champ de saisie** : `text-[10px] uppercase
tracking-wider font-bold text-stone-400` — jamais `.nc-ctitre`, réservée aux
titres de cartes. **Pastilles des tuiles d'identification** (`NcPastilleTuile`) :
disque plein 22 px, une couleur par nature (état civil violet, activité bleu,
foyer vert-bleu, adresse or, téléphone vert, email orange), picto trait blanc —
« plus flashy tout en restant pro » (CGP, 10/09).

Toute page ajoutée doit être **cohérente avec le reste du simulateur** : c'est un
onglet de l'audit patrimonial, pas une page autonome.

---

## CHEMINS DE DONNÉES DU DOSSIER

**Immobilier — TROIS sources à agréger, jamais une seule** : résidence principale
(`d.rpValeur`, `rpCrd`, `rpMensualite`, `rpTaux`, `rpDureeRestante`) ;
`d.locatifs[]` ; `d.biens[]` via `ncBienValeur(b)` en filtrant
`type === "locatif" || enLocationQ === "oui"`.

**Régimes locatifs** : `NC_REG_LOC` (micro_foncier 70 %, reel_foncier, micro_bic
50 %, reel_bic, exonere) et `ncRegimeLoc(l, loyerAnnuel, totalNuAnnuel)`. Le
basculement automatique se fait au-delà de **15 000 € de loyers nus du FOYER**
(`totalNuAnnuel`, agrégé sur `locatifs[]` + `biens[]`) — c'est bien un total de
foyer, jamais un total par bien. **Micro et réel ne cohabitent jamais** : voir le
piège du même nom plus haut, point ouvert.

**Projet d'achat RP** : `d.rpProjetQ`, `rpProjetHorizon`, `rpProjetMensualite`,
`rpProjetDuree`, `rpProjetTaux`, `rpProjetApport`, `rpProjetNote` — chiffré par
`ncProjetRP(d)` (module), utilisé par la carte Capacité, les points forts et le
socle de la projection. L'ignorer fausse toute la projection d'un locataire
acquéreur.

**Revenus** : salarié `actSalarie.montant` (+ `periode`, `nbMois`) ; **indépendant
`actIndependant.n1` — bénéfice ANNUEL, sans abattement de 10 %** ; chef
`actChef.revenu` ; retraité `actRetraite.revenu` ; conjoint sous `conjointRev` avec
la même structure.

**Avoirs** : `d.avoirs[]` par `type` (`livrets`, `compte_courant`, `av`, `per`,
`pea`, `cto`, `epargne_salariale`, `autre`). Garde-fou PER : un PER renseigné
seulement côté fiscal (`d.reductionsPer`) s'ajoute, mais sans doublon. Un
nouveau placement s'ouvre sur « — Choisir — » : c'est `addList("avoirs",
{ type: "" })` (DEUX appels) qui le décide, pas le placeholder du `<Select>` —
voir « Répondre au CGP sur le comportement, pas sur le code ».

**Réductions** : `d.reductionsQ`, `d.reductionsLignes[]`
(`{type, montant, periode, dureeType, duree}`), types dans `NC_REDUC_TYPES` avec
leur `mode`. Pour le plafond des niches de 10 000 €, ne compter que `immo_defisc`,
`emploi_domicile`, `autre` : le PER est une déduction, les dons sont hors plafond,
le Girardin a son plafond propre.

**Sorties du moteur** : `ncSynthese(d)` rend `{resume, forces, faiblesses,
problematiques, chiffresCles}` — les axes s'appellent **`faiblesses`**.
`ncCalcFisc(d, an)` rend `{impotNet, tmi, rniBrut, ir:{qf, impotFoyer, …}, …}` —
l'impôt est **`impotNet`**, pas `ir.net`.

**Retraite — POINT D'ENTRÉE UNIQUE** : `ncPensionFoyer(d, chiffresCles)`. Le
montant relevé sur info-retraite.fr (`objectifsDetail.retraite.pension` /
`.pensionConj`) PRIME sur l'estimation par taux de remplacement et irrigue tout
l'outil. **Aucun appel direct à `ncPensionPerso` hors de ce point d'entrée** —
sinon un montant relevé serait ignoré quelque part en silence ; le banc le vérifie.

**Épargne de précaution** : point d'entrée unique `ncPrecaution(d, synth)` —
cibles FIXES selon le foyer (seul 10 000-15 000 ; couple sans enfant 20 000 ;
couple avec enfant 25 000), aucun supplément locataire, `profMin/profMax = null`,
`surDote` au-delà de 1,5 × cible haute. Aucun « N mois de dépenses » ailleurs :
le banc sonde le source (`/: \d+(?: à \d+)? mois de dépenses"|valLoc\w* \* 0\.05/`).

**Assurance de prêt** : axe « simulation de renégociation » dès qu'un crédit
existe (`enCours(x)`), même déjà renégocié, s'il reste au moins
`NC_ASSUR_MIN_ANS = 8` ans (`anneesRestantesFin(c)` depuis `finMois`, `dureeOk`).

**Faiblesses** : bloc de regroupement après le bloc disparité — les axes épargne
(`estEpargne = /^Épargne|^Absence totale d'épargne|^Versements programmés|^Performance de l'épargne/`)
restent VOISINS. Plus d'axe « Locataire » (décision 04/09).

**Succession au RDV 1** : `ncCalcSuccession` → `v.ddvImpact {survivant, defunt,
ageU, us, assiette, partSurvSans, partSurvAvec, droitsSans, droitsAvec}` ou
`{sansAge:true}` ; filtre RDV 2 `synMode === "preco" || !sc.rdv2` intact.

**Compteur « Le financier »** (carte 4 de « Les chiffres du dossier », ~l. 10140) :
`partFin = 1 − actifImmo/actifTotal`, rouge sous 25 %, pour TOUS les dossiers
(règle 28/08 « propriétaire ET > 65 % » remplacée le 10/09) ; daté si
`d.rpProjetQ === "oui"`. Lignes de détail Financier (coloré) puis Immobilier.

**Capacité d'emprunt** : DEUX usages seulement, investissement locatif (`capLoc`)
et résidence principale (`capMax`/`capRetenu`) ; la résidence secondaire n'y
figure plus (`capRSMax` supprimé le 10/09) — ni carte, ni forces, ni synthèse.
Locataire avec projet RP : projet chiffré (`ncProjetRP`) + place restante pour du
locatif (jauge). Le locatif est TOUJOURS la jauge.

**Objectifs et préconisations** : `syn.resume`, entrées `"Objectifs exprimés"` /
`"Objectif exprimé"` et `"Préconisations"`, champ `list` ou `d`.

**Participation et apport déclarés** : `d.capaciteEpargne` /
`d.capaciteEpargneLibre`, `d.apportInitial` / `d.apportInitialLibre`. Cas
`d.reflexionPatrimoine === "separee"` : une mention par personne, et les deux
capacités **se cumulent** dans l'enveloppe. Table `NCP_ENV_TRANCHE` : borne BASSE
de chaque tranche (`<100` → 50, `100-300` → 100, `300-500` → 300, `500-1000` → 500,
`>1000` → 1000). Priorité : saisie du conseiller (`h.env`), puis capacité déclarée,
puis, en dernier recours seulement, l'effort des solutions cochées. L'apport du
locatif projeté part de l'apport déclaré (milieu de tranche, `aucun` → 0).

**Durées manquantes** : `d.locatifs[]` et `d.biens[]` n'ont PAS de durée de crédit
restante ; elle est déduite du CRD, de la mensualité et d'un taux de référence
modifiable. Ajout du champ proposé au CGP, **en attente d'arbitrage**.

**Point ouvert non tranché** : le champ « Charges et vacance % » minore les loyers
dans le calcul fiscal alors que les charges réelles sont déduites par ailleurs —
double comptage hérité de v182, dont le meublé hérite. À poser au CGP.

---

## LA PROJECTION « À N ANS, VOTRE SITUATION » — comment elle est bâtie

Lue dans le code le 10/09 pour répondre au CGP (« comment tu fais pour gérer
cette partie-là ? »), puis refondue le même jour (décisions A à F, v205).

- **Socle** `socleAt(y)` : immobilier existant (RP — projet RP compris —,
  locatifs, AUTRES BIENS y compris un terrain ou une RS, revalorisés à `gImmo`
  1 %/an, nets des CRD amortis mois par mois), court terme à `tLiv`, placements
  à `tAv0` 2,5 %. Un terrain ou une RS est compté avec le locatif
  (`locVal0 = socle.locVal + socle.rsVal`) : la ligne du tableau s'intitule alors
  « Immobilier locatif et autres biens » (ou « Autres biens (terrain, résidence
  secondaire) » s'il n'y a rien d'autre).
- **« Sans rien changer »** = socle + `baseAvant = max(effort employé, envPoche)`
  (v215, 14/09) capitalisé sur les LIVRETS à `tLiv` **1,7 %** (`epargneAvant` —
  jamais `tAv0` 2,5 %, cf. la règle « Livrets = 1,7 % » plus haut ; règle du
  02/09 : l'écart mesure la réallocation, pas le fait d'épargner).
  `gainReallocation` porte sur la seule part financière `finMens` (PER + AV),
  mesurée contre `tLiv`.
- **« Avec les préconisations »** = socle + `addAt(y)` : PER et AV à `tMed`
  5,2 %, locatif = valeur du bien revalorisée − CRD − apport capitalisé,
  arbitrage/redirection, + `treso(y)` = solde mensuel `ENV − PER net − AV −
  effort locatif réel` capitalisé **seulement s'il est positif** (décision D).
- **Complément de revenus** = placements financiers × taux mensuel de `tMed` +
  loyers existants nets + loyers du nouveau bien à l'horizon, nets de la
  mensualité restante si le crédit court encore, jamais négatifs (décision A).
- **Transmission à l'horizon** : `succHorizon(apres)` reconstruit le dossier tel
  qu'il serait à l'horizon (avoirs existants capitalisés sur leurs supports ;
  **avant** : l'épargne `epargneAvant` rangée en `livrets` → pleinement taxable,
  sans abattement ; **après** : nouveau PER en `type: "per"` (hors succession
  comme l'AV depuis v208), nouvelle AV en `av`, `treso` → livrets, arbitrage →
  `av` ; titulaire « commun » en couple ; biens et locatifs
  à leur valeur projetée, crédits soldés par l'assurance de prêt, RP acquise) et
  le passe dans `ncCalcSuccession` → `R.succSans` / `R.succAvec` `{assiette, droits,
  avHors, droitsAV, nbBenef, total, lib}` ; AV hors succession taxée à 20 % au-delà
  de 152 500 € × enfants (art. 990 I). `null` sans enfant ni conjoint.
- **Fiscalité** : `ecoImpot` = PER × TMI + réduction Denormandie/Malraux utilisée
  + `ecoRegimeAn` (économie du régime choisi par rapport à la location nue :
  `foncNu`, `coutNuTot`, `coutRegimeTot`, `ecoRegimeTot`).
- **Manque** : `R.effort` (an 1, effort locatif réel `effAn(0)`), `R.soldeMin` et
  `R.anneeMin` (année la plus tendue) pour l'alerte.
- **Rendu** (ordre, v213 du 11/09 — exigé par le CGP sur le dossier Drouot) :
  page de garde (`inputs` passé à `NcProjection` : `cabinetNom`, `cabinetLogo`,
  `conseillerNom` ; `minHeight: 1040`, deux espaceurs flex, `nc-print-avoid` ;
  PLUS de phrase « Ce document projette votre situation à X ans… » ; sous les
  objectifs / préconisations : la phrase d'engagement sur le déclaré — v215, plus
  de bandeau `garde`) → **« Les solutions retenues »** (`data-nc-force-break="1"` :
  nouvelle page ; phrase d'engagement « Vous souhaitez épargner … » ; le bandeau
  `barre("fixe")` EN GRAND, imprimé, avec la fourchette « 300 à 500 € » et les
  sous-lignes ; note « au-delà des X € du bas de votre fourchette » ; cartes,
  charges, tuiles, fiscalité, alerte) → **« Où trouver l'épargne »** (compact :
  trois `Carte petit` sur une ligne, **économie MENSUALISÉE** — le €/mois est le
  chiffre principal, « soit + X € dans N ans » en second ; puis une ligne de
  résumé par nature « Trésorerie libérée chaque mois » / « Meilleur rendement sur
  la durée » — titre dans un `span`, valeur dans le DERNIER `span` du même parent,
  c'est ce que lit `t_gisements.js` ; les deux natures ne s'additionnent jamais)
  → « À N ans, votre situation » : `<table>` avant / après (`ROWS` : patrimoine et
  ses trois lignes, revenus, impôt, droits de succession, droits AV, transmis hors
  succession, crédits soldés ; colonne Écart verte si favorable, `inv` pour les
  droits ; en-têtes « Sans rien changer » / « Avec les préconisations » portent
  **« dans N ans »** dessous) puis la bande « + patrimoine / + revenus » et
  « D'où vient la différence ? ». La rubrique « Votre participation et les
  préconisations » n'existe plus (fondue dans les solutions).
- **Le bandeau enveloppe · employée · reste** : UNE fonction de rendu `barre(mode)`
  (pas un composant — aucun champ dedans) et UNE liste `barItems`, modes :
  `"fixe"` (imprimé, `data-nc-barre`, `ref` dans `barRefs` ; `"garde"` n'est plus
  rendu depuis v215),
  `"sticky"` (écran seulement, `nc-syn-noprint`, conteneur `position: sticky ;
  height: 0` + enfant absolu pour ne prendre AUCUNE place dans le flux, et
  `visibility: hidden` tant qu'un bandeau imprimé est à l'écran — `IntersectionObserver`
  sur `barRefs`, état `barVu`). Ne pas remettre un bandeau qui prend de la place :
  son apparition faisait sauter tout le contenu de 50 px.
- **Pagination du tableau** : la carte « À N ans » porte `data-nc-split="1"` ; la
  pagination PDF la répartit alors entre deux pages (`blocsNiveau` descend dans ses
  enfants ; titre + intro + tableau sont groupés dans un `nc-print-avoid`). Sans
  cela « Où trouver l'épargne » restait seul sur une page aux deux tiers vide.
- **Harnais** : `regen_proj.py` extrait aussi `ncCapNom`, `ncBaremeSucc`,
  `ncCalcSuccession`, `ncProjetRP`, `ncTit`, `ncAgeDate`, `ncUsufruitPct`,
  `NC_SUCC_TRANCHES` ; `mk_rami.py` → `_test_rami.html` ; `t_rami_proj.js` lit les
  chiffres. Le dossier pauvre de `_test_proj.html` n'a pas de lignes succession.

---

## MOTEURS DE CALCUL (composant `NcProjection`)

| Fonction | Rôle |
|---|---|
| `ncpCapM` | mensualité d'un crédit |
| `ncpCrdApres` | capital restant dû réel, mois par mois |
| `ncpDureeRestante` | durée déduite d'un CRD et d'une mensualité |
| `ncpAmortAnnuel` | intérêts et CRD année par année |
| `ncpFoncierNuReel` | résultat foncier, déficit scindé, options `deficitSansLimite` (Monument historique) et `travauxDeductibles` |
| `ncpMeubleReel` | BIC, amortissement plafonné art. 39 C II, ARD, déficit BIC périmé à 10 ans, comparaison micro-BIC |
| `ncpReducIR` | réduction d'impôt : plafond des niches, limite à l'impôt dû, report daté |
| `ncpPvMeuble` | plus-value avec réintégration des amortissements |
| `ncpCap` | capitalisation mensuelle, versements en début de mois |

Contrôle de `ncpCap` : 350 €/mois à 5,20 % sur 20 ans = **145 813 €**.

`NCP_REGIMES` décrit les six régimes locatifs (`famille: "nu"` ou `"bic"`). Ajouter
un régime = une entrée dans cette table, ses champs de saisie, ses tuiles, sa note.

**Modèle du « avant »** (tranché le 02/09, corrigé le 10/09 v207) : le scénario
« sans rien changer » capitalise la MÊME épargne mensuelle sur les livrets du
client à `tLiv` **1,7 %** (pas `tAv0` 2,5 %). L'écart affiché est donc le gain de
la **réallocation** (1,7 % → 5,2 %), pas celui d'épargner.

**Prévoyance de l'assurance emprunteur** : `prevRPnow`, `prevLocNow`, `prevNewNow`,
`prevTotalNow`, quotités `h.quotRP` et `L.quotLoc` (saisies **par crédit**) —
affichées dans la ligne « Crédits soldés par l'assurance de prêt » du tableau.

---

## EXPORT PDF

La synthèse est clonée dans `#nc-print-holder`, mise à l'échelle A4, paginée par
simulation, puis `window.print()`.

- `document.title` **fait le nom du fichier** : il dépend du volet (`synMode` :
  `constat` / `preco` / `proj`), sinon les trois exports d'un client sortent sous le
  même nom.
- La modale `figara_pdf_hint` bloque le premier export : en test, poser
  `localStorage.setItem('figara_pdf_hint','oui')`.
- Tous les `<button>` sont masqués — voir le piège plus haut.
- Pagination JS : `data-nc-force-break="1"` sur un bloc le fait démarrer sur une
  nouvelle page (si plus de 40 px sont déjà occupés) ; `nc-print-avoid` interdit
  de couper un bloc ; les blocs de plus de 92 % d'une page sont découpés en
  leurs enfants ; `data-nc-split="1"` force ce découpage sur un bloc plus court
  (carte « À N ans », v213) et lui retire `nc-print-avoid`. Une page de garde se
  construit avec une hauteur minimale À L'ÉCRAN (la pagination mesure le clone),
  pas en CSS d'impression.
### LES CHIFFRES DU DOSSIER SE LISENT, ILS NE SE LISENT PAS — v238

Le CGP, 18/09/2026 : « pour les chiffres du dossier, **tu écris trop**. Je veux un
camembert pour le taux d'endettement qui permette de lire que les 14,1 % sont
consommés par le loyer ; s'il y avait eu un autre crédit, il aurait fallu une autre
couleur et mettre par exemple prêt auto, ou résidence secondaire, ou Pinel. Idem pour
les autres : **je veux quelque chose de visuel, avec aucun texte ou le minimum**. »

**LES QUATRE VIGNETTES SONT DES CAMEMBERTS** (`NcDonut`), dessinés en SVG à la main —
aucune librairie, parce que rien ne s'exécute à l'impression :

| Vignette | Anneau | Centre | Légende |
|---|---|---|---|
| Taux d'endettement | une part par LIGNE DE CHARGE, le solde jusqu'au plafond des 35 % en gris | le taux, une décimale | le poste et son % des revenus |
| Mensualité disponible | le même anneau, lu EN EUROS | la mensualité disponible | le poste et son €/mois |
| Capacité d'emprunt | le même anneau (arbitrage du CGP) | le montant empruntable | idem |
| Le financier | financier / immobilier | la part du financier | la poche et ses euros |

**LA LÉGENDE EST LE SEUL TEXTE ADMIS** : un carré de couleur, le nom du poste, sa
valeur. Les paragraphes de règle cabinet qui occupaient le bas des cartes sont
retirés ; ce qui ne se déduit pas du dessin reste seul (« ces deux montants ne
s'additionnent pas »), le reste est passé dans « Voir les hypothèses ».

**CE QUI NE DOIT PAS DISPARAÎTRE AVEC LES JAUGES.** La règle du 29/08 — quand la
situation CHANGE (projet d'achat de résidence principale, crédits finissant sous
24 mois), on montre les DEUX ÉTATS CÔTE À CÔTE — tient toujours : deux camemberts
jumeaux, chacun son titre. Le dessin remplace les jauges, jamais la règle. Quatre
bancs l'avaient vu avant moi en tombant en échec.

**L'HISTOGRAMME DES VERSEMENTS PROGRAMMÉS** remplace le tableau croisé. Un seul
horizon, **20 ans** (arbitrage du CGP : un histogramme ne peut pas porter deux durées
sans redevenir un tableau). Un groupe par montant mensuel, trois barres par groupe
(1,7 % pierre, 5 % vert cabinet, 7 % or), le capital écrit au-dessus de chaque barre.
Dessiné en FLEX et non en SVG : les hauteurs restent justes quand le document est mis
à l'échelle à l'impression. Couleurs MAISON — le CGP a explicitement écarté celles de
l'exemple qu'il avait fourni.

---

### DEUX BLOCS QUI NE SE QUITTENT JAMAIS — v241

La pagination sait REPORTER UN SAUT EN AMONT quand deux blocs doivent rester ensemble.
Deux cas aujourd'hui :

- un **bandeau de chapitre** (`nc-print-chap`) et la carte qui le suit (16/09) ;
- tout bloc portant **`data-nc-colle-precedent="1"`** et celui qui le précède (19/09) —
  utilisé pour « Actif total / Passif / Patrimoine net », qui ne doit jamais se
  retrouver seul en haut d'une page, séparé de la rangée de compteurs.

C'est le levier à employer pour toute nouvelle paire indissociable : il coûte moins
cher qu'un regroupement dans un conteneur, et il n'empêche pas la coupure quand la
paire ne tient vraiment pas.

**CE QUI RESTE ARBITRABLE** : faire tenir les QUATRE compteurs ET le trio sur une même
page demanderait soit de réduire les cartes d'un tiers (le CGP venait de demander
l'inverse), soit de déplacer le groupe entier sur sa propre page — et la page de la
fiscalité retomberait sous 55 % de remplissage, ce que le banc refuse.

---

### LE PIED DE PAGE ET LA GÉOMÉTRIE RÉELLE — v232, ce qu'il a fallu comprendre

**LE NAVIGATEUR MET EN PAGE DANS LA BOÎTE `@page`, PUIS MET LA PAGE À L'ÉCHELLE DU
PAPIER.** La feuille de style déclare `@page { size: A4 }` : Chrome pagine donc
TOUJOURS dans une boîte A4 de 1123 px, puis met la page ENTIÈRE à l'échelle de la
feuille demandée (sur du Letter : 1056 / 1123 = 0,940). **Le format du papier ne
change RIEN à la mise en page.** Toute la saga « le CGP imprime en Letter » du 16/09
reposait sur une hypothèse fausse ; ce qui reste vrai, c'est le CHIFFRE retenu, pour
une autre raison (voir ci-dessous).

**POURQUOI ON VISE QUAND MÊME 1056 ET NON 1123.** Viser 1123 remplit la boîte au
pixel près : le pied de page, qui porte `break-inside: avoid`, mord alors la coupure
et part TOUT ENTIER à la page suivante — on fabrique une page ne contenant qu'un
pied. À 1056 (94 % de la boîte), le pied se pose à environ 2 cm du bord du papier et
n'est jamais rogné. `hPied = 46/zC`, `H_PIED_MIN = 29/zC`, `pageDispo = pageFull − hPied`.

**LE PIED DE PAGE EST POSÉ, PAS CALCULÉ.** Trois pièges, tous rencontrés le 17/09 :

1. **Margin collapsing.** Les marges ajoutées par `occuperPage()` FUSIONNENT avec
   les marges déjà présentes : la poussée réelle est plus faible que la poussée
   calculée, d'une quinzaine de pixels par interstice. On ne déduit donc plus la
   hauteur du pied d'un calcul : on POSE le pied, on MESURE où il est tombé
   (`getBoundingClientRect`), et on l'étire jusqu'au bord bas de SA page. Une passe
   de recalage finale repasse sur tous les pieds à la fin de la pagination.
2. **Chrome ignore `break-after` sur un élément FLEX.** Insérer le pied et le saut à
   l'intérieur de `.nc-duo` ne coupait pas là où on le demandait. On coupe donc le
   CONTENEUR : les cartes restantes passent dans une rangée sœur (`cloneNode(false)`
   + déplacement des enfants), et le pied se pose ENTRE les deux, au niveau du
   document. Même traitement à prévoir pour toute future rangée flex.
3. **Ce qui est masqué à l'impression doit être RETIRÉ du clone.** La pagination se
   fait à l'écran : un `<button>`, masqué par `button { display: none }` en print,
   était compté dans la mesure et disparaissait au tirage — la page raccourcissait
   et son pied remontait. `clone.querySelectorAll("button").forEach(n => n.remove())`.

**ORIGINE DES MESURES** : le HAUT DU PORTEUR (`holder`), pas le clone — le porteur a
28 px de padding en tête, et les ignorer décalait la première page.

**CONTENU DU PIED** (arbitré le 17/09) : nom du ou des clients et date à gauche,
numéro de page à droite, filet doré au-dessus, AUCUN nom de cabinet, et AUCUN pied
sur la page de garde. Il n'est plus en `position: fixed` : avec un ancêtre `zoom`,
certaines versions de Chrome en font le bloc conteneur des descendants `fixed`, et
le pied se colle alors au bas du DOCUMENT au lieu du bas de la PAGE — c'est ce qui
faisait qu'AUCUNE page de l'export du CGP n'avait de pied, alors qu'elles en avaient
toutes chez moi.

**MARGE @page = 0, ET CELA NE SE DISCUTE PAS.** Lui donner de la hauteur donne à
Chrome la place d'imprimer SON en-tête (« 17/09/2026 08:54  Synthese-patrimoniale-… »)
en haut de la page de garde. L'aération du haut de page vient de `RESPIRE`, posé dans
le document — et c'est le PIED qui porte le saut (`break-after`), jamais
l'intercalaire : un bloc vide portant lui-même `break-before: page` se retrouve en
tête de fragment, où Chrome ne lui donne aucune hauteur (échec silencieux de la v228).

**CE QUI RESTE IMPARFAIT** : sur les pages portant la rangée de compteurs, le pied se
pose encore 15 à 20 pt plus haut que sur les autres. Le contenu y rend légèrement
plus court à l'impression qu'à l'écran ; la cause exacte n'est pas identifiée. Aucune
page n'est rognée, aucun pied ne manque — mais ce n'est pas encore aligné au point.

---

### LA GÉOMÉTRIE DE LA PAGE IMPRIMÉE — v228 / v229, à ne jamais casser

Trois chiffres tiennent ensemble ; en changer un sans les autres refait des pages
à moitié vides :

| Élément | Valeur | Pourquoi |
|---|---|---|
| `@page { margin }` | `34px 0 0 0` | La RESPIRATION DE PAPIER en tête de **chaque** page (CGP, 16/09 : « le début de la page est calé tout en haut »). L'intercalaire `.nc-print-break` (RESPIRE = 54 px avant zoom) ne couvre que les coupures décidées par la pagination JS ; les coupures décidées par Chrome, elles, n'ont que cette marge. Les marges latérales restent à 0 : la largeur blanche vient des 758 px utiles du porteur sur 794. |
| `pageDispo` | `Math.floor(965 / zC)` | Hauteur utile, en pixels AVANT zoom. 965 = **Letter** 1056 − 34 (marge) − 57 (pied de page fixe). On calcule sur la PLUS PETITE des deux pages : le CGP imprime en Letter (réglage macOS) ; sur A4 (1123 − 34 − 57 = 1032) le reliquat est absorbé par la redistribution du blanc. |
| pied de page | ≈ 57 px | `.nc-print-footpage`, `position: fixed; bottom: 0` — hors flux : l'inclure dans la simulation la fausserait. |

**Redistribution du blanc de bas de page — les éléments FLEX sont exclus.** Poser
un `margin-top` sur un enfant de `.nc-duo` (conteneur flex, `align-items: stretch`)
le fait descendre ET perdre de la hauteur : les deux cartes d'une rangée n'ont
alors ni le même haut ni la même taille. `occuperPage()` ne redistribue donc que
sur les blocs dont le parent n'est PAS `.nc-duo`, et porte le reliquat sur la
rangée entière plutôt que sur une carte. Toute nouvelle rangée flex dans la
synthèse doit être traitée de la même façon.

**Les quatre compteurs font la MÊME taille.** Deux rangées flex indépendantes
s'alignent chacune de son côté, jamais entre elles : un effet « égaliseur »
(dans le composant principal, sans tableau de dépendances, plus rAF + 300 ms +
1 000 ms + `resize`) remet `minHeight` à vide, mesure la plus haute carte de
chaque `.nc-duo` et impose sa hauteur aux autres, **en style inline** — le clone
d'impression l'emporte tel quel. Ne jamais remplacer ça par une grille CSS :
l'intercalaire de saut de page pleine largeur y deviendrait une cellule fantôme.

**Tailles des compteurs, historique des demandes du CGP** (« je veux qu'ils
prennent moins de place », trois fois) : zone de jauge 196 → 122 (v227) → 104
(v228) → **78 px** ; arc 210 → 156 (v227) → 138 (v228) → **104 px** ; cartes en
`px-4 py-3` avec `.nc-cpt-notes` (marge et interligne resserrés). Résultat mesuré :
document de 6 → 5 pages, remplissage 99/98/87/98/98 %.

**« Vos revenus mensuels » ne contient AUCUNE épargne** (CGP, 16/09 : « supprime
la partie verte, je ne veux pas voir d'épargne à cet endroit »). Ni en charge
(v227), ni en ligne verte à part (v228, supprimée en v229). Le bloc ne dit que ce
qui entre et ce qui sort ; le total de droite est « Reste après charges » =
revenus − charges. L'épargne mensuelle a son propre chapitre, « Votre épargne
mensuelle actuelle », placé sous « Vos placements ».

- **Vérifier CHAQUE page**, y compris la dernière : pas de texte collé en haut avec
  un vide immense dessous, aucun chiffre qui déborde d'une jauge. `t_rp.js`
  exporte le PDF de la projection dans `export_rp.pdf`, `t_proj_pdf.js` (dossier
  Jean, locatif coché) dans `export_proj_a4.pdf` : le relire (`pdftoppm -r 60`
  puis `Read` de chaque page) après toute retouche de la projection. Le stub
  `window.print` qui lève une erreur affiche le bandeau rouge « Une erreur
  technique est survenue » (`window.onerror`) : artefact du test, pas un défaut.

---

### Règle CGP du 23/09/2026 — pas d'assurance-vie « commune » hors communauté
Hors communauté (séparation, participation aux acquêts, PACS, union libre), une
assurance-vie ne peut pas être souscrite en commun. Dans l'audit (étape
« Placements », sélecteur « À qui appartient cet avoir ? », ~l. 11045 de v249) le
choix « Commun / joint » est aujourd'hui proposé à tous les avoirs, y compris
`type === "av"`, dès que le foyer n'est pas en communauté d'acquêts ni universelle.
**À faire** : pour `a.type === "av"` hors communauté, ne proposer que Monsieur /
Madame ; signaler (fenêtre des incohérences) un dossier existant qui porte encore
`titulaire: "commun"` sur une AV hors communauté. Garder « commune » en
communauté universelle (sélecteur dédié) ; en communauté d'acquêts, c'est l'origine
des fonds qui est saisie (pas de titulaire) — inchangé.

### 23/09/2026 — doctrine de présentation client (skill métier, section « DOCTRINE DE PRÉSENTATION CLIENT »)
Le CGP a posé la structure cible du document : (1) première page = tableau de bord
Forces / Faiblesses / Opportunités / Risques + objectifs prioritaires, sans jargon ;
(2) chaque recommandation en 4 temps objectif → solution → gain → conditions ;
(3) tableau Scénario A (statu quo) / Scénario B (recommandation) avec hypothèses ;
(4) ordre civil → restructuration → fiscal/épargne → diversification ; (5) fin =
plan d'action (étape / action / intervenant / coût) ; annexes réglementaires en fin.
**Rien n'est encore implémenté dans index.html** : à faire avec le CGP, écran par
écran, en gardant le mot « effort » banni. Cela recoupe le chantier ouvert « dernière
page de la Simulation » (calendrier de mise en place = la checklist praticien).

### v250 (23/09) — pas d'AV ni de PER « commun » hors communauté
Fait : sélecteur « À qui appartient cet avoir ? » sans « Commun / joint » ni
« Indivision » pour `type av|per` hors communauté ; `ncSynthese` pousse dans
`incoherences` l'ALERTE CRITIQUE (texte du CGP, montant + régime, PER idem) pour un
dossier ancien ; rien n'est forcé. Banc `t_av_commune.js` = étape 21/21 (moteur sur
`NC_CLIENTS_TYPES` pacsé modifié + DOM de la fiche Pacsés). PER en communauté : tranché
le 23/09 (« oui ») — v253 : alerte « PER commun en communauté » pour tout couple, et le
sélecteur de la communauté universelle ne propose plus « Épargne commune » pour un PER.

### v251 (23/09) — foyer retraité (dossier BERNARD, colère du CGP)
`foyerRetraite` dans `ncSynthese` (l. ~4570) : `activites` contient "retraite" (et
`conjointRev.activites` aussi si couple). Coupe : problématique `retraite_non_preparee`,
objectifs « augmenter votre épargne mensuelle » et « pension estimée », précos
info-retraite.fr et PER (les trois branches), pièces « estimation de retraite » /
« contrats d'épargne retraite » (`foyerRetraiteD`, bloc des devoirs) et la phrase de
clôture « chiffrer vos revenus à la retraite », questions `retraite` et `versements`
(nouveau drapeau `skip` dans QUESTIONS, `foyerRetraiteQ` ; `cond` truthy = entrée
DIRECTE, ne jamais s'en servir pour exclure). Ajoute, si `courtTermeM ≥ 50 000` sans
projet RP : objectif « Réorienter vos N € de liquidités… assurance-vie » et préco
« Souscription d'un nouveau contrat d'assurance-vie » (757 B). Fenêtre 990 I : `age < 70`
(problématique `fenetre_990i`, mention dans l'audit du contrat existant, `abatt990`
des questions). Banc `t_retraite.js` = 22/22. `node t_pdf_type.js veuf` relu page à page.

### v252 (23/09) — foyer retraité, suite (réponses du CGP)
`foyerRetraiteS` + `plusDe70` dans le composant de synthèse (près de `ageClient`) :
histogramme « Importance des versements programmés » retiré (le `NcChapitre` reste),
lignes « Participation mensuelle » retirées de la carte (retitrée « Apport mobilisable »),
compteur « Capacité d'emprunt » (avec sa ligne locative) masqué à 70 ans ; moteur :
`emprunt70` coupe l'objectif « capacité d'endettement » et la préco locative. Capacité
d'épargne : nouvelle valeur `"aucune"` (`CAPOPTS`, chips de la fenêtre de capacité, `CAP`,
`CAP_LIB`), fiche « Veuve » = `"aucune"`. Attention : les libellés portent des espaces
insécables avant « € » — matcher par regex, pas par chaîne littérale.

### v254 (23/09) — sortie du foyer fiscal d'un enfant de plus de 20 ans
Étape Famille, carte enfant : si `âge > 20` (date exacte ou année) et `charge !== "non"`,
bandeau ambre `data-nc-sortie-foyer` avec le champ `e.sortieFoyerAge` (2 chiffres) et
l'année déduite ; alerte si l'âge saisi ≤ âge actuel. **Donnée capturée seulement** :
le moteur ne s'en sert pas encore (question posée au CGP : parts fiscales à la sortie ?
projection ?). Banc `t_sortie_foyer.js` = 23/23 (fiche Mariés : Camille 22 ans seule).

### v255 (23/09) — questions, dossier DURAND
Question `tresorerie` réécrite (tournure du CGP) ; question `rendement` (`ecart65`,
`longTQ` « au taux des livrets ») SUPPRIMÉE du tableau QUESTIONS — ne pas réintroduire.
Les variables `longTQ/ans65/ecart65` restent calculées mais inutilisées. Banc
`t_questions_durand.js` = 24/24 (fiche Mariés ; compter les questions par leurs boutons
✎ ✕, pas par les chiffres en début de ligne).

### v256 (23/09) — clients types refaits, remplis en totalité
Remplacés (décision CGP) : Julien FAURE (célibataire locataire, projet RP, fiche PROPRE),
Claire & Maxime ROUSSEL (pacsés), Olivier & Isabelle LAMBERT (mariés communauté, Manon
22 ans `sortieFoyerAge: "24"`), Jacqueline MOREAU (veuve 74 ans, 151 450 € court terme).
Questionnaire de risque NON rempli : `risqueMode: "externe"` + profil + SRI. Helpers
`ncSalF`, `ncRevVide`, `ncAnFin` ; `NC_CT_COMMUN` enrichi. Valeurs corrigées : enfant
non à charge = `"non"` (pas `"0"`), `rpDetenteur` ∈ client/conjoint/5050/libre,
`rpProjetHorizon` ∈ <1/1-3/3-5/>5. `t_clients_types` vérifie la complétude et l'absence
d'incohérence ; `t_recentre` teste les incohérences sur le MOTEUR (fiche propre).
« Créer un objectif » s'affiche sous le titre saisi. Encart « limite de tranche » : plus de
PER pour un retraité.
Pages à moitié vides relevées à la relecture (célibataire et mariés p. 3 : bloc
« Logement » seul, l'Épargne part page suivante ; pacsés p. 5) — pagination non modifiée,
question posée au CGP.

### v257 (23/09) — la sortie du foyer fiscal pilote le document
État civil : « — quittera le foyer fiscal en AAAA ». Fiscalité : encart
`data-nc-sortie-foyer-fisc` « Évolution du foyer fiscal » — ncCalcFisc relancé sans
l'enfant (et ceux partis avant), tableau parts / TMI / impôt / écart. Contrôle : Mariés,
4 → 3 parts, + 3 614 €/an (plafonnement du QF : 2 × 1 807 €).

### v258 (28/09) — quote-part de détention de l'immobilier
Le CGP : pacsée, conjoint non renseigné, détient 5 % de la maison — impossible à saisir.
RP et locatifs : question « Quelle part du bien détenez-vous ? » (`data-nc-quote-part`,
100 % / une quote-part + « en indivision avec… ») posée TOUJOURS, couple ou non. Champs
`rpDetentionQ/rpQuotePart/rpIndivAvec`, `l.detentionQ/l.quotePart/l.indivAvec`. Helpers
`ncQuote`, `ncRpValeur(d)`, `ncLocValeur(l)` — à utiliser PARTOUT où l'on lit une valeur
de RP ou de locatif (ne plus écrire `ncInt(d.rpValeur)` dans le moteur). CRD, loyer,
mensualité : ceux déclarés pour SA part, non proratisés (même règle que `ncBienValeur`
pour les « autres biens » en indivision). `regen_helpers.js` extrait les trois helpers.
Banc `t_quote_part.js` = 25/25.

### v259 (28/09) — Patrimoine AVANT Fiscalité
Le CGP (cliente retraitée avec revenus fonciers) : les loyers doivent être saisis avant la
synthèse de l'impôt. Choix validé : inverser les étapes (le locatif reste à un seul endroit,
décision du 31/08). Ordre : 1 État civil, 2 Famille, 3 Activité & revenus, **4 Patrimoine &
épargne, 5 Fiscalité**, 6 Objectifs, 7 Profil, 8 Synthèse. Seuls `NC_ETAPES` et les deux
gardes `etape === 4/5` ont changé ; tests par libellé de bouton, jamais par numéro.
Banc `t_ordre_etapes.js` = 26/26. À signaler : `ncDetailRNI` compte les `locatifs` même
si `fonciersQ === "non"` (non modifié, question posée).

### v260 (28/09) — origine des biens, plus-value, projet de vente, année d'ouverture
RP (`rpOrigine/rpAnneeEntree/rpPrixInitial/rpVenteQ/rpVenteDelai`), locatifs et autres biens
(`origine/anneeEntree/prixInitial`, `venteQ/venteDelai`) : bloc `data-nc-origine-immo`,
vente `data-nc-vente-immo`. Moteur : `ncPvImmo` (art. 150 U : forfaits 7,5 % achat et
15 % travaux > 5 ans, abattements IR 6 %/an 6e-21e + 4 % 22e, PS 1,65 %/an + 1,60 % 22e +
9 %/an 23e-30e, 19 % + 17,2 % — PS maintenus à 17,2 % en 2026 pour les PV immo —, surtaxe
`ncSurtaxePV` avec lissage ; **RP : exonération totale, `rp: true` → impôt 0 quoi qu'il arrive**
(art. 150 U II 1°, rappel du CGP 28/09 — ne jamais chiffrer un impôt de PV sur la RP ; la
latente s'affiche à titre d'information « — exonérée (résidence principale) »)), `ncBiensImmo(d)` (tous les biens, produit net
de vente = part − CRD − impôt), `ncRowsOrigine` (lignes du document). Choix CGP : montant
NET DE CRÉDIT ET D'IMPÔT ; préconisation en tête + question si vente < 1 an. Non traités :
réintégration des amortissements LMNP (LF 2025), dossier recentré (« rien de plus »).
AV/PER : `anneeOuverture` (carte du placement, `data-nc-annee-ouverture`), pastille au
document. Banc `t_origine_immo.js` = 27/27.

### v261 (28/09) — dossier BRICHET : le document ne dit que ce qui a du sens
- **Bug racine** : `enCouple` (situation) ignorait `conjointQ` → une pacsée retraitée SANS
  conjoint renseigné n'était pas un « foyer retraité ». `conjointRens = enCouple &&
  d.conjointQ === "oui"` ; `foyerRetraite = retraiteC && (!conjointRens || retraiteJ)` ;
  même correction sur `foyerRetraiteQ` (questions) et `foyerRetraiteD` (devoirs).
- **Loyers** : `push()` de `ncCalcEndettement` porte `brut / labelDoc / regleDoc` ; les loyers
  sont poussés `{ brut: loyersLoc, labelDoc: "Loyers encaissés", regleDoc: null }`, `mensuel`
  reste la valeur retenue (× 75 %) pour la capacité. Le document (`Ligne`) affiche
  `labelDoc/brut`, le total des revenus du document = somme des `brut`. La règle bancaire
  n'apparaît nulle part dans le document.
- **Entretien (pop-up)** : `d.entretien = { epargneMensuelle, emprunt }` (AUDIT_DEFAUT
  `entretien: {}`) ; dans `ncSynthese` : `ENT`, `veutEpargner = ENT.epargneMensuelle !==
  "non"`, `veutEmprunter = ENT.emprunt !== "non"` gèrent l'objectif « Augmenter votre
  épargne », l'objectif/point fort/préco/question « capacité d'endettement » (question
  `fam: "levier"` → `skip`). `S.entretien` liste les questions à poser (épargne : actif non
  retraité, non recentré, effort < 18 %, sans réponse ; emprunt : ≥ 60 ans ou retraité, < 70,
  capacité ≥ 80 000 €, sans réponse). **Deux passes** : tant qu'une question est sans
  réponse, `ncSynthese` se rappelle avec les réponses provisoires « non »
  (`__ncEntretienPasse2`) et rend cette synthèse-là avec la liste des questions. Composant :
  `entOpen` + modal `data-nc-entretien="1"`, chips Oui/Non écrivant `d.entretien`,
  « Continuer » désactivé tant que tout n'est pas répondu ; ouvert dans `goEtape` (étape ≤ 6
  → > 6) après les incohérences, et depuis « Continuer quand même » du modal incohérences.
- **Retraité** : formulations d'emprunt sans « préparer votre retraite » (objectif « protéger
  vos héritiers et compléter vos revenus », préco locatif idem).
- **Commercial** : locatif `type: "commerciale"` (chip), autres biens `type: "commercial"`,
  libellés `TYPE_B` / `TYPE_LOC`.
- **Enjeu** PACS/union libre : « Protéger votre partenaire de PACS / concubin en cas de
  décès : testament et assurance-vie » (remplace « existence juridique au survivant »).
- **Audit AV/PER** : préco « Audit de votre contrat d'assurance-vie et votre PER … (un PER
  se transfère vers un autre PER ; une assurance-vie ne se transfère pas) » — libellé
  singulier/pluriel selon les contrats.
- **Pastilles** `NcSmiley` = coche / croix / anneau (`data-nc-pastille`).
- **Âge + 990 I** : `NcAgeAlerte({ date, qui })` sous les deux dates de naissance
  (`data-nc-age="client|conjoint"`, `data-nc-alerte-990="non|avant|apres"`) : âge en clair ;
  dès 65 ans encart ambre « Tournant des 70 ans — art. 990 I » avec délai et date du 70e
  anniversaire ; dès 70 ans encart rouge « art. 757 B », versements antérieurs conservés.
- **Piège** : `regen_helpers.js` (`grabC`) coupe une constante sur `;` à profondeur 0 en
  suivant les guillemets `' " \``. Une **apostrophe dans un commentaire** à l'intérieur
  d'`AUDIT_DEFAUT` (« réponses de l'entretien ») a ouvert une chaîne fantôme : le harnais
  a englobé `NC_CLIENTS_TYPES`, `migrateAudit` et `NcChip` (JSX) → « SyntaxError: Unexpected
  token '<' » sur 6 bancs. Pas d'apostrophe dans les commentaires des constantes extraites.
- Bancs `t_brichet.js` (28) et `t_age_990.js` (29) → 29/29. Le banc Brichet construit la
  fiche à partir de la fiche « Veuve » (`situation: "pacse"`, pas `"pacs"`) ; `S.revenus`
  vient de `ncCalcEndettement`, pas de `ncSynthese` ; les objectifs recommandés sont des
  chaînes, pas des objets.

### v262 (28/09) — défilement à l'apparition de plusieurs lignes
- Le CGP : « combien de logements : si je mets 2, il m'ouvre en décalage la page et je suis
  obligé de remonter ». `NcReveal({ last })` descendait vers `lastElementChild` — juste pour
  « + Ajouter » (une ligne), faux pour un compteur 1…8 (Bien 1 à −386 px du pli). Même
  défaut sur enfants, donations, autres biens, crédits, placements.
- Correctif : prop `name` ; `window.__ncRevealN[name]` mémorise le nombre de lignes au
  dernier montage ; on descend sur `children[min(prev, n-1)]` = première ligne nouvelle ;
  `n <= prev` (suppression) → aucun défilement. Le garde « changement d'étape < 900 ms »
  reste et remet le compteur à jour au montage de l'étape.
- Banc `t_reveal_scroll.js` (30) : vérifie que « Bien 1 » (puis « Bien 3 » après « 4 ») a
  son haut dans la zone `.overflow-y-auto`, que « 1 » ne fait pas sauter la page, idem
  « Enfant 1 ». Contre-épreuve faite sur v260 : 3 FAIL. 30/30.
- **Règle métier rappelée** : résidence principale = exonération totale de plus-value
  (`ncPvImmo` `rp: true` → 0), voir v260.
- **Plus-value, note du CGP (28/09)** : `ncPvImmo` rend désormais `etat` (« exonérée
  d'impôt (22 ans révolus) — prélèvements sociaux 17,2 % sur N % de la plus-value »,
  « exonérée d'impôt et de prélèvements sociaux (30 ans révolus) », abattements sinon) et
  `bord` (durée 21/22/29/30 : la date exacte de l'acte décide — le document écrit « années
  révolues à la date de l'acte : date exacte à vérifier », la préco « à recalculer sur la
  date exacte de l'acte »). Entre 22 et 30 ans le texte dit « prélèvements sociaux…
  l'impôt étant exonéré au-delà de 22 ans » et non « impôt de plus-value ». Banc 27 vérifie
  22 / 25 / 29 / 30 ans contre la règle réécrite. Règle complète dans
  analyse-etude-patrimoniale (section « Plus-value immobilière des particuliers »).

### v263 (28/09) — questions complémentaires (six sujets, note libre), TMI corrigeable avec l'impôt
- Titre du pop-up : « Questions complémentaires » (le CGP : « écris Questions plutôt que… »).
- **Sans réponse = comportement d'avant** (décision explicite du CGP) : la seconde passe
  « non provisoire » de v261 est SUPPRIMÉE. `veutX = ENT.x !== "non"` ; seul « non » retire.
  Le pop-up exige toujours une réponse avant la synthèse (« Continuer » désactivé).
- Nouvelles clés `d.entretien` : `liquidites`, `vente`, `defisc`, `transmission` ;
  `d.entretienNotes[cle]` (note libre, input sous les chips). `NC_ENT_LIB` = libellés.
  Gates : `veutPlacer` (problématique liquidités dormantes, objectif « Réorienter », préco
  « Souscription d'un nouveau contrat », question trésorerie `skip`) ; `veutReplacer` (préco
  « Replacer le produit », question vente `skip`) ; `veutDefisc` (→ `perPertinent = dans30 >=
  5000 && veutDefisc`, branches PER des précos, `conseilsR`/`precosR` du recentré) ;
  `veutTransmettre = ENT.transmission === "oui"` (ADDITIF : objectif « Anticiper la
  transmission… » + préco « Étude d'une donation-partage ou d'une donation en nue-propriété »).
- Déclencheurs des questions : voir analyse-etude-patrimoniale (journal + liste des six).
  Textes d'aide au format « Sur « non », le document ne … » (plus « sans réponse positive »).
- Document : dans la carte participation/notes, ligne `{ t: "Questions complémentaires", d }`
  = réponses « oui/non » + note, col-span-2 comme les notes. innerText sort en MAJUSCULES
  (CSS uppercase) → regex `/i` dans les bancs.
- **TMI** : dans le bloc `Q « Souhaitez-vous corriger avec l'impôt réellement payé »`, seconde
  colonne `data-nc-tmi-corr` : chips 0/11/30/41/45 (`set("tmi")` + `tmiManuel: true`), rappel
  « TMI calculée par le simulateur : N % », lien « revenir à la TMI calculée ». La tuile TMI
  du simulateur (« Recaler le dossier ») reste. L'ancien emplacement (Details « Corrections /
  cas spécifiques ») reste aussi.
- Bancs : `t_brichet.js` étendu (six questions, note, document), `t_tmi_corr.js` (31).
  Locators : `[data-ncq]:has(> div > span:has-text(...)) button:text-is("Oui")` — un
  `div:has(> div:has-text())` remonte jusqu'au conteneur de l'étape et clique n'importe quel
  « Oui ». Les bancs moteur qui attendent les sorties « d'avant » passent
  `entretien: { …: "oui" }` (t_retraite, t_origine_immo). 31/31.

### v264 (28/09) — « Ce que votre capital peut vous verser » (maquette C)
- Maquettes présentées AVANT de coder (`maquettes_capital.html`, PNG A/B/C) — le CGP : « avant
  de tout chambouler, présente-moi des maquettes ». C retenue ; réponses : deux colonnes
  avant/après, 80 et 90 ans, retrait calculé mais modifiable, tous les dossiers, 2/5/7 %,
  mention dynamique ; « sans entamer le capital » incompris → supprimé.
- Moteur (module, JS pur, extrait par regen_proj.py — patterns ajoutés) : `ncCapRetrait(C,
  annees, r)` (annuité, r = 0 → C/n), `ncCapDuree(C, W, r)` (Infinity si intérêts ≥ retrait).
- `NcProjection` : état `retraitCap` (chaîne, vide = estimation), carte `data-nc-cap-verser`
  après « À N ans, votre situation », avant les hypothèses. Capitaux `R.avPla` / `R.natPla`,
  âge de départ `R.ageFin`, âges `[80, 90]` ou `[ageFin+10, ageFin+20]` si ageFin ≥ 79,
  besoin par défaut `intro.baisse`. Tableaux `data-nc-cap-table="avant|apres"`, champ
  `data-nc-cap-retrait` (nc-syn-noprint), lecture `data-nc-cap-lecture`. Carte
  `nc-print-avoid` (tient sur une page).
- Banc `t_cap_verser.js` (32) : formule réécrite, cellule 90 ans / 5 % recalculée sur le
  capital lu dans la carte, retrait 100 → 12 coches, 99 999 → 0, mention imprimée, champ non
  imprimé. Onglet = bouton « Analyse R2 » (pas « Projection »). innerText en MAJUSCULES → `/i`.
- **Piège** : un handler inséré par script entre un `if {…}` et son `else` (t_recentre) a fait
  une SyntaxError que `grep FAIL` ne voit pas — toujours lire le code de sortie (`EXIT $?`) et
  `node --check t_*.js` après une modification en masse des bancs.

### v265 (30/09) — plus aucun dialogue natif du navigateur
- Le CGP : « pourquoi je vois encore ces fenêtres moches ? je t'ai demandé de tout
  uniformiser ». Règle ABSOLUE : **jamais `window.confirm` / `alert` / `prompt`**. Toute
  confirmation passe par une fenêtre du simulateur, toute erreur par un message en ligne.
- Confirmation uniforme dans le composant audit : état `confirmOpen = { titre, texte, ok, onOk }`,
  rendu `data-nc-confirm="1"` (liseré ambre #b45309, Annuler / bouton d'action), z-[80].
  Usage : `chargerClientType` — si dossier déjà saisi, `setConfirmOpen({... onOk: () =>
  chargerClientType({ ...ct, __confirme: true }) })`. Logo > 2 Mo : `logoErr` + `data-nc-logo-err`.
- Garde-fou dans `verif.sh` (étape 1) : `grep` de `window.confirm( / alert( / window.prompt(`
  doit rendre 0 — attention, il lit aussi les commentaires et la ligne BUILD (écrire
  « dialogue natif » plutôt que le nom de la fonction).
- Bancs : `t_clients_types.js` vérifie la fenêtre entre deux clients types (le `page.on('dialog')`
  des bancs ne sert plus qu'en filet). 32/32.

### v266 (08/10) — plusieurs banques, travaux RP, frais d'entrée, pastilles A, points forts allégés
- `d.banquesAutres: []` (AUDIT_DEFAUT) ; état civil : bloc `data-nc-banques-autres` (« + Ajouter
  une banque », croix) ; `banquesConnues` les intègre ; document : état civil « Banques : LCL,
  Boursorama » (helper `banque()` ~l.12429) et tuile activité (`bqTuile` dans ncSynthese).
- `d.rpTravaux` : champ « Travaux réalisés » à côté du prix (bloc origine RP) ; latente écran =
  valeur − prix − travaux ; `ncPvImmo({ …, travaux })` → `travauxRet = duree > 5 ?
  max(prix×15 %, réels) : réels` (art. 150 VB : réels OU forfait) ; `ncBiensImmo` passe
  `travaux: d.rpTravaux` (× quote) ; `ncRowsOrigine` : « prix N € + T € de travaux ».
- Avoirs : `fraisEntreeQ` (oui/non/nsp) + `fraisEntree` (%) — fiche du placement
  (`data-nc-frais-entree`, sous le rendement constaté, non/nsp = point à relever).
- **Pastilles état des lieux (maquette A retenue)** : `Badge({ k, v, tone })`, `TONE`
  neutre/ok/ko/or/bleu, `data-nc-patch="<tone>"`, deux spans (clé grise capitales 8 px |
  valeur colorée 9 px). `suiviBadges` rend `{k, v, tone}` ; l'ancienne forme `{txt,bg,fg,bd}`
  reste acceptée. Bancs qui lisent le texte : « OUVERT 2008 · plus de 8 ans » (innerText
  colle clé + valeur, séparées par un espace) → regex `/Ouvert\s*2008/i`.
- Points forts : `pucesEnd = []` (plus de plafond / mensualité / finançable / crédit RP),
  « Le socle patrimonial est posé » retiré, `VERIF_SUPPORTS` = tournure dictée. Les points
  forts s'affichent dans **Analyse R2**, pas dans l'audit (règle 15/09) — un banc doit
  cliquer « Analyse R2 » pour les lire (`t_rp.js` : `notP` sur les puces retirées).
- Maquettes `maquettes_pastilles.html` (A/B/C) présentées avant intégration. Banc `t_v266.js`
  (33). 33/33.

### v267 (08/10) — axes de travail réécrits, phrases courtes
- `faiblesses` : précaution `courtTermeM < cibleBasM * 0.5` (titre « Épargne de précaution
  insuffisante / court terme », d = montant) ; « Performance et gestion de l'épargne long
  terme » (`inconnuDe(x)` : rendement / gestion / frais d'entrée ; `TYPES_MAJ`) ;
  « Versements programmés insuffisants au vu de vos revenus » ; axe endettement
  `t: "Capacité d'endettement"`, `d: "utilisée à N % sur les 35 % autorisés"`, trois puces
  dictées. `t_controle.js` (Mars/Avril) attend la nouvelle formulation exacte.
- Règle d'écriture absolue : phrases courtes (voir analyse-etude-patrimoniale). À appliquer à
  toute nouvelle puce ; un passage global sur les anciennes puces reste à proposer au CGP.
- **v268 — option C retenue** (maquettes A/B/C présentées) : composant `MiniTab({ lib, t0,
  t1, a, b, cle })` dans NcProjection (`data-nc-pedago="arb|red"`), mini-tableau « lib à t0 |
  a », « lib à t1 | b », « Différence dans H ans | + (b−a) » (vert), inséré dans les enfants
  de la carte (après la case « versé sur un livret » pour la redirection) ; `effSub` = null
  quand la carte est cochée, le €/mois (`eff`) conclut. Arbitrage : M(1+t)^H ; redirection :
  `ncpCap(0, v, t, H)` (versements mensuels capitalisés, défaut t0 = 2,5 % comme le moteur).
  `t_gisements.js` 3 bis recalcule les six chiffres.

### v269 (08/10) — lisibilité (dossier FAURE)
- Carte participation (`participation` IIFE ~l.9525) : rendu compact `data-nc-participation="compact"`
  (ligne libellé / valeur), horizon `data-nc-horizon-curseur` (trait + 4 crans + curseur),
  notes et questions en texte dessous ; ligne précaution « Épargne de précaution à conserver — N € ».
- Recentré (`forcesR` / `faibR`) : puces longues retirées ; axe « Préparation de votre retraite »
  d = « Le temps est votre meilleur allié, N ans pour consolider votre stratégie », 3 puces dictées ;
  `probR` titre aligné.
- Titre section gisements : « Où trouver l'épargne complémentaire » (deux endroits : `data-nc-chap`
  ET le texte visible sur la ligne suivante — le premier remplacement n'avait touché que l'attribut).
  Bancs : t_controle (ordre des rubriques), t_sticky_app (hors verif), t_recentre.
- **Piège** : les QUESTIONS se déclenchent par regex sur les titres des faiblesses (`re:`) —
  renommer un axe (« Préparer » → « Préparation de votre retraite ») fait disparaître la
  question « retraite » si la regex n'est pas étendue (t_doc_edits : « moins de deux questions »).

### v270 (08/10) — rien à gérer sur le court terme
- `suiviBadges` : `courtT = type livrets || compte_courant` → pas de pastille GESTION / PROFIL
  (CEL et PEL sont des `livretType` du type `livrets`). La fiche du placement reste masquée pour
  ces types (`estCourtTerme`), `inconnuDe()` les exclut déjà. Banc t_v266 : aucune pastille
  GESTION/PROFIL sur les lignes « Livrets / court terme » et « Compte courant ».
- Bloc fiscal du document (grille `grid-cols-4`, ~l.13249) : tuile « Revenus estimés à la
  retraite » `col-span-2` (ou `col-span-3` sans tuile d'avantages) — `data-nc-tuile-retraite` ;
  le CGP : « mieux occuper la largeur pour que les blocs du bas soient moins hauts ».
- `VERIF_SUPPORTS` = « Auditer votre contrat : allocation et performances des supports » (fin
  supprimée). Force « Fiscalité déjà optimisée » : `dispositifsLib` (libellés courts des
  `reductionsLignes`, + « PER » si `F.deductions > 0`) entre parenthèses dans la puce.

### v271 (08/10) — « hypothèse de rendement » partout, bandeaux par nature supprimés
- NcProjection : intro des gisements, `MiniTab` (ligne cible « (hypothèse de rendement) »),
  cartes PER/AV (`String(nb(h.tMed, 5.2)).replace(".", ",")` — `tMedTxt` n'est PAS dans cette
  portée), note de la ligne revenus du tableau « À N ans », mention de bas de carte, en-tête
  « Hypothèse de rendement net » de « Ce que votre capital peut vous verser ».
- Les deux bandeaux (« Trésorerie libérée… », « Meilleur rendement… ») sont retirés du rendu ;
  `data-nc-gisements-total` (bloc « d'épargne à réorienter ») est désormais la seule source
  lue par `t_gisements.js` (`totalBloc()` : total / libérés / intérêts ; `pedagoDiff('red')`
  pour le capital à l'horizon). Variables `ass`, `rend`, `mRend` restent (bloc total).

### v272 (08/10) — réduction locative dans l'impôt économisé, cinq blocs mis de côté
- **Bug** : la réduction d'impôt saisie à la main sur le locatif n'entrait pas dans la tuile
  « Impôt économisé par an ». `reducMoy` ne lisait que `reducAn` (dispositifs) ; repli ajouté :
  `L.loc && redDur > 0 ? redIr : 0`.
- **`NC_MASQUES`** (après `NC_VENTE_ANS`) : `Object.assign({ fiscaliteOperation, alerteEnveloppe,
  priorites, capitalVerser, tableauAvantApres: true }, window.__NC_MASQUES || {})`. Le code des
  blocs reste (« garde-le dans un coin ») : ne JAMAIS les supprimer, ne jamais les réactiver sans
  accord du CGP. Usages : `!NC_MASQUES.x && (…)`, `if (NC_MASQUES.x) return null;`, et pour la
  carte « À N ans » un fragment `{!NC_MASQUES.tableauAvantApres && (<>…</>)}`.
- **Harnais** : `regen.sh` et `regen_proj.py` injectent avant React
  `window.__NC_MASQUES = {…tout false}` sauf si `window.__NC_MASQUES_PROD` est posé — les
  bancs historiques continuent de couvrir les blocs dormants ; `t_masques.js` (étape 34) pose
  `__NC_MASQUES_PROD = true` et vérifie le mode livré. `regen_proj.py` extrait `NC_MASQUES`
  par la regex `const NC_MASQUES = Object\.assign\(\{[\s\S]*?\|\| \{\}\);` — garder cette forme.
  **Tout nouveau drapeau doit être ajouté aux deux injections** (sinon le banc le voit à true).

### v273 (09/10) — onglet Simulation : cartes AV / PER, simulateur prérempli
- Drapeau `NC_MASQUES.simulationAncienne` : tout l'ancien corps du volet `preco` (problématiques,
  régimes, forces/axes, protection du conjoint, signature, mentions) est enveloppé dans
  `{!simulationCartes && (<>…</>)}` (de `<NcProjection…>` jusqu'avant la barre présentation) ;
  `simulationCartes = synMode === "preco" && NC_MASQUES.simulationAncienne`.
- `ncSynthese().simu` : `{ per, envBas, envHaut, duree, dureeRetraite, ageRet, courtTermeM,
  precaCible, liquidites, venteNet, tmi, age, nbEnf, foyerRetraite }` (fourchette déclarée via la
  même table que `NCP_ENV_TRANCHE`, horizon `<5/5-10/10-15/>15` → 5/10/15/20 ans).
- `ncSimuFigures(syn, figR2)` → cartes ; `NcSimuCartes({ syn, figR2, onSimuler })` (avant
  `NouveauClientModal`). `figR2` = `{ENV, envPoche, gainsMens, precaCible, tMed, ageFin, H}`
  remonté par `NcProjection` via la prop `onFigures` (useEffect sur R) — donc seulement si
  l'Analyse R2 a été ouverte ; sinon fourchette déclarée (borne haute).
- Répartition : PER = borne basse de la fourchette si elle est < total, sinon moitié ; AV = reste.
  Versement initial AV = liquidités − précaution cible (+ produit net d'une vente à replacer) ;
  durée = âge retraite − âge, sinon horizon. Pas d'hypothèse de rendement sur la carte : elle se
  choisit à l'étape Allocation (`inputs.allocation` décide le rendement du simulateur).
- Chaîne de lancement : `simuler(produit, fig, etape, print)` dans la fenêtre → `upd(produit,
  versementInitial, versementMensuel, dureeAnnees[, tauxIR])` → `valider()` → `onSimuler(etape,
  print)` ; `App.simulerDepuisAudit` pose `printAttenduRef` puis `setStep(n)` ; un `useEffect`
  sur `[step, inputs]` appelle `handleOpenPrint()` à l'étape 5 (pas de closure périmée). Props
  traversent `Step1Identite` (`onSimuler`). Étapes : 2 = Produit, 5 = Présentation.
- Sélecteurs de banc : `[data-nc-simu-cartes]`, `[data-nc-simu-carte=av|per]`,
  `[data-nc-simu-ligne="…"] [data-nc-simu-val]`, `[data-nc-simu-btn=ouvrir|imprimer|presenter]`.
  Étape Produit : `.opt-card.selected`, `label.label` « Versement à la souscription » → input,
  « Versement programmé » → `.num`, durée = `input[type=range][min="1"][max="40"]`.
- `t_simu_cartes.js` (étape 35). Le pied-de-page de `verif.sh` passe à 35/35.

### v274 (09/10) — passage complet des puces
- Trente reformulations dans `ncSynthese` (forces / faiblesses, `pucesCap`, `chiffragePER`, bloc
  rattachement / pension → 3 puces). Liste exacte dans le skill métier (« PUCES VALIDÉES LE 09/10 »).
- Bancs alignés : `t_controle` (formulations exactes Mars/Avril : épargne LT, insuffisante,
  endettement), `t_exp167` (regex PER TNS `plafond PER ≈`), `t_rdv1`, `t_recentre`.
- Piège NBSP : `rep()` de `v274.py` matche `[ \u00a0\u202f]` à la place de chaque espace et
  reporte l'insécable devant `% € : ; ! ?` dans le nouveau texte.

### v275 (10/10) — retour à l'étude depuis le simulateur
- `App` : `retourAudit` (posé par `simulerDepuisAudit`), `reouvrirAudit` (`{volet, n: Date.now()}`),
  `revenirAudit()` → `setStep(1)`. Barre `[data-nc-retour-audit]` sous le `Breadcrumb` si
  `retourAudit && step > 1`.
- `Step1Identite` : prop `reouvrir` ; `useEffect` sur `reouvrir.n` → `modalNiveau="complet"`,
  `modalVolet`, `newClientOpen=true` (seulement si `inputs.audit` existe).
- `NouveauClientModal` : props `voletInitial` (→ `synMode`), `etapeInitiale` (→ `etape`, `visited`).
  Le dossier `d` est rebâti depuis `inputs.audit` (sauvé par `valider()`), donc mêmes cartes.
- Banc : `t_simu_cartes.js` (clic retour → `[data-nc-simu-cartes]` visible, mêmes chiffres).

### v276 (10/10) — ordre unique des pastilles
- `NcOuiNon` = `[oui, non]` ; pastilles handicap `[oui, non]` ; `NC_ASSUR_RENEG_OPTS` et quotités :
  `nsp` = « Ne sait pas ». Garde `verif.sh` étape 1 (grep sur `{v:"non",l:"Non"},{v:"oui"`,
  `{ v: "non", l: "Non" }, { v: "oui"`, `"Je ne sais pas"`). `t_devoirs.js` lit « Ne sait pas ».

### v277 (10/10) — épargne à deux repères, mode présentation direct, prime + 100 €
- `NC_EPARGNE_FIN_FR = 0.09`, `ncEpargneSousMoyenne(pp, immo, rev)` (après `NC_EPARGNE_MOYENNE_FR`) ;
  utilisée par le point fort « Discipline d'épargne » (`pp/rev ≥ 9 %`), l'axe « Versements
  programmés insuffisants », l'objectif recommandé et la question `epargneMensuelle`. **Ajoutées au
  `SPEC` de `regen_helpers.js`** (sinon `ReferenceError` dans le harnais).
- `App` : `presAuto` (+ `versPresentation()`), effacé en quittant l'étape 5 ; `Step4Resultats`
  prop `onPresenter` → bouton `[data-nc-vers-presentation]` ; `Step5Presentation` prop
  `presInitial` → `presOpen` initial + `useEffect`. `simulerDepuisAudit(5, false)` pose aussi
  `presAuto` (bouton « Présentation client » des cartes).
- `ClientWowScreen` : coche « Prime périodique majorée » → `setPrime(Math.round(base) + 100)`.
  La coche est sur la slide « Projection » ; fermer le plein écran par `Escape` avant tout clic
  en dessous (overlay `.wow-screen` intercepte les clics).

### v278 (12/10) — acheter ou louer sa RP
- Avant `NcSimuCartes` : `NC_AL_VILLES` (38 villes : prix ancien / neuf / loyer au m²), `NC_AL_TYPO`,
  `ncFraisAcquisition(prix, {neuf, primo})`, `NC_AL_GARANTIE`, `ncAcheterLouer(P)` (boucle
  mensuelle 30 ans ; `pts[y]` = année y ; `pmAncien/pmNeuf/pmAncienNP/pmNeufNP`), composants hissés
  `NcAlIn/NcAlChips/NcAlRow/NcAlK` (**jamais définis dans le rendu : le champ perdrait le focus**),
  `NcAcheterLouer({init, onClose})` en portail sur `document.body` (`.nc-al-root`, z 2147483500,
  impression par `body.nc-al-print`). Tous ajoutés au `SPEC` de `regen_helpers.js`.
- `ncSynthese().simu.acheterLouer` (locataire seulement) : ville, loyer, projet RP (prix = budget,
  apport, durée, taux arrondi 2 déc.), horizon. Carte `[data-nc-simu-carte="acheter-louer"]` dans
  `NcSimuCartes` (prop `onAcheterLouer`), chaîne App → Step1Identite → NouveauClientModal.
- App : `acheterLouer` / `ouvrirAcheterLouer(init)` (sans init : `ncSynthese(inputs.audit)` à la
  volée) ; `Step2Produit` prop `onAcheterLouer` → carte `[data-nc-al-ouvrir]` rendue À LA PLACE de la carte capi quand `!isEntreprise` (v279).
- Sélecteurs : `[data-nc-acheter-louer]`, `[data-nc-al="champ"]`, `[data-nc-al-chip="k:v"]`,
  `[data-nc-al-tuile=pm-ancien|pm-neuf|pm-np]`, `[data-nc-al-ecart]`, `[data-nc-al-sensib]`,
  `[data-nc-al-table] tr[data-nc-al-an]`, `[data-nc-al-btn=imprimer|presenter|retour]`.
- `t_acheter_louer.js` (étape 36) : barème contrôlé sur l'exemple public (250 000 €), monotonie,
  sensibilité, carte FAURE, préremplissage, focus, grille Paris, présentation, retour, étape Produit.

### v280 (12/10) — acheter ou louer en quatre écrans
- `NcAcheterLouer` : état `etape` 1..4, `pres` ; `data-nc-al-etape` sur la racine, fil
  `[data-nc-al-fil=n]` (recul seulement), boutons `[data-nc-al-btn=precedent|continuer|presenter|
  imprimer|retour]`, `[data-nc-al-resultat]`. Composants hissés `NcAlLab/NcAlFld/NcAlChips2/
  NcAlCarte/NcAlHint` — **ne jamais envelopper dans une flèche définie dans le rendu** (`const Fld =
  (p) => <NcAlFld…/>` remonte le champ et perd le focus : vu et corrigé).
- Quotités : `P.quotites = "q1_q2"` → `quot` dans `ncAcheterLouer` (assurance × somme / 100).
  `syn.simu.acheterLouer` porte `couple, prenomC, prenomJ` ; `init.nom` pour l'en-tête.
- `NcAlFld` formate les montants ≥ 1 000 en milliers au blur (`Intl.NumberFormat fr-FR`) ; le moteur
  retire `\s` (NBSP et fine comprises) avant `parseFloat`.
- `t_acheter_louer.js` parcourt les quatre écrans (préremplissage, focus, grille Paris, assurance
  doublée → mensualité, fil, présentation, retour, carte étape Produit).

### v281 (12/10) — acheter ou louer : curseurs, commune libre, commentaires, tableau lisible
- `NcAlSlide({P,set,k,l,min,max,step,suf,aide})` hissé ; `[data-nc-al=k]` (valeur) et
  `[data-nc-al-curseur=k]` (range). Le `select` ville vaut `"__autre"` hors grille → champ
  `[data-nc-al="villeLibre"]`. `P.notes` → `[data-nc-al="notes"]`, repris `[data-nc-al-notes]`.
- Couple : `syn.simu.couple / prenomC / prenomJ` (toujours exposés) ; `ouvrirAcheterLouer` retombe
  sur `inputs.situationFamiliale === "couple"` sans dossier.
- Moteur : `pts[y]` porte la décomposition (`val, crd, rev, capRemb, placeNet, cumCout` côté achat ;
  `apport, ecarts, gains, impot, cumLoyer` côté location). `window.__ncAlR` = dernier résultat, lu
  par le banc. Tableau `[data-nc-al-table] tr[data-nc-al-an]` (≥ 14 lignes), cartes
  `[data-nc-al-decomp=location|ancien|neuf]`.

### v282 (12/10) — écran résultat refait
- `resultat` : `[data-nc-al-rappel]`, curseur `[data-nc-al-curseur="horizon"]` (+ `[data-nc-al-horizon-val]`),
  cartes `Opt` → `[data-nc-al-decomp=location|ancien|neuf]`, `[data-nc-al-option-pat]`,
  `[data-nc-al-mens-depart]`, badge `[data-nc-al-meilleure]`. Points morts dans des `<b
  data-nc-al-tuile=…>` (toujours 3, les bancs comptent). Plus de `G` ni de SVG.

### v283 (12/10) — grille 88 communes, neuf « L » ou « e »
- `NC_AL_VILLES[i].neufSrc` : `"L"` = Logisneuf (prix promoteurs), `"e"` = estimation ancien × 1,3.
  L'écran 1 affiche l'estimation en orange + bandeau `[data-nc-al-neuf-estime]` ; le résultat
  ajoute « (estimation, à vérifier) » si le prix neuf n'a pas été modifié. Grille triée par nom.
- Pour recaler une ville : modifier `prix / neuf / loyer`, passer `neufSrc` à `"L"` quand la source
  est un vrai prix promoteur, et noter la source dans le commentaire de tête.

### v284 (12/10) — écran 1 refait, curseurs au m²
- `NcAlTuilePrix({P,set,titre,c,k,m2,src,estime,surface,onM2,children})` hissée ; prix = m² ×
  surface (`setM2`), le champ prix reste libre. Sélecteurs : `[data-nc-al-curseur="m2-prixAncien|
  m2-prixNeuf|surface|travaux|loyer"]`, pastilles `[data-nc-al-chip="typo:T3"]` (plus de `select`
  typo), `[data-nc-al-m2=k]`. Le CGP ne veut pas qu'on « se prenne la tête » sur le m² : grille
  indicative, pas de nouvelle recherche de prix.

### v285 (12/10) — blocs du résultat aux mêmes lignes
- `Ligne({l,v,sub,c,fort,data})` → `[data-nc-al-ligne=apport|mensuel|charges|budget|placement|vie|deces|
  revenus|vs-locataire]` ; `Bloc` (badge hors neuf). Moteur : `pts[y].brut / loyerM / ecartM` côté
  location ; `R.quot, R.tf0, R.copro0, R.loyerAn(y), R.tPlac` exposés. `P.nbBenef` (défaut
  `inputs.nbBeneficiaires`), `P.abattement` 9 200 si couple. `deces990()` dans le composant.

### v286 (12/10) — neuf : estimation × 1,5 et TVA 5,5 / 20
- Grille `NC_AL_VILLES` : les entrées `neufSrc:"e"` valent désormais ancien × 1,5 (prix d'entrée
  d'un programme ; ex. Montmorency T3 414 k€ en TVA 5,5 % vs 280 k€ + travaux dans l'ancien).
  Les 15 villes `"L"` (Logisneuf) inchangées. Toute estimation reste affichée comme telle
  (`[data-nc-al-neuf-estime]`).
- Écran 1, sous la tuile neuf : chips `[data-nc-al-chip="tvaNeuf:20|5.5"]`, état `P.tvaNeuf`
  (défaut `"20"`). Hint : à 20 % ce bien vaudrait ≈ prix × 1,2 / 1,055. Le rappel du résultat
  porte « (TVA 5,5 %) » quand sélectionné. Le prix saisi reste TTC : la TVA ne change pas le
  calcul, elle documente la nature du prix affiché.
- Banc `t_acheter_louer.js` : Grenoble = estimation × 1,5 et clic chip TVA.

### v287 (12/10) — budget commun, tableau horizontal, règle après crédit
- Moteur `ncAcheterLouer` : `coutSerie(prix, neuf)` (coût mensuel sur 360 mois), `loyerSerie`,
  `budget[m] = max(coutA, coutN, loyer)` ; `achat()` place `budget[m] − coutM` ; `location(placeEcart)`
  (plus de paramètre `ref`) place `budget[m] − loyer`. `locAncien === locNeuf === locRef` (alias
  conservés pour les bancs). Retour : `budgetM1`, `budgetFixePar` ("neuf"|"ancien"|"location"),
  `ecartLocM1` ; `ancien/neuf.ecartM1` ; `pts[y].placeBrut / placeVerse` côté acheteur.
  Après le crédit, `budget[m]` retombe au loyer → locataire place 0, propriétaires placent
  loyer − charges (vérifié au banc : écart locataire année d+2 = 0, acheteur ≈ loyer − charges).
- Résultat : `blocLoc/blocAchat/Bloc/Ligne` supprimés → `tableau` `[data-nc-al-comparatif]` ;
  `opts` (location/ancien/neuf), `LIGNES` (apport, mensuel, charges, ecart, budget[cadre], placement,
  vie, deces, revenus) + ligne `patrimoine` → `tr[data-nc-al-ligne=…]` (10) ; `th[data-nc-al-decomp]`
  (3) porte `data-nc-al-option-pat` et `[data-nc-al-meilleure]` sur le max des trois. `cellLoc(key)`,
  `cellAchat(ref, pt, key)`, `fiscEtale(pts, nbAns)`.
- Rappel : deux `ul` `[data-nc-al-rappel-col=bien|financement]`.
- Banc : budget identique dans les 3 colonnes et = max des coûts ; ancien place son écart ; règle
  après crédit ; 10 lignes ; colonnes du rappel.
- PIÈGE (ce jour) : un patch python qui fait `s = s[:e].rsplit(...)` tronque le fichier à la ligne
  BUILD — 59 Ko au lieu de 2 Mo. Toujours `wc -c index.html` après patch ; backup `/tmp/index_vNNN_backup.html`.

### v288 (13/10) — colonne gagnante encadrée en vert
- `VERT = "#15803d"`, `colGagne(o, pos)` → bordures gauche/droite 3 px sur chaque cellule de la colonne
  dont `o.pat === best`, haut sur le `th`, bas sur la ligne patrimoine ; `th[data-nc-al-gagne=1|0]` ;
  badge « Meilleure » en vert. Sous le budget : « coût logement X ».
- Banc : un seul `[data-nc-al-gagne="1"]`, `borderLeftColor` rgb(21, 128, 61), « coût logement ».

### v289 (13/10) — la pastille TVA 5,5 % convertit le prix
- Saisie libre partout (13/10, « il faut un champ libre au cas où le montant dépasse le curseur ») :
  travaux a un `input[data-nc-al="travaux"]` ; tous les `range` (m², loyer, surface, travaux,
  `NcAlSlide`) ont `max={Math.max(max, val)}` et `value` non plafonné. Mention « saisie libre » sous
  prix et loyer. Banc : travaux 250 000 et loyer 9 000 acceptés, curseurs étendus.
- `setTva(v)` dans `NcAcheterLouer` : `prixNeuf × (1+new)/(1+old)`, arrondi à 100 € ; `NcAlChips2`
  reçoit `set={(k, v) => setTva(v)}`. Aide `[data-nc-al-tva-aide]`. Banc : 20 → 5,5 → 20 revient au
  prix initial (± 120 €). Avant v289 la pastille ne faisait que documenter (« ne fonctionne pas »).

### v290 (13/10) — tableau comparatif restylé
- Constantes `SABLE #f6f1e8`, `OR #b8924e`, `NAVY #1d2735`. `LIGNES` porte `{sec}` (intertitres
  « Chaque mois » / « À N ans », `tr[data-nc-al-section]`, hors du compte des `tr[data-nc-al-ligne]`
  qui reste 10) et `aide` (sous-libellé à gauche). Colonne de gauche sur fond sable, ligne budget
  avec liseré or, ligne patrimoine sur fond marine ; sous chaque patrimoine « la plus favorable » ou
  « − X vs la meilleure ». Coin haut-gauche : « Comparatif / à N ans ».

### v291 (13/10) — neuf en option, apport dynamique, patrimoine encadré
- `P.avecNeuf` ("non" par défaut). `PX = avecNeuf === "oui" ? P : {...P, prixNeuf: "0"}` → `R`, `S2`.
  Écran 1 : tuile neuf rendue seulement si option, sinon bouton `[data-nc-al-chip="avecNeuf:oui"]` ;
  dans la tuile, lien `avecNeuf:non`. Sous le tableau : `avecNeuf:oui-resultat` / `non-resultat`.
  Rappel : ligne neuf conditionnelle. Tout ce qui teste `R.neuf.prix > 0` suit (2 ou 3 colonnes).
- Résultat : carte apport à côté du curseur de durée — `input[data-nc-al="apportResultat"]` +
  `range[data-nc-al-curseur="apportResultat"]` liés à `P.apport` : tout `R` se recalcule.
- Ligne patrimoine : liseré or 3 px haut/bas, gauche sur le libellé, droite sur la dernière colonne.
- BANC : le neuf doit être ajouté explicitement à l écran 1 (`avecNeuf:oui`) avant les assertions à
  trois colonnes ; test retrait/ajout depuis le résultat (2 → 3), apport 120 000 → patrimoine change.

### v292 (13/10) — lignes vie / décès supprimées
- Patrimoine net HORS fiscalité : `achat()` → `pat = val(1−revente) − crd + place` (brut) ;
  `location()` → `pat = place` (brut) ; `netFisc` ne sert plus qu à `impot` / `placeNet`. Banc :
  identités `apport + ecarts + gains = pat` (et `pat === brut`), `val − crd − rev + placeBrut = pat`.
- Pastille « Détails » : `[data-nc-al-detail-btn=k]` dans la cellule patrimoine, état `detail`
  (`useState(null)`), bloc `[data-nc-al-detail=k]` sous le tableau avec le calcul ligne à ligne
  (locataire : apport + écarts versés = total versé + intérêts ; acheteur : prix (+ ½ travaux) →
  valeur revalorisée − revente − CRD + AV brute). Banc : total du bloc = cellule.
- `LIGNES` sans `vie` ni `deces` (8 `tr[data-nc-al-ligne]`, banc ajusté) ; `deces990`, `fiscEtale`,
  `quotCap` restent définis mais inutilisés dans le tableau. Astérisque sur « Patrimoine net * ».

### v293 (13/10) — quotités : civilité du dossier
- `ncSynthese().simu` et `.simu.acheterLouer` portent `civC` / `civJ` (`d.civilite`, `cj.civilite`) ;
  `ouvrirAcheterLouer` et la carte Simulation les passent dans `init`. Dans `NcAcheterLouer`,
  `civLib(civ, prenom, defaut)` → « Madame Claire », « Monsieur Julien », « Madame » seule sans
  prénom ; jamais « Monsieur » par défaut pour une Mme. Banc : ROUSSEL Mme / M., femme seule sans
  prénom → Mme ; libellé « 100 % Monsieur Julien ».

## ENVIRONNEMENT DE TEST

### 23/09/2026 — l'archive `bancs-figara.zip` ne portait pas tout : harnais recréé
`syn.js`, `local/` (vendors + stubs) et `_test_proj.html` manquaient dans l'archive.
Recréés dans `/home/claude/work` :
- `syn.js` : @babel/parser sur chaque `<script>` inline, dernière ligne « SYNTAX OK » ;
- `local/` : react, react-dom, babel copiés de `node_modules` ; `tailwind-stub.js`
  (`window.tailwind`), `chart-stub.js` (`new Chart` inerte), `supabase.js` (client
  sans réseau, aucune session → IdentityGate) ;
- **`regen_helpers.js`** (appelé par `./regen.sh`) : extrait de `index.html` les VRAIES
  fonctions du moteur (`ncCalcFisc`, `ncDetailRNI`, `ncCalcEndettement`, `ncSynthese`,
  `AUDIT_DEFAUT`, `ncInt`…) → `_harness_helpers.js` (JS pur) + `_harness_style.css`.
  Plus de stubs figés : le harnais raisonne avec le moteur réel ;
- `_test_proj.html` : tête = vendors + `local/tailwind-real.css` (remplace l'ancien
  générateur m/p/gap/w/h) + helpers ; pied = dossier `D` (Paul TESTEUR, 41 ans,
  célibataire, propriétaire avec un crédit RP 180 000 € / 18 ans, AV 45 000 €, livret
  avec 150 €/mois programmés, emploi à domicile 7 000 €/an, `capaciteEpargne`
  "300-500"), `D.tmi` posé par `ncCalcFisc`, `synth`/`syn` calculés, montage de
  `NcProjection`. `regen_proj.py` inchangé (ancres « const ncNbsp = » / « const D = { »).
- `./verif.sh` : 20/20 vert sur v249 dès la première passe.
**Réarchiver `bancs-figara.zip` avec ces fichiers en fin de session**, sinon la
prochaine conversation repart du même trou.

- Chromium : `/opt/pw-browsers/chromium` avec Playwright.
- CDN Tailwind **bloqué** : travailler sur `test_local.html` (Tailwind réel
  compilé) et les vendors de `local/`.
- Serveur : `python3 -m http.server 8899` **lancé depuis le répertoire de
  travail** (`setsid nohup python3 -m http.server 8899 >/dev/null 2>&1 &`), à
  contrôler par `curl -s -o /dev/null -w "%{http_code}" http://localhost:8899/test_local.html`
  → 200. Il MEURT entre deux tours : `ERR_CONNECTION_REFUSED` dans un test =
  serveur tombé, pas une régression. Le relancer avant de conclure.
- **`ErrorBoundary` avale les erreurs React** : « Une erreur technique est
  survenue » ne remonte JAMAIS en `pageerror`. Tout test Playwright doit aussi
  écouter la console : `page.on('console', m => m.type()==='error' &&
  /FIGARA\] render error/.test(m.text()) && errs.push(...))`. Sans cela, un
  écran planté passe vert (plantage projet RP du 03/09, invisible à `t_rp` v1).
- **Espaces insécables dans les assertions** : les libellés rendus contiennent
  `\xa0` avant `€` et `%` (`"35 %"`, `≈ 240 000 €`). Une regex littérale avec un
  espace normal ne matche pas — écrire `[\s ]` (ou normaliser `innerText` par
  `.replace(/[  ]/g,' ')`). Les titres de cartes sont en CSS
  `uppercase` : `innerText` renvoie « LE FINANCIER », pas « Le financier » → `/i`.
- **Tests de position (`getBoundingClientRect`)** : ne jamais bander par
  `Math.round(y/40)` — une frontière de 40 px peut tomber entre deux tuiles de la
  même ligne (2619 vs 2622) et le test échoue dès que la hauteur des blocs
  au-dessus bouge. Regrouper de proche en proche (même bande si écart < 40 px),
  cf. `t_ordre_fiscal.js` depuis le 10/09.
- **Captures d'une zone** : `page.locator('.nc-syn-zone').getByText(txt).first()`
  puis remonter avec `locator('xpath=..')` et `.screenshot()` — plus fiable qu'une
  recherche `querySelectorAll` par texte, qui attrape le script ou un clone masqué.
- Les fonctions du moteur sont sur `window` : les appeler directement en
  `page.evaluate` évite de parcourir le questionnaire et rend les tests rapides.