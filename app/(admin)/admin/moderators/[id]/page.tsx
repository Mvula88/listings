import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FadeIn } from '@/components/ui/fade-in'
import {
  User,
  Mail,
  Calendar,
  Shield,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Activity,
} from 'lucide-react'
import Link from 'next/link'
import { ModeratorActions } from '@/components/admin/moderator-actions'

// Note: ModeratorActions expects {moderatorId, status} interface

interface PageProps {
  params: { id: string }
}

export default async function AdminModeratorDetailPage({ params }: PageProps) {
  const supabase = await createClient()

  // Get moderator
  const { data: moderator, error } = await supabase
    .from('admin_users')
    .select(`
      *,
      profile:profiles (
        full_name,
        email,
        phone
      )
    `)
    .eq('id', params.id)
    .single()

  if (error || !moderator) {
    notFound()
  }

  // Get recent audit logs for this moderator
  const { data: auditLogs } = await supabase
    .from('audit_logs')
    .select('*')
    .eq('admin_id', params.id)
    .order('created_at', { ascending: false })
    .limit(10)

  const roleColors: Record<string, string> = {
    super_admin: 'bg-purple-100 text-purple-700',
    admin: 'bg-blue-100 text-blue-700',
    moderator: 'bg-green-100 text-green-700',
  }

  const allPermissions = [
    { key: 'users.view', label: 'View Users' },
    { key: 'users.edit', label: 'Edit Users' },
    { key: 'users.suspend', label: 'Suspend Users' },
    { key: 'properties.view', label: 'View Properties' },
    { key: 'properties.edit', label: 'Edit Properties' },
    { key: 'properties.delete', label: 'Delete Properties' },
    { key: 'lawyers.view', label: 'View Lawyers' },
    { key: 'lawyers.verify', label: 'Verify Lawyers' },
    { key: 'transactions.view', label: 'View Transactions' },
    { key: 'content.moderate', label: 'Moderate Content' },
    { key: 'analytics.view', label: 'View Analytics' },
    { key: 'audit.view', label: 'View Audit Logs' },
    { key: 'settings.view', label: 'View Settings' },
    { key: 'settings.edit', label: 'Edit Settings' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <FadeIn>
        <div className="flex items-center gap-4">
          <Link href="/admin/moderators">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">
              {moderator.profile?.full_name || moderator.profile?.email || 'Moderator'}
            </h1>
            <p className="text-muted-foreground">{moderator.profile?.email}</p>
          </div>
          <ModeratorActions moderatorId={params.id} status={moderator.is_active ? 'active' : 'suspended'} />
        </div>
      </FadeIn>

      {/* Status Badges */}
      <FadeIn delay={0.1}>
        <div className="flex gap-2">
          <Badge className={roleColors[moderator.role] || 'bg-gray-100'}>
            {moderator.role?.replace('_', ' ')}
          </Badge>
          <Badge variant={moderator.is_active ? 'default' : 'secondary'}>
            {moderator.is_active ? 'Active' : 'Inactive'}
          </Badge>
        </div>
      </FadeIn>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic Info */}
        <FadeIn delay={0.2}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{moderator.profile?.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <span className="capitalize">{moderator.role?.replace('_', ' ')}</span>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Added {new Date(moderator.created_at).toLocaleDateString()}</span>
              </div>
              {moderator.last_login && (
                <div className="flex items-center gap-3">
                  <Activity className="h-4 w-4 text-muted-foreground" />
                  <span>Last login: {new Date(moderator.last_login).toLocaleDateString()}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </FadeIn>

        {/* Permissions */}
        <FadeIn delay={0.3}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Permissions
              </CardTitle>
              <CardDescription>
                {moderator.role === 'super_admin'
                  ? 'Super admin has all permissions'
                  : 'Assigned permissions for this moderator'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {moderator.role === 'super_admin' ? (
                <p className="text-sm text-muted-foreground">
                  Super administrators have unrestricted access to all features.
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {allPermissions.map((perm) => {
                    const hasPermission = moderator.permissions?.includes(perm.key)
                    return (
                      <div
                        key={perm.key}
                        className={`flex items-center gap-2 p-2 rounded text-sm ${
                          hasPermission ? 'bg-green-50' : 'bg-gray-50'
                        }`}
                      >
                        {hasPermission ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-gray-400" />
                        )}
                        <span className={hasPermission ? '' : 'text-muted-foreground'}>
                          {perm.label}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </FadeIn>

        {/* Audit Logs */}
        <FadeIn delay={0.4} className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent Activity
              </CardTitle>
              <CardDescription>
                Recent actions performed by this moderator
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!auditLogs || auditLogs.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No recent activity recorded
                </p>
              ) : (
                <div className="space-y-3">
                  {auditLogs.map((log: any) => (
                    <div
                      key={log.id}
                      className="flex items-center justify-between p-3 border rounded"
                    >
                      <div>
                        <p className="font-medium">{log.action}</p>
                        <p className="text-sm text-muted-foreground">
                          {log.resource_type}: {log.resource_id}
                        </p>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {new Date(log.created_at).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </FadeIn>
      </div>
    </div>
  )
}
