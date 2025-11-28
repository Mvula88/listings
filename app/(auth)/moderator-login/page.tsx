'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, AlertCircle, Shield } from 'lucide-react'

export default function ModeratorLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Sign in the user
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) throw authError

      if (!authData.user) {
        throw new Error('Login failed')
      }

      // Check if user is a moderator or admin
      const { data: adminProfile, error: adminError } = await supabase
        .from('admin_profiles')
        .select('role, status')
        .eq('id', authData.user.id)
        .single()

      if (adminError || !adminProfile) {
        // Sign out non-moderator users
        await supabase.auth.signOut()
        throw new Error('Access denied. This login is only for moderators.')
      }

      // Check if suspended
      if (adminProfile.status === 'suspended') {
        await supabase.auth.signOut()
        throw new Error('Your moderator account has been suspended. Please contact an administrator.')
      }

      router.push('/moderator')
      router.refresh()
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

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
        <Card className="border-2 shadow-lg border-blue-200">
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Shield className="h-6 w-6 text-blue-600" />
              <span className="text-sm font-medium text-blue-600 uppercase tracking-wide">
                Moderator Portal
              </span>
            </div>
            <CardTitle className="text-2xl text-center">Moderator Login</CardTitle>
            <CardDescription className="text-center">
              Sign in to access the moderation dashboard
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleLogin}>
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
                  placeholder="moderator@proplinka.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={loading}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Sign In to Moderator Dashboard
              </Button>
              <p className="text-sm text-center text-muted-foreground">
                Not a moderator?{' '}
                <Link href="/login" className="text-primary hover:underline">
                  Regular login
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
