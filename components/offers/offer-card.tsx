'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  DollarSign,
  MapPin,
  User,
  Building,
  CheckCircle,
  XCircle,
  Loader2,
  Banknote,
  Building2,
  Percent,
  ArrowRight,
  Clock,
} from 'lucide-react'
import {
  acceptOffer,
  rejectOffer,
  counterOffer,
  acceptCounterOffer,
  withdrawOffer,
} from '@/lib/actions/offers'
import { toast } from 'sonner'
import { formatPrice } from '@/lib/utils/format'

interface OfferCardProps {
  offer: any
  role: 'buyer' | 'seller'
}

export function OfferCard({ offer, role }: OfferCardProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showCounterDialog, setShowCounterDialog] = useState(false)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [showWithdrawDialog, setShowWithdrawDialog] = useState(false)
  const [counterAmount, setCounterAmount] = useState(offer.offer_amount.toString())
  const [counterMessage, setCounterMessage] = useState('')
  const [rejectResponse, setRejectResponse] = useState('')

  const property = offer.property
  const otherParty = role === 'buyer' ? offer.seller : offer.buyer
  const primaryImage = property?.property_images?.sort((a: any, b: any) => a.order_index - b.order_index)[0]
  const currencySymbol = property?.country?.currency_symbol || 'N$'

  const getStatusBadge = () => {
    switch (offer.status) {
      case 'pending':
        return <Badge className="bg-orange-500">Pending</Badge>
      case 'accepted':
        return <Badge className="bg-green-500">Accepted</Badge>
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>
      case 'countered':
        return <Badge className="bg-blue-500">Countered</Badge>
      case 'withdrawn':
        return <Badge variant="outline">Withdrawn</Badge>
      case 'expired':
        return <Badge variant="outline">Expired</Badge>
      default:
        return <Badge variant="outline">{offer.status}</Badge>
    }
  }

  const getPaymentTypeBadge = () => {
    switch (offer.payment_type) {
      case 'cash':
        return <Badge variant="outline" className="gap-1"><Banknote className="h-3 w-3" /> Cash</Badge>
      case 'bank_financed':
        return <Badge variant="outline" className="gap-1"><Building2 className="h-3 w-3" /> Bank Financed</Badge>
      case 'cash_and_bond':
        return <Badge variant="outline" className="gap-1"><Percent className="h-3 w-3" /> Cash + Bond</Badge>
      default:
        return null
    }
  }

  const handleAccept = async () => {
    setLoading(true)
    const result = await acceptOffer(offer.id)
    if (result.success) {
      toast.success('Offer accepted! Transaction has been initiated.')
      // Redirect immediately to the transaction select-lawyers page
      if (result.data?.transactionId) {
        router.push(`/transactions/${result.data.transactionId}/select-lawyers`)
      } else {
        // Fallback: go to transactions list if no ID returned
        router.push('/transactions')
      }
    } else {
      toast.error(result.error || 'Failed to accept offer')
      setLoading(false)
    }
  }

  const handleReject = async () => {
    setLoading(true)
    const result = await rejectOffer(offer.id, rejectResponse)
    if (result.success) {
      toast.success('Offer rejected')
      setShowRejectDialog(false)
      router.refresh()
    } else {
      toast.error(result.error || 'Failed to reject offer')
    }
    setLoading(false)
  }

  const handleCounter = async () => {
    const amount = parseFloat(counterAmount)
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount')
      return
    }

    setLoading(true)
    const result = await counterOffer(offer.id, amount, counterMessage)
    if (result.success) {
      toast.success('Counter offer sent!')
      setShowCounterDialog(false)
      router.refresh()
    } else {
      toast.error(result.error || 'Failed to send counter offer')
    }
    setLoading(false)
  }

  const handleAcceptCounter = async () => {
    setLoading(true)
    const result = await acceptCounterOffer(offer.id)
    if (result.success) {
      toast.success('Counter offer accepted! Transaction has been initiated.')
      // Redirect immediately to the transaction select-lawyers page
      if (result.data?.transactionId) {
        router.push(`/transactions/${result.data.transactionId}/select-lawyers`)
      } else {
        // Fallback: go to transactions list if no ID returned
        router.push('/transactions')
      }
    } else {
      toast.error(result.error || 'Failed to accept counter offer')
      setLoading(false)
    }
  }

  const handleWithdraw = async () => {
    setLoading(true)
    const result = await withdrawOffer(offer.id)
    if (result.success) {
      toast.success('Offer withdrawn')
      setShowWithdrawDialog(false)
      router.refresh()
    } else {
      toast.error(result.error || 'Failed to withdraw offer')
    }
    setLoading(false)
  }

  const formatCurrency = (amount: number) => `${currencySymbol}${amount.toLocaleString()}`

  const calculatePercentage = (amount: number) => {
    if (!property?.price) return 0
    return ((amount / property.price) * 100).toFixed(1)
  }

  return (
    <>
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="flex flex-col md:flex-row">
            {/* Property Image */}
            <div className="relative w-full md:w-48 h-48 md:h-auto bg-muted shrink-0">
              {primaryImage?.url ? (
                <Image
                  src={primaryImage.url}
                  alt={property?.title || 'Property'}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <Building className="h-12 w-12 text-muted-foreground" />
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 p-4 space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <Link
                    href={`/properties/${property?.id}`}
                    className="text-lg font-semibold hover:text-primary transition-colors line-clamp-1"
                  >
                    {property?.title}
                  </Link>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                    <MapPin className="h-3 w-3" />
                    {property?.city}, {property?.province}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {getStatusBadge()}
                  {getPaymentTypeBadge()}
                </div>
              </div>

              {/* Price Comparison */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-3 bg-muted/50 rounded-lg">
                <div>
                  <p className="text-xs text-muted-foreground">Asking Price</p>
                  <p className="font-semibold">{formatCurrency(property?.price)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Your Offer</p>
                  <p className="font-semibold text-primary">
                    {formatCurrency(offer.offer_amount)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    ({calculatePercentage(offer.offer_amount)}%)
                  </p>
                </div>
                {offer.counter_amount && (
                  <div>
                    <p className="text-xs text-muted-foreground">Counter Offer</p>
                    <p className="font-semibold text-blue-600">
                      {formatCurrency(offer.counter_amount)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      ({calculatePercentage(offer.counter_amount)}%)
                    </p>
                  </div>
                )}
              </div>

              {/* Financing Details */}
              {offer.payment_type !== 'cash' && offer.financing_status && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Financing: </span>
                  <span className="font-medium">
                    {offer.financing_status === 'pre_approved' && 'Pre-approved'}
                    {offer.financing_status === 'in_progress' && 'Application in progress'}
                    {offer.financing_status === 'not_started' && 'Not started'}
                    {offer.pre_approval_amount && ` (${formatCurrency(offer.pre_approval_amount)})`}
                    {offer.financing_bank && ` - ${offer.financing_bank}`}
                  </span>
                </div>
              )}

              {/* Message */}
              {offer.message && (
                <div className="text-sm">
                  <p className="text-muted-foreground mb-1">Message:</p>
                  <p className="italic">"{offer.message}"</p>
                </div>
              )}

              {/* Counter Message */}
              {offer.counter_message && (
                <div className="text-sm bg-blue-50 p-3 rounded-lg">
                  <p className="text-blue-800 font-medium mb-1">Seller's Counter:</p>
                  <p className="text-blue-700">"{offer.counter_message}"</p>
                </div>
              )}

              {/* Seller Response */}
              {offer.seller_response && offer.status === 'rejected' && (
                <div className="text-sm bg-red-50 p-3 rounded-lg">
                  <p className="text-red-800 font-medium mb-1">Seller's Response:</p>
                  <p className="text-red-700">"{offer.seller_response}"</p>
                </div>
              )}

              {/* Other Party Info */}
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  {otherParty?.avatar_url ? (
                    <Image
                      src={otherParty.avatar_url}
                      alt={otherParty.full_name}
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                  ) : (
                    <User className="h-4 w-4 text-primary" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-sm">{otherParty?.full_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {role === 'buyer' ? 'Seller' : 'Buyer'}
                  </p>
                </div>
                <div className="flex-1" />
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {new Date(offer.created_at).toLocaleDateString()}
                </div>
              </div>

              {/* Accepted Offer Success Banner */}
              {offer.status === 'accepted' && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-2 text-green-800">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-semibold">Offer Accepted!</span>
                  </div>
                  <p className="text-sm text-green-700">
                    {role === 'seller'
                      ? "You've accepted this offer. The next step is to select a lawyer to handle the transaction."
                      : "Great news! Your offer was accepted. Please select a lawyer to proceed with the transaction."
                    }
                  </p>
                  {offer.transaction?.id ? (
                    <Button asChild className="w-full bg-green-600 hover:bg-green-700">
                      <Link href={`/transactions/${offer.transaction.id}/select-lawyers`}>
                        Continue to Select Lawyer
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Link>
                    </Button>
                  ) : (
                    <Button asChild className="w-full">
                      <Link href="/transactions">
                        View My Transactions
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Link>
                    </Button>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap gap-2 pt-2 border-t">
                {/* Seller Actions */}
                {role === 'seller' && offer.status === 'pending' && (
                  <>
                    <Button onClick={handleAccept} disabled={loading}>
                      {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Accept
                    </Button>
                    <Button variant="outline" onClick={() => setShowCounterDialog(true)} disabled={loading}>
                      Counter
                    </Button>
                    <Button variant="ghost" onClick={() => setShowRejectDialog(true)} disabled={loading}>
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                  </>
                )}

                {/* Buyer Actions - Counter Offer */}
                {role === 'buyer' && offer.status === 'countered' && (
                  <>
                    <Button onClick={handleAcceptCounter} disabled={loading}>
                      {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      Accept Counter ({formatCurrency(offer.counter_amount)})
                    </Button>
                    <Button variant="outline" onClick={() => setShowWithdrawDialog(true)} disabled={loading}>
                      Decline
                    </Button>
                  </>
                )}

                {/* Buyer Actions - Pending */}
                {role === 'buyer' && offer.status === 'pending' && (
                  <Button variant="outline" onClick={() => setShowWithdrawDialog(true)} disabled={loading}>
                    Withdraw Offer
                  </Button>
                )}

                <Button variant="ghost" asChild>
                  <Link href={`/properties/${property?.id}`}>View Property</Link>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Counter Offer Dialog */}
      <Dialog open={showCounterDialog} onOpenChange={setShowCounterDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Counter Offer</DialogTitle>
            <DialogDescription>
              Send a counter offer to the buyer
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="bg-muted/50 rounded-lg p-3 text-sm">
              <p>Asking Price: <span className="font-semibold">{formatCurrency(property?.price)}</span></p>
              <p>Buyer's Offer: <span className="font-semibold">{formatCurrency(offer.offer_amount)}</span></p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="counterAmount">Your Counter Amount</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {currencySymbol}
                </span>
                <Input
                  id="counterAmount"
                  type="number"
                  value={counterAmount}
                  onChange={(e) => setCounterAmount(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="counterMessage">Message (Optional)</Label>
              <Textarea
                id="counterMessage"
                value={counterMessage}
                onChange={(e) => setCounterMessage(e.target.value)}
                placeholder="Explain your counter offer..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCounterDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCounter} disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Send Counter Offer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Offer</DialogTitle>
            <DialogDescription>
              Are you sure you want to reject this offer?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="rejectResponse">Response to Buyer (Optional)</Label>
            <Textarea
              id="rejectResponse"
              value={rejectResponse}
              onChange={(e) => setRejectResponse(e.target.value)}
              placeholder="Let them know why..."
              className="mt-2"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReject} disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Reject Offer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Withdraw Dialog */}
      <AlertDialog open={showWithdrawDialog} onOpenChange={setShowWithdrawDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Withdraw Offer</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to withdraw this offer? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleWithdraw} disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Withdraw
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
