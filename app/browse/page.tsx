import { createClient } from '@/lib/supabase/server'
import { PropertyCard } from '@/components/properties/property-card'
import { PropertyFilters } from '@/components/properties/property-filters'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, MapPin } from 'lucide-react'

interface SearchParams {
  q?: string
  city?: string
  minPrice?: string
  maxPrice?: string
  bedrooms?: string
  type?: string
  country?: string
}

export default async function BrowsePropertiesPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const supabase = await createClient()
  
  // Build query
  let query = supabase
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
        avatar_url
      ),
      country:countries (
        id,
        name,
        currency,
        currency_symbol
      )
    `)
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  // Apply filters
  if (searchParams.q) {
    query = query.or(`title.ilike.%${searchParams.q}%,description.ilike.%${searchParams.q}%`)
  }
  
  if (searchParams.city) {
    query = query.ilike('city', `%${searchParams.city}%`)
  }
  
  if (searchParams.minPrice) {
    query = query.gte('price', parseInt(searchParams.minPrice))
  }
  
  if (searchParams.maxPrice) {
    query = query.lte('price', parseInt(searchParams.maxPrice))
  }
  
  if (searchParams.bedrooms) {
    query = query.eq('bedrooms', parseInt(searchParams.bedrooms))
  }
  
  if (searchParams.type) {
    query = query.eq('property_type', searchParams.type)
  }
  
  if (searchParams.country) {
    query = query.eq('country_id', searchParams.country)
  }

  const { data: properties } = await query as any

  // Get countries for filter
  const { data: countries } = await supabase
    .from('countries')
    .select('*')

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <a href="/" className="text-2xl font-bold text-primary">
              DealDirect
            </a>
            <div className="flex items-center gap-4">
              <a href="/list">
                <Button variant="outline">List Property</Button>
              </a>
              <a href="/login">
                <Button>Sign In</Button>
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Search Bar */}
        <div className="mb-8">
          <form className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                name="q"
                placeholder="Search properties..."
                defaultValue={searchParams.q}
                className="pl-10"
              />
            </div>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                name="city"
                placeholder="City"
                defaultValue={searchParams.city}
                className="pl-10 w-[200px]"
              />
            </div>
            <Button type="submit">Search</Button>
          </form>
        </div>

        <div className="flex gap-8">
          {/* Filters Sidebar */}
          <aside className="w-64 space-y-6">
            <PropertyFilters 
              countries={countries || []}
              currentFilters={searchParams}
            />
          </aside>

          {/* Properties Grid */}
          <main className="flex-1">
            <div className="mb-4 flex items-center justify-between">
              <h1 className="text-2xl font-bold">
                Available Properties
              </h1>
              <p className="text-muted-foreground">
                {properties?.length || 0} properties found
              </p>
            </div>

            {properties && properties.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {properties.map((property: any) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-lg text-muted-foreground">
                  No properties found matching your criteria
                </p>
                <Button className="mt-4" variant="outline">
                  Clear Filters
                </Button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}