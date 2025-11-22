'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import {
  Eye,
  Heart,
  MessageSquare,
  TrendingUp,
  TrendingDown,
  Calendar,
  Users,
  Download,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface PropertyAnalytics {
  propertyId: string
  propertyTitle: string
  totalViews: number
  totalFavorites: number
  totalInquiries: number
  viewsChange: number
  favoritesChange: number
  inquiriesChange: number
  viewsData: Array<{ date: string; views: number }>
  inquiriesData: Array<{ date: string; inquiries: number }>
  favoritesData: Array<{ date: string; favorites: number }>
  topReferrers: Array<{ source: string; count: number }>
  demographics: {
    userTypes: Array<{ type: string; count: number }>
    locations: Array<{ city: string; count: number }>
  }
}

interface UserAnalyticsDashboardProps {
  userId: string
}

export function UserAnalyticsDashboard({ userId }: UserAnalyticsDashboardProps) {
  const [analytics, setAnalytics] = useState<PropertyAnalytics[]>([])
  const [selectedProperty, setSelectedProperty] = useState<string>('all')
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d')
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    loadAnalytics()
  }, [userId, timeRange])

  async function loadAnalytics() {
    setLoading(true)
    try {
      // Calculate date range
      const endDate = new Date()
      const startDate = new Date()
      switch (timeRange) {
        case '7d':
          startDate.setDate(startDate.getDate() - 7)
          break
        case '30d':
          startDate.setDate(startDate.getDate() - 30)
          break
        case '90d':
          startDate.setDate(startDate.getDate() - 90)
          break
        case '1y':
          startDate.setFullYear(startDate.getFullYear() - 1)
          break
      }

      // Fetch user's properties
      const { data: properties } = await supabase
        .from('properties')
        .select('id, title')
        .eq('owner_id', userId)
        .returns<Array<{ id: string; title: string }>>()

      if (!properties) return

      // Fetch analytics for each property
      const analyticsData = await Promise.all(
        properties.map(async (property) => {
          // Fetch views
          const { data: views } = await supabase
            .from('property_views')
            .select('*')
            .eq('property_id', property.id)
            .gte('created_at', startDate.toISOString())
            .lte('created_at', endDate.toISOString())
            .returns<Array<{ created_at: string; [key: string]: any }>>()

          // Fetch favorites
          const { data: favorites } = await supabase
            .from('favorites')
            .select('*, profiles(user_type, city)')
            .eq('property_id', property.id)
            .gte('created_at', startDate.toISOString())
            .lte('created_at', endDate.toISOString())
            .returns<Array<{ created_at: string; [key: string]: any }>>()

          // Fetch inquiries
          const { data: inquiries } = await supabase
            .from('inquiries')
            .select('*')
            .eq('property_id', property.id)
            .gte('created_at', startDate.toISOString())
            .lte('created_at', endDate.toISOString())
            .returns<Array<{ created_at: string; [key: string]: any }>>()

          // Calculate previous period for comparison
          const previousPeriodStart = new Date(startDate)
          const previousPeriodEnd = new Date(startDate)
          const periodLength = endDate.getTime() - startDate.getTime()
          previousPeriodStart.setTime(previousPeriodStart.getTime() - periodLength)

          const { data: previousViews } = await supabase
            .from('property_views')
            .select('id')
            .eq('property_id', property.id)
            .gte('created_at', previousPeriodStart.toISOString())
            .lt('created_at', startDate.toISOString())
            .returns<Array<{ id: string }>>()

          const { data: previousFavorites } = await supabase
            .from('favorites')
            .select('id')
            .eq('property_id', property.id)
            .gte('created_at', previousPeriodStart.toISOString())
            .lt('created_at', startDate.toISOString())
            .returns<Array<{ id: string }>>()

          const { data: previousInquiries } = await supabase
            .from('inquiries')
            .select('id')
            .eq('property_id', property.id)
            .gte('created_at', previousPeriodStart.toISOString())
            .lt('created_at', startDate.toISOString())
            .returns<Array<{ id: string }>>()

          // Calculate percentage changes
          const viewsChange = previousViews && previousViews.length > 0
            ? ((views?.length || 0) - previousViews.length) / previousViews.length * 100
            : 0

          const favoritesChange = previousFavorites && previousFavorites.length > 0
            ? ((favorites?.length || 0) - previousFavorites.length) / previousFavorites.length * 100
            : 0

          const inquiriesChange = previousInquiries && previousInquiries.length > 0
            ? ((inquiries?.length || 0) - previousInquiries.length) / previousInquiries.length * 100
            : 0

          // Group views by date
          const viewsByDate: Record<string, number> = {}
          views?.forEach((view) => {
            const date = new Date(view.created_at).toLocaleDateString()
            viewsByDate[date] = (viewsByDate[date] || 0) + 1
          })

          const viewsData = Object.entries(viewsByDate).map(([date, views]) => ({
            date,
            views,
          }))

          // Group inquiries by date
          const inquiriesByDate: Record<string, number> = {}
          inquiries?.forEach((inquiry) => {
            const date = new Date(inquiry.created_at).toLocaleDateString()
            inquiriesByDate[date] = (inquiriesByDate[date] || 0) + 1
          })

          const inquiriesData = Object.entries(inquiriesByDate).map(([date, inquiries]) => ({
            date,
            inquiries,
          }))

          // Group favorites by date
          const favoritesByDate: Record<string, number> = {}
          favorites?.forEach((favorite) => {
            const date = new Date(favorite.created_at).toLocaleDateString()
            favoritesByDate[date] = (favoritesByDate[date] || 0) + 1
          })

          const favoritesData = Object.entries(favoritesByDate).map(([date, favorites]) => ({
            date,
            favorites,
          }))

          // Analyze referrers
          const referrerCounts: Record<string, number> = {}
          views?.forEach((view) => {
            const source = view.referrer || 'Direct'
            referrerCounts[source] = (referrerCounts[source] || 0) + 1
          })

          const topReferrers = Object.entries(referrerCounts)
            .map(([source, count]) => ({ source, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5)

          // Analyze demographics
          const userTypeCounts: Record<string, number> = {}
          const locationCounts: Record<string, number> = {}

          favorites?.forEach((favorite: any) => {
            if (favorite.profiles?.user_type) {
              const type = favorite.profiles.user_type
              userTypeCounts[type] = (userTypeCounts[type] || 0) + 1
            }
            if (favorite.profiles?.city) {
              const city = favorite.profiles.city
              locationCounts[city] = (locationCounts[city] || 0) + 1
            }
          })

          const demographics = {
            userTypes: Object.entries(userTypeCounts).map(([type, count]) => ({ type, count })),
            locations: Object.entries(locationCounts)
              .map(([city, count]) => ({ city, count }))
              .sort((a, b) => b.count - a.count)
              .slice(0, 5),
          }

          return {
            propertyId: property.id,
            propertyTitle: property.title,
            totalViews: views?.length || 0,
            totalFavorites: favorites?.length || 0,
            totalInquiries: inquiries?.length || 0,
            viewsChange,
            favoritesChange,
            inquiriesChange,
            viewsData,
            inquiriesData,
            favoritesData,
            topReferrers,
            demographics,
          }
        })
      )

      setAnalytics(analyticsData)
    } catch (error) {
      console.error('Failed to load analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  // Aggregate data when "all" is selected
  const currentAnalytics = selectedProperty === 'all'
    ? {
        propertyId: 'all',
        propertyTitle: 'All Properties',
        totalViews: analytics.reduce((sum, a) => sum + a.totalViews, 0),
        totalFavorites: analytics.reduce((sum, a) => sum + a.totalFavorites, 0),
        totalInquiries: analytics.reduce((sum, a) => sum + a.totalInquiries, 0),
        viewsChange: analytics.length > 0
          ? analytics.reduce((sum, a) => sum + a.viewsChange, 0) / analytics.length
          : 0,
        favoritesChange: analytics.length > 0
          ? analytics.reduce((sum, a) => sum + a.favoritesChange, 0) / analytics.length
          : 0,
        inquiriesChange: analytics.length > 0
          ? analytics.reduce((sum, a) => sum + a.inquiriesChange, 0) / analytics.length
          : 0,
        viewsData: aggregateDataByDate(analytics.flatMap(a => a.viewsData), 'views'),
        inquiriesData: aggregateDataByDate(analytics.flatMap(a => a.inquiriesData), 'inquiries'),
        favoritesData: aggregateDataByDate(analytics.flatMap(a => a.favoritesData), 'favorites'),
        topReferrers: aggregateReferrers(analytics.flatMap(a => a.topReferrers)),
        demographics: {
          userTypes: aggregateDemographics(analytics.flatMap(a => a.demographics.userTypes), 'type'),
          locations: aggregateDemographics(analytics.flatMap(a => a.demographics.locations), 'city'),
        },
      }
    : analytics.find(a => a.propertyId === selectedProperty) || null

  function aggregateDataByDate(data: any[], key: string) {
    const grouped: Record<string, number> = {}
    data.forEach(item => {
      grouped[item.date] = (grouped[item.date] || 0) + item[key]
    })
    return Object.entries(grouped).map(([date, value]) => ({ date, [key]: value }))
  }

  function aggregateReferrers(referrers: any[]) {
    const grouped: Record<string, number> = {}
    referrers.forEach(ref => {
      grouped[ref.source] = (grouped[ref.source] || 0) + ref.count
    })
    return Object.entries(grouped)
      .map(([source, count]) => ({ source, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
  }

  function aggregateDemographics(items: any[], key: string) {
    const grouped: Record<string, number> = {}
    items.forEach(item => {
      const value = item[key]
      grouped[value] = (grouped[value] || 0) + item.count
    })
    return Object.entries(grouped).map(([value, count]) => ({ [key]: value, count }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  if (!currentAnalytics) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <p className="text-muted-foreground">No analytics data available</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Select value={selectedProperty} onValueChange={setSelectedProperty}>
            <SelectTrigger className="w-full sm:w-[280px]">
              <SelectValue placeholder="Select property" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Properties</SelectItem>
              {analytics.map((a) => (
                <SelectItem key={a.propertyId} value={a.propertyId}>
                  {a.propertyTitle}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={timeRange} onValueChange={(value: any) => setTimeRange(value)}>
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentAnalytics.totalViews.toLocaleString()}</div>
            <p className={`text-xs flex items-center gap-1 mt-1 ${
              currentAnalytics.viewsChange >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {currentAnalytics.viewsChange >= 0 ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {Math.abs(currentAnalytics.viewsChange).toFixed(1)}% from previous period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Favorites</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentAnalytics.totalFavorites.toLocaleString()}</div>
            <p className={`text-xs flex items-center gap-1 mt-1 ${
              currentAnalytics.favoritesChange >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {currentAnalytics.favoritesChange >= 0 ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {Math.abs(currentAnalytics.favoritesChange).toFixed(1)}% from previous period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Inquiries</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentAnalytics.totalInquiries.toLocaleString()}</div>
            <p className={`text-xs flex items-center gap-1 mt-1 ${
              currentAnalytics.inquiriesChange >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {currentAnalytics.inquiriesChange >= 0 ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {Math.abs(currentAnalytics.inquiriesChange).toFixed(1)}% from previous period
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="views" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="views">Views</TabsTrigger>
          <TabsTrigger value="inquiries">Inquiries</TabsTrigger>
          <TabsTrigger value="favorites">Favorites</TabsTrigger>
        </TabsList>

        <TabsContent value="views" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Views Over Time</CardTitle>
              <CardDescription>Daily property views for the selected period</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={currentAnalytics.viewsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="views" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inquiries" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Inquiries Over Time</CardTitle>
              <CardDescription>Daily inquiries received for the selected period</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={currentAnalytics.inquiriesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="inquiries" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="favorites" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Favorites Over Time</CardTitle>
              <CardDescription>Daily favorites added for the selected period</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={currentAnalytics.favoritesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="favorites" stroke="#ff7300" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Additional Insights */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top Traffic Sources</CardTitle>
            <CardDescription>Where your views are coming from</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {currentAnalytics.topReferrers.map((referrer, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{referrer.source}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{
                          width: `${(referrer.count / currentAnalytics.totalViews) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground w-12 text-right">
                      {referrer.count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Audience Demographics</CardTitle>
            <CardDescription>Who is interested in your property</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  User Types
                </h4>
                {currentAnalytics.demographics.userTypes.map((item: any, index) => (
                  <div key={index} className="flex items-center justify-between py-1">
                    <span className="text-sm capitalize">{item.type}</span>
                    <span className="text-sm font-medium">{item.count}</span>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t">
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Top Locations
                </h4>
                {currentAnalytics.demographics.locations.map((item: any, index) => (
                  <div key={index} className="flex items-center justify-between py-1">
                    <span className="text-sm">{item.city}</span>
                    <span className="text-sm font-medium">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
