// Lawyer Review Page
// Allows buyers/sellers to review their lawyer after transaction completion

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { LawyerReviewForm } from '@/components/lawyers/lawyer-review-form'

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function ReviewLawyerPage({ params }: PageProps) {
  const { id: transactionId } = await params
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get transaction details with lawyer info
  const { data: transaction, error } = await (supabase
    .from('transactions')
    .select(
      `
      *,
      property:properties(*),
      buyer:profiles!buyer_id(*),
      seller:profiles!seller_id(*),
      lawyer_buyer:lawyers!lawyer_buyer_id(*, profile:profiles(*)),
      lawyer_seller:lawyers!lawyer_seller_id(*, profile:profiles(*))
    `
    )
    .eq('id', transactionId)
    .single() as any)

  if (error || !transaction) {
    redirect('/dashboard/transactions')
  }

  // Check if user is part of this transaction
  const isBuyer = transaction.buyer_id === user.id
  const isSeller = transaction.seller_id === user.id

  if (!isBuyer && !isSeller) {
    redirect('/dashboard/transactions')
  }

  // Check if transaction is completed
  if (transaction.status !== 'completed') {
    redirect(`/dashboard/transactions/${transactionId}`)
  }

  // Determine which lawyer to review
  const lawyerToReview = isBuyer ? transaction.lawyer_buyer : transaction.lawyer_seller
  const userRole = isBuyer ? 'buyer' : 'seller'

  if (!lawyerToReview) {
    redirect(`/dashboard/transactions/${transactionId}`)
  }

  // Check if user has already reviewed
  const { data: existingReview } = await supabase
    .from('lawyer_reviews')
    .select('*')
    .eq('transaction_id', transactionId)
    .eq('reviewer_id', user.id)
    .single()

  return (
    <div className="container mx-auto py-8 max-w-3xl">
      <LawyerReviewForm
        transaction={transaction}
        lawyer={lawyerToReview}
        userRole={userRole}
        existingReview={existingReview}
      />
    </div>
  )
}
