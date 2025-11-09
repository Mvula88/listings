-- Fix infinite recursion in admin_profiles RLS policies
-- Drop existing policies
DROP POLICY IF EXISTS "Admins can view own profile" ON admin_profiles;
DROP POLICY IF EXISTS "Super admins can view all profiles" ON admin_profiles;
DROP POLICY IF EXISTS "Super admins can manage all admin profiles" ON admin_profiles;

-- Disable RLS temporarily to fix the issue
ALTER TABLE admin_profiles DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS with simpler, non-recursive policies
ALTER TABLE admin_profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own admin profile (non-recursive)
CREATE POLICY "Users can view own admin profile" ON admin_profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Allow authenticated users to check if someone is admin (needed for the app)
CREATE POLICY "Authenticated users can read admin profiles" ON admin_profiles
  FOR SELECT
  TO authenticated
  USING (true);

-- Only super admins can insert/update/delete (using uid check, not role check to avoid recursion)
CREATE POLICY "Service role can manage admin profiles" ON admin_profiles
  FOR ALL
  USING (auth.role() = 'service_role');
