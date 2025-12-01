-- ============================================================================
-- Migration: Complete Platform Settings
-- Description: Add all missing platform settings and ensure consistency
-- Date: 2025-12-01
-- ============================================================================

-- First, ensure the platform_settings table has the correct structure
ALTER TABLE platform_settings
ADD COLUMN IF NOT EXISTS category VARCHAR(50) DEFAULT 'general';

-- Insert all platform settings (using ON CONFLICT to avoid duplicates)
-- ============================================================================
-- GENERAL SETTINGS
-- ============================================================================
INSERT INTO platform_settings (key, value, description, category) VALUES
  ('platform_name', '"PropLinka"', 'Platform display name', 'general'),
  ('support_email', '"support@proplinka.com"', 'Support email address', 'general'),
  ('maintenance_mode', 'false', 'Enable maintenance mode', 'general')
ON CONFLICT (key) DO UPDATE SET
  description = EXCLUDED.description,
  category = EXCLUDED.category;

-- ============================================================================
-- FEATURE FLAGS
-- ============================================================================
INSERT INTO platform_settings (key, value, description, category) VALUES
  ('enable_referrals', 'true', 'Enable referral program', 'features'),
  ('enable_premium_listings', 'true', 'Enable premium/featured listings', 'features'),
  ('enable_sms_notifications', 'false', 'Enable SMS notifications (requires Twilio)', 'features'),
  ('require_property_approval', 'true', 'Require admin approval for new property listings', 'features'),
  ('require_lawyer_verification', 'true', 'Require verification before lawyers appear in directory', 'features')
ON CONFLICT (key) DO UPDATE SET
  description = EXCLUDED.description,
  category = EXCLUDED.category;

-- ============================================================================
-- PAYMENT/FEE SETTINGS
-- ============================================================================
INSERT INTO platform_settings (key, value, description, category) VALUES
  ('success_fee_buyer_percent', '0.5', 'Platform success fee for buyers (%)', 'payment'),
  ('success_fee_seller_percent', '0.5', 'Platform success fee for sellers (%)', 'payment'),
  ('premium_listing_price', '500', 'Price for premium/featured listing (in cents)', 'payment'),
  ('referral_discount', '500', 'Referral discount amount (in cents)', 'payment')
ON CONFLICT (key) DO UPDATE SET
  description = EXCLUDED.description,
  category = EXCLUDED.category;

-- ============================================================================
-- RATE LIMITING SETTINGS
-- ============================================================================
INSERT INTO platform_settings (key, value, description, category) VALUES
  ('rate_limit_api', '100', 'API rate limit (requests per minute)', 'rate_limits'),
  ('rate_limit_auth', '5', 'Auth rate limit (attempts per 15 minutes)', 'rate_limits'),
  ('rate_limit_upload', '20', 'Upload rate limit (uploads per hour)', 'rate_limits'),
  ('rate_limit_email', '50', 'Email rate limit (emails per hour)', 'rate_limits'),
  ('rate_limit_inquiry', '10', 'Inquiry rate limit (inquiries per hour)', 'rate_limits')
ON CONFLICT (key) DO UPDATE SET
  description = EXCLUDED.description,
  category = EXCLUDED.category;

-- ============================================================================
-- IMAGE SETTINGS
-- ============================================================================
INSERT INTO platform_settings (key, value, description, category) VALUES
  ('max_images_per_property', '15', 'Maximum images allowed per property', 'images'),
  ('max_image_size_mb', '10', 'Maximum image file size in MB', 'images'),
  ('image_quality', '80', 'Image compression quality (0-100)', 'images')
ON CONFLICT (key) DO UPDATE SET
  description = EXCLUDED.description,
  category = EXCLUDED.category;

-- ============================================================================
-- MODERATION SETTINGS
-- ============================================================================
INSERT INTO platform_settings (key, value, description, category) VALUES
  ('auto_suspend_flagged_content', 'true', 'Automatically suspend content with multiple flags', 'moderation'),
  ('flag_threshold', '3', 'Number of flags before auto-suspension', 'moderation')
ON CONFLICT (key) DO UPDATE SET
  description = EXCLUDED.description,
  category = EXCLUDED.category;

-- Update any existing settings that may have been stored as plain strings instead of JSON
UPDATE platform_settings SET value = 'true' WHERE key = 'maintenance_mode' AND value = '"false"';
UPDATE platform_settings SET value = 'false' WHERE key = 'maintenance_mode' AND value = '"true"';

-- Create index on category for faster filtering
CREATE INDEX IF NOT EXISTS idx_platform_settings_category ON platform_settings(category);
