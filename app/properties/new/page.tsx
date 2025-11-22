import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
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
    <div className="min-h-screen bg-background">
      <Toaster position="top-center" />

      {/* Header */}
      <div className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="icon" className="transition-transform hover:scale-105">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="/" className="text-2xl font-bold text-primary transition-transform hover:scale-105">
                PropLinka
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <FadeIn>
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">List Your Property</h1>
            <p className="text-muted-foreground text-lg">
              Fill in the details below to list your property on PropLinka - it's free!
            </p>
          </div>
        </FadeIn>

        <PropertyForm countries={countries || []} />
      </div>
    </div>
  )
}
