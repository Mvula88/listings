import { createClient, createServiceClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AdminSidebar } from '@/components/admin/admin-sidebar'
import { AdminHeader } from '@/components/admin/admin-header'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  // Check authentication
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect('/login?redirectTo=/admin&error=admin_access_required')
  }

  // Use service client to bypass RLS for admin check
  // This is safe because we've already verified the user is authenticated
  const serviceClient = createServiceClient()

  // Check if user is admin using service client (bypasses RLS)
  const { data: adminProfile, error: adminError } = await serviceClient
    .from('admin_profiles')
    .select('*')
    .eq('id', user.id)
    .eq('is_active', true)
    .single<{
      id: string
      role: string
      is_active: boolean
      [key: string]: any
    }>()

  if (adminError || !adminProfile) {
    console.error('Admin check failed:', adminError)
    redirect('/dashboard?error=insufficient_permissions')
  }

  // Get the full profile separately (can use regular client since profiles table has different RLS)
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Attach profile to adminProfile for components
  const adminWithProfile = {
    ...adminProfile,
    profile: profile
  }

  return (
    <div className="flex h-screen overflow-hidden bg-muted/20">
      {/* Sidebar */}
      <AdminSidebar admin={adminWithProfile} />

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header */}
        <AdminHeader admin={adminWithProfile} />

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
