import { createClient, createServiceClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardNav } from '@/components/dashboard/nav'
import { UserMenu } from '@/components/dashboard/user-menu'
import { RoleSwitcher } from '@/components/dashboard/role-switcher'
import { ListPropertyButton } from '@/components/dashboard/list-property-button'
import Image from 'next/image'
import Link from 'next/link'
import { Search, Building } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { UserRole } from '@/lib/actions/roles'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single<{ user_type: string; roles: string[] | null; is_suspended?: boolean; [key: string]: any }>()

  // Check if user is suspended or deleted
  if (profile?.is_suspended) {
    redirect('/suspended')
  }

  // Check if user is a lawyer and verify their status
  if (profile?.user_type === 'lawyer') {
    const { data: lawyer } = await (supabase as any)
      .from('lawyers')
      .select('verified')
      .eq('profile_id', user.id)
      .single()

    // If no lawyer record exists, redirect to onboarding
    if (!lawyer) {
      redirect('/lawyers/onboarding')
    }

    // Redirect unverified lawyers to verification pending page
    if (!lawyer.verified) {
      redirect('/lawyer/verification-pending')
    }
  }

  // Get roles from profile, default to user_type if roles array doesn't exist
  const roles = (profile?.roles || (profile?.user_type ? [profile.user_type] : ['buyer'])) as UserRole[]
  const activeRole = (profile?.user_type || 'buyer') as UserRole

  // Check if user is an admin (for showing admin panel link)
  // Use service client to bypass RLS policies on admin_profiles
  const serviceClient = createServiceClient()
  const { data: adminProfile } = await serviceClient
    .from('admin_profiles')
    .select('role, is_active')
    .eq('id', user.id)
    .eq('is_active', true)
    .single<{ role: string; is_active: boolean }>()

  const adminRole = adminProfile?.role || null

  return (
    <div className="h-screen overflow-hidden bg-background flex flex-col">
      {/* Top Navigation - Fixed */}
      <header className="border-b shrink-0">
        <div className="flex h-16 items-center px-4 gap-4">
          <Link href="/dashboard" className="flex items-center">
            <Image
              src="/logo.png"
              alt="PropLinka"
              width={140}
              height={40}
              className="h-8 w-auto"
              priority
            />
          </Link>
          <div className="ml-auto flex items-center space-x-4">
            {profile?.user_type === 'buyer' && (
              <Button variant="outline" size="sm" asChild>
                <Link href="/browse" className="flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  Browse Properties
                </Link>
              </Button>
            )}
            {profile?.user_type === 'seller' && (
              <Button variant="outline" size="sm" asChild>
                <Link href="/properties" className="flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  My Properties
                </Link>
              </Button>
            )}
            {/* Show List Property for both buyers and sellers */}
            {(profile?.user_type === 'buyer' || profile?.user_type === 'seller') && (
              <ListPropertyButton userType={profile?.user_type || 'buyer'} />
            )}
            <UserMenu user={user} profile={profile} adminRole={adminRole} />
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Navigation - Fixed */}
        <aside className="w-64 border-r bg-muted/10 overflow-y-auto shrink-0">
          {/* Role Switcher */}
          <div className="p-4 border-b bg-primary/10 border-l-4 border-l-primary">
            <p className="text-xs font-medium text-primary mb-2">Switch Role</p>
            <RoleSwitcher roles={roles} activeRole={activeRole} />
          </div>
          <DashboardNav userType={profile?.user_type} />
        </aside>

        {/* Main Content - Scrollable */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}