// API Route: Process Stripe Refunds
// Admin-only endpoint for processing payment refunds

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { withRateLimit, apiRateLimit } from '@/lib/security/rate-limit'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-10-29.clover',
})

export async function POST(request: Request) {
  try {
    // Apply rate limiting
    const rateLimitResponse = await withRateLimit(request, apiRateLimit)
    if (rateLimitResponse) return rateLimitResponse

    const supabase = await createClient()

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single() as { data: { role: string } | null; error: any }

    if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { paymentId, reason, amount } = body

    if (!paymentId) {
      return NextResponse.json(
        { error: 'Payment ID is required' },
        { status: 400 }
      )
    }

    // Get payment record from database
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select('*')
      .eq('id', paymentId)
      .single() as {
        data: {
          id: string
          stripe_payment_intent_id: string
          stripe_session_id: string
          amount: number
          currency: string
          status: string
          user_id: string
          property_id: string
          plan: string
        } | null
        error: any
      }

    if (paymentError || !payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      )
    }

    // Check if already refunded
    if (payment.status === 'refunded') {
      return NextResponse.json(
        { error: 'Payment has already been refunded' },
        { status: 400 }
      )
    }

    // Check if payment was successful
    if (payment.status !== 'succeeded') {
      return NextResponse.json(
        { error: 'Only successful payments can be refunded' },
        { status: 400 }
      )
    }

    // Determine refund amount (full or partial)
    const refundAmount = amount ? Math.min(amount, payment.amount) : payment.amount
    const isPartialRefund = refundAmount < payment.amount

    try {
      // Create Stripe refund
      const refund = await stripe.refunds.create({
        payment_intent: payment.stripe_payment_intent_id,
        amount: refundAmount, // Amount in cents
        reason: reason === 'duplicate' ? 'duplicate' :
                reason === 'fraudulent' ? 'fraudulent' :
                'requested_by_customer',
        metadata: {
          payment_id: paymentId,
          admin_user_id: user.id,
          refund_reason: reason || 'customer_request',
        },
      })

      // Update payment status in database
      const newStatus = isPartialRefund ? 'partially_refunded' : 'refunded'
      const { error: updateError } = await (supabase
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

      if (updateError) {
        console.error('Failed to update payment record:', updateError)
        // Refund was processed but DB update failed - log for manual fix
        console.error('CRITICAL: Stripe refund processed but DB update failed', {
          refundId: refund.id,
          paymentId,
          amount: refundAmount,
        })
      }

      // If this was a featured listing payment, remove featured status
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

      // Log the refund action
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
            currency: payment.currency,
            reason: reason || 'customer_request',
            is_partial: isPartialRefund,
          },
        })

      return NextResponse.json({
        success: true,
        refund: {
          id: refund.id,
          amount: refundAmount,
          currency: payment.currency,
          status: refund.status,
          isPartial: isPartialRefund,
        },
      })
    } catch (stripeError: any) {
      console.error('Stripe refund error:', stripeError)
      return NextResponse.json(
        {
          error: 'Failed to process refund',
          details: stripeError.message,
        },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error('Refund processing error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET endpoint to check refund status
export async function GET(request: Request) {
  try {
    // Apply rate limiting
    const rateLimitResponse = await withRateLimit(request, apiRateLimit)
    if (rateLimitResponse) return rateLimitResponse

    const supabase = await createClient()

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const url = new URL(request.url)
    const refundId = url.searchParams.get('refundId')

    if (!refundId) {
      return NextResponse.json(
        { error: 'Refund ID is required' },
        { status: 400 }
      )
    }

    // Get refund status from Stripe
    const refund = await stripe.refunds.retrieve(refundId)

    return NextResponse.json({
      success: true,
      refund: {
        id: refund.id,
        amount: refund.amount,
        currency: refund.currency,
        status: refund.status,
        created: refund.created,
        reason: refund.reason,
      },
    })
  } catch (error: any) {
    console.error('Refund status check error:', error)
    return NextResponse.json(
      { error: 'Failed to check refund status' },
      { status: 500 }
    )
  }
}
