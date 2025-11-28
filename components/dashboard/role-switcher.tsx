'use client'

import { useState } from 'react'
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
import { Badge } from '@/components/ui/badge'
import { ChevronDown, User, Home, Scale, Check, Plus, Loader2 } from 'lucide-react'
import { switchRole, addRole, type UserRole } from '@/lib/actions/roles'
import { toast } from 'sonner'

interface RoleSwitcherProps {
  roles: UserRole[]
  activeRole: UserRole | null
}

const roleConfig: Record<UserRole, { label: string; icon: typeof User; color: string }> = {
  buyer: { label: 'Buyer', icon: User, color: 'bg-blue-100 text-blue-700' },
  seller: { label: 'Seller', icon: Home, color: 'bg-green-100 text-green-700' },
  lawyer: { label: 'Lawyer', icon: Scale, color: 'bg-purple-100 text-purple-700' },
}

export function RoleSwitcher({ roles, activeRole }: RoleSwitcherProps) {
  const [loading, setLoading] = useState(false)
  const [addingRole, setAddingRole] = useState<UserRole | null>(null)
  const router = useRouter()

  const currentRole = activeRole || 'buyer'
  const CurrentIcon = roleConfig[currentRole]?.icon || User

  async function handleSwitchRole(role: UserRole) {
    if (role === activeRole) return

    setLoading(true)
    try {
      const result = await switchRole(role)

      if (result.success) {
        toast.success(`Switched to ${roleConfig[role].label} mode`)
        router.refresh()
      } else {
        toast.error(result.error || 'Failed to switch role')
      }
    } catch (error) {
      toast.error('An error occurred')
    } finally {
      setLoading(false)
    }
  }

  async function handleAddRole(role: UserRole) {
    setAddingRole(role)
    try {
      const result = await addRole(role)

      if (result.success) {
        toast.success(`${roleConfig[role].label} role added! You can now switch to it.`)
        router.refresh()
      } else {
        toast.error(result.error || 'Failed to add role')
      }
    } catch (error) {
      toast.error('An error occurred')
    } finally {
      setAddingRole(null)
    }
  }

  // Roles the user doesn't have yet (excluding lawyer which requires special registration)
  const availableRoles = (['buyer', 'seller'] as UserRole[]).filter(
    (role) => !roles.includes(role)
  )

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-full justify-between" disabled={loading}>
          <div className="flex items-center gap-2">
            <CurrentIcon className="h-4 w-4" />
            <span>{roleConfig[currentRole]?.label || 'User'}</span>
          </div>
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ChevronDown className="h-4 w-4 opacity-50" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel>Switch Role</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Available roles to switch to */}
        {roles.map((role) => {
          const config = roleConfig[role]
          const Icon = config.icon
          const isActive = role === activeRole

          return (
            <DropdownMenuItem
              key={role}
              onClick={() => handleSwitchRole(role)}
              className="cursor-pointer"
              disabled={isActive}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  <span>{config.label}</span>
                </div>
                {isActive && <Check className="h-4 w-4 text-primary" />}
              </div>
            </DropdownMenuItem>
          )
        })}

        {/* Add new roles */}
        {availableRoles.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Add Role
            </DropdownMenuLabel>
            {availableRoles.map((role) => {
              const config = roleConfig[role]
              const Icon = config.icon
              const isAdding = addingRole === role

              return (
                <DropdownMenuItem
                  key={`add-${role}`}
                  onClick={() => handleAddRole(role)}
                  className="cursor-pointer"
                  disabled={isAdding}
                >
                  <div className="flex items-center gap-2">
                    {isAdding ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Plus className="h-4 w-4" />
                    )}
                    <span>Become a {config.label}</span>
                  </div>
                </DropdownMenuItem>
              )
            })}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// Compact version for sidebar
export function RoleBadge({ activeRole }: { activeRole: UserRole | null }) {
  const role = activeRole || 'buyer'
  const config = roleConfig[role]

  return (
    <Badge variant="outline" className={`${config.color} border-0`}>
      {config.label}
    </Badge>
  )
}
