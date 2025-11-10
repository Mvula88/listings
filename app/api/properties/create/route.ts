import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Ensure user profile exists (create if it doesn't)
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single()

    if (!existingProfile) {
      // Create profile if it doesn't exist
      await (supabase as any)
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email || '',
          full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || '',
          user_type: 'seller',
        })
    }

    // Get form data
    const formData = await request.formData()

    // Extract and validate data
    const propertyData = {
      seller_id: user.id,
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      property_type: formData.get('property_type') as string,
      price: parseFloat(formData.get('price') as string),
      country_id: formData.get('country_id') as string,
      city: formData.get('city') as string,
      province: formData.get('province') as string,
      address_line1: formData.get('address_line1') as string,
      address_line2: formData.get('address_line2') as string || null,
      postal_code: formData.get('postal_code') as string || null,
      bedrooms: formData.get('bedrooms') ? parseInt(formData.get('bedrooms') as string) : null,
      bathrooms: formData.get('bathrooms') ? parseFloat(formData.get('bathrooms') as string) : null,
      square_meters: formData.get('square_meters') ? parseInt(formData.get('square_meters') as string) : null,
      status: 'active', // Properties are active by default (will be 'pending' if moderation_status exists)
    }

    // Validate required fields
    if (!propertyData.title || !propertyData.description || !propertyData.price) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get country currency
    const { data: country } = await supabase
      .from('countries')
      .select('currency')
      .eq('id', propertyData.country_id)
      .single()

    // Insert property
    const { data: property, error: insertError } = await (supabase as any)
      .from('properties')
      .insert({
        ...propertyData,
        currency: country?.currency || 'NAD',
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error creating property:', insertError)
      return NextResponse.json(
        { error: 'Failed to create property' },
        { status: 500 }
      )
    }

    // Revalidate relevant paths
    revalidatePath('/dashboard')
    revalidatePath('/browse')
    revalidatePath('/properties')

    // Return property data for client-side handling
    return NextResponse.json({
      success: true,
      property: {
        id: property.id,
        title: property.title
      }
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
