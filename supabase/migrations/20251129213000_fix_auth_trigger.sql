-- Fix the auth user creation trigger
-- This migration ensures the trigger is properly attached to auth.users
-- Also validates country_id exists before using it

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create or replace the function with proper error handling and country validation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_country_id UUID;
  v_country_id_text TEXT;
  v_user_type TEXT;
  v_country_exists BOOLEAN;
BEGIN
  -- Get user type, default to buyer
  v_user_type := COALESCE(new.raw_user_meta_data->>'user_type', 'buyer');

  -- Get country_id from metadata
  v_country_id_text := new.raw_user_meta_data->>'country_id';

  -- Only use country_id if it's valid AND exists in countries table
  IF v_country_id_text IS NOT NULL AND v_country_id_text != '' AND length(v_country_id_text) = 36 THEN
    BEGIN
      v_country_id := v_country_id_text::UUID;
      -- Check if country actually exists to avoid FK violation
      SELECT EXISTS(SELECT 1 FROM countries WHERE id = v_country_id) INTO v_country_exists;
      IF NOT v_country_exists THEN
        v_country_id := NULL;
      END IF;
    EXCEPTION WHEN OTHERS THEN
      v_country_id := NULL;
    END;
  ELSE
    v_country_id := NULL;
  END IF;

  -- Insert the profile with roles initialized
  INSERT INTO public.profiles (id, email, full_name, phone, user_type, country_id, roles, created_at, updated_at)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'phone',
    v_user_type,
    v_country_id,
    ARRAY[v_user_type]::TEXT[],
    NOW(),
    NOW()
  );

  RETURN new;
EXCEPTION WHEN OTHERS THEN
  -- Log the error
  RAISE LOG 'handle_new_user error for %: %', new.email, SQLERRM;

  -- Try a minimal insert as fallback (without country_id)
  BEGIN
    INSERT INTO public.profiles (id, email, full_name, user_type, roles, created_at, updated_at)
    VALUES (
      new.id,
      new.email,
      new.raw_user_meta_data->>'full_name',
      v_user_type,
      ARRAY[v_user_type]::TEXT[],
      NOW(),
      NOW()
    );
  EXCEPTION WHEN OTHERS THEN
    RAISE LOG 'handle_new_user fallback error for %: %', new.email, SQLERRM;
  END;

  RETURN new;
END;
$$;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Ensure roles column exists
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS roles TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Fix any existing users without roles
UPDATE profiles
SET roles = ARRAY[user_type]::TEXT[]
WHERE user_type IS NOT NULL
  AND (roles IS NULL OR roles = ARRAY[]::TEXT[]);
