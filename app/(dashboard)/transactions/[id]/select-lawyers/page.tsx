import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { LawyerSelectionForm } from '@/components/transactions/lawyer-selection-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle, AlertCircle } from 'lucide-react'

export default async function SelectLawyersPage(props: {
  params: Promise<{ id: string }>
}) {
  const params = await props.params
  const { id } = params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // Get transaction details
  const { data: transaction } = await supabase
    .from('transactions')
    .select(`
      *,
      property:properties (
        id,
        title,
        price,
        city,
        province,
        country_id
      ),
      buyer:profiles!buyer_id (
        id,
        full_name
      ),
      seller:profiles!seller_id (
        id,
        full_name
      ),
      lawyer_buyer:lawyers!lawyer_buyer_id (
        id,
        firm_name,
        flat_fee_buyer
      ),
      lawyer_seller:lawyers!lawyer_seller_id (
        id,
        firm_name,
        flat_fee_seller
      )
    `)
    .eq('id', id)
    .single() as any

  if (!transaction) {
    notFound()
  }

  // Check if user is part of this transaction
  const userRole = transaction.buyer_id === user.id ? 'buyer' : 
                   transaction.seller_id === user.id ? 'seller' : null

  if (!userRole) {
    notFound()
  }

  // Get available lawyers
  const { data: lawyers } = await supabase
    .from('lawyers')
    .select(`
      *,
      profile:profiles!profile_id (
        full_name,
        avatar_url
      )
    `)
    .eq('country_id', transaction.property.country_id)
    .eq('verified', true)
    .eq('available', true)
    .order('rating', { ascending: false })
    .limit(10)

  // Check if user has already selected a lawyer
  const userLawyer = userRole === 'buyer' ? transaction.lawyer_buyer : transaction.lawyer_seller
  const otherPartyLawyer = userRole === 'buyer' ? transaction.lawyer_seller : transaction.lawyer_buyer
  const otherPartyName = userRole === 'buyer' ? transaction.seller?.full_name : transaction.buyer?.full_name

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Select Your Conveyancer</h1>
        <p className="text-muted-foreground mt-2">
          Choose a verified lawyer to handle your side of the transaction
        </p>
      </div>

      {/* Transaction Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Property</p>
              <p className="font-medium">{transaction.property.title}</p>
              <p className="text-sm">{transaction.property.city}, {transaction.property.province}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Agreed Price</p>
              <p className="font-medium text-lg">R{transaction.agreed_price?.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">You are the</p>
              <p className="font-medium capitalize">{userRole}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Other Party</p>
              <p className="font-medium">{otherPartyName}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status Messages */}
      {userLawyer && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            You have selected <strong>{userLawyer.firm_name}</strong> as your conveyancer.
            They will contact you shortly to begin the process.
          </AlertDescription>
        </Alert>
      )}

      {otherPartyLawyer && !userLawyer && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            The {userRole === 'buyer' ? 'seller' : 'buyer'} has selected their conveyancer.
            Please select yours to proceed with the transaction.
          </AlertDescription>
        </Alert>
      )}

      {!userLawyer && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Why Choose a Conveyancer?</CardTitle>
              <CardDescription>
                Conveyancers handle all the legal aspects of property transfer
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-primary mt-0.5" />
                  <span>Prepare and review all legal documents</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-primary mt-0.5" />
                  <span>Conduct property searches and due diligence</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-primary mt-0.5" />
                  <span>Handle transfer of ownership at the Deeds Office</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-primary mt-0.5" />
                  <span>Ensure compliance with all legal requirements</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-primary mt-0.5" />
                  <span>Transparent flat-rate pricing - no hidden fees</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <LawyerSelectionForm
            lawyers={lawyers || []}
            transaction={transaction}
            userRole={userRole}
          />
        </>
      )}
    </div>
  )
}