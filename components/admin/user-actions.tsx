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
import { MoreHorizontal, Ban, CheckCircle, Trash2, Mail, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/lib/hooks/use-toast'

interface UserActionsProps {
  userId: string
  user: {
    is_suspended?: boolean
    email?: string
    full_name?: string
  }
}

export function UserActions({ userId, user }: UserActionsProps) {
  const [loading, setLoading] = useState(false)
  const [showSuspendDialog, setShowSuspendDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const router = useRouter()
  const supabase = createClient()
  const { toast } = useToast()

  async function handleSuspend() {
    setLoading(true)
    try {
      const newStatus = !user.is_suspended
      const { error } = await supabase
        .from('profiles')
        .update({ is_suspended: newStatus })
        .eq('id', userId)

      if (error) throw error

      toast.success(newStatus ? 'User suspended' : 'User unsuspended')
      router.refresh()
    } catch (error: any) {
      toast.error('Failed: ' + error.message)
    } finally {
      setLoading(false)
      setShowSuspendDialog(false)
    }
  }

  async function handleDelete() {
    setLoading(true)
    try {
      // Note: This soft-deletes by updating the profile
      // Full deletion would require admin API access
      const { error } = await supabase
        .from('profiles')
        .update({
          is_suspended: true,
          full_name: '[Deleted User]',
          phone: null,
        })
        .eq('id', userId)

      if (error) throw error

      toast.success('User account deleted')
      router.push('/admin/users')
    } catch (error: any) {
      toast.error('Failed: ' + error.message)
    } finally {
      setLoading(false)
      setShowDeleteDialog(false)
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreHorizontal className="h-4 w-4" />}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => window.open(`mailto:${user.email}`)}>
            <Mail className="h-4 w-4 mr-2" />
            Send Email
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setShowSuspendDialog(true)}>
            {user.is_suspended ? (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Unsuspend User
              </>
            ) : (
              <>
                <Ban className="h-4 w-4 mr-2" />
                Suspend User
              </>
            )}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setShowDeleteDialog(true)}
            className="text-red-600"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete User
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Suspend Dialog */}
      <AlertDialog open={showSuspendDialog} onOpenChange={setShowSuspendDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {user.is_suspended ? 'Unsuspend User?' : 'Suspend User?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {user.is_suspended
                ? 'This will restore the user\'s access to the platform.'
                : 'This will prevent the user from accessing the platform until unsuspended.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSuspend}>
              {user.is_suspended ? 'Unsuspend' : 'Suspend'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User Account?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The user's personal information will be removed
              and their account will be permanently suspended.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete Account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
