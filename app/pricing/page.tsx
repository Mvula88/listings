import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, X, TrendingDown, ArrowRight, Sparkles, DollarSign, HelpCircle } from "lucide-react"
import { PLATFORM_FEE_TIERS } from "@/lib/utils/savings-calculator"
import { PageHeader } from "@/components/layout/page-header"
import { PageFooter } from "@/components/layout/page-footer"
import { FadeIn } from "@/components/ui/fade-in"

export default function PricingPage() {
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
                <TrendingDown className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-primary">Save Up to 92% on Fees</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 font-[family-name:var(--font-poppins)]">
                Simple, <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">Transparent</span> Pricing
              </h1>
              <p className="text-lg text-muted-foreground mb-2">
                Free to list. Free to browse. Only pay when your deal closes.
              </p>
              <p className="text-muted-foreground">
                Platform fee collected by lawyer at closing - no upfront costs, no percentage commissions.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Buyer Card */}
            <FadeIn delay={0.1}>
              <Card className="relative border-2 hover:border-primary/30 transition-all hover:shadow-xl h-full">
                <CardHeader>
                  <CardTitle>For Buyers</CardTitle>
                  <CardDescription>Find your perfect property</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-primary">FREE</span>
                    <span className="text-muted-foreground ml-2">to browse</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Browse unlimited properties</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Direct contact with sellers</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Access to verified lawyers</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Zero platform fees</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Zero upfront costs</span>
                    </li>
                  </ul>
                  <Button className="w-full mt-6" asChild>
                    <Link href="/register?type=buyer">Start Browsing</Link>
                  </Button>
                </CardContent>
              </Card>
            </FadeIn>

            {/* Seller Card */}
            <FadeIn delay={0.2}>
              <Card className="relative border-2 border-primary shadow-xl scale-105 h-full">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-primary text-primary-foreground px-4 py-1.5 rounded-full text-sm font-medium flex items-center gap-1">
                    <Sparkles className="h-3 w-3" />
                    Most Popular
                  </span>
                </div>
                <CardHeader className="pt-8">
                  <CardTitle>For Sellers</CardTitle>
                  <CardDescription>List and sell your property</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-primary">FREE</span>
                    <span className="text-muted-foreground ml-2">to list</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm">List unlimited properties</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Upload unlimited photos</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Direct buyer inquiries</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Platform fee paid at closing</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Zero upfront costs</span>
                    </li>
                  </ul>
                  <Button className="w-full mt-6" asChild>
                    <Link href="/register?type=seller">List Property</Link>
                  </Button>
                </CardContent>
              </Card>
            </FadeIn>

            {/* Lawyer Card */}
            <FadeIn delay={0.3}>
              <Card className="border-2 hover:border-emerald-500/30 transition-all hover:shadow-xl h-full">
                <CardHeader>
                  <CardTitle>For Lawyers</CardTitle>
                  <CardDescription>Offer conveyancing services</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-emerald-600">FREE</span>
                    <span className="text-muted-foreground ml-2">leads</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Get pre-qualified client leads</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Collect platform fee at closing</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Set your own conveyancing rates</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Verified profile badge</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Zero lead acquisition costs</span>
                    </li>
                  </ul>
                  <Button className="w-full mt-6 bg-emerald-600 hover:bg-emerald-700" asChild>
                    <Link href="/lawyers/onboarding">Join as Lawyer</Link>
                  </Button>
                </CardContent>
              </Card>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Tiered Platform Fees */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <FadeIn>
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-4">
                  <DollarSign className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-primary">Tiered Pricing</span>
                </div>
                <h2 className="text-3xl font-bold mb-4">Platform Fee Structure</h2>
                <p className="text-muted-foreground">
                  Our platform fee is based on property value - collected by your lawyer at closing
                </p>
              </div>
              <Card className="border-2 shadow-lg overflow-hidden">
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b bg-muted/50">
                          <th className="text-left p-4 font-semibold">Property Value</th>
                          <th className="text-center p-4 font-semibold">Platform Fee</th>
                          <th className="text-center p-4 font-semibold">As % of Value</th>
                        </tr>
                      </thead>
                      <tbody>
                        {PLATFORM_FEE_TIERS.map((tier, index) => (
                          <tr key={index} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                            <td className="p-4">{tier.label}</td>
                            <td className="text-center p-4 font-bold text-primary text-lg">
                              R{tier.fee.toLocaleString()}
                            </td>
                            <td className="text-center p-4 text-muted-foreground">
                              {tier.max === Infinity
                                ? '<0.5%'
                                : `${((tier.fee / tier.max) * 100).toFixed(2)}%`}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
              <p className="text-sm text-muted-foreground text-center mt-4">
                * Platform fee applies to South Africa and Namibia. Additional lawyer conveyancing fees apply (typically R15K-R40K depending on property value).
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <FadeIn>
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12">Compare with Traditional Agents</h2>
              <Card className="border-2 shadow-lg overflow-hidden">
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b bg-muted/50">
                          <th className="text-left p-4">Feature</th>
                          <th className="text-center p-4 bg-primary/5">
                            <span className="font-bold text-primary">PropLinka</span>
                          </th>
                          <th className="text-center p-4">Traditional Agents</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b">
                          <td className="p-4 font-medium">Commission/Fees</td>
                          <td className="text-center p-4 bg-primary/5">
                            <span className="font-bold text-primary">Tiered platform fee</span>
                          </td>
                          <td className="text-center p-4">
                            <span className="text-destructive">5-6% of sale price</span>
                          </td>
                        </tr>
                        <tr className="border-b">
                          <td className="p-4 font-medium">On R1,000,000 property</td>
                          <td className="text-center p-4 bg-primary/5">
                            <span className="font-bold text-primary">R6,000 + lawyer fee</span>
                          </td>
                          <td className="text-center p-4">
                            <span className="text-destructive">R50,000 - R60,000</span>
                          </td>
                        </tr>
                        <tr className="border-b">
                          <td className="p-4 font-medium">On R2,000,000 property</td>
                          <td className="text-center p-4 bg-primary/5">
                            <span className="font-bold text-primary">R10,000 + lawyer fee</span>
                          </td>
                          <td className="text-center p-4">
                            <span className="text-destructive">R100,000 - R120,000</span>
                          </td>
                        </tr>
                        <tr className="border-b">
                          <td className="p-4 font-medium">Direct communication</td>
                          <td className="text-center p-4 bg-primary/5">
                            <CheckCircle className="h-5 w-5 text-primary inline" />
                          </td>
                          <td className="text-center p-4">
                            <X className="h-5 w-5 text-destructive inline" />
                          </td>
                        </tr>
                        <tr className="border-b">
                          <td className="p-4 font-medium">Control over process</td>
                          <td className="text-center p-4 bg-primary/5">
                            <CheckCircle className="h-5 w-5 text-primary inline" />
                          </td>
                          <td className="text-center p-4">
                            <X className="h-5 w-5 text-destructive inline" />
                          </td>
                        </tr>
                        <tr className="border-b">
                          <td className="p-4 font-medium">Listing duration</td>
                          <td className="text-center p-4 bg-primary/5">
                            <span className="font-medium text-primary">Unlimited</span>
                          </td>
                          <td className="text-center p-4">
                            <span>Usually 3-6 months</span>
                          </td>
                        </tr>
                        <tr>
                          <td className="p-4 font-medium">Legal services included</td>
                          <td className="text-center p-4 bg-primary/5">
                            <span className="font-medium text-primary">Access to verified lawyers</span>
                          </td>
                          <td className="text-center p-4">
                            <span>Additional cost</span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <FadeIn>
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-4">
                  <HelpCircle className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-primary">Common Questions</span>
                </div>
                <h2 className="text-3xl font-bold">Pricing FAQ</h2>
              </div>
              <div className="space-y-4">
                <Card className="border-2 hover:border-primary/30 transition-colors">
                  <CardHeader>
                    <CardTitle className="text-base">When do I pay the platform fee?</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      The platform fee is collected by your lawyer at closing and included in the settlement statement. You never pay us directly. No upfront fees, no monthly charges.
                    </p>
                  </CardContent>
                </Card>
                <Card className="border-2 hover:border-primary/30 transition-colors">
                  <CardHeader>
                    <CardTitle className="text-base">What about lawyer fees?</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Conveyancing lawyer fees are separate and typically range from R15,000-R40,000 depending on property value. These are paid directly to your chosen lawyer. Even with both fees combined, you save 50-70% compared to traditional agent commissions.
                    </p>
                  </CardContent>
                </Card>
                <Card className="border-2 hover:border-primary/30 transition-colors">
                  <CardHeader>
                    <CardTitle className="text-base">What if my property doesn't sell?</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      You pay nothing. Your listing remains active until you sell or decide to remove it. No time limits, no upfront fees.
                    </p>
                  </CardContent>
                </Card>
              </div>
              <div className="text-center mt-8">
                <Link href="/faq">
                  <Button variant="outline" size="lg">
                    View All FAQs
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <FadeIn>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Start Saving Today</h2>
            <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
              Join thousands who are buying and selling smarter
            </p>
            <Link href="/register">
              <Button size="lg" className="bg-white text-blue-700 hover:bg-blue-50">
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </FadeIn>
        </div>
      </section>

      <PageFooter />
    </div>
  )
}
