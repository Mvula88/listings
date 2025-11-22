import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Users, Gift, Copy, Check, TrendingUp, DollarSign, Trophy, Award } from 'lucide-react'
import { CopyReferralButton } from '@/components/referrals/copy-referral-button'
import { getUserRewards } from '@/lib/actions/rewards'
import Link from 'next/link'

export const metadata = {
  title: 'Referral Program | PropLinka',
  description: 'Refer friends and earn rewards',
}

export default async function ReferralsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get user profile with referral code
  const { data: profile } = await supabase
    .from('profiles')
    .select('*, referred_by_profile:profiles!referred_by(full_name, email)')
    .eq('id', user.id)
    .single<{ referral_code: string; referred_by?: string; [key: string]: any }>()

  // Get referrals made by this user
  const { data: referrals, count: referralCount } = await supabase
    .from('profiles')
    .select('id, full_name, email, user_type, created_at', { count: 'exact' })
    .eq('referred_by', user.id)
    .order('created_at', { ascending: false })

  // Get rewards data
  const { rewards } = await getUserRewards()

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const referralLink = `${baseUrl}/register?ref=${profile?.referral_code}`

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Referral Program</h1>
        <p className="text-muted-foreground mt-2">
          Invite friends and earn rewards together
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Referrals</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{referralCount || 0}</div>
            <p className="text-xs text-muted-foreground">
              Friends you've referred
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reward Points</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rewards?.points || 0}</div>
            <p className="text-xs text-muted-foreground">
              {rewards?.lifetime_points || 0} lifetime points earned
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Referral Tier</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">
              {rewards?.tier || 'Bronze'}
            </div>
            <p className="text-xs text-muted-foreground">
              {rewards?.free_featured_listings || 0} free listings available
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Your Referral Code */}
      <Card>
        <CardHeader>
          <CardTitle>Your Referral Link</CardTitle>
          <CardDescription>
            Share this link with friends to earn rewards
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={referralLink}
              readOnly
              className="font-mono text-sm"
            />
            <CopyReferralButton referralLink={referralLink} />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">How it works:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>1. Share your unique referral link with friends</li>
              <li>2. They sign up using your link</li>
              <li>3. Both of you get benefits when they complete their first transaction</li>
              <li>4. Earn more rewards as you refer more people</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Quick Links */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Rewards Dashboard
            </CardTitle>
            <CardDescription>
              View your points, tier benefits, and transaction history
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/rewards">
              <Button className="w-full">
                <Trophy className="h-4 w-4 mr-2" />
                View Rewards
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Leaderboard
            </CardTitle>
            <CardDescription>
              See where you rank among top referrers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/leaderboard">
              <Button variant="outline" className="w-full">
                <TrendingUp className="h-4 w-4 mr-2" />
                View Leaderboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Referral Benefits */}
      <Card>
        <CardHeader>
          <CardTitle>Referral Benefits</CardTitle>
          <CardDescription>
            What you and your friends get
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="border rounded-lg p-4">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Gift className="h-5 w-5 text-primary" />
                For You
              </h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• 50 points per successful referral</li>
                <li>• Free featured listings at milestones</li>
                <li>• Tiered benefits (Bronze to Platinum)</li>
                <li>• Platform fee discounts</li>
              </ul>
            </div>
            <div className="border rounded-lg p-4">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                For Your Friend
              </h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Welcome bonus on signup</li>
                <li>• Faster listing approval</li>
                <li>• Premium support for 30 days</li>
                <li>• Access to exclusive properties</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Who Referred You */}
      {profile?.referred_by && (
        <Card>
          <CardHeader>
            <CardTitle>You Were Referred By</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold">{profile.referred_by_profile?.full_name || 'Unknown'}</p>
                <p className="text-sm text-muted-foreground">
                  {profile.referred_by_profile?.email}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Referrals List */}
      {referrals && referrals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your Referrals</CardTitle>
            <CardDescription>
              People who signed up using your link
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {referrals.map((referral: any) => (
                <div
                  key={referral.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                      <Users className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">{referral.full_name || 'User'}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(referral.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Badge variant={referral.user_type === 'seller' ? 'default' : 'secondary'}>
                    {referral.user_type}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
