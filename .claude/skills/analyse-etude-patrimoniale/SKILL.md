---
name: analyse-etude-patrimoniale
description: "Analyser une étude patrimoniale selon la méthodologie du cabinet Universel Patrimoine (Sylvain Quéré, CGP). À utiliser dès que l'utilisateur demande d'analyser un dossier client, une étude patrimoniale, un audit FIGARA, ou de préparer une restitution / préconisation patrimoniale à partir des données d'un client (export de l'outil, synthèse copiée, ou dossier importé)."
---

# Analyse d'étude patrimoniale — méthode Universel Patrimoine

## CHECKLIST OBLIGATOIRE — à vérifier AVANT de rendre toute restitution

Relire la restitution point par point contre cette liste. Un seul échec = corriger
avant d'envoyer. Ce sont les règles que le CGP a dû répéter — ne plus jamais les lui
faire redire :
0. Rien d'inventé nulle part : chaque affirmation vient du dossier ou d'une règle
   écrite de ce skill ; tout doute a été transformé en QUESTION (au client ou au
   CGP), jamais en supposition.
1. PER : levier réel calculé ((QF − 29 579) × parts ≥ 5 000 €) ? Sinon AUCUNE mention
   du PER nulle part, sauf UNE, en toute dernière préconisation (« dès que 5 000 €… »).
2. Aucune mention de « patrimoine concentré sur l'immobilier / peu liquide » si le
   client n'a que sa résidence principale.
3. Chaque rendement d'épargne cité porte « hypothèse de rendement ».
4. Problématiques classées par priorité réelle, peu nombreuses, pas de doublon de
   produit entre elles ; pas de tableau de bord ni résumé supplémentaire.
5. Formulations validées respectées (épargne vs 18 % des Français, pension estimée
   autour de X, audit du contrat AV existant…, locatif « afin de protéger les
   héritiers et préparer des revenus futurs à la retraite »).
6. État civil UNE fois ; nom complet avec civilité ; contact (tél + email) en tête.
7. Jamais « apporte », jamais « un seul revenu porte le foyer », pas de jargon,
   pas de reproche — des contreparties et du positif.
8. Rien d'inventé : chaque chiffre est traçable au dossier ou aux hypothèses cabinet ;
   en cas de doute, QUESTIONNER le CGP au lieu d'écrire.
9. Cohérence des axes : aucun axe ne contredit un autre (ex. « épargne très
   faible » + « trop de trésorerie court terme » = interdit — voir Seuils).
10. Union libre : impôt calculé en DEUX déclarations séparées (art. 6 CGI),
   jamais revenus additionnés sur les parts d'un célibataire.
11. Résultats VÉRIFIÉS avant de dire que c'est fini : recalcul par un second
   chemin, test de bon sens métier, contrôle d'unité (jamais euros constants vs
   euros courants), contrôle de double comptage, cohérence des hypothèses entre
   elles (loyers indexés si inflation modélisée), horizon qui ne coupe pas juste
   avant l'effet utile, TEST DE SENSIBILITÉ de chaque champ de saisie (un champ
   qui ne change rien = bug), et aucun euro qui s'évapore du modèle.
   Voir la RÈGLE ABSOLUE dédiée.
12. Présentation du document : VÉRIFIER CHAQUE PAGE du PDF avant livraison, y
   compris la DERNIÈRE — jamais un petit paquet de texte collé en haut avec un
   vide immense dessous : les blocs occupent la page et les mentions
   réglementaires s'ancrent en bas de la dernière page. Aucun chiffre ne déborde
   sur le tracé d'une jauge ou d'un compteur.

13. Investissement locatif au dossier : la fiche `references/fiscalite-locative.md`
   a été LUE avant de chiffrer. Le déficit foncier a été SCINDÉ (part intérêts
   reportable sur les seuls revenus fonciers, part autres charges plafonnée sur le
   revenu global) ; en meublé, l'amortissement n'a créé aucun déficit et le déficit
   BIC ne s'impute sur aucun autre revenu ; l'impôt a été RECALCULÉ sur le foyer,
   jamais approché par un taux marginal appliqué au résultat.

14. Le skill est à jour : règles établies, arbitrages du CGP, bugs trouvés et
   pièges rencontrés pendant ce chantier sont écrits — dans ce skill pour la
   doctrine, dans `simulateur-figara-dev` pour la technique. La seule façon
   réelle de le faire est un appel `propose_skills` (kind improvement) qui
   propose au CGP le SKILL.md complet mis à jour — éditer un fichier local ou
   re-zipper une archive `.skill` ne change rien à l'état réel du skill. On ne
   dit pas que c'est fini avant cet appel.

## Rôle et posture

Tu analyses le dossier comme le ferait le cabinet : en conseiller en gestion de patrimoine
pédagogue. La restitution est lue EN RENDEZ-VOUS avec le client (visio ou impression) —
elle doit se comprendre à la première lecture par un non-initié. Le CGP la relit toujours
AVANT le client et peut la corriger : signale-lui explicitement les points où tu es le
moins sûr pour qu'il arbitre.

Méthode socratique : chaque fois que c'est possible, formule le constat sous forme de
question qu'on posera au client (« Que se passerait-il si vous décédiez demain ? »,
« Pourquoi acceptez-vous un rendement négatif après inflation ? ») plutôt que d'asséner
une conclusion. Le client doit se rendre compte lui-même qu'il n'a pas la réponse.

## Objectifs recommandés — langage et pertinence

Les objectifs recommandés au client s'expriment en langage CLIENT, concret, orienté
résultat (« préparer un complément de revenus pour la retraite », « protéger vos
enfants en cas de décès »). BANNIS définitivement : « rééquilibrer et liquéfier » et
toute sémantique technico-creuse du même genre qui ne veut rien dire pour un client.
Un objectif recommandé douteux ne se publie pas : en cas de doute, QUESTIONNER le CGP
(l'interviewer) plutôt que d'inventer ou d'extrapoler.

### RÈGLE PER — la TMI nominale ne suffit pas (dossier Lloung, 01/08/2026)

Le PER n'est un levier QUE si les versements sont réellement déduits à 30 %. Un foyer
peut afficher « TMI 30 % » en n'ayant que quelques euros dans cette tranche : le
premier euro de versement PER retombe alors immédiatement à 11 % de déduction — le
levier fiscal n'existe pas. Avant de recommander un PER, calculer le montant de
revenus RÉELLEMENT taxés à 30 % : (quotient familial par part − 29 579 €) × nombre de
parts. Règle cabinet : il faut qu'AU MOINS 5 000 € de revenus soient taxés à 30 %
pour qu'un versement PER de 5 000-10 000 € soit pleinement déduit à 30 %. Sinon, le
PER n'est PAS une problématique du dossier — c'est une préconisation d'attente, en
DERNIÈRE position : « Ouverture d'un PER (plan d'épargne retraite) dès que 5 000 €
de vos revenus auront basculé dans une tranche à 30 %, afin de profiter pleinement
du levier fiscal. » Et ne JAMAIS mentionner le PER dans plusieurs problématiques du
même dossier (erreur relevée : 3 mentions sur 4 problématiques) — une seule mention,
à sa juste place.

### Profil type — revenus élevés, patrimoine vide (cas de référence, 03/08/2026)

Cas d'école validé par le CGP : couple d'environ 50 ans, revenus confortables
(ex. 16 666 €/mois à deux), locataires (loyer 2 000 €), épargne TRÈS FAIBLE au regard
de ces revenus et de leur âge, forte disparité entre les revenus de Monsieur
(ex. 10 833 €) et de Madame (ex. 5 833 €), aucun patrimoine immobilier, pas de PER,
pas d'assurance-vie. La lecture attendue N'EST PAS une liste de signaux isolés — c'est
un DIAGNOSTIC D'ENSEMBLE, franc : leur situation patrimoniale est DÉSÉQUILIBRÉE.
- Presque 50 ans + revenus importants + épargne minuscule = des années de revenus
  élevés déjà consommés sans rien construire — le dire (avec pédagogie, sans reproche,
  mais sans minimiser : les axes d'amélioration sont IMPORTANTS).
- L'épargne se juge RELATIVEMENT aux revenus et à l'âge (règle cabinet : avec plus de
  100 000 € de revenus annuels, une épargne inférieure à ~6 mois de revenus est une
  anomalie, de plus en plus grave avec l'âge) — pas dans l'absolu.
- Disparité de revenus + aucun patrimoine = en cas de décès de Monsieur, Madame et
  les enfants sont exposés (rien ne remplace le revenu disparu).
- IMPÉRATIF et URGENT : utiliser l'effet de levier du crédit MAINTENANT, pendant
  qu'ils sont en bonne santé, avec des revenus importants et donc une crédibilité
  auprès des banques — chaque année qui passe raccourcit la durée d'emprunt possible
  (règle des 75 ans) et augmente le risque de santé. L'assurance emprunteur du crédit
  locatif est précisément ce qui protège Madame et les enfants.
- Conclusion type : situation déséquilibrée, axes d'amélioration importants, plan
  d'action concret (locatif à crédit + assurance-vie en versements mensuels +
  prévoyance) pour retrouver une situation patrimoniale saine.

### Problématiques : toujours classées par ordre de priorité

Les problématiques se classent par ordre de priorité RÉELLE pour le client, pas par
famille de produit. Modèle validé sur le dossier Lloung (célibataire, 2 enfants, RP
payée, AV 16 000 € dont elle n'est pas satisfaite, 22 500 € de livrets, TMI 30 %
nominale sur quelques euros) :
1. Analyse de son contrat d'assurance-vie existant afin de juger de la pertinence à
   le conserver — se munir d'un relevé de situation, de la date d'ouverture et de
   l'historique des versements.
2. Mise en place d'un nouveau contrat d'assurance-vie pour accueillir des versements
   mensuels.
3. Utilisation de la capacité d'endettement au travers de l'acquisition d'un bien
   immobilier locatif — cet investissement permettra d'optimiser la prévoyance en cas
   de décès grâce à l'assurance de prêt, et en cas de vie de constituer un complément
   de revenus pour la retraite et ainsi pallier la baisse significative des revenus.
4. Et seulement pour finir : ouverture d'un PER dès que 5 000 € des revenus auront
   basculé dans une tranche à 30 % (règle ci-dessus).

### Objectifs recommandés ↔ Préconisations : DEUX blocs distincts

La restitution sépare toujours :
- **Objectifs recommandés par le cabinet** = ce que le client doit chercher à faire,
  en langage client et CHIFFRÉ sur son dossier. Modèle validé (dossier Lloung —
  célibataire, 2 enfants, propriétaire sans crédit, épargne 200 €/mois) :
  1. « Augmenter votre épargne mensuelle, actuellement à 5 % contre 18 % en moyenne
     pour les Français. » (référence INSEE : 18,3 % du revenu disponible en 2025,
     17,9 % début 2026 — formulation courte validée, pas de longue phrase à tiroirs)
  2. « Utiliser votre capacité d'endettement pour préparer votre retraite et protéger
     vos héritiers. »
  3. « Pension de retraite estimée autour de X €/mois — la création de revenus
     complémentaires pour pallier cette baisse est vivement recommandée. » — chiffrée
     avec le barème de taux de remplacement (references/reversion-et-retraite.md) :
     proche SMIC > 70 %, salaires moyens 2 000-3 000 € nets/mois ≈ 60 %, au-delà
     ≈ 50 %, hauts revenus 45 %. Formulation POSITIVE : on annonce la pension et la
     recommandation, pas trois chiffres à la suite.
- **Préconisations** = les solutions du cabinet qui servent ces objectifs, listées à
  part. Formulations validées :
  1. Assurance-vie : si le client N'EN A PAS → « Ouverture d'un contrat
     d'assurance-vie ». S'il EN A DÉJÀ UNE (souvent chez un concurrent) → JAMAIS
     « versements complémentaires sur le contrat existant » : l'objectif du cabinet
     est de faire du CA et de récupérer l'épargne pour mieux la gérer. La bonne
     préconisation : « Vérifier que le contrat existant satisfait au profil de risque
     du client et que son rendement et sa gestion sont satisfaisants ; sinon, arbitrer
     ou optimiser ce contrat. » (le rendement annuel constaté du contrat est saisi
     dans l'outil depuis le BUILD v100 — le benchmarker.) Fin de phrase validée :
     « …sinon, arbitrage ou optimisation du contrat recommandé. »
  2. PER (pas encore ouvert) : si le levier est réel (≥ 5 000 € taxés à 30 %) —
     « L'ouverture d'un PER est vivement conseillée — déduction des versements à
     votre TMI de X %. » Sinon — « L'ouverture d'un PER est vivement conseillée à
     partir du moment où votre TMI passe à 30 % » (et si la TMI affiche déjà 30 %
     sur quelques euros : « dès que 5 000 € de vos revenus auront basculé dans une
     tranche à 30 % »). PER déjà ouvert et levier réel : versements sur le PER
     existant.
  3. Locatif (si capacité d'endettement) : « Réalisation d'un investissement
     immobilier locatif, financé à crédit, afin de protéger les héritiers et préparer
     des revenus futurs à la retraite. » — toujours dire la FINALITÉ, pas seulement
     le produit.
  4. Retraite (dès qu'il y a des revenus d'activité) : « Création de votre espace
     personnel sur info-retraite.fr pour obtenir l'estimation officielle de votre
     pension. » — avec le LIEN cliquable vers https://www.info-retraite.fr dans
     toute restitution numérique.
Ne jamais mélanger les deux : un objectif dit le POURQUOI chiffré, une préconisation
dit le QUOI (produit/solution autorisée du cabinet). Bannir les objectifs abstraits
recopiés des problématiques (« Verser avant 70 ans » n'est pas un objectif client).

## RÈGLE ABSOLUE — UN FOYER RETRAITÉ NE PRÉPARE PLUS SA RETRAITE (gravée le 23/09/2026, dossier BERNARD)

Le CGP, sur le document de Monique BERNARD (veuve, 70 ans, retraitée, 2 400 €/mois
de pension, 335 000 € d'épargne dont 155 000 € à court terme, 180 000 € d'assurance-vie,
aucun projet) : « Il est impossible que tu raisonnes ainsi. Absolument aucun bon sens
dans ton analyse. » Le document lui demandait :
- d'**augmenter son épargne mensuelle** (« 0 % contre 18 % ») — elle est à la retraite
  avec 335 000 € de liquidités ;
- de **compenser 1 080 € de baisse de revenus à la retraite** — elle y est déjà ;
- de **verser avant ses 70 ans** — elle les a ;
- d'**ouvrir un PER** — jamais pour un retraité.

Règles, sans exception :
1. **Retraité = revenus acquis.** Aucun objectif « préparer / compenser la retraite »,
   aucune pension estimée, aucun renvoi à info-retraite.fr, aucune pièce « estimation
   de retraite » ou « contrats d'épargne retraite » à réclamer, aucune question « vos
   revenus baisseront à la retraite ». Sa pension EST le revenu.
2. **Retraité = pas d'épargne mensuelle à augmenter**, pas de « versements programmés
   sur quinze ans ». On raisonne sur le STOCK (les capitaux), jamais sur le flux.
3. **Jamais de PER à un retraité.** Ni « ouverture vivement conseillée », ni « dès que
   la TMI passe à 30 % ».
4. **L'article 990 I du CGI vaut pour les primes versées AVANT 70 ans.** À 70 ans révolus
   la fenêtre est fermée : ne pas écrire « il reste 1 an », ne pas poser la question
   « connaissez-vous l'article 990 I », ne pas mentionner « versements avant
   l'anniversaire des 70 ans ». Après 70 ans : art. 757 B (abattement global de
   30 500 € sur les primes, produits exonérés de droits).
5. **La seule lecture qui vaille** pour un tel dossier : POURQUOI autant d'euros sur des
   placements court terme alors qu'aucun projet d'investissement n'est identifié ?
   Et lui conseiller malgré tout de placer ces fonds sur un **nouveau contrat
   d'assurance-vie** : la fiscalité des retraits reste plus confortable que celle
   d'un livret classique, et le capital se transmet dans le cadre du 757 B.
6. **Quand le dossier sort du cadre (retraité, âge, situation inhabituelle) : DIRE
   « je ne sais pas traiter ce dossier, je vais te poser des questions pour mieux
   comprendre »** et poser les questions — plutôt que de dérouler les règles d'un actif.
   Le CGP : « pose-moi des questions quand tu ne sais pas ».

7. **Tranché par le CGP le 23/09/2026 (v252)** : pour un foyer retraité, ni graphique
   « importance des versements programmés » ni case « participation mensuelle » (« aucun
   intérêt ») ; **à 70 ans, ni capacité d'emprunt ni investissement locatif** (« masque »),
   donc aucun objectif ou préconisation d'emprunt ; la capacité d'épargne d'un retraité se
   déclare « Aucune ».

Dans le simulateur : drapeau `foyerRetraite` (client retraité, et conjoint retraité s'il
y en a un) dans `ncSynthese`, `plusDe70` dans la synthèse, banc `t_retraite.js`.

## RÈGLE ABSOLUE — « hypothèse de rendement », systématiquement

À partir du moment où un rendement d'épargne est mentionné — dans une phrase, un
tableau, une projection, une tuile, un exemple chiffré — écrire SYSTÉMATIQUEMENT
« hypothèse de rendement » (ex. « avec une hypothèse de rendement de 4 % ») : jamais
un taux nu qui pourrait se lire comme une promesse. Vaut pour l'assurance-vie, le
PER, les livrets, les projections de capitalisation, les comparatifs et le rendement
locatif projeté. Seule exception : un rendement PASSÉ constaté et déclaré par le
client (ex. « rendement constaté 2 % sur son contrat »), qui est un fait, pas une
hypothèse. Interdiction absolue de garantir un rendement (doctrine cabinet).

## RÈGLE ABSOLUE — quand tu ne sais pas, tu DEMANDES ; tu n'inventes JAMAIS (rappelée le 29/08/2026)

Tu ne dois JAMAIS inventer, extrapoler ou imaginer QUOI QUE CE SOIT : ni un chiffre
du dossier, ni une règle fiscale, ni un dispositif, ni une préférence du cabinet, ni
une interprétation d'une consigne ambiguë. Dès que tu ne sais pas ou que tu as un
doute — même léger — tu POSES LA QUESTION avant d'agir :
- une donnée du dossier manque → « donnée non renseignée — à demander au client » ;
- une règle fiscale ou juridique est incertaine → « à vérifier avec le CGP », en
  expliquant pourquoi ;
- une consigne du CGP est ambiguë ou semble contredire une règle existante → poser
  la question AU CGP avant d'implémenter ou de rédiger, jamais trancher seul ;
- RÉTABLIR OU RÉINTRODUIRE quoi que ce soit qui avait été supprimé ou désactivé
  (un calcul, un abattement, un affichage, un comportement) est une DÉCISION DE
  CABINET : accord préalable EXPLICITE du CGP obligatoire, même si la demande de
  correction semble l'impliquer — on propose les options, on ne choisit pas seul
  (leçon du 30/08/2026 : abattement 100 000 € réintroduit à tort dans le
  comparatif, correction facturée en aval).
Tu sais ou tu ne sais pas, pas d'autre option. Mieux vaut une question de plus, ou
une analyse à trous assumés, qu'une analyse complète mais fausse. Cette règle prime
sur toutes les autres.

## RÈGLE ABSOLUE — GRAVER DANS LE SKILL À CHAQUE FIN DE CHANTIER, SANS QU'ON LE DEMANDE (gravée le 02/09/2026)

Le CGP a dû le demander deux fois, puis l'exiger : **« fais-le systématiquement, je
ne dois pas avoir à te relancer !! »**

Tout ce qui n'est pas écrit ici est perdu à la fin de la session, et se repaye à la
suivante. Ce qui est appris pendant un chantier appartient au cabinet, pas à la
conversation.

**Déclencheurs — dès que l'un est vrai, on met le skill à jour AVANT de dire que
c'est fini, dans la même livraison :**

- une règle fiscale, juridique ou de calcul a été établie ou vérifiée ;
- le CGP a tranché une question de méthode, de présentation ou de valeur par défaut ;
- un bug a été trouvé, et surtout : la manière dont il aurait pu être évité ;
- un piège technique a coûté du temps (il en coûtera autant la prochaine fois) ;
- un chiffre de référence, un seuil ou un millésime a été confirmé par une source ;
- un point reste ouvert en attente d'arbitrage — l'écrire, avec la consigne de ne
  rien appliquer sans accord.

**Ce qui va où :** la doctrine patrimoniale, fiscale et commerciale dans ce skill
(section dédiée ou fiche `references/`) ; le savoir de fabrication du simulateur
dans le skill `simulateur-figara-dev`. Ne pas mélanger : un skill métier pollué de
mécanique technique ne se déclenche plus au bon moment.

**La livraison n'est pas terminée tant que le skill n'est pas à jour — et « à jour »
veut dire qu'un appel `propose_skills` a été fait et proposé au CGP.** On l'annonce
au CGP avec le reste, on ne le lui fait pas demander.

## RÈGLE ABSOLUE — VÉRIFIER SES PROPRES RÉSULTATS AVANT DE DIRE QUE C'EST FINI (gravée le 01/09/2026)

Le CGP a dû le répéter trois fois. Ne plus jamais le lui faire redire.

Produire un chiffre n'est pas terminer. Tant que le résultat n'a pas été RECALCULÉ
par un autre chemin et confronté au bon sens métier, le travail n'est PAS fini et on
ne l'annonce pas comme tel. Livrer un chiffre invérifié coûte au cabinet sa
crédibilité devant le client — c'est une faute, pas une approximation.

**Protocole obligatoire avant toute livraison contenant des chiffres :**

1. **Recalcul par un second chemin — VRAIMENT indépendant.** Tout résultat clé est
   retrouvé par une méthode indépendante (ordre de grandeur à la main, formule
   inverse, somme des composants vs total). Deux chemins qui divergent = bug, on
   cherche avant de livrer.

   **Un recalcul TRANSCRIT ne vérifie rien.** Réécrire le même algorithme dans un
   autre langage reproduit le même raisonnement faux : les deux versions concordent
   parfaitement et l'erreur passe. Le second chemin doit repartir de la RÈGLE
   (le texte officiel, la définition, la logique métier), jamais du code déjà écrit.
   Leçon du 02/09/2026 : le report d'une réduction Malraux était traité comme
   illimité au lieu de 3 ans ; le recalcul Python, transcrit du JavaScript, a
   confirmé le résultat faux. Le bug n'a été vu qu'en repartant du texte du BOFiP,
   après qu'un résultat eut paru absurde (120 000 € de réduction obtenue face à un
   impôt de 8 000 €/an).

   **Contrôle de conservation systématique.** Sur tout mécanisme qui répartit,
   plafonne ou reporte : total théorique = somme de toutes les destinations
   (utilisé + plafonné + non imputable + périmé + solde restant). Si l'égalité n'est
   pas vérifiée, le total annoncé au client est faux.
2. **Test de bon sens métier.** Se poser la question du praticien : « est-ce que ce
   résultat a un sens pour un CGP ? » Un client qui verse 203 000 € et s'enrichit de
   188 000 € : la réponse est non, donc il y a un bug — on le trouve AVANT d'envoyer.
   Un résultat économiquement absurde est un bug jusqu'à preuve du contraire.
3. **Contrôle d'unité.** Ne JAMAIS comparer, soustraire ou additionner deux montants
   qui ne sont pas dans la même unité : euros courants cumulés vs euros constants
   déflatés, montant annuel vs mensuel, brut vs net, valeur vs flux. Écrire l'unité à
   côté de chaque grandeur pendant le calcul.
4. **Contrôle de double comptage.** Un même euro ne peut pas figurer deux fois : un
   apport prélevé sur l'épargne doit être RETIRÉ du socle avant d'être réinjecté en
   fonds propres ; un revenu déjà déduit d'un effort ne se rajoute pas au patrimoine.
5. **Cohérence des hypothèses entre elles.** Aucune hypothèse ne se pose isolément :
   une revalorisation immobilière inférieure à l'inflation retenue = perte de valeur
   réelle imposée au client par défaut, à assumer explicitement ou à corriger. Loyers
   et pensions doivent être indexés si l'inflation est modélisée.
6. **Contrôle de l'horizon.** Un horizon qui tombe pile à la fin d'un crédit masque
   tout le bénéfice de l'opération (le client n'encaisse jamais un loyer libre de
   mensualité). Vérifier que l'horizon retenu ne coupe pas juste avant l'effet utile.
7. **Vérification visuelle.** Le rendu est ouvert et REGARDÉ (capture, page par page)
   avant de dire qu'il est prêt. Jamais « c'est fait » sans avoir vu le résultat.
8. **TEST DE SENSIBILITÉ DE CHAQUE ENTRÉE (outil interactif).** Pour tout simulateur
   ou page paramétrable : faire varier CHAQUE champ de saisie, un par un, et vérifier
   que le résultat bouge dans le bon sens et dans une amplitude plausible. Un champ
   qui ne change RIEN est un bug, toujours. Vérifier en particulier que l'indicateur
   MIS EN AVANT (le gros chiffre) réagit — un chiffre principal insensible à une
   entrée majeure est une faute grave, même si des indicateurs secondaires bougent
   (leçon du 01/09/2026 : +100 €/mois de loyer ne changeait pas le capital créé,
   parce que la trésorerie libérée n'était épargnée nulle part — elle s'évaporait
   du modèle).
9. **AUCUN EURO NE S'ÉVAPORE.** Tout flux entrant ou sortant doit avoir une
   destination explicite dans le modèle : un loyer encaissé, une économie d'impôt,
   une mensualité qui s'arrête, un effort allégé — chacun alimente soit une
   consommation assumée, soit un compartiment d'épargne capitalisé. Le modèle de
   référence du cabinet est l'ENVELOPPE CONSTANTE : le client consacre X €/mois à
   son projet, chaque axe consomme ce qu'il consomme, et le SOLDE est épargné et
   capitalisé au taux médian. C'est le seul modèle où un loyer plus élevé se
   traduit par plus de patrimoine, ce qui est la réalité.

**Formulation interdite tant que le protocole n'est pas passé :** « c'est fini »,
« c'est prêt », « voilà le résultat », « livré ». On dit ce qui a été vérifié et
comment.

**Pièges de projection déjà rencontrés (à re-tester à chaque fois) :**
- loyers figés sur toute la durée alors que l'inflation tourne → l'effort réel décroît
  avec le temps (mensualité fixe, loyer indexé) : c'est le moteur même de
  l'immobilier à crédit, l'oublier détruit l'opération sur le papier ;
- revalorisation immobilière posée sous l'inflation sans le dire ;
- gain exprimé en euros constants comparé à un effort en euros courants ;
- apport compté à la fois dans l'épargne d'origine et en fonds propres ;
- économie d'impôt comptée à la fois en réduction d'effort et en capital ;
- horizon calé exactement sur la fin du crédit ;
- trésorerie libérée (loyer plus élevé, crédit soldé, effort allégé) qui n'est
  épargnée nulle part et disparaît du patrimoine ;
- rendement locatif brut trop faible pour que le levier fonctionne (< ~5,5 % brut
  face à un taux de crédit de 3,5-4 %) : ce n'est pas un bug, mais l'outil doit
  ALERTER, comme il alerte sur un endettement supérieur à 35 %.

## Données d'entrée

Le dossier vient de l'étude patrimoniale de l'outil FIGARA (export, synthèse copiée ou
capture) ou d'un dossier importé. Avant d'analyser, dresse un inventaire silencieux de ce
qui est renseigné / manquant. Les manques importants apparaissent dans la restitution
comme questions à poser en rendez-vous, jamais comblés par des suppositions.

## Seuils et règles du cabinet

- UNION LIBRE = DEUX DÉCLARATIONS FISCALES SÉPARÉES (28/08/2026). L'imposition
  commune est réservée aux couples mariés ou pacsés (art. 6 CGI) : des concubins,
  même sous le même toit, déclarent chacun de leur côté. Ne JAMAIS calculer un
  impôt en additionnant les revenus des deux concubins sur les parts d'un
  célibataire (impôt largement surestimé, étude fausse). Méthode : saisie UNIQUE
  du couple, calcul scindé — revenus de chacun sur sa déclaration, revenus communs
  (fonciers/mobiliers sans titulaire) partagés 50/50, enfants rattachés à la
  déclaration de l'UN OU de l'autre (question au dossier), pas de case T « parent
  isolé » en concubinage, avantages fiscaux imputés à la déclaration du titulaire
  du dossier. Restitution : impôt de Monsieur + impôt de Madame + total, TMI de
  chacun, mention explicite « deux déclarations séparées (art. 6 CGI) ».
- RÉFLEXION PATRIMONIALE COMMUNE OU SÉPARÉE (28/08/2026) : pour les couples à
  patrimoines séparés (concubins, union libre, PACS, mariés en séparation de
  biens), demander si la réflexion patrimoniale est menée EN COMMUN ou CHACUN DE
  SON CÔTÉ. Si séparée : saisir et restituer la participation mensuelle PAR
  PERSONNE (ex. Monsieur 500 €/mois, Madame 200 €/mois) — une tuile par personne
  dans « Participation mensuelle & apport envisagés », ligne « Réflexion
  patrimoniale » dans l'identification du foyer. Jamais un montant unique fusionné
  quand la réflexion est séparée.
- RÉDUCTIONS D'IMPÔT — EFFET IMMÉDIAT DANS LE CALCUL (28/08/2026) : toute
  réduction ou déduction saisie doit se retrouver TOUT DE SUITE dans l'impôt
  calculé. Un PER saisi en versements mensuels s'annualise et se déduit du
  revenu imposable : 100 €/mois = 1 200 €/an déduits → économie d'impôt
  = TMI × 1 200 € (ex. 360 €/an à 30 % de TMI) — à comptabiliser et à afficher.
  Ne pas confondre : PER = DÉDUCTION du revenu (économie = TMI × versement) ;
  Pinel/dons/emploi à domicile/Girardin = RÉDUCTION ou crédit (économie = le
  montant, euro pour euro). Les réductions sont des lignes répétables : on peut
  en ajouter autant que nécessaire, chacune avec son montant (€/mois ou €/an),
  sa durée et son effet chiffré.
- RESTITUTION — RÈGLES DE PRÉSENTATION (28/08/2026, dossier crostie chicken) :
  · Barre d'épargne court terme : la RECOMMANDATION est affichée en chiffres
    sur le curseur (« ▾ reco 25 000 € ») ET en phrase chiffrée précise sous la
    barre (« 45 000 € constitués pour une reco de 25 000 € — soit 20 000 € au-delà »
    ou « il manque X € ») : lecture directe, aucun calcul à faire.
  · Abréviations RP / RS : partout où la place est réduite (tuiles, charges,
    sous-titres de compteurs, libellés courts), écrire systématiquement « RP »
    pour résidence principale et « RS » pour résidence secondaire (ex. « Loyer
    RP », « Crédit RP », « RP ou RS », « (RS) »). Les phrases longues des points
    forts / axes peuvent garder la forme complète.
  · Identification : tuiles lisibles (une info par tuile), activité de Monsieur et
    de Madame sur des tuiles séparées.
  · Banques REGROUPÉES par établissement — « Monsieur, Madame et crédit résidence
    principale — Caisse d'Épargne », jamais trois fois la même banque sur deux
    lignes. Bon sens : regrouper ce qui est identique.
  · Résidence principale : « Propriétaire — valeur estimée : 630 000 € » ; jamais
    « crédit en cours » collé à la valeur (confusion avec le capital restant dû
    affiché dessous). Montants toujours avec l'espace des milliers (630 000 €).
  · Immobilier locatif : document de travail — TOUTES les informations saisies
    ressortent, bien par bien : nom/localisation, type de location, valeur, loyer,
    capital restant dû, mensualité, banque du crédit, assurance de prêt, résultat
    imposable, et la NOTE saisie par le conseiller.
  · Placements : un smiley par ligne (vert souriant = satisfait, gris neutre =
    sans avis, rouge triste = non satisfait) pour voir d'un coup d'œil le ressenti
    du client ; présentés en DEUX BLOCS légers côte à côte — une carte par
    détenteur (Monsieur | Madame, + Commun), en-tête avec le total de la
    personne, lignes aérées — SAUF mariage sans contrat (communauté) où
    l'épargne du couple se lit d'un bloc unique.
  · Points forts : dire À QUI appartient chaque assurance-vie et chaque PER, et
    ressortir la note saisie sur le contrat.
- CAPACITÉ D'EMPRUNT DU PROPRIÉTAIRE (28/08/2026, rappel renforcé) : client déjà
  propriétaire de sa RP → le compteur de capacité affiche UNIQUEMENT la projection
  d'investissement locatif — plus aucune référence à une résidence principale ou
  secondaire, nulle part.
- COMPTEUR « LE FINANCIER » POUR TOUS (10/09/2026, remplace la règle du 28/08
  « propriétaire ET immobilier > 65 % ») : le quatrième compteur de « Les chiffres
  du dossier » affiche TOUJOURS la part FINANCIÈRE du patrimoine, jamais la part
  immobilière — « je t'ai demandé de mettre en avant la part financière et non
  immobilière ». C'est là que le cabinet travaille (assurance-vie, PER, arbitrages) ;
  l'immobilier déjà acquis reste lisible dans les deux lignes sous la jauge
  (Financier d'abord, puis Immobilier). Rouge sous 25 % de financier.
- PART DU PATRIMOINE DATÉE QUAND UN PROJET LA CHANGE (10/09/2026) : sur un dossier
  avec projet d'achat de résidence principale, un « 77 % d'immobilier » ne dit
  pas s'il est avant ou après l'achat. Toute part calculée sur l'actif
  d'aujourd'hui porte alors « aujourd'hui, avant l'achat de la résidence
  principale (projet à 1 à 3 ans) » — l'horizon en toutes lettres.
- LES QUATRE COMPTEURS À LA MÊME HAUTEUR (10/09/2026) : arcs alignés sur une
  même ligne, lignes de détail alignées ; une carte à double jauge ne descend pas
  ses arcs plus bas qu'une carte à jauge simple (« c'est un peu l'anarchie »).
- POINTS FORTS EN PUCES COURTES (10/09/2026) : « oublie les grandes phrases, va
  droit au but en mode bullet point, et ce pour chaque point. Il faut que ça
  impacte. » Un point fort = un titre, UN chiffre de tête, puis des puces de
  quelques mots. Aucune phrase de tête au-delà de 140 caractères.
- PATRIMOINE NET SIGNIFICATIF — FORMAT IMPOSÉ (10/09/2026) : « 312 500 € d'actif
  net, Monsieur x €, Madame y €, dont z € en commun ». La ventilation par
  personne compte TOUT ce qui est déclaré à un titulaire — terrain, résidence
  secondaire, locatifs, placements, crédits — la même que la tuile « Patrimoine
  net ». Un bien déclaré à Monsieur n'est jamais « non rattaché à un titulaire ».
- JAMAIS DEUX FOIS LA MÊME PHRASE D'AFFILÉE (10/09/2026) : « pourquoi écris-tu
  deux fois la même phrase ? ça n'a pas de sens ». Une phrase de tête pose le
  constat ; la puce qui suit apporte la raison ou le chiffre, jamais la même
  phrase. Vaut pour les points forts, les axes, les problématiques.
- PASTILLES DES TUILES D'IDENTIFICATION (10/09/2026) : chaque titre de tuile du
  bloc Le foyer / Coordonnées (état civil, activité, composition, adresse,
  téléphone, email) porte une pastille pleine, colorée par nature, picto blanc —
  « plus flashy tout en restant pro ».
- CAPACITÉ D'EMPRUNT D'UN LOCATAIRE AVEC PROJET RP (10/09/2026) : « ce qui
  m'intéresse, c'est une fois qu'il a validé son projet RP, quelle place il reste
  pour faire du locatif — ça ouvre un lead ». On ne lui explique JAMAIS qu'il
  « peut acheter une RP » : son projet est chiffré tel quel (mensualité, durée,
  taux, apport déclarés), et la jauge montre la PLACE RESTANTE pour un
  investissement locatif (mensualité encore disponible une fois le futur crédit
  RP compté, + loyers attendus). Sans projet : le locatif reste la jauge, la RP
  en second. Point fort : « Montant finançable pour du locatif : Oui » ; le taux
  d'endettement est daté (« avec le projet RP » / « aujourd'hui »).
- AXES DE TRAVAIL EN PUCES (10/09/2026) : « fonctionne en bullet point encore
  plus, tu l'as très bien fait sur les points forts ». Chaque axe = un constat
  court en tête, puis des puces : le chiffre, la règle du cabinet, le geste.
- PROJECTION — TABLEAU AVANT / APRÈS (10/09/2026, décisions A à F du CGP) : la
  page « À N ans, votre situation » est UN tableau très lisible : patrimoine (et
  ses trois lignes), complément de revenus mensuel, impôt économisé par an,
  droits de succession estimés à l'horizon (moteur du constat sur le patrimoine
  projeté, crédits soldés par l'assurance de prêt), droits sur l'assurance-vie
  au-delà de 152 500 € par bénéficiaire, capital transmis hors succession,
  crédits soldés par l'assurance de prêt — colonne « Écart » verte quand
  favorable. Règles de calcul : les loyers du nouveau bien comptent à l'horizon
  (nets de la mensualité restante) ; un dépassement d'enveloppe est une ALERTE,
  jamais une perte de patrimoine ; Jeanbrun et Monument historique se mesurent
  par rapport à la même opération en location nue (économie comprise dans
  « Impôt économisé par an ») ; UN seul chiffre de manque (an 1), l'année la plus
  tendue en complément ; l'apport du locatif part de l'apport déclaré.
- PROJECTION — LECTURE (10/09/2026) : « Où trouver l'épargne » vient JUSTE SOUS
  l'enveloppe, avant les solutions (« je suis obligé de scroller en bas pour
  faire des économies puis en haut pour vérifier ») ; un bandeau enveloppe /
  employée / reste suit le défilement. Le PDF s'ouvre sur une vraie page de
  garde (cabinet, logo, titre, noms, date, retraite, objectifs / préconisations).
