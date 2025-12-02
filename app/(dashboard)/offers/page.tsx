import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FadeIn } from '@/components/ui/fade-in'
import { getMyOffers } from '@/lib/actions/offers'
import { OfferCard } from '@/components/offers/offer-card'
import { DollarSign, Clock, CheckCircle, XCircle, TrendingUp, TrendingDown } from 'lucide-react'

export default async function OffersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get user profile to determine role
  const { data: profile } = await supabase
    .from('profiles')
    .select('user_type')
    .eq('id', user.id)
    .single()

  const userType = profile?.user_type || 'buyer'

  // Get offers as buyer and seller
  const { offers: buyerOffers } = await getMyOffers('buyer')
  const { offers: sellerOffers } = await getMyOffers('seller')

  // Count by status
  const buyerPending = buyerOffers.filter((o: any) => o.status === 'pending' || o.status === 'countered').length
  const buyerAccepted = buyerOffers.filter((o: any) => o.status === 'accepted').length
  const sellerPending = sellerOffers.filter((o: any) => o.status === 'pending').length
  const sellerTotal = sellerOffers.length

  return (
    <div className="space-y-6">
      <FadeIn>
        <div>
          <h1 className="text-3xl font-bold">Offers</h1>
          <p className="text-muted-foreground mt-1">
            Manage your property offers
          </p>
        </div>
      </FadeIn>

      {/* Stats */}
      <FadeIn delay={0.1}>
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {userType === 'seller' ? 'Pending Offers' : 'Your Active Offers'}
              </CardTitle>
              <Clock className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {userType === 'seller' ? sellerPending : buyerPending}
              </div>
              <p className="text-xs text-muted-foreground">Awaiting response</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Accepted Offers</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{buyerAccepted}</div>
              <p className="text-xs text-muted-foreground">Proceeding to transaction</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Offers Made</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{buyerOffers.length}</div>
              <p className="text-xs text-muted-foreground">As a buyer</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Offers Received</CardTitle>
              <TrendingDown className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{sellerTotal}</div>
              <p className="text-xs text-muted-foreground">As a seller</p>
            </CardContent>
          </Card>
        </div>
      </FadeIn>

      {/* Offers Tabs */}
      <FadeIn delay={0.2}>
        <Tabs defaultValue={userType === 'seller' ? 'received' : 'made'}>
          <TabsList>
            <TabsTrigger value="made" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              Offers Made ({buyerOffers.length})
            </TabsTrigger>
            <TabsTrigger value="received" className="gap-2">
              <TrendingDown className="h-4 w-4" />
              Offers Received ({sellerOffers.length})
            </TabsTrigger>
          </TabsList>

          {/* Offers Made (as Buyer) */}
          <TabsContent value="made" className="mt-6">
            {buyerOffers.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <DollarSign className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-semibold">No offers yet</h3>
                  <p className="text-muted-foreground text-center max-w-sm">
                    Browse properties and make offers to see them here
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {buyerOffers.map((offer: any) => (
                  <OfferCard key={offer.id} offer={offer} role="buyer" />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Offers Received (as Seller) */}
          <TabsContent value="received" className="mt-6">
            {sellerOffers.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <DollarSign className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-semibold">No offers received</h3>
                  <p className="text-muted-foreground text-center max-w-sm">
                    When buyers make offers on your properties, they'll appear here
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {sellerOffers.map((offer: any) => (
                  <OfferCard key={offer.id} offer={offer} role="seller" />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </FadeIn>
    </div>
  )
}
