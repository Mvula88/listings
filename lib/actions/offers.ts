'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { createNotification } from './notifications'

// Types
export type PaymentType = 'cash' | 'bank_financed' | 'cash_and_bond'
export type FinancingStatus = 'pre_approved' | 'in_progress' | 'not_started'
export type OfferStatus = 'pending' | 'accepted' | 'rejected' | 'countered' | 'withdrawn' | 'expired'

interface SubmitOfferData {
  propertyId: string
  viewingId?: string
  offerAmount: number
  paymentType: PaymentType
  financingStatus?: FinancingStatus
  preApprovalAmount?: number
  financingBank?: string
  cashPortion?: number // For cash_and_bond
  message?: string
  conditions?: string
  validUntil?: string // ISO date string
}

interface ActionResult {
  success: boolean
  data?: any
  error?: string
}

/**
 * Submit an offer on a property
 */
export async function submitOffer(data: SubmitOfferData): Promise<ActionResult> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'You must be logged in to make an offer' }
  }

  // Validate offer amount
  if (data.offerAmount <= 0) {
    return { success: false, error: 'Offer amount must be greater than 0' }
  }

  // Get property details
  const { data: property } = await supabase
    .from('properties')
    .select('id, title, price, seller_id, status')
    .eq('id', data.propertyId)
    .single() as { data: { id: string; title: string; price: number; seller_id: string; status: string } | null; error: any }

  if (!property) {
    return { success: false, error: 'Property not found' }
  }

  if (property.status !== 'active') {
    return { success: false, error: 'This property is not available' }
  }

  if (property.seller_id === user.id) {
    return { success: false, error: 'You cannot make an offer on your own property' }
  }

  // Check for existing pending offer
  const { data: existingOffer } = await supabase
    .from('property_offers')
    .select('id')
    .eq('property_id', data.propertyId)
    .eq('buyer_id', user.id)
    .in('status', ['pending', 'countered'])
    .limit(1)
    .single()

  if (existingOffer) {
    return { success: false, error: 'You already have an active offer on this property. Withdraw it first to submit a new one.' }
  }

  // Default validity to 7 days if not specified
  const validUntil = data.validUntil || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

  // Create offer
  const { data: offer, error } = await (supabase
    .from('property_offers') as any)
    .insert({
      property_id: data.propertyId,
      buyer_id: user.id,
      seller_id: property.seller_id,
      viewing_id: data.viewingId || null,
      offer_amount: data.offerAmount,
      payment_type: data.paymentType,
      financing_status: data.paymentType !== 'cash' ? data.financingStatus : null,
      pre_approval_amount: data.preApprovalAmount || null,
      financing_bank: data.financingBank || null,
      cash_portion: data.cashPortion || null,
      message: data.message || null,
      conditions: data.conditions || null,
      valid_until: validUntil,
      status: 'pending'
    })
    .select('id')
    .single()

  if (error) {
    console.error('Error creating offer:', error)
    return { success: false, error: 'Failed to submit offer' }
  }

  // Notify seller
  const formattedAmount = new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
    minimumFractionDigits: 0
  }).format(data.offerAmount)

  await createNotification({
    userId: property.seller_id,
    type: 'offer_received',
    title: 'New Offer Received',
    message: `You received an offer of ${formattedAmount} for "${property.title}"`,
    data: {
      property_id: data.propertyId,
      offer_id: offer.id,
      offer_amount: data.offerAmount,
      payment_type: data.paymentType
    }
  })

  revalidatePath('/offers')
  revalidatePath(`/properties/${data.propertyId}`)

  return { success: true, data: offer }
}

/**
 * Accept an offer (seller action)
 */
