'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type UserRole = 'buyer' | 'seller' | 'lawyer'

interface RoleActionResult {
  success: boolean
  error?: string
}

/**
 * Switch the user's active role
 */
export async function switchRole(newRole: UserRole): Promise<RoleActionResult> {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Get current profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('roles')
      .eq('id', user.id)
      .single() as { data: { roles: string[] | null } | null; error: any }

    if (!profile) {
      return { success: false, error: 'Profile not found' }
    }

    const roles = profile.roles || []

    // Check if user has this role
    if (!roles.includes(newRole)) {
      return { success: false, error: `You don't have the ${newRole} role. Add it first in settings.` }
    }

    // Update active role
    const { error: updateError } = await (supabase.from('profiles') as any)
      .update({
        user_type: newRole,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    if (updateError) {
      return { success: false, error: 'Failed to switch role' }
    }

    revalidatePath('/dashboard')
    revalidatePath('/properties')
    revalidatePath('/featured')

    return { success: true }
  } catch (error) {
    console.error('Switch role error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

/**
 * Add a new role to the user's profile
 */
export async function addRole(newRole: UserRole): Promise<RoleActionResult> {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Get current profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('roles, user_type')
      .eq('id', user.id)
      .single() as { data: { roles: string[] | null; user_type: string | null } | null; error: any }

    if (!profile) {
      return { success: false, error: 'Profile not found' }
    }

    const currentRoles = profile.roles || []

    // Check if user already has this role
    if (currentRoles.includes(newRole)) {
      return { success: false, error: `You already have the ${newRole} role` }
    }

    // Add the new role
    const updatedRoles = [...currentRoles, newRole]

    const { error: updateError } = await (supabase.from('profiles') as any)
      .update({
        roles: updatedRoles,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    if (updateError) {
      return { success: false, error: 'Failed to add role' }
    }

    revalidatePath('/dashboard')
    revalidatePath('/settings')

    return { success: true }
  } catch (error) {
    console.error('Add role error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

/**
 * Upgrade a buyer to seller role (adds seller role and switches to it)
 */
export async function upgradeToSeller(): Promise<RoleActionResult> {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Get current profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('roles, user_type')
      .eq('id', user.id)
      .single() as { data: { roles: string[] | null; user_type: string | null } | null; error: any }

    if (!profile) {
      return { success: false, error: 'Profile not found' }
    }

    const currentRoles = profile.roles || []

    // Add seller role if not already present
    const updatedRoles = currentRoles.includes('seller')
      ? currentRoles
      : [...currentRoles, 'seller']

    // Update profile with seller role and switch to seller
    const { error: updateError } = await (supabase.from('profiles') as any)
      .update({
        roles: updatedRoles,
        user_type: 'seller',
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    if (updateError) {
      return { success: false, error: 'Failed to upgrade to seller' }
    }

    revalidatePath('/dashboard')
    revalidatePath('/properties')
    revalidatePath('/settings')

    return { success: true }
  } catch (error) {
    console.error('Upgrade to seller error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

/**
 * Get user's roles and current active role
 */
export async function getUserRoles(): Promise<{
  roles: UserRole[]
  activeRole: UserRole | null
}> {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { roles: [], activeRole: null }
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('roles, user_type')
      .eq('id', user.id)
      .single() as { data: { roles: string[] | null; user_type: string | null } | null; error: any }

    if (!profile) {
      return { roles: [], activeRole: null }
    }

    return {
      roles: (profile.roles || []) as UserRole[],
      activeRole: profile.user_type as UserRole | null,
    }
  } catch (error) {
    console.error('Get user roles error:', error)
    return { roles: [], activeRole: null }
  }
}
