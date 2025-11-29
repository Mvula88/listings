'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Briefcase, Loader2, Check } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/lib/hooks/use-toast'

interface LawyerPracticeSettingsProps {
  lawyer: {
    id: string
    firm_name: string | null
    bar_number: string | null
    years_of_experience: number | null
    practice_areas: string[] | null
    office_phone: string | null
    office_address: string | null
    website: string | null
    bio: string | null
  } | null
}

export function LawyerPracticeSettings({ lawyer }: LawyerPracticeSettingsProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const { toast } = useToast()
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    setSuccess(false)

    const formData = new FormData(e.currentTarget)

    try {
      const practiceAreasInput = formData.get('practiceAreas') as string
      const practiceAreas = practiceAreasInput
        ? practiceAreasInput.split(',').map(s => s.trim()).filter(Boolean)
        : []

      const { error } = await (supabase
        .from('lawyers') as any)
        .update({
          firm_name: formData.get('firmName'),
          bar_number: formData.get('barNumber'),
          years_of_experience: parseInt(formData.get('yearsOfExperience') as string) || null,
          practice_areas: practiceAreas,
          office_phone: formData.get('officePhone'),
          office_address: formData.get('officeAddress'),
          website: formData.get('website'),
          bio: formData.get('bio'),
          updated_at: new Date().toISOString()
        })
        .eq('id', lawyer?.id)

      if (error) {
        toast.error('Failed to update practice settings: ' + error.message)
      } else {
        setSuccess(true)
        toast.success('Practice settings updated successfully')
        setTimeout(() => setSuccess(false), 3000)
      }
    } catch (error) {
      toast.error('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  if (!lawyer) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Briefcase className="h-5 w-5" />
          Practice Settings
        </CardTitle>
        <CardDescription>
          Update your legal practice information
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firmName">Firm Name</Label>
              <Input
                id="firmName"
                name="firmName"
                defaultValue={lawyer.firm_name || ''}
                placeholder="Enter your firm name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="barNumber">Bar Registration Number</Label>
              <Input
                id="barNumber"
                name="barNumber"
                defaultValue={lawyer.bar_number || ''}
                placeholder="Enter your bar number"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="yearsOfExperience">Years of Experience</Label>
              <Input
                id="yearsOfExperience"
                name="yearsOfExperience"
                type="number"
                min="0"
                defaultValue={lawyer.years_of_experience || ''}
                placeholder="e.g., 10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="officePhone">Office Phone</Label>
              <Input
                id="officePhone"
                name="officePhone"
                defaultValue={lawyer.office_phone || ''}
                placeholder="Enter your office phone"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="practiceAreas">Practice Areas</Label>
            <Input
              id="practiceAreas"
              name="practiceAreas"
              defaultValue={Array.isArray(lawyer.practice_areas) ? lawyer.practice_areas.join(', ') : ''}
              placeholder="e.g., Conveyancing, Property Law, Commercial (comma separated)"
            />
            <p className="text-xs text-muted-foreground">
              Separate multiple areas with commas
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="officeAddress">Office Address</Label>
            <Input
              id="officeAddress"
              name="officeAddress"
              defaultValue={lawyer.office_address || ''}
              placeholder="Enter your office address"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              name="website"
              type="url"
              defaultValue={lawyer.website || ''}
              placeholder="https://www.yourfirm.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Professional Bio</Label>
            <Textarea
              id="bio"
              name="bio"
              defaultValue={lawyer.bio || ''}
              placeholder="Tell clients about your experience and expertise..."
              rows={4}
            />
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : success ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Saved!
                </>
              ) : (
                'Save Practice Settings'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
