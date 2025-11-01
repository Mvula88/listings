'use client'

// Lawyer Reviews Display Component
// Shows all reviews for a lawyer with ratings and filtering

import { Star, ThumbsUp, MessageSquare, Clock } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import type { LawyerReviewWithRelations } from '@/lib/types'

interface LawyerReviewsDisplayProps {
  reviews: LawyerReviewWithRelations[]
  averageRating: number
  reviewCount: number
  communicationScore: number
  professionalismScore: number
  efficiencyScore: number
  recommendationRate: number
}

export function LawyerReviewsDisplay({
  reviews,
  averageRating,
  reviewCount,
  communicationScore,
  professionalismScore,
  efficiencyScore,
  recommendationRate,
}: LawyerReviewsDisplayProps) {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2)
  }

  const StarRating = ({ rating }: { rating: number }) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${
            star <= rating
              ? 'fill-yellow-400 text-yellow-400'
              : 'fill-muted text-muted'
          }`}
        />
      ))}
    </div>
  )

  const ScoreBar = ({ score, label }: { score: number; label: string }) => (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span>{label}</span>
        <span className="font-medium">{score.toFixed(1)}/5</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-primary"
          style={{ width: `${(score / 5) * 100}%` }}
        />
      </div>
    </div>
  )

  if (reviewCount === 0) {
    return (
      <Card className="p-8 text-center">
        <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Reviews Yet</h3>
        <p className="text-muted-foreground">
          This lawyer hasn't received any reviews yet. Be the first to work with them!
        </p>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Overall Rating */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Overall Rating</h3>
            <div className="flex items-center gap-4 mb-4">
              <div className="text-5xl font-bold">{averageRating.toFixed(1)}</div>
              <div>
                <StarRating rating={Math.round(averageRating)} />
                <p className="text-sm text-muted-foreground mt-1">
                  Based on {reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}
                </p>
              </div>
            </div>

            {/* Recommendation Rate */}
            <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <ThumbsUp className="h-5 w-5 text-green-600" />
              <p className="text-sm font-medium">
                {recommendationRate.toFixed(0)}% would recommend
              </p>
            </div>
          </div>

          {/* Detailed Scores */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Detailed Scores</h3>
            <div className="space-y-3">
              {communicationScore > 0 && (
                <ScoreBar score={communicationScore} label="Communication" />
              )}
              {professionalismScore > 0 && (
                <ScoreBar score={professionalismScore} label="Professionalism" />
              )}
              {efficiencyScore > 0 && (
                <ScoreBar score={efficiencyScore} label="Efficiency" />
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Individual Reviews */}
      <div>
        <h3 className="text-lg font-semibold mb-4">
          Reviews ({reviewCount})
        </h3>
        <div className="space-y-4">
          {reviews.map((review) => (
            <Card key={review.id} className="p-6">
              {/* Review Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>
                      {getInitials(review.reviewer.full_name || 'Anonymous')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">
                      {review.reviewer.full_name || 'Anonymous'}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {review.reviewer_role === 'buyer' ? 'Buyer' : 'Seller'}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(review.created_at)}
                      </span>
                    </div>
                  </div>
                </div>

                {review.is_verified && (
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    Verified
                  </Badge>
                )}
              </div>

              {/* Overall Rating */}
              <div className="flex items-center gap-2 mb-3">
                <StarRating rating={review.rating} />
                <span className="text-sm font-medium">{review.rating}/5</span>
              </div>

              {/* Detailed Ratings (if provided) */}
              {(review.communication_rating ||
                review.professionalism_rating ||
                review.efficiency_rating) && (
                <div className="flex gap-4 mb-4 text-xs text-muted-foreground">
                  {review.communication_rating && (
                    <div>
                      Communication: {review.communication_rating}/5
                    </div>
                  )}
                  {review.professionalism_rating && (
                    <div>
                      Professionalism: {review.professionalism_rating}/5
                    </div>
                  )}
                  {review.efficiency_rating && (
                    <div>
                      Efficiency: {review.efficiency_rating}/5
                    </div>
                  )}
                </div>
              )}

              {/* Review Text */}
              <p className="text-sm leading-relaxed mb-4">{review.review_text}</p>

              {/* Recommendation */}
              {review.would_recommend && (
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <ThumbsUp className="h-4 w-4" />
                  <span>Would recommend</span>
                </div>
              )}

              {/* Lawyer Response */}
              {review.response && (
                <>
                  <Separator className="my-4" />
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <p className="text-sm font-medium mb-2">
                      Response from Lawyer
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {review.response}
                    </p>
                    {review.response_at && (
                      <p className="text-xs text-muted-foreground mt-2">
                        <Clock className="h-3 w-3 inline mr-1" />
                        {formatDate(review.response_at)}
                      </p>
                    )}
                  </div>
                </>
              )}
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
