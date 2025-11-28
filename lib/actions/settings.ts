'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

interface ActionResult {
  success: boolean
  error?: string
  message?: string
}

/**
 * Update user profile information (full name, phone)
 */
export async function updateProfile(formData: FormData): Promise<ActionResult> {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'Not authenticated' }
    }

    const fullName = formData.get('fullName') as string
    const phone = formData.get('phone') as string

    // Validate inputs
    if (!fullName || fullName.trim().length < 2) {
      return { success: false, error: 'Full name must be at least 2 characters' }
    }

    // Phone validation (optional but if provided, should be valid)
    if (phone && !/^[+]?[\d\s-]{10,}$/.test(phone.replace(/\s/g, ''))) {
      return { success: false, error: 'Please enter a valid phone number' }
    }

    const { error: updateError } = await (supabase.from('profiles') as any)
      .update({
        full_name: fullName.trim(),
        phone: phone?.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    if (updateError) {
      console.error('Profile update error:', updateError)
      return { success: false, error: 'Failed to update profile' }
    }

    revalidatePath('/settings')
    revalidatePath('/dashboard')

    return { success: true, message: 'Profile updated successfully' }
  } catch (error) {
    console.error('Update profile error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

/**
 * Update notification preferences
 */
export async function updateNotificationPreferences(formData: FormData): Promise<ActionResult> {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'Not authenticated' }
    }

    const emailNotifications = formData.get('emailNotifications') === 'true'
    const smsNotifications = formData.get('smsNotifications') === 'true'
    const marketingEmails = formData.get('marketingEmails') === 'true'
    const listingUpdates = formData.get('listingUpdates') === 'true'
    const inquiryAlerts = formData.get('inquiryAlerts') === 'true'

    const { error: updateError } = await (supabase.from('profiles') as any)
      .update({
        notification_preferences: {
          email_notifications: emailNotifications,
          sms_notifications: smsNotifications,
          marketing_emails: marketingEmails,
          listing_updates: listingUpdates,
          inquiry_alerts: inquiryAlerts,
        },
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    if (updateError) {
      console.error('Notification preferences update error:', updateError)
      return { success: false, error: 'Failed to update notification preferences' }
    }

    revalidatePath('/settings')

    return { success: true, message: 'Notification preferences updated' }
  } catch (error) {
    console.error('Update notification preferences error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

/**
 * Change user password
 */
export async function changePassword(formData: FormData): Promise<ActionResult> {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'Not authenticated' }
    }

    const currentPassword = formData.get('currentPassword') as string
    const newPassword = formData.get('newPassword') as string
    const confirmPassword = formData.get('confirmPassword') as string

    // Validate inputs
    if (!currentPassword || !newPassword || !confirmPassword) {
      return { success: false, error: 'All password fields are required' }
    }

    if (newPassword !== confirmPassword) {
      return { success: false, error: 'New passwords do not match' }
    }

    if (newPassword.length < 8) {
      return { success: false, error: 'Password must be at least 8 characters' }
    }

    // Verify current password by attempting to sign in
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email!,
      password: currentPassword,
    })

    if (signInError) {
      return { success: false, error: 'Current password is incorrect' }
    }

    // Update password
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (updateError) {
      console.error('Password update error:', updateError)
      return { success: false, error: 'Failed to update password' }
    }

    return { success: true, message: 'Password changed successfully' }
  } catch (error) {
    console.error('Change password error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

/**
 * Request account deletion
 */
export async function requestAccountDeletion(): Promise<ActionResult> {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Mark account for deletion (soft delete)
    const { error: updateError } = await (supabase.from('profiles') as any)
      .update({
        deletion_requested_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    if (updateError) {
      console.error('Account deletion request error:', updateError)
      return { success: false, error: 'Failed to request account deletion' }
    }

    // Sign out the user
    await supabase.auth.signOut()

    return {
      success: true,
      message: 'Account deletion requested. Your account will be deleted within 30 days.'
    }
  } catch (error) {
    console.error('Request account deletion error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

/**
 * Get user settings/preferences
 */
export async function getUserSettings() {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return null
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    return {
      user,
      profile,
    }
  } catch (error) {
    console.error('Get user settings error:', error)
    return null
  }
}
