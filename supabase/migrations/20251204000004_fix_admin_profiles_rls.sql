-- ============================================================================
-- Migration: Fix Admin Profiles RLS
-- Description: Fix RLS policies so admins can view all admin staff
-- Date: 2025-12-04
-- ============================================================================

-- Drop ALL existing policies on admin_profiles
DROP POLICY IF EXISTS "admin_profiles_super_admin_all" ON admin_profiles;
DROP POLICY IF EXISTS "admin_profiles_view_own" ON admin_profiles;
DROP POLICY IF EXISTS "Users can view own admin profile" ON admin_profiles;
DROP POLICY IF EXISTS "Active admins can view all admin profiles" ON admin_profiles;
DROP POLICY IF EXISTS "Super admins can manage admin profiles" ON admin_profiles;

-- Create new policy: Allow any active admin to view all admin profiles
-- This enables the moderators page to show all admin staff
CREATE POLICY "Active admins can view all admin profiles" ON admin_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admin_profiles ap
      WHERE ap.id = auth.uid()
      AND ap.is_active = TRUE
    )
  );

-- Super admins can manage all admin profiles (insert, update, delete)
CREATE POLICY "Super admins can manage admin profiles" ON admin_profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_profiles ap
      WHERE ap.id = auth.uid()
      AND ap.role = 'super_admin'
      AND ap.is_active = TRUE
    )
  );

-- Users can view their own admin profile (for their own dashboard)
CREATE POLICY "Users can view own admin profile" ON admin_profiles
  FOR SELECT USING (id = auth.uid());

-- Allow service role to insert new admin profiles (for invitation acceptance)
-- This is handled by the accept_moderator_invitation function with SECURITY DEFINER
