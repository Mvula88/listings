import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Home, MapPin, DollarSign, Image as ImageIcon, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { FadeIn } from '@/components/ui/fade-in'

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
                DealDirect
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
              Fill in the details below to list your property on DealDirect - it's free!
            </p>
          </div>
        </FadeIn>

        <form method="POST" action="/api/properties/create" className="space-y-6">
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
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="property_type">Property Type *</Label>
                    <Select name="property_type" required>
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
                  <Select name="country_id" required>
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
                      placeholder="e.g., Windhoek"
                      required
                      className="mt-1"
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
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </FadeIn>

          {/* Images Note */}
          <FadeIn delay={0.4}>
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-900">
                  <ImageIcon className="h-5 w-5" />
                  Property Images
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-blue-900">
                  After creating your listing, you'll be able to upload photos of your property.
                  High-quality images help attract more buyers!
                </p>
              </CardContent>
            </Card>
          </FadeIn>

          {/* Submit */}
          <FadeIn delay={0.5}>
            <div className="flex gap-4">
              <Link href="/dashboard" className="flex-1">
                <Button type="button" variant="outline" className="w-full" size="lg">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" className="flex-1" size="lg">
                Create Listing
              </Button>
            </div>
          </FadeIn>
        </form>
      </div>
    </div>
  )
}
