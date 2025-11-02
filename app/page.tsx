import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, Home, Users, DollarSign, Shield, MapPin, Bed, Bath, Square, TrendingDown } from "lucide-react"
import { getFeaturedProperties, formatPropertyPrice } from "@/lib/data/properties"
import { SavingsCalculator } from "@/components/calculator/savings-calculator"
import { calculateSavings, formatSavingsDisplay } from "@/lib/utils/savings-calculator"
import { FadeIn, Stagger } from "@/components/ui/fade-in"

export default async function HomePage() {
  // Fetch real featured properties from Supabase
  const featuredListings = await getFeaturedProperties(8)

  // Fallback to mock data if no properties in database
  const displayListings = featuredListings.length > 0 ? featuredListings : [
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
      country: { name: "Namibia", currency_symbol: "N$" }
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
      country: { name: "South Africa", currency_symbol: "R" }
    }
  ] as any[]

  return (
    <div className="flex flex-col min-h-screen">
      {/* Sticky Navigation */}
      <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-primary transition-transform hover:scale-105">
              DealDirect
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

      {/* Enhanced Hero Section */}
      <section className="relative py-8 md:py-12 overflow-hidden h-[65vh] md:h-[60vh] flex items-center">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1920&h=1080&fit=crop&q=80"
            alt="Modern luxury home"
            fill
            className="object-cover"
            priority
          />
          {/* Dark overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/60 to-black/70" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <FadeIn direction="down" duration={0.8}>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-white px-4">
                Buy & Sell Properties Without&nbsp;Agent&nbsp;Commissions
              </h1>
            </FadeIn>

            <FadeIn delay={0.2} duration={0.8}>
              <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                Save thousands on real estate transactions. Connect directly with buyers, sellers, and trusted conveyancers.
              </p>
            </FadeIn>

            <FadeIn delay={0.4} duration={0.8}>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/browse">
                  <Button size="lg" className="w-full sm:w-auto group transition-all hover:shadow-xl hover:scale-105">
                    Browse Properties
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="/list">
                  <Button size="lg" variant="secondary" className="w-full sm:w-auto transition-all hover:shadow-xl hover:scale-105">
                    List Your Property
                  </Button>
                </Link>
              </div>
            </FadeIn>

            <FadeIn delay={0.6} duration={0.8}>
              <p className="mt-8 text-sm text-white/80 flex items-center justify-center gap-2">
                <MapPin className="h-4 w-4" />
                Currently serving Namibia and South Africa
              </p>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Featured Listings */}
      <section className="py-20 bg-muted/30">
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
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">How DealDirect Works</h2>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                Four simple steps to save thousands on your property transaction
              </p>
            </div>
          </FadeIn>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 max-w-7xl mx-auto">
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

      {/* Interactive Savings Calculator */}
      <section className="py-20 bg-gradient-to-b from-muted/50 to-background">
        <div className="container mx-auto px-4">
          <FadeIn>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Calculate Your Savings</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                See exactly how much you'll save by avoiding agent commissions
              </p>
            </div>
          </FadeIn>
          <FadeIn delay={0.2}>
            <div className="flex justify-center">
              <SavingsCalculator />
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <FadeIn>
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">Why Choose DealDirect?</h2>
          </FadeIn>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <FadeIn delay={0.1} className="h-full">
              <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 hover:border-primary/50 h-full flex flex-col">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <DollarSign className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Transparent Pricing</CardTitle>
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="text-muted-foreground">
                    Tiered platform fees based on property value, collected by your lawyer at closing. No upfront costs, no percentage-based commissions.
                  </p>
                </CardContent>
              </Card>
            </FadeIn>

            <FadeIn delay={0.2} className="h-full">
              <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 hover:border-primary/50 h-full flex flex-col">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Verified Lawyers</CardTitle>
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="text-muted-foreground">
                    All conveyancers are verified professionals with transparent flat-rate pricing.
                  </p>
                </CardContent>
              </Card>
            </FadeIn>

            <FadeIn delay={0.3} className="h-full">
              <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 hover:border-primary/50 h-full flex flex-col">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Direct Communication</CardTitle>
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="text-muted-foreground">
                    Connect directly with buyers and sellers. No middleman delays or miscommunication.
                  </p>
                </CardContent>
              </Card>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-r from-primary via-primary/90 to-primary text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-10" />
        <div className="container mx-auto px-4 text-center relative">
          <FadeIn>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">Ready to Save on Your Next Property?</h2>
            <p className="text-lg md:text-xl mb-10 opacity-90 max-w-2xl mx-auto">
              Join thousands who are buying and selling smarter with DealDirect
            </p>
          </FadeIn>
          <FadeIn delay={0.2}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" variant="secondary" className="group w-full sm:w-auto transition-all hover:shadow-xl hover:scale-105">
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/how-it-works">
                <Button size="lg" variant="outline" className="w-full sm:w-auto bg-transparent text-primary-foreground border-2 border-primary-foreground hover:bg-primary-foreground/10 transition-all hover:shadow-xl">
                  Learn More
                </Button>
              </Link>
            </div>
          </FadeIn>
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