'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Building,
  History,
  LogOut,
  Shield,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface ModeratorSidebarProps {
  moderator: {
    role: string
    profile?: {
      full_name?: string
      email?: string
    }
  }
  pendingCount?: number
}

interface NavigationItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string | number
}

export function ModeratorSidebar({ moderator, pendingCount }: ModeratorSidebarProps) {
  const pathname = usePathname()

  const navigation: NavigationItem[] = [
    {
      name: 'Dashboard',
      href: '/moderator',
      icon: LayoutDashboard,
    },
    {
      name: 'Listings',
      href: '/moderator/listings',
      icon: Building,
      badge: pendingCount && pendingCount > 0 ? pendingCount : undefined,
    },
    {
      name: 'My Reviews',
      href: '/moderator/history',
      icon: History,
    },
  ]

  return (
    <aside className="w-64 bg-card border-r flex flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center gap-3 px-6 border-b">
        <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center">
          <Shield className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="font-bold text-lg">Moderator</h1>
          <p className="text-xs text-muted-foreground capitalize">
            Review Dashboard
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {navigation.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href ||
            (item.href !== '/moderator' && pathname.startsWith(item.href))

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg transition-all group',
                isActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <Icon
                className={cn(
                  'h-5 w-5 transition-transform group-hover:scale-110',
                  isActive && 'text-white'
                )}
              />
              <span className="font-medium flex-1">{item.name}</span>
              {item.badge && (
                <Badge
                  variant={isActive ? 'secondary' : 'destructive'}
                  className="text-xs"
                >
                  {item.badge}
                </Badge>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t">
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-muted">
          <div className="h-8 w-8 rounded-full bg-blue-600/10 flex items-center justify-center">
            <span className="text-sm font-bold text-blue-600">
              {moderator.profile?.full_name?.[0] || moderator.profile?.email?.[0] || 'M'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {moderator.profile?.full_name || 'Moderator'}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {moderator.profile?.email}
            </p>
          </div>
        </div>
        <Link
          href="/logout"
          className="flex items-center gap-2 px-3 py-2 mt-2 text-sm text-muted-foreground hover:text-destructive rounded-lg hover:bg-destructive/10 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </Link>
      </div>
    </aside>
  )
}
