import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { FileText, Shield, Scale, ArrowRight, Mail } from "lucide-react"
import { PageHeader } from "@/components/layout/page-header"
import { PageFooter } from "@/components/layout/page-footer"
import { FadeIn } from "@/components/ui/fade-in"

export default function TermsPage() {
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
                <FileText className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-primary">Legal Information</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 font-[family-name:var(--font-poppins)]">
                Terms of Service & <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">Privacy Policy</span>
              </h1>
              <p className="text-lg text-muted-foreground">
                Everything you need to know about using PropLinka
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-8 border-b bg-muted/30">
        <div className="container mx-auto px-4">
          <FadeIn>
            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="#terms"
                className="inline-flex items-center gap-2 px-4 py-2 bg-background border-2 rounded-full hover:border-primary/50 transition-colors"
              >
                <Scale className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Terms of Service</span>
              </a>
              <a
                href="#privacy"
                className="inline-flex items-center gap-2 px-4 py-2 bg-background border-2 rounded-full hover:border-primary/50 transition-colors"
              >
                <Shield className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Privacy Policy</span>
              </a>
              <a
                href="#contact"
                className="inline-flex items-center gap-2 px-4 py-2 bg-background border-2 rounded-full hover:border-primary/50 transition-colors"
              >
                <Mail className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Contact Us</span>
              </a>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 flex-1">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Terms of Service */}
            <FadeIn>
              <div id="terms" className="mb-16">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Scale className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Terms of Service</h2>
                    <p className="text-sm text-muted-foreground">Last updated: January 2025</p>
                  </div>
                </div>

                <Card className="border-2 mb-6">
                  <CardContent className="p-6 space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-3">1. Acceptance of Terms</h3>
                      <p className="text-muted-foreground">
                        By accessing and using PropLinka, you accept and agree to be bound by the terms and provision of this agreement.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-3">2. Use of Service</h3>
                      <p className="text-muted-foreground">
                        PropLinka provides a platform for buyers and sellers to connect directly for real estate transactions.
                        Users must provide accurate information and use the service in compliance with all applicable laws.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-3">3. User Accounts</h3>
                      <p className="text-muted-foreground">
                        You are responsible for maintaining the confidentiality of your account and password. You agree to accept
                        responsibility for all activities that occur under your account.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-3">4. Fees and Payments</h3>
                      <p className="text-muted-foreground mb-4">
                        PropLinka charges a <strong>tiered platform fee to sellers only</strong> upon successful completion
                        of a property transaction. The fee ranges from R4,500 to R45,000 based on the property value.
                        Buyers pay <strong>ZERO platform fees</strong>. The platform fee is collected by the conveyancing
                        attorney at closing and remitted to PropLinka within 30 days. This fee is non-refundable once the
                        transaction is complete.
                      </p>
                      <div className="bg-muted/50 rounded-xl p-4 border">
                        <p className="text-sm font-semibold mb-3">Platform Fee Structure (Seller Only):</p>
                        <ul className="text-sm text-muted-foreground space-y-2">
                          <li className="flex justify-between">
                            <span>Properties under R500K:</span>
                            <span className="font-semibold text-primary">R4,500</span>
                          </li>
                          <li className="flex justify-between">
                            <span>Properties R500K-R1M:</span>
                            <span className="font-semibold text-primary">R7,500</span>
                          </li>
                          <li className="flex justify-between">
                            <span>Properties R1M-R1.5M:</span>
                            <span className="font-semibold text-primary">R9,500</span>
                          </li>
                          <li className="flex justify-between">
                            <span>Properties R1.5M-R2.5M:</span>
                            <span className="font-semibold text-primary">R12,500</span>
                          </li>
                          <li className="flex justify-between">
                            <span>Properties R2.5M-R5M:</span>
                            <span className="font-semibold text-primary">R18,000</span>
                          </li>
                          <li className="flex justify-between">
                            <span>Properties R5M-R10M:</span>
                            <span className="font-semibold text-primary">R30,000</span>
                          </li>
                          <li className="flex justify-between">
                            <span>Properties R10M+:</span>
                            <span className="font-semibold text-primary">R45,000</span>
                          </li>
                        </ul>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-3">5. Property Listings</h3>
                      <p className="text-muted-foreground">
                        Users listing properties must ensure all information is accurate and they have the legal right to sell
                        the property. PropLinka does not verify property ownership or listing accuracy.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-3">6. Limitation of Liability</h3>
                      <p className="text-muted-foreground">
                        PropLinka is not responsible for the accuracy of listings, the outcome of transactions, or any disputes
                        between users. We provide the platform but are not party to the transactions.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </FadeIn>

            {/* Privacy Policy */}
            <FadeIn delay={0.1}>
              <div id="privacy" className="mb-16">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Privacy Policy</h2>
                    <p className="text-sm text-muted-foreground">Last updated: January 2025</p>
                  </div>
                </div>

                <Card className="border-2 mb-6">
                  <CardContent className="p-6 space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-3">1. Information We Collect</h3>
                      <p className="text-muted-foreground">
                        We collect information you provide directly to us, such as when you create an account, list a property,
                        or contact us for support. This includes name, email, phone number, and property details.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-3">2. How We Use Your Information</h3>
                      <p className="text-muted-foreground">
                        We use the information to provide, maintain, and improve our services, process transactions,
                        send notifications, and respond to your requests.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-3">3. Information Sharing</h3>
                      <p className="text-muted-foreground">
                        We share your information with other users as necessary for property transactions (e.g., buyer
                        contact info with sellers). We do not sell your personal information to third parties.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-3">4. Data Security</h3>
                      <p className="text-muted-foreground">
                        We implement appropriate technical and organizational measures to protect your personal information
                        against unauthorized access, alteration, disclosure, or destruction.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-3">5. Data Retention</h3>
                      <p className="text-muted-foreground">
                        We retain your information for as long as your account is active or as needed to provide services.
                        You may request deletion of your account at any time.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-3">6. Cookies</h3>
                      <p className="text-muted-foreground">
                        We use cookies and similar tracking technologies to track activity on our service and hold certain
                        information to improve user experience.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-3">7. Your Rights</h3>
                      <p className="text-muted-foreground">
                        You have the right to access, update, or delete your personal information. You may also opt-out
                        of certain communications from us.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-3">8. Children's Privacy</h3>
                      <p className="text-muted-foreground">
                        Our service is not intended for anyone under the age of 18. We do not knowingly collect personal
                        information from children under 18.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </FadeIn>

            {/* Contact Section */}
            <FadeIn delay={0.2}>
              <div id="contact">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold">Contact Us</h2>
                </div>

                <Card className="border-2 mb-8">
                  <CardContent className="p-6">
                    <p className="text-muted-foreground mb-4">
                      If you have any questions about these Terms of Service or Privacy Policy, please contact us:
                    </p>
                    <ul className="space-y-3 text-muted-foreground">
                      <li className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-primary" />
                        <span>Email: </span>
                        <a href="mailto:legal@proplinka.com" className="text-primary hover:underline">legal@proplinka.com</a>
                      </li>
                      <li>Phone: +27 21 555 0123</li>
                      <li>Address: 123 Main Road, Sea Point, Cape Town, 8005, South Africa</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="border-2 bg-muted/30">
                  <CardContent className="p-6">
                    <p className="text-sm text-muted-foreground">
                      By using PropLinka, you acknowledge that you have read and understood these Terms of Service
                      and Privacy Policy and agree to be bound by them.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </FadeIn>
          </div>
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
