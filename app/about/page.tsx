import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Eye, Sliders, ShieldCheck, Home, Users, Scale, Briefcase, Globe, Heart, ArrowRight } from "lucide-react"

export default function AboutPage() {
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
      <section className="bg-gradient-to-b from-primary/10 to-background py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">About Us – Proplinka</h1>
            <p className="text-xl text-primary font-semibold mb-4">
              We're not another property platform.
            </p>
            <p className="text-lg text-muted-foreground">
              Proplinka was built to fix a broken system.
            </p>
          </div>
        </div>
      </section>

      {/* Problem Statement */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <p className="text-lg text-muted-foreground leading-relaxed">
              For too long, property owners have been forced into expensive agent contracts just to sell their own homes —
              losing control, transparency, and large portions of their equity to commissions they didn't choose.
            </p>
            <p className="text-xl font-semibold mt-6 text-foreground">
              We built Proplinka so owners could sell directly, safely, and legally.
            </p>
          </div>
        </div>
      </section>

      {/* Our Mission */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-6 text-center">Our Mission</h2>
            <p className="text-lg text-muted-foreground text-center mb-12">
              Our mission is simple: Give property owners full control of their sale while making the legal process seamless and trustworthy.
            </p>

            <p className="text-center text-muted-foreground mb-8">
              We connect three powerful pieces of the property puzzle in one place:
            </p>

            <div className="grid md:grid-cols-3 gap-6">
              <Card className="text-center">
                <CardContent className="p-6">
                  <Home className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="text-lg font-semibold">Verified Property Owners</h3>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="p-6">
                  <Users className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="text-lg font-semibold">Serious, Real Buyers</h3>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="p-6">
                  <Scale className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="text-lg font-semibold">Qualified Property Lawyers</h3>
                </CardContent>
              </Card>
            </div>

            <div className="mt-12 text-center">
              <p className="text-lg font-medium text-foreground">No middlemen. No pressure. No hidden fees.</p>
              <p className="text-xl font-bold text-primary mt-2">Just clarity, protection, and control.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why We Exist */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center">Why We Exist</h2>

            <p className="text-lg text-muted-foreground text-center mb-8">We saw the problem firsthand:</p>

            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <div className="bg-red-50 dark:bg-red-950/20 rounded-lg p-6 border border-red-200 dark:border-red-900">
                <p className="text-muted-foreground">
                  Owners were <span className="font-semibold text-foreground">afraid to sell alone</span> because of legal risk.
                </p>
              </div>
              <div className="bg-red-50 dark:bg-red-950/20 rounded-lg p-6 border border-red-200 dark:border-red-900">
                <p className="text-muted-foreground">
                  Lawyers were <span className="font-semibold text-foreground">disconnected</span> from real buyers and sellers.
                </p>
              </div>
              <div className="bg-red-50 dark:bg-red-950/20 rounded-lg p-6 border border-red-200 dark:border-red-900">
                <p className="text-muted-foreground">
                  Buyers were <span className="font-semibold text-foreground">stuck behind gatekeeping</span> and unclear processes.
                </p>
              </div>
            </div>

            <p className="text-lg text-muted-foreground text-center mb-8">So we built a platform where:</p>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-6 border border-green-200 dark:border-green-900 text-center">
                <p className="font-semibold text-foreground">Owners list freely</p>
              </div>
              <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-6 border border-green-200 dark:border-green-900 text-center">
                <p className="font-semibold text-foreground">Buyers connect directly</p>
              </div>
              <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-6 border border-green-200 dark:border-green-900 text-center">
                <p className="font-semibold text-foreground">Lawyers protect every deal</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What Makes Us Different */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center">What Makes Us Different</h2>

            <div className="bg-background rounded-xl p-8 shadow-lg border mb-8">
              <p className="text-lg text-muted-foreground mb-4">
                <span className="font-bold text-foreground">Proplinka is not an estate agency.</span>
              </p>
              <p className="text-muted-foreground mb-2">We don't take control of your property.</p>
              <p className="text-muted-foreground mb-4">We don't lock you into contracts.</p>
              <p className="text-xl font-semibold text-primary">
                We are a legal-first property technology platform.
              </p>
            </div>

            <p className="text-center text-muted-foreground mb-6">Every deal is designed to be:</p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <Eye className="h-8 w-8 text-primary mx-auto mb-2" />
                  <p className="font-medium">Transparent</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <ShieldCheck className="h-8 w-8 text-primary mx-auto mb-2" />
                  <p className="font-medium">Secure</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <Scale className="h-8 w-8 text-primary mx-auto mb-2" />
                  <p className="font-medium">Lawyer-backed</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <Sliders className="h-8 w-8 text-primary mx-auto mb-2" />
                  <p className="font-medium">Digitally tracked</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-4">Our Values</h2>
            <p className="text-center text-muted-foreground mb-12">At the core of Proplinka are three principles:</p>

            <div className="grid md:grid-cols-3 gap-8">
              <Card className="border-2 hover:border-primary/50 transition-colors">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                    <Eye className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Clarity</h3>
                  <p className="text-muted-foreground">
                    Everything is visible, structured, and honest
                  </p>
                </CardContent>
              </Card>
              <Card className="border-2 hover:border-primary/50 transition-colors">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                    <Sliders className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Control</h3>
                  <p className="text-muted-foreground">
                    Owners stay in charge of their price, timeline, and decision
                  </p>
                </CardContent>
              </Card>
              <Card className="border-2 hover:border-primary/50 transition-colors">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                    <ShieldCheck className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Trust</h3>
                  <p className="text-muted-foreground">
                    Lawyers handle what matters most: your legal protection
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* For Lawyers */}
      <section className="py-16 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/20 dark:to-emerald-900/20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <Briefcase className="h-16 w-16 text-emerald-600 mx-auto mb-6" />
            <h2 className="text-3xl font-bold mb-4">For Lawyers</h2>
            <p className="text-lg text-muted-foreground mb-6">
              We give property lawyers a better system:
            </p>
            <p className="text-lg text-foreground">
              Rather than chasing clients, you receive real, ready property transactions through a clean,
              professional platform — so you can focus on what you do best: <span className="font-semibold text-emerald-600">protecting people and closing deals</span>.
            </p>
          </div>
        </div>
      </section>

      {/* For the Future */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <Globe className="h-16 w-16 text-primary mx-auto mb-6" />
              <h2 className="text-3xl font-bold mb-4">For the Future</h2>
              <p className="text-lg text-muted-foreground">
                Proplinka is not just about selling houses. We are building the infrastructure for
                <span className="font-semibold text-foreground"> trust-based property ownership in Africa and beyond</span>.
              </p>
            </div>

            <p className="text-center text-muted-foreground mb-8">Our vision is a future where:</p>

            <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto">
              <div className="flex items-center gap-3 bg-muted/50 rounded-lg p-4">
                <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                <p className="text-foreground">Selling property is not stressful</p>
              </div>
              <div className="flex items-center gap-3 bg-muted/50 rounded-lg p-4">
                <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                <p className="text-foreground">Lawyers are easily accessible</p>
              </div>
              <div className="flex items-center gap-3 bg-muted/50 rounded-lg p-4">
                <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                <p className="text-foreground">Property deals are transparent</p>
              </div>
              <div className="flex items-center gap-3 bg-muted/50 rounded-lg p-4">
                <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                <p className="text-foreground">Everyone has equal access to safe property transactions</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Built for Real People */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <Heart className="h-16 w-16 text-primary mx-auto mb-6" />
            <h2 className="text-3xl font-bold mb-6">Built for Real People</h2>
            <p className="text-lg text-muted-foreground mb-6">
              Proplinka was built by people who understand property, law, and technology — and who believe that
              <span className="font-semibold text-foreground"> ownership should empower people, not punish them</span>.
            </p>
            <p className="text-xl font-semibold text-primary">
              If you believe property ownership should be simpler, safer, and fairer — you belong here.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Take Control?</h2>
          <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
            Join Proplinka and experience property transactions the way they should be — transparent, secure, and in your hands.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/register">
              <Button size="lg" className="bg-white text-blue-700 hover:bg-blue-50">
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="bg-transparent text-white border-white hover:bg-white/10">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © 2025 PropLinka. All rights reserved.
        </div>
      </footer>
    </div>
  )
}
