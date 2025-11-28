import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { FadeIn } from '@/components/ui/fade-in'
import {
  ProfileSettingsForm,
  NotificationSettingsForm,
  SecuritySettingsForm,
  BillingSettings,
  DangerZone,
} from '@/components/settings'

interface NotificationPreferences {
  email_notifications?: boolean
  sms_notifications?: boolean
  marketing_emails?: boolean
  listing_updates?: boolean
  inquiry_alerts?: boolean
}

interface Profile {
  full_name: string | null
  phone: string | null
  user_type: string | null
  notification_preferences?: NotificationPreferences | null
}

export default async function SettingsPage() {
  const supabase = await createClient()

  // Check authentication
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single() as { data: Profile | null }

  return (
    <div className="space-y-6 max-w-4xl">
      <FadeIn>
        <div>
          <h1 className="text-3xl font-bold mb-2">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>
      </FadeIn>

      {/* Profile Settings */}
      <FadeIn delay={0.1}>
        <ProfileSettingsForm
          profile={profile}
          email={user.email || ''}
        />
      </FadeIn>

      {/* Notification Settings */}
      <FadeIn delay={0.2}>
        <NotificationSettingsForm
          preferences={profile?.notification_preferences || null}
        />
      </FadeIn>

      {/* Security Settings */}
      <FadeIn delay={0.3}>
        <SecuritySettingsForm />
      </FadeIn>

      {/* Billing Settings (for sellers) */}
      {profile?.user_type === 'seller' && (
        <FadeIn delay={0.4}>
          <BillingSettings />
        </FadeIn>
      )}

      {/* Danger Zone */}
      <FadeIn delay={0.5}>
        <DangerZone />
      </FadeIn>
    </div>
  )
}
