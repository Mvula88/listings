import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Heart,
  MapPin,
  Bed,
  Bath,
  Square,
  Eye,
  Building,
  Search,
  TrendingDown,
  ArrowRight,
  Sparkles
} from 'lucide-react'
import Link from 'next/link'
import { FadeIn } from '@/components/ui/fade-in'
import Image from 'next/image'
import { formatPrice } from '@/lib/utils/format'
import { FavoriteButton } from '@/components/properties/favorite-button'
import { calculateSavings, formatSavingsDisplay } from '@/lib/utils/savings-calculator'

export default async function SavedPropertiesPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

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
        featured,
        views,
        property_images (
          id,
          url,
          alt_text,
          order_index
        ),
        country:countries (
          code,
          currency,
          currency_symbol
        )
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const savedProperties = favorites?.filter(
    (fav: any) => fav.property && fav.property.status === 'active'
  ) || []

  return (
    <div className="space-y-6">
      {/* Header */}
      <FadeIn>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-1 flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                <Heart className="h-5 w-5 text-red-500 fill-red-500" />
              </div>
              Saved Properties
            </h1>
            <p className="text-muted-foreground">
              Properties you've saved for later
            </p>
          </div>
          <Link href="/browse">
            <Button variant="outline" className="gap-2">
              <Search className="h-4 w-4" />
              Browse More
            </Button>
          </Link>
        </div>
      </FadeIn>

      {/* Stats Card */}
      <FadeIn delay={0.1}>
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="border-0 shadow-md">
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                  <Heart className="h-6 w-6 text-red-500 fill-red-500" />
                </div>
                <div>
                  <p className="text-3xl font-bold">{savedProperties.length}</p>
                  <p className="text-sm text-muted-foreground">Saved properties</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-md">
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                  <Sparkles className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-3xl font-bold">
                    {savedProperties.filter((f: any) => f.property?.featured).length}
                  </p>
                  <p className="text-sm text-muted-foreground">Featured properties</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-md bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <TrendingDown className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-green-700">Potential Savings</p>
                  <p className="text-xs text-green-600">vs traditional agents</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </FadeIn>

      {/* Saved Properties Grid */}
      {savedProperties.length > 0 ? (
        <FadeIn delay={0.2}>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {savedProperties.map((favorite: any, index: number) => {
              const property = favorite.property
              const savings = calculateSavings(
                property.price,
                property.country?.code || 'ZA',
                property.country?.currency || 'ZAR'
              )
              const formatted = formatSavingsDisplay(savings)

              return (
                <FadeIn key={favorite.id} delay={index * 0.05}>
                  <Card className="overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 group">
                    {/* Image */}
                    <Link href={`/properties/${property.id}`}>
                      <div className="relative h-48 overflow-hidden bg-muted">
                        {property.property_images?.[0] ? (
                          <Image
                            src={property.property_images[0].url}
                            alt={property.title}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <Building className="h-12 w-12 text-muted-foreground/30" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

                        {/* Badges */}
                        <div className="absolute top-3 left-3 flex gap-2">
                          {property.featured && (
                            <Badge className="bg-amber-500 hover:bg-amber-500 text-white gap-1">
                              <Sparkles className="h-3 w-3" />
                              Featured
                            </Badge>
                          )}
                          <Badge variant="secondary" className="capitalize">
                            {property.property_type}
                          </Badge>
                        </div>

                        {/* Favorite Button */}
                        <div className="absolute top-3 right-3">
                          <FavoriteButton
                            propertyId={property.id}
                            initialFavorited={true}
                            variant="icon"
                          />
                        </div>

                        {/* Price on image */}
                        <div className="absolute bottom-3 left-3">
                          <div className="bg-white/95 backdrop-blur-sm rounded-lg px-3 py-1.5 shadow-lg">
                            <p className="text-lg font-bold text-gray-900">
                              {formatPrice(property.price, property.country?.currency || 'ZAR')}
                            </p>
                          </div>
                        </div>
                      </div>
                    </Link>

                    {/* Content */}
                    <CardContent className="p-4">
                      <Link href={`/properties/${property.id}`}>
                        <h3 className="font-semibold text-lg line-clamp-1 hover:text-primary transition-colors mb-2">
                          {property.title}
                        </h3>
                      </Link>

                      <div className="flex items-center gap-1.5 text-muted-foreground text-sm mb-3">
                        <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
                        <span className="line-clamp-1">
                          {property.city}, {property.province}
                        </span>
                      </div>

                      {/* Features */}
                      <div className="flex items-center gap-1 mb-4">
                        {property.bedrooms && (
                          <div className="flex items-center gap-1 bg-muted rounded-full px-2.5 py-1 text-xs">
                            <Bed className="h-3 w-3 text-muted-foreground" />
                            <span>{property.bedrooms}</span>
                          </div>
                        )}
                        {property.bathrooms && (
                          <div className="flex items-center gap-1 bg-muted rounded-full px-2.5 py-1 text-xs">
                            <Bath className="h-3 w-3 text-muted-foreground" />
                            <span>{property.bathrooms}</span>
                          </div>
                        )}
                        {property.square_meters && (
                          <div className="flex items-center gap-1 bg-muted rounded-full px-2.5 py-1 text-xs">
                            <Square className="h-3 w-3 text-muted-foreground" />
                            <span>{property.square_meters}m²</span>
                          </div>
                        )}
                      </div>

                      {/* Savings */}
                      <div className="bg-green-50 border border-green-100 rounded-lg p-2.5 mb-4">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-green-700 font-medium flex items-center gap-1">
                            <TrendingDown className="h-3 w-3" />
                            Save {formatted.totalSavings}
                          </span>
                          <span className="text-muted-foreground">vs agents</span>
                        </div>
                      </div>

                      {/* Action */}
                      <Link href={`/properties/${property.id}`}>
                        <Button className="w-full group/btn">
                          <Eye className="h-4 w-4 mr-2" />
                          View Property
                          <ArrowRight className="h-4 w-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                </FadeIn>
              )
            })}
          </div>
        </FadeIn>
      ) : (
        <FadeIn delay={0.2}>
          <Card className="border-2 border-dashed shadow-none">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-4">
                <Heart className="h-10 w-10 text-muted-foreground/50" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No saved properties yet</h3>
              <p className="text-muted-foreground text-center mb-6 max-w-sm">
                Browse properties and click the heart icon to save them for later.
              </p>
              <Link href="/browse">
                <Button size="lg" className="gap-2">
                  <Search className="h-5 w-5" />
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
