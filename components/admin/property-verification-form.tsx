'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

interface PropertyVerificationFormProps {
  propertyId: string
  currentStatus: string
  ownerEmail?: string
  propertyTitle: string
}

export function PropertyVerificationForm({
  propertyId,
  currentStatus,
  ownerEmail,
  propertyTitle,
}: PropertyVerificationFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [action, setAction] = useState<'approve' | 'reject' | null>(null)
  const [notes, setNotes] = useState('')
  const [rejectionReason, setRejectionReason] = useState('')
  const supabase = createClient()

  async function handleVerification(verificationAction: 'approve' | 'reject') {
    if (verificationAction === 'reject' && !rejectionReason) {
      toast.error('Please provide a reason for rejection')
      return
    }

    setLoading(true)
    setAction(verificationAction)

    try {
      const newStatus = verificationAction === 'approve' ? 'active' : 'rejected'

      // Update property status
      const { error: updateError } = await (supabase
        .from('properties') as any)
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('id', propertyId)

      if (updateError) throw updateError

      // Create verification record
      const { data: { user } } = await supabase.auth.getUser()

      const { error: verificationError } = await (supabase
        .from('property_verifications') as any)
        .insert({
          property_id: propertyId,
          admin_id: user?.id,
          status: newStatus,
          notes: verificationAction === 'reject' ? rejectionReason : notes,
          verified_at: new Date().toISOString(),
        })

      if (verificationError) {
        console.error('Failed to create verification record:', verificationError)
        // Don't throw - the main update succeeded
      }

      // Send email notification to owner
      if (ownerEmail) {
        try {
          await fetch('/api/email/property-verification', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              to: ownerEmail,
              propertyTitle,
              status: newStatus,
              reason: verificationAction === 'reject' ? rejectionReason : undefined,
            }),
          })
        } catch (emailError) {
          console.error('Failed to send email:', emailError)
          // Don't throw - the main update succeeded
        }
      }

      toast.success(
        verificationAction === 'approve'
          ? 'Property approved and activated!'
          : 'Property rejected. Owner has been notified.'
      )

      router.push('/admin/properties')
      router.refresh()
    } catch (error: any) {
      console.error('Verification error:', error)
      toast.error(error.message || 'Failed to update property status')
    } finally {
      setLoading(false)
      setAction(null)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Verification Actions</CardTitle>
        <CardDescription>
          Review and approve or reject this property listing
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {currentStatus === 'pending' && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              This property is pending verification. Please review all details before taking action.
            </AlertDescription>
          </Alert>
        )}

        {currentStatus === 'active' && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-900">
              This property has been approved and is currently active.
            </AlertDescription>
          </Alert>
        )}

        {currentStatus === 'rejected' && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>
              This property has been rejected.
            </AlertDescription>
          </Alert>
        )}

        {/* Admin Notes */}
        <div className="space-y-2">
          <Label htmlFor="notes">Admin Notes (Optional)</Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any internal notes about this property..."
            rows={3}
          />
          <p className="text-xs text-muted-foreground">
            These notes are for internal use only and will not be sent to the owner.
          </p>
        </div>

        {/* Rejection Reason */}
        <div className="space-y-2">
          <Label htmlFor="rejectionReason">Rejection Reason</Label>
          <Select value={rejectionReason} onValueChange={setRejectionReason}>
            <SelectTrigger>
              <SelectValue placeholder="Select a reason (required if rejecting)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="incomplete_info">Incomplete Information</SelectItem>
              <SelectItem value="poor_quality_images">Poor Quality Images</SelectItem>
              <SelectItem value="suspicious_listing">Suspicious or Fraudulent Listing</SelectItem>
              <SelectItem value="duplicate_listing">Duplicate Listing</SelectItem>
              <SelectItem value="incorrect_pricing">Incorrect or Unrealistic Pricing</SelectItem>
              <SelectItem value="inappropriate_content">Inappropriate Content</SelectItem>
              <SelectItem value="missing_documents">Missing Required Documents</SelectItem>
              <SelectItem value="property_not_available">Property No Longer Available</SelectItem>
              <SelectItem value="other">Other (see notes)</SelectItem>
            </SelectContent>
          </Select>
          {rejectionReason && (
            <p className="text-xs text-muted-foreground">
              This reason will be sent to the property owner via email.
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 pt-4">
          <Button
            onClick={() => handleVerification('approve')}
            disabled={loading || currentStatus === 'active'}
            className="w-full"
            variant="default"
          >
            {loading && action === 'approve' && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {!loading && <CheckCircle className="mr-2 h-4 w-4" />}
            {currentStatus === 'active' ? 'Already Approved' : 'Approve Property'}
          </Button>

          <Button
            onClick={() => handleVerification('reject')}
            disabled={loading || currentStatus === 'rejected' || !rejectionReason}
            className="w-full"
            variant="destructive"
          >
            {loading && action === 'reject' && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {!loading && <XCircle className="mr-2 h-4 w-4" />}
            {currentStatus === 'rejected' ? 'Already Rejected' : 'Reject Property'}
          </Button>
        </div>

        {/* Checklist for admins */}
        <div className="pt-4 border-t space-y-2">
          <h4 className="text-sm font-semibold">Verification Checklist</h4>
          <ul className="text-xs space-y-1 text-muted-foreground">
            <li>✓ Property details are complete and accurate</li>
            <li>✓ Images are clear and show the property adequately</li>
            <li>✓ Pricing is realistic for the market</li>
            <li>✓ Address and location information is correct</li>
            <li>✓ No signs of fraudulent or duplicate listing</li>
            <li>✓ Owner information is verified</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
