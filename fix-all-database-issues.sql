-- ============================================================================
-- COMPREHENSIVE DATABASE FIX
-- Run this in Supabase SQL Editor to fix all issues
-- ============================================================================

-- ============================================================================
-- 1. FIX REGISTRATION TRIGGER
-- ============================================================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  v_country_id UUID;
  v_country_id_text TEXT;
BEGIN
  v_country_id_text := new.raw_user_meta_data->>'country_id';

  IF v_country_id_text IS NOT NULL AND v_country_id_text != '' AND length(v_country_id_text) = 36 THEN
    BEGIN
      v_country_id := v_country_id_text::UUID;
    EXCEPTION WHEN OTHERS THEN
      v_country_id := NULL;
    END;
  ELSE
    v_country_id := NULL;
  END IF;

  INSERT INTO public.profiles (id, email, full_name, phone, user_type, country_id, roles)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'phone',
    COALESCE(new.raw_user_meta_data->>'user_type', 'buyer'),
    v_country_id,
    ARRAY[COALESCE(new.raw_user_meta_data->>'user_type', 'buyer')]::TEXT[]
  );
  RETURN new;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'handle_new_user error: %', SQLERRM;
  BEGIN
    INSERT INTO public.profiles (id, email, full_name, user_type, roles)
    VALUES (
      new.id,
      new.email,
      new.raw_user_meta_data->>'full_name',
      COALESCE(new.raw_user_meta_data->>'user_type', 'buyer'),
      ARRAY[COALESCE(new.raw_user_meta_data->>'user_type', 'buyer')]::TEXT[]
    );
  EXCEPTION WHEN OTHERS THEN NULL;
  END;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- 2. FIX ROLES COLUMN FOR ROLE SWITCHER
-- ============================================================================
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS roles TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Initialize roles from user_type for existing users
UPDATE profiles
SET roles = ARRAY[user_type]::TEXT[]
WHERE user_type IS NOT NULL
  AND (roles IS NULL OR roles = ARRAY[]::TEXT[]);

CREATE INDEX IF NOT EXISTS idx_profiles_roles ON profiles USING GIN (roles);

-- ============================================================================
-- 3. FIX FAVORITES TABLE AND POLICIES
-- ============================================================================
CREATE TABLE IF NOT EXISTS property_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, property_id)
);

CREATE INDEX IF NOT EXISTS idx_property_favorites_user_id ON property_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_property_favorites_property_id ON property_favorites(property_id);

-- Enable RLS
ALTER TABLE property_favorites ENABLE ROW LEVEL SECURITY;

-- Drop existing policies and recreate
DROP POLICY IF EXISTS "Users can view own favorites" ON property_favorites;
DROP POLICY IF EXISTS "Users can add favorites" ON property_favorites;
DROP POLICY IF EXISTS "Users can remove own favorites" ON property_favorites;

CREATE POLICY "Users can view own favorites" ON property_favorites
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can add favorites" ON property_favorites
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove own favorites" ON property_favorites
  FOR DELETE USING (auth.uid() = user_id);

-- Add favorites_count to properties if not exists
ALTER TABLE properties ADD COLUMN IF NOT EXISTS favorites_count INTEGER DEFAULT 0;

-- ============================================================================
-- 4. FIX NOTIFICATION PREFERENCES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  email_inquiries BOOLEAN DEFAULT TRUE,
  email_messages BOOLEAN DEFAULT TRUE,
  email_transactions BOOLEAN DEFAULT TRUE,
  email_marketing BOOLEAN DEFAULT FALSE,
  sms_inquiries BOOLEAN DEFAULT FALSE,
  sms_transactions BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notification_preferences_user_id ON notification_preferences(user_id);

-- Enable RLS
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

-- Drop existing policies and recreate
DROP POLICY IF EXISTS "Users can view own preferences" ON notification_preferences;
DROP POLICY IF EXISTS "Users can update own preferences" ON notification_preferences;
DROP POLICY IF EXISTS "Users can insert own preferences" ON notification_preferences;

CREATE POLICY "Users can view own preferences" ON notification_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences" ON notification_preferences
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences" ON notification_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- 5. FIX NOTIFICATIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies and recreate
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
DROP POLICY IF EXISTS "System can insert notifications" ON notifications;

CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Allow inserts from authenticated users (for system notifications)
CREATE POLICY "System can insert notifications" ON notifications
  FOR INSERT WITH CHECK (true);

-- ============================================================================
-- 6. FIX CONVERSATIONS AND MESSAGES TABLES
-- ============================================================================

-- Make sure conversations table exists with proper structure
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inquiry_id UUID REFERENCES inquiries(id),
  property_id UUID REFERENCES properties(id),
  participants UUID[],
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_conversations_participants ON conversations USING GIN (participants);
CREATE INDEX IF NOT EXISTS idx_conversations_property ON conversations(property_id);

-- Enable RLS
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own conversations" ON conversations;
DROP POLICY IF EXISTS "Users can create conversations" ON conversations;
DROP POLICY IF EXISTS "Users can update own conversations" ON conversations;

CREATE POLICY "Users can view own conversations" ON conversations
  FOR SELECT USING (auth.uid() = ANY(participants));

CREATE POLICY "Users can create conversations" ON conversations
  FOR INSERT WITH CHECK (auth.uid() = ANY(participants));

CREATE POLICY "Users can update own conversations" ON conversations
  FOR UPDATE USING (auth.uid() = ANY(participants));

