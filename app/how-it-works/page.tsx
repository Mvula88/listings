import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, Search, MessageSquare, FileCheck, CheckCircle } from "lucide-react"

export default function HowItWorksPage() {
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
            <h1 className="text-4xl font-bold mb-4">How DealDirect Works</h1>
            <p className="text-lg text-muted-foreground">
              Save thousands on real estate transactions by connecting directly with buyers and sellers
            </p>
          </div>
        </div>
      </section>

      {/* Process Steps */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-12">
            {/* Step 1 */}
            <div className="flex gap-8 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                1
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-2">Create Your Free Account</h3>
                <p className="text-muted-foreground mb-4">
                  Sign up as a buyer, seller, or lawyer. It's completely free to join and browse properties.
                </p>
                <div className="bg-muted rounded-lg p-4">
                  <h4 className="font-medium mb-2">Account Types:</h4>
                  <ul className="space-y-1 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span><strong>Buyers:</strong> Browse and contact sellers directly</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span><strong>Sellers:</strong> List unlimited properties for free</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span><strong>Lawyers:</strong> Offer conveyancing services</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-8 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                2
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-2">List or Search Properties</h3>
                <p className="text-muted-foreground mb-4">
                  Sellers can list properties with photos and details. Buyers can search and filter to find their perfect property.
                </p>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Listing Features</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      <li>• Unlimited photos and descriptions</li>
                      <li>• Virtual tour links</li>
                      <li>• Direct contact information</li>
                      <li>• No listing fees or time limits</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-8 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                3
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-2">Connect Directly</h3>
                <p className="text-muted-foreground mb-4">
                  Buyers and sellers communicate directly through our messaging system. No agents means no delays or miscommunication.
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="border rounded-lg p-4">
                    <MessageSquare className="h-8 w-8 text-primary mb-2" />
                    <h4 className="font-medium mb-1">Direct Messaging</h4>
                    <p className="text-sm text-muted-foreground">
                      Chat directly with buyers or sellers
                    </p>
                  </div>
                  <div className="border rounded-lg p-4">
                    <FileCheck className="h-8 w-8 text-primary mb-2" />
                    <h4 className="font-medium mb-1">Document Sharing</h4>
                    <p className="text-sm text-muted-foreground">
                      Share property documents securely
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex gap-8 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                4
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-2">Choose a Conveyancer</h3>
                <p className="text-muted-foreground mb-4">
                  Select from our verified lawyers to handle the legal work. All lawyers have transparent, flat-rate pricing.
                </p>
                <Card className="border-primary">
                  <CardHeader>
                    <CardTitle className="text-base">Legal Services Include:</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      <li>• Property title searches</li>
                      <li>• Contract drafting and review</li>
                      <li>• Transfer documentation</li>
                      <li>• Settlement coordination</li>
                      <li>• Registration with authorities</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Step 5 */}
            <div className="flex gap-8 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                5
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-2">Complete Your Transaction</h3>
                <p className="text-muted-foreground mb-4">
                  Once the sale is complete, pay only R2,000 success fee. That's it! No hidden costs or percentage commissions.
                </p>
                <div className="bg-primary/10 rounded-lg p-6">
                  <h4 className="font-semibold mb-3">Cost Comparison</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span>Traditional Agent (6% on R2,000,000)</span>
                      <span className="font-bold text-destructive">R120,000</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>DealDirect Success Fee</span>
                      <span className="font-bold text-primary">R2,000</span>
                    </div>
                    <div className="border-t pt-3 flex justify-between items-center">
                      <span className="font-medium">You Save</span>
                      <span className="text-2xl font-bold text-primary">R118,000</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-lg mb-8 opacity-90">
            Join thousands saving money on property transactions
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" variant="secondary">
                Create Free Account
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/browse">
              <Button size="lg" variant="outline" className="bg-transparent text-primary-foreground border-primary-foreground hover:bg-primary-foreground/10">
                Browse Properties
              </Button>
            </Link>
          </div>
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