import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { User, Calendar, Shield } from 'lucide-react'
import { formatDate } from '@/lib/utils/format'
import type { Profile } from '@/lib/types'

interface SellerInfoProps {
  seller: Profile
}

export function SellerInfo({ seller }: SellerInfoProps) {
  if (!seller) return null

  const initials = seller.full_name
    ?.split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()

  const memberSince = seller.created_at ? formatDate(seller.created_at) : 'Recently'

  return (
    <Card>
      <CardHeader>
        <CardTitle>Listed By</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={seller.avatar_url} alt={seller.full_name} />
              <AvatarFallback>{initials || <User className="h-5 w-5" />}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{seller.full_name || 'Private Seller'}</p>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>Member since {memberSince}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
            <Shield className="h-4 w-4 text-primary" />
            <p className="text-sm">
              Identity verified by DealDirect
            </p>
          </div>
          
          <div className="text-sm text-muted-foreground">
            <p>All communication happens through DealDirect's secure platform.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}