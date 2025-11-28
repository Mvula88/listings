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
            <p className="font-medium">Featured Listings</p>
            <p className="text-sm text-muted-foreground">View and manage your featured properties</p>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/featured">View Featured</Link>
          </Button>
        </div>
        <Separator />
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Transaction History</p>
            <p className="text-sm text-muted-foreground">View your property transactions</p>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/transactions">View History</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
