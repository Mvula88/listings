'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Bell, Loader2, Check } from 'lucide-react'
import { updateNotificationPreferences } from '@/lib/actions/settings'
import { useToast } from '@/lib/hooks/use-toast'

interface NotificationPreferences {
  email_notifications?: boolean
  sms_notifications?: boolean
  marketing_emails?: boolean
  listing_updates?: boolean
  inquiry_alerts?: boolean
}

interface NotificationSettingsFormProps {
  preferences: NotificationPreferences | null
}

export function NotificationSettingsForm({ preferences }: NotificationSettingsFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const { toast } = useToast()

  const [settings, setSettings] = useState({
    emailNotifications: preferences?.email_notifications ?? true,
    smsNotifications: preferences?.sms_notifications ?? false,
    marketingEmails: preferences?.marketing_emails ?? false,
    listingUpdates: preferences?.listing_updates ?? true,
    inquiryAlerts: preferences?.inquiry_alerts ?? true,
  })

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    setSuccess(false)

    const formData = new FormData()
    formData.set('emailNotifications', String(settings.emailNotifications))
    formData.set('smsNotifications', String(settings.smsNotifications))
    formData.set('marketingEmails', String(settings.marketingEmails))
    formData.set('listingUpdates', String(settings.listingUpdates))
    formData.set('inquiryAlerts', String(settings.inquiryAlerts))

    try {
      const result = await updateNotificationPreferences(formData)

      if (result.success) {
        setSuccess(true)
        toast.success(result.message || 'Preferences updated')
        setTimeout(() => setSuccess(false), 3000)
      } else {
        toast.error(result.error || 'Failed to update preferences')
      }
    } catch (error) {
      toast.error('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notification Preferences
        </CardTitle>
        <CardDescription>
          Choose how you want to be notified
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="emailNotifications">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive email updates about your listings and inquiries
                </p>
              </div>
              <Switch
                id="emailNotifications"
                checked={settings.emailNotifications}
                onCheckedChange={(checked) =>
                  setSettings((prev) => ({ ...prev, emailNotifications: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="smsNotifications">SMS Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Get text messages for important updates
                </p>
              </div>
              <Switch
                id="smsNotifications"
                checked={settings.smsNotifications}
                onCheckedChange={(checked) =>
                  setSettings((prev) => ({ ...prev, smsNotifications: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="inquiryAlerts">Inquiry Alerts</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified when someone inquires about your listing
                </p>
              </div>
              <Switch
                id="inquiryAlerts"
                checked={settings.inquiryAlerts}
                onCheckedChange={(checked) =>
                  setSettings((prev) => ({ ...prev, inquiryAlerts: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="listingUpdates">Listing Updates</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified about status changes to your listings
                </p>
              </div>
              <Switch
                id="listingUpdates"
                checked={settings.listingUpdates}
                onCheckedChange={(checked) =>
                  setSettings((prev) => ({ ...prev, listingUpdates: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="marketingEmails">Marketing Emails</Label>
                <p className="text-sm text-muted-foreground">
                  Receive tips, product updates, and promotional offers
                </p>
              </div>
              <Switch
                id="marketingEmails"
                checked={settings.marketingEmails}
                onCheckedChange={(checked) =>
                  setSettings((prev) => ({ ...prev, marketingEmails: checked }))
                }
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : success ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Saved!
                </>
              ) : (
                'Save Preferences'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
