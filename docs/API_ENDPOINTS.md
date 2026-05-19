# Oyko — Endpoints API REST (V3)

> Liste exhaustive des endpoints nécessaires, déduits de l'UI front existante.
> Révisé après double audit architectural. 42 endpoints, 100% cohérent avec le front.

---

## Conventions

- Base URL : `/api/v1`
- Auth : Bearer token JWT dans header `Authorization`
- Montants : exposés en **euros** (BigDecimal côté Java), stockés en **centimes** (BIGINT) en DB
- URLs : **anglais** (standard international). Traduction FR au niveau payload uniquement
- Pagination : `?limit=50&offset=0` sur `GET /transactions` uniquement (seul endpoint avec volume significatif). Les autres endpoints retournent la liste complète (quelques dizaines d'items max par utilisateur)
- Filtres dates : `?period=this-week` (raccourci) OU `?startDate=2026-05-01&endDate=2026-05-31` (explicite)
- Erreurs : RFC 7807 Problem Details `{ "status": 4xx, "detail": "...", "code": "ERROR_CODE" }`
- Calculs dérivés : Les valeurs dérivées (plus-values, totaux, pourcentages, coûts mensuels/annuels) sont calculées côté backend pour garantir la cohérence. Le front ne fait aucun calcul financier.

---

## Mapping FR ↔ EN centralisé

### Types de comptes

| API (front) | DB (anglais) |
|---|---|
| `courant` | `CHECKING` |
| `epargne` | `SAVINGS` |
| `carte_credit` | `CREDIT_CARD` |
| `cash` | `CASH` |
| `investissement` | `INVESTMENT` |
| `pret` | `LOAN` |
| `autre` | `OTHER` |

### Types de transactions

| API (front) | DB (anglais) | Note |
|---|---|---|
| `depense` | `DEBIT`, `FEE` | Calculé selon signe + type |
| `revenu` | `CREDIT`, `INTEREST`, `REFUND` | Calculé selon signe + type |
| `fixe` | `RECURRING` | Issu d'une charge récurrente |
| `virement` | `TRANSFER` | Virement interne entre comptes du user |
| `autre` | `OTHER` | Transaction non classifiable |

### Fréquences (charges fixes)

| API (front) | DB (anglais) |
|---|---|
| `mensuel` | `MONTHLY` |
| `trimestriel` | `QUARTERLY` |
| `semestriel` | `SEMI_ANNUAL` |
| `annuel` | `ANNUAL` |

### Types d'actifs

| API (front) | DB (anglais) |
|---|---|
| `immobilier` | `REAL_ESTATE` |
| `actions` | `STOCK` |
| `etf` | `ETF` |
| `crypto` | `CRYPTO` |
| `obligations` | `BOND` |
| `fonds` | `FUND` |
| `assurance_vie` | `LIFE_INSURANCE` |
| `epargne` | `SAVINGS` |
| `autre` | `OTHER` |

### Types de dettes

| API (front) | DB (anglais) | Note |
|---|---|---|
| `immobilier` | `MORTGAGE` | Attention : même label FR que l'actif immobilier, mais enum DB différent |
| `consommation` | `CONSUMER_LOAN` | |
| `etudiant` | `STUDENT_LOAN` | |
| `auto` | `AUTO_LOAN` | |
| `decouvert` | `CREDIT_CARD_DEBT` | |
| `autre` | `OTHER` | |

### Modes de gestion

| API (front) | DB (anglais) |
|---|---|
| `budget` | `BUDGET_ONLY` |
| `patrimoine` | `PATRIMONY_ONLY` |
| `complet` | `FULL` |

---

## 1. Auth (5 endpoints)

| Method | Endpoint | DB Table | Description | Déclenché par |
|--------|----------|----------|-------------|---------------|
| POST | `/auth/register` | `users` INSERT | Inscription | Signup page |
| POST | `/auth/login` | `users` SELECT, `refresh_tokens` INSERT | Connexion | Login page |
| POST | `/auth/logout` | `refresh_tokens` UPDATE (revoke) | Déconnexion | Sidebar logout |
| POST | `/auth/refresh` | `refresh_tokens` SELECT/INSERT | Refresh JWT | Auto (middleware) |
| GET | `/auth/verify?token=` | `users` UPDATE (`email_verified_at`) | Vérification email | Lien email |

> Note V2 : migrer `/auth/verify` vers un pattern POST (page front intermédiaire + POST) pour éliminer la surface CSRF. Pour V1, le token est usage unique et expirant, risque acceptable.

### Détails

**POST `/auth/register`**
```json
// Request
{ "email": "...", "password": "...", "prenom": "...", "nom": "..." }
// Response 201
{ "message": "Vérifiez votre email" }
```
Erreurs :
- `400 VALIDATION_ERROR` — email format invalide, password < 8 chars
- `409 EMAIL_ALREADY_EXISTS` — email déjà utilisé

**POST `/auth/login`**
```json
// Request
{ "email": "...", "password": "..." }
// Response 200
{
  "user": { "id": "uuid", "email": "...", "prenom": "...", "nom": "..." },
  "accessToken": "...",
  "refreshToken": "..."
}
```
Erreurs :
- `401 INVALID_CREDENTIALS` — email ou mot de passe incorrect
- `403 EMAIL_NOT_VERIFIED` — email non vérifié

---

## 2. Profile (4 endpoints)

| Method | Endpoint | DB Table | Description | Déclenché par |
|--------|----------|----------|-------------|---------------|
| GET | `/me` | `users` SELECT (colonnes légères) | Identité authentifiée | Toutes pages (sidebar, header) |
| GET | `/profile` | `users` SELECT (profil complet) | Profil + préférences | Paramètres page load |
| PUT | `/profile` | `users` UPDATE | Modifier profil | Paramètres (revenus, épargne, mode) |
| POST | `/profile/reset` | Toutes tables DELETE by user_id | Réinitialiser données | Paramètres bouton "Réinitialiser" |

### Détails

**GET `/me`** (léger, appelé partout)
```json
// Response 200
{ "id": "uuid", "email": "...", "prenom": "...", "nom": "...", "onboardingCompleted": true }
```

**GET `/profile`** (complet, page paramètres)
```json
// Response 200
{
  "id": "uuid",
  "email": "...",
  "prenom": "...",
  "nom": "...",
  "revenusMensuels": 4200.00,
  "objectifEpargne": 500.00,
  "modeGestion": "complet",
  "onboardingCompleted": true
}
// DB: monthly_income_cents=420000, savings_goal_cents=50000, management_mode='FULL'
```

**PUT `/profile`**
```json
// Request (partial update)
{ "revenusMensuels": 4500.00, "objectifEpargne": 600.00, "modeGestion": "complet" }
```
Erreurs :
- `400 VALIDATION_ERROR` — montant négatif, mode inconnu

**POST `/profile/reset`**
```json
// Request (confirmation requise)
{ "password": "..." }
// Response 200
{ "message": "Données réinitialisées" }
```
Supprime : transactions, recurring_charges, accounts, categories (user), patrimony_assets, patrimony_liabilities, account_balances_history. Remet `onboarding_completed = false`. NE supprime PAS le compte utilisateur.

Erreurs :
- `401 INVALID_PASSWORD` — mot de passe incorrect
- `403 FORBIDDEN` — tentative sans authentification

---

## 3. Accounts (4 endpoints)

| Method | Endpoint | DB Table | Description | Déclenché par |
|--------|----------|----------|-------------|---------------|
| GET | `/accounts` | `accounts` SELECT | Liste des comptes | Dashboard, Patrimoine, Paramètres |
| POST | `/accounts` | `accounts` INSERT | Créer un compte | Paramètres, Onboarding |
| PUT | `/accounts/{id}` | `accounts` UPDATE | Modifier (nom, solde) | Patrimoine "Actualiser", Paramètres |
| DELETE | `/accounts/{id}` | `accounts` soft DELETE | Supprimer | Paramètres |

### Détails

**GET `/accounts`**
```json
// Response 200
[
  { "id": "uuid", "nom": "Compte courant BNP", "banque": "BNP Paribas", "type": "courant", "solde": 3450.00, "iban": "FR76 3000 1007 ..." }
]
// Note : iban peut être null (comptes manuels, cash)
```

**POST `/accounts`**
```json
{ "nom": "Livret A", "banque": "BNP Paribas", "type": "epargne", "solde": 15000.00 }
```
Erreurs :
- `400 VALIDATION_ERROR` — nom vide, type inconnu

**PUT `/accounts/{id}`**
```json
{ "solde": 3200.50 }
```
> Note : la table `account_balances_history` n'est pas alimentée en V1 (aucun endpoint de lecture côté front). L'alimentation sera activée en V2 quand le graphique d'évolution des soldes sera implémenté.

Erreurs :
- `404 NOT_FOUND` — compte inexistant ou appartient à un autre user

---

## 4. Categories (4 endpoints)

| Method | Endpoint | DB Table | Description | Déclenché par |
|--------|----------|----------|-------------|---------------|
| GET | `/categories` | `transaction_categories` SELECT | Liste (user + système) | Budget, Dashboard, Paramètres |
| POST | `/categories` | `transaction_categories` INSERT | Créer | Paramètres, modale édition, import CSV |
| PUT | `/categories/{id}` | `transaction_categories` UPDATE | Modifier (nom, icone, budget) | Paramètres, modale enveloppes |
| DELETE | `/categories/{id}` | `transaction_categories` DELETE | Supprimer | Paramètres |

### Détails

**GET `/categories?type=depense`**
```json
[
  { "id": "uuid", "nom": "Alimentation", "icone": "🛒", "couleur": "#FF6B6B", "type": "depense", "budgetMensuel": 400.00 }
]
```

**POST `/categories`**
```json
{ "nom": "Transport", "icone": "🚗", "couleur": "#45B7D1", "type": "depense", "budgetMensuel": 200.00 }
```
Erreurs :
- `400 VALIDATION_ERROR` — nom vide, couleur invalide
- `409 CATEGORY_ALREADY_EXISTS` — nom en doublon pour cet user

**PUT `/categories/{id}`**
```json
{ "budgetMensuel": 250.00 }
```

---

## 5. Transactions (6 endpoints)

| Method | Endpoint | DB Table | Description | Déclenché par |
|--------|----------|----------|-------------|---------------|
| GET | `/transactions` | `transactions` SELECT + JOINs | Liste filtrée paginée | Tab Transactions, Dashboard |
| POST | `/transactions` | `transactions` INSERT | Ajouter dépense/revenu | Dashboard modale, Tab Transactions |
| POST | `/transactions/import` | `transactions` INSERT (batch) | Import CSV/XLSX | Dashboard modale import |
| PUT | `/transactions/{id}` | `transactions` UPDATE | Modifier (catégorie) | Tab Transactions modale édition |
| DELETE | `/transactions/{id}` | `transactions` soft DELETE | Supprimer une transaction | Tab Transactions |
| POST | `/transactions/bulk-delete` | `transactions` soft DELETE (batch) | Supprimer plusieurs transactions | Tab Transactions sélection multiple |

### Détails

**GET `/transactions`**
```
?period=this-week|this-month|last-month|all
?startDate=2026-05-01&endDate=2026-05-31
?category={categoryId}
?account={accountId}
?search=carrefour
?limit=50&offset=0
```
```json
// Response 200
{
  "transactions": [
    {
      "id": "uuid",
      "description": "Carrefour Market",
      "montant": -45.30,
      "dateTransaction": "2026-05-14T10:30:00Z",
      "categorieId": "uuid",
      "categorieNom": "Alimentation",
      "categorieIcone": "🛒",
      "compteId": "uuid",
      "compteNom": "Compte courant",
      "type": "depense",
      "contrepartie": "Carrefour Market",
      "estPending": false,
      "estRecurrent": false,
      "notes": null
    }
  ],
  "total": 127,
  "limit": 50,
  "offset": 0
}
```

**POST `/transactions`**
```json
{
  "montant": -12.50,
  "categorieId": "uuid",
  "compteId": "uuid",
  "description": "Boulangerie",
  "type": "depense",
  "dateTransaction": "2026-05-14T10:30:00Z"
}
```
Erreurs :
- `400 VALIDATION_ERROR` — montant = 0, catégorie inexistante, compte inexistant
- `422 FUTURE_DATE` — date > aujourd'hui + 7 jours

**POST `/transactions/import`**
```json
{
  "transactions": [
    { "date": "2026-05-10", "description": "...", "montant": -45.30, "categorieId": "uuid" }
  ],
  "compteId": "uuid"
}
// Response 201
{ "imported": 24, "skipped": 0 }
```
Erreurs :
- `400 VALIDATION_ERROR` — format invalide, aucune transaction
- `413 PAYLOAD_TOO_LARGE` — plus de 1000 transactions dans un batch

**POST `/transactions/bulk-delete`**
```json
{ "ids": ["uuid-1", "uuid-2", "uuid-3"] }
// Response 200
{ "deleted": 3 }
```
> Note : POST plutôt que DELETE avec body, car certains proxies/CDN stripent le body des requêtes DELETE.

---

## 6. Recurring Charges (5 endpoints)

| Method | Endpoint | DB Table | Description | Déclenché par |
|--------|----------|----------|-------------|---------------|
| GET | `/recurring-charges` | `recurring_charges` SELECT + agrégations | Liste + totaux + timeline + répartition | Tab Charges fixes |
| POST | `/recurring-charges` | `recurring_charges` INSERT | Créer | Tab Charges fixes modale, Paramètres |
| PUT | `/recurring-charges/{id}` | `recurring_charges` UPDATE | Modifier | Tab Charges fixes (futur) |
| PATCH | `/recurring-charges/{id}/toggle` | `recurring_charges` UPDATE `is_active` | Activer/désactiver | Tab Charges fixes badge toggle |
| DELETE | `/recurring-charges/{id}` | `recurring_charges` soft DELETE | Supprimer | Tab Charges fixes bouton |

### Détails

**GET `/recurring-charges`**
```json
{
  "chargesFixes": [
    {
      "id": "uuid",
      "nom": "Netflix",
      "montant": 13.49,
      "frequence": "mensuel",
      "jourPrelevement": 20,
      "prochainPrelevement": "2026-05-20",
      "categorieId": "uuid",
      "categorieNom": "Streaming",
      "compteId": "uuid",
      "compteNom": "Compte courant",
      "estActif": true,
      "coutMensuel": 13.49,
      "coutAnnuel": 161.88,
      "icone": null,
      "couleur": null,
      "dateDebut": null,
      "dateFin": null,
      "notes": null
    }
  ],
  "timeline": [ ... ],
  "repartitionCategories": [
    { "name": "Logement", "value": 915.00, "color": "#4ECDC4" }
  ],
  "totaux": {
    "nombreActifs": 8,
    "nombreInactifs": 1,
    "totalMensuel": 1053.45,
    "totalAnnuel": 12641.40,
    "prochainPrelevement": { ... }
  }
}
```

**POST `/recurring-charges`**
```json
{
  "nom": "Salle de sport",
  "montant": 39.99,
  "frequence": "mensuel",
  "jourPrelevement": 1,
  "categorieId": "uuid",
  "compteId": "uuid",
  "notes": "Engagement 12 mois"
}
```
Erreurs :
- `400 VALIDATION_ERROR` — nom vide, montant <= 0, jour invalide (1-31)

---

## 7. Budget — agrégation (1 endpoint)

| Method | Endpoint | DB Tables | Description | Déclenché par |
|--------|----------|-----------|-------------|---------------|
| GET | `/budget` | `users` + `transaction_categories` + `recurring_charges` + `transactions` | Résumé budget mensuel | Page Mon budget (header + tab Enveloppes) |

### Détails

**GET `/budget?month=4&year=2026`**
```json
{
  "profile": { "id": "uuid", "revenusMensuels": 4200.00 },
  "revenusMois": 4200.00,
  "enveloppes": [
    { "id": "uuid", "nom": "Alimentation", "icone": "🛒", "couleur": "#FF6B6B", "budgetMensuel": 400.00 }
  ],
  "chargesFixes": [
    { "id": "uuid", "nom": "Loyer", "icone": "🏠", "montant": 850.00, "jourPrelevement": 5, "estPreleve": true }
  ],
  "transactions": [
    { "id": "uuid", "description": "...", "montant": -15.00, "date": "2026-05-12T...", "categorieId": "uuid", "type": "variable" }
  ],
  "totalChargesFixes": 1053.45
}
```

---

## 8. Dashboard — agrégation (1 endpoint)

| Method | Endpoint | DB Tables | Description | Déclenché par |
|--------|----------|-----------|-------------|---------------|
| GET | `/dashboard` | `users` + `accounts` + `transaction_categories` + `recurring_charges` + `transactions` + `patrimony_*` | Vue d'ensemble | Page Dashboard |

### Détails

```json
{
  "profile": { "id": "uuid", "prenom": "Antoine", "revenusMensuels": 4200.00, "objectifEpargne": 500.00, "modeGestion": "complet" },
  "comptes": [ { "id": "uuid", "nom": "...", "solde": 3450.00 } ],
  "categories": [ { "id": "uuid", "nom": "...", "icone": "...", "budgetMensuel": 400.00 } ],
  "chargesFixes": [ { "id": "uuid", "nom": "...", "montant": 850.00, "icone": "🏠", "dateProchain": "2026-06-05" } ],
  "transactions": [ { "id": "uuid", "description": "...", "montant": -15.00, "date": "...", "categorieId": "uuid", "type": "variable" } ],
  "patrimoine": { "totalActifs": 125000.00, "totalPassifs": 89000.00, "valeurNette": 36000.00 }
}
```

---

## 9. Investments (4 endpoints)

| Method | Endpoint | DB Table | Description | Déclenché par |
|--------|----------|----------|-------------|---------------|
| GET | `/investments` | `patrimony_assets` SELECT | Liste + totaux + répartition | Page Investissements |
| POST | `/investments` | `patrimony_assets` INSERT | Créer | Modale ajout investissement |
| PUT | `/investments/{id}` | `patrimony_assets` UPDATE | Modifier | Modale édition investissement |
| DELETE | `/investments/{id}` | `patrimony_assets` soft DELETE | Supprimer | Bouton supprimer |

### Détails

**GET `/investments`**
```json
{
  "investissements": [
    {
      "id": "uuid",
      "nom": "MSCI World",
      "ticker": "CW8",
      "type": "etf",
      "plateforme": "Boursorama PEA",
      "quantite": 15,
      "prixAchatUnitaire": 450.00,
      "prixActuel": 485.50,
      "valeurActuelle": 7282.50,
      "valeurAchat": 6750.00,
      "plusValue": 532.50,
      "plusValuePercent": 7.89,
      "dateAchat": "2025-03-15",
      "imageUrl": null,
      "notes": "ETF World capitalisant"
    }
  ],
  "totaux": {
    "valeurTotale": 45000.00,
    "totalInvesti": 38000.00,
    "plusValueTotale": 7000.00,
    "plusValuePercent": 18.42
  },
  "repartitionParType": [
    { "type": "etf", "valeur": 30000.00, "pourcentage": 66.7 }
  ]
}
```

**POST `/investments`**
```json
{
  "nom": "MSCI World",
  "ticker": "CW8",
  "type": "etf",
  "plateforme": "Boursorama PEA",
  "quantite": 15,
  "prixAchatUnitaire": 450.00,
  "prixActuel": 485.50,
  "dateAchat": "2025-03-15",
  "notes": "ETF World capitalisant"
}
```
Erreurs :
- `400 VALIDATION_ERROR` — nom vide, type inconnu, quantité <= 0

---

## 10. Liabilities (4 endpoints)

| Method | Endpoint | DB Table | Description | Déclenché par |
|--------|----------|----------|-------------|---------------|
| GET | `/liabilities` | `patrimony_liabilities` SELECT | Liste + totaux | Page Dettes |
| POST | `/liabilities` | `patrimony_liabilities` INSERT | Créer | Modale ajout dette |
| PUT | `/liabilities/{id}` | `patrimony_liabilities` UPDATE | Modifier | Modale édition dette |
| DELETE | `/liabilities/{id}` | `patrimony_liabilities` soft DELETE | Supprimer | Bouton supprimer |

### Détails

**GET `/liabilities`**
```json
{
  "dettes": [
    {
      "id": "uuid",
      "nom": "Crédit appartement",
      "type": "immobilier",
      "preteur": "BNP Paribas",
      "capitalInitial": 250000.00,
      "capitalRestant": 215000.00,
      "tauxAnnuel": 1.85,
      "mensualite": 1050.00,
      "jourPrelevement": 5,
      "prochainPrelevement": "2026-06-05",
      "dateDebut": "2021-03-01",
      "dateFin": "2046-03-01",
      "imageUrl": null,
      "notes": null
    }
  ],
  "totaux": {
    "totalCapitalRestant": 225000.00,
    "totalMensualites": 1350.00
  }
}
// Note : prochainPrelevement est calculé côté backend à partir de jourPrelevement + date courante (pas de colonne DB dédiée)
```

**POST `/liabilities`**
```json
{
  "nom": "Crédit auto",
  "type": "auto",
  "preteur": "Cetelem",
  "capitalInitial": 15000.00,
  "capitalRestant": 12000.00,
  "tauxAnnuel": 3.90,
  "mensualite": 280.00,
  "jourPrelevement": 10,
  "dateFin": "2029-01-01"
}
```
Erreurs :
- `400 VALIDATION_ERROR` — capital <= 0, type inconnu
- `422 INCONSISTENT_AMOUNTS` — capitalRestant > capitalInitial

---

## 11. Bank / Bridge (3 endpoints)

| Method | Endpoint | DB Table | Description | Déclenché par |
|--------|----------|----------|-------------|---------------|
| POST | `/bank/connect` | `bridge_connections` INSERT | Initier connexion Bridge | Dashboard "Connecter ma banque" |
| POST | `/bank/sync` | `transactions` INSERT, `accounts` UPDATE | Synchroniser | Bank callback, manuel |
| POST | `/bank/webhook` | `bridge_webhooks_received` INSERT | Recevoir webhook Bridge | Bridge (externe, auth HMAC) |

### Détails

**POST `/bank/connect`**
```json
// Response 200
{ "connectUrl": "https://connect.bridge.io/..." }
```

**POST `/bank/sync`**
```json
// Response 200 (synchrone V1, timeout client 60s)
{ "accountsSynced": 2, "transactionsImported": 47 }
```

> Note V2 : passer en asynchrone. `POST /bank/sync` retourne `202 Accepted { "syncId": "uuid" }`, puis `GET /bank/sync/{syncId}` pour le polling du status. Nécessaire si la sync Bridge dépasse 30s.

Erreurs :
- `404 NO_BANK_CONNECTION` — aucune connexion Bridge active
- `502 BRIDGE_UNAVAILABLE` — Bridge API indisponible
- `504 SYNC_TIMEOUT` — sync dépassé 60s

---

## 12. Infrastructure (2 endpoints)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/actuator/health` | Health check (Spring Boot Actuator) | Non |
| GET | `/actuator/info` | Version + uptime | Non |

---

## Résumé

| Module | GET | POST | PUT | PATCH | DELETE | Total |
|--------|-----|------|-----|-------|--------|-------|
| Auth | 1 | 3 | — | — | — | 4 |
| Profile | 2 | 1 | 1 | — | — | 4 |
| Accounts | 1 | 1 | 1 | — | 1 | 4 |
| Categories | 1 | 1 | 1 | — | 1 | 4 |
| Transactions | 1 | 3 | 1 | — | 1 | 6 |
| Recurring Charges | 1 | 1 | 1 | 1 | 1 | 5 |
| Budget (agrégation) | 1 | — | — | — | — | 1 |
| Dashboard (agrégation) | 1 | — | — | — | — | 1 |
| Investments | 1 | 1 | 1 | — | 1 | 4 |
| Liabilities | 1 | 1 | 1 | — | 1 | 4 |
| Bank | — | 3 | — | — | — | 3 |
| Infrastructure | 2 | — | — | — | — | 2 |
| **Total** | **13** | **15** | **7** | **1** | **6** | **42** |

---

## Notes V2

| Sujet | État V1 | Évolution V2 |
|-------|---------|-------------|
| `/auth/verify` | GET avec token URL (usage unique, expirant) | POST via page front intermédiaire (anti-CSRF) |
| `/bank/sync` | Synchrone, timeout 60s | Asynchrone : 202 Accepted + GET polling |
| `account_balances_history` | Table existe mais non alimentée ni lue | Alimenter au PUT account + endpoint GET pour graphiques |
| Agrégation `/patrimony` | Supprimé (front compose) | Rétablir si latence 3 appels parallèles > 300ms |
| Pagination | Sur `/transactions` uniquement | Étendre aux autres listes si volume justifié |

---

## Changelog

| Version | Changements |
|---------|-------------|
| V1 | 43 endpoints initiaux déduits du front |
| V2 | -2 agrégations, +`/me`, +infra, renommages, pagination ciblée |
| V3 | +`/transactions/bulk-delete` séparé, table Transactions corrigée (6 endpoints), pagination honnête (transactions only), mapping FR↔EN centralisé, erreurs par endpoint, notes V2 sync async + balance history, convention calculs backend |

---

_42 endpoints. Déduits du front Next.js, alignés avec le schéma DB révisé (12 tables). Prêt pour implémentation Sprint Boot._
