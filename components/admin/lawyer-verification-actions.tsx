'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/lib/hooks/use-toast'

interface LawyerVerificationActionsProps {
  lawyerId: string
  isVerified: boolean
}

export function LawyerVerificationActions({
  lawyerId,
  isVerified,
}: LawyerVerificationActionsProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()
  const { toast } = useToast()

  async function handleVerify() {
    setLoading(true)
    try {
      const { error } = await (supabase as any)
        .from('lawyers')
        .update({ verified: true, updated_at: new Date().toISOString() })
        .eq('id', lawyerId)

      if (error) {
        toast.error('Failed to verify lawyer: ' + error.message)
      } else {
        toast.success('Lawyer verified successfully!')
        router.refresh()
      }
    } catch (error) {
      toast.error('An error occurred')
    } finally {
      setLoading(false)
    }
  }

  async function handleUnverify() {
    setLoading(true)
    try {
      const { error } = await (supabase as any)
        .from('lawyers')
        .update({ verified: false, updated_at: new Date().toISOString() })
        .eq('id', lawyerId)

      if (error) {
        toast.error('Failed to unverify lawyer: ' + error.message)
      } else {
        toast.success('Lawyer verification removed')
        router.refresh()
      }
    } catch (error) {
      toast.error('An error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (isVerified) {
    return (
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="outline" size="sm" disabled={loading}>
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <XCircle className="h-4 w-4 mr-1" />
                Remove Verification
              </>
            )}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Verification?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the lawyer's verified status. They will no longer appear
              in the public lawyer directory and won't be able to accept new clients
              until re-verified.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleUnverify}
              className="bg-red-600 hover:bg-red-700"
            >
              Remove Verification
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )
  }

  return (
    <div className="flex gap-2">
      <Button
        variant="default"
        size="sm"
        onClick={handleVerify}
        disabled={loading}
        className="bg-green-600 hover:bg-green-700"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            <CheckCircle className="h-4 w-4 mr-1" />
            Verify Lawyer
          </>
        )}
      </Button>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="outline" size="sm" disabled={loading}>
            <XCircle className="h-4 w-4 mr-1" />
            Reject
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Application?</AlertDialogTitle>
            <AlertDialogDescription>
              This will reject the lawyer's application. They will need to re-apply
              with correct credentials. Consider contacting them first if there are
              minor issues that can be corrected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700">
              Reject Application
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
