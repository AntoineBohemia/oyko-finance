/**
 * Types pour l'Open Banking
 *
 * Ces types sont utilisés en attendant que les migrations soient appliquées
 * et que les types soient régénérés via `supabase gen types typescript`.
 *
 * Une fois les migrations appliquées, régénérer les types et supprimer ce fichier.
 */

// ============================================
// Bank Connections
// ============================================

export type BankConnectionProvider = 'gocardless' | 'bridge';
export type BankConnectionStatus = 'pending' | 'active' | 'expired' | 'error';

export interface BankConnection {
  id: string;
  user_id: string;
  provider: BankConnectionProvider;
  provider_user_id: string | null;
  institution_id: string | null;
  institution_name: string | null;
  institution_logo: string | null;
  requisition_id: string | null;
  status: BankConnectionStatus;
  error_message: string | null;
  expires_at: string | null;
  last_sync_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface BankConnectionInsert {
  id?: string;
  user_id: string;
  provider: BankConnectionProvider;
  provider_user_id?: string | null;
  institution_id?: string | null;
  institution_name?: string | null;
  institution_logo?: string | null;
  requisition_id?: string | null;
  status?: BankConnectionStatus;
  error_message?: string | null;
  expires_at?: string | null;
  last_sync_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface BankConnectionUpdate {
  provider?: BankConnectionProvider;
  provider_user_id?: string | null;
  institution_id?: string | null;
  institution_name?: string | null;
  institution_logo?: string | null;
  requisition_id?: string | null;
  status?: BankConnectionStatus;
  error_message?: string | null;
  expires_at?: string | null;
  last_sync_at?: string | null;
  updated_at?: string;
}

// ============================================
// Bank Accounts
// ============================================

export interface BankAccount {
  id: string;
  user_id: string;
  connection_id: string | null;
  external_id: string;
  name: string | null;
  iban: string | null;
  balance: number;
  currency: string;
  account_type: string | null;
  is_included_in_budget: boolean;
  last_sync_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface BankAccountInsert {
  id?: string;
  user_id: string;
  connection_id?: string | null;
  external_id: string;
  name?: string | null;
  iban?: string | null;
  balance?: number;
  currency?: string;
  account_type?: string | null;
  is_included_in_budget?: boolean;
  last_sync_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface BankAccountUpdate {
  connection_id?: string | null;
  external_id?: string;
  name?: string | null;
  iban?: string | null;
  balance?: number;
  currency?: string;
  account_type?: string | null;
  is_included_in_budget?: boolean;
  last_sync_at?: string | null;
  updated_at?: string;
}

// ============================================
// Transaction Extensions (nouvelles colonnes)
// ============================================

export type TransactionSource = 'manual' | 'sync' | 'csv';

export interface TransactionSyncFields {
  external_id: string | null;
  raw_description: string | null;
  source: TransactionSource;
  is_reviewed: boolean;
  bank_account_id: string | null;
  merchant_name: string | null;
  provider_category: string | null;
}

// ============================================
// Charges Fixes Extensions (nouvelles colonnes)
// ============================================

export interface ChargesFixesMatchingFields {
  match_patterns: string[] | null;
  last_matched_at: string | null;
  last_matched_transaction_id: string | null;
}

// ============================================
// Profile Extensions (nouvelles colonnes)
// ============================================

export interface ProfileSalaryFields {
  salaire_attendu: number | null;
  salaire_patterns: string[] | null;
  salaire_recu_ce_mois: boolean;
  premier_jour_semaine: number; // 0-6, 0=Dimanche, 1=Lundi (défaut)
}

// ============================================
// Types combinés pour faciliter l'utilisation
// ============================================

import type { Transaction, ChargeFix, Profile } from './database.types';

export type TransactionWithSync = Transaction & TransactionSyncFields;
export type ChargeFixWithMatching = ChargeFix & ChargesFixesMatchingFields;
export type ProfileWithSalary = Profile & ProfileSalaryFields;

// ============================================
// Types utilitaires pour l'UI
// ============================================

export interface SyncStatus {
  lastSyncAt: Date | null;
  isLoading: boolean;
  error: string | null;
  transactionsCount: number;
  unreviewedCount: number;
}

export interface BankConnectionWithAccounts extends BankConnection {
  accounts: BankAccount[];
}

export interface UnreviewedTransaction extends TransactionWithSync {
  suggestedCategory: string | null;
  confidence: number; // 0-1
}
