// Types applicatifs pour l'API Oyko
// Derives des reponses du backend Spring Boot

// ============================================
// AUTH
// ============================================

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  prenom: string;
  nom: string;
}

export interface RefreshRequest {
  refreshToken: string;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  user: MeResponse;
}

export interface MeResponse {
  id: string;
  email: string;
  prenom: string | null;
  nom: string | null;
  revenus_mensuels: number | null;
  objectif_epargne: number | null;
  mode_gestion: string | null;
  avatar_url: string | null;
  created_at: string | null;
  updated_at: string | null;
  salaire_attendu: number | null;
  salaire_patterns: string[] | null;
  salaire_recu_ce_mois: boolean | null;
  premier_jour_semaine: number | null;
}

export interface MessageResponse {
  message: string;
}

// ============================================
// PROFILE
// ============================================

export interface UpdateProfileRequest {
  prenom?: string;
  nom?: string;
  revenus_mensuels?: number;
  objectif_epargne?: number;
  mode_gestion?: string;
}

export interface ResetDataRequest {
  confirm: boolean;
}

export type ProfileResponse = MeResponse;

// Alias pour compatibilite avec le code existant
export type Profile = MeResponse;

// ============================================
// ACCOUNTS
// ============================================

export interface CreateAccountRequest {
  nom: string;
  type: string;
  solde: number;
  banque?: string;
}

export interface UpdateAccountRequest {
  nom?: string;
  type?: string;
  solde?: number;
  banque?: string;
}

export interface AccountResponse {
  id: string;
  nom: string;
  type: string;
  solde: number | null;
  banque: string | null;
  icone: string | null;
  couleur: string | null;
  est_actif: boolean | null;
  ordre: number | null;
  created_at: string | null;
  updated_at: string | null;
}

// Alias pour compatibilite
export type Compte = AccountResponse;

// ============================================
// CATEGORIES
// ============================================

export interface CreateCategoryRequest {
  nom: string;
  type: string;
  icone?: string;
  couleur?: string;
  budget_mensuel?: number;
}

export interface UpdateCategoryRequest {
  nom?: string;
  type?: string;
  icone?: string;
  couleur?: string;
  budget_mensuel?: number;
}

export interface CategoryResponse {
  id: string;
  nom: string;
  type: string;
  icone: string | null;
  couleur: string | null;
  budget_mensuel: number | null;
  est_actif: boolean | null;
  ordre: number | null;
  created_at: string | null;
  updated_at: string | null;
}

// ============================================
// TRANSACTIONS
// ============================================

export interface CreateTransactionRequest {
  montant: number;
  categorie_id?: string;
  compte_id?: string;
  description?: string;
  type: string;
  date_transaction: string;
  notes?: string;
}

export interface UpdateTransactionRequest {
  montant?: number;
  categorie_id?: string;
  compte_id?: string;
  description?: string;
  type?: string;
  date_transaction?: string;
  notes?: string;
}

export interface ImportTransactionsRequest {
  transactions: CreateTransactionRequest[];
}

export interface BulkDeleteRequest {
  ids: string[];
}

