-- Moderation System Migration
-- Adds tables for moderator invitations and property review audit trail

-- Moderator invitations table
CREATE TABLE IF NOT EXISTS moderator_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL,
  invited_by UUID REFERENCES profiles(id) NOT NULL,
  token VARCHAR(255) NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Property review history (audit trail)
CREATE TABLE IF NOT EXISTS property_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE NOT NULL,
  reviewer_id UUID REFERENCES profiles(id) NOT NULL,
  action VARCHAR(20) NOT NULL CHECK (action IN ('approved', 'rejected', 'flagged', 'unflagged')),
  reason TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for quick lookups (wrapped in DO block to handle errors gracefully)
DO $$
BEGIN
  -- Property reviews indexes
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'property_reviews' AND column_name = 'property_id') THEN
    CREATE INDEX IF NOT EXISTS idx_property_reviews_property ON property_reviews(property_id);
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'property_reviews' AND column_name = 'reviewer_id') THEN
    CREATE INDEX IF NOT EXISTS idx_property_reviews_reviewer ON property_reviews(reviewer_id);
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'property_reviews' AND column_name = 'created_at') THEN
    CREATE INDEX IF NOT EXISTS idx_property_reviews_created ON property_reviews(created_at DESC);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_moderator_invitations_token ON moderator_invitations(token);
CREATE INDEX IF NOT EXISTS idx_moderator_invitations_email ON moderator_invitations(email);

-- Enable RLS
ALTER TABLE property_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE moderator_invitations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for property_reviews

-- Admins and moderators can view all reviews
CREATE POLICY "Admins can view all reviews" ON property_reviews
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM admin_profiles WHERE id = auth.uid())
  );

-- Admins and moderators can create reviews
CREATE POLICY "Moderators can create reviews" ON property_reviews
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM admin_profiles WHERE id = auth.uid())
  );

-- RLS Policies for moderator_invitations

-- Super admins can do everything with invitations
CREATE POLICY "Super admins manage invitations" ON moderator_invitations
  FOR ALL USING (
    EXISTS (SELECT 1 FROM admin_profiles WHERE id = auth.uid() AND role = 'super_admin')
  );

-- Admins can view invitations
CREATE POLICY "Admins can view invitations" ON moderator_invitations
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM admin_profiles WHERE id = auth.uid() AND role IN ('super_admin', 'admin'))
  );

-- Public can check if token is valid (for invite acceptance)
CREATE POLICY "Public can verify invite tokens" ON moderator_invitations
  FOR SELECT USING (
    token IS NOT NULL AND expires_at > NOW() AND accepted_at IS NULL
  );

-- Add moderation_status and moderation_notes to properties if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'properties' AND column_name = 'moderation_status') THEN
    ALTER TABLE properties ADD COLUMN moderation_status VARCHAR(20) DEFAULT 'approved';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'properties' AND column_name = 'moderation_notes') THEN
    ALTER TABLE properties ADD COLUMN moderation_notes TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'properties' AND column_name = 'moderated_by') THEN
    ALTER TABLE properties ADD COLUMN moderated_by UUID REFERENCES profiles(id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'properties' AND column_name = 'moderated_at') THEN
    ALTER TABLE properties ADD COLUMN moderated_at TIMESTAMPTZ;
  END IF;
END $$;

-- Create index on moderation_status for filtering
CREATE INDEX IF NOT EXISTS idx_properties_moderation_status ON properties(moderation_status);

-- Add last_active and suspension columns to admin_profiles if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'admin_profiles' AND column_name = 'last_active') THEN
    ALTER TABLE admin_profiles ADD COLUMN last_active TIMESTAMPTZ DEFAULT NOW();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'admin_profiles' AND column_name = 'status') THEN
    ALTER TABLE admin_profiles ADD COLUMN status VARCHAR(20) DEFAULT 'active';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'admin_profiles' AND column_name = 'suspension_reason') THEN
    ALTER TABLE admin_profiles ADD COLUMN suspension_reason TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'admin_profiles' AND column_name = 'suspended_at') THEN
    ALTER TABLE admin_profiles ADD COLUMN suspended_at TIMESTAMPTZ;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'admin_profiles' AND column_name = 'suspended_by') THEN
    ALTER TABLE admin_profiles ADD COLUMN suspended_by UUID REFERENCES profiles(id);
  END IF;
END $$;
