import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, X } from "lucide-react"
import { PLATFORM_FEE_TIERS } from "@/lib/utils/savings-calculator"

export default function PricingPage() {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="transition-transform hover:scale-105">
              <Image
                src="/logo.png"
                alt="PropLinka"
                width={180}
                height={50}
                className="h-10 w-auto"
                priority
              />
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
            <h1 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h1>
            <p className="text-lg text-muted-foreground mb-2">
              Free to list. Free to browse. Only pay when your deal closes.
            </p>
            <p className="text-sm text-muted-foreground">
              Platform fee collected by lawyer at closing - no upfront costs, no percentage commissions.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Buyer Card */}
            <Card className="relative">
              <CardHeader>
                <CardTitle>For Buyers</CardTitle>
                <CardDescription>Find your perfect property</CardDescription>
                <div className="mt-4">
                  <span className="text-3xl font-bold">FREE</span>
                  <span className="text-muted-foreground"> to browse</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                    <span className="text-sm">Browse unlimited properties</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                    <span className="text-sm">Direct contact with sellers</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                    <span className="text-sm">Access to verified lawyers</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                    <span className="text-sm">Platform fee paid at closing</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                    <span className="text-sm">Zero upfront costs</span>
                  </li>
                </ul>
                <Button className="w-full mt-6" asChild>
                  <Link href="/register?type=buyer">Start Browsing</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Seller Card */}
            <Card className="relative border-primary">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </span>
              </div>
              <CardHeader>
                <CardTitle>For Sellers</CardTitle>
                <CardDescription>List and sell your property</CardDescription>
                <div className="mt-4">
                  <span className="text-3xl font-bold">FREE</span>
                  <span className="text-muted-foreground"> to list</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                    <span className="text-sm">List unlimited properties</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                    <span className="text-sm">Upload unlimited photos</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                    <span className="text-sm">Direct buyer inquiries</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                    <span className="text-sm">Platform fee paid at closing</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                    <span className="text-sm">Zero upfront costs</span>
                  </li>
                </ul>
                <Button className="w-full mt-6" asChild>
                  <Link href="/register?type=seller">List Property</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Lawyer Card */}
            <Card>
              <CardHeader>
                <CardTitle>For Lawyers</CardTitle>
                <CardDescription>Offer conveyancing services</CardDescription>
                <div className="mt-4">
                  <span className="text-3xl font-bold">FREE</span>
                  <span className="text-muted-foreground"> leads</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                    <span className="text-sm">Get pre-qualified client leads</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                    <span className="text-sm">Collect platform fee at closing</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                    <span className="text-sm">Set your own conveyancing rates</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                    <span className="text-sm">Verified profile badge</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                    <span className="text-sm">Zero lead acquisition costs</span>
                  </li>
                </ul>
                <Button className="w-full mt-6" variant="outline" asChild>
                  <Link href="/lawyers/onboarding">Join as Lawyer</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Tiered Platform Fees */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-4">Platform Fee Structure</h2>
            <p className="text-center text-muted-foreground mb-12">
              Our platform fee is based on property value - collected by your lawyer at closing
            </p>
            <Card>
              <CardContent className="p-0">
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
                      <tr key={index} className="border-b last:border-0">
                        <td className="p-4">{tier.label}</td>
                        <td className="text-center p-4 font-semibold text-primary">
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
              </CardContent>
            </Card>
            <p className="text-sm text-muted-foreground text-center mt-4">
              * Platform fee applies to South Africa and Namibia. Additional lawyer conveyancing fees apply (typically R15K-R40K depending on property value).
            </p>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Compare with Traditional Agents</h2>
            <Card>
              <CardContent className="p-0">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4">Feature</th>
                      <th className="text-center p-4">PropLinka</th>
                      <th className="text-center p-4">Traditional Agents</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="p-4">Commission/Fees</td>
                      <td className="text-center p-4">
                        <span className="font-semibold text-primary">Tiered platform fee</span>
                      </td>
                      <td className="text-center p-4">
                        <span className="text-destructive">5-6% of sale price</span>
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-4">On R1,000,000 property</td>
                      <td className="text-center p-4">
                        <span className="font-semibold text-primary">R6,000 + lawyer fee</span>
                      </td>
                      <td className="text-center p-4">
                        <span className="text-destructive">R50,000 - R60,000</span>
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-4">On R2,000,000 property</td>
                      <td className="text-center p-4">
                        <span className="font-semibold text-primary">R10,000 + lawyer fee</span>
                      </td>
                      <td className="text-center p-4">
                        <span className="text-destructive">R100,000 - R120,000</span>
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-4">Direct communication</td>
                      <td className="text-center p-4">
                        <CheckCircle className="h-5 w-5 text-primary inline" />
                      </td>
                      <td className="text-center p-4">
                        <X className="h-5 w-5 text-destructive inline" />
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-4">Control over process</td>
                      <td className="text-center p-4">
                        <CheckCircle className="h-5 w-5 text-primary inline" />
                      </td>
                      <td className="text-center p-4">
                        <X className="h-5 w-5 text-destructive inline" />
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-4">Listing duration</td>
                      <td className="text-center p-4">
                        <span className="font-medium">Unlimited</span>
                      </td>
                      <td className="text-center p-4">
                        <span>Usually 3-6 months</span>
                      </td>
                    </tr>
                    <tr>
                      <td className="p-4">Legal services included</td>
                      <td className="text-center p-4">
                        <span className="font-medium">Access to verified lawyers</span>
                      </td>
                      <td className="text-center p-4">
                        <span>Additional cost</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">When do I pay the platform fee?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    The platform fee is collected by your lawyer at closing and included in the settlement statement. You never pay us directly. No upfront fees, no monthly charges.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">How much is the platform fee?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Platform fees are tiered based on property value, ranging from R3,000 (under R500K) to R25,000 (R5M+). This is less than 1% of property value, compared to 5-6% traditional agent commissions. See the fee structure table above for full details.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">What about lawyer fees?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Conveyancing lawyer fees are separate and typically range from R15,000-R40,000 depending on property value. These are paid directly to your chosen lawyer. Even with both fees combined, you save 50-70% compared to traditional agent commissions.
                  </p>
                </CardContent>
              </Card>
              <Card>
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
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Start Saving Today</h2>
          <p className="text-lg mb-8 opacity-90">
            Join thousands who are buying and selling smarter
          </p>
          <Link href="/register">
            <Button size="lg" variant="secondary">
              Get Started Free
            </Button>
          </Link>
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