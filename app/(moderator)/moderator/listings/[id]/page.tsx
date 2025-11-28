import { getPropertyForReview, getPropertyReviewHistory } from '@/lib/actions/moderation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ReviewActions } from '@/components/moderator/review-actions'
import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowLeft,
  Building,
  MapPin,
  User,
  Mail,
  Phone,
  Calendar,
  Bed,
  Bath,
  Square,
  History,
  AlertCircle,
} from 'lucide-react'
import { notFound } from 'next/navigation'

interface Props {
  params: Promise<{ id: string }>
}

export default async function ModeratorListingDetailPage({ params }: Props) {
  const { id } = await params
  const [propertyResult, historyResult] = await Promise.all([
    getPropertyForReview(id),
    getPropertyReviewHistory(id)
  ])

  if (propertyResult.error || !propertyResult.property) {
    notFound()
  }

  const property = propertyResult.property as any
  const reviews = (historyResult.reviews || []) as any[]

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500/10 text-green-600 text-sm">Approved</Badge>
      case 'rejected':
        return <Badge className="bg-red-500/10 text-red-600 text-sm">Rejected</Badge>
      case 'flagged':
        return <Badge className="bg-yellow-500/10 text-yellow-600 text-sm">Flagged</Badge>
      case 'pending':
      default:
        return <Badge className="bg-orange-500/10 text-orange-600 text-sm">Pending Review</Badge>
    }
  }

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
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/moderator/listings">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{property.title}</h1>
            {getStatusBadge(property.moderation_status)}
          </div>
          <p className="text-muted-foreground">Review this listing</p>
        </div>
      </div>

      {/* Rejection Notice */}
      {property.moderation_status === 'rejected' && property.moderation_notes && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="flex items-start gap-3 pt-6">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
            <div>
              <p className="font-medium text-red-800">Rejection Reason</p>
              <p className="text-red-700">{property.moderation_notes}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Flag Notice */}
      {property.moderation_status === 'flagged' && property.moderation_notes && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="flex items-start gap-3 pt-6">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div>
              <p className="font-medium text-yellow-800">Flag Reason</p>
              <p className="text-yellow-700">{property.moderation_notes}</p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Images */}
          <Card>
            <CardHeader>
              <CardTitle>Property Images</CardTitle>
              <CardDescription>
                Review images for inappropriate content
              </CardDescription>
            </CardHeader>
            <CardContent>
              {property.property_images?.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {property.property_images
                    .sort((a: any, b: any) => a.order_index - b.order_index)
                    .map((image: any, index: number) => (
                      <div
                        key={image.id}
                        className="relative aspect-video rounded-lg overflow-hidden border"
                      >
                        <Image
                          src={image.url}
                          alt={image.alt_text || `Image ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Building className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No images uploaded</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Property Details */}
          <Card>
            <CardHeader>
              <CardTitle>Property Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-lg font-bold text-primary">
                {property.country?.currency_symbol || '$'}
                {property.price?.toLocaleString()}
              </div>

              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                {property.address && <span>{property.address}, </span>}
                {property.city}, {property.province}
                {property.country?.name && `, ${property.country.name}`}
              </div>

              <div className="flex flex-wrap gap-4">
                {property.bedrooms && (
                  <div className="flex items-center gap-2">
                    <Bed className="h-4 w-4 text-muted-foreground" />
                    <span>{property.bedrooms} Bedrooms</span>
                  </div>
                )}
                {property.bathrooms && (
                  <div className="flex items-center gap-2">
                    <Bath className="h-4 w-4 text-muted-foreground" />
                    <span>{property.bathrooms} Bathrooms</span>
                  </div>
                )}
                {property.size_sqm && (
                  <div className="flex items-center gap-2">
                    <Square className="h-4 w-4 text-muted-foreground" />
                    <span>{property.size_sqm} m²</span>
                  </div>
                )}
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-2">Description</h4>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {property.description || 'No description provided'}
                </p>
              </div>

              {property.property_type && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-medium mb-2">Property Type</h4>
                    <Badge variant="outline" className="capitalize">
                      {property.property_type.replace('_', ' ')}
                    </Badge>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Review Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Review Actions</CardTitle>
              <CardDescription>
                Take action on this listing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ReviewActions
                propertyId={property.id}
                currentStatus={property.moderation_status}
              />
            </CardContent>
          </Card>

          {/* Seller Info */}
          <Card>
            <CardHeader>
              <CardTitle>Seller Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  {property.seller?.avatar_url ? (
                    <Image
                      src={property.seller.avatar_url}
                      alt={property.seller.full_name || 'Seller'}
                      width={48}
                      height={48}
                      className="rounded-full"
                    />
                  ) : (
                    <User className="h-6 w-6 text-primary" />
                  )}
                </div>
                <div>
                  <p className="font-medium">{property.seller?.full_name || 'Unknown'}</p>
                  <p className="text-sm text-muted-foreground">Seller</p>
                </div>
              </div>

              {property.seller?.email && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{property.seller.email}</span>
                </div>
              )}

              {property.seller?.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{property.seller.phone}</span>
                </div>
              )}

              {property.seller?.created_at && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Member since {new Date(property.seller.created_at).toLocaleDateString()}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Review History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Review History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {reviews.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No previous reviews
                </p>
              ) : (
                <div className="space-y-3">
                  {reviews.map((review: any) => (
                    <div
                      key={review.id}
                      className="p-3 rounded-lg border bg-muted/50 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        {getActionBadge(review.action)}
                        <span className="text-xs text-muted-foreground">
                          {new Date(review.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm">
                        By {review.reviewer?.full_name || 'Unknown'}
                      </p>
                      {review.reason && (
                        <p className="text-sm text-muted-foreground">
                          {review.reason}
                        </p>
                      )}
                      {review.notes && (
                        <p className="text-sm text-muted-foreground italic">
                          Note: {review.notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Listing Meta */}
          <Card>
            <CardHeader>
              <CardTitle>Listing Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created</span>
                <span>{new Date(property.created_at).toLocaleDateString()}</span>
              </div>
              {property.moderated_at && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last Reviewed</span>
                  <span>{new Date(property.moderated_at).toLocaleDateString()}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Listing ID</span>
                <span className="font-mono text-xs">{property.id.slice(0, 8)}...</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
