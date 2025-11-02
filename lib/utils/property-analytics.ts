// Property Analytics Utilities
// Track and analyze property views, engagement, and performance

import type { PropertyView, PropertyViewsAnalytics } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'

/**
 * Tracks a property view
 * @param propertyId - Property ID
 * @param sessionId - Optional session ID for tracking unique visitors
 * @returns Success status
 */
export async function trackPropertyView(
  propertyId: string,
  sessionId?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient()

    // Get current user (if authenticated)
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Get client info
    const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : null
    const referrer = typeof document !== 'undefined' ? document.referrer || null : null

    // Create view record
    const { error }: any = await (supabase as any).from('property_views').insert({
      property_id: propertyId,
      viewer_id: user?.id || null,
      user_agent: userAgent,
      referrer: referrer,
      session_id: sessionId || null,
      viewed_at: new Date().toISOString(),
      duration_seconds: 0, // Will be updated on page unload
    })

    if (error) {
      console.error('Failed to track property view:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Exception tracking property view:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Updates the duration of a property view
 * @param propertyId - Property ID
 * @param sessionId - Session ID
 * @param durationSeconds - Time spent viewing in seconds
 */
export async function updateViewDuration(
  propertyId: string,
  sessionId: string,
  durationSeconds: number
): Promise<void> {
  try {
    const supabase = createClient()

    await (supabase as any)
      .from('property_views')
      .update({ duration_seconds: Math.round(durationSeconds) })
      .eq('property_id', propertyId)
      .eq('session_id', sessionId)
      .order('viewed_at', { ascending: false })
      .limit(1)
  } catch (error) {
    console.error('Failed to update view duration:', error)
  }
}

/**
 * Gets property analytics
 * @param propertyId - Property ID
 * @param days - Number of days to analyze (default: 30)
 * @returns Property analytics
 */
export async function getPropertyAnalytics(
  propertyId: string,
  days: number = 30
): Promise<PropertyViewsAnalytics | null> {
  try {
    const supabase = createClient()

    const dateFrom = new Date()
    dateFrom.setDate(dateFrom.getDate() - days)

    // Get all views for the property
    const { data: views, error }: any = await (supabase as any)
      .from('property_views')
      .select('*')
      .eq('property_id', propertyId)
      .gte('viewed_at', dateFrom.toISOString())

    if (error) {
      console.error('Failed to get property analytics:', error)
      return null
    }

    if (!views || views.length === 0) {
      return {
        property_id: propertyId,
        total_views: 0,
        unique_visitors: 0,
        average_duration: 0,
        views_by_date: [],
        top_referrers: [],
      }
    }

    // Calculate metrics
    const totalViews = views.length
    const uniqueVisitors = new Set(
      views.map((v: any) => v.viewer_id || v.ip_address || v.session_id).filter(Boolean)
    ).size

    const averageDuration =
      views.reduce((sum: number, v: any) => sum + (v.duration_seconds || 0), 0) / totalViews

    // Group views by date
    const viewsByDate = views.reduce(
      (acc: Record<string, number>, view: any) => {
        const date = view.viewed_at.split('T')[0]
        acc[date] = (acc[date] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    )

    const viewsByDateArray = Object.entries(viewsByDate)
      .map(([date, count]) => ({ date, count: count as number }))
      .sort((a, b) => a.date.localeCompare(b.date))

    // Group by referrer
    const viewsByReferrer = views.reduce(
      (acc: Record<string, number>, view: any) => {
        const referrer = view.referrer || 'Direct'
        acc[referrer] = (acc[referrer] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    )

    const topReferrers = Object.entries(viewsByReferrer)
      .map(([referrer, count]) => ({ referrer, count: count as number }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    return {
      property_id: propertyId,
      total_views: totalViews,
      unique_visitors: uniqueVisitors,
      average_duration: Math.round(averageDuration),
      views_by_date: viewsByDateArray,
      top_referrers: topReferrers,
    }
  } catch (error) {
    console.error('Exception getting property analytics:', error)
    return null
  }
}

/**
 * Gets seller's property performance summary
 * @param sellerId - Seller user ID
 * @returns Array of properties with analytics
 */
export async function getSellerPropertiesPerformance(sellerId: string) {
  try {
    const supabase = createClient()

    // Get seller's properties with view counts
    const { data: properties, error } = await supabase
      .from('properties')
      .select(
        `
        id,
        title,
        price,
        status,
        view_count,
        inquiry_count,
        save_count,
        created_at
      `
      )
      .eq('seller_id', sellerId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Failed to get seller properties:', error)
      return []
    }

    return properties || []
  } catch (error) {
    console.error('Exception getting seller properties:', error)
    return []
  }
}

/**
 * Gets popular properties (most viewed)
 * @param limit - Number of properties to return
 * @param days - Number of days to consider (default: 7)
 * @returns Array of popular properties
 */
export async function getPopularProperties(limit: number = 10, days: number = 7) {
  try {
    const supabase = createClient()

    const dateFrom = new Date()
    dateFrom.setDate(dateFrom.getDate() - days)

    // Get view counts grouped by property
    const { data: viewCounts, error: viewError }: any = await (supabase as any)
      .from('property_views')
      .select('property_id')
      .gte('viewed_at', dateFrom.toISOString())

    if (viewError) {
      console.error('Failed to get view counts:', viewError)
      return []
    }

    // Count views per property
    const propertyViews = viewCounts.reduce(
      (acc: Record<string, number>, view: any) => {
        acc[view.property_id] = (acc[view.property_id] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    )

    // Get top property IDs
    const topPropertyIds = Object.entries(propertyViews)
      .sort((a, b) => (b[1] as number) - (a[1] as number))
      .slice(0, limit)
      .map(([id]) => id)

    if (topPropertyIds.length === 0) {
      return []
    }

    // Get property details
    const { data: properties, error: propError }: any = await supabase
      .from('properties')
      .select('*, property_images(*), countries(*)')
      .in('id', topPropertyIds)
      .eq('status', 'active')

    if (propError) {
      console.error('Failed to get properties:', propError)
      return []
    }

    // Sort by view count
    return (properties || []).sort(
      (a: any, b: any) => propertyViews[b.id] - propertyViews[a.id]
    )
  } catch (error) {
    console.error('Exception getting popular properties:', error)
    return []
  }
}

/**
 * Calculates conversion rate for a property
 * @param propertyId - Property ID
 * @returns Conversion metrics
 */
export async function getPropertyConversionRate(propertyId: string) {
  try {
    const supabase = createClient()

    // Get property with counts
    const { data: property, error }: any = await supabase
      .from('properties')
      .select('view_count, inquiry_count, save_count')
      .eq('id', propertyId)
      .single()

    if (error || !property) {
      return { viewToInquiry: 0, viewToSave: 0, saveToInquiry: 0 }
    }

    const viewToInquiry =
      property.view_count > 0
        ? (property.inquiry_count / property.view_count) * 100
        : 0

    const viewToSave =
      property.view_count > 0 ? (property.save_count / property.view_count) * 100 : 0

    const saveToInquiry =
      property.save_count > 0
        ? (property.inquiry_count / property.save_count) * 100
        : 0

    return {
      viewToInquiry: Math.round(viewToInquiry * 10) / 10,
      viewToSave: Math.round(viewToSave * 10) / 10,
      saveToInquiry: Math.round(saveToInquiry * 10) / 10,
    }
  } catch (error) {
    console.error('Exception calculating conversion rate:', error)
    return { viewToInquiry: 0, viewToSave: 0, saveToInquiry: 0 }
  }
}

/**
 * Generates a unique session ID for tracking
 * @returns Session ID
 */
export function generateSessionId(): string {
  if (typeof window !== 'undefined') {
    // Try to get existing session ID from sessionStorage
    const existing = sessionStorage.getItem('property_session_id')
    if (existing) return existing

    // Generate new session ID
    const sessionId = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`
    sessionStorage.setItem('property_session_id', sessionId)
    return sessionId
  }

  // Fallback for server-side
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`
}
