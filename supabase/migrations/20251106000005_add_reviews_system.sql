-- Create property_reviews table
CREATE TABLE IF NOT EXISTS property_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT NOT NULL,
  review TEXT NOT NULL,
  helpful_count INTEGER DEFAULT 0,
  verified_purchase BOOLEAN DEFAULT false,
  response_from_seller TEXT,
  response_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(property_id, user_id)
);

-- Create review_helpfulness table (track who found reviews helpful)
CREATE TABLE IF NOT EXISTS review_helpfulness (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID NOT NULL REFERENCES property_reviews(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(review_id, user_id)
);

-- Add aggregate rating columns to properties
ALTER TABLE properties
ADD COLUMN IF NOT EXISTS average_rating DECIMAL(2,1) DEFAULT 0,
ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0;

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_property_reviews_property_id ON property_reviews(property_id);
CREATE INDEX IF NOT EXISTS idx_property_reviews_user_id ON property_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_property_reviews_status ON property_reviews(status);
CREATE INDEX IF NOT EXISTS idx_property_reviews_rating ON property_reviews(rating DESC);
CREATE INDEX IF NOT EXISTS idx_review_helpfulness_review_id ON review_helpfulness(review_id);

-- Add RLS policies
ALTER TABLE property_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_helpfulness ENABLE ROW LEVEL SECURITY;

-- Everyone can read approved reviews
CREATE POLICY "Anyone can read approved reviews" ON property_reviews
  FOR SELECT
  USING (status = 'approved');

-- Users can view their own reviews (even if pending/rejected)
CREATE POLICY "Users can view own reviews" ON property_reviews
  FOR SELECT
  USING (auth.uid() = user_id);

-- Authenticated users can create reviews
CREATE POLICY "Authenticated users can create reviews" ON property_reviews
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND auth.uid() IS NOT NULL
  );

-- Users can update their own pending reviews
CREATE POLICY "Users can update own pending reviews" ON property_reviews
  FOR UPDATE
  USING (auth.uid() = user_id AND status = 'pending')
  WITH CHECK (auth.uid() = user_id AND status = 'pending');

-- Users can delete their own reviews
CREATE POLICY "Users can delete own reviews" ON property_reviews
  FOR DELETE
  USING (auth.uid() = user_id);

-- Admins can manage all reviews
CREATE POLICY "Admins can manage all reviews" ON property_reviews
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_profiles
      WHERE admin_profiles.id = auth.uid()
      AND admin_profiles.is_active = true
    )
  );

-- Review helpfulness policies
CREATE POLICY "Anyone can read helpfulness" ON review_helpfulness
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can mark helpful" ON review_helpfulness
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their helpfulness mark" ON review_helpfulness
  FOR DELETE
  USING (auth.uid() = user_id);

-- Function to update property aggregate ratings
CREATE OR REPLACE FUNCTION update_property_ratings()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the property's average rating and review count
  UPDATE properties
  SET
    average_rating = (
      SELECT ROUND(AVG(rating)::numeric, 1)
      FROM property_reviews
      WHERE property_id = COALESCE(NEW.property_id, OLD.property_id)
      AND status = 'approved'
    ),
    review_count = (
      SELECT COUNT(*)
      FROM property_reviews
      WHERE property_id = COALESCE(NEW.property_id, OLD.property_id)
      AND status = 'approved'
    )
  WHERE id = COALESCE(NEW.property_id, OLD.property_id);

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger to update property ratings
DROP TRIGGER IF EXISTS trigger_update_property_ratings ON property_reviews;
CREATE TRIGGER trigger_update_property_ratings
  AFTER INSERT OR UPDATE OF status OR DELETE ON property_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_property_ratings();

-- Function to update review helpfulness count
CREATE OR REPLACE FUNCTION update_review_helpfulness_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the review's helpful_count
  UPDATE property_reviews
  SET helpful_count = (
    SELECT COUNT(*)
    FROM review_helpfulness
    WHERE review_id = COALESCE(NEW.review_id, OLD.review_id)
  )
  WHERE id = COALESCE(NEW.review_id, OLD.review_id);

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger to update helpfulness count
DROP TRIGGER IF EXISTS trigger_update_helpfulness_count ON review_helpfulness;
CREATE TRIGGER trigger_update_helpfulness_count
  AFTER INSERT OR DELETE ON review_helpfulness
  FOR EACH ROW
  EXECUTE FUNCTION update_review_helpfulness_count();

-- Function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_review_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
DROP TRIGGER IF EXISTS trigger_review_updated_at ON property_reviews;
CREATE TRIGGER trigger_review_updated_at
  BEFORE UPDATE ON property_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_review_updated_at();

COMMENT ON TABLE property_reviews IS 'User reviews and ratings for properties';
COMMENT ON TABLE review_helpfulness IS 'Track which users found reviews helpful';
COMMENT ON COLUMN property_reviews.verified_purchase IS 'Whether the reviewer completed a transaction for this property';
COMMENT ON COLUMN properties.average_rating IS 'Aggregate average rating from approved reviews';
COMMENT ON COLUMN properties.review_count IS 'Total count of approved reviews';
