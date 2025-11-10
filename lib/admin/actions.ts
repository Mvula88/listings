/**
 * Admin Actions
 * Server-side functions for admin operations
 */

'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { logAdminAction, createAdminNotification } from '@/lib/supabase/admin-middleware'

// ============================================================================
// USER MANAGEMENT
// ============================================================================

export async function getUsers(params: {
  page?: number
  pageSize?: number
  search?: string
  userType?: string
  suspended?: boolean
}) {
  const supabase = await createClient()
  const { page = 1, pageSize = 20, search, userType, suspended } = params

  let query = supabase
    .from('profiles')
    .select('*, country:countries(*)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1)

  if (search) {
    query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`)
  }

  if (userType) {
    query = query.eq('user_type', userType)
  }

  if (suspended !== undefined) {
    query = query.eq('is_suspended', suspended)
  }

  const { data, error, count } = await query

  if (error) throw error

  return {
    users: data,
    pagination: {
      page,
      pageSize,
      totalCount: count || 0,
      totalPages: Math.ceil((count || 0) / pageSize),
    },
  }
}

export async function suspendUser(
  userId: string,
  reason: string,
  notes?: string,
  expiresAt?: string
) {
  const supabase = await createClient()

  // Get admin user
  const { data: { user: admin } } = await supabase.auth.getUser()
  if (!admin) throw new Error('Not authenticated')

  // Get user details before suspension
  const { data: userBefore } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  // Create suspension record
  const { error: suspensionError } = await (supabase
    .from('user_suspensions') as any)
    .insert({
      user_id: userId,
      suspended_by: admin.id,
      reason,
      notes,
      expires_at: expiresAt,
    })

  if (suspensionError) throw suspensionError

  // Update profile
  const { error: updateError } = await supabase
    .from('profiles')
    .update({
      is_suspended: true,
      suspended_until: expiresAt,
    })
    .eq('id', userId)

  if (updateError) throw updateError

  // Log action
  await logAdminAction(
    supabase,
    admin.id,
    'user.suspend',
    'user',
    userId,
    userBefore,
    { is_suspended: true, reason },
    { reason, notes, expires_at: expiresAt }
  )

  revalidatePath('/admin/users')
  return { success: true }
}

export async function unsuspendUser(userId: string) {
  const supabase = await createClient()

  const { data: { user: admin } } = await supabase.auth.getUser()
  if (!admin) throw new Error('Not authenticated')

  // Deactivate suspension records
  await (supabase
    .from('user_suspensions') as any)
    .update({
      is_active: false,
      lifted_at: new Date().toISOString(),
      lifted_by: admin.id,
    })
    .eq('user_id', userId)
    .eq('is_active', true)

  // Update profile
  const { error } = await supabase
    .from('profiles')
    .update({
      is_suspended: false,
      suspended_until: null,
    })
    .eq('id', userId)

  if (error) throw error

  await logAdminAction(
    supabase,
    admin.id,
    'user.unsuspend',
    'user',
    userId
  )

  revalidatePath('/admin/users')
  return { success: true }
}

export async function deleteUser(userId: string) {
  const supabase = await createClient()

  const { data: { user: admin } } = await supabase.auth.getUser()
  if (!admin) throw new Error('Not authenticated')

  // Get user data before deletion
  const { data: user } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  // Delete user (cascade will handle related records)
  const { error } = await supabase
    .from('profiles')
    .delete()
    .eq('id', userId)

  if (error) throw error

  await logAdminAction(
    supabase,
    admin.id,
    'user.delete',
    'user',
    userId,
    user,
    null
  )

  revalidatePath('/admin/users')
  return { success: true }
}

// ============================================================================
// PROPERTY MANAGEMENT
// ============================================================================

export async function getProperties(params: {
  page?: number
  pageSize?: number
  search?: string
  status?: string
  moderationStatus?: string
  featured?: boolean
}) {
  const supabase = await createClient()
  const { page = 1, pageSize = 20, search, status, moderationStatus, featured } = params

  let query = supabase
    .from('properties')
    .select(`
      *,
      seller:profiles!seller_id(*),
      country:countries(*),
      property_images(*)
    `, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1)

  if (search) {
    query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,city.ilike.%${search}%`)
  }

  if (status) {
    query = query.eq('status', status)
  }

  if (moderationStatus) {
    query = query.eq('moderation_status', moderationStatus)
  }

  if (featured !== undefined) {
    query = query.eq('is_featured', featured)
  }

  const { data, error, count } = await query

  if (error) throw error

  return {
    properties: data,
    pagination: {
      page,
      pageSize,
      totalCount: count || 0,
      totalPages: Math.ceil((count || 0) / pageSize),
    },
  }
}

