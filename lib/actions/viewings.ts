'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { createNotification } from './notifications'

// Types
export type FinancingStatus = 'cash' | 'pre_approved' | 'financing_in_progress' | 'exploring'
export type ViewingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'
export type TimeSlot = 'morning' | 'afternoon' | 'evening'

interface RequestViewingData {
  propertyId: string
  requestedDate: string // ISO date string
  requestedTimeSlot: TimeSlot
  financingStatus: FinancingStatus
  preApprovalAmount?: number
  message?: string
}

interface ActionResult {
  success: boolean
  data?: any
  error?: string
}

/**
 * Request a property viewing
 */
export async function requestViewing(data: RequestViewingData): Promise<ActionResult> {
  const supabase = await createClient()

  // Check authentication
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'You must be logged in to request a viewing' }
  }

  // Get property details
  const { data: property } = await supabase
    .from('properties')
    .select('id, title, seller_id, status')
    .eq('id', data.propertyId)
    .single() as { data: { id: string; title: string; seller_id: string; status: string } | null; error: any }

  if (!property) {
    return { success: false, error: 'Property not found' }
  }

  if (property.status !== 'active') {
    return { success: false, error: 'This property is not available for viewing' }
  }

  if (property.seller_id === user.id) {
    return { success: false, error: 'You cannot request a viewing for your own property' }
  }

  // Check for existing viewing request on the same date
  const { data: existingViewing } = await (supabase
    .from('property_viewings') as any)
    .select('id')
    .eq('property_id', data.propertyId)
    .eq('buyer_id', user.id)
    .eq('requested_date', data.requestedDate)
    .single()

  if (existingViewing) {
    return { success: false, error: 'You already have a viewing request for this date' }
  }

  // Create viewing request
  const { data: viewing, error } = await (supabase
    .from('property_viewings') as any)
    .insert({
      property_id: data.propertyId,
      buyer_id: user.id,
      seller_id: property.seller_id,
      requested_date: data.requestedDate,
      requested_time_slot: data.requestedTimeSlot,
      financing_status: data.financingStatus,
      pre_approval_amount: data.preApprovalAmount || null,
      buyer_message: data.message || null,
      status: 'pending'
    })
    .select('id')
    .single()

  if (error) {
    console.error('Error creating viewing:', error)
    return { success: false, error: 'Failed to create viewing request' }
  }

  // Notify seller
  await createNotification({
    userId: property.seller_id,
    type: 'viewing_requested',
    title: 'New Viewing Request',
    message: `Someone wants to view your property "${property.title}"`,
    data: {
      property_id: data.propertyId,
      viewing_id: viewing.id,
      requested_date: data.requestedDate,
      financing_status: data.financingStatus
    }
  })

  revalidatePath('/viewings')
  revalidatePath(`/properties/${data.propertyId}`)

  return { success: true, data: viewing }
}

/**
 * Confirm a viewing request (seller action)
 */
export async function confirmViewing(
  viewingId: string,
  confirmedDate: string,
  confirmedTime: string,
  response?: string
): Promise<ActionResult> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  // Get viewing and verify seller
  const { data: viewing } = await (supabase
    .from('property_viewings') as any)
    .select(`
      id, seller_id, buyer_id, property_id, status,
      property:properties(title)
    `)
    .eq('id', viewingId)
    .single() as { data: any; error: any }

  if (!viewing) {
    return { success: false, error: 'Viewing not found' }
  }

  if (viewing.seller_id !== user.id) {
    return { success: false, error: 'Not authorized' }
  }

  if (viewing.status !== 'pending') {
    return { success: false, error: 'This viewing has already been processed' }
  }

  // Update viewing
  const { error } = await (supabase
    .from('property_viewings') as any)
    .update({
      status: 'confirmed',
      confirmed_date: confirmedDate,
      confirmed_time: confirmedTime,
      seller_response: response || null,
      confirmed_at: new Date().toISOString()
    })
    .eq('id', viewingId)

  if (error) {
    return { success: false, error: 'Failed to confirm viewing' }
  }

  // Notify buyer
  await createNotification({
    userId: viewing.buyer_id,
    type: 'viewing_confirmed',
    title: 'Viewing Confirmed',
    message: `Your viewing for "${viewing.property?.title}" has been confirmed for ${confirmedDate} at ${confirmedTime}`,
    data: {
      property_id: viewing.property_id,
      viewing_id: viewingId,
      confirmed_date: confirmedDate,
      confirmed_time: confirmedTime
    }
  })

  revalidatePath('/viewings')
  revalidatePath(`/properties/${viewing.property_id}`)

  return { success: true }
}

