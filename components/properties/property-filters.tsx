'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

interface PropertyFiltersProps {
  countries: any[]
  currentFilters: any
}

export function PropertyFilters({ countries, currentFilters }: PropertyFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.push(`/browse?${params.toString()}`)
  }

  function clearFilters() {
    router.push('/browse')
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold mb-4">Filters</h3>
        
        {/* Country */}
        <div className="space-y-2 mb-4">
          <Label>Country</Label>
          <Select 
            value={currentFilters.country || ''} 
            onValueChange={(value) => updateFilter('country', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All countries" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All countries</SelectItem>
              {countries.map((country) => (
                <SelectItem key={country.id} value={country.id}>
                  {country.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Property Type */}
        <div className="space-y-2 mb-4">
          <Label>Property Type</Label>
          <RadioGroup 
            value={currentFilters.type || 'all'}
            onValueChange={(value) => updateFilter('type', value === 'all' ? '' : value)}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="all" id="all" />
              <Label htmlFor="all" className="font-normal cursor-pointer">All types</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="house" id="house" />
              <Label htmlFor="house" className="font-normal cursor-pointer">House</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="apartment" id="apartment" />
              <Label htmlFor="apartment" className="font-normal cursor-pointer">Apartment</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="land" id="land" />
              <Label htmlFor="land" className="font-normal cursor-pointer">Land</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="commercial" id="commercial" />
              <Label htmlFor="commercial" className="font-normal cursor-pointer">Commercial</Label>
            </div>
          </RadioGroup>
        </div>

        {/* Price Range */}
        <div className="space-y-2 mb-4">
          <Label>Price Range</Label>
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="number"
              placeholder="Min"
              value={currentFilters.minPrice || ''}
              onChange={(e) => updateFilter('minPrice', e.target.value)}
            />
            <Input
              type="number"
              placeholder="Max"
              value={currentFilters.maxPrice || ''}
              onChange={(e) => updateFilter('maxPrice', e.target.value)}
            />
          </div>
        </div>

        {/* Bedrooms */}
        <div className="space-y-2 mb-4">
          <Label>Bedrooms</Label>
          <Select 
            value={currentFilters.bedrooms || ''} 
            onValueChange={(value) => updateFilter('bedrooms', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Any" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any</SelectItem>
              <SelectItem value="1">1+</SelectItem>
              <SelectItem value="2">2+</SelectItem>
              <SelectItem value="3">3+</SelectItem>
              <SelectItem value="4">4+</SelectItem>
              <SelectItem value="5">5+</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Clear Filters */}
        <Button 
          variant="outline" 
          className="w-full"
          onClick={clearFilters}
        >
          Clear Filters
        </Button>
      </div>
    </div>
  )
}