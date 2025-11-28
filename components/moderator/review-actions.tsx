'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  CheckCircle,
  XCircle,
  Flag,
  Loader2,
  AlertCircle,
} from 'lucide-react'
import {
  approveProperty,
  rejectProperty,
  flagProperty,
  unflagProperty,
} from '@/lib/actions/moderation'

interface ReviewActionsProps {
  propertyId: string
  currentStatus: string | null
}

export function ReviewActions({ propertyId, currentStatus }: ReviewActionsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [flagReason, setFlagReason] = useState('')
  const [notes, setNotes] = useState('')
  const [rejectOpen, setRejectOpen] = useState(false)
  const [flagOpen, setFlagOpen] = useState(false)

  const handleApprove = async () => {
    setLoading('approve')
    setError(null)
    const result = await approveProperty(propertyId, notes || undefined)
    if (result.success) {
      router.refresh()
    } else {
      setError(result.error || 'Failed to approve')
    }
    setLoading(null)
  }

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      setError('Rejection reason is required')
      return
    }
    setLoading('reject')
    setError(null)
    const result = await rejectProperty(propertyId, rejectReason, notes || undefined)
    if (result.success) {
      setRejectOpen(false)
      setRejectReason('')
      router.refresh()
    } else {
      setError(result.error || 'Failed to reject')
    }
    setLoading(null)
  }

  const handleFlag = async () => {
    if (!flagReason.trim()) {
      setError('Flag reason is required')
      return
    }
    setLoading('flag')
    setError(null)
    const result = await flagProperty(propertyId, flagReason)
    if (result.success) {
      setFlagOpen(false)
      setFlagReason('')
      router.refresh()
    } else {
      setError(result.error || 'Failed to flag')
    }
    setLoading(null)
  }

  const handleUnflag = async () => {
    setLoading('unflag')
    setError(null)
    const result = await unflagProperty(propertyId)
    if (result.success) {
      router.refresh()
    } else {
      setError(result.error || 'Failed to unflag')
    }
    setLoading(null)
  }

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Notes for approval */}
      <div className="space-y-2">
        <Label htmlFor="notes">Internal Notes (optional)</Label>
        <Textarea
          id="notes"
          placeholder="Add any internal notes about this review..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {/* Approve Button */}
        <Button
          onClick={handleApprove}
          disabled={loading !== null || currentStatus === 'approved'}
          className="bg-green-600 hover:bg-green-700"
        >
          {loading === 'approve' ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <CheckCircle className="h-4 w-4 mr-2" />
          )}
          {currentStatus === 'approved' ? 'Approved' : 'Approve'}
        </Button>

        {/* Reject Dialog */}
        <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
          <DialogTrigger asChild>
            <Button
              variant="destructive"
              disabled={loading !== null || currentStatus === 'rejected'}
            >
              <XCircle className="h-4 w-4 mr-2" />
              {currentStatus === 'rejected' ? 'Rejected' : 'Reject'}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject Listing</DialogTitle>
              <DialogDescription>
                Please provide a reason for rejecting this listing. The seller will see this reason.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="rejectReason">Rejection Reason *</Label>
                <Textarea
                  id="rejectReason"
                  placeholder="e.g., Inappropriate images, misleading description, etc."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setRejectOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleReject}
                disabled={loading === 'reject'}
              >
                {loading === 'reject' && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Confirm Rejection
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Flag / Unflag Button */}
        {currentStatus === 'flagged' ? (
          <Button
            variant="outline"
            onClick={handleUnflag}
            disabled={loading !== null}
          >
            {loading === 'unflag' ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Flag className="h-4 w-4 mr-2" />
            )}
            Remove Flag
          </Button>
        ) : (
          <Dialog open={flagOpen} onOpenChange={setFlagOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" disabled={loading !== null}>
                <Flag className="h-4 w-4 mr-2" />
                Flag for Review
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Flag Listing</DialogTitle>
                <DialogDescription>
                  Flag this listing for additional review. This doesn&apos;t reject the listing but marks it for attention.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="flagReason">Flag Reason *</Label>
                  <Textarea
                    id="flagReason"
                    placeholder="Why does this listing need additional review?"
                    value={flagReason}
                    onChange={(e) => setFlagReason(e.target.value)}
                    rows={4}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setFlagOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleFlag}
                  disabled={loading === 'flag'}
                  className="bg-yellow-600 hover:bg-yellow-700"
                >
                  {loading === 'flag' && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Flag Listing
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  )
}
