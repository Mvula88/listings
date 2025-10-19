// ============================================================================
// ZOD VALIDATION SCHEMAS
// ============================================================================
// Comprehensive form validation schemas using Zod
// Usage: const result = loginSchema.safeParse(formData)
// ============================================================================

import { z } from 'zod'

// ============================================================================
// AUTHENTICATION SCHEMAS
// ============================================================================

export const loginSchema = z.object({
  email: z.string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password is too long'),
})

export const registerSchema = z.object({
  email: z.string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password is too long')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string()
    .min(1, 'Please confirm your password'),
  fullName: z.string()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name is too long'),
  phone: z.string()
    .min(10, 'Please enter a valid phone number')
    .max(20, 'Phone number is too long')
    .regex(/^[0-9+\-\s()]+$/, 'Please enter a valid phone number'),
  userType: z.enum(['buyer', 'seller', 'lawyer'], {
    required_error: 'Please select your account type',
  }),
  countryId: z.string()
    .min(1, 'Please select your country'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

// ============================================================================
// PROPERTY SCHEMAS
// ============================================================================

export const propertySchema = z.object({
  title: z.string()
    .min(10, 'Title must be at least 10 characters')
    .max(200, 'Title is too long'),
  description: z.string()
    .min(50, 'Description must be at least 50 characters')
    .max(5000, 'Description is too long'),
  price: z.number()
    .positive('Price must be greater than 0')
    .min(10000, 'Price seems too low')
    .max(1000000000, 'Price exceeds maximum value'),
  propertyType: z.enum(['house', 'apartment', 'townhouse', 'land', 'commercial', 'farm'], {
    required_error: 'Please select a property type',
  }),
  bedrooms: z.number()
    .int('Bedrooms must be a whole number')
    .min(0, 'Bedrooms cannot be negative')
    .max(50, 'Bedrooms value seems too high'),
  bathrooms: z.number()
    .int('Bathrooms must be a whole number')
    .min(0, 'Bathrooms cannot be negative')
    .max(50, 'Bathrooms value seems too high'),
  squareMeters: z.number()
    .positive('Square meters must be greater than 0')
    .min(10, 'Square meters seems too small')
    .max(1000000, 'Square meters exceeds maximum value'),
  addressLine1: z.string()
    .min(5, 'Address must be at least 5 characters')
    .max(200, 'Address is too long'),
  addressLine2: z.string()
    .max(200, 'Address is too long')
    .optional(),
  city: z.string()
    .min(2, 'City must be at least 2 characters')
    .max(100, 'City name is too long'),
  province: z.string()
    .min(2, 'Province must be at least 2 characters')
    .max(100, 'Province name is too long'),
  postalCode: z.string()
    .min(3, 'Postal code must be at least 3 characters')
    .max(20, 'Postal code is too long'),
  countryId: z.string()
    .min(1, 'Please select a country'),
  latitude: z.number()
    .min(-90, 'Invalid latitude')
    .max(90, 'Invalid latitude')
    .optional(),
  longitude: z.number()
    .min(-180, 'Invalid longitude')
    .max(180, 'Invalid longitude')
    .optional(),
  features: z.array(z.string()).optional(),
})

// ============================================================================
// INQUIRY SCHEMAS
// ============================================================================

export const inquirySchema = z.object({
  propertyId: z.string()
    .min(1, 'Property ID is required'),
  message: z.string()
    .min(10, 'Message must be at least 10 characters')
    .max(1000, 'Message is too long'),
})

// ============================================================================
// LAWYER SCHEMAS
// ============================================================================

export const lawyerOnboardingSchema = z.object({
  firmName: z.string()
    .min(2, 'Firm name must be at least 2 characters')
    .max(200, 'Firm name is too long'),
  registrationNumber: z.string()
    .min(3, 'Registration number must be at least 3 characters')
    .max(50, 'Registration number is too long'),
  countryId: z.string()
    .min(1, 'Please select a country'),
  city: z.string()
    .min(2, 'City must be at least 2 characters')
    .max(100, 'City name is too long'),
  yearsExperience: z.number()
    .int('Years of experience must be a whole number')
    .min(0, 'Years of experience cannot be negative')
    .max(70, 'Years of experience seems too high'),
  flatFeeBuyer: z.number()
    .positive('Buyer fee must be greater than 0')
    .min(1000, 'Buyer fee seems too low')
    .max(1000000, 'Buyer fee exceeds maximum value'),
  flatFeeSeller: z.number()
    .positive('Seller fee must be greater than 0')
    .min(1000, 'Seller fee seems too low')
    .max(1000000, 'Seller fee exceeds maximum value'),
  bio: z.string()
    .min(50, 'Bio must be at least 50 characters')
    .max(2000, 'Bio is too long'),
  languages: z.array(z.string())
    .min(1, 'Please select at least one language'),
  specializations: z.array(z.string())
    .min(1, 'Please select at least one specialization'),
})

// ============================================================================
// TRANSACTION SCHEMAS
// ============================================================================

export const dealClosureSchema = z.object({
  settlementReference: z.string()
    .min(3, 'Settlement reference must be at least 3 characters')
    .max(100, 'Settlement reference is too long'),
  dealClosedDate: z.string()
    .min(1, 'Please select the deal closure date')
    .refine((date) => {
      const selectedDate = new Date(date)
      const now = new Date()
      return selectedDate <= now
    }, 'Deal closure date cannot be in the future'),
  feeCollected: z.boolean({
    required_error: 'Please confirm if platform fee was collected',
  }),
  notes: z.string()
    .max(1000, 'Notes are too long')
    .optional(),
})

export const feeRemittanceSchema = z.object({
  transactionIds: z.array(z.string())
    .min(1, 'Please select at least one transaction'),
  remittanceDate: z.string()
    .min(1, 'Please select the remittance date')
    .refine((date) => {
      const selectedDate = new Date(date)
      const now = new Date()
      return selectedDate <= now
    }, 'Remittance date cannot be in the future'),
  remittanceReference: z.string()
    .min(3, 'Remittance reference must be at least 3 characters')
    .max(100, 'Remittance reference is too long'),
  proofOfPaymentUrl: z.string()
    .url('Please enter a valid URL')
    .optional(),
  notes: z.string()
    .max(1000, 'Notes are too long')
    .optional(),
})

// ============================================================================
// MESSAGE SCHEMAS
// ============================================================================

export const messageSchema = z.object({
  conversationId: z.string()
    .min(1, 'Conversation ID is required'),
  content: z.string()
    .min(1, 'Message cannot be empty')
    .max(5000, 'Message is too long'),
})

// ============================================================================
// FILTER SCHEMAS
// ============================================================================

export const propertyFiltersSchema = z.object({
  minPrice: z.number()
    .positive('Minimum price must be greater than 0')
    .optional(),
  maxPrice: z.number()
    .positive('Maximum price must be greater than 0')
    .optional(),
  propertyType: z.array(z.enum(['house', 'apartment', 'townhouse', 'land', 'commercial', 'farm']))
    .optional(),
  bedrooms: z.number()
    .int('Bedrooms must be a whole number')
    .min(0, 'Bedrooms cannot be negative')
    .optional(),
  bathrooms: z.number()
    .int('Bathrooms must be a whole number')
    .min(0, 'Bathrooms cannot be negative')
    .optional(),
  city: z.string()
    .max(100, 'City name is too long')
    .optional(),
  province: z.string()
    .max(100, 'Province name is too long')
    .optional(),
  countryId: z.string()
    .optional(),
}).refine((data) => {
  if (data.minPrice && data.maxPrice) {
    return data.minPrice <= data.maxPrice
  }
  return true
}, {
  message: 'Minimum price must be less than or equal to maximum price',
  path: ['maxPrice'],
})

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type LoginFormData = z.infer<typeof loginSchema>
export type RegisterFormData = z.infer<typeof registerSchema>
export type PropertyFormData = z.infer<typeof propertySchema>
export type InquiryFormData = z.infer<typeof inquirySchema>
export type LawyerOnboardingFormData = z.infer<typeof lawyerOnboardingSchema>
export type DealClosureFormData = z.infer<typeof dealClosureSchema>
export type FeeRemittanceFormData = z.infer<typeof feeRemittanceSchema>
export type MessageFormData = z.infer<typeof messageSchema>
export type PropertyFiltersData = z.infer<typeof propertyFiltersSchema>
