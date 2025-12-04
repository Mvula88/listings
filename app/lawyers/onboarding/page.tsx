'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
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
  Users,
  Upload,
  FileText,
  X,
  AlertCircle
} from 'lucide-react'
import {
  getActiveCountriesForOnboarding,
  getCountryDocumentRequirementsForOnboarding,
  type DocumentRequirement
} from '@/lib/actions/lawyer-onboarding'

interface Country {
  id: string
  name: string
  code: string
  flag_emoji: string | null
}

interface UploadedFile {
  file: File
  preview?: string
}

export default function LawyerOnboardingPage() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [countries, setCountries] = useState<Country[]>([])
  const [documentRequirements, setDocumentRequirements] = useState<DocumentRequirement[]>([])
  const [loadingRequirements, setLoadingRequirements] = useState(false)
  const [countryInfo, setCountryInfo] = useState<{ name: string; currency: string; currency_symbol: string } | null>(null)
  const router = useRouter()
  const supabase: any = createClient()

  // Dynamic file input refs
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({})

  // Fetch countries on mount
  useEffect(() => {
    async function fetchCountries() {
      const { countries: data } = await getActiveCountriesForOnboarding()
      setCountries(data)
    }
    fetchCountries()
  }, [])

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
    paymentMethod: 'deduct',
    agreedToTerms: false
  })

  // Dynamic document uploads state - keyed by requirement ID
  const [documents, setDocuments] = useState<{ [key: string]: UploadedFile | null }>({})

  const totalSteps = 5

  // Fetch document requirements when country changes
  const fetchDocumentRequirements = useCallback(async (countryId: string) => {
    if (!countryId) {
      setDocumentRequirements([])
      setCountryInfo(null)
      return
    }

    setLoadingRequirements(true)
    try {
      const { requirements, country, error } = await getCountryDocumentRequirementsForOnboarding(countryId)
      if (error) {
        console.error('Error fetching requirements:', error)
      }
      setDocumentRequirements(requirements)
      setCountryInfo(country || null)
      // Reset documents when country changes
      setDocuments({})
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setLoadingRequirements(false)
    }
  }, [])

  // Handle country change
  function handleCountryChange(countryId: string) {
    setFormData({ ...formData, country: countryId })
    fetchDocumentRequirements(countryId)
  }

  // Handle file selection
  function handleFileSelect(requirementId: string, file: File | null, requirement: DocumentRequirement) {
    if (!file) return

    // Validate file type
    const allowedTypes = requirement.accepted_file_types || ['application/pdf', 'image/jpeg', 'image/png']
    if (!allowedTypes.includes(file.type)) {
      const extensions = allowedTypes.map(t => t.split('/')[1]).join(', ')
      setError(`Please upload a valid file type: ${extensions}`)
      return
    }

    // Validate file size
    const maxSize = (requirement.max_file_size_mb || 5) * 1024 * 1024
    if (file.size > maxSize) {
      setError(`File size must be less than ${requirement.max_file_size_mb || 5}MB`)
      return
    }

    setDocuments(prev => ({
      ...prev,
      [requirementId]: { file, preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined }
    }))
    setError(null)
  }

  function removeFile(requirementId: string) {
    setDocuments(prev => ({
      ...prev,
      [requirementId]: null
    }))
  }

  // Upload file to Supabase Storage - returns file path (not URL) for secure storage
  async function uploadDocument(file: File, userId: string, docKey: string): Promise<string | null> {
    const fileExt = file.name.split('.').pop()
    const filePath = `${userId}/${docKey}_${Date.now()}.${fileExt}`

    const { data, error } = await supabase.storage
      .from('lawyer-documents')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('Upload error:', error)
      return null
    }

    // Return file path (not public URL) - signed URLs will be generated on-demand
    return filePath
  }

  // Check if all required documents are uploaded
  function areRequiredDocsUploaded(): boolean {
    const requiredDocs = documentRequirements.filter(r => r.is_required)
    return requiredDocs.every(r => documents[r.id]?.file)
  }

  async function handleSubmit() {
    setLoading(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      // Validate required documents
      if (!areRequiredDocsUploaded()) {
        setError('Please upload all required documents')
        setLoading(false)
        return
      }

      // Upload all documents
      const uploadedDocs: { requirementId: string; filePath: string }[] = []

      for (const requirement of documentRequirements) {
        const doc = documents[requirement.id]
        if (doc?.file) {
          setUploadingDoc(requirement.document_name)
          const filePath = await uploadDocument(doc.file, user.id, requirement.document_key)
          if (!filePath && requirement.is_required) {
            throw new Error(`Failed to upload ${requirement.document_name}`)
          }
          if (filePath) {
            uploadedDocs.push({ requirementId: requirement.id, filePath })
          }
        }
      }

      setUploadingDoc(null)

      // Create lawyer profile with document records
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
          available: true,
          verification_submitted_at: new Date().toISOString()
        })

      if (lawyerError) throw lawyerError

      // Get the created lawyer ID
      const { data: lawyer } = await supabase
        .from('lawyers')
        .select('id')
        .eq('profile_id', user.id)
        .single()

      // Insert document records if we have the lawyer_documents table
      if (lawyer && uploadedDocs.length > 0) {
        const documentRecords = uploadedDocs.map(doc => ({
          lawyer_id: lawyer.id,
          requirement_id: doc.requirementId,
          file_path: doc.filePath,
          status: 'pending'
        }))

        // Try to insert, but don't fail if table doesn't exist yet
        await supabase
          .from('lawyer_documents')
          .insert(documentRecords)
          .catch((err: any) => console.log('Document records insert skipped:', err.message))
      }

      // Update user profile type
      await supabase
        .from('profiles')
        .update({ user_type: 'lawyer' })
        .eq('id', user.id)

      // Redirect to verification pending page
      router.push('/lawyer/verification-pending')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
      setUploadingDoc(null)
    }
  }

  // Get currency symbol for display
  const currencySymbol = countryInfo?.currency_symbol || '$'

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
                  onValueChange={handleCountryChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((country) => (
                      <SelectItem key={country.id} value={country.id}>
                        {country.flag_emoji && `${country.flag_emoji} `}{country.name}
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
              <Label htmlFor="flatFeeBuyer">Flat Fee for Buyers {countryInfo && `(${countryInfo.currency})`}</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                  {currencySymbol}
                </span>
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
              <Label htmlFor="flatFeeSeller">Flat Fee for Sellers {countryInfo && `(${countryInfo.currency})`}</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                  {currencySymbol}
                </span>
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
            <Alert className="border-blue-200 bg-blue-50">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                To verify your credentials, please upload the following documents.
                These will be reviewed by our team before your account is activated.
              </AlertDescription>
            </Alert>

            {loadingRequirements ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                <span className="ml-2 text-muted-foreground">Loading requirements...</span>
              </div>
            ) : documentRequirements.length === 0 ? (
              <Alert>
                <AlertDescription>
                  {formData.country
                    ? 'No document requirements configured for this country yet. Please contact support.'
                    : 'Please select a country in step 1 to see required documents.'
                  }
                </AlertDescription>
              </Alert>
            ) : (
              documentRequirements.map((requirement) => (
                <div key={requirement.id} className="space-y-2">
                  <Label className="flex items-center gap-2">
                    {requirement.document_name}
                    {requirement.is_required ? (
                      <span className="text-red-500">*</span>
                    ) : (
                      <span className="text-muted-foreground text-xs">(Optional)</span>
                    )}
                  </Label>
                  {(requirement.description || requirement.help_text) && (
                    <p className="text-xs text-muted-foreground mb-2">
                      {requirement.help_text || requirement.description}
                    </p>
                  )}
                  {documents[requirement.id] ? (
                    <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/50">
                      <FileText className="h-8 w-8 text-primary" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {documents[requirement.id]!.file.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {(documents[requirement.id]!.file.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFile(requirement.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div
                      className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary hover:bg-muted/50 transition-colors"
                      onClick={() => fileInputRefs.current[requirement.id]?.click()}
                    >
                      <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Max {requirement.max_file_size_mb}MB
                      </p>
                    </div>
                  )}
                  <input
                    ref={(el) => { fileInputRefs.current[requirement.id] = el }}
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="hidden"
                    onChange={(e) => handleFileSelect(requirement.id, e.target.files?.[0] || null, requirement)}
                  />
                </div>
              ))
            )}

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>
        )

      case 5:
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
                  <li>• You keep 10% as your commission (e.g., {currencySymbol}750 from {currencySymbol}7,500 fee)</li>
                  <li>• You remit the remaining 90% to PropLinka within 30 days</li>
                </ul>
              </div>
              <div className="space-y-2">
                <label className="flex items-start space-x-2 p-4 border rounded-lg cursor-pointer hover:bg-muted/50">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="deduct"
                    checked={formData.paymentMethod === 'deduct'}
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
                    value="invoice"
                    checked={formData.paymentMethod === 'invoice'}
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

  // Check if can proceed to next step
  const canProceedFromStep4 = () => {
    if (documentRequirements.length === 0 && formData.country) {
      // No requirements configured, allow to proceed
      return true
    }
    return areRequiredDocsUploaded()
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
            {[1, 2, 3, 4, 5].map((i) => (
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
              {step === 4 && 'Verification Documents'}
              {step === 5 && 'Payment & Terms'}
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
                <Button
                  onClick={() => setStep(step + 1)}
                  disabled={step === 4 && !canProceedFromStep4()}
                >
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={!formData.agreedToTerms || loading || !canProceedFromStep4()}
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {uploadingDoc ? `Uploading ${uploadingDoc}...` : 'Complete Registration'}
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
