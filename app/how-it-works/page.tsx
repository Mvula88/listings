import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { FadeIn } from "@/components/ui/fade-in"
import { ScrollToTop } from "@/components/ui/scroll-to-top"
import { AnimatedStepsSection } from "@/components/how-it-works/animated-steps"
import { AuthHeaderServer } from "@/components/layout/auth-header-server"
import {
  ArrowRight,
  MessageSquare,
  FileCheck,
  CheckCircle,
  Shield,
  Search,
  UserPlus,
  TrendingDown,
  Sparkles
} from "lucide-react"

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen">
      <AuthHeaderServer />

      {/* Hero Section with Background Image - Matching Landing Page Style */}
      <section className="relative min-h-[400px] md:min-h-[500px] flex items-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="/how-it-works-bg.jpg"
            alt="Property transaction"
            fill
            className="object-cover"
            priority
          />
          {/* Glass effect overlay */}
          <div className="absolute inset-0 backdrop-blur-[2px] bg-gradient-to-b from-black/70 via-black/60 to-black/40" />
          {/* Additional glass shine effect */}
          <div className="absolute inset-0 bg-gradient-to-tr from-white/5 via-transparent to-white/10" />
        </div>

        <div className="container mx-auto px-4 relative z-10 py-16">
          <FadeIn>
            <div className="max-w-4xl mx-auto text-center">
              {/* Premium badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-xl rounded-full border border-white/20 shadow-2xl mb-8">
                <Sparkles className="h-4 w-4 text-emerald-400 animate-pulse" />
                <span className="text-sm font-semibold text-white tracking-wide">Simple & Transparent Process</span>
              </div>

              {/* Main headline */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 font-[family-name:var(--font-poppins)]">
                How <span className="bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">PropLinka</span> Works
              </h1>

              {/* Subheadline */}
              <p className="text-xl md:text-2xl text-white/80 max-w-3xl mx-auto mb-8 font-[family-name:var(--font-poppins)]">
                Four simple steps to save <span className="text-emerald-400 font-semibold">thousands</span> on your property transaction
              </p>

              {/* Value props */}
              <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 text-sm text-white">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
                  No Agent Commissions
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 text-sm text-white">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
                  No Hidden Fees
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 text-sm text-white">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
                  100% Transparent
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Animated Steps Section */}
      <AnimatedStepsSection />

      {/* Detailed Process Steps */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <FadeIn>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Detailed Process</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Everything you need to know about using PropLinka
              </p>
            </div>
          </FadeIn>

          <div className="max-w-5xl mx-auto space-y-12">
            {/* Step 1 - Detailed */}
            <FadeIn delay={0.1}>
              <Card className="overflow-hidden border-2 hover:border-primary/30 transition-colors">
                <div className="md:flex">
                  <div className="md:w-1/3 bg-gradient-to-br from-primary/10 to-primary/5 p-8 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-20 h-20 bg-gradient-to-br from-primary via-primary/90 to-primary/80 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-primary/25 mb-4">
                        <UserPlus className="h-10 w-10 text-primary-foreground" />
                      </div>
                      <span className="text-6xl font-bold text-primary/20">01</span>
                    </div>
                  </div>
                  <CardContent className="md:w-2/3 p-8">
                    <h3 className="text-2xl font-bold mb-3">Create Your Free Account</h3>
                    <p className="text-muted-foreground mb-6 text-lg">
                      Sign up as a buyer, seller, or lawyer. It's completely free to join and browse properties.
                    </p>
                    <div className="grid sm:grid-cols-3 gap-4">
                      <div className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-semibold">Buyers</p>
                          <p className="text-sm text-muted-foreground">Browse and contact sellers</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-semibold">Sellers</p>
                          <p className="text-sm text-muted-foreground">List properties for free</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-semibold">Lawyers</p>
                          <p className="text-sm text-muted-foreground">Offer conveyancing</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </div>
              </Card>
            </FadeIn>

            {/* Step 2 - Detailed */}
            <FadeIn delay={0.2}>
              <Card className="overflow-hidden border-2 hover:border-primary/30 transition-colors">
                <div className="md:flex md:flex-row-reverse">
                  <div className="md:w-1/3 bg-gradient-to-br from-blue-500/10 to-blue-500/5 p-8 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-20 h-20 bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-blue-500/25 mb-4">
                        <Search className="h-10 w-10 text-white" />
                      </div>
                      <span className="text-6xl font-bold text-blue-500/20">02</span>
                    </div>
                  </div>
                  <CardContent className="md:w-2/3 p-8">
                    <h3 className="text-2xl font-bold mb-3">List or Search Properties</h3>
                    <p className="text-muted-foreground mb-6 text-lg">
                      Sellers can list properties with photos and details. Buyers can search and filter to find their perfect property.
                    </p>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-blue-500 mt-0.5" />
                        <div>
                          <p className="font-medium">Unlimited Photos</p>
                          <p className="text-sm text-muted-foreground">Upload as many as needed</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-blue-500 mt-0.5" />
                        <div>
                          <p className="font-medium">Virtual Tours</p>
                          <p className="text-sm text-muted-foreground">Add video and 360° tours</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-blue-500 mt-0.5" />
                        <div>
                          <p className="font-medium">Direct Contact</p>
                          <p className="text-sm text-muted-foreground">No middleman delays</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-blue-500 mt-0.5" />
                        <div>
                          <p className="font-medium">No Time Limits</p>
                          <p className="text-sm text-muted-foreground">List as long as needed</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </div>
              </Card>
            </FadeIn>

            {/* Step 3 - Detailed */}
            <FadeIn delay={0.3}>
              <Card className="overflow-hidden border-2 hover:border-primary/30 transition-colors">
                <div className="md:flex">
                  <div className="md:w-1/3 bg-gradient-to-br from-purple-500/10 to-purple-500/5 p-8 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-20 h-20 bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-purple-500/25 mb-4">
                        <MessageSquare className="h-10 w-10 text-white" />
                      </div>
                      <span className="text-6xl font-bold text-purple-500/20">03</span>
                    </div>
                  </div>
                  <CardContent className="md:w-2/3 p-8">
                    <h3 className="text-2xl font-bold mb-3">Connect Directly</h3>
                    <p className="text-muted-foreground mb-6 text-lg">
                      Buyers and sellers communicate directly through our messaging system. No agents means no delays.
                    </p>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <Card className="bg-muted/50">
                        <CardContent className="p-4">
                          <MessageSquare className="h-8 w-8 text-purple-500 mb-2" />
                          <h4 className="font-semibold mb-1">Direct Messaging</h4>
                          <p className="text-sm text-muted-foreground">Real-time chat without intermediaries</p>
                        </CardContent>
                      </Card>
                      <Card className="bg-muted/50">
                        <CardContent className="p-4">
                          <FileCheck className="h-8 w-8 text-purple-500 mb-2" />
                          <h4 className="font-semibold mb-1">Document Sharing</h4>
                          <p className="text-sm text-muted-foreground">Share documents securely</p>
                        </CardContent>
                      </Card>
                    </div>
                  </CardContent>
                </div>
              </Card>
            </FadeIn>

            {/* Step 4 - Detailed */}
            <FadeIn delay={0.4}>
              <Card className="overflow-hidden border-2 hover:border-emerald-500/30 transition-colors">
                <div className="md:flex md:flex-row-reverse">
                  <div className="md:w-1/3 bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 p-8 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/25 mb-4">
                        <Shield className="h-10 w-10 text-white" />
                      </div>
                      <span className="text-6xl font-bold text-emerald-500/20">04</span>
                    </div>
                  </div>
                  <CardContent className="md:w-2/3 p-8">
                    <h3 className="text-2xl font-bold mb-3">Choose a Conveyancer</h3>
                    <p className="text-muted-foreground mb-6 text-lg">
                      Select from our verified lawyers to handle the legal work. All lawyers have transparent, flat-rate pricing.
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-emerald-500" />
                        <span>Property title searches and verification</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-emerald-500" />
                        <span>Contract drafting and legal review</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-emerald-500" />
                        <span>Transfer documentation preparation</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-emerald-500" />
                        <span>Settlement and closing coordination</span>
                      </div>
                    </div>
                  </CardContent>
                </div>
              </Card>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Cost Savings Section */}
      <section className="py-20 bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5">
        <div className="container mx-auto px-4">
          <FadeIn>
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <div className="inline-flex items-center justify-center px-4 py-2 bg-primary/10 rounded-full mb-6">
                  <TrendingDown className="h-4 w-4 text-primary mr-2" />
                  <span className="text-sm font-medium text-primary">Save Big</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold mb-4">See How Much You'll Save</h2>
                <p className="text-lg text-muted-foreground">
                  Compare PropLinka fees vs traditional agent commissions
                </p>
              </div>

              <Card className="bg-background/80 backdrop-blur border-2 shadow-2xl">
                <CardContent className="p-8">
                  <h3 className="font-bold mb-6 text-xl text-center">Cost Comparison (R2M Property)</h3>
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
                        <p className="font-medium">PropLinka Platform Fee</p>
                        <p className="text-sm text-muted-foreground">Tiered fee - seller only</p>
                      </div>
                      <span className="text-2xl font-bold text-primary">R10,000</span>
                    </div>
                    <div className="bg-gradient-to-r from-primary/20 to-emerald-500/20 rounded-lg p-6 flex justify-between items-center">
                      <div>
                        <p className="font-bold text-xl">Total Savings</p>
                        <p className="text-sm text-muted-foreground">That's 92% less in fees!</p>
                      </div>
                      <span className="text-4xl font-bold text-primary">R110,000</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-10" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

        <div className="container mx-auto px-4 text-center relative z-10">
          <FadeIn>
            <div className="max-w-3xl mx-auto">
              <div className="inline-flex items-center justify-center px-4 py-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full mb-8">
                <Sparkles className="h-4 w-4 mr-2" />
                <span className="text-sm font-medium">Get Started Today</span>
              </div>

              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Ready to Save{' '}
                <span className="bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-400 bg-clip-text text-transparent">
                  Thousands?
                </span>
              </h2>

              <p className="text-xl opacity-90 mb-10 max-w-2xl mx-auto">
                Join thousands of successful buyers and sellers who have saved money on property transactions
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/register">
                  <Button size="lg" className="bg-white text-blue-700 hover:bg-blue-50 shadow-2xl">
                    Create Free Account
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/browse">
                  <Button size="lg" variant="outline" className="bg-transparent text-white border-2 border-white/40 hover:bg-white hover:text-blue-700">
                    Browse Properties
                  </Button>
                </Link>
              </div>
            </div>
          </FadeIn>

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
                <div className="text-3xl font-bold mb-1">92%</div>
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
              <Link href="/" className="inline-block mb-2">
                <Image
                  src="/logo.png"
                  alt="PropLinka"
                  width={140}
                  height={40}
                  className="h-8 w-auto"
                />
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
            © 2025 PropLinka. All rights reserved.
          </div>
        </div>
      </footer>

      {/* Scroll to Top Button */}
      <ScrollToTop />
    </div>
  )
}
