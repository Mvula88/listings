import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ModeratorSidebar } from '@/components/moderator/moderator-sidebar'
import { ModeratorHeader } from '@/components/moderator/moderator-header'

export default async function ModeratorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  // Check authentication
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect('/moderator-login?error=authentication_required')
  }

  // Check if user is a moderator or higher
  const { data: adminProfile, error: adminError } = await supabase
    .from('admin_profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (adminError || !adminProfile) {
    redirect('/moderator-login?error=moderator_access_required')
  }

  // Check if suspended
  if (adminProfile.status === 'suspended') {
    redirect('/moderator-login?error=account_suspended')
  }

  // Get the full profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Get pending listings count for the badge
  const { count: pendingCount } = await supabase
    .from('properties')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'active')
    .or('moderation_status.is.null,moderation_status.eq.pending')

  const moderatorWithProfile = {
    ...adminProfile,
    profile: profile
  }

  return (
    <div className="flex h-screen overflow-hidden bg-muted/20">
      {/* Sidebar */}
      <ModeratorSidebar moderator={moderatorWithProfile} pendingCount={pendingCount || 0} />

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header */}
        <ModeratorHeader moderator={moderatorWithProfile} />

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="container mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
