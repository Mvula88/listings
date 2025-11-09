-- Create property_favorites table
CREATE TABLE IF NOT EXISTS property_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, property_id)
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_property_favorites_user_id ON property_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_property_favorites_property_id ON property_favorites(property_id);
CREATE INDEX IF NOT EXISTS idx_property_favorites_created_at ON property_favorites(created_at DESC);

-- Add RLS policies
ALTER TABLE property_favorites ENABLE ROW LEVEL SECURITY;

-- Users can view their own favorites
CREATE POLICY "Users can view own favorites" ON property_favorites
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can add favorites
CREATE POLICY "Users can add favorites" ON property_favorites
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can remove their own favorites
CREATE POLICY "Users can remove own favorites" ON property_favorites
  FOR DELETE
  USING (auth.uid() = user_id);

-- Add favorites_count to properties table for performance
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'favorites_count') THEN
    ALTER TABLE properties ADD COLUMN favorites_count INTEGER DEFAULT 0;
  END IF;
END $$;

-- Function to update favorites_count
CREATE OR REPLACE FUNCTION update_property_favorites_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE properties SET favorites_count = favorites_count + 1 WHERE id = NEW.property_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE properties SET favorites_count = GREATEST(favorites_count - 1, 0) WHERE id = OLD.property_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update favorites_count automatically
DROP TRIGGER IF EXISTS trigger_update_favorites_count ON property_favorites;
CREATE TRIGGER trigger_update_favorites_count
  AFTER INSERT OR DELETE ON property_favorites
  FOR EACH ROW
  EXECUTE FUNCTION update_property_favorites_count();

COMMENT ON TABLE property_favorites IS 'Stores user favorite/saved properties';
COMMENT ON COLUMN properties.favorites_count IS 'Cached count of favorites for performance';
