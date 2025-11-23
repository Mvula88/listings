'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getUserRewards() {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'Not authenticated', rewards: null }
    }

    // Get user's rewards
    const { data: rewards, error } = await supabase
      .from('referral_rewards')
      .select('*')
      .eq('user_id', user.id)
      .single<{
        points: number
        lifetime_points: number
        tier: string
        free_featured_listings: number
        [key: string]: any
      }>()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw error
    }

    // If no rewards record exists, create one
    if (!rewards) {
      const { data: newRewards, error: createError } = await (supabase
        .from('referral_rewards') as any)
        .insert({
          user_id: user.id,
          points: 0,
          lifetime_points: 0,
          tier: 'bronze',
          free_featured_listings: 0,
        })
        .select()
        .single() as {
          data: {
            points: number
            lifetime_points: number
            tier: string
            free_featured_listings: number
            [key: string]: any
          } | null
          error: any
        }

      if (createError) throw createError

      return { success: true, rewards: newRewards }
    }

    return { success: true, rewards }
  } catch (error: any) {
    console.error('Error getting user rewards:', error)
    return { success: false, error: error.message, rewards: null }
  }
}

export async function getRewardTransactions(limit = 20) {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'Not authenticated', transactions: [] }
    }

    const { data: transactions, error } = await supabase
      .from('referral_transactions')
      .select(`
        *,
        related_user:profiles!related_user_id(full_name),
        related_property:properties!related_property_id(title)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error

    return { success: true, transactions: transactions || [] }
  } catch (error: any) {
    console.error('Error getting transactions:', error)
    return { success: false, error: error.message, transactions: [] }
  }
}

export async function getRewardRedemptions() {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'Not authenticated', redemptions: [] }
    }

    const { data: redemptions, error } = await supabase
      .from('reward_redemptions')
      .select(`
        *,
        property:properties!property_id(title, id)
      `)
      .eq('user_id', user.id)
      .order('redeemed_at', { ascending: false })

    if (error) throw error

    return { success: true, redemptions: redemptions || [] }
  } catch (error: any) {
    console.error('Error getting redemptions:', error)
    return { success: false, error: error.message, redemptions: [] }
  }
}

export async function redeemFeaturedListing(propertyId: string, days: number) {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Call the database function to handle redemption
    const { data, error } = await supabase.rpc('redeem_featured_listing', {
      user_id_param: user.id,
      property_id_param: propertyId,
      days,
    })

    if (error) throw error

    if (!data.success) {
      return { success: false, error: data.error || 'Redemption failed' }
    }

    revalidatePath('/rewards')
    revalidatePath('/dashboard')

    return {
      success: true,
      usedFreeListing: data.used_free_listing,
      pointsUsed: data.points_used,
    }
  } catch (error: any) {
    console.error('Error redeeming featured listing:', error)
    return { success: false, error: error.message }
  }
}

export async function getLeaderboard(limit = 10) {
  try {
    const supabase = await createClient()

    const { data: leaderboard, error } = await supabase
      .from('referral_rewards')
      .select(`
        user_id,
        lifetime_points,
        tier,
        user:profiles!user_id(full_name, avatar_url)
      `)
      .order('lifetime_points', { ascending: false })
      .limit(limit)

    if (error) throw error

    return { success: true, leaderboard: leaderboard || [] }
  } catch (error: any) {
    console.error('Error getting leaderboard:', error)
    return { success: false, error: error.message, leaderboard: [] }
  }
}

export async function getTierInfo(tier: string) {
  const tiers = {
    bronze: {
      name: 'Bronze',
      minPoints: 0,
      maxPoints: 99,
      color: '#CD7F32',
      benefits: [
        'Earn 50 points per referral',
        'Redeem points for featured listings',
        'Access to referral dashboard',
      ],
    },
    silver: {
      name: 'Silver',
      minPoints: 100,
      maxPoints: 249,
      color: '#C0C0C0',
      benefits: [
        'All Bronze benefits',
        'Free featured listing at 100 points',
        'Priority customer support',
        '10% discount on platform fees',
      ],
    },
    gold: {
      name: 'Gold',
      minPoints: 250,
      maxPoints: 499,
      color: '#FFD700',
      benefits: [
        'All Silver benefits',
        '2 free featured listings',
        '20% discount on platform fees',
        'Dedicated account manager',
        'Early access to new features',
      ],
    },
    platinum: {
      name: 'Platinum',
      minPoints: 500,
      maxPoints: Infinity,
      color: '#E5E4E2',
      benefits: [
        'All Gold benefits',
        '5 free featured listings',
        '30% discount on platform fees',
        'Premium profile badge',
        'Exclusive networking events',
        'Featured in success stories',
      ],
    },
  }

  return tiers[tier as keyof typeof tiers] || tiers.bronze
}

export async function getNextTierInfo(currentPoints: number) {
  if (currentPoints < 100) {
    return { nextTier: 'silver', pointsNeeded: 100 - currentPoints }
  } else if (currentPoints < 250) {
    return { nextTier: 'gold', pointsNeeded: 250 - currentPoints }
  } else if (currentPoints < 500) {
    return { nextTier: 'platinum', pointsNeeded: 500 - currentPoints }
  } else {
    return { nextTier: null, pointsNeeded: 0 }
  }
}
