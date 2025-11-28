'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils/cn'
import {
  Home,
  Building,
  MessageSquare,
  FileText,
  Settings,
  Users,
  Briefcase,
  PlusCircle,
  Star,
  Heart,
  Search
} from 'lucide-react'

interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  userTypes?: string[]
}

const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: Home,
  },
  {
    title: 'My Properties',
    href: '/properties',
    icon: Building,
    userTypes: ['seller']
  },
  {
    title: 'Featured Listings',
    href: '/featured',
    icon: Star,
    userTypes: ['seller']
  },
  {
    title: 'Browse Properties',
    href: '/browse',
    icon: Search,
    userTypes: ['buyer']
  },
  {
    title: 'Saved Properties',
    href: '/saved',
    icon: Heart,
    userTypes: ['buyer']
  },
  {
    title: 'List Property',
    href: '/properties/new',
    icon: PlusCircle,
    userTypes: ['seller']
  },
  {
    title: 'Transactions',
    href: '/transactions',
    icon: FileText,
  },
  {
    title: 'Messages',
    href: '/messages',
    icon: MessageSquare,
  },
  {
    title: 'Clients',
    href: '/clients',
    icon: Users,
    userTypes: ['lawyer']
  },
  {
    title: 'My Practice',
    href: '/practice',
    icon: Briefcase,
    userTypes: ['lawyer']
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: Settings,
  },
]

export function DashboardNav({ userType }: { userType?: string }) {
  const pathname = usePathname()

  const filteredItems = navItems.filter(item => {
    if (!item.userTypes) return true
    return item.userTypes.includes(userType || '')
  })

  return (
    <nav className="space-y-1 p-4">
      {filteredItems.map((item) => {
        const Icon = item.icon
        const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
        
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            <Icon className="h-4 w-4" />
            {item.title}
          </Link>
        )
      })}
    </nav>
  )
}