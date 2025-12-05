/**
 * Admin Actions
 * Server-side functions for admin operations
 */

'use server'

import { createClient, createServiceClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
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

export async function createUser(params: {
  email: string
  full_name: string
  phone?: string
  user_type: string
  password: string
}): Promise<{ success?: boolean; userId?: string; error?: string }> {
  const supabase = await createClient()
  const serviceClient = createServiceClient()

  // Get admin user
  const { data: { user: admin } } = await supabase.auth.getUser()
  if (!admin) return { error: 'Not authenticated' }

  // Verify admin has permission
  const { data: adminProfile } = await (supabase
    .from('admin_profiles') as any)
    .select('role')
    .eq('id', admin.id)
    .eq('is_active', true)
    .single() as { data: { role: string } | null }

  if (!adminProfile || !['super_admin', 'admin'].includes(adminProfile.role)) {
    return { error: 'Not authorized to create users' }
  }

  // Create auth user using Supabase Admin API
  const { data: authData, error: authError } = await serviceClient.auth.admin.createUser({
    email: params.email,
    password: params.password,
    email_confirm: true, // Auto-confirm email for admin-created users
    user_metadata: {
      full_name: params.full_name,
    },
  })

  if (authError) {
    console.error('Failed to create auth user:', authError)
    return { error: authError.message }
  }

  if (!authData.user) {
    return { error: 'Failed to create user' }
  }

  // Create or update profile (use upsert in case a trigger already created the profile)
  const { error: profileError } = await (serviceClient
    .from('profiles') as any)
    .upsert({
      id: authData.user.id,
      email: params.email,
      full_name: params.full_name,
      phone: params.phone || null,
      user_type: params.user_type,
    }, { onConflict: 'id' })

  if (profileError) {
    console.error('Failed to create profile:', profileError)
    // Try to clean up auth user if profile creation fails
    await serviceClient.auth.admin.deleteUser(authData.user.id)
    return { error: profileError.message }
  }

  // Log action (optional)
  try {
    await logAdminAction(
      supabase,
      admin.id,
      'user.create',
      'user',
      authData.user.id,
      null,
      { email: params.email, full_name: params.full_name, user_type: params.user_type }
    )
  } catch (err) {
    console.warn('Could not log admin action:', err)
  }

  revalidatePath('/admin/users')
  return { success: true, userId: authData.user.id }
}

export async function suspendUser(
  userId: string,
  reason: string,
  notes?: string,
  expiresAt?: string
) {
  const supabase = await createClient()
  const serviceClient = createServiceClient()

  // Get admin user
  const { data: { user: admin } } = await supabase.auth.getUser()
  if (!admin) throw new Error('Not authenticated')

  // Verify admin has permission (check admin_profiles)
  // Note: admin_profiles uses 'id' as the user ID, not 'user_id'
  const { data: adminProfile } = await (supabase
    .from('admin_profiles') as any)
    .select('role')
    .eq('id', admin.id)
    .eq('is_active', true)
    .single() as { data: { role: string } | null }

  if (!adminProfile || !['super_admin', 'admin'].includes(adminProfile.role)) {
    throw new Error('Not authorized to suspend users')
  }

  // Get user details before suspension
  const { data: userBefore } = await serviceClient
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  // Try to create suspension record (optional - table may not exist)
  try {
    await (serviceClient
      .from('user_suspensions') as any)
      .insert({
        user_id: userId,
        suspended_by: admin.id,
        reason,
        notes,
        expires_at: expiresAt,
      })
  } catch (err) {
    // Ignore if table doesn't exist
    console.warn('Could not create suspension record:', err)
  }

  // Update profile using service client (bypasses RLS)
  const { error: updateError } = await (serviceClient
    .from('profiles') as any)
    .update({
      is_suspended: true,
    })
    .eq('id', userId)

  if (updateError) {
    console.error('Failed to suspend user:', updateError)
    throw new Error(`Failed to suspend user: ${updateError.message}`)
  }

  // Log action (optional)
  try {
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
  } catch (err) {
    console.warn('Could not log admin action:', err)
  }

  revalidatePath('/admin/users')
  return { success: true }
}

export async function unsuspendUser(userId: string) {
  const supabase = await createClient()
  const serviceClient = createServiceClient()

  const { data: { user: admin } } = await supabase.auth.getUser()
  if (!admin) throw new Error('Not authenticated')

  // Verify admin has permission
  // Note: admin_profiles uses 'id' as the user ID, not 'user_id'
  const { data: adminProfile } = await (supabase
    .from('admin_profiles') as any)
    .select('role')
    .eq('id', admin.id)
    .eq('is_active', true)
    .single() as { data: { role: string } | null }

  if (!adminProfile || !['super_admin', 'admin'].includes(adminProfile.role)) {
    throw new Error('Not authorized to unsuspend users')
  }

  // Try to deactivate suspension records (optional - table may not exist)
  try {
    await (serviceClient
      .from('user_suspensions') as any)
      .update({
        is_active: false,
        lifted_at: new Date().toISOString(),
        lifted_by: admin.id,
      })
      .eq('user_id', userId)
      .eq('is_active', true)
  } catch (err) {
    console.warn('Could not update suspension records:', err)
  }

  // Update profile using service client (bypasses RLS)
  const { error } = await (serviceClient
    .from('profiles') as any)
    .update({
      is_suspended: false,
    })
    .eq('id', userId)

  if (error) {
    console.error('Failed to unsuspend user:', error)
    throw new Error(`Failed to unsuspend user: ${error.message}`)
  }

  // Log action (optional)
  try {
    await logAdminAction(
      supabase,
      admin.id,
      'user.unsuspend',
      'user',
      userId
    )
  } catch (err) {
    console.warn('Could not log admin action:', err)
  }

  revalidatePath('/admin/users')
  return { success: true }
}

export async function deleteUser(userId: string) {
  const supabase = await createClient()
  const serviceClient = createServiceClient()

  const { data: { user: admin } } = await supabase.auth.getUser()
  if (!admin) throw new Error('Not authenticated')

  // Verify admin has permission
  // Note: admin_profiles uses 'id' as the user ID, not 'user_id'
  const { data: adminProfile } = await (supabase
    .from('admin_profiles') as any)
    .select('role')
    .eq('id', admin.id)
    .eq('is_active', true)
    .single() as { data: { role: string } | null }

  if (!adminProfile || !['super_admin', 'admin'].includes(adminProfile.role)) {
    throw new Error('Not authorized to delete users')
  }

  // Get user data before deletion
  const { data: user } = await serviceClient
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single() as { data: { full_name: string | null } | null }

  // Soft delete - mark as deleted rather than hard delete
  // This preserves data integrity with foreign keys
  // Store original name for potential recovery
  const { error } = await (serviceClient
    .from('profiles') as any)
    .update({
      is_suspended: true,
      is_deleted: true,
      deleted_at: new Date().toISOString(),
      deleted_by: admin.id,
      original_name: user?.full_name || null,
      full_name: '[Deleted User]',
    })
    .eq('id', userId)

  if (error) {
    console.error('Failed to delete user:', error)
    throw new Error(`Failed to delete user: ${error.message}`)
  }

  // Log action (optional)
  try {
    await logAdminAction(
      supabase,
      admin.id,
      'user.delete',
      'user',
      userId,
      user,
      null
    )
  } catch (err) {
    console.warn('Could not log admin action:', err)
  }

  revalidatePath('/admin/users')
  return { success: true }
}

export async function updateUser(
  userId: string,
  updates: {
    full_name?: string
    phone?: string
    user_type?: string
    country_id?: string
  }
): Promise<{ success?: boolean; error?: string }> {
  const supabase = await createClient()
  const serviceClient = createServiceClient()

  // Get admin user
  const { data: { user: admin } } = await supabase.auth.getUser()
  if (!admin) return { error: 'Not authenticated' }

  // Verify admin has permission using service client to bypass RLS
  const { data: adminProfile, error: adminError } = await serviceClient
    .from('admin_profiles')
    .select('role')
    .eq('id', admin.id)
    .eq('is_active', true)
    .single() as { data: { role: string } | null; error: any }

  if (adminError) {
    console.error('Failed to get admin profile:', adminError)
    return { error: 'Failed to verify admin permissions' }
  }

  if (!adminProfile || !['super_admin', 'admin'].includes(adminProfile.role)) {
    return { error: 'Not authorized to update users' }
  }

  // Get user data before update for logging
  const { data: userBefore } = await serviceClient
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  // Update profile using service client (bypasses RLS)
  const { error: updateError } = await (serviceClient
    .from('profiles') as any)
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)

  if (updateError) {
    console.error('Failed to update user:', updateError)
    return { error: updateError.message }
  }

  // Log action (optional)
  try {
    await logAdminAction(
      supabase,
      admin.id,
      'user.update',
      'user',
      userId,
      userBefore,
      updates
    )
  } catch (err) {
    console.warn('Could not log admin action:', err)
  }

  revalidatePath('/admin/users')
  revalidatePath(`/admin/users/${userId}`)
  return { success: true }
}