export async function approveProperty(propertyId: string, notes?: string) {
  const supabase = await createClient()

  const { data: { user: admin } } = await supabase.auth.getUser()
  if (!admin) throw new Error('Not authenticated')

  // Get property and seller details before updating
  const { data: property } = await supabase
    .from('properties')
    .select('*, seller:profiles!seller_id(full_name, email), property_images(url)')
    .eq('id', propertyId)
    .single()

  const { error } = await supabase
    .from('properties')
    .update({
      moderation_status: 'approved',
      status: 'active',
      moderation_notes: notes,
      moderated_by: admin.id,
      moderated_at: new Date().toISOString(),
    })
    .eq('id', propertyId)

  if (error) throw error

  await logAdminAction(
    supabase,
    admin.id,
    'property.approve',
    'property',
    propertyId,
    null,
    { status: 'approved' }
  )

  // Send email notification
  if (property && property.seller) {
    const { sendPropertyApprovedEmail } = await import('@/lib/email/send-emails')
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    await sendPropertyApprovedEmail({
      to: property.seller.email,
      sellerName: property.seller.full_name || 'there',
      propertyTitle: property.title,
      propertyUrl: `${appUrl}/properties/${propertyId}`,
      propertyImage: property.property_images?.[0]?.url,
    })
  }

  revalidatePath('/admin/properties')
  return { success: true }
}

export async function rejectProperty(propertyId: string, reason: string) {
  const supabase = await createClient()

  const { data: { user: admin } } = await supabase.auth.getUser()
  if (!admin) throw new Error('Not authenticated')

  // Get property and seller details before updating
  const { data: property } = await supabase
    .from('properties')
    .select('*, seller:profiles!seller_id(full_name, email)')
    .eq('id', propertyId)
    .single()

  const { error } = await supabase
    .from('properties')
    .update({
      moderation_status: 'rejected',
      status: 'draft',
      moderation_notes: reason,
      moderated_by: admin.id,
      moderated_at: new Date().toISOString(),
    })
    .eq('id', propertyId)

  if (error) throw error

  await logAdminAction(
    supabase,
    admin.id,
    'property.reject',
    'property',
    propertyId,
    null,
    { status: 'rejected', reason }
  )

  // Send email notification
  if (property && property.seller) {
    const { sendPropertyRejectedEmail } = await import('@/lib/email/send-emails')
    await sendPropertyRejectedEmail({
      to: property.seller.email,
      sellerName: property.seller.full_name || 'there',
      propertyTitle: property.title,
      reason,
    })
  }

  revalidatePath('/admin/properties')
  return { success: true }
}

export async function featureProperty(propertyId: string, featuredUntil?: string) {
  const supabase = await createClient()

  const { data: { user: admin } } = await supabase.auth.getUser()
  if (!admin) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('properties')
    .update({
      is_featured: true,
      featured_until: featuredUntil,
    })
    .eq('id', propertyId)

  if (error) throw error

  await logAdminAction(
    supabase,
    admin.id,
    'property.feature',
    'property',
    propertyId
  )

  revalidatePath('/admin/properties')
  revalidatePath('/browse')
  return { success: true }
}

export async function unfeatureProperty(propertyId: string) {
  const supabase = await createClient()

  const { data: { user: admin } } = await supabase.auth.getUser()
  if (!admin) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('properties')
    .update({
      is_featured: false,
      featured_until: null,
    })
    .eq('id', propertyId)

  if (error) throw error

  await logAdminAction(
    supabase,
    admin.id,
    'property.unfeature',
    'property',
    propertyId
  )

  revalidatePath('/admin/properties')
  revalidatePath('/browse')
  return { success: true }
}

export async function deleteProperty(propertyId: string) {
  const supabase = await createClient()

  const { data: { user: admin } } = await supabase.auth.getUser()
  if (!admin) throw new Error('Not authenticated')

  const { data: property } = await supabase
    .from('properties')
    .select('*')
    .eq('id', propertyId)
    .single()

  const { error } = await supabase
    .from('properties')
    .delete()
    .eq('id', propertyId)

  if (error) throw error

  await logAdminAction(
    supabase,
    admin.id,
    'property.delete',
    'property',
    propertyId,
    property,
    null
  )

  revalidatePath('/admin/properties')
  return { success: true }
}

// ============================================================================
// LAWYER MANAGEMENT
// ============================================================================

