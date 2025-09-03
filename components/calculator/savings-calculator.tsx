'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { calculateSavings, formatSavingsDisplay } from '@/lib/utils/savings-calculator'
import { TrendingDown, DollarSign, CheckCircle } from 'lucide-react'

export function SavingsCalculator() {
  const [propertyValue, setPropertyValue] = useState('')
  const [country, setCountry] = useState('ZA')
  
  const numericValue = parseFloat(propertyValue.replace(/[^\d.]/g, '')) || 0
  const currency = country === 'NA' ? 'NAD' : 'ZAR'
  const savings = calculateSavings(numericValue, country, currency)
  const formatted = formatSavingsDisplay(savings)
  
  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^\d]/g, '')
    setPropertyValue(value)
  }
  
  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Commission Savings Calculator</CardTitle>
        <CardDescription>
          See how much you can save by selling directly without agent commissions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Country Selection */}
        <div className="space-y-2">
          <Label>Select Country</Label>
          <RadioGroup value={country} onValueChange={setCountry}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="ZA" id="za" />
              <Label htmlFor="za">South Africa (6% agent commission)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="NA" id="na" />
              <Label htmlFor="na">Namibia (5% agent commission)</Label>
            </div>
          </RadioGroup>
        </div>
        
        {/* Property Value Input */}
        <div className="space-y-2">
          <Label htmlFor="propertyValue">Property Value</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {savings.currencySymbol}
            </span>
            <Input
              id="propertyValue"
              type="text"
              placeholder="Enter property value"
              value={propertyValue ? new Intl.NumberFormat('en-ZA').format(parseInt(propertyValue)) : ''}
              onChange={handleValueChange}
              className="pl-10 text-xl"
            />
          </div>
        </div>
        
        {numericValue > 0 && (
          <>
            {/* Results */}
            <div className="grid grid-cols-2 gap-4 pt-6 border-t">
              {/* Traditional Agent Fees */}
              <div className="space-y-3">
                <h3 className="font-medium text-destructive flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Traditional Agent Fees
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Buyer's agent (3%)</span>
                    <span className="font-medium">{formatted.buyerAgentFee}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Seller's agent (3%)</span>
                    <span className="font-medium">{formatted.sellerAgentFee}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-destructive border-t pt-2">
                    <span>Total Commission</span>
                    <span>{formatted.traditionalAgentFee}</span>
                  </div>
                </div>
              </div>
              
              {/* DealDirect Fees */}
              <div className="space-y-3">
                <h3 className="font-medium text-primary flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  DealDirect Fees
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Buyer success fee</span>
                    <span className="font-medium">{savings.currencySymbol}1,000</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Seller success fee</span>
                    <span className="font-medium">{savings.currencySymbol}1,000</span>
                  </div>
                  <div className="flex justify-between font-semibold text-primary border-t pt-2">
                    <span>Total Fee</span>
                    <span>{formatted.dealDirectFee}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Total Savings */}
            <div className="bg-primary/10 rounded-lg p-6 text-center space-y-2">
              <div className="flex items-center justify-center gap-2 text-primary">
                <TrendingDown className="h-5 w-5" />
                <span className="text-lg font-medium">You Save</span>
              </div>
              <p className="text-4xl font-bold text-primary">
                {formatted.totalSavings}
              </p>
              <p className="text-sm text-muted-foreground">
                That's {formatted.savingsPercentage} less than traditional agent fees!
              </p>
            </div>
            
            {/* Additional Info */}
            <div className="text-sm text-muted-foreground space-y-1">
              <p>✓ No hidden fees or surprises</p>
              <p>✓ Direct communication with buyers/sellers</p>
              <p>✓ Access to verified conveyancers at competitive rates</p>
              <p>✓ Only pay when transaction completes successfully</p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}