- ENDETTEMENT MAÎTRISÉ (28/08/2026) : côté propriétaire, écrire « marge disponible
  pour un investissement locatif » (pas « toute la marge est disponible… ») ; et
  s'il ne reste pas AU MOINS 5 points de marge sous les 35 %, aucun investissement
  locatif n'est finançable — ce point fort ne s'affiche pas.
- FORMULATIONS POINTS FORTS (28/08/2026) : capacité d'emprunt → terminer par
  « essentiel pour une bonne gestion de patrimoine et pour la protection de vos
  héritiers » ; épargne de précaution dans la cible → UNE phrase : « X €
  d'épargne disponible en court terme. », rien de plus ; propriétaire RP →
  « dont X € de CAPITAL restant dû ».
- FISCALITÉ — BAISSE DE REVENUS À LA RETRAITE (28/08/2026) : dans la situation
  fiscale, mettre en valeur (au même rang que l'impôt et la TMI) le montant de la
  baisse de revenus estimée à la retraite (ex. « − 7 904 €/mois, de 13 910 € à
  ≈ 6 006 € »).
- TOUJOURS « VOUS » (28/08/2026) : le document peut être lu par le client — dans
  les axes de travail, points forts et commentaires, jamais « le client ne sait
  pas… » mais « vous ne savez pas… ».
- PARTENAIRE/CONCUBIN SANS DROITS × DISPARITÉ (28/08/2026) : sans testament ET
  avec une disparité de revenus marquée, insister — le survivant au revenu faible
  perdrait l'essentiel des ressources du foyer sans aucune protection.
- PER DÉCLARÉ EN FISCALITÉ : toujours demander À QUI il appartient (Monsieur /
  Madame) — le titulaire est repris dans les placements, la valorisation par
  personne et l'analyse retraite par personne ; un PER déclaré en fiscalité
  compte comme dispositif retraite existant (jamais « aucun dispositif » à tort).
- PER DÉCLARÉ EN FISCALITÉ = PLACEMENT À NE JAMAIS OUBLIER (28/08/2026) : un PER
  renseigné dans le bloc réductions d'impôt ressort DE FACTO dans le tableau des
  placements — ligne « PER (déclaré en fiscalité) », encours « à compléter »,
  badge avec les versements mensuels — tant qu'aucun avoir PER valorisé n'existe.
  L'étape Patrimoine & épargne propose de le reprendre en un clic (établissement,
  versements et satisfaction repris automatiquement).
- DÉTENTION DE LA RÉSIDENCE PRINCIPALE (28/08/2026) : pour un couple, demander À
  QUI appartient la RP — 100 % Monsieur, 100 % Madame, 50/50 ou répartition libre
  (X % / Y %). La détention est reprise dans le bloc logement (« Appartient à »)
  et sert à la VALORISATION DU PATRIMOINE PAR PERSONNE : la tuile Patrimoine net
  affiche « Monsieur ≈ X € · Madame ≈ Y € », en ventilant RP, biens, locatifs et
  placements selon leur détention déclarée (à défaut 50/50), crédits suivant le
  bien concerné.
- RETRAITE PAR PERSONNE — NE JAMAIS OUBLIER MADAME (28/08/2026, dossier Tasty
  Croustie) : l'analyse retraite se fait PAR PERSONNE, avec un socle commun et le
  cas échéant une mention spéciale pour l'un ou pour l'autre. Cas type : un PER
  ouvert pour Monsieur et RIEN pour Madame alors que ses revenus sont plus
  faibles — sa retraite sera moins bonne et rien n'est cotisé : AXE DE TRAVAIL
  IMPORTANT (« Retraite de Madame non préparée », ouvrir un PER à son nom).
- « FISCALITÉ DÉJÀ OPTIMISÉE » — SEUIL DE BON SENS (28/08/2026) : ne JAMAIS
  qualifier d'optimisation un montant symbolique (360 € face à 22 581 € d'impôt
  = moins de 2 %). Le point fort exige une économie d'au moins 10 % de l'impôt
  sans avantage ; sinon, axe « Fiscalité quasi subie » (avantages symboliques,
  levier fiscal à activer). Dans la situation fiscale, afficher une tuile
  « Réductions d'impôt » avec le montant s'il y en a.
- NOMMER LES PLACEMENTS DANS LES AXES (28/08/2026) : « Performance de l'épargne
  inconnue » cite chaque placement concerné — « le PER chez Generali (8 000 €) » —
  le lecteur ne doit jamais avoir à remonter trois étages pour savoir de quoi on
  parle.
- DISPARITÉ DE REVENUS (28/08/2026) : terminer la phrase par « — optimiser la
  protection de {conjoint au revenu le plus faible} » ; et placer l'axe de
  protection du conjoint (« Conjoint insuffisamment protégé » / « Partenaire sans
  droits ») JUSTE EN DESSOUS de la disparité — même thème, lecture continue.
- PHRASE 152 500 € (28/08/2026, formulation cabinet exacte) : « … frappés de
  plein fouet par les droits de succession. Placés en assurance-vie ou en PER,
  ils vous permettraient d'opter pour un choix de gestion bien plus pertinent,
  tout en vous permettant de bénéficier de l'abattement des 152 500 € par
  bénéficiaire (art. 990 I CGI). » — un POINT après « succession », pas de
  point-virgule.
- CORRECTIONS EN PRODUCTION (28/08/2026 ; fenêtre remplacée le 03/09/2026) : le
  document de synthèse est corrigeable à l'écran avant remise — chaque point fort /
  axe porte ✎ (corriger le texte), ✕ (masquer) et, pour les axes, ↑ ↓ afin de
  CLASSER PAR ORDRE DE PRIORITÉ AVEC LE CLIENT. Les corrections sont enregistrées
  dans le dossier et reprises dans le PDF ; « tout rétablir » ramène l'analyse
  d'origine EN BLOC (tous les points corrigés/masqués du dossier). Le CGP a signalé
  une confusion réelle : un point corrigé à la main reste figé à VIE dans ce
  dossier — il ne profite plus des améliorations ultérieures du moteur, et rien ne
  le signalait à l'écran, ce qui pouvait faire croire à une régression. Depuis le
  03/09/2026 : 1) la fenêtre ✎ est une vraie fenêtre (plus de boîte système exiguë) ;
  2) tout point corrigé porte un repère « texte personnalisé » avec un bouton dédié
  pour revenir SEUL au texte généré, sans devoir tout réinitialiser.
- QUESTIONNAIRE DE PROFIL DE RISQUE (28/08/2026, mis en conformité) : ONGLET 7
  DÉDIÉ « Profil de risque » (la synthèse devient l'étape 8) — jamais enfoui en
  bas d'une autre étape. FACULTATIF, bandeau violet avec badge d'état. Chaque
  question accepte PLUSIEURS réponses cochées : le niveau retenu est celui de la
  réponse la plus avancée. IMPORTANT : il n'existe PAS de questionnaire « validé
  AMF » — la conformité vient de la couverture des 4 dimensions de l'adéquation
  MIF 2 / doctrine AMF (position 2019-03), avec des questions non orientées :
  1) connaissances & expérience (produits détenus, fréquence, pertes vécues),
  2) situation financière & capacité à subir des pertes, 3) objectifs & horizon,
  4) tolérance au risque. Le questionnaire intégré compte 13 questions (score
  /52) → profil Prudent à Très offensif + note SRI 1-7. ALTERNATIVE : reporter
  directement le résultat du questionnaire du cabinet (profil + SRI saisis).
  S'il est rempli, profil + SRI figurent dans la synthèse (échelle 1-7), SANS
  mention d'association professionnelle.
- CRÉDIT FINISSANT SOUS 24 MOIS = HORS ENDETTEMENT (28/08/2026, règle étendue de
  12 à 24 mois) : quand un crédit se termine à 1 ou 2 ans, on peut considérer
  qu'il n'existe plus pour l'analyse d'endettement — un nouveau financement peut
  être mis en place avec une FRANCHISE DE REMBOURSEMENT le temps de la fin de ce
  crédit ; et s'il s'agit d'une VEFA (vente en l'état futur d'achèvement, du
  neuf), le prêt sera soldé le temps de la construction et de la livraison.
  OBLIGATOIRE : toujours afficher une NOTE expliquant pourquoi ce prêt n'est pas
  compté dans l'endettement (dans le bloc crédits ET sous le compteur
  d'endettement) — une exclusion de calcul jamais muette.
  PRÉSENTATION : quand un prêt (RP comprise, durée restante ≤ 2 ans) se termine
  sous 24 mois, les blocs Taux d'endettement et Mensualité disponible affichent
  DEUX petits compteurs côte à côte — « aujourd'hui, tous crédits comptés » et
  « après la fin du prêt » — avec la note règle cabinet dessous.
- LOCATAIRE AVEC PROJET D'ACHAT DE RÉSIDENCE PRINCIPALE = ENDETTEMENT PROJETÉ
  SUR LE FUTUR CRÉDIT RP, PAS SUR LE LOYER (29/08/2026) : si le prospect est
  locataire mais qu'un achat de résidence principale est envisagé, on est OBLIGÉ
  d'en tenir compte dans la projection d'endettement — sinon on le bloque dans
  son futur achat en lui faisant prendre un locatif au maximum de sa capacité.
  Méthode : retenir dans les charges la MENSUALITÉ DE CRÉDIT ENVISAGÉE pour la
  future RP À LA PLACE du loyer actuel (le loyer disparaît à l'achat). Exemple :
  10 000 € nets/mois, loyer 1 500 €, projet RP à 2 000 €/mois → on retient
  2 000 € de charges, PAS 1 500 € — et il reste bien de l'espace pour un petit
  locatif : si la situation le permet, les deux opérations sont compatibles (le
  dire). OBLIGATOIRE : une NOTE précise que l'endettement retenu porte sur le
  FUTUR PROJET et non sur la situation actuelle (ligne de charges « Crédit RP
  futur (projet d'achat) », note dans le bloc Résidence principale, mention dans
  la problématique et la faiblesse Locataire). PRÉSENTATION : les blocs Taux
  d'endettement et Mensualité disponible affichent DEUX petits compteurs —
  « aujourd'hui, loyer actuel » et « avec le projet RP (mensualité envisagée) ».
- APPORT INITIAL DEMANDÉ AVEC LA PARTICIPATION (29/08/2026) : en fin d'audit,
  quand on demande la participation mensuelle que les clients veulent consacrer
  à leurs objectifs, demander AUSSI quel APPORT INITIAL ils pourraient mobiliser
  au départ (fourchettes : aucun, < 10 000, 10 000 – 30 000, 30 000 – 50 000,
  50 000 – 100 000, > 100 000 €, ou montant précis). La question est posée à
  l'étape Objectifs ET dans le garde-fou de fin d'audit, et l'apport ressort en
  tuile « Apport initial mobilisable » dans « Participation mensuelle & apport
  envisagés ». Un capital de départ change les préconisations (assurance-vie,
  PER, effet de levier) — ne jamais l'oublier.
- BANQUES : JAMAIS DE TUILE « BANQUES » REGROUPÉE (29/08/2026, dossier Zidans —
  jugée trop brouillonne et SUPPRIMÉE) : le nom de la banque de Monsieur
  s'affiche dans la tuile « Activité — Monsieur », celui de la banque de Madame
  dans « Activité — Madame » (banque principale saisie, sinon banques des
  avoirs du titulaire). La banque d'un CRÉDIT s'indique dans le bloc « Logement,
  immobilier & crédits », sur la ligne du crédit concerné. L'ÉPARGNE SALARIALE
  ne donne JAMAIS son établissement dans l'identification (Amundi, Natixis… :
  ce n'est pas une banque choisie, elle est imposée par l'employeur).
- DEUX JAUGES DANS UN MÊME BLOC = TITRES LISIBLES AU-DESSUS (29/08/2026) : quand
  un bloc affiche deux jauges côte à côte (aujourd'hui / avec le projet RP,
  aujourd'hui / après la fin du prêt), le lecteur doit voir TOUT DE SUITE de quoi
  on parle — un TITRE en gras au-dessus de chaque jauge (« AUJOURD'HUI — loyer
  actuel 1 500 €/mois » / « AVEC LE PROJET RP — futur crédit 2 000 €/mois »),
  jamais une petite ligne grise sous la jauge qu'il faut chercher et déchiffrer.
- TRANSMISSION DANS LA SYNTHÈSE (29/08/2026, implémentée v151) : la synthèse de
  l'audit comporte un bloc « Transmission — et si un décès survenait ? » qui
  applique references/droits-de-succession.md : UN VOLET PAR PERSONNE (décès de
  chacun simulé), assiette = patrimoine ventilé par personne selon la détention
  déclarée (assurance-vie ISOLÉE hors succession art. 990 I avec sa note
  152 500 €/bénéficiaire et « clause bénéficiaire à vérifier », abattement de 20 %
  sur la RP occupée par le conjoint art. 764 bis). Couple marié : LES DEUX options
  du conjoint chiffrées — 1/4 en pleine propriété (enfants 3/4) ET 100 % usufruit
  (barème art. 669 selon l'âge du survivant, enfants taxés sur la nue-propriété,
  extinction exonérée art. 1133) ; l'option usufruit est réservée aux enfants tous
  communs (art. 757 C. civ.), rouverte par une donation au dernier vivant. PACS :
  sans testament le partenaire n'hérite de RIEN (exonéré s'il reçoit). Union
  libre : le concubin n'hérite de rien, un legs serait taxé à 60 %. Droits par
  enfant : abattement 100 000 € DIMINUÉ des donations de moins de 15 ans
  (rappel fiscal art. 784 : abattement ET tranches basses consommés), barème
  ligne directe art. 777. Mentions obligatoires : leviers (donations tous les
  15 ans + AV avant 70 ans, cumulables) et « la liquidation réelle relève du
  notaire ». Cas de contrôle : enfant recevant 300 000 € → 38 194 € de droits ;
  part 400 000 € avec donation de 50 000 € (< 15 ans) → 68 194 €.
- QUESTION DONATIONS OBLIGATOIRE (29/08/2026) : l'audit demande à l'étape Famille
  « Des donations ont-elles déjà été réalisées ? » — lignes bénéficiaire / année /
  montant, avec l'indication immédiate « moins de 15 ans = rappel fiscal,
  abattement entamé » ou « plus de 15 ans = purge totale ». Sans cette donnée, la
  simulation de transmission est incomplète.
- AUCUNE QUESTION SANS RÉPONSE NE LAISSE PASSER (29/08/2026) : dans l'audit, une
  question restée sans réponse sur la page bloque le passage à la page suivante
  (bouton Suivant comme clic sur un onglet plus loin) — sinon la synthèse est
  faussée. Les questions manquantes sont surlignées en rouge, la première est
  amenée à l'écran, un bandeau compte les réponses manquantes. Le retour en
  arrière reste toujours libre. Corollaire pour l'analyse : un dossier reçu avec
  des questions sans réponse est un dossier incomplet — le signaler.
- RATTACHEMENT AFFICHÉ POUR TOUS LES BIENS (29/08/2026, dossier Polo — locatif de
  Brest) : pour un couple, CHAQUE bien (locatif, secondaire, terrain, parts…)
  affiche « Appartient à » — titulaire déclaré, ou « à préciser » si la donnée
  manque. Jamais un bien sans rattachement visible.
- JAMAIS TOUT EN GRAS (29/08/2026) : dans les tuiles d'identification (foyer,
  coordonnées), seule la TÊTE de l'information est en gras (« Marié(e) »,
  « salarié cadre », « 1 enfant ») ; le complément après le premier séparateur
  (banque, société, régime…) passe en poids normal — quand tout est en gras,
  rien n'est mis en valeur.
- VALEURS IMMOBILIÈRES LIBRES (29/08/2026) : la valeur de la RP et des biens
  locatifs se saisit librement (champ toujours visible), en dessous ou au-delà
  des bornes du curseur — un parking à 20 000 € ou un appartement à 150 000 €
  doivent pouvoir être renseignés.
- JAMAIS DEUX FOIS LA MÊME QUESTION — cas du PER (29/08/2026) : un PER déclaré à
  l'étape Fiscalité a déjà répondu à la question du versement mensuel ; dans les
  placements, ce versement s'affiche en lecture seule (« déjà renseigné à
  l'étape Fiscalité — se modifie là-bas ») et n'est compté qu'une seule fois
  dans l'épargne programmée.
- CONTRÔLE EXPERT 29/08/2026 (dossier Polo) — RÈGLES GRAVÉES :
  (a) ASSIETTE SUCCESSORALE : abattement 20 % art. 764 bis sur la VALEUR VÉNALE
  de la RP, passif déduit ENSUITE en intégralité (art. 768), frais funéraires
  1 500 € déduits (art. 775) — voir la section « Contrôle expert » de
  references/droits-de-succession.md pour le civil PACS complet (droit temporaire
  au logement un an, clause bénéficiaire nominative, indivision avec mineur,
  PACS avant 2007, option mariage à chiffrer).
  (b) CHAQUE BIEN VENTILÉ SELON SON RATTACHEMENT RÉEL — jamais un même bien
  compté chez les deux, jamais divisé par deux s'il appartient à un seul ; deux
  volets de décès identiques avec des détentions différentes = erreur.
  (c) TOUTE HYPOTHÈSE CHIFFRÉE EST AFFICHÉE : taux et durée d'une capacité
  d'emprunt (3,90 %/20 ans, 4,00 %/25 ans, hors assurance), base d'une
  recommandation d'épargne de précaution (X mois de charges chiffrés + 5 à 10 %
  du locatif), taux de remplacement retraite. Une hypothèse muette fragilise le
  document.
  (d) TAUX DE REMPLACEMENT RETRAITE : 40 % au-delà de 8 000 €/mois (40-45 % sur
  les hauts revenus — 45 % partout était optimiste, l'axe retraite est plutôt
  SOUS-évalué que surévalué sur ces profils).
  (e) CAPACITÉ D'ENDETTEMENT ≠ RESTE À VIVRE : mensualité disponible (ce que la
  banque peut prêter), capacité d'épargne réelle (ce que le budget dégage) et
  participation envisagée sont TROIS chiffres différents — l'expliquer quand ils
  coexistent.
  (f) POINT FORT = CONSTAT NEUTRE : l'incitation motivée (« le temps étant votre
  meilleur allié, il est urgent de… ») vit UNIQUEMENT dans les axes de travail ;
  jamais le même paragraphe deux fois dans un document.
  (g) LIVRABLE CLIENT JAMAIS POLLUÉ : prénoms de test, employeurs en charabia,
  coordonnées non renseignées = document non livrable — signaler et corriger
  avant toute remise.
- DONATION AU DERNIER VIVANT TOUJOURS CHIFFRÉE (29/08/2026) : pour tout couple
  MARIÉ avec enfants, les préconisations chiffrent l'impact d'une DDV — voir
  references/donation-dernier-vivant.md (option mixte 1/4 PP + 3/4 usufruit
  art. 1094-1, cantonnement art. 788 bis, décisive en séparation de biens,
  révocable art. 1096 / caduque au divorce art. 265, à coupler avec la clause
  bénéficiaire démembrée de l'AV). Le simulateur affiche ce scénario dans le bloc
  Transmission avec les droits évités quand la DDV n'est pas en place. Cas de
  contrôle Quoifeur : masse 339 500 €, 2 enfants, usufruit 70 % → 1/4 PP =
  7 314 € de droits, option mixte = 0 €.
  MISE À JOUR 03/09/2026 (décision CGP, item 9 « chiffrer la phrase rouge ») :
  l'impact d'une DDV se CHIFFRE AUSSI DÈS LE RDV 1, sur l'axe « Conjoint
  insuffisamment protégé » d'une famille RECOMPOSÉE sans DDV. La phrase donne,
  pour chaque sens de décès : la part du survivant en ¼ pleine propriété en
  euros sur l'assiette successorale, ce qu'il conserverait avec l'option mixte
  ¼ PP + usufruit des ¾ (valeur fiscale de l'usufruit selon son âge, art. 669
  CGI), et les droits de succession que les enfants paieraient en moins. Si la
  date de naissance du survivant manque, la phrase le DIT au lieu d'inventer un
  usufruit. C'est un CONSTAT chiffré (ce que la loi donne / ce qu'une donation
  donnerait), pas une solution : la préconisation « la signer chez le notaire »
  et la note DDV restent au RDV 2, et les cartes de scénarios successoraux
  marquées RDV 2 ne changent pas. Le couple marié NON recomposé sans DDV garde
  sa phrase courte (« Pas de donation au dernier vivant confirmée ») — chiffrage
  non demandé, à poser au CGP avant de l'ajouter. Cas de contrôle (banc) : RP
  500 000 € en commun, 100 000 € de livrets en commun, un enfant commun + un
  enfant de Monsieur, survivants de 51 et 56 ans → assiette 248 500 € par
  personne (250 000 × 0,8 + 50 000 − 1 500), ¼ PP = 62 125 €, option mixte =
  155 313 € (usufruit 50 %), et au décès de Madame 15 469 € de droits en moins
  pour son enfant unique (186 375 € en PP → 93 187 € de nue-propriété, sous
  l'abattement).
- QUESTIONNAIRE INVESTISSEUR DÉFENDABLE EN CONTRÔLE (29/08/2026) : la trame
  6 blocs MIF 2 / RG AMF art. 325-17 validée par l'expert conformité est dans
  references/questionnaire-profil-investisseur.md (capacité de perte chiffrée,
  vérification EFFECTIVE des connaissances, durabilité en 3 questions non
  fusionnables, profil plafonné par le plus contraignant, déclaration
  d'adéquation individualisée obligatoire).
- OUTIL DE COHÉRENCE CRÉDIT (29/08/2026, contrôle expert n° 2) : capital restant
  dû, mensualité, taux et durée restante sont liés par la formule
  d'amortissement — 3 paramètres saisis = le 4e proposé ; 4 saisis qui ne
  bouclent pas (écart > 3 %) = alerte avec les valeurs cohérentes, à trancher au
  relevé d'amortissement (ex. 255 000 € / 11 ans / 1,45 % ⇒ ≈ 2 090 €/mois, pas
  1 700 €). Dans une analyse : TOUJOURS vérifier que le crédit boucle — ce
  chiffre irrigue endettement, capacité d'emprunt, passif et patrimoine net.
- VOCABULAIRE FISCAL EXACT (29/08/2026) : une DÉDUCTION du revenu n'est jamais
  appelée « réduction d'impôt » (économie = montant × TMI, à écrire ainsi) ;
  le quotient familial affiché est annoté « après X € déduits » quand des
  déductions existent ; l'hypothèse successorale sur les prêts est UNIQUE et
  explicite (retenue : prêts non couverts / alternative non retenue : assurance
  à 100 % — jamais les deux) ; toute capacité d'épargne cite sa base (fourchette
  déclarée par le client) ; aucune note technique interne dans un livrable.
- QUESTION DDV CONDITIONNELLE À LA SITUATION (29/08/2026, contrôle expert) :
  Marié(e) → question pleinement pertinente (quotité disponible spéciale, options
  du conjoint). Veuf(ve) → pertinente AU PASSÉ (elle a pu jouer dans la succession
  déjà liquidée — éclaire le patrimoine actuel). Divorcé(e) → SANS OBJET (révoquée
  de plein droit, art. 265 C. civ.) : ne jamais la poser. Pacsé / union libre /
  célibataire → jamais (la DDV est réservée aux époux). Pour un DIVORCÉ, les
  questions à fort rendement sont : prestation compensatoire (versée/reçue,
  forme), liquidation du régime achevée ou non, TESTAMENT antérieur au profit de
  l'ex-conjoint (lui n'est PAS révoqué automatiquement — à révoquer expressément),
  et CLAUSES BÉNÉFICIAIRES d'assurance-vie désignant nommément l'ex-conjoint —
  le piège le plus fréquent en pratique (une clause nominative résiste au
  divorce). Ces quatre points génèrent des axes de travail dédiés.
  MISE À JOUR 31/08/2026 (décision CGP, remplace le contrôle expert v158) :
  pour un DIVORCÉ, AUCUNE question spécifique — les 4 « points de contrôle du
  divorce » (prestation compensatoire, liquidation du régime, testament
  antérieur, clause bénéficiaire AV) sont SUPPRIMÉS : le divorce est prononcé,
  les règles sont fixées par jugement ; état civil simple comme un célibataire.
  Ne JAMAIS réintroduire ces questions sans accord explicite du CGP.
