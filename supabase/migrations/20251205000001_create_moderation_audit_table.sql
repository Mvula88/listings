-- Create a separate moderation_audit table for tracking moderator actions
-- This is separate from property_reviews which is for user ratings

-- Create moderation_audit table
CREATE TABLE IF NOT EXISTS moderation_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE NOT NULL,
  reviewer_id UUID REFERENCES profiles(id) NOT NULL,
  action VARCHAR(20) NOT NULL CHECK (action IN ('approved', 'rejected', 'flagged', 'unflagged', 'edited', 'image_deleted')),
  reason TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_moderation_audit_property ON moderation_audit(property_id);
CREATE INDEX IF NOT EXISTS idx_moderation_audit_reviewer ON moderation_audit(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_moderation_audit_created ON moderation_audit(created_at DESC);

-- Enable RLS
ALTER TABLE moderation_audit ENABLE ROW LEVEL SECURITY;

-- RLS Policies for moderation_audit
-- Admins and moderators can view all audit entries
CREATE POLICY "Admins can view moderation audit" ON moderation_audit
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM admin_profiles WHERE id = auth.uid() AND is_active = true)
  );

-- Admins and moderators can create audit entries
CREATE POLICY "Admins can create moderation audit" ON moderation_audit
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM admin_profiles WHERE id = auth.uid() AND is_active = true)
  );

-- Comment on table
COMMENT ON TABLE moderation_audit IS 'Audit trail for moderator actions on properties';
