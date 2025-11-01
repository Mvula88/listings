'use client'

// Lawyer Review Form Component
// Form for submitting lawyer reviews after transaction completion

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { createClient } from '@/lib/supabase/client'
import { Star, CheckCircle } from 'lucide-react'
import { useToast } from '@/lib/hooks'

// Review schema
const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  communication_rating: z.number().min(1).max(5).optional(),
  professionalism_rating: z.number().min(1).max(5).optional(),
  efficiency_rating: z.number().min(1).max(5).optional(),
  review_text: z.string().min(20, 'Review must be at least 20 characters').max(1000),
  would_recommend: z.boolean(),
})

type ReviewFormData = z.infer<typeof reviewSchema>

interface LawyerReviewFormProps {
  transaction: any
  lawyer: any
  userRole: 'buyer' | 'seller'
  existingReview?: any
}

export function LawyerReviewForm({
  transaction,
  lawyer,
  userRole,
  existingReview,
}: LawyerReviewFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedRating, setSelectedRating] = useState(existingReview?.rating || 0)
  const [commRating, setCommRating] = useState(existingReview?.communication_rating || 0)
  const [profRating, setProfRating] = useState(
    existingReview?.professionalism_rating || 0
  )
  const [effRating, setEffRating] = useState(existingReview?.efficiency_rating || 0)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: existingReview?.rating || 0,
      communication_rating: existingReview?.communication_rating,
      professionalism_rating: existingReview?.professionalism_rating,
      efficiency_rating: existingReview?.efficiency_rating,
      review_text: existingReview?.review_text || '',
      would_recommend: existingReview?.would_recommend ?? true,
    },
  })

  const onSubmit = async (data: ReviewFormData) => {
    setIsSubmitting(true)

    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        toast.error('You must be logged in to submit a review')
        return
      }

      const reviewData = {
        lawyer_id: lawyer.id,
        transaction_id: transaction.id,
        reviewer_id: user.id,
        reviewer_role: userRole,
        ...data,
      }

      let error

      if (existingReview) {
        // Update existing review
        const result = await supabase
          .from('lawyer_reviews')
          .update(reviewData)
          .eq('id', existingReview.id)
        error = result.error
      } else {
        // Create new review
        const result = await supabase.from('lawyer_reviews').insert(reviewData)
        error = result.error
      }

      if (error) {
        toast.error(`Failed to submit review: ${error.message}`)
        return
      }

      toast.success(
        existingReview ? 'Review updated successfully!' : 'Review submitted successfully!'
      )

      // Redirect to transaction page
      router.push(`/dashboard/transactions/${transaction.id}`)
      router.refresh()
    } catch (error) {
      console.error('Error submitting review:', error)
      toast.error('An unexpected error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  const StarRating = ({
    rating,
    onChange,
    label,
  }: {
    rating: number
    onChange: (rating: number) => void
    label: string
  }) => (
    <div>
      <Label className="mb-2 block">{label}</Label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="focus:outline-none focus:ring-2 focus:ring-primary rounded"
          >
            <Star
              className={`h-8 w-8 ${
                star <= rating
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'fill-muted text-muted'
              } transition-colors`}
            />
          </button>
        ))}
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">
          {existingReview ? 'Update Your Review' : 'Review Your Lawyer'}
        </h1>
        <p className="text-muted-foreground">
          Share your experience working with {lawyer.profile?.full_name} from{' '}
          {lawyer.firm_name}
        </p>
      </div>

      {existingReview && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            You've already submitted a review. You can update it below.
          </AlertDescription>
        </Alert>
      )}

      {/* Property & Transaction Info */}
      <Card className="p-6">
        <h3 className="font-semibold mb-2">Transaction Details</h3>
        <p className="text-sm text-muted-foreground mb-1">
          <strong>Property:</strong> {transaction.property?.title}
        </p>
        <p className="text-sm text-muted-foreground mb-1">
          <strong>Your Role:</strong> {userRole === 'buyer' ? 'Buyer' : 'Seller'}
        </p>
        <p className="text-sm text-muted-foreground">
          <strong>Completed:</strong>{' '}
          {new Date(transaction.updated_at).toLocaleDateString()}
        </p>
      </Card>

      {/* Review Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Overall Rating */}
        <Card className="p-6">
          <StarRating
            rating={selectedRating}
            onChange={(rating) => {
              setSelectedRating(rating)
              setValue('rating', rating)
            }}
            label="Overall Rating *"
          />
          {errors.rating && (
            <p className="text-sm text-destructive mt-1">{errors.rating.message}</p>
          )}
        </Card>

        {/* Detailed Ratings */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Detailed Ratings (Optional)</h3>
          <div className="space-y-4">
            <StarRating
              rating={commRating}
              onChange={(rating) => {
                setCommRating(rating)
                setValue('communication_rating', rating)
              }}
              label="Communication"
            />

            <StarRating
              rating={profRating}
              onChange={(rating) => {
                setProfRating(rating)
                setValue('professionalism_rating', rating)
              }}
              label="Professionalism"
            />

            <StarRating
              rating={effRating}
              onChange={(rating) => {
                setEffRating(rating)
                setValue('efficiency_rating', rating)
              }}
              label="Efficiency"
            />
          </div>
        </Card>

        {/* Written Review */}
        <Card className="p-6">
          <Label htmlFor="review_text" className="mb-2 block">
            Your Review *
          </Label>
          <Textarea
            id="review_text"
            {...register('review_text')}
            placeholder="Share your experience working with this lawyer. What did they do well? What could be improved?"
            rows={6}
            className="resize-none"
          />
          {errors.review_text && (
            <p className="text-sm text-destructive mt-1">
              {errors.review_text.message}
            </p>
          )}
          <p className="text-xs text-muted-foreground mt-1">
            Minimum 20 characters, maximum 1000 characters
          </p>
        </Card>

        {/* Recommendation */}
        <Card className="p-6">
          <div className="flex items-start gap-2">
            <Checkbox
              id="would_recommend"
              defaultChecked={existingReview?.would_recommend ?? true}
              onCheckedChange={(checked) =>
                setValue('would_recommend', checked as boolean)
              }
            />
            <div>
              <Label htmlFor="would_recommend" className="cursor-pointer">
                I would recommend this lawyer to others
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                This helps other users find trustworthy conveyancers
              </p>
            </div>
          </div>
        </Card>

        {/* Submit Button */}
        <div className="flex gap-4">
          <Button type="submit" disabled={isSubmitting} size="lg">
            {isSubmitting
              ? 'Submitting...'
              : existingReview
                ? 'Update Review'
                : 'Submit Review'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
            size="lg"
          >
            Cancel
          </Button>
        </div>

        {/* Guidelines */}
        <Alert>
          <AlertDescription>
            <strong>Review Guidelines:</strong> Please be honest and constructive. Your
            review will help other users make informed decisions. Reviews are public and
            cannot be deleted, but can be updated.
          </AlertDescription>
        </Alert>
      </form>
    </div>
  )
}
