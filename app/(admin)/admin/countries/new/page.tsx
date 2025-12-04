'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { ArrowLeft, Globe, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { createCountry } from '@/lib/actions/admin-countries'
import { toast } from 'sonner'

export default function NewCountryPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    code: '',
    name: '',
    currency: '',
    currency_symbol: '',
    phone_code: '',
    flag_emoji: '',
    is_active: false,
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!form.code.trim() || !form.name.trim() || !form.currency.trim() || !form.currency_symbol.trim()) {
      toast.error('Please fill in all required fields')
      return
    }

    setLoading(true)
    try {
      const result = await createCountry({
        code: form.code.trim(),
        name: form.name.trim(),
        currency: form.currency.trim(),
        currency_symbol: form.currency_symbol.trim(),
        phone_code: form.phone_code.trim() || undefined,
        flag_emoji: form.flag_emoji.trim() || undefined,
        is_active: form.is_active,
      })

      if (result.success) {
        toast.success('Country created successfully')
        router.push('/admin/countries')
      } else {
        toast.error(result.error || 'Failed to create country')
      }
    } catch (error) {
      toast.error('An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/countries">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Globe className="h-8 w-8" />
            Add New Country
          </h1>
          <p className="text-muted-foreground mt-1">
            Add a new country to the platform
          </p>
        </div>
      </div>

      {/* Form */}
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Country Details</CardTitle>
          <CardDescription>
            Enter the details for the new country
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Country Name *</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g., South Africa"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="code">Country Code *</Label>
                <Input
                  id="code"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  placeholder="e.g., ZA"
                  maxLength={3}
                  className="font-mono uppercase"
                />
                <p className="text-xs text-muted-foreground">
                  ISO 3166-1 alpha-2 code (2 letters)
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="currency">Currency Code *</Label>
                <Input
                  id="currency"
                  value={form.currency}
                  onChange={(e) => setForm({ ...form, currency: e.target.value.toUpperCase() })}
                  placeholder="e.g., ZAR"
                  maxLength={3}
                  className="font-mono uppercase"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency_symbol">Currency Symbol *</Label>
                <Input
                  id="currency_symbol"
                  value={form.currency_symbol}
                  onChange={(e) => setForm({ ...form, currency_symbol: e.target.value })}
                  placeholder="e.g., R"
                  maxLength={5}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="phone_code">Phone Code</Label>
                <Input
                  id="phone_code"
                  value={form.phone_code}
                  onChange={(e) => setForm({ ...form, phone_code: e.target.value })}
                  placeholder="e.g., +27"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="flag_emoji">Flag Emoji</Label>
                <Input
                  id="flag_emoji"
                  value={form.flag_emoji}
                  onChange={(e) => setForm({ ...form, flag_emoji: e.target.value })}
                  placeholder="e.g., 🇿🇦"
                />
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <Label htmlFor="is_active" className="font-medium">Activate Country</Label>
                <p className="text-sm text-muted-foreground">
                  Make this country available on the platform immediately
                </p>
              </div>
              <Switch
                id="is_active"
                checked={form.is_active}
                onCheckedChange={(checked) => setForm({ ...form, is_active: checked })}
              />
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="button" variant="outline" asChild>
                <Link href="/admin/countries">Cancel</Link>
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Create Country
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
