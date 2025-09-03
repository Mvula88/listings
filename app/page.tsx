import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, Home, Users, DollarSign, Shield, CheckCircle } from "lucide-react"

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
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
      <section className="bg-gradient-to-b from-primary/10 to-background py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6">
              Buy & Sell Properties Without Agent Commissions
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Save thousands on real estate transactions. Connect directly with buyers, sellers, and trusted conveyancers. 
              Only pay R2,000 success fee when your transaction completes.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/browse">
                <Button size="lg">
                  Browse Properties
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/list">
                <Button size="lg" variant="outline">
                  List Your Property
                </Button>
              </Link>
            </div>
            <p className="mt-6 text-sm text-muted-foreground">
              Currently serving Namibia and South Africa
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How DealDirect Works</h2>
          <div className="grid md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Home className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">1. List or Browse</h3>
              <p className="text-sm text-muted-foreground">
                List your property for free or browse available properties
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">2. Connect Directly</h3>
              <p className="text-sm text-muted-foreground">
                Buyers and sellers communicate directly without agents
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">3. Choose Conveyancer</h3>
              <p className="text-sm text-muted-foreground">
                Select from verified lawyers to handle the legal work
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">4. Save Thousands</h3>
              <p className="text-sm text-muted-foreground">
                Pay only R2,000 success fee instead of 6% commission
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Savings Calculator */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>See How Much You Can Save</CardTitle>
                <CardDescription>
                  Compare traditional agent fees vs DealDirect
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Property Price</label>
                    <div className="text-3xl font-bold">R 2,000,000</div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <h4 className="font-medium text-destructive">Traditional Agent (6%)</h4>
                      <div className="text-2xl font-bold text-destructive">R 120,000</div>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        <li>• 3% buyer agent fee</li>
                        <li>• 3% seller agent fee</li>
                        <li>• Plus conveyancer fees</li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium text-primary">DealDirect</h4>
                      <div className="text-2xl font-bold text-primary">R 2,000</div>
                      <ul className="space-y-1 text-sm">
                        <li className="flex items-center gap-1">
                          <CheckCircle className="h-4 w-4 text-primary" />
                          R1,000 buyer success fee
                        </li>
                        <li className="flex items-center gap-1">
                          <CheckCircle className="h-4 w-4 text-primary" />
                          R1,000 seller success fee
                        </li>
                        <li className="flex items-center gap-1">
                          <CheckCircle className="h-4 w-4 text-primary" />
                          Direct conveyancer rates
                        </li>
                      </ul>
                    </div>
                  </div>
                  <div className="pt-4 border-t">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-medium">You Save:</span>
                      <span className="text-3xl font-bold text-primary">R 118,000</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose DealDirect?</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>No Hidden Fees</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Transparent pricing with a flat R2,000 success fee. No surprises, no percentage-based commissions.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Verified Lawyers</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  All conveyancers are verified professionals with transparent flat-rate pricing.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Direct Communication</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Connect directly with buyers and sellers. No middleman delays or miscommunication.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Save on Your Next Property?</h2>
          <p className="text-lg mb-8 opacity-90">
            Join thousands who are buying and selling smarter with DealDirect
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" variant="secondary">
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/how-it-works">
              <Button size="lg" variant="outline" className="bg-transparent text-primary-foreground border-primary-foreground hover:bg-primary-foreground/10">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold mb-4">DealDirect</h3>
              <p className="text-sm text-muted-foreground">
                Commission-free real estate transactions in Namibia and South Africa.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-4">For Buyers</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/browse" className="hover:text-primary">Browse Properties</Link></li>
                <li><Link href="/how-it-works" className="hover:text-primary">How It Works</Link></li>
                <li><Link href="/lawyers" className="hover:text-primary">Find Lawyers</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-4">For Sellers</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/list" className="hover:text-primary">List Property</Link></li>
                <li><Link href="/pricing" className="hover:text-primary">Pricing</Link></li>
                <li><Link href="/faq" className="hover:text-primary">FAQ</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/about" className="hover:text-primary">About Us</Link></li>
                <li><Link href="/contact" className="hover:text-primary">Contact</Link></li>
                <li><Link href="/terms" className="hover:text-primary">Terms & Privacy</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
            © 2024 DealDirect. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}