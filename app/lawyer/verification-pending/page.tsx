'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Clock, CheckCircle, Mail, ArrowRight, RefreshCw, LogOut } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function VerificationPendingPage() {
  const [checking, setChecking] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  async function checkVerificationStatus() {
    setChecking(true)
    setMessage(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      const { data: lawyer } = await (supabase as any)
        .from('lawyers')
        .select('verified')
        .eq('profile_id', user.id)
        .single()

      if (lawyer?.verified) {
        setMessage('Your account has been verified! Redirecting to dashboard...')
        setTimeout(() => {
          router.push('/dashboard')
        }, 1500)
      } else {
        setMessage('Your account is still pending verification. Please check back later.')
      }
    } catch (error) {
      setMessage('Error checking status. Please try again.')
    } finally {
      setChecking(false)
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-background flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full">
        <CardHeader className="text-center pb-8">
          <div className="mx-auto mb-6 w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
            <Clock className="h-10 w-10 text-blue-600" />
          </div>
          <CardTitle className="text-3xl mb-2">Application Submitted!</CardTitle>
          <CardDescription className="text-lg">
            Your lawyer registration is pending verification
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Registration Complete</h3>
                <p className="text-sm text-muted-foreground">
                  We've received your application and all your information has been securely saved.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Mail className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Verification in Progress</h3>
                <p className="text-sm text-muted-foreground">
                  Our team is reviewing your credentials and will verify your registration number with the relevant Law Society.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">You'll Hear From Us Soon</h3>
                <p className="text-sm text-muted-foreground">
                  Verification typically takes 24-48 hours. You'll receive an email once your account is approved.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h4 className="font-semibold text-blue-900 mb-2">What Happens Next?</h4>
            <ol className="text-sm text-blue-800 space-y-2">
              <li>1. We verify your registration with the Law Society</li>
              <li>2. We review your professional credentials</li>
              <li>3. You receive email confirmation once approved</li>
              <li>4. You can start accepting clients immediately after approval</li>
            </ol>
          </div>

          {message && (
            <div className={`text-center p-4 rounded-lg ${
              message.includes('verified!')
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
            }`}>
              {message}
            </div>
          )}

          <div className="pt-4 space-y-3">
            <Button
              onClick={checkVerificationStatus}
              className="w-full"
              size="lg"
              disabled={checking}
            >
              {checking ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Check Verification Status
                </>
              )}
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/">
                Return to Homepage
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              variant="ghost"
              className="w-full text-muted-foreground"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            Questions? Contact us at{' '}
            <a href="mailto:lawyers@proplinka.com" className="text-primary hover:underline">
              lawyers@proplinka.com
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
