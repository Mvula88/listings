// Privacy Policy Page

import { Metadata } from 'next'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

export const metadata: Metadata = {
  title: 'Privacy Policy | PropLinka',
  description: 'Privacy Policy for PropLinka - Commission-free real estate marketplace',
}

export default function PrivacyPolicyPage() {
  const lastUpdated = 'November 1, 2025'

  return (
    <div className="container mx-auto py-12 max-w-4xl">
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <h1 className="text-4xl font-bold">Privacy Policy</h1>
          <p className="text-muted-foreground">
            Last updated: {lastUpdated}
          </p>
        </div>

        <Separator />

        <Card className="p-8 prose prose-gray dark:prose-invert max-w-none">
          {/* Introduction */}
          <section>
            <h2>1. Introduction</h2>
            <p>
              Welcome to PropLinka ("we," "our," or "us"). We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.
            </p>
            <p>
              If you have any questions or concerns about this Privacy Policy or our practices regarding your personal information, please contact us at privacy@proplinka.com.
            </p>
          </section>

          {/* Information We Collect */}
          <section>
            <h2>2. Information We Collect</h2>

            <h3>2.1 Personal Information You Provide</h3>
            <p>We collect personal information that you voluntarily provide to us when you:</p>
            <ul>
              <li>Register for an account</li>
              <li>List a property</li>
              <li>Submit an inquiry</li>
              <li>Complete a transaction</li>
              <li>Contact us</li>
            </ul>

            <p>This information may include:</p>
            <ul>
              <li>Name and contact information (email, phone number)</li>
              <li>Account credentials (username, password)</li>
              <li>Property details and images</li>
              <li>Transaction information</li>
              <li>Payment information</li>
              <li>Communication preferences</li>
            </ul>

            <h3>2.2 Automatically Collected Information</h3>
            <p>We automatically collect certain information when you visit our platform:</p>
            <ul>
              <li>IP address and device information</li>
              <li>Browser type and version</li>
              <li>Operating system</li>
              <li>Page views and navigation patterns</li>
              <li>Time spent on pages</li>
              <li>Referral sources</li>
              <li>Cookies and similar technologies</li>
            </ul>
          </section>

          {/* How We Use Your Information */}
          <section>
            <h2>3. How We Use Your Information</h2>
            <p>We use your personal information for the following purposes:</p>

            <h3>3.1 Platform Operation</h3>
            <ul>
              <li>Create and manage your account</li>
              <li>Process property listings</li>
              <li>Facilitate transactions</li>
              <li>Connect buyers, sellers, and lawyers</li>
              <li>Provide customer support</li>
            </ul>

            <h3>3.2 Communication</h3>
            <ul>
              <li>Send transactional emails (inquiries, transaction updates)</li>
              <li>Send notifications about your account</li>
              <li>Respond to your inquiries</li>
              <li>Send marketing communications (with your consent)</li>
            </ul>

            <h3>3.3 Analytics and Improvements</h3>
            <ul>
              <li>Track property views and engagement</li>
              <li>Analyze platform usage</li>
              <li>Improve our services</li>
              <li>Develop new features</li>
            </ul>

            <h3>3.4 Legal and Safety</h3>
            <ul>
              <li>Comply with legal obligations</li>
              <li>Protect against fraud</li>
              <li>Enforce our terms of service</li>
              <li>Protect rights and safety</li>
            </ul>
          </section>

          {/* Information Sharing */}
          <section>
            <h2>4. How We Share Your Information</h2>
            <p>We may share your information in the following situations:</p>

            <h3>4.1 With Other Users</h3>
            <ul>
              <li>Property listings are publicly visible</li>
              <li>Contact information shared when you submit an inquiry</li>
              <li>Transaction parties (buyer, seller, lawyers) see relevant information</li>
              <li>Reviews and ratings are public</li>
            </ul>

            <h3>4.2 With Service Providers</h3>
            <ul>
              <li>Supabase (database and authentication)</li>
              <li>Resend (email delivery)</li>
              <li>Upstash (rate limiting)</li>
              <li>Sentry (error monitoring)</li>
              <li>Vercel (hosting)</li>
            </ul>

            <h3>4.3 For Legal Reasons</h3>
            <ul>
              <li>When required by law</li>
              <li>To protect our rights</li>
              <li>To prevent fraud</li>
              <li>In connection with business transfers</li>
            </ul>

            <h3>4.4 With Your Consent</h3>
            <p>We may share your information for other purposes with your explicit consent.</p>
          </section>

          {/* Data Security */}
          <section>
            <h2>5. Data Security</h2>
            <p>
              We implement appropriate technical and organizational security measures to protect your personal information. However, no method of transmission over the Internet is 100% secure. While we strive to protect your data, we cannot guarantee absolute security.
            </p>
            <p>Security measures include:</p>
            <ul>
              <li>Encryption of data in transit and at rest</li>
              <li>Secure authentication</li>
              <li>Regular security audits</li>
              <li>Access controls and monitoring</li>
              <li>Rate limiting to prevent abuse</li>
            </ul>
          </section>

          {/* Your Rights */}
          <section>
            <h2>6. Your Privacy Rights</h2>
            <p>Depending on your location, you may have the following rights:</p>
            <ul>
              <li><strong>Access:</strong> Request access to your personal information</li>
              <li><strong>Correction:</strong> Request correction of inaccurate information</li>
              <li><strong>Deletion:</strong> Request deletion of your information</li>
              <li><strong>Portability:</strong> Request a copy of your data</li>
              <li><strong>Objection:</strong> Object to processing of your information</li>
              <li><strong>Restriction:</strong> Request restriction of processing</li>
              <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
            </ul>
            <p>
              To exercise these rights, please contact us at privacy@proplinka.com.
            </p>
          </section>

          {/* Cookies */}
          <section>
            <h2>7. Cookies and Tracking</h2>
            <p>
              We use cookies and similar tracking technologies to track activity on our platform and store certain information.
            </p>
            <p>You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our platform.</p>
            <p>For more information, see our <a href="/cookies">Cookie Policy</a>.</p>
          </section>

          {/* Data Retention */}
          <section>
            <h2>8. Data Retention</h2>
            <p>
              We retain your personal information only for as long as necessary for the purposes set out in this Privacy Policy. We will retain and use your information to:
            </p>
            <ul>
              <li>Fulfill the purposes for which we collected it</li>
              <li>Comply with legal obligations</li>
              <li>Resolve disputes</li>
              <li>Enforce our agreements</li>
            </ul>
            <p>
              When your information is no longer needed, we will securely delete or anonymize it.
            </p>
          </section>

          {/* International Transfers */}
          <section>
            <h2>9. International Data Transfers</h2>
            <p>
              Your information may be transferred to and processed in countries other than your own. These countries may have different data protection laws. We ensure appropriate safeguards are in place to protect your information.
            </p>
          </section>

          {/* Children's Privacy */}
          <section>
            <h2>10. Children's Privacy</h2>
            <p>
              Our platform is not intended for children under 18 years of age. We do not knowingly collect personal information from children. If you are a parent or guardian and believe your child has provided us with personal information, please contact us.
            </p>
          </section>

          {/* Changes to Policy */}
          <section>
            <h2>11. Changes to This Privacy Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
            </p>
            <p>
              You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.
            </p>
          </section>

          {/* Contact */}
          <section>
            <h2>12. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us:
            </p>
            <ul>
              <li>Email: privacy@proplinka.com</li>
              <li>Email: support@proplinka.com</li>
              <li>Website: https://proplinka.com/contact</li>
            </ul>
          </section>

          {/* Compliance */}
          <section>
            <h2>13. Compliance</h2>
            <p>
              We comply with applicable data protection laws, including:
            </p>
            <ul>
              <li>General Data Protection Regulation (GDPR) for EU users</li>
              <li>Protection of Personal Information Act (POPIA) for South African users</li>
              <li>Other applicable local regulations</li>
            </ul>
          </section>
        </Card>
      </div>
    </div>
  )
}
