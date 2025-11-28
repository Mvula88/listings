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
  email_inquiries?: boolean
  email_messages?: boolean
  email_transactions?: boolean
  email_marketing?: boolean
  sms_inquiries?: boolean
  sms_transactions?: boolean
}

interface NotificationSettingsFormProps {
  preferences: NotificationPreferences | null
}

export function NotificationSettingsForm({ preferences }: NotificationSettingsFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const { toast } = useToast()

  const [settings, setSettings] = useState({
    emailInquiries: preferences?.email_inquiries ?? true,
    emailMessages: preferences?.email_messages ?? true,
    emailTransactions: preferences?.email_transactions ?? true,
    emailMarketing: preferences?.email_marketing ?? false,
    smsInquiries: preferences?.sms_inquiries ?? false,
    smsTransactions: preferences?.sms_transactions ?? true,
  })

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    setSuccess(false)

    const formData = new FormData()
    formData.set('emailInquiries', String(settings.emailInquiries))
    formData.set('emailMessages', String(settings.emailMessages))
    formData.set('emailTransactions', String(settings.emailTransactions))
    formData.set('emailMarketing', String(settings.emailMarketing))
    formData.set('smsInquiries', String(settings.smsInquiries))
    formData.set('smsTransactions', String(settings.smsTransactions))

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
            <h4 className="text-sm font-medium text-muted-foreground">Email Notifications</h4>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="emailInquiries">Property Inquiries</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified when someone inquires about your listing
                </p>
              </div>
              <Switch
                id="emailInquiries"
                checked={settings.emailInquiries}
                onCheckedChange={(checked) =>
                  setSettings((prev) => ({ ...prev, emailInquiries: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="emailMessages">Messages</Label>
                <p className="text-sm text-muted-foreground">
                  Receive email notifications for new messages
                </p>
              </div>
              <Switch
                id="emailMessages"
                checked={settings.emailMessages}
                onCheckedChange={(checked) =>
                  setSettings((prev) => ({ ...prev, emailMessages: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="emailTransactions">Transactions</Label>
                <p className="text-sm text-muted-foreground">
                  Get updates about your property transactions
                </p>
              </div>
              <Switch
                id="emailTransactions"
                checked={settings.emailTransactions}
                onCheckedChange={(checked) =>
                  setSettings((prev) => ({ ...prev, emailTransactions: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="emailMarketing">Marketing & Tips</Label>
                <p className="text-sm text-muted-foreground">
                  Receive tips, product updates, and promotional offers
                </p>
              </div>
              <Switch
                id="emailMarketing"
                checked={settings.emailMarketing}
                onCheckedChange={(checked) =>
                  setSettings((prev) => ({ ...prev, emailMarketing: checked }))
                }
              />
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-medium text-muted-foreground">SMS Notifications</h4>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="smsInquiries">Inquiry Alerts</Label>
                <p className="text-sm text-muted-foreground">
                  Get SMS when someone inquires about your listing
                </p>
              </div>
              <Switch
                id="smsInquiries"
                checked={settings.smsInquiries}
                onCheckedChange={(checked) =>
                  setSettings((prev) => ({ ...prev, smsInquiries: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="smsTransactions">Transaction Updates</Label>
                <p className="text-sm text-muted-foreground">
                  Get SMS for important transaction updates
                </p>
              </div>
              <Switch
                id="smsTransactions"
                checked={settings.smsTransactions}
                onCheckedChange={(checked) =>
                  setSettings((prev) => ({ ...prev, smsTransactions: checked }))
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
