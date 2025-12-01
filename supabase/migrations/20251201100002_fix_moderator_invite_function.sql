-- Fix moderator invitation by using a SECURITY DEFINER function
-- This function runs with elevated privileges to bypass RLS

-- Drop existing policies that don't work
DROP POLICY IF EXISTS "Users can accept moderator invitations" ON admin_profiles;
DROP POLICY IF EXISTS "Users can accept their own invitations" ON moderator_invitations;

-- Create a function to accept moderator invitations
-- This runs with SECURITY DEFINER to bypass RLS
CREATE OR REPLACE FUNCTION accept_moderator_invitation(
  p_token TEXT,
  p_user_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_invitation RECORD;
  v_user_email TEXT;
BEGIN
  -- Get the user's email from auth.users
  SELECT email INTO v_user_email
  FROM auth.users
  WHERE id = p_user_id;

  IF v_user_email IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'User not found');
  END IF;

  -- Verify token is valid and matches user email
  SELECT * INTO v_invitation
  FROM moderator_invitations
  WHERE token = p_token
    AND email = v_user_email
    AND expires_at > NOW()
    AND accepted_at IS NULL;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid or expired invitation, or email mismatch');
  END IF;

  -- Check if admin profile already exists
  IF EXISTS (SELECT 1 FROM admin_profiles WHERE id = p_user_id) THEN
    RETURN jsonb_build_object('success', false, 'error', 'User is already an admin or moderator');
  END IF;

  -- Create admin profile
  INSERT INTO admin_profiles (id, role, status)
  VALUES (p_user_id, 'moderator', 'active');

  -- Mark invitation as accepted
  UPDATE moderator_invitations
  SET accepted_at = NOW()
  WHERE id = v_invitation.id;

  RETURN jsonb_build_object('success', true);
EXCEPTION
  WHEN unique_violation THEN
    RETURN jsonb_build_object('success', false, 'error', 'Moderator profile already exists');
  WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION accept_moderator_invitation(TEXT, UUID) TO authenticated;
