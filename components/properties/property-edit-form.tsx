'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Home, MapPin, DollarSign, Image as ImageIcon, Loader2, X, GripVertical } from 'lucide-react'
import { FadeIn } from '@/components/ui/fade-in'
import { ImageUpload } from '@/components/properties/image-upload'
import { useImageUpload } from '@/lib/hooks/use-image-upload'
import { toast } from 'sonner'
import Image from 'next/image'

interface PropertyImage {
  id: string
  url: string
  alt_text: string | null
  order_index: number
}

interface PropertyEditFormProps {
  property: {
    id: string
    title: string
    description: string | null
    property_type: string
    price: number
    bedrooms: number | null
    bathrooms: number | null
    square_meters: number | null
    address_line1: string
    city: string
    province: string | null
    country_id: string
    property_images: PropertyImage[]
  }
  countries: any[]
}

export function PropertyEditForm({ property, countries }: PropertyEditFormProps) {
  const router = useRouter()
  const [newImages, setNewImages] = useState<File[]>([])
  const [existingImages, setExistingImages] = useState<PropertyImage[]>(
    property.property_images?.sort((a, b) => a.order_index - b.order_index) || []
  )
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
  const { upload, uploading } = useImageUpload()

  const handleRemoveExistingImage = (imageId: string) => {
    setExistingImages(prev => prev.filter(img => img.id !== imageId))
    setImagesToDelete(prev => [...prev, imageId])
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const formData = new FormData(e.currentTarget)

      // Build update data
      const updateData = {
        title: formData.get('title'),
        description: formData.get('description'),
        property_type: formData.get('property_type'),
        price: Number(formData.get('price')),
        bedrooms: Number(formData.get('bedrooms')) || null,
        bathrooms: Number(formData.get('bathrooms')) || null,
        square_meters: Number(formData.get('square_meters')) || null,
        address_line1: formData.get('address_line1'),
        city: formData.get('city'),
        province: formData.get('province') || null,
        country_id: formData.get('country_id'),
      }

      // Update property
      const response = await fetch(`/api/properties/${property.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update property')
      }

      // Delete removed images
      if (imagesToDelete.length > 0) {
        await fetch(`/api/properties/${property.id}/images`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ imageIds: imagesToDelete }),
        })
      }

      // Upload new images if any
      if (newImages.length > 0) {
        toast.info('Uploading new images...')
        await upload(property.id, newImages)
        toast.success(`Property updated with ${newImages.length} new images!`)
      } else {
        toast.success('Property updated successfully!')
      }

      // Redirect to properties management page
      router.push('/properties')
      router.refresh()
    } catch (error: any) {
      console.error('Error updating property:', error)
      toast.error(error.message || 'Failed to update property')
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
            <CardDescription>Update your property details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Property Title *</Label>
              <Input
                id="title"
                name="title"
                defaultValue={property.title}
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
                defaultValue={property.description || ''}
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
                <Select name="property_type" defaultValue={property.property_type} required disabled={isLoading}>
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
                    defaultValue={property.price}
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
              <Select name="country_id" defaultValue={property.country_id} required disabled={isLoading}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  {countries?.map((country: any) => (
                    <SelectItem key={country.id} value={country.id}>
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
                  defaultValue={property.city}
                  placeholder="e.g., Windhoek"
                  required
                  className="mt-1"
                  disabled={isLoading}
                />
              </div>

              <div>
                <Label htmlFor="province">Province/Region</Label>
                <Input
                  id="province"
                  name="province"
                  defaultValue={property.province || ''}
                  placeholder="e.g., Khomas"
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
                defaultValue={property.address_line1}
                placeholder="123 Main Street"
                required
                className="mt-1"
                disabled={isLoading}
              />
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
                  defaultValue={property.bedrooms || ''}
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
                  defaultValue={property.bathrooms || ''}
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
                  defaultValue={property.square_meters || ''}
                  placeholder="280"
                  className="mt-1"
                  disabled={isLoading}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </FadeIn>

      {/* Existing Images */}
      {existingImages.length > 0 && (
        <FadeIn delay={0.35}>
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-primary" />
                Current Images
              </CardTitle>
              <CardDescription>
                Click the X to remove an image
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {existingImages.map((image, index) => (
                  <div key={image.id} className="relative group">
                    <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                      <Image
                        src={image.url}
                        alt={image.alt_text || 'Property image'}
                        fill
                        className="object-cover"
                      />
                      {index === 0 && (
                        <span className="absolute bottom-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                          Main Photo
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveExistingImage(image.id)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      disabled={isLoading}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </FadeIn>
      )}

      {/* Add New Images */}
      <FadeIn delay={0.4}>
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-primary" />
              Add New Images
            </CardTitle>
            <CardDescription>
              Upload additional photos for your property
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ImageUpload
              maxImages={15 - existingImages.length}
              maxSizeMB={10}
              onImagesChange={setNewImages}
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
                {uploading ? 'Uploading Images...' : 'Saving...'}
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </div>
      </FadeIn>
    </form>
  )
}
