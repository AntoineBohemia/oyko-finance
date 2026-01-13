-- Migration: Profiles Settings
-- Description: Add settings for salary detection and week preferences

-- ============================================
-- Add settings columns to profiles
-- ============================================
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS salaire_attendu numeric,
ADD COLUMN IF NOT EXISTS salaire_patterns text[],
ADD COLUMN IF NOT EXISTS salaire_recu_ce_mois boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS premier_jour_semaine integer DEFAULT 1 CHECK (premier_jour_semaine BETWEEN 0 AND 6);

-- ============================================
-- Comments for documentation
-- ============================================
COMMENT ON COLUMN profiles.salaire_attendu IS 'Expected monthly salary amount for automatic detection';
COMMENT ON COLUMN profiles.salaire_patterns IS 'Array of text patterns to identify salary transactions';
COMMENT ON COLUMN profiles.salaire_recu_ce_mois IS 'Flag indicating if salary was received this month (reset monthly)';
COMMENT ON COLUMN profiles.premier_jour_semaine IS 'First day of week: 0=Sunday, 1=Monday (default), ..., 6=Saturday';
