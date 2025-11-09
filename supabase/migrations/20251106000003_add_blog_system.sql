-- Create blog_posts table
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  content TEXT NOT NULL,
  cover_image TEXT,
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  published_at TIMESTAMPTZ,
  views INTEGER DEFAULT 0,
  reading_time_minutes INTEGER,
  meta_title TEXT,
  meta_description TEXT,
  meta_keywords TEXT[],
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create blog_categories table
CREATE TABLE IF NOT EXISTS blog_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  color TEXT DEFAULT '#3b82f6',
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Insert default categories
INSERT INTO blog_categories (name, slug, description, color) VALUES
  ('Buying Tips', 'buying-tips', 'Expert advice for property buyers', '#10b981'),
  ('Selling Tips', 'selling-tips', 'Maximize your property sale', '#f59e0b'),
  ('Market Insights', 'market-insights', 'Real estate market trends and analysis', '#3b82f6'),
  ('Legal & Finance', 'legal-finance', 'Legal and financial guidance', '#8b5cf6'),
  ('Property Investment', 'property-investment', 'Investment strategies and tips', '#ef4444'),
  ('Success Stories', 'success-stories', 'Real customer success stories', '#ec4899')
ON CONFLICT (slug) DO NOTHING;

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON blog_posts(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON blog_posts(category);
CREATE INDEX IF NOT EXISTS idx_blog_posts_author_id ON blog_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_tags ON blog_posts USING GIN(tags);

-- Add RLS policies
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_categories ENABLE ROW LEVEL SECURITY;

-- Everyone can read published blog posts
CREATE POLICY "Anyone can read published blog posts" ON blog_posts
  FOR SELECT
  USING (status = 'published');

-- Only admins can manage blog posts
CREATE POLICY "Admins can manage blog posts" ON blog_posts
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_profiles
      WHERE admin_profiles.id = auth.uid()
      AND admin_profiles.is_active = true
    )
  );

-- Everyone can read categories
CREATE POLICY "Anyone can read categories" ON blog_categories
  FOR SELECT
  USING (true);

-- Only admins can manage categories
CREATE POLICY "Admins can manage categories" ON blog_categories
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_profiles
      WHERE admin_profiles.id = auth.uid()
      AND admin_profiles.is_active = true
    )
  );

-- Function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_blog_post_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
DROP TRIGGER IF EXISTS trigger_blog_post_updated_at ON blog_posts;
CREATE TRIGGER trigger_blog_post_updated_at
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_blog_post_updated_at();

-- Function to generate slug from title
CREATE OR REPLACE FUNCTION generate_blog_slug(title TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN lower(regexp_replace(regexp_replace(title, '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g'));
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE blog_posts IS 'Blog posts for content marketing and SEO';
COMMENT ON TABLE blog_categories IS 'Blog post categories';
COMMENT ON COLUMN blog_posts.reading_time_minutes IS 'Estimated reading time in minutes';
COMMENT ON COLUMN blog_posts.meta_title IS 'SEO meta title (if different from title)';
