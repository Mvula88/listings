import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { getTransactionDetails, getTransactionMessages } from '@/lib/admin/actions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  ArrowLeft,
  Building,
  User,
  Mail,
  Phone,
  MessageSquare,
  Scale,
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
} from 'lucide-react'
import { format } from 'date-fns'

export const dynamic = 'force-dynamic'

function getStatusColor(status: string) {
  switch (status) {
    case 'completed':
      return 'default'
    case 'in_progress':
    case 'lawyers_selected':
      return 'secondary'
    case 'cancelled':
      return 'destructive'
    default:
      return 'outline'
  }
}

function getStatusIcon(status: string) {
  switch (status) {
    case 'completed':
      return <CheckCircle className="h-4 w-4" />
    case 'cancelled':
      return <XCircle className="h-4 w-4" />
    default:
      return <Clock className="h-4 w-4" />
  }
}

async function TransactionDetailContent({ id }: { id: string }) {
  let transaction: any
  let messages: any[] = []
  let fetchError: string | null = null

  try {
    transaction = await getTransactionDetails(id)
  } catch (error) {
    console.error('Error fetching transaction details:', error)
    fetchError = error instanceof Error ? error.message : 'Failed to fetch transaction'
  }

  if (!transaction && !fetchError) {
    notFound()
  }

  // Try to get messages separately - don't fail the whole page if messages fail
  if (transaction) {
    try {
      messages = await getTransactionMessages(id)
    } catch (error) {
      console.error('Error fetching messages:', error)
      // Continue without messages
    }
  }

  // Show error state if we couldn't get the transaction
  if (fetchError) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/transactions">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Transaction Details</h1>
            <p className="text-muted-foreground text-sm">ID: {id}</p>
          </div>
        </div>
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error Loading Transaction</AlertTitle>
          <AlertDescription>
            {fetchError}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/transactions">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Transaction Details</h1>
            <p className="text-muted-foreground text-sm">
              ID: {transaction.id}
            </p>
          </div>
        </div>
        <Badge variant={getStatusColor(transaction.status)} className="gap-1">
          {getStatusIcon(transaction.status)}
          {transaction.status?.replace('_', ' ')}
        </Badge>
      </div>

      {/* Admin Notice */}
      <Alert>
        <Eye className="h-4 w-4" />
        <AlertTitle>Admin View</AlertTitle>
        <AlertDescription>
          This is a privileged view. Your access to this transaction and messages has been logged for audit purposes.
        </AlertDescription>
      </Alert>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Transaction & Property Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Property Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Property
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                {transaction.property?.property_images?.[0]?.url ? (
                  <div className="relative h-24 w-24 rounded-lg overflow-hidden flex-shrink-0">
                    <Image
                      src={transaction.property.property_images[0].url}
                      alt={transaction.property.title || 'Property'}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-24 w-24 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                    <Building className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{transaction.property?.title}</h3>
                  <p className="text-muted-foreground">{transaction.property?.city}</p>
                  <p className="text-xl font-bold mt-2">
                    {transaction.property?.currency || '$'}
                    {Number(transaction.agreed_price || transaction.property?.price).toLocaleString()}
                  </p>
                  {transaction.property?.bedrooms && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {transaction.property.bedrooms} beds • {transaction.property.bathrooms} baths
                    </p>
                  )}
                </div>
              </div>
              <div className="mt-4">
                <Link href={`/properties/${transaction.property?.id}`} target="_blank">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    View Property
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Messages Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Conversation History
                <Badge variant="secondary" className="ml-2">
                  {messages.length} messages
                </Badge>
              </CardTitle>
              <CardDescription>
                Messages between buyer and seller regarding this transaction
              </CardDescription>
            </CardHeader>
            <CardContent>
              {messages.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No messages found for this transaction</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                  {messages.map((message: any, index: number) => {
                    const isBuyer = message.sender?.id === transaction.buyer?.id
                    const showDateSeparator =
                      index === 0 ||
                      format(new Date(message.created_at), 'yyyy-MM-dd') !==
                        format(new Date(messages[index - 1]?.created_at), 'yyyy-MM-dd')

                    return (
                      <div key={message.id}>
                        {showDateSeparator && (
                          <div className="flex items-center gap-2 my-4">
                            <Separator className="flex-1" />
                            <span className="text-xs text-muted-foreground px-2">
                              {format(new Date(message.created_at), 'MMMM d, yyyy')}
                            </span>
                            <Separator className="flex-1" />
                          </div>
                        )}
                        <div className={`flex gap-3 ${isBuyer ? '' : 'flex-row-reverse'}`}>
                          <Avatar className="h-8 w-8 flex-shrink-0">
                            <AvatarImage src={message.sender?.avatar_url} />
                            <AvatarFallback>
                              {message.sender?.full_name?.[0] || '?'}
                            </AvatarFallback>
                          </Avatar>
                          <div className={`flex-1 max-w-[80%] ${isBuyer ? '' : 'text-right'}`}>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-medium">
                                {message.sender?.full_name}
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {isBuyer ? 'Buyer' : 'Seller'}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {format(new Date(message.created_at), 'h:mm a')}
                              </span>
                            </div>
                            <div
                              className={`p-3 rounded-lg ${
                                isBuyer
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-muted'
                              }`}
                            >
                              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Parties Info */}
        <div className="space-y-6">
          {/* Buyer Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Buyer
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 mb-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={transaction.buyer?.avatar_url} />
                  <AvatarFallback>
                    {transaction.buyer?.full_name?.[0] || 'B'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{transaction.buyer?.full_name}</p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  {transaction.buyer?.email}
                </div>
                {transaction.buyer?.phone && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    {transaction.buyer?.phone}
                  </div>
                )}
              </div>
              {transaction.buyer_lawyer && (
                <>
                  <Separator className="my-4" />
                  <div className="text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground mb-2">
                      <Scale className="h-4 w-4" />
                      Buyer&apos;s Lawyer
                    </div>
                    <p className="font-medium">{transaction.buyer_lawyer.firm_name}</p>
                    <p className="text-muted-foreground">
                      {transaction.buyer_lawyer.profile?.full_name}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Seller Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Seller
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 mb-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={transaction.seller?.avatar_url} />
                  <AvatarFallback>
                    {transaction.seller?.full_name?.[0] || 'S'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{transaction.seller?.full_name}</p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  {transaction.seller?.email}
                </div>
                {transaction.seller?.phone && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    {transaction.seller?.phone}
                  </div>
                )}
              </div>
              {transaction.seller_lawyer && (
                <>
                  <Separator className="my-4" />
                  <div className="text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground mb-2">
                      <Scale className="h-4 w-4" />
                      Seller&apos;s Lawyer
                    </div>
                    <p className="font-medium">{transaction.seller_lawyer.firm_name}</p>
                    <p className="text-muted-foreground">
                      {transaction.seller_lawyer.profile?.full_name}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Timeline Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Created</span>
                  <span>{format(new Date(transaction.created_at), 'MMM d, yyyy')}</span>
                </div>
                {transaction.updated_at && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Last Updated</span>
                    <span>{format(new Date(transaction.updated_at), 'MMM d, yyyy')}</span>
                  </div>
                )}
                {transaction.completed_at && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Completed</span>
                    <span>{format(new Date(transaction.completed_at), 'MMM d, yyyy')}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default async function TransactionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading transaction details...</div>}>
      <TransactionDetailContent id={id} />
    </Suspense>
  )
}
