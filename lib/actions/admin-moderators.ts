'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import crypto from 'crypto'

interface ActionResult {
  success: boolean
  error?: string
}

/**
 * Check if current user is super_admin or admin
 */
async function checkAdminAccess(): Promise<{ userId: string; role: string } | { error: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { data: adminProfile } = await supabase
    .from('admin_profiles')
    .select('role')
    .eq('id', user.id)
    .single<{ role: string }>()

  if (!adminProfile || !['super_admin', 'admin'].includes(adminProfile.role)) {
    return { error: 'Not authorized - admin access required' }
  }

  return { userId: user.id, role: adminProfile.role }
}

/**
 * Check if current user is super_admin only
 */
async function checkSuperAdminAccess(): Promise<{ userId: string } | { error: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { data: adminProfile } = await supabase
    .from('admin_profiles')
    .select('role')
    .eq('id', user.id)
    .single<{ role: string }>()

  if (!adminProfile || adminProfile.role !== 'super_admin') {
    return { error: 'Not authorized - super admin access required' }
  }

  return { userId: user.id }
}

/**
 * Generate a secure random token for invitations
 */
function generateInviteToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

/**
 * Invite a new moderator by email
 */
export async function inviteModerator(email: string): Promise<ActionResult & { token?: string }> {
  const access = await checkSuperAdminAccess()
  if ('error' in access) {
    return { success: false, error: access.error }
  }

  if (!email || !email.includes('@')) {
    return { success: false, error: 'Valid email is required' }
  }

  const supabase = await createClient()

  // Check if email already has an admin profile
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', email)
    .single<{ id: string }>()

  if (existingProfile) {
    const { data: existingAdmin } = await supabase
      .from('admin_profiles')
      .select('role')
      .eq('id', existingProfile.id)
      .single<{ role: string }>()

    if (existingAdmin) {
      return { success: false, error: 'This user is already a moderator or admin' }
    }
  }

  // Check for existing pending invitation
  const { data: existingInvite } = await supabase
    .from('moderator_invitations')
    .select('id')
    .eq('email', email)
    .is('accepted_at', null)
    .gt('expires_at', new Date().toISOString())
    .single<{ id: string }>()

  if (existingInvite) {
    return { success: false, error: 'A pending invitation already exists for this email' }
  }

  // Create invitation
  const token = generateInviteToken()
  const { error: insertError } = await (supabase
    .from('moderator_invitations') as any)
    .insert({
      email,
      invited_by: access.userId,
      token,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
    })

  if (insertError) {
    return { success: false, error: 'Failed to create invitation' }
  }

  revalidatePath('/admin/moderators')

  return { success: true, token }
}

/**
 * Get all moderator invitations
 */
export async function getModeratorInvitations() {
  const access = await checkAdminAccess()
  if ('error' in access) {
    return { invitations: [], error: access.error }
  }

  const supabase = await createClient()

  const { data: invitations, error } = await supabase
    .from('moderator_invitations')
    .select(`
      *,
      inviter:profiles!invited_by (
        full_name,
        email
      )
    `)
    .order('created_at', { ascending: false })

  if (error) {
    return { invitations: [], error: 'Failed to fetch invitations' }
  }

  return { invitations: invitations || [] }
}

/**
 * Revoke a pending invitation
 */
export async function revokeInvitation(invitationId: string): Promise<ActionResult> {
  const access = await checkSuperAdminAccess()
  if ('error' in access) {
    return { success: false, error: access.error }
  }

  const supabase = await createClient()

  const { error } = await supabase
    .from('moderator_invitations')
    .delete()
    .eq('id', invitationId)
    .is('accepted_at', null)

  if (error) {
    return { success: false, error: 'Failed to revoke invitation' }
  }

  revalidatePath('/admin/moderators')

  return { success: true }
}

/**
 * Get list of all moderators
 */
export async function getModeratorsList() {
  const access = await checkAdminAccess()
  if ('error' in access) {
    return { moderators: [], error: access.error }
  }

  const supabase = await createClient()

  const { data: moderators, error } = await supabase
    .from('admin_profiles')
    .select(`
      *,
      profile:profiles!id (
        id,
        full_name,
        email,
        avatar_url,
        created_at
      )
    `)
    .eq('role', 'moderator')
    .order('created_at', { ascending: false })

  if (error) {
    return { moderators: [], error: 'Failed to fetch moderators' }
  }

  return { moderators: moderators || [] }
}

/**
 * Get a single moderator's details
 */
export async function getModeratorDetails(moderatorId: string) {
  const access = await checkAdminAccess()
  if ('error' in access) {
    return { moderator: null, error: access.error }
  }

  const supabase = await createClient()

  const { data: moderator, error } = await supabase
    .from('admin_profiles')
    .select(`
      *,
      profile:profiles!id (
        id,
        full_name,
        email,
        avatar_url,
        phone,
        created_at
      )
    `)
    .eq('id', moderatorId)
    .eq('role', 'moderator')
    .single()

  if (error || !moderator) {
    return { moderator: null, error: 'Moderator not found' }
  }

  return { moderator }
}

/**
 * Suspend a moderator
 */
