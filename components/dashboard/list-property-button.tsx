'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { PlusCircle, Loader2, Home, TrendingUp, Users } from 'lucide-react'
import { upgradeToSeller } from '@/lib/actions/roles'
import { useToast } from '@/lib/hooks/use-toast'

interface ListPropertyButtonProps {
  userType: string
}

export function ListPropertyButton({ userType }: ListPropertyButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  // If already a seller, just show a regular link
  if (userType === 'seller') {
    return (
      <Button variant="default" size="sm" asChild>
        <Link href="/properties/new" className="flex items-center gap-2">
          <PlusCircle className="h-4 w-4" />
          List Property
        </Link>
      </Button>
    )
  }

  // For buyers, show button that opens upgrade dialog
  async function handleUpgradeAndList() {
    setIsLoading(true)

    try {
      const result = await upgradeToSeller()

      if (result.success) {
        toast.success('You are now a seller! Redirecting to list your property...')
        setIsDialogOpen(false)
        router.push('/properties/new')
        router.refresh()
      } else {
        toast.error(result.error || 'Failed to upgrade to seller')
      }
    } catch (error) {
      toast.error('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Button
        variant="default"
        size="sm"
        onClick={() => setIsDialogOpen(true)}
        className="flex items-center gap-2"
      >
        <PlusCircle className="h-4 w-4" />
        List Property
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Home className="h-5 w-5 text-primary" />
              Want to List a Property?
            </DialogTitle>
            <DialogDescription>
              To list properties on PropLinka, you need to become a seller. This will add the Seller role to your account.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-3">
            <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
              <TrendingUp className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="text-sm font-medium">Save up to 92% on fees</p>
                <p className="text-xs text-muted-foreground">
                  Our flat-fee model saves you thousands compared to agent commissions
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
              <Users className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="text-sm font-medium">Connect directly with buyers</p>
                <p className="text-xs text-muted-foreground">
                  No middlemen - communicate directly with interested buyers
                </p>
              </div>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            You can switch between Buyer and Seller roles anytime using the Role Switcher in your dashboard.
          </p>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleUpgradeAndList}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Upgrading...
                </>
              ) : (
                <>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Become a Seller
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
