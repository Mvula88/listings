import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isFeatureEnabled } from '@/lib/settings'
import { withRateLimit, apiRateLimit } from '@/lib/security/rate-limit'

// Manual endpoint to feature a property (for admin/testing)
// In production, this would be protected by admin auth
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Apply rate limiting
    const rateLimitResponse = await withRateLimit(request, apiRateLimit)
    if (rateLimitResponse) return rateLimitResponse

    // Check if premium listings feature is enabled
    const premiumEnabled = await isFeatureEnabled('premium_listings')
    if (!premiumEnabled) {
      return NextResponse.json(
        { error: 'Premium listings feature is currently disabled' },
        { status: 403 }
      )
    }

    const { id } = await params
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
    const { days = 30, premium = false } = body

    // Get property to verify ownership
    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .select('id, seller_id, featured, featured_until')
      .eq('id', id)
      .single() as { data: any; error: any }

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

    // Calculate featured_until date (extend if already featured)
    let featuredUntil = new Date()
    if (property.featured && property.featured_until) {
      const currentEnd = new Date(property.featured_until)
      if (currentEnd > featuredUntil) {
        featuredUntil = currentEnd
      }
    }
    featuredUntil.setDate(featuredUntil.getDate() + days)

    // Update property
    const { error: updateError } = await (supabase.from('properties') as any)
      .update({
        featured: true,
        featured_until: featuredUntil.toISOString(),
        premium: premium,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (updateError) {
      console.error('Error updating property:', updateError)
      return NextResponse.json(
        { error: 'Failed to feature property' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `Property featured for ${days} days`,
      featured_until: featuredUntil.toISOString(),
      premium
    })
  } catch (error) {
    console.error('Error featuring property:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
