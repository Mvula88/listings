import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Mail, MessageSquare, Phone, MapPin, Clock, ArrowRight, Sparkles, Send } from "lucide-react"
import { PageHeader } from "@/components/layout/page-header"
import { PageFooter } from "@/components/layout/page-footer"
import { FadeIn } from "@/components/ui/fade-in"

export default function ContactPage() {
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
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6">
                <MessageSquare className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-primary">Get In Touch</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 font-[family-name:var(--font-poppins)]">
                Contact <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">Us</span>
              </h1>
              <p className="text-lg text-muted-foreground">
                We're here to help with any questions about buying, selling, or using PropLinka
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Contact Options */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <FadeIn>
              <div className="grid md:grid-cols-3 gap-6 mb-12">
                <Card className="border-2 hover:border-primary/30 transition-all hover:shadow-lg text-center">
                  <CardContent className="p-6">
                    <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Mail className="h-7 w-7 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-2">Email Support</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Get help via email within 24 hours
                    </p>
                    <a href="mailto:support@proplinka.com" className="text-primary hover:underline font-medium">
                      support@proplinka.com
                    </a>
                  </CardContent>
                </Card>
                <Card className="border-2 hover:border-primary/30 transition-all hover:shadow-lg text-center">
                  <CardContent className="p-6">
                    <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Clock className="h-7 w-7 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-2">Live Chat</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Chat with our team during business hours
                    </p>
                    <p className="text-sm font-medium">
                      Mon-Fri: 8:00 AM - 6:00 PM SAST
                    </p>
                  </CardContent>
                </Card>
                <Card className="border-2 hover:border-primary/30 transition-all hover:shadow-lg text-center">
                  <CardContent className="p-6">
                    <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Phone className="h-7 w-7 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-2">Phone Support</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Speak directly with our support team
                    </p>
                    <p className="text-sm font-medium">
                      SA: +27 21 555 0123<br />
                      NA: +264 61 555 0123
                    </p>
                  </CardContent>
                </Card>
              </div>
            </FadeIn>

            {/* Contact Form */}
            <FadeIn delay={0.1}>
              <Card className="max-w-2xl mx-auto border-2 shadow-lg">
                <CardHeader className="text-center">
                  <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Send className="h-7 w-7 text-primary" />
                  </div>
                  <CardTitle className="text-2xl">Send us a message</CardTitle>
                  <CardDescription className="text-base">
                    Fill out the form below and we'll get back to you as soon as possible
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input id="firstName" placeholder="John" required className="h-11" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input id="lastName" placeholder="Doe" required className="h-11" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" placeholder="john@example.com" required className="h-11" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject</Label>
                      <select
                        id="subject"
                        className="w-full h-11 px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
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
                        className="resize-none"
                      />
                    </div>
                    <Button type="submit" className="w-full h-11" size="lg">
                      <Send className="mr-2 h-4 w-4" />
                      Send Message
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Office Locations */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <FadeIn>
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-4">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-primary">Our Locations</span>
                </div>
                <h2 className="text-3xl font-bold">Our Offices</h2>
              </div>
              <div className="grid md:grid-cols-2 gap-8">
                <Card className="border-2 hover:border-primary/30 transition-all hover:shadow-lg">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                        <MapPin className="h-5 w-5 text-primary" />
                      </div>
                      <CardTitle className="text-lg">South Africa Office</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <p className="text-muted-foreground">123 Main Road</p>
                    <p className="text-muted-foreground">Sea Point</p>
                    <p className="text-muted-foreground">Cape Town, 8005</p>
                    <p className="text-muted-foreground">South Africa</p>
                    <div className="pt-4 border-t space-y-1">
                      <p>
                        <span className="font-medium">Phone:</span>{" "}
                        <span className="text-muted-foreground">+27 21 555 0123</span>
                      </p>
                      <p>
                        <span className="font-medium">Email:</span>{" "}
                        <a href="mailto:za@proplinka.com" className="text-primary hover:underline">za@proplinka.com</a>
                      </p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-2 hover:border-primary/30 transition-all hover:shadow-lg">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                        <MapPin className="h-5 w-5 text-primary" />
                      </div>
                      <CardTitle className="text-lg">Namibia Office</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <p className="text-muted-foreground">456 Independence Avenue</p>
                    <p className="text-muted-foreground">Windhoek Central</p>
                    <p className="text-muted-foreground">Windhoek, 9000</p>
                    <p className="text-muted-foreground">Namibia</p>
                    <div className="pt-4 border-t space-y-1">
                      <p>
                        <span className="font-medium">Phone:</span>{" "}
                        <span className="text-muted-foreground">+264 61 555 0123</span>
                      </p>
                      <p>
                        <span className="font-medium">Email:</span>{" "}
                        <a href="mailto:na@proplinka.com" className="text-primary hover:underline">na@proplinka.com</a>
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* FAQ Link */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <FadeIn>
            <Card className="max-w-2xl mx-auto border-2 shadow-lg text-center">
              <CardContent className="p-8">
                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="h-7 w-7 text-primary" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Looking for quick answers?</h2>
                <p className="text-muted-foreground mb-6">
                  Check out our frequently asked questions for instant help
                </p>
                <Link href="/faq">
                  <Button size="lg">
                    View FAQ
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </FadeIn>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <FadeIn>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
              Join thousands who are saving on property transactions with PropLinka
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link href="/register">
                <Button size="lg" className="bg-white text-blue-700 hover:bg-blue-50">
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/browse">
                <Button size="lg" variant="outline" className="bg-transparent text-white border-white hover:bg-white/10">
                  Browse Properties
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
