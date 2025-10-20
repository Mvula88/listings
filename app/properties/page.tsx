import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Building, Plus, Eye, Edit, Trash2, MapPin } from 'lucide-react'
import Link from 'next/link'
import { FadeIn } from '@/components/ui/fade-in'
import Image from 'next/image'
import { formatPrice } from '@/lib/utils/format'

export default async function ManagePropertiesPage() {
  const supabase = await createClient()

  // Check authentication
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get user's properties
  const { data: properties } = await (supabase
    .from('properties') as any)
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

  const activeProperties = properties?.filter((p: any) => p.status === 'active') || []
  const draftProperties = properties?.filter((p: any) => p.status === 'draft') || []
  const soldProperties = properties?.filter((p: any) => p.status === 'sold') || []

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-primary transition-transform hover:scale-105">
              DealDirect
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="outline" className="transition-transform hover:scale-105">
                  Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <FadeIn>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">My Properties</h1>
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
          <div className="grid gap-4 md:grid-cols-3 mb-8">
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
          </div>
        </FadeIn>

        {/* Active Properties */}
        {activeProperties.length > 0 && (
          <FadeIn delay={0.2}>
            <Card className="mb-8 border-2">
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
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex md:flex-col gap-2 shrink-0">
                        <Link href={`/properties/${property.id}`} className="flex-1 md:flex-initial">
                          <Button variant="outline" className="w-full">
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                        </Link>
                        <Button variant="outline" className="flex-1 md:flex-initial">
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        <Button variant="outline" className="flex-1 md:flex-initial text-red-600 hover:text-red-700">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
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
    </div>
  )
}
