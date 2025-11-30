import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Users, Mail, Phone, Building, User } from 'lucide-react'
import Link from 'next/link'

interface Client {
  id: string
  full_name: string
  email: string
  phone: string | null
  user_type: string
  transaction_count: number
  transactions: Array<{
    id: string
    status: string
    property_title: string
    created_at: string
  }>
}

export default async function ClientsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('user_type')
    .eq('id', user.id)
    .single<{ user_type: string }>()

  if (profile?.user_type !== 'lawyer') {
    redirect('/dashboard')
  }

  // Get lawyer record
  const { data: lawyer } = await (supabase as any)
    .from('lawyers')
    .select('*')
    .eq('profile_id', user.id)
    .single()

  if (!lawyer) {
    redirect('/lawyers/onboarding')
  }

  // Get all transactions where this lawyer is involved
  const { data: transactions } = await supabase
    .from('transactions')
    .select(`
      id,
      status,
      created_at,
      buyer_id,
      seller_id,
      buyer_lawyer_id,
      seller_lawyer_id,
      property:properties (
        title
      ),
      buyer:buyer_id (
        id,
        full_name,
        email,
        phone,
        user_type
      ),
      seller:seller_id (
        id,
        full_name,
        email,
        phone,
        user_type
      )
    `)
    .or(`buyer_lawyer_id.eq.${lawyer.id},seller_lawyer_id.eq.${lawyer.id}`)
    .order('created_at', { ascending: false })

  // Extract unique clients from transactions
  const clientsMap = new Map<string, Client>()

  transactions?.forEach((t: any) => {
    // Add buyer as client
    if (t.buyer && t.buyer.id) {
      const existingBuyer = clientsMap.get(t.buyer.id)
      if (existingBuyer) {
        existingBuyer.transaction_count++
        existingBuyer.transactions.push({
          id: t.id,
          status: t.status,
          property_title: t.property?.title || 'Unknown Property',
          created_at: t.created_at
        })
      } else {
        clientsMap.set(t.buyer.id, {
          id: t.buyer.id,
          full_name: t.buyer.full_name || 'Unknown',
          email: t.buyer.email || '',
          phone: t.buyer.phone,
          user_type: 'buyer',
          transaction_count: 1,
          transactions: [{
            id: t.id,
            status: t.status,
            property_title: t.property?.title || 'Unknown Property',
            created_at: t.created_at
          }]
        })
      }
    }

    // Add seller as client
    if (t.seller && t.seller.id) {
      const existingSeller = clientsMap.get(t.seller.id)
      if (existingSeller) {
        existingSeller.transaction_count++
        existingSeller.transactions.push({
          id: t.id,
          status: t.status,
          property_title: t.property?.title || 'Unknown Property',
          created_at: t.created_at
        })
      } else {
        clientsMap.set(t.seller.id, {
          id: t.seller.id,
          full_name: t.seller.full_name || 'Unknown',
          email: t.seller.email || '',
          phone: t.seller.phone,
          user_type: 'seller',
          transaction_count: 1,
          transactions: [{
            id: t.id,
            status: t.status,
            property_title: t.property?.title || 'Unknown Property',
            created_at: t.created_at
          }]
        })
      }
    }
  })

  const clients = Array.from(clientsMap.values())
  const buyers = clients.filter(c => c.user_type === 'buyer')
  const sellers = clients.filter(c => c.user_type === 'seller')

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700'
      case 'in_progress':
        return 'bg-blue-100 text-blue-700'
      case 'pending':
        return 'bg-yellow-100 text-yellow-700'
      case 'cancelled':
        return 'bg-red-100 text-red-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Clients</h1>
        <p className="text-muted-foreground mt-2">
          View and manage your clients from property transactions
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clients.length}</div>
            <p className="text-xs text-muted-foreground">
              From all transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Buyers</CardTitle>
            <User className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{buyers.length}</div>
            <p className="text-xs text-muted-foreground">
              Property buyers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sellers</CardTitle>
            <Building className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sellers.length}</div>
            <p className="text-xs text-muted-foreground">
              Property sellers
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Clients List */}
      <Card>
        <CardHeader>
          <CardTitle>All Clients</CardTitle>
          <CardDescription>
            Clients you have worked with across all transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {clients.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No clients yet</p>
              <p className="text-sm text-muted-foreground mt-2">
                Clients will appear here when you are assigned to transactions
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {clients.map((client) => (
                <div key={client.id} className="border rounded-lg p-4">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary/10">
                        {getInitials(client.full_name)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold">{client.full_name}</h3>
                        <Badge variant="outline" className={
                          client.user_type === 'buyer'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-green-50 text-green-700 border-green-200'
                        }>
                          {client.user_type === 'buyer' ? 'Buyer' : 'Seller'}
                        </Badge>
                        <Badge variant="secondary">
                          {client.transaction_count} {client.transaction_count === 1 ? 'deal' : 'deals'}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {client.email}
                        </span>
                        {client.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {client.phone}
                          </span>
                        )}
                      </div>

                      {/* Recent Transactions */}
                      <div className="mt-3">
                        <p className="text-xs text-muted-foreground mb-2">Recent Transactions:</p>
                        <div className="flex flex-wrap gap-2">
                          {client.transactions.slice(0, 3).map((t) => (
                            <Link key={t.id} href={`/lawyer-deals/${t.id}`}>
                              <Badge
                                variant="outline"
                                className={`cursor-pointer hover:bg-muted ${getStatusColor(t.status)}`}
                              >
                                {t.property_title.slice(0, 30)}{t.property_title.length > 30 ? '...' : ''}
                              </Badge>
                            </Link>
                          ))}
                          {client.transactions.length > 3 && (
                            <Badge variant="outline">
                              +{client.transactions.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <a href={`mailto:${client.email}`}>
                          <Mail className="h-4 w-4" />
                        </a>
                      </Button>
                      {client.phone && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={`tel:${client.phone}`}>
                            <Phone className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
