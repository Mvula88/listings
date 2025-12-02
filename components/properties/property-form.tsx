'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Home, MapPin, DollarSign, Image as ImageIcon, Loader2 } from 'lucide-react'
import { FadeIn } from '@/components/ui/fade-in'
import { ImageUpload } from '@/components/properties/image-upload'
import { useImageUpload } from '@/lib/hooks/use-image-upload'
import { toast } from 'sonner'

interface PropertyFormProps {
  countries: any[]
}

export function PropertyForm({ countries }: PropertyFormProps) {
  const router = useRouter()
  const [images, setImages] = useState<File[]>([])
  const [submitting, setSubmitting] = useState(false)
  const { upload, uploading, progress } = useImageUpload()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const formData = new FormData(e.currentTarget)

      // Create property first
      const response = await fetch('/api/properties/create', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create property')
      }

      // Get the created property from response
      const result = await response.json()
      const propertyId = result.data?.id

      // Upload images if any
      if (images.length > 0 && propertyId) {
        toast.info('Uploading images...')
        await upload(propertyId, images)
        toast.success(`Property created with ${images.length} images!`)
      } else {
        toast.success('Property created successfully!')
      }

      // Redirect to dashboard/properties management page
      router.push('/properties')
      router.refresh()
    } catch (error: any) {
      console.error('Error creating property:', error)
      toast.error(error.message || 'Failed to create property')
      setSubmitting(false)
    }
  }

  const isLoading = submitting || uploading

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <FadeIn delay={0.1}>
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home className="h-5 w-5 text-primary" />
              Basic Information
            </CardTitle>
            <CardDescription>Tell us about your property</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Property Title *</Label>
              <Input
                id="title"
                name="title"
                placeholder="e.g., Modern 3-Bedroom House in Windhoek"
                required
                className="mt-1"
                disabled={isLoading}
              />
            </div>

            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Describe your property, its features, and what makes it special..."
                rows={5}
                required
                className="mt-1"
                disabled={isLoading}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="property_type">Property Type *</Label>
                <Select name="property_type" required disabled={isLoading}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="house">House</SelectItem>
                    <SelectItem value="apartment">Apartment</SelectItem>
                    <SelectItem value="townhouse">Townhouse</SelectItem>
                    <SelectItem value="land">Land</SelectItem>
                    <SelectItem value="commercial">Commercial</SelectItem>
                    <SelectItem value="farm">Farm</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="price">Asking Price *</Label>
                <div className="relative mt-1">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    placeholder="2500000"
                    required
                    className="pl-10"
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </FadeIn>

      {/* Location */}
      <FadeIn delay={0.2}>
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Location
            </CardTitle>
            <CardDescription>Where is your property located?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="country_id">Country *</Label>
              <Select name="country_id" required disabled={isLoading}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  {countries?.map((country: any) => (
                    <SelectItem key={country.id} value={String(country.id)}>
                      {country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  name="city"
                  placeholder="e.g., Windhoek"
                  required
                  className="mt-1"
                  disabled={isLoading}
                />
              </div>

              <div>
                <Label htmlFor="province">Province/Region *</Label>
                <Input
                  id="province"
                  name="province"
                  placeholder="e.g., Khomas"
                  required
                  className="mt-1"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="address_line1">Street Address *</Label>
              <Input
                id="address_line1"
                name="address_line1"
                placeholder="123 Main Street"
                required
                className="mt-1"
                disabled={isLoading}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="postal_code">Postal Code</Label>
                <Input
                  id="postal_code"
                  name="postal_code"
                  placeholder="Optional"
                  className="mt-1"
                  disabled={isLoading}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </FadeIn>

      {/* Property Details */}
      <FadeIn delay={0.3}>
        <Card className="border-2">
          <CardHeader>
            <CardTitle>Property Details</CardTitle>
            <CardDescription>Specifications and features</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="bedrooms">Bedrooms</Label>
                <Input
                  id="bedrooms"
                  name="bedrooms"
                  type="number"
                  min="0"
                  placeholder="3"
                  className="mt-1"
                  disabled={isLoading}
                />
              </div>

              <div>
                <Label htmlFor="bathrooms">Bathrooms</Label>
                <Input
                  id="bathrooms"
                  name="bathrooms"
                  type="number"
                  min="0"
                  step="0.5"
                  placeholder="2"
                  className="mt-1"
                  disabled={isLoading}
                />
              </div>

              <div>
                <Label htmlFor="square_meters">Size (m²)</Label>
                <Input
                  id="square_meters"
                  name="square_meters"
                  type="number"
                  min="0"
                  placeholder="280"
                  className="mt-1"
                  disabled={isLoading}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </FadeIn>

      {/* Images */}
      <FadeIn delay={0.4}>
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-primary" />
              Property Images
            </CardTitle>
            <CardDescription>
              Upload high-quality photos to attract more buyers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ImageUpload
              maxImages={15}
              maxSizeMB={10}
              onImagesChange={setImages}
            />
          </CardContent>
        </Card>
      </FadeIn>

      {/* Submit */}
      <FadeIn delay={0.5}>
        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            size="lg"
            onClick={() => router.back()}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="flex-1"
            size="lg"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {uploading && progress
                  ? `Uploading ${progress.loaded}/${progress.total}...`
                  : uploading
                  ? 'Uploading Images...'
                  : 'Creating...'}
              </>
            ) : (
              'Create Listing'
            )}
          </Button>
        </div>
      </FadeIn>
    </form>
  )
}
