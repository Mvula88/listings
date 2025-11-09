import { Suspense } from 'react'
import { getContentFlags } from '@/lib/admin/actions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ModerationTable } from '@/components/admin/moderation-table'
import { AlertTriangle, CheckCircle, Clock, XCircle } from 'lucide-react'

export const dynamic = 'force-dynamic'

async function ModerationPageContent() {
  const flagsData = await getContentFlags({ page: 1, pageSize: 20 })

  // Calculate stats
  const pendingCount = flagsData.flags?.filter((f: any) => f.status === 'pending').length || 0
  const approvedCount = flagsData.flags?.filter((f: any) => f.status === 'approved').length || 0
  const rejectedCount = flagsData.flags?.filter((f: any) => f.status === 'rejected').length || 0
  const flaggedCount = flagsData.flags?.filter((f: any) => f.status === 'flagged').length || 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Content Moderation</h1>
        <p className="text-muted-foreground mt-1">
          Review and moderate flagged content from users
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingCount}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting moderation
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{approvedCount}</div>
            <p className="text-xs text-muted-foreground">
              Content approved
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rejectedCount}</div>
            <p className="text-xs text-muted-foreground">
              Content removed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Flagged</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{flaggedCount}</div>
            <p className="text-xs text-muted-foreground">
              Requires attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Moderation Table */}
      <Card>
        <CardHeader>
          <CardTitle>Content Flags</CardTitle>
          <CardDescription>
            Review flagged properties, reviews, and messages
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ModerationTable initialData={flagsData} />
        </CardContent>
      </Card>
    </div>
  )
}

export default function ModerationPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ModerationPageContent />
    </Suspense>
  )
}
