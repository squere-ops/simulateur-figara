# PASSATION — simulateur FIGARA (audit patrimonial)

État au 23/09/2026, version **v249**. Document à donner tel quel à la nouvelle
conversation, avec l'archive `bancs-figara.zip`.

---

## 1. EN UNE PHRASE

Un simulateur patrimonial mono-fichier (`index.html`, ~14 000 lignes, React 18 +
Babel standalone, sans build) qui produit trois documents imprimables pour le
cabinet Universel Patrimoine : **Audit et synthèse** (RDV 1), **Analyse R2**
(RDV 2), **Simulation**.

## 2. CE QU'IL FAUT SAVOIR AVANT DE TOUCHER À QUOI QUE CE SOIT

Règles absolues, données par le CGP (Sylvain Quéré), à ne jamais relâcher :

1. **Ne jamais restaurer ni réintroduire ce qui a été supprimé** sans accord
   explicite préalable. Chaque modification non demandée coûte de l'argent.
2. **Questionner au moindre doute.** Ne jamais décider seul d'une méthode, d'une
   hypothèse, d'un chiffre ou d'un choix de présentation.
3. **VÉRIFIER AVANT DE LIVRER** : fabriquer le PDF, rendre chaque page, LIRE
   chaque page, mesurer le remplissage. Vérifier l'écran n'est PAS vérifier le
   document imprimé.
4. **Écrire dans les skills à la fin de chaque session de travail**, sans qu'on
   le demande.
5. **Secrets** : ne jamais répéter ni réutiliser les mots de passe VPS d'une
   ancienne session. **Ne jamais toucher à la production `figara_web`
   (VPS OVH 51.210.40.25).**
6. **Livraison sobre** : le CGP ne veut pas « des tonnes de trucs à télécharger ».
   Un seul fichier dans la conversation (`index.html`, `display: "attach"`), qui
   sert uniquement à l'écrire dans son dépôt. Captures et PDF de contrôle restent
   dans l'espace de travail. Les skills partent une seule fois, en fin de session.
7. Le mot **« effort »** est banni du constat. Les livrets rapportent **1,7 %**
   (jamais 2,5 %).
8. Ne jamais mettre autre chose que des commandes dans un bloc que le CGP copie
   dans son Terminal (il colle tout, y compris les numéros de commit).

## 3. OÙ SONT LES CHOSES

| Quoi | Où |
|---|---|
| Le logiciel | `~/Documents/GitHub/simulateur-figara/index.html` sur son Mac (dossier connecté) |
| Dépôt git | `squere-ops/simulateur-figara`, branches `main` et `demo` |
| Bancs de test | **N'EXISTENT QUE DANS L'ARCHIVE `bancs-figara.zip`** — voir §4 |
| Skills à jour | `~/Downloads/simulateur-figara-dev.SKILL.md` et `~/Downloads/analyse-etude-patrimoniale.SKILL.md` |

⚠️ **Les skills du compte sont encore d'ANCIENNES versions** : les fichiers à jour
(dev ≈ 130 Ko, métier ≈ 185 Ko) dépassent la taille qu'un message peut porter, donc
`propose_skills` ne peut pas les enregistrer. **Toujours lire les deux fichiers de
`~/Downloads` avant de travailler.**

## 4. REMETTRE L'ENVIRONNEMENT DE TRAVAIL EN PLACE (à faire en premier)

Le conteneur de travail est neuf à chaque conversation : les bancs sont perdus si
on ne les restaure pas.

```
mkdir -p /home/claude/work && cd /home/claude/work
unzip -o ~/... /bancs-figara.zip     # l'archive est dans ~/Downloads sur le Mac
npm i playwright                      # si node_modules absent
```

Puis récupérer `index.html` depuis le Mac (dossier connecté `simulateur-figara`)
et lancer :

```
./regen.sh                 # fabrique test_local.html (Tailwind réel) + _test_proj.html
setsid nohup python3 -m http.server 8899 >/dev/null 2>&1 &
./verif.sh                 # 20 étapes — DOIT être TOUT VERT avant toute livraison
```

Le serveur **meurt entre deux tours** : `ERR_CONNECTION_REFUSED` = serveur tombé,
pas une régression. Le relancer.

## 5. LES BANCS (20 étapes de `verif.sh`)

