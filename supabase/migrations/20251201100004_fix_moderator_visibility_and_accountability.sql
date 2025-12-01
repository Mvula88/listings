-- Fix moderator visibility and add accountability tracking

-- ============================================================================
-- 1. FIX RLS POLICIES FOR ADMIN_PROFILES
-- ============================================================================

-- Allow super_admins and admins to view all admin_profiles (including moderators)
DROP POLICY IF EXISTS "Admins can view all admin_profiles" ON admin_profiles;

CREATE POLICY "Admins can view all admin_profiles" ON admin_profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_profiles ap
      WHERE ap.id = auth.uid()
      AND ap.role IN ('super_admin', 'admin')
    )
  );

-- ============================================================================
-- 2. ADD INDEX FOR FASTER MODERATOR LOOKUPS
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_admin_profiles_role_status ON admin_profiles(role, status);

-- ============================================================================
-- 3. ENSURE PROPERTY_REVIEWS CAN BE READ BY ADMINS
-- ============================================================================

-- Allow admins to view all property reviews
DROP POLICY IF EXISTS "Admins can view all property reviews" ON property_reviews;

CREATE POLICY "Admins can view all property reviews" ON property_reviews
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_profiles
      WHERE admin_profiles.id = auth.uid()
      AND admin_profiles.role IN ('super_admin', 'admin', 'moderator')
    )
  );

-- ============================================================================
-- 4. ADD FUNCTION TO GET MODERATOR INFO FOR A PROPERTY
-- ============================================================================

CREATE OR REPLACE FUNCTION get_property_moderation_info(property_uuid UUID)
RETURNS TABLE (
  moderated_by_id UUID,
  moderated_by_name TEXT,
  moderated_at TIMESTAMPTZ,
  moderation_status TEXT,
  moderation_notes TEXT
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    p.moderated_by as moderated_by_id,
    pr.full_name as moderated_by_name,
    p.moderated_at,
    p.moderation_status::TEXT,
    p.moderation_notes
  FROM properties p
  LEFT JOIN profiles pr ON pr.id = p.moderated_by
  WHERE p.id = property_uuid;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION get_property_moderation_info(UUID) TO authenticated;
