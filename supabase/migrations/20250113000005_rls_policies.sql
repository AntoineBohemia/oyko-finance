-- Migration: RLS Policies for Open Banking
-- Description: Row Level Security policies for bank_connections and bank_accounts

-- ============================================
-- bank_connections RLS
-- ============================================
ALTER TABLE bank_connections ENABLE ROW LEVEL SECURITY;

-- SELECT: Users can only view their own connections
CREATE POLICY "Users can view own connections"
ON bank_connections
FOR SELECT
USING (auth.uid() = user_id);

-- INSERT: Users can only create connections for themselves
CREATE POLICY "Users can insert own connections"
ON bank_connections
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- UPDATE: Users can only update their own connections
CREATE POLICY "Users can update own connections"
ON bank_connections
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- DELETE: Users can only delete their own connections
CREATE POLICY "Users can delete own connections"
ON bank_connections
FOR DELETE
USING (auth.uid() = user_id);

-- ============================================
-- bank_accounts RLS
-- ============================================
ALTER TABLE bank_accounts ENABLE ROW LEVEL SECURITY;

-- SELECT: Users can only view their own bank accounts
CREATE POLICY "Users can view own bank accounts"
ON bank_accounts
FOR SELECT
USING (auth.uid() = user_id);

-- INSERT: Users can only create bank accounts for themselves
CREATE POLICY "Users can insert own bank accounts"
ON bank_accounts
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- UPDATE: Users can only update their own bank accounts
CREATE POLICY "Users can update own bank accounts"
ON bank_accounts
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- DELETE: Users can only delete their own bank accounts
CREATE POLICY "Users can delete own bank accounts"
ON bank_accounts
FOR DELETE
USING (auth.uid() = user_id);

-- ============================================
-- Service role bypass (for Edge Functions)
-- ============================================
-- Note: The service role automatically bypasses RLS
-- Edge Functions using service_role key can perform all operations
