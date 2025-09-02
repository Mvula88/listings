import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Bed, Bath, Square, MapPin, Heart } from 'lucide-react'
import { formatPrice } from '@/lib/utils/format'

interface PropertyCardProps {
  property: any
}

export function PropertyCard({ property }: PropertyCardProps) {
  const mainImage = property.property_images?.[0]?.url || '/placeholder-property.jpg'
  const currency = property.country?.currency || 'ZAR'
  
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <Link href={`/properties/${property.id}`}>
        <div className="relative h-48 bg-muted">
          {mainImage && (
            <Image
              src={mainImage}
              alt={property.title}
              fill
              className="object-cover"
            />
          )}
          <div className="absolute top-2 right-2">
            <Button
              size="icon"
              variant="secondary"
              className="h-8 w-8 rounded-full bg-white/80 hover:bg-white"
              onClick={(e) => {
                e.preventDefault()
                // Handle save property
              }}
            >
              <Heart className="h-4 w-4" />
            </Button>
          </div>
          {property.featured && (
            <Badge className="absolute top-2 left-2" variant="default">
              Featured
            </Badge>
          )}
        </div>
      </Link>
      
      <CardContent className="p-4">
        <Link href={`/properties/${property.id}`}>
          <h3 className="font-semibold text-lg mb-2 line-clamp-1 hover:text-primary">
            {property.title}
          </h3>
        </Link>
        
        <div className="flex items-center gap-1 text-muted-foreground mb-3">
          <MapPin className="h-4 w-4" />
          <span className="text-sm">
            {property.city}, {property.province}
          </span>
        </div>
        
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
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
        
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold text-primary">
              {formatPrice(property.price, currency)}
            </p>
            <p className="text-xs text-muted-foreground">
              Save {formatPrice(property.price * 0.06, currency)} vs agents
            </p>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0">
        <Link href={`/properties/${property.id}`} className="w-full">
          <Button variant="outline" className="w-full">
            View Details
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}