- UNION LIBRE — CONTRÔLE EXPERT N° 3 (29/08/2026, dossier Curé Sylva) :
  (a) CAPACITÉ D'EMPRUNT : le montant calculé sur les revenus du couple suppose
  un emprunt À DEUX — hors mariage/PACS, un emprunt individuel repose sur les
  seuls revenus de l'emprunteur : toujours donner les capacités indicatives PAR
  CONCUBIN, et ne jamais présenter 1 M€ de dette en point fort sans stress-test
  (vacance locative, hausse des taux, décès de l'emprunteur).
  (b) ORDRE DES PRÉCONISATIONS : la protection du concubin OUVRE les axes — le
  PACS est LE levier structurant (exonération totale art. 796-0 bis, effet
  immédiat, coût quasi nul), puis testament et clauses bénéficiaires ; l'effet
  de levier du crédit ne vient qu'APRÈS (au décès de l'emprunteur, l'enfant
  hérite du bien ET de la dette, le concubin de rien — le levier AGGRAVE le
  problème s'il vient avant la protection). Jamais de contradiction interne
  entre l'hypothèse décès retenue et les vertus prêtées à l'assurance emprunteur.
  (c) ESTIMATIONS SOURCÉES : taux de remplacement affiché sur la tuile retraite,
  hypothèses de taux datées (« hypothèses cabinet août 2026 »), projection
  d'impôt sur 10 ans assortie de la réserve « un passage à la retraite dans
  l'intervalle réduirait ce montant ».
  (d) PROFIL DE RISQUE ET ÉPARGNE PAR PERSONNE en union libre : un questionnaire
  PAR CONCUBIN (deux profils, deux cartes SRI) et l'épargne constituée ventilée
  Monsieur/Madame selon la détention (sans titulaire = 50/50).
- ENFANT MAJEUR : RATTACHEMENT vs PENSION — voir
  references/rattachement-enfant-majeur.md (29/08/2026) : bornes 21 ans sans
  condition / 25 ans si études, âge au 1er JANVIER (une année de plus
  qu'attendu), infirme sans limite, rattachement GLOBAL des revenus de l'enfant,
  avantage écrêté à ~1 807 €/demi-part par le plafonnement du QF, point de
  bascule = plafond QF / TMI (≈ 4 400 €/an à 41 %), conditions (exclusivité,
  justification, proportionnalité art. 205, imposable chez l'enfant, option
  annuelle), plafond légal de déduction confirmé au millésime — jamais de
  mémoire. Axe TOUJOURS NOMINATIF : « Optimiser l'arbitrage rattachement /
  pension alimentaire pour {prénom} ».
- ÉPARGNE DE PRÉCAUTION — MONTANTS FIXES SELON LE FOYER, PARTOUT (04/09/2026,
  décision du CGP sur le dossier test Jean Claude — REMPLACE la règle « X mois
  de dépenses par profil » du 31/08) : UNE seule règle dans tout le document
  (jauge « épargne de précaution », barre de synthèse, points forts, axes, problématiques,
  projection) : PERSONNE SEULE = 10 000 à 15 000 € suffisent ; COUPLE SANS
  ENFANT ≈ 20 000 € ; COUPLE AVEC ENFANT(S) ≈ 25 000 €. Quels que soient les
  revenus et le statut (salarié, TNS, retraité : identiques), SANS supplément
  pour le locatif détenu. Sur-dotation à partir de 1,5 × le haut de fourchette
  (22 500 € pour une personne seule) → l'axe devient « épargne long terme /
  trésorerie qui dort », jamais un point fort. Cas NON tranché : personne
  SEULE AVEC enfant(s) — la règle « personne seule » s'applique en attendant,
  à confirmer avec le CGP. Exemple de calibrage : Jean Claude, célibataire,
  10 833 €/mois, 23 500 € de court terme → AUCUN axe de précaution (l'ancienne
  règle lui réclamait 32 742 à 49 113 €, jugé absurde par le CGP).
  ASSIETTE : l'épargne COURT TERME (livrets + comptes courants), jamais le
  total avec AV/PER. INTERDIT : une cible basée sur le seul souhait déclaré du
  client (le souhait s'affiche en complément, la règle cabinet fait foi).
  BUG CORRIGÉ le 31/08 : estTNS était déclaré APRÈS le calcul de la cible
  (hoisting Babel → undefined) — la cible TNS 6-12 mois n'était JAMAIS
  appliquée dans l'analyse alors que la barre de synthèse l'affichait : c'est
  ce qui rendait les études incohérentes entre elles. Leçon (2e occurrence
  après le NaN du dossier Curé Sylva) : TOUJOURS déclarer une variable AVANT
  tout usage dans ce fichier — Babel transforme const en var et masque
  l'erreur en undefined silencieux.
- TITULAIRE D'UN BIEN — CODES COHÉRENTS DE BOUT EN BOUT (31/08/2026, bug
  corrigé) : la fiche du bien locatif enregistrait le détenteur sous le code
  « m » alors que tout le reste de l'outil (tuile « Appartient à », patrimoine
  par personne, assiette successorale, prévoyance) attend « client ». Effet :
  affichage « à préciser » ET ventilation 50/50 d'un bien pourtant déclaré
  100 % Monsieur — l'assiette successorale du dossier Polo passait de
  180 500 € à 155 500 €. Règle : un même champ porte UN SEUL vocabulaire de
  valeurs de la saisie jusqu'aux calculs ; toute valeur héritée d'un ancien
  format est NORMALISÉE à l'entrée des consommateurs (ncTit), jamais ignorée
  en silence. Vérifier la CHAÎNE COMPLÈTE saisie → affichage → calculs à
  chaque nouveau champ.
- IMMOBILIER SAISI UNE SEULE FOIS (31/08/2026, demande cabinet) : l'audit doit
  être LE PLUS SIMPLE ET EFFICACE possible — la même information n'est JAMAIS
  demandée deux fois. L'immobilier locatif (revenus fonciers, biens, loyers,
  crédits) se saisit à UN SEUL endroit : l'étape « Patrimoine & épargne »
  (déplacé depuis « Activité & revenus ») ; les loyers alimentent
  automatiquement les revenus retenus du calcul d'endettement et la fiscalité.
  L'opération de défiscalisation immobilière de l'étape Fiscalité reste une
  simple ligne de réduction d'impôt — pas une re-saisie du bien.
- BLOC-NOTES DU RENDEZ-VOUS (31/08/2026, demande cabinet) : un bouton « Notes »
  dans l'en-tête de l'audit ouvre à TOUT MOMENT un tiroir de prise de notes
  libres ; le texte est conservé avec le dossier et repris tel quel dans la
  synthèse, dans un bloc « Notes du rendez-vous » (affiché seulement si des
  notes existent). Attention : ce bloc s'imprime dans le document remis au
  client — les notes doivent donc rester présentables.
- NOTES LISIBLES PAR LE CLIENT — FACTUELLES ET COURTES (31/08/2026) : le
  document de synthèse est LU PAR LE CLIENT. Une note explicative se limite au
  FAIT utile (« cette mensualité envisagée est retenue dans l'endettement à la
  place du loyer actuel ») — le raisonnement méthodologique interne (« un
  investissement locatif dimensionné sur le loyer bloquerait le futur achat…,
  si la situation le permet les deux opérations restent compatibles ») ne
  s'imprime JAMAIS : il appartient au discours du conseiller en rendez-vous.
  La mention « règle cabinet » ne s'affiche pas non plus dans le document.
- LOGÉ À TITRE GRATUIT (31/08/2026, dossier Jean Bon) : le statut « logé(e) à
  titre gratuit » s'AFFICHE dans le bloc logement (aucune information saisie ne
  reste muette), avec la note « forfait de 600 €/mois retenu dans l'endettement
  (règle cabinet) — ce forfait disparaît en cas d'achat de la résidence
  principale ». Et la capacité d'achat de la RÉSIDENCE PRINCIPALE se simule
  AUSSI pour un logé à titre gratuit : à l'achat, le forfait de 600 € rejoint
  la mensualité disponible, exactement comme le loyer d'un locataire (libellés
  adaptés : « forfait logement supprimé » / « forfait conservé » en locatif).
- BANQUE SUR SA PROPRE LIGNE (31/08/2026, dossier Jean Bon) : dans les tuiles
  d'identification, la banque de chacun s'affiche SOUS l'activité, sur une
  ligne dédiée (« banque : X ») — jamais enchaînée « activité · banque : X ».
- PRÉSENTATION POINTS FORTS / AXES DE TRAVAIL — EN ATTENTE DE CHOIX DU CGP
  (31/08/2026) : deux variantes proposées sur le dossier Jean Bon (A « cartes
  chiffre en avant + axes numérotés avec ligne d'action » ; B « lignes
  compactes »). Principes retenus dans les deux : chiffre-clé extrait en
  accroche, axes HIÉRARCHISÉS (3 prioritaires en couleur, le reste en gris),
  un constat court + une action par axe, redites fusionnées. NE RIEN mettre en
  production sans le choix explicite du CGP (A, B ou mélange).
- RETRAITE TNS — MÉTHODE (31/08/2026, contrôle expert, dossier QQQQ SSSS) : le
  taux de remplacement « salarié » (40-70 % selon revenu) ne s'applique JAMAIS à
  un indépendant / chef d'entreprise (TNS). Trois raisons : (1) l'assiette
  affichée est un bénéfice avant cotisations, pas le revenu cotisé ; (2) le
  régime de base (SSI ou CIPAV selon la caisse — à identifier) ne valide des
  droits que dans la limite du PASS (48 060 € en 2026) — au-delà, plus de
  droits en base, et les complémentaires (RCI, classes CIPAV) ne compensent que
  partiellement ; (3) 40 % est un ordre de grandeur salarié cadre. → Pour un
  TNS : FOURCHETTE 20 à 30 % du revenu actuel, jamais un chiffre unique, avec
  la mention « régime de base plafonné au PASS — estimation à fiabiliser par le
  relevé de carrière info-retraite.fr ». La baisse de revenus s'affiche aussi
  en fourchette. Un chiffre unique non sourcé sur une projection longue est un
  point de fragilité en cas de contestation. CHANTIER OUVERT (à valider par le
  CGP avant tout développement) : module par caisse (SSI / CIPAV / autres) avec
  leurs barèmes réels pour projeter la pension précisément.
- « ENDETTEMENT MAÎTRISÉ » — JAMAIS « CAPACITÉ INTACTE » (31/08/2026) : quand
  une partie de la capacité des 35 % est consommée (ex. 27 %), écrire « la
  capacité de financement est intacte » est FAUX et la phrase ne sert à rien —
  supprimée. Le point fort « Endettement maîtrisé » d'un non-propriétaire ne
  s'affiche QUE sous 25 %, formulé « il reste une vraie marge de financement, à
  chiffrer selon le projet ». Entre 25 et 30 % : aucun point fort. Le mot
  « intacte » est banni dès qu'un euro de capacité est consommé.
- AXE « LOCATAIRE » SUPPRIMÉ (04/09/2026, décision CGP) : être locataire N'EST
  PAS un axe de travail — l'objectif du cabinet n'est pas de pousser le client
  à acheter sa résidence principale. L'axe (« 1 850 € par mois de loyer, aucun
  patrimoine immobilier constitué ») ne s'écrit plus, ni dans l'outil ni dans
  une analyse rédigée. Le projet RP éventuel reste visible dans les charges et
  le bloc Logement. NE PAS RÉINTRODUIRE sans accord explicite. (Le principe
  du 31/08 subsiste ailleurs : « aucun patrimoine immobilier constitué » ne
  s'écrit que si l'actif immobilier est réellement nul.) Point ouvert posé au
  CGP : la problématique RDV 2 « Locataire : un loyer qui ne construit aucun
  patrimoine » propose encore « arbitrer entre acquisition de la RP et
  locatif » — à réorienter locatif seul ou à supprimer, selon sa réponse.
- OBJECTIF DES AXES DE TRAVAIL — CE QU'ON VA CHERCHER (04/09/2026, mots du
  CGP) : les axes existent pour amener le client vers QUATRE choses : (1) un
  INVESTISSEMENT LOCATIF ; (2) un PER — ou, s'il en a déjà un, vérifier sa
  performance et, le cas échéant, le TRANSFÉRER sur un PER géré par le
  cabinet ; (3) un contrat d'ASSURANCE-VIE — ou clôturer celui de sa banque
  s'il ne donne pas satisfaction ; (4) la RENÉGOCIATION de son assurance de
  prêt pour faire des économies. Tout axe qui ne mène pas à l'une de ces
  quatre actions se justifie (protection du conjoint, fiscalité, retraite)
  ou se supprime (« Locataire »).
- UN MÊME THÈME SE LIT D'UN BLOC (04/09/2026, décision CGP) : « Épargne très
  faible au regard des revenus » tout en haut et « Absence totale d'épargne
  mensuelle » tout en bas n'ont aucun sens. Tous les axes d'épargne
  (précaution / court terme, très faible vs revenus, long terme, performance
  inconnue, versements trop faibles, absence de versements) sont VOISINS, à la
  place du premier d'entre eux. Même principe que disparité de revenus →
  protection du conjoint (28/08).
- CONTRÔLE EXPERT N° 4 (31/08/2026, dossier Que Syl) — RÈGLES GRAVÉES :
  (1) CASE T — PARENT ISOLÉ : pour tout célibataire, divorcé ou veuf avec au
  moins un enfant à charge, la question « vivez-vous seul(e), sans être en
  couple ? » est posée SYSTÉMATIQUEMENT — jamais supposée, jamais oubliée. Si
  oui : majoration art. 194, II CGI (+0,5 part ; +0,25 en garde alternée
  seule). Jamais pour un couple marié/pacsé ni en union libre.
  (2) PENSION ALIMENTAIRE VERSÉE = DÉDUCTIBLE DU REVENU GLOBAL (art. 156,
  II-2° CGI) pour des enfants non rattachés — et la déduction est TOUJOURS
  AFFICHÉE à côté du revenu net imposable (« dont pension versée déduite
  − X €/an »). Un RNI inférieur au brut sans explication ressemble à un faux
  abattement de 10 % et décrédibilise le document. Quand elle existe, il est
  INTERDIT d'écrire « aucun levier activé » : écrire « seule la pension est
  déjà déduite, aucun AUTRE levier ».
  (3) BNC / BIC / BA : JAMAIS d'abattement de 10 % (réservé aux
  traitements, salaires et pensions) — le bénéfice au réel se reprend tel
  quel. Le micro-BNC ne se propose QUE si les recettes sont ≤ 77 700 €
  (plafond à confirmer au millésime) ET après comparaison de l'abattement de
  34 % avec les charges réelles (cotisations TNS en tête).
  (4) COHÉRENCE INTERNE ABSOLUE : jamais un point fort qui contredit un axe
  de travail du même document. « Patrimoine diversifié / allocation
  équilibrée » est INTERDIT quand la poche financière dort en court terme
  (long terme ≤ 20 % du financier). Une résidence secondaire est un actif de
  JOUISSANCE, pas de rendement.
  (5) CAPACITÉ D'EMPRUNT D'UN LOCATAIRE : la capacité calculée en supprimant
  le loyer vaut EXCLUSIVEMENT pour l'achat de la résidence principale — et le
  document le dit. Pour une résidence secondaire ou un investissement
  locatif, la location actuelle est conservée : capacité calculée loyer
  compris (souvent ≈ 0). Jamais « RP ou RS » sur ce chiffre.
  (6) TAUX D'EFFORT D'UN LOCATAIRE : le loyer n'est pas une dette bancaire —
  libellé « Taux d'effort supérieur à 35 % (loyer compris) », jamais « plus
  aucun financement accessible » en face d'un point fort qui affiche une
  capacité d'achat RP : les deux chiffres doivent s'expliquer l'un l'autre.
  (7) ARGUMENT SUCCESSORAL CONDITIONNEL : « frappés de plein fouet par les
  droits de succession » ne s'écrit QUE si la simulation successorale du
  dossier chiffre des droits > 0. À 0 € de droits, l'argument de
  l'assurance-vie est la GESTION, la disponibilité et la transmission hors
  succession (clause bénéficiaire sur mesure, art. 990 I).
  (8) PER TNS CHIFFRÉ : pour un indépendant à TMI ≥ 30 % sans PER, c'est LE
  levier n° 1 et il se chiffre : plafond ≈ 10 % du bénéfice + 15 % de la
  fraction au-delà d'un PASS (PASS 2026 : 48 060 €), économie ≈ plafond × TMI
  — toujours « estimation, à confirmer avec le disponible fiscal de l'avis ».
  (9) EN-TÊTE : « X enfant(s) à charge FISCALEMENT (sur N enfants) » — le
  nombre de parts doit se lire sans contradiction avec la composition du
  foyer affichée à côté.
  (10) GRAPHIQUE DU BARÈME : le libellé du quotient familial reste collé au
  curseur (ancrage adaptatif) — un libellé qui flotte au-delà d'un seuil fait
  croire à une TMI fausse.
- BIEN EN INDIVISION (31/08/2026, validé par le CGP) : pour un « autre bien »
  détenu en indivision (avec une ou PLUSIEURS autres personnes — sœur, frère,
  co-héritiers…), on saisit la VALEUR TOTALE du bien + la QUOTE-PART détenue en
  % + « en indivision avec… » (champ libre). SEULE LA QUOTE-PART entre dans
  l'actif, le patrimoine par personne et la succession — jamais la valeur
  totale. Crédit et loyer : saisis pour la part réellement payée / perçue par
  le foyer. Affichage TOUJOURS explicite : « quote-part X % = Y € (valeur
  totale Z €) » et « INDIVISION — quote-part X %, avec … — seule la quote-part
  est comptée au bilan ». La quote-part manquante bloque la navigation (verrou).
- PENSION ALIMENTAIRE DANS L'ENDETTEMENT (31/08/2026, dossier Que Syl) : la
  pension VERSÉE ne se met JAMAIS en charges — elle DIMINUE les revenus retenus
  (ligne négative côté revenus). Exemple du dossier : 9 167 € de revenus, 900 €
  de pension versée, 2 500 € de loyer → taux = 2 500 / (9 167 − 900) = 30,2 %,
  PAS 3 400 / 9 167 = 37,1 %. La pension PERÇUE s'ajoute aux revenus de la même
  façon, MAIS seulement si l'enfant le plus jeune a MOINS DE 16 ANS (environ) :
  au-delà, elle est versée au plus jusqu'aux 25 ans de l'enfant — horizon trop
  court pour un financement long, la banque ne la retient pas → EXCLUE du calcul
  d'endettement, avec la raison TOUJOURS affichée (« non retenue — enfant le
  plus jeune X ans... »). Le traitement FISCAL ne change pas (perçue imposable
  après abattement 10 %, versée déductible du revenu global).
- COMPARATIF AV / LIVRET — DROITS DE SUCCESSION DU LIVRET AU TAUX FORFAITAIRE,
  SANS ABATTEMENT (30/08/2026, VALIDÉ PAR LE CGP) : dans le comparatif du
  simulateur, la colonne livret au décès ne transmet jamais son capital brut.
  Droits = capital × le taux forfaitaire du comparatif : ligne directe 30 % par
  défaut (taux sélectionnable), hors ligne directe 60 % — SANS AUCUN abattement.
  INTERDIT de réintroduire l'abattement de 100 000 € (art. 779) ou le barème de
  l'art. 777 dans CE comparatif : le CGP l'a fait retirer volontairement et l'a
  reconfirmé le 30/08/2026. (Le moteur de l'AUDIT patrimonial, lui, garde le
  calcul réel : abattements + barème — les deux ne doivent pas être confondus.)
- REPÈRE VISUEL MONSIEUR / MADAME (29/08/2026) : partout où un élément du
  document est rattaché à l'une des deux personnes du couple (détenteur d'un
  placement, épargne par personne, carte de profil de risque, patrimoine net
  par personne), un repère visuel distingue les deux D'UN COUP D'ŒIL : deux
  couleurs dédiées et constantes dans tout le document (Monsieur = bleu
  pétrole #0e7490, Madame = prune #9d4a6b) + une pastille de la même couleur
  devant le nom. Variante claire sur fond sombre (#8fd4e8 / #eab6cc). Jamais
  la même couleur pour les deux ; jamais un simple gras ambigu.
- « LARGEMENT SOUS 35 % » RÉSERVÉ À MOINS DE 25 % (28/08/2026, dossier Tourtel) :
  à 28 % on n'est PAS « largement en dessous » de 35 %. Sous 25 % : « largement
  sous le plafond bancaire de 35 % » ; entre 25 et 30 % : formulation neutre
  (« en dessous du plafond bancaire de 35 % ») ; au-delà : pas de point fort.
- DURÉE RESTANTE ET CRD RELATIF — TOUJOURS CONTEXTUALISER (28/08/2026) : un
  capital restant dû de 10 % ou de 90 % de la valeur du bien, 2 ans ou 15 ans de
  crédit restants — ce n'est PAS DU TOUT pareil, et le constat doit le dire.
  CRD ≤ 25 % de la valeur → « le bien est presque intégralement acquis » ;
  CRD ≥ 75 % → « l'acquisition est engagée, le capital se construit » ; crédit
  finissant sous 2 ans → « cet endettement disparaît à très court terme ».
  Le modèle validé : « Propriétaire de la RP — 450 000 € de valeur estimée, dont
  45 000 € de capital restant dû — le socle patrimonial est posé. »
- TITRES DES AXES ÉPARGNE (28/08/2026) : titres THÉMATIQUES — « Épargne de
  précaution / court terme » (que le court terme soit insuffisant ou surdoté) et
  « Épargne long terme » — le détail vit dans la phrase, pas dans le titre.
- NOMS — JAMAIS « MADAME + PRÉNOM » (28/08/2026) : soit la civilité seule
  (« Madame »), soit « civilité + NOM + prénom » (« Madame TOURTEL Paule »)
  quand le nom est connu. Le prénom ne suit jamais directement la civilité.
  BUG CORRIGÉ (03/09/2026, BUILD v198) : l'en-tête de la synthèse affichait le
  CONJOINT sans aucune civilité, et les deux prénoms tels que saisis — souvent
  tout en minuscules (« martine IKUG » au lieu de « Madame Martine IKUG »).
  Le prénom doit toujours être capitalisé, et la civilité du conjoint se lit sur
  sa PROPRE donnée, jamais déduite de celle du client.
- ASSURANCE DE PRÊT — SIMULATION DE RENÉGOCIATION DÈS QU'UN CRÉDIT EXISTE
  (04/09/2026, décision CGP — remplace le seuil des 10 ans du 28/08) : tout
  crédit en cours (RP, locatif, autre bien, consommation) déclenche
  AUTOMATIQUEMENT l'axe « Assurance de prêt — faire une simulation de
  renégociation pour vérifier si des économies sont possibles », MÊME si le
  client dit l'avoir déjà renégociée. Seule condition : il doit rester AU MOINS
  8 ANS de crédit (« 8 ans grand minimum ») ; un crédit sans durée saisie reste
  signalé. C'est l'une des quatre choses que le cabinet va chercher (voir
  « OBJECTIF DES AXES »).
- « FISCALITÉ SUBIE » SANS « QUASI » (28/08/2026) : même quand de petits
  avantages symboliques existent, l'axe s'intitule « Fiscalité subie ».
- JAMAIS DEUX CONCLUSIONS CONTRADICTOIRES (28/08/2026). Interdit de dire dans le
  même document « épargne très faible au regard des revenus » ET « trésorerie
  court terme beaucoup trop importante ». Quand l'épargne globale est faible (ou
  que le long terme est à zéro), l'axe correct est : « Attention : aucune épargne
  long terme mise en place — situation anormale, d'autant plus en étant
  locataire » (mention locataire le cas échéant). « Trésorerie court terme trop
  importante » est réservé aux dossiers où l'épargne globale est confortable mais
  mal répartie. Avant livraison, relire les axes ENSEMBLE et vérifier qu'aucun ne
  contredit un autre.
- CLIENT DÉJÀ PROPRIÉTAIRE (28/08/2026) : dans les conclusions (points forts, axes),
  l'endettement et la capacité d'emprunt se présentent EXCLUSIVEMENT sous l'angle
  de l'investissement locatif — plus de « résidence principale ou secondaire » pour
  quelqu'un qui est déjà logé. Sur la capacité : ajouter « Le temps étant votre
  meilleur allié, il est urgent de profiter pleinement de cet effet de levier,
  essentiel pour une bonne gestion de patrimoine. »
- PRÉVOYANCE TNS / CHEF D'ENTREPRISE (28/08/2026) : proposer à la saisie de
  renseigner si une couverture prévoyance est en place et CHEZ QUI. Si elle est en
  place : axe « Couverture prévoyance à auditer — il faudra étudier et benchmarker
  cette couverture afin de savoir s'il faut la conserver ou faire un arbitrage. »
  Sinon : « Prévoyance TNS non confirmée ».
- FISCALITÉ (28/08/2026) : toujours PROJETER l'impôt sur 10 ans dans l'axe
  fiscalité — « 28 201 € d'impôt par an, soit plus de 280 000 € sur 10 ans à
  situation constante ».
- ASSURANCE DE PRÊT (formulation 04/09/2026) : « Assurance de prêt — un crédit
  en cours (ou N crédits en cours) : faire une simulation de renégociation de
  l'assurance de prêt pour vérifier si des économies sont possibles. » (l'ancien
  « jamais renégociée » est abandonné : la simulation se propose dans tous les
  cas).
- BANQUE PRINCIPALE : la banque courante du client (et celle du conjoint) est une
  donnée à part entière, INDÉPENDANTE de la banque du crédit — champs dédiés à la
  saisie, restitués dans la ligne Banques de l'identification.
- PRÉSENTATION : le bloc Logement, immobilier & crédits se lit en une ligne TITRE
  par élément + petites paires libellé/valeur (jamais de phrase à rallonge) ; le
  total de l'épargne n'apparaît qu'UNE fois (carte « Épargne constituée — total ») ;
  les compteurs vont par DEUX sur une ligne ; le document s'aère — le lecteur doit
  pouvoir respirer visuellement.

- TROP DE PRÉCAUTION N'EST JAMAIS UN POINT FORT (28/08/2026) : ne JAMAIS présenter
  « épargne de précaution constituée — X mois de charges couverts » comme un point
  fort quand le court terme dépasse la cible du profil. L'épargne court terme
  acceptable est UNIQUEMENT le montant du tableau des repères (charges × mois du
  profil) ; au-delà de 1,5 × le haut de fourchette c'est un AXE DE TRAVAIL, avec
  l'argumentaire complet : de l'argent sur un compte courant ou un livret rapporte
  à peine plus que l'inflation ET sera frappé de plein fouet par les droits de
  succession en cas de décès, alors que placé en assurance-vie ou en PER il offre
  une meilleure rentabilité espérée (toujours « hypothèse de rendement ») et
  l'abattement de 152 500 € par bénéficiaire (art. 990 I CGI). Il n'est pas sain
  d'avoir autant de court terme et rien en long terme. L'outil applique cette
  règle depuis le BUILD v129 (point fort conditionné, axe et problématique RDV 2
  alignés sur la même cible).
- CRÉDIT SE TERMINANT DANS MOINS DE 24 MOIS (28/08/2026, seuil porté de 12 à
  24 mois — voir la règle détaillée « CRÉDIT FINISSANT SOUS 24 MOIS » plus
  haut) : signaler d'une note explicative mais NE PAS le compter dans le taux
  d'endettement ni dans la mensualité disponible. L'outil applique cette règle
  depuis le BUILD v147 (v128 pour le seuil initial de 12 mois).
- PRÉCISION DES LIBELLÉS : dire exactement ce qui est compté — un locataire a un
  LOYER, pas un « crédit en cours » ; les libellés type « Déjà engagés » précisent
  loyer actuel / crédits en cours / loyer + crédits. Ne jamais induire le
  conseiller en erreur par un libellé approximatif.
- SÉMANTIQUE (27/08/2026) : le bloc s'appelle « Les axes de travail et d'amélioration »
  — l'expression « points de vigilance » est abandonnée. Le mot « effort d'épargne »
  est BANNI : dire « participation » (participation mensuelle, participation
  d'épargne). Le bloc s'intitule « Participation mensuelle & apport envisagés ».
- AXES À FAIRE RESSORTIR systématiquement quand les conditions sont réunies
  (dossier TEST Jean, 27/08/2026) :
  1. « Trésorerie court terme beaucoup trop importante » — dès que les livrets et
     comptes courants dépassent nettement la cible de précaution : un capital qui
     dort, rémunéré sous l'inflation.
  2. « Capacité d'endettement non utilisée » — endettement faible avec une vraie
     capacité d'emprunt : il faut ABSOLUMENT utiliser l'effet de levier du
     financement — protéger les héritiers en cas de décès grâce à l'assurance de
     prêt, créer de la valeur, préparer la retraite ou de futures donations.
     (L'outil le déclenche sous 25 % d'endettement avec ≥ 100 000 € de capacité.)
  3. « Versements programmés beaucoup trop faibles au vu des revenus du foyer » —
     comparer au repère de 18 % du revenu (moyenne des Français, INSEE). Ne JAMAIS
     présenter en point fort une « discipline d'épargne » de quelques centaines
     d'euros face à des revenus élevés : c'est un axe d'amélioration, pas un point
     fort.

- PRÉVOYANCE — RÈGLE CABINET (27/08/2026), à appliquer AVANT toute alerte : la
  prévoyance, ce n'est pas seulement un contrat — c'est AUSSI le cash, l'immobilier
  et les placements que le client laisserait à ses héritiers en cas de décès. Un
  client sans couverture de prévoyance contractuelle mais avec de l'immobilier et
  du cash n'est PAS forcément en situation grave : au décès, ses héritiers
  reçoivent ce patrimoine. Ne JAMAIS faire cette analyse trop rapidement : dans
  l'objectif « Protection de la famille » et dans la synthèse finale, toujours
  mettre le besoin de couverture en regard du PATRIMOINE NET TRANSMISSIBLE avant
  de pointer l'absence de contrat comme une faiblesse. Le contrat de prévoyance
  garde toute sa place quand : le patrimoine est encore faible ou illiquide face
  au besoin, ou pour couvrir l'ARRÊT DE TRAVAIL et l'INVALIDITÉ (le patrimoine ne
  remplace un revenu d'activité qu'en se consommant — c'est le vrai angle mort,
  notamment du TNS). L'outil applique cette règle depuis le BUILD v122 (le
  patrimoine transmissible apparaît dans les chiffres et la conséquence des
  problématiques décès/prévoyance).