`t_controle.js` (68 contrôles), `t_div.js`, `t_saisie.js`, `t_gisements.js`,
`t_regimes.js`, `t_optim.js`, `t_ordre_fiscal.js`, `t_rdv1.js`, `t_exp167.js`,
`t_rp.js`, `t_presentation.js`, `t_notes172.js`, `t_devoirs.js`,
**`t_quotites.js`** (quotités d'assurance), **`t_budget.js`** (gisements et budget),
**`t_clients_types.js`** (clients types démo), **`t_doc_edits.js`** (corrections du
conseiller), **`t_recentre.js`** (dossier Martin), `t_pdf_pages.js` (document
imprimé mesuré sur A4 ET Letter).

Utilitaire : `node t_pdf_type.js celib|pacse|marie|veuf` imprime le document d'un
client type (à relire page par page après toute modification de mise en page).

## 6. GÉOMÉTRIE D'IMPRESSION — le savoir le plus coûteux à retrouver

- La feuille de style déclare `@page { size: A4 portrait; margin: 0 }`. Chrome
  pagine TOUJOURS dans une boîte A4 de 1123 px puis met la page à l'échelle du
  papier réel. **Le format du papier ne change rien à la mise en page.**
- On vise **1056 px** (94 % de la boîte) : viser 1123 fait partir le pied de page
  (qui porte `break-inside: avoid`) sur une page à lui tout seul.
- `pageFull = Math.floor(1056 / zC)`, `hPied = Math.round(46 / zC)`,
  `H_PIED_MIN = Math.round(29 / zC)`.
- **`margin: 0` obligatoire** : sinon Chrome imprime son propre en-tête
  (« 17/09/2026 08:54 Synthese-… »).
- Le pied de page est **physique**, jamais `position: fixed` (un ancêtre `zoom`
  le collerait au bas du document). Il est posé, MESURÉ, puis étiré.
- Chrome **ignore `break-after` sur un enfant de flex** : pour couper une rangée,
  on coupe le CONTENEUR (clone vide + déplacement des enfants).
- Les boutons sont **retirés du clone d'impression** (visibles pendant la mesure
  sinon).
- Aucun `white-space: nowrap` sur une valeur de longueur libre : un débordement
  horizontal fait mettre TOUTE la page à l'échelle (document « tout petit »).

## 7. LIVRER (rituel complet)

1. `./verif.sh` → TOUT EST VERT, sinon on ne livre pas.
2. Imprimer et **relire chaque page** (`t_pdf_pages.js`, `t_pdf_type.js`).
3. Incrémenter le marqueur `BUILD vNNN` en tête de `index.html` (l'ancien devient
   `ANCIEN BUILD`, couleur grise) — c'est le journal du projet, il raconte le
   pourquoi de chaque changement.
4. `SendUserFile` de `index.html` seul (`display: "attach"`), puis
   `device_commit_files` vers `~/Documents/GitHub/simulateur-figara/index.html`.
5. Commit sur le Mac **par plumbing** (le CGP ne peut pas pousser depuis ici) :

```sh
cd $HOME/mnt/simulateur-figara
mkdir -p _to_delete/lkNNN
for f in .git/HEAD.lock .git/index.lock .git/refs/heads/main.lock .git/refs/heads/demo.lock; do
  [ -e "$f" ] && mv "$f" _to_delete/lkNNN/$(basename $f).$(date +%s%N)
done
export GIT_AUTHOR_NAME="Sylvain Quere" GIT_AUTHOR_EMAIL="squere@universel-patrimoine.com"
export GIT_COMMITTER_NAME="Sylvain Quere" GIT_COMMITTER_EMAIL="squere@universel-patrimoine.com"
BLOB=$(git hash-object -w index.html)
git ls-tree main | awk -v b="$BLOB" '{ if ($4=="index.html") print $1" "$2" "b"\t"$4; else print $1" "$2" "$3"\t"$4 }' > /tmp/t.txt
TREE=$(git mktree < /tmp/t.txt)
C=$(printf 'message\n' | git commit-tree "$TREE" -p main)
git update-ref refs/heads/main "$C"
```

   `device_bash` ne peut pas supprimer : déplacer les verrous AVANT et APRÈS
   chaque `update-ref`, sinon le commit suivant échoue
   (`cannot lock ref 'HEAD'`).
6. Branche `demo` : même fichier avec DEUX substitutions Supabase
   (`rzmexrvynpteqwswtzhh` → `liudyjddnykbshxredyg`,
   `sb_publishable_1kMpyh7u4yfZXc8j2-v3ng_Ui1SjCY0` →
   `sb_publishable_5AXdCVjl_mlYM-ZA8jFHSg_VfXZ2Ybt`).
   **Le contrôle COUNTS doit lire `1 1 0 0`.**
7. Donner au CGP, seuls, dans un bloc :

```
git push
git push --force origin demo
```

   (Il pousse lui-même : son trousseau macOS bloque le push depuis ici.)

## 8. CE QUI A ÉTÉ FAIT EN DERNIER (v242 → v249)

- **v242** : carte de compteur seule sur sa ligne = demi-page (`flex-grow: 0`) ;
  `info-retraite.fr` en pastille encadrée ; objectifs recommandés + préconisations
  entrent dans l'audit.
