-- Migration: Add Missing RLS Policies
-- Created: 2025-11-09
-- Purpose: Implement RLS policies for tables that are currently unprotected
-- Critical security update to prevent unauthorized data access

-- ============================================================================
-- 1. COUNTRIES TABLE (Reference Data)
-- ============================================================================

ALTER TABLE countries ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read countries (reference data)
CREATE POLICY "Anyone can read countries" ON countries
  FOR SELECT USING (true);

-- Only service role can modify
CREATE POLICY "Service role can manage countries" ON countries
  FOR ALL USING (auth.role() = 'service_role');

-- ============================================================================
-- 2. PROPERTY_IMAGES TABLE (CRITICAL - User Content)
-- ============================================================================

ALTER TABLE property_images ENABLE ROW LEVEL SECURITY;

-- Everyone can view images
CREATE POLICY "Anyone can view property images" ON property_images
  FOR SELECT USING (true);

-- Only property owners can insert images
CREATE POLICY "Property owners can add images" ON property_images
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = property_images.property_id
      AND properties.seller_id = auth.uid()
    )
  );

-- Only property owners can update their images
CREATE POLICY "Property owners can update images" ON property_images
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = property_images.property_id
      AND properties.seller_id = auth.uid()
    )
  );

-- Only property owners can delete their images
CREATE POLICY "Property owners can delete images" ON property_images
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = property_images.property_id
      AND properties.seller_id = auth.uid()
    )
  );

-- ============================================================================
-- 3. CONVERSATIONS TABLE (CRITICAL - Private Messages)
-- ============================================================================

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- Users can only view conversations they're part of
CREATE POLICY "Users can view own conversations" ON conversations
  FOR SELECT USING (auth.uid() = ANY(participants));

-- Users can create conversations
CREATE POLICY "Users can create conversations" ON conversations
  FOR INSERT WITH CHECK (auth.uid() = ANY(participants));

-- Users can update their conversations
CREATE POLICY "Users can update own conversations" ON conversations
  FOR UPDATE USING (auth.uid() = ANY(participants));

-- ============================================================================
-- 4. LAWYER_MATCHES TABLE
-- ============================================================================

ALTER TABLE lawyer_matches ENABLE ROW LEVEL SECURITY;

-- Users can view matches related to them
CREATE POLICY "Users can view own lawyer matches" ON lawyer_matches
  FOR SELECT USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM lawyers
      WHERE lawyers.id = lawyer_matches.lawyer_id
      AND lawyers.profile_id = auth.uid()
    )
  );

-- Service role creates matches
CREATE POLICY "Service role can manage matches" ON lawyer_matches
  FOR ALL USING (auth.role() = 'service_role');

-- ============================================================================
-- 5. LAWYER_BILLING TABLE (CRITICAL - Financial Data)
-- ============================================================================

ALTER TABLE lawyer_billing ENABLE ROW LEVEL SECURITY;

-- Lawyers can view their own billing
CREATE POLICY "Lawyers can view own billing" ON lawyer_billing
  FOR SELECT USING (
    lawyer_id IN (
      SELECT id FROM lawyers WHERE profile_id = auth.uid()
    )
  );

-- Admins can view all billing
CREATE POLICY "Admins can view all billing" ON lawyer_billing
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admin_profiles
      WHERE admin_profiles.id = auth.uid()
      AND admin_profiles.is_active = true
    )
  );

-- Only service role can modify billing
CREATE POLICY "Service role can manage billing" ON lawyer_billing
  FOR ALL USING (auth.role() = 'service_role');

-- ============================================================================
-- 6. REVIEWS TABLE (Legacy - Consider Migration)
-- ============================================================================

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Anyone can read reviews
CREATE POLICY "Anyone can read reviews" ON reviews
  FOR SELECT USING (true);

