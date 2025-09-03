import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function ListPropertyPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Redirect to dashboard for now - property listing will be added there
  redirect('/dashboard/properties/new')
}