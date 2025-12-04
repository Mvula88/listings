'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { ArrowLeft, Globe, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { getCountryWithRequirements, updateCountry } from '@/lib/actions/admin-countries'
import { toast } from 'sonner'

export default function EditCountryPage() {
  const router = useRouter()
  const params = useParams()
  const countryId = params.countryId as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: '',
    currency: '',
    currency_symbol: '',
    phone_code: '',
    flag_emoji: '',
    date_format: '',
    is_active: false,
  })

  useEffect(() => {
    async function loadCountry() {
      const result = await getCountryWithRequirements(countryId)
      if (result.country) {
        setForm({
          name: result.country.name || '',
          currency: result.country.currency || '',
          currency_symbol: result.country.currency_symbol || '',
          phone_code: result.country.phone_code || '',
          flag_emoji: result.country.flag_emoji || '',
          date_format: result.country.date_format || '',
          is_active: result.country.is_active || false,
        })
      } else {
        toast.error('Country not found')
        router.push('/admin/countries')
      }
      setLoading(false)
    }
    loadCountry()
  }, [countryId, router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!form.name.trim() || !form.currency.trim() || !form.currency_symbol.trim()) {
      toast.error('Please fill in all required fields')
      return
    }

    setSaving(true)
    try {
      const result = await updateCountry(countryId, {
        name: form.name.trim(),
        currency: form.currency.trim(),
        currency_symbol: form.currency_symbol.trim(),
        phone_code: form.phone_code.trim() || undefined,
        flag_emoji: form.flag_emoji.trim() || undefined,
        date_format: form.date_format.trim() || undefined,
        is_active: form.is_active,
      })

      if (result.success) {
        toast.success('Country updated successfully')
        router.push('/admin/countries')
      } else {
        toast.error(result.error || 'Failed to update country')
      }
    } catch (error) {
      toast.error('An error occurred')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
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
            Edit Country
          </h1>
          <p className="text-muted-foreground mt-1">
            Update country settings
          </p>
        </div>
      </div>

      {/* Form */}
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Country Details</CardTitle>
          <CardDescription>
            Update the country information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Country Name *</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g., South Africa"
              />
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

            <div className="space-y-2">
              <Label htmlFor="date_format">Date Format</Label>
              <Input
                id="date_format"
                value={form.date_format}
                onChange={(e) => setForm({ ...form, date_format: e.target.value })}
                placeholder="e.g., DD/MM/YYYY"
              />
              <p className="text-xs text-muted-foreground">
                The date format used in this country
              </p>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <Label htmlFor="is_active" className="font-medium">Country Active</Label>
                <p className="text-sm text-muted-foreground">
                  Enable this country on the platform
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
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Save Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Link to Documents */}
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Document Requirements</CardTitle>
          <CardDescription>
            Configure the documents lawyers must submit for this country
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" asChild>
            <Link href={`/admin/countries/${countryId}`}>
              Manage Document Requirements
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
