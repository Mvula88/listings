import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardNav } from '@/components/dashboard/nav'
import { UserMenu } from '@/components/dashboard/user-menu'
import { RoleSwitcher } from '@/components/dashboard/role-switcher'
import Image from 'next/image'
import Link from 'next/link'
import { Search, PlusCircle, Building } from 'lucide-react'
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
    .single<{ user_type: string; roles: string[] | null; [key: string]: any }>()

  // Get roles from profile, default to user_type if roles array doesn't exist
  const roles = (profile?.roles || (profile?.user_type ? [profile.user_type] : ['buyer'])) as UserRole[]
  const activeRole = (profile?.user_type || 'buyer') as UserRole

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <header className="border-b">
        <div className="flex h-16 items-center px-4 gap-4">
          <a href="/" className="flex items-center">
            <Image
              src="/logo.png"
              alt="PropLinka"
              width={140}
              height={40}
              className="h-8 w-auto"
              priority
            />
          </a>
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
              <>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/properties" className="flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    My Properties
                  </Link>
                </Button>
                <Button variant="default" size="sm" asChild>
                  <Link href="/properties/new" className="flex items-center gap-2">
                    <PlusCircle className="h-4 w-4" />
                    List Property
                  </Link>
                </Button>
              </>
            )}
            <UserMenu user={user} profile={profile} />
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar Navigation */}
        <aside className="w-64 border-r bg-muted/10 min-h-[calc(100vh-4rem)]">
          {/* Role Switcher */}
          <div className="p-4 border-b">
            <p className="text-xs text-muted-foreground mb-2">Active Role</p>
            <RoleSwitcher roles={roles} activeRole={activeRole} />
          </div>
          <DashboardNav userType={profile?.user_type} />
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}