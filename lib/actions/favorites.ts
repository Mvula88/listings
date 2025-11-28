'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Database } from '@/lib/types/database'

export async function toggleFavorite(propertyId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  // Check if already favorited
  const { data: existing } = await (supabase
    .from('property_favorites') as any)
    .select('id')
    .eq('user_id', user.id)
    .eq('property_id', propertyId)
    .maybeSingle()

  if (existing) {
    // Remove favorite
    const { error } = await (supabase
      .from('property_favorites') as any)
      .delete()
      .eq('id', existing.id)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/browse')
    revalidatePath('/saved')
    revalidatePath(`/properties/${propertyId}`)
    return { success: true, favorited: false }
  } else {
    // Add favorite
    const { error } = await (supabase
      .from('property_favorites') as any)
      .insert([{
        user_id: user.id,
        property_id: propertyId,
      }])

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/browse')
    revalidatePath('/saved')
    revalidatePath(`/properties/${propertyId}`)
    return { success: true, favorited: true }
  }
}

export async function getFavorites() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { favorites: [], error: 'Not authenticated' }
  }

  const { data, error } = await (supabase
    .from('property_favorites') as any)
    .select(`
      id,
      created_at,
      property:properties(
        *,
        property_images(url, alt_text, order_index),
        seller:profiles!seller_id(full_name, avatar_url),
        country:countries(name, currency, currency_symbol)
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    return { favorites: [], error: error.message }
  }

  return { favorites: data || [], error: null }
}

export async function checkIfFavorited(propertyId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { favorited: false }
  }

  const { data } = await (supabase
    .from('property_favorites') as any)
    .select('id')
    .eq('user_id', user.id)
    .eq('property_id', propertyId)
    .maybeSingle()

  return { favorited: !!data }
}
