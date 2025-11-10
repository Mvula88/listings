import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { FadeIn } from "@/components/ui/fade-in"
import {
  ArrowRight,
  MessageSquare,
  FileCheck,
  CheckCircle,
  Home,
  Users,
  Shield,
  DollarSign,
  Search,
  UserPlus,
  TrendingDown,
  Sparkles
} from "lucide-react"

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="border-b backdrop-blur-xl bg-background/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-primary">
              DealDirect
            </Link>
            <div className="flex items-center gap-6">
              <Link href="/browse" className="text-sm font-medium hover:text-primary transition-colors">
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

      {/* Hero Section - Modern Design */}
      <section className="relative py-24 md:py-32 overflow-hidden bg-gradient-to-br from-black/80 via-black/70 to-primary/30">
        {/* Background decorative elements */}
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.03]" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />

        <div className="container mx-auto px-4 relative z-10">
          <FadeIn>
            <div className="max-w-4xl mx-auto text-center text-white">
              <div className="inline-flex items-center justify-center px-4 py-2 bg-white/10 backdrop-blur rounded-full mb-6">
                <Sparkles className="h-4 w-4 text-primary mr-2" />
                <span className="text-sm font-medium">Simple & Transparent Process</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                How DealDirect Works
              </h1>
              <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto">
                Four simple steps to save thousands on your property transaction. No agent commissions, no hidden fees.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Quick Steps Overview - Like Landing Page */}
      <section className="py-20 bg-gradient-to-b from-background via-muted/20 to-background relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />

        <div className="container mx-auto px-4 relative z-10">
          <FadeIn>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">Four Simple Steps</h2>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                Join thousands who have saved money on property transactions
              </p>
            </div>
          </FadeIn>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 max-w-7xl mx-auto mb-16">
            <FadeIn delay={0.1}>
              <Card className="relative group hover:shadow-2xl transition-all duration-500 border-2 hover:border-primary/50 h-full bg-background/50 backdrop-blur overflow-hidden">
                {/* Step number badge */}
                <div className="absolute -top-4 -right-4 w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-4xl font-bold text-primary/30">1</span>
                </div>

                <CardContent className="p-6 pt-8">
                  <div className="relative mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary via-primary/90 to-primary/80 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-primary/25 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                      <Home className="h-8 w-8 text-primary-foreground" />
                    </div>
                  </div>

                  <h3 className="font-bold text-xl mb-3 text-center">List or Browse</h3>
                  <p className="text-sm text-muted-foreground text-center leading-relaxed">
                    List your property for free or browse available properties across Namibia and South Africa
                  </p>
                </CardContent>

                {/* Arrow connector for desktop */}
                <div className="hidden lg:block absolute top-1/2 -right-8 transform -translate-y-1/2 z-10">
                  <ArrowRight className="h-6 w-6 text-primary/40" />
                </div>
              </Card>
            </FadeIn>

            <FadeIn delay={0.2}>
              <Card className="relative group hover:shadow-2xl transition-all duration-500 border-2 hover:border-primary/50 h-full bg-background/50 backdrop-blur overflow-hidden">
                {/* Step number badge */}
                <div className="absolute -top-4 -right-4 w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-4xl font-bold text-primary/30">2</span>
                </div>

                <CardContent className="p-6 pt-8">
                  <div className="relative mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary via-primary/90 to-primary/80 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-primary/25 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                      <Users className="h-8 w-8 text-primary-foreground" />
                    </div>
                  </div>

                  <h3 className="font-bold text-xl mb-3 text-center">Connect Directly</h3>
                  <p className="text-sm text-muted-foreground text-center leading-relaxed">
                    Buyers and sellers communicate directly through our secure messaging platform
                  </p>
                </CardContent>

                {/* Arrow connector for desktop */}
                <div className="hidden lg:block absolute top-1/2 -right-8 transform -translate-y-1/2 z-10">
                  <ArrowRight className="h-6 w-6 text-primary/40" />
                </div>
              </Card>
            </FadeIn>

            <FadeIn delay={0.3}>
              <Card className="relative group hover:shadow-2xl transition-all duration-500 border-2 hover:border-primary/50 h-full bg-background/50 backdrop-blur overflow-hidden">
                {/* Step number badge */}
                <div className="absolute -top-4 -right-4 w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-4xl font-bold text-primary/30">3</span>
                </div>

                <CardContent className="p-6 pt-8">
                  <div className="relative mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary via-primary/90 to-primary/80 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-primary/25 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                      <Shield className="h-8 w-8 text-primary-foreground" />
                    </div>
                  </div>

                  <h3 className="font-bold text-xl mb-3 text-center">Choose Conveyancer</h3>
                  <p className="text-sm text-muted-foreground text-center leading-relaxed">
                    Select from our network of verified lawyers with transparent flat-rate pricing
                  </p>
                </CardContent>

                {/* Arrow connector for desktop */}
                <div className="hidden lg:block absolute top-1/2 -right-8 transform -translate-y-1/2 z-10">
                  <ArrowRight className="h-6 w-6 text-primary/40" />
                </div>
              </Card>
            </FadeIn>

            <FadeIn delay={0.4}>
              <Card className="relative group hover:shadow-2xl transition-all duration-500 border-2 hover:border-primary/50 h-full bg-background/50 backdrop-blur overflow-hidden">
                {/* Step number badge */}
                <div className="absolute -top-4 -right-4 w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-4xl font-bold text-primary/30">4</span>
                </div>

                <CardContent className="p-6 pt-8">
                  <div className="relative mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-500 via-green-600 to-green-700 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-green-500/25 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                      <DollarSign className="h-8 w-8 text-white" />
                    </div>
                  </div>

                  <h3 className="font-bold text-xl mb-3 text-center">Save Thousands</h3>
                  <p className="text-sm text-muted-foreground text-center leading-relaxed">
                    Pay a small platform fee at closing and save 50-70% compared to traditional agent commissions
                  </p>
                </CardContent>
              </Card>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Detailed Process Steps */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <FadeIn>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Detailed Process</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Everything you need to know about using DealDirect
              </p>
            </div>
          </FadeIn>

          <div className="max-w-5xl mx-auto space-y-16">
            {/* Step 1 - Detailed */}
            <FadeIn delay={0.1}>
              <div className="flex gap-8 items-start">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary via-primary/90 to-primary/80 rounded-2xl flex items-center justify-center shadow-lg shadow-primary/25">
                    <UserPlus className="h-8 w-8 text-primary-foreground" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-3">Create Your Free Account</h3>
                  <p className="text-muted-foreground mb-6 text-lg">
                    Sign up as a buyer, seller, or lawyer. It's completely free to join and browse properties.
                  </p>
                  <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                    <CardContent className="p-6">
                      <h4 className="font-semibold mb-4 text-lg">Account Types:</h4>
                      <div className="grid md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-primary" />
                            <span className="font-semibold">Buyers</span>
                          </div>
                          <p className="text-sm text-muted-foreground pl-7">
                            Browse and contact sellers directly
                          </p>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-primary" />
                            <span className="font-semibold">Sellers</span>
                          </div>
                          <p className="text-sm text-muted-foreground pl-7">
                            List unlimited properties for free
                          </p>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-primary" />
                            <span className="font-semibold">Lawyers</span>
                          </div>
                          <p className="text-sm text-muted-foreground pl-7">
                            Offer conveyancing services
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </FadeIn>

            {/* Step 2 - Detailed */}
            <FadeIn delay={0.2}>
              <div className="flex gap-8 items-start">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary via-primary/90 to-primary/80 rounded-2xl flex items-center justify-center shadow-lg shadow-primary/25">
                    <Search className="h-8 w-8 text-primary-foreground" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-3">List or Search Properties</h3>
                  <p className="text-muted-foreground mb-6 text-lg">
                    Sellers can list properties with photos and details. Buyers can search and filter to find their perfect property.
                  </p>
                  <Card>
                    <CardContent className="p-6">
                      <h4 className="font-semibold mb-4 text-lg">Listing Features:</h4>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="flex items-start gap-3">
                          <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                          <div>
                            <p className="font-medium">Unlimited Photos</p>
                            <p className="text-sm text-muted-foreground">Upload as many photos as you need</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                          <div>
                            <p className="font-medium">Virtual Tours</p>
                            <p className="text-sm text-muted-foreground">Add video and 360° tour links</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                          <div>
                            <p className="font-medium">Direct Contact</p>
                            <p className="text-sm text-muted-foreground">No middleman communication</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                          <div>
                            <p className="font-medium">No Time Limits</p>
                            <p className="text-sm text-muted-foreground">List as long as you need</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </FadeIn>

            {/* Step 3 - Detailed */}
            <FadeIn delay={0.3}>
              <div className="flex gap-8 items-start">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary via-primary/90 to-primary/80 rounded-2xl flex items-center justify-center shadow-lg shadow-primary/25">
                    <MessageSquare className="h-8 w-8 text-primary-foreground" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-3">Connect Directly</h3>
                  <p className="text-muted-foreground mb-6 text-lg">
                    Buyers and sellers communicate directly through our messaging system. No agents means no delays or miscommunication.
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <Card className="group hover:shadow-lg transition-all duration-300 hover:border-primary/50">
                      <CardContent className="p-6">
                        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                          <MessageSquare className="h-6 w-6 text-primary" />
                        </div>
                        <h4 className="font-semibold mb-2">Direct Messaging</h4>
                        <p className="text-sm text-muted-foreground">
                          Real-time chat with buyers or sellers without any intermediaries
                        </p>
                      </CardContent>
                    </Card>
                    <Card className="group hover:shadow-lg transition-all duration-300 hover:border-primary/50">
                      <CardContent className="p-6">
                        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                          <FileCheck className="h-6 w-6 text-primary" />
                        </div>
                        <h4 className="font-semibold mb-2">Document Sharing</h4>
                        <p className="text-sm text-muted-foreground">
                          Share property documents and information securely through the platform
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </FadeIn>

            {/* Step 4 - Detailed */}
            <FadeIn delay={0.4}>
              <div className="flex gap-8 items-start">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary via-primary/90 to-primary/80 rounded-2xl flex items-center justify-center shadow-lg shadow-primary/25">
                    <Shield className="h-8 w-8 text-primary-foreground" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-3">Choose a Conveyancer</h3>
                  <p className="text-muted-foreground mb-6 text-lg">
                    Select from our verified lawyers to handle the legal work. All lawyers have transparent, flat-rate pricing.
                  </p>
                  <Card className="border-primary/50 bg-gradient-to-br from-background to-primary/5">
                    <CardContent className="p-6">
                      <h4 className="font-semibold mb-4 text-lg">Legal Services Include:</h4>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <CheckCircle className="h-5 w-5 text-primary" />
                          <span>Property title searches and verification</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <CheckCircle className="h-5 w-5 text-primary" />
                          <span>Contract drafting and legal review</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <CheckCircle className="h-5 w-5 text-primary" />
                          <span>Transfer documentation preparation</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <CheckCircle className="h-5 w-5 text-primary" />
                          <span>Settlement and closing coordination</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <CheckCircle className="h-5 w-5 text-primary" />
                          <span>Registration with authorities</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </FadeIn>

            {/* Step 5 - Cost Savings */}
            <FadeIn delay={0.5}>
              <div className="flex gap-8 items-start">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 via-green-600 to-green-700 rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/25">
                    <TrendingDown className="h-8 w-8 text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-3">Complete Your Transaction & Save</h3>
                  <p className="text-muted-foreground mb-6 text-lg">
                    Once the sale is complete, pay only R2,000 success fee. That's it! No hidden costs or percentage commissions.
                  </p>
                  <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-background border-primary/30">
                    <CardContent className="p-8">
                      <h4 className="font-bold mb-6 text-xl text-center">Cost Comparison</h4>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center pb-4 border-b">
                          <div>
                            <p className="font-medium">Traditional Agent Commission</p>
                            <p className="text-sm text-muted-foreground">6% on R2,000,000 property</p>
                          </div>
                          <span className="text-2xl font-bold text-destructive">R120,000</span>
                        </div>
                        <div className="flex justify-between items-center pb-4 border-b">
                          <div>
                            <p className="font-medium">DealDirect Success Fee</p>
                            <p className="text-sm text-muted-foreground">Flat rate, no percentages</p>
                          </div>
                          <span className="text-2xl font-bold text-primary">R2,000</span>
                        </div>
                        <div className="bg-primary/20 rounded-lg p-4 flex justify-between items-center">
                          <div>
                            <p className="font-bold text-lg">Total Savings</p>
                            <p className="text-sm text-muted-foreground">That's 98.3% less in fees!</p>
                          </div>
                          <span className="text-3xl font-bold text-primary">R118,000</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* CTA Section - Modern Design */}
      <section className="relative py-24 overflow-hidden bg-gradient-to-br from-primary via-primary/95 to-primary/90 text-primary-foreground">
        {/* Background decorative elements */}
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.05]" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl" />

        <div className="container mx-auto px-4 relative z-10">
          <FadeIn>
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center justify-center px-4 py-2 bg-white/10 backdrop-blur rounded-full mb-6">
                <Sparkles className="h-4 w-4 mr-2" />
                <span className="text-sm font-medium">Get Started Today</span>
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
                Ready to Save Thousands?
              </h2>
              <p className="text-lg md:text-xl opacity-90 mb-10">
                Join thousands of successful buyers and sellers who have saved money on property transactions
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/register">
                  <Button size="lg" variant="secondary" className="group w-full sm:w-auto">
                    Create Free Account
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="/browse">
                  <Button
                    size="lg"
                    variant="outline"
                    className="bg-transparent text-primary-foreground border-2 border-primary-foreground hover:bg-white/10 w-full sm:w-auto"
                  >
                    Browse Properties
                  </Button>
                </Link>
              </div>
            </div>
          </FadeIn>

          {/* Trust indicators */}
          <FadeIn delay={0.2}>
            <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold mb-1">R0</div>
                <div className="text-sm opacity-80">Listing Fees</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold mb-1">24/7</div>
                <div className="text-sm opacity-80">Support</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold mb-1">1000+</div>
                <div className="text-sm opacity-80">Active Listings</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold mb-1">98%</div>
                <div className="text-sm opacity-80">Fee Savings</div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-center md:text-left">
              <Link href="/" className="text-xl font-bold text-primary inline-block mb-2">
                DealDirect
              </Link>
              <p className="text-sm text-muted-foreground">
                Save thousands on property transactions
              </p>
            </div>
            <div className="flex gap-6 text-sm">
              <Link href="/about" className="text-muted-foreground hover:text-primary transition-colors">
                About
              </Link>
              <Link href="/browse" className="text-muted-foreground hover:text-primary transition-colors">
                Browse
              </Link>
              <Link href="/how-it-works" className="text-muted-foreground hover:text-primary transition-colors">
                How It Works
              </Link>
              <Link href="/contact" className="text-muted-foreground hover:text-primary transition-colors">
                Contact
              </Link>
            </div>
          </div>
          <div className="text-center mt-8 pt-8 border-t text-sm text-muted-foreground">
            © 2024 DealDirect. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}