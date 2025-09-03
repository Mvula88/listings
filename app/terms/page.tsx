import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function TermsPage() {
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

      {/* Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold mb-8">Terms of Service & Privacy Policy</h1>
            
            <div className="prose prose-gray max-w-none space-y-8">
              <section>
                <h2 className="text-2xl font-semibold mb-4">Terms of Service</h2>
                <p className="text-muted-foreground mb-4">
                  Last updated: January 2024
                </p>
                
                <h3 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h3>
                <p className="text-muted-foreground mb-4">
                  By accessing and using DealDirect, you accept and agree to be bound by the terms and provision of this agreement.
                </p>

                <h3 className="text-xl font-semibold mb-3">2. Use of Service</h3>
                <p className="text-muted-foreground mb-4">
                  DealDirect provides a platform for buyers and sellers to connect directly for real estate transactions. 
                  Users must provide accurate information and use the service in compliance with all applicable laws.
                </p>

                <h3 className="text-xl font-semibold mb-3">3. User Accounts</h3>
                <p className="text-muted-foreground mb-4">
                  You are responsible for maintaining the confidentiality of your account and password. You agree to accept 
                  responsibility for all activities that occur under your account.
                </p>

                <h3 className="text-xl font-semibold mb-3">4. Fees and Payments</h3>
                <p className="text-muted-foreground mb-4">
                  DealDirect charges a success fee of R1,000 for buyers and R1,000 for sellers upon successful completion 
                  of a property transaction. This fee is non-refundable once the transaction is complete.
                </p>

                <h3 className="text-xl font-semibold mb-3">5. Property Listings</h3>
                <p className="text-muted-foreground mb-4">
                  Users listing properties must ensure all information is accurate and they have the legal right to sell 
                  the property. DealDirect does not verify property ownership or listing accuracy.
                </p>

                <h3 className="text-xl font-semibold mb-3">6. Limitation of Liability</h3>
                <p className="text-muted-foreground mb-4">
                  DealDirect is not responsible for the accuracy of listings, the outcome of transactions, or any disputes 
                  between users. We provide the platform but are not party to the transactions.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 mt-12">Privacy Policy</h2>
                <p className="text-muted-foreground mb-4">
                  Last updated: January 2024
                </p>

                <h3 className="text-xl font-semibold mb-3">1. Information We Collect</h3>
                <p className="text-muted-foreground mb-4">
                  We collect information you provide directly to us, such as when you create an account, list a property, 
                  or contact us for support. This includes name, email, phone number, and property details.
                </p>

                <h3 className="text-xl font-semibold mb-3">2. How We Use Your Information</h3>
                <p className="text-muted-foreground mb-4">
                  We use the information to provide, maintain, and improve our services, process transactions, 
                  send notifications, and respond to your requests.
                </p>

                <h3 className="text-xl font-semibold mb-3">3. Information Sharing</h3>
                <p className="text-muted-foreground mb-4">
                  We share your information with other users as necessary for property transactions (e.g., buyer 
                  contact info with sellers). We do not sell your personal information to third parties.
                </p>

                <h3 className="text-xl font-semibold mb-3">4. Data Security</h3>
                <p className="text-muted-foreground mb-4">
                  We implement appropriate technical and organizational measures to protect your personal information 
                  against unauthorized access, alteration, disclosure, or destruction.
                </p>

                <h3 className="text-xl font-semibold mb-3">5. Data Retention</h3>
                <p className="text-muted-foreground mb-4">
                  We retain your information for as long as your account is active or as needed to provide services. 
                  You may request deletion of your account at any time.
                </p>

                <h3 className="text-xl font-semibold mb-3">6. Cookies</h3>
                <p className="text-muted-foreground mb-4">
                  We use cookies and similar tracking technologies to track activity on our service and hold certain 
                  information to improve user experience.
                </p>

                <h3 className="text-xl font-semibold mb-3">7. Your Rights</h3>
                <p className="text-muted-foreground mb-4">
                  You have the right to access, update, or delete your personal information. You may also opt-out 
                  of certain communications from us.
                </p>

                <h3 className="text-xl font-semibold mb-3">8. Children's Privacy</h3>
                <p className="text-muted-foreground mb-4">
                  Our service is not intended for anyone under the age of 18. We do not knowingly collect personal 
                  information from children under 18.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 mt-12">Contact Us</h2>
                <p className="text-muted-foreground mb-4">
                  If you have any questions about these Terms of Service or Privacy Policy, please contact us:
                </p>
                <ul className="text-muted-foreground space-y-2">
                  <li>Email: legal@dealdirect.com</li>
                  <li>Phone: +27 21 555 0123</li>
                  <li>Address: 123 Main Road, Sea Point, Cape Town, 8005, South Africa</li>
                </ul>
              </section>

              <section className="border-t pt-8 mt-12">
                <p className="text-sm text-muted-foreground">
                  By using DealDirect, you acknowledge that you have read and understood these Terms of Service 
                  and Privacy Policy and agree to be bound by them.
                </p>
              </section>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 mt-16">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © 2024 DealDirect. All rights reserved.
        </div>
      </footer>
    </div>
  )
}