import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// Increase timeout for image uploads
export const runtime = 'nodejs'
export const maxDuration = 60 // 60 seconds

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

    // Upload images to Supabase Storage in parallel for better performance
    const uploadPromises = files.map(async (file, i) => {
      const fileExt = file.name.split('.').pop()
      const fileName = `${propertyId}/${Date.now()}-${Math.random().toString(36).substring(7)}-${i}.${fileExt}`

      try {
        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
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
        const { data: imageRecord, error: dbError } = await (supabase
          .from('property_images') as any)
          .insert({
            property_id: propertyId,
            url: publicUrl,
            alt_text: `Property image ${i + 1}`,
            order_index: i
          })
          .select()
          .single()

        if (dbError) throw dbError

        return { success: true, data: imageRecord }
      } catch (error: any) {
        console.error(`Error uploading image ${i}:`, error)
        return { success: false, index: i, filename: file.name, error: error.message }
      }
    })

    // Wait for all uploads to complete
    const results = await Promise.all(uploadPromises)

    const uploadedImages = results.filter(r => r.success).map(r => r.data)
    const errors = results.filter(r => !r.success)

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

// Delete images (supports single via query param or bulk via body)
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

    // Get image IDs - either from query param (single) or body (bulk)
    let imageIds: string[] = []

    const url = new URL(request.url)
    const singleImageId = url.searchParams.get('imageId')

    if (singleImageId) {
      imageIds = [singleImageId]
    } else {
      try {
        const body = await request.json()
        if (body.imageIds && Array.isArray(body.imageIds)) {
          imageIds = body.imageIds
        }
      } catch {
        // No body provided
      }
    }

    if (imageIds.length === 0) {
      return NextResponse.json(
        { error: 'Image ID(s) required' },
        { status: 400 }
      )
    }

    // Get images to delete
    const { data: images } = await supabase
      .from('property_images')
      .select('id, url')
      .in('id', imageIds)
      .eq('property_id', propertyId) as { data: { id: string; url: string }[] | null; error: any }

    if (!images || images.length === 0) {
      return NextResponse.json(
        { error: 'Images not found' },
        { status: 404 }
      )
    }

    // Delete from storage (best effort)
    for (const image of images) {
      try {
        const urlObj = new URL(image.url)
        const filePath = urlObj.pathname.split('/').slice(-2).join('/')
        await supabase.storage.from('property-images').remove([filePath])
      } catch (e) {
        console.error('Storage delete error:', e)
      }
    }

    // Delete from database
    const { error: dbError } = await supabase
      .from('property_images')
      .delete()
      .in('id', imageIds)
      .eq('property_id', propertyId)

    if (dbError) throw dbError

    return NextResponse.json({ success: true, deleted: images.length })
  } catch (error: any) {
    console.error('Error deleting image:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
