'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { X, Home, MapPin, Bed, Bath, Square, DollarSign, Calendar, TrendingUp } from 'lucide-react'
import { formatPrice } from '@/lib/utils/format'
import Image from 'next/image'

interface Property {
  id: string
  title: string
  price: number
  currency: 'ZAR' | 'NAD'
  location: string
  city: string
  bedrooms: number
  bathrooms: number
  area: number
  property_type: string
  listing_type: 'sale' | 'rent'
  year_built?: number
  image_url?: string
  features?: string[]
}

interface PropertyComparisonProps {
  properties: Property[]
  onRemoveProperty?: (propertyId: string) => void
}

export function PropertyComparison({ properties, onRemoveProperty }: PropertyComparisonProps) {
  if (properties.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Property Comparison</CardTitle>
          <CardDescription>
            Select properties to compare side-by-side
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-12">
          <Home className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
          <p className="text-muted-foreground">
            No properties selected for comparison
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Add up to 4 properties to compare their features
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="w-full space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Compare Properties ({properties.length})</CardTitle>
          <CardDescription>
            Side-by-side comparison of selected properties
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Desktop View - Side by Side */}
          <div className="hidden lg:block overflow-x-auto">
            <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${properties.length}, minmax(280px, 1fr))` }}>
              {properties.map((property) => (
                <div key={property.id} className="space-y-4">
                  {/* Property Image & Header */}
                  <div className="relative">
                    <div className="relative h-48 rounded-lg overflow-hidden bg-muted">
                      {property.image_url ? (
                        <Image
                          src={property.image_url}
                          alt={property.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <Home className="h-12 w-12 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    {onRemoveProperty && (
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={() => onRemoveProperty(property.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                    <Badge className="absolute bottom-2 left-2">
                      {property.listing_type === 'sale' ? 'For Sale' : 'For Rent'}
                    </Badge>
                  </div>

                  {/* Property Title */}
                  <div>
                    <h3 className="font-semibold text-lg line-clamp-2">{property.title}</h3>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                      <MapPin className="h-3 w-3" />
                      <span className="line-clamp-1">{property.location}</span>
                    </div>
                  </div>

                  <Separator />

                  {/* Key Specs */}
                  <div className="space-y-3">
                    {/* Price */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Price
                      </span>
                      <span className="font-bold text-lg text-primary">
                        {formatPrice(property.price, property.currency)}
                      </span>
                    </div>

                    {/* Bedrooms */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground flex items-center gap-2">
                        <Bed className="h-4 w-4" />
                        Bedrooms
                      </span>
                      <span className="font-medium">{property.bedrooms}</span>
                    </div>

                    {/* Bathrooms */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground flex items-center gap-2">
                        <Bath className="h-4 w-4" />
                        Bathrooms
                      </span>
                      <span className="font-medium">{property.bathrooms}</span>
                    </div>

                    {/* Area */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground flex items-center gap-2">
                        <Square className="h-4 w-4" />
                        Area
                      </span>
                      <span className="font-medium">{property.area.toLocaleString()} m²</span>
                    </div>

                    {/* Property Type */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground flex items-center gap-2">
                        <Home className="h-4 w-4" />
                        Type
                      </span>
                      <span className="font-medium capitalize">{property.property_type}</span>
                    </div>

                    {/* Year Built */}
                    {property.year_built && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Built
                        </span>
                        <span className="font-medium">{property.year_built}</span>
                      </div>
                    )}

                    {/* Price per m² */}
                    <div className="flex items-center justify-between pt-2 border-t">
                      <span className="text-sm text-muted-foreground flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Price/m²
                      </span>
                      <span className="font-medium">
                        {formatPrice(Math.round(property.price / property.area), property.currency)}
                      </span>
                    </div>
                  </div>

                  {/* Features */}
                  {property.features && property.features.length > 0 && (
                    <>
                      <Separator />
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold">Features</h4>
                        <div className="flex flex-wrap gap-1">
                          {property.features.slice(0, 5).map((feature, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                          {property.features.length > 5 && (
                            <Badge variant="outline" className="text-xs">
                              +{property.features.length - 5} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Mobile View - Stacked */}
          <div className="lg:hidden space-y-6">
            {properties.map((property) => (
              <Card key={property.id}>
                <CardContent className="p-4 space-y-4">
                  {/* Property Image & Header */}
                  <div className="relative">
                    <div className="relative h-48 rounded-lg overflow-hidden bg-muted">
                      {property.image_url ? (
                        <Image
                          src={property.image_url}
                          alt={property.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <Home className="h-12 w-12 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    {onRemoveProperty && (
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={() => onRemoveProperty(property.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                    <Badge className="absolute bottom-2 left-2">
                      {property.listing_type === 'sale' ? 'For Sale' : 'For Rent'}
                    </Badge>
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg">{property.title}</h3>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                      <MapPin className="h-3 w-3" />
                      <span>{property.location}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center justify-between col-span-2 bg-primary/5 p-3 rounded-lg">
                      <span className="text-sm text-muted-foreground">Price</span>
                      <span className="font-bold text-lg text-primary">
                        {formatPrice(property.price, property.currency)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <Bed className="h-3 w-3" />
                        Beds
                      </span>
                      <span className="font-medium">{property.bedrooms}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <Bath className="h-3 w-3" />
                        Baths
                      </span>
                      <span className="font-medium">{property.bathrooms}</span>
                    </div>

                    <div className="flex items-center justify-between col-span-2">
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <Square className="h-3 w-3" />
                        Area
                      </span>
                      <span className="font-medium">{property.area.toLocaleString()} m²</span>
                    </div>

                    <div className="flex items-center justify-between col-span-2">
                      <span className="text-sm text-muted-foreground">Price/m²</span>
                      <span className="font-medium">
                        {formatPrice(Math.round(property.price / property.area), property.currency)}
                      </span>
                    </div>
                  </div>

                  {property.features && property.features.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold">Features</h4>
                      <div className="flex flex-wrap gap-1">
                        {property.features.slice(0, 5).map((feature, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                        {property.features.length > 5 && (
                          <Badge variant="outline" className="text-xs">
                            +{property.features.length - 5} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Summary Statistics */}
      {properties.length >= 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Comparison Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-1">Price Range</p>
                <p className="font-bold">
                  {formatPrice(Math.min(...properties.map(p => p.price)), properties[0].currency)}
                  {' - '}
                  {formatPrice(Math.max(...properties.map(p => p.price)), properties[0].currency)}
                </p>
              </div>

              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-1">Avg. Bedrooms</p>
                <p className="font-bold">
                  {(properties.reduce((sum, p) => sum + p.bedrooms, 0) / properties.length).toFixed(1)}
                </p>
              </div>

              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-1">Avg. Area</p>
                <p className="font-bold">
                  {Math.round(properties.reduce((sum, p) => sum + p.area, 0) / properties.length).toLocaleString()} m²
                </p>
              </div>

              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-1">Avg. Price/m²</p>
                <p className="font-bold">
                  {formatPrice(
                    Math.round(properties.reduce((sum, p) => sum + (p.price / p.area), 0) / properties.length),
                    properties[0].currency
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
