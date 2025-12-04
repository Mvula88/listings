-- ============================================================================
-- Migration: Platform Settings Admin RLS
-- Description: Allow active admins to update platform settings
-- Date: 2025-12-04
-- ============================================================================

-- Drop existing restrictive policy that only allows super_admin
DROP POLICY IF EXISTS "Super admins can manage settings" ON platform_settings;

-- Create new policy that allows all active admins to manage settings
-- Admins with settings.edit permission OR super_admin role can update
CREATE POLICY "Admins can manage settings" ON platform_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_profiles
      WHERE admin_profiles.id = auth.uid()
      AND admin_profiles.is_active = true
      AND (
        admin_profiles.role = 'super_admin' OR
        'settings.edit' = ANY(admin_profiles.permissions)
      )
    )
  );

-- Also ensure admins can INSERT new settings if needed
CREATE POLICY "Admins can insert settings" ON platform_settings
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_profiles
      WHERE admin_profiles.id = auth.uid()
      AND admin_profiles.is_active = true
      AND (
        admin_profiles.role = 'super_admin' OR
        'settings.edit' = ANY(admin_profiles.permissions)
      )
    )
  );
