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

    // Upload a single image
    const uploadSingleImage = async (file: File, index: number) => {
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
        return { success: true, data, index }
      } catch (err: any) {
        console.error(`Error uploading image ${index + 1}:`, err)
        return { success: false, index, filename: file.name, error: err.message }
      }
    }

    // Upload in batches of 5 for faster performance (images are compressed on client)
    const BATCH_SIZE = 5
    let completed = 0

    for (let i = 0; i < files.length; i += BATCH_SIZE) {
      const batch = files.slice(i, i + BATCH_SIZE)
      const batchPromises = batch.map((file, batchIndex) =>
        uploadSingleImage(file, i + batchIndex)
      )

      const results = await Promise.all(batchPromises)

      for (const result of results) {
        if (result.success && result.data?.images) {
          uploadedImages.push(...result.data.images)
        } else if (!result.success) {
          errors.push({ index: result.index, filename: result.filename, error: result.error })
        }
        completed++
      }

      // Update progress after each batch
      setProgress({
        loaded: completed,
        total: files.length,
        percentage: Math.round((completed / files.length) * 100)
      })
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
