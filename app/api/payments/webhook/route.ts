import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'
import type { TablesUpdate } from '@/lib/supabase/types'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-10-29.clover',
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: Request) {
  try {
    const body = await request.text()
    const headersList = await headers()
    const signature = headersList.get('stripe-signature')!

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message)
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      )
    }

    // Handle the checkout.session.completed event
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session

      const propertyId = session.metadata?.propertyId
      const userId = session.metadata?.userId
      const plan = session.metadata?.plan
      const days = parseInt(session.metadata?.days || '0')

      if (!propertyId || !userId) {
        console.error('Missing metadata in session')
        return NextResponse.json({ error: 'Missing metadata' }, { status: 400 })
      }

      const supabase = await createClient()

      // Calculate featured_until date
      const featuredUntil = new Date()
      featuredUntil.setDate(featuredUntil.getDate() + days)

      // Update property to be featured
      const updateResult = await (supabase as any)
        .from('properties')
        .update({
          featured: true,
          featured_until: featuredUntil.toISOString(),
          premium: plan?.includes('premium') || false,
        })
        .eq('id', propertyId)

      const { error: updateError } = updateResult

      if (updateError) {
        console.error('Error updating property:', updateError)
        return NextResponse.json(
          { error: 'Failed to update property' },
          { status: 500 }
        )
      }

      // Create payment record
      await supabase.from('payments').insert({
        user_id: userId,
        property_id: propertyId,
        type: 'premium_listing',
        amount: session.amount_total! / 100, // Convert from cents
        currency: session.currency?.toUpperCase() || 'ZAR',
        stripe_checkout_session_id: session.id,
        stripe_payment_intent_id: session.payment_intent as string,
        status: 'succeeded',
        payment_method: 'card',
        paid_at: new Date().toISOString(),
        metadata: {
          plan,
          days,
        }
      })

      console.log(`Property ${propertyId} featured successfully`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}
