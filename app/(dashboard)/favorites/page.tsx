import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PropertyCard } from '@/components/properties/property-card'
import { Button } from '@/components/ui/button'
import { Heart } from 'lucide-react'
import Link from 'next/link'

export const metadata = {
  title: 'Saved Properties | DealDirect',
  description: 'View your saved and favorite properties',
}

export default async function FavoritesPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get user's favorites with property details
  const { data: favorites } = await supabase
    .from('property_favorites')
    .select(`
      id,
      created_at,
      property:properties(
        *,
        property_images(url, alt_text, order_index),
        seller:profiles!seller_id(full_name, avatar_url),
        country:countries(name, currency, currency_symbol, code)
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false }) as any

  const properties = favorites?.map((f: any) => f.property).filter(Boolean) || []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Saved Properties</h1>
          <p className="text-muted-foreground mt-2">
            {properties.length} {properties.length === 1 ? 'property' : 'properties'} saved
          </p>
        </div>
        <Link href="/browse">
          <Button variant="outline">
            Browse More Properties
          </Button>
        </Link>
      </div>

      {properties.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {properties.map((property: any) => (
            <PropertyCard
              key={property.id}
              property={property}
              initialFavorited={true}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-muted/30 rounded-lg border-2 border-dashed">
          <div className="max-w-sm mx-auto">
            <Heart className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-lg font-semibold mb-2">No saved properties yet</h3>
            <p className="text-muted-foreground mb-6">
              Start browsing and save properties you're interested in
            </p>
            <Link href="/browse">
              <Button>
                Browse Properties
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
