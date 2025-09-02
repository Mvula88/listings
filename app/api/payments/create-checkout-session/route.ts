import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/client'
import { createClient } from '@/lib/supabase/server'
import { PAYMENT_CONFIG } from '@/lib/stripe/config'

export async function POST(request: NextRequest) {
  try {
    const { transactionId, userRole, amount, currency } = await request.json()
    
    const supabase = await createClient()
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get transaction details
    const { data: transaction } = await supabase
      .from('transactions')
      .select(`
        *,
        property:properties (
          title,
          address_line1,
          city
        ),
        buyer:profiles!buyer_id (
          email,
          full_name,
          stripe_customer_id
        ),
        seller:profiles!seller_id (
          email,
          full_name,
          stripe_customer_id
        )
      `)
      .eq('id', transactionId)
      .single() as any

    if (!transaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      )
    }

    // Verify user is part of this transaction
    const isAuthorized = 
      (userRole === 'buyer' && transaction.buyer_id === user.id) ||
      (userRole === 'seller' && transaction.seller_id === user.id)

    if (!isAuthorized) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Get or create Stripe customer
    const profile = userRole === 'buyer' ? transaction.buyer : transaction.seller
    let stripeCustomerId = profile.stripe_customer_id

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: profile.email,
        name: profile.full_name,
        metadata: {
          user_id: user.id,
          transaction_id: transactionId
        }
      })

      stripeCustomerId = customer.id

      // Save Stripe customer ID
      await (supabase
        .from('profiles')
        .update({ stripe_customer_id: stripeCustomerId })
        .eq('id', user.id) as any)
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: currency.toLowerCase(),
            product_data: {
              name: 'DealDirect Success Fee',
              description: `Transaction fee for ${transaction.property.title}`,
            },
            unit_amount: amount * 100, // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_URL}/transactions/${transactionId}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/transactions/${transactionId}/payment`,
      metadata: {
        transaction_id: transactionId,
        user_id: user.id,
        user_role: userRole,
        payment_type: `success_fee_${userRole}`
      }
    })

    // Create payment record
    await supabase.from('payments').insert({
      transaction_id: transactionId,
      user_id: user.id,
      type: `success_fee_${userRole}`,
      amount: amount,
      currency: currency,
      status: 'pending',
      stripe_checkout_session_id: session.id
    })

    return NextResponse.json({ sessionId: session.id })
  } catch (error: any) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}