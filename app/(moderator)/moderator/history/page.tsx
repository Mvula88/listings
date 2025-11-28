import { getMyReviews } from '@/lib/actions/moderation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import {
  History,
  Building,
  Eye,
  MapPin,
} from 'lucide-react'

export default async function ModeratorHistoryPage() {
  const { reviews, error } = await getMyReviews(100)

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'approved':
        return <Badge className="bg-green-500/10 text-green-600">Approved</Badge>
      case 'rejected':
        return <Badge className="bg-red-500/10 text-red-600">Rejected</Badge>
      case 'flagged':
        return <Badge className="bg-yellow-500/10 text-yellow-600">Flagged</Badge>
      case 'unflagged':
        return <Badge className="bg-blue-500/10 text-blue-600">Unflagged</Badge>
      default:
        return <Badge variant="outline">{action}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <History className="h-8 w-8" />
          My Review History
        </h1>
        <p className="text-muted-foreground mt-1">
          View all your moderation actions
        </p>
      </div>

      {/* Error State */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No reviews yet</h3>
            <p className="text-muted-foreground mb-4">
              Start reviewing listings to see your history here.
            </p>
            <Button asChild>
              <Link href="/moderator/listings">Browse Listings</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>All Reviews</CardTitle>
            <CardDescription>
              {reviews.length} review{reviews.length !== 1 ? 's' : ''} total
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reviews.map((review: any) => (
                <div
                  key={review.id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/moderator/listings/${review.property_id}`}
                        className="font-medium hover:underline truncate"
                      >
                        {review.property?.title || 'Unknown Property'}
                      </Link>
                      {getActionBadge(review.action)}
                    </div>
                    {review.property && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        {review.property.city}, {review.property.province}
                      </div>
                    )}
                    {review.reason && (
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        Reason: {review.reason}
                      </p>
                    )}
                    {review.notes && (
                      <p className="text-sm text-muted-foreground italic line-clamp-1">
                        Note: {review.notes}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-4 ml-4">
                    <span className="text-sm text-muted-foreground whitespace-nowrap">
                      {new Date(review.created_at).toLocaleDateString()}
                    </span>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/moderator/listings/${review.property_id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
