import { getModerationStats, getMyReviews } from '@/lib/actions/moderation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import {
  Building,
  Clock,
  CheckCircle,
  XCircle,
  Flag,
  ArrowRight,
  TrendingUp,
} from 'lucide-react'

export default async function ModeratorDashboardPage() {
  const [statsResult, reviewsResult] = await Promise.all([
    getModerationStats(),
    getMyReviews(10)
  ])

  const stats = statsResult.stats
  const recentReviews = reviewsResult.reviews

  const statCards = [
    {
      title: 'Pending Review',
      value: stats?.pending || 0,
      icon: Clock,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
      href: '/moderator/listings?filter=pending'
    },
    {
      title: 'Approved',
      value: stats?.approved || 0,
      icon: CheckCircle,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      href: '/moderator/listings?filter=approved'
    },
    {
      title: 'Rejected',
      value: stats?.rejected || 0,
      icon: XCircle,
      color: 'text-red-500',
      bgColor: 'bg-red-500/10',
      href: '/moderator/listings?filter=rejected'
    },
    {
      title: 'Flagged',
      value: stats?.flagged || 0,
      icon: Flag,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
      href: '/moderator/listings?filter=flagged'
    },
  ]

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'approved':
        return <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20">Approved</Badge>
      case 'rejected':
        return <Badge className="bg-red-500/10 text-red-600 hover:bg-red-500/20">Rejected</Badge>
      case 'flagged':
        return <Badge className="bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20">Flagged</Badge>
      case 'unflagged':
        return <Badge className="bg-blue-500/10 text-blue-600 hover:bg-blue-500/20">Unflagged</Badge>
      default:
        return <Badge variant="outline">{action}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Welcome Back</h1>
          <p className="text-muted-foreground mt-1">
            Here&apos;s an overview of your moderation activity
          </p>
        </div>
        <Button asChild>
          <Link href="/moderator/listings">
            <Building className="h-4 w-4 mr-2" />
            Review Listings
          </Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <Link key={stat.title} href={stat.href}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <div className={`h-8 w-8 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                    <Icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>

      {/* Today's Activity & Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Today's Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              Today&apos;s Activity
            </CardTitle>
            <CardDescription>
              Your moderation activity for today
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-32">
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600">
                  {stats?.myReviewsToday || 0}
                </div>
                <p className="text-muted-foreground mt-1">Reviews Today</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Jump to common moderation tasks
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-between" asChild>
              <Link href="/moderator/listings?filter=pending">
                Review Pending Listings
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-between" asChild>
              <Link href="/moderator/listings?filter=flagged">
                Check Flagged Listings
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-between" asChild>
              <Link href="/moderator/history">
                View My Review History
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Reviews */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Reviews</CardTitle>
          <CardDescription>
            Your latest moderation actions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentReviews.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Building className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No reviews yet. Start reviewing listings!</p>
              <Button className="mt-4" asChild>
                <Link href="/moderator/listings">Browse Listings</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {recentReviews.map((review: any) => (
                <div
                  key={review.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/moderator/listings/${review.property_id}`}
                      className="font-medium hover:underline truncate block"
                    >
                      {review.property?.title || 'Unknown Property'}
                    </Link>
                    <p className="text-sm text-muted-foreground">
                      {review.property?.city}, {review.property?.province}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {getActionBadge(review.action)}
                    <span className="text-sm text-muted-foreground">
                      {new Date(review.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