- **v243** : l'onglet « Projection » devient **Analyse R2** (document « Analyse et
  plan d'action ») ; « Simulation et plan d'action » devient **Simulation** ;
  quotités d'assurance emprunteur branchées (succession, problématique décès,
  curseur de la projection) ; économie des gisements = écart d'intérêts.
- **v244** : les gisements cochés grossissent le budget **aux deux bornes** ;
  bandeau collant caché tant qu'on n'est pas arrivé à « Où trouver l'épargne ».
- **v245/v246** : quatre **clients types** (célibataire, pacsés, mariés, veuve),
  version démo **et** fichier ouvert en local (`file://`) ; jamais sur figara.fr.
- **v247** : camemberts jumeaux lisibles à l'impression (`vertical`) ;
  « Sortie totale de trésorerie » retirée ; « 18 %, dont 9 % en financier » ;
  **corrections du conseiller** (✎ ✕ ↺ + « Ajouter une ligne ») sur les objectifs
  du cabinet, les préconisations et les questions ; bloc renommé « Les questions ».
- **v248** : le moteur **raisonne après l'achat de la RP** (apport déduit, capital
  remboursé = épargne immobilière, capacité jamais présentée à 0 €) ; **document
  recentré** (féliciter pour la RP, retraite par PER et assurance-vie, délégation
  d'assurance de prêt, rien de plus) dès que la capacité d'emprunt est mobilisée ;
  **fenêtre des incohérences** en quittant l'étape Objectifs.
- **v249** : « Sortie totale de trésorerie » retirée aussi de la carte « Coût
  global » à l'écran ; épargne **avant / après le projet RP** avec curseur ;
  « Le financier » en deux camemberts avant / après ; règle des **25 %
  d'endettement** (locatif à valider avec le courtier).

## 9. CE QUI RESTE OUVERT

1. **Le tableau avant / après** de l'Analyse R2 : le CGP le juge « pas
   pertinent », les droits de succession sont faux, et on ne sait pas combien de
   bénéficiaires sont désignés sur les contrats. **À refondre après discussion.**
   Trois options avaient été posées pour le nombre de bénéficiaires (un champ par
   contrat / un champ foyer / déduit du dossier) — **sans réponse à ce jour**.
2. **L'onglet « Simulation »** : « tout est à revoir, ce n'est pas vendeur ».
   Décisions déjà données : ne pas reprendre les cinq premières pages ; garder la
   page 6 ; la page 7 est passée dans l'Analyse R2 ; **la dernière page est à
   concevoir ensemble** — simulations précises (assurance-vie, PER) issues des
   solutions cochées en Analyse R2, puis consolidation (protection de la famille,
   capital retraite, revenus complémentaires) et **calendrier de mise en place**.
3. La fiche du client type « Mariés » annonçait une TMI de 41 % : le moteur
   calcule 30 % (147 600 € sur 4 parts) et **n'a pas été forcé**. Si le CGP veut
   un cas à 41 %, il faut changer les revenus ou le nombre d'enfants — question
   posée, sans réponse.
4. La fiche « Célibataire » (Martin) contient **volontairement** deux
   incohérences, pour que la nouvelle fenêtre d'alerte ait un cas où se
   déclencher. À corriger si le CGP préfère une fiche propre.
5. Réserve ancienne : la photo de couverture (Unsplash) n'est pas joignable
   depuis le conteneur ; elle s'affiche bien chez le CGP.
6. Les dossiers `_to_delete/` s'accumulent sur le Mac (`device_bash` ne peut pas
   supprimer) : **à vider par le CGP**.
7. **15 commits n'avaient jamais été poussés** entre le 17 et le 21/09 : toujours
   vérifier `git rev-list --count origin/main..main` avant d'affirmer que quelque
   chose est en ligne.

## 10. RÈGLES MÉTIER RÉCENTES À NE PAS PERDRE (résumé — le détail est dans le skill métier)

- Raisonner **après** l'achat de la résidence principale : apport déduit de
  l'épargne, crédit RP = épargne immobilière (part de capital remboursée, qui
  augmente à chaque échéance), capacité d'emprunt lue après le projet.
- Capacité d'emprunt mobilisée → **document recentré** : féliciter pour la RP,
  retraite (PER + assurance-vie), délégation d'assurance de prêt. Rien de plus.
- Au-dessus de **25 % d'endettement**, un projet locatif est « à valider avec les
  éléments précis du dossier et le courtier en crédit ».
- Les **incohérences** se signalent pendant l'entretien, dans une fenêtre, avec
  leur raison.
- Les gisements trouvés (délégation d'assurance, arbitrage, redirection)
  **s'ajoutent au budget mensuel du client**, aux deux bornes de la fourchette,
  et cela doit se voir.
- **Six questions** au maximum, écriture validée par le CGP ; la sixième est la
  bonus, au taux de la TMI du foyer (jamais un taux générique).
