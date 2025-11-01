// Image Optimization Utility
// Compresses and optimizes images before upload to save storage costs

import sharp from 'sharp'

export interface ImageOptimizationConfig {
  maxWidth?: number
  maxHeight?: number
  quality?: number
  format?: 'webp' | 'jpeg' | 'png'
  maxSizeKB?: number
}

export interface OptimizedImage {
  buffer: Buffer
  format: string
  width: number
  height: number
  sizeKB: number
  originalSizeKB: number
  compressionRatio: number
}

// Default configuration for property images
export const DEFAULT_IMAGE_CONFIG: ImageOptimizationConfig = {
  maxWidth: 1920,
  maxHeight: 1080,
  quality: 80,
  format: 'webp',
  maxSizeKB: 500, // Maximum 500KB per image
}

// Configuration for thumbnails
export const THUMBNAIL_CONFIG: ImageOptimizationConfig = {
  maxWidth: 400,
  maxHeight: 300,
  quality: 60,
  format: 'webp',
  maxSizeKB: 50, // Maximum 50KB for thumbnails
}

/**
 * Optimizes an image file for web delivery
 * @param fileBuffer - The original image buffer
 * @param config - Optimization configuration
 * @returns Optimized image data
 */
export async function optimizeImage(
  fileBuffer: Buffer,
  config: ImageOptimizationConfig = DEFAULT_IMAGE_CONFIG
): Promise<OptimizedImage> {
  const {
    maxWidth = 1920,
    maxHeight = 1080,
    quality = 80,
    format = 'webp',
  } = config

  const originalSizeKB = fileBuffer.length / 1024

  // Get image metadata
  const metadata = await sharp(fileBuffer).metadata()

  // Calculate resize dimensions while maintaining aspect ratio
  let width = metadata.width || maxWidth
  let height = metadata.height || maxHeight

  if (width > maxWidth || height > maxHeight) {
    const aspectRatio = width / height

    if (width > height) {
      width = maxWidth
      height = Math.round(maxWidth / aspectRatio)
    } else {
      height = maxHeight
      width = Math.round(maxHeight * aspectRatio)
    }
  }

  // Process image based on format
  let sharpInstance = sharp(fileBuffer)
    .resize(width, height, {
      fit: 'inside',
      withoutEnlargement: true,
    })

  // Apply format-specific optimization
  switch (format) {
    case 'webp':
      sharpInstance = sharpInstance.webp({ quality, effort: 6 })
      break
    case 'jpeg':
      sharpInstance = sharpInstance.jpeg({ quality, mozjpeg: true })
      break
    case 'png':
      sharpInstance = sharpInstance.png({ quality, compressionLevel: 9 })
      break
  }

  const buffer = await sharpInstance.toBuffer()
  const sizeKB = buffer.length / 1024
  const compressionRatio = ((originalSizeKB - sizeKB) / originalSizeKB) * 100

  return {
    buffer,
    format,
    width,
    height,
    sizeKB,
    originalSizeKB,
    compressionRatio,
  }
}

/**
 * Generates a thumbnail from an image
 * @param fileBuffer - The original image buffer
 * @returns Optimized thumbnail
 */
export async function generateThumbnail(
  fileBuffer: Buffer
): Promise<OptimizedImage> {
  return optimizeImage(fileBuffer, THUMBNAIL_CONFIG)
}

/**
 * Validates image file before processing
 * @param file - File to validate
 * @param maxSizeMB - Maximum file size in MB
 * @returns Validation result
 */
export interface ImageValidation {
  valid: boolean
  error?: string
}

export function validateImageFile(
  file: File,
  maxSizeMB: number = 10
): ImageValidation {
  // Check file size
  const sizeMB = file.size / (1024 * 1024)
  if (sizeMB > maxSizeMB) {
    return {
      valid: false,
      error: `Image size (${sizeMB.toFixed(2)}MB) exceeds maximum allowed (${maxSizeMB}MB)`,
    }
  }

  // Check file type
  const allowedTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/heic',
    'image/heif',
  ]

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type: ${file.type}. Allowed types: JPEG, PNG, WebP, HEIC`,
    }
  }

  return { valid: true }
}

/**
 * Converts File to Buffer for processing
 * @param file - File object
 * @returns Buffer
 */
export async function fileToBuffer(file: File): Promise<Buffer> {
  const arrayBuffer = await file.arrayBuffer()
  return Buffer.from(arrayBuffer)
}

/**
 * Optimizes multiple images in batch
 * @param files - Array of files to optimize
 * @param config - Optimization configuration
 * @param onProgress - Progress callback
 * @returns Array of optimized images
 */
export async function optimizeImageBatch(
  files: File[],
  config: ImageOptimizationConfig = DEFAULT_IMAGE_CONFIG,
  onProgress?: (current: number, total: number) => void
): Promise<OptimizedImage[]> {
  const optimizedImages: OptimizedImage[] = []

  for (let i = 0; i < files.length; i++) {
    const file = files[i]

    // Validate file
    const validation = validateImageFile(file)
    if (!validation.valid) {
      throw new Error(validation.error)
    }

    // Convert to buffer and optimize
    const buffer = await fileToBuffer(file)
    const optimized = await optimizeImage(buffer, config)
    optimizedImages.push(optimized)

    // Report progress
    if (onProgress) {
      onProgress(i + 1, files.length)
    }
  }

  return optimizedImages
}

/**
 * Calculates storage cost savings from optimization
 * @param originalSizeKB - Original file size in KB
 * @param optimizedSizeKB - Optimized file size in KB
 * @param pricePerGB - Storage price per GB per month (default: Supabase pricing)
 * @returns Estimated monthly savings
 */
export function calculateStorageSavings(
  originalSizeKB: number,
  optimizedSizeKB: number,
  pricePerGB: number = 0.125 // Supabase: $0.125/GB/month
): {
  savingsKB: number
  savingsPercent: number
  monthlySavings: number
} {
  const savingsKB = originalSizeKB - optimizedSizeKB
  const savingsPercent = (savingsKB / originalSizeKB) * 100
  const savingsGB = savingsKB / (1024 * 1024)
  const monthlySavings = savingsGB * pricePerGB

  return {
    savingsKB,
    savingsPercent,
    monthlySavings,
  }
}

/**
 * Gets recommended image configuration based on use case
 * @param useCase - The image use case
 * @returns Recommended configuration
 */
export function getRecommendedConfig(
  useCase: 'property' | 'thumbnail' | 'avatar' | 'document'
): ImageOptimizationConfig {
  switch (useCase) {
    case 'property':
      return DEFAULT_IMAGE_CONFIG
    case 'thumbnail':
      return THUMBNAIL_CONFIG
    case 'avatar':
      return {
        maxWidth: 200,
        maxHeight: 200,
        quality: 85,
        format: 'webp',
        maxSizeKB: 50,
      }
    case 'document':
      return {
        maxWidth: 2480,
        maxHeight: 3508,
        quality: 90,
        format: 'jpeg',
        maxSizeKB: 1000,
      }
    default:
      return DEFAULT_IMAGE_CONFIG
  }
}
