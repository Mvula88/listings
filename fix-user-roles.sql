-- FIX FOR ROLE SWITCHER AND USER ROLES
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor)

-- Step 1: Add roles column if it doesn't exist
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS roles TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Step 2: Initialize roles from user_type for all existing users
UPDATE profiles
SET roles = ARRAY[user_type]::TEXT[]
WHERE user_type IS NOT NULL
  AND (roles IS NULL OR roles = ARRAY[]::TEXT[]);

-- Step 3: Create index for faster role lookups
CREATE INDEX IF NOT EXISTS idx_profiles_roles ON profiles USING GIN (roles);

-- Step 4: Verify the changes
SELECT id, email, user_type, roles FROM profiles LIMIT 10;

SELECT 'Roles column added and initialized successfully!' as status;
