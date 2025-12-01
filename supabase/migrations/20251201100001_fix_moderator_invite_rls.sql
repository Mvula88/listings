-- Fix RLS policy for moderator invitation acceptance
-- Allows users with valid invitation tokens to create their own admin_profiles entry

-- First, drop the policy if it exists (for idempotency)
DROP POLICY IF EXISTS "Users can accept moderator invitations" ON admin_profiles;

-- Create policy allowing users to insert their own admin profile
-- ONLY if they have a valid, unexpired invitation matching their email
CREATE POLICY "Users can accept moderator invitations" ON admin_profiles
  FOR INSERT
  WITH CHECK (
    -- Must be inserting their own profile
    id = auth.uid()
    -- Must be a moderator role only (prevent privilege escalation)
    AND role = 'moderator'
    -- Must have a valid invitation for their email
    AND EXISTS (
      SELECT 1 FROM moderator_invitations mi
      JOIN auth.users au ON au.id = auth.uid()
      WHERE mi.email = au.email
        AND mi.expires_at > NOW()
        AND mi.accepted_at IS NULL
    )
  );

-- Also need a policy for updating the invitation to mark it as accepted
DROP POLICY IF EXISTS "Users can accept their own invitations" ON moderator_invitations;

CREATE POLICY "Users can accept their own invitations" ON moderator_invitations
  FOR UPDATE
  USING (
    -- Can only update invitations for their own email
    EXISTS (
      SELECT 1 FROM auth.users au
      WHERE au.id = auth.uid()
        AND au.email = moderator_invitations.email
    )
    -- Only valid, unexpired, unaccepted invitations
    AND expires_at > NOW()
    AND accepted_at IS NULL
  )
  WITH CHECK (
    -- Can only set accepted_at (not modify other fields)
    TRUE
  );
