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

    try {
      const formData = new FormData()
      files.forEach(file => {
        formData.append('images', file)
      })

      const response = await fetch(`/api/properties/${propertyId}/images`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Upload failed')
      }

      const data = await response.json()

      setProgress({ loaded: files.length, total: files.length, percentage: 100 })

      return data
    } catch (err: any) {
      setError(err.message || 'Upload failed')
      throw err
    } finally {
      setUploading(false)
    }
  }, [])

  return {
    upload,
    uploading,
    progress,
    error
  }
}
