'use client'

import { useState } from 'react'
import { Star, ThumbsUp, CheckCircle } from 'lucide-react'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { markReviewHelpful } from '@/lib/actions/reviews'
import { toast } from 'sonner'

interface Review {
  id: string
  rating: number
  title: string
  review: string
  helpful_count: number
  verified_purchase: boolean
  created_at: string
  user: {
    full_name: string
    avatar_url: string | null
  }
}

interface ReviewListProps {
  reviews: Review[]
  propertyId: string
}

export function ReviewList({ reviews, propertyId }: ReviewListProps) {
  if (reviews.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No reviews yet. Be the first to review this property!</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <ReviewItem key={review.id} review={review} />
      ))}
    </div>
  )
}

function ReviewItem({ review }: { review: Review }) {
  const [helpfulCount, setHelpfulCount] = useState(review.helpful_count)
  const [isHelpful, setIsHelpful] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleHelpful = async () => {
    setIsLoading(true)
    const newHelpful = !isHelpful

    const result = await markReviewHelpful(review.id, newHelpful)

    if (result.success) {
      setIsHelpful(newHelpful)
      setHelpfulCount(prev => newHelpful ? prev + 1 : prev - 1)
    } else {
      toast.error(result.error || 'Failed to mark review as helpful')
    }

    setIsLoading(false)
  }

  return (
    <Card>
      <CardContent className="pt-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {review.user.avatar_url ? (
              <Image
                src={review.user.avatar_url}
                alt={review.user.full_name}
                width={40}
                height={40}
                className="rounded-full"
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-sm font-semibold">
                  {review.user.full_name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <p className="font-semibold">{review.user.full_name}</p>
                {review.verified_purchase && (
                  <Badge variant="secondary" className="gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Verified
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {new Date(review.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>

          {/* Star Rating */}
          <div className="flex items-center gap-1">
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
          </div>
        </div>

        {/* Review Content */}
        <div className="space-y-2 mb-4">
          <h4 className="font-semibold">{review.title}</h4>
          <p className="text-muted-foreground leading-relaxed">{review.review}</p>
        </div>

        {/* Helpful Button */}
        <div className="flex items-center gap-2 pt-4 border-t">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleHelpful}
            disabled={isLoading}
            className={isHelpful ? 'text-primary' : ''}
          >
            <ThumbsUp className="h-4 w-4 mr-2" />
            Helpful {helpfulCount > 0 && `(${helpfulCount})`}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
