import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, Star, ArrowRight, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-10-29.clover',
})

export default async function PaymentSuccessPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ session_id?: string }>
}) {
  const resolvedParams = await params
  const resolvedSearchParams = await searchParams
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get property details
  const { data: property } = await supabase
    .from('properties')
    .select('*, country:countries(currency, currency_symbol)')
    .eq('id', resolvedParams.id)
    .single<{ seller_id: string; title: string; featured: boolean; featured_until: string | null; [key: string]: any }>()

  if (!property || property.seller_id !== user.id) {
    notFound()
  }

  // Verify with Stripe and activate/extend the featured listing
  // This handles both new featured listings AND extensions
  let activationNeeded = false
  let activationError = false

  if (resolvedSearchParams.session_id) {
    try {
      // Verify the checkout session with Stripe
      const session = await stripe.checkout.sessions.retrieve(resolvedSearchParams.session_id)

      if (session.payment_status === 'paid' && session.metadata?.propertyId === resolvedParams.id) {
        const days = parseInt(session.metadata?.days || '30')
        const plan = session.metadata?.plan || ''

        // Calculate featured_until date
        // If already featured, extend from current end date (not from today)
        let featuredUntil = new Date()
        if (property.featured && property.featured_until) {
          const currentEnd = new Date(property.featured_until)
          if (currentEnd > featuredUntil) {
            featuredUntil = currentEnd
          }
        }
        featuredUntil.setDate(featuredUntil.getDate() + days)

        // Check if this session has already been processed by comparing featured_until
        // Only update if the new date would actually extend the featured period
        const existingEndDate = property.featured_until ? new Date(property.featured_until) : new Date(0)
        const shouldUpdate = featuredUntil > existingEndDate

        if (shouldUpdate) {
          // Activate or extend the feature
          const { error: updateError } = await (supabase.from('properties') as any)
            .update({
              featured: true,
              featured_until: featuredUntil.toISOString(),
              premium: plan.includes('premium'),
              updated_at: new Date().toISOString(),
            })
            .eq('id', resolvedParams.id)

          if (updateError) {
            console.error('Error activating/extending feature:', updateError)
            activationError = true
          } else {
            activationNeeded = true
            // Update property object for display
            property.featured = true
            property.featured_until = featuredUntil.toISOString()
          }
        } else {
          // Already processed, just update the display
          property.featured = true
        }
      }
    } catch (error) {
      console.error('Error verifying Stripe session:', error)
      activationError = true
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-background">
      <div className="container max-w-2xl mx-auto px-4 py-12">
        <Card>
          <CardHeader className="text-center pb-6">
            <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Payment Successful!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <p className="text-muted-foreground mb-4">
                Your property has been featured successfully
              </p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center justify-center gap-2">
                <Star className="h-5 w-5 text-yellow-600 fill-yellow-600" />
                <span className="font-semibold text-yellow-900">
                  {property.title}
                </span>
                <Star className="h-5 w-5 text-yellow-600 fill-yellow-600" />
              </div>
              {property.featured_until && (
                <p className="text-sm text-muted-foreground mt-2">
                  Featured until: {new Date(property.featured_until).toLocaleDateString()}
                </p>
              )}
            </div>

            {activationError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-red-900">Activation Issue</h4>
                  <p className="text-sm text-red-800">
                    There was an issue activating your featured listing. Please contact support with your session ID.
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Status</span>
                <span className="font-medium text-green-600">Featured</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Session ID</span>
                <span className="font-mono text-xs">{resolvedSearchParams.session_id?.slice(0, 20)}...</span>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">What happens next?</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>✓ Your property now appears at the top of search results</li>
                <li>✓ You'll get a featured badge on your listing</li>
                <li>✓ Expect 3-10x more views and inquiries</li>
                <li>✓ You'll receive email notifications for all inquiries</li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link href={`/properties/${resolvedParams.id}`} className="flex-1">
                <Button variant="outline" className="w-full">
                  View Property
                </Button>
              </Link>
              <Link href="/dashboard" className="flex-1">
                <Button className="w-full">
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>

            <p className="text-xs text-center text-muted-foreground">
              A receipt has been sent to your email address
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
