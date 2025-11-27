-- ============================================================================
-- USER NOTIFICATIONS TABLE
-- ============================================================================
-- This table stores notifications for regular users (not admins)
-- Used for: payment confirmations, featured listing expirations, inquiry alerts, etc.

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- 'payment', 'featured_expired', 'inquiry', 'property_approved', etc.
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  data JSONB, -- Additional structured data (property_id, transaction_id, etc.)
  read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users can only see their own notifications
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'notifications' AND policyname = 'notifications_select') THEN
    CREATE POLICY notifications_select ON notifications FOR SELECT USING (user_id = auth.uid());
  END IF;
END $$;

-- Users can update (mark as read) their own notifications
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'notifications' AND policyname = 'notifications_update') THEN
    CREATE POLICY notifications_update ON notifications FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
  END IF;
END $$;

-- System/server can insert notifications (via service role)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'notifications' AND policyname = 'notifications_insert') THEN
    CREATE POLICY notifications_insert ON notifications FOR INSERT WITH CHECK (true);
  END IF;
END $$;

-- Users can delete their own notifications
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'notifications' AND policyname = 'notifications_delete') THEN
    CREATE POLICY notifications_delete ON notifications FOR DELETE USING (user_id = auth.uid());
  END IF;
END $$;

-- Comments
COMMENT ON TABLE notifications IS 'User notifications for payments, property updates, inquiries, etc.';
COMMENT ON COLUMN notifications.type IS 'Notification type: payment, featured_expired, inquiry, property_approved, property_rejected, etc.';
COMMENT ON COLUMN notifications.data IS 'JSON data with additional context (property_id, amount, etc.)';
