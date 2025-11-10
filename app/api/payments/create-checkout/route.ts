import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-10-29.clover',
})

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

    // Define pricing plans
    const plans: Record<string, { price: number; days: number; name: string }> = {
      featured_7: {
        price: 4900, // R49 in cents
        days: 7,
        name: 'Featured Listing - 7 Days'
      },
      featured_30: {
        price: 14900, // R149 in cents
        days: 30,
        name: 'Featured Listing - 30 Days'
      },
      premium_30: {
        price: 29900, // R299 in cents
        days: 30,
        name: 'Premium Listing - 30 Days (Featured + Top Placement)'
      }
    }

    const selectedPlan = plans[plan]
    if (!selectedPlan) {
      return NextResponse.json(
        { error: 'Invalid plan' },
        { status: 400 }
      )
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'zar',
            product_data: {
              name: selectedPlan.name,
              description: `Feature "${property.title}" for ${selectedPlan.days} days`,
            },
            unit_amount: selectedPlan.price,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${request.headers.get('origin')}/properties/${propertyId}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.headers.get('origin')}/properties/${propertyId}/payment-cancelled`,
      metadata: {
        propertyId: propertyId,
        userId: user.id,
        plan: plan,
        days: selectedPlan.days.toString(),
      },
      customer_email: user.email,
    })

    return NextResponse.json({ sessionId: session.id, url: session.url })
  } catch (error) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
