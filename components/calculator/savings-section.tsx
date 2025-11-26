'use client'

import { Card, CardContent } from "@/components/ui/card"
import { TrendingDown } from "lucide-react"
import { SavingsCalculator } from "@/components/calculator/savings-calculator"
import { LottiePlayer } from "@/components/ui/lottie-player"
import piggyBankAnimation from "@/public/piggy-bank.json"
import savingsCoinAnimation from "@/public/savings-coin.json"

export function SavingsSection() {
  return (
    <section className="py-24 bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center px-4 py-2 bg-primary/10 rounded-full mb-6">
            <TrendingDown className="h-4 w-4 text-primary mr-2" />
            <span className="text-sm font-medium text-primary">Save 50-70% on Fees</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">Calculate Your Savings</h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            See exactly how much you'll save by avoiding agent commissions
          </p>
        </div>

        {/* Main content with Lottie animations on sides */}
        <div className="flex justify-center items-center gap-4 lg:gap-8">
          {/* Left Lottie - Piggy Bank */}
          <div className="hidden md:block w-48 lg:w-64 flex-shrink-0">
            <LottiePlayer
              animationData={piggyBankAnimation}
              className="w-full h-auto"
            />
          </div>

          {/* Calculator Card */}
          <div className="w-full max-w-2xl">
            <Card className="border-2 shadow-2xl bg-background/80 backdrop-blur">
              <CardContent className="p-8">
                <SavingsCalculator />
              </CardContent>
            </Card>
          </div>

          {/* Right Lottie - Savings Coin */}
          <div className="hidden md:block w-48 lg:w-64 flex-shrink-0">
            <LottiePlayer
              animationData={savingsCoinAnimation}
              className="w-full h-auto"
            />
          </div>
        </div>

        {/* Trust indicators */}
        <div className="mt-12 flex flex-wrap justify-center gap-8 text-center">
          <div className="flex flex-col items-center">
            <div className="text-3xl font-bold text-primary mb-1">50-70%</div>
            <div className="text-sm text-muted-foreground">Lower Fees</div>
          </div>
          <div className="flex flex-col items-center">
            <div className="text-3xl font-bold text-primary mb-1">100%</div>
            <div className="text-sm text-muted-foreground">Transparent</div>
          </div>
          <div className="flex flex-col items-center">
            <div className="text-3xl font-bold text-primary mb-1">0</div>
            <div className="text-sm text-muted-foreground">Upfront Costs</div>
          </div>
        </div>
      </div>
    </section>
  )
}
