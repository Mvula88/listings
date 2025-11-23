import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/utils/format'
import { CheckCircle, Clock, DollarSign, FileText } from 'lucide-react'
import Link from 'next/link'

export default async function LawyerDealsPage() {
  const supabase = await createClient()

  // Check if user is authenticated and is a lawyer
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('user_type')
    .eq('id', user.id)
    .single<{ user_type: string }>()

  if (profile?.user_type !== 'lawyer') {
    redirect('/dashboard')
  }

  // Get lawyer record
  const { data: lawyer } = await supabase
    .from('lawyers')
    .select('*')
    .eq('profile_id', user.id)
    .single<{ id: string; [key: string]: any }>()

  if (!lawyer) {
    redirect('/lawyers/onboarding')
  }

  // Get all transactions where this lawyer is involved
  const { data: transactions } = await supabase
    .from('transactions')
    .select(`
      *,
      property:properties (
        id,
        title,
        price,
        address_line1,
        city,
        province,
        country:countries (
          currency,
          currency_symbol
        )
      ),
      buyer:buyer_id (
        id,
        full_name,
        email,
        phone
      ),
      seller:seller_id (
        id,
        full_name,
        email,
        phone
      ),
      buyer_lawyer:buyer_lawyer_id (
        id,
        firm_name
      ),
      seller_lawyer:seller_lawyer_id (
        id,
        firm_name
      )
    `)
    .or(`buyer_lawyer_id.eq.${lawyer.id},seller_lawyer_id.eq.${lawyer.id}`)
    .order('created_at', { ascending: false })

  // Separate active and closed deals
  const activeDeals = transactions?.filter((t: any) => t.status === 'in_progress' || t.status === 'pending') || []
  const closedDeals = transactions?.filter((t: any) => t.status === 'completed') || []
  const pendingFeeRemittance = closedDeals.filter((t: any) => t.fee_collected && !t.fee_remitted) || []

  // Calculate totals
  const totalPlatformFeesCollected = closedDeals
    .filter((t: any) => t.fee_collected)
    .reduce((sum: number, t: any) => sum + (parseFloat(String(t.platform_fee_amount)) || 0), 0)

  const totalCommissionEarned = closedDeals
    .filter((t: any) => t.fee_collected)
    .reduce((sum: number, t: any) => sum + (parseFloat(String(t.lawyer_commission_amount)) || 0), 0)

  const totalFeesRemitted = closedDeals
    .filter((t: any) => t.fee_remitted)
    .reduce((sum: number, t: any) => sum + (parseFloat(String(t.platform_fee_amount)) - parseFloat(String(t.lawyer_commission_amount || 0))), 0)

  const netAmountDue = totalPlatformFeesCollected - totalCommissionEarned
  const outstandingBalance = netAmountDue - totalFeesRemitted

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Deal Management</h1>
        <p className="text-muted-foreground mt-2">
          Track your transactions, report deal closures, and manage platform fee remittances
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Deals</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeDeals.length}</div>
            <p className="text-xs text-muted-foreground">
              In progress
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Closed Deals</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{closedDeals.length}</div>
            <p className="text-xs text-muted-foreground">
              Completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fees Collected</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R{totalPlatformFeesCollected.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Gross platform fees
            </p>
          </CardContent>
        </Card>

        <Card className="border-primary/50 bg-primary/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Your Commission</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">R{totalCommissionEarned.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              10% earned (keep this!)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">To Remit</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              R{outstandingBalance.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {pendingFeeRemittance.length} pending (90%)
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Pending Fee Remittance Alert */}
      {pendingFeeRemittance.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="text-orange-800">Action Required: Fee Remittance</CardTitle>
            <CardDescription className="text-orange-700">
              You have {pendingFeeRemittance.length} closed deals with platform fees that need to be remitted
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/lawyer-deals/remit-fees">
              <Button variant="default" className="bg-orange-600 hover:bg-orange-700">
                Submit Remittance
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Active Deals */}
      <Card>
        <CardHeader>
          <CardTitle>Active Transactions</CardTitle>
          <CardDescription>
            Deals currently in progress that require your conveyancing services
          </CardDescription>
        </CardHeader>
        <CardContent>
          {activeDeals.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No active deals at the moment
            </p>
          ) : (
            <div className="space-y-4">
              {activeDeals.map((transaction: any) => (
                <div key={transaction.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{transaction.property?.title}</h3>
                        <Badge variant={transaction.status === 'in_progress' ? 'default' : 'secondary'}>
                          {transaction.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {transaction.property?.address_line1}, {transaction.property?.city}
                      </p>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Property Value:</span>
                          <p className="font-medium">
                            {formatPrice(transaction.property?.price, transaction.property?.country?.currency)}
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Platform Fee:</span>
                          <p className="font-medium text-primary">
                            R{parseFloat(transaction.platform_fee_amount || 0).toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Buyer:</span>
                          <p className="font-medium">{transaction.buyer?.full_name}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Seller:</span>
                          <p className="font-medium">{transaction.seller?.full_name}</p>
                        </div>
                      </div>
                    </div>
                    <div>
                      <Link href={`/lawyer-deals/${transaction.id}`}>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Closed Deals */}
      <Card>
        <CardHeader>
          <CardTitle>Completed Transactions</CardTitle>
          <CardDescription>
            Deals that have been successfully closed
          </CardDescription>
        </CardHeader>
        <CardContent>
          {closedDeals.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No completed deals yet
            </p>
          ) : (
            <div className="space-y-4">
              {closedDeals.map((transaction: any) => (
                <div key={transaction.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{transaction.property?.title}</h3>
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          Completed
                        </Badge>
                        {transaction.fee_collected && (
                          <Badge variant="outline">
                            Fee Collected
                          </Badge>
                        )}
                        {transaction.fee_remitted && (
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            Remitted
                          </Badge>
                        )}
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Platform Fee:</span>
                          <p className="font-medium">
                            R{parseFloat(transaction.platform_fee_amount || 0).toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Closed Date:</span>
                          <p className="font-medium">
                            {transaction.deal_closed_at
                              ? new Date(transaction.deal_closed_at).toLocaleDateString()
                              : 'Not recorded'}
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Reference:</span>
                          <p className="font-medium">
                            {transaction.settlement_reference || 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
