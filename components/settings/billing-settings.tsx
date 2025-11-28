'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { CreditCard } from 'lucide-react'
import Link from 'next/link'

export function BillingSettings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Billing
        </CardTitle>
        <CardDescription>
          Manage your billing information
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Payment Methods</p>
            <p className="text-sm text-muted-foreground">Manage your payment methods</p>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/payments">Manage</Link>
          </Button>
        </div>
        <Separator />
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Billing History</p>
            <p className="text-sm text-muted-foreground">View your past transactions</p>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/transactions">View History</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
