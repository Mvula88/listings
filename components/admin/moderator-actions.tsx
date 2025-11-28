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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  MoreHorizontal,
  UserX,
  UserCheck,
  Trash2,
  Loader2,
} from 'lucide-react'
import {
  suspendModerator,
  unsuspendModerator,
  removeModerator,
} from '@/lib/actions/admin-moderators'

interface ModeratorActionsProps {
  moderatorId: string
  status: string | null
}

export function ModeratorActions({ moderatorId, status }: ModeratorActionsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [suspendOpen, setSuspendOpen] = useState(false)
  const [removeOpen, setRemoveOpen] = useState(false)
  const [suspendReason, setSuspendReason] = useState('')

  const handleSuspend = async () => {
    if (!suspendReason.trim()) return
    setLoading('suspend')
    await suspendModerator(moderatorId, suspendReason)
    setSuspendOpen(false)
    setSuspendReason('')
    setLoading(null)
    router.refresh()
  }

  const handleUnsuspend = async () => {
    setLoading('unsuspend')
    await unsuspendModerator(moderatorId)
    setLoading(null)
    router.refresh()
  }

  const handleRemove = async () => {
    setLoading('remove')
    await removeModerator(moderatorId)
    setRemoveOpen(false)
    setLoading(null)
    router.refresh()
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {status === 'suspended' ? (
            <DropdownMenuItem onClick={handleUnsuspend} disabled={loading !== null}>
              {loading === 'unsuspend' ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <UserCheck className="h-4 w-4 mr-2" />
              )}
              Unsuspend
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem onClick={() => setSuspendOpen(true)}>
              <UserX className="h-4 w-4 mr-2" />
              Suspend
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setRemoveOpen(true)}
            className="text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Remove Moderator
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Suspend Dialog */}
      <Dialog open={suspendOpen} onOpenChange={setSuspendOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Suspend Moderator</DialogTitle>
            <DialogDescription>
              This will prevent the moderator from accessing the moderation dashboard.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="suspendReason">Suspension Reason *</Label>
              <Textarea
                id="suspendReason"
                placeholder="Why is this moderator being suspended?"
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSuspendOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleSuspend}
              disabled={loading === 'suspend' || !suspendReason.trim()}
            >
              {loading === 'suspend' && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Suspend Moderator
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Dialog */}
      <Dialog open={removeOpen} onOpenChange={setRemoveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Moderator</DialogTitle>
            <DialogDescription>
              This will remove the moderator role from this user. They will become a regular user
              and will no longer have access to the moderation dashboard. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRemoveOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRemove}
              disabled={loading === 'remove'}
            >
              {loading === 'remove' && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Remove Moderator
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
