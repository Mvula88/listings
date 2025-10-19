import { createClient } from '@/lib/supabase/server'
import { PropertyCard } from '@/components/properties/property-card'
import { PropertyFilters } from '@/components/properties/property-filters'
import { FilterDrawer } from '@/components/properties/filter-drawer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, MapPin, SlidersHorizontal } from 'lucide-react'
import { FadeIn } from '@/components/ui/fade-in'
import { PropertyGridSkeleton } from '@/components/skeletons/property-card-skeleton'
import Link from 'next/link'

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
        code,
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
    query = query.gte('bedrooms', parseInt(searchParams.bedrooms))
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
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-primary transition-transform hover:scale-105">
              DealDirect
            </Link>
            <div className="hidden md:flex items-center gap-4">
              <Link href="/list">
                <Button variant="outline" className="transition-transform hover:scale-105">List Property</Button>
              </Link>
              <Link href="/login">
                <Button className="transition-transform hover:scale-105">Sign In</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Enhanced Search Bar */}
        <FadeIn>
          <div className="mb-8 bg-muted/30 p-6 rounded-lg border">
            <form className="flex flex-col md:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  name="q"
                  placeholder="Search by location, property type, or keyword..."
                  defaultValue={searchParams.q}
                  className="pl-10 h-12"
                />
              </div>
              <div className="relative md:w-[200px]">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  name="city"
                  placeholder="City"
                  defaultValue={searchParams.city}
                  className="pl-10 h-12"
                />
              </div>
              <Button type="submit" size="lg" className="md:w-auto w-full transition-transform hover:scale-105">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </form>

            {/* Mobile Filter Button */}
            <div className="mt-4 md:hidden">
              <FilterDrawer
                countries={countries || []}
                currentFilters={searchParams}
              />
            </div>
          </div>
        </FadeIn>

        <div className="flex gap-8">
          {/* Sticky Filters Sidebar - Desktop Only */}
          <aside className="hidden md:block w-72 shrink-0">
            <div className="sticky top-24 space-y-6">
              <div className="bg-card border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-4">
                  <SlidersHorizontal className="h-5 w-5 text-primary" />
                  <h2 className="font-semibold text-lg">Filters</h2>
                </div>
                <PropertyFilters
                  countries={countries || []}
                  currentFilters={searchParams}
                />
              </div>
            </div>
          </aside>

          {/* Properties Grid */}
          <main className="flex-1 min-w-0">
            <FadeIn delay={0.1}>
              <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold mb-1">
                    Available Properties
                  </h1>
                  <p className="text-muted-foreground">
                    {properties?.length || 0} properties found
                  </p>
                </div>

                {/* Sort Options */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground hidden sm:inline">Sort by:</span>
                  <select className="border rounded-lg px-3 py-2 text-sm bg-background">
                    <option>Newest First</option>
                    <option>Price: Low to High</option>
                    <option>Price: High to Low</option>
                    <option>Most Popular</option>
                  </select>
                </div>
              </div>
            </FadeIn>

            {properties && properties.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {properties.map((property: any, index: number) => (
                  <FadeIn key={property.id} delay={index * 0.05}>
                    <PropertyCard property={property} />
                  </FadeIn>
                ))}
              </div>
            ) : (
              <FadeIn delay={0.2}>
                <div className="text-center py-16 bg-muted/30 rounded-lg border-2 border-dashed">
                  <div className="max-w-sm mx-auto">
                    <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                    <h3 className="text-lg font-semibold mb-2">No properties found</h3>
                    <p className="text-muted-foreground mb-6">
                      Try adjusting your search criteria or filters
                    </p>
                    <Link href="/browse">
                      <Button variant="outline" className="transition-transform hover:scale-105">
                        Clear All Filters
                      </Button>
                    </Link>
                  </div>
                </div>
              </FadeIn>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}