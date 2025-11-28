'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface Notification {
  id: string
  user_id: string
  type: string
  title: string
  message: string
  data?: Record<string, any>
  read: boolean
  read_at: string | null
  created_at: string
}

interface ActionResult {
  success: boolean
  error?: string
  message?: string
}

/**
 * Get user notifications
 */
export async function getNotifications(limit: number = 10): Promise<{
  notifications: Notification[]
  unreadCount: number
}> {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { notifications: [], unreadCount: 0 }
    }

    // Get notifications
    const { data: notifications, error } = await (supabase
      .from('notifications') as any)
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching notifications:', error)
      return { notifications: [], unreadCount: 0 }
    }

    // Get unread count
    const { count, error: countError } = await (supabase
      .from('notifications') as any)
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('read', false)

    if (countError) {
      console.error('Error counting unread notifications:', countError)
    }

    return {
      notifications: notifications || [],
      unreadCount: count || 0
    }
  } catch (error) {
    console.error('Get notifications error:', error)
    return { notifications: [], unreadCount: 0 }
  }
}

/**
 * Mark a single notification as read
 */
export async function markNotificationAsRead(notificationId: string): Promise<ActionResult> {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    const { error } = await (supabase
      .from('notifications') as any)
      .update({
        read: true,
        read_at: new Date().toISOString()
      })
      .eq('id', notificationId)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error marking notification as read:', error)
      return { success: false, error: 'Failed to mark notification as read' }
    }

    revalidatePath('/dashboard')
    return { success: true }
  } catch (error) {
    console.error('Mark notification as read error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

/**
 * Mark all notifications as read
 */
export async function markAllNotificationsAsRead(): Promise<ActionResult> {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    const { error } = await (supabase
      .from('notifications') as any)
      .update({
        read: true,
        read_at: new Date().toISOString()
      })
      .eq('user_id', user.id)
      .eq('read', false)

    if (error) {
      console.error('Error marking all notifications as read:', error)
      return { success: false, error: 'Failed to mark notifications as read' }
    }

    revalidatePath('/dashboard')
    return { success: true, message: 'All notifications marked as read' }
  } catch (error) {
    console.error('Mark all notifications as read error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

/**
 * Delete a notification
 */
export async function deleteNotification(notificationId: string): Promise<ActionResult> {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    const { error } = await (supabase
      .from('notifications') as any)
      .delete()
      .eq('id', notificationId)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error deleting notification:', error)
      return { success: false, error: 'Failed to delete notification' }
    }

    revalidatePath('/dashboard')
    return { success: true }
  } catch (error) {
    console.error('Delete notification error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

/**
 * Clear all notifications
 */
export async function clearAllNotifications(): Promise<ActionResult> {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    const { error } = await (supabase
      .from('notifications') as any)
      .delete()
      .eq('user_id', user.id)

    if (error) {
      console.error('Error clearing notifications:', error)
      return { success: false, error: 'Failed to clear notifications' }
    }

    revalidatePath('/dashboard')
    return { success: true, message: 'All notifications cleared' }
  } catch (error) {
    console.error('Clear all notifications error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}
