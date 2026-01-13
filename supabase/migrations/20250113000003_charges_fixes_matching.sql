-- Migration: Charges Fixes Auto-Matching
-- Description: Add columns for automatic matching of recurring charges with transactions

-- ============================================
-- Add matching columns to charges_fixes
-- ============================================
ALTER TABLE charges_fixes
ADD COLUMN IF NOT EXISTS match_patterns text[], -- Array of patterns to match against transaction descriptions
ADD COLUMN IF NOT EXISTS last_matched_at timestamptz,
ADD COLUMN IF NOT EXISTS last_matched_transaction_id uuid REFERENCES transactions(id) ON DELETE SET NULL;

-- ============================================
-- Indexes
-- ============================================

-- Index for active charges (common filter)
CREATE INDEX IF NOT EXISTS idx_charges_fixes_user_active
ON charges_fixes(user_id)
WHERE est_actif = true;

-- Index for matching (need to search by user and check patterns)
CREATE INDEX IF NOT EXISTS idx_charges_fixes_matching
ON charges_fixes(user_id, jour_prelevement)
WHERE est_actif = true AND match_patterns IS NOT NULL;

-- ============================================
-- Comments for documentation
-- ============================================
COMMENT ON COLUMN charges_fixes.match_patterns IS 'Array of text patterns to match against transaction descriptions (case-insensitive)';
COMMENT ON COLUMN charges_fixes.last_matched_at IS 'When this charge was last matched to a transaction';
COMMENT ON COLUMN charges_fixes.last_matched_transaction_id IS 'The last transaction that was matched to this charge';
