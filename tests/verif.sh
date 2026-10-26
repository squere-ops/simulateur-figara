#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════
#  VÉRIFICATION AVANT LIVRAISON — une seule commande, un seul verdict.
#  Rien ne part au cabinet tant que cette commande n'est pas verte.
#      ./verif.sh
# ═══════════════════════════════════════════════════════════════════════
cd "$(dirname "$0")"
KO=0
INCOMPLET=0
[ -d node_modules ] || { echo "node_modules absent : lancer  npm i && npx playwright install chromium && ./setup_local.sh"; exit 1; }
[ -d local ] || ./setup_local.sh >/dev/null
HARNAIS=1; [ -f _test_proj.html ] || HARNAIS=0
harnais_manquant() { echo "│  ⚠ non vérifiable : le harnais _test_proj.html n'est pas dans le dépôt (voir TODO.md)"; INCOMPLET=1; }
echo "┌─ 1/20 · Syntaxe"
node syn.js 2>&1 | tail -1 | grep -q "SYNTAX OK" && echo "│  ✓ SYNTAX OK" || { echo "│  ✗ SYNTAXE CASSÉE"; KO=1; }
echo "├─ 2/20 · Régénération du banc local et du harnais"
./regen.sh >/dev/null 2>&1 && echo "│  ✓ test_local.html" || { echo "│  ✗ regen.sh"; KO=1; }
if [ $HARNAIS -eq 1 ]; then python3 regen_proj.py >/dev/null 2>&1 && echo "│  ✓ _test_proj.html" || { echo "│  ✗ regen_proj.py"; KO=1; }; else harnais_manquant; fi
if ! curl -s -o /dev/null http://127.0.0.1:8899/test_local.html; then
  nohup python3 -m http.server 8899 --bind 127.0.0.1 >/dev/null 2>&1 &
  for i in 1 2 3 4 5; do sleep 1; curl -s -o /dev/null http://127.0.0.1:8899/test_local.html && break; done
fi
curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:8899/test_local.html | grep -q 200 && echo "│  ✓ serveur local 8899" || { echo "│  ✗ serveur local 8899 injoignable — tout le reste échouera"; exit 1; }
echo "├─ 3/20 · Banc de contrôle (dossiers types, moteurs, champs orphelins)"
if [ $HARNAIS -eq 1 ]; then
node t_controle.js > /tmp/_ctrl.txt 2>&1
  if [ $? -eq 0 ]; then echo "│  ✓ $(tail -2 /tmp/_ctrl.txt | head -1)"; else echo "│  ✗ ÉCHEC — détail :"; grep '✗' /tmp/_ctrl.txt | sed 's/^/│    /'; KO=1; fi
else harnais_manquant; fi
echo "├─ 4/20 · Débordements et valeurs coupées, sur les trois volets"
node t_deb_syn.js > /tmp/_deb.txt 2>&1
grep -q "AUTO-TEST du detecteur : OK" /tmp/_deb.txt || { echo "│  ✗ le détecteur lui-même est aveugle"; KO=1; }
if grep -q "TOTAL PROBLEMES : 0" /tmp/_deb.txt; then echo "│  ✓ aucun débordement, détecteur vérifié"; else echo "│  ✗ débordements :"; grep '\[' /tmp/_deb.txt | sed 's/^/│    /'; KO=1; fi
echo "├─ 5/20 · Saisie réelle dans « Où trouver l'épargne » (frappe touche par touche)"
if [ $HARNAIS -eq 1 ]; then
node t_saisie.js > /tmp/_sai.txt 2>&1
  if [ $? -eq 0 ]; then echo "│  ✓ tous les champs répondent, aucun ne perd le focus"; else echo "│  ✗ champs inutilisables :"; grep '✗' /tmp/_sai.txt | sed 's/^/│    /'; KO=1; fi
else harnais_manquant; fi
echo "├─ 6/20 · « Où trouver l'épargne » : un levier décoché ne compte dans aucun total"
if [ $HARNAIS -eq 1 ]; then
node t_gisements.js > /tmp/_gis.txt 2>&1
  if [ $? -eq 0 ]; then echo "│  ✓ deux familles séparées, totaux recalculés depuis la règle, potentiel au conditionnel"; else echo "│  ✗ gisements en défaut :"; grep '✗' /tmp/_gis.txt | sed 's/^/│    /'; KO=1; fi
