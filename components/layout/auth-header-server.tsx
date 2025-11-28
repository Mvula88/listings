import { createClient } from '@/lib/supabase/server'
import { AuthHeader } from './auth-header'

export async function AuthHeaderServer() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  let profile = null
  if (user) {
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    profile = profileData
  }

  return <AuthHeader user={user} profile={profile} />
}
