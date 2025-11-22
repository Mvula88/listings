import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, Download, CheckCircle } from 'lucide-react'
import { PLATFORM_FEE_TIERS } from '@/lib/utils/savings-calculator'

export default function LawyerAgreementPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-primary">
              PropLinka
            </Link>
            <div className="flex items-center gap-6">
              <Link href="/lawyers" className="text-sm font-medium hover:text-primary">
                Back to Lawyers
              </Link>
              <Link href="/contact">
                <Button size="sm">Contact Us</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <FileText className="h-16 w-16 text-primary mx-auto mb-4" />
          <h1 className="text-4xl font-bold mb-4">Lawyer Partnership Agreement</h1>
          <p className="text-lg text-muted-foreground">
            Review the terms of partnership with PropLinka
          </p>
        </div>

        {/* Download Option */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Download Agreement</CardTitle>
            <CardDescription>
              Download a PDF copy of this agreement for your records
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" size="lg">
              <Download className="h-4 w-4 mr-2" />
              Download PDF Agreement
            </Button>
          </CardContent>
        </Card>

        {/* Agreement Content */}
        <Card>
          <CardContent className="prose prose-sm max-w-none p-8">
            <h2 className="text-2xl font-bold mb-6">PropLinka Lawyer Partnership Agreement</h2>

            <p className="text-sm text-muted-foreground mb-8">
              <strong>Effective Date:</strong> Upon acceptance<br />
              <strong>Between:</strong> PropLinka (Pty) Ltd ("PropLinka") and the Lawyer/Conveyancing Firm ("Partner")
            </p>

            <section className="mb-8">
              <h3 className="text-xl font-semibold mb-4">1. Purpose</h3>
              <p>
                This Agreement establishes a partnership between PropLinka and the Partner to provide conveyancing
                services to buyers and sellers using the PropLinka platform. The Partner will receive pre-qualified
                client leads at no cost and will collect platform fees on behalf of PropLinka as part of the
                settlement process.
              </p>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold mb-4">2. Platform Fee Structure</h3>
              <p className="mb-4">
                The Partner agrees to collect the following tiered platform fees from clients at closing and include
                them in the settlement statement:
              </p>
              <div className="bg-muted/50 rounded-lg p-4">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Property Value</th>
                      <th className="text-right py-2">Platform Fee</th>
                    </tr>
                  </thead>
                  <tbody>
                    {PLATFORM_FEE_TIERS.map((tier, index) => (
                      <tr key={index} className="border-b last:border-0">
                        <td className="py-2">{tier.label}</td>
                        <td className="text-right font-medium">R{tier.fee.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold mb-4">3. Partner Obligations</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <p>
                    <strong>Fee Collection:</strong> Partner shall include the applicable platform fee in all
                    settlement statements for transactions originating from PropLinka and collect this fee from
                    clients at closing.
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <p>
                    <strong>Fee Remittance:</strong> Partner shall remit all collected platform fees to PropLinka
                    within 30 days of transaction closing via bank transfer to the designated account.
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <p>
                    <strong>Deal Reporting:</strong> Partner shall promptly report all deal closures through the
                    PropLinka platform, including settlement reference numbers and confirmation of fee collection.
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <p>
                    <strong>Monthly Reconciliation:</strong> Partner shall submit monthly reconciliation reports by
                    the 5th business day of each month detailing all deals closed and fees collected in the previous
                    month.
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <p>
                    <strong>Documentation:</strong> Partner shall maintain copies of all settlement statements and
                    proof of platform fee collection for a minimum of 7 years for audit purposes.
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold mb-4">4. PropLinka Obligations</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <p>
                    <strong>Lead Generation:</strong> PropLinka shall provide Partner with qualified buyer and
                    seller leads at no cost to the Partner.
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <p>
                    <strong>Platform Access:</strong> PropLinka shall provide Partner with access to the deal
                    management dashboard and all necessary tools to manage transactions.
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <p>
                    <strong>Support:</strong> PropLinka shall provide reasonable technical and customer support to
                    assist Partner with platform use and transaction management.
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold mb-4">5. Exclusivity and Non-Circumvention</h3>
              <p className="mb-3">
                <strong>5.1 Lead Exclusivity:</strong> Partner acknowledges that all leads generated through
                PropLinka are the exclusive property of PropLinka. Partner agrees not to solicit clients directly
                outside the PropLinka platform for similar services.
              </p>
              <p>
                <strong>5.2 Non-Circumvention:</strong> Partner shall not attempt to circumvent the platform fee
                collection or engage in transactions with PropLinka clients outside the platform without written
                consent from PropLinka.
              </p>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold mb-4">6. Territory and Duration</h3>
              <p className="mb-3">
                <strong>6.1 Territory:</strong> Partner shall be assigned a specific geographic territory as agreed
                upon during onboarding. PropLinka reserves the right to add additional partners in the same
                territory as demand grows.
              </p>
              <p className="mb-3">
                <strong>6.2 Initial Term:</strong> This Agreement shall commence on the Effective Date and continue
                for an initial term of 12 months.
              </p>
              <p>
                <strong>6.3 Renewal:</strong> This Agreement shall automatically renew for successive 12-month
                periods unless either party provides 60 days written notice of non-renewal.
              </p>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold mb-4">7. Audit Rights</h3>
              <p>
                PropLinka reserves the right to audit Partner's records related to PropLinka transactions upon
                reasonable notice to verify accurate fee collection and remittance. Partner shall cooperate fully
                with such audits and provide requested documentation within 10 business days.
              </p>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold mb-4">8. Default and Remedies</h3>
              <p className="mb-3">
                <strong>8.1 Default:</strong> Failure to remit platform fees within 30 days, failure to report deals
                within 7 days of closing, or material breach of any term of this Agreement shall constitute default.
              </p>
              <p className="mb-3">
                <strong>8.2 Cure Period:</strong> Upon written notice of default, Partner shall have 15 days to cure
                the default.
              </p>
              <p>
                <strong>8.3 Termination:</strong> Failure to cure default within the cure period shall entitle
                PropLinka to immediately terminate this Agreement and pursue all available legal remedies.
              </p>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold mb-4">9. Termination</h3>
              <p className="mb-3">
                Either party may terminate this Agreement for convenience with 60 days written notice. Upon
                termination, Partner shall:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Complete all pending transactions originated through PropLinka</li>
                <li>Remit all outstanding platform fees within 30 days</li>
                <li>Submit final reconciliation report</li>
                <li>Return or destroy all confidential PropLinka materials</li>
              </ul>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold mb-4">10. Confidentiality</h3>
              <p>
                Partner agrees to maintain the confidentiality of all proprietary information, client data, and
                business practices disclosed by PropLinka and shall not disclose such information to third parties
                without prior written consent.
              </p>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold mb-4">11. Independent Contractor</h3>
              <p>
                Partner is an independent contractor and not an employee, agent, or joint venturer of PropLinka.
                Partner is solely responsible for all taxes, insurance, and professional licensing requirements.
              </p>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold mb-4">12. Governing Law</h3>
              <p>
                This Agreement shall be governed by and construed in accordance with the laws of South Africa.
                Any disputes shall be resolved through arbitration in accordance with the Arbitration Act.
              </p>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold mb-4">13. Entire Agreement</h3>
              <p>
                This Agreement constitutes the entire agreement between the parties and supersedes all prior
                negotiations, representations, and agreements. This Agreement may only be modified by written
                amendment signed by both parties.
              </p>
            </section>

            <div className="bg-muted/50 rounded-lg p-6 mt-8">
              <p className="text-sm mb-4">
                <strong>ACCEPTANCE:</strong> By completing the lawyer onboarding process and checking the acceptance
                box, Partner acknowledges that they have read, understood, and agree to be bound by all terms and
                conditions of this Agreement.
              </p>
              <p className="text-xs text-muted-foreground">
                For questions about this agreement, please contact: legal@proplinka.co.za
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="mt-8 flex gap-4">
          <Link href="/lawyers/onboarding" className="flex-1">
            <Button size="lg" className="w-full">
              Proceed to Onboarding
            </Button>
          </Link>
          <Link href="/contact" className="flex-1">
            <Button size="lg" variant="outline" className="w-full">
              Have Questions? Contact Us
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
