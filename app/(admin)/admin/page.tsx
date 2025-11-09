import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Users,
  Building,
  Scale,
  FileText,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Activity,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react'
import { AnimatedCounter } from '@/components/ui/animated-counter'
import { FadeIn } from '@/components/ui/fade-in'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { getPlatformStats } from '@/lib/admin/actions'

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

  const { data: contentFlags } = await supabase
    .from('content_flags')
    .select('id')
    .eq('status', 'pending')

  const { data: suspendedUsers } = await supabase
    .from('profiles')
    .select('id')
    .eq('is_suspended', true)

  // Get recent activity
  const { data: recentUsers } = await supabase
    .from('profiles')
    .select('id, full_name, email, created_at')
    .order('created_at', { ascending: false })
    .limit(5)

  const { data: recentProperties } = await supabase
    .from('properties')
    .select('id, title, created_at, status')
    .order('created_at', { ascending: false })
    .limit(5)

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
                {recentUsers?.map((user) => (
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
                {recentProperties?.map((property) => (
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
