import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getMyViewings } from '@/lib/actions/viewings'
import { ViewingCard } from '@/components/viewings/viewing-card'
import { Calendar, Clock, CheckCircle, Eye } from 'lucide-react'

export default async function ViewingsPage() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError) {
      console.error('Auth error:', authError)
    }

    if (!user) {
      redirect('/login')
    }

    // Get user profile to determine role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('user_type')
      .eq('id', user.id)
      .single<{ user_type: string }>()

    if (profileError) {
      console.error('Profile error:', profileError)
    }

    const userType = profile?.user_type || 'buyer'

    // Get viewings as buyer and seller with error handling
    let buyerViewings: any[] = []
    let sellerViewings: any[] = []

    try {
      const buyerResult = await getMyViewings('buyer')
      buyerViewings = buyerResult.viewings || []
    } catch (err) {
      console.error('Error fetching buyer viewings:', err)
    }

    try {
      const sellerResult = await getMyViewings('seller')
      sellerViewings = sellerResult.viewings || []
    } catch (err) {
      console.error('Error fetching seller viewings:', err)
    }

    // Count by status
    const buyerPending = buyerViewings.filter((v: any) => v.status === 'pending').length
    const buyerConfirmed = buyerViewings.filter((v: any) => v.status === 'confirmed').length
    const sellerPending = sellerViewings.filter((v: any) => v.status === 'pending').length
    const sellerConfirmed = sellerViewings.filter((v: any) => v.status === 'confirmed').length

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Property Viewings</h1>
          <p className="text-muted-foreground mt-1">
            Manage your scheduled property viewings
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {userType === 'seller' ? 'Viewing Requests' : 'Requested'}
              </CardTitle>
              <Clock className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {userType === 'seller' ? sellerPending : buyerPending}
              </div>
              <p className="text-xs text-muted-foreground">Pending confirmation</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {userType === 'seller' ? sellerConfirmed : buyerConfirmed}
              </div>
              <p className="text-xs text-muted-foreground">Upcoming viewings</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total as Buyer</CardTitle>
              <Eye className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{buyerViewings.length}</div>
              <p className="text-xs text-muted-foreground">Properties viewed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total as Seller</CardTitle>
              <Calendar className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{sellerViewings.length}</div>
              <p className="text-xs text-muted-foreground">Viewing requests</p>
            </CardContent>
          </Card>
        </div>

        {/* Viewings Tabs */}
        <Tabs defaultValue={userType === 'seller' ? 'seller' : 'buyer'}>
          <TabsList>
            <TabsTrigger value="buyer" className="gap-2">
              <Eye className="h-4 w-4" />
              As Buyer ({buyerViewings.length})
            </TabsTrigger>
            <TabsTrigger value="seller" className="gap-2">
              <Calendar className="h-4 w-4" />
              As Seller ({sellerViewings.length})
            </TabsTrigger>
          </TabsList>

          {/* Buyer Viewings */}
          <TabsContent value="buyer" className="mt-6">
            {buyerViewings.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Eye className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-semibold">No viewings yet</h3>
                  <p className="text-muted-foreground text-center max-w-sm">
                    Browse properties and request viewings to see them here
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {buyerViewings.map((viewing: any) => (
                  <ViewingCard key={viewing.id} viewing={viewing} role="buyer" />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Seller Viewings */}
          <TabsContent value="seller" className="mt-6">
            {sellerViewings.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Calendar className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-semibold">No viewing requests</h3>
                  <p className="text-muted-foreground text-center max-w-sm">
                    When buyers request viewings for your properties, they'll appear here
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {sellerViewings.map((viewing: any) => (
                  <ViewingCard key={viewing.id} viewing={viewing} role="seller" />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    )
  } catch (error) {
    console.error('ViewingsPage error:', error)
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Property Viewings</h1>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Unable to load viewings. Please try again later.</p>
          </CardContent>
        </Card>
      </div>
    )
  }
}
