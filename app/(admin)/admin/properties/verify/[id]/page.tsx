import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { PropertyVerificationForm } from '@/components/admin/property-verification-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Home,
  MapPin,
  DollarSign,
  Calendar,
  User,
  Mail,
  Phone,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react'
import { formatPrice } from '@/lib/utils/format'
import Image from 'next/image'

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function PropertyVerificationPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  // Check if user is admin
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('user_type')
    .eq('id', user.id)
    .single<{ user_type: string }>()

  if (profile?.user_type !== 'admin') {
    redirect('/dashboard')
  }

  // Fetch property with owner details
  const { data: property, error } = await (supabase as any)
    .from('properties')
    .select(`
      *,
      owner:profiles!properties_owner_id_fkey(
        id,
        full_name,
        email,
        phone_number,
        created_at
      ),
      images:property_images(
        id,
        image_url,
        display_order
      )
    `)
    .eq('id', id)
    .single()

  if (error || !property) {
    notFound()
  }

  // Check for duplicate listings (same address)
  const { data: duplicates } = await (supabase as any)
    .from('properties')
    .select('id, title, status, created_at, owner:profiles!properties_owner_id_fkey(full_name)')
    .neq('id', id)
    .or(`address.ilike.%${property.address}%,location.ilike.%${property.location}%`)
    .limit(5)

  // Get property view stats
  const { data: viewStats } = await (supabase as any)
    .from('property_views')
    .select('id')
    .eq('property_id', id)

  const totalViews = viewStats?.length || 0

  return (
    <div className="container max-w-7xl py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Property Verification</h1>
          <p className="text-muted-foreground">
            Review and verify property listing details
          </p>
        </div>
        <Badge
          variant={
            property.status === 'active' ? 'default' :
            property.status === 'pending' ? 'secondary' :
            property.status === 'sold' ? 'outline' :
            'destructive'
          }
          className="text-sm"
        >
          {property.status}
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Property Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Property Images */}
          <Card>
            <CardHeader>
              <CardTitle>Property Images</CardTitle>
              <CardDescription>
                {property.images?.length || 0} image(s) uploaded
              </CardDescription>
            </CardHeader>
            <CardContent>
              {property.images && property.images.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {property.images
                    .sort((a: any, b: any) => a.display_order - b.display_order)
                    .map((img: any) => (
                      <div key={img.id} className="relative aspect-video rounded-lg overflow-hidden bg-muted">
                        <Image
                          src={img.image_url}
                          alt="Property image"
                          fill
                          className="object-cover"
                        />
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-muted rounded-lg">
                  <Home className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">No images uploaded</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Property Information */}
          <Card>
            <CardHeader>
              <CardTitle>Property Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-1">{property.title}</h3>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{property.location}</span>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Property Type</p>
                  <p className="font-medium capitalize">{property.property_type}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Listing Type</p>
                  <p className="font-medium capitalize">{property.listing_type}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Price</p>
                  <p className="font-medium text-lg text-primary">
                    {formatPrice(property.price, property.currency)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Area</p>
                  <p className="font-medium">{property.area?.toLocaleString()} m²</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Bedrooms</p>
                  <p className="font-medium">{property.bedrooms}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Bathrooms</p>
                  <p className="font-medium">{property.bathrooms}</p>
                </div>
              </div>

              <Separator />

              <div>
                <p className="text-sm text-muted-foreground mb-2">Description</p>
                <p className="text-sm whitespace-pre-wrap">{property.description}</p>
              </div>

              {property.features && property.features.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Features</p>
                    <div className="flex flex-wrap gap-2">
                      {property.features.map((feature: string, index: number) => (
                        <Badge key={index} variant="secondary">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Address</p>
                  <p className="font-medium text-sm">{property.address}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">City</p>
                  <p className="font-medium">{property.city}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Province</p>
                  <p className="font-medium">{property.province}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Country</p>
                  <p className="font-medium">{property.country_id === 1 ? 'South Africa' : 'Namibia'}</p>
                </div>
              </div>

              {property.year_built && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground">Year Built</p>
                    <p className="font-medium">{property.year_built}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Duplicate Check */}
          {duplicates && duplicates.length > 0 && (
            <Card className="border-orange-200 bg-orange-50">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-orange-600" />
                  <CardTitle className="text-orange-900">Potential Duplicates Found</CardTitle>
                </div>
                <CardDescription className="text-orange-800">
                  These listings have similar addresses or locations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {duplicates.map((dup: any) => (
                    <div key={dup.id} className="bg-white rounded-lg p-3 border border-orange-200">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium">{dup.title}</p>
                          <p className="text-sm text-muted-foreground">
                            Listed by {dup.owner?.full_name || 'Unknown'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(dup.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant={dup.status === 'active' ? 'default' : 'secondary'}>
                          {dup.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Owner & Actions */}
        <div className="space-y-6">
          {/* Owner Information */}
          <Card>
            <CardHeader>
              <CardTitle>Property Owner</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{property.owner?.full_name || 'Unknown'}</p>
                  <p className="text-sm text-muted-foreground">Property Owner</p>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a href={`mailto:${property.owner?.email}`} className="hover:underline">
                    {property.owner?.email}
                  </a>
                </div>
                {property.owner?.phone_number && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <a href={`tel:${property.owner.phone_number}`} className="hover:underline">
                      {property.owner.phone_number}
                    </a>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    Member since {new Date(property.owner?.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Property Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Property Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Views</span>
                <span className="font-medium">{totalViews}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Listed Date</span>
                <span className="font-medium text-sm">
                  {new Date(property.created_at).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Last Updated</span>
                <span className="font-medium text-sm">
                  {new Date(property.updated_at).toLocaleDateString()}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Verification Form */}
          <PropertyVerificationForm
            propertyId={property.id}
            currentStatus={property.status}
            ownerEmail={property.owner?.email}
            propertyTitle={property.title}
          />
        </div>
      </div>
    </div>
  )
}
