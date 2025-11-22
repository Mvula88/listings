// Property Analytics Dashboard
// Shows detailed analytics for property owners

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getPropertyAnalytics, getPropertyConversionRate } from '@/lib/utils/property-analytics'
import { PropertyAnalyticsView } from '@/components/analytics/property-analytics-view'

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function PropertyAnalyticsPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get property details
  const { data: property, error } = await supabase
    .from('properties')
    .select('*, property_images(*), countries(*)')
    .eq('id', id)
    .single<{ seller_id: string; [key: string]: any }>()

  if (error || !property) {
    redirect('/properties')
  }

  // Check if user owns this property
  if (property.seller_id !== user.id) {
    redirect('/properties')
  }

  // Get analytics data
  const [analytics30Days, analytics7Days, conversionRates] = await Promise.all([
    getPropertyAnalytics(id, 30),
    getPropertyAnalytics(id, 7),
    getPropertyConversionRate(id),
  ])

  return (
    <PropertyAnalyticsView
      property={property}
      analytics30Days={analytics30Days}
      analytics7Days={analytics7Days}
      conversionRates={conversionRates}
    />
  )
}
