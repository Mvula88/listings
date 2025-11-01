// ============================================================================
// EXTENDED DATABASE TYPES - New Features (Migration 005)
// ============================================================================
// Last updated: 2025-11-01
// Migration: 005_feature_enhancements.sql applied
// ============================================================================

import type { Database } from './database'

// ============================================================================
// NEW ENUMS (from migration 005)
// ============================================================================

export type ReviewerRole = 'buyer' | 'seller'
export type ReferralStatus = 'pending' | 'registered' | 'completed' | 'expired'
export type ReferralType = 'buyer' | 'seller' | 'lawyer'
export type VerificationType = 'email' | 'phone' | 'title_deed' | 'ownership_proof' | 'site_visit'
export type VerificationStatus = 'pending' | 'verified' | 'rejected'
export type VerificationLevel = 'none' | 'basic' | 'standard' | 'premium'
export type EmailStatus = 'pending' | 'sent' | 'failed' | 'bounced'
export type AlertFrequency = 'instant' | 'daily' | 'weekly'

// ============================================================================
// EXTENDED DATABASE INTERFACE
// ============================================================================

export interface DatabaseExtended extends Database {
  public: Database['public'] & {
    Tables: Database['public']['Tables'] & {
      // ========================================
      // PROPERTY ANALYTICS & VIEWS
      // ========================================
      property_views: {
        Row: {
          id: string
          property_id: string
          viewer_id: string | null
          ip_address: string | null
          user_agent: string | null
          referrer: string | null
          viewed_at: string
          session_id: string | null
          duration_seconds: number
        }
        Insert: {
          id?: string
          property_id: string
          viewer_id?: string | null
          ip_address?: string | null
          user_agent?: string | null
          referrer?: string | null
          viewed_at?: string
          session_id?: string | null
          duration_seconds?: number
        }
        Update: {
          id?: string
          property_id?: string
          viewer_id?: string | null
          ip_address?: string | null
          user_agent?: string | null
          referrer?: string | null
          viewed_at?: string
          session_id?: string | null
          duration_seconds?: number
        }
      }

      // ========================================
      // LAWYER REVIEWS & RATINGS
      // ========================================
      lawyer_reviews: {
        Row: {
          id: string
          lawyer_id: string
          transaction_id: string
          reviewer_id: string
          reviewer_role: ReviewerRole
          rating: number
          review_text: string | null
          communication_rating: number | null
          professionalism_rating: number | null
          efficiency_rating: number | null
          would_recommend: boolean
          response: string | null
          response_at: string | null
          is_verified: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          lawyer_id: string
          transaction_id: string
          reviewer_id: string
          reviewer_role: ReviewerRole
          rating: number
          review_text?: string | null
          communication_rating?: number | null
          professionalism_rating?: number | null
          efficiency_rating?: number | null
          would_recommend?: boolean
          response?: string | null
          response_at?: string | null
          is_verified?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          lawyer_id?: string
          transaction_id?: string
          reviewer_id?: string
          reviewer_role?: ReviewerRole
          rating?: number
          review_text?: string | null
          communication_rating?: number | null
          professionalism_rating?: number | null
          efficiency_rating?: number | null
          would_recommend?: boolean
          response?: string | null
          response_at?: string | null
          is_verified?: boolean
          created_at?: string
          updated_at?: string
        }
      }

      // ========================================
      // SAVED SEARCHES & ALERTS
      // ========================================
      saved_searches: {
        Row: {
          id: string
          user_id: string
          name: string
          search_criteria: Record<string, any>
          email_alerts: boolean
          sms_alerts: boolean
          alert_frequency: AlertFrequency
          last_alerted_at: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          search_criteria: Record<string, any>
          email_alerts?: boolean
          sms_alerts?: boolean
          alert_frequency?: AlertFrequency
          last_alerted_at?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          search_criteria?: Record<string, any>
          email_alerts?: boolean
          sms_alerts?: boolean
          alert_frequency?: AlertFrequency
          last_alerted_at?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }

      search_alert_history: {
        Row: {
          id: string
          saved_search_id: string
          property_id: string
          alerted_at: string
        }
        Insert: {
          id?: string
          saved_search_id: string
          property_id: string
          alerted_at?: string
        }
        Update: {
          id?: string
          saved_search_id?: string
          property_id?: string
          alerted_at?: string
        }
      }

      // ========================================
      // FAVORITES & COMPARISONS
      // ========================================
      favorite_properties: {
        Row: {
          id: string
          user_id: string
          property_id: string
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          property_id: string
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          property_id?: string
          notes?: string | null
          created_at?: string
        }
      }

      property_comparisons: {
        Row: {
          id: string
          user_id: string
          property_ids: string[]
          name: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          property_ids: string[]
          name?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          property_ids?: string[]
          name?: string | null
          created_at?: string
          updated_at?: string
        }
      }

      // ========================================
      // REFERRAL PROGRAM
      // ========================================
      referrals: {
        Row: {
          id: string
          referrer_id: string
          referee_id: string | null
          referral_code: string
          referee_email: string | null
          referee_phone: string | null
          status: ReferralStatus
          referral_type: ReferralType
          transaction_id: string | null
          discount_amount: number
          discount_applied_referrer: boolean
          discount_applied_referee: boolean
          expires_at: string | null
          completed_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          referrer_id: string
          referee_id?: string | null
          referral_code: string
          referee_email?: string | null
          referee_phone?: string | null
          status?: ReferralStatus
          referral_type: ReferralType
          transaction_id?: string | null
          discount_amount?: number
          discount_applied_referrer?: boolean
          discount_applied_referee?: boolean
          expires_at?: string | null
          completed_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          referrer_id?: string
          referee_id?: string | null
          referral_code?: string
          referee_email?: string | null
          referee_phone?: string | null
          status?: ReferralStatus
          referral_type?: ReferralType
          transaction_id?: string | null
          discount_amount?: number
          discount_applied_referrer?: boolean
          discount_applied_referee?: boolean
          expires_at?: string | null
          completed_at?: string | null
          created_at?: string
        }
      }

      // ========================================
      // PROPERTY VERIFICATION
      // ========================================
      property_verifications: {
        Row: {
          id: string
          property_id: string
          seller_id: string
          verification_type: VerificationType
          status: VerificationStatus
          document_url: string | null
          notes: string | null
          verified_by: string | null
          verified_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          property_id: string
          seller_id: string
          verification_type: VerificationType
          status?: VerificationStatus
          document_url?: string | null
          notes?: string | null
          verified_by?: string | null
          verified_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          property_id?: string
          seller_id?: string
          verification_type?: VerificationType
          status?: VerificationStatus
          document_url?: string | null
          notes?: string | null
          verified_by?: string | null
          verified_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }

      // ========================================
      // NOTIFICATION PREFERENCES
      // ========================================
      notification_preferences: {
        Row: {
          id: string
          user_id: string
          email_inquiries: boolean
          email_messages: boolean
          email_transactions: boolean
          email_marketing: boolean
          email_weekly_digest: boolean
          sms_inquiries: boolean
          sms_transactions: boolean
          sms_marketing: boolean
          push_enabled: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          email_inquiries?: boolean
          email_messages?: boolean
          email_transactions?: boolean
          email_marketing?: boolean
          email_weekly_digest?: boolean
          sms_inquiries?: boolean
          sms_transactions?: boolean
          sms_marketing?: boolean
          push_enabled?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          email_inquiries?: boolean
          email_messages?: boolean
          email_transactions?: boolean
          email_marketing?: boolean
          email_weekly_digest?: boolean
          sms_inquiries?: boolean
          sms_transactions?: boolean
          sms_marketing?: boolean
          push_enabled?: boolean
          created_at?: string
          updated_at?: string
        }
      }

      // ========================================
      // EMAIL QUEUE
      // ========================================
      email_queue: {
        Row: {
          id: string
          recipient_id: string | null
          recipient_email: string
          email_type: string
          subject: string
          template_name: string
          template_data: Record<string, any> | null
          status: EmailStatus
          sent_at: string | null
          error_message: string | null
          attempts: number
          max_attempts: number
          scheduled_for: string | null
          created_at: string
        }
        Insert: {
          id?: string
          recipient_id?: string | null
          recipient_email: string
          email_type: string
          subject: string
          template_name: string
          template_data?: Record<string, any> | null
          status?: EmailStatus
          sent_at?: string | null
          error_message?: string | null
          attempts?: number
          max_attempts?: number
          scheduled_for?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          recipient_id?: string | null
          recipient_email?: string
          email_type?: string
          subject?: string
          template_name?: string
          template_data?: Record<string, any> | null
          status?: EmailStatus
          sent_at?: string | null
          error_message?: string | null
          attempts?: number
          max_attempts?: number
          scheduled_for?: string | null
          created_at?: string
        }
      }

      // ========================================
      // PLATFORM SETTINGS
      // ========================================
      platform_settings: {
        Row: {
          key: string
          value: Record<string, any>
          description: string | null
          updated_by: string | null
          updated_at: string
        }
        Insert: {
          key: string
          value: Record<string, any>
          description?: string | null
          updated_by?: string | null
          updated_at?: string
        }
        Update: {
          key?: string
          value?: Record<string, any>
          description?: string | null
          updated_by?: string | null
          updated_at?: string
        }
      }
    }

    // Extended Enums
    Enums: Database['public']['Enums'] & {
      reviewer_role: ReviewerRole
      referral_status: ReferralStatus
      referral_type: ReferralType
      verification_type: VerificationType
      verification_status: VerificationStatus
      verification_level: VerificationLevel
      email_status: EmailStatus
      alert_frequency: AlertFrequency
    }
  }
}

// ============================================================================
// EXTENDED PROFILES TYPE (with new referral fields)
// ============================================================================

export interface ProfileExtended {
  id: string
  email: string
  full_name: string | null
  phone: string | null
  user_type: string | null
  country_id: string | null
  avatar_url: string | null
  referral_code: string | null
  referrals_made: number
  referrals_completed: number
  referral_earnings: number
  created_at: string
  updated_at: string
}

// ============================================================================
// EXTENDED PROPERTIES TYPE (with new analytics fields)
// ============================================================================

export interface PropertyExtended {
  id: string
  seller_id: string
  title: string
  description: string | null
  price: number
  property_type: string
  status: string
  bedrooms: number | null
  bathrooms: number | null
  square_meters: number | null
  address_line1: string
  address_line2: string | null
  city: string
  province: string | null
  postal_code: string | null
  country_id: string
  latitude: number | null
  longitude: number | null
  features: string[] | null
  views: number
  featured: boolean
  // New analytics fields
  view_count: number
  inquiry_count: number
  save_count: number
  share_count: number
  last_viewed_at: string | null
  is_featured: boolean
  featured_until: string | null
  is_premium: boolean
  premium_until: string | null
  is_verified: boolean
  verification_level: VerificationLevel
  verified_at: string | null
  created_at: string
  updated_at: string
}

// ============================================================================
// EXTENDED LAWYERS TYPE (with new review aggregation fields)
// ============================================================================

export interface LawyerExtended {
  id: string
  profile_id: string
  firm_name: string
  registration_number: string
  years_experience: number
  specializations: string[] | null
  languages: string[] | null
  bio: string | null
  flat_fee_buyer: number | null
  flat_fee_seller: number | null
  available: boolean
  verified: boolean
  // New review aggregation fields
  average_rating: number
  review_count: number
  communication_score: number
  professionalism_score: number
  efficiency_score: number
  recommendation_rate: number
  created_at: string
  updated_at: string
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

// Helper to get table types from extended database
export type TablesExtended = DatabaseExtended['public']['Tables']
export type TableExtended<T extends keyof TablesExtended> = TablesExtended[T]['Row']
export type TableInsertExtended<T extends keyof TablesExtended> = TablesExtended[T]['Insert']
export type TableUpdateExtended<T extends keyof TablesExtended> = TablesExtended[T]['Update']

// Specific table types for convenience
export type PropertyView = TableExtended<'property_views'>
export type LawyerReview = TableExtended<'lawyer_reviews'>
export type SavedSearch = TableExtended<'saved_searches'>
export type SearchAlertHistory = TableExtended<'search_alert_history'>
export type FavoriteProperty = TableExtended<'favorite_properties'>
export type PropertyComparison = TableExtended<'property_comparisons'>
export type Referral = TableExtended<'referrals'>
export type PropertyVerification = TableExtended<'property_verifications'>
export type NotificationPreference = TableExtended<'notification_preferences'>
export type EmailQueue = TableExtended<'email_queue'>
export type PlatformSetting = TableExtended<'platform_settings'>

// ============================================================================
// DOMAIN MODELS WITH RELATIONS
// ============================================================================

export interface LawyerReviewWithRelations extends LawyerReview {
  reviewer: ProfileExtended
  lawyer: LawyerExtended
}

export interface SavedSearchWithCount extends SavedSearch {
  match_count?: number
}

export interface ReferralWithProfiles extends Referral {
  referrer: ProfileExtended
  referee?: ProfileExtended | null
}

export interface PropertyViewsAnalytics {
  property_id: string
  total_views: number
  unique_visitors: number
  average_duration: number
  views_by_date: Array<{
    date: string
    count: number
  }>
  top_referrers: Array<{
    referrer: string
    count: number
  }>
}

export interface LawyerPerformanceMetrics extends LawyerExtended {
  total_deals: number
  completed_deals: number
  average_deal_duration_days: number
  total_fees_collected: number
  pending_remittances: number
}
