import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Mail, MessageSquare, Phone } from "lucide-react"

export default function ContactPage() {
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
      <section className="bg-gradient-to-b from-primary/10 to-background py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
            <p className="text-lg text-muted-foreground">
              We're here to help with any questions about buying, selling, or using PropLinka
            </p>
          </div>
        </div>
      </section>

      {/* Contact Options */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <Card>
                <CardContent className="p-6 text-center">
                  <Mail className="h-10 w-10 text-primary mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Email Support</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Get help via email within 24 hours
                  </p>
                  <a href="mailto:support@proplinka.com" className="text-primary hover:underline">
                    support@proplinka.com
                  </a>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <MessageSquare className="h-10 w-10 text-primary mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Live Chat</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Chat with our team during business hours
                  </p>
                  <p className="text-sm">
                    Mon-Fri: 8:00 AM - 6:00 PM SAST
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <Phone className="h-10 w-10 text-primary mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Phone Support</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Speak directly with our support team
                  </p>
                  <p className="text-sm">
                    SA: +27 21 555 0123<br />
                    NA: +264 61 555 0123
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Contact Form */}
            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle>Send us a message</CardTitle>
                <CardDescription>
                  Fill out the form below and we'll get back to you as soon as possible
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input id="firstName" placeholder="John" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input id="lastName" placeholder="Doe" required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="john@example.com" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <select 
                      id="subject" 
                      className="w-full px-3 py-2 border rounded-lg"
                      required
                    >
                      <option value="">Select a topic</option>
                      <option value="buying">Buying a property</option>
                      <option value="selling">Selling a property</option>
                      <option value="legal">Legal/Conveyancing questions</option>
                      <option value="technical">Technical support</option>
                      <option value="billing">Billing and payments</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea 
                      id="message" 
                      placeholder="Tell us how we can help..."
                      rows={5}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Office Locations */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-12">Our Offices</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">South Africa Office</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p>123 Main Road</p>
                  <p>Sea Point</p>
                  <p>Cape Town, 8005</p>
                  <p>South Africa</p>
                  <p className="pt-2">
                    <strong>Phone:</strong> +27 21 555 0123<br />
                    <strong>Email:</strong> za@proplinka.com
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Namibia Office</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p>456 Independence Avenue</p>
                  <p>Windhoek Central</p>
                  <p>Windhoek, 9000</p>
                  <p>Namibia</p>
                  <p className="pt-2">
                    <strong>Phone:</strong> +264 61 555 0123<br />
                    <strong>Email:</strong> na@proplinka.com
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Link */}
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-4">Looking for quick answers?</h2>
          <p className="text-muted-foreground mb-6">
            Check out our frequently asked questions for instant help
          </p>
          <Link href="/faq">
            <Button variant="outline" size="lg">
              View FAQ
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © 2024 PropLinka. All rights reserved.
        </div>
      </footer>
    </div>
  )
}