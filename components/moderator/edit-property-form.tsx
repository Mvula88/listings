'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Pencil, Loader2 } from 'lucide-react'
import { updatePropertyAsModerator } from '@/lib/actions/moderation'
import { toast } from 'sonner'

interface Property {
  id: string
  title: string
  description: string | null
  price: number
  bedrooms: number | null
  bathrooms: number | null
  square_meters: number | null
  city: string
  province: string | null
  address_line1: string | null
  property_type: string
}

interface EditPropertyFormProps {
  property: Property
}

export function EditPropertyForm({ property }: EditPropertyFormProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: property.title,
    description: property.description || '',
    price: property.price,
    bedrooms: property.bedrooms || 0,
    bathrooms: property.bathrooms || 0,
    square_meters: property.square_meters || 0,
    city: property.city,
    province: property.province || '',
    address_line1: property.address_line1 || '',
    property_type: property.property_type,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const result = await updatePropertyAsModerator(property.id, {
      title: formData.title,
      description: formData.description || undefined,
      price: formData.price,
      bedrooms: formData.bedrooms || undefined,
      bathrooms: formData.bathrooms || undefined,
      square_meters: formData.square_meters || undefined,
      city: formData.city,
      province: formData.province || undefined,
      address_line1: formData.address_line1 || undefined,
      property_type: formData.property_type,
    })

    if (result.success) {
      toast.success('Property updated successfully')
      setOpen(false)
      router.refresh()
    } else {
      toast.error(result.error || 'Failed to update property')
    }
    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <Pencil className="h-4 w-4 mr-2" />
          Edit Listing
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Property Listing</DialogTitle>
          <DialogDescription>
            Make changes to this property listing. Changes will be logged.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
            />
          </div>

          {/* Price and Type */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="property_type">Property Type</Label>
              <Select
                value={formData.property_type}
                onValueChange={(value) => setFormData({ ...formData, property_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
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
          </div>

          {/* Bedrooms, Bathrooms, Size */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bedrooms">Bedrooms</Label>
              <Input
                id="bedrooms"
                type="number"
                min="0"
                value={formData.bedrooms}
                onChange={(e) => setFormData({ ...formData, bedrooms: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bathrooms">Bathrooms</Label>
              <Input
                id="bathrooms"
                type="number"
                min="0"
                step="0.5"
                value={formData.bathrooms}
                onChange={(e) => setFormData({ ...formData, bathrooms: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="square_meters">Size (m²)</Label>
              <Input
                id="square_meters"
                type="number"
                min="0"
                value={formData.square_meters}
                onChange={(e) => setFormData({ ...formData, square_meters: Number(e.target.value) })}
              />
            </div>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="address_line1">Address</Label>
            <Input
              id="address_line1"
              value={formData.address_line1}
              onChange={(e) => setFormData({ ...formData, address_line1: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="province">Province</Label>
              <Input
                id="province"
                value={formData.province}
                onChange={(e) => setFormData({ ...formData, province: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
