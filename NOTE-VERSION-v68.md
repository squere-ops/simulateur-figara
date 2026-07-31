# Simulateur FIGARA — Note de version BUILD v30 → v68

**Date :** 30 juillet 2026 · **Fichier :** `index.html` (application mono-fichier) · **Déploiement :** push sur `main` → Vercel

Ce commit regroupe l'ensemble des travaux menés depuis le BUILD v30. Le diff est volumineux (~+4 300 lignes) : cette note en donne la lecture fonctionnelle pour éviter une relecture ligne à ligne. Le marqueur `BUILD v68` s'affiche dans la console du navigateur au chargement et résume les derniers changements.

---

## 1. Corrections des calculs (l'essentiel)

### Rente « capital préservé »
La rente mensuelle brute était calculée en taux proportionnel (`capital × taux / 12`), ce qui surestime la rente. Elle est désormais calculée en taux actuariel mensuel équivalent :

```
rente mensuelle = capital × ((1 + rendement)^(1/12) − 1)
```

Source unique : la fonction `renteBruteAnnuelle(cap, rdt)`. Tous les affichages (cartes de rente, comparatifs, synthèse, PDF) passent par elle — aucun calcul de rente ne doit être réécrit localement.

### Moteur d'impôt sur le revenu (barème 2026)
Le calcul d'IR (`ncCalcIR`) applique maintenant le barème progressif 2026 complet :

- Tranches : 0 % jusqu'à 11 600 €, puis 11 % / 30 % / 41 % / 45 % aux seuils 11 600 / 29 579 / 84 577 / 181 917 € (par part).
- Plafonnement du quotient familial : 1 807 € par demi-part supplémentaire (`NC_PLAFOND_DEMI_PART`).
- Décote : seuils 1 982 € (célibataire) / 3 277 € (couple), bases 897 € / 1 483 €, taux 45,25 % (`NC_DECOTE_*`).
- Plafond épargne retraite : plancher 4 710 €, plafond 37 680 € (`PER_PLAFOND_MIN/MAX`).

### Fiscalité assurance-vie (rachats / rente)
- Prélèvements sociaux : **17,2 %** (`PS = 0.172`).
- Après 8 ans : PFL **7,5 %** (`PFL_AV_8`) après abattement annuel de 4 600 € (célibataire) / 9 200 € (couple), taux mixte 7,5 / 12,8 % au-delà de 150 000 € de primes versées.

⚠️ Le PER conserve son propre régime en mode capital avec un PFU 2026 à **31,4 %** sur la part de plus-value (`PFU_PER_2026 = 0.314` = 12,8 % IR + 18,6 % PS). Ce n'est **pas** une incohérence avec `PS = 0.172` : les deux coexistent volontairement, ne pas « harmoniser ».

### Support de comparaison : Livret A
Hypothèse retenue pour toute l'application (remplace l'ancien livret taxé au PFU) :

- Taux : **1,25 %**, moyenne du taux servi sur 10 ans (volontairement pas le taux ponctuel en vigueur, trop volatil pour une projection à 15 ans).
- Intérêts **totalement exonérés** d'IR et de prélèvements sociaux (art. 157-7° CGI) : capitalisation au taux brut, rente nette = rente brute. Les cartes affichent « Intérêts exonérés — rente nette = rente brute » au lieu des lignes IR / CSG-RDS.
- Transmission **volontairement non chiffrée** : ni abattement de 100 000 € par héritier, ni droits de succession, ni frais ne sont affichés sur la colonne livret (« Capital transmis … — transmission non chiffrée »). La comparaison successorale porte uniquement sur l'avantage propre à l'assurance-vie (art. 990 I / 757 B). Le barème des droits en ligne directe, devenu inutilisé, a été retiré.
- Les colonnes livret portent le drapeau `renteFiscLineaire: true` : le moteur fiscal linéaire (`irRate` / `psRate`) leur est appliqué, jamais le moteur assurance-vie (quote-part de plus-value). Un bug appliquait l'ancien moteur AV au livret et surévaluait son IR — corrigé.

### Bugs d'exécution corrigés
- `ProjChart` plantait au premier rendu (`ReferenceError: kEUR is not defined`) : le helper `kEUR` vivait dans `ClientWowScreen` alors que le composant avait été remonté au niveau module. Helper remonté, copie locale supprimée.
- Clés React stabilisées (séries de scénarios, lignes de revenu imposable) : plus d'avertissements ni de risque de rendu croisé.
- Environ 580 lignes de code mort supprimées (variables et composants orphelins identifiés par ESLint).

## 2. Mentions réglementaires
Les documents transmis au client se terminent par les précautions d'usage (« les performances passées ne préjugent pas des performances futures », simulation indicative, non contractuel, risque de perte en capital sur les UC, renvoi aux DIC/DICI) :

- PDF « Générer simulation » : bloc « Mentions importantes » en bas de la dernière page (numérotation adaptée AV / PER / capitalisation).
- Deck de présentation (imprimable / envoyable par email) : bloc en pied de la diapositive Synthèse.
- Synthèse d'étude patrimoniale : avertissement adapté (informations déclarées, ni consultation juridique ni fiscale).

## 3. Étude patrimoniale — présente mais désactivée
Le module « fiche client / audit patrimonial » (composant `NouveauClientModal` + moteur `nc*`) est **en cours de développement et ne fait pas partie de cette livraison fonctionnelle**. Il est neutralisé par un drapeau en tête de fichier :

```js
const ETUDE_PATRIMONIALE_ACTIVE = (() => {
  try { return new URLSearchParams(window.location.search).get("etude") === "1"; }
  catch (e) { return false; }
})();
```

- Sans paramètre d'URL : le module est invisible et jamais monté. Le clic « Nouveau client » retombe sur la saisie directe, identique au comportement v30. **Rien à faire côté dev, rien à tester dans ce module.**
- Avec `?etude=1` dans l'URL : le module s'ouvre (usage interne, développement en cours).
- Merci de **ne pas modifier** ce module ni le drapeau : la partie est encore en chantier et sera livrée séparément.

## 4. Points de vigilance
- `SUPABASE_PUBLISHABLE_KEY` est exposée côté client par construction : la sécurité repose sur les policies RLS des tables `profiles` et `simulations`. À vérifier côté serveur si ce n'est pas déjà fait.
- Le fichier compile via Babel standalone dans le navigateur : toute modification doit préserver la syntaxe JSX (pas de commentaire `{/* */}` immédiatement après la parenthèse ouvrante d'un ternaire).

## 5. Validation effectuée avant livraison
Campagne automatisée Playwright sur les quatre parcours produits (AV, PER, capitalisation, multi-produits) : 0 erreur de page, 0 erreur console, 0 texte anormal. Tests dédiés : cohérence rente ↔ synthèse (AV et PER), carte Livret A sans impôt / abattement / droits, parcours d'audit complet via `?etude=1`, présence des mentions réglementaires sur la diapositive Synthèse. ESLint : 0 erreur.
