'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const registrationSchema = z.object({
  full_name: z.string().min(2, 'Full name is required'),
  email: z.string().email('Valid email is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  phone_number: z.string().min(10, 'Valid phone number is required'),
  user_type: z.enum(['buyer', 'seller'], {
    message: 'Please select a user type',
  }),
})

type RegistrationFormData = z.infer<typeof registrationSchema>

interface RegistrationFormProps {
  userType?: 'buyer' | 'seller'
}

export function RegistrationForm({ userType }: RegistrationFormProps) {
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
  } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    mode: 'onBlur',
    defaultValues: {
      user_type: userType || 'buyer',
    },
  })

  const selectedUserType = watch('user_type')

  async function onSubmit(data: RegistrationFormData) {
    setLoading(true)
    setError(null)

    try {
      // 1. Create user account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.full_name,
            user_type: data.user_type,
          },
        },
      })

      if (authError) throw authError
      if (!authData.user) throw new Error('Failed to create account')

      // 2. Create profile
      const { error: profileError } = await (supabase.from('profiles') as any).insert({
        id: authData.user.id,
        full_name: data.full_name,
        email: data.email,
        phone_number: data.phone_number,
        user_type: data.user_type,
      })

      if (profileError) throw profileError

      // 3. Redirect based on user type
      if (data.user_type === 'seller') {
        router.push('/dashboard')
      } else {
        router.push('/properties')
      }
    } catch (err: any) {
      console.error('Registration error:', err)
      setError(err.message || 'Registration failed. Please try again.')
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

      {/* Full Name */}
      <div className="space-y-2">
        <Label htmlFor="full_name">Full Name</Label>
        <Input
          id="full_name"
          {...register('full_name')}
          placeholder="John Doe"
          disabled={loading}
        />
        {errors.full_name && (
          <p className="text-sm text-destructive">{errors.full_name.message}</p>
        )}
      </div>

      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="email">Email Address</Label>
        <Input
          id="email"
          type="email"
          {...register('email')}
          placeholder="john@example.com"
          disabled={loading}
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>

      {/* Password */}
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          {...register('password')}
          placeholder="••••••••"
          disabled={loading}
        />
        {errors.password && (
          <p className="text-sm text-destructive">{errors.password.message}</p>
        )}
        <p className="text-xs text-muted-foreground">
          Must be at least 8 characters long
        </p>
      </div>

      {/* Phone Number */}
      <div className="space-y-2">
        <Label htmlFor="phone_number">Phone Number</Label>
        <Input
          id="phone_number"
          type="tel"
          {...register('phone_number')}
          placeholder="+27 XX XXX XXXX"
          disabled={loading}
        />
        {errors.phone_number && (
          <p className="text-sm text-destructive">{errors.phone_number.message}</p>
        )}
      </div>

      {/* User Type */}
      {!userType && (
        <div className="space-y-2">
          <Label htmlFor="user_type">I want to</Label>
          <Select
            value={selectedUserType}
            onValueChange={(value) => setValue('user_type', value as 'buyer' | 'seller')}
            disabled={loading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select user type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="buyer">Buy Property</SelectItem>
              <SelectItem value="seller">Sell Property</SelectItem>
            </SelectContent>
          </Select>
          {errors.user_type && (
            <p className="text-sm text-destructive">{errors.user_type.message}</p>
          )}
        </div>
      )}

      {/* Submit Button */}
      <Button type="submit" className="w-full" size="lg" disabled={loading}>
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {loading ? 'Creating Account...' : 'Register'}
      </Button>

      <p className="text-xs text-center text-muted-foreground">
        By registering, you agree to our{' '}
        <a href="/terms" className="text-primary hover:underline">
          Terms of Service
        </a>{' '}
        and{' '}
        <a href="/privacy" className="text-primary hover:underline">
          Privacy Policy
        </a>
      </p>
    </form>
  )
}
