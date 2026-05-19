# Oyko — Vision Produit

> Document de vision produit. Sert de boussole stable pour les décisions de développement, de design et de communication. À conserver à la racine du repo.
>
> Toute décision qui contredit ce document doit soit faire évoluer ce document, soit être abandonnée. Le silence n'est pas une option.

---

## 1. Vision en une phrase

**Oyko donne à un particulier de 30-50 ans une vue claire et consolidée de son budget mensuel, de ses comptes bancaires et de son patrimoine global, sans avoir à jongler entre cinq applications.**

L'utilisateur ouvre Oyko le matin, comprend où il en est financièrement en moins de quinze secondes, et referme.

---

## 2. Pour qui

### Archétype principal

**Camille, 38 ans, cadre dans le tertiaire.** Revenu net mensuel autour de 4 200 €. Mariée, deux enfants. Possède un compte courant à la BNP, un Livret A, une assurance-vie chez Linxea, un PEA chez Boursorama avec quelques ETF, un crédit immobilier en cours et un crédit auto presque terminé.

Tient son budget dans un fichier Excel qu'elle ne maintient plus depuis six mois. A essayé Bankin', l'a trouvée trop centrée "swipe Tinder de dépenses". A essayé Finary, l'a trouvée trop investissement-only.

Veut un outil **calme et complet** qui ne la juge pas, ne lui pousse pas de notifications anxiogènes, et lui donne une vue d'ensemble cohérente sur le budget du mois ET sur la trajectoire patrimoniale. Ouvre l'app deux à trois fois par semaine, jamais en panique.

### Archétypes secondaires

Servis par le produit, mais sans être prioritaires dans les arbitrages.

**Le jeune actif 25-30 ans** qui commence à investir et veut suivre à la fois son budget de fin de mois et la construction lente de son patrimoine.

**Le pré-retraité 55+** qui n'a plus de stress budgétaire mais veut une consolidation patrimoniale propre pour piloter ses arbitrages.

### Hors-cible explicite

Tout choix produit qui sert mieux ces profils au détriment de l'archétype principal doit être refusé.

