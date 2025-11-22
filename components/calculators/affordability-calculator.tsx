'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Calculator, TrendingUp, DollarSign, AlertCircle, CheckCircle } from 'lucide-react'
import { formatPrice } from '@/lib/utils/format'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface AffordabilityResult {
  maxPropertyPrice: number
  maxMonthlyPayment: number
  maxLoanAmount: number
  requiredDeposit: number
  debtToIncomeRatio: number
  canAfford: boolean
  recommendation: string
}

export function AffordabilityCalculator() {
  const [monthlyIncome, setMonthlyIncome] = useState<number>(50000)
  const [monthlyExpenses, setMonthlyExpenses] = useState<number>(15000)
  const [monthlyDebts, setMonthlyDebts] = useState<number>(5000)
  const [availableDeposit, setAvailableDeposit] = useState<number>(200000)
  const [interestRate, setInterestRate] = useState<number>(11.75)
  const [loanTerm, setLoanTerm] = useState<number>(20)
  const [currency, setCurrency] = useState<'ZAR' | 'NAD'>('ZAR')

  const [result, setResult] = useState<AffordabilityResult | null>(null)

  useEffect(() => {
    calculateAffordability()
  }, [monthlyIncome, monthlyExpenses, monthlyDebts, availableDeposit, interestRate, loanTerm])

  function calculateAffordability() {
    // Calculate available monthly payment (28% rule - housing should not exceed 28% of gross income)
    const maxHousingPayment = monthlyIncome * 0.28

    // Calculate debt-to-income ratio (total debt payments should not exceed 36% of gross income)
    const maxTotalDebt = monthlyIncome * 0.36
    const availableForMortgage = Math.max(0, maxTotalDebt - monthlyDebts)

    // Use the lower of the two calculations
    const maxMonthlyPayment = Math.min(maxHousingPayment, availableForMortgage)

    // Calculate maximum loan amount based on monthly payment
    const monthlyRate = interestRate / 100 / 12
    const numberOfPayments = loanTerm * 12

    // Reverse mortgage formula to get principal from monthly payment
    // P = M * [(1+r)^n - 1] / [r(1+r)^n]
    const maxLoanAmount = maxMonthlyPayment *
      ((Math.pow(1 + monthlyRate, numberOfPayments) - 1) /
      (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)))

    // Maximum property price = loan amount + available deposit
    const maxPropertyPrice = maxLoanAmount + availableDeposit

    // Calculate debt-to-income ratio
    const totalMonthlyDebt = monthlyDebts + maxMonthlyPayment
    const debtToIncomeRatio = (totalMonthlyDebt / monthlyIncome) * 100

    // Determine if they can afford property
    const disposableIncome = monthlyIncome - monthlyExpenses - monthlyDebts - maxMonthlyPayment
    const canAfford = disposableIncome >= 0 && debtToIncomeRatio <= 36

    // Generate recommendation
    let recommendation = ''
    if (debtToIncomeRatio > 36) {
      recommendation = 'Your debt-to-income ratio is too high. Consider reducing existing debts before applying for a mortgage.'
    } else if (disposableIncome < 5000) {
      recommendation = 'You may struggle with unexpected expenses. Consider a lower property price or increase your income.'
    } else if (disposableIncome >= 5000 && disposableIncome < 10000) {
      recommendation = 'You can afford this property, but budget carefully for maintenance and unexpected costs.'
    } else {
      recommendation = 'You have a healthy financial position for this property purchase. You have good room for savings and emergencies.'
    }

    setResult({
      maxPropertyPrice: isNaN(maxPropertyPrice) ? 0 : maxPropertyPrice,
      maxMonthlyPayment: isNaN(maxMonthlyPayment) ? 0 : maxMonthlyPayment,
      maxLoanAmount: isNaN(maxLoanAmount) ? 0 : maxLoanAmount,
      requiredDeposit: availableDeposit,
      debtToIncomeRatio: isNaN(debtToIncomeRatio) ? 0 : debtToIncomeRatio,
      canAfford,
      recommendation,
    })
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Calculator className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle>Affordability Calculator</CardTitle>
            <CardDescription>
              Calculate how much property you can afford based on your income and expenses
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

        {/* Monthly Income */}
        <div className="space-y-2">
          <Label htmlFor="monthlyIncome">Monthly Gross Income</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {currency === 'ZAR' ? 'R' : 'N$'}
            </span>
            <Input
              id="monthlyIncome"
              type="number"
              value={monthlyIncome}
              onChange={(e) => setMonthlyIncome(parseFloat(e.target.value) || 0)}
              className="pl-10"
              step="1000"
            />
          </div>
        </div>

        {/* Monthly Expenses */}
        <div className="space-y-2">
          <Label htmlFor="monthlyExpenses">Monthly Living Expenses</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {currency === 'ZAR' ? 'R' : 'N$'}
            </span>
            <Input
              id="monthlyExpenses"
              type="number"
              value={monthlyExpenses}
              onChange={(e) => setMonthlyExpenses(parseFloat(e.target.value) || 0)}
              className="pl-10"
              step="1000"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Include groceries, utilities, transport, insurance, etc.
          </p>
        </div>

        {/* Monthly Debts */}
        <div className="space-y-2">
          <Label htmlFor="monthlyDebts">Monthly Debt Payments</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {currency === 'ZAR' ? 'R' : 'N$'}
            </span>
            <Input
              id="monthlyDebts"
              type="number"
              value={monthlyDebts}
              onChange={(e) => setMonthlyDebts(parseFloat(e.target.value) || 0)}
              className="pl-10"
              step="1000"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Include car loans, credit cards, student loans, etc.
          </p>
        </div>

        {/* Available Deposit */}
        <div className="space-y-2">
          <Label htmlFor="availableDeposit">Available Deposit</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {currency === 'ZAR' ? 'R' : 'N$'}
            </span>
            <Input
              id="availableDeposit"
              type="number"
              value={availableDeposit}
              onChange={(e) => setAvailableDeposit(parseFloat(e.target.value) || 0)}
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
        </div>

        {/* Results */}
        {result && (
          <div className="space-y-4 pt-6 border-t">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Your Affordability Analysis
            </h3>

            {/* Main Result */}
            <div className={`border-2 rounded-lg p-6 text-center ${
              result.canAfford
                ? 'bg-green-50 border-green-200'
                : 'bg-orange-50 border-orange-200'
            }`}>
              <p className="text-sm text-muted-foreground mb-2">Maximum Property Price</p>
              <p className={`text-4xl font-bold ${
                result.canAfford ? 'text-green-700' : 'text-orange-700'
              }`}>
                {formatPrice(result.maxPropertyPrice, currency)}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Based on your income and financial situation
              </p>
            </div>

            {/* Breakdown */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-muted/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Max Monthly Payment</p>
                </div>
                <p className="text-xl font-bold">
                  {formatPrice(result.maxMonthlyPayment, currency)}
                </p>
              </div>

              <div className="bg-muted/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Max Loan Amount</p>
                </div>
                <p className="text-xl font-bold">
                  {formatPrice(result.maxLoanAmount, currency)}
                </p>
              </div>

              <div className="bg-muted/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Your Deposit</p>
                </div>
                <p className="text-xl font-bold">
                  {formatPrice(result.requiredDeposit, currency)}
                </p>
              </div>

              <div className="bg-muted/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Debt-to-Income Ratio</p>
                </div>
                <p className={`text-xl font-bold ${
                  result.debtToIncomeRatio <= 36 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {result.debtToIncomeRatio.toFixed(1)}%
                </p>
              </div>
            </div>

            {/* Recommendation Alert */}
            <Alert className={result.canAfford ? 'border-green-200 bg-green-50' : 'border-orange-200 bg-orange-50'}>
              {result.canAfford ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-orange-600" />
              )}
              <AlertDescription className={result.canAfford ? 'text-green-900' : 'text-orange-900'}>
                <strong>{result.canAfford ? 'Good News!' : 'Important:'}</strong>{' '}
                {result.recommendation}
              </AlertDescription>
            </Alert>

            {/* Financial Health Indicators */}
            <div className="space-y-3 pt-4 border-t">
              <h4 className="font-semibold text-sm">Financial Health Indicators</h4>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Debt-to-Income Ratio</span>
                  <span className={`font-medium ${
                    result.debtToIncomeRatio <= 36 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {result.debtToIncomeRatio.toFixed(1)}% {result.debtToIncomeRatio <= 36 ? '✓' : '✗'}
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      result.debtToIncomeRatio <= 36 ? 'bg-green-600' : 'bg-red-600'
                    }`}
                    style={{ width: `${Math.min(result.debtToIncomeRatio, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Recommended: Below 36%
                </p>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Disposable Income After Mortgage</span>
                  <span className="font-medium">
                    {formatPrice(
                      Math.max(0, monthlyIncome - monthlyExpenses - monthlyDebts - result.maxMonthlyPayment),
                      currency
                    )}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Money available for savings and emergencies
                </p>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-xs text-blue-900">
                <strong>Note:</strong> This calculator provides estimates based on the 28/36 rule (housing costs should not exceed 28% of gross income, and total debt should not exceed 36%). Actual loan approval depends on credit score, employment history, and lender requirements. Consult with a financial advisor for personalized advice.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
