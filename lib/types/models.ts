// ============================================================================
// DOMAIN MODELS - Application-level type definitions
// ============================================================================
// These types represent the business domain and may include computed fields,
// relations, and transformed data not present in the raw database schema
// ============================================================================

import type { Tables, Enums } from './database'

// ============================================================================
// USER & PROFILE TYPES
// ============================================================================

export interface User {
  id: string
  email: string
  fullName: string | null
  phone: string | null
  userType: Enums<'user_type'> | null
  countryId: string | null
  avatarUrl: string | null
  createdAt: Date
  updatedAt: Date
}

export interface Profile extends Tables<'profiles'> {
  country?: Country
}

// ============================================================================
// COUNTRY TYPES
// ============================================================================

export interface Country extends Tables<'countries'> {}

// ============================================================================
// PROPERTY TYPES
// ============================================================================

export interface Property extends Tables<'properties'> {
  property_images?: PropertyImage[]
  seller?: Profile
  country?: Country
}

export interface PropertyImage extends Tables<'property_images'> {}

export interface PropertyWithDetails extends Property {
  property_images: PropertyImage[]
  seller: Profile
  country: Country
}

export interface PropertyFilters {
  minPrice?: number
  maxPrice?: number
  propertyType?: Enums<'property_type'>[]
  bedrooms?: number
  bathrooms?: number
  city?: string
  province?: string
  countryId?: string
}

// ============================================================================
// INQUIRY TYPES
// ============================================================================

export interface Inquiry extends Tables<'inquiries'> {
  property?: Property
  buyer?: Profile
  seller?: Profile
}

export interface InquiryWithRelations extends Inquiry {
  property: Property
  buyer: Profile
  seller: Profile
}

// ============================================================================
// LAWYER TYPES
// ============================================================================

export interface Lawyer extends Tables<'lawyers'> {
  profile?: Profile
  country?: Country
  reviews?: LawyerReview[]
}

export interface LawyerWithDetails extends Lawyer {
  profile: Profile
  country: Country
  reviews: LawyerReview[]
}

export interface LawyerReview extends Tables<'lawyer_reviews'> {
  reviewer?: Profile
  lawyer?: Lawyer
}

// ============================================================================
// TRANSACTION TYPES
// ============================================================================

export interface Transaction extends Tables<'transactions'> {
  property?: Property
  buyer?: Profile
  seller?: Profile
  buyer_lawyer?: Lawyer
  seller_lawyer?: Lawyer
  inquiry?: Inquiry
}

export interface TransactionWithDetails extends Transaction {
  property: PropertyWithDetails
  buyer: Profile
  seller: Profile
  buyer_lawyer: Lawyer | null
  seller_lawyer: Lawyer | null
}

export interface DealClosureInput {
  settlementReference: string
  dealClosedDate: string
  feeCollected: boolean
  notes?: string
}

// ============================================================================
// FEE & REMITTANCE TYPES
// ============================================================================

export interface FeeRemittance extends Tables<'fee_remittances'> {
  transaction?: Transaction
  lawyer?: Lawyer
  verified_by_profile?: Profile
}

export interface LawyerReconciliationReport extends Tables<'lawyer_reconciliation_reports'> {
  lawyer?: Lawyer
  verified_by_profile?: Profile
}

export interface RemittanceSubmission {
  transactionIds: string[]
  remittanceDate: string
  remittanceReference: string
  proofOfPaymentUrl?: string
  notes?: string
}

// ============================================================================
// MESSAGING TYPES
// ============================================================================

export interface Conversation extends Tables<'conversations'> {
  messages?: Message[]
  property?: Property
  inquiry?: Inquiry
}

export interface Message extends Tables<'messages'> {
  sender?: Profile
  conversation?: Conversation
}

export interface ConversationWithDetails extends Conversation {
  messages: Message[]
  participants_data: Profile[]
  unread_count: number
  last_message?: Message
}

// ============================================================================
// NOTIFICATION TYPES
// ============================================================================

export interface Notification extends Tables<'notifications'> {
  user?: Profile
}

// ============================================================================
// DOCUMENT TYPES
// ============================================================================

export interface Document extends Tables<'documents'> {
  transaction?: Transaction
  uploader?: Profile
}

// ============================================================================
// SAVINGS CALCULATOR TYPES
// ============================================================================

export interface SavingsCalculation {
  propertyPrice: number
  traditionalAgentFee: number
  platformFee: number
  totalSavings: number
  savingsPercentage: number
  buyerAgentFee: number
  sellerAgentFee: number
  currency: string
  currencySymbol: string
}

export interface FormattedSavings {
  propertyPrice: string
  traditionalAgentFee: string
  platformFee: string
  totalSavings: string
  savingsPercentage: string
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: unknown
  }
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    pageSize: number
    totalCount: number
    totalPages: number
    hasMore: boolean
  }
}

// ============================================================================
// FORM TYPES
// ============================================================================

export interface LoginFormData {
  email: string
  password: string
}

export interface RegisterFormData {
  email: string
  password: string
  fullName: string
  phone: string
  userType: Enums<'user_type'>
  countryId: string
}

export interface PropertyFormData {
  title: string
  description: string
  price: number
  propertyType: Enums<'property_type'>
  bedrooms: number
  bathrooms: number
  squareMeters: number
  addressLine1: string
  addressLine2?: string
  city: string
  province: string
  postalCode: string
  countryId: string
  latitude?: number
  longitude?: number
  features?: string[]
}

export interface InquiryFormData {
  propertyId: string
  message: string
}

export interface LawyerOnboardingFormData {
  firmName: string
  registrationNumber: string
  countryId: string
  city: string
  yearsExperience: number
  flatFeeBuyer: number
  flatFeeSeller: number
  bio: string
  languages: string[]
  specializations: string[]
}

// ============================================================================
// FILTER & SORT TYPES
// ============================================================================

export type SortDirection = 'asc' | 'desc'

export interface SortConfig {
  field: string
  direction: SortDirection
}

export interface PaginationConfig {
  page: number
  pageSize: number
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type Awaited<T> = T extends Promise<infer U> ? U : T

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>
