'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Building,
  MapPin,
  User,
  ArrowRight,
  Clock,
  CheckCircle,
  FileText,
  Users,
} from 'lucide-react'
import { formatPrice } from '@/lib/utils/format'
import { formatDistanceToNow } from 'date-fns'

interface TransactionCardProps {
  transaction: any
  userRole: 'buyer' | 'seller'
}

export function TransactionCard({ transaction, userRole }: TransactionCardProps) {
  const property = transaction.property
  const otherParty = userRole === 'buyer' ? transaction.seller : transaction.buyer
  const primaryImage = property?.property_images?.sort((a: any, b: any) => a.order_index - b.order_index)[0]

  const getStatusBadge = () => {
    switch (transaction.status) {
      case 'initiated':
        return <Badge className="bg-blue-500">Initiated</Badge>
      case 'lawyers_selected':
        return <Badge className="bg-purple-500">Lawyers Selected</Badge>
      case 'in_progress':
        return <Badge className="bg-orange-500">In Progress</Badge>
      case 'pending_payment':
        return <Badge className="bg-yellow-500">Pending Payment</Badge>
      case 'completed':
        return <Badge className="bg-green-500">Completed</Badge>
      default:
        return <Badge variant="outline">{transaction.status}</Badge>
    }
  }

  const getStatusProgress = () => {
    switch (transaction.status) {
      case 'initiated':
        return 20
      case 'lawyers_selected':
        return 40
      case 'in_progress':
        return 60
      case 'pending_payment':
        return 80
      case 'completed':
        return 100
      default:
        return 0
    }
  }

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardContent className="p-0">
        <div className="flex flex-col md:flex-row">
          {/* Property Image */}
          <div className="relative w-full md:w-48 h-48 md:h-auto bg-muted shrink-0">
            {primaryImage?.url ? (
              <Image
                src={primaryImage.url}
                alt={property?.title || 'Property'}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <Building className="h-12 w-12 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 p-4 space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold line-clamp-1">
                  {property?.title}
                </h3>
                <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                  <MapPin className="h-3 w-3" />
                  {property?.city}, {property?.province}
                </div>
              </div>
              {getStatusBadge()}
            </div>

            {/* Progress Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Progress</span>
                <span>{getStatusProgress()}%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${getStatusProgress()}%` }}
                />
              </div>
            </div>

            {/* Details */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Agreed Price</p>
                <p className="font-bold text-primary">
                  {formatPrice(transaction.agreed_price, property?.country?.currency_symbol)}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">
                  {userRole === 'buyer' ? 'Seller' : 'Buyer'}
                </p>
                <p className="font-medium flex items-center gap-1">
                  <User className="h-3 w-3" />
                  {otherParty?.full_name}
                </p>
              </div>
            </div>

            {/* Timeline */}
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Started {formatDistanceToNow(new Date(transaction.created_at), { addSuffix: true })}
              </span>
              {transaction.completed_at && (
                <span className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  Completed {formatDistanceToNow(new Date(transaction.completed_at), { addSuffix: true })}
                </span>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2 border-t">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <FileText className="h-4 w-4" />
                  Documents
                </span>
                {transaction.lawyer_buyer_id && transaction.lawyer_seller_id && (
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    Lawyers Assigned
                  </span>
                )}
              </div>
              <Button asChild>
                <Link href={`/transactions/${transaction.id}`}>
                  View Details
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
