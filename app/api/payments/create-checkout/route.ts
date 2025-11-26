import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-10-29.clover',
})

// Map plan IDs to Stripe Price IDs and metadata
const PLANS: Record<string, { priceId: string; days: number; name: string }> = {
  featured_7: {
    priceId: process.env.STRIPE_PRICE_FEATURED_7!,
    days: 7,
    name: 'Featured Listing - 7 Days'
  },
  featured_30: {
    priceId: process.env.STRIPE_PRICE_FEATURED_30!,
    days: 30,
    name: 'Featured Listing - 30 Days'
  },
  premium_30: {
    priceId: process.env.STRIPE_PRICE_PREMIUM_30!,
    days: 30,
    name: 'Premium Listing - 30 Days'
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { propertyId, plan } = body

    if (!propertyId || !plan) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get property details
    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .select('id, title, seller_id')
      .eq('id', propertyId)
      .single() as {
        data: { id: string; title: string; seller_id: string } | null;
        error: any;
      }

    if (propertyError || !property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      )
    }

    // Verify user owns this property
    if (property.seller_id !== user.id) {
      return NextResponse.json(
        { error: 'You do not own this property' },
        { status: 403 }
      )
    }

    // Get selected plan
    const selectedPlan = PLANS[plan]
    if (!selectedPlan) {
      return NextResponse.json(
        { error: 'Invalid plan' },
        { status: 400 }
      )
    }

    // Verify Price ID is configured
    if (!selectedPlan.priceId || selectedPlan.priceId.includes('xxxxxxxx')) {
      console.error(`Stripe Price ID not configured for plan: ${plan}`)
      return NextResponse.json(
        { error: 'Payment configuration error. Please contact support.' },
        { status: 500 }
      )
    }

    // Create Stripe checkout session using Price ID
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: selectedPlan.priceId,
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${request.headers.get('origin')}/properties/${propertyId}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.headers.get('origin')}/properties/${propertyId}/payment-cancelled`,
      metadata: {
        propertyId: propertyId,
        propertyTitle: property.title,
        userId: user.id,
        plan: plan,
        days: selectedPlan.days.toString(),
      },
      customer_email: user.email,
    })

    return NextResponse.json({ sessionId: session.id, url: session.url })
  } catch (error: any) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
