import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Heart, MapPin, Bed, Bath, Square, Eye, Building } from 'lucide-react'
import Link from 'next/link'
import { FadeIn } from '@/components/ui/fade-in'
import Image from 'next/image'
import { formatPrice } from '@/lib/utils/format'
import { FavoriteButton } from '@/components/properties/favorite-button'

export default async function SavedPropertiesPage() {
  const supabase = await createClient()

  // Check authentication
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get user's saved/favorited properties
  const { data: favorites } = await supabase
    .from('property_favorites')
    .select(`
      id,
      created_at,
      property:properties (
        id,
        title,
        price,
        city,
        province,
        bedrooms,
        bathrooms,
        square_meters,
        property_type,
        status,
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
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  // Filter out any favorites where the property no longer exists or is not active
  const savedProperties = favorites?.filter(
    (fav: any) => fav.property && fav.property.status === 'active'
  ) || []

  return (
    <div className="space-y-6">
      <FadeIn>
        <div>
          <h1 className="text-3xl font-bold mb-2">Saved Properties</h1>
          <p className="text-muted-foreground">
            Properties you&apos;ve saved for later
          </p>
        </div>
      </FadeIn>

      {/* Stats */}
      <FadeIn delay={0.1}>
        <Card className="border-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Saved</CardTitle>
            <Heart className="h-4 w-4 text-red-500 fill-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{savedProperties.length}</div>
            <p className="text-xs text-muted-foreground">
              {savedProperties.length === 1 ? 'property' : 'properties'} saved
            </p>
          </CardContent>
        </Card>
      </FadeIn>

      {/* Saved Properties List */}
      {savedProperties.length > 0 ? (
        <FadeIn delay={0.2}>
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Heart className="h-6 w-6 text-red-500" />
                Your Saved Properties
              </CardTitle>
              <CardDescription>
                Click on a property to view details or remove it from your saved list
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {savedProperties.map((favorite: any, index: number) => {
                  const property = favorite.property
                  return (
                    <FadeIn key={favorite.id} delay={index * 0.05}>
                      <Card className="overflow-hidden hover:shadow-lg transition-all group">
                        {/* Image */}
                        <div className="relative aspect-[4/3] overflow-hidden">
                          {property.property_images?.[0] ? (
                            <Image
                              src={property.property_images[0].url}
                              alt={property.title}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full bg-muted">
                              <Building className="h-12 w-12 text-muted-foreground" />
                            </div>
                          )}
                          <div className="absolute top-2 right-2">
                            <FavoriteButton
                              propertyId={property.id}
                              initialFavorited={true}
                              variant="icon"
                            />
                          </div>
                          <Badge className="absolute top-2 left-2 capitalize">
                            {property.property_type}
                          </Badge>
                        </div>

                        {/* Content */}
                        <CardContent className="p-4">
                          <h3 className="font-semibold text-lg line-clamp-1 mb-2">
                            {property.title}
                          </h3>
                          <div className="flex items-center gap-1 text-muted-foreground text-sm mb-3">
                            <MapPin className="h-3 w-3" />
                            <span className="line-clamp-1">
                              {property.city}, {property.province}
                            </span>
                          </div>

                          <div className="flex items-center gap-3 text-sm text-muted-foreground mb-3">
                            {property.bedrooms && (
                              <div className="flex items-center gap-1">
                                <Bed className="h-4 w-4" />
                                <span>{property.bedrooms}</span>
                              </div>
                            )}
                            {property.bathrooms && (
                              <div className="flex items-center gap-1">
                                <Bath className="h-4 w-4" />
                                <span>{property.bathrooms}</span>
                              </div>
                            )}
                            {property.square_meters && (
                              <div className="flex items-center gap-1">
                                <Square className="h-4 w-4" />
                                <span>{property.square_meters}m²</span>
                              </div>
                            )}
                          </div>

                          <p className="text-xl font-bold text-primary mb-4">
                            {formatPrice(property.price, property.country?.currency || 'ZAR')}
                          </p>

                          <Link href={`/properties/${property.id}`}>
                            <Button className="w-full">
                              <Eye className="h-4 w-4 mr-2" />
                              View Property
                            </Button>
                          </Link>
                        </CardContent>
                      </Card>
                    </FadeIn>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </FadeIn>
      ) : (
        <FadeIn delay={0.2}>
          <Card className="border-2 border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Heart className="h-16 w-16 text-muted-foreground/50 mb-4" />
              <h3 className="text-xl font-semibold mb-2">No saved properties yet</h3>
              <p className="text-muted-foreground text-center mb-6 max-w-sm">
                Browse properties and click the heart icon to save them for later.
              </p>
              <Link href="/browse">
                <Button size="lg">
                  Browse Properties
                </Button>
              </Link>
            </CardContent>
          </Card>
        </FadeIn>
      )}
    </div>
  )
}
