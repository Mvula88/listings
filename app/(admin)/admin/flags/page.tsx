import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FadeIn } from '@/components/ui/fade-in'
import {
  Flag,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Building,
  User,
  MessageSquare,
} from 'lucide-react'
import Link from 'next/link'
import { FlagActions } from '@/components/admin/flag-actions'

interface ContentFlag {
  id: string
  content_type: string
  content_id: string
  reason: string
  description: string | null
  status: string
  reporter_id: string
  created_at: string
  reporter: {
    full_name: string | null
    email: string
  } | null
}

export default async function AdminFlagsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status: statusFilter } = await searchParams
  const supabase = await createClient()

  // Build query
  let query = supabase
    .from('content_flags')
    .select(`
      *,
      reporter:profiles!content_flags_reporter_id_fkey (
        full_name,
        email
      )
    `)
    .order('created_at', { ascending: false })

  if (statusFilter) {
    query = query.eq('status', statusFilter)
  }

  const { data: flags, error } = await query

  // Get stats
  const { count: totalFlags } = await supabase
    .from('content_flags')
    .select('*', { count: 'exact', head: true })

  const { count: pendingFlags } = await supabase
    .from('content_flags')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending')

  const { count: resolvedFlags } = await supabase
    .from('content_flags')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'resolved')

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    reviewing: 'bg-blue-100 text-blue-700',
    resolved: 'bg-green-100 text-green-700',
    dismissed: 'bg-gray-100 text-gray-700',
  }

  const contentTypeIcons: Record<string, any> = {
    property: Building,
    user: User,
    message: MessageSquare,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <FadeIn>
        <div>
          <h1 className="text-3xl font-bold">Content Flags</h1>
          <p className="text-muted-foreground mt-1">
            Review and resolve reported content
          </p>
        </div>
      </FadeIn>

      {/* Stats */}
      <FadeIn delay={0.1}>
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Flags</CardTitle>
              <Flag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalFlags || 0}</div>
            </CardContent>
          </Card>

          <Card className="border-yellow-200 bg-yellow-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-yellow-700">Pending Review</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-700">{pendingFlags || 0}</div>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-green-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-700">Resolved</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-700">{resolvedFlags || 0}</div>
            </CardContent>
          </Card>
        </div>
      </FadeIn>

      {/* Filters */}
      <FadeIn delay={0.2}>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filter by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Button
                variant={!statusFilter ? 'default' : 'outline'}
                size="sm"
                asChild
              >
                <Link href="/admin/flags">All</Link>
              </Button>
              <Button
                variant={statusFilter === 'pending' ? 'default' : 'outline'}
                size="sm"
                asChild
              >
                <Link href="/admin/flags?status=pending">
                  <Clock className="h-4 w-4 mr-1" />
                  Pending
                </Link>
              </Button>
              <Button
                variant={statusFilter === 'reviewing' ? 'default' : 'outline'}
                size="sm"
                asChild
              >
                <Link href="/admin/flags?status=reviewing">
                  <Eye className="h-4 w-4 mr-1" />
                  Reviewing
                </Link>
              </Button>
              <Button
                variant={statusFilter === 'resolved' ? 'default' : 'outline'}
                size="sm"
                asChild
              >
                <Link href="/admin/flags?status=resolved">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Resolved
                </Link>
              </Button>
              <Button
                variant={statusFilter === 'dismissed' ? 'default' : 'outline'}
                size="sm"
                asChild
              >
                <Link href="/admin/flags?status=dismissed">
                  <XCircle className="h-4 w-4 mr-1" />
                  Dismissed
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </FadeIn>

      {/* Flags List */}
      <FadeIn delay={0.3}>
        <Card>
          <CardHeader>
            <CardTitle>
              {statusFilter ? `${statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)} Flags` : 'All Flags'}
            </CardTitle>
            <CardDescription>
              {(flags as ContentFlag[] | null)?.length || 0} flag(s) found
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error ? (
              <div className="text-center py-8 text-red-500">
                Error loading flags: {error.message}
              </div>
            ) : !flags || flags.length === 0 ? (
              <div className="text-center py-12">
                <Flag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold">No flags found</h3>
                <p className="text-muted-foreground mt-2">
                  {statusFilter
                    ? `No ${statusFilter} flags to review`
                    : 'No content has been flagged yet'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {(flags as ContentFlag[]).map((flag) => {
                  const Icon = contentTypeIcons[flag.content_type] || AlertTriangle
                  return (
                    <div
                      key={flag.id}
                      className={`border rounded-lg p-4 ${
                        flag.status === 'pending'
                          ? 'border-yellow-300 bg-yellow-50/50'
                          : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                            <Icon className="h-5 w-5 text-red-600" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">
                                {flag.content_type.charAt(0).toUpperCase() + flag.content_type.slice(1)} Flag
                              </h3>
                              <Badge className={statusColors[flag.status] || 'bg-gray-100'}>
                                {flag.status}
                              </Badge>
                            </div>
                            <p className="text-sm font-medium text-red-600 mt-1">
                              Reason: {flag.reason}
                            </p>
                            {flag.description && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {flag.description}
                              </p>
                            )}
                            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                              <span>
                                Reported by: {flag.reporter?.full_name || flag.reporter?.email || 'Unknown'}
                              </span>
                              <span>
                                {new Date(flag.created_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <FlagActions flagId={flag.id} currentStatus={flag.status} contentType={flag.content_type} contentId={flag.content_id} />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </FadeIn>
    </div>
  )
}