export interface TransactionResponse {
  id: string;
  montant: number;
  description: string | null;
  type: string;
  date_transaction: string;
  categorie_id: string | null;
  compte_id: string | null;
  notes: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface TransactionListResponse {
  transactions: TransactionResponse[];
  total: number;
}

export interface ImportResponse {
  imported: number;
  errors: string[];
}

// ============================================
// RECURRING CHARGES
// ============================================

export interface CreateRecurringChargeRequest {
  nom: string;
  montant: number;
  frequence: string;
  jour_prelevement?: number;
  categorie_id?: string;
  compte_id?: string;
  notes?: string;
}

export interface UpdateRecurringChargeRequest {
  nom?: string;
  montant?: number;
  frequence?: string;
  jour_prelevement?: number;
  categorie_id?: string;
  compte_id?: string;
  est_actif?: boolean;
  notes?: string;
}

export interface RecurringChargeResponse {
  id: string;
  nom: string;
  montant: number;
  frequence: string | null;
  jour_prelevement: number | null;
  categorie_id: string | null;
  compte_id: string | null;
  est_actif: boolean | null;
  date_debut: string | null;
  date_fin: string | null;
  notes: string | null;
  icone: string | null;
  couleur: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface RecurringChargeListResponse {
  chargesFixes: RecurringChargeResponse[];
  total: number;
}

// ============================================
// BUDGET
// ============================================

export interface BudgetResponse {
  profile: Profile | null;
  revenusMois: number;
  enveloppes: {
    id: string;
    nom: string;
    icone: string;
    couleur: string;
    budgetMensuel: number;
  }[];
  chargesFixes: {
    id: string;
    nom: string;
    icone: string;
    montant: number;
    jourPrelevement: number;
    estPreleve: boolean;
  }[];
  transactions: {
    id: string;
    description: string;
    montant: number;
    date: string;
    categorieId: string;
    type: string;
  }[];
  totalChargesFixes: number;
}

// ============================================
// DASHBOARD
// ============================================

export interface DashboardResponse {
  profile: Profile | null;
  comptes: Compte[];
  categories: {
    id: string;
    nom: string;
    icone: string;
    couleur: string;
    budgetMensuel: number;
  }[];
  chargesFixes: {
    id: string;
    nom: string;
    montant: number;
    icone: string;
    dateProchain: string;
  }[];
  transactions: {
    id: string;
    description: string;
    montant: number;
    date: string;
    categorieId: string;
    type: string;
  }[];
  patrimoine: {
    valeurNette: number;
    totalLiquidites: number;
    totalInvestissements: number;
    totalDettes: number;
    variationMois: number;
    repartition: { name: string; value: number; className: string }[];
  };
}

// ============================================
// INVESTMENTS
// ============================================

export interface CreateInvestmentRequest {
  nom: string;
  type: string;
  prix_actuel?: number;
  ticker?: string;
  plateforme?: string;
  quantite?: number;
  prix_achat_unitaire?: number;
  date_achat?: string;
  notes?: string;
}

export interface UpdateInvestmentRequest {
  nom?: string;
  type?: string;
  prix_actuel?: number;
  ticker?: string;
  plateforme?: string;
  quantite?: number;
  prix_achat_unitaire?: number;
  notes?: string;
}

export interface InvestmentResponse {
  id: string;
  nom: string;
  ticker: string | null;
  type: string;
  plateforme: string | null;
  quantite: number | null;
  prix_achat_unitaire: number | null;
  prix_actuel: number | null;
  valeur_actuelle: number | null;
  plus_value: number | null;
  date_achat: string | null;
  image_url: string | null;
  notes: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface InvestmentListResponse {
  investissements: InvestmentResponse[];
  total: number;
}

// ============================================
// LIABILITIES
// ============================================

export interface CreateLiabilityRequest {
  nom: string;
  type: string;
  capitalInitial: number;
  capitalRestant: number;
  preteur?: string;
  tauxInteret?: number;
  mensualite?: number;
  jourPrelevement?: number;
  notes?: string;
}

export interface UpdateLiabilityRequest {
  nom?: string;
  type?: string;
  capitalRestant?: number;
  mensualite?: number;
  notes?: string;
}

export interface LiabilityResponse {
  id: string;
  nom: string;
  type: string;
  capital_initial: number;
  capital_restant: number;
  taux_interet: number | null;
  mensualite: number;
  jour_prelevement: number | null;
  date_debut: string | null;
  date_fin: string | null;
  preteur: string | null;
  image_url: string | null;
  notes: string | null;
  compte_id: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface LiabilityListResponse {
  dettes: LiabilityResponse[];
  total: number;
}

// ============================================
// BANK
// ============================================

export interface ConnectRequest {
  institutionId?: string;
}

export interface ConnectResponse {
  connect_url: string;
}

export interface SyncResponse {
  synced: number;
  accounts: number;
}
