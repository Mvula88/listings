import { createClient, createServiceClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FadeIn } from '@/components/ui/fade-in'
import {
  Building,
  MapPin,
  Calendar,
  User,
  DollarSign,
  Eye,
  Heart,
  ArrowLeft,
  ExternalLink,
  Bed,
  Bath,
  Square,
  AlertCircle,
  History,
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { PropertyModerationActions } from '@/components/admin/property-moderation-actions'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function AdminPropertyDetailPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  // Get property details
  const { data: property, error } = await (supabase as any)
    .from('properties')
    .select(`
      *,
      seller:profiles!properties_seller_id_fkey (
        id,
        full_name,
        email,
        phone
      ),
      country:countries (name)
    `)
    .eq('id', id)
    .single()

  if (error || !property) {
    notFound()
  }

  // Get property images
  const { data: images } = await (supabase as any)
    .from('property_images')
    .select('*')
    .eq('property_id', id)
    .order('position')

  // Get inquiries count
  const { count: inquiriesCount } = await (supabase as any)
    .from('inquiries')
    .select('*', { count: 'exact', head: true })
    .eq('property_id', id)

  // Get transactions
  const { data: transactions } = await (supabase as any)
    .from('transactions')
    .select('id, status, created_at')
    .eq('property_id', id)
    .order('created_at', { ascending: false })

  // Get review history using service client to bypass RLS
  const serviceClient = createServiceClient()
  const { data: reviews } = await (serviceClient as any)
    .from('property_reviews')
    .select(`
      *,
      reviewer:profiles!reviewer_id (
        full_name
      )
    `)
    .eq('property_id', id)
    .order('created_at', { ascending: false })

  const statusColors: Record<string, string> = {
    active: 'bg-green-100 text-green-700',
    pending: 'bg-yellow-100 text-yellow-700',
    sold: 'bg-blue-100 text-blue-700',
    inactive: 'bg-gray-100 text-gray-700',
    rejected: 'bg-red-100 text-red-700',
  }

  const moderationColors: Record<string, string> = {
    approved: 'bg-green-100 text-green-700',
    pending: 'bg-yellow-100 text-yellow-700',
    rejected: 'bg-red-100 text-red-700',
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <FadeIn>
        <div className="flex items-center gap-4">
          <Link href="/admin/properties">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">{property.title}</h1>
            <p className="text-muted-foreground flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {[property.address_line1, property.city, property.country?.name].filter(Boolean).join(', ')}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href={`/properties/${property.id}`} target="_blank">
                <ExternalLink className="h-4 w-4 mr-2" />
                View Public
              </Link>
            </Button>
            <PropertyModerationActions
              propertyId={id}
              currentStatus={property.moderation_status}
            />
          </div>
        </div>
      </FadeIn>

      {/* Status Badges */}
      <FadeIn delay={0.1}>
        <div className="flex gap-2">
          <Badge className={statusColors[property.status] || 'bg-gray-100'}>
            Status: {property.status}
          </Badge>
          <Badge className={moderationColors[property.moderation_status] || 'bg-gray-100'}>
            Moderation: {property.moderation_status || 'pending'}
          </Badge>
          {property.is_featured && (
            <Badge variant="default">Featured</Badge>
          )}
        </div>
      </FadeIn>

      {/* Rejection Notice */}
      {property.moderation_status === 'rejected' && property.moderation_notes && (
        <FadeIn delay={0.15}>
          <Card className="border-red-200 bg-red-50">
            <CardContent className="flex items-start gap-3 pt-6">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <p className="font-medium text-red-800">Rejection Reason</p>
                <p className="text-red-700">{property.moderation_notes}</p>
              </div>
            </CardContent>
          </Card>
        </FadeIn>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Images */}
          {images && images.length > 0 && (
            <FadeIn delay={0.2}>
              <Card>
                <CardHeader>
                  <CardTitle>Images ({images.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-2">
                    {images.slice(0, 6).map((image: any, index: number) => (
                      <div key={image.id} className="aspect-video relative rounded overflow-hidden">
                        <Image
                          src={image.url}
                          alt={`Property image ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </FadeIn>
          )}

          {/* Description */}
          <FadeIn delay={0.3}>
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{property.description || 'No description provided.'}</p>
              </CardContent>
            </Card>
          </FadeIn>

          {/* Property Details */}
          <FadeIn delay={0.4}>
            <Card>
              <CardHeader>
                <CardTitle>Property Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center gap-2">
                    <Building className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Type</p>
                      <p className="font-medium capitalize">{property.property_type || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Bed className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Bedrooms</p>
                      <p className="font-medium">{property.bedrooms || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Bath className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Bathrooms</p>
                      <p className="font-medium">{property.bathrooms || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Square className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Size</p>
                      <p className="font-medium">{property.size_sqm ? `${property.size_sqm} m²` : 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </FadeIn>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Price */}
          <FadeIn delay={0.2}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Pricing
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-primary">
                  R {property.price?.toLocaleString() || 'N/A'}
                </p>
                {property.price_negotiable && (
                  <p className="text-sm text-muted-foreground mt-1">Price negotiable</p>
                )}
              </CardContent>
            </Card>
          </FadeIn>

          {/* Seller Info */}
          <FadeIn delay={0.3}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Seller
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link
                  href={`/admin/users/${property.seller?.id}`}
                  className="font-medium hover:underline"
                >
                  {property.seller?.full_name || 'Unknown Seller'}
                </Link>
                <p className="text-sm text-muted-foreground">{property.seller?.email}</p>
                {property.seller?.phone && (
                  <p className="text-sm text-muted-foreground">{property.seller.phone}</p>
                )}
              </CardContent>
            </Card>
          </FadeIn>

          {/* Stats */}
          <FadeIn delay={0.4}>
            <Card>
              <CardHeader>
                <CardTitle>Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Eye className="h-4 w-4" /> Views
                  </span>
                  <span className="font-medium">{property.views_count || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Heart className="h-4 w-4" /> Favorites
                  </span>
                  <span className="font-medium">{property.favorites_count || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Inquiries</span>
                  <span className="font-medium">{inquiriesCount || 0}</span>
                </div>
              </CardContent>
            </Card>
          </FadeIn>

          {/* Transactions */}
          {transactions && transactions.length > 0 && (
            <FadeIn delay={0.5}>
              <Card>
                <CardHeader>
                  <CardTitle>Transactions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {transactions.map((tx: any) => (
                      <div
                        key={tx.id}
                        className="flex items-center justify-between p-2 border rounded"
                      >
                        <span className="text-sm">
                          {new Date(tx.created_at).toLocaleDateString()}
                        </span>
                        <Badge variant="outline">{tx.status}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </FadeIn>
          )}

          {/* Review History */}
          <FadeIn delay={0.6}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Review History
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!reviews || reviews.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No review history
                  </p>
                ) : (
                  <div className="space-y-3">
                    {reviews.map((review: any) => (
                      <div
                        key={review.id}
                        className="p-3 rounded-lg border bg-muted/50 space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <Badge
                            className={
                              review.action === 'approved'
                                ? 'bg-green-100 text-green-700'
                                : review.action === 'rejected'
                                  ? 'bg-red-100 text-red-700'
                                  : 'bg-yellow-100 text-yellow-700'
                            }
                          >
                            {review.action}
                          </Badge>
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
          </FadeIn>

          {/* Dates */}
          <FadeIn delay={0.7}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Dates
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Created</span>
                  <span>{new Date(property.created_at).toLocaleDateString()}</span>
                </div>
                {property.updated_at && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Updated</span>
                    <span>{new Date(property.updated_at).toLocaleDateString()}</span>
                  </div>
                )}
                {property.published_at && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Published</span>
                    <span>{new Date(property.published_at).toLocaleDateString()}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </FadeIn>
        </div>
      </div>
    </div>
  )
}
