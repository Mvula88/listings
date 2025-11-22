'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { MessageSquare, CheckCircle, ArrowRight, Loader2 } from 'lucide-react'
import { formatPrice } from '@/lib/utils/format'
import { getPlatformFee } from '@/lib/utils/savings-calculator'
import type { Property, Inquiry } from '@/lib/types'
import type { User } from '@supabase/supabase-js'

interface PropertyInquiryProps {
  property: Property
  user: User | null
  existingInquiry: Inquiry | null
}

export function PropertyInquiry({ property, user, existingInquiry }: PropertyInquiryProps) {
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [showProceedModal, setShowProceedModal] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const isOwner = user?.id === property.seller_id
  const currency = property.country?.currency || 'ZAR'
  const platformFee = getPlatformFee(property.price)

  async function handleInquiry() {
    if (!user) {
      router.push('/login')
      return
    }

    setLoading(true)
    try {
      // Create inquiry
      const { data: inquiry, error } = await (supabase
        .from('inquiries') as any)
        .insert([{
          property_id: property.id,
          buyer_id: user.id,
          seller_id: property.seller_id,
          message,
          status: 'new'
        }])
        .select()
        .single()

      if (error) throw error

      // Create conversation
      const { data: conversation } = await (supabase
        .from('conversations') as any)
        .insert([{
          inquiry_id: inquiry.id,
          property_id: property.id,
          participants: [user.id, property.seller_id],
          status: 'active'
        }])
        .select()
        .single()

      // Send email notification to seller
      try {
        await fetch('/api/send-inquiry-notification', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            inquiryId: inquiry.id,
            conversationId: conversation?.id,
          })
        })
      } catch (emailError) {
        console.error('Failed to send email notification:', emailError)
        // Don't fail the inquiry if email fails
      }

      setSuccess(true)
      setMessage('')
    } catch (error) {
      console.error('Error sending inquiry:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleProceedToTransaction() {
    if (!user || !existingInquiry) return

    setLoading(true)
    try {
      // Create transaction
      const { data: transaction, error } = await supabase
        .from('transactions')
        .insert({
          inquiry_id: existingInquiry.id,
          property_id: property.id,
          buyer_id: user.id,
          seller_id: property.seller_id,
          agreed_price: property.price,
          status: 'initiated'
        })
        .select()
        .single()

      if (error) throw error

      // Update inquiry status
      await supabase
        .from('inquiries')
        .update({ status: 'proceeded_to_transaction' })
        .eq('id', existingInquiry.id)

      // Navigate to transaction
      router.push(`/transactions/${transaction.id}/select-lawyers`)
    } catch (error) {
      console.error('Error creating transaction:', error)
    } finally {
      setLoading(false)
    }
  }

  if (isOwner) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Property</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            This is your listed property.
          </p>
          <Button className="w-full" onClick={() => router.push('/properties')}>
            Manage Listing
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (existingInquiry) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Inquiry Sent
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="mb-4">
            <AlertDescription>
              You've already contacted the seller about this property. 
              Check your messages for their response.
            </AlertDescription>
          </Alert>
          
          <div className="space-y-3">
            <Button 
              className="w-full" 
              onClick={() => router.push('/messages')}
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              View Messages
            </Button>
            
            {existingInquiry.status === 'responded' && (
              <Dialog open={showProceedModal} onOpenChange={setShowProceedModal}>
                <DialogTrigger asChild>
                  <Button className="w-full" variant="default">
                    Proceed with Purchase
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Start Transaction Process</DialogTitle>
                    <DialogDescription>
                      Both parties will select their conveyancers and proceed with the deal.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2">What happens next:</h4>
                      <ol className="list-decimal list-inside space-y-1 text-sm">
                        <li>Each party selects their conveyancer</li>
                        <li>Conveyancers handle all legal paperwork</li>
                        <li>Property transfer is completed</li>
                        <li>Platform fee collected by lawyer at closing</li>
                      </ol>
                    </div>

                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="flex justify-between mb-2">
                        <span>Purchase Price:</span>
                        <span className="font-semibold">
                          {formatPrice(property.price, currency)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Platform Fee:</span>
                        <span className="font-semibold text-primary">
                          {formatPrice(platformFee, currency)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-3 border-t pt-2">
                        * Platform fee collected by lawyer at closing, replaces agent commission. Lawyer fees (~R15K-R40K) apply to both traditional and PropLinka models.
                      </p>
                    </div>
                    
                    <Button 
                      onClick={handleProceedToTransaction}
                      className="w-full"
                      disabled={loading}
                    >
                      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Confirm and Select Conveyancer
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (success) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Inquiry Sent Successfully!
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            The seller will be notified and will respond to your inquiry soon.
          </p>
          <Button 
            className="w-full" 
            onClick={() => router.push('/messages')}
          >
            Go to Messages
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contact Seller</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="text-2xl font-bold text-primary">
              {formatPrice(property.price, currency)}
            </p>
            <p className="text-sm text-muted-foreground">
              Asking price
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="message">Your Message</Label>
            <Textarea
              id="message"
              placeholder="Hi, I'm interested in this property. Is it still available?"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
            />
          </div>
          
          {!user && (
            <Alert>
              <AlertDescription>
                Please sign in to contact the seller
              </AlertDescription>
            </Alert>
          )}
          
          <Button
            className="w-full"
            onClick={handleInquiry}
            disabled={loading || !message.trim()}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {user ? 'Send Inquiry' : 'Sign In to Contact'}
          </Button>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-900 mb-1">
              <strong>Platform fee (replaces agent commission):</strong>
            </p>
            <p className="text-xs text-blue-800 font-semibold">
              {formatPrice(platformFee, currency)}
            </p>
            <p className="text-xs text-blue-700 mt-2">
              Save up to 90% vs traditional agent fees! Lawyer fees (~R15K-R40K) are the same in both models.
            </p>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            By contacting the seller, you agree to PropLinka's terms of service
          </p>
        </div>
      </CardContent>
    </Card>
  )
}