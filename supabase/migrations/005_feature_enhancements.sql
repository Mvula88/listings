-- Migration: Feature Enhancements for DealDirect Platform
-- Description: Add tables and columns for new features (analytics, reviews, saved searches, referrals, etc.)
-- Date: 2025-11-01

-- ============================================================================
-- 1. PROPERTY ANALYTICS & VIEWS
-- ============================================================================

-- Track property views for analytics
CREATE TABLE IF NOT EXISTS property_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  viewer_id UUID REFERENCES profiles(id) ON DELETE SET NULL, -- NULL for anonymous
  ip_address INET,
  user_agent TEXT,
  referrer TEXT,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  session_id UUID,
  duration_seconds INTEGER DEFAULT 0
);

CREATE INDEX idx_property_views_property ON property_views(property_id);
CREATE INDEX idx_property_views_viewer ON property_views(viewer_id);
CREATE INDEX idx_property_views_date ON property_views(viewed_at);
CREATE INDEX idx_property_views_session ON property_views(session_id);

-- Add analytics columns to properties table
ALTER TABLE properties
ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS inquiry_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS save_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS share_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_viewed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS featured_until TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS premium_until TIMESTAMP WITH TIME ZONE;

-- ============================================================================
-- 2. LAWYER REVIEWS & RATINGS
-- ============================================================================

CREATE TABLE IF NOT EXISTS lawyer_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lawyer_id UUID NOT NULL REFERENCES lawyers(id) ON DELETE CASCADE,
  transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reviewer_role VARCHAR(20) NOT NULL CHECK (reviewer_role IN ('buyer', 'seller')),
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  review_text TEXT,
  communication_rating INTEGER CHECK (communication_rating BETWEEN 1 AND 5),
  professionalism_rating INTEGER CHECK (professionalism_rating BETWEEN 1 AND 5),
  efficiency_rating INTEGER CHECK (efficiency_rating BETWEEN 1 AND 5),
  would_recommend BOOLEAN DEFAULT TRUE,
  response TEXT, -- Lawyer's response to review
  response_at TIMESTAMP WITH TIME ZONE,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(transaction_id, reviewer_id) -- One review per person per transaction
);

CREATE INDEX idx_lawyer_reviews_lawyer ON lawyer_reviews(lawyer_id);
CREATE INDEX idx_lawyer_reviews_transaction ON lawyer_reviews(transaction_id);
CREATE INDEX idx_lawyer_reviews_reviewer ON lawyer_reviews(reviewer_id);
CREATE INDEX idx_lawyer_reviews_rating ON lawyer_reviews(rating);

-- Add review aggregation columns to lawyers table
ALTER TABLE lawyers
ADD COLUMN IF NOT EXISTS average_rating DECIMAL(3, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS communication_score DECIMAL(3, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS professionalism_score DECIMAL(3, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS efficiency_score DECIMAL(3, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS recommendation_rate DECIMAL(3, 2) DEFAULT 0;

-- ============================================================================
-- 3. SAVED SEARCHES & ALERTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS saved_searches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  search_criteria JSONB NOT NULL, -- Store all filter criteria
  email_alerts BOOLEAN DEFAULT TRUE,
  sms_alerts BOOLEAN DEFAULT FALSE,
  alert_frequency VARCHAR(20) DEFAULT 'instant' CHECK (alert_frequency IN ('instant', 'daily', 'weekly')),
  last_alerted_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_saved_searches_user ON saved_searches(user_id);
CREATE INDEX idx_saved_searches_active ON saved_searches(is_active);

-- Track which properties have been sent in alerts (prevent duplicates)
CREATE TABLE IF NOT EXISTS search_alert_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  saved_search_id UUID NOT NULL REFERENCES saved_searches(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  alerted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(saved_search_id, property_id)
);

CREATE INDEX idx_alert_history_search ON search_alert_history(saved_search_id);
CREATE INDEX idx_alert_history_property ON search_alert_history(property_id);

-- ============================================================================
-- 4. PROPERTY COMPARISON & FAVORITES
-- ============================================================================

CREATE TABLE IF NOT EXISTS favorite_properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, property_id)
);

CREATE INDEX idx_favorites_user ON favorite_properties(user_id);
CREATE INDEX idx_favorites_property ON favorite_properties(property_id);

CREATE TABLE IF NOT EXISTS property_comparisons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  property_ids UUID[] NOT NULL,
  name VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_comparisons_user ON property_comparisons(user_id);

-- ============================================================================
-- 5. REFERRAL PROGRAM
-- ============================================================================

CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  referee_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  referral_code VARCHAR(20) NOT NULL UNIQUE,
  referee_email VARCHAR(255),
  referee_phone VARCHAR(20),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'registered', 'completed', 'expired')),
  referral_type VARCHAR(20) NOT NULL CHECK (referral_type IN ('buyer', 'seller', 'lawyer')),
  transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL,
  discount_amount DECIMAL(10, 2) DEFAULT 500,
  discount_applied_referrer BOOLEAN DEFAULT FALSE,
  discount_applied_referee BOOLEAN DEFAULT FALSE,
  expires_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_referrals_referrer ON referrals(referrer_id);
