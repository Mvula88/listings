'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function submitReview(data: {
  propertyId: string
  rating: number
  title: string
  review: string
}) {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'You must be logged in to submit a review' }
    }

    // Check if user already reviewed this property
    const { data: existingReview } = await supabase
      .from('property_reviews')
      .select('id')
      .eq('property_id', data.propertyId)
      .eq('user_id', user.id)
      .single()

    if (existingReview) {
      return { success: false, error: 'You have already reviewed this property' }
    }

    // Check if user has a transaction with this property (for verified purchase badge)
    const { data: transaction } = await supabase
      .from('transactions')
      .select('id')
      .eq('property_id', data.propertyId)
      .eq('buyer_id', user.id)
      .in('status', ['completed', 'lawyers_selected'])
      .single()

    // Submit review
    const { error } = await (supabase
      .from('property_reviews') as any)
      .insert({
        property_id: data.propertyId,
        user_id: user.id,
        rating: data.rating,
        title: data.title,
        review: data.review,
        verified_purchase: !!transaction,
        status: 'approved', // Auto-approve for now, can change to 'pending' for moderation
      })

    if (error) throw error

    revalidatePath(`/properties/${data.propertyId}`)
    revalidatePath('/properties')

    return { success: true }
  } catch (error: any) {
    console.error('Error submitting review:', error)
    return { success: false, error: error.message }
  }
}

export async function getPropertyReviews(propertyId: string) {
  try {
    const supabase = await createClient()

    const { data: reviews, error } = await supabase
      .from('property_reviews')
      .select(`
        *,
        user:profiles!user_id(full_name, avatar_url)
      `)
      .eq('property_id', propertyId)
      .eq('status', 'approved')
      .order('created_at', { ascending: false })

    if (error) {
      // If table doesn't exist, return empty reviews silently
      if (error.code === 'PGRST205' || error.code === 'PGRST204') {
        return { success: true, reviews: [] }
      }
      throw error
    }

    return { success: true, reviews: reviews || [] }
  } catch (error: any) {
    // Don't log error if table doesn't exist
    if (error.code !== 'PGRST205' && error.code !== 'PGRST204') {
      console.error('Error fetching reviews:', error)
    }
    return { success: false, error: error.message, reviews: [] }
  }
}

export async function checkUserReview(propertyId: string) {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { hasReviewed: false }

    const { data: review } = await supabase
      .from('property_reviews')
      .select('id, rating, title, review, status')
      .eq('property_id', propertyId)
      .eq('user_id', user.id)
      .single()

    return { hasReviewed: !!review, review }
  } catch (error) {
    return { hasReviewed: false }
  }
}

export async function markReviewHelpful(reviewId: string, helpful: boolean) {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'You must be logged in' }
    }

    if (helpful) {
      // Add helpful mark
      const { error } = await supabase
        .from('review_helpfulness')
        .insert({ review_id: reviewId, user_id: user.id })

      if (error && error.code !== '23505') { // Ignore duplicate key error
        throw error
      }
    } else {
      // Remove helpful mark
      await supabase
        .from('review_helpfulness')
        .delete()
        .eq('review_id', reviewId)
        .eq('user_id', user.id)
    }

    return { success: true }
  } catch (error: any) {
    console.error('Error marking review helpful:', error)
    return { success: false, error: error.message }
  }
}

export async function deleteReview(reviewId: string) {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'You must be logged in' }
    }

    const { error } = await supabase
      .from('property_reviews')
      .delete()
      .eq('id', reviewId)
      .eq('user_id', user.id)

    if (error) throw error

    return { success: true }
  } catch (error: any) {
    console.error('Error deleting review:', error)
    return { success: false, error: error.message }
  }
}
