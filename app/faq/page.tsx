import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

export default function FAQPage() {
  const faqs = [
    {
      category: "General",
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
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-primary">
              PropLinka
            </Link>
            <div className="flex items-center gap-6">
              <Link href="/browse" className="text-sm font-medium hover:text-primary">
                Browse Properties
              </Link>
              <Link href="/login">
                <Button variant="outline" size="sm">Login</Button>
              </Link>
              <Link href="/register">
                <Button size="sm">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary/10 to-background py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl font-bold mb-4">Frequently Asked Questions</h1>
            <p className="text-lg text-muted-foreground">
              Everything you need to know about buying and selling on PropLinka
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto space-y-8">
            {faqs.map((category, categoryIndex) => (
              <div key={categoryIndex}>
                <h2 className="text-2xl font-bold mb-4">{category.category}</h2>
                <Accordion type="single" collapsible className="space-y-2">
                  {category.questions.map((item, index) => (
                    <AccordionItem key={index} value={`${categoryIndex}-${index}`}>
                      <AccordionTrigger className="text-left">
                        {item.q}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                        {item.a}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <Card className="max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <CardTitle>Still have questions?</CardTitle>
              <CardDescription>
                Our support team is here to help
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="mb-6 text-muted-foreground">
                Can't find the answer you're looking for? Get in touch with our friendly support team.
              </p>
              <div className="flex gap-4 justify-center">
                <Button asChild>
                  <Link href="/contact">Contact Support</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/how-it-works">How It Works</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © 2024 PropLinka. All rights reserved.
        </div>
      </footer>
    </div>
  )
}