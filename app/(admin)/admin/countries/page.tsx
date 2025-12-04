import { getCountries } from '@/lib/actions/admin-countries'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import {
  Globe,
  Plus,
  Settings,
  CheckCircle,
  XCircle,
  FileText,
  DollarSign,
} from 'lucide-react'
import { CountryToggle } from '@/components/admin/country-toggle'

export default async function AdminCountriesPage() {
  const { countries, error } = await getCountries()

  const activeCount = countries.filter((c: any) => c.is_active).length
  const inactiveCount = countries.filter((c: any) => !c.is_active).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Globe className="h-8 w-8" />
            Country Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Configure countries, currencies, and lawyer document requirements
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/countries/new">
            <Plus className="h-4 w-4 mr-2" />
            Add Country
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Countries
            </CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{countries.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Countries
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Inactive Countries
            </CardTitle>
            <XCircle className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-500">{inactiveCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Countries List */}
      <Card>
        <CardHeader>
          <CardTitle>All Countries</CardTitle>
          <CardDescription>
            Manage which countries are available on the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="text-center py-8 text-red-500">
              Error loading countries: {error}
            </div>
          ) : countries.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Globe className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No countries configured yet.</p>
              <Button asChild className="mt-4">
                <Link href="/admin/countries/new">Add First Country</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {countries.map((country: any) => (
                <div
                  key={country.id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-3xl">
                      {country.flag_emoji || '🏳️'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-lg">
                          {country.name}
                        </span>
                        <Badge variant="outline" className="font-mono">
                          {country.code}
                        </Badge>
                        {country.is_active ? (
                          <Badge className="bg-green-500/10 text-green-600">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            <XCircle className="h-3 w-3 mr-1" />
                            Inactive
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          {country.currency_symbol} {country.currency}
                        </span>
                        {country.phone_code && (
                          <span>Phone: {country.phone_code}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <CountryToggle
                      countryId={country.id}
                      isActive={country.is_active}
                    />
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/admin/countries/${country.id}`}>
                        <FileText className="h-4 w-4 mr-2" />
                        Documents
                      </Link>
                    </Button>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/admin/countries/${country.id}/edit`}>
                        <Settings className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
