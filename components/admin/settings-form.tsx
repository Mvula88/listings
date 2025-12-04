'use client'

import { useState } from 'react'
import { updatePlatformSetting } from '@/lib/admin/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Loader2, Save, Settings, Zap, DollarSign, Shield, ImageIcon, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface PlatformSetting {
  key: string
  value: any
  description: string | null
  category: string | null
  updated_at: string | null
  updated_by: string | null
}

interface SettingsFormProps {
  settings: PlatformSetting[]
}

// Category display configuration
const CATEGORY_CONFIG: Record<string, { title: string; description: string; icon: React.ReactNode }> = {
  general: {
    title: 'General Settings',
    description: 'Basic platform configuration',
    icon: <Settings className="h-5 w-5" />,
  },
  features: {
    title: 'Feature Flags',
    description: 'Enable or disable platform features',
    icon: <Zap className="h-5 w-5" />,
  },
  payment: {
    title: 'Payment Configuration',
    description: 'Configure platform fees and pricing',
    icon: <DollarSign className="h-5 w-5" />,
  },
  rate_limits: {
    title: 'Rate Limiting',
    description: 'Configure API and action rate limits',
    icon: <Shield className="h-5 w-5" />,
  },
  images: {
    title: 'Image Settings',
    description: 'Configure image upload and processing',
    icon: <ImageIcon className="h-5 w-5" />,
  },
  moderation: {
    title: 'Moderation Settings',
    description: 'Configure content moderation behavior',
    icon: <AlertTriangle className="h-5 w-5" />,
  },
}

// Human-readable labels for setting keys
const SETTING_LABELS: Record<string, string> = {
  platform_name: 'Platform Name',
  support_email: 'Support Email',
  maintenance_mode: 'Maintenance Mode',
  enable_referrals: 'Enable Referrals',
  enable_premium_listings: 'Enable Premium Listings',
  enable_sms_notifications: 'Enable SMS Notifications',
  require_property_approval: 'Require Property Approval',
  require_lawyer_verification: 'Require Lawyer Verification',
  success_fee_buyer_percent: 'Buyer Success Fee (%)',
  success_fee_seller_percent: 'Seller Success Fee (%)',
  premium_listing_price: 'Premium Listing Price (cents)',
  referral_discount: 'Referral Discount (cents)',
  rate_limit_api: 'API Rate Limit (req/min)',
  rate_limit_auth: 'Auth Rate Limit (attempts/15min)',
  rate_limit_upload: 'Upload Rate Limit (uploads/hour)',
  rate_limit_email: 'Email Rate Limit (emails/hour)',
  rate_limit_inquiry: 'Inquiry Rate Limit (inquiries/hour)',
  max_images_per_property: 'Max Images Per Property',
  max_image_size_mb: 'Max Image Size (MB)',
  image_quality: 'Image Quality (0-100)',
  auto_suspend_flagged_content: 'Auto-Suspend Flagged Content',
  flag_threshold: 'Flag Threshold',
}

