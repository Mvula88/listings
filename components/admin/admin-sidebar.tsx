'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Users,
  Building,
  Scale,
  MessageSquare,
  FileText,
  Settings,
  Shield,
  TrendingUp,
  Flag,
  Bell,
  Mail,
  Activity,
  UserCog,
  Globe,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface AdminSidebarProps {
  admin: any
}

interface NavigationItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  permission: string | null
  badge?: string | number
}

const navigation: NavigationItem[] = [
  {
    name: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
    permission: null,
  },
  {
    name: 'Users',
    href: '/admin/users',
    icon: Users,
    permission: 'users.view',
  },
  {
    name: 'Properties',
    href: '/admin/properties',
    icon: Building,
    permission: 'properties.view',
  },
  {
    name: 'Lawyers',
    href: '/admin/lawyers',
    icon: Scale,
    permission: 'lawyers.view',
  },
  {
    name: 'Transactions',
    href: '/admin/transactions',
    icon: FileText,
    permission: 'transactions.view',
  },
  {
    name: 'Analytics',
    href: '/admin/analytics',
    icon: TrendingUp,
    permission: 'analytics.view',
  },
  {
    name: 'Moderation',
    href: '/admin/moderation',
    icon: Flag,
    permission: 'content.moderate',
  },
  {
    name: 'Moderators',
    href: '/admin/moderators',
    icon: UserCog,
    permission: null, // Only super_admin can access, handled by page
  },
  {
    name: 'Audit Logs',
    href: '/admin/audit',
    icon: Activity,
    permission: 'audit.view',
  },
  {
    name: 'Countries',
    href: '/admin/countries',
    icon: Globe,
    permission: 'settings.edit', // Only admins who can edit settings
  },
  {
    name: 'Settings',
    href: '/admin/settings',
    icon: Settings,
    permission: 'settings.view',
  },
]

export function AdminSidebar({ admin }: AdminSidebarProps) {
  const pathname = usePathname()

  const hasPermission = (permission: string | null) => {
    if (!permission) return true
    if (admin.role === 'super_admin') return true
    return admin.permissions?.includes(permission)
  }

  const filteredNavigation = navigation.filter((item) =>
    hasPermission(item.permission)
  )

  return (
    <aside className="w-64 bg-card border-r flex flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center gap-3 px-6 border-b">
        <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
          <Shield className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="font-bold text-lg">Admin Panel</h1>
          <p className="text-xs text-muted-foreground capitalize">
            {admin.role.replace('_', ' ')}
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {filteredNavigation.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg transition-all group',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <Icon
                className={cn(
                  'h-5 w-5 transition-transform group-hover:scale-110',
                  isActive && 'text-primary-foreground'
                )}
              />
              <span className="font-medium flex-1">{item.name}</span>
              {item.badge && (
                <Badge
                  variant={isActive ? 'secondary' : 'default'}
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
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-sm font-bold text-primary">
              {admin.profile?.full_name?.[0] || admin.profile?.email?.[0] || 'A'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {admin.profile?.full_name || 'Admin'}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {admin.profile?.email}
            </p>
          </div>
        </div>
      </div>
    </aside>
  )
}
