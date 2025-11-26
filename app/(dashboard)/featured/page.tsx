import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Building, Star, Eye, MapPin, Clock, TrendingUp, Zap } from 'lucide-react'
import Link from 'next/link'
import { FadeIn } from '@/components/ui/fade-in'
import Image from 'next/image'
import { formatPrice } from '@/lib/utils/format'
import { FeaturePropertyButton } from '@/components/properties/feature-property-button'

export default async function FeaturedListingsPage() {
  const supabase = await createClient()

  // Check authentication
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get user's properties with featured status
  const { data: properties } = await supabase
    .from('properties')
    .select(`
      *,
      property_images (
        id,
        url,
        alt_text,
        order_index
      ),
      country:countries (
        currency,
        currency_symbol
      )
    `)
    .eq('seller_id', user.id)
    .eq('status', 'active')
    .order('featured', { ascending: false })
    .order('created_at', { ascending: false })

  const now = new Date()
  const featuredProperties = properties?.filter((p: any) =>
    p.featured && p.featured_until && new Date(p.featured_until) > now
  ) || []
  const premiumProperties = featuredProperties.filter((p: any) => p.premium)
  const regularFeaturedProperties = featuredProperties.filter((p: any) => !p.premium)
  const nonFeaturedProperties = properties?.filter((p: any) =>
    !p.featured || !p.featured_until || new Date(p.featured_until) <= now
  ) || []

  // Calculate days remaining helper
  const getDaysRemaining = (featuredUntil: string) => {
    const end = new Date(featuredUntil)
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return diff
  }

  return (
    <div className="space-y-6">
      <FadeIn>
        <div>
          <h1 className="text-3xl font-bold mb-2">Featured Listings</h1>
          <p className="text-muted-foreground">
            Manage your featured and premium property listings
          </p>
        </div>
      </FadeIn>

      {/* Stats */}
      <FadeIn delay={0.1}>
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-yellow-100/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Premium Listings</CardTitle>
              <Zap className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-700">{premiumProperties.length}</div>
              <p className="text-xs text-yellow-600">Top placement & homepage featured</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Featured Listings</CardTitle>
              <Star className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-700">{regularFeaturedProperties.length}</div>
              <p className="text-xs text-blue-600">Priority in search results</p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:shadow-lg transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Not Featured</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{nonFeaturedProperties.length}</div>
              <p className="text-xs text-muted-foreground">Standard listing visibility</p>
            </CardContent>
          </Card>
        </div>
      </FadeIn>

      {/* Featured Benefits Banner */}
      <FadeIn delay={0.15}>
        <Card className="border-2 bg-gradient-to-r from-primary/5 to-primary/10">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Boost Your Property Visibility
                </h3>
                <p className="text-muted-foreground text-sm mt-1">
                  Featured properties get 3-10x more views and sell 50% faster on average.
                </p>
              </div>
              <Link href="/properties">
                <Button>
                  <Star className="h-4 w-4 mr-2" />
                  Feature a Property
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </FadeIn>

      {/* Premium Properties */}
      {premiumProperties.length > 0 && (
        <FadeIn delay={0.2}>
          <Card className="border-2 border-yellow-200">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Zap className="h-6 w-6 text-yellow-600" />
                Premium Listings
              </CardTitle>
              <CardDescription>Your properties with top placement and homepage visibility</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {premiumProperties.map((property: any) => (
                  <PropertyListItem
                    key={property.id}
                    property={property}
                    isPremium={true}
                    daysRemaining={getDaysRemaining(property.featured_until)}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </FadeIn>
      )}

      {/* Featured Properties */}
      {regularFeaturedProperties.length > 0 && (
        <FadeIn delay={0.25}>
          <Card className="border-2 border-blue-200">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Star className="h-6 w-6 text-blue-600" />
                Featured Listings
              </CardTitle>
              <CardDescription>Your properties with priority search placement</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {regularFeaturedProperties.map((property: any) => (
                  <PropertyListItem
                    key={property.id}
                    property={property}
                    isPremium={false}
                    daysRemaining={getDaysRemaining(property.featured_until)}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </FadeIn>
      )}

      {/* Non-Featured Properties */}
      {nonFeaturedProperties.length > 0 && (
        <FadeIn delay={0.3}>
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="text-2xl">Ready to Feature</CardTitle>
              <CardDescription>These properties can be featured to increase visibility</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {nonFeaturedProperties.map((property: any) => (
                  <PropertyListItem
                    key={property.id}
                    property={property}
                    isPremium={false}
                    daysRemaining={0}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </FadeIn>
      )}

      {/* Empty State */}
      {properties?.length === 0 && (
        <FadeIn delay={0.2}>
          <Card className="border-2 border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Star className="h-16 w-16 text-muted-foreground/50 mb-4" />
              <h3 className="text-xl font-semibold mb-2">No active properties yet</h3>
              <p className="text-muted-foreground text-center mb-6 max-w-sm">
                List your first property to start featuring it and get more visibility.
              </p>
              <Link href="/properties/new">
                <Button size="lg">
                  List Your First Property
                </Button>
              </Link>
            </CardContent>
          </Card>
        </FadeIn>
      )}
    </div>
  )
}

function PropertyListItem({
  property,
  isPremium,
  daysRemaining
}: {
  property: any
  isPremium: boolean
  daysRemaining: number
}) {
  const isFeatured = daysRemaining > 0

  return (
    <div
      className={`flex flex-col md:flex-row gap-4 p-4 border-2 rounded-lg hover:shadow-lg transition-all group ${
        isPremium
          ? 'border-yellow-200 bg-yellow-50/30'
          : isFeatured
            ? 'border-blue-200 bg-blue-50/30'
            : 'hover:border-primary/50'
      }`}
    >
      {/* Image */}
      <div className="relative w-full md:w-48 h-48 rounded-lg overflow-hidden bg-muted shrink-0">
        {property.property_images?.[0] ? (
          <Image
            src={property.property_images[0].url}
            alt={property.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <Building className="h-12 w-12 text-muted-foreground" />
          </div>
        )}
        {isFeatured && (
          <Badge className={`absolute top-2 left-2 ${isPremium ? 'bg-yellow-500 text-yellow-950' : 'bg-blue-500'}`}>
            {isPremium ? (
              <>
                <Zap className="h-3 w-3 mr-1 fill-current" />
                Premium
              </>
            ) : (
              <>
                <Star className="h-3 w-3 mr-1 fill-current" />
                Featured
              </>
            )}
          </Badge>
        )}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <h3 className="text-xl font-semibold mb-2 line-clamp-1">{property.title}</h3>
        <div className="flex items-center gap-2 text-muted-foreground mb-3">
          <MapPin className="h-4 w-4" />
          <span className="text-sm">{property.city}, {property.province}</span>
        </div>
        <p className="text-2xl font-bold text-primary mb-3">
          {formatPrice(property.price, property.country?.currency || 'ZAR')}
        </p>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">
            <Eye className="h-3 w-3 mr-1" />
            {property.views || 0} views
          </Badge>
          <Badge variant="outline" className="capitalize">
            {property.property_type}
          </Badge>
          {isFeatured && (
            <Badge
              variant="outline"
              className={`${
                daysRemaining <= 3
                  ? 'text-red-600 border-red-300 bg-red-50'
                  : daysRemaining <= 7
                    ? 'text-orange-600 border-orange-300 bg-orange-50'
                    : isPremium
                      ? 'text-yellow-600 border-yellow-300 bg-yellow-50'
                      : 'text-blue-600 border-blue-300 bg-blue-50'
              }`}
            >
              <Clock className="h-3 w-3 mr-1" />
              {daysRemaining} day{daysRemaining !== 1 ? 's' : ''} left
            </Badge>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex md:flex-col gap-2 shrink-0">
        <FeaturePropertyButton
          propertyId={property.id}
          currentlyFeatured={isFeatured}
          featuredUntil={property.featured_until}
        />
        <Link href={`/properties/${property.id}`} className="flex-1 md:flex-initial">
          <Button variant="outline" className="w-full">
            <Eye className="h-4 w-4 mr-2" />
            View
          </Button>
        </Link>
      </div>
    </div>
  )
}
