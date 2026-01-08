# Prompt Ultime - Backend Supabase pour Application Finance Personnelle

## Contexte

Tu dois créer le backend Supabase complet pour une application de gestion de finances personnelles en Next.js/React. L'application permet de :
- Suivre son budget hebdomadaire/mensuel avec un système d'enveloppes
- Enregistrer ses dépenses et revenus
- Gérer ses charges fixes (abonnements, loyer, etc.)
- Suivre son patrimoine (liquidités, investissements, dettes)
- Visualiser l'évolution de sa situation financière

---

## 1. SCHÉMA DE BASE DE DONNÉES

### 1.1 Table `profiles` (Extension de auth.users)

```sql
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    prenom VARCHAR(100),
    nom VARCHAR(100),
    email VARCHAR(255) UNIQUE NOT NULL,
    avatar_url TEXT,
    revenus_mensuels DECIMAL(10,2) DEFAULT 0,
    objectif_epargne DECIMAL(10,2) DEFAULT 0,
    mode_gestion VARCHAR(20) DEFAULT 'semaine' CHECK (mode_gestion IN ('semaine', 'mois')),
    devise VARCHAR(3) DEFAULT 'EUR',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 1.2 Table `comptes` (Comptes bancaires)

```sql
CREATE TABLE comptes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    nom VARCHAR(100) NOT NULL,
    banque VARCHAR(100),
    type VARCHAR(20) NOT NULL CHECK (type IN ('courant', 'epargne', 'cash', 'investissement')),
    solde DECIMAL(12,2) DEFAULT 0,
    couleur VARCHAR(20),
    icone VARCHAR(50),
    est_actif BOOLEAN DEFAULT true,
    ordre INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 1.3 Table `categories` (Catégories de dépenses/revenus - Enveloppes)

```sql
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    nom VARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('depense', 'revenu')),
    icone VARCHAR(10), -- Emoji
    couleur VARCHAR(20), -- Code couleur hex
    budget_mensuel DECIMAL(10,2) DEFAULT 0, -- Pour les enveloppes
    est_fixe BOOLEAN DEFAULT false, -- true = charge fixe, false = variable
    ordre INTEGER DEFAULT 0,
    est_actif BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, nom, type)
);
```

### 1.4 Table `charges_fixes` (Abonnements et prélèvements récurrents)

```sql
CREATE TABLE charges_fixes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    nom VARCHAR(100) NOT NULL,
    montant DECIMAL(10,2) NOT NULL,
    jour_prelevement INTEGER CHECK (jour_prelevement BETWEEN 1 AND 31),
    frequence VARCHAR(20) DEFAULT 'mensuel' CHECK (frequence IN ('hebdo', 'mensuel', 'trimestriel', 'annuel')),
    categorie_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    compte_id UUID REFERENCES comptes(id) ON DELETE SET NULL,
    icone VARCHAR(10),
    couleur VARCHAR(20),
    est_actif BOOLEAN DEFAULT true,
    date_debut DATE,
    date_fin DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 1.5 Table `transactions` (Toutes les transactions)

```sql
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    compte_id UUID REFERENCES comptes(id) ON DELETE SET NULL,
    categorie_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    charge_fixe_id UUID REFERENCES charges_fixes(id) ON DELETE SET NULL, -- Si c'est un prélèvement automatique
    type VARCHAR(20) NOT NULL CHECK (type IN ('depense', 'revenu', 'transfert')),
    montant DECIMAL(12,2) NOT NULL, -- Négatif pour dépenses, positif pour revenus
    description VARCHAR(255),
    date_transaction TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    est_recurrent BOOLEAN DEFAULT false,
    notes TEXT,
    tags TEXT[], -- Array de tags pour recherche
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour performances
CREATE INDEX idx_transactions_user_date ON transactions(user_id, date_transaction DESC);
CREATE INDEX idx_transactions_categorie ON transactions(categorie_id);
CREATE INDEX idx_transactions_compte ON transactions(compte_id);
```

### 1.6 Table `investissements` (Portefeuille d'investissement)

```sql
CREATE TABLE investissements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    nom VARCHAR(100) NOT NULL,
    ticker VARCHAR(20),
    type VARCHAR(30) NOT NULL CHECK (type IN ('ETF', 'Actions', 'Crypto', 'Obligations', 'Immobilier', 'Assurance-vie', 'PEA', 'Autre')),
    plateforme VARCHAR(100), -- Ex: Trade Republic, Boursorama, etc.
    quantite DECIMAL(18,8), -- Pour les cryptos notamment
    prix_achat_unitaire DECIMAL(12,4),
    prix_actuel DECIMAL(12,4),
    valeur_actuelle DECIMAL(12,2) GENERATED ALWAYS AS (quantite * prix_actuel) STORED,
    plus_value DECIMAL(12,2) GENERATED ALWAYS AS ((prix_actuel - prix_achat_unitaire) * quantite) STORED,
    devise VARCHAR(3) DEFAULT 'EUR',
    date_achat DATE,
    notes TEXT,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 1.7 Table `dettes` (Crédits et emprunts)

