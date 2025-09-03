import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Target, Users, Shield, TrendingUp } from "lucide-react"

export default function AboutPage() {
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
            <h1 className="text-4xl font-bold mb-4">About DealDirect</h1>
            <p className="text-lg text-muted-foreground">
              Revolutionizing real estate transactions in Africa by eliminating unnecessary middleman fees
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
                <p className="text-muted-foreground mb-4">
                  We believe buying or selling property shouldn't cost you tens of thousands in commission fees. 
                  DealDirect was founded to democratize real estate transactions by connecting buyers and sellers directly.
                </p>
                <p className="text-muted-foreground mb-4">
                  By eliminating the traditional 5-7% agent commission and replacing it with a simple R2,000 success fee, 
                  we're helping thousands of families save money on the biggest transactions of their lives.
                </p>
                <p className="text-muted-foreground">
                  Starting in South Africa and Namibia, we're on a mission to make property transactions more affordable 
                  and transparent across Africa.
                </p>
              </div>
              <div className="bg-primary/10 rounded-lg p-8">
                <div className="text-center">
                  <div className="text-5xl font-bold text-primary mb-2">R10M+</div>
                  <p className="text-muted-foreground">Saved in commissions</p>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-8">
                  <div className="text-center">
                    <div className="text-2xl font-bold">5,000+</div>
                    <p className="text-sm text-muted-foreground">Properties Listed</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">2,000+</div>
                    <p className="text-sm text-muted-foreground">Happy Users</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Our Values</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <Card>
                <CardContent className="p-6">
                  <Target className="h-10 w-10 text-primary mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Transparency</h3>
                  <p className="text-muted-foreground">
                    No hidden fees, no fine print. Our R2,000 success fee is all you pay. 
                    Every cost is clearly communicated upfront.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <Users className="h-10 w-10 text-primary mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Direct Connection</h3>
                  <p className="text-muted-foreground">
                    We believe in the power of direct communication. No middlemen means 
                    faster decisions and better deals.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <Shield className="h-10 w-10 text-primary mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Security</h3>
                  <p className="text-muted-foreground">
                    All transactions are handled by verified conveyancing attorneys. 
                    Your money and documents are always secure.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <TrendingUp className="h-10 w-10 text-primary mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Empowerment</h3>
                  <p className="text-muted-foreground">
                    We empower users to take control of their property transactions 
                    and keep more money in their pockets.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-8">Our Story</h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                DealDirect was born from frustration. Our founder was selling their family home and was shocked 
                to learn they would have to pay over R100,000 in agent commissions - money that could have gone 
                toward their children's education.
              </p>
              <p>
                The agent's role? Listing the property online, showing it to a few people, and facilitating 
                communication - tasks that could easily be done directly. The legal work was handled by a 
                conveyancer anyway.
              </p>
              <p>
                That's when the idea struck: What if there was a platform where buyers and sellers could connect 
                directly, handle their own negotiations, and save tens of thousands in the process?
              </p>
              <p>
                Today, DealDirect is that platform. We've helped thousands of families across South Africa and 
                Namibia save millions in unnecessary commissions. And we're just getting started.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Built by Property Experts</h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              Our team combines decades of experience in real estate, technology, and law to create 
              a platform that truly serves users' needs.
            </p>
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="w-24 h-24 bg-primary/10 rounded-full mx-auto mb-4" />
                <h3 className="font-semibold mb-1">Real Estate Professionals</h3>
                <p className="text-sm text-muted-foreground">
                  Former agents and brokers who understand the industry inside out
                </p>
              </div>
              <div>
                <div className="w-24 h-24 bg-primary/10 rounded-full mx-auto mb-4" />
                <h3 className="font-semibold mb-1">Technology Experts</h3>
                <p className="text-sm text-muted-foreground">
                  Engineers building secure, user-friendly platforms
                </p>
              </div>
              <div>
                <div className="w-24 h-24 bg-primary/10 rounded-full mx-auto mb-4" />
                <h3 className="font-semibold mb-1">Legal Advisors</h3>
                <p className="text-sm text-muted-foreground">
                  Ensuring every transaction is legally sound and secure
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Join the Revolution</h2>
          <p className="text-lg mb-8 opacity-90">
            Be part of the movement changing real estate in Africa
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" variant="secondary">
                Get Started Free
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="bg-transparent text-primary-foreground border-primary-foreground hover:bg-primary-foreground/10">
                Contact Us
              </Button>
            </Link>
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