import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function ListPropertyPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Redirect to dashboard - property listing functionality is available there
  redirect('/dashboard')
}