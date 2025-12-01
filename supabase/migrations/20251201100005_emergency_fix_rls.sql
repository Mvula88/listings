-- EMERGENCY FIX: Restore RLS policies that were broken

-- ============================================================================
-- 1. DROP THE PROBLEMATIC POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Admins can view all admin_profiles" ON admin_profiles;
DROP POLICY IF EXISTS "Admins can view all property reviews" ON property_reviews;
DROP POLICY IF EXISTS "Moderators can update property moderation" ON properties;
DROP POLICY IF EXISTS "Moderators can view all properties" ON properties;

-- ============================================================================
-- 2. RESTORE ADMIN_PROFILES POLICIES
-- ============================================================================

-- Super admins can do everything
DROP POLICY IF EXISTS "admin_profiles_super_admin_all" ON admin_profiles;
CREATE POLICY "admin_profiles_super_admin_all" ON admin_profiles
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_profiles ap
      WHERE ap.id = auth.uid()
      AND ap.role = 'super_admin'
    )
  );

-- Users can view their own admin profile
DROP POLICY IF EXISTS "admin_profiles_view_own" ON admin_profiles;
CREATE POLICY "admin_profiles_view_own" ON admin_profiles
  FOR SELECT
  USING (id = auth.uid());

-- ============================================================================
-- 3. RESTORE PROPERTIES POLICIES - Allow public read for active approved
-- ============================================================================

-- Anyone can view active approved properties
DROP POLICY IF EXISTS "properties_public_read" ON properties;
CREATE POLICY "properties_public_read" ON properties
  FOR SELECT
  USING (
    status = 'active' AND moderation_status = 'approved'
  );

-- Sellers can manage their own properties
DROP POLICY IF EXISTS "properties_seller_all" ON properties;
CREATE POLICY "properties_seller_all" ON properties
  FOR ALL
  USING (seller_id = auth.uid());

-- Admins and moderators can view and update all properties
DROP POLICY IF EXISTS "properties_admin_all" ON properties;
CREATE POLICY "properties_admin_all" ON properties
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_profiles
      WHERE admin_profiles.id = auth.uid()
      AND admin_profiles.role IN ('super_admin', 'admin', 'moderator')
    )
  );

-- ============================================================================
-- 4. ENSURE PROPERTY_REVIEWS HAS PROPER POLICIES
-- ============================================================================

-- Moderators can manage property reviews
DROP POLICY IF EXISTS "property_reviews_moderator_all" ON property_reviews;
CREATE POLICY "property_reviews_moderator_all" ON property_reviews
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_profiles
      WHERE admin_profiles.id = auth.uid()
      AND admin_profiles.role IN ('super_admin', 'admin', 'moderator')
    )
  );
