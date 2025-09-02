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
  CheckCircle
} from 'lucide-react'
import { formatPrice, formatDate } from '@/lib/utils/format'

interface PropertyDetailsProps {
  property: any
}

export function PropertyDetails({ property }: PropertyDetailsProps) {
  const currency = property.country?.currency || 'ZAR'
  
  return (
    <div className="space-y-6">
      {/* Title and Price */}
      <div>
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">{property.title}</h1>
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>
                {property.address_line1}, {property.city}, {property.province}
              </span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-primary">
              {formatPrice(property.price, currency)}
            </p>
            <p className="text-sm text-muted-foreground">
              {property.listing_type === 'premium' && (
                <Badge variant="default" className="ml-2">Premium</Badge>
              )}
              {property.featured && (
                <Badge variant="secondary" className="ml-2">Featured</Badge>
              )}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>Listed {formatDate(property.created_at)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Eye className="h-4 w-4" />
            <span>{property.views} views</span>
          </div>
        </div>
      </div>

      <Separator />

      {/* Key Features */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Key Features</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <Home className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Type</p>
                <p className="font-medium capitalize">{property.property_type}</p>
              </div>
            </CardContent>
          </Card>
          
          {property.bedrooms && (
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <Bed className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Bedrooms</p>
                  <p className="font-medium">{property.bedrooms}</p>
                </div>
              </CardContent>
            </Card>
          )}
          
          {property.bathrooms && (
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <Bath className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Bathrooms</p>
                  <p className="font-medium">{property.bathrooms}</p>
                </div>
              </CardContent>
            </Card>
          )}
          
          {property.square_meters && (
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <Square className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Size</p>
                  <p className="font-medium">{property.square_meters}m²</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Description */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Description</h2>
        <p className="text-muted-foreground whitespace-pre-wrap">
          {property.description || 'No description provided.'}
        </p>
      </div>

      {/* Why DealDirect */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-primary" />
            Why buy through DealDirect?
          </h3>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-primary mt-0.5" />
              <span>Direct communication with the seller - no middleman</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-primary mt-0.5" />
              <span>Save {formatPrice(property.price * 0.06 - 2000, currency)} in agent commissions</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-primary mt-0.5" />
              <span>Verified lawyers handle all legal work at transparent rates</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-primary mt-0.5" />
              <span>Secure transaction process with success fee only on completion</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}