else harnais_manquant; fi
echo "├─ 7/20 · Les sept régimes locatifs produisent leur avantage fiscal"
if [ $HARNAIS -eq 1 ]; then
node t_regimes.js > /tmp/_reg.txt 2>&1
  if [ $? -eq 0 ]; then echo "│  ✓ nu · meublé · Denormandie · Malraux · monument historique · LLI · Jeanbrun"; else echo "│  ✗ régimes en défaut :"; grep '✗' /tmp/_reg.txt | sed 's/^/│    /'; KO=1; fi
else harnais_manquant; fi
echo "├─ 8/20 · Optimisation du rattachement des enfants (union libre)"
node t_optim.js > /tmp/_opt.txt 2>&1
if [ $? -eq 0 ]; then echo "│  ✓ gain réel calculé, bouton présent, pas de gain annoncé à tort"; else echo "│  ✗ optimisation en défaut :"; grep '✗' /tmp/_opt.txt | sed 's/^/│    /'; KO=1; fi
echo "├─ 9/20 · Ordre de lecture du bloc fiscal"
node t_ordre_fiscal.js > /tmp/_ord.txt 2>&1
if [ $? -eq 0 ]; then echo "│  ✓ revenu → TMI → taux moyen → impôt → retraite"; else echo "│  ✗ ordre modifié :"; sed -n '/ORDRE DE LECTURE/,/^$/p' /tmp/_ord.txt | sed 's/^/│    /'; KO=1; fi
echo "├─ 10/20 · Suites de non-régression"
# Ces suites impriment « FAIL — … » sans code de sortie : verif.sh ne regardait que
# « KO » et les laissait passer. Cinq assertions perimees ont ainsi survecu a trois
# livraisons. On compte desormais les FAIL, pas seulement les KO.
node t_rdv1.js > /tmp/_r1.txt 2>&1
NF1=$(grep -c "^FAIL" /tmp/_r1.txt)
if grep -q "PAGEERRORS: aucune" /tmp/_r1.txt && ! grep -q "^KO" /tmp/_r1.txt && [ "$NF1" -eq 0 ]; then echo "│  ✓ t_rdv1"; else echo "│  ✗ t_rdv1 — $NF1 assertion(s) en echec :"; grep -m8 "^FAIL\|^KO\|ERREUR" /tmp/_r1.txt | sed 's/^/│    /'; KO=1; fi
node t_exp167.js > /tmp/_r2.txt 2>&1
NF2=$(grep -c "^FAIL" /tmp/_r2.txt)
if grep -q "PAGEERRORS: aucune" /tmp/_r2.txt && [ "$NF2" -eq 0 ]; then echo "│  ✓ t_exp167"; else echo "│  ✗ t_exp167 — $NF2 assertion(s) en echec :"; grep -m8 "^FAIL\|^KO" /tmp/_r2.txt | sed 's/^/│    /'; KO=1; fi
echo "├─ 11/20 · Projet d'achat RP (durée/apport/taux, ex-plantage 03/09/2026)"
# Régression du 03/09 : le CGP tombait sur "Une erreur technique est survenue" en
# renseignant durée/apport/taux du projet RP. Cette erreur, attrapée par
# l'ErrorBoundary, ne remonte JAMAIS en pageerror — t_rp.js écoute désormais
# aussi le console.error '[FIGARA] render error'.
node t_rp.js > /tmp/_r3.txt 2>&1
NF3=$(grep -c "^FAIL" /tmp/_r3.txt)
if grep -q "PAGEERRORS: aucune" /tmp/_r3.txt && [ "$NF3" -eq 0 ]; then echo "│  ✓ t_rp"; else echo "│  ✗ t_rp — $NF3 assertion(s) en echec :"; grep -m8 "^FAIL\|render error" /tmp/_r3.txt | sed 's/^/│    /'; KO=1; fi
echo "├─ 12/20 · Mode présentation (écran de rendez-vous, chapitre par chapitre)"
node t_presentation.js > /tmp/_pres.txt 2>&1
if [ $? -eq 0 ]; then echo "│  ✓ un seul chapitre à l'écran, navigation et sortie vérifiées sur les trois volets"; else echo "│  ✗ présentation en défaut :"; grep '^FAIL' /tmp/_pres.txt | sed 's/^/│    /'; KO=1; fi
echo "├─ 13/20 · Nouveaux blocs du premier rendez-vous (épargne actuelle, moyens, teaser)"
node t_shot_pres.js > /tmp/_np.txt 2>&1
NFP=$(grep -c "^FAIL" /tmp/_np.txt)
if grep -q "PAGEERRORS: aucune" /tmp/_np.txt && [ "$NFP" -eq 0 ]; then echo "│  ✓ blocs présents, chiffres lus dans la saisie, ordre demandé respecté"; else echo "│  ✗ $NFP contrôle(s) en échec :"; grep -m8 "^FAIL" /tmp/_np.txt | sed 's/^/│    /'; KO=1; fi
echo "├─ 14/20 · Devoirs du client : la liste suit ce que le dossier ne sait pas"
node t_devoirs.js > /tmp/_dev.txt 2>&1
if [ $? -eq 0 ]; then echo "│  ✓ quotité, assurance de prêt, rendement inconnu et prévoyance TNS ressortent en pièces à réclamer"; else echo "│  ✗ devoirs en défaut :"; grep '^FAIL' /tmp/_dev.txt | sed 's/^/│    /'; KO=1; fi
echo "├─ 15/20 · Quotités d'assurance emprunteur : le moteur les lit"
node t_quotites.js > /tmp/_quot.txt 2>&1
if [ $? -eq 0 ]; then echo "│  ✓ prêt soldé à hauteur de la quotité saisie, lecture prudente si elle manque, curseur de la projection aligné"; else echo "│  ✗ quotités en défaut :"; grep '✗' /tmp/_quot.txt | sed 's/^/│    /'; KO=1; fi
echo "├─ 16/20 · Analyse R2 : les gisements grossissent le budget, bandeau collant pas avant le budget"
node t_budget.js > /tmp/_bud.txt 2>&1
if [ $? -eq 0 ]; then echo "│  ✓ fourchette augmentée aux deux bornes, détail levier par levier, bandeau collant caché sur la page de garde"; else echo "│  ✗ budget en défaut :"; grep '^FAIL' /tmp/_bud.txt | tail -n +1 | grep -v "téléphone\|email\|groupe\|maison\|crédit auto\|capacité proprio\|épargne scindée\|tuile\|placements groupés\|Monsieur et Madame" | sed 's/^/│    /'; KO=1; fi
echo "├─ 17/20 · Clients types de la version démo (absents en production)"
node t_clients_types.js > /tmp/_ct.txt 2>&1
if [ $? -eq 0 ]; then echo "│  ✓ quatre clients types chargés, synthèse ouverte sans blocage, aucun bouton en production"; else echo "│  ✗ clients types en défaut :"; grep '^FAIL' /tmp/_ct.txt | sed 's/^/│    /'; KO=1; fi
echo "├─ 18/20 · Le conseiller corrige le document (objectifs recommandés, préconisations, questions)"
node t_doc_edits.js > /tmp/_de.txt 2>&1
if [ $? -eq 0 ]; then echo "│  ✓ corriger, masquer, ajouter : à l'écran comme à l'impression, aucun bouton imprimé"; else echo "│  ✗ corrections du document en défaut :"; grep '^FAIL' /tmp/_de.txt | sed 's/^/│    /'; KO=1; fi
echo "├─ 19/20 · Dossier Martin : lu après l'achat de la RP, recentré, incohérences signalées"
# 26/10/2026 : le client type « Célibataire » n'est plus Thomas MARTIN (fixture avec deux
# incohérences volontaires) mais Julien FAURE, sans incohérence. Ce banc n'a plus de dossier
# à lire tant qu'un dossier de test n'est pas recréé (TODO.md). On le dit, on ne rougit pas à tort.
echo "│  ⚠ sans objet : le dossier Martin n'existe plus dans l'application (remplacé par Faure) — banc à refaire sur un dossier de test, voir TODO.md"; INCOMPLET=1
echo "├─ 20/20 · LE DOCUMENT IMPRIMÉ — pages mesurées sur A4 ET Letter"
node t_pdf_pages.js > /tmp/_pdf.txt 2>&1
if [ $? -eq 0 ]; then echo "│  ✓ $(grep -c '^OK' /tmp/_pdf.txt) pages contrôlées, aucune page à moitié vide"; else echo "│  ✗ mise en page du PDF :"; grep '^FAIL' /tmp/_pdf.txt | sed 's/^/│    /'; KO=1; fi
echo "└─────────────────────────────────────────────────────────"
if [ $KO -ne 0 ]; then echo "   ✗ NE PAS LIVRER."; exit 1; fi
if [ $INCOMPLET -ne 0 ]; then echo "   ⚠ INCOMPLET — rien de rouge, mais des étapes ne sont pas vérifiables (harnais _test_proj.html absent, dossier Martin disparu) — voir TODO.md."; exit 2; fi
echo "   TOUT EST VERT — la livraison peut partir."; exit 0
