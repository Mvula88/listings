import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Trophy,
  Star,
  Gift,
  TrendingUp,
  Clock,
  CheckCircle,
  Award,
  Zap
} from 'lucide-react'
import Link from 'next/link'
import { getUserRewards, getRewardTransactions, getRewardRedemptions, getTierInfo, getNextTierInfo } from '@/lib/actions/rewards'

export const metadata = {
  title: 'Rewards | PropLinka',
  description: 'Your referral rewards and points',
}

function getTierColor(tier: string) {
  const colors = {
    bronze: 'bg-orange-600',
    silver: 'bg-gray-400',
    gold: 'bg-yellow-500',
    platinum: 'bg-purple-600',
  }
  return colors[tier as keyof typeof colors] || colors.bronze
}

function getTierGradient(tier: string) {
  const gradients = {
    bronze: 'from-orange-500 to-orange-700',
    silver: 'from-gray-300 to-gray-500',
    gold: 'from-yellow-400 to-yellow-600',
    platinum: 'from-purple-500 to-purple-700',
  }
  return gradients[tier as keyof typeof gradients] || gradients.bronze
}

export default async function RewardsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Get rewards data
  const { rewards } = await getUserRewards()
  const { transactions } = await getRewardTransactions()
  const { redemptions } = await getRewardRedemptions()

  if (!rewards) {
    return (
      <div className="container max-w-6xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Failed to load rewards data</p>
        </div>
      </div>
    )
  }

  const tierInfo = await getTierInfo(rewards.tier)
  const nextTier = await getNextTierInfo(rewards.lifetime_points)
  const progressToNextTier = nextTier.nextTier
    ? ((rewards.lifetime_points % 100) / 100) * 100
    : 100

  // Get user's referral code
  const { data: profile } = await supabase
    .from('profiles')
    .select('referral_code')
    .eq('id', user.id)
    .single()

  return (
    <div className="container max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Rewards Dashboard</h1>
        <p className="text-muted-foreground">
          Earn points by referring friends and redeem them for exclusive benefits
        </p>
      </div>

      {/* Tier Card */}
      <Card className={`mb-8 bg-gradient-to-br ${getTierGradient(rewards.tier)} text-white border-0`}>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Trophy className="h-8 w-8" />
                <h2 className="text-3xl font-bold">{tierInfo.name} Tier</h2>
              </div>
              <p className="text-white/90">
                {rewards.lifetime_points} lifetime points earned
              </p>
            </div>
            <div className="text-right">
              <div className="text-5xl font-bold">{rewards.points}</div>
              <p className="text-white/90">Available Points</p>
            </div>
          </div>

          {/* Progress to Next Tier */}
          {nextTier.nextTier && (
            <div className="bg-white/20 rounded-lg p-4 backdrop-blur">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">
                  Progress to {nextTier.nextTier.charAt(0).toUpperCase() + nextTier.nextTier.slice(1)}
                </span>
                <span className="text-sm font-medium">
                  {nextTier.pointsNeeded} points to go
                </span>
              </div>
              <Progress value={progressToNextTier} className="h-2 bg-white/30" />
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {/* Points Balance */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Points Balance</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rewards.points}</div>
            <p className="text-xs text-muted-foreground">
              Redeemable points
            </p>
          </CardContent>
        </Card>

        {/* Free Listings */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Free Listings</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rewards.free_featured_listings}</div>
            <p className="text-xs text-muted-foreground">
              Featured listing credits
            </p>
          </CardContent>
        </Card>

        {/* Lifetime Points */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lifetime Points</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rewards.lifetime_points}</div>
            <p className="text-xs text-muted-foreground">
              Total points earned
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tier Benefits */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Your {tierInfo.name} Benefits
          </CardTitle>
          <CardDescription>
            Perks and privileges available at your current tier
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-3">
            {tierInfo.benefits.map((benefit, index) => (
              <div key={index} className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm">{benefit}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Earn More Points</CardTitle>
            <CardDescription>
              Refer friends to earn 50 points per successful referral
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/referrals">
              <Button className="w-full">
                <Zap className="h-4 w-4 mr-2" />
                Go to Referrals
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Redeem Points</CardTitle>
            <CardDescription>
              Use your points for featured listings and more
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/properties">
              <Button variant="outline" className="w-full">
                <Gift className="h-4 w-4 mr-2" />
                Browse Properties
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for History */}
      <Tabs defaultValue="transactions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="transactions">Transaction History</TabsTrigger>
          <TabsTrigger value="redemptions">Redemptions</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Points History</CardTitle>
              <CardDescription>
                Track all your points earned and spent
              </CardDescription>
            </CardHeader>
            <CardContent>
              {transactions.length > 0 ? (
                <div className="space-y-3">
                  {transactions.map((transaction: any) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge
                            variant={
                              transaction.type === 'earned'
                                ? 'default'
                                : transaction.type === 'bonus'
                                ? 'secondary'
                                : 'outline'
                            }
                          >
                            {transaction.type}
                          </Badge>
                          <span className="font-medium">{transaction.reason}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>
                            {new Date(transaction.created_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </span>
                        </div>
                      </div>
                      <div
                        className={`text-lg font-bold ${
                          transaction.points > 0 ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {transaction.points > 0 ? '+' : ''}
                        {transaction.points}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No transactions yet</p>
                  <p className="text-sm mt-2">
                    Start referring friends to earn points!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="redemptions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Reward Redemptions</CardTitle>
              <CardDescription>
                View all your redeemed rewards and their status
              </CardDescription>
            </CardHeader>
            <CardContent>
              {redemptions.length > 0 ? (
                <div className="space-y-3">
                  {redemptions.map((redemption: any) => (
                    <div
                      key={redemption.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge
                            variant={
                              redemption.status === 'active'
                                ? 'default'
                                : redemption.status === 'used'
                                ? 'secondary'
                                : 'outline'
                            }
                          >
                            {redemption.status}
                          </Badge>
                          <span className="font-medium capitalize">
                            {redemption.reward_type.replace('_', ' ')}
                          </span>
                        </div>
                        {redemption.property && (
                          <p className="text-sm text-muted-foreground">
                            {redemption.property.title}
                          </p>
                        )}
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                          <Clock className="h-3 w-3" />
                          <span>
                            Redeemed:{' '}
                            {new Date(redemption.redeemed_at).toLocaleDateString()}
                          </span>
                          {redemption.expires_at && (
                            <span>
                              • Expires:{' '}
                              {new Date(redemption.expires_at).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-lg font-bold text-muted-foreground">
                        {redemption.points_cost > 0
                          ? `${redemption.points_cost} pts`
                          : 'Free'}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No redemptions yet</p>
                  <p className="text-sm mt-2">
                    Use your points to get featured listings!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
