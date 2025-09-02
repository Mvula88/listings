import Link from 'next/link'
import { PropertyCard } from './property-card'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

interface SimilarPropertiesProps {
  properties: any[]
}

export function SimilarProperties({ properties }: SimilarPropertiesProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Similar Properties</h2>
        <Link href="/browse">
          <Button variant="outline">
            View All
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {properties.map((property) => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </div>
    </div>
  )
}