```sql
CREATE TABLE dettes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    nom VARCHAR(100) NOT NULL,
    type VARCHAR(30) NOT NULL CHECK (type IN ('etudiant', 'immobilier', 'conso', 'auto', 'personnel', 'autre')),
    preteur VARCHAR(100), -- Banque ou personne
    capital_initial DECIMAL(12,2) NOT NULL,
    capital_restant DECIMAL(12,2) NOT NULL,
    taux_interet DECIMAL(5,3), -- En pourcentage
    mensualite DECIMAL(10,2) NOT NULL,
    jour_prelevement INTEGER CHECK (jour_prelevement BETWEEN 1 AND 31),
    compte_id UUID REFERENCES comptes(id) ON DELETE SET NULL,
    date_debut DATE,
    date_fin DATE,
    nombre_echeances_restantes INTEGER,
    notes TEXT,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 1.8 Table `historique_soldes` (Snapshots pour graphiques d'évolution)

```sql
CREATE TABLE historique_soldes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    date_snapshot DATE NOT NULL,
    total_liquidites DECIMAL(12,2) DEFAULT 0,
    total_investissements DECIMAL(12,2) DEFAULT 0,
    total_actifs DECIMAL(12,2) DEFAULT 0,
    total_dettes DECIMAL(12,2) DEFAULT 0,
    valeur_nette DECIMAL(12,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, date_snapshot)
);

-- Index pour requêtes temporelles
CREATE INDEX idx_historique_user_date ON historique_soldes(user_id, date_snapshot DESC);
```

### 1.9 Table `objectifs` (Objectifs d'épargne)

```sql
CREATE TABLE objectifs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    nom VARCHAR(100) NOT NULL,
    montant_cible DECIMAL(12,2) NOT NULL,
    montant_actuel DECIMAL(12,2) DEFAULT 0,
    compte_id UUID REFERENCES comptes(id) ON DELETE SET NULL, -- Compte dédié optionnel
    icone VARCHAR(10),
    couleur VARCHAR(20),
    date_cible DATE,
    est_atteint BOOLEAN DEFAULT false,
    priorite INTEGER DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 1.10 Table `budgets_mensuels` (Historique des budgets par mois)

```sql
CREATE TABLE budgets_mensuels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    annee INTEGER NOT NULL,
    mois INTEGER NOT NULL CHECK (mois BETWEEN 1 AND 12),
    revenus_prevus DECIMAL(12,2) DEFAULT 0,
    revenus_reels DECIMAL(12,2) DEFAULT 0,
    charges_fixes_prevues DECIMAL(12,2) DEFAULT 0,
    charges_fixes_reelles DECIMAL(12,2) DEFAULT 0,
    depenses_variables_prevues DECIMAL(12,2) DEFAULT 0,
    depenses_variables_reelles DECIMAL(12,2) DEFAULT 0,
    epargne_prevue DECIMAL(12,2) DEFAULT 0,
    epargne_reelle DECIMAL(12,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, annee, mois)
);
```