- Étudiants en situation précaire (besoin d'outils plus minimalistes, gratuité absolue)
- Traders actifs (besoin d'outils spécialisés, cours temps réel)
- Freelances et auto-entrepreneurs (besoin de séparation pro/perso, TVA, URSSAF)
- Foyers à gestion partagée stricte avec split précis entre conjoints

---

## 3. Outcomes attendus

Ce que l'utilisateur doit pouvoir dire après quelques semaines d'usage. Si ces phrases ne sont pas vraies en pratique, le produit a raté son but.

### Outcomes du quotidien

- "Je sais en dix secondes combien il me reste à dépenser cette semaine ou ce mois sans avoir à calculer."
- "Je vois quelles charges vont être prélevées dans les sept prochains jours."
- "Je peux ajouter une dépense cash en moins de cinq secondes sans réfléchir au workflow."

### Outcomes mensuels

- "Je comprends sans effort où mon argent est parti ce mois-ci."
- "Je vois si je vais finir le mois en positif ou tendu, avant d'y être."
- "Mes catégories de budget correspondent à la réalité de ma vie, pas à un template imposé."

### Outcomes patrimoniaux

- "Je connais ma valeur nette actuelle à l'instant T."
- "Je vois la répartition de mon patrimoine entre liquidités, investissements et dettes."
- "Je suis l'évolution de mon patrimoine sur plusieurs mois sans saisir manuellement à chaque fois."

### Outcomes meta (méta-expérience)

- "Oyko ne me culpabilise pas quand je dépasse un budget."
- "Je n'ai pas peur d'ouvrir Oyko, même quand j'ai mal géré mon mois."
- "Mes données sont en France, chiffrées, et je peux les exporter quand je veux."

---

## 4. Parcours-clés

Cinq parcours définissent l'expérience attendue. Tout écran du produit doit servir au moins un de ces parcours.

### Parcours 1 — Premier usage (onboarding)

L'utilisateur arrive sur la landing, comprend la promesse en moins de trente secondes, crée un compte. En cinq minutes maximum, il :

- Saisit son revenu mensuel net
- Configure quatre à cinq catégories de dépenses budgétaires (avec valeurs par défaut suggérées)
- Choisit son mode de pilotage (semaine ou mois)
- Choisit entre : connecter sa banque via Bridge, importer un fichier CSV de ses dernières transactions, ou saisir manuellement ses comptes principaux

Il arrive immédiatement sur un dashboard prêt à l'emploi, **jamais sur un état vide démoralisant**. Les charges fixes peuvent être ajoutées plus tard depuis les paramètres, sans bloquer l'onboarding.

### Parcours 2 — Synchronisation des transactions

Trois voies équivalentes, choisies par l'utilisateur selon sa préférence.

**Voie A : Connexion bancaire Bridge.** L'utilisateur clique "Connecter ma banque", est redirigé vers Bridge, choisit sa banque, s'authentifie chez sa banque. Au retour, il voit ses quatre-vingt-dix derniers jours de transactions importés, ses comptes apparaître avec leurs soldes. Aucun identifiant bancaire n'est jamais saisi dans Oyko.

**Voie B : Import CSV.** L'utilisateur télécharge l'export de transactions depuis l'espace client de sa banque (Boursorama, BNP, N26), l'importe dans Oyko. Les transactions sont catégorisées automatiquement quand possible, à confirmer manuellement sinon.

**Voie C : Saisie manuelle.** L'utilisateur ajoute ses dépenses au fil de l'eau via le bouton "Dépense cash" du dashboard ou la page Dépenses.

### Parcours 3 — Routine quotidienne

L'utilisateur ouvre Oyko (web ou mobile responsive). En haut, la jauge "Budget Semaine" ou "Budget Mois" lui dit combien il lui reste à dépenser. Il scroll, voit ses dernières transactions, repère un prélèvement à venir, referme. **Temps total : quinze secondes.**

Si une dépense cash n'a pas été enregistrée, il l'ajoute en trois clics depuis le bouton "Dépense cash" du dashboard.

### Parcours 4 — Revue hebdomadaire ou mensuelle

Le dimanche soir ou en fin de mois, l'utilisateur ouvre Oyko pour faire le point. Il navigue vers la page Budget, voit pour chaque enveloppe combien a été dépensé par rapport au prévu. Il identifie un poste qui a dérapé. Il ne ressent pas de jugement. Il ajuste éventuellement son budget pour le mois suivant.

### Parcours 5 — Bilan patrimonial trimestriel

Une fois par trimestre, l'utilisateur ouvre la page Patrimoine. Il voit sa valeur nette actuelle, sa répartition (liquidités, investissements, dettes), et son évolution sur les douze derniers mois. Il met à jour manuellement les valeurs de ses investissements si nécessaire. Il décide d'arbitrer ou pas.

---

## 5. États émotionnels visés

L'argent est un sujet chargé. Le produit en tient compte dans chaque choix de design, de copy et de logique. Cette section n'est pas décorative : elle influence des décisions concrètes (couleurs, copy, fréquence et tonalité des notifications, choix de visualisation).

### L'utilisateur doit ressentir

- **Contrôle.** Il sait où il en est, sans surprise.
- **Clarté.** L'information est lisible en un coup d'œil, pas en dix clics.
- **Sérénité.** Pas de notifications anxiogènes, pas d'alertes rouges agressives par défaut.
- **Légèreté.** L'usage quotidien est rapide, pas une corvée.
- **Respect.** Ses données sont les siennes, son intimité financière est préservée.

### L'utilisateur ne doit pas ressentir

- **Culpabilité.** Pas de message du type "tu as dépensé 12 % de trop en restaurants".
- **Anxiété.** Pas de couleurs alarmistes par défaut, pas d'alerte sur tout.
- **Jugement.** Pas de comparaison à des moyennes, pas de "score financier".
- **Complexité.** Chaque écran a un message principal clair.
- **Captivité.** L'export des données est trivial à tout moment.

---

## 6. Anti-objectifs

Ce qu'Oyko n'est pas, et ne sera jamais. Cette liste est aussi structurante que les outcomes : elle protège le produit du feature creep.

- Oyko **n'est pas un coach financier.** Il ne donne pas de conseil personnalisé, ne dit pas "tu devrais épargner plus", ne suggère pas d'arbitrages d'investissement.
- Oyko **n'est pas une banque.** Il ne permet pas de payer, transférer, ouvrir un compte ou émettre des virements. Il agrège et présente.
- Oyko **n'est pas une plateforme d'investissement.** Il ne permet pas d'acheter des actifs, ne donne pas de recommandations boursières, ne fournit pas de cours en temps réel.
- Oyko **n'est pas un outil professionnel.** Pas de séparation pro/perso, pas de TVA, pas d'URSSAF, pas d'export comptable.
- Oyko **n'est pas un réseau social financier.** Pas de classement, pas de comparaison entre utilisateurs, pas de partage public.
- Oyko **n'est pas un assistant fiscal.** Pas de simulation d'impôt, pas de conseil sur la fiscalité.
- Oyko **n'est pas une app de notifications.** Les rappels sont rares, opt-in, et jamais anxiogènes.

---

## 7. Critères de succès

Le critère premier de succès est la **validation portfolio auprès de recruteurs en banque française** dans le cadre d'une recherche d'alternance en ingénierie logicielle pour la rentrée Septembre 2026.

### Succès portfolio (critère principal)

- Le projet est présentable en cinq minutes lors d'un entretien technique
- Un recruteur en banque (CIB, retail, asset management) comprend immédiatement la valeur fonctionnelle et la qualité technique
- Le code, l'architecture et la documentation tiennent le standard "production-ready" attendu en environnement bancaire : Spring Security solide, observabilité (logs structurés, Actuator), tests unitaires et d'intégration, CI/CD, documentation OpenAPI accessible
- L'intégration Bridge API est fonctionnelle en sandbox et démontre la maîtrise des sujets DSP2 (OAuth, consentements, webhooks signés, idempotence)

### Succès produit (critère secondaire)

- L'auteur du projet l'utilise quotidiennement sans friction au-delà de la phase de développement
- Au moins cinq personnes du cercle proche peuvent l'utiliser sans assistance après une démo de cinq minutes
- L'expérience utilisateur est cohérente avec les outcomes décrits en section 3, vérifiable par un test utilisateur de quinze minutes

### Succès personnel (critère tertiaire)

- Le projet est livré sur une trajectoire compatible avec la recherche d'alternance Septembre 2026 (livraison MVP d'ici fin du deuxième trimestre 2026 au plus tard)
- L'expérience acquise est transférable en environnement bancaire réel : familiarité avec OAuth2, PSD2, Open Banking, sécurité applicative, persistance relationnelle

---

## 8. Limites assumées

L'utilisateur final doit accepter ces limites. Elles sont structurelles et non négociables en V1. Communiquées explicitement dans l'app et dans les CGU.

- **Précision des données.** Les chiffres affichés ne sont aussi exacts que les données saisies ou synchronisées. Oyko ne fait pas d'audit comptable.
- **Catégorisation imparfaite.** Les transactions importées peuvent être mal catégorisées. L'utilisateur ajuste manuellement quand nécessaire.
- **Délai de synchronisation.** Les transactions synchronisées via Bridge peuvent apparaître avec vingt-quatre à quarante-huit heures de délai selon la banque source.
- **Valorisation des investissements manuelle.** En V1, l'utilisateur saisit lui-même la valeur actuelle de ses investissements. Pas de cours boursier temps réel.
- **Pas de prévision.** Oyko montre l'état actuel, pas une projection à six mois.
- **Pas de conseil.** Oyko n'est ni conseiller en gestion de patrimoine, ni courtier, ni intermédiaire en assurance.
- **Monodevise EUR.** L'application n'est pas multi-devise en V1.
- **Mono-utilisateur.** Pas de partage de comptes joints entre deux utilisateurs distincts en V1. Un compte joint est un compte tagué "joint" dans le profil d'un seul utilisateur.

---

## 9. Phasage produit

Pour livrer un projet cohérent dans la trajectoire portfolio Septembre 2026, le scope est découpé en trois anneaux concentriques. La V1 est livrée avant d'attaquer la V2.

### V1 — MVP (cible : trois à quatre mois de développement)

Périmètre minimum pour que le produit serve l'archétype Camille et soit présentable à un recruteur banque.

**Briques fonctionnelles incluses :**

- Authentification email/password
- Comptes bancaires manuels (CRUD) : courant, épargne, cash
- Catégories budgétaires (CRUD)
- Charges fixes (CRUD, vue tableau et vue calendrier mensuel)
- Transactions (CRUD, recherche, filtres, regroupement par jour)
- Dashboard mensuel avec agrégations
- Mode Semaine avec calcul simple (différenciateur produit conservé)
- Connexion bancaire Bridge sandbox, flow OAuth complet
- Synchronisation périodique et webhooks Bridge avec vérification HMAC
- Vue Patrimoine onglet Liquidités (basée sur les comptes existants)
- Import CSV des transactions (parsing basique formats Boursorama et BNP)
- Export CSV de toutes les transactions de l'utilisateur
- Paramètres utilisateur (revenus, objectif épargne, mode de gestion)

**Briques techniques incluses :**

- Spring Boot 3, Java 21
- Spring Security avec JWT
- PostgreSQL avec migrations Flyway versionnées
- Resilience4j (circuit breaker, retry) sur les appels Bridge
- Documentation OpenAPI accessible sur /swagger-ui
- Logs structurés Logback en JSON avec MDC (userId, requestId)
- Spring Actuator (health, info, metrics)
- Tests unitaires sur les services métier
- Tests d'intégration avec Testcontainers PostgreSQL
- Validation Bean Validation sur les DTO d'entrée
- Gestion d'erreurs centralisée via @RestControllerAdvice
- Rate limiting Bucket4j sur les endpoints sensibles (login, sync)
- CI GitHub Actions (build, tests, lint)
- Déploiement automatique sur Railway, Fly.io ou Scaleway

### V2 — Extension (post-MVP, si trajectoire le permet)

Briques ajoutées après validation MVP, pour densifier le produit côté patrimoine.

- Module Investissements complet (CRUD, saisie manuelle des prix actuels, calcul de plus-value, prix moyen pondéré pour renforcement de position)
- Module Dettes complet (CRUD, calcul progression de remboursement, échéancier)
- Évolution patrimoniale sur douze mois (table d'historique, job mensuel de snapshot)
- Authentification OAuth Google sign-in
- Notifications email (charges fixes à venir, bilan de fin de mois)
- Import CSV multi-format avancé avec auto-détection du format

### V3 — Long terme (seulement si traction utilisateurs réelle)

Hors trajectoire portfolio. Seulement pertinent si le produit prend de la valeur en propre.

- Provider de cours boursiers tiers (Yahoo Finance, AlphaVantage, EOD Historical Data) pour mise à jour automatique de la valeur des investissements
- Vrai multi-utilisateurs avec partage de comptes joints
- Application mobile native iOS et Android
- Catégorisation automatique des transactions (règles puis ML)
- Bridge API en production avec contrat d'agent ou statut AISP propre

---

## 10. Glossaire

Vocabulaire produit utilisé dans tout le code, l'interface et la documentation. À maintenir cohérent entre front, back et copy utilisateur.

- **Enveloppe.** Catégorie budgétaire avec un montant alloué par mois (ex : Alimentation 400 €/mois).
- **Charge fixe.** Prélèvement récurrent prévisible (loyer, abonnement, mensualité crédit).
- **Mode Semaine.** Découpage du budget mensuel en tranches hebdomadaires pour un pilotage rapproché.
- **Mode Mois.** Pilotage classique sur le mois civil.
- **Patrimoine.** Vue consolidée actifs (liquidités + investissements) moins passifs (dettes).
- **Valeur nette.** Total actifs - Total passifs.
- **DSP2.** Directive sur les Services de Paiement 2, cadre réglementaire européen de l'Open Banking.
- **AISP.** Account Information Service Provider, statut réglementaire pour agréger des données bancaires en Europe.
- **Bridge API.** Agrégateur bancaire français, partenaire AISP retenu par Oyko en V1.
- **Sync.** Synchronisation des transactions et soldes depuis la banque via Bridge.
- **Idempotence.** Propriété d'une opération qui produit le même résultat qu'elle soit exécutée une fois ou plusieurs fois, essentielle pour les webhooks bancaires rejoués.

---

_Document de vision produit Oyko. Toute évolution majeure de la stratégie produit doit donner lieu à une mise à jour explicite de ce document, datée et justifiée dans le commit._
