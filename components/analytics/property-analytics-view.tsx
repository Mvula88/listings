'use client'

// Property Analytics View Component
// Displays comprehensive analytics for a property

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Eye, Heart, MessageSquare, TrendingUp, Clock, Users, Target } from 'lucide-react'
import type { PropertyViewsAnalytics } from '@/lib/types'
import { formatPrice } from '@/lib/utils/format'
import Link from 'next/link'

interface PropertyAnalyticsViewProps {
  property: any
  analytics30Days: PropertyViewsAnalytics | null
  analytics7Days: PropertyViewsAnalytics | null
  conversionRates: {
    viewToInquiry: number
    viewToSave: number
    saveToInquiry: number
  }
}

export function PropertyAnalyticsView({
  property,
  analytics30Days,
  analytics7Days,
  conversionRates,
}: PropertyAnalyticsViewProps) {
  const daysOnMarket = Math.floor(
    (Date.now() - new Date(property.created_at).getTime()) / (1000 * 60 * 60 * 24)
  )

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">{property.title}</h1>
          <p className="text-muted-foreground mb-4">
            {formatPrice(property.price, property.currency)} • {property.city},{' '}
            {property.province}
          </p>
          <div className="flex gap-2">
            <Badge variant={property.status === 'active' ? 'default' : 'secondary'}>
              {property.status}
            </Badge>
            {property.featured && <Badge variant="outline">Featured</Badge>}
            {property.is_premium && <Badge variant="outline">Premium</Badge>}
            {property.is_verified && <Badge variant="outline">Verified</Badge>}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/properties/${property.id}`}>View Property</Link>
          </Button>
          <Button asChild>
            <Link href={`/properties/${property.id}/edit`}>Edit Property</Link>
          </Button>
        </div>
      </div>

      <Separator />

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Views */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <Eye className="h-5 w-5 text-muted-foreground" />
            <Badge variant="secondary" className="text-xs">
              30 days
            </Badge>
          </div>
          <div className="text-2xl font-bold">
            {analytics30Days?.total_views || property.view_count || 0}
          </div>
          <p className="text-sm text-muted-foreground">Total Views</p>
          <p className="text-xs text-green-600 mt-1">
            +{analytics7Days?.total_views || 0} this week
          </p>
        </Card>

        {/* Unique Visitors */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <Users className="h-5 w-5 text-muted-foreground" />
            <Badge variant="secondary" className="text-xs">
              30 days
            </Badge>
          </div>
          <div className="text-2xl font-bold">
            {analytics30Days?.unique_visitors || 0}
          </div>
          <p className="text-sm text-muted-foreground">Unique Visitors</p>
          <p className="text-xs text-green-600 mt-1">
            +{analytics7Days?.unique_visitors || 0} this week
          </p>
        </Card>

        {/* Inquiries */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <MessageSquare className="h-5 w-5 text-muted-foreground" />
            <Badge
              variant={property.inquiry_count > 0 ? 'default' : 'secondary'}
              className="text-xs"
            >
              {conversionRates.viewToInquiry.toFixed(1)}% rate
            </Badge>
          </div>
          <div className="text-2xl font-bold">{property.inquiry_count || 0}</div>
          <p className="text-sm text-muted-foreground">Inquiries</p>
          <p className="text-xs text-muted-foreground mt-1">
            {property.inquiry_count > 0 ? 'Great engagement!' : 'Waiting for inquiries'}
          </p>
        </Card>

        {/* Favorites */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <Heart className="h-5 w-5 text-muted-foreground" />
            <Badge variant="secondary" className="text-xs">
              {conversionRates.viewToSave.toFixed(1)}% rate
            </Badge>
          </div>
          <div className="text-2xl font-bold">{property.save_count || 0}</div>
          <p className="text-sm text-muted-foreground">Saved by Users</p>
          <p className="text-xs text-muted-foreground mt-1">
            {property.save_count > 0 ? 'High interest!' : 'No saves yet'}
          </p>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Engagement Stats */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Engagement Stats</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Average Time Spent</span>
              </div>
              <span className="font-medium">
                {analytics30Days?.average_duration || 0}s
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">View to Inquiry Rate</span>
              </div>
              <span className="font-medium">{conversionRates.viewToInquiry}%</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Heart className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">View to Save Rate</span>
              </div>
              <span className="font-medium">{conversionRates.viewToSave}%</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Save to Inquiry Rate</span>
              </div>
              <span className="font-medium">{conversionRates.saveToInquiry}%</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Days on Market</span>
              </div>
              <span className="font-medium">{daysOnMarket} days</span>
            </div>
          </div>
        </Card>

        {/* Traffic Sources */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Traffic Sources (Last 30 Days)</h3>
          {analytics30Days && analytics30Days.top_referrers.length > 0 ? (
            <div className="space-y-3">
              {analytics30Days.top_referrers.map((referrer, index) => {
                const percentage =
                  analytics30Days.total_views > 0
                    ? (referrer.count / analytics30Days.total_views) * 100
                    : 0

                return (
                  <div key={index} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="truncate max-w-[200px]">
                        {referrer.referrer}
                      </span>
                      <span className="font-medium">
                        {referrer.count} ({percentage.toFixed(0)}%)
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No traffic data available yet. Share your listing to get more views!
            </p>
          )}
        </Card>
      </div>

      {/* Views Over Time Chart */}
      {analytics30Days && analytics30Days.views_by_date.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Views Over Time (Last 30 Days)</h3>
          <div className="h-64 flex items-end gap-1">
            {analytics30Days.views_by_date.map((day, index) => {
              const maxViews = Math.max(
                ...analytics30Days.views_by_date.map((d) => d.count)
              )
              const height = maxViews > 0 ? (day.count / maxViews) * 100 : 0

              return (
                <div key={index} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full bg-primary rounded-t hover:bg-primary/80 transition-colors cursor-pointer"
                    style={{ height: `${height}%` }}
                    title={`${day.date}: ${day.count} views`}
                  />
                  {index % 5 === 0 && (
                    <span className="text-[10px] text-muted-foreground rotate-45 origin-left">
                      {new Date(day.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </Card>
      )}

      {/* Insights & Recommendations */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Insights & Recommendations</h3>
        <div className="space-y-3">
          {conversionRates.viewToInquiry < 2 && (
            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
              <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                Low inquiry rate ({conversionRates.viewToInquiry}%)
              </p>
              <p className="text-sm text-amber-700 dark:text-amber-200 mt-1">
                Consider improving your photos, adding a virtual tour, or adjusting
                your price.
              </p>
            </div>
          )}

          {daysOnMarket > 60 && (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                Property has been listed for {daysOnMarket} days
              </p>
              <p className="text-sm text-blue-700 dark:text-blue-200 mt-1">
                Consider refreshing your listing with new photos or adjusting the
                price.
              </p>
            </div>
          )}

          {(analytics30Days?.total_views || 0) < 50 && daysOnMarket > 14 && (
            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
              <p className="text-sm font-medium text-purple-900 dark:text-purple-100">
                Low visibility ({analytics30Days?.total_views || 0} views in 30 days)
              </p>
              <p className="text-sm text-purple-700 dark:text-purple-200 mt-1">
                Share your listing on social media or consider upgrading to a premium
                listing for better visibility.
              </p>
            </div>
          )}

          {conversionRates.viewToInquiry >= 5 && (
            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <p className="text-sm font-medium text-green-900 dark:text-green-100">
                Excellent performance! 🎉
              </p>
              <p className="text-sm text-green-700 dark:text-green-200 mt-1">
                Your property has a {conversionRates.viewToInquiry}% inquiry rate -
                that's above average!
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
