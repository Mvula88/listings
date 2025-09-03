import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Star, Briefcase, CheckCircle } from "lucide-react"

export default function LawyersPage() {
  // Mock data for lawyers - in production this would come from database
  const lawyers = [
    {
      id: 1,
      name: "Sarah Johnson",
      firm: "Johnson & Associates",
      location: "Cape Town, South Africa",
      specialization: "Residential Property",
      experience: "15 years",
      flatFee: "R15,000",
      rating: 4.8,
      reviews: 127,
      verified: true
    },
    {
      id: 2,
      name: "Michael van der Merwe",
      firm: "Van der Merwe Legal",
      location: "Johannesburg, South Africa",
      specialization: "Commercial & Residential",
      experience: "20 years",
      flatFee: "R18,000",
      rating: 4.9,
      reviews: 89,
      verified: true
    },
    {
      id: 3,
      name: "David Namibu",
      firm: "Namibu Conveyancing",
      location: "Windhoek, Namibia",
      specialization: "Residential Property",
      experience: "12 years",
      flatFee: "N$12,000",
      rating: 4.7,
      reviews: 64,
      verified: true
    },
    {
      id: 4,
      name: "Lisa Shikongo",
      firm: "Shikongo & Partners",
      location: "Swakopmund, Namibia",
      specialization: "Coastal Properties",
      experience: "10 years",
      flatFee: "N$14,000",
      rating: 4.6,
      reviews: 42,
      verified: true
    }
  ]

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
            <h1 className="text-4xl font-bold mb-4">Verified Conveyancing Lawyers</h1>
            <p className="text-lg text-muted-foreground">
              All lawyers are verified professionals with transparent flat-rate pricing. No hidden fees.
            </p>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-wrap gap-4">
            <select className="px-4 py-2 border rounded-lg">
              <option>All Countries</option>
              <option>South Africa</option>
              <option>Namibia</option>
            </select>
            <select className="px-4 py-2 border rounded-lg">
              <option>All Specializations</option>
              <option>Residential Property</option>
              <option>Commercial Property</option>
              <option>Agricultural Land</option>
            </select>
            <select className="px-4 py-2 border rounded-lg">
              <option>Sort by Rating</option>
              <option>Sort by Price</option>
              <option>Sort by Experience</option>
            </select>
          </div>
        </div>
      </section>

      {/* Lawyers List */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {lawyers.map((lawyer) => (
              <Card key={lawyer.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {lawyer.name}
                        {lawyer.verified && (
                          <CheckCircle className="h-5 w-5 text-primary" title="Verified" />
                        )}
                      </CardTitle>
                      <CardDescription>{lawyer.firm}</CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold">{lawyer.rating}</span>
                        <span className="text-sm text-muted-foreground">({lawyer.reviews})</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <span>{lawyer.location}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Briefcase className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <span>{lawyer.experience}</span>
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Specialization</div>
                    <div className="font-medium">{lawyer.specialization}</div>
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t">
                    <div>
                      <div className="text-sm text-muted-foreground">Flat Fee</div>
                      <div className="text-xl font-bold text-primary">{lawyer.flatFee}</div>
                    </div>
                    <Button>View Profile</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Load More */}
          <div className="text-center mt-8">
            <Button variant="outline" size="lg">
              Load More Lawyers
            </Button>
          </div>
        </div>
      </section>

      {/* Info Section */}
      <section className="py-12 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-center">Why Use DealDirect Lawyers?</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Verified Professionals</h3>
                <p className="text-sm text-muted-foreground">
                  All lawyers are verified with valid practicing certificates
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-primary font-bold">R</span>
                </div>
                <h3 className="font-semibold mb-2">Transparent Pricing</h3>
                <p className="text-sm text-muted-foreground">
                  Flat-rate fees with no hidden costs or surprises
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Star className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Client Reviews</h3>
                <p className="text-sm text-muted-foreground">
                  Real reviews from verified clients help you choose
                </p>
              </div>
            </div>
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