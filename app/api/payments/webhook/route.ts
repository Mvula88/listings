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

    const supabase = await createClient()

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session

        const propertyId = session.metadata?.propertyId
        const userId = session.metadata?.userId
        const plan = session.metadata?.plan
        const days = parseInt(session.metadata?.days || '0')

        if (!propertyId || !userId) {
          console.error('Missing metadata in session')
          return NextResponse.json({ error: 'Missing metadata' }, { status: 400 })
        }

        // Get current property to check if already featured (for extensions)
        const { data: currentProperty } = await supabase
          .from('properties')
          .select('featured, featured_until')
          .eq('id', propertyId)
          .single() as { data: { featured: boolean; featured_until: string | null } | null; error: any }

        // Calculate featured_until date
        // If already featured, extend from current end date
        let featuredUntil = new Date()
        if (currentProperty?.featured && currentProperty.featured_until) {
          const currentEnd = new Date(currentProperty.featured_until)
          if (currentEnd > featuredUntil) {
            featuredUntil = currentEnd
          }
        }
        featuredUntil.setDate(featuredUntil.getDate() + days)

        // Update property to be featured
        const updateData: TablesUpdate<'properties'> = {
          featured: true,
          featured_until: featuredUntil.toISOString(),
          premium: plan?.includes('premium') || false,
        }

        const { error: updateError } = await (supabase.from('properties') as any)
          .update(updateData)
          .eq('id', propertyId)

        if (updateError) {
          console.error('Error updating property:', updateError)
          return NextResponse.json(
            { error: 'Failed to update property' },
            { status: 500 }
          )
        }

        // Create payment record
        await (supabase.from('payments') as any).insert({
          user_id: userId,
          property_id: propertyId,
          type: 'featured_listing',
          amount: session.amount_total! / 100, // Convert from cents
          currency: session.currency?.toUpperCase() || 'ZAR',
          stripe_checkout_session_id: session.id,
          stripe_payment_intent_id: session.payment_intent as string,
          status: 'completed',
          payment_method: 'card',
          paid_at: new Date().toISOString(),
          metadata: {
            plan,
            days,
            featured_until: featuredUntil.toISOString(),
          }
        })

        // Create notification for user
        try {
          await (supabase.from('notifications') as any).insert({
            user_id: userId,
            type: 'payment',
            title: 'Payment Successful',
            message: `Your property has been featured for ${days} days!`,
            data: JSON.stringify({
              property_id: propertyId,
              plan,
              featured_until: featuredUntil.toISOString()
            }),
            read: false,
          })
        } catch (notifError) {
          console.log('Could not create notification:', notifError)
        }

        console.log(`Property ${propertyId} featured successfully until ${featuredUntil.toISOString()}`)
        break
      }

      case 'checkout.session.expired': {
        const session = event.data.object as Stripe.Checkout.Session
        console.log(`Checkout session expired: ${session.id}`)
        // Optionally track abandoned checkouts for analytics
        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        console.error(`Payment failed: ${paymentIntent.id}`, paymentIntent.last_payment_error?.message)

        // Create failed payment record if metadata exists
        if (paymentIntent.metadata?.propertyId && paymentIntent.metadata?.userId) {
          await (supabase.from('payments') as any).insert({
            user_id: paymentIntent.metadata.userId,
            property_id: paymentIntent.metadata.propertyId,
            type: 'featured_listing',
            amount: paymentIntent.amount / 100,
            currency: paymentIntent.currency.toUpperCase(),
            stripe_payment_intent_id: paymentIntent.id,
            status: 'failed',
            payment_method: 'card',
            metadata: {
              error: paymentIntent.last_payment_error?.message,
              plan: paymentIntent.metadata.plan,
            }
          })
        }
        break
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge
        console.log(`Charge refunded: ${charge.id}`)

        // Update payment record if it exists
        if (charge.payment_intent) {
          await (supabase.from('payments') as any)
            .update({ status: 'refunded' })
            .eq('stripe_payment_intent_id', charge.payment_intent)
        }
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
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
