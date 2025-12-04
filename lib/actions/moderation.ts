'use server'

import { createClient, createServiceClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { ModerationAction, ModerationStatus } from '@/lib/types/database'
import { createNotification } from './notifications'

export type { ModerationAction }
export type ModerationFilter = 'all' | 'pending' | 'flagged' | 'approved' | 'rejected'

interface ActionResult {
  success: boolean
  error?: string
}

/**
 * Check if current user is a moderator or admin
 * Uses service client to bypass RLS on admin_profiles table
 */
async function checkModeratorAccess(): Promise<{ userId: string } | { error: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Use service client to bypass RLS on admin_profiles
  const serviceClient = createServiceClient()
  const { data: adminProfile } = await serviceClient
    .from('admin_profiles')
    .select('role, is_active')
    .eq('id', user.id)
    .eq('is_active', true)
    .single<{ role: string; is_active: boolean }>()

  if (!adminProfile) {
    return { error: 'Not authorized - moderator access required' }
  }

  // Update last_active timestamp using service client
  await (serviceClient
    .from('admin_profiles') as any)
    .update({ last_active: new Date().toISOString() })
    .eq('id', user.id)

  return { userId: user.id }
}

/**
 * Approve a property listing
 */
export async function approveProperty(propertyId: string, notes?: string): Promise<ActionResult> {
  const access = await checkModeratorAccess()
  if ('error' in access) {
    return { success: false, error: access.error }
  }

  const supabase = await createClient()

  // Get property details for notification
  const { data: property } = await (supabase
    .from('properties') as any)
    .select('title, seller_id')
    .eq('id', propertyId)
    .single()

  // Update property moderation status AND set status to active (makes it visible)
  const { error: updateError } = await (supabase
    .from('properties') as any)
    .update({
      status: 'active', // Make listing visible to public
      moderation_status: 'approved',
      moderation_notes: null,
      moderated_by: access.userId,
      moderated_at: new Date().toISOString()
    })
    .eq('id', propertyId)

  if (updateError) {
    return { success: false, error: 'Failed to approve property' }
  }

  // Create review record
  await (supabase.from('property_reviews') as any).insert({
    property_id: propertyId,
    reviewer_id: access.userId,
    action: 'approved',
    notes
  })

  // Notify seller that their property was approved
  if (property?.seller_id) {
    await createNotification({
      userId: property.seller_id,
      type: 'property_approved',
      title: 'Property Approved',
      message: `Your property "${property.title}" has been approved and is now visible to buyers.`,
      data: {
        property_id: propertyId,
        property_title: property.title,
      },
    })
  }

  revalidatePath('/moderator/listings')
  revalidatePath(`/moderator/listings/${propertyId}`)
  revalidatePath('/browse')

  return { success: true }
}

/**
 * Reject a property listing with a reason
 */
export async function rejectProperty(
  propertyId: string,
  reason: string,
  notes?: string
): Promise<ActionResult> {
  const access = await checkModeratorAccess()
  if ('error' in access) {
    return { success: false, error: access.error }
  }

  if (!reason || reason.trim().length === 0) {
    return { success: false, error: 'Rejection reason is required' }
  }

  const supabase = await createClient()

  // Get property details for notification
  const { data: property } = await (supabase
    .from('properties') as any)
    .select('title, seller_id')
    .eq('id', propertyId)
    .single()

  // Update property moderation status
  const { error: updateError } = await (supabase
    .from('properties') as any)
    .update({
      moderation_status: 'rejected',
      moderation_notes: reason,
      moderated_by: access.userId,
      moderated_at: new Date().toISOString()
    })
    .eq('id', propertyId)

  if (updateError) {
    return { success: false, error: 'Failed to reject property' }
  }

  // Create review record
  await (supabase.from('property_reviews') as any).insert({
    property_id: propertyId,
    reviewer_id: access.userId,
    action: 'rejected',
    reason,
    notes
  })

  // Notify seller that their property was rejected
  if (property?.seller_id) {
    await createNotification({
      userId: property.seller_id,
      type: 'property_rejected',
      title: 'Property Needs Changes',
      message: `Your property "${property.title}" requires changes: ${reason}`,
      data: {
        property_id: propertyId,
        property_title: property.title,
        rejection_reason: reason,
      },
    })
  }

  revalidatePath('/moderator/listings')
  revalidatePath(`/moderator/listings/${propertyId}`)
  revalidatePath('/browse')

  return { success: true }
}

/**
 * Flag a property for review
 */
export async function flagProperty(propertyId: string, reason: string): Promise<ActionResult> {
  const access = await checkModeratorAccess()
  if ('error' in access) {
    return { success: false, error: access.error }
  }

  const supabase = await createClient()

  // Get property details for notification
  const { data: property } = await (supabase
    .from('properties') as any)
    .select('title, seller_id')
    .eq('id', propertyId)
    .single()

  // Update property moderation status
  const { error: updateError } = await (supabase
    .from('properties') as any)
    .update({
      moderation_status: 'flagged',
      moderation_notes: reason,
      moderated_by: access.userId,
      moderated_at: new Date().toISOString()
    })
    .eq('id', propertyId)

  if (updateError) {
    return { success: false, error: 'Failed to flag property' }
  }

  // Create review record
  await (supabase.from('property_reviews') as any).insert({
    property_id: propertyId,
    reviewer_id: access.userId,
    action: 'flagged',
    reason
  })

  // Notify seller that their property was flagged
  if (property?.seller_id) {
    await createNotification({
      userId: property.seller_id,
      type: 'property_flagged',
      title: 'Property Under Review',
      message: `Your property "${property.title}" has been flagged for review: ${reason}`,
      data: {
        property_id: propertyId,
        property_title: property.title,
        flag_reason: reason,
      },
    })
  }

  revalidatePath('/moderator/listings')
  revalidatePath(`/moderator/listings/${propertyId}`)

  return { success: true }
}

/**
 * Remove flag from a property
 */
export async function unflagProperty(propertyId: string): Promise<ActionResult> {
  const access = await checkModeratorAccess()
  if ('error' in access) {
    return { success: false, error: access.error }
  }

  const supabase = await createClient()

  // Update property moderation status back to approved
  const { error: updateError } = await (supabase
    .from('properties') as any)
    .update({
      moderation_status: 'approved',
      moderation_notes: null,
      moderated_by: access.userId,
      moderated_at: new Date().toISOString()
    })
    .eq('id', propertyId)

  if (updateError) {
    return { success: false, error: 'Failed to unflag property' }
  }

  // Create review record
  await (supabase.from('property_reviews') as any).insert({
    property_id: propertyId,
    reviewer_id: access.userId,
    action: 'unflagged'
  })

  revalidatePath('/moderator/listings')
  revalidatePath(`/moderator/listings/${propertyId}`)

  return { success: true }
}

/**
 * Get listings for moderator review
 */
export async function getListingsForReview(filter: ModerationFilter = 'all') {
  const access = await checkModeratorAccess()
  if ('error' in access) {
    return { listings: [], error: access.error }
  }

  const supabase = await createClient()

  let query = supabase
    .from('properties')
    .select(`
      *,
      seller:profiles!seller_id (
        id,
        full_name,
        email,
        avatar_url
      ),
      property_images (
        id,
        url,
        alt_text,
        order_index
      ),
      country:countries (
        name,
        currency,
        currency_symbol
      )
    `)
    // Include both active and pending_review status properties
    .in('status', ['active', 'pending_review'])
    .order('created_at', { ascending: false })

  // Apply filter
  if (filter !== 'all') {
    if (filter === 'pending') {
      // Pending = newly listed awaiting first review OR status is pending_review
      query = query.or('moderation_status.is.null,moderation_status.eq.pending,status.eq.pending_review')
    } else {
      query = query.eq('moderation_status', filter)
    }
  }

  const { data: listings, error } = await query.limit(100)

  if (error) {
    return { listings: [], error: 'Failed to fetch listings' }
  }

  return { listings: listings || [] }
}

/**
 * Get a single property for review with full details
 */
export async function getPropertyForReview(propertyId: string) {
  const access = await checkModeratorAccess()
  if ('error' in access) {
    return { property: null, error: access.error }
  }

  const supabase = await createClient()

  const { data: property, error } = await supabase
    .from('properties')
    .select(`
      *,
      seller:profiles!seller_id (
        id,
        full_name,
        email,
        phone,
        avatar_url,
        created_at
      ),
      property_images (
        id,
        url,
        alt_text,
        order_index
      ),
      country:countries (
        name,
        currency,
        currency_symbol
      )
    `)
    .eq('id', propertyId)
    .single()

  if (error || !property) {
    return { property: null, error: 'Property not found' }
  }

  return { property }
}

/**
 * Get review history for a property
 */
export async function getPropertyReviewHistory(propertyId: string) {
  const access = await checkModeratorAccess()
  if ('error' in access) {
    return { reviews: [], error: access.error }
  }

  const supabase = await createClient()

  const { data: reviews, error } = await supabase
    .from('property_reviews')
    .select(`
      *,
      reviewer:profiles!reviewer_id (
        full_name,
        avatar_url
      )
    `)
    .eq('property_id', propertyId)
    .order('created_at', { ascending: false })

  if (error) {
    return { reviews: [], error: 'Failed to fetch review history' }
  }

  return { reviews: reviews || [] }
}

/**
 * Get reviews made by current moderator
 */
export async function getMyReviews(limit = 50) {
  const access = await checkModeratorAccess()
  if ('error' in access) {
    return { reviews: [], error: access.error }
  }

  const supabase = await createClient()

  const { data: reviews, error } = await supabase
    .from('property_reviews')
    .select(`
      *,
      property:properties (
        id,
        title,
        city,
        province
      )
    `)
    .eq('reviewer_id', access.userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    return { reviews: [], error: 'Failed to fetch reviews' }
  }

  return { reviews: reviews || [] }
}

/**
 * Delete a specific image from a property (moderator action)
 */
export async function deletePropertyImage(propertyId: string, imageId: string): Promise<ActionResult> {
  const access = await checkModeratorAccess()
  if ('error' in access) {
    return { success: false, error: access.error }
  }

  const supabase = await createClient()

  // Get image to delete from storage
  const { data: image } = await supabase
    .from('property_images')
    .select('url')
    .eq('id', imageId)
    .eq('property_id', propertyId)
    .single() as { data: { url: string } | null; error: any }

  if (!image) {
    return { success: false, error: 'Image not found' }
  }

  // Delete from storage (best effort)
  try {
    const urlObj = new URL(image.url)
    const pathParts = urlObj.pathname.split('/')
    const filePath = pathParts.slice(-2).join('/')
    await supabase.storage.from('property-images').remove([filePath])
  } catch (e) {
    console.error('Storage delete error:', e)
  }

  // Delete from database
  const { error: deleteError } = await supabase
    .from('property_images')
    .delete()
    .eq('id', imageId)
    .eq('property_id', propertyId)

  if (deleteError) {
    return { success: false, error: 'Failed to delete image' }
  }

  // Log the action
  await (supabase.from('property_reviews') as any).insert({
    property_id: propertyId,
    reviewer_id: access.userId,
    action: 'image_deleted',
    notes: `Deleted image ${imageId}`
  })

  revalidatePath(`/moderator/listings/${propertyId}`)

  return { success: true }
}

/**
 * Update property details (moderator action)
 */
export async function updatePropertyAsModerator(
  propertyId: string,
  updates: {
    title?: string
    description?: string
    price?: number
    bedrooms?: number
    bathrooms?: number
    square_meters?: number
    city?: string
    province?: string
    address_line1?: string
    property_type?: string
  }
): Promise<ActionResult> {
  const access = await checkModeratorAccess()
  if ('error' in access) {
    return { success: false, error: access.error }
  }

  const supabase = await createClient()

  // Get original property for comparison
  const { data: original } = await supabase
    .from('properties')
    .select('title')
    .eq('id', propertyId)
    .single()

  // Update property
  const { error: updateError } = await (supabase
    .from('properties') as any)
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', propertyId)

  if (updateError) {
    return { success: false, error: 'Failed to update property' }
  }

  // Log the changes
  const changedFields = Object.keys(updates).join(', ')
  await (supabase.from('property_reviews') as any).insert({
    property_id: propertyId,
    reviewer_id: access.userId,
    action: 'edited',
    notes: `Modified fields: ${changedFields}`
  })

  revalidatePath(`/moderator/listings/${propertyId}`)
  revalidatePath('/moderator/listings')

  return { success: true }
}

/**
 * Get moderation statistics for dashboard
 */
export async function getModerationStats() {
  const access = await checkModeratorAccess()
  if ('error' in access) {
    return { stats: null, error: access.error }
  }

  const supabase = await createClient()

  // Get counts for each status
  const [
    { count: totalActive },
    { count: pendingCount },
    { count: approvedCount },
    { count: rejectedCount },
    { count: flaggedCount },
    { count: myReviewsToday }
  ] = await Promise.all([
    supabase.from('properties').select('id', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('properties').select('id', { count: 'exact', head: true }).eq('status', 'active').or('moderation_status.is.null,moderation_status.eq.pending'),
    supabase.from('properties').select('id', { count: 'exact', head: true }).eq('moderation_status', 'approved'),
    supabase.from('properties').select('id', { count: 'exact', head: true }).eq('moderation_status', 'rejected'),
    supabase.from('properties').select('id', { count: 'exact', head: true }).eq('moderation_status', 'flagged'),
    supabase.from('property_reviews').select('id', { count: 'exact', head: true })
      .eq('reviewer_id', access.userId)
      .gte('created_at', new Date(new Date().setHours(0, 0, 0, 0)).toISOString())
  ])

  return {
    stats: {
      totalActive: totalActive || 0,
      pending: pendingCount || 0,
      approved: approvedCount || 0,
      rejected: rejectedCount || 0,
      flagged: flaggedCount || 0,
      myReviewsToday: myReviewsToday || 0
    }
  }
}
