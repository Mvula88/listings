-- ============================================================================
-- ADD USER ROLES FIELD
-- ============================================================================
-- This migration adds a 'roles' array field to allow users to have multiple roles
-- (e.g., a user can be both a buyer AND a seller)
-- The existing 'user_type' field remains as the "active" role

-- Add roles array column to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS roles TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Migrate existing user_type to roles array
UPDATE profiles
SET roles = ARRAY[user_type]::TEXT[]
WHERE user_type IS NOT NULL
  AND (roles IS NULL OR roles = ARRAY[]::TEXT[]);

-- Create index for roles lookup
CREATE INDEX IF NOT EXISTS idx_profiles_roles ON profiles USING GIN (roles);

-- Comment for documentation
COMMENT ON COLUMN profiles.roles IS 'Array of user roles. A user can have multiple roles: buyer, seller, lawyer. The user_type field indicates the currently active role.';
