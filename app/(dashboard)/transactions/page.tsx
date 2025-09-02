import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatPrice, formatDate } from '@/lib/utils/format'
import Link from 'next/link'
import { ArrowRight, FileText, Users, DollarSign, Clock } from 'lucide-react'

export default async function TransactionsPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  // Get user's transactions
  const { data: transactions } = await supabase
    .from('transactions')
    .select(`
      *,
      property:properties (
        id,
        title,
        price,
        city,
        property_images (
          url
        )
      ),
      buyer:profiles!buyer_id (
        full_name
      ),
      seller:profiles!seller_id (
        full_name
      ),
      lawyer_buyer:lawyers!lawyer_buyer_id (
        firm_name
      ),
      lawyer_seller:lawyers!lawyer_seller_id (
        firm_name
      )
    `)
    .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
    .order('created_at', { ascending: false }) as any

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'initiated':
        return <Badge variant="secondary">Initiated</Badge>
      case 'lawyers_selected':
        return <Badge variant="default">Lawyers Selected</Badge>
      case 'in_progress':
        return <Badge>In Progress</Badge>
      case 'pending_payment':
        return <Badge variant="warning">Payment Due</Badge>
      case 'completed':
        return <Badge variant="success">Completed</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Transactions</h1>
        <p className="text-muted-foreground mt-2">
          Track and manage your property transactions
        </p>
      </div>

      {transactions && transactions.length > 0 ? (
        <div className="grid gap-4">
          {transactions.map((transaction: any) => {
            const userRole = transaction.buyer_id === user.id ? 'buyer' : 'seller'
            const otherParty = userRole === 'buyer' ? transaction.seller : transaction.buyer
            
            return (
              <Card key={transaction.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        {transaction.property?.title}
                      </CardTitle>
                      <CardDescription>
                        {transaction.property?.city} • Transaction #{transaction.id.slice(0, 8)}
                      </CardDescription>
                    </div>
                    {getStatusBadge(transaction.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-4 gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Price</p>
                        <p className="font-medium">
                          {formatPrice(transaction.agreed_price || transaction.property?.price)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">
                          {userRole === 'buyer' ? 'Seller' : 'Buyer'}
                        </p>
                        <p className="font-medium">{otherParty?.full_name}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Your Lawyer</p>
                        <p className="font-medium">
                          {userRole === 'buyer' 
                            ? transaction.lawyer_buyer?.firm_name || 'Not selected'
                            : transaction.lawyer_seller?.firm_name || 'Not selected'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Started</p>
                        <p className="font-medium">{formatDate(transaction.created_at)}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Link href={`/transactions/${transaction.id}`} className="flex-1">
                      <Button className="w-full" variant="outline">
                        View Details
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                    
                    {transaction.status === 'initiated' && (
                      <Link href={`/transactions/${transaction.id}/select-lawyers`} className="flex-1">
                        <Button className="w-full">
                          Select Lawyer
                        </Button>
                      </Link>
                    )}
                    
                    {transaction.status === 'pending_payment' && (
                      <Link href={`/transactions/${transaction.id}/payment`} className="flex-1">
                        <Button className="w-full">
                          Make Payment
                        </Button>
                      </Link>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Transactions Yet</h3>
            <p className="text-muted-foreground mb-4">
              Start by browsing properties or listing your own
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/browse">
                <Button variant="outline">Browse Properties</Button>
              </Link>
              <Link href="/list">
                <Button>List Property</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}