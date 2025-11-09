'use client'

import { useState } from 'react'
import { updatePlatformSetting } from '@/lib/admin/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Loader2, Save } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export function SettingsForm({ settings }: { settings: any[] }) {
  const router = useRouter()
  const [saving, setSaving] = useState<string | null>(null)
  const [values, setValues] = useState<Record<string, any>>(
    settings.reduce((acc, setting) => {
      acc[setting.key] = setting.value
      return acc
    }, {})
  )

  async function handleSave(key: string) {
    setSaving(key)
    try {
      await updatePlatformSetting(key, values[key])
      toast.success('Setting updated successfully')
      router.refresh()
    } catch (error) {
      toast.error('Failed to update setting')
    } finally {
      setSaving(null)
    }
  }

  function handleChange(key: string, value: any) {
    setValues((prev) => ({ ...prev, [key]: value }))
  }

  // Group settings by category
  const generalSettings = settings.filter(s =>
    ['maintenance_mode', 'platform_name', 'support_email'].includes(s.key)
  )

  const featureSettings = settings.filter(s =>
    ['enable_referrals', 'enable_premium_listings', 'enable_sms_notifications'].includes(s.key)
  )

  const paymentSettings = settings.filter(s =>
    ['success_fee_buyer_percent', 'success_fee_seller_percent', 'premium_listing_price'].includes(s.key)
  )

  const rateLimitSettings = settings.filter(s =>
    ['rate_limit_api', 'rate_limit_auth', 'rate_limit_upload'].includes(s.key)
  )

  function renderSettingInput(setting: any) {
    const value = values[setting.key]
    const isBoolean = typeof value === 'boolean'
    const isNumber = typeof value === 'number'
    const isSaving = saving === setting.key

    if (isBoolean) {
      return (
        <div className="flex items-center justify-between space-x-4 p-4 border rounded-lg">
          <div className="flex-1">
            <Label htmlFor={setting.key} className="text-base">
              {setting.key.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
            </Label>
            <p className="text-sm text-muted-foreground mt-1">
              {setting.description}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              id={setting.key}
              checked={value}
              onCheckedChange={(checked) => handleChange(setting.key, checked)}
            />
            <Button
              size="sm"
              onClick={() => handleSave(setting.key)}
              disabled={isSaving}
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      )
    }

    return (
      <div className="space-y-2 p-4 border rounded-lg">
        <Label htmlFor={setting.key}>
          {setting.key.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
        </Label>
        <p className="text-sm text-muted-foreground">
          {setting.description}
        </p>
        <div className="flex gap-2">
          <Input
            id={setting.key}
            type={isNumber ? 'number' : 'text'}
            value={value}
            onChange={(e) =>
              handleChange(
                setting.key,
                isNumber ? parseFloat(e.target.value) : e.target.value
              )
            }
            className="flex-1"
          />
          <Button
            size="sm"
            onClick={() => handleSave(setting.key)}
            disabled={isSaving}
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* General Settings */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium">General Settings</h3>
          <p className="text-sm text-muted-foreground">
            Basic platform configuration
          </p>
        </div>
        <div className="space-y-4">
          {generalSettings.map((setting) => (
            <div key={setting.key}>{renderSettingInput(setting)}</div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Feature Flags */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium">Feature Flags</h3>
          <p className="text-sm text-muted-foreground">
            Enable or disable platform features
          </p>
        </div>
        <div className="space-y-4">
          {featureSettings.map((setting) => (
            <div key={setting.key}>{renderSettingInput(setting)}</div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Payment Settings */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium">Payment Configuration</h3>
          <p className="text-sm text-muted-foreground">
            Configure platform fees and pricing
          </p>
        </div>
        <div className="space-y-4">
          {paymentSettings.map((setting) => (
            <div key={setting.key}>{renderSettingInput(setting)}</div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Rate Limits */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium">Rate Limiting</h3>
          <p className="text-sm text-muted-foreground">
            Configure API rate limits
          </p>
        </div>
        <div className="space-y-4">
          {rateLimitSettings.map((setting) => (
            <div key={setting.key}>{renderSettingInput(setting)}</div>
          ))}
        </div>
      </div>

      {/* Other Settings */}
      {settings.filter(s =>
        ![...generalSettings, ...featureSettings, ...paymentSettings, ...rateLimitSettings]
          .map(x => x.key)
          .includes(s.key)
      ).length > 0 && (
        <>
          <Separator />
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium">Other Settings</h3>
              <p className="text-sm text-muted-foreground">
                Additional configuration options
              </p>
            </div>
            <div className="space-y-4">
              {settings
                .filter(s =>
                  ![...generalSettings, ...featureSettings, ...paymentSettings, ...rateLimitSettings]
                    .map(x => x.key)
                    .includes(s.key)
                )
                .map((setting) => (
                  <div key={setting.key}>{renderSettingInput(setting)}</div>
                ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
