'use client'

import { useState } from 'react'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { toggleCountryActive } from '@/lib/actions/admin-countries'
import { toast } from 'sonner'
import { Loader2, CheckCircle, XCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface CountryToggleProps {
  countryId: string
  isActive: boolean
  showBadge?: boolean
}

export function CountryToggle({ countryId, isActive, showBadge = true }: CountryToggleProps) {
  const [active, setActive] = useState(isActive)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleToggle(checked: boolean) {
    setLoading(true)
    try {
      const result = await toggleCountryActive(countryId, checked)
      if (result.success) {
        setActive(checked)
        toast.success(checked ? 'Country activated' : 'Country deactivated')
        router.refresh()
      } else {
        toast.error(result.error || 'Failed to update country')
      }
    } catch (error) {
      toast.error('An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      {showBadge && (
        active ? (
          <Badge className="bg-green-500/10 text-green-600">
            <CheckCircle className="h-3 w-3 mr-1" />
            Active
          </Badge>
        ) : (
          <Badge variant="secondary">
            <XCircle className="h-3 w-3 mr-1" />
            Inactive
          </Badge>
        )
      )}
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      <Switch
        checked={active}
        onCheckedChange={handleToggle}
        disabled={loading}
      />
    </div>
  )
}
