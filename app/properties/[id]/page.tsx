import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PropertyGallery } from '@/components/properties/property-gallery'
import { PropertyDetails } from '@/components/properties/property-details'
import { PropertyInquiry } from '@/components/properties/property-inquiry'
import { SellerInfo } from '@/components/properties/seller-info'
import { PropertyMap } from '@/components/properties/property-map'
import { SimilarProperties } from '@/components/properties/similar-properties'
import { PropertyViewTracker } from '@/components/properties/property-view-tracker'
import { ScrollToTop } from '@/components/ui/scroll-to-top'
import { FavoriteButton } from '@/components/properties/favorite-button'
import { ReviewForm } from '@/components/reviews/review-form'
import { ReviewList } from '@/components/reviews/review-list'
import { RatingSummary } from '@/components/reviews/rating-summary'
import { Button } from '@/components/ui/button'
import { BackButton } from '@/components/ui/back-button'
import { Share2 } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { calculateSavings, formatSavingsDisplay } from '@/lib/utils/savings-calculator'
import { checkIfFavorited } from '@/lib/actions/favorites'
import { getPropertyReviews, checkUserReview } from '@/lib/actions/reviews'
import type { Metadata } from 'next'

// Generate metadata for SEO
export async function generateMetadata({
  params
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const supabase = await createClient()
  const { id } = await params

  const { data: property } = await supabase
    .from('properties')
    .select('*, property_images(url), country:countries(name, currency)')
    .eq('id', id)
    .single<{
      title: string
      description?: string | null
      property_type: string
      city: string
      province: string
      property_images?: Array<{ url: string }>
      country?: { name: string; currency: string }
      [key: string]: any
    }>()

  if (!property) {
    return {
      title: 'Property Not Found',
    }
  }

  const mainImage = property.property_images?.[0]?.url

  return {
    title: `${property.title} | PropLinka`,
    description: property.description?.slice(0, 160) || `${property.property_type} for sale in ${property.city}`,
    keywords: `${property.property_type}, ${property.city}, ${property.province}, ${property.country?.name}, property for sale, real estate`,
    openGraph: {
      title: property.title,
      description: property.description?.slice(0, 160),
      images: mainImage ? [mainImage] : [],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: property.title,
      description: property.description?.slice(0, 160),
      images: mainImage ? [mainImage] : [],
    },
  }
}

export default async function PropertyDetailPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const supabase = await createClient()
  const { id } = await params

  // Get property details - only show active properties
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
    .eq('id', id)
    .eq('status', 'active')
    .single<{ id: string; seller_id: string; [key: string]: any }>()

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

  // Check if property is favorited
  const { favorited } = user ? await checkIfFavorited(property.id) : { favorited: false }

  // Get reviews
  const { reviews } = await getPropertyReviews(property.id)

  // Check if user has already reviewed
  const { hasReviewed, review: userReview } = user ? await checkUserReview(property.id) as { hasReviewed: boolean; review: { status: string; title: string; [key: string]: any } | null } : { hasReviewed: false, review: null }

  // Calculate rating distribution
  const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  reviews.forEach((review: any) => {
    ratingDistribution[review.rating as keyof typeof ratingDistribution]++
  })

  // Get similar properties - only show active AND approved
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
    .eq('moderation_status', 'approved')
    .limit(3)

  // Increment view count
  await (supabase
    .from('properties') as any)
    .update({ views: (property.views || 0) + 1 })
    .eq('id', property.id)

  // Calculate savings
  const countryCode = property.country?.id || 'ZA'
  const currency = property.country?.currency || 'ZAR'
  const savings = calculateSavings(property.price, countryCode, currency)
  const formatted = formatSavingsDisplay(savings)

  // JSON-LD structured data for SEO
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: property.title,
    description: property.description,
    url: `${baseUrl}/properties/${property.id}`,
    image: property.property_images?.map((img: any) => img.url) || [],
    price: property.price,
    priceCurrency: currency,
    address: {
      '@type': 'PostalAddress',
      streetAddress: property.address_line1,
      addressLocality: property.city,
      addressRegion: property.province,
      postalCode: property.postal_code,
      addressCountry: property.country?.code || 'ZA',
    },
    numberOfRooms: property.bedrooms,
    numberOfBathroomsTotal: property.bathrooms,
    floorSize: {
      '@type': 'QuantitativeValue',
      value: property.square_meters,
      unitCode: 'MTK',
    },
    // Add aggregate rating if reviews exist
    ...(property.review_count > 0 && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: property.average_rating,
        reviewCount: property.review_count,
        bestRating: 5,
        worstRating: 1,
      },
    }),
    // Add individual reviews
    ...(reviews.length > 0 && {
      review: reviews.map((review: any) => ({
        '@type': 'Review',
        author: {
          '@type': 'Person',
          name: review.user.full_name,
        },
        datePublished: review.created_at,
        reviewBody: review.review,
        name: review.title,
        reviewRating: {
          '@type': 'Rating',
          ratingValue: review.rating,
          bestRating: 5,
          worstRating: 1,
        },
      })),
    }),
  }

  return (
    <div className="min-h-screen bg-background">
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Property View Tracker - Invisible analytics component */}
      <PropertyViewTracker propertyId={property.id} />

      {/* Header */}
      <header className="border-b sticky top-0 bg-background z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <BackButton fallbackUrl="/browse" />
              <Link href="/" className="transition-transform hover:scale-105">
                <Image
                  src="/logo.png"
                  alt="PropLinka"
                  width={180}
                  height={50}
                  className="h-8 w-auto"
                  priority
                />
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon">
                <Share2 className="h-4 w-4" />
              </Button>
              <FavoriteButton
                propertyId={property.id}
                initialFavorited={favorited}
                variant="icon"
              />
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

            {/* Reviews Section */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Reviews & Ratings</h2>

              {/* Rating Summary */}
              <RatingSummary
                averageRating={property.average_rating || 0}
                reviewCount={property.review_count || 0}
                ratingDistribution={ratingDistribution}
              />

              {/* Review Form - Only show if user is logged in and hasn't reviewed */}
              {user && !hasReviewed && (
                <ReviewForm propertyId={property.id} />
              )}

              {/* User's Review (if they have one) */}
              {hasReviewed && userReview && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm font-medium text-blue-800 mb-2">
                    Your review (status: {userReview.status})
                  </p>
                  <div className="space-y-1">
                    <p className="font-semibold">{userReview.title}</p>
                    <p className="text-sm text-muted-foreground">{userReview.review}</p>
                  </div>
                </div>
              )}

              {/* Reviews List */}
              <div>
                <h3 className="text-lg font-semibold mb-4">
                  Customer Reviews ({reviews.length})
                </h3>
                <ReviewList reviews={reviews} propertyId={property.id} />
              </div>
            </div>
          </div>

          {/* Right Column - Contact & Seller Info */}
          <div className="space-y-6">
            {/* Inquiry Card */}
            <PropertyInquiry
              property={property as any}
              user={user}
              existingInquiry={existingInquiry}
            />
            
            {/* Seller Information */}
            <SellerInfo seller={property.seller} />
            
            {/* Fee Disclosure & Savings */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-800 mb-3">
                Transparent Pricing
              </h3>
              <div className="space-y-3 text-sm">
                {/* Traditional Costs */}
                <div>
                  <div className="flex justify-between text-gray-600 mb-1">
                    <span className="font-medium">Traditional Agent Fees:</span>
                    <span className="line-through">
                      {formatted.traditionalAgentFee}
                    </span>
                  </div>
                </div>

                {/* PropLinka Platform Fee */}
                <div className="bg-white rounded p-3 space-y-2">
                  <div className="font-medium text-green-800 mb-2">PropLinka Platform Fee:</div>
                  <div className="flex justify-between text-gray-700">
                    <span className="text-lg font-semibold text-green-700">Platform fee:</span>
                    <span className="text-lg font-semibold text-green-700">{formatted.platformFee}</span>
                  </div>
                </div>

                {/* Savings */}
                <div className="pt-2 border-t border-green-200">
                  <div className="flex justify-between font-bold text-green-800">
                    <span>You save:</span>
                    <span className="text-lg">
                      {formatted.totalSavings}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mt-2">
                    * Platform fee collected by lawyer at closing, replaces agent commission. Lawyer fees (~R15K-R40K) are the same in both traditional and PropLinka models.
                  </p>
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

      {/* Scroll to Top Button */}
      <ScrollToTop />
    </div>
  )
}