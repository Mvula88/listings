import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, Home, Users, DollarSign, Shield, MapPin, Bed, Bath, Square, TrendingDown, Search } from "lucide-react"
import { getFeaturedProperties, formatPropertyPrice } from "@/lib/data/properties"
import { SavingsCalculator } from "@/components/calculator/savings-calculator"
import { calculateSavings, formatSavingsDisplay } from "@/lib/utils/savings-calculator"
import { FadeIn } from "@/components/ui/fade-in"

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
            <Link href="/" className="text-2xl font-bold text-primary transition-transform hover:scale-105">
              PropLinka
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
      <section className="relative min-h-[600px] md:min-h-[700px] overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1920&h=1080&fit=crop&q=80"
            alt="Modern luxury home"
            fill
            className="object-cover"
            priority
          />
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/30" />
        </div>

        <div className="container mx-auto px-4 relative z-10 pt-20 md:pt-32 pb-24">
          <div className="max-w-4xl mx-auto">
            {/* Main Headline */}
            <FadeIn direction="down" duration={0.8}>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white text-center mb-4">
                Connect directly with property buyers and sellers
              </h1>
              <p className="text-lg md:text-xl text-white/90 text-center mb-8 max-w-3xl mx-auto">
                No estate agents. Verified conveyancers. Secure transactions.
              </p>
            </FadeIn>

            {/* Search Bar */}
            <FadeIn delay={0.2} duration={0.8}>
              <div className="bg-white rounded-lg shadow-2xl p-4 md:p-6 mb-16">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  {/* Offer Type */}
                  <div>
                    <label className="block text-xs uppercase text-gray-600 mb-2 font-semibold">
                      Offer Type
                    </label>
                    <select className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-gray-800">
                      <option>Value</option>
                      <option>Sale</option>
                      <option>Rent</option>
                    </select>
                  </div>

                  {/* Property Type */}
                  <div>
                    <label className="block text-xs uppercase text-gray-600 mb-2 font-semibold">
                      Property
                    </label>
                    <select className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-gray-800">
                      <option>All</option>
                      <option>House</option>
                      <option>Apartment</option>
                      <option>Land</option>
                      <option>Commercial</option>
                    </select>
                  </div>

                  {/* Localities */}
                  <div>
                    <label className="block text-xs uppercase text-gray-600 mb-2 font-semibold">
                      Localities
                    </label>
                    <select className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-gray-800">
                      <option>Country, district, ...</option>
                      <option>Windhoek</option>
                      <option>Swakopmund</option>
                      <option>Cape Town</option>
                      <option>Johannesburg</option>
                    </select>
                  </div>

                  {/* Price */}
                  <div>
                    <label className="block text-xs uppercase text-gray-600 mb-2 font-semibold">
                      Price
                    </label>
                    <select className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-gray-800">
                      <option>If doesn't matter</option>
                      <option>Under N$500k</option>
                      <option>N$500k - N$1M</option>
                      <option>N$1M - N$2M</option>
                      <option>Above N$2M</option>
                    </select>
                  </div>
                </div>

                {/* Search Button */}
                <Link href="/browse">
                  <Button className="w-full bg-primary hover:bg-primary/90 text-white py-6 text-lg font-semibold rounded-md shadow-lg flex items-center justify-center gap-2">
                    <Search className="h-5 w-5" />
                    Search
                  </Button>
                </Link>
              </div>
            </FadeIn>

            {/* Services for property owners */}
            <FadeIn delay={0.4} duration={0.8}>
              <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-8">
                Services for property owners
              </h2>

              {/* Action Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* I want to rent */}
                <div className="bg-white/95 backdrop-blur-sm rounded-lg p-8 text-center shadow-xl hover:shadow-2xl transition-all hover:scale-105">
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">I want to rent</h3>
                  <Link href="/list?type=rent">
                    <Button
                      className="bg-primary hover:bg-primary/90 text-white px-8 py-3 font-semibold rounded-md"
                    >
                      FIND OUT MORE
                    </Button>
                  </Link>
                </div>

                {/* I want to sell */}
                <div className="bg-white/95 backdrop-blur-sm rounded-lg p-8 text-center shadow-xl hover:shadow-2xl transition-all hover:scale-105">
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">I want to sell</h3>
                  <Link href="/list?type=sale">
                    <Button
                      className="bg-primary hover:bg-primary/90 text-white px-8 py-3 font-semibold rounded-md"
                    >
                      FIND OUT MORE
                    </Button>
                  </Link>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>

        {/* Scroll indicator */}
        <FadeIn delay={0.6} duration={0.8}>
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
            <span className="text-xs text-white/80 font-medium uppercase tracking-wider">Browse Listings</span>
            <div className="w-6 h-10 border-2 border-white/60 rounded-full flex items-start justify-center p-2">
              <div className="w-1.5 h-3 bg-white/80 rounded-full animate-pulse" />
            </div>
          </div>
        </FadeIn>
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
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">How PropLinka Works</h2>
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

      {/* Interactive Savings Calculator - Modern Design */}
      <section className="py-24 bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <FadeIn>
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center px-4 py-2 bg-primary/10 rounded-full mb-6">
                <TrendingDown className="h-4 w-4 text-primary mr-2" />
                <span className="text-sm font-medium text-primary">Save 50-70% on Fees</span>
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">Calculate Your Savings</h2>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                See exactly how much you'll save by avoiding agent commissions
              </p>
            </div>
          </FadeIn>

          <FadeIn delay={0.2}>
            <div className="flex justify-center">
              <div className="w-full max-w-2xl">
                <Card className="border-2 shadow-2xl bg-background/80 backdrop-blur">
                  <CardContent className="p-8">
                    <SavingsCalculator />
                  </CardContent>
                </Card>
              </div>
            </div>
          </FadeIn>

          {/* Trust indicators */}
          <FadeIn delay={0.4}>
            <div className="mt-12 flex flex-wrap justify-center gap-8 text-center">
              <div className="flex flex-col items-center">
                <div className="text-3xl font-bold text-primary mb-1">50-70%</div>
                <div className="text-sm text-muted-foreground">Lower Fees</div>
              </div>
              <div className="flex flex-col items-center">
                <div className="text-3xl font-bold text-primary mb-1">100%</div>
                <div className="text-sm text-muted-foreground">Transparent</div>
              </div>
              <div className="flex flex-col items-center">
                <div className="text-3xl font-bold text-primary mb-1">0</div>
                <div className="text-sm text-muted-foreground">Upfront Costs</div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Why Choose PropLinka - Modern Design */}
      <section className="py-24 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/10 to-background" />
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]" />

        <div className="container mx-auto px-4 relative z-10">
          <FadeIn>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">Why Choose PropLinka?</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                The smarter way to buy and sell property
              </p>
            </div>
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <FadeIn delay={0.1} className="h-full">
              <Card className="relative group hover:shadow-2xl transition-all duration-500 border-2 hover:border-primary/50 h-full flex flex-col overflow-hidden bg-gradient-to-br from-background to-primary/5">
                {/* Decorative corner accent */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-bl-full" />

                <CardHeader className="relative z-10">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary via-primary/90 to-primary/80 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-primary/20 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                    <DollarSign className="h-8 w-8 text-primary-foreground" />
                  </div>
                  <CardTitle className="text-2xl mb-2">Transparent Pricing</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 relative z-10">
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    Tiered platform fees based on property value, collected by your lawyer at closing. No upfront costs, no percentage-based commissions.
                  </p>
                  <div className="flex items-center text-sm text-primary font-medium">
                    <span>Learn about pricing</span>
                    <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            </FadeIn>

            <FadeIn delay={0.2} className="h-full">
              <Card className="relative group hover:shadow-2xl transition-all duration-500 border-2 hover:border-primary/50 h-full flex flex-col overflow-hidden bg-gradient-to-br from-background to-primary/5">
                {/* Decorative corner accent */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-bl-full" />

                <CardHeader className="relative z-10">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary via-primary/90 to-primary/80 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-primary/20 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                    <Shield className="h-8 w-8 text-primary-foreground" />
                  </div>
                  <CardTitle className="text-2xl mb-2">Verified Lawyers</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 relative z-10">
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    All conveyancers are verified professionals with transparent flat-rate pricing. Your transaction is in safe hands.
                  </p>
                  <div className="flex items-center text-sm text-primary font-medium">
                    <span>Find a lawyer</span>
                    <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            </FadeIn>

            <FadeIn delay={0.3} className="h-full">
              <Card className="relative group hover:shadow-2xl transition-all duration-500 border-2 hover:border-primary/50 h-full flex flex-col overflow-hidden bg-gradient-to-br from-background to-primary/5">
                {/* Decorative corner accent */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-bl-full" />

                <CardHeader className="relative z-10">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary via-primary/90 to-primary/80 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-primary/20 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                    <Users className="h-8 w-8 text-primary-foreground" />
                  </div>
                  <CardTitle className="text-2xl mb-2">Direct Communication</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 relative z-10">
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    Connect directly with buyers and sellers through our secure platform. No middleman delays or miscommunication.
                  </p>
                  <div className="flex items-center text-sm text-primary font-medium">
                    <span>How it works</span>
                    <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            </FadeIn>
          </div>
        </div>
      </section>

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