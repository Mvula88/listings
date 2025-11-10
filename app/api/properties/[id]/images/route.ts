import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id: propertyId } = await params

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verify property ownership
    const { data: property } = await supabase
      .from('properties')
      .select('seller_id')
      .eq('id', propertyId)
      .single() as { data: { seller_id: string } | null; error: any }

    if (!property || property.seller_id !== user.id) {
      return NextResponse.json(
        { error: 'Property not found or access denied' },
        { status: 403 }
      )
    }

    // Get form data
    const formData = await request.formData()
    const files = formData.getAll('images') as File[]

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No images provided' },
        { status: 400 }
      )
    }

    // Upload images to Supabase Storage and create records
    const uploadedImages: any[] = []
    const errors: any[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const fileExt = file.name.split('.').pop()
      const fileName = `${propertyId}/${Date.now()}-${i}.${fileExt}`

      try {
        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('property-images')
          .upload(fileName, file, {
            contentType: file.type,
            cacheControl: '3600',
            upsert: false
          })

        if (uploadError) throw uploadError

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('property-images')
          .getPublicUrl(fileName)

        // Create database record
        const { data: imageRecord, error: dbError } = await supabase
          .from('property_images')
          .insert({
            property_id: propertyId,
            url: publicUrl,
            alt_text: `${property} - Image ${i + 1}`,
            order_index: i
          })
          .select()
          .single()

        if (dbError) throw dbError

        uploadedImages.push(imageRecord)
      } catch (error: any) {
        console.error(`Error uploading image ${i}:`, error)
        errors.push({ index: i, filename: file.name, error: error.message })
      }
    }

    if (errors.length > 0 && uploadedImages.length === 0) {
      return NextResponse.json(
        { error: 'All uploads failed', details: errors },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      uploaded: uploadedImages.length,
      failed: errors.length,
      images: uploadedImages,
      errors: errors.length > 0 ? errors : undefined
    })
  } catch (error: any) {
    console.error('Error in image upload:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

// Delete image
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id: propertyId } = await params

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get image ID from query
    const url = new URL(request.url)
    const imageId = url.searchParams.get('imageId')

    if (!imageId) {
      return NextResponse.json(
        { error: 'Image ID required' },
        { status: 400 }
      )
    }

    // Verify ownership
    const { data: image } = await supabase
      .from('property_images')
      .select('*, property:properties!property_id(seller_id)')
      .eq('id', imageId)
      .single()

    if (!image || (image.property as any)?.seller_id !== user.id) {
      return NextResponse.json(
        { error: 'Image not found or access denied' },
        { status: 403 }
      )
    }

    // Extract file path from URL
    const urlObj = new URL(image.url)
    const filePath = urlObj.pathname.split('/').slice(-2).join('/')

    // Delete from storage
    await supabase.storage
      .from('property-images')
      .remove([filePath])

    // Delete from database
    const { error: dbError } = await supabase
      .from('property_images')
      .delete()
      .eq('id', imageId)

    if (dbError) throw dbError

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting image:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
