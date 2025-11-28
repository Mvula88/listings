// ============================================================================
// DATABASE TYPES - Auto-generated from Supabase schema with latest migrations
// ============================================================================
// Last updated: 2025-10-19
// Migration: 003_lawyer_fee_collection_model.sql applied
// ============================================================================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// ============================================================================
// ENUMS
// ============================================================================

export type UserType = 'buyer' | 'seller' | 'lawyer' | 'admin'
export type PropertyType = 'house' | 'apartment' | 'townhouse' | 'land' | 'commercial' | 'farm'
export type PropertyStatus = 'draft' | 'active' | 'pending' | 'sold' | 'withdrawn'
export type ModerationStatus = 'pending' | 'approved' | 'rejected' | 'flagged'
export type ModerationAction = 'approved' | 'rejected' | 'flagged' | 'unflagged'
export type InquiryStatus = 'new' | 'responded' | 'proceeded_to_transaction' | 'declined' | 'closed'
export type TransactionStatus = 'initiated' | 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'failed'
export type ConversationStatus = 'active' | 'archived' | 'closed'
export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded'
export type PaymentType = 'platform_fee' | 'lawyer_fee' | 'success_fee'
export type NotificationType = 'inquiry' | 'message' | 'transaction' | 'payment' | 'system'
export type DocumentType = 'title_deed' | 'id_document' | 'proof_of_address' | 'contract' | 'other'
export type AdminRole = 'super_admin' | 'admin' | 'moderator'
export type RewardTier = 'bronze' | 'silver' | 'gold' | 'platinum'
export type ReferralTransactionType = 'referral_signup' | 'referral_listing' | 'referral_transaction' | 'redemption'

