import { getListingsForReview, type ModerationFilter } from '@/lib/actions/moderation'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import Image from 'next/image'
import {
  Building,
  Clock,
  CheckCircle,
  XCircle,
  Flag,
  Eye,
  User,
  MapPin,
  Calendar,
} from 'lucide-react'

interface Props {
  searchParams: Promise<{ filter?: string }>
}

export default async function ModeratorListingsPage({ searchParams }: Props) {
  const params = await searchParams
  const filter = (params.filter || 'all') as ModerationFilter
  const { listings, error } = await getListingsForReview(filter)

  const filters: { value: ModerationFilter; label: string; icon: React.ReactNode }[] = [
    { value: 'all', label: 'All', icon: <Building className="h-4 w-4" /> },
    { value: 'pending', label: 'Pending', icon: <Clock className="h-4 w-4" /> },
    { value: 'approved', label: 'Approved', icon: <CheckCircle className="h-4 w-4" /> },
    { value: 'rejected', label: 'Rejected', icon: <XCircle className="h-4 w-4" /> },
    { value: 'flagged', label: 'Flagged', icon: <Flag className="h-4 w-4" /> },
  ]

  const getStatusBadge = (listing: any) => {
    // Check if listing is awaiting first review (pending_review status)
    if (listing.status === 'pending_review') {
      return <Badge className="bg-blue-500/10 text-blue-600">Awaiting Review</Badge>
    }

    switch (listing.moderation_status) {
      case 'approved':
        return <Badge className="bg-green-500/10 text-green-600">Approved</Badge>
      case 'rejected':
        return <Badge className="bg-red-500/10 text-red-600">Rejected</Badge>
      case 'flagged':
        return <Badge className="bg-yellow-500/10 text-yellow-600">Flagged</Badge>
      case 'pending':
      default:
        return <Badge className="bg-orange-500/10 text-orange-600">Pending</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Listings</h1>
        <p className="text-muted-foreground mt-1">
          Review and moderate property listings
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {filters.map((f) => (
          <Button
            key={f.value}
            variant={filter === f.value ? 'default' : 'outline'}
            size="sm"
            asChild
          >
            <Link href={`/moderator/listings?filter=${f.value}`}>
              {f.icon}
              <span className="ml-2">{f.label}</span>
            </Link>
          </Button>
        ))}
      </div>

      {/* Error State */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Listings Grid */}
      {listings.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No listings found</h3>
            <p className="text-muted-foreground">
              {filter === 'pending'
                ? 'No pending listings to review at the moment.'
                : `No ${filter} listings found.`}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing: any) => (
            <Card key={listing.id} className="overflow-hidden hover:shadow-md transition-shadow">
              {/* Image */}
              <div className="relative h-48 bg-muted">
                {listing.property_images?.[0]?.url ? (
                  <Image
                    src={listing.property_images[0].url}
                    alt={listing.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <Building className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  {getStatusBadge(listing)}
                </div>
              </div>

              {/* Content */}
              <CardContent className="p-4 space-y-3">
                <div>
                  <h3 className="font-semibold text-lg line-clamp-1">{listing.title}</h3>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                    <MapPin className="h-3 w-3" />
                    {listing.city}, {listing.province}
                  </div>
                </div>

                {/* Price */}
                <div className="text-lg font-bold text-primary">
                  {listing.country?.currency_symbol || '$'}
                  {listing.price?.toLocaleString()}
                </div>

                {/* Seller Info */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="h-3 w-3" />
                  <span className="truncate">{listing.seller?.full_name || listing.seller?.email}</span>
                </div>

                {/* Date */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>{new Date(listing.created_at).toLocaleDateString()}</span>
                </div>

                {/* Actions */}
                <Button className="w-full mt-2" asChild>
                  <Link href={`/moderator/listings/${listing.id}`}>
                    <Eye className="h-4 w-4 mr-2" />
                    Review Listing
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
