import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  Briefcase,
  Star,
  DollarSign,
  Award,
  MapPin,
  Phone,
  Mail,
  Globe,
  CheckCircle,
  Clock,
  Edit
} from 'lucide-react'
import Link from 'next/link'

export default async function PracticePage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single<{ user_type: string; email: string; full_name: string; [key: string]: any }>()

  if (profile?.user_type !== 'lawyer') {
    redirect('/dashboard')
  }

  // Get lawyer record
  const { data: lawyer } = await supabase
    .from('lawyers')
    .select('*')
    .eq('profile_id', user.id)
    .single<{ id: string; firm_name?: string; practice_areas?: string | string[]; years_experience?: number; bar_number?: string; office_phone?: string; office_address?: string; website?: string; verified?: boolean; [key: string]: any }>()

  if (!lawyer) {
    redirect('/lawyers/onboarding')
  }

  // Get all transactions stats
  const { data: transactions } = await supabase
    .from('transactions')
    .select('id, status, platform_fee_amount, lawyer_commission_amount, fee_collected, fee_remitted, created_at')
    .or(`buyer_lawyer_id.eq.${lawyer.id},seller_lawyer_id.eq.${lawyer.id}`)

  // Get reviews for this lawyer
  const { data: reviews } = await supabase
    .from('lawyer_reviews')
    .select('*')
    .eq('lawyer_id', lawyer.id)
    .order('created_at', { ascending: false })

  // Calculate stats
  const totalTransactions = transactions?.length || 0
  const completedTransactions = transactions?.filter((t: any) => t.status === 'completed').length || 0
  const activeTransactions = transactions?.filter((t: any) => t.status === 'in_progress' || t.status === 'pending').length || 0

  const totalEarnings = transactions
    ?.filter((t: any) => t.fee_collected)
    .reduce((sum: number, t: any) => sum + (parseFloat(String(t.lawyer_commission_amount)) || 0), 0) || 0

  const avgRating = reviews?.length
    ? reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length
    : 0

  const verificationStatus = lawyer.verified ? 'approved' : 'pending'

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Practice</h1>
          <p className="text-muted-foreground mt-2">
            Manage your legal practice profile and view performance
          </p>
        </div>
        <Button asChild>
          <Link href="/settings">
            <Edit className="h-4 w-4 mr-2" />
            Edit Profile
          </Link>
        </Button>
      </div>

      {/* Verification Status Alert */}
      {verificationStatus !== 'approved' && (
        <Card className={
          verificationStatus === 'pending'
            ? 'border-yellow-200 bg-yellow-50'
            : 'border-red-200 bg-red-50'
        }>
          <CardHeader>
            <CardTitle className={
              verificationStatus === 'pending' ? 'text-yellow-800' : 'text-red-800'
            }>
              {verificationStatus === 'pending' ? 'Verification Pending' : 'Verification Required'}
            </CardTitle>
            <CardDescription className={
              verificationStatus === 'pending' ? 'text-yellow-700' : 'text-red-700'
            }>
              {verificationStatus === 'pending'
                ? 'Your practice credentials are being reviewed. This usually takes 1-2 business days.'
                : 'Please complete your verification to start accepting clients.'}
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {/* Practice Info Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Briefcase className="h-8 w-8 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">{lawyer.firm_name || profile?.full_name}</CardTitle>
                <CardDescription className="flex items-center gap-2 mt-1">
                  {verificationStatus === 'approved' ? (
                    <Badge className="bg-green-100 text-green-700">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  ) : (
                    <Badge variant="secondary">
                      <Clock className="h-3 w-3 mr-1" />
                      {verificationStatus === 'pending' ? 'Pending Verification' : 'Not Verified'}
                    </Badge>
                  )}
                </CardDescription>
              </div>
            </div>
            {avgRating > 0 && (
              <div className="flex items-center gap-1">
                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold">{avgRating.toFixed(1)}</span>
                <span className="text-muted-foreground">({reviews?.length} reviews)</span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              {lawyer.practice_areas && (
                <div>
                  <p className="text-sm text-muted-foreground">Practice Areas</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {(Array.isArray(lawyer.practice_areas) ? lawyer.practice_areas : [lawyer.practice_areas]).map((area: string) => (
                      <Badge key={area} variant="outline">{area}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {lawyer.years_experience && (
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-muted-foreground" />
                  <span>{lawyer.years_experience} years of experience</span>
                </div>
              )}

              {lawyer.bar_number && (
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                  <span>Bar Number: {lawyer.bar_number}</span>
                </div>
              )}
            </div>

            <div className="space-y-3">
              {profile?.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{profile.email}</span>
                </div>
              )}

              {lawyer.office_phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{lawyer.office_phone}</span>
                </div>
              )}

              {lawyer.office_address && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{lawyer.office_address}</span>
                </div>
              )}

              {lawyer.website && (
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <a href={lawyer.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    {lawyer.website}
                  </a>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Deals</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTransactions}</div>
            <p className="text-xs text-muted-foreground">
              All time transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedTransactions}</div>
            <Progress
              value={totalTransactions > 0 ? (completedTransactions / totalTransactions) * 100 : 0}
              className="mt-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Deals</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeTransactions}</div>
            <p className="text-xs text-muted-foreground">
              In progress
            </p>
          </CardContent>
        </Card>

        <Card className="border-primary/50 bg-primary/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Commission Earned</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              R{totalEarnings.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              10% of platform fees
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Reviews Section */}
      <Card>
        <CardHeader>
          <CardTitle>Client Reviews</CardTitle>
          <CardDescription>
            Feedback from your clients
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!reviews || reviews.length === 0 ? (
            <div className="text-center py-12">
              <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No reviews yet</p>
              <p className="text-sm text-muted-foreground mt-2">
                Reviews will appear here after clients rate your services
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review: any) => (
                <div key={review.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-1 mb-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-4 w-4 ${
                              star <= review.rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                        <span className="ml-2 text-sm text-muted-foreground">
                          {new Date(review.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      {review.comment && (
                        <p className="text-sm">{review.comment}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Links */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="hover:border-primary/50 transition-colors">
          <Link href="/lawyer-deals">
            <CardHeader>
              <CardTitle className="text-base">Deal Management</CardTitle>
              <CardDescription>
                View and manage your active transactions
              </CardDescription>
            </CardHeader>
          </Link>
        </Card>

        <Card className="hover:border-primary/50 transition-colors">
          <Link href="/clients">
            <CardHeader>
              <CardTitle className="text-base">Clients</CardTitle>
              <CardDescription>
                View your client history and contacts
              </CardDescription>
            </CardHeader>
          </Link>
        </Card>

        <Card className="hover:border-primary/50 transition-colors">
          <Link href="/messages">
            <CardHeader>
              <CardTitle className="text-base">Messages</CardTitle>
              <CardDescription>
                Communicate with clients and parties
              </CardDescription>
            </CardHeader>
          </Link>
        </Card>
      </div>
    </div>
  )
}
