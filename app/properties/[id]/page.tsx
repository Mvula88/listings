import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PropertyGallery } from '@/components/properties/property-gallery'
import { PropertyDetails } from '@/components/properties/property-details'
import { PropertyInquiry } from '@/components/properties/property-inquiry'
import { SellerInfo } from '@/components/properties/seller-info'
import { PropertyMap } from '@/components/properties/property-map'
import { SimilarProperties } from '@/components/properties/similar-properties'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Share2, Heart } from 'lucide-react'
import Link from 'next/link'

export default async function PropertyDetailPage({
  params
}: {
  params: { id: string }
}) {
  const supabase: any = await createClient()
  
  // Get property details
  const { data: property } = await supabase
    .from('properties')
    .select(`
      *,
      property_images (
        id,
        url,
        alt_text,
        order_index
      ),
      seller:profiles!seller_id (
        id,
        full_name,
        avatar_url,
        phone,
        created_at
      ),
      country:countries (
        id,
        name,
        currency,
        currency_symbol
      )
    `)
    .eq('id', params.id)
    .single()

  if (!property) {
    notFound()
  }

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  
  // Check if user has already inquired
  let existingInquiry = null
  if (user) {
    const { data } = await supabase
      .from('inquiries')
      .select('*')
      .eq('property_id', property.id)
      .eq('buyer_id', user.id)
      .single()
    
    existingInquiry = data
  }

  // Get similar properties
  const { data: similarProperties } = await supabase
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
    .eq('city', property.city)
    .neq('id', property.id)
    .eq('status', 'active')
    .limit(3)

  // Increment view count
  await supabase
    .from('properties')
    .update({ views: (property.views || 0) + 1 })
    .eq('id', property.id)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b sticky top-0 bg-background z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/browse">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/" className="text-xl font-bold text-primary">
                DealDirect
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon">
                <Share2 className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <Heart className="h-4 w-4" />
              </Button>
              {!user && (
                <Link href="/login">
                  <Button>Sign In</Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Property Gallery */}
      <PropertyGallery images={property.property_images} title={property.title} />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Property Info */}
          <div className="lg:col-span-2 space-y-8">
            <PropertyDetails property={property} />
            
            {/* Map Section */}
            <PropertyMap 
              latitude={property.latitude} 
              longitude={property.longitude}
              address={`${property.address_line1}, ${property.city}`}
            />
          </div>

          {/* Right Column - Contact & Seller Info */}
          <div className="space-y-6">
            {/* Inquiry Card */}
            <PropertyInquiry 
              property={property}
              user={user}
              existingInquiry={existingInquiry}
            />
            
            {/* Seller Information */}
            <SellerInfo seller={property.seller} />
            
            {/* Commission Savings */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-800 mb-2">
                Your Savings with DealDirect
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Traditional agent fees (6%):</span>
                  <span className="line-through text-gray-500">
                    {property.country?.currency_symbol}{(property.price * 0.06).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between font-semibold text-green-700">
                  <span>DealDirect fee:</span>
                  <span>{property.country?.currency_symbol}2,000</span>
                </div>
                <div className="pt-2 border-t border-green-200">
                  <div className="flex justify-between font-bold text-green-800">
                    <span>You save:</span>
                    <span className="text-lg">
                      {property.country?.currency_symbol}{((property.price * 0.06) - 2000).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Similar Properties */}
        {similarProperties && similarProperties.length > 0 && (
          <div className="mt-12">
            <SimilarProperties properties={similarProperties} />
          </div>
        )}
      </div>
    </div>
  )
}