/**
 * Cancel a viewing (buyer or seller)
 */
export async function cancelViewing(
  viewingId: string,
  reason?: string
): Promise<ActionResult> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  // Get viewing
  const { data: viewing } = await (supabase
    .from('property_viewings') as any)
    .select(`
      id, seller_id, buyer_id, property_id, status,
      property:properties(title)
    `)
    .eq('id', viewingId)
    .single() as { data: any; error: any }

  if (!viewing) {
    return { success: false, error: 'Viewing not found' }
  }

  // Check authorization
  if (viewing.buyer_id !== user.id && viewing.seller_id !== user.id) {
    return { success: false, error: 'Not authorized' }
  }

  if (viewing.status === 'completed' || viewing.status === 'cancelled') {
    return { success: false, error: 'This viewing cannot be cancelled' }
  }

  // Update viewing
  const { error } = await (supabase
    .from('property_viewings') as any)
    .update({
      status: 'cancelled',
      cancellation_reason: reason || null,
      cancelled_at: new Date().toISOString()
    })
    .eq('id', viewingId)

  if (error) {
    return { success: false, error: 'Failed to cancel viewing' }
  }

  // Notify the other party
  const notifyUserId = viewing.buyer_id === user.id ? viewing.seller_id : viewing.buyer_id
  await createNotification({
    userId: notifyUserId,
    type: 'viewing_cancelled',
    title: 'Viewing Cancelled',
    message: `A viewing for "${viewing.property?.title}" has been cancelled`,
    data: {
      property_id: viewing.property_id,
      viewing_id: viewingId,
      reason: reason
    }
  })

  revalidatePath('/viewings')
  revalidatePath(`/properties/${viewing.property_id}`)

  return { success: true }
}

/**
 * Mark viewing as completed (seller action)
 */
export async function completeViewing(viewingId: string): Promise<ActionResult> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  // Get viewing
  const { data: viewing } = await (supabase
    .from('property_viewings') as any)
    .select('id, seller_id, status')
    .eq('id', viewingId)
    .single()

  if (!viewing) {
    return { success: false, error: 'Viewing not found' }
  }

  if (viewing.seller_id !== user.id) {
    return { success: false, error: 'Not authorized' }
  }

  if (viewing.status !== 'confirmed') {
    return { success: false, error: 'Only confirmed viewings can be marked as completed' }
  }

  // Update viewing
  const { error } = await (supabase
    .from('property_viewings') as any)
    .update({
      status: 'completed',
      completed_at: new Date().toISOString()
    })
    .eq('id', viewingId)

  if (error) {
    return { success: false, error: 'Failed to complete viewing' }
  }

  revalidatePath('/viewings')

  return { success: true }
}

/**
 * Mark viewing as no-show (seller action)
 */
export async function markViewingNoShow(viewingId: string): Promise<ActionResult> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  // Get viewing
  const { data: viewing } = await (supabase
    .from('property_viewings') as any)
    .select('id, seller_id, status')
    .eq('id', viewingId)
    .single()

  if (!viewing) {
    return { success: false, error: 'Viewing not found' }
  }

  if (viewing.seller_id !== user.id) {
    return { success: false, error: 'Not authorized' }
  }

  if (viewing.status !== 'confirmed') {
    return { success: false, error: 'Only confirmed viewings can be marked as no-show' }
  }

  // Update viewing
  const { error } = await (supabase
    .from('property_viewings') as any)
    .update({
      status: 'no_show'
    })
    .eq('id', viewingId)

  if (error) {
    return { success: false, error: 'Failed to update viewing' }
  }

  revalidatePath('/viewings')

  return { success: true }
}

/**
 * Get viewings for the current user (buyer or seller)
 */
