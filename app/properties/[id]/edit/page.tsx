import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { FadeIn } from '@/components/ui/fade-in'
import { PropertyEditForm } from '@/components/properties/property-edit-form'
import { Toaster } from 'sonner'

interface EditPropertyPageProps {
  params: Promise<{ id: string }>
}

export default async function EditPropertyPage({ params }: EditPropertyPageProps) {
  const { id } = await params
  const supabase = await createClient()

  // Check authentication
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get the property with images
  const { data: property, error } = await supabase
    .from('properties')
    .select(`
      *,
      property_images (
        id,
        url,
        alt_text,
        order_index
      )
    `)
    .eq('id', id)
    .single() as { data: any; error: any }

  if (error || !property) {
    notFound()
  }

  // Verify ownership
  if (property.seller_id !== user.id) {
    redirect('/properties')
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
              <Link href="/properties">
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
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Edit Property</h1>
            <p className="text-muted-foreground text-lg">
              Update your property details and images
            </p>
          </div>
        </FadeIn>

        <PropertyEditForm
          property={property}
          countries={countries || []}
        />
      </div>
    </div>
  )
}
