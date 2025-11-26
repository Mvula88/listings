'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { HelpCircle } from "lucide-react"
import { LottiePlayer } from "@/components/ui/lottie-player"
import faqAnimation from "@/public/faq.json"

export function FAQSection() {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          {/* Lottie Animation */}
          <div className="flex justify-center mb-6">
            <div className="w-32 h-32 md:w-40 md:h-40">
              <LottiePlayer
                animationData={faqAnimation}
                className="w-full h-full"
              />
            </div>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Get answers to common questions about PropLinka
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-4">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-xl flex items-start gap-3">
                <HelpCircle className="h-6 w-6 text-primary mt-0.5 flex-shrink-0" />
                Do I still need an estate agent?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                No. PropLinka is designed for owners who want to sell directly. You handle viewings and negotiations, while trusted lawyers handle contracts and transfer.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-xl flex items-start gap-3">
                <HelpCircle className="h-6 w-6 text-primary mt-0.5 flex-shrink-0" />
                Is PropLinka a law firm?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                No. PropLinka is a platform that connects you to independent property lawyers. Each lawyer is regulated in their own jurisdiction and works with you directly.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-xl flex items-start gap-3">
                <HelpCircle className="h-6 w-6 text-primary mt-0.5 flex-shrink-0" />
                How do lawyers charge on PropLinka?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                Lawyers set fixed-fee packs (for example, "Sale up to N$1.5m"). You see the fee before you confirm, so there are no surprise bills later.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-xl flex items-start gap-3">
                <HelpCircle className="h-6 w-6 text-primary mt-0.5 flex-shrink-0" />
                When will the platform be live?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                We are onboarding the first group of home owners and property lawyers. Join the waitlist now and we'll invite you as soon as your region opens.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
