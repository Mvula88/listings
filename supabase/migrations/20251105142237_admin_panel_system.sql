-- ============================================================================
-- ADMIN PANEL SYSTEM MIGRATION
-- ============================================================================
-- Description: Enterprise-grade admin panel with RBAC, audit logging, and platform management
-- Date: 2025-11-05
-- ============================================================================

-- ============================================================================
-- 1. ADMIN ROLES & PERMISSIONS
-- ============================================================================

-- Admin roles enum
CREATE TYPE admin_role AS ENUM ('super_admin', 'admin', 'moderator');

-- Admin permissions enum
CREATE TYPE admin_permission AS ENUM (
  -- User management
  'users.view', 'users.edit', 'users.suspend', 'users.delete', 'users.impersonate',
  -- Property management
  'properties.view', 'properties.edit', 'properties.approve', 'properties.feature', 'properties.delete',
  -- Lawyer management
  'lawyers.view', 'lawyers.edit', 'lawyers.verify', 'lawyers.approve', 'lawyers.suspend',
  -- Transaction management
  'transactions.view', 'transactions.edit', 'transactions.cancel', 'transactions.refund',
  -- Content moderation
  'content.view', 'content.moderate', 'content.delete',
  -- Analytics
  'analytics.view', 'analytics.export',
  -- Platform settings
  'settings.view', 'settings.edit',
  -- Audit logs
  'audit.view', 'audit.export'
);

-- Admin profiles table (extends profiles)
CREATE TABLE admin_profiles (
  id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  role admin_role NOT NULL DEFAULT 'moderator',
  permissions admin_permission[] NOT NULL DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  last_login_at TIMESTAMPTZ,
  last_login_ip INET,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_admin_profiles_role ON admin_profiles(role);
CREATE INDEX idx_admin_profiles_active ON admin_profiles(is_active);

-- ============================================================================
-- 2. AUDIT LOG SYSTEM
-- ============================================================================

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES profiles(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL, -- 'user.suspend', 'property.approve', etc.
  resource_type VARCHAR(50) NOT NULL, -- 'user', 'property', 'lawyer', etc.
  resource_id UUID,
  old_values JSONB,
  new_values JSONB,
  metadata JSONB, -- Additional context
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_admin ON audit_logs(admin_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at DESC);

-- ============================================================================
-- 3. PLATFORM STATISTICS (Materialized View for Performance)
-- ============================================================================

CREATE TABLE platform_stats_cache (
  id SERIAL PRIMARY KEY,
  stat_date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_users INTEGER DEFAULT 0,
  new_users_today INTEGER DEFAULT 0,
  new_users_week INTEGER DEFAULT 0,
  new_users_month INTEGER DEFAULT 0,
  total_properties INTEGER DEFAULT 0,
  active_properties INTEGER DEFAULT 0,
  properties_today INTEGER DEFAULT 0,
  properties_week INTEGER DEFAULT 0,
  properties_month INTEGER DEFAULT 0,
  total_inquiries INTEGER DEFAULT 0,
  inquiries_today INTEGER DEFAULT 0,
  inquiries_week INTEGER DEFAULT 0,
  inquiries_month INTEGER DEFAULT 0,
  total_transactions INTEGER DEFAULT 0,
  active_transactions INTEGER DEFAULT 0,
  completed_transactions INTEGER DEFAULT 0,
  transactions_today INTEGER DEFAULT 0,
  transactions_week INTEGER DEFAULT 0,
  transactions_month INTEGER DEFAULT 0,
  total_lawyers INTEGER DEFAULT 0,
  verified_lawyers INTEGER DEFAULT 0,
  total_revenue DECIMAL(12,2) DEFAULT 0,
  revenue_today DECIMAL(12,2) DEFAULT 0,
  revenue_week DECIMAL(12,2) DEFAULT 0,
  revenue_month DECIMAL(12,2) DEFAULT 0,
  avg_property_price DECIMAL(12,2) DEFAULT 0,
  avg_days_to_close INTEGER DEFAULT 0,
  conversion_rate DECIMAL(5,2) DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(stat_date)
);

CREATE INDEX idx_platform_stats_date ON platform_stats_cache(stat_date DESC);

-- ============================================================================
-- 4. USER SUSPENSIONS & MODERATION
-- ============================================================================

CREATE TABLE user_suspensions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  suspended_by UUID NOT NULL REFERENCES profiles(id),
  reason TEXT NOT NULL,
  notes TEXT,
  suspended_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ, -- NULL for permanent
  is_active BOOLEAN DEFAULT TRUE,
  lifted_at TIMESTAMPTZ,
  lifted_by UUID REFERENCES profiles(id)
);

CREATE INDEX idx_user_suspensions_user ON user_suspensions(user_id);
CREATE INDEX idx_user_suspensions_active ON user_suspensions(is_active);

-- Add suspension status to profiles
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS is_suspended BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS suspended_until TIMESTAMPTZ;

-- ============================================================================
-- 5. CONTENT MODERATION FLAGS
-- ============================================================================

CREATE TYPE moderation_status AS ENUM ('pending', 'approved', 'rejected', 'flagged');

CREATE TABLE content_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_type VARCHAR(50) NOT NULL, -- 'property', 'review', 'message'
  resource_id UUID NOT NULL,
  flagged_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  reason VARCHAR(100) NOT NULL,
  description TEXT,
  status moderation_status DEFAULT 'pending',
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ,
  resolution_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_content_flags_resource ON content_flags(resource_type, resource_id);
CREATE INDEX idx_content_flags_status ON content_flags(status);
CREATE INDEX idx_content_flags_created ON content_flags(created_at DESC);

-- Add moderation status to properties
ALTER TABLE properties
ADD COLUMN IF NOT EXISTS moderation_status moderation_status DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS moderation_notes TEXT,
ADD COLUMN IF NOT EXISTS moderated_by UUID REFERENCES profiles(id),
ADD COLUMN IF NOT EXISTS moderated_at TIMESTAMPTZ;

-- ============================================================================
-- 6. ADMIN NOTIFICATIONS
-- ============================================================================

CREATE TABLE admin_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'alert', 'warning', 'info', 'success'
  priority VARCHAR(20) DEFAULT 'normal', -- 'low', 'normal', 'high', 'critical'
  action_url TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

CREATE INDEX idx_admin_notifications_read ON admin_notifications(is_read);
CREATE INDEX idx_admin_notifications_created ON admin_notifications(created_at DESC);
CREATE INDEX idx_admin_notifications_priority ON admin_notifications(priority);

-- ============================================================================
-- 7. PLATFORM SETTINGS (Enhanced)
-- ============================================================================

-- Add more platform settings
INSERT INTO platform_settings (key, value, description) VALUES
  ('admin_panel_enabled', 'true', 'Enable/disable admin panel access'),
  ('require_property_approval', 'false', 'Require admin approval for new listings'),
  ('require_lawyer_verification', 'true', 'Require verification before lawyers appear'),
  ('auto_suspend_flagged_content', 'true', 'Auto-suspend content with multiple flags'),
  ('flag_threshold', '3', 'Number of flags before auto-suspension'),
  ('maintenance_message', '{"title": "Maintenance Mode", "message": "We are currently performing scheduled maintenance."}', 'Maintenance mode message')
ON CONFLICT (key) DO NOTHING;

-- ============================================================================
-- 8. ADMIN ACTIVITY TRACKING
-- ============================================================================

CREATE TABLE admin_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  ip_address INET,
  user_agent TEXT,
  login_at TIMESTAMPTZ DEFAULT NOW(),
  logout_at TIMESTAMPTZ,
  last_activity_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE
);

