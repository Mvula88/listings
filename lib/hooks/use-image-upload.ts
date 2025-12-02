'use client'

import { useState, useCallback } from 'react'

interface UploadProgress {
  loaded: number
  total: number
  percentage: number
}

interface UseImageUploadReturn {
  upload: (propertyId: string, files: File[]) => Promise<any>
  uploading: boolean
  progress: UploadProgress | null
  error: string | null
}

export function useImageUpload(): UseImageUploadReturn {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState<UploadProgress | null>(null)
  const [error, setError] = useState<string | null>(null)

  const upload = useCallback(async (propertyId: string, files: File[]) => {
    if (!files || files.length === 0) {
      throw new Error('No files provided')
    }

    setUploading(true)
    setError(null)
    setProgress({ loaded: 0, total: files.length, percentage: 0 })

    const uploadedImages: any[] = []
    const errors: any[] = []

    // Upload images ONE AT A TIME to avoid timeout on Vercel Hobby plan
    for (let i = 0; i < files.length; i++) {
      const file = files[i]

      try {
        const formData = new FormData()
        formData.append('images', file)

        const response = await fetch(`/api/properties/${propertyId}/images`, {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Upload failed' }))
          throw new Error(errorData.error || 'Upload failed')
        }

        const data = await response.json()
        if (data.images) {
          uploadedImages.push(...data.images)
        }

        // Update progress after each successful upload
        setProgress({
          loaded: i + 1,
          total: files.length,
          percentage: Math.round(((i + 1) / files.length) * 100)
        })
      } catch (err: any) {
        console.error(`Error uploading image ${i + 1}:`, err)
        errors.push({ index: i, filename: file.name, error: err.message })
      }
    }

    setUploading(false)

    if (errors.length > 0 && uploadedImages.length === 0) {
      const errorMsg = `All uploads failed: ${errors[0]?.error || 'Unknown error'}`
      setError(errorMsg)
      throw new Error(errorMsg)
    }

    if (errors.length > 0) {
      setError(`${errors.length} image(s) failed to upload`)
    }

    return {
      success: true,
      uploaded: uploadedImages.length,
      failed: errors.length,
      images: uploadedImages,
      errors: errors.length > 0 ? errors : undefined
    }
  }, [])

  return {
    upload,
    uploading,
    progress,
    error
  }
}