---

## 2. VUES SQL UTILES

### 2.1 Vue `v_resume_mensuel` (Résumé du mois en cours)

```sql
CREATE OR REPLACE VIEW v_resume_mensuel AS
SELECT
    p.id as user_id,
    DATE_TRUNC('month', CURRENT_DATE) as mois,
    COALESCE(SUM(CASE WHEN t.type = 'revenu' THEN t.montant ELSE 0 END), 0) as revenus,
    COALESCE(SUM(CASE WHEN t.type = 'depense' AND c.est_fixe = true THEN ABS(t.montant) ELSE 0 END), 0) as charges_fixes,
    COALESCE(SUM(CASE WHEN t.type = 'depense' AND c.est_fixe = false THEN ABS(t.montant) ELSE 0 END), 0) as depenses_variables,
    COALESCE(SUM(CASE WHEN t.type = 'depense' THEN ABS(t.montant) ELSE 0 END), 0) as total_depenses
FROM profiles p
LEFT JOIN transactions t ON t.user_id = p.id
    AND DATE_TRUNC('month', t.date_transaction) = DATE_TRUNC('month', CURRENT_DATE)
LEFT JOIN categories c ON c.id = t.categorie_id
GROUP BY p.id;
```

### 2.2 Vue `v_depenses_par_categorie` (Dépenses groupées par catégorie)

```sql
CREATE OR REPLACE VIEW v_depenses_par_categorie AS
SELECT
    t.user_id,
    c.id as categorie_id,
    c.nom as categorie_nom,
    c.icone,
    c.couleur,
    c.budget_mensuel,
    DATE_TRUNC('month', t.date_transaction) as mois,
    SUM(ABS(t.montant)) as total_depense,
    CASE
        WHEN c.budget_mensuel > 0 THEN (SUM(ABS(t.montant)) / c.budget_mensuel * 100)
        ELSE 0
    END as pourcentage_budget
FROM transactions t
JOIN categories c ON c.id = t.categorie_id
WHERE t.type = 'depense'
GROUP BY t.user_id, c.id, c.nom, c.icone, c.couleur, c.budget_mensuel, DATE_TRUNC('month', t.date_transaction);
```

### 2.3 Vue `v_patrimoine_total` (Calcul du patrimoine)

```sql
CREATE OR REPLACE VIEW v_patrimoine_total AS
SELECT
    p.id as user_id,
    COALESCE((SELECT SUM(solde) FROM comptes WHERE user_id = p.id AND est_actif = true), 0) as total_liquidites,
    COALESCE((SELECT SUM(valeur_actuelle) FROM investissements WHERE user_id = p.id), 0) as total_investissements,
    COALESCE((SELECT SUM(capital_restant) FROM dettes WHERE user_id = p.id), 0) as total_dettes,
    (
        COALESCE((SELECT SUM(solde) FROM comptes WHERE user_id = p.id AND est_actif = true), 0) +
        COALESCE((SELECT SUM(valeur_actuelle) FROM investissements WHERE user_id = p.id), 0) -
        COALESCE((SELECT SUM(capital_restant) FROM dettes WHERE user_id = p.id), 0)
    ) as valeur_nette
FROM profiles p;
```

---

## 3. FONCTIONS ET TRIGGERS

### 3.1 Trigger pour mettre à jour `updated_at`

```sql
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Appliquer à toutes les tables
CREATE TRIGGER set_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON comptes FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON charges_fixes FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON investissements FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON dettes FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON objectifs FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

### 3.2 Trigger pour créer le profil après inscription

```sql
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id, email, prenom)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'prenom', split_part(NEW.email, '@', 1))
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

### 3.3 Trigger pour mettre à jour le solde du compte après transaction

