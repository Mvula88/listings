import { createServerClient } from '@/lib/supabase/server'

export interface Property {
  id: string
  title: string
  description: string
  property_type: string
  price: number
  currency: string
  bedrooms: number
  bathrooms: number
  square_meters: number
  city: string
  province: string
  status: string
  featured: boolean
  views: number
  images: PropertyImage[]
  country: {
    name: string
    currency_symbol: string
  }
}

export interface PropertyImage {
  id: string
  url: string
  alt_text: string
  order_index: number
}

export async function getFeaturedProperties(limit: number = 8) {
  const supabase = await createServerClient()
  
  const { data: properties, error } = await supabase
    .from('properties')
    .select(`
      *,
      property_images (
        id,
        url,
        alt_text,
        order_index
      ),
      countries (
        name,
        currency_symbol
      )
    `)
    .eq('status', 'active')
    .eq('featured', true)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching featured properties:', error)
    return []
  }

  // Transform the data to match our Property interface
  return properties?.map((p: any) => ({
    id: p.id,
    title: p.title,
    description: p.description,
    property_type: p.property_type,
    price: p.price,
    currency: p.currency,
    bedrooms: p.bedrooms,
    bathrooms: p.bathrooms,
    square_meters: p.square_meters,
    city: p.city,
    province: p.province,
    status: p.status,
    featured: p.featured,
    views: p.views,
    images: p.property_images || [],
    country: p.countries || { name: '', currency_symbol: 'R' }
  })) || []
}

export async function getAllActiveProperties() {
  const supabase = await createServerClient()
  
  const { data: properties, error } = await supabase
    .from('properties')
    .select(`
      *,
      property_images (
        id,
        url,
        alt_text,
        order_index
      ),
      countries (
        name,
        currency_symbol
      )
    `)
    .eq('status', 'active')
    .order('featured', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching properties:', error)
    return []
  }

  return properties?.map((p: any) => ({
    id: p.id,
    title: p.title,
    description: p.description,
    property_type: p.property_type,
    price: p.price,
    currency: p.currency,
    bedrooms: p.bedrooms,
    bathrooms: p.bathrooms,
    square_meters: p.square_meters,
    city: p.city,
    province: p.province,
    status: p.status,
    featured: p.featured,
    views: p.views,
    images: p.property_images || [],
    country: p.countries || { name: '', currency_symbol: 'R' }
  })) || []
}

export function formatPropertyPrice(price: number, currencySymbol: string = 'R') {
  return `${currencySymbol}${new Intl.NumberFormat('en-ZA', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)}`
}