CREATE INDEX idx_referrals_referee ON referrals(referee_id);
CREATE INDEX idx_referrals_code ON referrals(referral_code);
CREATE INDEX idx_referrals_status ON referrals(status);

-- Add referral tracking to profiles
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS referral_code VARCHAR(20) UNIQUE,
ADD COLUMN IF NOT EXISTS referrals_made INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS referrals_completed INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS referral_earnings DECIMAL(10, 2) DEFAULT 0;

-- ============================================================================
-- 6. PROPERTY VERIFICATION
-- ============================================================================

CREATE TABLE IF NOT EXISTS property_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  verification_type VARCHAR(50) NOT NULL CHECK (verification_type IN ('email', 'phone', 'title_deed', 'ownership_proof', 'site_visit')),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected')),
  document_url TEXT,
  notes TEXT,
  verified_by UUID REFERENCES profiles(id),
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_verifications_property ON property_verifications(property_id);
CREATE INDEX idx_verifications_seller ON property_verifications(seller_id);
CREATE INDEX idx_verifications_status ON property_verifications(status);

-- Add verification status to properties
ALTER TABLE properties
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS verification_level VARCHAR(20) DEFAULT 'none' CHECK (verification_level IN ('none', 'basic', 'standard', 'premium')),
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP WITH TIME ZONE;

-- ============================================================================
-- 7. NOTIFICATION PREFERENCES
-- ============================================================================

CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  email_inquiries BOOLEAN DEFAULT TRUE,
  email_messages BOOLEAN DEFAULT TRUE,
  email_transactions BOOLEAN DEFAULT TRUE,
  email_marketing BOOLEAN DEFAULT TRUE,
  email_weekly_digest BOOLEAN DEFAULT TRUE,
  sms_inquiries BOOLEAN DEFAULT FALSE,
  sms_transactions BOOLEAN DEFAULT TRUE,
  sms_marketing BOOLEAN DEFAULT FALSE,
  push_enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_notification_prefs_user ON notification_preferences(user_id);

-- ============================================================================
-- 8. EMAIL QUEUE & TRACKING
-- ============================================================================

CREATE TABLE IF NOT EXISTS email_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  recipient_email VARCHAR(255) NOT NULL,
  email_type VARCHAR(50) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  template_name VARCHAR(100) NOT NULL,
  template_data JSONB,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'bounced')),
  sent_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  scheduled_for TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_email_queue_status ON email_queue(status);
CREATE INDEX idx_email_queue_scheduled ON email_queue(scheduled_for);
CREATE INDEX idx_email_queue_recipient ON email_queue(recipient_id);

-- ============================================================================
-- 9. PLATFORM SETTINGS & CONFIGURATION
-- ============================================================================

