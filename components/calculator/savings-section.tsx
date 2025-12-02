'use client'

import { Card, CardContent } from "@/components/ui/card"
import { SavingsCalculator } from "@/components/calculator/savings-calculator"
import { LottiePlayer } from "@/components/ui/lottie-player"
import piggyBankAnimation from "@/public/piggy-bank.json"

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

          {/* Right Lottie - Piggy Bank */}
          <div className="hidden md:block w-48 lg:w-64 flex-shrink-0">
            <LottiePlayer
              animationData={piggyBankAnimation}
              className="w-full h-auto"
            />
          </div>
        </div>

      </div>
    </section>
  )
}
