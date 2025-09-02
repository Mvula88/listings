import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, ArrowRight, FileText, MessageSquare } from 'lucide-react'
import Link from 'next/link'

export default async function PaymentSuccessPage({
  params,
  searchParams
}: {
  params: { id: string }
  searchParams: { session_id?: string }
}) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  // Get transaction details
  const { data: transaction } = await supabase
    .from('transactions')
    .select(`
      *,
      property:properties (
        title,
        city
      ),
      buyer:profiles!buyer_id (
        full_name
      ),
      seller:profiles!seller_id (
        full_name
      )
    `)
    .eq('id', params.id)
    .single() as any

  if (!transaction) {
    redirect('/transactions')
  }

  const userRole = transaction.buyer_id === user.id ? 'buyer' : 'seller'
  const bothPaid = transaction.buyer_success_fee_paid && transaction.seller_success_fee_paid

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card className="border-green-200">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
          </div>
          <CardTitle className="text-2xl">Payment Successful!</CardTitle>
          <CardDescription>
            Your success fee has been processed successfully
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Property:</span>
              <span className="font-medium">{transaction.property.title}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Location:</span>
              <span className="font-medium">{transaction.property.city}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Transaction ID:</span>
              <span className="font-mono text-sm">{transaction.id.slice(0, 8)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Amount Paid:</span>
              <span className="font-semibold">R1,000</span>
            </div>
          </div>

          {bothPaid ? (
            <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
              <h3 className="font-semibold text-green-800 mb-2">
                Transaction Complete! 🎉
              </h3>
              <p className="text-sm text-green-700">
                Both parties have completed their payments. The property transaction is now finalized.
                You'll receive a confirmation email with all the details.
              </p>
            </div>
          ) : (
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">
                Waiting for Other Party
              </h3>
              <p className="text-sm text-blue-700">
                Your payment is complete. We're waiting for the {userRole === 'buyer' ? 'seller' : 'buyer'} 
                to complete their payment to finalize the transaction.
              </p>
            </div>
          )}

          <div className="space-y-3">
            <h4 className="font-medium">What's Next?</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                <span>You'll receive a payment confirmation email</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                <span>Transaction documents will be sent to you</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                <span>Your conveyancer will finalize all paperwork</span>
              </li>
              {bothPaid && (
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  <span>Property ownership has been successfully transferred!</span>
                </li>
              )}
            </ul>
          </div>

          <div className="grid gap-3">
            <Link href={`/transactions/${params.id}`}>
              <Button className="w-full" variant="default">
                <FileText className="mr-2 h-4 w-4" />
                View Transaction Details
              </Button>
            </Link>
            <Link href="/messages">
              <Button className="w-full" variant="outline">
                <MessageSquare className="mr-2 h-4 w-4" />
                Go to Messages
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button className="w-full" variant="outline">
                Back to Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="pt-6">
          <h3 className="font-semibold mb-2">Thank You for Using DealDirect!</h3>
          <p className="text-sm text-muted-foreground">
            You've saved thousands by avoiding traditional agent commissions. 
            We're proud to have helped you complete this transaction efficiently and affordably.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}