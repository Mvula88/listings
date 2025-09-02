import { Database } from './database'

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Property = Database['public']['Tables']['properties']['Row']
export type Lawyer = Database['public']['Tables']['lawyers']['Row']
export type Transaction = Database['public']['Tables']['transactions']['Row']
export type Inquiry = Database['public']['Tables']['inquiries']['Row']
export type Payment = Database['public']['Tables']['payments']['Row']
export type Message = Database['public']['Tables']['messages']['Row']
export type Country = Database['public']['Tables']['countries']['Row']

export interface PropertyWithImages extends Property {
  property_images?: Database['public']['Tables']['property_images']['Row'][]
  country?: Country
  seller?: Profile
}

export interface TransactionWithDetails extends Transaction {
  property?: PropertyWithImages
  buyer?: Profile
  seller?: Profile
  lawyer_buyer?: Lawyer
  lawyer_seller?: Lawyer
}

export interface InquiryWithDetails extends Inquiry {
  property?: PropertyWithImages
  buyer?: Profile
  seller?: Profile
}