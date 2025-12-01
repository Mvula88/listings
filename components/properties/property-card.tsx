'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Bed,
  Bath,
  Square,
  MapPin,
  TrendingDown,
  Home,
  Sparkles,
  Eye,
  Camera,
  Star
} from 'lucide-react'
import { formatPrice } from '@/lib/utils/format'
import { calculateSavings, formatSavingsDisplay } from '@/lib/utils/savings-calculator'
import { FavoriteButton } from '@/components/properties/favorite-button'
import { cn } from '@/lib/utils/cn'
import type { Property } from '@/lib/types'

interface PropertyCardProps {
  property: Property
  initialFavorited?: boolean
  variant?: 'default' | 'compact' | 'horizontal'
  showSavings?: boolean
}

export function PropertyCard({
  property,
  initialFavorited = false,
  variant = 'default',
  showSavings = true
}: PropertyCardProps) {
  const [imageError, setImageError] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const mainImage = property.property_images?.[0]?.url
  const imageCount = property.property_images?.length || 0
  const currency = property.country?.currency || 'ZAR'
  const countryCode = property.country?.code || 'ZA'

  // Calculate savings
  const savings = calculateSavings(property.price, countryCode, currency)
  const formatted = formatSavingsDisplay(savings)

  if (variant === 'horizontal') {
    return (
      <Card
        className="overflow-hidden hover:shadow-lg transition-all duration-300 group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex flex-col sm:flex-row">
          {/* Image Section */}
          <Link href={`/properties/${property.id}`} className="relative w-full sm:w-72 h-48 sm:h-auto flex-shrink-0">
            <div className="relative h-full min-h-[200px]">
              {mainImage && !imageError ? (
                <Image
                  src={mainImage}
                  alt={property.title}
                  fill
                  className={cn(
                    "object-cover transition-transform duration-500",
                    isHovered && "scale-105"
                  )}
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="flex items-center justify-center h-full bg-gradient-to-br from-muted to-muted/50">
                  <Home className="h-16 w-16 text-muted-foreground/30" />
                </div>
              )}
              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            </div>
          </Link>

          {/* Content Section */}
          <div className="flex-1 p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                {/* Badges */}
                <div className="flex flex-wrap gap-2 mb-2">
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

                <Link href={`/properties/${property.id}`}>
                  <h3 className="font-semibold text-lg mb-1 line-clamp-1 hover:text-primary transition-colors">
                    {property.title}
                  </h3>
                </Link>

                <div className="flex items-center gap-1.5 text-muted-foreground mb-3">
                  <MapPin className="h-4 w-4 flex-shrink-0" />
                  <span className="text-sm truncate">
                    {property.city}, {property.province}
                  </span>
                </div>

                {/* Features */}
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  {property.bedrooms && (
                    <div className="flex items-center gap-1">
                      <Bed className="h-4 w-4" />
                      <span>{property.bedrooms} beds</span>
                    </div>
                  )}
                  {property.bathrooms && (
                    <div className="flex items-center gap-1">
                      <Bath className="h-4 w-4" />
                      <span>{property.bathrooms} baths</span>
                    </div>
                  )}
                  {property.square_meters && (
                    <div className="flex items-center gap-1">
                      <Square className="h-4 w-4" />
                      <span>{property.square_meters}m²</span>
                    </div>
                  )}
                </div>
              </div>

              <FavoriteButton
                propertyId={property.id}
                initialFavorited={initialFavorited}
                variant="icon"
              />
            </div>

            <div className="flex items-end justify-between mt-4 pt-4 border-t">
              <div>
                <p className="text-2xl font-bold text-primary">
                  {formatPrice(property.price, currency)}
                </p>
                <p className="text-xs text-green-600 font-medium flex items-center gap-1">
                  <TrendingDown className="h-3 w-3" />
                  Save {formatted.totalSavings}
                </p>
              </div>
              <Link href={`/properties/${property.id}`}>
                <Button>View Property</Button>
              </Link>
            </div>
          </div>
        </div>
      </Card>
    )
  }

  // Default card variant
  return (
    <Card
      className="overflow-hidden hover:shadow-xl transition-all duration-300 group border-0 shadow-md"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Section */}
      <Link href={`/properties/${property.id}`} className="block relative">
        <div className="relative h-56 bg-muted overflow-hidden">
          {mainImage && !imageError ? (
            <Image
              src={mainImage}
              alt={property.title}
              fill
              className={cn(
                "object-cover transition-transform duration-500",
                isHovered && "scale-110"
              )}
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-gradient-to-br from-muted to-muted/50">
              <Home className="h-16 w-16 text-muted-foreground/30" />
            </div>
          )}

          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0" />

          {/* Top badges */}
          <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
            <div className="flex flex-wrap gap-2">
              {property.featured && (
                <Badge className="bg-amber-500 hover:bg-amber-500 text-white gap-1 shadow-lg">
                  <Sparkles className="h-3 w-3" />
                  Featured
                </Badge>
              )}
              {property.premium && (
                <Badge className="bg-purple-600 hover:bg-purple-600 text-white shadow-lg">
                  Premium
                </Badge>
              )}
            </div>
            <FavoriteButton
              propertyId={property.id}
              initialFavorited={initialFavorited}
              variant="icon"
            />
          </div>

          {/* Bottom info on image */}
          <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
            {/* Price */}
            <div className="bg-white/95 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg">
              <p className="text-xl font-bold text-gray-900">
                {formatPrice(property.price, currency)}
              </p>
            </div>

            {/* Image count */}
            {imageCount > 1 && (
              <div className="bg-black/60 backdrop-blur-sm rounded-lg px-2 py-1 flex items-center gap-1 text-white text-sm">
                <Camera className="h-3.5 w-3.5" />
                {imageCount}
              </div>
            )}
          </div>
        </div>
      </Link>

      {/* Content Section */}
      <div className="p-4">
        <Link href={`/properties/${property.id}`}>
          <h3 className="font-semibold text-lg mb-1.5 line-clamp-1 hover:text-primary transition-colors">
            {property.title}
          </h3>
        </Link>

        <div className="flex items-center gap-1.5 text-muted-foreground mb-3">
          <MapPin className="h-4 w-4 flex-shrink-0 text-primary" />
          <span className="text-sm truncate">
            {property.city}, {property.province}
          </span>
        </div>

        {/* Features row */}
        <div className="flex items-center gap-1 mb-4">
          {property.bedrooms && (
            <div className="flex items-center gap-1 bg-muted rounded-full px-3 py-1 text-sm">
              <Bed className="h-3.5 w-3.5 text-muted-foreground" />
              <span>{property.bedrooms}</span>
            </div>
          )}
          {property.bathrooms && (
            <div className="flex items-center gap-1 bg-muted rounded-full px-3 py-1 text-sm">
              <Bath className="h-3.5 w-3.5 text-muted-foreground" />
              <span>{property.bathrooms}</span>
            </div>
          )}
          {property.square_meters && (
            <div className="flex items-center gap-1 bg-muted rounded-full px-3 py-1 text-sm">
              <Square className="h-3.5 w-3.5 text-muted-foreground" />
              <span>{property.square_meters}m²</span>
            </div>
          )}
        </div>

        {/* Savings highlight */}
        {showSavings && (
          <div className="bg-green-50 border border-green-100 rounded-lg p-3 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <TrendingDown className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-green-700">Save with PropLinka</p>
                  <p className="text-sm font-bold text-green-700">{formatted.totalSavings}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground line-through">{formatted.traditionalAgentFee}</p>
                <p className="text-xs text-green-600">Platform: {formatted.platformFee}</p>
              </div>
            </div>
          </div>
        )}

        {/* Stats row */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t">
          <div className="flex items-center gap-3">
            {property.views > 0 && (
              <div className="flex items-center gap-1">
                <Eye className="h-3.5 w-3.5" />
                <span>{property.views} views</span>
              </div>
            )}
            {(property as any).average_rating > 0 && (
              <div className="flex items-center gap-1">
                <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                <span>{(property as any).average_rating.toFixed(1)}</span>
              </div>
            )}
          </div>
          <Badge variant="outline" className="text-xs capitalize">
            {property.property_type}
          </Badge>
        </div>
      </div>
    </Card>
  )
}