export async function restoreUser(userId: string): Promise<{ success?: boolean; error?: string }> {
  const supabase = await createClient()
  const serviceClient = createServiceClient()

  const { data: { user: admin } } = await supabase.auth.getUser()
  if (!admin) return { error: 'Not authenticated' }

  // Verify admin has permission using service client to bypass RLS
  const { data: adminProfile, error: adminError } = await serviceClient
    .from('admin_profiles')
    .select('role')
    .eq('id', admin.id)
    .eq('is_active', true)
    .single() as { data: { role: string } | null; error: any }

  if (adminError) {
    console.error('Failed to get admin profile:', adminError)
    return { error: 'Failed to verify admin permissions' }
  }

  if (!adminProfile || !['super_admin', 'admin'].includes(adminProfile.role)) {
    return { error: 'Not authorized to restore users' }
  }

  // Get user data to restore original name
  const { data: user, error: userError } = await serviceClient
    .from('profiles')
    .select('original_name, full_name')
    .eq('id', userId)
    .single() as { data: { original_name: string | null; full_name: string | null } | null; error: any }

  if (userError) {
    console.error('Failed to get user data:', userError)
    return { error: 'Failed to get user data' }
  }

  // Restore user - undelete and unsuspend
  const { error } = await (serviceClient
    .from('profiles') as any)
    .update({
      is_suspended: false,
      is_deleted: false,
      deleted_at: null,
      deleted_by: null,
      full_name: user?.original_name || user?.full_name || 'Restored User',
      original_name: null,
    })
    .eq('id', userId)

  if (error) {
    console.error('Failed to restore user:', error)
    return { error: `Failed to restore user: ${error.message}` }
  }

  // Log action (optional)
  try {
    await logAdminAction(
      serviceClient,
      admin.id,
      'user.restore',
      'user',
      userId,
      { is_deleted: true },
      { is_deleted: false }
    )
  } catch (err) {
    console.warn('Could not log admin action:', err)
  }

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
    query = query.eq('featured', featured)
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
    .single() as {
      data: {
        id: string
        title: string
        seller: { full_name: string; email: string } | null
        property_images: Array<{ url: string }> | null
        [key: string]: any
      } | null
      error: any
    }

  const { error } = await (supabase
    .from('properties') as any)
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
    .single() as {
      data: {
        id: string
        title: string
        seller: { full_name: string; email: string } | null
        [key: string]: any
      } | null
      error: any
    }

  const { error } = await (supabase
    .from('properties') as any)
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

export async function featureProperty(propertyId: string, featuredUntil?: string, premium?: boolean): Promise<{ success?: boolean; error?: string }> {
  const supabase = await createClient()
  const serviceClient = createServiceClient()

  const { data: { user: admin } } = await supabase.auth.getUser()
  if (!admin) return { error: 'Not authenticated' }

  const { error } = await (serviceClient
    .from('properties') as any)
    .update({
      featured: true,
      featured_until: featuredUntil,
      is_premium: premium || false,
    })
    .eq('id', propertyId)

  if (error) {
    console.error('Failed to feature property:', error)
    return { error: error.message }
  }

  try {
    await logAdminAction(
      serviceClient,
      admin.id,
      'property.feature',
      'property',
      propertyId
    )
  } catch (err) {
    console.warn('Could not log admin action:', err)
  }

  revalidatePath('/admin/properties')
  revalidatePath('/browse')
  return { success: true }
}

export async function unfeatureProperty(propertyId: string): Promise<{ success?: boolean; error?: string }> {
  const supabase = await createClient()
  const serviceClient = createServiceClient()

  const { data: { user: admin } } = await supabase.auth.getUser()
  if (!admin) return { error: 'Not authenticated' }

  const { error } = await (serviceClient
    .from('properties') as any)
    .update({
      featured: false,
      featured_until: null,
      is_premium: false,
    })
    .eq('id', propertyId)

  if (error) {
    console.error('Failed to unfeature property:', error)
    return { error: error.message }
  }

  try {
    await logAdminAction(
      serviceClient,
      admin.id,
      'property.unfeature',
      'property',
      propertyId
    )
  } catch (err) {
    console.warn('Could not log admin action:', err)
  }

  revalidatePath('/admin/properties')
  revalidatePath('/browse')
  return { success: true }
}

export async function deleteProperty(propertyId: string): Promise<{ success?: boolean; error?: string }> {
  const supabase = await createClient()
  const serviceClient = createServiceClient()

  const { data: { user: admin } } = await supabase.auth.getUser()
  if (!admin) return { error: 'Not authenticated' }

  const { data: property } = await serviceClient
    .from('properties')
    .select('*')
    .eq('id', propertyId)
    .single()

  const { error } = await (serviceClient
    .from('properties') as any)
    .delete()
    .eq('id', propertyId)

  if (error) {
    console.error('Failed to delete property:', error)
    return { error: error.message }
  }

  try {
    await logAdminAction(
      serviceClient,
      admin.id,
      'property.delete',
      'property',
      propertyId,
      property,
      null
    )
  } catch (err) {
    console.warn('Could not log admin action:', err)
  }

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

  const { error } = await (supabase
    .from('lawyers') as any)
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

  const { error } = await (supabase
    .from('lawyers') as any)
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
      property:properties(id, title, city, price, currency),
      buyer:profiles!buyer_id(id, full_name, email),
      seller:profiles!seller_id(id, full_name, email)
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

  const { error } = await (supabase
    .from('transactions') as any)
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

export async function getTransactionDetails(transactionId: string) {
  const supabase = await createClient()
  const serviceClient = createServiceClient()

  // Verify admin access
  const { data: { user: admin } } = await supabase.auth.getUser()
  if (!admin) throw new Error('Not authenticated')

  const { data: adminProfile } = await serviceClient
    .from('admin_profiles')
    .select('role')
    .eq('id', admin.id)
    .eq('is_active', true)
    .single() as { data: { role: string } | null }

  if (!adminProfile || !['super_admin', 'admin'].includes(adminProfile.role)) {
    throw new Error('Not authorized to view transaction details')
  }

  // Get full transaction details - using simpler query to avoid relationship issues
  const { data: transaction, error } = await serviceClient
    .from('transactions')
    .select(`
      *,
      property:properties(
        id, title, city, country_id, price, currency, description, bedrooms, bathrooms,
        property_images(url)
      ),
      buyer:profiles!transactions_buyer_id_fkey(id, full_name, email, phone, avatar_url),
      seller:profiles!transactions_seller_id_fkey(id, full_name, email, phone, avatar_url)
    `)
    .eq('id', transactionId)
    .single()

  if (error) {
    console.error('Transaction fetch error:', error)
    throw new Error(`Failed to fetch transaction: ${error.message || error.code || 'Unknown error'}`)
  }

  if (!transaction) {
    throw new Error('Transaction not found')
  }

  // Log admin access
  try {
    await logAdminAction(
      serviceClient,
      admin.id,
      'transaction.view_details',
      'transaction',
      transactionId,
      null,
      { accessed_at: new Date().toISOString() }
    )
  } catch (err) {
    console.warn('Could not log admin action:', err)
  }

  return transaction
}

export async function getTransactionMessages(transactionId: string) {
  const supabase = await createClient()
  const serviceClient = createServiceClient()

  // Verify admin access
  const { data: { user: admin } } = await supabase.auth.getUser()
  if (!admin) throw new Error('Not authenticated')

  const { data: adminProfile } = await serviceClient
    .from('admin_profiles')
    .select('role')
    .eq('id', admin.id)
    .eq('is_active', true)
    .single() as { data: { role: string } | null }

  if (!adminProfile || !['super_admin', 'admin'].includes(adminProfile.role)) {
    throw new Error('Not authorized to view messages')
  }

  // Get transaction to find related conversation/property
  const { data: transaction } = await serviceClient
    .from('transactions')
    .select('id, property_id, buyer_id, seller_id')
    .eq('id', transactionId)
    .single() as { data: { id: string; property_id: string; buyer_id: string; seller_id: string } | null }

  if (!transaction) throw new Error('Transaction not found')

  // Get messages directly linked to transaction OR from conversations about the property between buyer/seller
  const { data: messages, error } = await serviceClient
    .from('messages')
    .select(`
      id,
      content,
      created_at,
      read,
      sender:profiles!sender_id(id, full_name, email, avatar_url),
      recipient:profiles!recipient_id(id, full_name, email, avatar_url)
    `)
    .or(`transaction_id.eq.${transactionId},and(conversation_id.in.(select id from conversations where property_id='${transaction.property_id}'),or(sender_id.eq.${transaction.buyer_id},sender_id.eq.${transaction.seller_id}))`)
    .order('created_at', { ascending: true })

  // Fallback: if the complex query doesn't work, try simpler approach
  let finalMessages = messages
  if (error || !messages) {
    // Try getting messages from conversations about this property between buyer and seller
    const { data: conversations } = await serviceClient
      .from('conversations')
      .select('id')
      .eq('property_id', transaction.property_id) as { data: { id: string }[] | null }

    if (conversations && conversations.length > 0) {
      const conversationIds = conversations.map(c => c.id)
      const { data: convMessages } = await serviceClient
        .from('messages')
        .select(`
          id,
          content,
          created_at,
          read,
          sender:profiles!sender_id(id, full_name, email, avatar_url),
          recipient:profiles!recipient_id(id, full_name, email, avatar_url)
        `)
        .in('conversation_id', conversationIds)
        .order('created_at', { ascending: true })

      finalMessages = convMessages
    }
  }

  // Log admin access to messages
  try {
    await logAdminAction(
      serviceClient,
      admin.id,
      'transaction.view_messages',
      'transaction',
      transactionId,
      null,
      {
        accessed_at: new Date().toISOString(),
        message_count: finalMessages?.length || 0,
        reason: 'admin_oversight'
      }
    )
  } catch (err) {
    console.warn('Could not log admin action:', err)
  }

  return finalMessages || []
}

// ============================================================================
// ANALYTICS & STATS
// ============================================================================

export async function getPlatformStats(): Promise<{
  total_revenue?: number
  conversion_rate?: number
  new_users_month?: number
  total_users?: number
  total_properties?: number
  active_listings?: number
  pending_verifications?: number
  total_transactions?: number
  avg_property_price?: number
  avg_days_to_close?: number
  [key: string]: any
} | null> {
  const supabase = await createClient()

  // First try to get cached stats
  const { data, error } = await supabase
    .from('platform_stats_cache')
    .select('*')
    .order('stat_date', { ascending: false })
    .limit(1)
    .maybeSingle()

  // If cache is empty or error, compute stats directly
  if (error || !data) {
    // Compute real-time stats from source tables
    const [
      { count: totalUsers },
      { count: totalProperties },
      { count: activeProperties },
      { count: totalTransactions },
      { count: completedTransactions },
      { count: totalLawyers },
      { count: verifiedLawyers },
      { data: avgPrice },
    ] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('properties').select('*', { count: 'exact', head: true }),
      supabase.from('properties').select('*', { count: 'exact', head: true }).eq('status', 'active'),
      supabase.from('transactions').select('*', { count: 'exact', head: true }),
      supabase.from('transactions').select('*', { count: 'exact', head: true }).eq('status', 'completed'),
      supabase.from('lawyers').select('*', { count: 'exact', head: true }),
      supabase.from('lawyers').select('*', { count: 'exact', head: true }).eq('verified', true),
      supabase.from('properties').select('price').eq('status', 'active'),
    ])

    const avgPropertyPrice = avgPrice && avgPrice.length > 0
      ? avgPrice.reduce((sum: number, p: any) => sum + (p.price || 0), 0) / avgPrice.length
      : 0

    const conversionRate = totalTransactions && totalTransactions > 0
      ? ((completedTransactions || 0) / totalTransactions)
      : 0

    return {
      total_users: totalUsers || 0,
      total_properties: totalProperties || 0,
      active_listings: activeProperties || 0,
      total_transactions: totalTransactions || 0,
      completed_transactions: completedTransactions || 0,
      total_lawyers: totalLawyers || 0,
      verified_lawyers: verifiedLawyers || 0,
      avg_property_price: avgPropertyPrice,
      conversion_rate: conversionRate,
      total_revenue: 0,
      avg_days_to_close: 0,
    }
  }

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

  try {
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

    if (error) {
      console.error('Error fetching content flags:', error)
      return {
        flags: [],
        pagination: { page, pageSize, totalCount: 0, totalPages: 0 },
      }
    }

    return {
      flags: data || [],
      pagination: {
        page,
        pageSize,
        totalCount: count || 0,
        totalPages: Math.ceil((count || 0) / pageSize),
      },
    }
  } catch (err) {
    console.error('Content flags error:', err)
    return {
      flags: [],
      pagination: { page, pageSize, totalCount: 0, totalPages: 0 },
    }
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

  const { error } = await (supabase
    .from('content_flags') as any)
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

  try {
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

    if (action && action.trim()) {
      query = query.eq('action', action.trim())
    }

    if (resourceType && resourceType.trim()) {
      query = query.eq('resource_type', resourceType.trim())
    }

    if (startDate) {
      query = query.gte('created_at', startDate)
    }

    if (endDate) {
      query = query.lte('created_at', endDate)
    }

    const { data, error, count } = await query

    if (error) {
      console.error('Error fetching audit logs:', error)
      return {
        logs: [],
        pagination: { page, pageSize, totalCount: 0, totalPages: 0 },
      }
    }

    return {
      logs: data || [],
      pagination: {
        page,
        pageSize,
        totalCount: count || 0,
        totalPages: Math.ceil((count || 0) / pageSize),
      },
    }
  } catch (err) {
    console.error('Audit logs error:', err)
    return {
      logs: [],
      pagination: { page, pageSize, totalCount: 0, totalPages: 0 },
    }
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
    .order('category')
    .order('key')

  if (error) throw error

  // Parse JSON values and ensure proper types
  return (data || []).map((setting: { key: string; value: unknown; description: string | null; category: string | null; created_at: string; updated_at: string; updated_by: string | null }) => ({
    key: setting.key,
    value: parseSettingValue(setting.value, setting.key),
    description: setting.description,
    category: setting.category,
    created_at: setting.created_at,
    updated_at: setting.updated_at,
    updated_by: setting.updated_by,
  }))
}

// Helper to parse setting values to proper types
function parseSettingValue(value: any, _key: string): any {
  // If already parsed (JSONB)
  if (typeof value !== 'string') return value

  // Try JSON parse
  try {
    const parsed = JSON.parse(value)
    return parsed
  } catch {
    // Return as-is if not valid JSON
    return value
  }
}

export async function updatePlatformSetting(key: string, value: any) {
  const supabase = await createClient()

  const { data: { user: admin } } = await supabase.auth.getUser()
  if (!admin) throw new Error('Not authenticated')

  // Get old value for logging
  const { data: oldSetting } = await supabase
    .from('platform_settings')
    .select('value')
    .eq('key', key)
    .single() as { data: { value: unknown } | null }

  const { error } = await (supabase
    .from('platform_settings') as any)
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
    { value: oldSetting?.value },
    { value }
  )

  // Clear the settings cache so changes take effect immediately
  const { clearSettingsCache } = await import('@/lib/settings')
  clearSettingsCache()

  revalidatePath('/admin/settings')
  revalidatePath('/') // Revalidate home page for maintenance mode etc.
  return { success: true }
}