export async function suspendModerator(moderatorId: string, reason: string): Promise<ActionResult> {
  const access = await checkSuperAdminAccess()
  if ('error' in access) {
    return { success: false, error: access.error }
  }

  if (!reason || reason.trim().length === 0) {
    return { success: false, error: 'Suspension reason is required' }
  }

  const supabase = await createClient()

  // Update moderator status
  const { error } = await (supabase
    .from('admin_profiles') as any)
    .update({
      status: 'suspended',
      suspension_reason: reason,
      suspended_at: new Date().toISOString(),
      suspended_by: access.userId
    })
    .eq('id', moderatorId)
    .eq('role', 'moderator')

  if (error) {
    return { success: false, error: 'Failed to suspend moderator' }
  }

  revalidatePath('/admin/moderators')
  revalidatePath(`/admin/moderators/${moderatorId}`)

  return { success: true }
}

/**
 * Unsuspend a moderator
 */
export async function unsuspendModerator(moderatorId: string): Promise<ActionResult> {
  const access = await checkSuperAdminAccess()
  if ('error' in access) {
    return { success: false, error: access.error }
  }

  const supabase = await createClient()

  const { error } = await (supabase
    .from('admin_profiles') as any)
    .update({
      status: 'active',
      suspension_reason: null,
      suspended_at: null,
      suspended_by: null
    })
    .eq('id', moderatorId)
    .eq('role', 'moderator')

  if (error) {
    return { success: false, error: 'Failed to unsuspend moderator' }
  }

  revalidatePath('/admin/moderators')
  revalidatePath(`/admin/moderators/${moderatorId}`)

  return { success: true }
}

/**
 * Remove a moderator completely
 */
export async function removeModerator(moderatorId: string): Promise<ActionResult> {
  const access = await checkSuperAdminAccess()
  if ('error' in access) {
    return { success: false, error: access.error }
  }

  const supabase = await createClient()

  // Remove from admin_profiles (they remain a regular user)
  const { error } = await supabase
    .from('admin_profiles')
    .delete()
    .eq('id', moderatorId)
    .eq('role', 'moderator')

  if (error) {
    return { success: false, error: 'Failed to remove moderator' }
  }

  revalidatePath('/admin/moderators')

  return { success: true }
}

/**
 * Get statistics for a specific moderator
 */
export async function getModeratorStats(moderatorId: string) {
  const access = await checkAdminAccess()
  if ('error' in access) {
    return { stats: null, error: access.error }
  }

  const supabase = await createClient()

  // Get review counts by action type
  const [
    { count: totalReviews },
    { count: approved },
    { count: rejected },
    { count: flagged },
    { count: reviewsThisWeek },
    { count: reviewsToday }
  ] = await Promise.all([
    supabase.from('property_reviews').select('id', { count: 'exact', head: true }).eq('reviewer_id', moderatorId),
    supabase.from('property_reviews').select('id', { count: 'exact', head: true }).eq('reviewer_id', moderatorId).eq('action', 'approved'),
    supabase.from('property_reviews').select('id', { count: 'exact', head: true }).eq('reviewer_id', moderatorId).eq('action', 'rejected'),
    supabase.from('property_reviews').select('id', { count: 'exact', head: true }).eq('reviewer_id', moderatorId).eq('action', 'flagged'),
    supabase.from('property_reviews').select('id', { count: 'exact', head: true })
      .eq('reviewer_id', moderatorId)
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
    supabase.from('property_reviews').select('id', { count: 'exact', head: true })
      .eq('reviewer_id', moderatorId)
      .gte('created_at', new Date(new Date().setHours(0, 0, 0, 0)).toISOString())
  ])

  return {
    stats: {
      totalReviews: totalReviews || 0,
      approved: approved || 0,
      rejected: rejected || 0,
      flagged: flagged || 0,
      reviewsThisWeek: reviewsThisWeek || 0,
      reviewsToday: reviewsToday || 0
    }
  }
}

/**
 * Accept a moderator invitation and create the moderator account
 */
export async function acceptModeratorInvitation(
  token: string,
  userId: string
): Promise<ActionResult> {
  const supabase = await createClient()

  // Verify token is valid
  const { data: invitation, error: fetchError } = await supabase
    .from('moderator_invitations')
    .select('*')
    .eq('token', token)
    .is('accepted_at', null)
    .gt('expires_at', new Date().toISOString())
    .single<{ id: string; email: string; token: string; expires_at: string }>()

  if (fetchError || !invitation) {
    return { success: false, error: 'Invalid or expired invitation' }
  }

  // Create admin profile for the user
  const { error: insertError } = await (supabase
    .from('admin_profiles') as any)
    .insert({
      id: userId,
      role: 'moderator',
      status: 'active'
    })

  if (insertError) {
    return { success: false, error: 'Failed to create moderator profile' }
  }

  // Mark invitation as accepted
  await (supabase
    .from('moderator_invitations') as any)
    .update({ accepted_at: new Date().toISOString() })
    .eq('id', invitation.id)

  return { success: true }
}

/**
 * Verify if an invitation token is valid
 */
export async function verifyInvitationToken(token: string) {
  const supabase = await createClient()

  const { data: invitation, error } = await supabase
    .from('moderator_invitations')
    .select('email, expires_at')
    .eq('token', token)
    .is('accepted_at', null)
    .gt('expires_at', new Date().toISOString())
    .single<{ email: string; expires_at: string }>()

  if (error || !invitation) {
    return { valid: false, email: null }
  }

  return { valid: true, email: invitation.email }
}
