import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { FadeIn } from '@/components/ui/fade-in'
import { PropertyForm } from '@/components/properties/property-form'
import { Toaster } from 'sonner'

export default async function NewPropertyPage() {
  const supabase = await createClient()

  // Check authentication
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get countries for dropdown
  const { data: countries } = await supabase
    .from('countries')
    .select('*')
    .order('name')

  return (
    <div className="max-w-4xl">
      <Toaster position="top-center" />

      <FadeIn>
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">List Your Property</h1>
          <p className="text-muted-foreground text-lg">
            Fill in the details below to list your property on PropLinka - it's free!
          </p>
        </div>
      </FadeIn>

      <PropertyForm countries={countries || []} />
    </div>
  )
}
