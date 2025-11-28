import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Building, Plus, Eye, Edit, MapPin, Star, Zap, AlertTriangle, XCircle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import Link from 'next/link'
import { FadeIn } from '@/components/ui/fade-in'
import Image from 'next/image'
import { formatPrice } from '@/lib/utils/format'
import { FeaturePropertyButton } from '@/components/properties/feature-property-button'
import { DeletePropertyButton } from '@/components/properties/delete-property-button'

export default async function ManagePropertiesPage() {
  const supabase = await createClient()

  // Check authentication
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get user's properties
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
    .order('created_at', { ascending: false })

  const activeProperties = properties?.filter((p: any) => p.status === 'active' && p.moderation_status !== 'rejected') || []
  const draftProperties = properties?.filter((p: any) => p.status === 'draft') || []
  const soldProperties = properties?.filter((p: any) => p.status === 'sold') || []
  const rejectedProperties = properties?.filter((p: any) => p.moderation_status === 'rejected') || []
  const featuredProperties = activeProperties.filter((p: any) => p.featured && new Date(p.featured_until) > new Date())

  return (
    <div className="space-y-6">
      <FadeIn>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Properties</h1>
            <p className="text-muted-foreground">
              Manage your property listings
            </p>
          </div>
          <Link href="/properties/new">
            <Button size="lg" className="group transition-all hover:shadow-lg hover:scale-105">
              <Plus className="h-5 w-5 mr-2 group-hover:rotate-90 transition-transform" />
              List New Property
            </Button>
          </Link>
        </div>
      </FadeIn>

      {/* Stats */}
      <FadeIn delay={0.1}>
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="border-2 hover:shadow-lg transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Listings</CardTitle>
              <Building className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{activeProperties.length}</div>
              <p className="text-xs text-muted-foreground">Currently published</p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:shadow-lg transition-all border-yellow-200 bg-yellow-50/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Featured Listings</CardTitle>
              <Star className="h-4 w-4 text-yellow-600 fill-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-700">{featuredProperties.length}</div>
              <p className="text-xs text-muted-foreground">Getting premium visibility</p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:shadow-lg transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Draft Listings</CardTitle>
              <Edit className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{draftProperties.length}</div>
              <p className="text-xs text-muted-foreground">Not yet published</p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:shadow-lg transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sold Properties</CardTitle>
              <Building className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{soldProperties.length}</div>
              <p className="text-xs text-muted-foreground">Successfully sold</p>
            </CardContent>
          </Card>

          {rejectedProperties.length > 0 && (
            <Card className="border-2 hover:shadow-lg transition-all border-red-200 bg-red-50/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Requires Attention</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-700">{rejectedProperties.length}</div>
                <p className="text-xs text-muted-foreground">Rejected by moderation</p>
              </CardContent>
            </Card>
          )}
        </div>
      </FadeIn>

      {/* Rejected Properties - Show first as they need attention */}
      {rejectedProperties.length > 0 && (
        <FadeIn delay={0.15}>
          <Card className="border-2 border-red-300 bg-red-50/30">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2 text-red-700">
                <XCircle className="h-6 w-6" />
                Rejected Listings
              </CardTitle>
              <CardDescription>These listings were rejected by our moderation team. Please review the reason and make necessary changes.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {rejectedProperties.map((property: any) => (
                  <div
                    key={property.id}
                    className="flex flex-col md:flex-row gap-4 p-4 border-2 border-red-200 rounded-lg bg-white"
                  >
                    {/* Image */}
                    <div className="relative w-full md:w-48 h-48 rounded-lg overflow-hidden bg-muted shrink-0">
                      {property.property_images?.[0] ? (
                        <Image
                          src={property.property_images[0].url}
                          alt={property.title}
                          fill
                          className="object-cover opacity-75"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <Building className="h-12 w-12 text-muted-foreground" />
                        </div>
                      )}
                      <Badge className="absolute top-2 right-2 bg-red-600">
                        Rejected
                      </Badge>
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0 space-y-3">
                      <h3 className="text-xl font-semibold line-clamp-1">{property.title}</h3>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span className="text-sm">{property.city}, {property.province}</span>
                      </div>
                      <p className="text-2xl font-bold text-primary">
                        {formatPrice(property.price, property.country?.currency || 'ZAR')}
                      </p>

                      {/* Rejection Reason */}
                      {property.moderation_notes && (
                        <Alert variant="destructive" className="mt-2">
                          <AlertTriangle className="h-4 w-4" />
                          <AlertTitle>Rejection Reason</AlertTitle>
                          <AlertDescription className="mt-1">
                            {property.moderation_notes}
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex md:flex-col gap-2 shrink-0">
                      <Link href={`/properties/${property.id}/edit`} className="flex-1 md:flex-initial">
                        <Button className="w-full bg-red-600 hover:bg-red-700">
                          <Edit className="h-4 w-4 mr-2" />
                          Fix & Resubmit
                        </Button>
                      </Link>
                      <Link href={`/properties/${property.id}`} className="flex-1 md:flex-initial">
                        <Button variant="outline" className="w-full">
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      </Link>
                      <DeletePropertyButton
                        propertyId={property.id}
                        propertyTitle={property.title}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </FadeIn>
      )}

      {/* Active Properties */}
      {activeProperties.length > 0 && (
        <FadeIn delay={0.2}>
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="text-2xl">Active Listings</CardTitle>
              <CardDescription>Your properties currently available for sale</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activeProperties.map((property: any) => (
                  <div
                    key={property.id}
                    className="flex flex-col md:flex-row gap-4 p-4 border-2 rounded-lg hover:shadow-lg transition-all hover:border-primary/50 group"
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
                      <Badge className="absolute top-2 right-2 bg-green-600">
                        Active
                      </Badge>
                      {property.featured && property.featured_until && new Date(property.featured_until) > new Date() && (
                        <Badge className="absolute top-2 left-2 bg-yellow-500 text-yellow-950">
                          <Star className="h-3 w-3 mr-1 fill-current" />
                          {property.premium ? 'Premium' : 'Featured'}
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
                        {property.featured && property.featured_until && new Date(property.featured_until) > new Date() && (
                          <Badge variant="outline" className="text-yellow-600 border-yellow-300 bg-yellow-50">
                            <Star className="h-3 w-3 mr-1 fill-yellow-500" />
                            Until {new Date(property.featured_until).toLocaleDateString()}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex md:flex-col gap-2 shrink-0">
                      <FeaturePropertyButton
                        propertyId={property.id}
                        currentlyFeatured={property.featured && property.featured_until && new Date(property.featured_until) > new Date()}
                        featuredUntil={property.featured_until}
                      />
                      <Link href={`/properties/${property.id}`} className="flex-1 md:flex-initial">
                        <Button variant="outline" className="w-full">
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      </Link>
                      <Link href={`/properties/${property.id}/edit`} className="flex-1 md:flex-initial">
                        <Button variant="outline" className="w-full">
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                      </Link>
                      <DeletePropertyButton
                        propertyId={property.id}
                        propertyTitle={property.title}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </FadeIn>
      )}

      {/* Draft Properties */}
      {draftProperties.length > 0 && (
        <FadeIn delay={0.3}>
          <Card className="border-2 border-orange-200">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Edit className="h-6 w-6 text-orange-600" />
                Draft Listings
              </CardTitle>
              <CardDescription>Properties you haven&apos;t published yet</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {draftProperties.map((property: any) => (
                  <div
                    key={property.id}
                    className="flex flex-col md:flex-row gap-4 p-4 border-2 border-dashed border-orange-200 rounded-lg hover:shadow-lg transition-all group"
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
                      <Badge className="absolute top-2 right-2 bg-orange-500">
                        Draft
                      </Badge>
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
                        <Badge variant="outline" className="capitalize">
                          {property.property_type}
                        </Badge>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex md:flex-col gap-2 shrink-0">
                      <Link href={`/properties/${property.id}/edit`} className="flex-1 md:flex-initial">
                        <Button className="w-full">
                          <Edit className="h-4 w-4 mr-2" />
                          Continue Editing
                        </Button>
                      </Link>
                      <DeletePropertyButton
                        propertyId={property.id}
                        propertyTitle={property.title}
                      />
                    </div>
                  </div>
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
              <Building className="h-16 w-16 text-muted-foreground/50 mb-4" />
              <h3 className="text-xl font-semibold mb-2">No properties yet</h3>
              <p className="text-muted-foreground text-center mb-6 max-w-sm">
                Start by creating your first property listing. It's free and takes just a few minutes!
              </p>
              <Link href="/properties/new">
                <Button size="lg">
                  <Plus className="h-5 w-5 mr-2" />
                  Create Your First Listing
                </Button>
              </Link>
            </CardContent>
          </Card>
        </FadeIn>
      )}
    </div>
  )
}
