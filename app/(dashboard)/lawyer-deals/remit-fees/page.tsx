'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { ArrowLeft, DollarSign, AlertCircle, CheckCircle, Building } from 'lucide-react'
import Link from 'next/link'

interface Transaction {
  id: string
  platform_fee_amount: number
  lawyer_commission_amount: number
  deal_closed_at: string
  settlement_reference: string
  fee_collected: boolean
  fee_remitted: boolean
  property: {
    title: string
    address_line1: string
    city: string
  }
}

export default function RemitFeesPage() {
  const router = useRouter()
  const supabase = createClient()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [selectedTransactions, setSelectedTransactions] = useState<string[]>([])
  const [remittanceReference, setRemittanceReference] = useState('')
  const [remittanceDate, setRemittanceDate] = useState(new Date().toISOString().split('T')[0])

  useEffect(() => {
    async function fetchPendingRemittances() {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      // Get lawyer record
      const { data: lawyer } = await (supabase as any)
        .from('lawyers')
        .select('id')
        .eq('profile_id', user.id)
        .single()

      if (!lawyer) {
        router.push('/lawyers/onboarding')
        return
      }

      // Get transactions that need remittance
      const { data } = await supabase
        .from('transactions')
        .select(`
          id,
          platform_fee_amount,
          lawyer_commission_amount,
          deal_closed_at,
          settlement_reference,
          fee_collected,
          fee_remitted,
          property:properties (
            title,
            address_line1,
            city
          )
        `)
        .or(`buyer_lawyer_id.eq.${lawyer.id},seller_lawyer_id.eq.${lawyer.id}`)
        .eq('status', 'completed')
        .eq('fee_collected', true)
        .eq('fee_remitted', false)
        .order('deal_closed_at', { ascending: true })

      setTransactions((data || []) as unknown as Transaction[])
      setLoading(false)
    }

    fetchPendingRemittances()
  }, [supabase, router])

  const toggleTransaction = (id: string) => {
    setSelectedTransactions(prev =>
      prev.includes(id)
        ? prev.filter(t => t !== id)
        : [...prev, id]
    )
  }

  const selectAll = () => {
    if (selectedTransactions.length === transactions.length) {
      setSelectedTransactions([])
    } else {
      setSelectedTransactions(transactions.map(t => t.id))
    }
  }

  const selectedTotal = transactions
    .filter(t => selectedTransactions.includes(t.id))
    .reduce((sum, t) => sum + (parseFloat(String(t.platform_fee_amount)) - parseFloat(String(t.lawyer_commission_amount))), 0)

  async function handleSubmitRemittance() {
    if (selectedTransactions.length === 0 || !remittanceReference) return

    setSubmitting(true)

    try {
      // Update selected transactions as remitted
      const { error } = await (supabase
        .from('transactions') as any)
        .update({
          fee_remitted: true,
          fee_remitted_at: remittanceDate,
          remittance_reference: remittanceReference,
          updated_at: new Date().toISOString()
        })
        .in('id', selectedTransactions)

      if (error) {
        alert('Error submitting remittance: ' + error.message)
      } else {
        alert('Remittance submitted successfully!')
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
          <h1 className="text-3xl font-bold">Submit Fee Remittance</h1>
          <p className="text-muted-foreground mt-1">
            Record payment of platform fees to PropLinka
          </p>
        </div>
      </div>

      {transactions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold">All Caught Up!</h3>
            <p className="text-muted-foreground mt-2">
              You have no pending fee remittances at this time.
            </p>
            <Link href="/lawyer-deals">
              <Button className="mt-4">Back to Deals</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Information Banner */}
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-blue-800 flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Remittance Guidelines
              </CardTitle>
            </CardHeader>
            <CardContent className="text-blue-700 text-sm space-y-2">
              <p>Please remit fees within 30 days of deal closure to maintain good standing.</p>
              <p>Payment Details:</p>
              <ul className="list-disc list-inside ml-2">
                <li>Bank: First National Bank</li>
                <li>Account Name: PropLinka (Pty) Ltd</li>
                <li>Account Number: 62123456789</li>
                <li>Branch Code: 250655</li>
                <li>Reference: Your firm name + deal references</li>
              </ul>
            </CardContent>
          </Card>

          {/* Pending Remittances List */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Pending Remittances</CardTitle>
                  <CardDescription>
                    Select the deals for which you are submitting payment
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={selectAll}>
                  {selectedTransactions.length === transactions.length ? 'Deselect All' : 'Select All'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {transactions.map((transaction) => {
                  const netAmount = parseFloat(String(transaction.platform_fee_amount)) - parseFloat(String(transaction.lawyer_commission_amount))
                  const isSelected = selectedTransactions.includes(transaction.id)
                  const daysSinceClosure = Math.floor((Date.now() - new Date(transaction.deal_closed_at).getTime()) / (1000 * 60 * 60 * 24))

                  return (
                    <div
                      key={transaction.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                        isSelected ? 'border-primary bg-primary/5' : 'hover:border-muted-foreground/50'
                      }`}
                      onClick={() => toggleTransaction(transaction.id)}
                    >
                      <div className="flex items-start gap-4">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleTransaction(transaction.id)}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Building className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{transaction.property?.title}</span>
                            {daysSinceClosure > 25 && (
                              <Badge variant="destructive" className="text-xs">
                                {daysSinceClosure} days
                              </Badge>
                            )}
                            {daysSinceClosure <= 25 && daysSinceClosure > 15 && (
                              <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-700">
                                {daysSinceClosure} days
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {transaction.property?.address_line1}, {transaction.property?.city}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-sm">
                            <span className="text-muted-foreground">
                              Closed: {new Date(transaction.deal_closed_at).toLocaleDateString()}
                            </span>
                            <span className="text-muted-foreground">
                              Ref: {transaction.settlement_reference}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">Net to Remit</p>
                          <p className="text-lg font-bold text-primary">
                            R{netAmount.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Remittance Form */}
          <Card>
            <CardHeader>
              <CardTitle>Remittance Details</CardTitle>
              <CardDescription>
                Provide proof of payment details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="remittanceReference">Payment Reference / Proof of Payment Number *</Label>
                  <Input
                    id="remittanceReference"
                    placeholder="e.g., EFT-20241201-001"
                    value={remittanceReference}
                    onChange={(e) => setRemittanceReference(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="remittanceDate">Payment Date *</Label>
                  <Input
                    id="remittanceDate"
                    type="date"
                    value={remittanceDate}
                    onChange={(e) => setRemittanceDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Summary */}
              <div className="bg-muted/50 rounded-lg p-4 mt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-muted-foreground">Selected Transactions:</span>
                  <span className="font-medium">{selectedTransactions.length} of {transactions.length}</span>
                </div>
                <div className="flex items-center justify-between text-lg">
                  <span className="font-semibold">Total Amount to Remit:</span>
                  <span className="font-bold text-primary flex items-center gap-1">
                    <DollarSign className="h-5 w-5" />
                    R{selectedTotal.toLocaleString()}
                  </span>
                </div>
              </div>

              <Button
                className="w-full"
                size="lg"
                onClick={handleSubmitRemittance}
                disabled={submitting || selectedTransactions.length === 0 || !remittanceReference}
              >
                {submitting ? 'Submitting...' : `Submit Remittance (R${selectedTotal.toLocaleString()})`}
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                By submitting, you confirm that payment has been made to PropLinka's bank account.
                Please retain proof of payment for reconciliation purposes.
              </p>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
