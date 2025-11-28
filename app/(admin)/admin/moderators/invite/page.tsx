'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  ArrowLeft,
  Mail,
  Loader2,
  CheckCircle,
  Copy,
  AlertCircle,
} from 'lucide-react'
import { inviteModerator } from '@/lib/actions/admin-moderators'

export default function InviteModeratorPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [inviteLink, setInviteLink] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setInviteLink(null)

    const result = await inviteModerator(email)

    if (result.success && result.token) {
      const baseUrl = window.location.origin
      setInviteLink(`${baseUrl}/moderator-invite/${result.token}`)
    } else {
      setError(result.error || 'Failed to create invitation')
    }

    setLoading(false)
  }

  const copyToClipboard = async () => {
    if (inviteLink) {
      await navigator.clipboard.writeText(inviteLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const sendAnother = () => {
    setEmail('')
    setInviteLink(null)
    setError(null)
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/moderators">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Invite Moderator</h1>
          <p className="text-muted-foreground">
            Send an invitation to join as a moderator
          </p>
        </div>
      </div>

      {/* Invite Form */}
      {!inviteLink ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Send Invitation
            </CardTitle>
            <CardDescription>
              Enter the email address of the person you want to invite as a moderator.
              They will receive an invitation link that expires in 7 days.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="moderator@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div className="flex gap-3">
                <Button type="submit" disabled={loading || !email}>
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating Invitation...
                    </>
                  ) : (
                    <>
                      <Mail className="h-4 w-4 mr-2" />
                      Create Invitation
                    </>
                  )}
                </Button>
                <Button type="button" variant="outline" asChild>
                  <Link href="/admin/moderators">Cancel</Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              Invitation Created
            </CardTitle>
            <CardDescription>
              Share this link with {email}. The invitation expires in 7 days.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Invitation Link</Label>
              <div className="flex gap-2">
                <Input
                  value={inviteLink}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  variant="outline"
                  onClick={copyToClipboard}
                  className="shrink-0"
                >
                  {copied ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
            </div>

            <Alert>
              <AlertDescription>
                Make sure to share this link securely. The recipient will need to create
                an account or sign in with this email to accept the invitation.
              </AlertDescription>
            </Alert>

            <div className="flex gap-3">
              <Button onClick={sendAnother}>
                <Mail className="h-4 w-4 mr-2" />
                Invite Another
              </Button>
              <Button variant="outline" asChild>
                <Link href="/admin/moderators">Back to Moderators</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