```sql
CREATE OR REPLACE FUNCTION update_compte_solde()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE comptes SET solde = solde + NEW.montant WHERE id = NEW.compte_id;
    ELSIF TG_OP = 'UPDATE' AND OLD.compte_id = NEW.compte_id THEN
        UPDATE comptes SET solde = solde - OLD.montant + NEW.montant WHERE id = NEW.compte_id;
    ELSIF TG_OP = 'UPDATE' AND OLD.compte_id != NEW.compte_id THEN
        UPDATE comptes SET solde = solde - OLD.montant WHERE id = OLD.compte_id;
        UPDATE comptes SET solde = solde + NEW.montant WHERE id = NEW.compte_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE comptes SET solde = solde - OLD.montant WHERE id = OLD.compte_id;
        RETURN OLD;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_solde_on_transaction
    AFTER INSERT OR UPDATE OR DELETE ON transactions
    FOR EACH ROW EXECUTE FUNCTION update_compte_solde();
```

### 3.4 Fonction pour créer les catégories par défaut

```sql
CREATE OR REPLACE FUNCTION create_default_categories(p_user_id UUID)
RETURNS void AS $$
BEGIN
    -- Catégories de dépenses (enveloppes)
    INSERT INTO categories (user_id, nom, type, icone, couleur, budget_mensuel, est_fixe, ordre) VALUES
    (p_user_id, 'Alimentation', 'depense', '🍔', '#ef4444', 400, false, 1),
    (p_user_id, 'Transport', 'depense', '🚇', '#f97316', 100, false, 2),
    (p_user_id, 'Loisirs', 'depense', '🎮', '#3b82f6', 150, false, 3),
    (p_user_id, 'Vêtements', 'depense', '👕', '#ec4899', 100, false, 4),
    (p_user_id, 'Santé', 'depense', '💊', '#10b981', 50, false, 5),
    (p_user_id, 'Autre', 'depense', '📦', '#6b7280', 100, false, 6),
    -- Catégories fixes
    (p_user_id, 'Logement', 'depense', '🏠', '#8b5cf6', 0, true, 10),
    (p_user_id, 'Abonnements', 'depense', '📺', '#06b6d4', 0, true, 11),
    (p_user_id, 'Assurances', 'depense', '🛡️', '#64748b', 0, true, 12),
    -- Catégories de revenus
    (p_user_id, 'Salaire', 'revenu', '💰', '#10b981', 0, false, 1),
    (p_user_id, 'Freelance', 'revenu', '💻', '#06b6d4', 0, false, 2),
    (p_user_id, 'Remboursement', 'revenu', '🔄', '#84cc16', 0, false, 3),
    (p_user_id, 'Aides', 'revenu', '🏛️', '#6366f1', 0, false, 4),
    (p_user_id, 'Autre', 'revenu', '📦', '#6b7280', 0, false, 5);
END;
$$ LANGUAGE plpgsql;
```

### 3.5 Fonction pour snapshot mensuel du patrimoine

```sql
CREATE OR REPLACE FUNCTION create_monthly_snapshot(p_user_id UUID)
RETURNS void AS $$
DECLARE
    v_liquidites DECIMAL(12,2);
    v_investissements DECIMAL(12,2);
    v_dettes DECIMAL(12,2);
BEGIN
    SELECT COALESCE(SUM(solde), 0) INTO v_liquidites
    FROM comptes WHERE user_id = p_user_id AND est_actif = true;

    SELECT COALESCE(SUM(valeur_actuelle), 0) INTO v_investissements
    FROM investissements WHERE user_id = p_user_id;

    SELECT COALESCE(SUM(capital_restant), 0) INTO v_dettes
    FROM dettes WHERE user_id = p_user_id;

    INSERT INTO historique_soldes (user_id, date_snapshot, total_liquidites, total_investissements, total_actifs, total_dettes, valeur_nette)
    VALUES (
        p_user_id,
        DATE_TRUNC('month', CURRENT_DATE),
        v_liquidites,
        v_investissements,
        v_liquidites + v_investissements,
        v_dettes,
        v_liquidites + v_investissements - v_dettes
    )
    ON CONFLICT (user_id, date_snapshot)
    DO UPDATE SET
        total_liquidites = EXCLUDED.total_liquidites,
        total_investissements = EXCLUDED.total_investissements,
        total_actifs = EXCLUDED.total_actifs,
        total_dettes = EXCLUDED.total_dettes,
        valeur_nette = EXCLUDED.valeur_nette;
END;
$$ LANGUAGE plpgsql;
```

