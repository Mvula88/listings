'use client'

import { Card, CardContent } from "@/components/ui/card"
import { LottiePlayer } from "@/components/ui/lottie-player"
import { ArrowRight, CheckCircle } from "lucide-react"
import searchPropertyAnimation from "@/public/search-property.json"
import buyingSellingAnimation from "@/public/buying-selling.json"
import ideaAnimation from "@/public/idea.json"
import questioningAnimation from "@/public/questioning.json"

export function AnimatedStepsSection() {
  return (
    <section className="py-20 bg-gradient-to-b from-background via-muted/20 to-background relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]" />
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">Four Simple Steps</h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Join thousands who have saved money on property transactions
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 max-w-7xl mx-auto mb-16">
          {/* Step 1 */}
          <Card className="relative group hover:shadow-2xl transition-all duration-500 border-2 hover:border-primary/50 h-full bg-background/50 backdrop-blur overflow-hidden">
            <div className="absolute -top-4 -right-4 w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
              <span className="text-4xl font-bold text-primary/30">1</span>
            </div>

            <CardContent className="p-6 pt-8">
              <div className="relative mb-4 flex justify-center">
                <div className="w-24 h-24">
                  <LottiePlayer
                    animationData={searchPropertyAnimation}
                    className="w-full h-full"
                  />
                </div>
              </div>

              <h3 className="font-bold text-xl mb-3 text-center">List or Browse</h3>
              <p className="text-sm text-muted-foreground text-center leading-relaxed">
                List your property for free or browse available properties across Namibia and South Africa
              </p>
            </CardContent>

            <div className="hidden lg:block absolute top-1/2 -right-8 transform -translate-y-1/2 z-10">
              <ArrowRight className="h-6 w-6 text-primary/40" />
            </div>
          </Card>

          {/* Step 2 */}
          <Card className="relative group hover:shadow-2xl transition-all duration-500 border-2 hover:border-primary/50 h-full bg-background/50 backdrop-blur overflow-hidden">
            <div className="absolute -top-4 -right-4 w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
              <span className="text-4xl font-bold text-primary/30">2</span>
            </div>

            <CardContent className="p-6 pt-8">
              <div className="relative mb-4 flex justify-center">
                <div className="w-24 h-24">
                  <LottiePlayer
                    animationData={questioningAnimation}
                    className="w-full h-full"
                  />
                </div>
              </div>

              <h3 className="font-bold text-xl mb-3 text-center">Connect Directly</h3>
              <p className="text-sm text-muted-foreground text-center leading-relaxed">
                Buyers and sellers communicate directly through our secure messaging platform
              </p>
            </CardContent>

            <div className="hidden lg:block absolute top-1/2 -right-8 transform -translate-y-1/2 z-10">
              <ArrowRight className="h-6 w-6 text-primary/40" />
            </div>
          </Card>

          {/* Step 3 */}
          <Card className="relative group hover:shadow-2xl transition-all duration-500 border-2 hover:border-primary/50 h-full bg-background/50 backdrop-blur overflow-hidden">
            <div className="absolute -top-4 -right-4 w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
              <span className="text-4xl font-bold text-primary/30">3</span>
            </div>

            <CardContent className="p-6 pt-8">
              <div className="relative mb-4 flex justify-center">
                <div className="w-24 h-24">
                  <LottiePlayer
                    animationData={ideaAnimation}
                    className="w-full h-full"
                  />
                </div>
              </div>

              <h3 className="font-bold text-xl mb-3 text-center">Choose Conveyancer</h3>
              <p className="text-sm text-muted-foreground text-center leading-relaxed">
                Select from our network of verified lawyers with transparent flat-rate pricing
              </p>
            </CardContent>

            <div className="hidden lg:block absolute top-1/2 -right-8 transform -translate-y-1/2 z-10">
              <ArrowRight className="h-6 w-6 text-primary/40" />
            </div>
          </Card>

          {/* Step 4 */}
          <Card className="relative group hover:shadow-2xl transition-all duration-500 border-2 hover:border-primary/50 h-full bg-background/50 backdrop-blur overflow-hidden">
            <div className="absolute -top-4 -right-4 w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center">
              <span className="text-4xl font-bold text-green-500/30">4</span>
            </div>

            <CardContent className="p-6 pt-8">
              <div className="relative mb-4 flex justify-center">
                <div className="w-24 h-24">
                  <LottiePlayer
                    animationData={buyingSellingAnimation}
                    className="w-full h-full"
                  />
                </div>
              </div>

              <h3 className="font-bold text-xl mb-3 text-center">Save Thousands</h3>
              <p className="text-sm text-muted-foreground text-center leading-relaxed">
                Pay a small platform fee at closing and save 50-70% compared to traditional agent commissions
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