-- Users can create own reviews
CREATE POLICY "Users can create own reviews" ON reviews
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Users can update own reviews
CREATE POLICY "Users can update own reviews" ON reviews
  FOR UPDATE USING (user_id = auth.uid());

-- Users can delete own reviews
CREATE POLICY "Users can delete own reviews" ON reviews
  FOR DELETE USING (user_id = auth.uid());

-- ============================================================================
-- 7. SAVED_PROPERTIES TABLE (Legacy - Consider Migration)
-- ============================================================================

ALTER TABLE saved_properties ENABLE ROW LEVEL SECURITY;

-- Users can manage own saved properties
CREATE POLICY "Users can manage own saved properties" ON saved_properties
  FOR ALL USING (user_id = auth.uid());

-- ============================================================================
-- 8. SEARCH_ALERT_HISTORY TABLE
-- ============================================================================

ALTER TABLE search_alert_history ENABLE ROW LEVEL SECURITY;

-- Users can view history for their saved searches
CREATE POLICY "Users can view own alert history" ON search_alert_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM saved_searches
      WHERE saved_searches.id = search_alert_history.saved_search_id
      AND saved_searches.user_id = auth.uid()
    )
  );

-- Service role manages alerts
CREATE POLICY "Service role can manage alerts" ON search_alert_history
  FOR ALL USING (auth.role() = 'service_role');

-- ============================================================================
-- 9. EMAIL_QUEUE TABLE (CRITICAL - Personal Data)
-- ============================================================================

ALTER TABLE email_queue ENABLE ROW LEVEL SECURITY;

-- Only service role can access email queue
CREATE POLICY "Service role can manage email queue" ON email_queue
  FOR ALL USING (auth.role() = 'service_role');

-- Users can view their own email history
CREATE POLICY "Users can view own email history" ON email_queue
  FOR SELECT USING (recipient_id = auth.uid());

-- ============================================================================
-- 10. PLATFORM_SETTINGS TABLE (CRITICAL - System Configuration)
-- ============================================================================

ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;

-- Admins can view settings
CREATE POLICY "Admins can view settings" ON platform_settings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admin_profiles
      WHERE admin_profiles.id = auth.uid()
      AND admin_profiles.is_active = true
    )
  );

-- Super admins can modify settings
CREATE POLICY "Super admins can manage settings" ON platform_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_profiles
      WHERE admin_profiles.id = auth.uid()
      AND admin_profiles.role = 'super_admin'
      AND admin_profiles.is_active = true
    )
  );

-- ============================================================================
-- 11. PLATFORM_STATS_CACHE TABLE
-- ============================================================================

ALTER TABLE platform_stats_cache ENABLE ROW LEVEL SECURITY;

-- Admins can view stats
CREATE POLICY "Admins can view stats" ON platform_stats_cache
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admin_profiles
      WHERE admin_profiles.id = auth.uid()
      AND admin_profiles.is_active = true
    )
  );

-- Only service role can update stats
CREATE POLICY "Service role can update stats" ON platform_stats_cache
  FOR ALL USING (auth.role() = 'service_role');

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Verify all public tables now have RLS enabled
-- Run this query after migration to confirm:
--
-- SELECT
--   tablename,
--   rowsecurity as rls_enabled,
--   (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public' AND tablename = pt.tablename) as policy_count
-- FROM pg_tables pt
-- WHERE schemaname = 'public'
-- AND rowsecurity = false
-- ORDER BY tablename;
--
-- Expected result: 0 rows (all tables should have RLS enabled)

-- ============================================================================
-- NOTES FOR FUTURE CLEANUP
-- ============================================================================

-- TODO: Evaluate if these legacy tables can be dropped:
-- 1. reviews (superseded by lawyer_reviews and property_reviews)
-- 2. saved_properties (superseded by favorite_properties and property_favorites)
--
-- Before dropping, verify:
-- - No application code references these tables
-- - No foreign key constraints depend on them
-- - Migrate any remaining data to new tables
