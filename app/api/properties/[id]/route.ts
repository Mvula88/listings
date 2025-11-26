import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET a single property
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const { data: property, error } = await supabase
      .from('properties')
      .select(`
        *,
        property_images (
          id,
          url,
          alt_text,
          order_index
        ),
        country:countries (
          id,
          name,
          currency,
          currency_symbol
        )
      `)
      .eq('id', id)
      .single()

    if (error || !property) {
      return NextResponse.json(
        { success: false, error: 'Property not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: property })
  } catch (error: any) {
    console.error('GET property error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH update a property
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params
    const supabase = await createClient()

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Verify ownership
    const { data: property } = await supabase
      .from('properties')
      .select('seller_id')
      .eq('id', id)
      .single()

    if (!property || property.seller_id !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Get update data
    const body = await request.json()

    // Update property
    const { error: updateError } = await supabase
      .from('properties')
      .update({
        ...body,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (updateError) {
      console.error('Update error:', updateError)
      return NextResponse.json(
        { success: false, error: 'Failed to update property' },
        { status: 400 }
      )
    }

    // Revalidate paths
    revalidatePath('/dashboard')
    revalidatePath('/browse')
    revalidatePath('/properties')
    revalidatePath(`/properties/${id}`)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('PATCH property error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE a property (soft delete)
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params
    const supabase = await createClient()

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Verify ownership
    const { data: property } = await supabase
      .from('properties')
      .select('seller_id')
      .eq('id', id)
      .single()

    if (!property || property.seller_id !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Soft delete
    const { error: deleteError } = await supabase
      .from('properties')
      .update({
        status: 'withdrawn',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (deleteError) {
      return NextResponse.json(
        { success: false, error: 'Failed to delete property' },
        { status: 400 }
      )
    }

    // Revalidate paths
    revalidatePath('/dashboard')
    revalidatePath('/browse')
    revalidatePath('/properties')

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('DELETE property error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
