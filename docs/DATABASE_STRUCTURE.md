# Oyko : Structure de la Base de Données (révision après audit front)

> Document de référence du schéma PostgreSQL d'Oyko V1.
> Schéma révisé après audit du front Next.js existant.
> Les décisions favorisent la simplicité technique tout en couvrant les fonctionnalités du front.

---

## Sommaire

1. [Préambule](#1-préambule)
2. [Décisions transverses (rappel)](#2-décisions-transverses-rappel)
3. [Stratégie de mapping API ↔ DB](#3-stratégie-de-mapping-api--db)
4. [Schéma global](#4-schéma-global)
5. [Module auth](#5-module-auth)
6. [Module bridge](#6-module-bridge)
7. [Module account](#7-module-account)
8. [Module transaction](#8-module-transaction)
9. [Module recurring](#9-module-recurring)
10. [Module patrimony](#10-module-patrimony)
11. [Module shared](#11-module-shared)
12. [Fonctions et triggers utilitaires](#12-fonctions-et-triggers-utilitaires)
13. [Migrations Flyway complètes](#13-migrations-flyway-complètes)
14. [Évolutions V2](#14-évolutions-v2)
15. [Synthèse entretien](#15-synthèse-entretien)

---

## 1. Préambule

### 1.1 Objectif

Décrire la structure de la base PostgreSQL d'Oyko V1, conçue pour servir le front Next.js existant tout en restant fidèle aux conventions backend solides (UUID, centimes, soft delete, etc.).

### 1.2 Choix V1 simplificateurs assumés

| Décision | Choix V1 | Évolution V2 prévue |
|---|---|---|
| Devise | EUR uniquement, pas de colonne `currency` | Ajout multi-devises |
| Catégories | Liste flat sans hiérarchie | Ajout `parent_id` |
| Split de transactions | Une transaction = une catégorie | Table `transaction_splits` |
| Budget | Sur `transaction_categories` directement | Table `budget_envelopes` si besoin |
| Tags | Pas de tags | Tables `tags` + `transaction_tags` |
| Patrimoine | Valorisations sur l'asset, pas d'historique | Table `patrimony_asset_valuations` |

### 1.3 Total tables V1

**12 tables** réparties par module fonctionnel : auth (2), bridge (2), account (2), transaction (2), recurring (1), patrimony (2), shared (1).

---

## 2. Décisions transverses (rappel)

### 2.1 UUID en clés primaires

`UUID PRIMARY KEY` partout. Génération côté Java avec `UUID.randomUUID()` avant insertion. Pas de fuite d'info, portabilité, autonomie code.

### 2.2 Timestamps en TIMESTAMP WITH TIME ZONE

Stockage UTC en interne. Côté Java : `Instant` (Java 8+), jamais `java.util.Date`.

### 2.3 Montants en cents (BIGINT)

Tous les montants stockés en centimes entiers. Évite les erreurs d'arrondi flottant. Convention universelle en fintech.

**Conversion API.** Le DTO Java expose des `BigDecimal` en euros au front. Le converter fait `cents → euros` à la sortie, `euros → cents` à l'entrée. Le front ne connaît que les euros.

### 2.4 Noms de colonnes en anglais

Standard international, lisibilité pour tout dev Java. La traduction FR se fait dans les DTO si nécessaire.

### 2.5 Enums en anglais via VARCHAR + CHECK

`CHECKING`, `SAVINGS`, `DEBIT`, etc. en DB. Mapping vers français côté API si souhaité.

### 2.6 Soft delete sur tables métier uniquement

Colonne `deleted_at TIMESTAMP WITH TIME ZONE`, index partiel `WHERE deleted_at IS NULL`, Hibernate `@SQLRestriction`.

### 2.7 Foreign keys explicites avec ON DELETE

`CASCADE` pour relations "appartient à", `SET NULL` pour références non destructives.

### 2.8 CHECK constraints pour invariants métier

Défense en profondeur. Les règles métier sont aussi au niveau base.

---

## 3. Stratégie de mapping API ↔ DB

### 3.1 Principe général

Le front Next.js consomme une API REST exposée par Spring Boot. Cette API fait l'adaptation entre le format DB (anglais, centimes, enums anglais) et le format consommé par le front (français possible, euros, enums français possibles).

### 3.2 Exemples de mapping

**Montants.**

```
DB: amount_cents BIGINT = -1234
API request/response: { "montant": -12.34 }
```

Converter Java :

```java
public BigDecimal toEuro(long cents) {
    return BigDecimal.valueOf(cents, 2);
}

public long toCents(BigDecimal euro) {
    return euro.movePointRight(2).longValueExact();
}
```

**Noms de colonnes.**

```
DB: transaction_date, label, amount_cents, category_id
API: { "dateTransaction": "...", "description": "...", "montant": ..., "categorieId": "..." }
```

Le `TransactionConverter` fait le mapping `TransactionModel ↔ TransactionResponse`.

**Enums.**

```
DB: account_type IN ('CHECKING', 'SAVINGS', 'CREDIT_CARD', 'INVESTMENT', 'LOAN', 'OTHER')
API: { "type": "courant" | "epargne" | "carte_credit" | "investissement" | "pret" | "autre" }
```

Mapping bidirectionnel dans le converter.

### 3.3 Pourquoi ce choix d'architecture

- **Backend propre.** Le code Java suit les standards internationaux (anglais, types adaptés, conventions Spring).
- **Front existant inchangé sur les conventions.** Le front Next.js peut garder son français si tu veux, l'API s'adapte.
- **Évolutif.** Si demain tu veux exposer l'API en anglais (multi-langue), il suffit de changer les converters.

### 3.4 Architecture de mapping

```
┌─────────────┐
│   Front     │   { "montant": -12.34, "type": "courant" }
│   Next.js   │
└──────┬──────┘
       │ HTTP JSON
       ▼
┌─────────────────────────────────────┐
│   Spring Boot Backend               │
│                                     │
│   ┌─────────────┐                   │
│   │ Controller  │  reçoit DTO API   │
│   └──────┬──────┘                   │
│          │                          │
│          ▼                          │
│   ┌─────────────┐                   │
│   │  Converter  │  API ↔ Domain     │
│   └──────┬──────┘                   │
│          │                          │
│          ▼                          │
│   ┌─────────────┐                   │
│   │  Service    │  logique métier   │
│   └──────┬──────┘                   │
│          │                          │
│          ▼                          │
│   ┌─────────────┐                   │
│   │  Converter  │  Domain ↔ Model   │
│   └──────┬──────┘                   │
│          │                          │
│          ▼                          │
│   ┌─────────────┐                   │
│   │ Repository  │  Spring Data      │
│   └──────┬──────┘                   │
│          │                          │
└──────────┼──────────────────────────┘
           │ SQL
           ▼
   ┌─────────────────────────────────┐
   │   PostgreSQL                    │
   │   amount_cents = -1234          │
   │   account_type = 'CHECKING'     │
   └─────────────────────────────────┘
```

---

## 4. Schéma global

### 4.1 Liste des 12 tables V1

```
Module auth
├── users                          (compte + profil utilisateur)
└── refresh_tokens                 (JWT refresh tokens)

Module bridge
├── bridge_connections             (connection user-banque via Bridge)
└── bridge_webhooks_received       (audit webhooks Bridge)

Module account
├── accounts                       (comptes bancaires)
└── account_balances_history       (historique des soldes)

Module transaction
├── transaction_categories         (catégories + budget mensuel)
└── transactions                   (transactions bancaires)

Module recurring
└── recurring_charges              (charges fixes)

Module patrimony
├── patrimony_assets               (actifs patrimoniaux)
└── patrimony_liabilities          (dettes et passifs)

Module shared
└── audit_log                      (trace des actions critiques)
```

### 4.2 Diagramme conceptuel

```
                         ┌─────────────────────┐
                         │       users         │◄─────────────────────────┐
                         │ (auth + profile)    │                          │
                         └──────┬──────────────┘                          │
                                │                                         │
              ┌─────────────────┼─────────────────────────┐               │
              │                 │                         │               │
              ▼                 ▼                         ▼               │
       ┌─────────────┐  ┌──────────────────┐    ┌──────────────────┐      │
       │refresh_     │  │bridge_connections│    │transaction_      │      │
       │tokens       │  └────────┬─────────┘    │categories        │◄──┐  │
       └─────────────┘           │              │ (+ budget)       │   │  │
                                 ▼              └──────┬───────────┘   │  │
                          ┌──────────────┐             │               │  │
                          │   accounts   │◄────────────┤               │  │
                          └──────┬───────┘             │               │  │
                                 │                     │               │  │
                       ┌─────────┼─────────────────────┴──────────┐    │  │
                       │         │                                │    │  │
                       ▼         ▼                                ▼    │  │
                ┌──────────┐ ┌──────────────────┐ ┌──────────────────┐ │  │
                │trans-    │ │account_balances_ │ │recurring_charges │─┘  │
                │actions   │ │history           │ └──────────────────┘    │
                └──────────┘ └──────────────────┘                         │
                                                                          │
       ┌──────────────────┐    ┌──────────────────────┐                   │
       │patrimony_assets  │────│patrimony_liabilities │───────────────────┤
       └──────────────────┘    └──────────────────────┘                   │
                                                                          │
                                ┌──────────────────────┐                  │
                                │     audit_log        │──────────────────┘
                                └──────────────────────┘
```

---

## 5. Module auth

### 5.1 Table `users`

Compte d'authentification ET profil utilisateur. Pour V1, on garde tout dans une seule table (simplification).

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY,
    
    -- Authentification
    email VARCHAR(320) NOT NULL UNIQUE,
    password_hash VARCHAR(60) NOT NULL,
    email_verified_at TIMESTAMP WITH TIME ZONE,
    last_login_at TIMESTAMP WITH TIME ZONE,
    
    -- Profil utilisateur
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    monthly_income_cents BIGINT,
    savings_goal_cents BIGINT,
    management_mode VARCHAR(30) NOT NULL DEFAULT 'FULL',
    onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE,
    onboarding_completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Audit
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    
    CONSTRAINT users_email_format CHECK (email ~ '^[^@]+@[^@]+\.[^@]+$'),
    CONSTRAINT users_management_mode CHECK (management_mode IN (
        'BUDGET_ONLY', 'PATRIMONY_ONLY', 'FULL'
    )),
    CONSTRAINT users_income_positive CHECK (
        monthly_income_cents IS NULL OR monthly_income_cents >= 0
    ),
    CONSTRAINT users_savings_goal_positive CHECK (
        savings_goal_cents IS NULL OR savings_goal_cents >= 0
    )
);

CREATE UNIQUE INDEX idx_users_email_active 
    ON users(email) 
    WHERE deleted_at IS NULL;
CREATE INDEX idx_users_created_at ON users(created_at);
CREATE INDEX idx_users_onboarding 
    ON users(onboarding_completed) 
    WHERE onboarding_completed = FALSE AND deleted_at IS NULL;
```

**Détail des colonnes profil.**

| Colonne | Type | Mapping API front | Description |
|---|---|---|---|
| `first_name` | VARCHAR(100) | `prenom` | Prénom |
| `last_name` | VARCHAR(100) | `nom` | Nom |
| `monthly_income_cents` | BIGINT | `revenusMensuels` (euros) | Revenu mensuel déclaré |
| `savings_goal_cents` | BIGINT | `objectifEpargne` (euros) | Objectif d'épargne mensuel |
| `management_mode` | VARCHAR(30) | `modeGestion` | Mode de gestion choisi |
| `onboarding_completed` | BOOLEAN | `onboardingCompleted` | TRUE si onboarding terminé |

**Valeurs `management_mode`.**

| Valeur DB | Mapping front | Description |
|---|---|---|
| `BUDGET_ONLY` | `budget` | Gestion budget seulement |
| `PATRIMONY_ONLY` | `patrimoine` | Gestion patrimoine seulement |
| `FULL` | `complet` | Gestion complète (défaut) |

**Choix de design.**

- Profil dans `users` plutôt que table séparée `user_profiles` : simplification V1. La séparation auth/profil n'apporte rien tant qu'on n'a pas de besoin spécifique (OAuth, multi-comptes, etc.).
- `onboarding_completed` boolean + `onboarding_completed_at` timestamp : permet de savoir quand l'utilisateur a fini son onboarding, utile pour des analytics.
- Index partiel sur `onboarding_completed = FALSE` : permet le job "relancer les utilisateurs qui n'ont pas fini leur onboarding".

### 5.2 Table `refresh_tokens`

```sql
CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(64) NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    revoked_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    user_agent VARCHAR(512),
    ip_address INET
);

CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_hash ON refresh_tokens(token_hash);
CREATE INDEX idx_refresh_tokens_cleanup 
    ON refresh_tokens(expires_at) 
    WHERE revoked_at IS NULL;
```

Tokens de refresh JWT stockés en base. `token_hash` = SHA-256 du token, jamais le token en clair.

---

## 6. Module bridge

### 6.1 Table `bridge_connections`

Une banque connectée via Bridge.

```sql
CREATE TABLE bridge_connections (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    bridge_item_id VARCHAR(100) NOT NULL UNIQUE,
    bank_id VARCHAR(50),
    bank_name VARCHAR(200),
    status VARCHAR(30) NOT NULL,
    access_token_encrypted TEXT,
    refresh_token_encrypted TEXT,
    token_expires_at TIMESTAMP WITH TIME ZONE,
    last_sync_at TIMESTAMP WITH TIME ZONE,
    last_sync_status VARCHAR(30),
    last_error_message TEXT,
    consent_expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    CONSTRAINT bridge_connections_status CHECK (status IN (
        'PENDING', 'ACTIVE', 'EXPIRED', 'ERROR', 'REVOKED'
    )),
    CONSTRAINT bridge_connections_sync_status CHECK (
        last_sync_status IS NULL OR last_sync_status IN (
            'SUCCESS', 'PARTIAL', 'FAILED'
        )
    )
);

CREATE INDEX idx_bridge_connections_user ON bridge_connections(user_id);
CREATE INDEX idx_bridge_connections_status ON bridge_connections(status);
CREATE INDEX idx_bridge_connections_consent 
    ON bridge_connections(consent_expires_at) 
    WHERE status = 'ACTIVE';
```

Tokens chiffrés AES-256-GCM avant stockage. Consentement DSP2 tracé pour notification de renouvellement.

### 6.2 Table `bridge_webhooks_received`

Audit complet des webhooks Bridge.

```sql
CREATE TABLE bridge_webhooks_received (
    id UUID PRIMARY KEY,
    bridge_connection_id UUID REFERENCES bridge_connections(id) ON DELETE SET NULL,
    event_type VARCHAR(100) NOT NULL,
    payload JSONB NOT NULL,
    signature_valid BOOLEAN NOT NULL,
    processed_at TIMESTAMP WITH TIME ZONE,
    processing_error TEXT,
    received_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_webhooks_received_at ON bridge_webhooks_received(received_at DESC);
CREATE INDEX idx_webhooks_unprocessed 
    ON bridge_webhooks_received(received_at) 
    WHERE processed_at IS NULL;
CREATE INDEX idx_webhooks_event_type ON bridge_webhooks_received(event_type);
```

---

## 7. Module account

### 7.1 Table `accounts`

Comptes bancaires (synchronisés Bridge ou manuels).

```sql
CREATE TABLE accounts (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    bridge_connection_id UUID REFERENCES bridge_connections(id) ON DELETE SET NULL,
    external_id VARCHAR(255),
    name VARCHAR(200) NOT NULL,
    bank_name VARCHAR(200),
    account_type VARCHAR(50) NOT NULL,
    iban VARCHAR(34),
    balance_cents BIGINT NOT NULL DEFAULT 0,
    is_manual BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    last_sync_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    
    CONSTRAINT accounts_type CHECK (account_type IN (
        'CHECKING', 'SAVINGS', 'CREDIT_CARD', 'CASH', 'INVESTMENT', 'LOAN', 'OTHER'
    )),
    CONSTRAINT accounts_external_id_when_bridge CHECK (
        (bridge_connection_id IS NULL) OR (external_id IS NOT NULL)
    )
);

CREATE INDEX idx_accounts_user ON accounts(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_accounts_bridge ON accounts(bridge_connection_id);
CREATE UNIQUE INDEX idx_accounts_bridge_external_unique 
    ON accounts(bridge_connection_id, external_id) 
    WHERE external_id IS NOT NULL;
```

**Note.** Ajout de `CASH` aux types de comptes pour matcher le besoin du front (gestion d'espèces).

**Mapping API.**

| Colonne DB | API front |
|---|---|
| `name` | `nom` |
| `bank_name` | `banque` |
| `account_type` | `type` (mapping enum) |
| `balance_cents` | `solde` (euros) |

**Mapping enum `account_type`.**

| DB | Front |
|---|---|
| `CHECKING` | `courant` |
| `SAVINGS` | `epargne` |
| `CREDIT_CARD` | `carte_credit` |
| `CASH` | `cash` |
| `INVESTMENT` | `investissement` |
| `LOAN` | `pret` |
| `OTHER` | `autre` |

### 7.2 Table `account_balances_history`

Historique des soldes (pour graphiques temporels en V2 si besoin).

```sql
CREATE TABLE account_balances_history (
    id UUID PRIMARY KEY,
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    balance_cents BIGINT NOT NULL,
    recorded_at TIMESTAMP WITH TIME ZONE NOT NULL,
    source VARCHAR(20) NOT NULL,
    
    CONSTRAINT balances_history_source CHECK (source IN ('SYNC', 'MANUAL', 'COMPUTED'))
);

CREATE INDEX idx_balances_history_account_date 
    ON account_balances_history(account_id, recorded_at DESC);
```

**Note.** Pour V1, alimentation à chaque sync Bridge et modification manuelle. Si le front n'affiche pas encore les graphiques, la table est prête pour V2.

---

## 8. Module transaction

### 8.1 Table `transaction_categories`

Catégories de dépenses/revenus avec budget mensuel intégré. **Liste flat sans hiérarchie.**

```sql
CREATE TABLE transaction_categories (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    icon VARCHAR(50),
    color VARCHAR(7),
    is_income BOOLEAN NOT NULL DEFAULT FALSE,
    is_system BOOLEAN NOT NULL DEFAULT FALSE,
    monthly_budget_cents BIGINT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    CONSTRAINT categories_color_hex CHECK (color IS NULL OR color ~ '^#[0-9A-Fa-f]{6}$'),
    CONSTRAINT categories_user_or_system CHECK (
        (is_system = TRUE AND user_id IS NULL) OR 
        (is_system = FALSE AND user_id IS NOT NULL)
    ),
    CONSTRAINT categories_budget_positive CHECK (
        monthly_budget_cents IS NULL OR monthly_budget_cents > 0
    ),
    CONSTRAINT categories_no_budget_on_income CHECK (
        is_income = FALSE OR monthly_budget_cents IS NULL
    )
);

CREATE INDEX idx_categories_user ON transaction_categories(user_id) 
    WHERE is_system = FALSE;
CREATE INDEX idx_categories_system ON transaction_categories(is_system) 
    WHERE is_system = TRUE;
CREATE INDEX idx_categories_with_budget 
    ON transaction_categories(user_id, monthly_budget_cents) 
    WHERE monthly_budget_cents IS NOT NULL;
```

**Changements importants vs version précédente.**

- **Ajout de `monthly_budget_cents`.** Le budget mensuel par catégorie est stocké directement ici, plus besoin de table `budget_envelopes` séparée.
- **CHECK constraint `categories_no_budget_on_income`.** Les catégories de revenus n'ont pas de budget mensuel (ça n'a pas de sens d'avoir un "budget" sur le salaire).
- **NULL signifie "pas de budget défini"** pour cette catégorie. L'user peut avoir une catégorie sans budget.

**Mapping API.**

| Colonne DB | API front |
|---|---|
| `name` | `nom` |
| `icon` | `icone` |
| `color` | `couleur` |
| `is_income` | `type` (`revenu` ou `depense`) |
| `monthly_budget_cents` | `budgetMensuel` (euros) |

### 8.2 Table `transactions`

Transactions bancaires (synchronisées ou manuelles).

```sql
CREATE TABLE transactions (
    id UUID PRIMARY KEY,
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    external_id VARCHAR(255),
    
    -- Financier
    amount_cents BIGINT NOT NULL,
    
    -- Dates
    transaction_date DATE NOT NULL,
    value_date DATE,
    
    -- Description
    label VARCHAR(500) NOT NULL,
    counterparty_name VARCHAR(255),
    raw_description TEXT,
    
    -- Catégorisation
    category_id UUID REFERENCES transaction_categories(id) ON DELETE SET NULL,
    user_category_override BOOLEAN NOT NULL DEFAULT FALSE,
    
    -- Métadonnées
    transaction_type VARCHAR(30) NOT NULL,
    is_pending BOOLEAN NOT NULL DEFAULT FALSE,
    is_recurring BOOLEAN NOT NULL DEFAULT FALSE,
    bridge_payload JSONB,
    notes TEXT,
    
    -- Audit
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    
    CONSTRAINT transactions_amount_not_zero CHECK (amount_cents != 0),
    CONSTRAINT transactions_type CHECK (transaction_type IN (
        'DEBIT', 'CREDIT', 'TRANSFER', 'FEE', 'INTEREST', 'REFUND', 'RECURRING', 'OTHER'
    )),
    CONSTRAINT transactions_date_not_far_future 
        CHECK (transaction_date <= CURRENT_DATE + INTERVAL '7 days')
);

CREATE UNIQUE INDEX idx_transactions_external_unique 
    ON transactions(account_id, external_id) 
    WHERE external_id IS NOT NULL;
CREATE INDEX idx_transactions_account_date 
    ON transactions(account_id, transaction_date DESC) 
    WHERE deleted_at IS NULL;
CREATE INDEX idx_transactions_category 
    ON transactions(category_id) 
    WHERE deleted_at IS NULL;
CREATE INDEX idx_transactions_pending 
    ON transactions(account_id) 
    WHERE is_pending = TRUE;
CREATE INDEX idx_transactions_date 
    ON transactions(transaction_date DESC) 
    WHERE deleted_at IS NULL;
```

**Note.** Ajout du type `RECURRING` dans l'enum `transaction_type` pour marquer les transactions issues d'une charge fixe.

**Convention de signe (à respecter absolument).**

- `amount_cents < 0` : débit (sortie d'argent)
- `amount_cents > 0` : crédit (entrée d'argent)

**Mapping API.**

| Colonne DB | API front |
|---|---|
| `account_id` | `compteId` |
| `amount_cents` | `montant` (euros, négatif=dépense, positif=revenu) |
| `transaction_date` | `dateTransaction` |
| `label` | `description` |
| `category_id` | `categorieId` |
| `transaction_type` | `type` (mapping enum) |

**Mapping enum `transaction_type` vers `type` front.**

Le front utilise `depense`, `revenu`, `fixe`. La DB est plus granulaire. Le converter calcule :

```
DEBIT, FEE → "depense"
CREDIT, INTEREST, REFUND → "revenu"
RECURRING → "fixe"
TRANSFER, OTHER → selon le signe du montant
```

Note : le front pourrait simplement déduire le type à partir du signe de `montant` + flag `is_recurring`. À discuter selon la simplicité voulue.

---

## 9. Module recurring

### 9.1 Table `recurring_charges` (NOUVELLE)

Charges fixes mensuelles, trimestrielles, ou annuelles. Élément central manqué dans la version précédente du schéma.

```sql
CREATE TABLE recurring_charges (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Identité
    name VARCHAR(200) NOT NULL,
    description TEXT,
    
    -- Financier
    amount_cents BIGINT NOT NULL,
    
    -- Récurrence
    frequency VARCHAR(20) NOT NULL,
    day_of_month INTEGER,
    month_of_year INTEGER,
    
    -- Liens
    category_id UUID REFERENCES transaction_categories(id) ON DELETE SET NULL,
    account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
    
    -- État
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    start_date DATE,
    end_date DATE,
    next_occurrence_date DATE,
    
    -- Notes
    notes TEXT,
    
    -- Audit
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    
    CONSTRAINT recurring_amount_positive CHECK (amount_cents > 0),
    CONSTRAINT recurring_frequency CHECK (frequency IN (
        'MONTHLY', 'QUARTERLY', 'SEMI_ANNUAL', 'ANNUAL'
    )),
    CONSTRAINT recurring_day_valid CHECK (
        day_of_month IS NULL OR (day_of_month BETWEEN 1 AND 31)
    ),
    CONSTRAINT recurring_month_valid CHECK (
        month_of_year IS NULL OR (month_of_year BETWEEN 1 AND 12)
    ),
    CONSTRAINT recurring_dates_consistent CHECK (
        start_date IS NULL OR end_date IS NULL OR start_date <= end_date
    )
);

CREATE INDEX idx_recurring_user_active 
    ON recurring_charges(user_id) 
    WHERE deleted_at IS NULL AND is_active = TRUE;
CREATE INDEX idx_recurring_next_occurrence 
    ON recurring_charges(next_occurrence_date) 
    WHERE is_active = TRUE AND deleted_at IS NULL;
CREATE INDEX idx_recurring_category 
    ON recurring_charges(category_id) 
    WHERE deleted_at IS NULL;
```

**Détail des colonnes.**

| Colonne | Type | Description |
|---|---|---|
| `id` | UUID | Identifiant unique |
| `user_id` | UUID | Propriétaire |
| `name` | VARCHAR(200) | Nom (ex: "Loyer", "Netflix") |
| `description` | TEXT | Description optionnelle |
| `amount_cents` | BIGINT | Montant en centimes (toujours positif) |
| `frequency` | VARCHAR(20) | Fréquence de prélèvement |
| `day_of_month` | INTEGER | Jour du mois (1-31), pour MONTHLY/QUARTERLY |
| `month_of_year` | INTEGER | Mois (1-12), pour ANNUAL et SEMI_ANNUAL |
| `category_id` | UUID | Catégorie associée |
| `account_id` | UUID | Compte débité |
| `is_active` | BOOLEAN | TRUE = active, FALSE = désactivée temporairement |
| `start_date` | DATE | Date de début |
| `end_date` | DATE | Date de fin (NULL si indéfinie) |
| `next_occurrence_date` | DATE | Prochaine occurrence (calculée et mise à jour) |
| `notes` | TEXT | Notes libres |

**Valeurs `frequency` et mapping.**

| DB | Mapping front | Description |
|---|---|---|
| `MONTHLY` | `mensuel` | Chaque mois |
| `QUARTERLY` | `trimestriel` | Chaque trimestre |
| `SEMI_ANNUAL` | `semestriel` | Chaque semestre |
| `ANNUAL` | `annuel` | Chaque année |

**Choix de design clés.**

- **`amount_cents` toujours positif.** La convention de signe (négatif = dépense) ne s'applique pas ici car les charges sont par définition des sorties. Le converter calcule automatiquement `transactions.amount_cents = -recurring_charges.amount_cents` lors de la génération automatique.

- **`next_occurrence_date` dénormalisé.** Calculé et stocké pour faciliter les requêtes "prochaines charges à venir". Mis à jour automatiquement quand une occurrence est franchie.

- **Génération automatique de transactions.** Un job périodique (Spring `@Scheduled`) parcourt les charges où `next_occurrence_date <= CURRENT_DATE` et crée des transactions correspondantes avec `transaction_type = 'RECURRING'`.

- **`category_id` et `account_id` en `ON DELETE SET NULL`.** Si la catégorie ou le compte est supprimé, la charge reste mais sans lien. À gérer côté code (alerte utilisateur "votre charge X n'a plus de compte associé").

**Mapping API.**

| Colonne DB | API front |
|---|---|
| `name` | `nom` |
| `amount_cents` | `montant` (euros, positif) |
| `frequency` | `frequence` (mapping enum) |
| `day_of_month` | `jourPrelevement` |
| `category_id` | `categorieId` |
| `account_id` | `compteId` |
| `is_active` | `estActif` |

---

## 10. Module patrimony

### 10.1 Table `patrimony_assets`

Actifs patrimoniaux avec colonnes explicites pour les actifs financiers (alignement avec le front).

```sql
CREATE TABLE patrimony_assets (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Identité
    name VARCHAR(200) NOT NULL,
    asset_type VARCHAR(50) NOT NULL,
    description TEXT,
    
    -- Acquisition
    purchase_date DATE,
    purchase_amount_cents BIGINT,
    
    -- Valorisation actuelle
    current_value_cents BIGINT NOT NULL,
    last_valuation_at TIMESTAMP WITH TIME ZONE,
    
    -- Spécifique actifs financiers (NULL pour autres types)
    ticker VARCHAR(20),
    platform VARCHAR(100),
    quantity NUMERIC(20, 8),
    purchase_price_per_unit_cents BIGINT,
    
    -- Métadonnées spécifiques par type
    metadata JSONB,
    
    -- État
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    image_url TEXT,
    notes TEXT,
    
    -- Audit
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    
    CONSTRAINT assets_type CHECK (asset_type IN (
        'REAL_ESTATE', 'STOCK', 'ETF', 'CRYPTO', 'BOND', 'FUND', 
        'LIFE_INSURANCE', 'SAVINGS', 'OTHER'
    )),
    CONSTRAINT assets_value_positive CHECK (current_value_cents >= 0),
    CONSTRAINT assets_quantity_positive CHECK (
        quantity IS NULL OR quantity > 0
    ),
    CONSTRAINT assets_purchase_amount_positive CHECK (
        purchase_amount_cents IS NULL OR purchase_amount_cents > 0
    ),
    CONSTRAINT assets_purchase_price_positive CHECK (
        purchase_price_per_unit_cents IS NULL OR purchase_price_per_unit_cents > 0
    )
);

CREATE INDEX idx_assets_user_type 
    ON patrimony_assets(user_id, asset_type) 
    WHERE deleted_at IS NULL;
CREATE INDEX idx_assets_user_active 
    ON patrimony_assets(user_id) 
    WHERE deleted_at IS NULL AND is_active = TRUE;
CREATE INDEX idx_assets_ticker 
    ON patrimony_assets(ticker) 
    WHERE ticker IS NOT NULL AND deleted_at IS NULL;
```

**Changements vs version précédente.**

- **Ajout colonnes explicites financières.** `ticker`, `platform`, `quantity`, `purchase_price_per_unit_cents` directement dans la table plutôt qu'en JSONB. Aligne avec le front existant.

- **`quantity` en NUMERIC(20, 8).** Pour supporter les fractions de crypto (Bitcoin a 8 décimales) ou d'ETF (parts fractionnées).

- **`metadata JSONB` conservé.** Pour les champs spécifiques aux autres types (adresse immobilier, numéro contrat assurance-vie, etc.).

- **Ajout `ETF` dans `asset_type`.** Type explicite, le front les sépare des actions.

- **Ajout `image_url`.** Demandé par le front.

**Mapping API.**

| Colonne DB | API front |
|---|---|
| `asset_type` | `type` (mapping enum) |
| `current_value_cents` | `prixActuel` (euros) |
| `purchase_amount_cents` | `prixAchat` (euros) |
| `purchase_price_per_unit_cents` | `prixAchatUnitaire` (euros) |
| `quantity` | `quantite` |
| `platform` | `plateforme` |

**Mapping enum `asset_type`.**

| DB | Front |
|---|---|
| `REAL_ESTATE` | `immobilier` |
| `STOCK` | `actions` |
| `ETF` | `etf` |
| `CRYPTO` | `crypto` |
| `BOND` | `obligations` |
| `FUND` | `fonds` |
| `LIFE_INSURANCE` | `assurance_vie` |
| `SAVINGS` | `epargne` |
| `OTHER` | `autre` |

### 10.2 Table `patrimony_liabilities`

Dettes et passifs avec colonnes explicites pour le prêteur et la date de prélèvement.

```sql
CREATE TABLE patrimony_liabilities (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Identité
    name VARCHAR(200) NOT NULL,
    liability_type VARCHAR(50) NOT NULL,
    lender VARCHAR(200),
    
    -- Financier
    initial_amount_cents BIGINT NOT NULL,
    current_amount_cents BIGINT NOT NULL,
    interest_rate_basis_points INTEGER,
    monthly_payment_cents BIGINT,
    
    -- Dates
    start_date DATE,
    end_date DATE,
    day_of_month INTEGER,
    
    -- État
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    image_url TEXT,
    notes TEXT,
    metadata JSONB,
    
    -- Audit
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    
    CONSTRAINT liabilities_type CHECK (liability_type IN (
        'MORTGAGE', 'CONSUMER_LOAN', 'STUDENT_LOAN', 'AUTO_LOAN', 
        'CREDIT_CARD_DEBT', 'OTHER'
    )),
    CONSTRAINT liabilities_initial_positive CHECK (initial_amount_cents > 0),
    CONSTRAINT liabilities_current_non_negative CHECK (current_amount_cents >= 0),
    CONSTRAINT liabilities_day_valid CHECK (
        day_of_month IS NULL OR (day_of_month BETWEEN 1 AND 31)
    ),
    CONSTRAINT liabilities_dates_consistent CHECK (
        start_date IS NULL OR end_date IS NULL OR start_date <= end_date
    )
);

CREATE INDEX idx_liabilities_user_active 
    ON patrimony_liabilities(user_id) 
    WHERE deleted_at IS NULL AND is_active = TRUE;
CREATE INDEX idx_liabilities_user_type 
    ON patrimony_liabilities(user_id, liability_type) 
    WHERE deleted_at IS NULL;
```

**Changements vs version précédente.**

- **Ajout `lender`.** Nom du prêteur (banque, organisme). Demandé par le front.
- **Ajout `day_of_month`.** Jour de prélèvement de la mensualité. Permet de calculer les prochaines échéances.
- **Ajout `AUTO_LOAN`.** Type explicite pour les crédits auto.
- **Ajout `image_url`.** Demandé par le front.

**Mapping API.**

| Colonne DB | API front |
|---|---|
| `liability_type` | `type` (mapping enum) |
| `lender` | `preteur` |
| `initial_amount_cents` | `capitalInitial` (euros) |
| `current_amount_cents` | `capitalRestant` (euros) |
| `interest_rate_basis_points` | `tauxAnnuel` (pourcentage, ex: 3.25) |
| `monthly_payment_cents` | `mensualite` (euros) |
| `day_of_month` | `jourPrelevement` |

**Mapping enum `liability_type`.**

| DB | Front |
|---|---|
| `MORTGAGE` | `immobilier` |
| `CONSUMER_LOAN` | `consommation` |
| `STUDENT_LOAN` | `etudiant` |
| `AUTO_LOAN` | `auto` |
| `CREDIT_CARD_DEBT` | `decouvert` |
| `OTHER` | `autre` |

**Conversion taux d'intérêt.**

DB stocke en basis points (1 bp = 0,01%). API expose en pourcentage décimal.

```java
public BigDecimal toPercent(int basisPoints) {
    return BigDecimal.valueOf(basisPoints, 2);  // 325 → 3.25
}

public int toBasisPoints(BigDecimal percent) {
    return percent.movePointRight(2).intValueExact();  // 3.25 → 325
}
```

---

## 11. Module shared

### 11.1 Table `audit_log`

Trace des actions critiques (sécurité, conformité, debug).

```sql
CREATE TABLE audit_log (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID,
    metadata JSONB,
    ip_address INET,
    user_agent VARCHAR(512),
    occurred_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_user_date 
    ON audit_log(user_id, occurred_at DESC);
CREATE INDEX idx_audit_entity 
    ON audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_action 
    ON audit_log(action);
CREATE INDEX idx_audit_date 
    ON audit_log(occurred_at DESC);
```

---

## 12. Fonctions et triggers utilitaires

### 12.1 Trigger `update_updated_at_column`

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### 12.2 Application aux tables

```sql
CREATE TRIGGER set_users_updated_at 
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_bridge_connections_updated_at 
    BEFORE UPDATE ON bridge_connections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_accounts_updated_at 
    BEFORE UPDATE ON accounts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_transaction_categories_updated_at 
    BEFORE UPDATE ON transaction_categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_transactions_updated_at 
    BEFORE UPDATE ON transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_recurring_charges_updated_at 
    BEFORE UPDATE ON recurring_charges
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_patrimony_assets_updated_at 
    BEFORE UPDATE ON patrimony_assets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_patrimony_liabilities_updated_at 
    BEFORE UPDATE ON patrimony_liabilities
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

## 13. Migrations Flyway complètes

### 13.1 Ordre

```
src/main/resources/db/migration/
├── V1__create_auth_tables.sql
├── V2__create_bridge_tables.sql
├── V3__create_account_tables.sql
├── V4__create_transaction_tables.sql
├── V5__create_recurring_charges_table.sql
├── V6__create_patrimony_tables.sql
├── V7__create_audit_log_table.sql
├── V8__create_triggers.sql
└── V9__insert_default_categories.sql
```

### 13.2 V1 : Auth (avec profil)

```sql
-- V1__create_auth_tables.sql

CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR(320) NOT NULL UNIQUE,
    password_hash VARCHAR(60) NOT NULL,
    email_verified_at TIMESTAMP WITH TIME ZONE,
    last_login_at TIMESTAMP WITH TIME ZONE,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    monthly_income_cents BIGINT,
    savings_goal_cents BIGINT,
    management_mode VARCHAR(30) NOT NULL DEFAULT 'FULL',
    onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE,
    onboarding_completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    
    CONSTRAINT users_email_format CHECK (email ~ '^[^@]+@[^@]+\.[^@]+$'),
    CONSTRAINT users_management_mode CHECK (management_mode IN (
        'BUDGET_ONLY', 'PATRIMONY_ONLY', 'FULL'
    )),
    CONSTRAINT users_income_positive CHECK (
        monthly_income_cents IS NULL OR monthly_income_cents >= 0
    ),
    CONSTRAINT users_savings_goal_positive CHECK (
        savings_goal_cents IS NULL OR savings_goal_cents >= 0
    )
);

CREATE UNIQUE INDEX idx_users_email_active 
    ON users(email) 
    WHERE deleted_at IS NULL;
CREATE INDEX idx_users_created_at ON users(created_at);
CREATE INDEX idx_users_onboarding 
    ON users(onboarding_completed) 
    WHERE onboarding_completed = FALSE AND deleted_at IS NULL;


CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(64) NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    revoked_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    user_agent VARCHAR(512),
    ip_address INET
);

CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_hash ON refresh_tokens(token_hash);
CREATE INDEX idx_refresh_tokens_cleanup 
    ON refresh_tokens(expires_at) 
    WHERE revoked_at IS NULL;
```

### 13.3 V2 : Bridge

```sql
-- V2__create_bridge_tables.sql

CREATE TABLE bridge_connections (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    bridge_item_id VARCHAR(100) NOT NULL UNIQUE,
    bank_id VARCHAR(50),
    bank_name VARCHAR(200),
    status VARCHAR(30) NOT NULL,
    access_token_encrypted TEXT,
    refresh_token_encrypted TEXT,
    token_expires_at TIMESTAMP WITH TIME ZONE,
    last_sync_at TIMESTAMP WITH TIME ZONE,
    last_sync_status VARCHAR(30),
    last_error_message TEXT,
    consent_expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    CONSTRAINT bridge_connections_status CHECK (status IN (
        'PENDING', 'ACTIVE', 'EXPIRED', 'ERROR', 'REVOKED'
    )),
    CONSTRAINT bridge_connections_sync_status CHECK (
        last_sync_status IS NULL OR last_sync_status IN (
            'SUCCESS', 'PARTIAL', 'FAILED'
        )
    )
);

CREATE INDEX idx_bridge_connections_user ON bridge_connections(user_id);
CREATE INDEX idx_bridge_connections_status ON bridge_connections(status);
CREATE INDEX idx_bridge_connections_consent 
    ON bridge_connections(consent_expires_at) 
    WHERE status = 'ACTIVE';


CREATE TABLE bridge_webhooks_received (
    id UUID PRIMARY KEY,
    bridge_connection_id UUID REFERENCES bridge_connections(id) ON DELETE SET NULL,
    event_type VARCHAR(100) NOT NULL,
    payload JSONB NOT NULL,
    signature_valid BOOLEAN NOT NULL,
    processed_at TIMESTAMP WITH TIME ZONE,
    processing_error TEXT,
    received_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_webhooks_received_at ON bridge_webhooks_received(received_at DESC);
CREATE INDEX idx_webhooks_unprocessed 
    ON bridge_webhooks_received(received_at) 
    WHERE processed_at IS NULL;
CREATE INDEX idx_webhooks_event_type ON bridge_webhooks_received(event_type);
```

### 13.4 V3 : Account (avec CASH)

```sql
-- V3__create_account_tables.sql

CREATE TABLE accounts (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    bridge_connection_id UUID REFERENCES bridge_connections(id) ON DELETE SET NULL,
    external_id VARCHAR(255),
    name VARCHAR(200) NOT NULL,
    bank_name VARCHAR(200),
    account_type VARCHAR(50) NOT NULL,
    iban VARCHAR(34),
    balance_cents BIGINT NOT NULL DEFAULT 0,
    is_manual BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    last_sync_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    
    CONSTRAINT accounts_type CHECK (account_type IN (
        'CHECKING', 'SAVINGS', 'CREDIT_CARD', 'CASH', 'INVESTMENT', 'LOAN', 'OTHER'
    )),
    CONSTRAINT accounts_external_id_when_bridge CHECK (
        (bridge_connection_id IS NULL) OR (external_id IS NOT NULL)
    )
);

CREATE INDEX idx_accounts_user ON accounts(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_accounts_bridge ON accounts(bridge_connection_id);
CREATE UNIQUE INDEX idx_accounts_bridge_external_unique 
    ON accounts(bridge_connection_id, external_id) 
    WHERE external_id IS NOT NULL;


CREATE TABLE account_balances_history (
    id UUID PRIMARY KEY,
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    balance_cents BIGINT NOT NULL,
    recorded_at TIMESTAMP WITH TIME ZONE NOT NULL,
    source VARCHAR(20) NOT NULL,
    
    CONSTRAINT balances_history_source CHECK (source IN ('SYNC', 'MANUAL', 'COMPUTED'))
);

CREATE INDEX idx_balances_history_account_date 
    ON account_balances_history(account_id, recorded_at DESC);
```

### 13.5 V4 : Transaction (avec budget intégré aux catégories)

```sql
-- V4__create_transaction_tables.sql

CREATE TABLE transaction_categories (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    icon VARCHAR(50),
    color VARCHAR(7),
    is_income BOOLEAN NOT NULL DEFAULT FALSE,
    is_system BOOLEAN NOT NULL DEFAULT FALSE,
    monthly_budget_cents BIGINT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    CONSTRAINT categories_color_hex CHECK (color IS NULL OR color ~ '^#[0-9A-Fa-f]{6}$'),
    CONSTRAINT categories_user_or_system CHECK (
        (is_system = TRUE AND user_id IS NULL) OR 
        (is_system = FALSE AND user_id IS NOT NULL)
    ),
    CONSTRAINT categories_budget_positive CHECK (
        monthly_budget_cents IS NULL OR monthly_budget_cents > 0
    ),
    CONSTRAINT categories_no_budget_on_income CHECK (
        is_income = FALSE OR monthly_budget_cents IS NULL
    )
);

CREATE INDEX idx_categories_user ON transaction_categories(user_id) 
    WHERE is_system = FALSE;
CREATE INDEX idx_categories_system ON transaction_categories(is_system) 
    WHERE is_system = TRUE;
CREATE INDEX idx_categories_with_budget 
    ON transaction_categories(user_id, monthly_budget_cents) 
    WHERE monthly_budget_cents IS NOT NULL;


CREATE TABLE transactions (
    id UUID PRIMARY KEY,
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    external_id VARCHAR(255),
    amount_cents BIGINT NOT NULL,
    transaction_date DATE NOT NULL,
    value_date DATE,
    label VARCHAR(500) NOT NULL,
    counterparty_name VARCHAR(255),
    raw_description TEXT,
    category_id UUID REFERENCES transaction_categories(id) ON DELETE SET NULL,
    user_category_override BOOLEAN NOT NULL DEFAULT FALSE,
    transaction_type VARCHAR(30) NOT NULL,
    is_pending BOOLEAN NOT NULL DEFAULT FALSE,
    is_recurring BOOLEAN NOT NULL DEFAULT FALSE,
    bridge_payload JSONB,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    
    CONSTRAINT transactions_amount_not_zero CHECK (amount_cents != 0),
    CONSTRAINT transactions_type CHECK (transaction_type IN (
        'DEBIT', 'CREDIT', 'TRANSFER', 'FEE', 'INTEREST', 'REFUND', 'RECURRING', 'OTHER'
    )),
    CONSTRAINT transactions_date_not_far_future 
        CHECK (transaction_date <= CURRENT_DATE + INTERVAL '7 days')
);

CREATE UNIQUE INDEX idx_transactions_external_unique 
    ON transactions(account_id, external_id) 
    WHERE external_id IS NOT NULL;
CREATE INDEX idx_transactions_account_date 
    ON transactions(account_id, transaction_date DESC) 
    WHERE deleted_at IS NULL;
CREATE INDEX idx_transactions_category 
    ON transactions(category_id) 
    WHERE deleted_at IS NULL;
CREATE INDEX idx_transactions_pending 
    ON transactions(account_id) 
    WHERE is_pending = TRUE;
CREATE INDEX idx_transactions_date 
    ON transactions(transaction_date DESC) 
    WHERE deleted_at IS NULL;
```

### 13.6 V5 : Recurring Charges (NOUVELLE)

```sql
-- V5__create_recurring_charges_table.sql

CREATE TABLE recurring_charges (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    amount_cents BIGINT NOT NULL,
    frequency VARCHAR(20) NOT NULL,
    day_of_month INTEGER,
    month_of_year INTEGER,
    category_id UUID REFERENCES transaction_categories(id) ON DELETE SET NULL,
    account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    start_date DATE,
    end_date DATE,
    next_occurrence_date DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    
    CONSTRAINT recurring_amount_positive CHECK (amount_cents > 0),
    CONSTRAINT recurring_frequency CHECK (frequency IN (
        'MONTHLY', 'QUARTERLY', 'SEMI_ANNUAL', 'ANNUAL'
    )),
    CONSTRAINT recurring_day_valid CHECK (
        day_of_month IS NULL OR (day_of_month BETWEEN 1 AND 31)
    ),
    CONSTRAINT recurring_month_valid CHECK (
        month_of_year IS NULL OR (month_of_year BETWEEN 1 AND 12)
    ),
    CONSTRAINT recurring_dates_consistent CHECK (
        start_date IS NULL OR end_date IS NULL OR start_date <= end_date
    )
);

CREATE INDEX idx_recurring_user_active 
    ON recurring_charges(user_id) 
    WHERE deleted_at IS NULL AND is_active = TRUE;
CREATE INDEX idx_recurring_next_occurrence 
    ON recurring_charges(next_occurrence_date) 
    WHERE is_active = TRUE AND deleted_at IS NULL;
CREATE INDEX idx_recurring_category 
    ON recurring_charges(category_id) 
    WHERE deleted_at IS NULL;
```

### 13.7 V6 : Patrimony (avec colonnes explicites)

```sql
-- V6__create_patrimony_tables.sql

CREATE TABLE patrimony_assets (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    asset_type VARCHAR(50) NOT NULL,
    description TEXT,
    purchase_date DATE,
    purchase_amount_cents BIGINT,
    current_value_cents BIGINT NOT NULL,
    last_valuation_at TIMESTAMP WITH TIME ZONE,
    ticker VARCHAR(20),
    platform VARCHAR(100),
    quantity NUMERIC(20, 8),
    purchase_price_per_unit_cents BIGINT,
    metadata JSONB,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    image_url TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    
    CONSTRAINT assets_type CHECK (asset_type IN (
        'REAL_ESTATE', 'STOCK', 'ETF', 'CRYPTO', 'BOND', 'FUND', 
        'LIFE_INSURANCE', 'SAVINGS', 'OTHER'
    )),
    CONSTRAINT assets_value_positive CHECK (current_value_cents >= 0),
    CONSTRAINT assets_quantity_positive CHECK (
        quantity IS NULL OR quantity > 0
    ),
    CONSTRAINT assets_purchase_amount_positive CHECK (
        purchase_amount_cents IS NULL OR purchase_amount_cents > 0
    ),
    CONSTRAINT assets_purchase_price_positive CHECK (
        purchase_price_per_unit_cents IS NULL OR purchase_price_per_unit_cents > 0
    )
);

CREATE INDEX idx_assets_user_type 
    ON patrimony_assets(user_id, asset_type) 
    WHERE deleted_at IS NULL;
CREATE INDEX idx_assets_user_active 
    ON patrimony_assets(user_id) 
    WHERE deleted_at IS NULL AND is_active = TRUE;
CREATE INDEX idx_assets_ticker 
    ON patrimony_assets(ticker) 
    WHERE ticker IS NOT NULL AND deleted_at IS NULL;


CREATE TABLE patrimony_liabilities (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    liability_type VARCHAR(50) NOT NULL,
    lender VARCHAR(200),
    initial_amount_cents BIGINT NOT NULL,
    current_amount_cents BIGINT NOT NULL,
    interest_rate_basis_points INTEGER,
    monthly_payment_cents BIGINT,
    start_date DATE,
    end_date DATE,
    day_of_month INTEGER,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    image_url TEXT,
    notes TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    
    CONSTRAINT liabilities_type CHECK (liability_type IN (
        'MORTGAGE', 'CONSUMER_LOAN', 'STUDENT_LOAN', 'AUTO_LOAN', 
        'CREDIT_CARD_DEBT', 'OTHER'
    )),
    CONSTRAINT liabilities_initial_positive CHECK (initial_amount_cents > 0),
    CONSTRAINT liabilities_current_non_negative CHECK (current_amount_cents >= 0),
    CONSTRAINT liabilities_day_valid CHECK (
        day_of_month IS NULL OR (day_of_month BETWEEN 1 AND 31)
    ),
    CONSTRAINT liabilities_dates_consistent CHECK (
        start_date IS NULL OR end_date IS NULL OR start_date <= end_date
    )
);

CREATE INDEX idx_liabilities_user_active 
    ON patrimony_liabilities(user_id) 
    WHERE deleted_at IS NULL AND is_active = TRUE;
CREATE INDEX idx_liabilities_user_type 
    ON patrimony_liabilities(user_id, liability_type) 
    WHERE deleted_at IS NULL;
```

### 13.8 V7 : Audit Log

```sql
-- V7__create_audit_log_table.sql

CREATE TABLE audit_log (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID,
    metadata JSONB,
    ip_address INET,
    user_agent VARCHAR(512),
    occurred_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_user_date 
    ON audit_log(user_id, occurred_at DESC);
CREATE INDEX idx_audit_entity 
    ON audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_action 
    ON audit_log(action);
CREATE INDEX idx_audit_date 
    ON audit_log(occurred_at DESC);
```

### 13.9 V8 : Triggers

```sql
-- V8__create_triggers.sql

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_users_updated_at 
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_bridge_connections_updated_at 
    BEFORE UPDATE ON bridge_connections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_accounts_updated_at 
    BEFORE UPDATE ON accounts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_transaction_categories_updated_at 
    BEFORE UPDATE ON transaction_categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_transactions_updated_at 
    BEFORE UPDATE ON transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_recurring_charges_updated_at 
    BEFORE UPDATE ON recurring_charges
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_patrimony_assets_updated_at 
    BEFORE UPDATE ON patrimony_assets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_patrimony_liabilities_updated_at 
    BEFORE UPDATE ON patrimony_liabilities
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 13.10 V9 : Catégories par défaut

```sql
-- V9__insert_default_categories.sql

INSERT INTO transaction_categories (id, user_id, name, icon, color, is_income, is_system, sort_order)
VALUES
    -- Dépenses
    (gen_random_uuid(), NULL, 'Alimentation', 'shopping-cart', '#FF6B6B', FALSE, TRUE, 1),
    (gen_random_uuid(), NULL, 'Loyer / Logement', 'home', '#4ECDC4', FALSE, TRUE, 2),
    (gen_random_uuid(), NULL, 'Transports', 'car', '#45B7D1', FALSE, TRUE, 3),
    (gen_random_uuid(), NULL, 'Loisirs', 'gamepad', '#FFA07A', FALSE, TRUE, 4),
    (gen_random_uuid(), NULL, 'Santé', 'heart', '#98D8C8', FALSE, TRUE, 5),
    (gen_random_uuid(), NULL, 'Abonnements', 'repeat', '#C39BD3', FALSE, TRUE, 6),
    (gen_random_uuid(), NULL, 'Impôts et taxes', 'file-text', '#5D6D7E', FALSE, TRUE, 7),
    (gen_random_uuid(), NULL, 'Vêtements', 'shopping-bag', '#F8B739', FALSE, TRUE, 8),
    (gen_random_uuid(), NULL, 'Restaurants', 'coffee', '#E67E22', FALSE, TRUE, 9),
    (gen_random_uuid(), NULL, 'Éducation', 'book', '#3498DB', FALSE, TRUE, 10),
    (gen_random_uuid(), NULL, 'Cadeaux', 'gift', '#E74C3C', FALSE, TRUE, 11),
    (gen_random_uuid(), NULL, 'Autres dépenses', 'more-horizontal', '#BDC3C7', FALSE, TRUE, 99),
    
    -- Revenus
    (gen_random_uuid(), NULL, 'Salaire', 'briefcase', '#52BE80', TRUE, TRUE, 1),
    (gen_random_uuid(), NULL, 'Revenus complémentaires', 'trending-up', '#76D7C4', TRUE, TRUE, 2),
    (gen_random_uuid(), NULL, 'Remboursements', 'corner-down-right', '#85C1E9', TRUE, TRUE, 3),
    (gen_random_uuid(), NULL, 'Investissements', 'pie-chart', '#48C9B0', TRUE, TRUE, 4),
    (gen_random_uuid(), NULL, 'Autres revenus', 'plus-circle', '#ABEBC6', TRUE, TRUE, 99);
```

---

## 14. Évolutions V2

### 14.1 Multi-devises

Ajout de `currency CHAR(3)` sur toutes les tables monétaires. Création de `exchange_rates(from_currency, to_currency, rate, valid_from)`.

### 14.2 Catégories hiérarchiques

Ajout de `parent_id UUID REFERENCES transaction_categories(id) ON DELETE SET NULL` sur `transaction_categories`.

### 14.3 Split de transactions

Création de `transaction_splits(transaction_id, category_id, amount_cents)`.

### 14.4 Historique des valorisations patrimoine

Création de `patrimony_asset_valuations(asset_id, value_cents, valued_at, source)`.

### 14.5 Tags transactions

Création de `tags(user_id, name, color)` + `transaction_tags(transaction_id, tag_id)`.

### 14.6 Budget par enveloppes flexibles

Si le besoin V2 nécessite plusieurs catégories par enveloppe, création de `budget_envelopes(user_id, name, monthly_amount_cents)` + `budget_envelope_categories(envelope_id, category_id)`. Migration des budgets actuels depuis `transaction_categories.monthly_budget_cents`.

---

## 15. Synthèse entretien

### 15.1 Pitch DB en 60 secondes

> "La base PostgreSQL d'Oyko V1 compte 12 tables réparties par module fonctionnel : auth, bridge, account, transaction, recurring, patrimony, plus audit transverse. Mes conventions transverses sont UUID en clé primaire, timestamps avec timezone en UTC, montants en centimes BIGINT pour éviter les erreurs d'arrondi flottant, soft delete sur les tables métier, et CHECK constraints au niveau base pour les invariants. L'API REST expose les montants en euros et peut traduire les noms en français pour le front, mais la base reste en anglais avec conventions internationales. Conformité DSP2 : tokens Bridge chiffrés en AES-256-GCM avant stockage, consentements tracés à 90 jours. Idempotence des imports Bridge garantie par index unique conditionnel. Migrations Flyway par module fonctionnel, trigger PostgreSQL pour mise à jour automatique des updated_at. J'ai assumé plusieurs simplifications V1 comme EUR uniquement, catégories flat, budget intégré aux catégories, et un schéma de charges fixes dédié pour aligner avec le besoin utilisateur. Toutes les évolutions V2 sont documentées."

### 15.2 Question piège anticipée : "Pourquoi pas de table budget séparée ?"

> "J'ai opté pour stocker le budget mensuel directement sur la catégorie, via une colonne `monthly_budget_cents`. Le raisonnement : dans le scope V1, un utilisateur veut associer un budget à une catégorie de dépense, c'est une relation 1:1. Créer une table séparée `budget_envelopes` reliée à `transaction_categories` ajoutait une jointure systématique et une complexité injustifiée. Si demain le besoin métier devient "une enveloppe peut regrouper plusieurs catégories" ou "plusieurs budgets pour la même catégorie selon la période", j'ai documenté la migration vers une table dédiée. C'est exactement le pattern YAGNI : on ne crée pas la complexité avant que le besoin la justifie."

### 15.3 Question piège anticipée : "Et la table charges fixes, pourquoi pas mélangée avec transactions ?"

> "Distinction conceptuelle importante. `transactions` représente des opérations bancaires historiques, datées, avec un montant ponctuel. `recurring_charges` représente des règles de récurrence : Netflix tous les 15 du mois, prêt immo le 5. Mélanger les deux aurait pollué `transactions` avec des données prédictives, complexifié les calculs de solde, et rendu confus le sens même de la table. Mon approche : `recurring_charges` est la source de vérité de la règle, et un job applicatif génère mensuellement les transactions correspondantes avec `transaction_type = 'RECURRING'` et `is_recurring = TRUE`. La traçabilité est conservée des deux côtés."

---

## Conclusion

Cette structure révisée couvre intégralement les besoins du front Next.js Oyko existant tout en conservant les conventions backend solides (UUID, centimes, soft delete, CHECK constraints, etc.). 12 tables, simplifications V1 assumées, évolutions V2 documentées, mapping API ↔ DB explicité.

Prête à être appliquée via Flyway au démarrage de Spring Boot.