export async function acceptOffer(offerId: string, response?: string): Promise<ActionResult> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  // Get offer and verify seller
  const { data: offer } = await supabase
    .from('property_offers')
    .select(`
      id, seller_id, buyer_id, property_id, offer_amount, status,
      property:properties(title)
    `)
    .eq('id', offerId)
    .single() as { data: any; error: any }

  if (!offer) {
    return { success: false, error: 'Offer not found' }
  }

  if (offer.seller_id !== user.id) {
    return { success: false, error: 'Not authorized' }
  }

  if (offer.status !== 'pending' && offer.status !== 'countered') {
    return { success: false, error: 'This offer cannot be accepted' }
  }

  // Start a transaction to accept offer and reject others
  // Accept this offer
  const { error: acceptError } = await (supabase
    .from('property_offers') as any)
    .update({
      status: 'accepted',
      seller_response: response || null,
      responded_at: new Date().toISOString(),
      accepted_at: new Date().toISOString()
    })
    .eq('id', offerId)

  if (acceptError) {
    return { success: false, error: 'Failed to accept offer' }
  }

  // Reject all other pending offers on this property
  await (supabase
    .from('property_offers') as any)
    .update({
      status: 'rejected',
      seller_response: 'Another offer was accepted',
      responded_at: new Date().toISOString()
    })
    .eq('property_id', offer.property_id)
    .neq('id', offerId)
    .in('status', ['pending', 'countered'])

  // Create a transaction record
  const { data: transaction, error: txError } = await (supabase
    .from('transactions') as any)
    .insert({
      property_id: offer.property_id,
      buyer_id: offer.buyer_id,
      seller_id: offer.seller_id,
      agreed_price: offer.offer_amount,
      status: 'initiated'
    })
    .select('id')
    .single()

  if (!txError && transaction) {
    // Link offer to transaction
    await (supabase
      .from('property_offers') as any)
      .update({ transaction_id: transaction.id })
      .eq('id', offerId)
  }

  // Notify buyer
  await createNotification({
    userId: offer.buyer_id,
    type: 'offer_accepted',
    title: 'Offer Accepted!',
    message: `Your offer for "${offer.property?.title}" has been accepted! Please proceed to select a lawyer.`,
    data: {
      property_id: offer.property_id,
      offer_id: offerId,
      transaction_id: transaction?.id
    }
  })

  revalidatePath('/offers')
  revalidatePath('/transactions')
  revalidatePath(`/properties/${offer.property_id}`)

  return { success: true, data: { transactionId: transaction?.id } }
}

/**
 * Reject an offer (seller action)
 */
export async function rejectOffer(offerId: string, response?: string): Promise<ActionResult> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  // Get offer
  const { data: offer } = await supabase
    .from('property_offers')
    .select(`
      id, seller_id, buyer_id, property_id, status,
      property:properties(title)
    `)
    .eq('id', offerId)
    .single() as { data: any; error: any }

  if (!offer) {
    return { success: false, error: 'Offer not found' }
  }

  if (offer.seller_id !== user.id) {
    return { success: false, error: 'Not authorized' }
  }

  if (offer.status !== 'pending' && offer.status !== 'countered') {
    return { success: false, error: 'This offer cannot be rejected' }
  }

  // Update offer
  const { error } = await (supabase
    .from('property_offers') as any)
    .update({
      status: 'rejected',
      seller_response: response || null,
      responded_at: new Date().toISOString()
    })
    .eq('id', offerId)

  if (error) {
    return { success: false, error: 'Failed to reject offer' }
  }

  // Notify buyer
  await createNotification({
    userId: offer.buyer_id,
    type: 'offer_rejected',
    title: 'Offer Declined',
    message: `Your offer for "${offer.property?.title}" was not accepted.`,
    data: {
      property_id: offer.property_id,
      offer_id: offerId,
      response: response
    }
  })

  revalidatePath('/offers')
  revalidatePath(`/properties/${offer.property_id}`)

  return { success: true }
}

/**
 * Counter an offer (seller action)
 */
