'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Mail, LogOut, Loader2 } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export default function SuspendedPage() {
  const [loading, setLoading] = useState(true)
  const [signingOut, setSigningOut] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function checkStatus() {
      const { data: { user } } = await supabase.auth.getUser()

      // If not logged in, redirect to login
      if (!user) {
        router.push('/login')
        return
      }

      // Get profile to check suspension status
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_suspended')
        .eq('id', user.id)
        .single() as { data: { is_suspended: boolean } | null }

      // If user is not suspended, redirect to dashboard
      if (!profile?.is_suspended) {
        router.push('/dashboard')
        return
      }

      setLoading(false)
    }

    checkStatus()
  }, [router, supabase])

  async function handleSignOut() {
    setSigningOut(true)
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-background to-muted/30 p-4">
      <div className="mb-8">
        <Image
          src="/logo.png"
          alt="PropLinka"
          width={180}
          height={50}
          className="h-12 w-auto"
          priority
        />
      </div>

      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle className="text-2xl">Account Suspended</CardTitle>
          <CardDescription>
            Your account has been suspended by an administrator.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-lg bg-muted p-4 text-sm text-muted-foreground">
            <p>
              If you believe this is a mistake or would like to appeal this decision,
              please contact our support team.
            </p>
          </div>

          <div className="space-y-3">
            <Button variant="outline" className="w-full" asChild>
              <a href="mailto:support@proplinka.com">
                <Mail className="mr-2 h-4 w-4" />
                Contact Support
              </a>
            </Button>

            <Button
              variant="ghost"
              className="w-full text-muted-foreground"
              onClick={handleSignOut}
              disabled={signingOut}
            >
              {signingOut ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <LogOut className="mr-2 h-4 w-4" />
              )}
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Need help?{' '}
        <Link href="/contact" className="text-primary hover:underline">
          Visit our help center
        </Link>
      </p>
    </div>
  )
}
