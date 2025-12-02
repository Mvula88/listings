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
  Calendar,
  Clock,
  MapPin,
  User,
  Building,
  CheckCircle,
  XCircle,
  Loader2,
  Banknote,
  Phone,
  Mail,
} from 'lucide-react'
import {
  confirmViewing,
  cancelViewing,
  completeViewing,
  markViewingNoShow,
} from '@/lib/actions/viewings'
import { toast } from 'sonner'
import { formatPrice } from '@/lib/utils/format'

interface ViewingCardProps {
  viewing: any
  role: 'buyer' | 'seller'
}

export function ViewingCard({ viewing, role }: ViewingCardProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [confirmedDate, setConfirmedDate] = useState(viewing.requested_date)
  const [confirmedTime, setConfirmedTime] = useState('10:00')
  const [response, setResponse] = useState('')
  const [cancelReason, setCancelReason] = useState('')

  const property = viewing.property
  const otherParty = role === 'buyer' ? viewing.seller : viewing.buyer
  const primaryImage = property?.property_images?.sort((a: any, b: any) => a.order_index - b.order_index)[0]

  const getStatusBadge = () => {
    switch (viewing.status) {
      case 'pending':
        return <Badge className="bg-orange-500">Pending</Badge>
      case 'confirmed':
        return <Badge className="bg-green-500">Confirmed</Badge>
      case 'completed':
        return <Badge className="bg-blue-500">Completed</Badge>
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>
      case 'no_show':
        return <Badge variant="destructive">No Show</Badge>
      default:
        return <Badge variant="outline">{viewing.status}</Badge>
    }
  }

  const getFinancingBadge = () => {
    switch (viewing.financing_status) {
      case 'cash':
        return <Badge variant="outline" className="gap-1"><Banknote className="h-3 w-3" /> Cash Buyer</Badge>
      case 'pre_approved':
        return <Badge variant="outline" className="gap-1 text-green-600 border-green-300">Pre-Approved</Badge>
      case 'financing_in_progress':
        return <Badge variant="outline" className="gap-1 text-orange-600 border-orange-300">Financing in Progress</Badge>
      case 'exploring':
        return <Badge variant="outline">Exploring Options</Badge>
      default:
        return null
    }
  }

  const handleConfirm = async () => {
    setLoading(true)
    const result = await confirmViewing(viewing.id, confirmedDate, confirmedTime, response)
    if (result.success) {
      toast.success('Viewing confirmed!')
      setShowConfirmDialog(false)
      router.refresh()
    } else {
      toast.error(result.error || 'Failed to confirm viewing')
    }
    setLoading(false)
  }

  const handleCancel = async () => {
    setLoading(true)
    const result = await cancelViewing(viewing.id, cancelReason)
    if (result.success) {
      toast.success('Viewing cancelled')
      setShowCancelDialog(false)
      router.refresh()
    } else {
      toast.error(result.error || 'Failed to cancel viewing')
    }
    setLoading(false)
  }

  const handleComplete = async () => {
    setLoading(true)
    const result = await completeViewing(viewing.id)
    if (result.success) {
      toast.success('Viewing marked as completed')
      router.refresh()
    } else {
      toast.error(result.error || 'Failed to complete viewing')
    }
    setLoading(false)
  }

  const handleNoShow = async () => {
    setLoading(true)
    const result = await markViewingNoShow(viewing.id)
    if (result.success) {
      toast.success('Viewing marked as no-show')
      router.refresh()
    } else {
      toast.error(result.error || 'Failed to update viewing')
    }
    setLoading(false)
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-ZA', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  const formatTimeSlot = (slot: string) => {
    switch (slot) {
      case 'morning':
        return '8:00 AM - 12:00 PM'
      case 'afternoon':
        return '12:00 PM - 5:00 PM'
      case 'evening':
        return '5:00 PM - 7:00 PM'
      default:
        return slot
    }
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
                  <p className="text-lg font-bold text-primary mt-1">
                    {formatPrice(property?.price, property?.country?.currency_symbol)}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {getStatusBadge()}
                  {getFinancingBadge()}
                </div>
              </div>

              {/* Viewing Details */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <p className="text-muted-foreground">
                    {viewing.status === 'confirmed' ? 'Confirmed Date' : 'Requested Date'}
                  </p>
                  <p className="font-medium flex items-center gap-1">
                    <Calendar className="h-4 w-4 text-primary" />
                    {formatDate(viewing.confirmed_date || viewing.requested_date)}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground">
                    {viewing.status === 'confirmed' ? 'Time' : 'Preferred Time'}
                  </p>
                  <p className="font-medium flex items-center gap-1">
                    <Clock className="h-4 w-4 text-primary" />
                    {viewing.confirmed_time || formatTimeSlot(viewing.requested_time_slot)}
                  </p>
                </div>
              </div>

              {/* Other Party Info */}
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  {otherParty?.avatar_url ? (
                    <Image
                      src={otherParty.avatar_url}
                      alt={otherParty.full_name}
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                  ) : (
                    <User className="h-5 w-5 text-primary" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{otherParty?.full_name}</p>
                  <p className="text-sm text-muted-foreground">
                    {role === 'buyer' ? 'Property Owner' : 'Interested Buyer'}
                  </p>
                </div>
                {viewing.status === 'confirmed' && (
                  <div className="flex gap-2">
                    {otherParty?.phone && (
                      <Button size="icon" variant="outline" asChild>
                        <a href={`tel:${otherParty.phone}`}>
                          <Phone className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                    {otherParty?.email && (
                      <Button size="icon" variant="outline" asChild>
                        <a href={`mailto:${otherParty.email}`}>
                          <Mail className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                  </div>
                )}
              </div>

              {/* Message */}
              {viewing.buyer_message && (
                <div className="text-sm">
                  <p className="text-muted-foreground mb-1">Message:</p>
                  <p className="italic">"{viewing.buyer_message}"</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap gap-2 pt-2 border-t">
                {role === 'seller' && viewing.status === 'pending' && (
                  <>
                    <Button onClick={() => setShowConfirmDialog(true)} disabled={loading}>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Confirm
                    </Button>
                    <Button variant="outline" onClick={() => setShowCancelDialog(true)} disabled={loading}>
                      <XCircle className="h-4 w-4 mr-2" />
                      Decline
                    </Button>
                  </>
                )}

                {role === 'seller' && viewing.status === 'confirmed' && (
                  <>
                    <Button onClick={handleComplete} disabled={loading}>
                      {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                      Mark Completed
                    </Button>
                    <Button variant="outline" onClick={handleNoShow} disabled={loading}>
                      No Show
                    </Button>
                    <Button variant="ghost" onClick={() => setShowCancelDialog(true)} disabled={loading}>
                      Cancel
                    </Button>
                  </>
                )}

                {role === 'buyer' && (viewing.status === 'pending' || viewing.status === 'confirmed') && (
                  <Button variant="outline" onClick={() => setShowCancelDialog(true)} disabled={loading}>
                    <XCircle className="h-4 w-4 mr-2" />
                    Cancel Viewing
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

      {/* Confirm Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Viewing</DialogTitle>
            <DialogDescription>
              Confirm the viewing date and time for this property
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="date">Confirmed Date</Label>
              <Input
                id="date"
                type="date"
                value={confirmedDate}
                onChange={(e) => setConfirmedDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Confirmed Time</Label>
              <Input
                id="time"
                type="time"
                value={confirmedTime}
                onChange={(e) => setConfirmedTime(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="response">Message to Buyer (Optional)</Label>
              <Textarea
                id="response"
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                placeholder="Any additional information..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirm} disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Confirm Viewing
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Viewing</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this viewing?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="reason">Reason (Optional)</Label>
            <Textarea
              id="reason"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Let them know why..."
              className="mt-2"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
              Keep Viewing
            </Button>
            <Button variant="destructive" onClick={handleCancel} disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Cancel Viewing
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
