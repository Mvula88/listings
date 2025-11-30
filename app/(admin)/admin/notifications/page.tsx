import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FadeIn } from '@/components/ui/fade-in'
import {
  Bell,
  CheckCircle,
  Clock,
  Building,
  User,
  Scale,
  AlertTriangle,
  Flag,
  MessageSquare,
  Settings,
} from 'lucide-react'
import Link from 'next/link'

interface AdminNotification {
  id: string
  type: string
  title: string
  message: string
  data: any
  read: boolean
  created_at: string
}

export default async function AdminNotificationsPage() {
  const supabase = await createClient()

  // Get admin user
  const { data: { user } } = await supabase.auth.getUser()

  // Get admin notifications (system-wide for admins)
  const { data: notifications } = await supabase
    .from('admin_notifications')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50)

  // Get counts
  const { count: unreadCount } = await supabase
    .from('admin_notifications')
    .select('*', { count: 'exact', head: true })
    .eq('read', false)

  const notificationIcons: Record<string, any> = {
    new_user: User,
    new_property: Building,
    new_lawyer: Scale,
    content_flag: Flag,
    verification_request: CheckCircle,
    system_alert: AlertTriangle,
    message: MessageSquare,
    default: Bell,
  }

  const notificationLinks: Record<string, (data: any) => string> = {
    new_user: (data) => `/admin/users/${data?.user_id}`,
    new_property: (data) => `/admin/properties/${data?.property_id}`,
    new_lawyer: (data) => `/admin/lawyers?verified=false`,
    content_flag: (data) => `/admin/flags?status=pending`,
    verification_request: (data) => `/admin/lawyers?verified=false`,
    default: () => '/admin',
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <FadeIn>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Notifications</h1>
            <p className="text-muted-foreground mt-1">
              System notifications and alerts
            </p>
          </div>
          {(unreadCount || 0) > 0 && (
            <Badge variant="destructive" className="text-lg px-3 py-1">
              {unreadCount} unread
            </Badge>
          )}
        </div>
      </FadeIn>

      {/* Quick Stats */}
      <FadeIn delay={0.1}>
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{notifications?.length || 0}</div>
            </CardContent>
          </Card>

          <Card className="border-red-200 bg-red-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-red-700">Unread</CardTitle>
              <Clock className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-700">{unreadCount || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Read</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(notifications?.length || 0) - (unreadCount || 0)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Settings</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <Link href="/admin/settings">
                <Button variant="outline" size="sm">Configure</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </FadeIn>

      {/* Notifications List */}
      <FadeIn delay={0.2}>
        <Card>
          <CardHeader>
            <CardTitle>All Notifications</CardTitle>
            <CardDescription>
              Recent system notifications and alerts
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!notifications || notifications.length === 0 ? (
              <div className="text-center py-12">
                <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold">No notifications</h3>
                <p className="text-muted-foreground mt-2">
                  You're all caught up! New notifications will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {(notifications as AdminNotification[]).map((notification) => {
                  const Icon = notificationIcons[notification.type] || notificationIcons.default
                  const getLink = notificationLinks[notification.type] || notificationLinks.default
                  const link = getLink(notification.data)

                  return (
                    <Link
                      key={notification.id}
                      href={link}
                      className={`flex items-start gap-4 p-4 border rounded-lg transition-colors hover:border-primary/50 ${
                        !notification.read ? 'bg-blue-50/50 border-blue-200' : ''
                      }`}
                    >
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        !notification.read ? 'bg-blue-100' : 'bg-muted'
                      }`}>
                        <Icon className={`h-5 w-5 ${!notification.read ? 'text-blue-600' : 'text-muted-foreground'}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className={`font-medium ${!notification.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {notification.title}
                          </h3>
                          {!notification.read && (
                            <Badge variant="default" className="text-xs">New</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {new Date(notification.created_at).toLocaleString()}
                        </p>
                      </div>
                    </Link>
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
