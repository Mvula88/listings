import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowRight, Building, FileText, MessageSquare, TrendingUp, Users, DollarSign, Home } from 'lucide-react'
import { AnimatedCounter } from '@/components/ui/animated-counter'
import { FadeIn } from '@/components/ui/fade-in'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single<{ full_name: string; [key: string]: any }>()

  // Get user-specific stats
  const { data: properties } = await supabase
    .from('properties')
    .select('id')
    .eq('seller_id', user.id)

  const { data: inquiries } = await supabase
    .from('inquiries')
    .select('id')
    .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)

  const { data: transactions } = await supabase
    .from('transactions')
    .select('id, status')
    .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
    .returns<Array<{ id: string; status: string }>>()

  const activeTransactions = transactions?.filter((t) => t.status !== 'completed').length || 0
  const completedTransactions = transactions?.filter((t) => t.status === 'completed').length || 0

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <FadeIn>
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-8 rounded-lg border">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Welcome back, {profile?.full_name || 'User'}! 👋
          </h1>
          <p className="text-muted-foreground text-lg">
            Here's an overview of your PropLinka activity
          </p>
        </div>
      </FadeIn>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {profile?.user_type === 'seller' && (
          <FadeIn delay={0.1}>
            <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-2 hover:border-primary/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Listed Properties
                </CardTitle>
                <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Building className="h-5 w-5 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  <AnimatedCounter value={properties?.length || 0} />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Active listings
                </p>
              </CardContent>
            </Card>
          </FadeIn>
        )}

        <FadeIn delay={profile?.user_type === 'seller' ? 0.2 : 0.1}>
          <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-2 hover:border-primary/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Inquiries
              </CardTitle>
              <div className="h-10 w-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-blue-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                <AnimatedCounter value={inquiries?.length || 0} />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Pending responses
              </p>
            </CardContent>
          </Card>
        </FadeIn>

        <FadeIn delay={profile?.user_type === 'seller' ? 0.3 : 0.2}>
          <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-2 hover:border-primary/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Deals
              </CardTitle>
              <div className="h-10 w-10 bg-orange-500/10 rounded-lg flex items-center justify-center">
                <FileText className="h-5 w-5 text-orange-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                <AnimatedCounter value={activeTransactions} />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                In progress
              </p>
            </CardContent>
          </Card>
        </FadeIn>

        <FadeIn delay={profile?.user_type === 'seller' ? 0.4 : 0.3}>
          <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-2 hover:border-primary/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Completed Deals
              </CardTitle>
              <div className="h-10 w-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-green-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                <AnimatedCounter value={completedTransactions} />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Successfully closed
              </p>
            </CardContent>
          </Card>
        </FadeIn>
      </div>

      {/* Quick Actions */}
      <FadeIn delay={0.4}>
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="text-2xl">Quick Actions</CardTitle>
            <CardDescription>
              Common tasks and actions for your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {/* List Property - Seller only */}
              {profile?.user_type === 'seller' && (
                <Link href="/properties/new">
                  <Button variant="outline" className="w-full justify-start h-auto py-4 hover:bg-primary hover:text-primary-foreground transition-all group">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary-foreground/20">
                        <Building className="h-5 w-5" />
                      </div>
                      <span className="font-medium">List New Property</span>
                    </div>
                  </Button>
                </Link>
              )}

              {/* Browse Properties */}
              <Link href="/browse">
                <Button variant="outline" className="w-full justify-start h-auto py-4 hover:bg-primary hover:text-primary-foreground transition-all group">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary-foreground/20">
                      <Home className="h-5 w-5" />
                    </div>
                    <span className="font-medium">Browse Properties</span>
                  </div>
                </Button>
              </Link>

              {profile?.user_type === 'seller' && (
                <Link href="/properties">
                  <Button variant="outline" className="w-full justify-start h-auto py-4 hover:bg-primary hover:text-primary-foreground transition-all group">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary-foreground/20">
                        <FileText className="h-5 w-5" />
                      </div>
                      <span className="font-medium">Manage Listings</span>
                    </div>
                  </Button>
                </Link>
              )}

              {profile?.user_type === 'lawyer' && (
                <>
                  <Link href="/practice">
                    <Button variant="outline" className="w-full justify-start h-auto py-4 hover:bg-primary hover:text-primary-foreground transition-all group">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary-foreground/20">
                          <Users className="h-5 w-5" />
                        </div>
                        <span className="font-medium">Manage Practice</span>
                      </div>
                    </Button>
                  </Link>
                  <Link href="/clients">
                    <Button variant="outline" className="w-full justify-start h-auto py-4 hover:bg-primary hover:text-primary-foreground transition-all group">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary-foreground/20">
                          <FileText className="h-5 w-5" />
                        </div>
                        <span className="font-medium">View Clients</span>
                      </div>
                    </Button>
                  </Link>
                </>
              )}

              <Link href="/transactions">
                <Button variant="outline" className="w-full justify-start h-auto py-4 hover:bg-primary hover:text-primary-foreground transition-all group">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary-foreground/20">
                      <DollarSign className="h-5 w-5" />
                    </div>
                    <span className="font-medium">View Transactions</span>
                  </div>
                </Button>
              </Link>

              <Link href="/messages">
                <Button variant="outline" className="w-full justify-start h-auto py-4 hover:bg-primary hover:text-primary-foreground transition-all group">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary-foreground/20">
                      <MessageSquare className="h-5 w-5" />
                    </div>
                    <span className="font-medium">Check Messages</span>
                  </div>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </FadeIn>

      {/* Recent Activity */}
      <FadeIn delay={0.5}>
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="text-2xl">Recent Activity</CardTitle>
            <CardDescription>
              Your latest interactions on PropLinka
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 border-2 rounded-lg hover:shadow-md transition-all hover:border-primary/50 group">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <MessageSquare className="h-6 w-6 text-blue-500" />
                  </div>
                  <div>
                    <p className="font-semibold">New inquiry received</p>
                    <p className="text-sm text-muted-foreground">
                      Someone is interested in your property
                    </p>
                  </div>
                </div>
                <Button size="sm" variant="ghost" className="group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  View
                  <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 border-2 rounded-lg hover:shadow-md transition-all hover:border-primary/50 group">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <FileText className="h-6 w-6 text-green-500" />
                  </div>
                  <div>
                    <p className="font-semibold">Transaction updated</p>
                    <p className="text-sm text-muted-foreground">
                      Lawyer has been assigned to your deal
                    </p>
                  </div>
                </div>
                <Button size="sm" variant="ghost" className="group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  View
                  <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </FadeIn>
    </div>
  )
}