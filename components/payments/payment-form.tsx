'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { loadStripe } from '@stripe/stripe-js'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { CreditCard, Lock, Loader2, AlertCircle } from 'lucide-react'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface PaymentFormProps {
  transaction: any
  userRole: 'buyer' | 'seller'
  amount: number
  currency: string
}

export function PaymentForm({ transaction, userRole, amount, currency }: PaymentFormProps) {
  const [loading, setLoading] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function handlePayment() {
    setLoading(true)
    setError(null)

    try {
      // Create checkout session
      const response = await fetch('/api/payments/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transactionId: transaction.id,
          userRole,
          amount,
          currency,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create checkout session')
      }

      const { sessionId } = await response.json()

      // Redirect to Stripe Checkout
      const stripe = await stripePromise
      if (!stripe) {
        throw new Error('Stripe failed to load')
      }

      const { error } = await stripe.redirectToCheckout({ sessionId })
      
      if (error) {
        throw error
      }
    } catch (err: any) {
      console.error('Payment error:', err)
      setError(err.message || 'Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Details</CardTitle>
        <CardDescription>
          Complete your payment to finalize the transaction
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <div className="bg-muted p-4 rounded-lg space-y-3">
            <h4 className="font-medium">Payment Method</h4>
            <div className="flex items-center gap-3">
              <CreditCard className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm">Credit or Debit Card</span>
            </div>
            <p className="text-xs text-muted-foreground">
              All major cards accepted. Payment processed securely by Stripe.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">What happens after payment?</h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• Your payment will be held securely</li>
              <li>• Both parties must complete payment</li>
              <li>• Funds are released when transaction completes</li>
              <li>• You'll receive a confirmation email</li>
            </ul>
          </div>

          <div className="flex items-start space-x-2">
            <Checkbox 
              id="agree" 
              checked={agreed}
              onCheckedChange={(checked) => setAgreed(checked as boolean)}
            />
            <Label htmlFor="agree" className="text-sm leading-relaxed">
              I confirm that the property transfer has been completed by my conveyancer 
              and I'm ready to pay the success fee of {currency} {amount}
            </Label>
          </div>
        </div>

        <div className="space-y-3">
          <Button
            onClick={handlePayment}
            disabled={!agreed || loading}
            className="w-full"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="mr-2 h-4 w-4" />
                Pay Now - {currency} {amount}
              </>
            )}
          </Button>

          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Lock className="h-3 w-3" />
            <span>Secure payment powered by Stripe</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}