---

## 4. POLITIQUES DE SÉCURITÉ (RLS)

### 4.1 Activer RLS sur toutes les tables

```sql
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE comptes ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE charges_fixes ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE investissements ENABLE ROW LEVEL SECURITY;
ALTER TABLE dettes ENABLE ROW LEVEL SECURITY;
ALTER TABLE historique_soldes ENABLE ROW LEVEL SECURITY;
ALTER TABLE objectifs ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets_mensuels ENABLE ROW LEVEL SECURITY;
```

### 4.2 Politiques pour `profiles`

```sql
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);
```

### 4.3 Politiques génériques pour les autres tables

```sql
-- Modèle à appliquer pour chaque table (comptes, categories, etc.)
CREATE POLICY "Users can view own data" ON comptes
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own data" ON comptes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own data" ON comptes
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own data" ON comptes
    FOR DELETE USING (auth.uid() = user_id);

-- Répéter pour: categories, charges_fixes, transactions, investissements, dettes, historique_soldes, objectifs, budgets_mensuels
```

---

## 5. DONNÉES DE SEED (Optionnel pour tests)

```sql
-- À exécuter après création d'un utilisateur de test
DO $$
DECLARE
    test_user_id UUID := 'YOUR-TEST-USER-UUID';
BEGIN
    -- Créer les catégories par défaut
    PERFORM create_default_categories(test_user_id);

    -- Créer des comptes
    INSERT INTO comptes (user_id, nom, banque, type, solde, icone) VALUES
    (test_user_id, 'Compte courant', 'Boursorama', 'courant', 1847.32, '🏦'),
    (test_user_id, 'Livret A', 'Boursorama', 'epargne', 5200.00, '🐷'),
    (test_user_id, 'Cash', 'Espèces', 'cash', 85.00, '💵');

    -- Créer des charges fixes
    INSERT INTO charges_fixes (user_id, nom, montant, jour_prelevement, icone) VALUES
    (test_user_id, 'Loyer', 650, 3, '🏠'),
    (test_user_id, 'Navigo', 86.40, 5, '🚇'),
    (test_user_id, 'Spotify', 5.99, 4, '🎵'),
    (test_user_id, 'Netflix', 13.49, 15, '🎬'),
    (test_user_id, 'Free Mobile', 12.99, 20, '📱'),
    (test_user_id, 'Basic Fit', 29.99, 1, '💪');

    -- Créer des investissements
    INSERT INTO investissements (user_id, nom, ticker, type, quantite, prix_achat_unitaire, prix_actuel) VALUES
    (test_user_id, 'MSCI World', 'IWDA', 'ETF', 10, 94.2, 98.76),
    (test_user_id, 'S&P 500', 'VUAA', 'ETF', 8, 85.2, 91.40),
    (test_user_id, 'Bitcoin', 'BTC', 'Crypto', 0.015, 42000, 44500);

    -- Créer des dettes
    INSERT INTO dettes (user_id, nom, type, preteur, capital_initial, capital_restant, mensualite, jour_prelevement) VALUES
    (test_user_id, 'Prêt étudiant', 'etudiant', 'BNP Paribas', 15000, 12450, 156.25, 5);
END $$;
```

---

## 6. EDGE FUNCTIONS SUGGÉRÉES

### 6.1 Fonction pour transactions récurrentes (CRON)

```typescript
// supabase/functions/process-recurring-transactions/index.ts
// À exécuter quotidiennement pour créer les transactions des charges fixes
```

