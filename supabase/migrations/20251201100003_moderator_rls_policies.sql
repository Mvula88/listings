-- Add RLS policies for moderators to perform moderation actions

-- Allow moderators to update properties for moderation purposes
DROP POLICY IF EXISTS "Moderators can update property moderation" ON properties;

CREATE POLICY "Moderators can update property moderation" ON properties
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM admin_profiles
      WHERE admin_profiles.id = auth.uid()
      AND admin_profiles.role IN ('super_admin', 'admin', 'moderator')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_profiles
      WHERE admin_profiles.id = auth.uid()
      AND admin_profiles.role IN ('super_admin', 'admin', 'moderator')
    )
  );

-- Allow moderators to read all properties (for moderation)
DROP POLICY IF EXISTS "Moderators can view all properties" ON properties;

CREATE POLICY "Moderators can view all properties" ON properties
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_profiles
      WHERE admin_profiles.id = auth.uid()
      AND admin_profiles.role IN ('super_admin', 'admin', 'moderator')
    )
  );

-- Allow moderators to update their own admin_profiles (for last_active)
DROP POLICY IF EXISTS "Moderators can update own profile" ON admin_profiles;

CREATE POLICY "Moderators can update own profile" ON admin_profiles
  FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());
