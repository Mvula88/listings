import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Trophy, Medal, Award, TrendingUp } from 'lucide-react'
import Image from 'next/image'
import { getLeaderboard } from '@/lib/actions/rewards'

export const metadata = {
  title: 'Referral Leaderboard | DealDirect',
  description: 'Top referrers on DealDirect',
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

function getRankIcon(rank: number) {
  if (rank === 1) return <Trophy className="h-6 w-6 text-yellow-500" />
  if (rank === 2) return <Medal className="h-6 w-6 text-gray-400" />
  if (rank === 3) return <Award className="h-6 w-6 text-orange-600" />
  return null
}

export default async function LeaderboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  // Get leaderboard
  const { leaderboard } = await getLeaderboard(50)

  // Get current user's rank if logged in
  let userRank = null
  if (user) {
    const userIndex = leaderboard.findIndex((entry: any) => entry.user_id === user.id)
    if (userIndex !== -1) {
      userRank = {
        rank: userIndex + 1,
        ...leaderboard[userIndex],
      }
    }
  }

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Trophy className="h-10 w-10 text-yellow-500" />
          <h1 className="text-4xl font-bold">Referral Leaderboard</h1>
        </div>
        <p className="text-xl text-muted-foreground">
          Celebrating our top referrers and community champions
        </p>
      </div>

      {/* User's Rank Card (if logged in) */}
      {userRank && (
        <Card className="mb-8 bg-gradient-to-br from-blue-500 to-blue-700 text-white border-0">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-5xl font-bold">#{userRank.rank}</div>
                <div>
                  <p className="text-sm text-white/80">Your Rank</p>
                  <p className="text-2xl font-bold">{userRank.lifetime_points} points</p>
                  <Badge className={`${getTierColor(userRank.tier)} text-white mt-2`}>
                    {userRank.tier.toUpperCase()}
                  </Badge>
                </div>
              </div>
              <TrendingUp className="h-12 w-12 text-white/50" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top 3 Podium */}
      {leaderboard.length >= 3 && (
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* 2nd Place */}
          <div className="md:order-1 order-2">
            <Card className="border-2 border-gray-400">
              <CardContent className="pt-6 text-center">
                <div className="flex justify-center mb-3">
                  <Medal className="h-12 w-12 text-gray-400" />
                </div>
                <div className="text-4xl font-bold mb-2">2</div>
                {leaderboard[1].user.avatar_url ? (
                  <Image
                    src={leaderboard[1].user.avatar_url}
                    alt={leaderboard[1].user.full_name}
                    width={80}
                    height={80}
                    className="rounded-full mx-auto mb-3"
                  />
                ) : (
                  <div className="h-20 w-20 rounded-full bg-muted mx-auto mb-3 flex items-center justify-center">
                    <span className="text-2xl font-bold">
                      {leaderboard[1].user.full_name.charAt(0)}
                    </span>
                  </div>
                )}
                <p className="font-semibold mb-1">{leaderboard[1].user.full_name}</p>
                <p className="text-2xl font-bold text-gray-600 mb-2">
                  {leaderboard[1].lifetime_points}
                </p>
                <Badge className={`${getTierColor(leaderboard[1].tier)} text-white`}>
                  {leaderboard[1].tier.toUpperCase()}
                </Badge>
              </CardContent>
            </Card>
          </div>

          {/* 1st Place */}
          <div className="md:order-2 order-1">
            <Card className="border-4 border-yellow-500 transform md:scale-110">
              <CardContent className="pt-6 text-center">
                <div className="flex justify-center mb-3">
                  <Trophy className="h-16 w-16 text-yellow-500" />
                </div>
                <div className="text-5xl font-bold mb-2">1</div>
                {leaderboard[0].user.avatar_url ? (
                  <Image
                    src={leaderboard[0].user.avatar_url}
                    alt={leaderboard[0].user.full_name}
                    width={100}
                    height={100}
                    className="rounded-full mx-auto mb-3 border-4 border-yellow-500"
                  />
                ) : (
                  <div className="h-24 w-24 rounded-full bg-muted mx-auto mb-3 flex items-center justify-center border-4 border-yellow-500">
                    <span className="text-3xl font-bold">
                      {leaderboard[0].user.full_name.charAt(0)}
                    </span>
                  </div>
                )}
                <p className="font-semibold text-lg mb-1">{leaderboard[0].user.full_name}</p>
                <p className="text-3xl font-bold text-yellow-600 mb-2">
                  {leaderboard[0].lifetime_points}
                </p>
                <Badge className={`${getTierColor(leaderboard[0].tier)} text-white`}>
                  {leaderboard[0].tier.toUpperCase()}
                </Badge>
              </CardContent>
            </Card>
          </div>

          {/* 3rd Place */}
          <div className="md:order-3 order-3">
            <Card className="border-2 border-orange-600">
              <CardContent className="pt-6 text-center">
                <div className="flex justify-center mb-3">
                  <Award className="h-12 w-12 text-orange-600" />
                </div>
                <div className="text-4xl font-bold mb-2">3</div>
                {leaderboard[2].user.avatar_url ? (
                  <Image
                    src={leaderboard[2].user.avatar_url}
                    alt={leaderboard[2].user.full_name}
                    width={80}
                    height={80}
                    className="rounded-full mx-auto mb-3"
                  />
                ) : (
                  <div className="h-20 w-20 rounded-full bg-muted mx-auto mb-3 flex items-center justify-center">
                    <span className="text-2xl font-bold">
                      {leaderboard[2].user.full_name.charAt(0)}
                    </span>
                  </div>
                )}
                <p className="font-semibold mb-1">{leaderboard[2].user.full_name}</p>
                <p className="text-2xl font-bold text-orange-600 mb-2">
                  {leaderboard[2].lifetime_points}
                </p>
                <Badge className={`${getTierColor(leaderboard[2].tier)} text-white`}>
                  {leaderboard[2].tier.toUpperCase()}
                </Badge>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Full Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle>All Rankings</CardTitle>
          <CardDescription>
            Complete leaderboard of all referrers
          </CardDescription>
        </CardHeader>
        <CardContent>
          {leaderboard.length > 0 ? (
            <div className="space-y-2">
              {leaderboard.map((entry: any, index: number) => {
                const rank = index + 1
                const isCurrentUser = user && entry.user_id === user.id

                return (
                  <div
                    key={entry.user_id}
                    className={`flex items-center gap-4 p-4 rounded-lg transition-colors ${
                      isCurrentUser
                        ? 'bg-blue-50 border-2 border-blue-500'
                        : rank <= 3
                        ? 'bg-muted/50'
                        : 'hover:bg-muted/30'
                    }`}
                  >
                    {/* Rank */}
                    <div className="w-12 text-center">
                      {getRankIcon(rank) || (
                        <span className="text-xl font-bold text-muted-foreground">
                          {rank}
                        </span>
                      )}
                    </div>

                    {/* Avatar */}
                    {entry.user.avatar_url ? (
                      <Image
                        src={entry.user.avatar_url}
                        alt={entry.user.full_name}
                        width={48}
                        height={48}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                        <span className="font-bold">
                          {entry.user.full_name.charAt(0)}
                        </span>
                      </div>
                    )}

                    {/* Name and Tier */}
                    <div className="flex-1">
                      <p className="font-semibold">
                        {entry.user.full_name}
                        {isCurrentUser && (
                          <Badge variant="secondary" className="ml-2">
                            You
                          </Badge>
                        )}
                      </p>
                      <Badge className={`${getTierColor(entry.tier)} text-white text-xs`}>
                        {entry.tier.toUpperCase()}
                      </Badge>
                    </div>

                    {/* Points */}
                    <div className="text-right">
                      <p className="text-2xl font-bold">{entry.lifetime_points}</p>
                      <p className="text-xs text-muted-foreground">points</p>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No entries yet. Be the first to start referring!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