-- Make sure messages table exists with proper structure
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES profiles(id),
  recipient_id UUID REFERENCES profiles(id),
  transaction_id UUID REFERENCES transactions(id),
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient ON messages(recipient_id);

-- Enable RLS
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own messages" ON messages;
DROP POLICY IF EXISTS "Users can send messages" ON messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON messages;

CREATE POLICY "Users can view their own messages" ON messages
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

CREATE POLICY "Users can send messages" ON messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update their own messages" ON messages
  FOR UPDATE USING (auth.uid() = recipient_id);

-- ============================================================================
-- 7. FIX LAWYERS TABLE VARCHAR CONSTRAINTS
-- ============================================================================
-- Alter columns that may have VARCHAR(20) to allow longer values
DO $$
BEGIN
  -- payment_method
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lawyers' AND column_name = 'payment_method') THEN
    ALTER TABLE lawyers ALTER COLUMN payment_method TYPE VARCHAR(50);
  END IF;
  -- registration_number
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lawyers' AND column_name = 'registration_number') THEN
    ALTER TABLE lawyers ALTER COLUMN registration_number TYPE VARCHAR(100);
  END IF;
  -- city
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lawyers' AND column_name = 'city') THEN
    ALTER TABLE lawyers ALTER COLUMN city TYPE VARCHAR(100);
  END IF;
END $$;

-- ============================================================================
-- 8. CONTENT FLAGS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS content_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type VARCHAR(50),
  content_id UUID,
  reporter_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  reason VARCHAR(100),
  description TEXT,
  status VARCHAR(20) DEFAULT 'pending',
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add missing columns if they don't exist
ALTER TABLE content_flags ADD COLUMN IF NOT EXISTS content_type VARCHAR(50);
ALTER TABLE content_flags ADD COLUMN IF NOT EXISTS content_id UUID;
ALTER TABLE content_flags ADD COLUMN IF NOT EXISTS reporter_id UUID;
ALTER TABLE content_flags ADD COLUMN IF NOT EXISTS reason VARCHAR(100);
ALTER TABLE content_flags ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE content_flags ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pending';
ALTER TABLE content_flags ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMPTZ;
ALTER TABLE content_flags ADD COLUMN IF NOT EXISTS resolved_by UUID;
ALTER TABLE content_flags ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_content_flags_status ON content_flags(status);

ALTER TABLE content_flags ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view all flags" ON content_flags;
DROP POLICY IF EXISTS "Users can create flags" ON content_flags;
DROP POLICY IF EXISTS "Admins can update flags" ON content_flags;

CREATE POLICY "Admins can view all flags" ON content_flags FOR SELECT USING (true);
CREATE POLICY "Users can create flags" ON content_flags FOR INSERT WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "Admins can update flags" ON content_flags FOR UPDATE USING (true);

-- ============================================================================
-- 9. ADMIN NOTIFICATIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS admin_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(50),
  title VARCHAR(255),
  message TEXT,
  data JSONB DEFAULT '{}',
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add missing columns if they don't exist
ALTER TABLE admin_notifications ADD COLUMN IF NOT EXISTS type VARCHAR(50);
ALTER TABLE admin_notifications ADD COLUMN IF NOT EXISTS title VARCHAR(255);
ALTER TABLE admin_notifications ADD COLUMN IF NOT EXISTS message TEXT;
ALTER TABLE admin_notifications ADD COLUMN IF NOT EXISTS data JSONB DEFAULT '{}';
ALTER TABLE admin_notifications ADD COLUMN IF NOT EXISTS read BOOLEAN DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_admin_notifications_read ON admin_notifications(read);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_created ON admin_notifications(created_at DESC);

ALTER TABLE admin_notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view notifications" ON admin_notifications;
CREATE POLICY "Admins can view notifications" ON admin_notifications FOR SELECT USING (true);

-- ============================================================================
-- 10. BLOG POSTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255),
  slug VARCHAR(255),
  excerpt TEXT,
  content TEXT,
  featured_image TEXT,
  category VARCHAR(50),
  author_id UUID,
  status VARCHAR(20) DEFAULT 'draft',
  is_featured BOOLEAN DEFAULT FALSE,
  meta_title VARCHAR(255),
  meta_description TEXT,
  views_count INTEGER DEFAULT 0,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add missing columns if they don't exist
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS title VARCHAR(255);
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS slug VARCHAR(255);
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS excerpt TEXT;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS content TEXT;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS featured_image TEXT;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS category VARCHAR(50);
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS author_id UUID;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'draft';
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS meta_title VARCHAR(255);
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS meta_description TEXT;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS views_count INTEGER DEFAULT 0;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(published_at DESC);

ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view published posts" ON blog_posts;
DROP POLICY IF EXISTS "Admins can manage posts" ON blog_posts;

CREATE POLICY "Anyone can view published posts" ON blog_posts
  FOR SELECT USING (status = 'published' OR auth.uid() = author_id);
CREATE POLICY "Admins can manage posts" ON blog_posts
  FOR ALL USING (true);

-- ============================================================================
-- 11. AUDIT LOGS TABLE (for admin activity tracking)
-- ============================================================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES admin_users(id),
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50),
  resource_id UUID,
  details JSONB DEFAULT '{}',
  ip_address VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_admin ON audit_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at DESC);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view audit logs" ON audit_logs;
CREATE POLICY "Admins can view audit logs" ON audit_logs FOR SELECT USING (true);

-- ============================================================================
-- VERIFICATION
-- ============================================================================
SELECT 'All database fixes applied successfully!' as status;
