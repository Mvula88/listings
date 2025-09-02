export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          phone: string | null
          user_type: string | null
          country_id: string | null
          created_at: string
          updated_at: string
          avatar_url: string | null
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          phone?: string | null
          user_type?: string | null
          country_id?: string | null
          created_at?: string
          updated_at?: string
          avatar_url?: string | null
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          phone?: string | null
          user_type?: string | null
          country_id?: string | null
          created_at?: string
          updated_at?: string
          avatar_url?: string | null
        }
      }
      properties: {
        Row: {
          id: string
          owner_id: string
          title: string
          description: string | null
          price: number
          property_type: string
          status: string
          bedrooms: number | null
          bathrooms: number | null
          size_sqm: number | null
          address: string
          city: string
          province: string | null
          postal_code: string | null
          country_id: string
          latitude: number | null
          longitude: number | null
          features: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          title: string
          description?: string | null
          price: number
          property_type: string
          status?: string
          bedrooms?: number | null
          bathrooms?: number | null
          size_sqm?: number | null
          address: string
          city: string
          province?: string | null
          postal_code?: string | null
          country_id: string
          latitude?: number | null
          longitude?: number | null
          features?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          title?: string
          description?: string | null
          price?: number
          property_type?: string
          status?: string
          bedrooms?: number | null
          bathrooms?: number | null
          size_sqm?: number | null
          address?: string
          city?: string
          province?: string | null
          postal_code?: string | null
          country_id?: string
          latitude?: number | null
          longitude?: number | null
          features?: string[] | null
          created_at?: string
          updated_at?: string
        }
      }
      property_images: {
        Row: {
          id: string
          property_id: string
          url: string
          is_primary: boolean
          created_at: string
        }
        Insert: {
          id?: string
          property_id: string
          url: string
          is_primary?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          property_id?: string
          url?: string
          is_primary?: boolean
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
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          property_id: string
          buyer_id: string
          seller_id: string
          message?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          property_id?: string
          buyer_id?: string
          seller_id?: string
          message?: string | null
          status?: string
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
          payment_method: string | null
          stripe_account_id: string | null
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
          payment_method?: string | null
          stripe_account_id?: string | null
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
          payment_method?: string | null
          stripe_account_id?: string | null
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
          lawyer_buyer_id: string | null
          lawyer_seller_id: string | null
          agreed_price: number | null
          status: string
          buyer_success_fee_paid: boolean
          seller_success_fee_paid: boolean
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
          lawyer_buyer_id?: string | null
          lawyer_seller_id?: string | null
          agreed_price?: number | null
          status?: string
          buyer_success_fee_paid?: boolean
          seller_success_fee_paid?: boolean
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
          lawyer_buyer_id?: string | null
          lawyer_seller_id?: string | null
          agreed_price?: number | null
          status?: string
          buyer_success_fee_paid?: boolean
          seller_success_fee_paid?: boolean
          created_at?: string
          updated_at?: string
          completed_at?: string | null
        }
      }
      payments: {
        Row: {
          id: string
          transaction_id: string
          user_id: string
          amount: number
          currency: string
          status: string
          payment_type: string
          stripe_payment_intent_id: string | null
          stripe_checkout_session_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          transaction_id: string
          user_id: string
          amount: number
          currency: string
          status?: string
          payment_type: string
          stripe_payment_intent_id?: string | null
          stripe_checkout_session_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          transaction_id?: string
          user_id?: string
          amount?: number
          currency?: string
          status?: string
          payment_type?: string
          stripe_payment_intent_id?: string | null
          stripe_checkout_session_id?: string | null
          created_at?: string
          updated_at?: string
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
      conversations: {
        Row: {
          id: string
          participants: string[]
          transaction_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          participants: string[]
          transaction_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          participants?: string[]
          transaction_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          conversation_id: string
          sender_id: string
          recipient_id: string
          content: string
          read: boolean
          transaction_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          conversation_id: string
          sender_id: string
          recipient_id: string
          content: string
          read?: boolean
          transaction_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          conversation_id?: string
          sender_id?: string
          recipient_id?: string
          content?: string
          read?: boolean
          transaction_id?: string | null
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: string
          title: string
          message: string
          data: Json | null
          read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          title: string
          message: string
          data?: Json | null
          read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
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
          document_type: string
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
          document_type: string
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
          document_type?: string
          name?: string
          url?: string
          size?: number | null
          mime_type?: string | null
          created_at?: string
        }
      }
      countries: {
        Row: {
          id: string
          name: string
          code: string
          currency: string
          success_fee: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          code: string
          currency: string
          success_fee?: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          code?: string
          currency?: string
          success_fee?: number
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}