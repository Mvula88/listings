import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Scale,
  CheckCircle,
  Clock,
  Search,
  Mail,
  Phone,
  MapPin,
  Building,
  FileText,
  ExternalLink,
} from 'lucide-react'
import Link from 'next/link'
import { FadeIn } from '@/components/ui/fade-in'
import { LawyerVerificationActions } from '@/components/admin/lawyer-verification-actions'

interface Lawyer {
  id: string
  profile_id: string
  firm_name: string | null
  registration_number: string | null
  city: string | null
  years_experience: number | null
  flat_fee_buyer: number | null
  flat_fee_seller: number | null
  verified: boolean
  available: boolean
  created_at: string
  practicing_certificate_url: string | null
  id_document_url: string | null
  insurance_certificate_url: string | null
  verification_submitted_at: string | null
  profile: {
    full_name: string | null
    email: string
    phone: string | null
  } | null
  country: {
    name: string
  } | null
}

// Extended type with signed URLs for display
interface LawyerWithSignedUrls extends Lawyer {
  practicing_certificate_signed_url?: string | null
  id_document_signed_url?: string | null
  insurance_certificate_signed_url?: string | null
}

export default async function AdminLawyersPage({
  searchParams,
}: {
  searchParams: Promise<{ verified?: string; search?: string }>
}) {
  const { verified: verifiedFilter, search: searchQuery } = await searchParams
  const supabase = await createClient()

  // Build query with server-side search
  let query = supabase
    .from('lawyers')
    .select(`
      id,
      profile_id,
      firm_name,
      registration_number,
      city,
      years_experience,
      flat_fee_buyer,
      flat_fee_seller,
      verified,
      available,
      created_at,
      practicing_certificate_url,
      id_document_url,
      insurance_certificate_url,
      verification_submitted_at,
      profile:profiles!lawyers_profile_id_fkey (
        full_name,
        email,
        phone
      ),
      country:countries (
        name
      )
    `)
    .order('created_at', { ascending: false })

  // Apply verified filter
  if (verifiedFilter === 'true') {
    query = query.eq('verified', true)
  } else if (verifiedFilter === 'false') {
    query = query.eq('verified', false)
  }

  // Apply server-side search filter
  if (searchQuery) {
    query = query.or(`firm_name.ilike.%${searchQuery}%,registration_number.ilike.%${searchQuery}%,city.ilike.%${searchQuery}%`)
  }

  const { data: lawyers, error } = await query

  // Get stats in parallel for better performance
  const [totalResult, verifiedResult, pendingResult] = await Promise.all([
    supabase.from('lawyers').select('*', { count: 'exact', head: true }),
    supabase.from('lawyers').select('*', { count: 'exact', head: true }).eq('verified', true),
    supabase.from('lawyers').select('*', { count: 'exact', head: true }).eq('verified', false),
  ])

  const totalLawyers = totalResult.count
  const verifiedLawyers = verifiedResult.count
  const pendingLawyers = pendingResult.count

  // Additional client-side filtering for profile fields (since they're joined)
  let filteredLawyers = lawyers as Lawyer[] | null
  if (searchQuery && filteredLawyers) {
    const search = searchQuery.toLowerCase()
    filteredLawyers = filteredLawyers.filter(
      (l) =>
        l.firm_name?.toLowerCase().includes(search) ||
        l.profile?.full_name?.toLowerCase().includes(search) ||
        l.profile?.email?.toLowerCase().includes(search) ||
        l.registration_number?.toLowerCase().includes(search) ||
        l.city?.toLowerCase().includes(search)
    )
  }

  // Generate signed URLs for document viewing (1 hour expiry)
  async function getSignedUrl(filePath: string | null): Promise<string | null> {
    if (!filePath) return null
    // Check if it's already a full URL (legacy data) vs file path
    if (filePath.startsWith('http')) {
      // Legacy full URL - try to extract path
      const match = filePath.match(/lawyer-documents\/(.+)$/)
      if (match) {
        filePath = match[1]
      } else {
        return filePath // Return as-is if can't parse
      }
    }
    const { data, error } = await supabase.storage
      .from('lawyer-documents')
      .createSignedUrl(filePath, 3600) // 1 hour expiry
    return data?.signedUrl || null
  }

  // Add signed URLs to lawyers
  let lawyersWithSignedUrls: LawyerWithSignedUrls[] = []
  if (filteredLawyers) {
    lawyersWithSignedUrls = await Promise.all(
      filteredLawyers.map(async (lawyer) => ({
        ...lawyer,
        practicing_certificate_signed_url: await getSignedUrl(lawyer.practicing_certificate_url),
        id_document_signed_url: await getSignedUrl(lawyer.id_document_url),
        insurance_certificate_signed_url: await getSignedUrl(lawyer.insurance_certificate_url),
      }))
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <FadeIn>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Lawyer Management</h1>
            <p className="text-muted-foreground mt-1">
              Review and verify lawyer registrations
            </p>
          </div>
        </div>
      </FadeIn>

      {/* Stats */}
      <FadeIn delay={0.1}>
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Lawyers</CardTitle>
              <Scale className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalLawyers || 0}</div>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-green-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-700">Verified</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-700">{verifiedLawyers || 0}</div>
            </CardContent>
          </Card>

          <Card className="border-yellow-200 bg-yellow-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-yellow-700">Pending Verification</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-700">{pendingLawyers || 0}</div>
            </CardContent>
          </Card>
        </div>
      </FadeIn>

      {/* Filters */}
      <FadeIn delay={0.2}>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <form className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    name="search"
                    placeholder="Search by name, email, firm, or registration number..."
                    className="pl-10"
                    defaultValue={searchQuery || ''}
                  />
                </div>
              </form>
              <div className="flex gap-2">
                <Button
                  variant={!verifiedFilter ? 'default' : 'outline'}
                  size="sm"
                  asChild
                >
                  <Link href="/admin/lawyers">All</Link>
                </Button>
                <Button
                  variant={verifiedFilter === 'false' ? 'default' : 'outline'}
                  size="sm"
                  asChild
                >
                  <Link href="/admin/lawyers?verified=false">
                    <Clock className="h-4 w-4 mr-1" />
                    Pending
                  </Link>
                </Button>
                <Button
                  variant={verifiedFilter === 'true' ? 'default' : 'outline'}
                  size="sm"
                  asChild
                >
                  <Link href="/admin/lawyers?verified=true">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Verified
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </FadeIn>

      {/* Lawyers List */}
      <FadeIn delay={0.3}>
        <Card>
          <CardHeader>
            <CardTitle>
              {verifiedFilter === 'false'
                ? 'Pending Verification'
                : verifiedFilter === 'true'
                  ? 'Verified Lawyers'
                  : 'All Lawyers'}
            </CardTitle>
            <CardDescription>
              {lawyersWithSignedUrls?.length || 0} lawyer(s) found
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error ? (
              <div className="text-center py-8 text-red-500">
                Error loading lawyers: {error.message}
              </div>
            ) : !lawyersWithSignedUrls || lawyersWithSignedUrls.length === 0 ? (
              <div className="text-center py-12">
                <Scale className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold">No lawyers found</h3>
                <p className="text-muted-foreground mt-2">
                  {verifiedFilter === 'false'
                    ? 'No lawyers are pending verification'
                    : 'No lawyers match your search criteria'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {lawyersWithSignedUrls.map((lawyer) => (
                  <div
                    key={lawyer.id}
                    className={`border rounded-lg p-4 ${
                      !lawyer.verified
                        ? 'border-yellow-300 bg-yellow-50/50'
                        : 'hover:border-primary/50'
                    }`}
                  >
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div className="flex-1 space-y-3">
                        {/* Header */}
                        <div className="flex items-start gap-3">
                          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <Scale className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-lg">
                                {lawyer.firm_name || lawyer.profile?.full_name || 'Unknown'}
                              </h3>
                              {lawyer.verified ? (
                                <Badge className="bg-green-100 text-green-700">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Verified
                                </Badge>
                              ) : (
                                <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
                                  <Clock className="h-3 w-3 mr-1" />
                                  Pending
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Registration: {lawyer.registration_number || 'Not provided'}
                            </p>
                          </div>
                        </div>

                        {/* Contact Info */}
                        <div className="grid gap-2 text-sm md:grid-cols-2">
                          {lawyer.profile?.email && (
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-muted-foreground" />
                              <span>{lawyer.profile.email}</span>
                            </div>
                          )}
                          {lawyer.profile?.phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-muted-foreground" />
                              <span>{lawyer.profile.phone}</span>
                            </div>
                          )}
                          {(lawyer.city || lawyer.country?.name) && (
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              <span>
                                {[lawyer.city, lawyer.country?.name].filter(Boolean).join(', ')}
                              </span>
                            </div>
                          )}
                          {lawyer.years_experience && (
                            <div className="flex items-center gap-2">
                              <Building className="h-4 w-4 text-muted-foreground" />
                              <span>{lawyer.years_experience} years experience</span>
                            </div>
                          )}
                        </div>

                        {/* Fees */}
                        {(lawyer.flat_fee_buyer || lawyer.flat_fee_seller) && (
                          <div className="flex gap-4 text-sm">
                            {lawyer.flat_fee_buyer && (
                              <span className="text-muted-foreground">
                                Buyer Fee: <strong>R{lawyer.flat_fee_buyer.toLocaleString()}</strong>
                              </span>
                            )}
                            {lawyer.flat_fee_seller && (
                              <span className="text-muted-foreground">
                                Seller Fee: <strong>R{lawyer.flat_fee_seller.toLocaleString()}</strong>
                              </span>
                            )}
                          </div>
                        )}

                        {/* Verification Documents */}
                        {(lawyer.practicing_certificate_signed_url || lawyer.id_document_signed_url || lawyer.insurance_certificate_signed_url) && (
                          <div className="space-y-2">
                            <p className="text-sm font-medium flex items-center gap-2">
                              <FileText className="h-4 w-4" />
                              Verification Documents
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {lawyer.practicing_certificate_signed_url && (
                                <a
                                  href={lawyer.practicing_certificate_signed_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                                >
                                  <FileText className="h-3 w-3" />
                                  Practicing Certificate
                                  <ExternalLink className="h-3 w-3" />
                                </a>
                              )}
                              {lawyer.id_document_signed_url && (
                                <a
                                  href={lawyer.id_document_signed_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                                >
                                  <FileText className="h-3 w-3" />
                                  ID Document
                                  <ExternalLink className="h-3 w-3" />
                                </a>
                              )}
                              {lawyer.insurance_certificate_signed_url && (
                                <a
                                  href={lawyer.insurance_certificate_signed_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors"
                                >
                                  <FileText className="h-3 w-3" />
                                  Insurance
                                  <ExternalLink className="h-3 w-3" />
                                </a>
                              )}
                            </div>
                          </div>
                        )}

                        {/* No Documents Warning */}
                        {!lawyer.verified && !lawyer.practicing_certificate_url && !lawyer.id_document_url && (
                          <div className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded inline-block">
                            No verification documents uploaded
                          </div>
                        )}

                        {/* Applied Date */}
                        <p className="text-xs text-muted-foreground">
                          Applied: {new Date(lawyer.created_at).toLocaleDateString('en-ZA', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                          {lawyer.verification_submitted_at && (
                            <> | Documents submitted: {new Date(lawyer.verification_submitted_at).toLocaleDateString('en-ZA', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}</>
                          )}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-2 md:items-end">
                        <LawyerVerificationActions
                          lawyerId={lawyer.id}
                          isVerified={lawyer.verified}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </FadeIn>
    </div>
  )
}
