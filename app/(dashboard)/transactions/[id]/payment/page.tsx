import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { PaymentForm } from '@/components/payments/payment-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, AlertCircle, DollarSign } from 'lucide-react'
import { formatPrice } from '@/lib/utils/format'

export default async function PaymentPage({
  params
}: {
  params: { id: string }
}) {
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
        address_line1,
        city,
        country:countries (
          currency,
          currency_symbol
        )
      ),
      buyer:profiles!buyer_id (
        id,
        full_name,
        email
      ),
      seller:profiles!seller_id (
        id,
        full_name,
        email
      ),
      payments (
        id,
        type,
        amount,
        status,
        paid_at
      )
    `)
    .eq('id', params.id)
    .single()

  if (!transaction) {
    notFound()
  }

  // Check if user is part of this transaction
  const userRole = transaction.buyer_id === user.id ? 'buyer' : 
                   transaction.seller_id === user.id ? 'seller' : null

  if (!userRole) {
    notFound()
  }

  // Check payment status
  const userPaymentType = userRole === 'buyer' ? 'success_fee_buyer' : 'success_fee_seller'
  const userPayment = transaction.payments?.find((p: any) => p.type === userPaymentType)
  const isPaid = userPayment?.status === 'succeeded'
  const otherPartyPaid = userRole === 'buyer' 
    ? transaction.seller_success_fee_paid 
    : transaction.buyer_success_fee_paid

  const currency = transaction.property?.country?.currency || 'ZAR'
  const currencySymbol = transaction.property?.country?.currency_symbol || 'R'
  const successFee = 1000 // Flat fee

  // Only show payment page if transaction is ready for payment
  if (transaction.status !== 'pending_payment' && !isPaid) {
    return (
      <div className="max-w-2xl mx-auto">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            This transaction is not yet ready for payment. The property transfer must be completed by your lawyers first.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (isPaid) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-6 w-6 text-green-600" />
              Payment Complete
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-green-800 mb-4">
              Your success fee has been paid successfully on {new Date(userPayment.paid_at).toLocaleDateString()}.
            </p>
            <div className="bg-white p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span>Transaction ID:</span>
                <span className="font-mono text-sm">{transaction.id.slice(0, 8)}</span>
              </div>
              <div className="flex justify-between">
                <span>Amount Paid:</span>
                <span className="font-semibold">{currencySymbol}{successFee}</span>
              </div>
              <div className="flex justify-between">
                <span>Property:</span>
                <span className="font-semibold">{transaction.property.title}</span>
              </div>
            </div>
            
            {!otherPartyPaid && (
              <Alert className="mt-4">
                <AlertDescription>
                  Waiting for the {userRole === 'buyer' ? 'seller' : 'buyer'} to complete their payment.
                </AlertDescription>
              </Alert>
            )}
            
            {otherPartyPaid && (
              <Alert className="mt-4 border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Both parties have completed payment. The transaction is now complete!
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Complete Your Payment</h1>
        <p className="text-muted-foreground mt-2">
          Pay the success fee to finalize your transaction
        </p>
      </div>

      {/* Transaction Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Property:</span>
              <span className="font-medium">{transaction.property.title}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Location:</span>
              <span className="font-medium">{transaction.property.city}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Purchase Price:</span>
              <span className="font-medium">
                {formatPrice(transaction.agreed_price, currency)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Your Role:</span>
              <Badge variant="outline" className="capitalize">{userRole}</Badge>
            </div>
          </div>
          
          <div className="border-t pt-4">
            <div className="flex justify-between items-center">
              <span className="font-semibold">Success Fee Due:</span>
              <span className="text-2xl font-bold text-primary">
                {currencySymbol}{successFee}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              One-time fee payable upon successful transaction
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Savings Reminder */}
      <Card className="border-green-200 bg-green-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <DollarSign className="h-6 w-6 text-green-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-green-800 mb-1">
                You're Saving {formatPrice(transaction.agreed_price * 0.06 - successFee, currency)}
              </h3>
              <p className="text-sm text-green-700">
                Traditional agent fees would have been {formatPrice(transaction.agreed_price * 0.06, currency)} (6%).
                With DealDirect, you only pay {currencySymbol}{successFee}.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Form */}
      <PaymentForm
        transaction={transaction}
        userRole={userRole}
        amount={successFee}
        currency={currency}
      />
    </div>
  )
}