export function SettingsForm({ settings }: SettingsFormProps) {
  const router = useRouter()
  const [saving, setSaving] = useState<string | null>(null)
  const [values, setValues] = useState<Record<string, any>>(
    settings.reduce((acc, setting) => {
      acc[setting.key] = setting.value
      return acc
    }, {} as Record<string, any>)
  )

  async function handleSave(key: string) {
    setSaving(key)
    try {
      await updatePlatformSetting(key, values[key])
      toast.success('Setting updated successfully')
      router.refresh()
    } catch (error) {
      console.error('Failed to update setting:', error)
      toast.error('Failed to update setting')
    } finally {
      setSaving(null)
    }
  }

  function handleChange(key: string, value: any) {
    setValues((prev) => ({ ...prev, [key]: value }))
  }

  // Group settings by category
  const groupedSettings = settings.reduce((acc, setting) => {
    const category = setting.category || 'other'
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(setting)
    return acc
  }, {} as Record<string, PlatformSetting[]>)

  // Sort categories
  const categoryOrder = ['general', 'features', 'payment', 'rate_limits', 'images', 'moderation', 'other']
  const sortedCategories = Object.keys(groupedSettings).sort((a, b) => {
    const aIndex = categoryOrder.indexOf(a)
    const bIndex = categoryOrder.indexOf(b)
    if (aIndex === -1 && bIndex === -1) return a.localeCompare(b)
    if (aIndex === -1) return 1
    if (bIndex === -1) return -1
    return aIndex - bIndex
  })

  function getLabel(key: string): string {
    return SETTING_LABELS[key] || key.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())
  }

  function renderSettingInput(setting: PlatformSetting) {
    const value = values[setting.key]
    const isBoolean = typeof value === 'boolean' || value === 'true' || value === 'false'
    const isObject = typeof value === 'object' && value !== null
    const isNumber = !isObject && (typeof value === 'number' || (!isNaN(Number(value)) && setting.key.includes('limit') || setting.key.includes('price') || setting.key.includes('percent') || setting.key.includes('max_') || setting.key.includes('threshold') || setting.key.includes('quality') || setting.key.includes('discount')))
    const isSaving = saving === setting.key
    const hasChanged = JSON.stringify(values[setting.key]) !== JSON.stringify(setting.value)

    // Boolean toggle
    if (isBoolean) {
      const boolValue = typeof value === 'boolean' ? value : value === 'true'
      return (
        <div className="flex items-center justify-between space-x-4 p-4 border rounded-lg bg-card">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Label htmlFor={setting.key} className="text-base font-medium">
                {getLabel(setting.key)}
              </Label>
              {hasChanged && (
                <Badge variant="outline" className="text-xs">Modified</Badge>
              )}
            </div>
            {setting.description && (
              <p className="text-sm text-muted-foreground mt-1">
                {setting.description}
              </p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Switch
              id={setting.key}
              checked={boolValue}
              onCheckedChange={(checked) => handleChange(setting.key, checked)}
            />
            <Button
              size="sm"
              onClick={() => handleSave(setting.key)}
              disabled={isSaving || !hasChanged}
              variant={hasChanged ? "default" : "outline"}
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

    // JSON object (like maintenance_message)
    if (isObject) {
      const jsonString = JSON.stringify(value, null, 2)
      return (
        <div className="space-y-2 p-4 border rounded-lg bg-card">
          <div className="flex items-center gap-2">
            <Label htmlFor={setting.key} className="font-medium">
              {getLabel(setting.key)}
            </Label>
            {hasChanged && (
              <Badge variant="outline" className="text-xs">Modified</Badge>
            )}
            <Badge variant="secondary" className="text-xs">JSON</Badge>
          </div>
          {setting.description && (
            <p className="text-sm text-muted-foreground">
              {setting.description}
            </p>
          )}
          <div className="flex gap-2">
            <textarea
              id={setting.key}
              value={jsonString}
              onChange={(e) => {
                try {
                  const parsed = JSON.parse(e.target.value)
                  handleChange(setting.key, parsed)
                } catch {
                  // Keep the raw string if invalid JSON - will show error on save
                  handleChange(setting.key, e.target.value)
                }
              }}
              className="flex-1 min-h-[100px] p-3 border rounded-md bg-background font-mono text-sm resize-y"
              placeholder="Enter valid JSON"
            />
            <Button
              size="sm"
              onClick={() => handleSave(setting.key)}
              disabled={isSaving || !hasChanged}
              variant={hasChanged ? "default" : "outline"}
              className="self-start"
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

    // Number or text input
    return (
      <div className="space-y-2 p-4 border rounded-lg bg-card">
        <div className="flex items-center gap-2">
          <Label htmlFor={setting.key} className="font-medium">
            {getLabel(setting.key)}
          </Label>
          {hasChanged && (
            <Badge variant="outline" className="text-xs">Modified</Badge>
          )}
        </div>
        {setting.description && (
          <p className="text-sm text-muted-foreground">
            {setting.description}
          </p>
        )}
        <div className="flex gap-2">
          <Input
            id={setting.key}
            type={isNumber ? 'number' : 'text'}
            step={setting.key.includes('percent') ? '0.1' : '1'}
            value={value ?? ''}
            onChange={(e) =>
              handleChange(
                setting.key,
                isNumber ? parseFloat(e.target.value) || 0 : e.target.value
              )
            }
            className="flex-1"
          />
          <Button
            size="sm"
            onClick={() => handleSave(setting.key)}
            disabled={isSaving || !hasChanged}
            variant={hasChanged ? "default" : "outline"}
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

  if (settings.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No settings found. Run the database migration to add settings.</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {sortedCategories.map((category, index) => {
        const categorySettings = groupedSettings[category]
        const config = CATEGORY_CONFIG[category] || {
          title: category.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
          description: 'Additional settings',
          icon: <Settings className="h-5 w-5" />,
        }

        return (
          <div key={category}>
            {index > 0 && <Separator className="mb-8" />}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                  {config.icon}
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{config.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {config.description}
                  </p>
                </div>
              </div>
              <div className="grid gap-4">
                {categorySettings.map((setting) => (
                  <div key={setting.key}>{renderSettingInput(setting)}</div>
                ))}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
