import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { HelpCircle, MessageCircle, ArrowRight, Sparkles, Users, Home, Scale, DollarSign } from "lucide-react"
import { PageHeader } from "@/components/layout/page-header"
import { PageFooter } from "@/components/layout/page-footer"
import { FadeIn } from "@/components/ui/fade-in"

export default function FAQPage() {
  const faqs = [
    {
      category: "General",
      icon: HelpCircle,
      questions: [
        {
          q: "What is PropLinka?",
          a: "PropLinka is a direct real estate platform that connects buyers and sellers without agent commissions. Sellers pay a tiered platform fee (R4,500-R45,000 based on property value) only when the transaction completes successfully. Buyers pay ZERO platform fees."
        },
        {
          q: "Which countries does PropLinka operate in?",
          a: "We currently operate in South Africa and Namibia. We're planning to expand to other African countries soon."
        },
        {
          q: "Is PropLinka really free to use?",
          a: "For buyers: Absolutely FREE - no platform fees ever! For sellers: FREE to list and market your property. You only pay a tiered platform fee when your property successfully sells (R4,500-R45,000 based on property value - still 80-90% less than traditional agent commissions)."
        }
      ]
    },
    {
      category: "For Buyers",
      icon: Users,
      questions: [
        {
          q: "How do I contact sellers?",
          a: "Once you create a free account, you can message sellers directly through our platform. Their contact information is also displayed on property listings."
        },
        {
          q: "Can I view properties before buying?",
          a: "Yes! You arrange viewings directly with the seller. Many sellers also provide virtual tours and detailed photos."
        },
        {
          q: "Do I need a lawyer to buy property?",
          a: "Yes, property transfers require legal documentation. You can choose from our verified conveyancing lawyers who offer transparent flat-rate pricing."
        },
        {
          q: "Do buyers pay any fees to PropLinka?",
          a: "No! Buyers pay ZERO platform fees. You only pay the standard conveyancing fees to your lawyer (same as traditional property purchases). PropLinka's platform fee is paid by the seller only."
        }
      ]
    },
    {
      category: "For Sellers",
      icon: Home,
      questions: [
        {
          q: "How many properties can I list?",
          a: "You can list as many properties as you want, completely free. There are no listing fees or limits."
        },
        {
          q: "How long do listings stay active?",
          a: "Your listings stay active until you sell or manually remove them. Unlike traditional agents, there are no time limits."
        },
        {
          q: "Can I upload photos and videos?",
          a: "Yes! You can upload unlimited photos and include links to virtual tours or video walkthroughs."
        },
        {
          q: "What if I already have an agent?",
          a: "Check your agreement with your agent. If you're not under an exclusive mandate, you can list on PropLinka as well."
        },
        {
          q: "How do I handle offers and negotiations?",
          a: "You communicate directly with buyers through our messaging system or your provided contact details. You have full control over negotiations."
        }
      ]
    },
    {
      category: "Legal & Safety",
      icon: Scale,
      questions: [
        {
          q: "Is it safe to buy/sell without an agent?",
          a: "Yes! The legal process remains the same - you still use a qualified conveyancing attorney to handle all legal aspects and ensure a secure transfer."
        },
        {
          q: "How are lawyers verified?",
          a: "All lawyers on our platform must provide valid practicing certificates and professional indemnity insurance. We verify their credentials before approval."
        },
        {
          q: "What about property inspections?",
          a: "We recommend buyers arrange professional inspections. This is the same process whether you use an agent or not."
        },
        {
          q: "How is payment handled?",
          a: "Property payments are handled by the conveyancing attorney through trust accounts, exactly as with traditional sales. PropLinka never handles property funds."
        }
      ]
    },
    {
      category: "Fees & Payments",
      icon: DollarSign,
      questions: [
        {
          q: "What fees do sellers pay?",
          a: "Sellers pay a tiered platform fee based on property value: R4,500 (under R500K), R7,500 (R500K-R1M), R9,500 (R1M-R1.5M), R12,500 (R1.5M-R2.5M), R18,000 (R2.5M-R5M), R30,000 (R5M-R10M), or R45,000 (R10M+). This is paid ONLY when the transaction successfully completes."
        },
        {
          q: "Do buyers pay any platform fees?",
          a: "No! Buyers pay ZERO platform fees to PropLinka. You only pay standard conveyancing fees to your lawyer (same as traditional purchases)."
        },
        {
          q: "Are there any other fees?",
          a: "No hidden fees from PropLinka. Both parties pay normal conveyancing fees to their chosen lawyer and any government transfer duties (same as traditional sales)."
        },
        {
          q: "How is the platform fee collected?",
          a: "The platform fee is included in the settlement statement and collected by your conveyancing attorney at closing. The attorney then remits it to PropLinka within 30 days."
        },
        {
          q: "What if the sale falls through?",
          a: "You pay nothing. The platform fee is only charged when the property transfer is successfully registered."
        },
        {
          q: "How much do I save compared to traditional agents?",
          a: "Massive savings! Traditional agent commissions are 5-7% (R50,000-R70,000 on a R1M property). With PropLinka's tiered fee of R7,500, you save R42,500-R62,500 - that's 85-90% less!"
        }
      ]
    }
  ]

  return (
    <div className="min-h-screen flex flex-col">
      <PageHeader />

      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-primary/10 via-primary/5 to-background overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]" />
        <div className="absolute top-10 right-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />

        <div className="container mx-auto px-4 relative z-10">
          <FadeIn>
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6">
                <HelpCircle className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-primary">Get Answers</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 font-[family-name:var(--font-poppins)]">
                Frequently Asked <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">Questions</span>
              </h1>
              <p className="text-lg text-muted-foreground">
                Everything you need to know about buying and selling on PropLinka
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-8 border-b bg-muted/30">
        <div className="container mx-auto px-4">
          <FadeIn>
            <div className="flex flex-wrap justify-center gap-3">
              {faqs.map((category, index) => {
                const Icon = category.icon
                return (
                  <a
                    key={index}
                    href={`#${category.category.toLowerCase().replace(/\s+/g, '-')}`}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-background border-2 rounded-full hover:border-primary/50 transition-colors"
                  >
                    <Icon className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">{category.category}</span>
                  </a>
                )
              })}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-16 flex-1">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto space-y-12">
            {faqs.map((category, categoryIndex) => {
              const Icon = category.icon
              return (
                <FadeIn key={categoryIndex} delay={categoryIndex * 0.1}>
                  <div id={category.category.toLowerCase().replace(/\s+/g, '-')}>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <h2 className="text-2xl font-bold">{category.category}</h2>
                    </div>
                    <Card className="border-2 shadow-sm">
                      <CardContent className="p-0">
                        <Accordion type="single" collapsible className="divide-y">
                          {category.questions.map((item, index) => (
                            <AccordionItem
                              key={index}
                              value={`${categoryIndex}-${index}`}
                              className="border-0"
                            >
                              <AccordionTrigger className="text-left px-6 py-4 hover:bg-muted/30 transition-colors">
                                {item.q}
                              </AccordionTrigger>
                              <AccordionContent className="px-6 pb-4 text-muted-foreground">
                                {item.a}
                              </AccordionContent>
                            </AccordionItem>
                          ))}
                        </Accordion>
                      </CardContent>
                    </Card>
                  </div>
                </FadeIn>
              )
            })}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <FadeIn>
            <Card className="max-w-2xl mx-auto border-2 shadow-lg">
              <CardHeader className="text-center">
                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="h-7 w-7 text-primary" />
                </div>
                <CardTitle className="text-2xl">Still have questions?</CardTitle>
                <CardDescription className="text-base">
                  Our support team is here to help you
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center pb-8">
                <p className="mb-6 text-muted-foreground">
                  Can't find the answer you're looking for? Get in touch with our friendly support team.
                </p>
                <div className="flex gap-4 justify-center flex-wrap">
                  <Button asChild size="lg">
                    <Link href="/contact">
                      Contact Support
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button variant="outline" size="lg" asChild>
                    <Link href="/how-it-works">How It Works</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </FadeIn>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <FadeIn>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full mb-6">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-medium">Ready to Start?</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Start Saving Today</h2>
            <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
              Join thousands who are buying and selling smarter on PropLinka
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link href="/register">
                <Button size="lg" className="bg-white text-blue-700 hover:bg-blue-50">
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/browse">
                <Button size="lg" variant="outline" className="bg-transparent text-white border-white hover:bg-white/10">
                  Browse Properties
                </Button>
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      <PageFooter />
    </div>
  )
}
