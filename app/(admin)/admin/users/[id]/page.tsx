import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FadeIn } from '@/components/ui/fade-in'
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Building,
  Scale,
  ArrowLeft,
  Shield,
  Ban,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react'
import Link from 'next/link'
import { UserActions } from '@/components/admin/user-actions'

interface PageProps {
  params: { id: string }
}

export default async function AdminUserDetailPage({ params }: PageProps) {
  const supabase = await createClient()

  // Get user profile
  const { data: user, error } = await supabase
    .from('profiles')
    .select(`
      *,
      country:countries (name)
    `)
    .eq('id', params.id)
    .single()

  if (error || !user) {
    notFound()
  }

  // Get user's properties if seller
  const { data: properties } = await supabase
    .from('properties')
    .select('id, title, status, created_at')
    .eq('seller_id', params.id)
    .order('created_at', { ascending: false })
    .limit(5)

  // Get user's transactions
  const { data: transactions } = await supabase
    .from('transactions')
    .select('id, status, created_at, property:properties(title)')
    .or(`buyer_id.eq.${params.id},seller_id.eq.${params.id}`)
    .order('created_at', { ascending: false })
    .limit(5)

  // Get lawyer info if applicable
  let lawyer = null
  if (user.user_type === 'lawyer') {
    const { data } = await supabase
      .from('lawyers')
      .select('*')
      .eq('profile_id', params.id)
      .single()
    lawyer = data
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <FadeIn>
        <div className="flex items-center gap-4">
          <Link href="/admin/users">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">{user.full_name || 'Unknown User'}</h1>
            <p className="text-muted-foreground">{user.email}</p>
          </div>
          <UserActions userId={params.id} user={user} />
        </div>
      </FadeIn>

      {/* Status Badges */}
      <FadeIn delay={0.1}>
        <div className="flex gap-2">
          <Badge variant={user.user_type === 'buyer' ? 'default' : user.user_type === 'seller' ? 'secondary' : 'outline'}>
            {user.user_type || 'buyer'}
          </Badge>
          {user.is_suspended && (
            <Badge variant="destructive">
              <Ban className="h-3 w-3 mr-1" />
              Suspended
            </Badge>
          )}
          {user.email_verified && (
            <Badge variant="outline" className="text-green-600">
              <CheckCircle className="h-3 w-3 mr-1" />
              Email Verified
            </Badge>
          )}
        </div>
      </FadeIn>

      <div className="grid gap-6 md:grid-cols-2">
        {/* User Info */}
        <FadeIn delay={0.2}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                User Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{user.email}</span>
                </div>
                {user.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{user.phone}</span>
                  </div>
                )}
                {user.country?.name && (
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{user.country.name}</span>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Joined {new Date(user.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </FadeIn>

        {/* Account Status */}
        <FadeIn delay={0.3}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Account Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Account Type</span>
                  <span className="font-medium capitalize">{user.user_type || 'Buyer'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <span className={`font-medium ${user.is_suspended ? 'text-red-500' : 'text-green-500'}`}>
                    {user.is_suspended ? 'Suspended' : 'Active'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email Verified</span>
                  <span className="font-medium">{user.email_verified ? 'Yes' : 'No'}</span>
                </div>
                {user.roles && user.roles.length > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Roles</span>
                    <span className="font-medium">{user.roles.join(', ')}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </FadeIn>

        {/* Lawyer Info (if applicable) */}
        {lawyer && (
          <FadeIn delay={0.4}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Scale className="h-5 w-5" />
                  Lawyer Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {lawyer.firm_name && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Firm Name</span>
                    <span className="font-medium">{lawyer.firm_name}</span>
                  </div>
                )}
                {lawyer.registration_number && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Registration #</span>
                    <span className="font-medium">{lawyer.registration_number}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Verified</span>
                  <Badge variant={lawyer.verified ? 'default' : 'secondary'}>
                    {lawyer.verified ? 'Yes' : 'Pending'}
                  </Badge>
                </div>
                {lawyer.years_experience && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Experience</span>
                    <span className="font-medium">{lawyer.years_experience} years</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </FadeIn>
        )}

        {/* Properties (if seller) */}
        {properties && properties.length > 0 && (
          <FadeIn delay={0.4}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Properties ({properties.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {properties.map((property: any) => (
                    <Link
                      key={property.id}
                      href={`/admin/properties/${property.id}`}
                      className="flex items-center justify-between p-2 border rounded hover:bg-muted"
                    >
                      <span className="truncate">{property.title}</span>
                      <Badge variant="outline">{property.status}</Badge>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </FadeIn>
        )}

        {/* Transactions */}
        {transactions && transactions.length > 0 && (
          <FadeIn delay={0.5}>
            <Card>
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {transactions.map((tx: any) => (
                    <Link
                      key={tx.id}
                      href={`/admin/transactions/${tx.id}`}
                      className="flex items-center justify-between p-2 border rounded hover:bg-muted"
                    >
                      <span className="truncate">{tx.property?.title || 'Unknown Property'}</span>
                      <Badge variant="outline">{tx.status}</Badge>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </FadeIn>
        )}
      </div>
    </div>
  )
}
