import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    // Verify cron secret to prevent unauthorized access
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createClient()
    const now = new Date().toISOString()

    // Find all properties where featured has expired
    const { data: expiredProperties, error: fetchError } = await supabase
      .from('properties')
      .select('id, title, seller_id, featured_until')
      .eq('featured', true)
      .lt('featured_until', now) as {
        data: Array<{
          id: string
          title: string
          seller_id: string
          featured_until: string
        }> | null
        error: any
      }

    if (fetchError) {
      console.error('Error fetching expired featured listings:', fetchError)
      throw fetchError
    }

    if (!expiredProperties || expiredProperties.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No expired featured listings found',
        expiredCount: 0
      })
    }

    console.log(`Found ${expiredProperties.length} expired featured listings`)

    // Update all expired properties
    const expiredIds = expiredProperties.map(p => p.id)

    const { error: updateError } = await (supabase
      .from('properties') as any)
      .update({
        featured: false,
        premium: false,
        updated_at: now
      })
      .in('id', expiredIds)

    if (updateError) {
      console.error('Error updating expired listings:', updateError)
      throw updateError
    }

    // Create notifications for sellers
    const notifications = expiredProperties.map(property => ({
      user_id: property.seller_id,
      type: 'featured_expired',
      title: 'Featured listing expired',
      message: `Your featured listing "${property.title}" has expired. Renew it to continue getting premium visibility.`,
      data: JSON.stringify({ property_id: property.id }),
      read: false,
      created_at: now
    }))

    // Try to insert notifications (table may not exist)
    try {
      await (supabase.from('notifications') as any).insert(notifications)
    } catch (notifError) {
      console.log('Could not create notifications (table may not exist):', notifError)
    }

    // Log the expired properties
    for (const property of expiredProperties) {
      console.log(`Expired featured listing: ${property.title} (${property.id})`)
    }

    return NextResponse.json({
      success: true,
      message: `Successfully expired ${expiredProperties.length} featured listings`,
      expiredCount: expiredProperties.length,
      expiredProperties: expiredProperties.map(p => ({
        id: p.id,
        title: p.title,
        featured_until: p.featured_until
      }))
    })
  } catch (error) {
    console.error('Error expiring featured listings:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: (error as Error).message },
      { status: 500 }
    )
  }
}
