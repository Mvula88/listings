import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { FadeIn } from '@/components/ui/fade-in'
import {
  ProfileSettingsForm,
  NotificationSettingsForm,
  SecuritySettingsForm,
  BillingSettings,
  DangerZone,
  LawyerPracticeSettings,
} from '@/components/settings'

interface Profile {
  full_name: string | null
  phone: string | null
  user_type: string | null
}

interface NotificationPreferences {
  email_inquiries?: boolean
  email_messages?: boolean
  email_transactions?: boolean
  email_marketing?: boolean
  sms_inquiries?: boolean
  sms_transactions?: boolean
}

interface Lawyer {
  id: string
  firm_name: string | null
  bar_number: string | null
  years_of_experience: number | null
  practice_areas: string[] | null
  office_phone: string | null
  office_address: string | null
  website: string | null
  bio: string | null
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

  // Get notification preferences from the separate table
  const { data: notificationPrefs } = await (supabase
    .from('notification_preferences') as any)
    .select('*')
    .eq('user_id', user.id)
    .single() as { data: NotificationPreferences | null }

  // Get lawyer data if user is a lawyer
  let lawyer: Lawyer | null = null
  if (profile?.user_type === 'lawyer') {
    const { data: lawyerData } = await supabase
      .from('lawyers')
      .select('id, firm_name, bar_number, years_of_experience, practice_areas, office_phone, office_address, website, bio')
      .eq('profile_id', user.id)
      .single() as { data: Lawyer | null }
    lawyer = lawyerData
  }

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
          preferences={notificationPrefs}
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

      {/* Lawyer Practice Settings */}
      {profile?.user_type === 'lawyer' && lawyer && (
        <FadeIn delay={0.4}>
          <LawyerPracticeSettings lawyer={lawyer} />
        </FadeIn>
      )}

      {/* Danger Zone */}
      <FadeIn delay={0.5}>
        <DangerZone />
      </FadeIn>
    </div>
  )
}