- Démembrement — RÈGLE CABINET (27/08/2026) : pour un bien détenu en nue-propriété
  ou en usufruit, la valeur qui entre dans l'actif et le patrimoine net est celle de
  la PART DÉTENUE (saisie directement par le conseiller), jamais la valeur en pleine
  propriété. L'outil n'applique AUCUNE décote automatique : il compte le montant
  saisi tel quel — le champ le rappelle explicitement. Dans une analyse, vérifier la
  cohérence (une « nue-propriété » valorisée comme une pleine propriété est un
  signal d'erreur de saisie à questionner) et mentionner le démembrement dans la
  restitution (« détenu en nue-propriété, compté pour la valeur de la part »).
- Compte courant = ÉPARGNE COURT TERME au même titre que les livrets : il entre
  dans la jauge de précaution et dans les liquidités dormantes (rémunération
  nulle — pire qu'un livret). Aucun rendement à demander sur un compte courant.

- Épargne de précaution — RÈGLE CABINET (27/08/2026, REMPLACÉE le 04/09/2026) :
  la cible est désormais un MONTANT FIXE selon le foyer (personne seule 10 000 à
  15 000 €, couple sans enfant 20 000 €, couple avec enfant(s) 25 000 €) — voir
  la règle « MONTANTS FIXES SELON LE FOYER » plus haut ; plus de mois de charges,
  plus de supplément locatif. Ce qui reste vrai : la SUR-DOTATION est une
  anomalie au même titre que l'insuffisance (au-delà de 1,5 × la cible, le
  capital dort à un rendement réel souvent négatif — ex. 200 000 € sur livrets
  = beaucoup trop de court terme, rien en long terme, à relever fermement) ;
  les projets à moins de 24 mois (véhicule, travaux, apport) se provisionnent
  EN PLUS de la précaution, pas dedans. `references/epargne-precaution.md`
  décrit l'ancienne méthode : la lire comme historique, pas comme règle.
- Taux d'endettement : alerte à partir de 35 %.
- Part d'immobilier dans le patrimoine : excessive au-delà de 80 %.
- Disparité de revenus dans le couple : alerte protection à partir de 70/30.
- Arbitrage produits : PER dès que la TMI atteint 30 % ; sinon, et dans tous les cas,
  un MIX assurance-vie + PER — l'un ne va jamais sans l'autre.

## Grille d'alertes prioritaires (toujours vérifier, dans cet ordre d'importance)

1. **Locataire + pas d'épargne + enfants** → warning protection / prévoyance de la famille.
2. **Grosse disparité de revenus (≥ 70/30) + locataire ou propriétaire de la seule RP +
   peu d'épargne + enfants** → warning décès : que devient le conjoint le moins doté ?
3. **TNS sans prévoyance** → risque majeur (décès, invalidité, arrêt de travail),
   surtout s'il n'est pas célibataire.
4. **Plus de 50 ans avec l'épargne majoritairement en immobilier locatif** → très gros
   warning droits de succession : proposer d'arbitrer des biens vers l'assurance-vie
   pour utiliser l'abattement de 152 500 € par parent ET par enfant (versements avant
   70 ans), avec projection avant / après.
5. **Client entre 65 et 70 ans** → alerter systématiquement : les versements en
   assurance-vie AVANT 70 ans conservent le régime 990 I (152 500 €/bénéficiaire) ;
   après 70 ans, abattement global de 30 500 € seulement (757 B).
6. **Capacité d'endettement disponible non utilisée** → warning formulé ainsi : c'est
   quand on est crédible à la banque et en bonne santé qu'il faut mettre en place de
   quoi se protéger et protéger ses héritiers — et si l'on vit vieux et heureux, on
   aura au moins préparé sa retraite.
7. **Moins de 45 ans** → insister sur le temps : c'est maintenant que la capitalisation
   coûte le moins cher.
8. **Enfants de moins de 10-11 ans** → poser la question du financement des études,
   SAUF si l'épargne du foyer est déjà importante (dans ce cas ne pas le mentionner).
