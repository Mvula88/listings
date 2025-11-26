'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, AlertCircle, Check, TrendingDown, Shield, Users, Sparkles } from 'lucide-react'

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phone: '',
    userType: 'buyer',
    country: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [countries, setCountries] = useState<any[]>([])
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function fetchCountries() {
    const { data } = await supabase
      .from('countries')
      .select('*')
      .order('name')

    if (data) {
      setCountries(data)
    }
    }
    fetchCountries()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    if (!formData.country) {
      setError('Please select your country')
      setLoading(false)
      return
    }

    try {
      // Sign up the user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            phone: formData.phone,
            user_type: formData.userType,
            country_id: formData.country || null
          }
        }
      })

      if (authError) throw authError

      if (authData.user) {
        // Profile will be created automatically by database trigger
        // Note: Country can be updated later in user profile settings

        router.push('/dashboard')
        router.refresh()
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-lg">
          <div className="mb-8">
            <Link href="/" className="inline-block">
              <Image
                src="/logo.png"
                alt="PropLinka"
                width={180}
                height={50}
                className="h-10 w-auto"
              />
            </Link>
          </div>

          <Card className="border-2 shadow-lg">
            <CardHeader className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full w-fit mb-2">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-medium text-primary">Free to Join</span>
              </div>
              <CardTitle className="text-2xl">Create an account</CardTitle>
              <CardDescription>
                Join PropLinka and save thousands on real estate
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleRegister}>
              <CardContent className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="John Doe"
                      value={formData.fullName}
                      onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                      required
                      disabled={loading}
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+27 123 456 789"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      disabled={loading}
                      className="h-11"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                    disabled={loading}
                    className="h-11"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      required
                      disabled={loading}
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                      required
                      disabled={loading}
                      className="h-11"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>I am a...</Label>
                  <RadioGroup
                    value={formData.userType}
                    onValueChange={(value) => setFormData({...formData, userType: value})}
                    disabled={loading}
                    className="grid grid-cols-3 gap-3"
                  >
                    <div>
                      <RadioGroupItem value="buyer" id="buyer" className="peer sr-only" />
                      <Label
                        htmlFor="buyer"
                        className="flex flex-col items-center justify-center rounded-xl border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer transition-all"
                      >
                        <Users className="h-5 w-5 mb-1 text-primary" />
                        <span className="text-sm font-medium">Buyer</span>
                      </Label>
                    </div>
                    <div>
                      <RadioGroupItem value="seller" id="seller" className="peer sr-only" />
                      <Label
                        htmlFor="seller"
                        className="flex flex-col items-center justify-center rounded-xl border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer transition-all"
                      >
                        <TrendingDown className="h-5 w-5 mb-1 text-primary" />
                        <span className="text-sm font-medium">Seller</span>
                      </Label>
                    </div>
                    <div>
                      <RadioGroupItem value="lawyer" id="lawyer" className="peer sr-only" />
                      <Label
                        htmlFor="lawyer"
                        className="flex flex-col items-center justify-center rounded-xl border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-emerald-600 peer-data-[state=checked]:bg-emerald-500/5 cursor-pointer transition-all"
                      >
                        <Shield className="h-5 w-5 mb-1 text-emerald-600" />
                        <span className="text-sm font-medium">Lawyer</span>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Select
                    value={formData.country}
                    onValueChange={(value) => setFormData({...formData, country: value})}
                    disabled={loading}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select your country" />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map((country) => (
                        <SelectItem key={country.id} value={country.id}>
                          {country.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <Button
                  type="submit"
                  className="w-full h-11"
                  size="lg"
                  disabled={loading}
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Account
                </Button>
                <p className="text-sm text-center text-muted-foreground">
                  Already have an account?{' '}
                  <Link href="/login" className="text-primary hover:underline font-medium">
                    Sign in
                  </Link>
                </p>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>

      {/* Right Side - Benefits with Background Image */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden">
        {/* Background Image */}
        <Image
          src="/hero-bg.jpg"
          alt="Property"
          fill
          className="object-cover"
          priority
        />
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/60 to-black/50" />

        <div className="relative z-10 flex flex-col justify-center p-12 max-w-lg mx-auto text-white">
          <h2 className="text-3xl font-bold mb-6 font-[family-name:var(--font-poppins)]">
            Why join <span className="text-primary">PropLinka</span>?
          </h2>

          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0">
                <TrendingDown className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Save up to 92% on fees</h3>
                <p className="text-sm text-white/70">
                  Our tiered flat-fee model saves you tens of thousands compared to agent commissions
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Direct communication</h3>
                <p className="text-sm text-white/70">
                  Connect directly with buyers or sellers - no middlemen, no delays
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0">
                <Shield className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Verified lawyers</h3>
                <p className="text-sm text-white/70">
                  Access to verified conveyancing lawyers with transparent flat-rate pricing
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0">
                <Check className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">No upfront costs</h3>
                <p className="text-sm text-white/70">
                  Free to list, free to browse. Only pay when your deal closes successfully
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
            <p className="text-sm text-white/80">
              <span className="font-semibold text-white">Join 1,000+ users</span> who have already saved over R10 million in agent commissions
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
