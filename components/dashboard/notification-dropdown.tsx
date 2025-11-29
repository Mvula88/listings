'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Bell, Check, CheckCheck, Trash2, CreditCard, Home, MessageSquare, AlertCircle, Briefcase, DollarSign } from 'lucide-react'
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  type Notification
} from '@/lib/actions/notifications'
import { cn } from '@/lib/utils'

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
  return date.toLocaleDateString()
}

const notificationIcons: Record<string, React.ReactNode> = {
  payment: <CreditCard className="h-4 w-4 text-green-500" />,
  featured_expired: <AlertCircle className="h-4 w-4 text-orange-500" />,
  inquiry: <MessageSquare className="h-4 w-4 text-blue-500" />,
  message: <MessageSquare className="h-4 w-4 text-purple-500" />,
  property_approved: <Home className="h-4 w-4 text-green-500" />,
  property_rejected: <Home className="h-4 w-4 text-red-500" />,
  property_flagged: <AlertCircle className="h-4 w-4 text-yellow-500" />,
  system: <Bell className="h-4 w-4 text-blue-500" />,
  lawyer_deal_assigned: <Briefcase className="h-4 w-4 text-purple-500" />,
  fee_remittance_reminder: <DollarSign className="h-4 w-4 text-orange-500" />,
  remittance_overdue: <AlertCircle className="h-4 w-4 text-red-500" />,
  transaction: <Briefcase className="h-4 w-4 text-blue-500" />,
  default: <Bell className="h-4 w-4 text-gray-500" />,
}

function getNotificationIcon(type: string) {
  return notificationIcons[type] || notificationIcons.default
}

export function NotificationDropdown() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  async function fetchNotifications() {
    const { notifications, unreadCount } = await getNotifications(20)
    setNotifications(notifications)
    setUnreadCount(unreadCount)
    setIsLoading(false)
  }

  useEffect(() => {
    fetchNotifications()
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  async function handleMarkAsRead(id: string) {
    await markNotificationAsRead(id)
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true, read_at: new Date().toISOString() } : n)
    )
    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  async function handleMarkAllAsRead() {
    await markAllNotificationsAsRead()
    setNotifications(prev => prev.map(n => ({ ...n, read: true, read_at: new Date().toISOString() })))
    setUnreadCount(0)
  }

  // Get the navigation URL based on notification type and data
  function getNotificationUrl(notification: Notification): string | null {
    const data = notification.data as Record<string, any> | null

    switch (notification.type) {
      case 'message':
        if (data?.conversation_id) {
          return `/messages?conversation=${data.conversation_id}`
        }
        return '/messages'

      case 'inquiry':
        if (data?.inquiry_id) {
          return `/messages?inquiry=${data.inquiry_id}`
        }
        if (data?.property_id) {
          return `/properties/${data.property_id}`
        }
        return '/messages'

      case 'property_approved':
      case 'property_rejected':
      case 'property_flagged':
        if (data?.property_id) {
          return `/properties/${data.property_id}`
        }
        return '/properties'

      case 'payment':
      case 'featured_activated':
      case 'featured_expired':
        if (data?.property_id) {
          return `/properties/${data.property_id}`
        }
        return '/featured'

      case 'transaction':
        if (data?.transaction_id) {
          return `/transactions/${data.transaction_id}`
        }
        return '/transactions'

      case 'lawyer_deal_assigned':
        if (data?.transaction_id) {
          return `/lawyer-deals/${data.transaction_id}`
        }
        return '/lawyer-deals'

      case 'fee_remittance_reminder':
      case 'remittance_overdue':
        return '/lawyer-deals/remit-fees'

      default:
        return null
    }
  }

  async function handleNotificationClick(notification: Notification) {
    // Mark as read if not already
    if (!notification.read) {
      await handleMarkAsRead(notification.id)
    }

    // Navigate to the relevant page
    const url = getNotificationUrl(notification)
    if (url) {
      setIsOpen(false)
      router.push(url)
    }
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground flex items-center justify-center">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end" forceMount>
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto py-1 px-2 text-xs"
              onClick={handleMarkAllAsRead}
            >
              <CheckCheck className="h-3 w-3 mr-1" />
              Mark all read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {isLoading ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            Loading notifications...
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center">
            <Bell className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">No notifications yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              You'll be notified about inquiries, payments, and updates here
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[300px]">
            {notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={cn(
                  "flex flex-col items-start gap-1 p-3 cursor-pointer",
                  !notification.read && "bg-muted/50"
                )}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-start gap-3 w-full">
                  <div className="flex-shrink-0 mt-0.5">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={cn(
                        "text-sm truncate",
                        !notification.read && "font-semibold"
                      )}>
                        {notification.title}
                      </p>
                      {!notification.read && (
                        <span className="h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatTimeAgo(notification.created_at)}
                    </p>
                  </div>
                </div>
              </DropdownMenuItem>
            ))}
          </ScrollArea>
        )}

        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <div className="p-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs"
                onClick={() => setIsOpen(false)}
              >
                View all notifications
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
