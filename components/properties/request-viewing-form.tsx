'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Input } from '@/components/ui/input'
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
import { Calendar, Clock, Loader2, Banknote, Building2 } from 'lucide-react'
import { requestViewing, type FinancingStatus, type TimeSlot } from '@/lib/actions/viewings'
import { toast } from 'sonner'

interface RequestViewingFormProps {
  propertyId: string
  propertyTitle: string
  hasActiveViewing?: boolean
}

export function RequestViewingForm({
  propertyId,
  propertyTitle,
  hasActiveViewing = false
}: RequestViewingFormProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<'financing' | 'schedule'>('financing')

  // Form state
  const [financingStatus, setFinancingStatus] = useState<FinancingStatus>('exploring')
  const [preApprovalAmount, setPreApprovalAmount] = useState('')
  const [requestedDate, setRequestedDate] = useState('')
  const [timeSlot, setTimeSlot] = useState<TimeSlot>('morning')
  const [message, setMessage] = useState('')

  // Get minimum date (tomorrow)
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const minDate = tomorrow.toISOString().split('T')[0]

  const handleSubmit = async () => {
    if (!requestedDate) {
      toast.error('Please select a date')
      return
    }

    setLoading(true)

    const result = await requestViewing({
      propertyId,
      requestedDate,
      requestedTimeSlot: timeSlot,
      financingStatus,
      preApprovalAmount: preApprovalAmount ? parseFloat(preApprovalAmount) : undefined,
      message: message || undefined,
    })

    if (result.success) {
      toast.success('Viewing request sent! The seller will confirm the date and time.')
      setOpen(false)
      resetForm()
      router.refresh()
    } else {
      toast.error(result.error || 'Failed to request viewing')
    }

    setLoading(false)
  }

  const resetForm = () => {
    setStep('financing')
    setFinancingStatus('exploring')
    setPreApprovalAmount('')
    setRequestedDate('')
    setTimeSlot('morning')
    setMessage('')
  }

  const financingOptions = [
    {
      value: 'cash',
      label: 'Cash Buyer',
      description: 'I will pay the full amount in cash',
      icon: <Banknote className="h-5 w-5" />,
    },
    {
      value: 'pre_approved',
      label: 'Pre-Approved for Finance',
      description: 'I have pre-approval from a bank',
      icon: <Building2 className="h-5 w-5" />,
    },
    {
      value: 'financing_in_progress',
      label: 'Financing in Progress',
      description: 'I am currently applying for finance',
      icon: <Clock className="h-5 w-5" />,
    },
    {
      value: 'exploring',
      label: 'Still Exploring',
      description: 'I am exploring my financing options',
      icon: <Calendar className="h-5 w-5" />,
    },
  ]

  if (hasActiveViewing) {
    return (
      <Button disabled className="w-full">
        Viewing Already Requested
      </Button>
    )
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) resetForm(); }}>
      <DialogTrigger asChild>
        <Button className="w-full" size="lg">
          <Calendar className="h-4 w-4 mr-2" />
          Request a Viewing
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {step === 'financing' ? 'Your Financing Status' : 'Schedule Viewing'}
          </DialogTitle>
          <DialogDescription>
            {step === 'financing'
              ? 'Let the seller know about your buying capacity'
              : `Request a viewing for "${propertyTitle}"`
            }
          </DialogDescription>
        </DialogHeader>

        {step === 'financing' ? (
          <div className="space-y-4 py-4">
            <RadioGroup
              value={financingStatus}
              onValueChange={(v) => setFinancingStatus(v as FinancingStatus)}
              className="space-y-3"
            >
              {financingOptions.map((option) => (
                <div
                  key={option.value}
                  className={`flex items-start space-x-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                    financingStatus === option.value
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setFinancingStatus(option.value as FinancingStatus)}
                >
                  <RadioGroupItem value={option.value} id={option.value} className="mt-1" />
                  <div className="flex-1">
                    <label
                      htmlFor={option.value}
                      className="flex items-center gap-2 font-medium cursor-pointer"
                    >
                      {option.icon}
                      {option.label}
                    </label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {option.description}
                    </p>
                  </div>
                </div>
              ))}
            </RadioGroup>

            {financingStatus === 'pre_approved' && (
              <div className="space-y-2 pt-2">
                <Label htmlFor="preApprovalAmount">Pre-Approval Amount (Optional)</Label>
                <Input
                  id="preApprovalAmount"
                  type="number"
                  placeholder="e.g., 2500000"
                  value={preApprovalAmount}
                  onChange={(e) => setPreApprovalAmount(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Sharing this helps sellers understand you're a serious buyer
                </p>
              </div>
            )}

            <div className="flex justify-end pt-4">
              <Button onClick={() => setStep('schedule')}>
                Continue to Schedule
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="date">Preferred Date *</Label>
              <Input
                id="date"
                type="date"
                min={minDate}
                value={requestedDate}
                onChange={(e) => setRequestedDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="timeSlot">Preferred Time *</Label>
              <Select value={timeSlot} onValueChange={(v) => setTimeSlot(v as TimeSlot)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="morning">Morning (8am - 12pm)</SelectItem>
                  <SelectItem value="afternoon">Afternoon (12pm - 5pm)</SelectItem>
                  <SelectItem value="evening">Evening (5pm - 7pm)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message to Seller (Optional)</Label>
              <Textarea
                id="message"
                placeholder="Any specific questions or requests..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
              />
            </div>

            {/* Summary */}
            <div className="bg-muted/50 rounded-lg p-3 space-y-1 text-sm">
              <p className="font-medium">Your Status:</p>
              <p className="text-muted-foreground">
                {financingOptions.find(o => o.value === financingStatus)?.label}
                {preApprovalAmount && ` (N$${parseInt(preApprovalAmount).toLocaleString()})`}
              </p>
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setStep('financing')}>
                Back
              </Button>
              <Button onClick={handleSubmit} disabled={loading || !requestedDate}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Request Viewing'
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
