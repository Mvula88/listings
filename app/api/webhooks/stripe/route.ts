import { headers } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/client'
import { createClient } from '@/lib/supabase/server'
import Stripe from 'stripe'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = (await headers()).get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    )
  }

  const supabase = await createClient()

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        
        // Update payment record
        const { error: paymentError } = await supabase
          .from('payments')
          .update({ 
            status: 'succeeded',
            stripe_payment_intent_id: session.payment_intent as string,
            paid_at: new Date().toISOString()
          })
          .eq('stripe_checkout_session_id', session.id)

        if (paymentError) {
          console.error('Error updating payment:', paymentError)
          throw paymentError
        }

        // Update transaction payment status
        const metadata = session.metadata as any
        const updateField = metadata.user_role === 'buyer' 
          ? 'buyer_success_fee_paid' 
          : 'seller_success_fee_paid'

        const { error: transactionError } = await supabase
          .from('transactions')
          .update({ [updateField]: true })
          .eq('id', metadata.transaction_id)

        if (transactionError) {
          console.error('Error updating transaction:', transactionError)
          throw transactionError
        }

        // Check if both parties have paid
        const { data: transaction } = await supabase
          .from('transactions')
          .select('buyer_success_fee_paid, seller_success_fee_paid')
          .eq('id', metadata.transaction_id)
          .single()

        if (transaction?.buyer_success_fee_paid && transaction?.seller_success_fee_paid) {
          // Mark transaction as completed
          await supabase
            .from('transactions')
            .update({ 
              status: 'completed',
              completed_at: new Date().toISOString()
            })
            .eq('id', metadata.transaction_id)

          // TODO: Trigger lawyer referral fee calculation
          await calculateLawyerReferralFees(metadata.transaction_id)
        }

        break
      }

      case 'checkout.session.expired': {
        const session = event.data.object as Stripe.Checkout.Session
        
        // Update payment status to failed
        await supabase
          .from('payments')
          .update({ status: 'failed' })
          .eq('stripe_checkout_session_id', session.id)
        
        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        
        // Update payment status
        await supabase
          .from('payments')
          .update({ status: 'failed' })
          .eq('stripe_payment_intent_id', paymentIntent.id)
        
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}

async function calculateLawyerReferralFees(transactionId: string) {
  const supabase = await createClient()
  
  // Get transaction details
  const { data: transaction } = await supabase
    .from('transactions')
    .select(`
      *,
      lawyer_buyer:lawyers!lawyer_buyer_id (
        id,
        payment_method,
        stripe_account_id
      ),
      lawyer_seller:lawyers!lawyer_seller_id (
        id,
        payment_method,
        stripe_account_id
      )
    `)
    .eq('id', transactionId)
    .single()

  if (!transaction) return

  const referralFee = 750 // Fixed referral fee per client

  // Create referral fee records for both lawyers
  const lawyers = [
    { lawyer: transaction.lawyer_buyer, type: 'buyer' },
    { lawyer: transaction.lawyer_seller, type: 'seller' }
  ].filter(item => item.lawyer)

  for (const { lawyer, type } of lawyers) {
    if (lawyer) {
      await supabase.from('payments').insert({
        transaction_id: transactionId,
        lawyer_id: lawyer.id,
        type: 'lawyer_referral',
        amount: referralFee,
        currency: 'ZAR', // Default to ZAR, adjust as needed
        status: 'pending',
        payment_method: lawyer.payment_method
      })
    }
  }
}