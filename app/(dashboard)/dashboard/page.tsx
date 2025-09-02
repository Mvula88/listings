import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowRight, Building, FileText, MessageSquare, TrendingUp, Users, DollarSign, Home } from 'lucide-react'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

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

  const activeTransactions = transactions?.filter(t => t.status !== 'completed').length || 0
  const completedTransactions = transactions?.filter(t => t.status === 'completed').length || 0

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold">
          Welcome back, {profile?.full_name || 'User'}!
        </h1>
        <p className="text-muted-foreground mt-2">
          Here's an overview of your DealDirect activity
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {profile?.user_type === 'seller' && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Listed Properties
              </CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{properties?.length || 0}</div>
              <p className="text-xs text-muted-foreground">
                Active listings
              </p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Inquiries
            </CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inquiries?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              Pending responses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Deals
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeTransactions}</div>
            <p className="text-xs text-muted-foreground">
              In progress
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Completed Deals
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedTransactions}</div>
            <p className="text-xs text-muted-foreground">
              Successfully closed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common tasks and actions for your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {profile?.user_type === 'buyer' && (
              <>
                <Link href="/browse">
                  <Button variant="outline" className="w-full justify-start">
                    <Home className="mr-2 h-4 w-4" />
                    Browse Properties
                  </Button>
                </Link>
                <Link href="/properties/saved">
                  <Button variant="outline" className="w-full justify-start">
                    <Building className="mr-2 h-4 w-4" />
                    View Saved Properties
                  </Button>
                </Link>
              </>
            )}
            
            {profile?.user_type === 'seller' && (
              <>
                <Link href="/properties/new">
                  <Button variant="outline" className="w-full justify-start">
                    <Building className="mr-2 h-4 w-4" />
                    List New Property
                  </Button>
                </Link>
                <Link href="/properties">
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="mr-2 h-4 w-4" />
                    Manage Listings
                  </Button>
                </Link>
              </>
            )}

            {profile?.user_type === 'lawyer' && (
              <>
                <Link href="/practice">
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="mr-2 h-4 w-4" />
                    Manage Practice
                  </Button>
                </Link>
                <Link href="/clients">
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="mr-2 h-4 w-4" />
                    View Clients
                  </Button>
                </Link>
              </>
            )}

            <Link href="/transactions">
              <Button variant="outline" className="w-full justify-start">
                <DollarSign className="mr-2 h-4 w-4" />
                View Transactions
              </Button>
            </Link>
            
            <Link href="/messages">
              <Button variant="outline" className="w-full justify-start">
                <MessageSquare className="mr-2 h-4 w-4" />
                Check Messages
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Your latest interactions on DealDirect
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <MessageSquare className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">New inquiry received</p>
                  <p className="text-sm text-muted-foreground">
                    Someone is interested in your property
                  </p>
                </div>
              </div>
              <Button size="sm" variant="ghost">
                View
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Transaction updated</p>
                  <p className="text-sm text-muted-foreground">
                    Lawyer has been assigned to your deal
                  </p>
                </div>
              </div>
              <Button size="sm" variant="ghost">
                View
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}