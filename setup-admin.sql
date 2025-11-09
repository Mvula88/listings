-- Setup Admin Account for ismaelmvula@gmail.com
-- Run this script to create your account and make you a super admin

-- Step 1: Create your user account in Supabase Auth
-- Note: You should do this via the registration UI at http://localhost:3000/register first
-- or use Supabase Studio at http://localhost:54323

-- Step 2: After registration, find your user ID and make yourself admin
-- Replace 'YOUR_USER_ID_HERE' with your actual user ID from the profiles table

-- To find your user ID after registering, run:
-- SELECT id, email, full_name FROM profiles WHERE email = 'ismaelmvula@gmail.com';

-- Then uncomment and run this:
/*
INSERT INTO admin_profiles (id, role, permissions, is_active)
VALUES (
  'YOUR_USER_ID_HERE',  -- Replace with your actual user ID
  'super_admin',
  ARRAY[]::admin_permission[],
  true
);
*/

-- Quick verification query (run after making yourself admin):
-- SELECT ap.*, p.email FROM admin_profiles ap JOIN profiles p ON ap.id = p.id WHERE p.email = 'ismaelmvula@gmail.com';
