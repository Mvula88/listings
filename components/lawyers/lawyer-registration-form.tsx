'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
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
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const lawyerSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  email: z.string().email('Valid email is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  phone: z.string().min(10, 'Valid phone number is required'),
  firmName: z.string().min(2, 'Firm name is required'),
  registrationNumber: z.string().min(1, 'Registration number is required'),
  yearsExperience: z.string().min(1, 'Years of experience is required'),
  countryId: z.string().min(1, 'Country is required'),
  citiesServed: z.string().min(1, 'Cities served is required'),
  specializations: z.string().min(1, 'Specializations are required'),
  bio: z.string().min(50, 'Bio must be at least 50 characters'),
  agreeToTerms: z.boolean().refine((val) => val === true, {
    message: 'You must agree to the terms and conditions',
  }),
})

type LawyerFormData = z.infer<typeof lawyerSchema>

export function LawyerRegistrationForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<LawyerFormData>({
    resolver: zodResolver(lawyerSchema),
  })

  const agreeToTerms = watch('agreeToTerms')

  async function onSubmit(data: LawyerFormData) {
    setLoading(true)
    setError(null)

    try {
      // 1. Create user account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
            user_type: 'lawyer',
          },
        },
      })

      if (authError) throw authError
      if (!authData.user) throw new Error('Failed to create account')

      // 2. Create profile
      const { error: profileError } = await (supabase.from('profiles') as any).insert({
        id: authData.user.id,
        full_name: data.fullName,
        email: data.email,
        phone_number: data.phone,
        user_type: 'lawyer',
      })

      if (profileError) throw profileError

      // 3. Create lawyer record
      const citiesArray = data.citiesServed
        .split(',')
        .map((city) => city.trim())
        .filter(Boolean)

      const specializationsArray = data.specializations
        .split(',')
        .map((spec) => spec.trim())
        .filter(Boolean)

      const { error: lawyerError } = await (supabase.from('lawyers') as any).insert({
        profile_id: authData.user.id,
        firm_name: data.firmName,
        registration_number: data.registrationNumber,
        years_experience: parseInt(data.yearsExperience),
        country_id: data.countryId,
        cities_served: citiesArray,
        specializations: specializationsArray,
        bio: data.bio,
        verified: false, // Will be verified by admin
        available: true,
        rating: 0,
        review_count: 0,
      })

      if (lawyerError) throw lawyerError

      // 4. Success! Redirect to verification pending page
      router.push('/lawyer/verification-pending')
    } catch (err: any) {
      console.error('Registration error:', err)
      setError(err.message || 'Failed to register. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Personal Information */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Personal Information</h3>

        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name *</Label>
          <Input
            id="fullName"
            {...register('fullName')}
            placeholder="John Doe"
          />
          {errors.fullName && (
            <p className="text-sm text-destructive">{errors.fullName.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email Address *</Label>
          <Input
            id="email"
            type="email"
            {...register('email')}
            placeholder="john@lawfirm.com"
          />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password *</Label>
          <Input
            id="password"
            type="password"
            {...register('password')}
            placeholder="••••••••"
          />
          {errors.password && (
            <p className="text-sm text-destructive">{errors.password.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number *</Label>
          <Input
            id="phone"
            type="tel"
            {...register('phone')}
            placeholder="+27 XX XXX XXXX"
          />
          {errors.phone && (
            <p className="text-sm text-destructive">{errors.phone.message}</p>
          )}
        </div>
      </div>

      {/* Professional Information */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Professional Information</h3>

        <div className="space-y-2">
          <Label htmlFor="firmName">Law Firm Name *</Label>
          <Input
            id="firmName"
            {...register('firmName')}
            placeholder="Doe & Associates"
          />
          {errors.firmName && (
            <p className="text-sm text-destructive">{errors.firmName.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="registrationNumber">Registration Number *</Label>
          <Input
            id="registrationNumber"
            {...register('registrationNumber')}
            placeholder="Law Society Registration #"
          />
          {errors.registrationNumber && (
            <p className="text-sm text-destructive">
              {errors.registrationNumber.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="yearsExperience">Years of Experience *</Label>
          <Input
            id="yearsExperience"
            type="number"
            {...register('yearsExperience')}
            placeholder="5"
            min="2"
          />
          {errors.yearsExperience && (
            <p className="text-sm text-destructive">
              {errors.yearsExperience.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="countryId">Country *</Label>
          <Select onValueChange={(value) => setValue('countryId', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select country" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">South Africa</SelectItem>
              <SelectItem value="2">Namibia</SelectItem>
            </SelectContent>
          </Select>
          {errors.countryId && (
            <p className="text-sm text-destructive">{errors.countryId.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="citiesServed">Cities Served (comma-separated) *</Label>
          <Input
            id="citiesServed"
            {...register('citiesServed')}
            placeholder="Cape Town, Johannesburg, Durban"
          />
          {errors.citiesServed && (
            <p className="text-sm text-destructive">
              {errors.citiesServed.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="specializations">
            Specializations (comma-separated) *
          </Label>
          <Input
            id="specializations"
            {...register('specializations')}
            placeholder="Residential, Commercial, Agricultural"
          />
          {errors.specializations && (
            <p className="text-sm text-destructive">
              {errors.specializations.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="bio">Professional Bio (minimum 50 characters) *</Label>
          <Textarea
            id="bio"
            {...register('bio')}
            placeholder="Tell us about your experience and expertise in property conveyancing..."
            rows={4}
          />
          {errors.bio && (
            <p className="text-sm text-destructive">{errors.bio.message}</p>
          )}
        </div>
      </div>

      {/* Terms and Conditions */}
      <div className="flex items-start space-x-2">
        <Checkbox
          id="terms"
          checked={agreeToTerms}
          onCheckedChange={(checked) => setValue('agreeToTerms', checked as boolean)}
        />
        <div className="grid gap-1.5 leading-none">
          <label
            htmlFor="terms"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            I agree to the terms and conditions *
          </label>
          <p className="text-sm text-muted-foreground">
            I confirm that I have read and agree to the{' '}
            <a href="/terms" className="text-primary hover:underline">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="/lawyer-partnership" className="text-primary hover:underline">
              Lawyer Partnership Agreement
            </a>
            .
          </p>
        </div>
      </div>
      {errors.agreeToTerms && (
        <p className="text-sm text-destructive">{errors.agreeToTerms.message}</p>
      )}

      <Button type="submit" className="w-full" size="lg" disabled={loading}>
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {loading ? 'Creating Account...' : 'Register as Lawyer'}
      </Button>

      <p className="text-xs text-center text-muted-foreground">
        Your application will be reviewed within 24-48 hours. You'll receive an email
        once verified.
      </p>
    </form>
  )
}
