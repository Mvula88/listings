'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Calculator, TrendingDown, DollarSign, Calendar, PieChart } from 'lucide-react'
import { formatPrice } from '@/lib/utils/format'

interface MortgageCalculation {
  monthlyPayment: number
  totalPayment: number
  totalInterest: number
  principalPercentage: number
  interestPercentage: number
}

export function MortgageCalculator() {
  const [propertyPrice, setPropertyPrice] = useState<number>(2000000)
  const [deposit, setDeposit] = useState<number>(200000)
  const [depositPercentage, setDepositPercentage] = useState<number>(10)
  const [interestRate, setInterestRate] = useState<number>(11.75)
  const [loanTerm, setLoanTerm] = useState<number>(20)
  const [currency, setCurrency] = useState<'ZAR' | 'NAD'>('ZAR')

  const [calculation, setCalculation] = useState<MortgageCalculation | null>(null)

  // Calculate mortgage when inputs change
  useEffect(() => {
    calculateMortgage()
  }, [propertyPrice, deposit, interestRate, loanTerm])

  function calculateMortgage() {
    const principal = propertyPrice - deposit
    const monthlyRate = interestRate / 100 / 12
    const numberOfPayments = loanTerm * 12

    // Calculate monthly payment using the mortgage formula
    // M = P[r(1+r)^n]/[(1+r)^n-1]
    const monthlyPayment =
      (principal * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments))) /
      (Math.pow(1 + monthlyRate, numberOfPayments) - 1)

    const totalPayment = monthlyPayment * numberOfPayments
    const totalInterest = totalPayment - principal

    const principalPercentage = (principal / totalPayment) * 100
    const interestPercentage = (totalInterest / totalPayment) * 100

    setCalculation({
      monthlyPayment: isNaN(monthlyPayment) ? 0 : monthlyPayment,
      totalPayment: isNaN(totalPayment) ? 0 : totalPayment,
      totalInterest: isNaN(totalInterest) ? 0 : totalInterest,
      principalPercentage: isNaN(principalPercentage) ? 0 : principalPercentage,
      interestPercentage: isNaN(interestPercentage) ? 0 : interestPercentage,
    })
  }

  function handlePropertyPriceChange(value: string) {
    const price = parseFloat(value) || 0
    setPropertyPrice(price)
    // Update deposit to maintain percentage
    setDeposit((price * depositPercentage) / 100)
  }

  function handleDepositChange(value: string) {
    const dep = parseFloat(value) || 0
    setDeposit(dep)
    // Update percentage
    if (propertyPrice > 0) {
      setDepositPercentage((dep / propertyPrice) * 100)
    }
  }

  function handleDepositPercentageChange(value: number[]) {
    const percentage = value[0]
    setDepositPercentage(percentage)
    setDeposit((propertyPrice * percentage) / 100)
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Calculator className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle>Mortgage Calculator</CardTitle>
            <CardDescription>
              Calculate your monthly mortgage payments and total costs
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Currency Selection */}
        <div className="space-y-2">
          <Label>Currency</Label>
          <Select
            value={currency}
            onValueChange={(value) => setCurrency(value as 'ZAR' | 'NAD')}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ZAR">ZAR (R) - South Africa</SelectItem>
              <SelectItem value="NAD">NAD (N$) - Namibia</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Property Price */}
        <div className="space-y-2">
          <Label htmlFor="propertyPrice">Property Price</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {currency === 'ZAR' ? 'R' : 'N$'}
            </span>
            <Input
              id="propertyPrice"
              type="number"
              value={propertyPrice}
              onChange={(e) => handlePropertyPriceChange(e.target.value)}
              className="pl-10"
              step="10000"
            />
          </div>
        </div>

        {/* Deposit */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Deposit ({depositPercentage.toFixed(1)}%)</Label>
            <span className="text-sm font-medium">
              {formatPrice(deposit, currency)}
            </span>
          </div>
          <Slider
            value={[depositPercentage]}
            onValueChange={handleDepositPercentageChange}
            min={0}
            max={50}
            step={1}
            className="w-full"
          />
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {currency === 'ZAR' ? 'R' : 'N$'}
            </span>
            <Input
              type="number"
              value={deposit}
              onChange={(e) => handleDepositChange(e.target.value)}
              className="pl-10"
              step="10000"
            />
          </div>
        </div>

        {/* Interest Rate */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Interest Rate ({interestRate}% p.a.)</Label>
          </div>
          <Slider
            value={[interestRate]}
            onValueChange={(value) => setInterestRate(value[0])}
            min={5}
            max={20}
            step={0.25}
            className="w-full"
          />
          <Input
            type="number"
            value={interestRate}
            onChange={(e) => setInterestRate(parseFloat(e.target.value) || 0)}
            step="0.25"
            min="5"
            max="20"
          />
        </div>

        {/* Loan Term */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Loan Term ({loanTerm} years)</Label>
          </div>
          <Slider
            value={[loanTerm]}
            onValueChange={(value) => setLoanTerm(value[0])}
            min={5}
            max={30}
            step={1}
            className="w-full"
          />
          <Input
            type="number"
            value={loanTerm}
            onChange={(e) => setLoanTerm(parseInt(e.target.value) || 0)}
            min="5"
            max="30"
          />
        </div>

        {/* Results */}
        {calculation && (
          <div className="space-y-4 pt-6 border-t">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <PieChart className="h-5 w-5 text-primary" />
              Your Monthly Payment
            </h3>

            <div className="bg-primary/5 border-2 border-primary/20 rounded-lg p-6 text-center">
              <p className="text-sm text-muted-foreground mb-2">Estimated Monthly Payment</p>
              <p className="text-4xl font-bold text-primary">
                {formatPrice(calculation.monthlyPayment, currency)}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                per month for {loanTerm} years
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-muted/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Total Payment</p>
                </div>
                <p className="text-xl font-bold">
                  {formatPrice(calculation.totalPayment, currency)}
                </p>
              </div>

              <div className="bg-muted/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingDown className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Total Interest</p>
                </div>
                <p className="text-xl font-bold">
                  {formatPrice(calculation.totalInterest, currency)}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Principal</span>
                  <span className="font-medium">
                    {calculation.principalPercentage.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${calculation.principalPercentage}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Interest</span>
                  <span className="font-medium">
                    {calculation.interestPercentage.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-orange-600 h-2 rounded-full transition-all"
                    style={{ width: `${calculation.interestPercentage}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-xs text-blue-900">
                <strong>Note:</strong> This calculator provides estimates only. Actual monthly payments may vary based on additional costs like property insurance, property taxes, HOA fees, and other factors. Consult with a financial advisor for personalized advice.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
