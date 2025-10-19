'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { ArrowLeft, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function LawyerDealDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const supabase = createClient()
  const [transaction, setTransaction] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    settlementReference: '',
    dealClosedDate: new Date().toISOString().split('T')[0],
    feeCollected: false,
    notes: ''
  })

  useEffect(() => {
    fetchTransaction()
  }, [params.id])

  async function fetchTransaction() {
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        *,
        property:properties (
          id,
          title,
          price,
          address_line1,
          city,
          province,
          country:countries (
            currency,
            currency_symbol
          )
        ),
        buyer:buyer_id (
          id,
          full_name,
          email,
          phone
        ),
        seller:seller_id (
          id,
          full_name,
          email,
          phone
        )
      `)
      .eq('id', params.id)
      .single()

    if (error) {
      console.error('Error fetching transaction:', error)
    } else {
      setTransaction(data)
    }
    setLoading(false)
  }

  async function handleMarkAsClosed() {
    setSubmitting(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()

      const { error } = await supabase
        .from('transactions')
        .update({
          status: 'completed',
          settlement_reference: formData.settlementReference,
          deal_closed_at: formData.dealClosedDate,
          deal_closed_by: user?.id,
          fee_collected: formData.feeCollected,
          updated_at: new Date().toISOString()
        } as any)
        .eq('id', params.id)

      if (error) {
        alert('Error updating transaction: ' + error.message)
      } else {
        alert('Deal marked as closed successfully!')
        router.push('/lawyer-deals')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('An error occurred')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>
  }

  if (!transaction) {
    return <div className="text-center py-12">Transaction not found</div>
  }

  const isCompleted = transaction.status === 'completed'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/lawyer-deals">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Transaction Details</h1>
          <p className="text-muted-foreground mt-1">
            Manage deal closure and fee collection
          </p>
        </div>
      </div>

      {/* Transaction Info */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{transaction.property?.title}</CardTitle>
            <Badge variant={isCompleted ? 'default' : 'secondary'}>
              {transaction.status}
            </Badge>
          </div>
          <CardDescription>
            {transaction.property?.address_line1}, {transaction.property?.city}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-3">Property Information</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Property Value:</span>
                  <p className="font-medium">
                    R{parseFloat(transaction.property?.price || 0).toLocaleString()}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Platform Fee:</span>
                  <p className="font-medium text-primary">
                    R{parseFloat(transaction.platform_fee_amount || 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Parties</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Buyer:</span>
                  <p className="font-medium">{transaction.buyer?.full_name}</p>
                  <p className="text-xs text-muted-foreground">{transaction.buyer?.email}</p>
                </div>
                <div className="mt-3">
                  <span className="text-muted-foreground">Seller:</span>
                  <p className="font-medium">{transaction.seller?.full_name}</p>
                  <p className="text-xs text-muted-foreground">{transaction.seller?.email}</p>
                </div>
              </div>
            </div>
          </div>

          {isCompleted && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
              <div className="flex items-center gap-2 text-green-800 mb-2">
                <CheckCircle className="h-5 w-5" />
                <span className="font-semibold">Deal Closed</span>
              </div>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-green-700">Closed Date:</span>
                  <p className="font-medium text-green-900">
                    {transaction.deal_closed_at
                      ? new Date(transaction.deal_closed_at).toLocaleDateString()
                      : 'Not recorded'}
                  </p>
                </div>
                <div>
                  <span className="text-green-700">Settlement Reference:</span>
                  <p className="font-medium text-green-900">
                    {transaction.settlement_reference || 'N/A'}
                  </p>
                </div>
                <div>
                  <span className="text-green-700">Fee Collected:</span>
                  <p className="font-medium text-green-900">
                    {transaction.fee_collected ? 'Yes' : 'No'}
                  </p>
                </div>
                <div>
                  <span className="text-green-700">Fee Remitted:</span>
                  <p className="font-medium text-green-900">
                    {transaction.fee_remitted ? 'Yes' : 'Not yet'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Mark as Closed Form */}
      {!isCompleted && (
        <Card>
          <CardHeader>
            <CardTitle>Report Deal Closure</CardTitle>
            <CardDescription>
              Mark this transaction as completed and report platform fee collection
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="settlementReference">Settlement Reference Number *</Label>
              <Input
                id="settlementReference"
                placeholder="e.g., DEED-2024-12345"
                value={formData.settlementReference}
                onChange={(e) => setFormData({ ...formData, settlementReference: e.target.value })}
                required
              />
              <p className="text-xs text-muted-foreground">
                Enter the deed or settlement reference number
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dealClosedDate">Deal Closure Date *</Label>
              <Input
                id="dealClosedDate"
                type="date"
                value={formData.dealClosedDate}
                onChange={(e) => setFormData({ ...formData, dealClosedDate: e.target.value })}
                required
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="feeCollected"
                checked={formData.feeCollected}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, feeCollected: checked as boolean })
                }
              />
              <Label htmlFor="feeCollected" className="text-sm font-normal">
                I confirm that the platform fee of R{parseFloat(transaction.platform_fee_amount || 0).toLocaleString()}
                {' '}has been collected from the client and included in the settlement statement
              </Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Any additional information about the transaction closure..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">Important Reminders:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Ensure the platform fee is included in your settlement statement</li>
                <li>• Platform fees must be remitted to DealDirect within 30 days</li>
                <li>• Keep proof of fee collection for reconciliation</li>
              </ul>
            </div>

            <Button
              className="w-full"
              size="lg"
              onClick={handleMarkAsClosed}
              disabled={submitting || !formData.settlementReference || !formData.feeCollected}
            >
              {submitting ? 'Submitting...' : 'Mark Deal as Closed'}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
