# TODO — simulateur FIGARA

Un seul item « en cours » à la fois. Date = jour de la décision.

## En cours
- (vide)

## À faire — chantier rangement (26/10/2026)
- [ ] Rendre les bancs exécutables depuis le dépôt : `regen.sh` et `verif.sh` font `cd /home/claude/work` ; passer en `cd "$(dirname "$0")"`, recréer `syn.js` et le dossier `local/` (stubs React/Babel/Tailwind), documenter le lancement dans ce fichier.
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
- [x] 26/10/2026 — Nettoyage du dépôt (108 fichiers fantômes, `_to_delete`, verrous git), index git réaligné sur v293, bancs/docs/skills rapatriés dans le dépôt, CLAUDE.md et TODO.md créés.
