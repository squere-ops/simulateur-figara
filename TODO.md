# TODO — simulateur FIGARA

Un seul item « en cours » à la fois. Date = jour de la décision.

## En cours
- (vide)

## À faire — chantier rangement (26/10/2026)
- [ ] **Reconstruire le harnais `_test_proj.html`** (perdu : jamais réarchivé le 23/09). Il isole `NcProjection` avec le dossier de test « Paul TESTEUR » ; `regen_proj.py` le régénère à partir de `index.html` mais a besoin du gabarit (tête : vendors + `local/tailwind-real.css` + helpers extraits du moteur réel par `regen_helpers.js`, lui aussi perdu ; pied : `const D = {…}` + montage). Sans lui, 5 étapes de `verif.sh` (2, 3, 5, 6, 7 : contrôle 68 points, saisie, gisements, régimes) restent non vérifiables. Session dédiée en Claude Code, avec Playwright qui tourne. Repères : skill dev §« ENVIRONNEMENT DE TEST », `t_controle.js` pour ce que la page doit exposer.
- [ ] Première exécution de `./verif.sh` sur le Mac (voir CLAUDE.md) : noter ici ce qui passe et ce qui casse hors harnais.
- [ ] Condenser les deux skills (2 600 et 3 100 lignes) : garder les règles, sortir l'historique vers `docs/`.
- [ ] Mettre à jour `docs/PASSATION.md` (parle de v249, on est en v293) ; supprimer §3-4 devenus inutiles.
- [ ] Trancher le dossier `Claude outputs/` (anciennes versions de skills, PDF de contrôle) : archiver hors dépôt ou supprimer.
- [ ] Supprimer les branches `backup-avant-rebase`, `backup-local-wow-20260625` (1 commit du 24/06 chacune, CSP iframe) et `main.lock.stale` après vérification.
- [ ] Ranger `~/Downloads` : zips et versions `_1`…`_4` des skills, `bancs-figara/`, versions html intermédiaires.

## À faire — fonctionnel (repris de PASSATION §9, 23/09/2026)
- [ ] Analyse R2 — tableau avant/après à refondre (droits de succession faux ; nombre de bénéficiaires par contrat : choix à faire entre champ par contrat / champ foyer / déduit du dossier).
- [ ] Onglet Simulation — dernière page à concevoir ensemble (simulations AV/PER issues des solutions cochées, consolidation, calendrier de mise en place).
- [ ] Fiche client type « Mariés » : TMI annoncée 41 %, moteur calcule 30 % — décider (revenus ou enfants à ajuster).
- [ ] Fiche « Célibataire » (Martin) : deux incohérences volontaires pour tester l'alerte — garder ou corriger ?

## Fait
- [x] 26/10/2026 — Bancs exécutables depuis le dépôt : chemins relatifs, `tests/index.html` → `../index.html`, `syn.js` réécrit, `setup_local.sh` (vendors + stubs hors réseau), Chromium de Playwright par défaut (`PW_CHROMIUM` pour surcharger), `verif.sh` dit explicitement quand le harnais manque au lieu de rougir à tort.
- [x] 26/10/2026 — Nettoyage du dépôt (108 fichiers fantômes, `_to_delete`, verrous git), index git réaligné sur v293, bancs/docs/skills rapatriés dans le dépôt, CLAUDE.md et TODO.md créés.
