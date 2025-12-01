/**
 * Platform Settings Utility
 *
 * Reads settings from the database with environment variable fallback.
 * Settings are cached for performance.
 */

import { createClient } from '@/lib/supabase/server'

// Type definitions for settings
export interface PlatformSetting {
  key: string
  value: any
  description: string | null
  category: string
  updated_at: string
  updated_by: string | null
}

// Environment variable mapping (fallbacks)
const ENV_FALLBACKS: Record<string, string | undefined> = {
  // General
  platform_name: process.env.NEXT_PUBLIC_APP_NAME,
  support_email: process.env.SUPPORT_EMAIL,
  maintenance_mode: process.env.MAINTENANCE_MODE,

  // Features
  enable_referrals: process.env.ENABLE_REFERRALS,
  enable_premium_listings: process.env.ENABLE_PREMIUM_LISTINGS,
  enable_sms_notifications: process.env.ENABLE_SMS_NOTIFICATIONS,

  // Rate limits
  rate_limit_api: process.env.RATE_LIMIT_API,
  rate_limit_auth: process.env.RATE_LIMIT_AUTH,
  rate_limit_upload: process.env.RATE_LIMIT_UPLOAD,
  rate_limit_email: process.env.RATE_LIMIT_EMAIL,
  rate_limit_inquiry: process.env.RATE_LIMIT_INQUIRY,

  // Images
  max_images_per_property: process.env.MAX_IMAGES_PER_PROPERTY,
  max_image_size_mb: process.env.MAX_IMAGE_SIZE_MB,
  image_quality: process.env.IMAGE_QUALITY,
}

// Default values for settings
const DEFAULT_VALUES: Record<string, any> = {
  // General
  platform_name: 'PropLinka',
  support_email: 'support@proplinka.com',
  maintenance_mode: false,

  // Features
  enable_referrals: true,
  enable_premium_listings: true,
  enable_sms_notifications: false,
  require_property_approval: true,
  require_lawyer_verification: true,

  // Payment
  success_fee_buyer_percent: 0.5,
  success_fee_seller_percent: 0.5,
  premium_listing_price: 500,
  referral_discount: 500,

  // Rate limits
  rate_limit_api: 100,
  rate_limit_auth: 5,
  rate_limit_upload: 20,
  rate_limit_email: 50,
  rate_limit_inquiry: 10,

  // Images
  max_images_per_property: 15,
  max_image_size_mb: 10,
  image_quality: 80,

  // Moderation
  auto_suspend_flagged_content: true,
  flag_threshold: 3,
}

// In-memory cache for settings
let settingsCache: Map<string, any> | null = null
let cacheTimestamp: number = 0
const CACHE_TTL = 60 * 1000 // 1 minute cache TTL

/**
 * Parse a JSON value from the database
 */
function parseValue(value: any): any {
  if (value === null || value === undefined) return value

  // If it's already parsed (JSONB returns parsed)
  if (typeof value !== 'string') return value

  // Try to parse JSON string
  try {
    return JSON.parse(value)
  } catch {
    return value
  }
}

/**
 * Convert string value to appropriate type
 */
function convertValue(value: any, key: string): any {
  const parsed = parseValue(value)

  // If we have a default, use its type as a hint
  const defaultValue = DEFAULT_VALUES[key]

  if (typeof defaultValue === 'boolean') {
    if (typeof parsed === 'boolean') return parsed
    if (parsed === 'true' || parsed === '1') return true
    if (parsed === 'false' || parsed === '0') return false
    return Boolean(parsed)
  }

  if (typeof defaultValue === 'number') {
    const num = Number(parsed)
    return isNaN(num) ? defaultValue : num
  }

  return parsed
}

/**
 * Get all platform settings from the database
 * Results are cached for performance
 */
