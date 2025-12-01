import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  Bed,
  Bath,
  Square,
  MapPin,
  Calendar,
  Eye,
  Home,
  CheckCircle,
  Sparkles,
  Car,
  Trees,
  Shield,
  Award
} from 'lucide-react'
import { formatPrice, formatDate } from '@/lib/utils/format'

interface PropertyDetailsProps {
  property: any
}

export function PropertyDetails({ property }: PropertyDetailsProps) {
  const currency = property.country?.currency || 'ZAR'
  const currencySymbol = property.country?.currency_symbol || 'R'

  // Calculate price per square meter
  const pricePerSqm = property.square_meters
    ? Math.round(property.price / property.square_meters)
    : null

  return (
    <div className="space-y-8">
      {/* Hero Section - Title, Price, Location */}
      <div className="space-y-4">
        {/* Badges */}
        <div className="flex flex-wrap items-center gap-2">
          {property.is_featured && (
            <Badge className="bg-amber-500 hover:bg-amber-600 text-white gap-1">
              <Sparkles className="h-3 w-3" />
              Featured
            </Badge>
          )}
          {property.listing_type === 'premium' && (
            <Badge className="bg-purple-600 hover:bg-purple-700 text-white gap-1">
              <Award className="h-3 w-3" />
              Premium
            </Badge>
          )}
          <Badge variant="secondary" className="capitalize">
            {property.property_type}
          </Badge>
          {property.status === 'active' && (
            <Badge variant="outline" className="text-green-600 border-green-300 bg-green-50">
              Active Listing
            </Badge>
          )}
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
          {property.title}
        </h1>

        {/* Location */}
        <div className="flex items-center gap-2 text-muted-foreground">
          <MapPin className="h-5 w-5 text-primary flex-shrink-0" />
          <span className="text-base sm:text-lg">
            {property.address_line1}, {property.city}, {property.province}
          </span>
        </div>

        {/* Price Section */}
        <div className="flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-8 pt-2">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Asking Price</p>
            <p className="text-3xl sm:text-4xl font-bold text-primary">
              {formatPrice(property.price, currency)}
            </p>
          </div>
          {pricePerSqm && (
            <div className="sm:pb-1">
              <p className="text-sm text-muted-foreground">
                {currencySymbol} {pricePerSqm.toLocaleString()} per m²
              </p>
            </div>
          )}
        </div>

        {/* Stats Row */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground pt-2">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4" />
            <span>Listed {formatDate(property.created_at)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Eye className="h-4 w-4" />
            <span>{property.views?.toLocaleString() || 0} views</span>
          </div>
          {property.average_rating > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="text-amber-500">★</span>
              <span>{property.average_rating.toFixed(1)} ({property.review_count} reviews)</span>
            </div>
          )}
        </div>
      </div>

      <Separator />

      {/* Key Features - Modern Grid */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Property Overview</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <FeatureCard
            icon={Home}
            label="Property Type"
            value={property.property_type}
            capitalize
          />
          {property.bedrooms && (
            <FeatureCard
              icon={Bed}
              label="Bedrooms"
              value={property.bedrooms}
            />
          )}
          {property.bathrooms && (
            <FeatureCard
              icon={Bath}
              label="Bathrooms"
              value={property.bathrooms}
            />
          )}
          {property.square_meters && (
            <FeatureCard
              icon={Square}
              label="Living Area"
              value={`${property.square_meters} m²`}
            />
          )}
          {property.parking_spots && (
            <FeatureCard
              icon={Car}
              label="Parking"
              value={`${property.parking_spots} spots`}
            />
          )}
          {property.garden && (
            <FeatureCard
              icon={Trees}
              label="Garden"
              value="Yes"
            />
          )}
        </div>
      </div>

      {/* Description */}
      <div>
        <h2 className="text-xl font-semibold mb-4">About This Property</h2>
        <div className="prose prose-gray max-w-none">
          <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
            {property.description || 'No description provided for this property.'}
          </p>
        </div>
      </div>

      {/* Amenities/Features List if available */}
      {property.amenities && property.amenities.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Features & Amenities</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {property.amenities.map((amenity: string, index: number) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                <span>{amenity}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Why PropLinka - Redesigned */}
      <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 overflow-hidden">
        <CardContent className="p-6 relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold text-lg">Why buy through PropLinka?</h3>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <BenefitItem
                icon={CheckCircle}
                title="Direct Communication"
                description="Connect directly with sellers - no middleman delays"
              />
              <BenefitItem
                icon={CheckCircle}
                title="Save on Fees"
                description={`Save ${formatPrice(Math.round(property.price * 0.06 - 2000), currency)} vs traditional agents`}
              />
              <BenefitItem
                icon={CheckCircle}
                title="Verified Lawyers"
                description="Professional legal support at transparent rates"
              />
              <BenefitItem
                icon={CheckCircle}
                title="Secure Process"
                description="Pay platform fee only when transaction completes"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Feature Card Component
function FeatureCard({
  icon: Icon,
  label,
  value,
  capitalize = false
}: {
  icon: any
  label: string
  value: string | number
  capitalize?: boolean
}) {
  return (
    <div className="bg-muted/50 rounded-xl p-4 hover:bg-muted transition-colors">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className={`font-semibold truncate ${capitalize ? 'capitalize' : ''}`}>
            {value}
          </p>
        </div>
      </div>
    </div>
  )
}

// Benefit Item Component
function BenefitItem({
  icon: Icon,
  title,
  description
}: {
  icon: any
  title: string
  description: string
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
      <div>
        <p className="font-medium text-sm">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}
