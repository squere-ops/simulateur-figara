# Simulateur Figara — Patrimoine & Études

Simulateur d'investissement pour CGP (Conseiller en Gestion de Patrimoine) couvrant trois produits financiers avec leurs fiscalités respectives :

- **Assurance-Vie** (PFU + abattement transmission)
- **PER** (Plan d'Épargne Retraite) — avec scénario « réintégration des réductions d'impôt »
- **Capi PM** (Contrat de Capitalisation Personne Morale) — IS sur plus-value

## Fonctionnalités

- 5 étapes : Identité client · Produit · Allocation · Comparatif · Présentation client
- Comparaison côte-à-côte solution / scénarios alternatifs
- Projection avec scénarios pessimiste / médian / optimiste (±1 %)
- Calcul rente perpétuelle + transmission successorale
- Présentation client imprimable A4 en 3 pages (PDF-ready)
- PER : scénario complémentaire de réinvestissement des réductions d'impôt

## Stack

Application 100 % front-end, self-contained, sans build :

- HTML + React 18 (via Babel standalone)
- Tailwind CSS (CDN)
- Chart.js 4 pour les graphiques
- Typographies Fraunces / Inter / JetBrains Mono / Cinzel

## Déploiement

Déployé sur Vercel — déploiement statique simple :

```bash
vercel deploy --prod
```

Le fichier `vercel.json` configure :
- `cleanUrls: true`
- En-têtes de sécurité (X-Content-Type-Options, Referrer-Policy)
- Cache `must-revalidate` sur `index.html`

## Auteur

Sylvain Quéré — Universel Patrimoine
Conseiller en Gestion de Patrimoine

## Licence

Usage interne. Tous droits réservés.
