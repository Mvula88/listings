'use server'

import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const propertySchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  property_type: z.enum(['house', 'apartment', 'townhouse', 'land', 'commercial', 'industrial']),
  listing_type: z.enum(['sale', 'rent']),
  price: z.number().positive('Price must be positive'),
  currency: z.enum(['ZAR', 'NAD']).refine((val) => ['ZAR', 'NAD'].includes(val), { message: 'Currency must be ZAR or NAD' }),
  bedrooms: z.number().min(0, 'Bedrooms cannot be negative'),
  bathrooms: z.number().min(0, 'Bathrooms cannot be negative'),
  area: z.number().positive('Area must be positive'),
  address: z.string().min(5, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  province: z.string().min(2, 'Province is required'),
  country_id: z.number().int().positive(),
  location: z.string().min(2, 'Location is required'),
  year_built: z.number().int().min(1800).max(new Date().getFullYear() + 1).optional(),
  features: z.array(z.string()).optional(),
})

type PropertyData = z.infer<typeof propertySchema>

interface CreatePropertyResult {
  success: boolean
  data?: {
    id: string
    title: string
    status: string
  }
  error?: string
}

export async function createProperty(data: PropertyData): Promise<CreatePropertyResult> {
  try {
    // Validate input
    const validatedData = propertySchema.parse(data)

    const supabase = await createClient()

    // 1. Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return {
        success: false,
        error: 'Authentication required. Please log in to create a property listing.',
      }
    }

    // 2. Check user profile and authorization
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, user_type')
      .eq('id', user.id)
      .single() as {
        data: {
          id: string
          user_type: string
        } | null
        error: any
      }

    if (profileError || !profile) {
      return {
        success: false,
        error: 'User profile not found.',
      }
    }

    if (profile.user_type !== 'seller') {
      return {
        success: false,
        error: 'Only sellers can create property listings.',
      }
    }

    // 3. Create property listing
    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .insert({
        ...validatedData,
        owner_id: user.id,
        status: 'pending', // Requires admin verification
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select('id, title, status')
      .single()

    if (propertyError || !property) {
      console.error('Failed to create property:', propertyError)
      return {
        success: false,
        error: 'Failed to create property listing. Please try again.',
      }
    }

    return {
      success: true,
      data: {
        id: property.id,
        title: property.title,
        status: property.status,
      },
    }
  } catch (error: any) {
    console.error('Create property error:', error)

    if (error instanceof z.ZodError) {
      const firstError = error.errors?.[0]
      if (firstError) {
        return {
          success: false,
          error: firstError.message,
        }
      }
      // Fallback if errors array is empty or undefined
      return {
        success: false,
        error: 'Validation failed. Please check your input.',
      }
    }

    return {
      success: false,
      error: 'An unexpected error occurred. Please try again.',
    }
  }
}

export async function updateProperty(propertyId: string, data: Partial<PropertyData>) {
  try {
    const supabase = await createClient()

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return {
        success: false,
        error: 'Authentication required',
      }
    }

    // Verify ownership
    const { data: property } = await supabase
      .from('properties')
      .select('owner_id')
      .eq('id', propertyId)
      .single()

    if (!property || property.owner_id !== user.id) {
      return {
        success: false,
        error: 'Unauthorized',
      }
    }

    // Update property
    const { error: updateError } = await supabase
      .from('properties')
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq('id', propertyId)

    if (updateError) {
      return {
        success: false,
        error: 'Failed to update property',
      }
    }

    return { success: true }
  } catch (error: any) {
    console.error('Update property error:', error)
    return {
      success: false,
      error: 'An unexpected error occurred',
    }
  }
}

export async function deleteProperty(propertyId: string) {
  try {
    const supabase = await createClient()

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return {
        success: false,
        error: 'Authentication required',
      }
    }

    // Verify ownership
    const { data: property } = await supabase
      .from('properties')
      .select('owner_id')
      .eq('id', propertyId)
      .single()

    if (!property || property.owner_id !== user.id) {
      return {
        success: false,
        error: 'Unauthorized',
      }
    }

    // Soft delete by setting status to deleted
    const { error: deleteError } = await supabase
      .from('properties')
      .update({
        status: 'deleted',
        updated_at: new Date().toISOString(),
      })
      .eq('id', propertyId)

    if (deleteError) {
      return {
        success: false,
        error: 'Failed to delete property',
      }
    }

    return { success: true }
  } catch (error: any) {
    console.error('Delete property error:', error)
    return {
      success: false,
      error: 'An unexpected error occurred',
    }
  }
}

export async function getPropertiesForUser(userId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('properties')
    .select(`
      *,
      images:property_images(
        id,
        image_url,
        display_order
      )
    `)
    .eq('owner_id', userId)
    .neq('status', 'deleted')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Failed to fetch user properties:', error)
    return []
  }

  return data || []
}
