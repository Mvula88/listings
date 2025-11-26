'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Home, Shield, CheckCircle } from "lucide-react"
import { LottiePlayer } from "@/components/ui/lottie-player"
import buyingSellingAnimation from "@/public/buying-selling.json"

export function WhyProplinkaSection() {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/10 to-background" />
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          {/* Lottie Animation */}
          <div className="flex justify-center mb-6">
            <div className="w-40 h-40 md:w-52 md:h-52">
              <LottiePlayer
                animationData={buyingSellingAnimation}
                className="w-full h-full"
              />
            </div>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">Why PropLinka</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Built for owners and property lawyers
          </p>
          <p className="text-sm text-muted-foreground max-w-3xl mx-auto mt-2">
            The platform keeps deals transparent, documents organised, and everyone on the same page.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* For Home Owners */}
          <Card className="relative group hover:shadow-2xl transition-all duration-500 border-2 hover:border-primary/50 h-full flex flex-col overflow-hidden bg-gradient-to-br from-background to-primary/5">
            {/* Decorative corner accent */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-bl-full" />

            <CardHeader className="relative z-10">
              <div className="w-16 h-16 bg-gradient-to-br from-primary via-primary/90 to-primary/80 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-primary/20 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                <Home className="h-8 w-8 text-primary-foreground" />
              </div>
              <CardTitle className="text-2xl mb-2">For Home Owners</CardTitle>
              <p className="text-lg text-muted-foreground font-semibold">Sell without agents. Keep more.</p>
            </CardHeader>
            <CardContent className="flex-1 relative z-10">
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>No estate agent commissions eating your sale price</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>Choose your own selling price and negotiate directly</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>Clear visibility: offer, documents, and transfer stage in one dashboard</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>Fixed legal fees shown before you accept a lawyer</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>Support from humans if you get stuck in the process</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* For Property Lawyers */}
          <Card className="relative group hover:shadow-2xl transition-all duration-500 border-2 hover:border-primary/50 h-full flex flex-col overflow-hidden bg-gradient-to-br from-background to-emerald-500/5">
            {/* Decorative corner accent */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-bl-full" />

            <CardHeader className="relative z-10">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/20 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl mb-2">For Property Lawyers</CardTitle>
              <p className="text-lg text-muted-foreground font-semibold">Quality matters, not cold calling.</p>
            </CardHeader>
            <CardContent className="flex-1 relative z-10">
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span>Receive pre-qualified, serious property deals from owners</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span>Set your own fixed fee packs for different property values</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span>Secure document uploads and digital signatures built-in</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span>Automatic status updates to keep both parties informed</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span>Grow your practice with transparent, digital-first workflows</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
