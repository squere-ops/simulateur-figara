# Simulateur FIGARA — repères pour Claude Code

Simulateur patrimonial mono-fichier (`index.html`, React 18 + Babel standalone, sans build)
du cabinet Universel Patrimoine / FIGARA. Produit trois documents imprimables :
Audit et synthèse (RDV 1), Analyse R2, Simulation. Déployé sur Vercel.

## Où sont les choses
- `index.html` — l'application entière (~23 000 lignes). Seul fichier livré.
- `tests/` — bancs de test Playwright (`verif.sh`, 20 étapes, `t_*.js`), `regen.sh` (banc local hors CDN).
- `docs/PASSATION.md` — mémoire de passation entre sessions (état, décisions, chantiers ouverts).
- `.claude/skills/simulateur-figara-dev/` — savoir de fabrication (dev, test, livraison, géométrie d'impression).
- `.claude/skills/analyse-etude-patrimoniale/` — doctrine patrimoniale et fiscale du cabinet.
- `TODO.md` — backlog : un seul item par session.
- Branches : `main` (prod), `demo` (même code, projet Supabase différent).

## Lancer les bancs (sur le Mac, dans le Terminal)
```
cd ~/Documents/GitHub/simulateur-figara/tests
npm i && npx playwright install chromium && ./setup_local.sh   # une seule fois
/Library/Frameworks/Python.framework/Versions/3.12/bin/python3 -m pip install pymupdf   # étape 20 (PDF)
./verif.sh                                                     # 20 étapes
```
`verif.sh` démarre lui-même le serveur local (port 8899). Codes de sortie : 0 = tout vert,
1 = rouge (ne pas livrer), 2 = incomplet (étapes « non vérifiables » assumées, listées dans TODO.md). État au 26/10/2026 : 14 vertes, 0 rouge, 6 non vérifiables.
Un banc qui rougit après une évolution de l'app est d'abord un banc à relire (libellé, volet, fenêtre nouvelle)
avant d'être un bug : les fenêtres qui précèdent la synthèse se franchissent avec `tests/_aide.js`.
`tests/index.html` est un lien vers `../index.html` : les bancs testent toujours le fichier livré.

## Règles absolues (fixées par Sylvain)
1. Ne jamais restaurer ni réintroduire ce qui a été supprimé sans accord explicite.
2. Questionner au moindre doute : méthode, hypothèse, chiffre, présentation.
3. Vérifier avant de livrer : `tests/verif.sh` vert, puis le PDF rendu et lu page par page.
   Vérifier l'écran n'est pas vérifier le document imprimé.
4. Mettre à jour `docs/PASSATION.md`, `TODO.md` et les skills en fin de session, sans qu'on le demande.
5. Ne jamais toucher à la production `figara_web` (VPS OVH). Ne jamais réutiliser un secret d'une ancienne session.
6. Livraison sobre : un commit propre, un message en français préfixé par le numéro de version (`vNNN : …`).
   Sylvain pousse lui-même (`git push`) — le trousseau macOS bloque le push depuis une session.
7. Dans un bloc de commandes destiné au Terminal : uniquement des commandes, rien d'autre.
8. **Le dépôt est publié en ligne par Vercel** : tout fichier ajouté doit rester couvert par
   `.vercelignore` (seuls `index.html` et `vercel.json` partent). Ne jamais mettre dans le dépôt
   une donnée client réelle.
9. Le mot « effort » est banni du constat. Les livrets rapportent 1,7 %.

## Rituel de session
- Début : lire `TODO.md`, choisir UN item, l'annoncer.
- Fin : item fait ou documenté dans `TODO.md` ; `PASSATION.md` §8/§9 et skills à jour ; commit.
- Avant de dire « c'est en ligne » : `git rev-list --count origin/main..main` doit valoir 0.
