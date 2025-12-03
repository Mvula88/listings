'use server'

// Server Actions for Refund Processing
// Used by admin dashboard to manage refunds

import { createClient } from '@/lib/supabase/server'
import Stripe from 'stripe'
import { revalidatePath } from 'next/cache'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-10-29.clover',
})

export interface RefundResult {
  success: boolean
  error?: string
  refund?: {
    id: string
    amount: number
    currency: string
    status: string
    isPartial: boolean
  }
}

export interface RefundablePayment {
  id: string
  amount: number
  currency: string
  status: string
  created_at: string
  user_email: string
  property_title: string
  plan: string
}

/**
 * Get list of payments that can be refunded
 */
export async function getRefundablePayments(): Promise<{
  success: boolean
  payments?: RefundablePayment[]
  error?: string
}> {
  try {
    const supabase = await createClient()

    // Check authentication and admin role
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'Authentication required' }
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single() as { data: { role: string } | null; error: any }

    if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
      return { success: false, error: 'Admin access required' }
    }

    // Get refundable payments (succeeded, not already refunded)
    const { data: payments, error } = await supabase
      .from('payments')
      .select(`
        id,
        amount,
        currency,
        status,
        created_at,
        plan,
        user:profiles!user_id(email),
        property:properties!property_id(title)
      `)
      .eq('status', 'succeeded')
      .order('created_at', { ascending: false })
      .limit(100) as {
        data: Array<{
          id: string
          amount: number
          currency: string
          status: string
          created_at: string
          plan: string
          user: { email: string }
          property: { title: string }
        }> | null
        error: any
      }

    if (error) {
      console.error('Failed to fetch refundable payments:', error)
      return { success: false, error: 'Failed to fetch payments' }
    }

    const formattedPayments: RefundablePayment[] = (payments || []).map(p => ({
      id: p.id,
      amount: p.amount,
      currency: p.currency,
      status: p.status,
      created_at: p.created_at,
      user_email: p.user?.email || 'Unknown',
      property_title: p.property?.title || 'Unknown',
      plan: p.plan,
    }))

    return { success: true, payments: formattedPayments }
  } catch (error) {
    console.error('Error fetching refundable payments:', error)
    return { success: false, error: 'Internal error' }
  }
}

/**
 * Process a refund for a payment
 */
export async function processRefund(
  paymentId: string,
  reason?: string,
  amount?: number
): Promise<RefundResult> {
  try {
    const supabase = await createClient()

    // Check authentication and admin role
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'Authentication required' }
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single() as { data: { role: string } | null; error: any }

    if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
      return { success: false, error: 'Admin access required' }
    }

    // Get payment record
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select('*')
      .eq('id', paymentId)
      .single() as {
        data: {
          id: string
          stripe_payment_intent_id: string
          amount: number
          currency: string
          status: string
          property_id: string
        } | null
        error: any
      }

    if (paymentError || !payment) {
      return { success: false, error: 'Payment not found' }
    }

    if (payment.status === 'refunded') {
      return { success: false, error: 'Payment already refunded' }
    }

    if (payment.status !== 'succeeded') {
      return { success: false, error: 'Only successful payments can be refunded' }
    }

    // Calculate refund amount
    const refundAmount = amount ? Math.min(amount, payment.amount) : payment.amount
    const isPartialRefund = refundAmount < payment.amount

    // Process Stripe refund
    const refund = await stripe.refunds.create({
      payment_intent: payment.stripe_payment_intent_id,
      amount: refundAmount,
      reason: reason === 'duplicate' ? 'duplicate' :
              reason === 'fraudulent' ? 'fraudulent' :
              'requested_by_customer',
      metadata: {
        payment_id: paymentId,
        admin_user_id: user.id,
      },
    })

    // Update payment record
    const newStatus = isPartialRefund ? 'partially_refunded' : 'refunded'
    await (supabase
      .from('payments') as any)
      .update({
        status: newStatus,
        refund_id: refund.id,
        refund_amount: refundAmount,
        refund_reason: reason || 'customer_request',
        refunded_at: new Date().toISOString(),
        refunded_by: user.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', paymentId)

    // Remove featured status if applicable
    if (payment.property_id) {
      await (supabase
        .from('properties') as any)
        .update({
          featured: false,
          featured_until: null,
          premium: false,
          updated_at: new Date().toISOString(),
        })
        .eq('id', payment.property_id)
    }

    // Log the action
    await (supabase
      .from('audit_logs') as any)
      .insert({
        user_id: user.id,
        action: 'payment_refund',
        entity_type: 'payment',
        entity_id: paymentId,
        details: {
          refund_id: refund.id,
          amount: refundAmount,
          reason: reason || 'customer_request',
          is_partial: isPartialRefund,
        },
      })

    // Revalidate admin pages
    revalidatePath('/admin/payments')
    revalidatePath('/admin')

    return {
      success: true,
      refund: {
        id: refund.id,
        amount: refundAmount,
        currency: payment.currency,
        status: refund.status,
        isPartial: isPartialRefund,
      },
    }
  } catch (error: any) {
    console.error('Refund processing error:', error)
    return {
      success: false,
      error: error.message || 'Failed to process refund',
    }
  }
}

/**
 * Get refund history for reporting
 */
export async function getRefundHistory(limit = 50): Promise<{
  success: boolean
  refunds?: Array<{
    id: string
    payment_id: string
    amount: number
    currency: string
    reason: string
    refunded_at: string
    refunded_by_email: string
    user_email: string
    property_title: string
  }>
  error?: string
}> {
  try {
    const supabase = await createClient()

    // Check authentication and admin role
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'Authentication required' }
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single() as { data: { role: string } | null; error: any }

    if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
      return { success: false, error: 'Admin access required' }
    }

    // Get refunded payments
    const { data: refunds, error } = await supabase
      .from('payments')
      .select(`
        id,
        refund_id,
        refund_amount,
        currency,
        refund_reason,
        refunded_at,
        refunded_by:profiles!refunded_by(email),
        user:profiles!user_id(email),
        property:properties!property_id(title)
      `)
      .in('status', ['refunded', 'partially_refunded'])
      .order('refunded_at', { ascending: false })
      .limit(limit) as {
        data: Array<{
          id: string
          refund_id: string
          refund_amount: number
          currency: string
          refund_reason: string
          refunded_at: string
          refunded_by: { email: string }
          user: { email: string }
          property: { title: string }
        }> | null
        error: any
      }

    if (error) {
      return { success: false, error: 'Failed to fetch refund history' }
    }

    const formattedRefunds = (refunds || []).map(r => ({
      id: r.refund_id || '',
      payment_id: r.id,
      amount: r.refund_amount,
      currency: r.currency,
      reason: r.refund_reason,
      refunded_at: r.refunded_at,
      refunded_by_email: r.refunded_by?.email || 'Unknown',
      user_email: r.user?.email || 'Unknown',
      property_title: r.property?.title || 'Unknown',
    }))

    return { success: true, refunds: formattedRefunds }
  } catch (error) {
    console.error('Error fetching refund history:', error)
    return { success: false, error: 'Internal error' }
  }
}
