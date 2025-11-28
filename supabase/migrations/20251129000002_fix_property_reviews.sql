-- Fix property_reviews table that was created without all columns

-- Add missing columns if they don't exist
DO $$
BEGIN
  -- Add reviewer_id if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'property_reviews' AND column_name = 'reviewer_id') THEN
    ALTER TABLE property_reviews ADD COLUMN reviewer_id UUID REFERENCES profiles(id) NOT NULL;
  END IF;

  -- Add property_id if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'property_reviews' AND column_name = 'property_id') THEN
    ALTER TABLE property_reviews ADD COLUMN property_id UUID REFERENCES properties(id) ON DELETE CASCADE NOT NULL;
  END IF;

  -- Add action if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'property_reviews' AND column_name = 'action') THEN
    ALTER TABLE property_reviews ADD COLUMN action VARCHAR(20) NOT NULL CHECK (action IN ('approved', 'rejected', 'flagged', 'unflagged'));
  END IF;

  -- Add reason if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'property_reviews' AND column_name = 'reason') THEN
    ALTER TABLE property_reviews ADD COLUMN reason TEXT;
  END IF;

  -- Add notes if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'property_reviews' AND column_name = 'notes') THEN
    ALTER TABLE property_reviews ADD COLUMN notes TEXT;
  END IF;

  -- Add created_at if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'property_reviews' AND column_name = 'created_at') THEN
    ALTER TABLE property_reviews ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
  END IF;
END $$;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_property_reviews_property ON property_reviews(property_id);
CREATE INDEX IF NOT EXISTS idx_property_reviews_reviewer ON property_reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_property_reviews_created ON property_reviews(created_at DESC);