CREATE INDEX idx_admin_sessions_admin ON admin_sessions(admin_id);
CREATE INDEX idx_admin_sessions_active ON admin_sessions(is_active);

-- ============================================================================
-- 9. FUNCTIONS & TRIGGERS
-- ============================================================================

-- Function to log admin actions automatically
CREATE OR REPLACE FUNCTION log_admin_action()
RETURNS TRIGGER AS $$
DECLARE
  admin_user_id UUID;
BEGIN
  -- Get current admin user from session
  admin_user_id := current_setting('app.current_admin_id', TRUE)::UUID;

  IF admin_user_id IS NOT NULL THEN
    INSERT INTO audit_logs (
      admin_id,
      action,
      resource_type,
      resource_id,
      old_values,
      new_values,
      metadata
    ) VALUES (
      admin_user_id,
      TG_ARGV[0], -- Action name passed as trigger argument
      TG_TABLE_NAME,
      COALESCE(NEW.id, OLD.id),
      CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD) ELSE NULL END,
      CASE WHEN TG_OP != 'DELETE' THEN row_to_json(NEW) ELSE NULL END,
      jsonb_build_object(
        'operation', TG_OP,
        'timestamp', NOW()
      )
    );
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update platform stats (call via cron or manually)
CREATE OR REPLACE FUNCTION update_platform_stats()
RETURNS VOID AS $$
BEGIN
  -- Upsert the stats directly
  INSERT INTO platform_stats_cache (
    stat_date,
    total_users,
    new_users_today,
    new_users_week,
    new_users_month,
    total_properties,
    active_properties,
    properties_today,
    properties_week,
    properties_month,
    total_inquiries,
    inquiries_today,
    inquiries_week,
    inquiries_month,
    total_transactions,
    active_transactions,
    completed_transactions,
    transactions_today,
    transactions_week,
    transactions_month,
    total_lawyers,
    verified_lawyers,
    total_revenue,
    revenue_today,
    revenue_week,
    revenue_month,
    avg_property_price,
    avg_days_to_close,
    conversion_rate,
    updated_at
  )
  VALUES (
    CURRENT_DATE,
    (SELECT COUNT(*)::INTEGER FROM profiles),
    (SELECT COUNT(*)::INTEGER FROM profiles WHERE DATE(created_at) = CURRENT_DATE),
    (SELECT COUNT(*)::INTEGER FROM profiles WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'),
    (SELECT COUNT(*)::INTEGER FROM profiles WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'),
    (SELECT COUNT(*)::INTEGER FROM properties),
    (SELECT COUNT(*)::INTEGER FROM properties WHERE status = 'active'),
    (SELECT COUNT(*)::INTEGER FROM properties WHERE DATE(created_at) = CURRENT_DATE),
    (SELECT COUNT(*)::INTEGER FROM properties WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'),
    (SELECT COUNT(*)::INTEGER FROM properties WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'),
    (SELECT COUNT(*)::INTEGER FROM inquiries),
    (SELECT COUNT(*)::INTEGER FROM inquiries WHERE DATE(created_at) = CURRENT_DATE),
    (SELECT COUNT(*)::INTEGER FROM inquiries WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'),
    (SELECT COUNT(*)::INTEGER FROM inquiries WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'),
    (SELECT COUNT(*)::INTEGER FROM transactions),
    (SELECT COUNT(*)::INTEGER FROM transactions WHERE status NOT IN ('completed', 'cancelled')),
    (SELECT COUNT(*)::INTEGER FROM transactions WHERE status = 'completed'),
    (SELECT COUNT(*)::INTEGER FROM transactions WHERE DATE(created_at) = CURRENT_DATE),
    (SELECT COUNT(*)::INTEGER FROM transactions WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'),
    (SELECT COUNT(*)::INTEGER FROM transactions WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'),
    (SELECT COUNT(*)::INTEGER FROM lawyers),
    (SELECT COUNT(*)::INTEGER FROM lawyers WHERE verified = TRUE),
    0,
    0,
    0,
    0,
    (SELECT COALESCE(AVG(price), 0) FROM properties WHERE status = 'active'),
    (SELECT COALESCE(AVG(EXTRACT(DAY FROM (completed_at - created_at))), 0)::INTEGER FROM transactions WHERE status = 'completed' AND completed_at IS NOT NULL),
    (SELECT COALESCE(ROUND((COUNT(*) FILTER (WHERE status = 'completed')::NUMERIC / NULLIF(COUNT(*), 0)) * 100, 2), 0) FROM transactions),
    NOW()
  )
  ON CONFLICT (stat_date)
  DO UPDATE SET
    total_users = EXCLUDED.total_users,
    new_users_today = EXCLUDED.new_users_today,
    new_users_week = EXCLUDED.new_users_week,
    new_users_month = EXCLUDED.new_users_month,
    total_properties = EXCLUDED.total_properties,
    active_properties = EXCLUDED.active_properties,
    properties_today = EXCLUDED.properties_today,
    properties_week = EXCLUDED.properties_week,
    properties_month = EXCLUDED.properties_month,
    total_inquiries = EXCLUDED.total_inquiries,
    inquiries_today = EXCLUDED.inquiries_today,
    inquiries_week = EXCLUDED.inquiries_week,
    inquiries_month = EXCLUDED.inquiries_month,
    total_transactions = EXCLUDED.total_transactions,
    active_transactions = EXCLUDED.active_transactions,
    completed_transactions = EXCLUDED.completed_transactions,
    transactions_today = EXCLUDED.transactions_today,
    transactions_week = EXCLUDED.transactions_week,
    transactions_month = EXCLUDED.transactions_month,
    total_lawyers = EXCLUDED.total_lawyers,
    verified_lawyers = EXCLUDED.verified_lawyers,
    avg_property_price = EXCLUDED.avg_property_price,
    avg_days_to_close = EXCLUDED.avg_days_to_close,
    conversion_rate = EXCLUDED.conversion_rate,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to check if user has admin permission
CREATE OR REPLACE FUNCTION has_admin_permission(user_id UUID, permission_name admin_permission)
RETURNS BOOLEAN AS $$
DECLARE
  user_role admin_role;
  user_permissions admin_permission[];
BEGIN
  SELECT role, permissions INTO user_role, user_permissions
  FROM admin_profiles
  WHERE id = user_id AND is_active = TRUE;

  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  -- Super admins have all permissions
  IF user_role = 'super_admin' THEN
    RETURN TRUE;
  END IF;

  -- Check if permission exists in user's permissions array
  RETURN permission_name = ANY(user_permissions);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to suspend user
CREATE OR REPLACE FUNCTION suspend_user(
  target_user_id UUID,
  admin_id UUID,
  suspend_reason TEXT,
  suspend_notes TEXT DEFAULT NULL,
  expires TIMESTAMPTZ DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if admin has permission
  IF NOT has_admin_permission(admin_id, 'users.suspend') THEN
    RAISE EXCEPTION 'Insufficient permissions';
  END IF;

  -- Create suspension record
  INSERT INTO user_suspensions (
    user_id,
    suspended_by,
    reason,
    notes,
    expires_at
  ) VALUES (
    target_user_id,
    admin_id,
    suspend_reason,
    suspend_notes,
    expires
  );

  -- Update profile
  UPDATE profiles
  SET
    is_suspended = TRUE,
    suspended_until = expires
  WHERE id = target_user_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 10. ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Admin profiles (only super admins can manage)
ALTER TABLE admin_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY admin_profiles_super_admin_all ON admin_profiles
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_profiles ap
      WHERE ap.id = auth.uid()
      AND ap.role = 'super_admin'
      AND ap.is_active = TRUE
    )
  );

CREATE POLICY admin_profiles_view_own ON admin_profiles
  FOR SELECT
  USING (id = auth.uid());

-- Audit logs (admins with audit.view permission)
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY audit_logs_admin_view ON audit_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_profiles ap
      WHERE ap.id = auth.uid()
      AND ap.is_active = TRUE
      AND (
        ap.role = 'super_admin' OR
        'audit.view' = ANY(ap.permissions)
      )
    )
  );

-- User suspensions (admins with user management permissions)
ALTER TABLE user_suspensions ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_suspensions_admin_manage ON user_suspensions
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_profiles ap
      WHERE ap.id = auth.uid()
      AND ap.is_active = TRUE
      AND (
        ap.role = 'super_admin' OR
        'users.suspend' = ANY(ap.permissions)
      )
    )
  );

-- Content flags
ALTER TABLE content_flags ENABLE ROW LEVEL SECURITY;

CREATE POLICY content_flags_anyone_create ON content_flags
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY content_flags_admin_manage ON content_flags
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_profiles ap
      WHERE ap.id = auth.uid()
      AND ap.is_active = TRUE
      AND (
        ap.role = 'super_admin' OR
        'content.moderate' = ANY(ap.permissions)
      )
    )
  );

-- Admin notifications
ALTER TABLE admin_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY admin_notifications_view ON admin_notifications
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_profiles ap
      WHERE ap.id = auth.uid()
      AND ap.is_active = TRUE
    )
  );

