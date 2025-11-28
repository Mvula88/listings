'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Shield,
  Loader2,
  AlertCircle,
  CheckCircle,
  XCircle,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { verifyInvitationToken, acceptModeratorInvitation } from '@/lib/actions/admin-moderators'

type Status = 'loading' | 'valid' | 'invalid' | 'accepting' | 'success' | 'error'

export default function ModeratorInvitePage() {
  const params = useParams()
  const router = useRouter()
  const token = params.token as string
  const supabase = createClient()

  const [status, setStatus] = useState<Status>('loading')
  const [inviteEmail, setInviteEmail] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Form state for registration
  const [fullName, setFullName] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // Check if user is already logged in
  const [currentUser, setCurrentUser] = useState<any>(null)

  useEffect(() => {
    async function checkInvitation() {
      // Verify token
      const { valid, email } = await verifyInvitationToken(token)

      if (!valid || !email) {
        setStatus('invalid')
        return
      }

      setInviteEmail(email)

      // Check if user is already logged in
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setCurrentUser(user)
      }

      setStatus('valid')
    }

    checkInvitation()
  }, [token, supabase.auth])

  const handleRegisterAndAccept = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setStatus('accepting')

    try {
      // Create new user account
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: inviteEmail!,
        password,
        options: {
          data: {
            full_name: fullName,
          }
        }
      })

      if (signUpError) {
        throw signUpError
      }

      if (!authData.user) {
        throw new Error('Failed to create account')
      }

      // Wait a moment for the profile trigger to create the profile
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Accept the invitation
      const result = await acceptModeratorInvitation(token, authData.user.id)

      if (!result.success) {
        throw new Error(result.error || 'Failed to accept invitation')
      }

      setStatus('success')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setStatus('valid')
    }
  }

  const handleAcceptAsCurrentUser = async () => {
    if (!currentUser) return

    setStatus('accepting')

    try {
      // Check if email matches
      if (currentUser.email !== inviteEmail) {
        throw new Error(`Please sign in with ${inviteEmail} to accept this invitation`)
      }

      // Accept the invitation
      const result = await acceptModeratorInvitation(token, currentUser.id)

      if (!result.success) {
        throw new Error(result.error || 'Failed to accept invitation')
      }

      setStatus('success')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setStatus('valid')
    }
  }

  // Loading state
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-600/10 to-background p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
            <p className="text-muted-foreground">Verifying invitation...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Invalid token
  if (status === 'invalid') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-600/10 to-background p-4">
        <Card className="w-full max-w-md border-red-200">
          <CardContent className="flex flex-col items-center py-12">
            <XCircle className="h-12 w-12 text-red-600 mb-4" />
            <h2 className="text-xl font-bold text-red-600 mb-2">Invalid Invitation</h2>
            <p className="text-muted-foreground text-center mb-6">
              This invitation link is invalid or has expired. Please contact the administrator for a new invitation.
            </p>
            <Button asChild>
              <Link href="/">Return Home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Success state
  if (status === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-600/10 to-background p-4">
        <Card className="w-full max-w-md border-green-200">
          <CardContent className="flex flex-col items-center py-12">
            <CheckCircle className="h-12 w-12 text-green-600 mb-4" />
            <h2 className="text-xl font-bold text-green-600 mb-2">Welcome, Moderator!</h2>
            <p className="text-muted-foreground text-center mb-6">
              Your moderator account has been set up successfully. You can now access the moderation dashboard.
            </p>
            <Button asChild className="bg-blue-600 hover:bg-blue-700">
              <Link href="/moderator-login">Go to Moderator Login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Valid invitation - show form
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-600/10 to-background p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-block">
            <Image
              src="/logo.png"
              alt="PropLinka"
              width={180}
              height={50}
              className="h-10 w-auto mx-auto"
            />
          </Link>
        </div>
        <Card className="border-2 border-blue-200">
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Shield className="h-6 w-6 text-blue-600" />
              <span className="text-sm font-medium text-blue-600 uppercase tracking-wide">
                Moderator Invitation
              </span>
            </div>
            <CardTitle className="text-2xl text-center">Accept Invitation</CardTitle>
            <CardDescription className="text-center">
              You&apos;ve been invited to become a moderator for PropLinka
            </CardDescription>
          </CardHeader>

          {currentUser ? (
            // Already logged in
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  Signed in as:
                </p>
                <p className="font-medium">{currentUser.email}</p>
                {currentUser.email !== inviteEmail && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      This invitation was sent to {inviteEmail}. Please sign out and sign in with that email.
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              <Button
                onClick={handleAcceptAsCurrentUser}
                disabled={status === 'accepting' || currentUser.email !== inviteEmail}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {status === 'accepting' ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Accepting...
                  </>
                ) : (
                  'Accept Invitation'
                )}
              </Button>
            </CardContent>
          ) : (
            // Not logged in - show registration form
            <form onSubmit={handleRegisterAndAccept}>
              <CardContent className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={inviteEmail || ''}
                    disabled
                    className="bg-muted"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    disabled={status === 'accepting'}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={status === 'accepting'}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={status === 'accepting'}
                  />
                </div>
              </CardContent>

              <CardFooter className="flex flex-col space-y-4">
                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={status === 'accepting'}
                >
                  {status === 'accepting' ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    'Create Account & Accept'
                  )}
                </Button>
                <p className="text-sm text-center text-muted-foreground">
                  Already have an account?{' '}
                  <Link href={`/login?redirectTo=/moderator-invite/${token}`} className="text-blue-600 hover:underline">
                    Sign in
                  </Link>
                </p>
              </CardFooter>
            </form>
          )}
        </Card>
      </div>
    </div>
  )
}
