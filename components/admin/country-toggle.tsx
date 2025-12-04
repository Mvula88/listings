'use client'

import { useState } from 'react'
import { Switch } from '@/components/ui/switch'
import { toggleCountryActive } from '@/lib/actions/admin-countries'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

interface CountryToggleProps {
  countryId: string
  isActive: boolean
}

export function CountryToggle({ countryId, isActive }: CountryToggleProps) {
  const [active, setActive] = useState(isActive)
  const [loading, setLoading] = useState(false)

  async function handleToggle(checked: boolean) {
    setLoading(true)
    try {
      const result = await toggleCountryActive(countryId, checked)
      if (result.success) {
        setActive(checked)
        toast.success(checked ? 'Country activated' : 'Country deactivated')
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
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      <Switch
        checked={active}
        onCheckedChange={handleToggle}
        disabled={loading}
      />
    </div>
  )
}
