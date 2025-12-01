import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  ArrowRight,
  Building,
  FileText,
  MessageSquare,
  TrendingUp,
  Users,
  DollarSign,
  Home,
  Heart,
  Search,
  Calendar,
  Bell,
  Sparkles
} from 'lucide-react'
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
    .single<{ full_name: string; user_type: string; [key: string]: any }>()

  // Get user-specific stats
  const { data: properties } = await supabase
    .from('properties')
    .select('id, views, featured')
    .eq('seller_id', user.id)

  const { data: savedProperties } = await supabase
    .from('property_favorites')
    .select('id')
    .eq('user_id', user.id)

  const { data: inquiries } = await supabase
    .from('inquiries')
    .select('id')
    .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)

  const { data: conversations } = await supabase
    .from('conversations')
    .select('id')
    .contains('participants', [user.id])

  const { data: transactions } = await supabase
    .from('transactions')
    .select('id, status')
    .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
    .returns<Array<{ id: string; status: string }>>()

  const activeTransactions = transactions?.filter((t) => t.status !== 'completed').length || 0
  const completedTransactions = transactions?.filter((t) => t.status === 'completed').length || 0
  const totalViews = properties?.reduce((sum: number, p: any) => sum + (p.views || 0), 0) || 0
  const featuredCount = properties?.filter((p: any) => p.featured).length || 0

  // Get current hour for greeting
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  const isBuyer = profile?.user_type === 'buyer'
  const isSeller = profile?.user_type === 'seller'
  const isLawyer = profile?.user_type === 'lawyer'

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <FadeIn>
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-primary/80 p-8 text-primary-foreground">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
          <div className="relative">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <p className="text-primary-foreground/80 text-sm font-medium mb-1">{greeting}</p>
                <h1 className="text-3xl md:text-4xl font-bold mb-2">
                  {profile?.full_name || 'Welcome back'}! 👋
                </h1>
                <p className="text-primary-foreground/80 max-w-lg">
                  {isBuyer && "Discover your dream property and connect directly with sellers."}
                  {isSeller && "Manage your listings and connect with interested buyers."}
                  {isLawyer && "Review your clients and manage property transactions."}
                  {!isBuyer && !isSeller && !isLawyer && "Here's an overview of your PropLinka activity."}
                </p>
              </div>
              <div className="flex gap-2">
                {isBuyer && (
                  <Link href="/browse">
                    <Button size="lg" variant="secondary" className="shadow-lg">
                      <Search className="h-5 w-5 mr-2" />
                      Browse Properties
                    </Button>
                  </Link>
                )}
                {isSeller && (
                  <Link href="/properties/new">
                    <Button size="lg" variant="secondary" className="shadow-lg">
                      <Building className="h-5 w-5 mr-2" />
                      List Property
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </FadeIn>

      {/* Stats Grid */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {isSeller && (
          <>
            <FadeIn delay={0.1}>
              <StatsCard
                title="Listed Properties"
                value={properties?.length || 0}
                subtitle="Active listings"
                icon={Building}
                iconColor="text-primary"
                iconBg="bg-primary/10"
              />
            </FadeIn>
            <FadeIn delay={0.15}>
              <StatsCard
                title="Total Views"
                value={totalViews}
                subtitle="Across all properties"
                icon={TrendingUp}
                iconColor="text-green-600"
                iconBg="bg-green-100"
              />
            </FadeIn>
          </>
        )}

        {isBuyer && (
          <>
            <FadeIn delay={0.1}>
              <StatsCard
                title="Saved Properties"
                value={savedProperties?.length || 0}
                subtitle="In your wishlist"
                icon={Heart}
                iconColor="text-red-500"
                iconBg="bg-red-100"
              />
            </FadeIn>
            <FadeIn delay={0.15}>
              <StatsCard
                title="Inquiries Sent"
                value={inquiries?.length || 0}
                subtitle="Property inquiries"
                icon={MessageSquare}
                iconColor="text-blue-600"
                iconBg="bg-blue-100"
              />
            </FadeIn>
          </>
        )}

        <FadeIn delay={0.2}>
          <StatsCard
            title="Active Deals"
            value={activeTransactions}
            subtitle="In progress"
            icon={FileText}
            iconColor="text-orange-600"
            iconBg="bg-orange-100"
          />
        </FadeIn>

        <FadeIn delay={0.25}>
          <StatsCard
            title="Completed"
            value={completedTransactions}
            subtitle="Successful deals"
            icon={TrendingUp}
            iconColor="text-emerald-600"
            iconBg="bg-emerald-100"
            highlight={completedTransactions > 0}
          />
        </FadeIn>

        {isSeller && featuredCount > 0 && (
          <FadeIn delay={0.3}>
            <StatsCard
              title="Featured"
              value={featuredCount}
              subtitle="Premium visibility"
              icon={Sparkles}
              iconColor="text-amber-600"
              iconBg="bg-amber-100"
              highlight
            />
          </FadeIn>
        )}

        <FadeIn delay={0.3}>
          <StatsCard
            title="Messages"
            value={conversations?.length || 0}
            subtitle="Conversations"
            icon={MessageSquare}
            iconColor="text-purple-600"
            iconBg="bg-purple-100"
          />
        </FadeIn>
      </div>

      {/* Quick Actions */}
      <FadeIn delay={0.35}>
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl">Quick Actions</CardTitle>
            <CardDescription>
              Common tasks for your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {isSeller && (
                <>
                  <QuickActionButton
                    href="/properties/new"
                    icon={Building}
                    label="List New Property"
                    description="Create a listing"
                    primary
                  />
                  <QuickActionButton
                    href="/properties"
                    icon={FileText}
                    label="Manage Listings"
                    description="Edit your properties"
                  />
                  <QuickActionButton
                    href="/featured"
                    icon={Sparkles}
                    label="Featured Listings"
                    description="Boost visibility"
                  />
                </>
              )}

              {isBuyer && (
                <>
                  <QuickActionButton
                    href="/browse"
                    icon={Search}
                    label="Browse Properties"
                    description="Find your home"
                    primary
                  />
                  <QuickActionButton
                    href="/saved"
                    icon={Heart}
                    label="Saved Properties"
                    description="Your wishlist"
                  />
                </>
              )}

              {isLawyer && (
                <>
                  <QuickActionButton
                    href="/practice"
                    icon={Users}
                    label="Manage Practice"
                    description="Your profile"
                  />
                  <QuickActionButton
                    href="/clients"
                    icon={FileText}
                    label="View Clients"
                    description="Active clients"
                  />
                </>
              )}

              <QuickActionButton
                href="/messages"
                icon={MessageSquare}
                label="Messages"
                description="View conversations"
              />

              <QuickActionButton
                href="/transactions"
                icon={DollarSign}
                label="Transactions"
                description="Deal history"
              />

              <QuickActionButton
                href="/settings"
                icon={Users}
                label="Settings"
                description="Account settings"
              />
            </div>
          </CardContent>
        </Card>
      </FadeIn>

      {/* Getting Started Tips for new users */}
      {(properties?.length === 0 && isSeller) || (savedProperties?.length === 0 && isBuyer) ? (
        <FadeIn delay={0.4}>
          <Card className="border-0 shadow-md bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-blue-600" />
                Getting Started
              </CardTitle>
              <CardDescription>
                Here are some tips to help you get the most out of PropLinka
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {isSeller && (
                  <>
                    <TipCard
                      number="1"
                      title="List Your Property"
                      description="Add photos, details, and set your price to attract buyers."
                    />
                    <TipCard
                      number="2"
                      title="Feature Your Listing"
                      description="Get more visibility with featured placement in search results."
                    />
                    <TipCard
                      number="3"
                      title="Respond to Inquiries"
                      description="Quick responses lead to more successful sales."
                    />
                  </>
                )}
                {isBuyer && (
                  <>
                    <TipCard
                      number="1"
                      title="Browse Properties"
                      description="Use filters to find properties that match your criteria."
                    />
                    <TipCard
                      number="2"
                      title="Save Favorites"
                      description="Heart properties you like to compare them later."
                    />
                    <TipCard
                      number="3"
                      title="Contact Sellers"
                      description="Send inquiries directly to property owners - no agents!"
                    />
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </FadeIn>
      ) : null}
    </div>
  )
}

// Stats Card Component
function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor,
  iconBg,
  highlight = false
}: {
  title: string
  value: number
  subtitle: string
  icon: any
  iconColor: string
  iconBg: string
  highlight?: boolean
}) {
  return (
    <Card className={`border-0 shadow-md hover:shadow-lg transition-all duration-300 ${highlight ? 'ring-2 ring-primary/20' : ''}`}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
            <p className="text-3xl font-bold">
              <AnimatedCounter value={value} />
            </p>
            <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
          </div>
          <div className={`w-12 h-12 rounded-xl ${iconBg} flex items-center justify-center`}>
            <Icon className={`h-6 w-6 ${iconColor}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Quick Action Button Component
function QuickActionButton({
  href,
  icon: Icon,
  label,
  description,
  primary = false
}: {
  href: string
  icon: any
  label: string
  description: string
  primary?: boolean
}) {
  return (
    <Link href={href}>
      <Button
        variant={primary ? "default" : "outline"}
        className={`w-full h-auto py-4 px-4 justify-start transition-all hover:shadow-md ${
          primary ? 'hover:scale-[1.02]' : 'hover:bg-muted/50 hover:border-primary/50'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            primary ? 'bg-primary-foreground/20' : 'bg-primary/10'
          }`}>
            <Icon className={`h-5 w-5 ${primary ? '' : 'text-primary'}`} />
          </div>
          <div className="text-left">
            <p className="font-medium">{label}</p>
            <p className={`text-xs ${primary ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
              {description}
            </p>
          </div>
        </div>
      </Button>
    </Link>
  )
}

// Tip Card Component
function TipCard({
  number,
  title,
  description
}: {
  number: string
  title: string
  description: string
}) {
  return (
    <div className="flex gap-3 p-4 rounded-xl bg-white/50 dark:bg-white/5">
      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
        <span className="text-sm font-bold text-primary">{number}</span>
      </div>
      <div>
        <h4 className="font-medium text-sm mb-1">{title}</h4>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}
