import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, Home, Users, DollarSign, Shield, MapPin, Bed, Bath, Square, TrendingDown, Search, CheckCircle, FileText, Upload, TrendingUp, HelpCircle } from "lucide-react"
import { getFeaturedProperties, formatPropertyPrice } from "@/lib/data/properties"
import { calculateSavings, formatSavingsDisplay } from "@/lib/utils/savings-calculator"
import { FadeIn } from "@/components/ui/fade-in"
import { SavingsSection } from "@/components/calculator/savings-section"
import { FAQSection } from "@/components/faq/faq-section"

interface MockProperty {
  id: string
  title: string
  city: string
  province: string
  price: number
  currency: string
  images: Array<{ id: string; url: string; alt_text: string; order_index: number }>
  bedrooms: number
  bathrooms: number
  square_meters: number
  property_type: string
  country: { name: string; currency_symbol: string; code?: string }
}

export default async function HomePage() {
  // Fetch real featured properties from Supabase
  const featuredListings = await getFeaturedProperties(8)

  // Fallback to mock data if no properties in database
  const mockListings: MockProperty[] = [
    {
      id: '1',
      title: "Modern Family Home in Windhoek",
      city: "Windhoek",
      province: "Khomas",
      price: 2850000,
      currency: 'NAD',
      images: [{ id: '1', url: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&h=600&fit=crop", alt_text: "Modern home", order_index: 0 }],
      bedrooms: 4,
      bathrooms: 3,
      square_meters: 280,
      property_type: "house",
      country: { name: "Namibia", currency_symbol: "N$", code: 'NA' }
    },
    {
      id: '2',
      title: "Luxury Apartment with Ocean Views",
      city: "Cape Town",
      province: "Western Cape",
      price: 4500000,
      currency: 'ZAR',
      images: [{ id: '2', url: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop", alt_text: "Apartment", order_index: 0 }],
      bedrooms: 3,
      bathrooms: 2,
      square_meters: 180,
      property_type: "apartment",
      country: { name: "South Africa", currency_symbol: "R", code: 'ZA' }
    }
  ]

  const displayListings = featuredListings.length > 0 ? featuredListings : mockListings

  return (
    <div className="flex flex-col min-h-screen">
      {/* Sticky Navigation */}
      <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
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
            <div className="hidden md:flex items-center gap-6">
              <Link href="/browse" className="text-sm font-medium hover:text-primary transition-colors">
                Browse Properties
              </Link>
              <Link href="/how-it-works" className="text-sm font-medium hover:text-primary transition-colors">
                How It Works
              </Link>
              <Link href="/login">
                <Button variant="outline" size="sm" className="transition-transform hover:scale-105">Login</Button>
              </Link>
              <Link href="/register">
                <Button size="sm" className="transition-transform hover:scale-105">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - Find Your Dream Property */}
      <section className="relative min-h-[280px] md:min-h-[320px] overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="/hero-bg.jpg"
            alt="Modern luxury home"
            fill
            className="object-cover"
            priority
          />
          {/* Glass effect overlay */}
          <div className="absolute inset-0 backdrop-blur-[2px] bg-gradient-to-b from-black/70 via-black/60 to-black/40" />
          {/* Additional glass shine effect */}
          <div className="absolute inset-0 bg-gradient-to-tr from-white/5 via-transparent to-white/10" />
        </div>

        <div className="container mx-auto px-4 relative z-10 pt-12 md:pt-14 pb-8">
          <div className="max-w-4xl mx-auto">
            {/* Main Headline */}
            <FadeIn direction="down" duration={0.8}>
              <div className="flex justify-center mb-4">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-500/20 backdrop-blur-sm rounded-full border border-emerald-400/30">
                  <span className="px-2 py-0.5 bg-emerald-400/20 rounded-full text-emerald-300 text-xs font-semibold uppercase tracking-wider">
                    No Agents
                  </span>
                  <span className="text-xs text-white/90">Sell your home with lawyers, not middlemen</span>
                </div>
              </div>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white text-center mb-3 font-[family-name:var(--font-poppins)]">
                Sell your home <span className="bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">directly</span>.<br />
                Let lawyers handle the deal.
              </h1>
              <p className="text-base md:text-lg text-white/90 text-center mb-4 max-w-3xl mx-auto font-[family-name:var(--font-poppins)]">
                PropLinka connects you with real buyers and vetted property lawyers in one place.
                No estate agents, no hidden commissions — just a clean, legal sale from listing to transfer.
              </p>

              {/* Benefit Pills */}
              <div className="flex flex-wrap justify-center gap-2 mb-6">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 text-xs text-white">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
                  Keep more from your sale price
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 text-xs text-white">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
                  Contracts drafted by real lawyers
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 text-xs text-white">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
                  Transparent fees, fixed upfront
                </div>
              </div>
            </FadeIn>
          </div>
        </div>

      </section>

      {/* Featured Listings */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <FadeIn>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-2">Featured Properties</h2>
                <p className="text-muted-foreground">Discover homes directly from owners - no agent fees</p>
              </div>
              <Link href="/browse">
                <Button variant="outline" className="group transition-all hover:shadow-lg">
                  View All Properties
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {displayListings.map((listing, index) => {
              const countryCode = listing.country?.code || 'ZA'
              const currency = listing.currency || 'ZAR'
              const savings = calculateSavings(listing.price, countryCode, currency)
              const formatted = formatSavingsDisplay(savings)


              return (
                <FadeIn key={listing.id} delay={index * 0.1}>
                  <Link href={`/properties/${listing.id}`}>
                    <Card className="hover:shadow-2xl transition-all duration-300 cursor-pointer h-full group border-2 hover:border-primary/50">
                      <div className="relative aspect-[4/3] overflow-hidden rounded-t-lg">
                      <Image
                        src={listing.images?.[0]?.url || "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&h=600&fit=crop"}
                        alt={listing.images?.[0]?.alt_text || listing.title}
                        fill
                        className="object-cover hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                      />
                      <div className="absolute top-3 left-3">
                        <span className="bg-background/90 backdrop-blur px-2 py-1 rounded text-xs font-medium capitalize">
                          {listing.property_type?.replace('_', ' ') || 'Property'}
                        </span>
                      </div>
                      {/* Prominent Savings Badge */}
                      <div className="absolute bottom-2 left-2 right-2">
                        <div className="bg-primary/95 text-primary-foreground rounded-md px-3 py-1.5 flex items-center justify-between">
                          <span className="text-xs font-medium flex items-center gap-1">
                            <TrendingDown className="h-3 w-3" />
                            Save {formatted.totalSavings}
                          </span>
                          <span className="text-xs">
                            vs agent fees
                          </span>
                        </div>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <div className="mb-2">
                        <h3 className="font-semibold text-lg line-clamp-1">{listing.title}</h3>
                        <div className="flex items-center gap-1 text-muted-foreground text-sm mt-1">
                          <MapPin className="h-3 w-3" />
                          <span className="line-clamp-1">{listing.city}, {listing.province}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 text-sm text-muted-foreground mb-3">
                        <div className="flex items-center gap-1">
                          <Bed className="h-4 w-4" />
                          <span>{listing.bedrooms || 0}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Bath className="h-4 w-4" />
                          <span>{listing.bathrooms || 0}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Square className="h-4 w-4" />
                          <span>{listing.square_meters || 0}m²</span>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-2xl font-bold">
                          {formatPropertyPrice(listing.price, listing.country?.currency_symbol || 'R')}
                        </p>
                        <div className="mt-1 flex items-center gap-2 text-xs">
                          <span className="text-muted-foreground line-through">
                            Agent: {formatted.traditionalAgentFee}
                          </span>
                          <span className="font-medium text-primary">
                            Platform fee: {formatted.platformFee}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </FadeIn>
              )
            })}
          </div>
        </div>
      </section>

      {/* How It Works - Modern Design */}
      <section className="py-20 bg-gradient-to-b from-background via-muted/20 to-background relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />

        <div className="container mx-auto px-4 relative z-10">
          <FadeIn>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">How PropLinka Works</h2>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                From listing to transfer, all in one place. We remove agents from the middle and bring lawyers into the centre.
              </p>
            </div>
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12 max-w-6xl mx-auto">
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

                  <h3 className="font-bold text-xl mb-3 text-center">List your property in minutes</h3>
                  <p className="text-sm text-muted-foreground text-center leading-relaxed">
                    Add photos, price, and key details. Choose if you want "lawyer from day one" or only once you have a serious buyer. No long-term lock-in.
                  </p>
                </CardContent>

                {/* Arrow connector for desktop */}
                <div className="hidden md:block absolute top-1/2 -right-10 transform -translate-y-1/2 z-10">
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

                  <h3 className="font-bold text-xl mb-3 text-center">Connect with direct buyers</h3>
                  <p className="text-sm text-muted-foreground text-center leading-relaxed">
                    Buyers contact you securely through PropLinka. You stay in control of viewings, negotiations and final price — we just make the process safe.
                  </p>
                </CardContent>

                {/* Arrow connector for desktop */}
                <div className="hidden md:block absolute top-1/2 -right-10 transform -translate-y-1/2 z-10">
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
                    <div className="w-16 h-16 bg-gradient-to-br from-green-500 via-green-600 to-green-700 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-green-500/25 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                      <Shield className="h-8 w-8 text-white" />
                    </div>
                  </div>

                  <h3 className="font-bold text-xl mb-3 text-center">Lawyers close the deal</h3>
                  <p className="text-sm text-muted-foreground text-center leading-relaxed">
                    Once you and the buyer agree on a price, a vetted property lawyer steps in: drafting contracts, doing checks, and handling transfer until the property is lodged.
                  </p>
                </CardContent>
              </Card>
            </FadeIn>
          </div>

          {/* Call to action */}
          <FadeIn delay={0.5}>
            <div className="text-center mt-16">
              <Link href="/how-it-works">
                <Button size="lg" variant="outline" className="group">
                  See Detailed Process
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Interactive Savings Calculator with Lottie Animations */}
      <SavingsSection />

      {/* Why PropLinka - Modern Design */}
      <section className="py-24 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/10 to-background" />
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]" />

        <div className="container mx-auto px-4 relative z-10">
          <FadeIn>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">Why PropLinka</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Built for owners and property lawyers
              </p>
              <p className="text-sm text-muted-foreground max-w-3xl mx-auto mt-2">
                The platform keeps deals transparent, documents organised, and everyone on the same page.
              </p>
            </div>
          </FadeIn>

          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* For Home Owners */}
            <FadeIn delay={0.1} className="h-full">
              <Card className="relative group hover:shadow-2xl transition-all duration-500 border-2 hover:border-primary/50 h-full flex flex-col overflow-hidden bg-gradient-to-br from-background to-primary/5">
                {/* Decorative corner accent */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-bl-full" />

                <CardHeader className="relative z-10">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary via-primary/90 to-primary/80 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-primary/20 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                    <Home className="h-8 w-8 text-primary-foreground" />
                  </div>
                  <CardTitle className="text-2xl mb-2">For Home Owners</CardTitle>
                  <p className="text-lg text-muted-foreground font-semibold">Sell without agents. Keep more.</p>
                </CardHeader>
                <CardContent className="flex-1 relative z-10">
                  <ul className="space-y-3 text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span>No estate agent commissions eating your sale price</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span>Choose your own selling price and negotiate directly</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span>Clear visibility: offer, documents, and transfer stage in one dashboard</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span>Fixed legal fees shown before you accept a lawyer</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span>Support from humans if you get stuck in the process</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </FadeIn>

            {/* For Property Lawyers */}
            <FadeIn delay={0.2} className="h-full">
              <Card className="relative group hover:shadow-2xl transition-all duration-500 border-2 hover:border-primary/50 h-full flex flex-col overflow-hidden bg-gradient-to-br from-background to-emerald-500/5">
                {/* Decorative corner accent */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-bl-full" />

                <CardHeader className="relative z-10">
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/20 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                    <Shield className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl mb-2">For Property Lawyers</CardTitle>
                  <p className="text-lg text-muted-foreground font-semibold">Quality matters, not cold calling.</p>
                </CardHeader>
                <CardContent className="flex-1 relative z-10">
                  <ul className="space-y-3 text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span>Receive pre-qualified, serious property deals from owners</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span>Set your own fixed fee packs for different property values</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span>Secure document uploads and digital signatures built-in</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span>Automatic status updates to keep both parties informed</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span>Grow your practice with transparent, digital-first workflows</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* FAQ Section with Lottie Animation */}
      <FAQSection />

      {/* Modern CTA Section */}
      <section className="py-24 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 text-white relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 bg-grid-pattern opacity-10" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

        <div className="container mx-auto px-4 text-center relative z-10">
          <FadeIn>
            <div className="max-w-4xl mx-auto">
              {/* Badge */}
              <div className="inline-flex items-center justify-center px-4 py-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full mb-8">
                <TrendingDown className="h-4 w-4 mr-2" />
                <span className="text-sm font-medium">Start Saving Today</span>
              </div>

              {/* Headline */}
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Ready to Save on Your{' '}
                <span className="bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-400 bg-clip-text text-transparent">
                  Next Property?
                </span>
              </h2>

              {/* Subheadline */}
              <p className="text-xl md:text-2xl mb-12 opacity-95 max-w-3xl mx-auto font-light">
                Join thousands who are buying and selling smarter with PropLinka
              </p>
            </div>
          </FadeIn>

          {/* CTA Buttons */}
          <FadeIn delay={0.2}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link href="/register">
                <Button
                  size="lg"
                  className="group w-full sm:w-auto px-8 py-6 text-lg font-semibold bg-white text-blue-700 hover:bg-blue-50 shadow-2xl shadow-black/20 transition-all hover:scale-105"
                >
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/how-it-works">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto px-8 py-6 text-lg font-semibold bg-white/10 backdrop-blur-sm border-2 border-white/40 text-white hover:bg-white hover:text-blue-700 transition-all hover:scale-105"
                >
                  Learn More
                </Button>
              </Link>
            </div>
          </FadeIn>

          {/* Trust indicators */}
          <FadeIn delay={0.4}>
            <div className="flex flex-wrap items-center justify-center gap-8 text-white/90">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                <span className="text-sm font-medium">Secure & Verified</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                <span className="text-sm font-medium">Trusted by Thousands</span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                <span className="text-sm font-medium">No Hidden Fees</span>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold mb-4">PropLinka</h3>
              <p className="text-sm text-muted-foreground">
                Linking buyers and sellers directly in Namibia and South Africa.
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
            © 2025 PropLinka. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}