'use client'

import { useState } from 'react'
import { RefreshCw, LogOut, ExternalLink, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface ModeratorHeaderProps {
  moderator: {
    role: string
    profile?: {
      full_name?: string
      email?: string
    }
  }
}

export function ModeratorHeader({ moderator }: ModeratorHeaderProps) {
  const router = useRouter()
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = () => {
    setIsRefreshing(true)
    router.refresh()
    setTimeout(() => setIsRefreshing(false), 1000)
  }

  const handleLogout = async () => {
    window.location.href = '/logout'
  }

  return (
    <header className="h-16 border-b bg-card flex items-center justify-between px-6">
      {/* Left side */}
      <div>
        <h2 className="text-lg font-semibold">Moderator Dashboard</h2>
        <p className="text-sm text-muted-foreground">
          Review and moderate property listings
        </p>
      </div>

      {/* Right side - actions */}
      <div className="flex items-center gap-2">
        {/* Refresh Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="relative"
        >
          <RefreshCw
            className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`}
          />
        </Button>

        {/* View Site */}
        <Button variant="ghost" size="sm" asChild>
          <Link href="/" target="_blank">
            <ExternalLink className="h-4 w-4 mr-2" />
            View Site
          </Link>
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2">
              <div className="h-8 w-8 rounded-full bg-blue-600/10 flex items-center justify-center">
                <span className="text-sm font-bold text-blue-600">
                  {moderator.profile?.full_name?.[0] || 'M'}
                </span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span>{moderator.profile?.full_name || 'Moderator'}</span>
                <span className="text-xs text-muted-foreground font-normal">
                  {moderator.profile?.email}
                </span>
                <Badge variant="outline" className="mt-1 w-fit text-blue-600 border-blue-600">
                  {moderator.role.replace('_', ' ')}
                </Badge>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/moderator">
                <Home className="h-4 w-4 mr-2" />
                My Dashboard
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-red-600">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