export async function counterOffer(
  offerId: string,
  counterAmount: number,
  message?: string
): Promise<ActionResult> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  if (counterAmount <= 0) {
    return { success: false, error: 'Counter amount must be greater than 0' }
  }

  // Get offer
  const { data: offer } = await supabase
    .from('property_offers')
    .select(`
      id, seller_id, buyer_id, property_id, offer_amount, status,
      property:properties(title)
    `)
    .eq('id', offerId)
    .single() as { data: any; error: any }

  if (!offer) {
    return { success: false, error: 'Offer not found' }
  }

  if (offer.seller_id !== user.id) {
    return { success: false, error: 'Not authorized' }
  }

  if (offer.status !== 'pending') {
    return { success: false, error: 'This offer cannot be countered' }
  }

  // Update offer
  const { error } = await (supabase
    .from('property_offers') as any)
    .update({
      status: 'countered',
      counter_amount: counterAmount,
      counter_message: message || null,
      responded_at: new Date().toISOString()
    })
    .eq('id', offerId)

  if (error) {
    return { success: false, error: 'Failed to counter offer' }
  }

  // Notify buyer
  const formattedAmount = new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
    minimumFractionDigits: 0
  }).format(counterAmount)

  await createNotification({
    userId: offer.buyer_id,
    type: 'offer_countered',
    title: 'Counter Offer Received',
    message: `The seller countered your offer for "${offer.property?.title}" with ${formattedAmount}`,
    data: {
      property_id: offer.property_id,
      offer_id: offerId,
      counter_amount: counterAmount
    }
  })

  revalidatePath('/offers')
  revalidatePath(`/properties/${offer.property_id}`)

  return { success: true }
}

/**
 * Accept a counter offer (buyer action)
 */
export async function acceptCounterOffer(offerId: string): Promise<ActionResult> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  // Get offer
  const { data: offer } = await supabase
    .from('property_offers')
    .select(`
      id, seller_id, buyer_id, property_id, counter_amount, status,
      property:properties(title)
    `)
    .eq('id', offerId)
    .single() as { data: any; error: any }

  if (!offer) {
    return { success: false, error: 'Offer not found' }
  }

  if (offer.buyer_id !== user.id) {
    return { success: false, error: 'Not authorized' }
  }

  if (offer.status !== 'countered') {
    return { success: false, error: 'No counter offer to accept' }
  }

  // Accept offer (update amount to counter amount)
  const { error: acceptError } = await (supabase
    .from('property_offers') as any)
    .update({
      status: 'accepted',
      offer_amount: offer.counter_amount, // Update to counter amount
      accepted_at: new Date().toISOString()
    })
    .eq('id', offerId)

  if (acceptError) {
    return { success: false, error: 'Failed to accept counter offer' }
  }

  // Reject all other pending offers
  await (supabase
    .from('property_offers') as any)
    .update({
      status: 'rejected',
      seller_response: 'Another offer was accepted',
      responded_at: new Date().toISOString()
    })
    .eq('property_id', offer.property_id)
    .neq('id', offerId)
    .in('status', ['pending', 'countered'])

  // Create transaction
  const { data: transaction } = await (supabase
    .from('transactions') as any)
    .insert({
      property_id: offer.property_id,
      buyer_id: offer.buyer_id,
      seller_id: offer.seller_id,
      agreed_price: offer.counter_amount,
      status: 'initiated'
    })
    .select('id')
    .single()

  if (transaction) {
    await (supabase
      .from('property_offers') as any)
      .update({ transaction_id: transaction.id })
      .eq('id', offerId)
  }

  // Notify seller
  await createNotification({
    userId: offer.seller_id,
    type: 'counter_offer_accepted',
    title: 'Counter Offer Accepted',
    message: `Your counter offer for "${offer.property?.title}" was accepted! Please proceed to select a lawyer.`,
    data: {
      property_id: offer.property_id,
      offer_id: offerId,
      transaction_id: transaction?.id
    }
  })

  revalidatePath('/offers')
  revalidatePath('/transactions')

  return { success: true, data: { transactionId: transaction?.id } }
}

/**
 * Withdraw an offer (buyer action)
 */
