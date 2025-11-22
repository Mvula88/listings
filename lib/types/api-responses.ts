/**
 * API Response Types
 * Proper type definitions for all API responses and function returns
 */

// ============================================================================
// ADMIN STATS & ANALYTICS
// ============================================================================

export interface PlatformStats {
  // User metrics
  total_users: number
  new_users_week: number
  active_users_month: number

  // Property metrics
  total_properties: number
  active_properties: number
  pending_properties: number
  sold_properties: number

  // Transaction metrics
  total_transactions: number
  active_transactions: number
  completed_transactions: number
  conversion_rate: number

  // Lawyer metrics
  total_lawyers: number
  verified_lawyers: number
  active_lawyers: number

  // Inquiry metrics
  total_inquiries: number
  inquiries_week: number
  inquiries_month: number

  // Financial metrics
  avg_property_price: number
  total_platform_fees: number
  avg_days_to_close: number

  // Optional metadata
  last_updated?: string
}

export interface UserProfile {
  id: string
  full_name: string | null
  email: string
  user_type: 'buyer' | 'seller' | 'lawyer' | 'admin'
  created_at: string
  updated_at: string
  phone_number: string | null
  avatar_url: string | null
  is_suspended: boolean
  suspension_reason: string | null
  email_verified: boolean
}

export interface PropertyListing {
  id: string
  title: string
  description: string
  property_type: string
  price: number
  currency: 'ZAR' | 'NAD'
  bedrooms: number
  bathrooms: number
  size_sqm: number
  address: string
  city: string
  province: string
  country: string
  latitude: number | null
  longitude: number | null
  status: 'draft' | 'active' | 'pending' | 'sold' | 'suspended'
  seller_id: string
  created_at: string
  updated_at: string
  view_count: number
  inquiry_count: number
  favorite_count: number
  featured_until: string | null
  premium: boolean
  moderation_status: 'pending' | 'approved' | 'rejected'
}

// ============================================================================
// DATABASE QUERY RESPONSES
// ============================================================================

export interface SupabaseResponse<T> {
  data: T | null
  error: {
    message: string
    details?: string
    hint?: string
    code?: string
  } | null
}

export interface SupabaseListResponse<T> {
  data: T[] | null
  error: {
    message: string
    details?: string
    hint?: string
    code?: string
  } | null
  count?: number | null
}

// ============================================================================
// SPECIFIC QUERY RESPONSES
// ============================================================================

export interface RecentUser {
  id: string
  full_name: string | null
  email: string
  created_at: string
  user_type: string
}

export interface RecentProperty {
  id: string
  title: string
  created_at: string
  status: string
  price: number
  city: string
}

export interface PropertyWithImages {
  id: string
  title: string
  description: string
  price: number
  currency: string
  bedrooms: number
  bathrooms: number
  property_type: string
  city: string
  property_images: Array<{
    id: string
    image_url: string
    display_order: number
  }>
  seller: {
    id: string
    full_name: string | null
    email: string
  }
}

export interface TransactionDetails {
  id: string
  property_id: string
  buyer_id: string
  seller_id: string
  lawyer_id: string | null
  status: 'initiated' | 'lawyer_selected' | 'in_progress' | 'completed' | 'cancelled'
  agreed_price: number
  platform_fee: number
  created_at: string
  updated_at: string
  closing_date: string | null
  property: {
    id: string
    title: string
    address: string
  }
  buyer: UserProfile
  seller: UserProfile
  lawyer: LawyerProfile | null
}

export interface LawyerProfile {
  id: string
  user_id: string
  firm_name: string
  registration_number: string
  years_experience: number
  verified: boolean
  rating: number
  review_count: number
  cities_served: string[]
  phone_number: string
  email: string
  profile_picture_url: string | null
  bio: string | null
  created_at: string
  updated_at: string
}

// ============================================================================
// FORM SUBMISSION TYPES
// ============================================================================

export interface PropertyCreateInput {
  title: string
  description: string
  property_type: string
  price: number
  currency: 'ZAR' | 'NAD'
  bedrooms: number
  bathrooms: number
  size_sqm: number
  address: string
  city: string
  province: string
  country: string
  latitude?: number
  longitude?: number
  seller_id: string
}

export interface InquiryCreateInput {
  property_id: string
  buyer_id: string
  message: string
  phone_number?: string
  preferred_contact: 'email' | 'phone' | 'whatsapp'
}

// ============================================================================
// API ROUTE RESPONSES
// ============================================================================

export interface ApiSuccessResponse<T = unknown> {
  success: true
  data: T
  message?: string
}

export interface ApiErrorResponse {
  success: false
  error: string
  code?: string
  details?: unknown
}

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse

// ============================================================================
// HELPER TYPE GUARDS
// ============================================================================

export function isApiSuccess<T>(response: ApiResponse<T>): response is ApiSuccessResponse<T> {
  return response.success === true
}

export function isApiError(response: ApiResponse): response is ApiErrorResponse {
  return response.success === false
}

// ============================================================================
// PAGINATION TYPES
// ============================================================================

export interface PaginationParams {
  page: number
  per_page: number
  sort_by?: string
  sort_order?: 'asc' | 'desc'
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    total: number
    page: number
    per_page: number
    total_pages: number
    has_next: boolean
    has_prev: boolean
  }
}

// ============================================================================
// SEARCH & FILTER TYPES
// ============================================================================

export interface PropertySearchFilters {
  city?: string
  province?: string
  property_type?: string
  min_price?: number
  max_price?: number
  min_bedrooms?: number
  max_bedrooms?: number
  min_bathrooms?: number
  max_bathrooms?: number
  min_size_sqm?: number
  max_size_sqm?: number
}

export interface PropertySearchResults extends PaginatedResponse<PropertyListing> {
  filters_applied: PropertySearchFilters
  total_matching: number
}
