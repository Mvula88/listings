// API Route: Image Upload with Optimization
// Handles image uploads, optimizes them, and stores in Supabase Storage

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  optimizeImage,
  generateThumbnail,
  validateImageFile,
  fileToBuffer,
  DEFAULT_IMAGE_CONFIG,
} from '@/lib/utils/image-optimization'

export const runtime = 'nodejs'
export const maxDuration = 60 // 60 seconds for image processing

interface UploadResponse {
  success: boolean
  url?: string
  thumbnailUrl?: string
  metadata?: {
    width: number
    height: number
    sizeKB: number
    originalSizeKB: number
    compressionRatio: number
  }
  error?: string
}

export async function POST(request: NextRequest): Promise<NextResponse<UploadResponse>> {
  try {
    // Authenticate user
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get form data
    const formData = await request.formData()
    const file = formData.get('file') as File
    const folder = (formData.get('folder') as string) || 'properties'
    const generateThumb = formData.get('generateThumbnail') === 'true'

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file
    const validation = validateImageFile(file, 10) // Max 10MB
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      )
    }

    // Convert file to buffer
    const buffer = await fileToBuffer(file)

    // Optimize image
    const optimized = await optimizeImage(buffer, DEFAULT_IMAGE_CONFIG)

    // Generate unique filename
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(7)
    const filename = `${timestamp}-${randomString}.${optimized.format}`
    const filePath = `${folder}/${user.id}/${filename}`

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('property-images')
      .upload(filePath, optimized.buffer, {
        contentType: `image/${optimized.format}`,
        cacheControl: '31536000', // 1 year
        upsert: false,
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json(
        { success: false, error: 'Failed to upload image' },
        { status: 500 }
      )
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from('property-images').getPublicUrl(filePath)

    // Generate and upload thumbnail if requested
    let thumbnailUrl: string | undefined

    if (generateThumb) {
      try {
        const thumbnail = await generateThumbnail(buffer)
        const thumbFilename = `${timestamp}-${randomString}-thumb.${thumbnail.format}`
        const thumbPath = `${folder}/${user.id}/thumbnails/${thumbFilename}`

        const { error: thumbError } = await supabase.storage
          .from('property-images')
          .upload(thumbPath, thumbnail.buffer, {
            contentType: `image/${thumbnail.format}`,
            cacheControl: '31536000',
            upsert: false,
          })

        if (!thumbError) {
          const { data: thumbData } = supabase.storage
            .from('property-images')
            .getPublicUrl(thumbPath)
          thumbnailUrl = thumbData.publicUrl
        }
      } catch (error) {
        console.error('Thumbnail generation error:', error)
        // Continue without thumbnail if it fails
      }
    }

    // Return success response
    return NextResponse.json({
      success: true,
      url: publicUrl,
      thumbnailUrl,
      metadata: {
        width: optimized.width,
        height: optimized.height,
        sizeKB: optimized.sizeKB,
        originalSizeKB: optimized.originalSizeKB,
        compressionRatio: optimized.compressionRatio,
      },
    })
  } catch (error) {
    console.error('Image upload error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    )
  }
}

// DELETE endpoint to remove images
export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const filePath = searchParams.get('path')

    if (!filePath) {
      return NextResponse.json(
        { success: false, error: 'File path required' },
        { status: 400 }
      )
    }

    // Verify user owns this file (path should contain user ID)
    if (!filePath.includes(user.id)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Delete from storage
    const { error } = await supabase.storage
      .from('property-images')
      .remove([filePath])

    if (error) {
      console.error('Delete error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to delete image' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Image deletion error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