export async function getAllSettings(): Promise<Map<string, any>> {
  // Check cache
  if (settingsCache && Date.now() - cacheTimestamp < CACHE_TTL) {
    return settingsCache
  }

  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('platform_settings')
      .select('key, value') as { data: Array<{ key: string; value: unknown }> | null; error: Error | null }

    if (error) {
      console.error('Error fetching platform settings:', error)
      // Return defaults on error
      return new Map(Object.entries(DEFAULT_VALUES))
    }

    // Build settings map
    const settings = new Map<string, any>()

    // Start with defaults
    for (const [key, value] of Object.entries(DEFAULT_VALUES)) {
      settings.set(key, value)
    }

    // Override with database values
    if (data) {
      for (const setting of data) {
        settings.set(setting.key, convertValue(setting.value, setting.key))
      }
    }

    // Update cache
    settingsCache = settings
    cacheTimestamp = Date.now()

    return settings
  } catch (error) {
    console.error('Error in getAllSettings:', error)
    return new Map(Object.entries(DEFAULT_VALUES))
  }
}

/**
 * Get a single setting value
 * Checks: Database -> Environment Variable -> Default Value
 */
export async function getSetting<T = any>(key: string): Promise<T> {
  const settings = await getAllSettings()

  // First try database value
  if (settings.has(key)) {
    return settings.get(key) as T
  }

  // Then try environment variable
  const envValue = ENV_FALLBACKS[key]
  if (envValue !== undefined) {
    return convertValue(envValue, key) as T
  }

  // Finally return default
  return DEFAULT_VALUES[key] as T
}

/**
 * Get multiple settings at once
 */
export async function getSettings<T extends Record<string, any>>(keys: string[]): Promise<T> {
  const settings = await getAllSettings()
  const result: Record<string, any> = {}

  for (const key of keys) {
    if (settings.has(key)) {
      result[key] = settings.get(key)
    } else if (ENV_FALLBACKS[key] !== undefined) {
      result[key] = convertValue(ENV_FALLBACKS[key], key)
    } else {
      result[key] = DEFAULT_VALUES[key]
    }
  }

  return result as T
}

/**
 * Clear the settings cache (useful after updating settings)
 */
export function clearSettingsCache(): void {
  settingsCache = null
  cacheTimestamp = 0
}

/**
 * Check if maintenance mode is enabled
 */
export async function isMaintenanceMode(): Promise<boolean> {
  return getSetting<boolean>('maintenance_mode')
}

/**
 * Check if a feature is enabled
 */
export async function isFeatureEnabled(feature: 'referrals' | 'premium_listings' | 'sms_notifications'): Promise<boolean> {
  const key = `enable_${feature}`
  return getSetting<boolean>(key)
}

/**
 * Get rate limit for a specific action
 */
export async function getRateLimit(action: 'api' | 'auth' | 'upload' | 'email' | 'inquiry'): Promise<number> {
  const key = `rate_limit_${action}`
  return getSetting<number>(key)
}

/**
 * Get image settings
 */
export async function getImageSettings(): Promise<{
  maxImagesPerProperty: number
  maxImageSizeMB: number
  imageQuality: number
}> {
  const settings = await getSettings(['max_images_per_property', 'max_image_size_mb', 'image_quality'])
  return {
    maxImagesPerProperty: settings.max_images_per_property,
    maxImageSizeMB: settings.max_image_size_mb,
    imageQuality: settings.image_quality,
  }
}

/**
 * Get fee settings
 */
export async function getFeeSettings(): Promise<{
  buyerFeePercent: number
  sellerFeePercent: number
  premiumListingPrice: number
  referralDiscount: number
}> {
  const settings = await getSettings([
    'success_fee_buyer_percent',
    'success_fee_seller_percent',
    'premium_listing_price',
    'referral_discount'
  ])
  return {
    buyerFeePercent: settings.success_fee_buyer_percent,
    sellerFeePercent: settings.success_fee_seller_percent,
    premiumListingPrice: settings.premium_listing_price,
    referralDiscount: settings.referral_discount,
  }
}
