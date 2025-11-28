import { createClient } from '@/lib/supabase/server'
import { PropertyCard } from '@/components/properties/property-card'
import { PropertyFilters } from '@/components/properties/property-filters'
import { FilterDrawer } from '@/components/properties/filter-drawer'
import { SortSelect } from '@/components/properties/sort-select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, MapPin, SlidersHorizontal, Home, Sparkles } from 'lucide-react'
import { FadeIn } from '@/components/ui/fade-in'
import { ScrollToTop } from '@/components/ui/scroll-to-top'
import { PageHeader } from '@/components/layout/page-header'
import { PageFooter } from '@/components/layout/page-footer'
import Link from 'next/link'
import Image from 'next/image'

interface SearchParams {
  q?: string
  city?: string
  minPrice?: string
  maxPrice?: string
  bedrooms?: string
  type?: string
  country?: string
  sort?: string
}

export default async function BrowsePropertiesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const supabase = await createClient()
  const params = await searchParams

  // Get current user to check favorites
  const { data: { user } } = await supabase.auth.getUser()

  // Get user's favorites if logged in
  let userFavorites: string[] = []
  if (user) {
    const { data: favorites } = await supabase
      .from('property_favorites')
      .select('property_id')
      .eq('user_id', user.id) as { data: { property_id: string }[] | null }
    userFavorites = favorites?.map(f => f.property_id) || []
  }

  // Build query - show active properties
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

  // Apply sorting - Priority: Premium > Featured > Regular
  // Within each tier, apply user's sort preference
  const sortBy = params.sort || 'newest'

  // 1. Premium listings first (featured=true AND premium=true)
  query = query.order('premium', { ascending: false, nullsFirst: false })

  // 2. Then featured listings (featured=true)
  query = query.order('featured', { ascending: false, nullsFirst: false })

  // 3. Then apply the user's chosen sort as tertiary sort
  switch (sortBy) {
    case 'price-asc':
      query = query.order('price', { ascending: true })
      break
    case 'price-desc':
      query = query.order('price', { ascending: false })
      break
    case 'popular':
      query = query.order('views', { ascending: false })
      break
    case 'newest':
    default:
      query = query.order('created_at', { ascending: false })
      break
  }

  // Apply filters
  if (params.q) {
    query = query.or(`title.ilike.%${params.q}%,description.ilike.%${params.q}%`)
  }

  if (params.city) {
    query = query.ilike('city', `%${params.city}%`)
  }

  if (params.minPrice) {
    query = query.gte('price', parseInt(params.minPrice))
  }

  if (params.maxPrice) {
    query = query.lte('price', parseInt(params.maxPrice))
  }

  if (params.bedrooms) {
    query = query.gte('bedrooms', parseInt(params.bedrooms))
  }

  if (params.type) {
    query = query.eq('property_type', params.type)
  }

  if (params.country) {
    query = query.eq('country_id', params.country)
  }

  const { data: properties } = await query

  // Get countries for filter
  const { data: countries } = await supabase
    .from('countries')
    .select('*')

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <PageHeader />

      {/* Hero Section */}
      <section className="relative py-16 bg-gradient-to-br from-primary/10 via-primary/5 to-background overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]" />
        <div className="absolute top-10 right-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />

        <div className="container mx-auto px-4 relative z-10">
          <FadeIn>
            <div className="max-w-3xl mx-auto text-center mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6">
                <Home className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-primary">Find Your Dream Home</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 font-[family-name:var(--font-poppins)]">
                Browse <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">Properties</span>
              </h1>
              <p className="text-lg text-muted-foreground">
                Discover homes listed directly by owners - no agent fees
              </p>
            </div>
          </FadeIn>

          {/* Search Bar */}
          <FadeIn delay={0.1}>
            <div className="max-w-4xl mx-auto bg-background/80 backdrop-blur-sm p-6 rounded-2xl border shadow-lg">
              <form className="flex flex-col md:flex-row gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    name="q"
                    placeholder="Search by location, property type, or keyword..."
                    defaultValue={params.q}
                    className="pl-10 h-12"
                  />
                </div>
                <div className="relative md:w-[200px]">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    name="city"
                    placeholder="City"
                    defaultValue={params.city}
                    className="pl-10 h-12"
                  />
                </div>
                <Button type="submit" size="lg" className="md:w-auto w-full">
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
              </form>

              {/* Mobile Filter Button */}
              <div className="mt-4 md:hidden">
                <FilterDrawer
                  countries={countries || []}
                  currentFilters={params}
                />
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8 flex-1">
        <div className="flex gap-8">
          {/* Sticky Filters Sidebar - Desktop Only */}
          <aside className="hidden md:block w-72 shrink-0">
            <div className="sticky top-24 space-y-6">
              <div className="bg-card border rounded-xl p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <SlidersHorizontal className="h-5 w-5 text-primary" />
                  <h2 className="font-semibold text-lg">Filters</h2>
                </div>
                <PropertyFilters
                  countries={countries || []}
                  currentFilters={params}
                />
              </div>
            </div>
          </aside>

          {/* Properties Grid */}
          <main className="flex-1 min-w-0">
            <FadeIn delay={0.1}>
              <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold mb-1">
                    Available Properties
                  </h2>
                  <p className="text-muted-foreground">
                    {properties?.length || 0} properties found
                  </p>
                </div>
                <SortSelect currentSort={params.sort} />
              </div>
            </FadeIn>

            {properties && properties.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {properties.map((property: any, index: number) => (
                  <FadeIn key={property.id} delay={index * 0.05}>
                    <PropertyCard
                      property={property}
                      initialFavorited={userFavorites.includes(property.id)}
                    />
                  </FadeIn>
                ))}
              </div>
            ) : (
              <FadeIn delay={0.2}>
                <div className="text-center py-16 bg-muted/30 rounded-2xl border-2 border-dashed">
                  <div className="max-w-sm mx-auto">
                    <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                    <h3 className="text-lg font-semibold mb-2">No properties found</h3>
                    <p className="text-muted-foreground mb-6">
                      Try adjusting your search criteria or filters
                    </p>
                    <Link href="/browse">
                      <Button variant="outline">
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

      <PageFooter />

      {/* Scroll to Top Button */}
      <ScrollToTop />
    </div>
  )
}
