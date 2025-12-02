'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DollarSign, Loader2, Banknote, Building2, Percent } from 'lucide-react'
import { submitOffer, type PaymentType, type FinancingStatus } from '@/lib/actions/offers'
import { toast } from 'sonner'

interface MakeOfferFormProps {
  propertyId: string
  propertyTitle: string
  askingPrice: number
  currencySymbol?: string
  hasActiveOffer?: boolean
  activeOffer?: {
    id: string
    status: string
    offer_amount: number
    counter_amount?: number
  }
}

export function MakeOfferForm({
  propertyId,
  propertyTitle,
  askingPrice,
  currencySymbol = 'N$',
  hasActiveOffer = false,
  activeOffer
}: MakeOfferFormProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  // Form state
  const [offerAmount, setOfferAmount] = useState(askingPrice.toString())
  const [paymentType, setPaymentType] = useState<PaymentType>('cash')
  const [financingStatus, setFinancingStatus] = useState<FinancingStatus>('not_started')
  const [preApprovalAmount, setPreApprovalAmount] = useState('')
  const [financingBank, setFinancingBank] = useState('')
  const [cashPortion, setCashPortion] = useState('')
  const [message, setMessage] = useState('')

  const handleSubmit = async () => {
    const amount = parseFloat(offerAmount)
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid offer amount')
      return
    }

    setLoading(true)

    const result = await submitOffer({
      propertyId,
      offerAmount: amount,
      paymentType,
      financingStatus: paymentType !== 'cash' ? financingStatus : undefined,
      preApprovalAmount: preApprovalAmount ? parseFloat(preApprovalAmount) : undefined,
      financingBank: financingBank || undefined,
      cashPortion: cashPortion ? parseFloat(cashPortion) : undefined,
      message: message || undefined,
    })

    if (result.success) {
      toast.success('Offer submitted! The seller will review and respond.')
      setOpen(false)
      router.refresh()
    } else {
      toast.error(result.error || 'Failed to submit offer')
    }

    setLoading(false)
  }

  const formatCurrency = (value: number) => {
    return `${currencySymbol}${value.toLocaleString()}`
  }

  const calculatePercentage = () => {
    const amount = parseFloat(offerAmount)
    if (isNaN(amount) || askingPrice === 0) return 0
    return ((amount / askingPrice) * 100).toFixed(1)
  }

  // If there's an active offer, show status instead
  if (hasActiveOffer && activeOffer) {
    return (
      <div className="space-y-2">
        <Button disabled className="w-full" variant="outline">
          {activeOffer.status === 'countered' ? 'Counter Offer Received' : 'Offer Pending'}
        </Button>
        <p className="text-sm text-center text-muted-foreground">
          Your offer: {formatCurrency(activeOffer.offer_amount)}
          {activeOffer.counter_amount && (
            <span className="block text-primary">
              Counter: {formatCurrency(activeOffer.counter_amount)}
            </span>
          )}
        </p>
      </div>
    )
  }

  const paymentTypeOptions = [
    {
      value: 'cash',
      label: 'Cash',
      description: 'Full payment in cash',
      icon: <Banknote className="h-5 w-5" />,
    },
    {
      value: 'bank_financed',
      label: 'Bank Financed',
      description: 'Home loan / Bond',
      icon: <Building2 className="h-5 w-5" />,
    },
    {
      value: 'cash_and_bond',
      label: 'Cash + Bond',
      description: 'Partial cash, partial finance',
      icon: <Percent className="h-5 w-5" />,
    },
  ]

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full" variant="default" size="lg">
          <DollarSign className="h-4 w-4 mr-2" />
          Make an Offer
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Make an Offer</DialogTitle>
          <DialogDescription>
            Submit your offer for "{propertyTitle}"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Asking Price Reference */}
          <div className="bg-muted/50 rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Asking Price</p>
            <p className="text-2xl font-bold">{formatCurrency(askingPrice)}</p>
          </div>

          {/* Offer Amount */}
          <div className="space-y-2">
            <Label htmlFor="offerAmount">Your Offer *</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {currencySymbol}
              </span>
              <Input
                id="offerAmount"
                type="number"
                value={offerAmount}
                onChange={(e) => setOfferAmount(e.target.value)}
                className="pl-10 text-lg"
                placeholder="Enter amount"
              />
            </div>
            <p className="text-sm text-muted-foreground">
              {calculatePercentage()}% of asking price
            </p>
          </div>

          {/* Payment Type */}
          <div className="space-y-3">
            <Label>Payment Method *</Label>
            <RadioGroup
              value={paymentType}
              onValueChange={(v) => setPaymentType(v as PaymentType)}
              className="space-y-2"
            >
              {paymentTypeOptions.map((option) => (
                <div
                  key={option.value}
                  className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                    paymentType === option.value
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setPaymentType(option.value as PaymentType)}
                >
                  <RadioGroupItem value={option.value} id={`pay-${option.value}`} />
                  <div className="flex items-center gap-2 flex-1">
                    {option.icon}
                    <div>
                      <label htmlFor={`pay-${option.value}`} className="font-medium cursor-pointer">
                        {option.label}
                      </label>
                      <p className="text-xs text-muted-foreground">{option.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Financing Details */}
          {paymentType !== 'cash' && (
            <div className="space-y-4 border-t pt-4">
              <div className="space-y-2">
                <Label>Financing Status</Label>
                <Select
                  value={financingStatus}
                  onValueChange={(v) => setFinancingStatus(v as FinancingStatus)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pre_approved">Pre-Approved</SelectItem>
                    <SelectItem value="in_progress">Application in Progress</SelectItem>
                    <SelectItem value="not_started">Not Yet Started</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {financingStatus === 'pre_approved' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="preApprovalAmount">Pre-Approval Amount</Label>
                    <Input
                      id="preApprovalAmount"
                      type="number"
                      value={preApprovalAmount}
                      onChange={(e) => setPreApprovalAmount(e.target.value)}
                      placeholder="e.g., 2500000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="financingBank">Bank</Label>
                    <Input
                      id="financingBank"
                      value={financingBank}
                      onChange={(e) => setFinancingBank(e.target.value)}
                      placeholder="e.g., FNB, Standard Bank"
                    />
                  </div>
                </>
              )}

              {paymentType === 'cash_and_bond' && (
                <div className="space-y-2">
                  <Label htmlFor="cashPortion">Cash Portion</Label>
                  <Input
                    id="cashPortion"
                    type="number"
                    value={cashPortion}
                    onChange={(e) => setCashPortion(e.target.value)}
                    placeholder="Amount you'll pay in cash"
                  />
                </div>
              )}
            </div>
          )}

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="message">Message (Optional)</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Any conditions or additional information..."
              rows={3}
            />
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Offer'
              )}
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            This offer is valid for 7 days. The seller may accept, reject, or counter your offer.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
