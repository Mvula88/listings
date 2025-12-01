import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Users,
  Building,
  Scale,
  FileText,
  TrendingUp,
  Activity,
  AlertCircle,
  DollarSign,
  CheckCircle2,
  BarChart3,
  Banknote,
} from 'lucide-react'
import { AnimatedCounter } from '@/components/ui/animated-counter'
import { FadeIn } from '@/components/ui/fade-in'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { getPlatformStats } from '@/lib/admin/actions'

interface RecentUser {
  id: string
  full_name: string | null
  email: string
  created_at: string
}

interface RecentProperty {
  id: string
  title: string
  created_at: string
  status: string
}

export default async function AdminDashboard() {
  const supabase = await createClient()

  // Get platform stats
  const stats = await getPlatformStats()

  // Get pending items that need attention
  const { data: pendingProperties } = await supabase
    .from('properties')
    .select('id')
    .eq('moderation_status', 'pending')

  const { data: unverifiedLawyers } = await supabase
    .from('lawyers')
    .select('id')
    .eq('verified', false)

  const { data: contentFlags } = await (supabase as any)
    .from('content_flags')
    .select('id')
    .eq('status', 'pending')

  const { data: _suspendedUsers } = await supabase
    .from('profiles')
    .select('id')
    .eq('is_suspended', true)

  // Get financial stats with error handling
  const { data: allListings, error: listingsError } = await supabase
    .from('properties')
    .select('price')
    .eq('status', 'active') as { data: Array<{ price: number }> | null; error: Error | null }

  const { data: completedDeals, error: dealsError } = await supabase
    .from('transactions')
    .select('agreed_price, platform_fee_amount')
    .eq('status', 'completed') as { data: Array<{ agreed_price: number | null; platform_fee_amount: number | null }> | null; error: Error | null }

  const { data: allTransactions, error: txError } = await supabase
    .from('transactions')
    .select('agreed_price, status') as { data: Array<{ agreed_price: number | null; status: string }> | null; error: Error | null }

  // Log errors but don't fail the page
  if (listingsError) console.error('Error fetching listings:', listingsError)
  if (dealsError) console.error('Error fetching completed deals:', dealsError)
  if (txError) console.error('Error fetching transactions:', txError)

  // Platform fee calculation based on tiered pricing
  function calculatePlatformFee(price: number): number {
    if (price <= 500000) return 4500
    if (price <= 1000000) return 7500
    if (price <= 1500000) return 9500
    if (price <= 2500000) return 12500
    if (price <= 5000000) return 18000
    if (price <= 10000000) return 30000
    return 45000
  }

  // Calculate totals with safe fallbacks
  const totalListingValue = allListings?.reduce((sum, p) => sum + (p.price || 0), 0) || 0
  const totalDealsValue = completedDeals?.reduce((sum, t) => sum + (t.agreed_price || 0), 0) || 0
  const totalPlatformFees = completedDeals?.reduce((sum, t) => sum + (t.platform_fee_amount || 0), 0) || 0
  const estimatedPlatformFees = allListings?.reduce((sum, p) => sum + calculatePlatformFee(p.price || 0), 0) || 0
  const completedDealsCount = completedDeals?.length || 0
  const inProgressDeals = allTransactions?.filter(t => t.status === 'in_progress').length || 0
  const totalListingsCount = allListings?.length || 0

  // Get recent activity
  const { data: recentUsers } = await supabase
    .from('profiles')
    .select('id, full_name, email, created_at')
    .order('created_at', { ascending: false })
    .limit(5)
    .returns<RecentUser[]>()

  const { data: recentProperties } = await supabase
    .from('properties')
    .select('id, title, created_at, status')
    .order('created_at', { ascending: false })
    .limit(5)
    .returns<RecentProperty[]>()

  return (
    <div className="space-y-8">
      {/* Header */}
      <FadeIn>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground text-lg mt-1">
              Platform overview and management
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/admin/analytics">Full Analytics</Link>
            </Button>
            <Button asChild>
              <Link href="/" target="_blank">
                View Site
              </Link>
            </Button>
          </div>
        </div>
      </FadeIn>

      {/* Alert Section - Items Needing Attention */}
      {(pendingProperties?.length || 0) > 0 ||
        (unverifiedLawyers?.length || 0) > 0 ||
        (contentFlags?.length || 0) > 0 ? (
        <FadeIn delay={0.1}>
          <Card className="border-orange-500/50 bg-orange-500/5">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-orange-500" />
                <CardTitle>Items Needing Attention</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-3">
                {(pendingProperties?.length || 0) > 0 && (
                  <Link href="/admin/properties?status=pending">
                    <div className="p-4 border-2 rounded-lg hover:border-primary transition-colors cursor-pointer">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          Pending Properties
                        </span>
                        <Badge variant="secondary">
                          {pendingProperties?.length}
                        </Badge>
                      </div>
                    </div>
                  </Link>
                )}
                {(unverifiedLawyers?.length || 0) > 0 && (
                  <Link href="/admin/lawyers?verified=false">
                    <div className="p-4 border-2 rounded-lg hover:border-primary transition-colors cursor-pointer">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          Unverified Lawyers
                        </span>
                        <Badge variant="secondary">
                          {unverifiedLawyers?.length}
                        </Badge>
                      </div>
                    </div>
                  </Link>
                )}
                {(contentFlags?.length || 0) > 0 && (
                  <Link href="/admin/flags?status=pending">
                    <div className="p-4 border-2 rounded-lg hover:border-primary transition-colors cursor-pointer">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          Pending Flags
                        </span>
                        <Badge variant="secondary">
                          {contentFlags?.length}
                        </Badge>
                      </div>
                    </div>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        </FadeIn>
      ) : null}

      {/* Financial Overview - Key Business Metrics */}
      <FadeIn delay={0.15}>
        <Card className="border-green-500/30 bg-gradient-to-br from-green-500/5 to-emerald-500/5">
          <CardHeader>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-green-600" />
              <CardTitle>Financial Overview</CardTitle>
            </div>
            <CardDescription>Key business metrics and transaction values</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
              {/* Total Active Listings */}
              <div className="p-4 rounded-lg bg-background border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Active Listings</span>
                  <Building className="h-4 w-4 text-blue-500" />
                </div>
                <div className="text-2xl font-bold">{totalListingsCount}</div>
                <div className="text-xs text-muted-foreground mt-1">properties on market</div>
              </div>

              {/* Total Listing Value */}
              <div className="p-4 rounded-lg bg-background border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Total Listing Value</span>
                  <DollarSign className="h-4 w-4 text-green-500" />
                </div>
                <div className="text-2xl font-bold">
                  R {new Intl.NumberFormat('en-ZA', { notation: 'compact', maximumFractionDigits: 1 }).format(totalListingValue)}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  combined property value
                </div>
              </div>

              {/* Completed Deals */}
              <div className="p-4 rounded-lg bg-background border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Completed Deals</span>
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                </div>
                <div className="text-2xl font-bold">{completedDealsCount}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {inProgressDeals} in progress
                </div>
              </div>

              {/* Total Transaction Value */}
              <div className="p-4 rounded-lg bg-background border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Transaction Value</span>
                  <Banknote className="h-4 w-4 text-green-600" />
                </div>
                <div className="text-2xl font-bold text-green-600">
                  R {new Intl.NumberFormat('en-ZA', { notation: 'compact', maximumFractionDigits: 1 }).format(totalDealsValue)}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  from completed sales
                </div>
              </div>

              {/* Platform Fees Earned */}
              <div className="p-4 rounded-lg bg-background border border-primary/30 bg-primary/5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Fees Earned</span>
                  <TrendingUp className="h-4 w-4 text-primary" />
                </div>
                <div className="text-2xl font-bold text-primary">
                  R {new Intl.NumberFormat('en-ZA', { notation: 'compact', maximumFractionDigits: 1 }).format(totalPlatformFees)}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  from {completedDealsCount} sales
                </div>
              </div>

              {/* Estimated Platform Fees (Potential) */}
              <div className="p-4 rounded-lg bg-background border border-amber-500/30 bg-amber-500/5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Est. Potential Fees</span>
                  <BarChart3 className="h-4 w-4 text-amber-600" />
                </div>
                <div className="text-2xl font-bold text-amber-600">
                  R {new Intl.NumberFormat('en-ZA', { notation: 'compact', maximumFractionDigits: 1 }).format(estimatedPlatformFees)}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  if all {totalListingsCount} listings sell
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </FadeIn>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <FadeIn delay={0.2}>
          <Card className="hover:shadow-lg transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                <AnimatedCounter value={stats?.total_users || 0} />
              </div>
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp className="h-3 w-3 text-green-500" />
                <span className="text-xs text-green-500 font-medium">
                  +{stats?.new_users_week || 0} this week
                </span>
              </div>
            </CardContent>
          </Card>
        </FadeIn>

        <FadeIn delay={0.3}>
          <Card className="hover:shadow-lg transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Properties
              </CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                <AnimatedCounter value={stats?.total_properties || 0} />
              </div>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-xs text-muted-foreground">
                  {stats?.active_properties || 0} active
                </span>
              </div>
            </CardContent>
          </Card>
        </FadeIn>

        <FadeIn delay={0.4}>
          <Card className="hover:shadow-lg transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Transactions
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                <AnimatedCounter value={stats?.total_transactions || 0} />
              </div>
              <div className="flex items-center gap-1 mt-1">
                <Activity className="h-3 w-3 text-blue-500" />
                <span className="text-xs text-blue-500 font-medium">
                  {stats?.active_transactions || 0} active
                </span>
              </div>
            </CardContent>
          </Card>
        </FadeIn>

        <FadeIn delay={0.5}>
          <Card className="hover:shadow-lg transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Conversion Rate
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {stats?.conversion_rate || 0}%
              </div>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-xs text-muted-foreground">
                  Inquiry to transaction
                </span>
              </div>
            </CardContent>
          </Card>
        </FadeIn>
      </div>

      {/* Secondary Metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        <FadeIn delay={0.6}>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Lawyers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total</span>
                  <span className="font-bold">{stats?.total_lawyers || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Verified
                  </span>
                  <span className="font-bold text-green-500">
                    {stats?.verified_lawyers || 0}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </FadeIn>

        <FadeIn delay={0.7}>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Inquiries</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total</span>
                  <span className="font-bold">
                    {stats?.total_inquiries || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    This week
                  </span>
                  <span className="font-bold text-blue-500">
                    {stats?.inquiries_week || 0}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </FadeIn>

        <FadeIn delay={0.8}>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Avg. Property Price</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                R{' '}
                {new Intl.NumberFormat('en-ZA').format(
                  stats?.avg_property_price || 0
                )}
              </div>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-xs text-muted-foreground">
                  Avg. days to close: {stats?.avg_days_to_close || 0}
                </span>
              </div>
            </CardContent>
          </Card>
        </FadeIn>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2">
        <FadeIn delay={0.9}>
          <Card>
            <CardHeader>
              <CardTitle>Recent Users</CardTitle>
              <CardDescription>Newest platform registrations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentUsers?.map((user: any) => (
                  <Link
                    key={user.id}
                    href={`/admin/users/${user.id}`}
                    className="flex items-center justify-between p-3 border rounded-lg hover:border-primary transition-colors"
                  >
                    <div>
                      <p className="font-medium">
                        {user.full_name || 'No name'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                    <Badge variant="outline">
                      {new Date(user.created_at).toLocaleDateString()}
                    </Badge>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </FadeIn>

        <FadeIn delay={1.0}>
          <Card>
            <CardHeader>
              <CardTitle>Recent Properties</CardTitle>
              <CardDescription>Latest property listings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentProperties?.map((property: any) => (
                  <Link
                    key={property.id}
                    href={`/admin/properties/${property.id}`}
                    className="flex items-center justify-between p-3 border rounded-lg hover:border-primary transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{property.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(property.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge
                      variant={
                        property.status === 'active'
                          ? 'default'
                          : property.status === 'pending'
                            ? 'secondary'
                            : 'outline'
                      }
                    >
                      {property.status}
                    </Badge>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </FadeIn>
      </div>

      {/* Quick Actions */}
      <FadeIn delay={1.1}>
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common administrative tasks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-4">
              <Button variant="outline" className="h-auto py-4" asChild>
                <Link href="/admin/users">
                  <div className="flex flex-col items-center gap-2">
                    <Users className="h-6 w-6" />
                    <span>Manage Users</span>
                  </div>
                </Link>
              </Button>
              <Button variant="outline" className="h-auto py-4" asChild>
                <Link href="/admin/properties">
                  <div className="flex flex-col items-center gap-2">
                    <Building className="h-6 w-6" />
                    <span>Review Properties</span>
                  </div>
                </Link>
              </Button>
              <Button variant="outline" className="h-auto py-4" asChild>
                <Link href="/admin/lawyers">
                  <div className="flex flex-col items-center gap-2">
                    <Scale className="h-6 w-6" />
                    <span>Verify Lawyers</span>
                  </div>
                </Link>
              </Button>
              <Button variant="outline" className="h-auto py-4" asChild>
                <Link href="/admin/settings">
                  <div className="flex flex-col items-center gap-2">
                    <Activity className="h-6 w-6" />
                    <span>Platform Settings</span>
                  </div>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </FadeIn>
    </div>
  )
}
