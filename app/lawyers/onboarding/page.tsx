'use client'

import { useState, useEffect, useRef } from 'react'
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

interface Country {
  id: string
  name: string
  code: string
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
  const router = useRouter()
  const supabase: any = createClient()

  // File input refs
  const practicingCertRef = useRef<HTMLInputElement>(null)
  const idDocRef = useRef<HTMLInputElement>(null)
  const insuranceRef = useRef<HTMLInputElement>(null)

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
    paymentMethod: 'deduct',
    agreedToTerms: false
  })

  // Document uploads state
  const [documents, setDocuments] = useState<{
    practicingCertificate: UploadedFile | null
    idDocument: UploadedFile | null
    insuranceCertificate: UploadedFile | null
  }>({
    practicingCertificate: null,
    idDocument: null,
    insuranceCertificate: null
  })

  const totalSteps = 5

  // Handle file selection
  function handleFileSelect(type: 'practicingCertificate' | 'idDocument' | 'insuranceCertificate', file: File | null) {
    if (!file) return

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']
    if (!allowedTypes.includes(file.type)) {
      setError('Please upload a PDF or image file (JPEG, PNG)')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB')
      return
    }

    setDocuments(prev => ({
      ...prev,
      [type]: { file, preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined }
    }))
    setError(null)
  }

  function removeFile(type: 'practicingCertificate' | 'idDocument' | 'insuranceCertificate') {
    setDocuments(prev => ({
      ...prev,
      [type]: null
    }))
  }

  // Upload file to Supabase Storage - returns file path (not URL) for secure storage
  async function uploadDocument(file: File, userId: string, docType: string): Promise<string | null> {
    const fileExt = file.name.split('.').pop()
    const filePath = `${userId}/${docType}_${Date.now()}.${fileExt}`

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
      if (!documents.practicingCertificate || !documents.idDocument) {
        setError('Please upload your Practicing Certificate and ID Document')
        setLoading(false)
        return
      }

      // Upload documents
      let practicingCertUrl: string | null = null
      let idDocUrl: string | null = null
      let insuranceUrl: string | null = null

      setUploadingDoc('practicing certificate')
      practicingCertUrl = await uploadDocument(documents.practicingCertificate.file, user.id, 'practicing_certificate')
      if (!practicingCertUrl) {
        throw new Error('Failed to upload practicing certificate')
      }

      setUploadingDoc('ID document')
      idDocUrl = await uploadDocument(documents.idDocument.file, user.id, 'id_document')
      if (!idDocUrl) {
        throw new Error('Failed to upload ID document')
      }

      if (documents.insuranceCertificate) {
        setUploadingDoc('insurance certificate')
        insuranceUrl = await uploadDocument(documents.insuranceCertificate.file, user.id, 'insurance_certificate')
      }

      setUploadingDoc(null)

      // Create lawyer profile with document URLs
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
          practicing_certificate_url: practicingCertUrl,
          id_document_url: idDocUrl,
          insurance_certificate_url: insuranceUrl,
          verification_submitted_at: new Date().toISOString()
        })

      if (lawyerError) throw lawyerError

      // Update user profile type
      await supabase
        .from('profiles')
        .update({ user_type: 'lawyer' })
        .eq('id', user.id)

      // Redirect to verification pending page
      // Lawyers need admin approval before accessing the dashboard
      router.push('/lawyer/verification-pending')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
      setUploadingDoc(null)
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
            <Alert className="border-blue-200 bg-blue-50">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                To verify your credentials, please upload the following documents.
                These will be reviewed by our team before your account is activated.
              </AlertDescription>
            </Alert>

            {/* Practicing Certificate - Required */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                Practicing Certificate / Fidelity Fund Certificate
                <span className="text-red-500">*</span>
              </Label>
              <p className="text-xs text-muted-foreground mb-2">
                Your current practicing certificate from the Law Society
              </p>
              {documents.practicingCertificate ? (
                <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/50">
                  <FileText className="h-8 w-8 text-primary" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {documents.practicingCertificate.file.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {(documents.practicingCertificate.file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFile('practicingCertificate')}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div
                  className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary hover:bg-muted/50 transition-colors"
                  onClick={() => practicingCertRef.current?.click()}
                >
                  <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    PDF, JPEG, or PNG (max 5MB)
                  </p>
                </div>
              )}
              <input
                ref={practicingCertRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
                onChange={(e) => handleFileSelect('practicingCertificate', e.target.files?.[0] || null)}
              />
            </div>

            {/* ID Document - Required */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                Government-Issued ID
                <span className="text-red-500">*</span>
              </Label>
              <p className="text-xs text-muted-foreground mb-2">
                National ID card or Passport (identity page)
              </p>
              {documents.idDocument ? (
                <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/50">
                  <FileText className="h-8 w-8 text-primary" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {documents.idDocument.file.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {(documents.idDocument.file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFile('idDocument')}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div
                  className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary hover:bg-muted/50 transition-colors"
                  onClick={() => idDocRef.current?.click()}
                >
                  <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    PDF, JPEG, or PNG (max 5MB)
                  </p>
                </div>
              )}
              <input
                ref={idDocRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
                onChange={(e) => handleFileSelect('idDocument', e.target.files?.[0] || null)}
              />
            </div>

            {/* Insurance Certificate - Optional */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                Professional Indemnity Insurance
                <span className="text-muted-foreground text-xs">(Optional)</span>
              </Label>
              <p className="text-xs text-muted-foreground mb-2">
                Your current professional indemnity insurance certificate
              </p>
              {documents.insuranceCertificate ? (
                <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/50">
                  <FileText className="h-8 w-8 text-primary" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {documents.insuranceCertificate.file.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {(documents.insuranceCertificate.file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFile('insuranceCertificate')}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div
                  className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary hover:bg-muted/50 transition-colors"
                  onClick={() => insuranceRef.current?.click()}
                >
                  <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    PDF, JPEG, or PNG (max 5MB)
                  </p>
                </div>
              )}
              <input
                ref={insuranceRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
                onChange={(e) => handleFileSelect('insuranceCertificate', e.target.files?.[0] || null)}
              />
            </div>

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
                  <li>• You keep 10% as your commission (e.g., R750 from R7,500 fee)</li>
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
                  disabled={step === 4 && (!documents.practicingCertificate || !documents.idDocument)}
                >
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={!formData.agreedToTerms || loading || !documents.practicingCertificate || !documents.idDocument}
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