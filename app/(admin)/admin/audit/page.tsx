import { Suspense } from 'react'
import { getAuditLogs } from '@/lib/admin/actions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AuditLogsTable } from '@/components/admin/audit-logs-table'
import { FileText, Activity, Shield, AlertCircle } from 'lucide-react'

export const dynamic = 'force-dynamic'

async function AuditLogsPageContent() {
  const logsData = await getAuditLogs({ page: 1, pageSize: 50 })

  // Calculate stats
  const totalLogs = logsData.pagination.totalCount
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayLogs = logsData.logs?.filter((log: any) =>
    new Date(log.created_at) >= today
  ).length || 0

  const userActions = logsData.logs?.filter((log: any) =>
    log.action.startsWith('user.')
  ).length || 0

  const propertyActions = logsData.logs?.filter((log: any) =>
    log.action.startsWith('property.')
  ).length || 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Audit Logs</h1>
        <p className="text-muted-foreground mt-1">
          Complete audit trail of all admin actions on the platform
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Logs</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalLogs}</div>
            <p className="text-xs text-muted-foreground">
              All time audit logs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayLogs}</div>
            <p className="text-xs text-muted-foreground">
              Actions logged today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">User Actions</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userActions}</div>
            <p className="text-xs text-muted-foreground">
              User management actions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Property Actions</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{propertyActions}</div>
            <p className="text-xs text-muted-foreground">
              Property moderation actions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Audit Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Audit Trail</CardTitle>
          <CardDescription>
            View detailed logs of all administrative actions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AuditLogsTable initialData={logsData} />
        </CardContent>
      </Card>
    </div>
  )
}

export default function AuditLogsPage() {
  return (
    <Suspense fallback={<div>Loading audit logs...</div>}>
      <AuditLogsPageContent />
    </Suspense>
  )
}
