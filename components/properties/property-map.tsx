'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MapPin } from 'lucide-react'

interface PropertyMapProps {
  latitude?: number | null
  longitude?: number | null
  address: string
}

export function PropertyMap({ latitude, longitude, address }: PropertyMapProps) {
  // In a real app, you would integrate with a mapping service like Google Maps or Mapbox
  // For now, we'll show a placeholder
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Location</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-start gap-2">
            <MapPin className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <p className="font-medium">{address}</p>
              {latitude && longitude && (
                <p className="text-sm text-muted-foreground mt-1">
                  Coordinates: {latitude.toFixed(6)}, {longitude.toFixed(6)}
                </p>
              )}
            </div>
          </div>
          
          <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
            <div className="text-center">
              <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                Map view will be displayed here
              </p>
            </div>
          </div>
          
          <p className="text-xs text-muted-foreground">
            Exact location will be shared after initial contact with seller
          </p>
        </div>
      </CardContent>
    </Card>
  )
}