### 6.2 Fonction pour mise à jour des prix des investissements

```typescript
// supabase/functions/update-investment-prices/index.ts
// À exécuter quotidiennement pour mettre à jour les prix via API externe
```

### 6.3 Fonction pour snapshot mensuel automatique

```typescript
// supabase/functions/monthly-snapshot/index.ts
// À exécuter le 1er de chaque mois
```

---

## 7. STRUCTURE DES TYPES TYPESCRIPT

```typescript
// types/database.ts

export interface Profile {
    id: string;
    prenom: string | null;
    nom: string | null;
    email: string;
    avatar_url: string | null;
    revenus_mensuels: number;
    objectif_epargne: number;
    mode_gestion: 'semaine' | 'mois';
    devise: string;
    created_at: string;
    updated_at: string;
}

export interface Compte {
    id: string;
    user_id: string;
    nom: string;
    banque: string | null;
    type: 'courant' | 'epargne' | 'cash' | 'investissement';
    solde: number;
    couleur: string | null;
    icone: string | null;
    est_actif: boolean;
    ordre: number;
    created_at: string;
    updated_at: string;
}

export interface Categorie {
    id: string;
    user_id: string;
    nom: string;
    type: 'depense' | 'revenu';
    icone: string | null;
    couleur: string | null;
    budget_mensuel: number;
    est_fixe: boolean;
    ordre: number;
    est_actif: boolean;
    created_at: string;
    updated_at: string;
}

export interface ChargeFix {
    id: string;
    user_id: string;
    nom: string;
    montant: number;
    jour_prelevement: number | null;
    frequence: 'hebdo' | 'mensuel' | 'trimestriel' | 'annuel';
    categorie_id: string | null;
    compte_id: string | null;
    icone: string | null;
    couleur: string | null;
    est_actif: boolean;
    date_debut: string | null;
    date_fin: string | null;
    notes: string | null;
    created_at: string;
    updated_at: string;
}

export interface Transaction {
    id: string;
    user_id: string;
    compte_id: string | null;
    categorie_id: string | null;
    charge_fixe_id: string | null;
    type: 'depense' | 'revenu' | 'transfert';
    montant: number;
    description: string | null;
    date_transaction: string;
    est_recurrent: boolean;
    notes: string | null;
    tags: string[] | null;
    created_at: string;
    updated_at: string;
}

export interface Investissement {
    id: string;
    user_id: string;
    nom: string;
    ticker: string | null;
    type: 'ETF' | 'Actions' | 'Crypto' | 'Obligations' | 'Immobilier' | 'Assurance-vie' | 'PEA' | 'Autre';
    plateforme: string | null;
    quantite: number | null;
    prix_achat_unitaire: number | null;
    prix_actuel: number | null;
    valeur_actuelle: number;
    plus_value: number;
    devise: string;
    date_achat: string | null;
    notes: string | null;
    image_url: string | null;
    created_at: string;
    updated_at: string;
}

export interface Dette {
    id: string;
    user_id: string;
    nom: string;
    type: 'etudiant' | 'immobilier' | 'conso' | 'auto' | 'personnel' | 'autre';
    preteur: string | null;
    capital_initial: number;
    capital_restant: number;
    taux_interet: number | null;
    mensualite: number;
    jour_prelevement: number | null;
    compte_id: string | null;
    date_debut: string | null;
    date_fin: string | null;
    nombre_echeances_restantes: number | null;
    notes: string | null;
    image_url: string | null;
    created_at: string;
    updated_at: string;
}

export interface HistoriqueSolde {
    id: string;
    user_id: string;
    date_snapshot: string;
    total_liquidites: number;
    total_investissements: number;
    total_actifs: number;
    total_dettes: number;
    valeur_nette: number;
    created_at: string;
}

export interface Objectif {
    id: string;
    user_id: string;
    nom: string;
    montant_cible: number;
    montant_actuel: number;
    compte_id: string | null;
    icone: string | null;
    couleur: string | null;
    date_cible: string | null;
    est_atteint: boolean;
    priorite: number;
    notes: string | null;
    created_at: string;
    updated_at: string;
}
```

