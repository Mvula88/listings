'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { Upload, X, Image as ImageIcon, Loader2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import Image from 'next/image'
import { cn } from '@/lib/utils/cn'

interface ImageUploadProps {
  maxImages?: number
  maxSizeMB?: number
  onImagesChange?: (images: File[]) => void
  existingImages?: string[]
}

interface ImagePreview {
  file: File
  preview: string
  uploading?: boolean
  error?: string
}

// Compress image on client side before upload
async function compressImage(file: File, maxWidth = 1920, quality = 0.85): Promise<File> {
  return new Promise((resolve) => {
    // If file is already small (under 500KB), don't compress
    if (file.size < 500 * 1024) {
      resolve(file)
      return
    }

    const img = document.createElement('img')
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    img.onload = () => {
      // Calculate new dimensions (maintain aspect ratio)
      let { width, height } = img
      if (width > maxWidth) {
        height = (height * maxWidth) / width
        width = maxWidth
      }

      canvas.width = width
      canvas.height = height

      // Draw and compress
      ctx?.drawImage(img, 0, 0, width, height)

      canvas.toBlob(
        (blob) => {
          if (blob) {
            // Create new file with compressed data
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            })
            resolve(compressedFile)
          } else {
            resolve(file) // Fallback to original
          }
        },
        'image/jpeg',
        quality
      )

      // Clean up
      URL.revokeObjectURL(img.src)
    }

    img.onerror = () => resolve(file) // Fallback to original on error
    img.src = URL.createObjectURL(file)
  })
}

export function ImageUpload({
  maxImages = 15,
  maxSizeMB = 10,
  onImagesChange,
  existingImages = []
}: ImageUploadProps) {
  const [images, setImages] = useState<ImagePreview[]>([])
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [compressing, setCompressing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Notify parent when images change
  useEffect(() => {
    onImagesChange?.(images.map(img => img.file))
  }, [images, onImagesChange])

  const validateFile = (file: File): string | null => {
    // Check file type
    if (!file.type.startsWith('image/')) {
      return `${file.name} is not an image file`
    }

    // Check file size
    const sizeMB = file.size / (1024 * 1024)
    if (sizeMB > maxSizeMB) {
      return `${file.name} is too large (${sizeMB.toFixed(1)}MB). Max size is ${maxSizeMB}MB`
    }

    return null
  }

  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files) return

    setError(null)
    const fileArray = Array.from(files)

    // Check total count
    if (images.length + fileArray.length > maxImages) {
      setError(`You can only upload up to ${maxImages} images`)
      return
    }

    // Validate each file
    const validFiles: File[] = []
    for (const file of fileArray) {
      const validationError = validateFile(file)
      if (validationError) {
        setError(validationError)
        return
      }
      validFiles.push(file)
    }

    // Compress images before adding (shows loading state)
    setCompressing(true)

    try {
      // Compress all images in parallel
      const compressedFiles = await Promise.all(
        validFiles.map(file => compressImage(file))
      )

      // Create previews with compressed files
      const newImages: ImagePreview[] = compressedFiles.map(file => ({
        file,
        preview: URL.createObjectURL(file)
      }))

      setImages(prev => [...prev, ...newImages])
    } catch (err) {
      setError('Failed to process images')
    } finally {
      setCompressing(false)
    }
  }, [images.length, maxImages, maxSizeMB])

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    handleFiles(e.dataTransfer.files)
  }, [handleFiles])

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files)
  }, [handleFiles])

  const removeImage = useCallback((index: number) => {
    setImages(prev => {
      // Revoke object URL to free memory
      URL.revokeObjectURL(prev[index].preview)
      return prev.filter((_, i) => i !== index)
    })
    setError(null)
  }, [])

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={cn(
          'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
          dragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50',
          images.length >= maxImages && 'opacity-50 cursor-not-allowed'
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={images.length < maxImages ? handleClick : undefined}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleChange}
          className="hidden"
          disabled={images.length >= maxImages}
        />

        <div className="flex flex-col items-center gap-2">
          <div className="p-4 rounded-full bg-primary/10">
            {compressing ? (
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
            ) : (
              <Upload className="h-8 w-8 text-primary" />
            )}
          </div>
          <div>
            <p className="text-lg font-medium">
              {compressing
                ? 'Compressing images...'
                : images.length >= maxImages
                ? `Maximum ${maxImages} images reached`
                : 'Drop images here or click to browse'
              }
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              PNG, JPG, WEBP up to {maxSizeMB}MB • {images.length}/{maxImages} images
              <br />
              <span className="text-green-600">Images auto-compressed for faster upload</span>
            </p>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Image Previews */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div
              key={index}
              className="relative group aspect-square rounded-lg overflow-hidden border-2 border-muted hover:border-primary transition-colors"
            >
              <Image
                src={image.preview}
                alt={`Upload ${index + 1}`}
                fill
                className="object-cover"
              />

              {/* Order Badge */}
              <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                #{index + 1}
              </div>

              {/* Remove Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  removeImage(index)
                }}
                className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
              >
                <X className="h-4 w-4" />
              </button>

              {/* Primary Image Indicator */}
              {index === 0 && (
                <div className="absolute bottom-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded font-medium">
                  Main Photo
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Helper Text */}
      {images.length > 0 && (
        <p className="text-sm text-muted-foreground">
          💡 The first image will be used as the main photo. Drag images to reorder.
        </p>
      )}
    </div>
  )
}