export async function getLawyers(params: {
  page?: number
  pageSize?: number
  search?: string
  verified?: boolean
  available?: boolean
}) {
  const supabase = await createClient()
  const { page = 1, pageSize = 20, search, verified, available } = params

  let query = supabase
    .from('lawyers')
    .select(`
      *,
      profile:profiles!profile_id(*),
      country:countries(*)
    `, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1)

  if (search) {
    query = query.or(`firm_name.ilike.%${search}%,city.ilike.%${search}%`)
  }

  if (verified !== undefined) {
    query = query.eq('verified', verified)
  }

  if (available !== undefined) {
    query = query.eq('available', available)
  }

  const { data, error, count } = await query

  if (error) throw error

  return {
    lawyers: data,
    pagination: {
      page,
      pageSize,
      totalCount: count || 0,
      totalPages: Math.ceil((count || 0) / pageSize),
    },
  }
}

export async function verifyLawyer(lawyerId: string) {
  const supabase = await createClient()

  const { data: { user: admin } } = await supabase.auth.getUser()
  if (!admin) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('lawyers')
    .update({ verified: true })
    .eq('id', lawyerId)

  if (error) throw error

  await logAdminAction(
    supabase,
    admin.id,
    'lawyer.verify',
    'lawyer',
    lawyerId
  )

  // Create notification
  await createAdminNotification(
    supabase,
    'Lawyer Verified',
    'A lawyer has been verified and is now visible to users',
    'success',
    'normal',
    `/admin/lawyers/${lawyerId}`
  )

  revalidatePath('/admin/lawyers')
  revalidatePath('/lawyers')
  return { success: true }
}

export async function unverifyLawyer(lawyerId: string) {
  const supabase = await createClient()

  const { data: { user: admin } } = await supabase.auth.getUser()
  if (!admin) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('lawyers')
    .update({ verified: false })
    .eq('id', lawyerId)

  if (error) throw error

  await logAdminAction(
    supabase,
    admin.id,
    'lawyer.unverify',
    'lawyer',
    lawyerId
  )

  revalidatePath('/admin/lawyers')
  revalidatePath('/lawyers')
  return { success: true }
}

// ============================================================================
// TRANSACTION MANAGEMENT
// ============================================================================

export async function getTransactions(params: {
  page?: number
  pageSize?: number
  search?: string
  status?: string
  startDate?: string
  endDate?: string
}) {
  const supabase = await createClient()
  const { page = 1, pageSize = 20, search, status, startDate, endDate } = params

  let query = supabase
    .from('transactions')
    .select(`
      *,
      property:properties(*),
      buyer:profiles!buyer_id(*),
      seller:profiles!seller_id(*),
      lawyer_buyer:lawyers!lawyer_buyer_id(*),
      lawyer_seller:lawyers!lawyer_seller_id(*)
    `, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1)

  if (search) {
    query = query.or(`property.title.ilike.%${search}%,buyer.full_name.ilike.%${search}%,seller.full_name.ilike.%${search}%`)
  }

  if (status) {
    query = query.eq('status', status)
  }

  if (startDate) {
    query = query.gte('created_at', startDate)
  }

  if (endDate) {
    query = query.lte('created_at', endDate)
  }

  const { data, error, count } = await query

  if (error) throw error

  return {
    transactions: data,
    pagination: {
      page,
      pageSize,
      totalCount: count || 0,
      totalPages: Math.ceil((count || 0) / pageSize),
    },
  }
}

export async function cancelTransaction(transactionId: string, reason: string) {
  const supabase = await createClient()

  const { data: { user: admin } } = await supabase.auth.getUser()
  if (!admin) throw new Error('Not authenticated')

  const { data: transaction } = await supabase
    .from('transactions')
    .select('*')
    .eq('id', transactionId)
    .single()

  const { error } = await supabase
    .from('transactions')
    .update({
      status: 'cancelled',
      updated_at: new Date().toISOString(),
    })
    .eq('id', transactionId)

  if (error) throw error

  await logAdminAction(
    supabase,
    admin.id,
    'transaction.cancel',
    'transaction',
    transactionId,
    transaction,
    { status: 'cancelled', reason }
  )

  revalidatePath('/admin/transactions')
  return { success: true }
}

// ============================================================================
// ANALYTICS & STATS
// ============================================================================

export async function getPlatformStats() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('platform_stats_cache')
    .select('*')
    .order('stat_date', { ascending: false })
    .limit(1)
    .single()

  if (error) throw error

  return data
}

export async function refreshPlatformStats() {
  const supabase = await createClient()

  const { error } = await supabase.rpc('update_platform_stats')

  if (error) throw error

  revalidatePath('/admin')
  return { success: true }
}

