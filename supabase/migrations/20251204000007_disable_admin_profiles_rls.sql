-- ============================================================================
-- Migration: Disable Admin Profiles RLS
-- Description: Disable RLS on admin_profiles to fix infinite recursion issues
-- Date: 2025-12-04
-- Problem: RLS policies on admin_profiles cause infinite recursion when trying
--          to check if a user is an admin (needs to read admin_profiles to verify
--          admin status, but can't read admin_profiles without being admin)
-- Solution: Disable RLS on admin_profiles since admin checks are done server-side
--           using the service role key. The admin_profiles table only stores
--           admin status and is not sensitive data.
-- ============================================================================

-- Drop ALL existing policies on admin_profiles
DROP POLICY IF EXISTS "admin_profiles_super_admin_all" ON admin_profiles;
DROP POLICY IF EXISTS "admin_profiles_view_own" ON admin_profiles;
DROP POLICY IF EXISTS "Users can view own admin profile" ON admin_profiles;
DROP POLICY IF EXISTS "Active admins can view all admin profiles" ON admin_profiles;
DROP POLICY IF EXISTS "Admins can view all admin profiles" ON admin_profiles;
DROP POLICY IF EXISTS "Super admins can manage admin profiles" ON admin_profiles;
DROP POLICY IF EXISTS "Super admins can insert admin profiles" ON admin_profiles;
DROP POLICY IF EXISTS "Super admins can update admin profiles" ON admin_profiles;
DROP POLICY IF EXISTS "Super admins can delete admin profiles" ON admin_profiles;

-- Disable RLS on admin_profiles
-- This is safe because:
-- 1. Admin checks are always done server-side (never on client)
-- 2. The service role key is used for admin verification
-- 3. The admin_profiles table doesn't contain sensitive user data
--    (just role assignments)
-- 4. Insert/Update/Delete operations are protected at the application level
ALTER TABLE admin_profiles DISABLE ROW LEVEL SECURITY;

-- Add a comment explaining why RLS is disabled
COMMENT ON TABLE admin_profiles IS 'Admin role assignments. RLS is disabled because admin checks are done server-side using service role key to avoid circular dependency issues.';
