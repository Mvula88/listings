import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, X } from "lucide-react"

export default function PricingPage() {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-primary">
              DealDirect
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
            <p className="text-lg text-muted-foreground">
              No hidden fees, no percentage commissions. Just a simple success fee when your transaction completes.
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
                  <span className="text-3xl font-bold">R1,000</span>
                  <span className="text-muted-foreground"> success fee</span>
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
                    <span className="text-sm">Secure document sharing</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                    <span className="text-sm">Pay only when you buy</span>
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
                  <span className="text-3xl font-bold">R1,000</span>
                  <span className="text-muted-foreground"> success fee</span>
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
                    <span className="text-sm">No time limits on listings</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                    <span className="text-sm">Pay only when you sell</span>
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
                  <span className="text-3xl font-bold">Free</span>
                  <span className="text-muted-foreground"> to join</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                    <span className="text-sm">Get direct client leads</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                    <span className="text-sm">Set your own flat rates</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                    <span className="text-sm">Verified profile badge</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                    <span className="text-sm">Client review system</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                    <span className="text-sm">No platform fees</span>
                  </li>
                </ul>
                <Button className="w-full mt-6" variant="outline" asChild>
                  <Link href="/register?type=lawyer">Join as Lawyer</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Compare with Traditional Agents</h2>
            <Card>
              <CardContent className="p-0">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4">Feature</th>
                      <th className="text-center p-4">DealDirect</th>
                      <th className="text-center p-4">Traditional Agents</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="p-4">Commission/Fees</td>
                      <td className="text-center p-4">
                        <span className="font-semibold text-primary">R2,000 flat</span>
                      </td>
                      <td className="text-center p-4">
                        <span className="text-destructive">5-7% of sale price</span>
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-4">On R2,000,000 property</td>
                      <td className="text-center p-4">
                        <span className="font-semibold text-primary">R2,000</span>
                      </td>
                      <td className="text-center p-4">
                        <span className="text-destructive">R100,000 - R140,000</span>
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
                  <CardTitle className="text-base">When do I pay the success fee?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    You only pay when your transaction successfully completes. No upfront fees, no monthly charges.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Are there any hidden costs?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    No. Our pricing is completely transparent. R1,000 for buyers, R1,000 for sellers. Conveyancing fees are separate and paid directly to your chosen lawyer.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">What if my property doesn't sell?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    You pay nothing. Your listing remains active until you sell or decide to remove it. No time limits, no fees.
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
          © 2024 DealDirect. All rights reserved.
        </div>
      </footer>
    </div>
  )
}