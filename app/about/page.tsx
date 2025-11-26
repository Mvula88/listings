import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Eye, Sliders, ShieldCheck, Home, Users, Scale, Briefcase, Globe, Heart, ArrowRight, Sparkles, CheckCircle } from "lucide-react"
import { PageHeader } from "@/components/layout/page-header"
import { PageFooter } from "@/components/layout/page-footer"
import { FadeIn } from "@/components/ui/fade-in"
import { AboutAnimation } from "@/components/about/about-animation"

export default function AboutPage() {
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
            <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1 text-center md:text-left">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6">
                  <Heart className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-primary">Our Story</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold mb-4 font-[family-name:var(--font-poppins)]">
                  About <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">PropLinka</span>
                </h1>
                <p className="text-xl text-primary font-semibold mb-4">
                  We're not another property platform.
                </p>
                <p className="text-lg text-muted-foreground">
                  PropLinka was built to fix a broken system.
                </p>
              </div>
              <div className="flex-shrink-0">
                <AboutAnimation />
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Problem Statement */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <FadeIn>
            <div className="max-w-3xl mx-auto">
              <p className="text-lg text-muted-foreground leading-relaxed">
                For too long, property owners have been forced into expensive agent contracts just to sell their own homes —
                losing control, transparency, and large portions of their equity to commissions they didn't choose.
              </p>
              <p className="text-xl font-semibold mt-6 text-foreground">
                We built PropLinka so owners could sell directly, safely, and legally.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Our Mission */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <FadeIn>
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-4">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-primary">Our Mission</span>
                </div>
                <h2 className="text-3xl font-bold mb-4">What We're Building</h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Our mission is simple: Give property owners full control of their sale while making the legal process seamless and trustworthy.
                </p>
              </div>

              <p className="text-center text-muted-foreground mb-8">
                We connect three powerful pieces of the property puzzle in one place:
              </p>

              <div className="grid md:grid-cols-3 gap-6">
                <Card className="text-center border-2 hover:border-primary/30 transition-all hover:shadow-lg">
                  <CardContent className="p-6">
                    <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Home className="h-7 w-7 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold">Verified Property Owners</h3>
                  </CardContent>
                </Card>
                <Card className="text-center border-2 hover:border-primary/30 transition-all hover:shadow-lg">
                  <CardContent className="p-6">
                    <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Users className="h-7 w-7 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold">Serious, Real Buyers</h3>
                  </CardContent>
                </Card>
                <Card className="text-center border-2 hover:border-primary/30 transition-all hover:shadow-lg">
                  <CardContent className="p-6">
                    <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Scale className="h-7 w-7 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold">Qualified Property Lawyers</h3>
                  </CardContent>
                </Card>
              </div>

              <div className="mt-12 text-center">
                <p className="text-lg font-medium text-foreground">No middlemen. No pressure. No hidden fees.</p>
                <p className="text-xl font-bold text-primary mt-2">Just clarity, protection, and control.</p>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Why We Exist */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <FadeIn>
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold mb-8 text-center">Why We Exist</h2>

              <p className="text-lg text-muted-foreground text-center mb-8">We saw the problem firsthand:</p>

              <div className="grid md:grid-cols-3 gap-6 mb-12">
                <div className="bg-red-50 dark:bg-red-950/20 rounded-xl p-6 border-2 border-red-200 dark:border-red-900">
                  <p className="text-muted-foreground">
                    Owners were <span className="font-semibold text-foreground">afraid to sell alone</span> because of legal risk.
                  </p>
                </div>
                <div className="bg-red-50 dark:bg-red-950/20 rounded-xl p-6 border-2 border-red-200 dark:border-red-900">
                  <p className="text-muted-foreground">
                    Lawyers were <span className="font-semibold text-foreground">disconnected</span> from real buyers and sellers.
                  </p>
                </div>
                <div className="bg-red-50 dark:bg-red-950/20 rounded-xl p-6 border-2 border-red-200 dark:border-red-900">
                  <p className="text-muted-foreground">
                    Buyers were <span className="font-semibold text-foreground">stuck behind gatekeeping</span> and unclear processes.
                  </p>
                </div>
              </div>

              <p className="text-lg text-muted-foreground text-center mb-8">So we built a platform where:</p>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-green-50 dark:bg-green-950/20 rounded-xl p-6 border-2 border-green-200 dark:border-green-900 text-center">
                  <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-3" />
                  <p className="font-semibold text-foreground">Owners list freely</p>
                </div>
                <div className="bg-green-50 dark:bg-green-950/20 rounded-xl p-6 border-2 border-green-200 dark:border-green-900 text-center">
                  <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-3" />
                  <p className="font-semibold text-foreground">Buyers connect directly</p>
                </div>
                <div className="bg-green-50 dark:bg-green-950/20 rounded-xl p-6 border-2 border-green-200 dark:border-green-900 text-center">
                  <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-3" />
                  <p className="font-semibold text-foreground">Lawyers protect every deal</p>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* What Makes Us Different */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <FadeIn>
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold mb-8 text-center">What Makes Us Different</h2>

              <Card className="border-2 shadow-lg mb-8">
                <CardContent className="p-8">
                  <p className="text-lg text-muted-foreground mb-4">
                    <span className="font-bold text-foreground">PropLinka is not an estate agency.</span>
                  </p>
                  <p className="text-muted-foreground mb-2">We don't take control of your property.</p>
                  <p className="text-muted-foreground mb-4">We don't lock you into contracts.</p>
                  <p className="text-xl font-semibold text-primary">
                    We are a legal-first property technology platform.
                  </p>
                </CardContent>
              </Card>

              <p className="text-center text-muted-foreground mb-6">Every deal is designed to be:</p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="border-2 hover:border-primary/30 transition-all hover:shadow-lg">
                  <CardContent className="p-4 text-center">
                    <Eye className="h-8 w-8 text-primary mx-auto mb-2" />
                    <p className="font-medium">Transparent</p>
                  </CardContent>
                </Card>
                <Card className="border-2 hover:border-primary/30 transition-all hover:shadow-lg">
                  <CardContent className="p-4 text-center">
                    <ShieldCheck className="h-8 w-8 text-primary mx-auto mb-2" />
                    <p className="font-medium">Secure</p>
                  </CardContent>
                </Card>
                <Card className="border-2 hover:border-primary/30 transition-all hover:shadow-lg">
                  <CardContent className="p-4 text-center">
                    <Scale className="h-8 w-8 text-primary mx-auto mb-2" />
                    <p className="font-medium">Lawyer-backed</p>
                  </CardContent>
                </Card>
                <Card className="border-2 hover:border-primary/30 transition-all hover:shadow-lg">
                  <CardContent className="p-4 text-center">
                    <Sliders className="h-8 w-8 text-primary mx-auto mb-2" />
                    <p className="font-medium">Digitally tracked</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <FadeIn>
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4">Our Values</h2>
                <p className="text-muted-foreground">At the core of PropLinka are three principles:</p>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                <Card className="border-2 hover:border-primary/50 transition-all hover:shadow-xl">
                  <CardContent className="p-6">
                    <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
                      <Eye className="h-7 w-7 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Clarity</h3>
                    <p className="text-muted-foreground">
                      Everything is visible, structured, and honest
                    </p>
                  </CardContent>
                </Card>
                <Card className="border-2 hover:border-primary/50 transition-all hover:shadow-xl">
                  <CardContent className="p-6">
                    <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
                      <Sliders className="h-7 w-7 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Control</h3>
                    <p className="text-muted-foreground">
                      Owners stay in charge of their price, timeline, and decision
                    </p>
                  </CardContent>
                </Card>
                <Card className="border-2 hover:border-primary/50 transition-all hover:shadow-xl">
                  <CardContent className="p-6">
                    <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
                      <ShieldCheck className="h-7 w-7 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Trust</h3>
                    <p className="text-muted-foreground">
                      Lawyers handle what matters most: your legal protection
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* For Lawyers */}
      <section className="py-16 bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-background">
        <div className="container mx-auto px-4">
          <FadeIn>
            <div className="max-w-3xl mx-auto text-center">
              <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Briefcase className="h-8 w-8 text-emerald-600" />
              </div>
              <h2 className="text-3xl font-bold mb-4">For Lawyers</h2>
              <p className="text-lg text-muted-foreground mb-6">
                We give property lawyers a better system:
              </p>
              <p className="text-lg text-foreground">
                Rather than chasing clients, you receive real, ready property transactions through a clean,
                professional platform — so you can focus on what you do best: <span className="font-semibold text-emerald-600">protecting people and closing deals</span>.
              </p>
              <div className="mt-8">
                <Link href="/lawyers/onboarding">
                  <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700">
                    Join as a Conveyancer
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* For the Future */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <FadeIn>
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Globe className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-3xl font-bold mb-4">For the Future</h2>
                <p className="text-lg text-muted-foreground">
                  PropLinka is not just about selling houses. We are building the infrastructure for
                  <span className="font-semibold text-foreground"> trust-based property ownership in Africa and beyond</span>.
                </p>
              </div>

              <p className="text-center text-muted-foreground mb-8">Our vision is a future where:</p>

              <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                <div className="flex items-center gap-3 bg-muted/50 rounded-xl p-4 border-2">
                  <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                  <p className="text-foreground">Selling property is not stressful</p>
                </div>
                <div className="flex items-center gap-3 bg-muted/50 rounded-xl p-4 border-2">
                  <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                  <p className="text-foreground">Lawyers are easily accessible</p>
                </div>
                <div className="flex items-center gap-3 bg-muted/50 rounded-xl p-4 border-2">
                  <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                  <p className="text-foreground">Property deals are transparent</p>
                </div>
                <div className="flex items-center gap-3 bg-muted/50 rounded-xl p-4 border-2">
                  <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                  <p className="text-foreground">Everyone has equal access to safe property transactions</p>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Built for Real People */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <FadeIn>
            <div className="max-w-3xl mx-auto text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Heart className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-3xl font-bold mb-6">Built for Real People</h2>
              <p className="text-lg text-muted-foreground mb-6">
                PropLinka was built by people who understand property, law, and technology — and who believe that
                <span className="font-semibold text-foreground"> ownership should empower people, not punish them</span>.
              </p>
              <p className="text-xl font-semibold text-primary">
                If you believe property ownership should be simpler, safer, and fairer — you belong here.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <FadeIn>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full mb-6">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-medium">Join Us</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Take Control?</h2>
            <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
              Join PropLinka and experience property transactions the way they should be — transparent, secure, and in your hands.
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
          </FadeIn>
        </div>
      </section>

      <PageFooter />
    </div>
  )
}
