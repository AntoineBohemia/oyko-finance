-- Migration: Transactions Sync Support
-- Description: Add columns to transactions table for open banking sync

-- ============================================
-- Add sync columns to transactions
-- ============================================
ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS external_id text,
ADD COLUMN IF NOT EXISTS raw_description text,
ADD COLUMN IF NOT EXISTS source text DEFAULT 'manual' CHECK (source IN ('manual', 'sync', 'csv')),
ADD COLUMN IF NOT EXISTS is_reviewed boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS bank_account_id uuid REFERENCES bank_accounts(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS merchant_name text,
ADD COLUMN IF NOT EXISTS provider_category text;

-- ============================================
-- Indexes
-- ============================================

-- Unique index for deduplication of synced transactions
-- Only applies when external_id is not null
CREATE UNIQUE INDEX IF NOT EXISTS idx_transactions_external
ON transactions(bank_account_id, external_id)
WHERE external_id IS NOT NULL;

-- Index for filtering unreviewed transactions (common query)
CREATE INDEX IF NOT EXISTS idx_transactions_unreviewed
ON transactions(user_id, is_reviewed)
WHERE is_reviewed = false;

-- Index for source filtering
CREATE INDEX IF NOT EXISTS idx_transactions_source
ON transactions(user_id, source);

-- Index for bank account filtering
CREATE INDEX IF NOT EXISTS idx_transactions_bank_account
ON transactions(bank_account_id)
WHERE bank_account_id IS NOT NULL;

-- ============================================
-- Comments for documentation
-- ============================================
COMMENT ON COLUMN transactions.external_id IS 'Unique transaction ID from the banking provider';
COMMENT ON COLUMN transactions.raw_description IS 'Original transaction description from the bank';
COMMENT ON COLUMN transactions.source IS 'How the transaction was created: manual, sync (open banking), or csv import';
COMMENT ON COLUMN transactions.is_reviewed IS 'Whether the user has reviewed/validated this transaction';
COMMENT ON COLUMN transactions.bank_account_id IS 'Link to the synchronized bank account';
COMMENT ON COLUMN transactions.merchant_name IS 'Cleaned merchant name extracted from description';
COMMENT ON COLUMN transactions.provider_category IS 'Category suggested by the banking provider';
