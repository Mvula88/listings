'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Award,
  DollarSign,
  CheckCircle,
  Loader2,
  ArrowRight,
  Users
} from 'lucide-react'

interface Country {
  id: string
  name: string
  code: string
}

export default function LawyerOnboardingPage() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [countries, setCountries] = useState<Country[]>([])
  const router = useRouter()
  const supabase: any = createClient()

  // Fetch countries on mount
  useEffect(() => {
    async function fetchCountries() {
      const { data } = await supabase
        .from('countries')
        .select('id, name, code')
        .order('name')
      if (data) {
        setCountries(data)
      }
    }
    fetchCountries()
  }, [supabase])
  
  const [formData, setFormData] = useState({
    firmName: '',
    registrationNumber: '',
    country: '',
    city: '',
    yearsExperience: '',
    flatFeeBuyer: '',
    flatFeeSeller: '',
    bio: '',
    languages: [] as string[],
    specializations: [] as string[],
    paymentMethod: 'invoice',
    agreedToTerms: false
  })

  const totalSteps = 4

  async function handleSubmit() {
    setLoading(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login')
        return
      }

      // Create lawyer profile
      const { error: lawyerError } = await supabase
        .from('lawyers')
        .insert({
          profile_id: user.id,
          firm_name: formData.firmName,
          registration_number: formData.registrationNumber,
          country_id: formData.country || null,
          city: formData.city,
          years_experience: parseInt(formData.yearsExperience) || null,
          flat_fee_buyer: parseFloat(formData.flatFeeBuyer) || null,
          flat_fee_seller: parseFloat(formData.flatFeeSeller) || null,
          bio: formData.bio,
          languages: formData.languages,
          specializations: formData.specializations,
          payment_method: formData.paymentMethod,
          verified: false,
          available: true
        })

      if (lawyerError) throw lawyerError

      // Update user profile type
      await supabase
        .from('profiles')
        .update({ user_type: 'lawyer' })
        .eq('id', user.id)

      // If Stripe Connect selected, redirect to Stripe onboarding
      if (formData.paymentMethod === 'stripe_connect') {
        // TODO: Create Stripe Connect account and redirect
        router.push('/lawyers/stripe-onboarding')
      } else {
        router.push('/dashboard')
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="firmName">Law Firm Name</Label>
              <Input
                id="firmName"
                value={formData.firmName}
                onChange={(e) => setFormData({...formData, firmName: e.target.value})}
                placeholder="Smith & Associates Law Firm"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="registrationNumber">Registration/License Number</Label>
              <Input
                id="registrationNumber"
                value={formData.registrationNumber}
                onChange={(e) => setFormData({...formData, registrationNumber: e.target.value})}
                placeholder="LAW123456"
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Select
                  value={formData.country}
                  onValueChange={(value) => setFormData({...formData, country: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select country" />
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
              
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData({...formData, city: e.target.value})}
                  placeholder="Cape Town"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="yearsExperience">Years of Experience</Label>
              <Input
                id="yearsExperience"
                type="number"
                value={formData.yearsExperience}
                onChange={(e) => setFormData({...formData, yearsExperience: e.target.value})}
                placeholder="10"
                required
              />
            </div>
          </div>
        )
      
      case 2:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="flatFeeBuyer">Flat Fee for Buyers (in local currency)</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="flatFeeBuyer"
                  type="number"
                  value={formData.flatFeeBuyer}
                  onChange={(e) => setFormData({...formData, flatFeeBuyer: e.target.value})}
                  className="pl-10"
                  placeholder="15000"
                  required
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Your standard fee for representing property buyers
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="flatFeeSeller">Flat Fee for Sellers (in local currency)</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="flatFeeSeller"
                  type="number"
                  value={formData.flatFeeSeller}
                  onChange={(e) => setFormData({...formData, flatFeeSeller: e.target.value})}
                  className="pl-10"
                  placeholder="12000"
                  required
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Your standard fee for representing property sellers
              </p>
            </div>
            
            <Alert>
              <AlertDescription>
                PropLinka promotes transparent, flat-fee pricing. Your fees will be clearly displayed to clients before they select you.
              </AlertDescription>
            </Alert>
          </div>
        )
      
      case 3:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bio">Professional Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData({...formData, bio: e.target.value})}
                placeholder="Tell potential clients about your experience, specializations, and approach to conveyancing..."
                rows={4}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Languages Spoken</Label>
              <div className="grid grid-cols-2 gap-2">
                {['English', 'Afrikaans', 'Zulu', 'Xhosa', 'German', 'Portuguese'].map((lang) => (
                  <label key={lang} className="flex items-center space-x-2">
                    <Checkbox
                      checked={formData.languages.includes(lang)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setFormData({...formData, languages: [...formData.languages, lang]})
                        } else {
                          setFormData({...formData, languages: formData.languages.filter(l => l !== lang)})
                        }
                      }}
                    />
                    <span className="text-sm">{lang}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Specializations</Label>
              <div className="grid grid-cols-2 gap-2">
                {['Residential', 'Commercial', 'Agricultural', 'Sectional Title', 'New Developments'].map((spec) => (
                  <label key={spec} className="flex items-center space-x-2">
                    <Checkbox
                      checked={formData.specializations.includes(spec)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setFormData({...formData, specializations: [...formData.specializations, spec]})
                        } else {
                          setFormData({...formData, specializations: formData.specializations.filter(s => s !== spec)})
                        }
                      }}
                    />
                    <span className="text-sm">{spec}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )
      
      case 4:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Commission Payment Method</Label>
              <p className="text-sm text-muted-foreground mb-2">
                PropLinka pays you a 10% commission on every platform fee collected. Choose how you'd like to receive your commission:
              </p>
              <div className="bg-primary/10 rounded-lg p-4 mb-4">
                <p className="text-sm font-semibold mb-2">How It Works:</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• You collect the full platform fee from the seller at closing</li>
                  <li>• You keep 10% as your commission (e.g., R750 from R7,500 fee)</li>
                  <li>• You remit the remaining 90% to PropLinka within 30 days</li>
                </ul>
              </div>
              <div className="space-y-2">
                <label className="flex items-start space-x-2 p-4 border rounded-lg cursor-pointer hover:bg-muted/50">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="deduct_before_remittance"
                    checked={formData.paymentMethod === 'deduct_before_remittance'}
                    onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}
                    className="mt-1"
                  />
                  <div>
                    <p className="font-medium">Deduct from Remittance (Recommended)</p>
                    <p className="text-sm text-muted-foreground">
                      Keep your 10% commission and remit only the net 90% to PropLinka
                    </p>
                  </div>
                </label>

                <label className="flex items-start space-x-2 p-4 border rounded-lg cursor-pointer hover:bg-muted/50">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="monthly_invoice"
                    checked={formData.paymentMethod === 'monthly_invoice'}
                    onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}
                    className="mt-1"
                  />
                  <div>
                    <p className="font-medium">Monthly Commission Invoice</p>
                    <p className="text-sm text-muted-foreground">
                      Remit full amount, receive monthly invoice for accumulated commission
                    </p>
                  </div>
                </label>
              </div>
            </div>

            <div className="flex items-start space-x-2">
              <Checkbox
                id="terms"
                checked={formData.agreedToTerms}
                onCheckedChange={(checked) => setFormData({...formData, agreedToTerms: checked as boolean})}
              />
              <Label htmlFor="terms" className="text-sm leading-relaxed">
                I agree to PropLinka's terms of service for conveyancers, including earning a 10% commission on platform fees and remitting the net 90% within 30 days of closing
              </Label>
            </div>
            
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background">
      <div className="container max-w-2xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Join PropLinka as a Conveyancer</h1>
          <p className="text-muted-foreground">
            Connect with clients directly and grow your practice
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  i <= step ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                }`}
              >
                {i < step ? <CheckCircle className="h-5 w-5" /> : i}
              </div>
            ))}
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {step === 1 && 'Basic Information'}
              {step === 2 && 'Pricing Structure'}
              {step === 3 && 'Professional Details'}
              {step === 4 && 'Payment & Terms'}
            </CardTitle>
            <CardDescription>
              Step {step} of {totalSteps}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {renderStep()}
            
            <div className="flex justify-between mt-6">
              <Button
                variant="outline"
                onClick={() => setStep(step - 1)}
                disabled={step === 1}
              >
                Previous
              </Button>
              
              {step < totalSteps ? (
                <Button onClick={() => setStep(step + 1)}>
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button 
                  onClick={handleSubmit}
                  disabled={!formData.agreedToTerms || loading}
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Complete Registration
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <h3 className="font-semibold mb-4">Why Join PropLinka?</h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="flex flex-col items-center">
              <Users className="h-8 w-8 text-primary mb-2" />
              <p className="font-medium">Direct Client Access</p>
              <p className="text-muted-foreground">No middleman fees</p>
            </div>
            <div className="flex flex-col items-center">
              <DollarSign className="h-8 w-8 text-primary mb-2" />
              <p className="font-medium">Transparent Pricing</p>
              <p className="text-muted-foreground">Set your own flat fees</p>
            </div>
            <div className="flex flex-col items-center">
              <Award className="h-8 w-8 text-primary mb-2" />
              <p className="font-medium">Build Your Reputation</p>
              <p className="text-muted-foreground">Get reviews and ratings</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}