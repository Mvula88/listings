-- REVERT ALL RLS CHANGES - Drop all policies I created and restore original state

-- Drop all policies I created
DROP POLICY IF EXISTS "Admins can view all admin_profiles" ON admin_profiles;
DROP POLICY IF EXISTS "Admins can view all property reviews" ON property_reviews;
DROP POLICY IF EXISTS "Moderators can update property moderation" ON properties;
DROP POLICY IF EXISTS "Moderators can view all properties" ON properties;
DROP POLICY IF EXISTS "Moderators can update own profile" ON admin_profiles;
DROP POLICY IF EXISTS "Users can accept moderator invitations" ON admin_profiles;
DROP POLICY IF EXISTS "Users can accept their own invitations" ON moderator_invitations;
DROP POLICY IF EXISTS "admin_profiles_super_admin_all" ON admin_profiles;
DROP POLICY IF EXISTS "admin_profiles_view_own" ON admin_profiles;
DROP POLICY IF EXISTS "properties_public_read" ON properties;
DROP POLICY IF EXISTS "properties_seller_all" ON properties;
DROP POLICY IF EXISTS "properties_admin_all" ON properties;
DROP POLICY IF EXISTS "property_reviews_moderator_all" ON property_reviews;

-- Disable RLS temporarily to restore access
ALTER TABLE admin_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE properties DISABLE ROW LEVEL SECURITY;
ALTER TABLE property_reviews DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS with proper policies
ALTER TABLE admin_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_reviews ENABLE ROW LEVEL SECURITY;

-- Restore original admin_profiles policies
CREATE POLICY "admin_profiles_super_admin_all" ON admin_profiles
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_profiles ap
      WHERE ap.id = auth.uid()
      AND ap.role = 'super_admin'
      AND ap.is_active = TRUE
    )
  );

CREATE POLICY "admin_profiles_view_own" ON admin_profiles
  FOR SELECT
  USING (id = auth.uid());

-- Restore original properties policies - anyone can SELECT active properties
CREATE POLICY "Enable read access for all users" ON properties
  FOR SELECT
  USING (true);

-- Owners can update/delete their own properties
CREATE POLICY "Enable insert for authenticated users only" ON properties
  FOR INSERT
  WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Enable update for property owners" ON properties
  FOR UPDATE
  USING (auth.uid() = seller_id);

CREATE POLICY "Enable delete for property owners" ON properties
  FOR DELETE
  USING (auth.uid() = seller_id);
