import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, Star, ArrowRight } from 'lucide-react'
import Link from 'next/link'

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
  const { data: property } = await (supabase as any)
    .from('properties')
    .select('*, country:countries(currency, currency_symbol)')
    .eq('id', resolvedParams.id)
    .single()

  if (!property || property.seller_id !== user.id) {
    notFound()
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
            </div>

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