---

## 8. REQUÊTES COURANTES (pour référence)

### 8.1 Obtenir le résumé du mois en cours

```sql
SELECT
    SUM(CASE WHEN type = 'revenu' THEN montant ELSE 0 END) as revenus,
    SUM(CASE WHEN type = 'depense' THEN ABS(montant) ELSE 0 END) as depenses
FROM transactions
WHERE user_id = $1
AND date_transaction >= DATE_TRUNC('month', CURRENT_DATE)
AND date_transaction < DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month';
```

### 8.2 Obtenir les dépenses par enveloppe du mois

```sql
SELECT
    c.id, c.nom, c.icone, c.couleur, c.budget_mensuel,
    COALESCE(SUM(ABS(t.montant)), 0) as depense,
    c.budget_mensuel - COALESCE(SUM(ABS(t.montant)), 0) as reste
FROM categories c
LEFT JOIN transactions t ON t.categorie_id = c.id
    AND t.date_transaction >= DATE_TRUNC('month', CURRENT_DATE)
    AND t.date_transaction < DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month'
WHERE c.user_id = $1 AND c.type = 'depense' AND c.est_fixe = false
GROUP BY c.id
ORDER BY c.ordre;
```

### 8.3 Obtenir les transactions de la semaine

```sql
SELECT t.*, c.nom as categorie_nom, c.icone, co.nom as compte_nom
FROM transactions t
LEFT JOIN categories c ON c.id = t.categorie_id
LEFT JOIN comptes co ON co.id = t.compte_id
WHERE t.user_id = $1
AND t.date_transaction >= DATE_TRUNC('week', CURRENT_DATE)
ORDER BY t.date_transaction DESC;
```

### 8.4 Calculer le patrimoine total

```sql
SELECT
    (SELECT COALESCE(SUM(solde), 0) FROM comptes WHERE user_id = $1 AND est_actif = true) as liquidites,
    (SELECT COALESCE(SUM(valeur_actuelle), 0) FROM investissements WHERE user_id = $1) as investissements,
    (SELECT COALESCE(SUM(capital_restant), 0) FROM dettes WHERE user_id = $1) as dettes;
```

---

## 9. DIAGRAMME DES RELATIONS

```
profiles
    ├── comptes (1:N)
    ├── categories (1:N)
    ├── charges_fixes (1:N)
    │       └── categories (N:1)
    │       └── comptes (N:1)
    ├── transactions (1:N)
    │       └── comptes (N:1)
    │       └── categories (N:1)
    │       └── charges_fixes (N:1)
    ├── investissements (1:N)
    ├── dettes (1:N)
    │       └── comptes (N:1)
    ├── historique_soldes (1:N)
    ├── objectifs (1:N)
    │       └── comptes (N:1)
    └── budgets_mensuels (1:N)
```

---

## 10. CHECKLIST D'IMPLÉMENTATION

- [ ] Créer le projet Supabase
- [ ] Exécuter les CREATE TABLE dans l'ordre
- [ ] Créer les INDEX
- [ ] Créer les VIEWS
- [ ] Créer les FUNCTIONS et TRIGGERS
- [ ] Activer RLS et créer les POLICIES
- [ ] Générer les types TypeScript avec `supabase gen types`
- [ ] Configurer l'authentification (Email + OAuth optionnel)
- [ ] Créer les Edge Functions pour les tâches CRON
- [ ] Tester les RLS policies
- [ ] Seed les données de test

---

**Ce schéma est conçu pour une application de finance personnelle complète avec :**
- Gestion multi-comptes
- Système d'enveloppes budgétaires
- Suivi des charges fixes récurrentes
- Suivi du patrimoine (investissements + dettes)
- Historique pour graphiques d'évolution
- Objectifs d'épargne
- Sécurité RLS complète
