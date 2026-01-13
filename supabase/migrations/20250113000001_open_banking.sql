-- Migration: Open Banking Support
-- Description: Create tables for bank connections and synchronized accounts

-- ============================================
-- Table: bank_connections
-- Stores OAuth connections to banking providers (GoCardless/Bridge)
-- ============================================
CREATE TABLE IF NOT EXISTS bank_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Provider info
  provider text NOT NULL CHECK (provider IN ('gocardless', 'bridge')),
  provider_user_id text,

  -- Institution info
  institution_id text,
  institution_name text,
  institution_logo text,

  -- Connection status
  requisition_id text, -- GoCardless requisition ID
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'expired', 'error')),
  error_message text,

  -- Timestamps
  expires_at timestamptz,
  last_sync_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================
-- Table: bank_accounts
-- Stores synchronized bank accounts from providers
-- ============================================
CREATE TABLE IF NOT EXISTS bank_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  connection_id uuid REFERENCES bank_connections(id) ON DELETE CASCADE,

  -- External identifiers
  external_id text NOT NULL,

  -- Account info
  name text,
  iban text,
  balance numeric DEFAULT 0,
  currency text DEFAULT 'EUR',
  account_type text, -- checking, savings, credit_card, etc.

  -- Settings
  is_included_in_budget boolean DEFAULT true,

  -- Sync status
  last_sync_at timestamptz,

  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  -- Ensure unique external_id per connection
  UNIQUE(connection_id, external_id)
);

-- ============================================
-- Indexes for performance
-- ============================================
CREATE INDEX idx_bank_connections_user ON bank_connections(user_id);
CREATE INDEX idx_bank_connections_status ON bank_connections(status);
CREATE INDEX idx_bank_accounts_user ON bank_accounts(user_id);
CREATE INDEX idx_bank_accounts_connection ON bank_accounts(connection_id);

-- ============================================
-- Trigger: Update updated_at on bank_connections
-- ============================================
CREATE OR REPLACE FUNCTION update_bank_connections_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_bank_connections_updated_at
  BEFORE UPDATE ON bank_connections
  FOR EACH ROW
  EXECUTE FUNCTION update_bank_connections_updated_at();

-- ============================================
-- Trigger: Update updated_at on bank_accounts
-- ============================================
CREATE OR REPLACE FUNCTION update_bank_accounts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_bank_accounts_updated_at
  BEFORE UPDATE ON bank_accounts
  FOR EACH ROW
  EXECUTE FUNCTION update_bank_accounts_updated_at();

-- ============================================
-- Comments for documentation
-- ============================================
COMMENT ON TABLE bank_connections IS 'OAuth connections to banking providers (GoCardless/Bridge)';
COMMENT ON TABLE bank_accounts IS 'Synchronized bank accounts from open banking providers';
COMMENT ON COLUMN bank_connections.requisition_id IS 'GoCardless requisition ID for the OAuth flow';
COMMENT ON COLUMN bank_accounts.is_included_in_budget IS 'Whether this account should be included in budget calculations';