export async function withdrawOffer(offerId: string): Promise<ActionResult> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  // Get offer
  const { data: offer } = await (supabase
    .from('property_offers') as any)
    .select('id, buyer_id, seller_id, property_id, status')
    .eq('id', offerId)
    .single()

  if (!offer) {
    return { success: false, error: 'Offer not found' }
  }

  if (offer.buyer_id !== user.id) {
    return { success: false, error: 'Not authorized' }
  }

  if (offer.status !== 'pending' && offer.status !== 'countered') {
    return { success: false, error: 'This offer cannot be withdrawn' }
  }

  // Update offer
  const { error } = await (supabase
    .from('property_offers') as any)
    .update({
      status: 'withdrawn'
    })
    .eq('id', offerId)

  if (error) {
    return { success: false, error: 'Failed to withdraw offer' }
  }

  revalidatePath('/offers')
  revalidatePath(`/properties/${offer.property_id}`)

  return { success: true }
}

/**
 * Get offers for current user (as buyer or seller)
 */
export async function getMyOffers(role: 'buyer' | 'seller', status?: OfferStatus) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { offers: [], error: 'Not authenticated' }
  }

  let query = (supabase
    .from('property_offers') as any)
    .select(`
      *,
      property:properties(
        id, title, price, city, province,
        property_images(url, order_index),
        country:countries(currency_symbol)
      ),
      buyer:profiles!buyer_id(id, full_name, email, avatar_url),
      seller:profiles!seller_id(id, full_name, email, avatar_url),
      transaction:transactions(id, status)
    `)
    .eq(role === 'buyer' ? 'buyer_id' : 'seller_id', user.id)
    .order('created_at', { ascending: false })

  if (status) {
    query = query.eq('status', status)
  }

  const { data: offers, error } = await query

  if (error) {
    console.error('Error fetching offers:', error)
    return { offers: [], error: 'Failed to fetch offers' }
  }

  return { offers: offers || [] }
}

/**
 * Get offers for a specific property (seller only)
 */
export async function getPropertyOffers(propertyId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { offers: [], error: 'Not authenticated' }
  }

  // Verify seller
  const { data: property } = await supabase
    .from('properties')
    .select('seller_id')
    .eq('id', propertyId)
    .single() as { data: { seller_id: string } | null; error: any }

  if (!property || property.seller_id !== user.id) {
    return { offers: [], error: 'Not authorized' }
  }

  const { data: offers, error } = await (supabase
    .from('property_offers') as any)
    .select(`
      *,
      buyer:profiles!buyer_id(id, full_name, email, phone, avatar_url),
      viewing:property_viewings(id, status, financing_status)
    `)
    .eq('property_id', propertyId)
    .order('created_at', { ascending: false })

  if (error) {
    return { offers: [], error: 'Failed to fetch offers' }
  }

  return { offers: offers || [] }
}

/**
 * Get a single offer by ID
 */
export async function getOffer(offerId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { offer: null, error: 'Not authenticated' }
  }

  const { data: offer, error } = await (supabase
    .from('property_offers') as any)
    .select(`
      *,
      property:properties(
        id, title, price, city, province, address_line1,
        property_images(url, order_index),
        country:countries(currency_symbol)
      ),
      buyer:profiles!buyer_id(id, full_name, email, phone, avatar_url),
      seller:profiles!seller_id(id, full_name, email, phone, avatar_url),
      viewing:property_viewings(id, status, financing_status, confirmed_date),
      transaction:transactions(id, status)
    `)
    .eq('id', offerId)
    .single()

  if (error || !offer) {
    return { offer: null, error: 'Offer not found' }
  }

  // Check authorization
  if (offer.buyer_id !== user.id && offer.seller_id !== user.id) {
    return { offer: null, error: 'Not authorized' }
  }

  return { offer }
}

/**
 * Check if buyer has an active offer on a property
 */
export async function hasActiveOffer(propertyId: string): Promise<{ hasOffer: boolean; offer?: any }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { hasOffer: false }

  const { data } = await (supabase
    .from('property_offers') as any)
    .select('id, status, offer_amount, counter_amount')
    .eq('property_id', propertyId)
    .eq('buyer_id', user.id)
    .in('status', ['pending', 'countered'])
    .limit(1)
    .single()

  return { hasOffer: !!data, offer: data }
}
