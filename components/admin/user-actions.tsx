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
import { useToast } from '@/lib/hooks/use-toast'
import { suspendUser, unsuspendUser, deleteUser } from '@/lib/admin/actions'

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
  const { toast } = useToast()

  async function handleSuspend() {
    setLoading(true)
    try {
      if (user.is_suspended) {
        await unsuspendUser(userId)
        toast.success('User unsuspended')
      } else {
        await suspendUser(userId, 'Suspended by admin')
        toast.success('User suspended')
      }
      router.refresh()
    } catch (error: any) {
      console.error('Suspend error:', error)
      toast.error('Failed: ' + (error.message || 'Unknown error'))
    } finally {
      setLoading(false)
      setShowSuspendDialog(false)
    }
  }

  async function handleDelete() {
    setLoading(true)
    try {
      await deleteUser(userId)
      toast.success('User account deleted')
      router.push('/admin/users')
    } catch (error: any) {
      console.error('Delete error:', error)
      toast.error('Failed: ' + (error.message || 'Unknown error'))
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
