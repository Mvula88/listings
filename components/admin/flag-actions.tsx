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
import { MoreHorizontal, CheckCircle, XCircle, Eye, ExternalLink, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/lib/hooks/use-toast'
import Link from 'next/link'

interface FlagActionsProps {
  flagId: string
  currentStatus: string
  contentType: string
  contentId: string
}

export function FlagActions({ flagId, currentStatus, contentType, contentId }: FlagActionsProps) {
  const [loading, setLoading] = useState(false)
  const [showResolveDialog, setShowResolveDialog] = useState(false)
  const [showDismissDialog, setShowDismissDialog] = useState(false)
  const router = useRouter()
  const supabase = createClient()
  const { toast } = useToast()

  const contentLinks: Record<string, string> = {
    property: `/admin/properties/${contentId}`,
    user: `/admin/users/${contentId}`,
    message: `/admin/messages/${contentId}`,
  }

  async function updateStatus(newStatus: string) {
    setLoading(true)
    try {
      const { error } = await supabase
        .from('content_flags')
        .update({
          status: newStatus,
          resolved_at: newStatus === 'resolved' || newStatus === 'dismissed' ? new Date().toISOString() : null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', flagId)

      if (error) throw error

      toast.success(`Flag ${newStatus}`)
      router.refresh()
    } catch (error: any) {
      toast.error('Failed: ' + error.message)
    } finally {
      setLoading(false)
      setShowResolveDialog(false)
      setShowDismissDialog(false)
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" disabled={loading}>
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <MoreHorizontal className="h-4 w-4" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link href={contentLinks[contentType] || '#'}>
              <ExternalLink className="h-4 w-4 mr-2" />
              View {contentType}
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {currentStatus === 'pending' && (
            <DropdownMenuItem onClick={() => updateStatus('reviewing')}>
              <Eye className="h-4 w-4 mr-2" />
              Mark as Reviewing
            </DropdownMenuItem>
          )}
          {currentStatus !== 'resolved' && (
            <DropdownMenuItem onClick={() => setShowResolveDialog(true)}>
              <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
              Resolve (Action Taken)
            </DropdownMenuItem>
          )}
          {currentStatus !== 'dismissed' && (
            <DropdownMenuItem onClick={() => setShowDismissDialog(true)}>
              <XCircle className="h-4 w-4 mr-2 text-gray-600" />
              Dismiss (No Action)
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Resolve Dialog */}
      <AlertDialog open={showResolveDialog} onOpenChange={setShowResolveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Resolve Flag?</AlertDialogTitle>
            <AlertDialogDescription>
              This indicates that action has been taken on the reported content.
              Make sure you've addressed the issue before resolving.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => updateStatus('resolved')}
              className="bg-green-600 hover:bg-green-700"
            >
              Resolve
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dismiss Dialog */}
      <AlertDialog open={showDismissDialog} onOpenChange={setShowDismissDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Dismiss Flag?</AlertDialogTitle>
            <AlertDialogDescription>
              This indicates that the flag was reviewed but no action is needed.
              The content does not violate any guidelines.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => updateStatus('dismissed')}>
              Dismiss
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
