-- Simple RLS fix - just disable RLS on admin_profiles to restore access

-- Disable RLS on admin_profiles entirely (admins can manage this via Supabase dashboard)
ALTER TABLE admin_profiles DISABLE ROW LEVEL SECURITY;

-- For properties, allow all reads
ALTER TABLE properties DISABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies on properties
DROP POLICY IF EXISTS "Enable read access for all users" ON properties;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON properties;
DROP POLICY IF EXISTS "Enable update for property owners" ON properties;
DROP POLICY IF EXISTS "Enable delete for property owners" ON properties;
DROP POLICY IF EXISTS "properties_public_read" ON properties;
DROP POLICY IF EXISTS "properties_seller_all" ON properties;
DROP POLICY IF EXISTS "properties_admin_all" ON properties;

-- Create simple open read policy
CREATE POLICY "Anyone can read properties" ON properties
  FOR SELECT USING (true);

-- Sellers can manage their own
CREATE POLICY "Sellers can insert properties" ON properties
  FOR INSERT WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Sellers can update own properties" ON properties
  FOR UPDATE USING (auth.uid() = seller_id);

CREATE POLICY "Sellers can delete own properties" ON properties
  FOR DELETE USING (auth.uid() = seller_id);
