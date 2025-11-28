import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Star, Briefcase, CheckCircle, Shield, Scale, ArrowRight } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { formatPrice } from "@/lib/utils/format"
import { AuthHeaderServer } from "@/components/layout/auth-header-server"
import { PageFooter } from "@/components/layout/page-footer"
import { FadeIn } from "@/components/ui/fade-in"
import { ScrollToTop } from "@/components/ui/scroll-to-top"
import { LawyersHeroAnimation } from "@/components/lawyers/lawyers-hero-animation"

export default async function LawyersPage() {
  const supabase = await createClient()

  // Get verified lawyers with their profiles
  const { data: lawyers } = await supabase
    .from('lawyers')
    .select(`
      *,
      profile:profiles!profile_id (
        full_name,
        avatar_url
      ),
      country:countries (
        name,
        currency,
        currency_symbol
      )
    `)
    .eq('verified', true)
    .eq('available', true)
    .order('rating', { ascending: false })
    .limit(20)

  return (
    <div className="min-h-screen flex flex-col">
      <AuthHeaderServer />

      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-background overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]" />
        <div className="absolute top-10 right-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />

        <div className="container mx-auto px-4 relative z-10">
          <FadeIn>
            <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1 text-center md:text-left">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 rounded-full mb-6">
                  <Scale className="h-4 w-4 text-emerald-600" />
                  <span className="text-sm font-medium text-emerald-600">Trusted Legal Professionals</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold mb-4 font-[family-name:var(--font-poppins)]">
                  Verified <span className="bg-gradient-to-r from-emerald-500 to-emerald-700 bg-clip-text text-transparent">Conveyancing Lawyers</span>
                </h1>
                <p className="text-lg text-muted-foreground mb-8">
                  All lawyers are verified professionals with transparent flat-rate pricing. No hidden fees.
                </p>
                <Link href="/lawyers/onboarding">
                  <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700">
                    <Briefcase className="mr-2 h-5 w-5" />
                    Join as a Conveyancer
                  </Button>
                </Link>
              </div>
              <div className="flex-shrink-0">
                <LawyersHeroAnimation />
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Why Use PropLinka Lawyers */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <FadeIn>
            <div className="max-w-5xl mx-auto">
              <h2 className="text-2xl font-bold mb-8 text-center">Why Use PropLinka Lawyers?</h2>
              <div className="grid md:grid-cols-3 gap-6">
                <Card className="text-center border-2 hover:border-emerald-500/30 transition-colors">
                  <CardContent className="p-6">
                    <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="h-7 w-7 text-emerald-600" />
                    </div>
                    <h3 className="font-semibold mb-2">Verified Professionals</h3>
                    <p className="text-sm text-muted-foreground">
                      All lawyers are verified with valid practicing certificates
                    </p>
                  </CardContent>
                </Card>
                <Card className="text-center border-2 hover:border-emerald-500/30 transition-colors">
                  <CardContent className="p-6">
                    <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <span className="text-emerald-600 font-bold text-xl">R</span>
                    </div>
                    <h3 className="font-semibold mb-2">Transparent Pricing</h3>
                    <p className="text-sm text-muted-foreground">
                      Flat-rate fees with no hidden costs or surprises
                    </p>
                  </CardContent>
                </Card>
                <Card className="text-center border-2 hover:border-emerald-500/30 transition-colors">
                  <CardContent className="p-6">
                    <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Star className="h-7 w-7 text-emerald-600" />
                    </div>
                    <h3 className="font-semibold mb-2">Client Reviews</h3>
                    <p className="text-sm text-muted-foreground">
                      Real reviews from verified clients help you choose
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Lawyers List */}
      <section className="py-16 flex-1">
        <div className="container mx-auto px-4">
          {lawyers && lawyers.length > 0 ? (
            <>
              <FadeIn>
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold">Available Lawyers</h2>
                  <p className="text-muted-foreground">{lawyers.length} lawyers found</p>
                </div>
              </FadeIn>
              <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
                {lawyers.map((lawyer: any, index: number) => {
                  const currency = lawyer.country?.currency || 'ZAR'
                  const specialization = lawyer.specializations?.[0] || 'Property Conveyancing'

                  return (
                    <FadeIn key={lawyer.id} delay={index * 0.1}>
                      <Card className="hover:shadow-xl transition-all duration-300 border-2 hover:border-emerald-500/30 overflow-hidden">
                        <CardHeader className="pb-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="flex items-center gap-2">
                                {lawyer.profile?.full_name || 'Unknown'}
                                {lawyer.verified && (
                                  <CheckCircle className="h-5 w-5 text-emerald-600" />
                                )}
                              </CardTitle>
                              <CardDescription className="mt-1">{lawyer.firm_name}</CardDescription>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center gap-1 bg-yellow-50 dark:bg-yellow-900/20 px-2 py-1 rounded-full">
                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                <span className="font-semibold">{lawyer.rating || 0}</span>
                                <span className="text-xs text-muted-foreground">
                                  ({lawyer.transactions_completed || 0})
                                </span>
                              </div>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="flex items-start gap-2">
                              <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                              <span>{lawyer.city}, {lawyer.country?.name}</span>
                            </div>
                            <div className="flex items-start gap-2">
                              <Briefcase className="h-4 w-4 text-muted-foreground mt-0.5" />
                              <span>{lawyer.years_experience || 0} years</span>
                            </div>
                          </div>

                          <div className="bg-muted/50 rounded-lg p-3">
                            <div className="text-xs text-muted-foreground mb-1">Specialization</div>
                            <div className="font-medium">{specialization}</div>
                          </div>

                          <div className="flex justify-between items-center pt-4 border-t">
                            <div>
                              <div className="text-xs text-muted-foreground">Buyer Fee</div>
                              <div className="text-2xl font-bold text-emerald-600">
                                {formatPrice(lawyer.flat_fee_buyer, currency)}
                              </div>
                            </div>
                            <Button className="bg-emerald-600 hover:bg-emerald-700">
                              View Profile
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </FadeIn>
                  )
                })}
              </div>
            </>
          ) : (
            <FadeIn>
              <div className="text-center py-16 max-w-md mx-auto">
                <Shield className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No verified lawyers available yet</h3>
                <p className="text-muted-foreground mb-6">
                  Be the first to join our network of verified property lawyers
                </p>
                <Link href="/lawyers/onboarding">
                  <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700">
                    Join as a Conveyancer
                  </Button>
                </Link>
              </div>
            </FadeIn>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-800 text-white">
        <div className="container mx-auto px-4 text-center">
          <FadeIn>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Are You a Property Lawyer?</h2>
            <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
              Join PropLinka and receive pre-qualified property deals. Set your own rates and grow your practice.
            </p>
            <Link href="/lawyers/onboarding">
              <Button size="lg" variant="secondary" className="bg-white text-emerald-700 hover:bg-emerald-50">
                Apply to Join
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </FadeIn>
        </div>
      </section>

      <PageFooter />

      {/* Scroll to Top Button */}
      <ScrollToTop />
    </div>
  )
}
