-- ============================================================================
-- Migration: Fix Admin Profiles RLS v2
-- Description: Fix circular dependency in RLS policies
-- Date: 2025-12-04
-- Problem: Previous policies had circular dependency - needed to be admin to
--          check if you're admin
-- ============================================================================

-- Drop ALL existing policies on admin_profiles
DROP POLICY IF EXISTS "admin_profiles_super_admin_all" ON admin_profiles;
DROP POLICY IF EXISTS "admin_profiles_view_own" ON admin_profiles;
DROP POLICY IF EXISTS "Users can view own admin profile" ON admin_profiles;
DROP POLICY IF EXISTS "Active admins can view all admin profiles" ON admin_profiles;
DROP POLICY IF EXISTS "Super admins can manage admin profiles" ON admin_profiles;

-- Ensure RLS is enabled
ALTER TABLE admin_profiles ENABLE ROW LEVEL SECURITY;

-- POLICY 1: Users can ALWAYS view their own admin profile
-- This is critical - allows initial admin check without circular dependency
CREATE POLICY "Users can view own admin profile" ON admin_profiles
  FOR SELECT
  USING (id = auth.uid());

-- POLICY 2: Active admins can view ALL admin profiles (for moderators page)
-- Uses a direct check that won't cause circular issues
CREATE POLICY "Admins can view all admin profiles" ON admin_profiles
  FOR SELECT
  USING (
    -- Check if current user has an active admin profile
    -- This works because policy 1 already allows reading own record
    (SELECT is_active FROM admin_profiles WHERE id = auth.uid()) = TRUE
  );

-- POLICY 3: Super admins can INSERT new admin profiles
CREATE POLICY "Super admins can insert admin profiles" ON admin_profiles
  FOR INSERT
  WITH CHECK (
    (SELECT role FROM admin_profiles WHERE id = auth.uid()) = 'super_admin'
    AND (SELECT is_active FROM admin_profiles WHERE id = auth.uid()) = TRUE
  );

-- POLICY 4: Super admins can UPDATE admin profiles
CREATE POLICY "Super admins can update admin profiles" ON admin_profiles
  FOR UPDATE
  USING (
    (SELECT role FROM admin_profiles WHERE id = auth.uid()) = 'super_admin'
    AND (SELECT is_active FROM admin_profiles WHERE id = auth.uid()) = TRUE
  );

-- POLICY 5: Super admins can DELETE admin profiles (except themselves)
CREATE POLICY "Super admins can delete admin profiles" ON admin_profiles
  FOR DELETE
  USING (
    (SELECT role FROM admin_profiles WHERE id = auth.uid()) = 'super_admin'
    AND (SELECT is_active FROM admin_profiles WHERE id = auth.uid()) = TRUE
    AND id != auth.uid()  -- Can't delete yourself
  );
