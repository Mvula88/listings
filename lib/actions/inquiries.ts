'use server'

import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const inquirySchema = z.object({
  property_id: z.string().uuid('Invalid property ID'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  phone_number: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Valid phone number is required'),
  preferred_contact: z.enum(['email', 'phone', 'whatsapp']),
})

type InquiryData = z.infer<typeof inquirySchema>

interface SubmitInquiryResult {
  success: boolean
  data?: {
    inquiry_id: string
  }
  error?: string
}

export async function submitInquiry(data: InquiryData): Promise<SubmitInquiryResult> {
  try {
    // Validate input
    const validatedData = inquirySchema.parse(data)

    const supabase = await createClient()

    // 1. Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return {
        success: false,
        error: 'Authentication required. Please log in to submit an inquiry.',
      }
    }

    // 2. Verify property exists
    const { data: property, error: propertyError } = await (supabase
      .from('properties') as any)
      .select('id, owner_id, title')
      .eq('id', validatedData.property_id)
      .single()

    if (propertyError || !property) {
      return {
        success: false,
        error: 'Property not found.',
      }
    }

    // 3. Prevent sellers from inquiring on their own properties
    if (property.owner_id === user.id) {
      return {
        success: false,
        error: 'You cannot inquire about your own property.',
      }
    }

    // 4. Check for rate limiting (prevent duplicate inquiries within 24 hours)
    const oneDayAgo = new Date()
    oneDayAgo.setDate(oneDayAgo.getDate() - 1)

    const { data: recentInquiry } = await (supabase
      .from('inquiries') as any)
      .select('id')
      .eq('property_id', validatedData.property_id)
      .eq('buyer_id', user.id)
      .gte('created_at', oneDayAgo.toISOString())
      .maybeSingle()

    if (recentInquiry) {
      return {
        success: false,
        error: 'You have already submitted an inquiry for this property recently. Please wait 24 hours before submitting another.',
      }
    }

    // 5. Create inquiry
    const { data: inquiry, error: inquiryError } = await (supabase
      .from('inquiries') as any)
      .insert([{
        property_id: validatedData.property_id,
        buyer_id: user.id,
        message: validatedData.message,
        phone_number: validatedData.phone_number,
        preferred_contact: validatedData.preferred_contact,
        status: 'pending',
      }])
      .select('id')
      .single()

    if (inquiryError || !inquiry) {
      console.error('Failed to create inquiry:', inquiryError)
      return {
        success: false,
        error: 'Failed to submit inquiry. Please try again.',
      }
    }

    // 6. Get owner details for email notification
    const { data: owner } = await (supabase
      .from('profiles') as any)
      .select('email, full_name')
      .eq('id', property.owner_id)
      .single()

    // 7. Send email notification to property owner (fire and forget)
    if (owner?.email) {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/email/inquiry-notification`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: owner.email,
            ownerName: owner.full_name,
            propertyTitle: property.title,
            buyerMessage: validatedData.message,
            buyerPhone: validatedData.phone_number,
            preferredContact: validatedData.preferred_contact,
            inquiryId: inquiry.id,
          }),
        })
      } catch (emailError) {
        // Don't fail the inquiry if email fails
        console.error('Failed to send email notification:', emailError)
      }
    }

    return {
      success: true,
      data: {
        inquiry_id: inquiry.id,
      },
    }
  } catch (error: any) {
    console.error('Submit inquiry error:', error)

    if (error instanceof z.ZodError) {
      const firstError = error.issues?.[0]
      if (firstError) {
        return {
          success: false,
          error: firstError.message,
        }
      }
      return {
        success: false,
        error: 'Validation failed. Please check your input.',
      }
    }

    return {
      success: false,
      error: 'An unexpected error occurred. Please try again.',
    }
  }
}

export async function getInquiriesForBuyer(userId: string) {
  const supabase = await createClient()

  const { data, error } = await (supabase
    .from('inquiries') as any)
    .select(`
      *,
      property:properties(
        id,
        title,
        price,
        currency,
        location,
        images:property_images(image_url)
      )
    `)
    .eq('buyer_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Failed to fetch buyer inquiries:', error)
    return []
  }

  return data || []
}

export async function getInquiriesForSeller(userId: string) {
  const supabase = await createClient()

  const { data, error } = await (supabase
    .from('inquiries') as any)
    .select(`
      *,
      buyer:profiles!inquiries_buyer_id_fkey(
        id,
        full_name,
        email
      ),
      property:properties(
        id,
        title,
        price,
        currency
      )
    `)
    .eq('property.owner_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Failed to fetch seller inquiries:', error)
    return []
  }

  return data || []
}

export async function markInquiryAsRead(inquiryId: string, userId: string) {
  const supabase = await createClient()

  // Verify the inquiry belongs to a property owned by this user
  const { data: inquiry } = await supabase
    .from('inquiries')
    .select('id, property:properties(owner_id)')
    .eq('id', inquiryId)
    .single() as {
      data: {
        id: string
        property: { owner_id: string } | null
      } | null
      error: any
    }

  if (!inquiry || inquiry.property?.owner_id !== userId) {
    return {
      success: false,
      error: 'Unauthorized',
    }
  }

  const { error } = await (supabase
    .from('inquiries') as any)
    .update({ status: 'read', read_at: new Date().toISOString() })
    .eq('id', inquiryId)

  if (error) {
    return {
      success: false,
      error: 'Failed to mark inquiry as read',
    }
  }

  return { success: true }
}
