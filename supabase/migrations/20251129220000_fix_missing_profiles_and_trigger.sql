-- Add missing profile for dwtnamibia@gmail.com
INSERT INTO profiles (id, email, full_name, user_type, roles, created_at, updated_at)
VALUES (
  'dfbbb6fd-d53a-48ad-aecb-dd47fabbcba0',
  'dwtnamibia@gmail.com',
  'Ismael Abraham Mvula',
  'buyer',
  ARRAY['buyer']::TEXT[],
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Ensure trigger exists and is enabled
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Verify
DO $$
BEGIN
  RAISE NOTICE 'Trigger on_auth_user_created has been recreated';
END $$;