// ============================================================================
// DATABASE TABLES
// ============================================================================

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          phone: string | null
          user_type: UserType | null
          country_id: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          phone?: string | null
          user_type?: UserType | null
          country_id?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          phone?: string | null
          user_type?: UserType | null
          country_id?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      countries: {
        Row: {
          id: string
          name: string
          code: string
          currency: string
          currency_symbol: string
          agent_commission_rate: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          code: string
          currency: string
          currency_symbol: string
          agent_commission_rate?: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          code?: string
          currency?: string
          currency_symbol?: string
          agent_commission_rate?: number
          created_at?: string
        }
      }
      properties: {
        Row: {
          id: string
          seller_id: string
          title: string
          description: string | null
          price: number
          property_type: PropertyType
          status: PropertyStatus
          moderation_status: ModerationStatus | null
          moderation_notes: string | null
          moderated_by: string | null
          moderated_at: string | null
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
          featured_until: string | null
          premium: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          seller_id: string
          title: string
          description?: string | null
          price: number
          property_type: PropertyType
          status?: PropertyStatus
          moderation_status?: ModerationStatus | null
          moderation_notes?: string | null
          moderated_by?: string | null
          moderated_at?: string | null
          bedrooms?: number | null
          bathrooms?: number | null
          square_meters?: number | null
          address_line1: string
          address_line2?: string | null
          city: string
          province?: string | null
          postal_code?: string | null
          country_id: string
          latitude?: number | null
          longitude?: number | null
          features?: string[] | null
          views?: number
          featured?: boolean
          featured_until?: string | null
          premium?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          seller_id?: string
          title?: string
          description?: string | null
          price?: number
          property_type?: PropertyType
          status?: PropertyStatus
          moderation_status?: ModerationStatus | null
          moderation_notes?: string | null
          moderated_by?: string | null
          moderated_at?: string | null
          bedrooms?: number | null
          bathrooms?: number | null
          square_meters?: number | null
          address_line1?: string
          address_line2?: string | null
          city?: string
          province?: string | null
          postal_code?: string | null
          country_id?: string
          latitude?: number | null
          longitude?: number | null
          features?: string[] | null
          views?: number
          featured?: boolean
          featured_until?: string | null
          premium?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      property_images: {
        Row: {
          id: string
          property_id: string
          url: string
          alt_text: string | null
          order_index: number
          created_at: string
        }
        Insert: {
          id?: string
          property_id: string
          url: string
          alt_text?: string | null
          order_index?: number
          created_at?: string
        }
        Update: {
          id?: string
          property_id?: string
          url?: string
          alt_text?: string | null
          order_index?: number
          created_at?: string
        }
      }
      property_favorites: {
        Row: {
          id: string
          user_id: string
          property_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          property_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          property_id?: string
          created_at?: string
        }
      }
      inquiries: {
        Row: {
          id: string
          property_id: string
          buyer_id: string
          seller_id: string
          message: string | null
          status: InquiryStatus
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          property_id: string
          buyer_id: string
          seller_id: string
          message?: string | null
          status?: InquiryStatus
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          property_id?: string
          buyer_id?: string
          seller_id?: string
          message?: string | null
          status?: InquiryStatus
          created_at?: string
          updated_at?: string
        }
      }
      lawyers: {
        Row: {
          id: string
          profile_id: string
          firm_name: string
          registration_number: string
          country_id: string
          city: string | null
          years_experience: number | null
          flat_fee_buyer: number | null
          flat_fee_seller: number | null
          bio: string | null
          languages: string[] | null
          specializations: string[] | null
          rating: number | null
          reviews_count: number
          verified: boolean
          available: boolean
          remittance_status: string
          suspended_for_non_payment: boolean
          suspension_date: string | null
          last_remittance_date: string | null
          total_outstanding_fees: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          firm_name: string
          registration_number: string
          country_id: string
          city?: string | null
          years_experience?: number | null
          flat_fee_buyer?: number | null
          flat_fee_seller?: number | null
          bio?: string | null
          languages?: string[] | null
          specializations?: string[] | null
          rating?: number | null
          reviews_count?: number
          verified?: boolean
          available?: boolean
          remittance_status?: string
          suspended_for_non_payment?: boolean
          suspension_date?: string | null
          last_remittance_date?: string | null
          total_outstanding_fees?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          firm_name?: string
          registration_number?: string
          country_id?: string
          city?: string | null
          years_experience?: number | null
          flat_fee_buyer?: number | null
          flat_fee_seller?: number | null
          bio?: string | null
          languages?: string[] | null
          specializations?: string[] | null
          rating?: number | null
          reviews_count?: number
          verified?: boolean
          available?: boolean
          remittance_status?: string
          suspended_for_non_payment?: boolean
          suspension_date?: string | null
          last_remittance_date?: string | null
          total_outstanding_fees?: number
          created_at?: string
          updated_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          inquiry_id: string | null
          property_id: string
          buyer_id: string
          seller_id: string
          buyer_lawyer_id: string | null
          seller_lawyer_id: string | null
          agreed_price: number | null
          platform_fee_amount: number | null
          lawyer_commission_amount: number | null
          lawyer_commission_paid: boolean
          lawyer_commission_paid_at: string | null
          status: TransactionStatus
          deal_closed_at: string | null
          deal_closed_by: string | null
          settlement_reference: string | null
          fee_collected: boolean
          fee_remitted: boolean
          fee_remitted_at: string | null
          remittance_due_date: string | null
          remittance_overdue: boolean
          remittance_reminder_sent_at: string | null
          created_at: string
          updated_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          inquiry_id?: string | null
          property_id: string
          buyer_id: string
          seller_id: string
          buyer_lawyer_id?: string | null
          seller_lawyer_id?: string | null
          agreed_price?: number | null
          platform_fee_amount?: number | null
          lawyer_commission_amount?: number | null
          lawyer_commission_paid?: boolean
          lawyer_commission_paid_at?: string | null
          status?: TransactionStatus
          deal_closed_at?: string | null
          deal_closed_by?: string | null
          settlement_reference?: string | null
          fee_collected?: boolean
          fee_remitted?: boolean
          fee_remitted_at?: string | null
          remittance_due_date?: string | null
          remittance_overdue?: boolean
          remittance_reminder_sent_at?: string | null
          created_at?: string
          updated_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          inquiry_id?: string | null
          property_id?: string
          buyer_id?: string
          seller_id?: string
          buyer_lawyer_id?: string | null
          seller_lawyer_id?: string | null
          agreed_price?: number | null
          platform_fee_amount?: number | null
          lawyer_commission_amount?: number | null
          lawyer_commission_paid?: boolean
          lawyer_commission_paid_at?: string | null
          status?: TransactionStatus
          deal_closed_at?: string | null
          deal_closed_by?: string | null
          settlement_reference?: string | null
          fee_collected?: boolean
          fee_remitted?: boolean
          fee_remitted_at?: string | null
          remittance_due_date?: string | null
          remittance_overdue?: boolean
          remittance_reminder_sent_at?: string | null
          created_at?: string
          updated_at?: string
          completed_at?: string | null
        }
      }
      fee_remittances: {
        Row: {
          id: string
          transaction_id: string
          lawyer_id: string
          platform_fee_amount: number
          lawyer_commission_amount: number | null
          net_remittance_amount: number | null
          remittance_date: string
          remittance_reference: string | null
          proof_of_payment_url: string | null
          notes: string | null
          verified: boolean
          verified_by: string | null
          verified_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          transaction_id: string
          lawyer_id: string
          platform_fee_amount: number
          lawyer_commission_amount?: number | null
          net_remittance_amount?: number | null
          remittance_date: string
          remittance_reference?: string | null
          proof_of_payment_url?: string | null
          notes?: string | null
          verified?: boolean
          verified_by?: string | null
          verified_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          transaction_id?: string
          lawyer_id?: string
          platform_fee_amount?: number
          lawyer_commission_amount?: number | null
          net_remittance_amount?: number | null
          remittance_date?: string
          remittance_reference?: string | null
          proof_of_payment_url?: string | null
          notes?: string | null
          verified?: boolean
          verified_by?: string | null
          verified_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      lawyer_reconciliation_reports: {
        Row: {
          id: string
          lawyer_id: string
          reporting_period_start: string
          reporting_period_end: string
          total_deals_closed: number
          total_fees_collected: number
          total_fees_remitted: number
          total_commission_earned: number
          outstanding_balance: number
          report_submitted_at: string | null
          verified: boolean
          verified_by: string | null
          verified_at: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          lawyer_id: string
          reporting_period_start: string
          reporting_period_end: string
          total_deals_closed?: number
          total_fees_collected?: number
          total_fees_remitted?: number
          total_commission_earned?: number
          outstanding_balance?: number
          report_submitted_at?: string | null
          verified?: boolean
          verified_by?: string | null
          verified_at?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          lawyer_id?: string
          reporting_period_start?: string
          reporting_period_end?: string
          total_deals_closed?: number
          total_fees_collected?: number
          total_fees_remitted?: number
          total_commission_earned?: number
          outstanding_balance?: number
          report_submitted_at?: string | null
          verified?: boolean
          verified_by?: string | null
          verified_at?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      conversations: {
        Row: {
          id: string
          inquiry_id: string | null
          property_id: string | null
          participants: string[]
          status: ConversationStatus
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          inquiry_id?: string | null
          property_id?: string | null
          participants: string[]
          status?: ConversationStatus
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          inquiry_id?: string | null
          property_id?: string | null
          participants?: string[]
          status?: ConversationStatus
          created_at?: string
          updated_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          conversation_id: string
          sender_id: string
          content: string
          read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          conversation_id: string
          sender_id: string
          content: string
          read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          conversation_id?: string
          sender_id?: string
          content?: string
          read?: boolean
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: NotificationType
          title: string
          message: string
          data: Json | null
          read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: NotificationType
          title: string
          message: string
          data?: Json | null
          read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: NotificationType
          title?: string
          message?: string
          data?: Json | null
          read?: boolean
          created_at?: string
        }
      }
      documents: {
        Row: {
          id: string
          transaction_id: string
          uploaded_by: string
          document_type: DocumentType
          name: string
          url: string
          size: number | null
          mime_type: string | null
          created_at: string
        }
        Insert: {
          id?: string
          transaction_id: string
          uploaded_by: string
          document_type: DocumentType
          name: string
          url: string
          size?: number | null
          mime_type?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          transaction_id?: string
          uploaded_by?: string
          document_type?: DocumentType
          name?: string
          url?: string
          size?: number | null
          mime_type?: string | null
          created_at?: string
        }
      }
      lawyer_reviews: {
        Row: {
          id: string
          lawyer_id: string
          transaction_id: string
          reviewer_id: string
          rating: number
          comment: string | null
          created_at: string
        }
        Insert: {
          id?: string
          lawyer_id: string
          transaction_id: string
          reviewer_id: string
          rating: number
          comment?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          lawyer_id?: string
          transaction_id?: string
          reviewer_id?: string
          rating?: number
          comment?: string | null
          created_at?: string
        }
      }
      audit_logs: {
        Row: {
          id: string
          user_id: string | null
          action: string
          entity_type: string | null
          entity_id: string | null
          old_data: Json | null
          new_data: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          action: string
          entity_type?: string | null
          entity_id?: string | null
          old_data?: Json | null
          new_data?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          action?: string
          entity_type?: string | null
          entity_id?: string | null
          old_data?: Json | null
          new_data?: Json | null
          created_at?: string
        }
      }
      admin_profiles: {
        Row: {
          id: string
          role: AdminRole
          is_active: boolean
          last_active: string | null
          status: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          role?: AdminRole
          is_active?: boolean
          last_active?: string | null
          status?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          role?: AdminRole
          is_active?: boolean
          last_active?: string | null
          status?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      moderator_invitations: {
        Row: {
          id: string
          email: string
          invited_by: string
          token: string
          expires_at: string
          accepted_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          invited_by: string
          token: string
          expires_at: string
          accepted_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          invited_by?: string
          token?: string
          expires_at?: string
          accepted_at?: string | null
          created_at?: string
        }
      }
      property_reviews: {
        Row: {
          id: string
          property_id: string
          reviewer_id: string
          action: ModerationAction
          reason: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          property_id: string
          reviewer_id: string
          action: ModerationAction
          reason?: string | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          property_id?: string
          reviewer_id?: string
          action?: ModerationAction
          reason?: string | null
          notes?: string | null
          created_at?: string
        }
      }
      saved_properties: {
        Row: {
          id: string
          user_id: string
          property_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          property_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          property_id?: string
          created_at?: string
        }
      }
      referral_rewards: {
        Row: {
          id: string
          user_id: string
          points: number
          lifetime_points: number
          tier: RewardTier
          free_featured_listings: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          points?: number
          lifetime_points?: number
          tier?: RewardTier
          free_featured_listings?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          points?: number
          lifetime_points?: number
          tier?: RewardTier
          free_featured_listings?: number
          created_at?: string
          updated_at?: string
        }
      }
      referral_transactions: {
        Row: {
          id: string
          user_id: string
          transaction_type: ReferralTransactionType
          points_earned: number
          related_user_id: string | null
          related_property_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          transaction_type: ReferralTransactionType
          points_earned: number
          related_user_id?: string | null
          related_property_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          transaction_type?: ReferralTransactionType
          points_earned?: number
          related_user_id?: string | null
          related_property_id?: string | null
          created_at?: string
        }
      }
      user_notifications: {
        Row: {
          id: string
          user_id: string
          type: string
          title: string
          message: string
          read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          title: string
          message: string
          read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          title?: string
          message?: string
          read?: boolean
          created_at?: string
        }
      }
      user_roles: {
        Row: {
          id: string
          user_id: string
          role: UserType
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          role: UserType
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          role?: UserType
          is_active?: boolean
          created_at?: string
        }
      }
      property_views: {
        Row: {
          id: string
          property_id: string
          viewer_id: string | null
          session_id: string | null
          viewed_at: string
        }
        Insert: {
          id?: string
          property_id: string
          viewer_id?: string | null
          session_id?: string | null
          viewed_at?: string
        }
        Update: {
          id?: string
          property_id?: string
          viewer_id?: string | null
          session_id?: string | null
          viewed_at?: string
        }
      }
      payments: {
        Row: {
          id: string
          transaction_id: string | null
          user_id: string
          lawyer_id: string | null
          type: PaymentType
          amount: number
          currency: string
          status: PaymentStatus
          stripe_payment_intent_id: string | null
          stripe_invoice_id: string | null
          paid_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          transaction_id?: string | null
          user_id: string
          lawyer_id?: string | null
          type: PaymentType
          amount: number
          currency?: string
          status?: PaymentStatus
          stripe_payment_intent_id?: string | null
          stripe_invoice_id?: string | null
          paid_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          transaction_id?: string | null
          user_id?: string
          lawyer_id?: string | null
          type?: PaymentType
          amount?: number
          currency?: string
          status?: PaymentStatus
          stripe_payment_intent_id?: string | null
          stripe_invoice_id?: string | null
          paid_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      blog_posts: {
        Row: {
          id: string
          slug: string
          title: string
          excerpt: string | null
          content: string
          author_id: string
          published: boolean
          featured_image: string | null
          tags: string[] | null
          created_at: string
          updated_at: string
          published_at: string | null
        }
        Insert: {
          id?: string
          slug: string
          title: string
          excerpt?: string | null
          content: string
          author_id: string
          published?: boolean
          featured_image?: string | null
          tags?: string[] | null
          created_at?: string
          updated_at?: string
          published_at?: string | null
        }
        Update: {
          id?: string
          slug?: string
          title?: string
          excerpt?: string | null
          content?: string
          author_id?: string
          published?: boolean
          featured_image?: string | null
          tags?: string[] | null
          created_at?: string
          updated_at?: string
          published_at?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_platform_fee: {
        Args: { property_price: number }
        Returns: number
      }
    }
    Enums: {
      user_type: UserType
      property_type: PropertyType
      property_status: PropertyStatus
      moderation_status: ModerationStatus
      moderation_action: ModerationAction
      inquiry_status: InquiryStatus
      transaction_status: TransactionStatus
      conversation_status: ConversationStatus
      payment_status: PaymentStatus
      payment_type: PaymentType
      notification_type: NotificationType
      document_type: DocumentType
      admin_role: AdminRole
      reward_tier: RewardTier
      referral_transaction_type: ReferralTransactionType
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]