export async function getMyViewings(role: 'buyer' | 'seller', status?: ViewingStatus) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { viewings: [], error: 'Not authenticated' }
  }

  try {
    // Very simple query - just get the viewings first
    const { data: viewings, error } = await (supabase
      .from('property_viewings') as any)
      .select('*')
      .eq(role === 'buyer' ? 'buyer_id' : 'seller_id', user.id)
      .order('requested_date', { ascending: true })

    if (error) {
      console.error('Error fetching viewings:', error)
      return { viewings: [], error: 'Failed to fetch viewings' }
    }

    if (!viewings || viewings.length === 0) {
      return { viewings: [] }
    }

    // Enrich each viewing with related data
    const enrichedViewings = await Promise.all(
      viewings.map(async (viewing: any) => {
        // Get property
        if (viewing.property_id) {
          const { data: property } = await supabase
            .from('properties')
            .select('id, title, price, city, province, country_id')
            .eq('id', viewing.property_id)
            .single()

          if (property) {
            viewing.property = property

            // Get property image
            const { data: images } = await supabase
              .from('property_images')
              .select('url, order_index')
              .eq('property_id', property.id)
              .order('order_index', { ascending: true })
              .limit(1)

            viewing.property.property_images = images || []

            // Get currency
            if (property.country_id) {
              const { data: country } = await supabase
                .from('countries')
                .select('currency_symbol')
                .eq('id', property.country_id)
                .single()
              if (country) {
                viewing.property.country = country
              }
            }
          }
        }

        // Get buyer profile
        if (viewing.buyer_id) {
          const { data: buyer } = await supabase
            .from('profiles')
            .select('id, full_name, email, avatar_url')
            .eq('id', viewing.buyer_id)
            .single()
          viewing.buyer = buyer
        }

        // Get seller profile
        if (viewing.seller_id) {
          const { data: seller } = await supabase
            .from('profiles')
            .select('id, full_name, email, avatar_url')
            .eq('id', viewing.seller_id)
            .single()
          viewing.seller = seller
        }

        return viewing
      })
    )

    return { viewings: enrichedViewings }
  } catch (err) {
    console.error('Error in getMyViewings:', err)
    return { viewings: [], error: 'Failed to fetch viewings' }
  }
}

/**
 * Get viewings for a specific property
 */
export async function getPropertyViewings(propertyId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { viewings: [], error: 'Not authenticated' }
  }

  // Verify user is the seller
  const { data: property } = await supabase
    .from('properties')
    .select('seller_id')
    .eq('id', propertyId)
    .single() as { data: { seller_id: string } | null; error: any }

  if (!property || property.seller_id !== user.id) {
    return { viewings: [], error: 'Not authorized' }
  }

  const { data: viewings, error } = await (supabase
    .from('property_viewings') as any)
    .select(`
      *,
      buyer:profiles!buyer_id(id, full_name, email, phone, avatar_url)
    `)
    .eq('property_id', propertyId)
    .order('requested_date', { ascending: true })

  if (error) {
    return { viewings: [], error: 'Failed to fetch viewings' }
  }

  return { viewings: viewings || [] }
}

/**
 * Check if buyer has a pending/confirmed viewing for a property
 */
export async function hasActiveViewing(propertyId: string): Promise<boolean> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  const { data } = await (supabase
    .from('property_viewings') as any)
    .select('id')
    .eq('property_id', propertyId)
    .eq('buyer_id', user.id)
    .in('status', ['pending', 'confirmed'])
    .limit(1)
    .single()

  return !!data
}

/**
 * Get a single viewing by ID
 */
export async function getViewing(viewingId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { viewing: null, error: 'Not authenticated' }
  }

  const { data: viewing, error } = await (supabase
    .from('property_viewings') as any)
    .select(`
      *,
      property:properties(
        id, title, price, city, province, address_line1,
        property_images(url, order_index),
        country:countries(currency_symbol)
      ),
      buyer:profiles!buyer_id(id, full_name, email, phone, avatar_url),
      seller:profiles!seller_id(id, full_name, email, phone, avatar_url)
    `)
    .eq('id', viewingId)
    .single()

  if (error || !viewing) {
    return { viewing: null, error: 'Viewing not found' }
  }

  // Check authorization
  if (viewing.buyer_id !== user.id && viewing.seller_id !== user.id) {
    return { viewing: null, error: 'Not authorized' }
  }

  return { viewing }
}