CREATE TABLE IF NOT EXISTS platform_settings (
  key VARCHAR(100) PRIMARY KEY,
  value JSONB NOT NULL,
  description TEXT,
  updated_by UUID REFERENCES profiles(id),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default settings
INSERT INTO platform_settings (key, value, description) VALUES
  ('maintenance_mode', 'false', 'Enable maintenance mode'),
  ('max_images_per_property', '15', 'Maximum images allowed per property'),
  ('max_image_size_mb', '5', 'Maximum image file size in MB'),
  ('image_quality', '80', 'Image compression quality (0-100)'),
  ('enable_referrals', 'true', 'Enable referral program'),
  ('referral_discount', '500', 'Default referral discount amount')
ON CONFLICT (key) DO NOTHING;

-- ============================================================================
-- 10. FUNCTIONS & TRIGGERS
-- ============================================================================

-- Function to update lawyer ratings when new review is added
CREATE OR REPLACE FUNCTION update_lawyer_ratings()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE lawyers
  SET
    average_rating = (SELECT AVG(rating) FROM lawyer_reviews WHERE lawyer_id = NEW.lawyer_id),
    review_count = (SELECT COUNT(*) FROM lawyer_reviews WHERE lawyer_id = NEW.lawyer_id),
    communication_score = (SELECT AVG(communication_rating) FROM lawyer_reviews WHERE lawyer_id = NEW.lawyer_id AND communication_rating IS NOT NULL),
    professionalism_score = (SELECT AVG(professionalism_rating) FROM lawyer_reviews WHERE lawyer_id = NEW.lawyer_id AND professionalism_rating IS NOT NULL),
    efficiency_score = (SELECT AVG(efficiency_rating) FROM lawyer_reviews WHERE lawyer_id = NEW.lawyer_id AND efficiency_rating IS NOT NULL),
    recommendation_rate = (SELECT AVG(CASE WHEN would_recommend THEN 100 ELSE 0 END) FROM lawyer_reviews WHERE lawyer_id = NEW.lawyer_id)
  WHERE id = NEW.lawyer_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_lawyer_ratings ON lawyer_reviews;
CREATE TRIGGER trigger_update_lawyer_ratings
  AFTER INSERT OR UPDATE ON lawyer_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_lawyer_ratings();

-- Function to increment property view count
CREATE OR REPLACE FUNCTION increment_property_views()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE properties
  SET
    view_count = view_count + 1,
    last_viewed_at = NEW.viewed_at
  WHERE id = NEW.property_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_increment_views ON property_views;
CREATE TRIGGER trigger_increment_views
  AFTER INSERT ON property_views
  FOR EACH ROW
  EXECUTE FUNCTION increment_property_views();

-- Function to generate unique referral code
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TEXT AS $$
DECLARE
  code TEXT;
  exists BOOLEAN;
BEGIN
  LOOP
    -- Generate 8-character alphanumeric code
    code := UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8));

    -- Check if code already exists
    SELECT EXISTS(SELECT 1 FROM profiles WHERE referral_code = code) INTO exists;

    EXIT WHEN NOT exists;
  END LOOP;

  RETURN code;
END;
$$ LANGUAGE plpgsql;

-- Automatically generate referral code for new users
CREATE OR REPLACE FUNCTION set_user_referral_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.referral_code IS NULL THEN
    NEW.referral_code := generate_referral_code();
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_referral_code ON profiles;
CREATE TRIGGER trigger_set_referral_code
  BEFORE INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION set_user_referral_code();

-- ============================================================================
-- 11. ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Property Views (anyone can insert, users can view their own)
ALTER TABLE property_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY anyone_insert_views ON property_views
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY user_view_own_views ON property_views
  FOR SELECT
  USING (viewer_id = auth.uid() OR viewer_id IS NULL);

-- Lawyer Reviews (buyers/sellers can create, everyone can read)
ALTER TABLE lawyer_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY anyone_read_reviews ON lawyer_reviews
  FOR SELECT
  USING (true);

CREATE POLICY user_create_own_review ON lawyer_reviews
  FOR INSERT
  WITH CHECK (reviewer_id = auth.uid());

CREATE POLICY user_update_own_review ON lawyer_reviews
  FOR UPDATE
  USING (reviewer_id = auth.uid());

-- Saved Searches (users manage their own)
ALTER TABLE saved_searches ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_manage_searches ON saved_searches
  FOR ALL
  USING (user_id = auth.uid());

-- Favorite Properties (users manage their own)
ALTER TABLE favorite_properties ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_manage_favorites ON favorite_properties
  FOR ALL
  USING (user_id = auth.uid());

-- Property Comparisons (users manage their own)
ALTER TABLE property_comparisons ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_manage_comparisons ON property_comparisons
  FOR ALL
  USING (user_id = auth.uid());

-- Referrals (referrer can view, system creates)
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_view_own_referrals ON referrals
  FOR SELECT
  USING (referrer_id = auth.uid() OR referee_id = auth.uid());

-- Notification Preferences (users manage their own)
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_manage_notifications ON notification_preferences
  FOR ALL
  USING (user_id = auth.uid());

-- Property Verifications (sellers and admins)
ALTER TABLE property_verifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY seller_view_verifications ON property_verifications
  FOR SELECT
  USING (seller_id = auth.uid());

CREATE POLICY seller_create_verifications ON property_verifications
  FOR INSERT
  WITH CHECK (seller_id = auth.uid());

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE property_views IS 'Tracks individual property views for analytics';
COMMENT ON TABLE lawyer_reviews IS 'User reviews and ratings for lawyers/conveyancers';
COMMENT ON TABLE saved_searches IS 'User-saved property search criteria with email alerts';
COMMENT ON TABLE favorite_properties IS 'User-favorited properties';
COMMENT ON TABLE property_comparisons IS 'User-created property comparisons';
COMMENT ON TABLE referrals IS 'Referral program tracking and discounts';
COMMENT ON TABLE property_verifications IS 'Property and seller verification records';
COMMENT ON TABLE notification_preferences IS 'User notification preferences for email/SMS';
COMMENT ON TABLE email_queue IS 'Outbound email queue with retry logic';