-- Admin sessions
ALTER TABLE admin_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY admin_sessions_own ON admin_sessions
  FOR ALL
  USING (admin_id = auth.uid());

-- ============================================================================
-- 11. INITIAL DATA
-- ============================================================================

-- Create initial super admin (you'll need to run this manually with your user ID)
-- INSERT INTO admin_profiles (id, role, permissions)
-- VALUES (
--   'YOUR_USER_ID_HERE',
--   'super_admin',
--   ARRAY[]::admin_permission[] -- Super admin doesn't need explicit permissions
-- );

-- Initial platform stats
SELECT update_platform_stats();

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE admin_profiles IS 'Admin user roles and permissions';
COMMENT ON TABLE audit_logs IS 'Complete audit trail of all admin actions';
COMMENT ON TABLE platform_stats_cache IS 'Cached platform statistics for performance';
COMMENT ON TABLE user_suspensions IS 'User suspension records';
COMMENT ON TABLE content_flags IS 'Content moderation flags and reports';
COMMENT ON TABLE admin_notifications IS 'Admin panel notifications';
COMMENT ON TABLE admin_sessions IS 'Admin login session tracking';
COMMENT ON FUNCTION log_admin_action() IS 'Automatically log admin actions to audit trail';
COMMENT ON FUNCTION update_platform_stats() IS 'Update cached platform statistics';
COMMENT ON FUNCTION has_admin_permission(UUID, admin_permission) IS 'Check if user has specific admin permission';
COMMENT ON FUNCTION suspend_user(UUID, UUID, TEXT, TEXT, TIMESTAMPTZ) IS 'Suspend a user account';
