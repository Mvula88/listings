-- Migration: Add soft delete columns to profiles table
-- Description: Support proper soft delete with restore capability
-- Date: 2025-12-04

-- Add columns for soft delete functionality
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS original_name TEXT;

-- Create index for filtering deleted users
CREATE INDEX IF NOT EXISTS idx_profiles_is_deleted ON profiles(is_deleted);

-- Add comment for documentation
COMMENT ON COLUMN profiles.is_deleted IS 'Whether the user has been soft deleted';
COMMENT ON COLUMN profiles.deleted_at IS 'When the user was deleted';
COMMENT ON COLUMN profiles.deleted_by IS 'Admin who deleted the user';
COMMENT ON COLUMN profiles.original_name IS 'Original name stored for potential restore';
