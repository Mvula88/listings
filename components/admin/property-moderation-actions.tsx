'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { CheckCircle, XCircle, MoreHorizontal, Loader2, Star, StarOff } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/lib/hooks/use-toast'

interface PropertyModerationActionsProps {
  propertyId: string
  currentStatus: string
}

export function PropertyModerationActions({
  propertyId,
  currentStatus,
}: PropertyModerationActionsProps) {
  const [loading, setLoading] = useState(false)
  const [showApproveDialog, setShowApproveDialog] = useState(false)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const router = useRouter()
  const supabase = createClient()
  const { toast } = useToast()

  async function handleApprove() {
    setLoading(true)
    try {
      const { error } = await (supabase as any)
        .from('properties')
        .update({
          moderation_status: 'approved',
          status: 'active',
          published_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', propertyId)

      if (error) throw error

      toast.success('Property approved and published')
      router.refresh()
    } catch (error: any) {
      toast.error('Failed: ' + error.message)
    } finally {
      setLoading(false)
      setShowApproveDialog(false)
    }
  }

  async function handleReject() {
    setLoading(true)
    try {
      const { error } = await (supabase as any)
        .from('properties')
        .update({
          moderation_status: 'rejected',
          status: 'rejected',
          rejection_reason: rejectionReason,
          updated_at: new Date().toISOString(),
        })
        .eq('id', propertyId)

      if (error) throw error

      toast.success('Property rejected')
      router.refresh()
    } catch (error: any) {
      toast.error('Failed: ' + error.message)
    } finally {
      setLoading(false)
      setShowRejectDialog(false)
      setRejectionReason('')
    }
  }

  async function toggleFeatured() {
    setLoading(true)
    try {
      const { data: property } = await (supabase as any)
        .from('properties')
        .select('is_featured')
        .eq('id', propertyId)
        .single()

      const { error } = await (supabase as any)
        .from('properties')
        .update({ is_featured: !property?.is_featured })
        .eq('id', propertyId)

      if (error) throw error

      toast.success(property?.is_featured ? 'Removed from featured' : 'Added to featured')
      router.refresh()
    } catch (error: any) {
      toast.error('Failed: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" disabled={loading}>
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                Actions <MoreHorizontal className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {currentStatus !== 'approved' && (
            <DropdownMenuItem onClick={() => setShowApproveDialog(true)}>
              <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
              Approve Property
            </DropdownMenuItem>
          )}
          {currentStatus !== 'rejected' && (
            <DropdownMenuItem onClick={() => setShowRejectDialog(true)}>
              <XCircle className="h-4 w-4 mr-2 text-red-600" />
              Reject Property
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={toggleFeatured}>
            <Star className="h-4 w-4 mr-2" />
            Toggle Featured
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Approve Dialog */}
      <AlertDialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve Property?</AlertDialogTitle>
            <AlertDialogDescription>
              This will approve the property and make it publicly visible on the platform.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleApprove} className="bg-green-600 hover:bg-green-700">
              Approve
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Dialog */}
      <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Property?</AlertDialogTitle>
            <AlertDialogDescription>
              Please provide a reason for rejection. This will be sent to the seller.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Label htmlFor="reason">Rejection Reason</Label>
            <Textarea
              id="reason"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g., Images are unclear, description violates guidelines..."
              className="mt-2"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReject}
              className="bg-red-600 hover:bg-red-700"
              disabled={!rejectionReason.trim()}
            >
              Reject
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
