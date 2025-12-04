import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
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
    .eq('is_active', true)
    .order('name')

  return (
    <div className="max-w-4xl">
      <Toaster position="top-center" />

      <FadeIn>
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Edit Property</h1>
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
  )
}