export async function getAnalyticsData() {
  const supabase = await createClient()

  // Get user growth (last 30 days)
  const { data: userGrowth } = await supabase
    .from('profiles')
    .select('created_at')
    .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
    .order('created_at', { ascending: true })

  // Get property listings growth (last 30 days)
  const { data: propertyGrowth } = await supabase
    .from('properties')
    .select('created_at')
    .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
    .order('created_at', { ascending: true })

  // Get transaction growth (last 30 days)
  const { data: transactionGrowth } = await supabase
    .from('transactions')
    .select('created_at, agreed_price')
    .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
    .order('created_at', { ascending: true })

  // Get revenue by month (last 12 months)
  const { data: revenueData } = await supabase
    .from('payments')
    .select('created_at, amount, status')
    .eq('status', 'succeeded')
    .gte('created_at', new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString())
    .order('created_at', { ascending: true })

  // Get user types distribution
  const { data: userTypes } = await supabase
    .from('profiles')
    .select('user_type')

  // Get property statuses
  const { data: propertyStatuses } = await supabase
    .from('properties')
    .select('status')

  // Get transaction statuses
  const { data: transactionStatuses } = await supabase
    .from('transactions')
    .select('status')

  return {
    userGrowth,
    propertyGrowth,
    transactionGrowth,
    revenueData,
    userTypes,
    propertyStatuses,
    transactionStatuses,
  }
}

// ============================================================================
// CONTENT MODERATION
// ============================================================================

export async function getContentFlags(params: {
  page?: number
  pageSize?: number
  resourceType?: string
  status?: string
}) {
  const supabase = await createClient()
  const { page = 1, pageSize = 20, resourceType, status } = params

  let query = supabase
    .from('content_flags')
    .select(`
      *,
      flagged_by_user:profiles!flagged_by(*),
      reviewed_by_user:profiles!reviewed_by(*)
    `, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1)

  if (resourceType) {
    query = query.eq('resource_type', resourceType)
  }

  if (status) {
    query = query.eq('status', status)
  }

  const { data, error, count } = await query

  if (error) throw error

  return {
    flags: data,
    pagination: {
      page,
      pageSize,
      totalCount: count || 0,
      totalPages: Math.ceil((count || 0) / pageSize),
    },
  }
}

export async function reviewContentFlag(
  flagId: string,
  status: 'approved' | 'rejected',
  resolutionNotes?: string
) {
  const supabase = await createClient()

  const { data: { user: admin } } = await supabase.auth.getUser()
  if (!admin) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('content_flags')
    .update({
      status,
      reviewed_by: admin.id,
      reviewed_at: new Date().toISOString(),
      resolution_notes: resolutionNotes,
    })
    .eq('id', flagId)

  if (error) throw error

  await logAdminAction(
    supabase,
    admin.id,
    'content.moderate',
    'content_flag',
    flagId,
    null,
    { status, resolution_notes: resolutionNotes }
  )

  revalidatePath('/admin/moderation')
  return { success: true }
}

// ============================================================================
// AUDIT LOGS
// ============================================================================

export async function getAuditLogs(params: {
  page?: number
  pageSize?: number
  adminId?: string
  action?: string
  resourceType?: string
  startDate?: string
  endDate?: string
}) {
  const supabase = await createClient()
  const { page = 1, pageSize = 50, adminId, action, resourceType, startDate, endDate } = params

  let query = supabase
    .from('audit_logs')
    .select(`
      *,
      admin:profiles!admin_id(*)
    `, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1)

  if (adminId) {
    query = query.eq('admin_id', adminId)
  }

  if (action) {
    query = query.eq('action', action)
  }

  if (resourceType) {
    query = query.eq('resource_type', resourceType)
  }

  if (startDate) {
    query = query.gte('created_at', startDate)
  }

  if (endDate) {
    query = query.lte('created_at', endDate)
  }

  const { data, error, count } = await query

  if (error) throw error

  return {
    logs: data,
    pagination: {
      page,
      pageSize,
      totalCount: count || 0,
      totalPages: Math.ceil((count || 0) / pageSize),
    },
  }
}

// ============================================================================
// PLATFORM SETTINGS
// ============================================================================

export async function getPlatformSettings() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('platform_settings')
    .select('*')
    .order('key')

  if (error) throw error

  return data
}

export async function updatePlatformSetting(key: string, value: any) {
  const supabase = await createClient()

  const { data: { user: admin } } = await supabase.auth.getUser()
  if (!admin) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('platform_settings')
    .update({
      value,
      updated_by: admin.id,
      updated_at: new Date().toISOString(),
    })
    .eq('key', key)

  if (error) throw error

  await logAdminAction(
    supabase,
    admin.id,
    'settings.update',
    'platform_settings',
    key,
    null,
    { value }
  )

  revalidatePath('/admin/settings')
  return { success: true }
}