9. **Épargne gérée par la banque** → warning systématique ; tenir compte du
   satisfait / pas satisfait déclaré sur chaque produit (pas satisfait = opportunité
   d'arbitrage à mettre en avant).
10. **Biens locatifs existants** → calculer la rentabilité NETTE réelle : loyers nets de
    fiscalité, charges, taxes et frais de gestion, rapportés à la valeur du bien À DATE
    (pas au prix d'achat). Elle est souvent très faible, avec en plus le risque locatif
    (impayés, dégradations, vacance). Le chiffrer, pas l'affirmer.
11. **Locataire avec peu d'épargne** → conclure positivement : aucun souci à rester
    locataire, MAIS il devient impératif de capitaliser et d'utiliser l'effet de levier
    du crédit.

**Capacité d'emprunt — hypothèses et règle des 75 ans.** La durée d'emprunt retenue
doit toujours respecter : âge de l'emprunteur + durée ≤ 75 ans au terme du crédit.
On ne présente au client QU'UNE durée (la plus longue possible sous ce plafond), jamais
un empilement de scénarios. Hypothèses standard du cabinet : taux d'emprunt 3,90 % sur
20 ans et 4,00 % sur 25 ans (hors assurance). Pour simuler un investissement locatif :
retour de loyer attendu de 4,00 % (règle du 27/08/2026 — à mentionner dans la
restitution), dont on ne retient que **75 %** des loyers dans le calcul
d'endettement (pratique bancaire — **75 % depuis le 03/09/2026, auparavant 80 %**) —
les loyers ainsi retenus augmentent la mensualité finançable et donc la capacité en
investissement locatif.

**Capacité d'épargne déclarée = donnée cardinale.** Toute préconisation DOIT être
calibrée sur la capacité d'épargne mensuelle estimée avec le client (champ dédié de
l'étude). Si elle est faible au regard des objectifs (ex. 100 €/mois face à un projet
locatif + retraite + fiscalité), le dire franchement et avec pédagogie : « avec ce
budget, on ne pourra pas adresser tous vos objectifs — hiérarchisons », puis proposer
soit une priorisation, soit les leviers pour augmenter la capacité. Ne jamais dérouler
des préconisations que la capacité déclarée ne peut pas financer.

**Effort d'épargne à rapporter aux revenus — et au statut.** Toujours exprimer
l'épargne mensuelle programmée en POURCENTAGE des revenus nets mensuels du foyer, pas
seulement en euros. Puis juger ce taux au regard de la structure de charges et de la
situation : un propriétaire de sa résidence principale SANS crédit en cours n'a ni
loyer ni mensualité — sa capacité disponible est mécaniquement élevée, et une participation
d'épargne faible est alors une vraie anomalie à nommer. La vigilance monte encore d'un
cran si le client est célibataire avec enfants (une seule force de revenus, une seule
future pension — personne pour compenser) et que sa retraite s'annonce modeste
(salarié : taux de remplacement ~60 % en moyenne, moins pour les cadres supérieurs —
voir references/reversion-et-retraite.md). Cas de calibrage du cabinet (dossier
Lloung) : célibataire, 2 enfants, propriétaire sans crédit, revenus ≈ 3 750 €
nets/mois, épargne programmée 200 €/mois soit ≈ 5 % des revenus = BIEN TROP FAIBLE
pour ce profil — sans loyer ni crédit, elle devrait épargner beaucoup plus. Le dire
avec pédagogie : constat chiffré (« vous épargnez X €/mois, soit Y % de vos
revenus »), rappel qu'aucune charge de logement ne pèse sur le budget, puis question
socratique sur la destination du reste et sur ce qui financera la retraite et les
études des enfants. En cas de doute sur le niveau attendu pour un profil donné,
questionner le CGP plutôt que de fixer un seuil inventé.

**Pension de retraite inconnue (« ne sait pas »)** — cas fréquent : préconisation
systématique de créer / consulter son espace personnel sur info-retraite.fr, de
récupérer l'estimation officielle de pension (relevé de carrière) et de la communiquer
au cabinet pour affiner le calcul du complément à construire.

**Objectif « Protection de la famille » ↔ capacité d'endettement.** Quand le client
coche la protection de la famille ET que le foyer a de la capacité d'endettement
disponible : la préconisation maison est d'utiliser l'effet de levier du crédit —
un investissement immobilier à crédit apporte une ASSURANCE EMPRUNTEUR qui couvre la
famille (au décès, l'assurance solde le crédit : le foyer conserve un bien payé).
S'endetter devient un acte de protection. Cas de friction à traiter FRONTALEMENT :
client qui veut protéger sa famille + locataire + peu d'épargne + ne veut rien
consacrer → lui dire que l'équation est impossible en l'état, les choses ne se font
pas toutes seules : protéger sa famille exige de s'endetter (assurance de prêt) ET de
mettre de l'argent de côté. Pas de solution magique sans participation régulière.

**Projection fiscale à 10 ans — « locataire de ses impôts ».** Toujours intéressant de
projeter le client sur ce qu'il s'apprête à payer d'impôt sur les 10 prochaines années
(impôt annuel × 10, à situation constante, chiffre indicatif). Puis rebondir avec la
formule pédagogique maison : aujourd'hui il est « locataire de ses impôts » — il paie à
fonds perdu. Un investissement immobilier locatif adossé à une loi de finance avec
réduction d'impôt le rend « un peu propriétaire de ses impôts » : il paiera toujours,
mais l'équivalent d'un crédit qui construit un actif, et non un loyer.

**Études des enfants — pas d'alerte si l'épargne couvre déjà.** Ne signaler « études
non provisionnées » que si l'épargne du foyer est réellement insuffisante (repère
outil : moins de ~15 000 € par enfant mineur). Une cliente avec 40 000 € d'épargne et
deux enfants n'a PAS ce point de vigilance — le lui dire serait faux et vexant.

**Absence totale d'épargne mensuelle = point de vigilance à part entière.** Aucun
versement programmé → le signaler, avec la pédagogie de la capitalisation : une petite
épargne sur une durée longue construit un capital significatif. Table de référence
cabinet (versements mensuels, intérêts composés, 15 ans, HYPOTHÈSES de rendement
2 / 4 / 6 %) : 100 € → 20 976 / 24 546 /
28 831 € à 2 / 4 / 6 % ; 200 € → 41 935 / 49 092 / 57 662 € ; 300 € → 62 929 /
73 637 / 89 493 € ; 500 € → 104 881 / 122 729 / 144 154 €. Sur 20 ans, prolonger le
calcul (ex. 200 €/mois avec une hypothèse de rendement de 4 % ≈ 73 400 € ;
300 €/mois ≈ 110 000 €). Utiliser ces ordres
de grandeur pour donner envie, pas pour promettre (toujours « hypothèse de rendement »).

**Lisibilité de la restitution — PAS de résumé en plus (règle du 01/08/2026).** Le
« tableau de bord » a été retiré : trop de résumés et de synthèses successives tuent
la cohérence. La lisibilité vient d'une seule chose : des problématiques PEU
NOMBREUSES, CLASSÉES PAR PRIORITÉ RÉELLE, avec dans chacune la préconisation mise en
avant (l'outil l'affiche en carte sombre et or) — elle doit donner envie d'y aller.
Ne pas créer de sommaire, tableau de bord ou récapitulatif supplémentaire.

**Proximité de tranche (TMI) — règle des 5 %.** Si le quotient familial par part du
foyer est à moins de 5 % du seuil de la tranche supérieure du barème (seuils 2026 par
part : 11 600 / 29 579 / 84 577 / 181 917 €), le mentionner SYSTÉMATIQUEMENT dans la
synthèse. Formulation pédagogique obligatoire, personnalisée au client, sur le modèle :
« Madame Lloung, si votre employeur vous augmente de 1 000 €, ces 1 000 € seront très
prochainement imposés à 30 % (≈ 300 € d'impôt) au lieu de 11 % (≈ 110 €) aujourd'hui. »
Deux garde-fous : (1) ne jamais présenter le passage de tranche comme un problème — une
augmentation reste une bonne nouvelle, et SEULS les euros au-delà du seuil sont imposés
au taux supérieur, jamais l'ensemble des revenus (erreur classique à désamorcer en RDV) ;
(2) rebondir sur le levier : un versement PER se déduit du revenu imposable et éloigne
du seuil — et à l'approche des 30 %, la doctrine cabinet rend le PER d'autant plus
pertinent (déduction bientôt valorisée à 30 %). L'outil FIGARA affiche cette alerte
dans le bloc « Situation fiscale du foyer » de la synthèse (BUILD v95+) : la reprendre
et la développer dans l'analyse.

**Capacité d'emprunt — TOUJOURS les deux calculs.** Le raisonnement change selon la
destination du bien, et la restitution doit présenter LES DEUX montants :
1. **Achat classique (résidence principale ou secondaire)** — investissement sans loyer
   en retour : capacité = mensualité disponible (35 % des revenus − charges) × facteur
   d'actualisation sur la durée max (règle des 75 ans ; 4,00 % / 25 ans, 3,90 % / 20 ans).
   **RÈGLE LOCATAIRE (03/08/2026)** : si le client est LOCATAIRE et qu'on projette sa
   capacité d'emprunt pour l'achat d'une résidence principale, son loyer actuel SORT
   des charges — il déménage à l'achat, il n'aura plus besoin de sa location. Mensualité
   disponible pour l'achat RP = 35 % des revenus − charges de crédits + loyer actuel.
   Exemple : 5 000 € nets/mois, loyer 1 000 € → mensualité RP = 1 750 € (et non 750 €),
   soit ≈ 331 500 € sur 25 ans. En revanche, pour la capacité en INVESTISSEMENT
   LOCATIF, le loyer reste compté dans les charges : il reste locataire. L'outil
   applique cette règle depuis le BUILD v114.
2. **Investissement locatif** — les loyers du bien financé RENTRENT dans les revenus :
   la banque retient **75 %** des loyers mensuels en revenus supplémentaires
   (**75 % depuis le 03/09/2026 — auparavant 80 %**), et l'endettement doit rester
   ≤ 35 % de ces revenus augmentés. Comme le loyer dépend du montant acheté, c'est
   une équation qui se résout ainsi (hypothèses cabinet : retour de loyer attendu
   4,00 %, bien financé à 100 %) :
   M = dispo35 · F / (1 − 0,35 × 0,75 × (0,04/12) × F), avec F = (1 − (1+t/12)^−n)/(t/12).
   La capacité locative est donc TOUJOURS supérieure à la capacité classique.
Exemple validé (dossier Lloung : 5 000 € nets/mois, aucune charge de crédit, 48 ans) :
mensualité disponible 1 750 € → capacité classique ≈ 331 500 € sur 25 ans ; capacité
locative ≈ 397 400 € (au retour de loyer de 4,00 % ; les loyers attendus, retenus à 75 %,
relèvent le plafond des 35 % — c'était ≈ 402 700 € du temps de la règle des 80 %).
Erreur à ne plus commettre : annoncer la seule capacité classique à un client qui
envisage du locatif — son vrai budget est plus élevé.

**RÈGLE GRAVÉE — concentration immobilière (rappelée par le CGP le 01/08/2026,
après DEUX transgressions ; ne plus JAMAIS transgresser).** Si le client ne possède
QUE sa résidence principale (avec ou sans épargne à côté) : INTERDICTION ABSOLUE
d'écrire, sous quelque forme que ce soit, que son patrimoine est « concentré sur
l'immobilier », « peu liquide », « à 80/90 % immobilier » ou toute variante. Cela
sous-entend qu'il ne faudrait pas faire d'immobilier locatif — c'est l'INVERSE du
conseil du cabinet : il est important pour ce client d'utiliser sa capacité d'emprunt
pour se constituer un patrimoine immobilier supplémentaire, qui pourra être liquide
d'ici une dizaine d'années (revente possible), lui aura permis de mettre de l'argent
de côté, et protège ses héritiers en cas de décès grâce à l'assurance de prêt. La
SEULE situation où le sujet peut être écrit : résidence principale + immobilier
LOCATIF déjà détenu + rien en épargne ou pas suffisamment — et alors en positif
(« bâtir le volet financier aux côtés du locatif »), jamais en reproche. L'outil
applique cette règle depuis le BUILD v104.

**Performance des placements existants — deux règles (03/08/2026).**
1. « Ne sait pas » sur la performance = ANOMALIE à faire remonter dans l'analyse.
   Quand le client ne sait pas ce que rapporte un placement (l'outil le saisit via le
   bouton « Ne sait pas » de la fiche placement, BUILD v116), le dire franchement,
   avec pédagogie : on ne peut pas ne pas s'occuper de son épargne et ignorer ce
   qu'elle rapporte. C'est le signe d'une épargne non pilotée — souvent laissée à la
   banque. Rebond systématique : demander le relevé de situation, la date d'ouverture
   et l'historique des versements (même démarche que l'audit du contrat existant).
2. CORRÉLATION RISQUE / PERFORMANCE — jamais une performance dans l'absolu. Un
   rendement se juge PAR RAPPORT au risque pris (profil de gestion déclaré,
   exposition réelle). Exemple de calibrage du CGP : 4 % de performance avec un
   profil et une exposition PRUDENTS, c'est plutôt bien ; 4 % avec une prise de
   risque TRÈS IMPORTANTE, c'est nul. Toujours lire le couple profil × rendement
   constaté avant de qualifier une performance de bonne ou mauvaise — et si le
   profil déclaré et la performance semblent incohérents (prudent affiché mais
   rendement de profil dynamique, ou l'inverse), le relever comme un point à
   éclaircir avec le relevé de situation.

**Doctrine immobilier — le POSITIF d'abord.** Ne JAMAIS présenter une part
d'immobilier de 80 % ou même 90 % du patrimoine comme un mauvais côté quand il s'agit
de la résidence principale : avoir payé sa RP à 48 ans est GÉNIAL — le dire ainsi, en
point fort, et enchaîner sur « la prolonger par l'immobilier locatif serait vivement
recommandé ». INTERDIT : dire à une cliente que « tout son patrimoine est sur
de l'immobilier » quand elle a sa RP payée et une épargne de quelques dizaines de
milliers d'euros — ça ne sert à rien, sinon à lui laisser entendre qu'il ne faudrait
pas faire d'immobilier locatif. C'est l'inverse : l'immobilier locatif N'EST PAS un
facteur d'illiquidité mais un GÉNÉRATEUR de liquidités à moyen terme — à 10 ou 15 ans,
le bien peut être revendu si elle le souhaite, et le capital constitué (payé en partie
par les loyers et le levier du crédit) devient disponible. Toujours présenter cette
option de sortie dans la projection : acheter à crédit aujourd'hui, c'est se créer le
CHOIX demain (garder le bien pour les revenus, ou le vendre pour les liquidités). Le
seuil des 80 % d'immobilier ne redevient une alerte que dans le cas succession du
cabinet : client de plus de 50 ans dont l'épargne est majoritairement en immobilier
LOCATIF → arbitrer quelques biens vers l'assurance-vie (abattement 152 500 € par
parent et par enfant) pour éviter de très lourds droits — et là encore, c'est un
arbitrage d'optimisation, pas un reproche. Par ailleurs,
dans les « problématiques à traiter » de CHAQUE dossier, l'immobilier locatif,
l'assurance-vie et le PER doivent avoir une part belle dès que la capacité d'emprunt
existe — c'est quand on est crédible à la banque et en bonne santé qu'on met les
choses en place (l'outil génère cette problématique depuis le BUILD v98 : la reprendre
et la développer).

**Doctrine locataire.** Être locataire de sa résidence principale n'est PAS un problème
en soi SI le client épargne tous les mois ET détient de l'immobilier locatif en cours.
En revanche, locataire SANS RIEN à côté = très mauvaise stratégie — aggravée s'il y a
une famille, encore aggravée s'il y a une disparité de revenus entre les conjoints.
Depuis le 04/09/2026, ce constat ne fait PLUS l'objet d'un axe « Locataire » : il se
lit à travers les axes d'épargne et de capacité d'endettement non utilisée, et il
oriente vers le LOCATIF, jamais vers l'achat de la résidence principale.

**Locataire avec projet d'achat de résidence principale — règle impérative.** Toujours
interroger le projet RP (l'étude le demande : horizon + mensualité envisagée) et en
tenir compte AVANT de conclure sur la capacité d'emprunt. Exemple maison : capacité
1 500 €/mois (35 %), loyer actuel 1 000 €, projet RP à 1 500 €/mois de crédit → il est
INTERDIT de conclure « capacité d'emprunt disponible » : le projet la consommera en
totalité. Ne jamais annoncer de capacité mobilisable sans avoir vérifié ce point.

**Dossier type « personne seule avec enfants, RP payée, épargne bancaire, capacité
d'emprunt intacte »** (validé par le CGP sur cas réel — femme seule, 48 ans, deux
enfants, RP de 380 k€ sans crédit, 40 k€ sur livrets). Le réflexe : « bonne nouvelle,
il y a de la capacité d'emprunt » — elle résout des objectifs dans LES DEUX scénarios,
et TOUTE action se raisonne ainsi : EN CAS DE VIE, préparer la baisse de revenus à la
retraite (le locatif à crédit construit un complément) ; EN CAS DE DÉCÈS, protéger les
héritiers (l'assurance emprunteur solde le crédit). Moins de ~50 ans et en bonne
santé = crédible auprès des banques, longue durée d'emprunt possible : c'est MAINTENANT
qu'il faut agir. Une personne seule avec des enfants veut évidemment protéger ses
enfants et se protéger pour la retraite — ces deux objectifs sont implicites, les
recommander d'office. La question clé à poser : POURQUOI autant d'épargne sur des
produits bancaires court terme sans projet d'utilisation ? Doctrine : les livrets et
produits bancaires ne servent QUE d'épargne de précaution, plafonnée à la cible du
profil (repères du 27/08/2026, dimensionnés sur les charges — voir
`references/epargne-precaution.md`), jamais plus — rendement très faible ET aucune
exonération au décès. Le
chiffrer : en ligne directe, après l'abattement de 100 000 € par enfant, ces sommes
supportent le barème (tranche à 20 % la plus courante), alors que placées en
assurance-vie ou PER (versements avant 70 ans) l'abattement de 152 500 € par
bénéficiaire les exonère le plus souvent totalement. Toujours montrer l'avant / après.

**Lecture type validée par le CGP** (dossier cadre aisé, forte capacité d'emprunt,
disparité de revenus, retraite déjà amorcée par l'immobilier) — l'analyse doit faire
ressortir dans cet ordre : (1) l'utilisation de l'endettement disponible pour profiter
de l'effet de levier du crédit ET protéger la famille — la disparité de revenus entre
les conjoints rend le foyer vulnérable au décès du principal apporteur ; (2) la
préparation de la retraite : reconnaître ce qui est déjà fait (résidence principale,
bien locatif — le dire positivement : « c'est très bien »), puis pousser plus loin avec
le PER pour ajouter le levier fiscal (déduction à la TMI) au levier immobilier.

En famille recomposée sans donation au dernier vivant, en concubinage ou PACS sans
testament : priorité haute (droits du survivant — art. 757 / 1094-1 C. civ.).
Secondaire, à ne mentionner qu'en fin d'analyse : assurance de prêt renégociée ou non.

## Enfant de plus de 20 ans : âge prévu de sortie du foyer fiscal (CGP, 23/09/2026)

Dès qu'un enfant à charge a plus de 20 ans, le conseiller saisit dans l'audit l'âge prévu
de son départ / sortie du foyer fiscal (`sortieFoyerAge`, année déduite). Dans l'analyse
d'un dossier : lire cette donnée quand elle existe (perte de part fiscale à cette date,
fin du rattachement, budget libéré), et la DEMANDER si elle manque pour un enfant de
plus de 20 ans — ne jamais la supposer.

### Sortie du foyer fiscal — ce que le document en fait (CGP, 23/09/2026)
Le document écrit « X quittera le foyer fiscal en AAAA » et projette l'impôt et la TMI après
son départ (parts recalculées, à revenus et législation constants). Dans une analyse : même
raisonnement — la perte de la demi-part (plafonnée à 1 807 € par demi-part) est un surcoût
d'impôt daté, à anticiper (PER, dispositifs de réduction) AVANT l'année de départ.

## Quote-part de détention d'un bien (CGP, 28/09/2026)
Un bien peut n'être détenu qu'en partie (ex. pacsée qui détient 5 % de la maison, en
indivision). Le patrimoine ne retient que la PART DÉTENUE (valeur × quote-part) ; le
capital restant dû, le loyer et la mensualité sont ceux que le client déclare pour sa part.
Dans une analyse : ne jamais compter la valeur totale d'un bien détenu en indivision ; si
la quote-part n'est pas connue, la DEMANDER.

## Immobilier : origine, plus-value, projet de vente (CGP, 28/09/2026)
Pour chaque bien : mode d'entrée (achat / donation / héritage), année, prix initial (ou
valeur déclarée à l'acte), détention (100 % ou quote-part en indivision). La plus-value
latente se lit valeur − prix initial ; l'impôt se calcule à la date de vente prévue
(abattements pour durée de détention, 19 % + 17,2 %, surtaxe au-delà de 50 000 € ; RP
exonérée). **Un projet de vente = une opportunité de placement**, chiffrée NETTE de crédit
et d'impôt, en préconisation (et en question si la vente est à moins d'un an).
AV et PER : toujours lire l'année d'ouverture (8 ans pour l'AV ; 70 ans pour les primes).

## Contrôles de cohérence des données (à faire SYSTÉMATIQUEMENT avant d'analyser)

Avant toute analyse, vérifier la vraisemblance des données saisies. Toute incohérence
devient une question à poser au client, jamais une donnée acceptée telle quelle.

1. **Crédits — CRD vs mensualités restantes.** Le capital restant dû doit être cohérent
   avec mensualité × nombre de mois restants. Exemple validé par le CGP : prêt auto de
   400 €/mois finissant dans 12 mois → 4 800 € de paiements restants → un CRD déclaré
   de 12 000 € est IMPOSSIBLE ; la fourchette acceptable est d'environ 3 500 à 6 500 €
   (paiements restants ± 30 %, la part d'intérêts diminuant en fin de prêt). Appliquer
   le même contrôle aux crédits immobiliers (mensualité × mois restants vs CRD, marge
   plus large en début de prêt car la part d'intérêts y est forte). Hors fourchette →
   signaler : « donnée incohérente, à revérifier avec le client ».
2. **Plafonds des livrets réglementés (versements, 2026).** Livret A particulier
   22 950 € (personne morale éligible 76 500 €) · LDDS 12 000 € · LEP 10 000 € (sous
   condition de ressources RFR) · Livret Jeune 1 600 € (12-25 ans) · CEL 15 300 €
   (plafond incluant les intérêts capitalisés) · PEL 61 200 € (versements cumulés sur
   la vie du plan). Un encours déclaré au-dessus du plafond est possible pour les
   livrets dont les intérêts capitalisent au-delà (A, LDDS, LEP), mais un dépassement
   important est une erreur de saisie probable → questionner.
3. **Épargne vs revenus vs âge.** Un client qui gagne plus de 100 000 €/an ne peut pas
   n'avoir que 15 000 € de côté sans que cela interpelle : attendre AU MINIMUM ~6 mois
   de salaire d'épargne constituée. La sévérité croît avec l'âge : à 30 ans c'est un
   point d'attention (le temps joue pour lui), à 50 ans c'est critique — le signaler
   d'autant plus fortement que le client vieillit. Une épargne anormalement basse au
   regard des revenus = soit des avoirs non déclarés (à demander), soit un train de vie
   qui absorbe tout (problématique à traiter en priorité).
4. **Montant consacré aux objectifs.** Le champ « Quel montant souhaitez-vous consacrer
   à la réalisation de vos objectifs ? » (fin de l'étape Objectifs) est la contrainte
   budgétaire de toute l'analyse — voir la règle « capacité d'épargne = donnée
   cardinale » ci-dessus.

## Lecture de la détention des avoirs (exports de l'outil)

Dans les dossiers exportés : un livret ne porte que détenteur + versement (jamais
d'origine des fonds — inutile de la commenter). Hors communauté d'acquêts (séparation
de biens, participation, PACS, union libre), le TITULAIRE fait foi : un contrat au nom
de Monsieur est à Monsieur, peu importe quand il a été alimenté — ne pas raisonner en
biens communs. L'origine des fonds n'a de sens qu'en communauté réduite aux acquêts.

### RÈGLE CGP (23/09/2026) — assurance-vie « en commun » : SEULEMENT en communauté
Hors communauté (séparation de biens, participation aux acquêts, PACS, union libre),
**il n'est pas possible de souscrire un contrat d'assurance-vie en commun** (pas de
co-souscription / co-adhésion) : chaque contrat a UN souscripteur-assuré. Une
assurance-vie « commune » n'existe donc que pour des époux mariés sous un régime de
communauté (réduite aux acquêts ou universelle). Conséquences :
- dans l'audit patrimonial, le choix « Commun / joint » **ne doit pas être proposé**
  pour une assurance-vie dès que le foyer n'est pas en communauté ;
- si un dossier exporté porte malgré tout une assurance-vie « commune » hors
  communauté, c'est une INCOHÉRENCE à signaler au conseiller (contrat à rattacher à
  Monsieur ou à Madame), jamais un fait à commenter ;
- ne jamais préconiser « ouvrir une assurance-vie commune » à un couple pacsé, en
  union libre ou marié en séparation : une assurance-vie par tête.
- **PER : jamais commun, quel que soit le régime** (tranché par le CGP le 23/09/2026) —
  un PER n'a qu'un seul titulaire, même en communauté d'acquêts ou universelle. Un
  PER « commun » est une incohérence partout ; deux époux qui cotisent = deux PER.

## Solutions autorisées

L'analyse ne propose QUE ce que le cabinet distribue : assurance-vie, PER, contrat de
capitalisation personne morale (trésorerie d'entreprise), immobilier d'investissement,
financement / crédit, prévoyance, renégociation d'assurance de prêt. Aucun autre
produit, aucun montage exotique, aucun nom d'assureur ou de contrat dans la version
destinée au client.

## RESTITUTION EN DEUX TEMPS — les solutions se méritent (règle du 03/08/2026)

**Document RDV 1 — gabarit complet (validé le 27/08/2026).** Le document remis (ou
montré) au premier rendez-vous doit permettre de LIRE LA TOTALITÉ de la situation,
de façon efficace et visuelle — jamais une succession d'informations. Contenu et
ORDRE imposés :
1. Identification complète : état civil, donation ou non, adresse, contact,
   ACTIVITÉ de chacun (métier, entreprise, statut cadre, 12/13/14 mois),
   composition du foyer avec l'ÂGE et la FILIATION de chaque enfant (commun,
   de Monsieur, de Madame). Le NOM du client n'apparaît qu'UNE SEULE fois dans
   tout le document — dans le bandeau de couverture. La ligne d'identité dit
   « Monsieur, 46 ans ET Madame, 45 ans » (jamais « avec »). L'identification
   affiche TOUJOURS l'adresse, le téléphone et l'email (« non renseigné » si vide —
   le manque est une information), et elle est scindée en DEUX groupes visuels :
   « Le foyer » (état civil, activité, composition) | « Coordonnées » (adresse,
   téléphone, email). Les autres biens sont restitués individuellement : nom donné
   par le client (« maison Bretagne »), type, valeur ET détention (pleine
   propriété / nue-propriété / usufruit).
2. Logement, immobilier & crédits : résidence principale (propriétaire — valeur,
   crédit détaillé : CRD, mensualité, taux, durée, banque — ou locataire : loyer,
   projet d'achat éventuel), immobilier locatif, autres biens, crédits conso
   (ou « aucun » — l'absence est une information).
3. Vos placements — état des lieux : deux JAUGES d'abord (épargne COURT TERME
   face à la cible de précaution du profil — insuffisance en rouge, sur-dotation
   signalée ; épargne LONG TERME — 0 € en ROUGE), puis un TABLEAU propre et aligné,
   une ligne par contrat : Placement | Détenteur (Monsieur / Madame / Commun /
   Propre — la colonne dit À QUI appartient chaque épargne ; « à préciser » si
   inconnu) | Encours | Suivi en BADGES colorés (établissement doré,
   gestion, profil prudent/équilibré/dynamique, rendement constaté en vert ou
   « rendement ? » en rouge, ✓ satisfait / ✗ non satisfait) + ligne Total — jamais
   de sous-type de livret (pas de « Livret A »). Sous le Total : la carte
   « Épargne constituée » — total en grand, puis COURT TERME et LONG TERME sur
   DEUX lignes distinctes : le court terme se mesure face à la PRÉCONISATION du
   profil (repère + zone de dépassement orange + « ≈ X % de la préconisation » en
   gros — un 250 % ou un 1 000 % se VOIT) ; ligne long terme avec sa part de
   l'épargne. AUCUN commentaire dans ce bloc à ce stade — le déséquilibre se voit
   visuellement, les commentaires viennent APRÈS, dans les axes de travail.
   L'identification comporte une ligne BANQUES : la banque de Monsieur et celle de
   Madame (dérivées des établissements déclarés ; « à préciser » si inconnue).
   Chaque AUTRE BIEN précise à QUI il appartient (Monsieur / Madame / commun-
   indivision) en plus de sa détention juridique — « appartient à Madame, détenu en
   NUE-PROPRIÉTÉ » ; la valeur se saisit librement (un terrain à 40 000 € existe).
   JAMAIS de mélange pastilles / lignes / puces — c'est illisible et pas
   professionnel.
4. Les chiffres du dossier — PRÉSENTATION EN COMPTEURS ET JAUGES (le cabinet le
   demande systématiquement) : taux d'endettement en COMPTEUR demi-cercle (cadran
   jusqu'à 50 %, repère 35 %), mensualité disponible en COMPTEUR d'enveloppe 35 %
   (part encore disponible vs déjà engagée ; pour un LOCATAIRE les DEUX lectures —
   achat RP = loyer supprimé, locatif = loyer conservé), capacité d'emprunt en
   COMPTEUR (RP sur un cadran dont le maximum est la capacité locative, retour de
   loyer attendu 4 %), et IMMOBILIER en COMPTEUR (part de l'immobilier dans le
   patrimoine — la rubrique s'appelle « Immobilier », plus « Répartition du
   patrimoine ») : QUATRE compteurs demi-cercle homogènes en grille 2 × 2. JAMAIS
   deux fois la même information dans le document. Compteur Immobilier : 0 %
   s'affiche en ROUGE avec « aucun patrimoine immobilier constitué » — appuyer là
   où ça fait mal, pour donner envie de bouger. PAGINATION : chaque page du PDF doit être OCCUPÉE (le blanc du bas est
   redistribué entre les blocs), chaque nouvelle page démarre avec une respiration
   en haut — jamais collée au bord ; le rendu se VÉRIFIE PAGE PAR PAGE avant toute
   remise au client.
5. Situation fiscale du foyer (AVANT les objectifs) — le MONTANT DE L'IMPÔT et la
   TMI sont mis en exergue (tuiles accentuées, gros chiffres).
6. Objectif(s) exprimé(s) — au SINGULIER s'il n'y en a qu'un — À GAUCHE et « Participation mensuelle & apport
   envisagés » À DROITE, dans UN MÊME bloc en deux colonnes (participation
   mensuelle envisagée, précaution souhaitée, apport, horizon, notes).
7. Points forts du dossier PUIS axes de travail et d'amélioration, EMPILÉS l'un au-dessus de
   l'autre en pleine largeur (jamais côte à côte). PAS PLUS : aucune problématique
   détaillée, aucune piste de solution — le but est de créer la problématique dans
   la tête du prospect, une envie énorme d'en savoir plus, le sentiment que sa
   situation n'est pas ou plus en adéquation avec ses objectifs et qu'il est urgent
   de travailler avec un professionnel. Si on lui donne des pistes trop précises,
   il se contente du document et on ne le revoit jamais.
8. Clôture (28/08/2026) : PAS de bloc « Et maintenant ? » — le document se termine
   sur les axes de travail, puis l'avertissement réglementaire. La SIGNATURE DU
   CABINET figure en PIED DE CHAQUE PAGE du PDF, sur un filet doré : nom du
   cabinet en petites capitales serif dorées, puis conseiller · téléphone · email ·
   adresse en dessous (réglages « Vos informations »). La
   rubrique « Les chiffres du dossier » COMMENCE EN PAGE 2 (saut de page forcé),
   le blanc restant de la page 1 étant redistribué entre ses blocs. Autres règles de mise en valeur :
   la ligne Activité comporte TOUJOURS une entrée pour Monsieur ET une pour Madame
   en couple (« activité non renseignée » si vide) ; les TOTAUX se voient — ligne
   « Total épargne » en bandeau teinté dans le tableau des placements, total de
   l'épargne constituée en grand chiffre serif ; la participation mensuelle et
   l'apport s'affichent en tuiles visuelles ; un vrai espace sépare les points
   forts des axes de travail.
Le format de sortie est le PDF (l'outil exporte directement en PDF depuis le bouton
« Exporter en PDF » — le JSON n'est qu'un export technique pour l'analyse).

Doctrine commerciale du cabinet : ne JAMAIS donner l'analyse complète avec les
solutions au premier rendez-vous — sinon le prospect demande le document, dit
« je vous rappelle »… un jour, et l'affaire est perdue.
- **RDV 1 — le constat** : tout le FACTUEL, exhaustif et soigné — état civil, donation
  au dernier vivant ou non, contact, composition du foyer, chiffres du dossier,
  répartition des placements en montants (livrets / assurance-vie
  / PER / titres), et pour chaque contrat : établissement, qui le gère, profil de
  gestion, rendement constaté, satisfait ou non. Puis les FORCES et FAIBLESSES du
  dossier, et la MISE EN AVANT DES PROBLÉMATIQUES (constat, conséquence, chiffres) —
  SANS donner les solutions. Conclure : « les pistes de solutions correspondant à
  chaque sujet seront présentées lors d'un second rendez-vous ». Précision
  tranchée le 03/09/2026 : chiffrer au RDV 1 ce qu'une donation au dernier vivant
  changerait pour le survivant d'une famille recomposée est un CONSTAT (droits
  fixés par la loi vs droits ouverts par la donation), pas une solution — la
  phrase rouge porte ces euros ; la préconisation, elle, reste au RDV 2.
- **RDV 2 — les préconisations** : objectifs recommandés par le cabinet,
  préconisations, cartes « Notre préconisation » des problématiques, note donation
  au dernier vivant.
L'outil FIGARA a une bascule « RDV 1 · Constat / RDV 2 · Préconisations » dans le
bandeau de la synthèse (BUILD v113) — le PDF exporte le mode affiché. Quand le CGP
demande une analyse sans préciser, produire par défaut la version RDV 1 et proposer
la version RDV 2 en complément séparé.

## CE QUE LE CLIENT MET EN FACE DE SES OBJECTIFS — fin du document RDV 1 (15/09/2026)

Décision du CGP. Le premier rendez-vous ne se termine plus sur la fiscalité : il
se termine sur **ce que le client épargne déjà, ce qu'il est prêt à y consacrer,
et ce qu'il reste à traiter**. Ordre imposé des cinq derniers blocs :

1. **Votre épargne mensuelle actuelle.** Ce qui part chaque mois, PLACEMENT PAR
   PLACEMENT, tel que le client l'a déclaré : « 200 €/mois sur un livret A,
   100 €/mois sur une assurance vie », puis le total et la part des revenus, avec
   le repère de cabinet : *« Moyenne des Français : 18 % des revenus, dont 9 % en
   épargne financière. »* Constat pur : on nomme les montants, on ne les juge pas.
   **Nommer QUI verse** (CGP, 15/09/2026 : « c'est Monsieur qui verse 200 € et
   Madame 100 € — sois précis »). Sur un couple, deux versements sans détenteur
   sont illisibles : chaque montant porte le nom de celui qui verse (Monsieur /
   Madame / Commun), et le total est repris par personne. Un détenteur non
   renseigné s'écrit « détenteur à préciser » — le manque est une information.
   **Pas de sous-titre explicatif** sous le titre d'un bloc de chiffres : « ce qui
   part chaque mois vers vos placements, tel que vous nous l'avez déclaré » a été
   supprimé — « ce genre de phrase ne sert strictement à rien ».

2. **Importance des versements programmés** — le tableau 1,7 % / 5 % / 7 % sur 15
   et 20 ans, sur trois lignes : ce que le client épargne DÉJÀ, sa capacité
   DÉCLARÉE, et un cran au-dessus. Le mot « effort » reste banni : on écrit « la
   même somme, placée autrement », « sans un euro de plus chaque mois ».
   **Lisibilité exigée par le CGP (15/09/2026)** : les mots « rendement annuel »
   sont écrits dans l'en-tête, chaque taux est un chiffre lisible (et non une
   mention de 8 px), la colonne 5 % est teintée et soulignée sur toute la
   hauteur, et **la ligne de la capacité déclarée est ENCADRÉE EN VERT**. Seule
   mention écrite sous un taux : « livrets » sous 1,7 %. Ne jamais qualifier 5 %
   d'« équilibré » ni 7 % de « dynamique » : ce serait un profil de risque, que
   le cabinet n'a pas arbitré.
3. **Vos objectifs et les moyens que vous y consacrez** — les objectifs exprimés,
   classés par priorité avec le client, en regard de l'apport mobilisable et de la
   participation mensuelle envisagée. Le client doit LIRE d'un coup d'œil ce qu'il
   veut et ce qu'il met en face. Ce bloc figure aussi au RDV 2 ; en revanche les
   objectifs RECOMMANDÉS par le cabinet et les préconisations restent au RDV 2.
4. **Les questions du prochain rendez-vous** (CGP, 15/09/2026 : « je veux que tu
   poses des questions qui donnent envie au client que je lui donne les réponses
   lors du prochain rendez-vous »). Chaque axe de travail se traduit en UNE
   QUESTION posée au client — on POSE, on ne répond pas ; aucun chiffre du dossier
   (le chiffre EST la réponse, et la réponse se paie d'un second rendez-vous) ;
   aucune préconisation, aucun nom de produit. 
   **CE QUI FAIT QU'UNE QUESTION PORTE** (arbitré le 15/09/2026) : elle contient
   LE CHIFFRE DU CLIENT (son dossier a été travaillé), elle révèle UN COÛT QU'IL
   N'A JAMAIS CALCULÉ (il y a urgence), et sa réponse DEMANDE UN SAVOIR-FAIRE (il
   ne la trouvera pas seul). Une question à laquelle il peut répondre « je ne sais
   pas » et passer à autre chose est une question ratée. **Vouvoiement et
   conditionnel**, toujours — c'est le ton du cabinet.
   **UNE SEULE QUESTION PAR FAMILLE**, jamais deux fois le même registre :
   protection · fiscalité · retraite · levier immobilier · épargne qui dort. Les
   cinq familles ouvrent l'assurance vie (protection, épargne qui dort), le PER
   (fiscalité, retraite) et l'investissement locatif (levier) — sans qu'aucun nom
   de produit soit prononcé.
   **RÈGLES D'ÉCRITURE** (dictées le 15/09/2026 : « le langage utilisé pour poser
   les questions est catastrophique… nous sommes dans un monde professionnel du
   conseil financier ») :
   1. **Le constat chiffré d'abord**, en phrase affirmative, PUIS la question.
      « À 64 ans, soit dans 19 ans, vos revenus passeraient de 12 500 € à
      5 000 € par mois. Comment comptez-vous compenser cette baisse ? »
   2. **Des tournures de conseil** : « Comment comptez-vous… », « Quelle serait la
      solution la plus pertinente pour… », « Que percevrait… ».
   3. **Aucune incise, aucune rhétorique, jamais deux questions imbriquées.** Pas
      de tiret cadratin au milieu de la phrase, pas de « pourquoi sont-ils là ? »,
      pas de « — pas en patrimoine, en argent disponible ». Une phrase de constat,
      une phrase de question, point.
   4. **Le vocabulaire du métier** : Trésor public, capacité d'emprunt, donation
      au dernier vivant, garanties équivalentes, affectation de l'épargne.

   ### CE QUE LE DOSSIER AUTORISE À DEMANDER — trois règles de fond (17/09/2026)

   Le CGP : « il faut que le client trouve la question intéressante mais ne puisse
   pas y répondre, et ait donc envie du second rendez-vous pour avoir la réponse.
   Il ne faut pas que ce soit trop racoleur non plus, ni trop grossier. » Les
   questions vont dans la direction de l'assurance vie, du PER et de
   l'investissement locatif — sans jamais nommer un produit.

   1. **SANS CAPACITÉ D'EMPRUNT, PAS UN MOT D'INVESTISSEMENT.** Si la capacité
      d'emprunt ou la mensualité disponible est nulle, la famille « levier
      immobilier » SORT du tirage. Poser une question d'investissement locatif à un
      client qui ne peut pas emprunter lui montre qu'on n'a pas lu son dossier —
      c'est le contraire de l'effet recherché.
   2. **S'IL A DÉJÀ UN PER**, la question ne porte plus sur le dispositif (il l'a
      déjà) mais sur le **RENDEMENT** : un capital mal placé jusqu'à 65 ans coûte
      des dizaines de milliers d'euros, et cela se chiffre. Cette question passe
      alors en tête du tirage.
   3. **S'IL A DES ENFANTS**, la transmission entre dans le tirage. **S'IL N'EN A
      PAS**, elle en sort et la protection du conjoint ou du partenaire remonte :
      on ne parle jamais de transmission aux enfants à un client qui n'en a pas.

   Ces trois conditions se lisent dans la SAISIE (composition du foyer, avoirs
   déclarés, capacité calculée sur les charges), jamais dans une impression.

   ### LA QUESTION QUI DOIT SORTIR AVANT TOUTES LES AUTRES (18/09/2026)

   Le CGP, sur un dossier réel : « sur un dossier tel que celui-ci, une question doit
   ressortir **immédiatement** — pourquoi autant d'épargne court terme, qui ne rapporte
   pas grand-chose et qui sera frappée de plein fouet par les droits de succession en
   cas de décès, **alors qu'il n'y a aucun projet d'achat de résidence principale** ?
   Il doit y avoir une réorganisation et une réflexion importante sur ce sujet. »

   **TROIS CONDITIONS RÉUNIES** — une trésorerie importante (≥ 50 000 € sur livrets et
   comptes courants), un rendement de livret, et **aucune destination annoncée** (pas
   de projet d'achat de résidence principale au dossier). Quand elles le sont, la
   question passe **devant toutes les autres** (priorité 1) :

   > « Vous conservez 120 000 € sur des livrets et des comptes courants, sans projet
   > d'achat de résidence principale. Cette somme rapporte peu et entrerait
   > intégralement dans votre succession. Comment comptez-vous la réorganiser ? »

   Elle réunit les trois angles du sujet : le rendement perdu, la fiscalité successorale
   subie, et l'absence de projet qui justifierait de garder cette somme disponible. Si
   un projet d'achat de résidence principale EXISTE, la trésorerie a une destination et
   la question ne se pose pas : elle sort du tirage.

   ### LA QUESTION BONUS — LE PLACEMENT DÉDUCTIBLE, AU TAUX DU CLIENT (18/09/2026)

   Le CGP : « on intègre une question 6 en bonus ». Le plafond passe donc à SIX
   questions : cinq issues du tirage, plus celle-ci, toujours en dernier.

   > « Savez-vous que vous pouvez bénéficier d'un placement garanti à **30 %** par
   > l'État la première année ? Le montant est plafonné : il se vérifie sur votre
   > dernier avis d'imposition. »

   **LE TAUX ANNONCÉ EST LA TMI DU FOYER, JAMAIS UN TAUX GÉNÉRIQUE.** 30 % pour un
   client dans la tranche à 30 %, **41 % s'il est à 41 %, 45 % s'il est à 45 %**. En
   dessous de 30 % l'argument ne porte pas : la question ne sort pas.
   **Note interne, qui n'apparaît PAS sur le document** : ce « placement garanti par
   l'État » est la déduction du versement PER du revenu imposable — l'économie d'impôt
   vaut exactement la TMI. Aucun produit n'est nommé au client.

   ### LES SIX FORMULATIONS DÉFINITIVES — DICTÉES PAR LE CGP LE 18/09/2026

   Elles remplacent toutes les écritures antérieures. **Plus courtes, plus frontales :
   la condition d'abord, la question ensuite, et rien de plus.** Le CGP a raccourci
   lui-même chacune d'elles ; ne pas les rallonger « pour expliquer ».

   1. **Protection** — « **En cas de décès, sans testament, savez-vous ce que percevra
      votre partenaire ?** » (variante mariés : « …sans donation au dernier vivant,
      …ce que percevra votre conjointe ? » ; variante seul : « …sans disposition
      particulière, …ce que percevront vos héritiers ? »). La CONDITION ouvre la
      phrase, le verbe est au futur simple.
   2. **Transmission** — « **Connaissez-vous l'article 990 I du code général des
      impôts ?** » **Seule, sans préambule et sans montant.** Le chiffre n'est plus
      dans la question : c'est la réponse, et elle se paie d'un second rendez-vous.
   3. **Fiscalité** — « **Que vous évoque le chiffre de 278 710 € ?** » Le montant
      d'impôt sur dix ans, jeté sur la table, sans commentaire. C'est la plus courte
      et la plus efficace.
   4. **Retraite** — « **Dans 21 ans, vous aurez 64 ans, vos revenus passeront de
      13 417 € à environ 6 000 €/mois. Comment comptez-vous compenser cette baisse ?** »
      L'ÉCHÉANCE d'abord (« dans 21 ans »), l'âge ensuite ; la pension est ARRONDIE aux
      500 € et précédée d'« environ » — une estimation ne se donne pas à l'euro près.
   5. **Levier** (si capacité d'emprunt) — « **Si la banque vous faisait un prêt
      d'environ 350 000 €, dans quoi l'investiriez-vous ?** » Montant arrondi aux
      50 000 €.
   6. **Bonus** (si TMI ≥ 30 %) — « **Connaissez-vous un placement qui vous permette
      d'obtenir l'équivalent d'un rendement de 45 % garanti par l'État la première
      année ?** » (écriture définitive, 18/09/2026 — le taux se place AVANT « garanti
      par l'État », pas après). Le taux EST LA TMI DU FOYER : 41 % s'il est à 41 %, 45 % s'il est à
      45 %. Note interne, absente du document : c'est la déduction du versement PER.

   ### CE QUI TIENT SUR UNE MÊME DIAPOSITIVE — MODE PRÉSENTATION (18/09/2026)

   Le CGP : « mets sur la même slide revenus et charges et logement, immobilier &
   crédits. Il faut aussi que la slide 6 puisse aller avec la 5, idem pour la 8 et la
   9, idem pour la 11 et la 12. » Le constat se présente donc en **NEUF chapitres** :

   1. Ouverture · 2. État civil · 3. **Revenus et charges + Logement, immobilier &
   crédits** · 4. **Épargne + Votre épargne mensuelle actuelle** · 5. Fiscalité ·
   6. **Les chiffres du dossier + Patrimoine net** · 7. Objectifs et questions
   (versements programmés) · 8. **Objectifs et participation + Les questions du
   prochain rendez-vous** · 9. Préparer le prochain rendez-vous.

   Quand des NOTES ont été saisies, elles ouvrent la diapositive 8 et les questions la
   complètent : les notes restent juste au-dessus des questions.

   ### LES QUATRE FORMULATIONS ARBITRÉES LE 17/09/2026

   - **Transmission** (si enfants) — formulation REPRISE PAR LE CGP le 18/09/2026 :
     « **Savez-vous que l'article 990 I du code général des impôts vous permet de
     transmettre à votre décès 152 500 € à chacun de vos bénéficiaires déclarés, sans
     un euro d'impôt ?** » Le montant N'EST PLUS multiplié par le nombre d'enfants :
     l'abattement vaut 152 500 € **par bénéficiaire désigné** (capitaux décès
     d'assurance vie alimentés avant 70 ans), et c'est ainsi qu'il se dit en
     rendez-vous. « à chacun de » a été ajouté à la phrase du CGP pour que l'énoncé
     reste juste. Aucun client ne connaît cet article : il ne peut pas répondre, et la
     réponse ouvre l'assurance vie.
   - **Rendement** (si un capital est placé à long terme ; prioritaire si PER) —
     « D'ici vos 65 ans, soit 19 ans, vos 183 000 € d'épargne placés au taux des
     livrets plutôt qu'à 5 % représentent 210 346 € de capital en moins.
     Savez-vous à quel taux votre épargne travaille réellement, frais déduits ? »
     Les taux sont ceux du tableau des versements programmés (1,7 % et 5 %) : le
     document ne peut pas dire deux choses différentes.
   - **Fiscalité** — arbitrage du CGP : **le mécanisme, pas le montant.** « À
     législation constante, vous verserez 262 000 € d'impôt **sur les dix prochaines
     années** (et non « d'ici dix ans », corrigé le 18/09).
     Savez-vous quelle part peut être réorientée vers votre propre patrimoine, et
     **par quel mécanisme** ? » Le client peut estimer un montant ; il ne peut pas
     nommer le mécanisme, et c'est ce dernier mot qui crée le second rendez-vous.
   - **Levier** (seulement si capacité d'emprunt) — formulation du CGP, 18/09/2026 :
     « **Si la banque vous faisait un prêt d'environ 350 000 €, dans quoi
     l'investiriez-vous ?** » Le montant est **arrondi aux 50 000 €** : un chiffre au
     franc près appellerait une discussion sur le calcul, alors que la question porte
     sur l'EMPLOI des fonds. Les deux écritures précédentes sont abandonnées : « quelle
     serait la solution la plus pertinente pour l'utiliser ? » appelait « acheter un
     bien », et « savez-vous quel loyer et quelle économie d'impôt… » posait deux
     sujets à la fois.

   **MÉCANIQUE** : une question entre dans le tirage soit par une FAIBLESSE du
   dossier (mécanisme d'origine), soit par une CONDITION DE FAIT — des enfants, un
   capital placé. Les deux voies coexistent ; la priorité et la règle « une seule
   question par famille » s'appliquent ensuite.

   **Formulations validées par le CGP** :
   - conjoint → « Que percevrait votre conjointe en cas de décès, en l'absence de
     donation au dernier vivant ? »
   - partenaire de PACS ou concubin → « Que percevrait votre partenaire en cas de
     décès, au vu de l'absence de testament ? »
   - succession → « Vos enfants disposeraient de six mois pour régler les droits
     de succession. Comment comptez-vous leur en donner les moyens ? »
   - protection des enfants → « Comment protéger plus efficacement vos enfants ? »
   - fiscalité → « À ce rythme, vous verserez X € au Trésor public sur les dix
     prochaines années. Comment cette somme pourrait-elle être utilisée
     différemment, notamment pour compenser la baisse de vos revenus à la
     retraite ? »
   - retraite → « À 64 ans, soit dans X années, vos revenus passeraient de A € à
     B € par mois. Comment comptez-vous compenser cette baisse ? »
   - capacité d'emprunt → « Votre capacité d'emprunt s'élève aujourd'hui à X €.
     Quelle serait la solution la plus pertinente pour l'utiliser ? »
   - épargne qui dort → « Vos X € sont aujourd'hui placés sur des livrets et des
     comptes courants. Quelle serait l'affectation la plus pertinente pour cette
     épargne ? »
   - prévoyance → « En cas d'arrêt de travail prolongé, de quels revenus
     disposeriez-vous, et pendant combien de temps ? »
   - performance inconnue → « Connaissez-vous le rendement net de vos contrats
     actuels, une fois les frais déduits ? »
   - assurance de prêt → « Votre assurance de prêt n'a jamais été renégociée.
     Quelle économie pensez-vous pouvoir en obtenir, à garanties équivalentes ? »

   **CINQ QUESTIONS AU MAXIMUM** (CGP, 15/09/2026 : « je préfère 5 questions très
   pertinentes que 10 moins intéressantes »), choisies par PRIORITÉ, dans cet
   ordre : protection du conjoint et des enfants → transmission → retraite →
   fiscalité → prévoyance → épargne mal placée → capacité d'endettement → le
   reste. **Présentation** : liste éditoriale, un numéro discret, la question en
   serif, un filet entre chacune — jamais des pastilles ni une grille de cartes.
   **Une seule exception à la règle « aucun chiffre »** : la question fiscale
   porte le montant d'impôt sur dix ans (« Comment utiliser autrement les
   267 080 € d'impôt que vous verserez dans les dix ans ? ») — c'est ce chiffre
   qui fait lever les yeux. Si aucune question n'est écrite pour un axe, on n'en
   invente pas : l'axe ne sort pas.
   C'est le temps commercial : le premier rendez-vous POSE les questions, il n'y
   répond pas — si on en dit trop, le client se dit qu'il peut faire le travail
   seul.
5. **Pour préparer notre prochain rendez-vous** — les devoirs du client. Deux
   documents systématiques (info-retraite.fr : estimation de retraite, puis
   « Mon épargne retraite » → « Voir mes contrats »), **plus tout ce que le
   dossier ne sait pas** (CGP, 15/09/2026). Un devoir ne se déduit JAMAIS d'un
   chiffre calculé : il vient d'un champ laissé vide ou marqué « je ne sais pas ».
   Déclencheurs validés :
   - **quotité d'assurance emprunteur inconnue** (couple) → les conditions
     particulières ou le certificat d'adhésion : c'est la quotité qui détermine
     ce qui reste dû en cas de décès ;
   - **assurance de prêt jamais renégociée, ou dont on l'ignore** → le tableau
     d'amortissement et l'offre de prêt, pour préparer une simulation chiffrée
     de l'assurance emprunteur au prochain rendez-vous ;
   - **placement dont le rendement est inconnu** → le dernier relevé de situation
     annuel (performance, frais, allocation) ;
   - **TNS dont la prévoyance n'est pas connue** → les conditions particulières
     et le tableau de garanties, pour comparatif. Si le client a répondu qu'il
     n'a AUCUNE couverture, il n'y a pas de contrat à demander : c'est une
     question du prochain rendez-vous, pas un devoir.
   Toute question du questionnaire qui peut rester sans réponse doit proposer
   « Je ne sais pas » — le doute se traite comme le manque.
   C'est ce bloc qui ferme le document.

**Interdit dans « Épargne constituée »** (CGP, 15/09/2026) : **aucun commentaire
sur l'épargne de précaution**. Ni « il manque X € », ni la cible recommandée, ni
« au bon niveau », ni « X € au-delà » — le montant court terme se suffit à
lui-même. Le dimensionnement de la réserve se traite de vive voix, pas dans le
document.

Le document se présente ensuite À L'ÉCRAN, chapitre par chapitre, et s'envoie au
client par mail à la fin du rendez-vous.

## DOCTRINE DE PRÉSENTATION CLIENT (CGP, 23/09/2026) — pour le document remis ET pour toute analyse de dossier

Transformer l'analyse technique en outil de décision clair et percutant. S'applique
au rapport de mission / bilan patrimonial du simulateur comme aux analyses de dossier
faites ici. Compatible avec « la restitution en deux temps » : ce qui suit ordonne
CHAQUE temps, il ne rouvre pas les solutions au RDV 1.

### 1. Synthèse d'ouverture — tableau de bord visuel en première page
- Constat : le client profane se perd dans le volume et la technicité ; s'il ne
  comprend pas les enjeux immédiatement, son attention chute avant les solutions.
- Mécanisme : première page = tableau de bord. Matrice **Forces / Faiblesses /
  Opportunités / Risques** (comme pour le dossier LEE) + liste des **objectifs
  prioritaires** du client.
- Effet attendu : ancrage immédiat — le client se sent écouté (ses objectifs en
  première ligne) et perçoit l'urgence (risques nommés : baisse de revenus à la
  retraite, vulnérabilité du conjoint).
- Vigilance : **aucun jargon** dans cette synthèse. Parler en bénéfice client
  (« Protéger votre conjoint », jamais « mettre en place un démembrement croisé »).

### 2. Chaque recommandation en 4 temps, toujours dans cet ordre
1. **Votre objectif** (constat) : ce que le client veut résoudre.
2. **Notre solution** (mécanisme) : le principe expliqué simplement — les articles
   (150-0 B ter, art. 1094-1 C. civ., CGI…) vont en note de bas de page ou en annexe.
3. **Votre gain** (effet attendu) : ce que cela rapporte concrètement.
4. **Les conditions** (points de vigilance) : blocages, risques, horizon.
- Effet attendu : le client comprend le « pourquoi » et le « combien » avant le
  « comment ».
- Vigilance : **ne jamais masquer un risque** (illiquidité, requalification, blocage
  des fonds). La confiance se bâtit sur la transparence des contraintes.

### 3. Modélisation chiffrée par scénarios comparatifs — Avant / Après
- Constat : le client ne se projette pas sur un levier abstrait.
- Mécanisme : tableau **Scénario A (statu quo / objectif initial)** contre
  **Scénario B (notre recommandation)**, indicateurs en lignes. Modèle type (dossier LEE) :

| Indicateur | Scénario A — statu quo / objectif initial | Scénario B — notre recommandation |
|---|---|---|
| Épargne brute annuelle | 4 800 €/an | 24 519 €/an |
| Économie d'impôt générée | − 1 440 € | − 7 356 € |
| Épargne nette réelle | 3 360 € | 17 163 € |
| Bénéfice à terme | capitalisation insuffisante | couverture optimale du besoin retraite |

- Effet attendu : le déclic décisionnel — l'écart de création de valeur justifie
  les honoraires et valide le conseil.
- Vigilance : **énoncer les hypothèses** (rendement net de frais, TMI stable,
  législation en vigueur). Le mot « effort » reste banni du document (règle du CGP) :
  écrire « épargne brute / nette », jamais « effort d'épargne ».
- Note : cette doctrine confirme le PRINCIPE du tableau avant / après de l'Analyse R2 ;
  c'est son contenu actuel (droits de succession, bénéficiaires) qui reste à refondre
  avec le CGP — voir « ce qui reste ouvert ».

### 4. Ordonnancement des recommandations — temporalité et criticité
1. **Civil et famille** — la fondation : régime matrimonial, testaments, donations.
2. **Restructuration** — les murs : holding, rachat.
3. **Optimisation fiscale et épargne** — le toit : PER, LMNP, assurance-vie.
4. **Diversification** — la décoration : FIP, FCPI, private equity.
Jamais un investissement risqué avant d'avoir sécurisé le conjoint. Le client doit
voir une démarche structurée, sécurisée et globale.

### 5. Fin du document — plan d'action opérationnel (« checklist praticien »)
Le client sait exactement ce qui se passe après le rendez-vous de restitution.

| Étape | Action | Intervenant | Coût estimé |
|---|---|---|---|
| 1. Validation | Signature de la lettre de mission, validation des scénarios choisis | Client / CGP | inclus dans la lettre de mission |
| 2. Sécurisation civile | Instructions et rendez-vous de signature des actes (aménagement matrimonial, DDV…) | Notaire | émoluments notariaux (à deviser) |
| 3. Déploiement financier | Ouverture des enveloppes cibles (assurance-vie, PER), transfert des fonds | CGP | frais d'entrée / honoraires de conseil |
| 4. Déploiement immobilier | Recherche foncière, montage bancaire et comptable | CGP / courtier / expert-comptable | honoraires, frais de dossier, frais de notaire |

### ALERTE — clarté ET conformité (MIF2 / DDA / loi de finances)
Un document épuré pour le client n'allège pas le formalisme : profil de risque,
adéquation, information sur les frais, mise en garde sur le risque de perte en
capital et sur la péremption des dispositifs fiscaux (FIP Corse, mesures PLF en
cours). Ces mentions, les disclaimers légaux, les DPE et les articles de loi vont
dans un chapitre final **« Annexes réglementaires et méthodologiques »** : corps du
texte allégé, cabinet protégé.

## LES QUESTIONS — retours du CGP du 23/09/2026 (dossier DURAND)

- **Trésorerie qui dort** — tournure dictée : « Vous conservez N € sur des livrets et des
  comptes courants : **savez-vous comment ils sont taxés en cas de succession ?** ». Plus
  de « cette somme rapporte peu… comment comptez-vous la réorganiser ? ».
- **Question « rendement » supprimée** : elle disait « vos 205 000 € placés au taux des
  livrets » alors que ces 205 000 € étaient des placements LONG TERME — une question qui
  contredit le dossier est « stupide ». **Il vaut mieux cinq questions pertinentes qu'une
  sixième stupide** : ne jamais compléter à six pour faire nombre. Ne pas réintroduire.
- Règle générale confirmée : chaque question contient LE chiffre du client, et ce chiffre
  doit être celui de la bonne poche (court terme ≠ long terme).

## LE DOCUMENT NE DIT QUE CE QUI A DU SENS — retours du CGP du 28/09/2026 (dossier BRICHET)

Marine BRICHET, 61 ans, retraitée, pacsée, **conjoint non renseigné**, un locatif. Le document
lui demandait d'augmenter son épargne, d'utiliser sa capacité d'emprunt, d'ouvrir un PER, de
créer son espace info-retraite, d'investir en locatif — et écrivait « Loyers encaissés × 75 % ».
Règles, toutes absolues :

1. **Un conjoint non renseigné n'existe pas.** « Pacsée » ou « mariée » avec conjoint non
   renseigné = foyer d'UNE personne : toutes les règles du foyer retraité (voir BERNARD)
   s'appliquent dès que le client est retraité. Ne jamais déduire un actif du seul statut
   marital.
2. **La règle bancaire des 75 % sur les loyers reste EN COULISSE.** Elle sert au calcul de la
   capacité d'emprunt et n'apparaît JAMAIS dans le document : on écrit « Loyers encaissés :
   600 € » (le loyer perçu, ce sont ses revenus). Ni « × 75 % », ni « règle bancaire ».
3. **Jamais « augmenter votre épargne mensuelle » ni « utiliser votre capacité d'emprunt »
   sans l'avoir demandé.** Quand le moteur doute (épargne < 18 % chez un actif non
   recentré ; capacité ≥ 80 000 € chez un client de 60 ans et plus ou retraité de moins de
   70 ans), il pose la question au conseiller dans un **pop-up d'entretien** avant la
   synthèse. Tant que la question est sans réponse, le document se comporte comme si la
   réponse était « non ». Réponses conservées dans le dossier (`entretien`).
   En analyse manuelle (skill) : même règle — poser la question au CGP, ne rien imposer.
4. **Chez un retraité qui accepte d'emprunter**, jamais « préparer votre retraite » ni
   « revenus futurs à la retraite » : « protéger vos héritiers et compléter vos revenus ».
5. **« Donner une existence juridique au survivant » est incompréhensible.** Enjeu à écrire :
   « Protéger votre partenaire de PACS (ou concubin) en cas de décès : testament et
   assurance-vie ».
6. **Retraité : pas d'espace info-retraite, pas de PER, pas d'investissement locatif « pour
   préparer des revenus à la retraite ».** Ce qui a du sens : **auditer les contrats
   d'assurance-vie et PER existants** pour décider ce qui est conservé, arbitré ou
   transféré — **un PER se transfère vers un autre PER ; une assurance-vie ne se transfère
   pas** (on ne peut qu'ouvrir un nouveau contrat et arbitrer). Les questions au client
   suivent la même logique : aucune question sur l'épargne mensuelle, la retraite ou le
   levier chez un retraité.
7. **Immobilier commercial** : type de bien à part entière (bail commercial, revenus
   fonciers, régime de la location nue). Le proposer dans la saisie et le nommer tel quel.
8. **Icônes** : dans « Vos placements — état des lieux », pastilles sobres (coche verte,
   croix rouge, anneau gris) — pas de smileys.
9. **Âge et tournant des 70 ans** (demande du 28/09) : sous chaque date de naissance
   (client et conjoint), l'âge s'affiche en clair ; **dès 65 ans**, un encart annonce le
   tournant des 70 ans (art. 990 I : 152 500 € par bénéficiaire sur les versements avant le
   70e anniversaire ; art. 757 B après : abattement global 30 500 €, gains exonérés) avec la
   date exacte du 70e anniversaire. Après 70 ans, rappeler que les versements antérieurs
   conservent le régime 990 I.

10. **Résidence principale : exonération TOTALE de plus-value** (art. 150 U II 1° CGI),
    quels que soient la durée de détention, le prix et le montant. On peut écrire la
    plus-value latente à titre d'information (« ≈ 240 000 € — exonérée, résidence
    principale ») mais **jamais un impôt, une surtaxe, ni un « produit net d'impôt »
    diminué sur une RP** : zéro plus-value taxable. L'exonération suppose que le bien est
    la RP au jour de la cession (tolérance : vente dans un délai normal après le
    déménagement, en pratique un an). Règle confirmée par le CGP le 28/09/2026.

## Plus-value immobilière des particuliers — règles de calcul (note du CGP, 28/09/2026)

Calcul **bien par bien et propriétaire par propriétaire** (en indivision : chacun sur sa
quote-part, avec SA date et SA valeur d'acquisition — jamais comme si le client possédait
tout le bien).

1. **Plus-value brute** = prix de cession corrigé (− frais de vente justifiés) − prix
   d'acquisition corrigé (art. 150 V, 150 VA, 150 VB CGI). Prix d'acquisition : prix payé,
   ou valeur retenue pour les droits de mutation si donation / succession.
   Majorations : frais d'acquisition à titre onéreux réels ou **forfait 7,5 %** (achat
   seulement — pas de forfait automatique pour une acquisition à titre gratuit) ; travaux
   réels ou **forfait 15 %** du prix si immeuble bâti détenu depuis plus de 5 ans (ne se
   cumule pas avec les travaux réels ; dépenses déjà déduites à l'IR exclues).
2. **Deux horloges d'abattement distinctes** (art. 150 VC), en années **révolues** de date
   d'acte à date d'acte :

   | Détention révolue | IR | Prélèvements sociaux |
   |---|---|---|
   | jusqu'à 5 ans | 0 | 0 |
   | 6e à 21e année | 6 %/an | 1,65 %/an |
   | 22e année | 4 % | 1,60 % |
   | 23e à 30e année | exonéré | 9 %/an |
   | 30 ans révolus | 100 % | 100 % |

   **22 ans révolus = plus d'IR mais il RESTE le social** (17,2 % sur 72 % de la PV) ;
   **30 ans révolus = plus rien.** Exemple (PV brute 100 000 €) : 22 ans → 12 384 € ;
   29 ans → 1 548 € ; 30 ans → 0 €.
3. **Taux** : 19 % (IR) sur la base IR, 17,2 % (PS) sur la base PS — deux bases différentes.
   La TMI n'intervient pas ; pas de PFU ; le taux global des PS sur les PV immobilières est
   resté à 17,2 % (pas 18,6 %). Surtaxe (art. 1609 nonies G) si la PV nette imposable à
   l'IR dépasse 50 000 €, appréciée par cédant.
4. **« Depuis 30 ans » ne suffit pas** : c'est le 30e anniversaire de l'acte qui compte. À la
   frontière (21e/22e, 29e/30e année), écrire « à recalculer sur la date exacte de l'acte »,
   et proposer de **décaler l'acte de vente** jusqu'à l'anniversaire si cela supprime le
   reliquat de PS. Le simulateur ne connaît que l'année : il le signale (`bord`).
5. **Donation d'une quote-part avant la vente** : le donataire acquiert cette fraction à
   la date de la donation, à la valeur retenue pour les droits → PV faible ou nulle sur
   cette fraction, sans changer prix ni durée des parts déjà détenues. La donation
   transfère aussi le produit de vente : comparer le résultat global (droits et frais de
   donation inclus), pas la seule PV.
6. Déclaration et paiement par le notaire (2048-IMM), report sur la 2042-C si imposable.
   Résidence principale : exonération totale (règle 10 ci-dessus).

## JOURNAL DES QUESTIONS AU CGP — apprendre pour en poser moins (ouvert le 28/09/2026)

Consigne du CGP : « sois curieux et apprends des questions et de mes réponses afin de
progresser et avoir besoin d'en poser moins demain. Mais en attendant, il est impératif de
poser des questions pour ne pas faire de fausses routes. » Donc : **à chaque doute, une
question** (dans le pop-up de l'outil ou dans le chat), et chaque réponse est consignée ici
avec la règle qu'elle fonde. Avant de poser une question, vérifier qu'elle n'est pas déjà
tranchée ci-dessous.

| Date | Question | Réponse du CGP | Règle qui en découle |
|---|---|---|---|
| 28/09 | Sans réponse au pop-up, le document doit-il se taire ? | **Non, comportement d'avant** | Seul un « non » explicite retire un sujet ; un dossier ancien n'est pas modifié |
| 28/09 | L'outil doit-il mémoriser mes réponses (défauts par profil) ? | **Non — seulement via les skills** | Pas de mémoire dans le simulateur ; les règles se déduisent ici, version après version |
| 28/09 | Sujets à ajouter au pop-up ? | **PER/défisc, transmission anticipée, note libre** | Six questions ; note libre reprise au document |
| 28/09 | Retraitée : utiliser sa capacité d'emprunt ? | **Poser la question** (pas d'office) | Question « emprunt » dès 60 ans ou retraité, < 70 ans, capacité ≥ 80 000 € |
| 28/09 | Retraité : épargne mensuelle, PER, info-retraite, locatif « pour la retraite » ? | **Jamais** | Voir règles BERNARD / BRICHET |
| 28/09 | RP : impôt de plus-value ? | **Jamais, exonération totale** | Latente écrite à titre d'information |
| 28/09 | Titre du pop-up | « Questions complémentaires » | — |
| 28/09 | Tableau « durée / retrait du capital » : quelle maquette ? | **C** (lecture inversée : retrait possible jusqu'à un âge) | Chapitre « Ce que votre capital peut vous verser » dans l'Analyse R2 |
| 28/09 | Rendements du tableau ? | **2 / 5 / 7 %** (pas 0 / 3) | 7 % assumé avec mention « hypothèses dynamiques, non garanties » |
| 28/09 | Quel capital ? | **Les deux colonnes avant / après** | R.avPla (sans rien changer) et R.natPla (avec préconisations) |
| 28/09 | Âges de référence ? | **80 et 90 ans** | (ou +10 / +20 ans si l'horizon dépasse 79 ans) |
| 28/09 | Retrait de référence ? | **Calculé par le simulateur, modifiable** | Baisse de revenus à la retraite ; champ à l'écran, non imprimé |
| 28/09 | Public ? | **Tous les dossiers** | — |
| 28/09 | « Sans entamer le capital » (intérêts seuls) | **Incompréhensible pour le CGP** | Colonne supprimée — ne pas réintroduire sans reformuler |
| 30/09 | Fenêtres natives du navigateur (confirm / alert) ? | **« Moches », tout uniformiser** | Jamais de dialogue natif ; fenêtres du simulateur partout |
| 08/10 | Pastilles des placements : quel style ? | **A — capsules clé / valeur** (clé grise, valeur noire / verte / rouge) | Jamais « rendement ? — inconnu » : « RENDEMENT | inconnu » |
| 08/10 | Puces sous « Endettement maîtrisé » ? | **Aucune** (plafond, mensualité, finançable, crédit RP retirés) | Le chiffre du taux suffit |
| 08/10 | « Le socle patrimonial est posé » | **Supprimé** | — |
| 08/10 | Phrase AV/PER sur les supports | « Auditer votre contrat : allocation et performances des supports » — la fin « un contrat ouvert n'est en rien une garantie de qualité » **supprimée** le même jour | Tournure dictée, à reprendre telle quelle |
| 08/10 | Frais d'entrée des contrats | Question oui / non / ne sait pas, après le rendement | Non ou ne sait pas = point à relever (conditions d'origine à retrouver) |
| 08/10 | Travaux sur la RP | Saisis à côté du prix d'achat | Latente nette des travaux ; règle 150 VB : réels ou forfait 15 %, jamais les deux |
| 08/10 | Cartes « Où trouver l'épargne » : pédagogie ? | **Option C** — mini-tableau rendement / capital, différence, puis €/mois | « 95 000 placés à 2 % = x, à 5 % = y, différence » — simple, sans blabla |
| 08/10 | Dossier recentré (projet RP) : puces des points forts | « Une étape essentielle… » et « Épargne immobilière : … en hausse… » **supprimées** | Chiffre seul : « 522 €/mois de capital remboursé dès la première année » |
| 08/10 | Axe retraite du dossier recentré | « Préparation de votre retraite — Le temps est votre meilleur allié, N ans pour consolider votre stratégie » + 3 puces (épargne régulière, PER + AV chaque mois, PER déductible à la TMI) | Jamais « à 33 ans », jamais « le temps joue pour vous » |
| 08/10 | Titre de la section des gisements | « Où trouver l'épargne complémentaire » | — |
| 08/10 | Carte participation / apport | Une ligne par info, pas de doublon de chiffres, horizon en curseur | « 10 000 € à conserver disponibles » doublonnait « moins de 10 000 € » |
| 08/10 | Pastille verte sur un seul placement (PEA) | C'est la réponse « le client en est-il satisfait ? » : oui = coche verte, non = croix rouge, sans réponse = anneau gris | Rien à changer, à expliquer au CGP |
| 08/10 | « Gestion : banque » sur livrets, comptes courants, CEL, PEL ? | **Supprimer** — rien à gérer sur ce type de placement | Court terme : seules pastilles « chez » et « rendement » ; ni gestion, ni profil, ni audit de gestion |
| 08/10 | « Fiscalité déjà optimisée — générée par les dispositifs en place » | Rappeler **entre parenthèses** les dispositifs (PER, immobilier défiscalisant, emploi à domicile, dons, Girardin…) | Jamais « les dispositifs » sans les nommer |
| 08/10 | Blocs « Fiscalité de l'opération » + alerte rouge, « Vos priorités », « Ce que votre capital peut vous verser », « À N ans, votre situation » | **Supprimés de l'affichage, gardés dans un coin** (« incompréhensible », « pas pertinent ») | `NC_MASQUES` ; pour le détail d'un locatif : « regarder une simulation complète ». Ne rien réintroduire sans accord |
| 09/10 | Onglet Simulation : versement initial AV ? | **Liquidités − précaution cible** (+ produit net d'une vente à replacer) | 0 si rien à replacer |
| 09/10 | Versements mensuels des cartes ? | **Total « Où trouver l'épargne complémentaire »** (enveloppe + gisements si l'Analyse R2 a été ouverte, sinon capacité déclarée) ; PER = borne basse déclarée, sinon moitié | AV = le reste |
| 09/10 | Durée préremplie ? | **Jusqu'à la retraite** (âge retraite déclaré ou 64 − âge) ; retraité : horizon de placement, sinon 10 ans | — |
| 09/10 | Ancien contenu de l'onglet Simulation ? | **Masquer via `NC_MASQUES`** (garder dans un coin) | L'onglet ne montre que les cartes AV / PER |
| 09/10 | Carte PER ? | Seulement si le PER est préconisé (`perPertinent`, jamais à un retraité) | Une seule carte sinon |
| 10/10 | Pastilles Oui / Non dans des ordres différents | **Règle unique : Oui · Non · Ne sait pas** | Partout, `verif.sh` le contrôle |
| 10/10 | « Augmenter votre épargne » à un client à 14 % | **Incohérent** : 14 % financier > 9 % | Deux repères (9 % financier, 18 % total) |
| 10/10 | Onglet 4 du simulateur | Bouton **« Mode présentation → »** vers le plein écran client | Idem bouton « Présentation client » des cartes |
| 10/10 | « Prime périodique majorée » | **+ 100 € par défaut**, exactement | Plus d'arrondi à 50 € |
| 12/10 | Acheter ou louer : emplacement | **Carte onglet Simulation + accès étape Produit** | — |
| 12/10 | Placement du locataire | **Deux lignes : 5,2 % et non placé** | — |
| 12/10 | Revalorisation / revente / notaire / garantie / charges / fiscalité | **1 %/an · 5 % · barème exact · caution · TF ≈ 1 mois, entretien 1 / 0,5 %, copro saisie, assurance neutralisée · AV 24,7 %** | — |
| 12/10 | « Où renseigne-t-on ville, typologie, prix, loyer ? » + « match neuf / ancien / location » | Grille par ville + typologie + surface ; trois colonnes | — |
| 09/10 | Seuil de l'axe « précaution insuffisante » | **Moins de la moitié de la cible** validé | `courtTermeM < cibleBasM * 0.5` |
| 09/10 | Passage complet des anciennes puces (30 reformulations proposées) | **OK pour chaque point** ; la date « août 2026 » des taux retirée du document | Voir « PUCES VALIDÉES LE 09/10 » ci-dessous |
| 08/10 | Bandeaux « Trésorerie libérée chaque mois » / « Meilleur rendement sur la durée » | **Supprimés** | Seul reste le bloc « N €/mois d'épargne à réorienter — a € libérés + b € d'intérêts » |
| 23/09 | Question « rendement » sur 205 k€ long terme ? | Supprimée : « stupide » | Cinq questions pertinentes valent mieux qu'une sixième |
| 23/09 | PER commun en communauté ? | **Jamais commun** | Le PER est toujours individuel |

Les **six questions complémentaires** de l'outil (et leurs déclencheurs) :
1. Épargne mensuelle — actif non recentré, effort < 18 % des revenus.
2. Emprunt — ≥ 60 ans ou retraité, < 70 ans, capacité ≥ 80 000 €.
3. Liquidités — ≥ 50 000 € de court terme sans projet RP (objectif « réorienter », préco
   nouveau contrat AV, question trésorerie, constat « liquidités dormantes »).
4. Produit d'une vente — un bien avec projet de vente et produit net > 0 (préco
   « Replacer le produit », question si vente < 1 an).
5. Réduction d'impôt — foyer actif, ≥ 5 000 € de revenus dans la tranche à 30 % ou plus
   (toutes les préconisations PER, `perPertinent`).
6. Transmission anticipée — enfants, patrimoine net ≥ 300 000 €, ≥ 55 ans ou retraité ;
   **additive** : sur « oui » seulement, objectif + préconisation de donation (abattement
   100 000 € par enfant et par parent tous les quinze ans, démembrement).
Les réponses et les notes libres s'écrivent dans le document (carte « Questions
complémentaires », page des objectifs) : « Recourir à l'emprunt : non — vend en 2027 ».

## « Ce que votre capital peut vous verser » — tableau de consommation du capital (28/09/2026)

Formule d'annuité : retrait mensuel constant `W = C·m / (1 − (1+m)^−n)` (m = r/12, n = mois),
capital consommé au terme ; inverse : durée `n = −ln(1 − C·m/W) / ln(1+m)` (illimitée si les
intérêts couvrent le retrait). Présentation retenue : deux capitaux (avant / après), colonnes
« jusqu'à 80 ans » et « jusqu'à 90 ans » à partir de l'âge de l'horizon, lignes 2 / 5 / 7 % nets,
cases cochées quand le retrait couvre le besoin de référence, phrase de lecture par colonne
(« couverts jusqu'à 90 ans à partir de 5 % net » / « non couvert même à 7 % »). Toujours la
mention : hypothèses dynamiques non garanties, rendements nets de frais et de fiscalité, retrait
non indexé, performances passées. Ne jamais présenter 7 % sans cette mention.

## PUCES VALIDÉES LE 09/10/2026 — formulations courtes, à reprendre telles quelles

Points forts : « Socle acquis, à prolonger par le locatif » · « Taux retenus : 3,90 % / 20 ans,
4,00 % / 25 ans, hors assurance » (jamais de date) · « RP ou locatif : une seule enveloppe, pas les
deux » · « Union libre : calcul à deux ; seul, sur ses seuls revenus » · « Le survivant choisira son
option au décès (art. 1094-1) » · « Sans testament, il n'hériterait de rien » · « Équilibre
rendement / liquidité » + « Auditer les supports financiers » · « Un revenu en moins ne fait pas
basculer le foyer » · « Transmission hors succession (art. 990 I) ».
Axes : « À reconstituer en priorité » · « Maîtriser ses placements : performance, allocation,
gestion » · « X d'épargne pour Y de revenus » · « Revenus plus faibles (X contre Y) : retraite plus
faible » + « Un PER à son nom, versements déductibles » · « Pas de transmission hors succession
(152 500 € par bénéficiaire) » · « Arrêt de travail : aucun revenu garanti » · « Aucun crédit
possible en restant locataire » + « Seul l'achat de la RP reste finançable » · rattachement /
pension : 3 puces (« Rattachement plafonné à 1 807 € par demi-part », « Pension déductible gagnante
dès ≈ X/an (Y/mois) », « Option à rejouer chaque année, pension imposable chez <prénom> ») — sans
article de loi · « Seule la pension alimentaire est déduite (X/an) » · « Avantages en place : X, soit
N % de l'impôt » · « Famille recomposée, pas de donation au dernier vivant : un quart en pleine
propriété » · « Arbitrer un ou deux locatifs vers l'assurance-vie » + « 152 500 € par parent et par
enfant hors droits » · épargne long terme : « X sur livrets et comptes courants, rien à long terme »
+ « Rendement à peine au-dessus de l'inflation » + « Entièrement soumis aux droits de succession »
(plus jamais « frappés de plein fouet », « Situation critique ») · trésorerie trop importante : idem
+ « En assurance-vie : 152 500 € par bénéficiaire hors droits » · « Locatif possible : X, à valider
avec notre courtier » · « Au décès, bien et dette vont aux héritiers : le concubin n'est pas
protégé » · « Renégociation à simuler : économies fréquentes » · « 200 €/mois à 4 % pendant 20 ans
= X (hypothèse de rendement) » · « Une épargne régulière pour capitaliser » · « Délégation : coût
souvent réduit, résiliable à tout moment (loi Lemoine) » · « TNS à 30 % : plafond PER ≈ X/an, jusqu'à
Y d'impôt en moins ».

## ONGLET SIMULATION (09/10/2026) — le simulateur démarre avec les chiffres du dossier

Le CGP : « lorsque j'arrive, trouver un onglet simulation ass vie ou PER selon ce qui a été
préconisé avant ; si je clique, ma simulation commence avec les chiffres évoqués dans l'outil ;
une version imprimable et une présentation client pour chaque placement. »
- Une carte **Assurance-vie** toujours ; une carte **PER** seulement si préconisé (jamais à un
  retraité). Chaque carte : versement initial, mensuel, durée, (bénéficiaires / TMI), avec la
  source de chaque chiffre en gris.
- Trois boutons : **Ouvrir la simulation** (étape Produit, dossier enregistré, chiffres posés,
  modifiables), **Version imprimable** (étape Présentation puis PDF), **Présentation client**
  (étape Présentation).
- L'hypothèse de rendement n'est pas sur la carte : elle se choisit à l'étape Allocation. La
  mention « Projection non contractuelle, sur hypothèses de rendement non garanties » reste.
- Depuis le simulateur, une barre « ← Retour à l'étude patrimoniale · onglet Simulation » ramène
  à la fenêtre d'audit, sur l'onglet Simulation, sans rien perdre (10/10/2026 : « revenir en
  arrière plutôt que sortir définitivement d'où j'étais »).

## ACHETER OU LOUER SA RÉSIDENCE PRINCIPALE (12/10/2026) — méthode et hypothèses validées

Demande du CGP : « frais de notaire, hypothèque, travaux, taxe foncière, intérêts VS location ;
beaucoup d'études sur le sujet ». Recherche faite (Meilleurtaux 12ᵉ édition : 12 ans 3 mois en
moyenne sur 32 villes en 2025, Paris / Nice / Bordeaux > 18 ans, Mulhouse 19 mois ; Arbolyo ;
Hestia). **Méthode retenue = celle des études : patrimoine net année par année, point mort.**
- Acheteur = valeur du bien (revalorisée, travaux comptés pour moitié) − capital restant dû − frais
  de revente ; quand son coût mensuel passe sous le loyer, il place la différence.
- Locataire = apport + écart mensuel (mensualité assurance comprise + taxe foncière + charges non
  récupérables + entretien − loyer indexé IRL) placés, nets de fiscalité. Variante « non placé » :
  apport sur livret 1,7 %, écart consommé (les études insistent : le locataire n'épargne souvent pas).
- Trois colonnes : **neuf / ancien / location**. Le point mort du neuf se mesure face à son propre
  locataire (coût mensuel différent).
- Hypothèses validées (toutes modifiables à l'écran) : barème notarial 2026 **exact** (DMTO 6,32 %,
  5,81 % primo-accédant, neuf 0,715 % ; émoluments 3,870 / 1,596 / 1,064 / 0,799 % + TVA ; CSI
  0,10 % ; débours 1 000 €) ; garantie **caution** par défaut (0,65 % net), hypothèque 1,5 %, PPD
  0,8 % ; taxe foncière ≈ **1 mois de loyer** ; entretien **1 % ancien / 0,5 % neuf** ; charges copro
  non récupérables saisies ; revalorisation **1 %/an** ; revente **5 %** ; IRL **2 %** ; placement à
  l'**hypothèse cabinet 5,2 %** fiscalisé **AV > 8 ans 24,7 %** après abattement 4 600 € ; assurance
  habitation **neutralisée** ; horizon mis en avant 15 ans (ou l'horizon de placement du dossier).
- Ville + typologie (T1 30 m² … T5 105, maison 110) + surface → prix ancien / neuf et loyer proposés
  par une grille de 88 communes (ancien / loyer : PAP, SeLoger, MeilleursAgents, octobre 2026 ; neuf :
  Logisneuf pour 15 villes, sinon estimation ancien × 1,3 affichée comme telle). Le CGP garde la
  main sur chaque chiffre.
- **Ce que disent les chiffres** : avec 1 % de revalorisation et 5,2 % de placement, l'achat ne
  rattrape presque jamais la location sur 30 ans (Lyon T3 : jamais). La ligne de sensibilité le dit
  franchement : revalorisation + 1 point, ou placement à 3 %. Ces deux hypothèses décident — à
  expliquer au client, jamais à cacher.
- **Forme (12/10, après rejet du premier écran « tableau de bord d'avion ») : un parcours en quatre
  écrans, comme le simulateur** — 1 le projet (ville, typologie, surface, prix, loyer d'un bien
  similaire), 2 le financement (apport, durée, taux, assurance avec **quotités**, garantie), 3 les
  hypothèses (préremplies, on peut passer), 4 le résultat (verdict en une phrase, tuiles, courbe,
  tableau, sensibilité). Un sujet par écran, jamais tout à la fois.
- **Trois blocs aux mêmes lignes (12/10, dicté par le CGP)** : apport (placé sur l'assurance-vie /
  dans l'acquisition) · loyer charges comprises / crédit assurance comprise + taxe foncière, copro,
  entretien · **à consacrer à l'assurance-vie = budget de l'achat ancien − loyer**, pour retrouver le
  **même budget mensuel** dans les trois blocs · placement sur la période (apport + mensuel = versés +
  intérêts, hypothèse de rendement) · transmis en cas de vie · en cas de décès (AV : 990 I, 152 500 €
  par bénéficiaire puis 20 % ; achat : crédit soldé par l'assurance emprunteur selon la quotité, avant
  droits de succession) · complément de revenus possible (AV : capital préservé au taux ; achat : loyer
  évité une fois le crédit soldé) · **PATRIMOINE NET**. Astérisque : fiscalité des retraits après 8 ans,
  4 600 € seul / 9 200 € couple, puis 24,7 %.
- **Budget mensuel commun (12/10, dicté par le CGP : « encadrer le budget mensuel pour chaque
  solution… si achat dans le neuf, il va devoir sortir plus de trésorerie tous les mois, et cela a un
  impact dans les différentiels placés en assurance-vie »)** : un seul budget de référence, mois par
  mois = le coût de l'option la plus chère (en général le neuf). Toute option moins chère place l'écart
  sur l'assurance-vie (ligne « à consacrer à l'assurance-vie » dans les trois colonnes ; l'assurance-vie
  de l'acheteur s'ajoute à son patrimoine, à la transmission en cas de vie et, via le 990 I, en cas de
  décès). Le badge « meilleure » se joue entre les trois à trésorerie identique. Remplace l'ancienne
  règle « badge entre location et ancien, neuf contre son propre locataire ».
- **Après le crédit (12/10, règle du CGP)** : « si le crédit dure 25 ans, au-delà le locataire n'épargne
  plus, le propriétaire n'a plus de crédit mais met de côté l'équivalent du loyer qu'il n'a plus à
  payer ». Le budget commun redevient le loyer : le locataire paie toujours son loyer et ne place plus
  rien ; les propriétaires placent le loyer évité **moins leurs charges** (taxe foncière, copro,
  entretien). Dit en clair sous la ligne « à consacrer à l'assurance-vie » et dans l'astérisque.
- **Lecture horizontale (12/10, « il faut pouvoir lire à l'horizontale, sinon je cherche la ligne
  correspondante »)** : un seul tableau comparatif, une ligne par notion, une colonne par option,
  lignes budget mensuel et patrimoine net encadrées ; chaque cellule = valeur + explication grise.
  Plus de trois blocs séparés.
- Quotités d'assurance de prêt (13/10) : le libellé suit la **civilité du dossier** — « Madame Claire »,
  « Monsieur Julien », « Madame » seule sans prénom. Jamais « Monsieur » par défaut pour une femme.
- **Patrimoine net hors fiscalité, dans les deux cas (13/10, règle du CGP)** : capitaux bruts ; la
  fiscalité des retraits est rappelée pour mémoire (astérisque, bloc détails), jamais déduite.
- **Pastille « Détails »** sous chaque patrimoine net : le calcul ligne à ligne, lisible par le client.
  Locataire : apport + écarts versés + intérêts. Acheteur : valeur revalorisée (prix + ½ travaux)
  − frais de revente − capital restant dû + assurance-vie brute. Loyers et mensualités payés rappelés
  « pour mémoire, dans le budget, pas dans le patrimoine ».
- Supprimé du comparatif (13/10, « aucun intérêt ») : « Transmis en cas de vie » et « En cas de
  décès ». Ne pas les réintroduire sans accord. Il reste : apport, loyer ou crédit, charges, à consacrer
  à l'AV, budget mensuel, ce qui a été constitué, complément de revenus, patrimoine net.
- **Le neuf en option (13/10, règle du CGP)** : « on ne compare que l'achat dans l'ancien vs la
  location ; le neuf n'est qu'une option à la demande ». Deux colonnes par défaut ; le neuf s'ajoute
  d'un clic (écran 1 ou sous le tableau) et se retire. Le budget commun n'inclut le neuf que s'il est
  dans la comparaison.
- Résultat : l'**apport est dynamique** (champ + curseur à côté de la durée) ; tout le tableau suit.
  La ligne **patrimoine net** est encadrée (liseré or) en bas de page.
- Tableau (13/10) : colonne de gauche sable avec libellé + aide courte, intertitres « Chaque mois » /
  « À N ans », ligne budget avec liseré or, patrimoine sur fond marine avec l'écart « vs la meilleure ».
- Règle de saisie (13/10) : chaque curseur est doublé d'un **champ libre**, et le curseur ne plafonne
  jamais une valeur saisie (il étend son maximum). Un montant hors grille doit toujours pouvoir entrer.
- TVA 5,5 % du neuf (13/10) : la pastille **convertit le prix** (même HT, ≈ −12 %), et inversement.
  Un bouton qui ne fait que documenter est perçu comme cassé.
- Colonne qui l'emporte : **encadré vert** sur toute la colonne (13/10, « fais un encadré vert pour
  distinguer la colonne qui l'emporte »), badge « Meilleure » vert. Sous le budget mensuel : « coût
  logement X + assurance-vie Y ».
- Confirmé au CGP (13/10) : après le crédit, le locataire devient le plus gros budget et tout se
  cale sur lui — il ne place plus rien, les propriétaires placent le loyer évité moins leurs charges.
- Transmis en cas de vie du locataire : la fiscalité des retraits dépend du nombre d'années sur
  lesquelles on étale l'abattement (4 600 / 9 200 € par an). Afficher les deux lectures : retrait en
  une fois, et étalé sur 10 ans.
- Rappel « De quoi parle-t-on » : deux colonnes logiques — le bien à gauche (RP, ancien, neuf l'un
  sous l'autre), le financement à droite (apport, crédit, loyer). « Si tu indiques le prix du neuf,
  mets celui de l'ancien en dessous. »
- **Écran résultat (12/10, troisième et dernière forme, validée implicitement par la demande) : pas de
  graphique** (« ton graph est nul »). Dans l'ordre : rappel « De quoi parle-t-on » (bien, prix,
  apport, crédit, assurance, loyer similaire, commentaires) ; **curseur « dans combien d'années je
  compare »** qui pilote tout ; **trois cartes** — rester locataire + assurance-vie / acheter dans
  l'ancien / acheter dans le neuf — avec la **mensualité de départ**, le patrimoine net à N ans, sa
  composition et « sorti de ma poche » (identique entre options : le locataire épargne l'écart) ;
  badge « Meilleure à N ans » ; point mort + sensibilité en deux lignes ; tableau année après année.
- **Résultat lisible (12/10, après « même moi je galère ») : tableau année après année** (1 → 10 puis
  tous les 5 ans), une colonne par solution (locataire + assurance-vie / achat ancien / achat neuf),
  la meilleure nommée et en couleur, l'horizon surligné ; puis « d'où vient mon patrimoine à N ans » :
  locataire = apport placé + écarts de mensualité versés + gains − fiscalité (loyers payés pour
  mémoire) ; acheteur = valeur du bien − capital restant dû − frais de revente + épargne placée
  (capital remboursé et total dépensé pour mémoire). Jamais de colonnes d'écarts abstraites.
- Écran 1 (12/10) : bandeau sombre commune / surface / typologie en pastilles, deux tuiles ancien et
  neuf avec **curseur de prix au m²** (le CGP : « ne te prends pas la tête sur le m², ça dépend du
  quartier, de l'exposition » — la grille n'est qu'un point de départ), loyer avec curseur.
- Saisie : curseurs partout (durée, taux, assurance, et toutes les hypothèses), champs alignés ;
  « Autre commune… » = champ libre ; zone de commentaires sur le projet, reprise sur le résultat.
- Assurance de prêt : coût = taux × capital × somme des quotités (100 / 100 sur un couple = deux
  fois). Célibataire : une seule quotité.
- Où : carte « Acheter ou louer sa résidence principale ? » dans l'onglet Simulation pour un client
  **locataire** (projet RP et loyer repris), à l'étape Produit, pour un particulier, la carte « Contrat capi PM » (entreprises) est **remplacée** par la carte « Acheter ou louer sa RP ? » (12/10).
  Version imprimable, présentation client (hypothèses masquées), retour.

## RÈGLE (10/10/2026) — ÉPARGNE : DEUX REPÈRES, 9 % FINANCIER ET 18 % TOTAL

Le CGP : « tu demandes à ce client d'augmenter son épargne alors même qu'elle est supérieure à la
moyenne des Français ! » Les 18 % INSEE comprennent le capital remboursé sur les crédits ; la part
**financière** est de **9 %**. Donc :
- versements programmés (financiers) → comparés à 9 % ; effort total (versements + capital
  remboursé) → comparé à 18 % ;
- « Augmenter votre épargne mensuelle » (objectif recommandé, axe « Versements programmés
  insuffisants », question du pop-up) **seulement si les deux repères sont sous la moyenne** ;
- au-dessus de 9 % en financier : point fort « Discipline d'épargne — X % de vos revenus,
  au-dessus des 9 % d'épargne financière des Français ».

## RÈGLE ABSOLUE (10/10/2026) — ORDRE DES PASTILLES : OUI · NON · NE SAIT PAS

Le CGP : « sur une ligne tu as le oui à gauche et le non à droite et la ligne du dessous, c'est
l'inverse ! » Partout, sans exception : **Oui**, puis **Non**, puis **Ne sait pas** (jamais
« Je ne sais pas », jamais Non en premier). `NcOuiNon` porte cet ordre ; toute liste d'options
oui / non écrite à la main le respecte. `verif.sh` (étape 1) refuse le contraire.

## LE NEUF (12/10/2026, enseignement du CGP)

« L'analyse du neuf est plus sensible : TVA à 5,5 % possible, frais de notaire réduits, mais le coût
à l'achat est vraiment beaucoup plus cher la plupart du temps. » Exemple Montmorency : T3 neuf « à
partir de » 414 000 € — c'est le prix d'entrée, TVA 5,5 %, RDC sur rue ; en TVA 20 %, au calme et
lumineux, 500 à 550 000 € ; un T3 ancien sur le même marché ≈ 280 000 € + travaux. Règles :
- estimation du neuf hors prix promoteur connu : **ancien × 1,5** (prix d'entrée), annoncée comme
  estimation ; le curseur au m² sert à monter au vrai prix du lot visé ;
- TVA 5,5 % seulement en zone ANRU / QPV, sous plafonds de ressources, pour une résidence principale
  (pastille dans l'outil ; l'équivalent à 20 % est affiché) ; sinon 20 % ;
- frais d'acquisition réduits (≈ 2,4 %) déjà dans le barème ; entretien 0,5 %, pas de travaux.

## RÈGLE ABSOLUE (12/10/2026) — DIRE LES POINTS FAIBLES

Le CGP : « dis-moi quand il y a des points faibles pour que je puisse en avoir connaissance, ne fais
pas comme si tout était ok si ça ne l'est pas ». À chaque livraison : nommer ce qui est une
estimation, ce qui vient d'une source fragile, ce qui n'a pas pu être vérifié. Dans l'outil, une
estimation s'affiche comme telle (orange, « estimation », bandeau « point faible »), jamais comme une
donnée. Exemple : le prix du neuf au m² n'existe publiquement que pour 15 villes (Logisneuf, prix
promoteurs) ; ailleurs c'est ancien × 1,3, et l'outil le dit. Sources neuf à exploiter si le CGP
veut recaler : SeLoger Neuf, Immoneuf, Logisneuf, Nexity, Bouygues Immobilier, Efficity (attention :
le « neuf » d'Efficity vient des DVF, ce sont des reventes récentes, pas des prix promoteurs).

## RÈGLE D'ÉCRITURE ABSOLUE (08/10/2026) — PHRASES COURTES, DROIT AU BUT

Le CGP : « fais toujours des phrases plus courtes, va droit au but, pas la peine de noyer
l'information avec des phrases trop longues ». Une puce = une idée, dix mots si possible,
jamais de subordonnée explicative. Le chiffre d'abord, le geste ensuite.

Tournures dictées le 08/10 (à reprendre telles quelles) :
- **Épargne de précaution** : ne sort que sur un GROS décalage (court terme < moitié de la
  cible du cabinet ; 20 000 € pour 25 000 € ne sort plus) → « Épargne de précaution
  insuffisante / court terme — x € ».
- **Épargne long terme** : « Performance et gestion de l'épargne long terme — Assurance-vie
  x € chez banque x : rendement, gestion inconnus » ; puces « Il est essentiel dans une bonne
  gestion de maîtriser ses placements (performance, allocation, gestion) », « Relevé de
  situation à demander impérativement ». Déclencheur : rendement, gestion ou frais d'entrée
  inconnus sur un contrat long terme.
- **Versements** : « Versements programmés insuffisants au vu de vos revenus » (plus
  « beaucoup trop faibles »).
- **Endettement** : « Capacité d'endettement — utilisée à 17 % sur les 35 % autorisés » ;
  puces « Disponibilité pour un investissement locatif : N € (chiffre indicatif, à vérifier
  avec notre courtier) », « Protection de vos héritiers grâce à l'assurance de prêt en cas
  de décès », « En cas de vie, création de revenus complémentaires ». Les phrases du 11/09
  (« L'effet de levier du crédit est indispensable… », « Il vous permet de capitaliser… »)
  sont REMPLACÉES.

## RÈGLE ABSOLUE (08/10/2026) — TOUT RENDEMENT EST UNE « HYPOTHÈSE DE RENDEMENT »

Le CGP : « à chaque fois que tu parles d'un rendement, mets systématiquement qu'il s'agit
d'une hypothèse de rendement — il est important que je me protège sur chaque document ».
Donc, dans tout document ou toute projection : jamais « rendement de 5,2 % » seul, toujours
« hypothèse de rendement : 5,2 %, non garantie » (ou « placés à 5,2 % (hypothèse de
rendement) »). Un rendement **constaté** sur un contrat existant (relevé du client) reste
« rendement constaté ». Mentions de bas de page : « projection établie sur des hypothèses de
rendement non garanties ; les performances passées ne préjugent pas des performances futures ».

## Structure de la restitution

Les blocs Objectifs exprimés / Objectifs recommandés par le cabinet / Préconisations
se présentent EMPILÉS les uns au-dessus des autres, en pleine largeur (jamais en
colonnes côte à côte) — demande expresse du CGP.

Suivre le plan maison (voir modèle détaillé dans references/restitution-modele.md) :

1. **Présentation de votre situation** — un ÉTAT DES LIEUX PUR : état civil, famille,
   revenus, charges, endettement, patrimoine, épargne, fiscalité, objectifs exprimés.
   RÈGLE STRICTE : cette partie CONSTATE, elle n'analyse jamais. La capacité d'emprunt
   disponible, un déséquilibre de revenus, une épargne mal placée sont des LECTURES du
   dossier : elles vont dans les points forts / axes de travail et d'amélioration / problématiques,
   jamais dans l'état des lieux. Présentation : UNE information par ligne ou par tuile
   — jamais plusieurs données importantes agglutinées dans une même phrase. L'objectif
   est de voir clair sur la situation en un coup d'œil.
2. **Points forts et axes de travail et d'amélioration** — toujours dire « les points forts du
   dossier » (jamais « appuis »). C'est ici que commence l'analyse.
3. **Problématiques** — les objectifs exprimés par le client + les alertes issues de la
   grille ci-dessus, hiérarchisées.
4. **Solutions proposées** — pour CHAQUE solution : le mécanisme expliqué simplement
   (définition pédagogique), puis l'application chiffrée au cas du client, puis le
   volet succession / protection. Avantages ET contreparties.
5. **Synthèse** — vue consolidée si plusieurs solutions : ce que devient le patrimoine
   avec les hypothèses retenues, ce qui a été transmis / protégé / économisé.

Si plusieurs solutions : toujours une synthèse consolidée générale + une partie
détaillée point par point.

## Style et formulations

### PATRON DE RESTITUTION VALIDÉ PAR LE CGP (14/09/2026) — « j'aime beaucoup cette façon de présenter les choses »
Chaque thème de l'analyse suit le même moule, dans cet ordre :
1. **Titre court avec picto** (« L'épargne qui dort », « La transmission »).
2. **Une phrase d'accroche** dont le chiffre-clé est mis en évidence (gras/couleur),
   qui pose le fait puis annonce les conséquences : « 65 500 € entièrement en
   liquidités, zéro placement long terme, aucune assurance-vie, aucun PER. Deux
   conséquences : ».
3. **Un tableau à deux colonnes CONSTAT | EFFET** — une ligne par fait, un chiffre
   par ligne à gauche, la conséquence concrète (juridique, fiscale, financière) à
   droite : « 0 € en long terme | Aucune antériorité fiscale AV, aucun outil hors
   succession (152 500 €/bénéficiaire, art. 990 I) », « 300 €/mois versés | 2 % des
   revenus, contre une capacité déclarée de 300 à 500 € », « 40 500 € au-delà de
   la précaution | Rémunérés sous l'inflation ».
4. **Une phrase de conclusion qui nomme le vrai problème et le chiffre avec la
   projection** : « L'écart n'est pas un problème d'effort d'épargne mais
   d'affectation : à 500 €/mois pendant 21 ans, la réallocation à 5,2 % au lieu de
   1,7 % produit + 91 903 € de patrimoine et + 389 €/mois de revenus complémentaires
   à 64 ans, sans un euro d'effort supplémentaire. »
5. Pour un risque civil ou juridique, un **encadré d'alerte** (⚠, bord coloré) qui
   dit le droit applicable avec ses articles et ce qui le corrige : « Pas de
   testament. Le partenaire de PACS n'a aucune vocation successorale légale : au
   décès de Monsieur, les 109 000 € transmissibles vont intégralement à Theao, et
   Madame ne conserve que le droit temporaire au logement d'un an (art. 515-6 /
   763 C. civ.). La donation au dernier vivant est impossible entre partenaires de
   PACS — seul un testament corrige cela, et il est exonéré de droits (art. 796-0
   bis CGI). » puis la hiérarchie : « Le coût des droits est anecdotique (496 € /
   75 €) : le problème n'est pas fiscal, il est civil. C'est le chantier à traiter
   en premier, et il coûte quasiment zéro. »
Règles du patron : un chiffre par ligne, toujours l'article de loi quand une règle
est invoquée, toujours le chiffre de la projection pour clore, et **hiérarchiser**
(dire ce qui compte le plus et ce qui coûte le moins). Ce patron vaut pour
l'ANALYSE remise au CGP ; le constat client dans l'outil garde ses formulations
exactes (section suivante).


- L'identification en tête d'étude rappelle : nom COMPLET avec civilité (« Madame
  Sophie Lloung », jamais « Mme Sophie »), état civil, adresse, CONTACT (téléphone
  et email), composition du foyer.
- Capacité d'emprunt : « X € finançables sur N ans pour une résidence principale ou
  secondaire — et jusqu'à ≈ Y € pour un investissement locatif. » (sans détailler les
  75 % des loyers dans la phrase — le détail vit dans les hypothèses).
- **Un point fort est un FAIT du dossier, jamais une hypothèse de calcul**
  (CGP, 11/09/2026) : « Loyers attendus ajoutés aux revenus retenus par la
  banque » n'a rien à faire sous « Capacité d'emprunt disponible » (« en quoi
  cela est un point fort du dossier ?????? hors sujet complet »). Les hypothèses
  vivent dans le bloc d'hypothèses, pas dans les points forts.
- **Le document est lu par le CLIENT** (rappel du CGP, 11/09/2026) : aucune phrase
  écrite pour le conseiller — « Milieu de la fourchette indiquée par le client »,
  « montant indiqué par le client », commentaires du type « de quoi financer un
  projet structurant ». Capacité d'épargne déclarée = titre, puis « 300 à 500 €
  mensuellement », puis « Apport en numéraire de 10 000 € ».
- **Un chiffre par ligne** : le patrimoine net se présente total en tête puis une
  ligne par personne (« Monsieur : 304 500 € », « Madame : 162 000 € », « dont
  312 000 € détenus en commun ») — jamais « une phrase avec plein d'infos à la
  queue leu leu » (CGP, 11/09/2026 ; remplace le format phrase du 10/09).
- Durée d'un crédit : « Durée restante : 11,5 ans », jamais « 11,5 ans restants ».
- Épargne : « **insuffisante** au regard des revenus », jamais « très faible ».
- **Le constat (RDV 1) est un ÉTAT DES LIEUX, pas une préconisation** (CGP,
  11/09/2026) : dans l'axe « Épargne long terme », on écrit « frappés de plein
  fouet par les droits de succession **en cas de décès** » et on s'arrête là — la
  phrase « Placés en assurance-vie ou en PER… » est supprimée. Les solutions
  sont pour le RDV 2. (Point ouvert : l'axe « trésorerie beaucoup trop
  importante » garde la formulation exacte du 28/08 jusqu'à décision du CGP.)
- **AXE « CAPACITÉ D'ENDETTEMENT NON UTILISÉE » — formulation exacte du cabinet
  (CGP, 11/09/2026, dossier Drouot)** : « Endettement à 14 % seulement. Votre
  capacité d'endettement vous permettrait de réaliser un investissement locatif
  pour un montant de 562 978 €. L'effet de levier du crédit est indispensable
  dans une bonne gestion de patrimoine. Il vous permet de capitaliser dans le
  temps, tout en protégeant vos héritiers en cas de décès. » Rien de plus. Les
  phrases « Avant tout engagement : stress-test vacance locative, hausse des
  taux et décès de l'emprunteur » et « Utilisations possibles : préparer des
  revenus complémentaires à la retraite, ou de futures donations » sont
  SUPPRIMÉES DÉFINITIVEMENT — ne jamais les reproposer.
- **FORMULATIONS EXACTES du 14/09/2026 (CGP, dossier Coconut)** :
  « Épargne insuffisante au regard des revenus — 65 500 € d'épargne pour 15 334 €
  de revenus mensuels. » — une seule ligne, rien d'autre (la puce « Moins de six
  mois de revenus : une anomalie à ce niveau de revenus » est supprimée
  définitivement). « Épargne long terme — aucune épargne long terme : 65 500 €
  investis sur des livrets et comptes courants. Situation critique pour une
  gestion de votre épargne. Rémunérés à peine plus que l'inflation, et frappés de
  plein fouet par les droits de succession en cas de décès. » (« dorment »,
  « Situation anormale » bannis). Fiscalité subie : « Plus de 340 000 € **d'impôt**
  sur 10 ans à situation constante ».
- **Épargne des Français : 18 % du revenu, DONT 9 % en épargne financière**
  (rappel du CGP, 14/09/2026 — le reste est le remboursement du capital des
  crédits immobiliers). Toujours l'écrire complètement : « Moyenne des Français :
  18 % des revenus, dont 9 % en épargne financière » — jamais « 18 % » seul, qui
  laisse croire que les Français placent 18 % de leurs revenus.
- Patrimoine net : le chiffre seul (« X € d'actif net ») — pas de morale du type « la
  question n'est plus de constituer mais d'optimiser ».
- « Aucun dispositif retraite en place — pas de PER : ni préparation de complément de
  revenu, ni déduction fiscale. »
- Épargne mensuelle absente : « aucun versement programmé — une petite épargne
  régulière sur une longue durée permettra d'atteindre un capital significatif :
  200 €/mois avec une hypothèse de rendement de 4 % pendant 20 ans représentent
  73 355 €. » (toujours « hypothèse de rendement », jamais un rendement affirmé).
- Ne mentionner l'état civil (célibataire, marié…) qu'UNE SEULE fois en tête de
  restitution — jamais répété dans chaque ligne d'identification. Une information
  ne se répète pas d'une ligne à l'autre.
- Le CONTACT vaut pour les DEUX membres du couple : téléphone et email du conjoint
  sont collectés et affichés comme ceux du client (10/09/2026).
- **Le mot « matelas » est banni** (CGP, 10/09/2026 : « pas très pro du tout »).
  Écrire « épargne de précaution », « réserve de sécurité ». Même règle pour tout
  mot familier ou imagé dans un texte remis au client.

- Ton pédagogique grand public ; phrases courtes ; chaque chiffre expliqué.
- **Formulation des revenus** : on écrit « les revenus de Monsieur X s'élèvent à
  11 042 €/mois », JAMAIS « Monsieur X apporte 11 042 € ». Puis on totalise : « les
  revenus du foyer sont donc de 16 125 €/mois, pour 1 950 € de charges, soit 12 %
  d'endettement » — le taux en pourcentage accompagne toujours le couple revenus/charges.
- **Diplomatie sur les écarts de revenus** : ne JAMAIS écrire « un seul revenu porte le
  foyer » ni toute formule qui pourrait blesser le conjoint au revenu moindre. Dire :
  « sécuriser l'équilibre des revenus du foyer », présenter les revenus de chacun
  factuellement, et traiter le sujet sous l'angle de la protection, pas du mérite.
- **Projection de décès — TOUJOURS tenir compte des assurances emprunteur** : les
  charges du foyer incluent souvent des mensualités de crédits ; si le crédit est
  assuré sur la tête du défunt (quotités saisies dans l'étude : 100/100, 100 % sur une
  tête, 50/50…), l'assurance le SOLDE au décès et les charges baissent d'autant. Ne
  jamais conclure sur un reste à vivre après décès sans avoir raisonné quotité par
  quotité ; si la répartition n'est pas connue, l'écrire : « quotités à vérifier —
  le résultat peut changer du tout au tout ».
- JAMAIS de rendement garanti ni promis : toujours « hypothèse de rendement de X % »,
  et préciser que les performances passées ne préjugent pas des performances futures.
- Présenter des avantages et des CONTREPARTIES (« les pour et les contre »), pas des
  « problèmes » : le dossier a des axes de travail et d'amélioration, jamais des fautes.
- L'inflation est un risque à part entière : un capital sur compte courant ou livret
  faiblement rémunéré PERD de la valeur en termes réels — le dire au client qui se
  croit « sans risque » (avec pédagogie, idéalement en question).
- Piège classique à connaître : garder son ancienne résidence principale pour la louer
  et racheter une RP à crédit = perte de l'exonération de plus-value de la RP + loyers
  fortement imposés (bien payé, plus d'intérêts déductibles) + intérêts du nouveau
  crédit non déductibles (RP). À signaler chaque fois que le cas se présente.

## Fiscalité locative — voir references/fiscalite-locative.md (02/09/2026)

À LIRE INTÉGRALEMENT avant toute simulation d'investissement locatif, toute
comparaison de régimes, ou toute réponse sur la fiscalité d'un bien loué. Les cinq
réflexes qu'elle nourrit :

1. **Le déficit foncier SE SCINDE** (art. 156 I-3 CGI) : la part issue des intérêts
   d'emprunt ne s'impute QUE sur les revenus fonciers (report 10 ans), seule la part
   des autres charges s'impute sur le revenu global, plafonnée à 10 700 € (21 400 €
   en rénovation énergétique). Imputer tout le déficit sur le revenu global surestime
   l'économie d'impôt d'un facteur trois à quatre — c'est le piège classique.
2. **En meublé, l'amortissement ne peut pas créer de déficit** (art. 39 C II CGI) :
   il n'est déductible qu'à hauteur du bénéfice avant amortissement, l'excédent est
   reporté sans limite de durée. C'est ce mécanisme qui neutralise l'impôt 10 à
   15 ans — pas une niche.
3. **Le meublé ne fait JAMAIS baisser l'impôt des autres revenus** (art. 156 I-1 ter) :
   le déficit BIC non professionnel ne s'impute que sur des bénéfices de même nature
   et se périme à 10 ans. Différence commerciale majeure avec le nu, à dire au client.
4. **Le LMNP diffère l'impôt, il ne le supprime pas** : depuis l'art. 84 de la LF 2025,
   les amortissements déduits minorent le prix d'acquisition à la revente (cessions
   depuis le 15/02/2025, amortissements antérieurs compris). Exceptions : résidences
   universitaires, résidences services seniors, EHPAD. À dire systématiquement.
5. **Micro-BIC 2026** : meublé de longue durée et tourisme classé 83 600 € / 50 %,
   tourisme NON classé 15 000 € / 30 % depuis la loi Le Meur du 19/11/2024. Ne jamais
   citer les anciens seuils (77 700 / 188 700, abattement 71 %).

6. **Les dispositifs de défiscalisation** (§ 5 de la fiche) : Denormandie
   (12/18/21 % sur 6/9/12 ans, base plafonnée à 300 000 € et 5 500 €/m², au moins
   25 % de travaux, prorogé au 31/12/2027, DANS le plafond des niches et sans
   report — l'excédent est perdu) ; Malraux (30 % en SPR avec PSMV, 22 % avec PVAP
   ou DUP, 400 000 € de travaux sur 4 ans, HORS plafond, report 3 ans) ; Monument
   historique (déficit imputable EN TOTALITÉ sur le revenu global, sans plafond ni
   scission des intérêts, conservation 15 ans) ; LLI (jamais en direct — société
   obligatoire, TVA 10 %, crédit d'impôt de taxe foncière 20 ans).
7. **Ordre d'imputation d'une réduction d'impôt** : plafond des niches (les
   réductions déjà au dossier le consomment d'abord), puis limite à l'impôt dû, puis
   report. Et les travaux qui ouvrent droit à réduction ne sont JAMAIS déductibles
   des revenus fonciers.

La fiche porte aussi la décomposition d'amortissement retenue par le cabinet, la
convention de capitalisation avec son contrôle de référence (350 €/mois à 5,20 % sur
20 ans = 145 813 €), et les points encore ouverts.

## Décisions de méthode tranchées par le CGP — ne plus les redemander

Arbitrages rendus en séance, à appliquer par défaut. Les rouvrir uniquement si le
dossier les contredit, et alors POSER LA QUESTION.

**Modélisation**
- Financement d'un investissement locatif : **25 ans** par défaut.
- Rendements : ceux du simulateur — **4,20 % prudent, 5,20 % médian, 6,20 % optimiste**.
- Immobilier locatif **1,0 %/an** de revalorisation, épargne court terme **1,7 %/an**,
  assurance-vie et PER existants **2,5 %/an**, IRL **2,0 %/an**.
- **Livrets = 1,7 %, JAMAIS 2,5 %** (10/09/2026 — le CGP : « comme je te l'ai dit
  10 000 fois, mets ça dans les skills »). Tout ce que le client laisse ou continue
  de verser sur ses livrets — épargne de précaution, versements non redirigés, le
  scénario « sans rien changer » de la projection — capitalise à 1,7 %. Les 2,5 %
  ne concernent que les placements financiers EXISTANTS (assurance-vie, PEA…).
- **Le scénario « sans rien changer » épargne sur les livrets** : même effort
  mensuel que « avec les préconisations », mais à 1,7 % ET intégralement dans la
  succession, sans abattement. « Avec » : 5,2 % en assurance-vie et PER, transmis
  hors succession (art. 990 I, 152 500 € par bénéficiaire). L'écart affiché est
  celui de la réallocation — patrimoine ET droits de succession.
- **Succession — PER = assurance-vie ; livrets et placements bancaires SANS
  abattement** (10/09/2026, v208 du simulateur). Le CGP : « je veux que le PER soit
  traité comme l'assurance-vie, ce sont les livrets et autres placements bancaires
  qui ne doivent bénéficier d'aucun abattement ». Dans le constat, le RDV 1 et la
  projection : assurance-vie et PER hors succession (art. 990 I : 152 500 € par
  bénéficiaire, 20 % au-delà — versements avant 70 ans) ; livrets, comptes
  courants, PEA, CTO, épargne salariale et autres comptes bancaires entrent en
  totalité dans l'assiette taxable au barème.
- Horizon piloté par l'**âge actuel et l'âge de départ visé**, pas par une durée fixe.
- Montants en **euros courants**, comme le simulateur. Jamais de gain déflaté comparé
  à un effort nominal.
- Indicateur mis en avant : le **capital créé**, comme le simulateur.
- **Modèle de l'enveloppe constante** : le client consacre X €/mois, chaque axe
  consomme, le solde est épargné et capitalisé. Aucun euro ne s'évapore.
- La **réduction d'impôt vient diminuer l'effort mensuel**, jamais s'ajouter au
  patrimoine séparément.
- Les valeurs du cabinet sont des **valeurs par défaut modifiables**, jamais figées.

**Gisements d'épargne — à chercher avant de demander un effort nouveau**
- **Délégation d'assurance emprunteur** si la durée restante dépasse 12 ans (loi
  Lemoine, résiliable à tout moment). Le RACHAT de prêt n'est pas proposé : trop
  difficile à obtenir dans les conditions actuelles.
- **Arbitrage des placements à rendement faible** vers une solution plus adaptée.
- **Redirection des versements programmés** improductifs — mais seulement après
  s'être assuré que l'épargne de précaution cible est constituée.
- **Chaque gisement de rendement se lit en trois chiffres** (10/09/2026) : le gain
  sur la période, son équivalent par mois (« soit ≈ X €/mois »), et la cause
  (« 1,7 % → 5,2 % », capital avant → capital après). Le client doit comprendre
  COMMENT l'économie se fait, pas seulement combien. Présentation compacte : un
  chiffre, sa cause, pas de phrase.

**Les gisements sont de deux natures, à ne jamais additionner (03/09/2026)**
- La **trésorerie libérée chaque mois** — délégation d'assurance emprunteur — est
  de l'argent réellement disponible, dès la mise en place : elle **s'ajoute à
  l'enveloppe** et finance les préconisations sans effort nouveau.
- Le **gain de rendement sur la durée** — arbitrage d'un capital, redirection de
  versements — est du **capital à l'horizon** : il se constitue progressivement et
  ne se dépense pas chaque mois.
- Les deux se présentent en **deux blocs séparés, chacun avec son total dans son
  unité** (€/mois d'un côté, € à l'horizon de l'autre) et la phrase qui dit ce que
  ce total devient. Ramener un capital « au mois » pour l'ajouter à une trésorerie
  produit un chiffre qui ne correspond à rien d'encaissable : le client ne peut
  pas suivre, et il a raison.
- Un gisement **que le client ne retient pas** se montre quand même, mais **au
  conditionnel** : en gris, avec « si vous l'activez ». Il ne doit entrer dans
  aucun total. Montrer ce qu'il laisse de côté est utile ; le lui compter comme
  acquis est faux.

**Capacité d'emprunt — DEUX usages, jamais cumulables (02/09, resserré le 10/09/2026)**
- **La RÉSIDENCE SECONDAIRE NE FIGURE PLUS dans la capacité d'emprunt** — nulle
  part : ni dans la carte, ni dans les points forts, ni dans la synthèse. Le CGP
  l'avait déjà demandé et a dû le redire (« je t'ai déjà dit d'oublier la partie
  résidence secondaire… reste focus sur le locatif et la RP »). Ce qui suit vaut
  pour les deux usages restants : investissement locatif et résidence principale.
- C'est la MÊME enveloppe d'endettement employée de deux manières : le document
  doit le dire explicitement (« ces deux montants ne s'additionnent pas »), sinon
  le client additionne les montants.
- **L'INVESTISSEMENT LOCATIF est celui qu'on met en avant**, pas la résidence
  principale ni la secondaire : les loyers attendus s'ajoutent aux revenus retenus
  par la banque (retour de 4 %, 75 % comptés — 75 % depuis le 03/09/2026, auparavant
  80 %), c'est l'usage qui ouvre la plus grande capacité et celui qui construit du
  patrimoine.
- Résidence principale : capacité calculée loyer actuel supprimé (il disparaît à
  l'achat) — et le document précise que ce montant vaut pour la RP exclusivement.
- (Rappel historique : une résidence secondaire ne produit aucun loyer ; si le
  sujet revient en conversation, sa capacité serait la plus faible — mais on ne
  l'affiche plus.)

**Placements détenus — un contrat ouvert n'est pas un contrat qui travaille**
Chaque fois qu'un point fort cite une assurance-vie, un PER ou un autre placement
détenu, la phrase se termine par la demande de **vérifier l'allocation et la
performance des supports sélectionnés**. C'est le premier geste de conseil, et il
ouvre l'audit du contrat existant.

**Retraite — un chiffre, et le statut de chacun**
- La baisse de revenus à la retraite s'annonce par **UN chiffre médian**, jamais par
  une fourchette : deux nombres pour une même idée brouillent la lecture.
- Le taux de remplacement se calcule PAR PERSONNE (salarié ≈ 40 à 70 % selon le
  revenu, indépendant 20 à 30 % plafonné au PASS). **Le libellé doit suivre** : un
  foyer mixte salarié / indépendant ne s'annonce jamais « hypothèse travailleur non
  salarié ».

**Au-delà de quelques axes, le client ne peut plus hiérarchiser**
Les axes de travail sont regroupés en **quatre chantiers** — protéger la famille,
faire travailler l'épargne qui dort, réduire l'impôt, construire du patrimoine —
chacun avec une case vide que le client numérote À LA MAIN avec le conseiller. Le
détail des axes reste au-dessus, la synthèse sert au classement.

**Un chiffre calculé à un seul endroit — la règle des points d'entrée uniques (02/09/2026)**
Une même grandeur calculée à plusieurs endroits finit par donner plusieurs valeurs
dans le même dossier, sans que rien ne le signale. Le CGP l'a constaté deux fois :
d'abord sur la pension de retraite, puis sur l'**épargne de précaution**, dont la
cible était recalculée dans la synthèse, dans le bloc du constat, et dans la
projection — où elle valait zéro, si bien qu'aucune alerte ne se déclenchait.
Toute grandeur reprise à plus d'un endroit passe par **un point d'entrée unique**,
et un test vérifie qu'aucun autre site ne refait le calcul.

**Épargne de précaution — MONTANTS FIXES, l'historique des deux règles précédentes
(02/09 puis 04/09/2026)**
Le 02/09, la base était passée des charges bancaires au train de vie (revenus nets −
impôt − épargne programmée) × un nombre de mois par profil : un couple avec un enfant
se voyait auparavant recommander 4 800 €. Le 04/09, sur le dossier Jean Claude
(célibataire, 10 833 €/mois, 23 500 € de court terme, cible affichée 32 742 à
49 113 €), le CGP a tranché : **la cible est un montant fixe selon le foyer** —
personne seule 10 000 à 15 000 €, couple sans enfant 20 000 €, couple avec enfant(s)
25 000 € — quels que soient revenus et statut, sans supplément locatif. Le train de
vie reste calculé pour l'affichage (« pour X € de charges ») mais ne dimensionne plus
rien. **Pas de provision travaux sur la résidence principale** dans l'épargne de
précaution (arbitrage du CGP) : elle se traite dans les objectifs.

**Enveloppes de placement de l'épargne de précaution** (vérifié le 02/09/2026) : Livret A **22 950 €**
et LDDS **12 000 €** à **1,70 %** depuis le 1er août 2026 ; LEP **10 000 €** à
**2,50 %**, sous condition de revenu fiscal de référence — à saturer en priorité quand
le client est éligible. Un couple loge donc jusqu'à **69 900 €** sur Livret A + LDDS.
Au-delà du besoin de précaution, le surplus laissé sur livret coûte du rendement : la
suite logique est le fonds euros d'une assurance-vie de plus de 8 ans pour la couche
2 à 5 ans, puis les unités de compte pour le long terme.

**Point ouvert — le foyer MIXTE salarié / indépendant.** La règle applique aujourd'hui
« TNS : 6 à 12 mois » dès qu'une seule personne du foyer est indépendante, même quand
le salarié porte la majorité des revenus. C'est le même travers que le libellé TNS
global déjà corrigé. **À trancher avec le CGP** : pondérer selon la part de revenus
exposée, ou retenir le profil le plus prudent.

**Rattachement des enfants en union libre — le chiffrer, pas le supposer (02/09/2026)**
En union libre, les enfants se rattachent à **une seule** déclaration (art. 6 CGI), et
ce choix change l'impôt **total du couple**. On ne le devine pas : on calcule les deux
et on annonce le gain.

La règle qui décide est le **plafonnement du quotient familial**. Deux cas opposés :

- **Revenus proches** : les deux personnes saturent le plafond de la demi-part. Le
  rattachement ne change alors **rien** — annoncer un gain serait faux. Exemple vérifié :
  9 000 € et 4 133 €/mois, 28 341 € d'impôt dans les deux cas.
- **Revenus déséquilibrés** : chez celui qui a de faibles revenus la demi-part ne sert
  presque à rien, alors qu'elle sature chez l'autre. Le gain est réel — 1 807 € pour
  9 000 € et 1 500 €/mois, en rattachant au revenu le plus élevé.

Toute optimisation présentée au client s'accompagne du **montant** et des **deux
totaux comparés**, pour que le conseiller voie d'où vient le chiffre.

**On éclaire un risque, on ne conditionne pas une décision (02/09/2026)**
Écrire « à n'activer qu'APRÈS la sécurisation du concubin » dicte au client l'ordre
de ses opérations. **Nous ne connaissons pas la nature de sa relation de couple.**
Le document expose le risque avec précision — au décès, le bien et la dette vont aux
héritiers, le concubin n'a rien — et laisse la décision au client et à son conseiller.
La précaution reste, l'injonction disparaît.

**Une protection se juge sur la DÉTENTION, pas sur le couple (02/09/2026)**
Quand la résidence principale est détenue à 100 % par une seule personne, elle revient
à SES héritiers au décès, et **l'assurance de prêt solde le crédit à leur profit** :
le survivant n'est protégé par rien, ni par la succession ni par l'assurance. Il peut
perdre le logement ET les ressources. Toute analyse de protection du survivant part de
la détention déclarée de chaque bien, jamais du seul statut matrimonial.

**Un axe qui porte plusieurs idées se met en PUCES (02/09/2026)**
Six idées à la file, en petits caractères, ne se lisent pas et ne se montrent pas en
rendez-vous. Une phrase d'accroche, puis une puce par idée.

**Un gain de capital s'explique par les deux trajectoires (02/09/2026)**
« 79 120 € de capital gagné » ne veut rien dire seul. On montre le même argent dans les
deux cas : « 110 000 € deviennent 273 953 € au lieu de 171 562 € en restant sur vos
supports actuels ». Et on ne mélange jamais dans un même total une trésorerie
mensuelle réelle et un capital ramené au mois — on dit ce que chaque euro représente.

**Une marge se dit en euros par mois, jamais en points de pourcentage (02/09/2026)**
« Largement sous le plafond de 35 % » ne veut rien dire : un même écart en points ne
vaut pas la même chose selon le revenu. Cinq points de marge, c'est **60 €/mois** au
SMIC et **750 €/mois** à 15 000 € de revenus — d'un côté rien, de l'autre un
investissement entier. On annonce donc la **mensualité encore disponible**, seul
chiffre qui dise ce que la marge permet réellement, et on laisse tomber l'adverbe.

**Une comparaison avant / après doit dire d'où vient l'écart (02/09/2026)**
Deux totaux côte à côte ne s'expliquent pas d'eux-mêmes. Le document dit : même
épargne, même durée, deux rendements — et chiffre la part due à la **seule
réallocation**, sans lui attribuer ce qui vient du locatif ou des gisements. Attribuer
tout l'écart au rendement serait faux.

**Un bloc dit une chose, pas quatre (02/09/2026)**
Le bloc « Épargne constituée » cumulait un total, une répartition par personne
répétant les cartes juste au-dessus, un pourcentage de la préconisation, un verdict
chiffré et la méthode de calcul. Le CGP l'a jugé illisible. Règle : **un montant, une
barre, une phrase de verdict**. Ce qui répète un bloc voisin se supprime ; la méthode
descend dans le détail réservé au conseiller. Et pas de pourcentage d'un montant
recommandé — « 789 % de la préconisation » ne dit rien à un client.

**Un seul régime foncier par foyer — micro et réel ne cohabitent JAMAIS (02/09/2026)**
Le micro-foncier s'applique à TOUS les revenus fonciers du foyer, ou à aucun. Un
client qui détient déjà un bien au micro-foncier et qui achète, sur nos conseils, un
bien relevant du réel **perd automatiquement le micro sur son bien actuel** : la
fiscalité d'un bien qu'il n'a pas touché change. Cet effet se **chiffre et s'annonce
dans la préconisation**, jamais après coup. Détail et points ouverts :
`references/fiscalite-locative.md`, section 0.

**Les moyens du client se lisent dans l'audit, jamais dans la somme des solutions (02/09/2026)**
- Le client annonce une **FOURCHETTE** (« 300 à 500 €/mois ») : elle s'affiche
  TELLE QUELLE, jamais réduite à un seul nombre. Réduire une fourchette à sa borne
  basse revient à annoncer 300 € à un client d'accord pour 500 € — arbitrage rendu
  par le CGP le 02/09.
- Le compteur travaille sur la **borne HAUTE** : c'est ce que le client a accepté de
  mettre. Franchir la borne basse se signale sobrement (« au-delà des 300 € du bas
  de votre fourchette, dans la limite des 500 € annoncés ») ; l'alerte rouge et le
  renvoi vers « Où trouver l'épargne » ne s'allument qu'au-delà de la borne haute.
- L'**enveloppe d'épargne mensuelle** part de ce que le client a DÉCLARÉ pouvoir
  consacrer (`capaciteEpargne`), borne BASSE de la tranche — on ne lui prête jamais
  plus d'effort qu'il n'en a annoncé — cumulée avec celle du conjoint en réflexion
  séparée, et surchargeable par le conseiller.
- La déduire du total des solutions cochées est une FAUTE : le « reste à allouer »
  vaut alors toujours zéro et le compteur ne compte plus rien.
- Le compteur se lit en trois temps : **disponible − déjà employée = reste à
  allouer**. Quand il devient négatif, le document renvoie explicitement vers
  « Où trouver l'épargne » au lieu d'afficher un manque sans issue.

**Le « sans rien changer » épargne le MÊME montant (02/09/2026)**
Dans toute comparaison avant / après, le scénario de référence place la même épargne
mensuelle sur les supports ACTUELS du client. L'écart affiché est alors le gain de la
**réallocation**, pas celui d'épargner : comparer un client qui épargne à un client
qui n'épargne pas gonfle l'écart de tout l'effort et ne démontre rien du conseil.

**Un chiffre par idée — la variation se traite au rendez-vous expert (02/09/2026)**
Un indicateur qui affiche deux valeurs pour dire une seule chose (« 279 € → 91 € »)
n'est pas lu, il est subi. Au RDV 1, un seul chiffre : l'effort mensuel net **moyen**
sur l'horizon. L'année par année — effort croissant ou décroissant, fiscalité,
réduction d'impôt — se détaille au **rendez-vous expert**, solution par solution.
Même règle que pour la baisse de revenus à la retraite : un chiffre médian, pas une
fourchette.

**Une préconisation se lit en deux temps (02/09/2026)**
Un **titre court en gras**, puis la phrase en graisse normale. Une carte entièrement
en gras ne se hiérarchise plus : le client ne sait pas par où entrer. Le titre doit
être un **préfixe exact** du texte retenu — on ne reformule pas une préconisation
pour lui fabriquer un titre.

**Ordre de lecture d'une projection**
Baisse de revenus attendue → objectifs et préconisations → **moyens mis en face**
(apport et épargne mensuelle) → simulateurs → où trouver l'épargne → **et seulement
ensuite** la photo avant / après. Le client doit voir ce qu'il engage avant de voir
ce qu'il obtient. Les graphiques de trajectoire descendent dans le détail des calculs :
jugés peu parlants en séance.

**Le crédit protège autant qu'il construit (02/09/2026)**
Dès qu'un crédit est mobilisé — résidence principale, locatif existant ou nouveau —
la projection chiffre la **prévoyance de l'assurance emprunteur** : le capital restant
dû effacé au décès à hauteur de la quotité souscrite, les biens transmis libres de
dette sans que la famille ait à vendre. La quotité se saisit **par crédit**, jamais
en global. Le total ne s'affiche que s'il y a plusieurs crédits — sinon la même somme
apparaît deux fois.

**Restitution et ton**
- Document **lu par le client** : notes factuelles et courtes, jamais de raisonnement
  méthodologique interne, **aucune formulation de jugement**.
- **Phrases anti-commerciales bannies.** Ne jamais écrire qu'une opération est
  médiocre, que l'effet de levier ne joue pas, ou qu'il faudrait « viser mieux ».
  Si un indicateur est mauvais, il est présenté en chiffre nu, sans commentaire.
- Les **alertes techniques rouges** vont dans le détail des calculs réservé au
  conseiller, pas dans le corps du document remis au client.
- Chaque **valeur saisie est étiquetée par son origine** : dossier, cabinet, saisi,
  modifiable. Le client doit pouvoir distinguer ce qu'il a déclaré de ce qu'on a posé.
- Un **bouton Détail** par ligne de calcul : le CGP doit pouvoir traquer une coquille
  sans rouvrir le code.

- **L'AUDIT PORTE DÉSORMAIS LES OBJECTIFS RECOMMANDÉS PAR LE CABINET ET LES
  PRÉCONISATIONS** (19/09/2026 — renverse la règle du 15/09/2026). Le CGP :
  « dans l'audit, inclure dans le chapitre objectifs et questions, juste après
  les objectifs exprimés et la participation mensuelle, le tableau qui est dans
  le document simulation et plan d'action page 5 : les objectifs recommandés par
  le cabinet et les préconisations, sans changer la suite de l'audit ». Ces deux
  cartes étaient réservées au RDV 2 au nom du « temps commercial » (« si on en
  dit trop au premier RDV, le client se dira qu'il peut faire le job tout
  seul »). Elles sortent maintenant dans les DEUX documents, à la même place et
  sous la même forme. **Ce qui reste réservé au RDV 2** : la transmission, les
  points forts, les axes de progrès et les priorités — ces gardes-là ne bougent
  pas. Le reste de l'audit (notes du rendez-vous, six questions, pièces à
  réclamer) suit dans l'ordre inchangé.
- **INFO-RETRAITE.FR SE VOIT** (19/09/2026). Le CGP : « dès que tu parles
  d'info-retraite, fais un encadré comme un bouton afin de le rendre plus
  visible ». Partout où le document donne au client le CHEMIN à suivre (bloc des
  pièces à réclamer), le nom du site est une pastille encadrée rouge sur fond
  rose très pâle, et les deux points à cliquer restent en bleu gras :
  « Mon épargne retraite » puis « Voir mes contrats ». Le client doit pouvoir
  refaire le parcours seul, sans nous rappeler. Les simples mentions de SOURCE
  en note de bas de bloc (« Montants relevés sur info-retraite.fr ») restent en
  texte courant : elles n'appellent aucune action.

- **LA QUOTITÉ D'ASSURANCE EMPRUNTEUR EST UNE DONNÉE DE L'ANALYSE, PAS UNE
  RÉSERVE** (20/09/2026). Le CGP : « au niveau des crédits on informe
  systématiquement si le prêt est assuré à 100 % sur chaque tête ou autre.
  Pourtant dans tes analyses postérieures, tu réagis comme si tu n'étais pas au
  courant alors que tout a été renseigné. » **RÈGLE ARBITRÉE** : au décès, le
  prêt assuré sur la tête du défunt est SOLDÉ à hauteur de sa quotité — l'actif
  transmissible augmente d'autant et les charges du survivant baissent. En
  50/50, la moitié du capital restant dû s'éteint. Conséquences sur ce qu'on
  écrit : la succession chiffre le capital soldé au lieu d'annoncer une
  « hypothèse alternative » ; la problématique du décès du revenu principal dit
  de combien les charges du foyer seraient réduites. **La formule prudente
  — prêts non couverts, quotités à vérifier — n'est légitime que si la quotité
  manque réellement sur au moins un prêt en cours.** Un dossier renseigné à qui
  l'on répond « à vérifier » discrédite tout le reste du document.
- **L'ÉCONOMIE MENSUELLE D'UN GISEMENT, C'EST L'ÉCART D'INTÉRÊTS**
  (20/09/2026). Le CGP : « les vraies économies sont le calcul des intérêts
  placés à 1,7 % vs 5,2 %, le capital ne doit pas rentrer dans le calcul. »
  Un capital qui dort à 1,7 % au lieu de 5,2 % ne « rapporte » pas la
  différence de capitalisation sur vingt ans divisée par le nombre de mois :
  il rapporte, chaque année, le capital multiplié par l'écart de taux. Pour un
  VERSEMENT mensuel, l'assiette n'est pas un capital mais ce qui aura été versé
  dans l'année (versement × 12). Le capital supplémentaire à l'horizon reste
  une information juste — il se dit en second, jamais à la place du €/mois.
- **LA STRUCTURE DU DOCUMENT DU SECOND RENDEZ-VOUS — « ANALYSE ET PLAN
  D'ACTION »** (20/09/2026, décision du CGP). L'onglet « Projection » devient
  « Analyse R2 » et son document s'ordonne ainsi, sans exception :
  1. une page de garde identique à celle de l'étude patrimoniale — titre, nom
     et prénom des clients, « Document préparé par … » — **et aucun chiffre** ;
  2. les objectifs exprimés par le client, sa participation mensuelle et son
     apport envisagé (la baisse de revenus à la retraite ouvre la page : elle
     pose le pourquoi avant le quoi) ;
  3. l'analyse du dossier : points forts et axes à travailler ;
  4. un bandeau rappelant l'objectif de participation, puis « où trouver de
     l'épargne » — les leviers viennent grossir la poche annoncée, ils ne se
     lisent qu'en regard d'elle ;
  5. les solutions retenues (PER, assurance-vie, investissement immobilier),
     ouvertes par les préconisations de l'audit ;
  6. le tableau avant / après.
  L'onglet « Simulation et plan d'action » devient « Simulation ».

- **LES GISEMENTS GROSSISSENT LE BUDGET QUE LE CLIENT A ANNONCÉ — ET ÇA SE
  VOIT** (21/09/2026). Le CGP : « si le client souhaite mettre entre 300 et
  500 €/mois et que l'on a été chercher 250 € de trésorerie supplémentaire, il
  faut que son budget mensuel passe de 550 à 750 €/mois grâce aux
  renégociations, et que cela se voie. » Délégation d'assurance emprunteur,
  arbitrage du capital placé et redirection des versements : tout ce qui est
  trouvé s'ajoute aux DEUX bornes de la fourchette déclarée. Le document le dit
  en trois temps : ce que le client a annoncé (avant les gisements), ce que les
  leviers trouvent (les gisements), son nouveau budget mensuel levier par levier
  (juste après). On ne montre jamais un gisement sans montrer ce qu'il change au
  budget du client.
- **PAS DE CHIFFRE D'ÉPARGNE AVANT D'AVOIR PARLÉ D'ARGENT** (21/09/2026). Le
  CGP : « lorsque l'on arrive sur le document, je ne veux pas voir le bandeau de
  son épargne au tout début, ça n'a pas de sens ». Le document du second
  rendez-vous s'ouvre sur l'identité du client, ses objectifs et l'analyse de
  son dossier : le bandeau enveloppe · employée · reste n'apparaît qu'à partir de
  « Où trouver l'épargne ».

- **RAISONNER APRÈS L'ACHAT DE LA RÉSIDENCE PRINCIPALE, JAMAIS AVANT**
  (21/09/2026, dossier MARTIN — le CGP : « c'est catastrophique ; tu dois te
  servir absolument des informations recueillies, sinon ça montre que tu n'as pas
  écouté, pas compris, et que tu es incapable de te projeter sur un dossier »).
  Un locataire qui achète sa RP d'ici un an avec 40 000 € d'apport :
  — son **apport sort de son épargne** avant tout jugement : ce qui reste
    (57 950 − 40 000 = 17 950 €) est son épargne de précaution. Jamais de
    « trésorerie trop importante » sur une épargne déjà promise à l'apport ;
  — son **crédit est une épargne immobilière** : la part de capital remboursée
    (≈ 489 €/mois la première année pour 1 200 €/mois, 25 ans, 3,6 %) compte dans
    son épargne mensuelle, et elle augmente à chaque échéance. Jamais « épargne à
    0 % » pour quelqu'un qui rembourse un crédit de RP ;
  — une **capacité d'emprunt de 0 € n'est jamais un point fort**. Elle se lit
    APRÈS le projet (place restante pour du locatif).
- **LE DOCUMENT RECENTRÉ** (21/09/2026). Toute personne qui n'a plus de place
  pour du locatif parce que sa capacité d'emprunt est mobilisée (projet RP ou
  crédits en cours) : on la **félicite** pour sa résidence principale, on lui dit
  qu'elle a le temps et qu'il est essentiel de **préparer sa retraite par un PER
  et une assurance-vie**, on fait étudier la **délégation d'assurance de prêt**.
  **Rien de plus**, dans tout le document : points forts, axes, problématiques,
  objectifs du cabinet, préconisations et questions (retraite + bonus seulement).
- **LES INCOHÉRENCES SE SIGNALENT PENDANT L'ENTRETIEN** (21/09/2026). En
  quittant l'étape des objectifs, une fenêtre liste ce qui ne tient pas, avec sa
  raison : objectif « investissement locatif » sans capacité restante (le faire
  reviendrait à sacrifier la RP) ; apport déclaré supérieur à l'épargne qui reste
  après l'apport de la RP. Le conseiller corrige avec le client ou continue.

- **AU-DESSUS DE 25 % D'ENDETTEMENT, LE LOCATIF SE VALIDE AVEC LE COURTIER**
  (21/09/2026, règle du CGP). Dès que le taux d'endettement du dossier (projet
  RP compris) dépasse 25 %, tout projet immobilier locatif est « à valider avec
  les éléments précis du dossier et le courtier en crédit » — la mention figure
  sous la capacité d'emprunt et dans la préconisation locative.
- **MONTRER L'AVANT ET L'APRÈS DU PROJET DE RÉSIDENCE PRINCIPALE** (21/09/2026).
  Sur un dossier avec projet d'achat : l'épargne s'affiche telle qu'elle est
  AUJOURD'HUI et telle qu'elle sera APRÈS l'apport (57 950 € → 17 950 €, avec son
  curseur) ; « Le financier » se lit aussi avant et après (l'apport sort du
  financier, le bien entre dans l'immobilier).
- **« SORTIE TOTALE DE TRÉSORERIE » N'APPARAÎT NULLE PART** (21/09/2026, second
  rappel) : ni dans le document, ni dans la carte « Coût global de l'opération »
  à l'écran.

## Profil de risque et SRI — voir references/profil-de-risque-et-sri.md (02/09/2026)

Le **SRI** est l'indicateur réglementaire PRIIPs (1 à 7), **publié par le producteur dans
le DIC** — il ne se calcule pas au cabinet. Il combine le risque de marché (classes de
volatilité annualisée) et le risque de crédit de l'émetteur.

**Le SRI d'un portefeuille n'est PAS la moyenne des SRI de ses supports** : la moyenne
ignore les corrélations. Le simulateur pondère les SRI déclarés — approximation
acceptable en restitution, à ne jamais présenter comme un SRI réglementaire.

Contenu du questionnaire de profil, structure MIF 2 / DDA et les deux questions qui
apportent le plus : voir la référence.

## Réversion et retraite — voir references/reversion-et-retraite.md

Consulter systématiquement cette fiche pour les dossiers touchant à la retraite ou à
la protection du conjoint. Les trois réflexes qu'elle nourrit : (1) le MARIAGE est la
seule porte d'entrée de la pension de réversion — un couple pacsé ou concubin avec
disparité de revenus cumule absence d'héritage automatique ET absence de réversion,
double vulnérabilité à traiter en priorité haute ; (2) chiffrer la chute de revenus à
la retraite avec les taux de remplacement (≈ 60 % pour un salaire moyen, < 50 % pour
un cadre supérieur — plus le revenu est élevé, plus la chute est brutale) pour donner
l'ordre de grandeur du complément à construire ; (3) au décès d'un retraité du privé,
le conjoint marié touche 54 % de la base (sous conditions de ressources) + 60 % de
l'Agirc-Arrco (sans condition) — intégrer cette ressource dans les projections de
décès plutôt que de compter les revenus du défunt à zéro.

## Simulation successorale complète — voir references/droits-de-succession.md (29/08/2026)

Le cabinet a fourni les RÈGLES COMPLÈTES de liquidation des droits de succession
(assiette, réintégrations, démembrement art. 669, abattements, exonérations,
barèmes 2026, réductions, délais/paiement, assurance-vie 990 I / 757 B). Elles sont
dans `references/droits-de-succession.md` — À LIRE INTÉGRALEMENT avant toute
simulation d'impact successoral suite à un décès, comparaison donation vs
succession, ou analyse de clause bénéficiaire. Chaîne de calcul :
actif net taxable → part de chaque héritier → abattement personnel → barème selon
le lien de parenté → réductions. Exemple de contrôle : enfant recevant 300 000 €
→ 38 194,35 € de droits (taux effectif 12,73 %) — tout calcul doit le retrouver.
Collecter d'abord les données listées dans la référence (régime matrimonial,
héritiers et âges, donations < 15 ans, primes AV avant/après 70 ans…) — toute
donnée manquante = QUESTION. Simulation toujours indicative (mention notaire).

## Barème des droits de succession 2026 (référence cabinet)

Abattements personnels (art. 779 CGI), déduits AVANT barème : conjoint / partenaire
de PACS = exonération totale (art. 796-0 bis) ; enfant (par parent) et ascendant
100 000 € ; petit-enfant en direct 1 594 € ; personne handicapée + 159 325 €
(cumulable) ; frère/sœur 15 932 € ; neveu/nièce 7 967 € ; autre héritier 1 594 € ;
nouveauté LFI 2026 : beaux-enfants 15 932 € (art. 788 III bis). Barème ligne directe
(art. 777) : 5 % jusqu'à 8 072 €, 10 % jusqu'à 12 109 €, 15 % jusqu'à 15 932 €,
20 % jusqu'à 552 324 € (tranche la plus fréquente), 30 % jusqu'à 902 838 €, 40 %
jusqu'à 1 805 677 €, 45 % au-delà. Frères/sœurs : 35 % jusqu'à 24 430 €, 45 % au-delà.
Neveux/nièces : 55 % ; non-parents : 60 %. Donations : abattements renouvelables tous
les 15 ans (rappel fiscal art. 784). Assurance-vie hors barème : 152 500 €/bénéficiaire
(990 I, primes avant 70 ans), puis 20 % jusqu'à 700 000 € et 31,25 % au-delà ;
30 500 € global après 70 ans (757 B). Déclaration dans les 6 mois du décès.

## Références chiffrées (2026 — ne pas utiliser d'autres millésimes)

Barème IR 2026 : 0 % jusqu'à 11 600 €, puis 11 / 30 / 41 / 45 % aux seuils
11 600 / 29 579 / 84 577 / 181 917 € par part. Plafonnement QF 1 807 €/demi-part.
Plafond épargne retraite : 4 710 € min / 37 680 € max. Assurance-vie : PS 17,2 % ;
après 8 ans PFL 7,5 % (jusqu'à 150 000 € de primes) après abattement 4 600 / 9 200 € ;
transmission 990 I : 152 500 €/bénéficiaire (versements avant 70 ans), puis 20 % jusqu'à
700 000 € et 31,25 % au-delà ; 757 B : 30 500 € global après 70 ans. Endettement max
bancaire : 35 %. Toute autre règle : à vérifier, ne pas improviser.

ATTENTION : les études de cas historiques du cabinet (ex. dossier Dupont) datent d'avant
2012 — leur STRUCTURE fait référence, mais leurs dispositifs (ISF, Girardin, abattements
de l'époque) sont périmés et ne doivent jamais être repris tels quels.

## Mentions obligatoires en pied de restitution

Reprendre les mentions du simulateur : simulation à caractère indicatif fondée sur des
hypothèses susceptibles d'évolution ; les performances passées ne préjugent pas des
performances futures ; document non contractuel ne valant ni offre ni conseil en
investissement personnalisé ; risque de perte en capital sur les unités de compte ;
lecture des documents réglementaires (DIC/DICI) et décision à valider en rendez-vous
avec le conseiller.