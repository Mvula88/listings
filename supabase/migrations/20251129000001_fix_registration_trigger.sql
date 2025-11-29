-- Fix the handle_new_user trigger to properly handle country_id
-- The issue is that country_id from metadata might be empty string or invalid UUID

-- Drop existing trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create improved function with better error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  v_country_id UUID;
  v_country_id_text TEXT;
BEGIN
  -- Get the country_id from metadata
  v_country_id_text := new.raw_user_meta_data->>'country_id';

  -- Only try to cast if it's not empty and looks like a UUID
  IF v_country_id_text IS NOT NULL
     AND v_country_id_text != ''
     AND length(v_country_id_text) = 36 THEN
    BEGIN
      v_country_id := v_country_id_text::UUID;
    EXCEPTION WHEN OTHERS THEN
      v_country_id := NULL;
    END;
  ELSE
    v_country_id := NULL;
  END IF;

  -- Insert the profile
  INSERT INTO public.profiles (id, email, full_name, phone, user_type, country_id)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'phone',
    COALESCE(new.raw_user_meta_data->>'user_type', 'buyer'),
    v_country_id
  );

  RETURN new;
EXCEPTION WHEN OTHERS THEN
  -- Log the error but don't fail the auth signup
  RAISE WARNING 'handle_new_user error: %', SQLERRM;
  -- Still try to create a basic profile
  BEGIN
    INSERT INTO public.profiles (id, email, full_name, user_type)
    VALUES (
      new.id,
      new.email,
      new.raw_user_meta_data->>'full_name',
      COALESCE(new.raw_user_meta_data->>'user_type', 'buyer')
    );
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'handle_new_user fallback error: %', SQLERRM;
  END;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Verify the function was created
SELECT prosrc FROM pg_proc WHERE proname = 'handle_new_user';
