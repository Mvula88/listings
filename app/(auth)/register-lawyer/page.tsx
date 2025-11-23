import { Metadata } from 'next'
import { LawyerRegistrationForm } from '@/components/lawyers/lawyer-registration-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Scale, CheckCircle, DollarSign, Users } from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Lawyer Registration | PropLinka',
  description: 'Join PropLinka as a verified conveyancing lawyer and grow your practice',
}

export default function LawyerRegistrationPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-background">
      <div className="container max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
            <Scale className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Join PropLinka as a Lawyer</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Expand your conveyancing practice and earn commission on every successful transaction
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Benefits Section */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Why Join PropLinka?</CardTitle>
                <CardDescription>
                  Benefits of being a verified lawyer on our platform
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Extra Income Stream</h3>
                    <p className="text-sm text-muted-foreground">
                      Earn 10% commission on platform fees for every transaction you close.
                      Keep R750-R4,500 per deal (average R90K extra per year for 10 deals).
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Quality Leads</h3>
                    <p className="text-sm text-muted-foreground">
                      Get matched with verified buyers and sellers who are serious about closing deals.
                      No more chasing cold leads.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Streamlined Process</h3>
                    <p className="text-sm text-muted-foreground">
                      Our platform handles client matching and fee collection at closing.
                      You focus on the legal work.
                    </p>
                  </div>
                </div>

                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mt-6">
                  <h4 className="font-semibold text-primary mb-2">Commission Tiers</h4>
                  <ul className="text-sm space-y-2 text-muted-foreground">
                    <li><strong className="text-foreground">Bronze (10%):</strong> Standard partners</li>
                    <li><strong className="text-foreground">Silver (15%):</strong> 50+ transactions</li>
                    <li><strong className="text-foreground">Gold (25%):</strong> 100+ transactions</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Valid practicing certificate for conveyancing law</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Registered with Law Society of South Africa or Namibia</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Professional indemnity insurance</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Minimum 2 years experience in property conveyancing</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Registration Form */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Registration Form</CardTitle>
                <CardDescription>
                  Fill in your details to get started. We'll verify your credentials within 24-48 hours.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <LawyerRegistrationForm />
              </CardContent>
            </Card>

            <p className="text-xs text-center text-muted-foreground mt-6">
              Already have an account?{' '}
              <Link href="/login" className="text-primary hover:underline font-medium">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
