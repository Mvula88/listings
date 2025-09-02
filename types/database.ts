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
      countries: {
        Row: {
          id: string
          code: string
          name: string
          currency: string
          currency_symbol: string
          created_at: string
        }
        Insert: {
          id?: string
          code: string
          name: string
          currency: string
          currency_symbol: string
          created_at?: string
        }
        Update: {
          id?: string
          code?: string
          name?: string
          currency?: string
          currency_symbol?: string
          created_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          phone: string | null
          country_id: string | null
          user_type: string | null
          avatar_url: string | null
          stripe_customer_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          phone?: string | null
          country_id?: string | null
          user_type?: string | null
          avatar_url?: string | null
          stripe_customer_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          phone?: string | null
          country_id?: string | null
          user_type?: string | null
          avatar_url?: string | null
          stripe_customer_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      lawyers: {
        Row: {
          id: string
          profile_id: string | null
          firm_name: string
          registration_number: string | null
          country_id: string | null
          city: string | null
          specializations: string[] | null
          years_experience: number | null
          transactions_completed: number
          flat_fee_buyer: number | null
          flat_fee_seller: number | null
          rating: number
          verified: boolean
          available: boolean
          bio: string | null
          languages: string[] | null
          stripe_account_id: string | null
          stripe_onboarding_complete: boolean
          payment_method: string
          created_at: string
        }
        Insert: {
          id?: string
          profile_id?: string | null
          firm_name: string
          registration_number?: string | null
          country_id?: string | null
          city?: string | null
          specializations?: string[] | null
          years_experience?: number | null
          transactions_completed?: number
          flat_fee_buyer?: number | null
          flat_fee_seller?: number | null
          rating?: number
          verified?: boolean
          available?: boolean
          bio?: string | null
          languages?: string[] | null
          stripe_account_id?: string | null
          stripe_onboarding_complete?: boolean
          payment_method?: string
          created_at?: string
        }
        Update: {
          id?: string
          profile_id?: string | null
          firm_name?: string
          registration_number?: string | null
          country_id?: string | null
          city?: string | null
          specializations?: string[] | null
          years_experience?: number | null
          transactions_completed?: number
          flat_fee_buyer?: number | null
          flat_fee_seller?: number | null
          rating?: number
          verified?: boolean
          available?: boolean
          bio?: string | null
          languages?: string[] | null
          stripe_account_id?: string | null
          stripe_onboarding_complete?: boolean
          payment_method?: string
          created_at?: string
        }
      }
      properties: {
        Row: {
          id: string
          seller_id: string | null
          country_id: string | null
          title: string
          description: string | null
          property_type: string | null
          price: number
          currency: string | null
          bedrooms: number | null
          bathrooms: number | null
          square_meters: number | null
          address_line1: string | null
          address_line2: string | null
          city: string | null
          province: string | null
          postal_code: string | null
          latitude: number | null
          longitude: number | null
          status: string
          listing_type: string
          featured: boolean
          views: number
          expires_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          seller_id?: string | null
          country_id?: string | null
          title: string
          description?: string | null
          property_type?: string | null
          price: number
          currency?: string | null
          bedrooms?: number | null
          bathrooms?: number | null
          square_meters?: number | null
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          province?: string | null
          postal_code?: string | null
          latitude?: number | null
          longitude?: number | null
          status?: string
          listing_type?: string
          featured?: boolean
          views?: number
          expires_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          seller_id?: string | null
          country_id?: string | null
          title?: string
          description?: string | null
          property_type?: string | null
          price?: number
          currency?: string | null
          bedrooms?: number | null
          bathrooms?: number | null
          square_meters?: number | null
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          province?: string | null
          postal_code?: string | null
          latitude?: number | null
          longitude?: number | null
          status?: string
          listing_type?: string
          featured?: boolean
          views?: number
          expires_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      property_images: {
        Row: {
          id: string
          property_id: string | null
          url: string
          alt_text: string | null
          order_index: number
          created_at: string
        }
        Insert: {
          id?: string
          property_id?: string | null
          url: string
          alt_text?: string | null
          order_index?: number
          created_at?: string
        }
        Update: {
          id?: string
          property_id?: string | null
          url?: string
          alt_text?: string | null
          order_index?: number
          created_at?: string
        }
      }
      inquiries: {
        Row: {
          id: string
          property_id: string | null
          buyer_id: string | null
          seller_id: string | null
          message: string | null
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          property_id?: string | null
          buyer_id?: string | null
          seller_id?: string | null
          message?: string | null
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          property_id?: string | null
          buyer_id?: string | null
          seller_id?: string | null
          message?: string | null
          status?: string
          created_at?: string
        }
      }
      conversations: {
        Row: {
          id: string
          inquiry_id: string | null
          property_id: string | null
          participants: string[] | null
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          inquiry_id?: string | null
          property_id?: string | null
          participants?: string[] | null
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          inquiry_id?: string | null
          property_id?: string | null
          participants?: string[] | null
          status?: string
          created_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          inquiry_id: string | null
          property_id: string | null
          buyer_id: string | null
          seller_id: string | null
          lawyer_buyer_id: string | null
          lawyer_seller_id: string | null
          agreed_price: number | null
          status: string
          buyer_success_fee_paid: boolean
          seller_success_fee_paid: boolean
          buyer_lawyer_fee_paid: boolean
          seller_lawyer_fee_paid: boolean
          lawyers_selected_at: string | null
          completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          inquiry_id?: string | null
          property_id?: string | null
          buyer_id?: string | null
          seller_id?: string | null
          lawyer_buyer_id?: string | null
          lawyer_seller_id?: string | null
          agreed_price?: number | null
          status?: string
          buyer_success_fee_paid?: boolean
          seller_success_fee_paid?: boolean
          buyer_lawyer_fee_paid?: boolean
          seller_lawyer_fee_paid?: boolean
          lawyers_selected_at?: string | null
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          inquiry_id?: string | null
          property_id?: string | null
          buyer_id?: string | null
          seller_id?: string | null
          lawyer_buyer_id?: string | null
          lawyer_seller_id?: string | null
          agreed_price?: number | null
          status?: string
          buyer_success_fee_paid?: boolean
          seller_success_fee_paid?: boolean
          buyer_lawyer_fee_paid?: boolean
          seller_lawyer_fee_paid?: boolean
          lawyers_selected_at?: string | null
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      payments: {
        Row: {
          id: string
          transaction_id: string | null
          user_id: string | null
          lawyer_id: string | null
          type: string | null
          amount: number | null
          currency: string | null
          status: string | null
          stripe_payment_intent_id: string | null
          stripe_checkout_session_id: string | null
          stripe_invoice_id: string | null
          payment_method: string | null
          paid_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          transaction_id?: string | null
          user_id?: string | null
          lawyer_id?: string | null
          type?: string | null
          amount?: number | null
          currency?: string | null
          status?: string | null
          stripe_payment_intent_id?: string | null
          stripe_checkout_session_id?: string | null
          stripe_invoice_id?: string | null
          payment_method?: string | null
          paid_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          transaction_id?: string | null
          user_id?: string | null
          lawyer_id?: string | null
          type?: string | null
          amount?: number | null
          currency?: string | null
          status?: string | null
          stripe_payment_intent_id?: string | null
          stripe_checkout_session_id?: string | null
          stripe_invoice_id?: string | null
          payment_method?: string | null
          paid_at?: string | null
          created_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          conversation_id: string | null
          sender_id: string | null
          recipient_id: string | null
          transaction_id: string | null
          content: string
          read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          conversation_id?: string | null
          sender_id?: string | null
          recipient_id?: string | null
          transaction_id?: string | null
          content: string
          read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          conversation_id?: string | null
          sender_id?: string | null
          recipient_id?: string | null
          transaction_id?: string | null
          content?: string
          read?: boolean
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
  }
}