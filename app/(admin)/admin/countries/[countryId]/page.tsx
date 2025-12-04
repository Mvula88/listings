import { getCountryWithRequirements } from '@/lib/actions/admin-countries'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  ArrowLeft,
  Settings,
  FileText,
  Plus,
  CheckCircle,
  XCircle,
  AlertCircle,
  GripVertical,
} from 'lucide-react'
import { DocumentRequirementsList } from '@/components/admin/document-requirements-list'
import { AddDocumentRequirementDialog } from '@/components/admin/add-document-requirement-dialog'

interface Props {
  params: Promise<{ countryId: string }>
}

export default async function CountryDetailPage({ params }: Props) {
  const { countryId } = await params
  const { country, requirements, error } = await getCountryWithRequirements(countryId)

  if (!country) {
    notFound()
  }

  const requiredDocs = requirements.filter((r: any) => r.is_required && r.is_active)
  const optionalDocs = requirements.filter((r: any) => !r.is_required && r.is_active)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/countries">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Link>
          </Button>
          <div className="flex items-center gap-3">
            <span className="text-4xl">{country.flag_emoji || '🏳️'}</span>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                {country.name}
                <Badge variant="outline" className="font-mono text-lg">
                  {country.code}
                </Badge>
              </h1>
              <p className="text-muted-foreground">
                Manage lawyer document requirements for {country.name}
              </p>
            </div>
          </div>
        </div>
        <Button variant="outline" asChild>
          <Link href={`/admin/countries/${countryId}/edit`}>
            <Settings className="h-4 w-4 mr-2" />
            Edit Country
          </Link>
        </Button>
      </div>

      {/* Country Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>Country Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <p className="font-medium flex items-center gap-2 mt-1">
                {country.is_active ? (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Active
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4 text-gray-400" />
                    Inactive
                  </>
                )}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Currency</p>
              <p className="font-medium mt-1">
                {country.currency_symbol} {country.currency}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Phone Code</p>
              <p className="font-medium mt-1">
                {country.phone_code || 'Not set'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Date Format</p>
              <p className="font-medium mt-1">
                {country.date_format || 'DD/MM/YYYY'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Documents
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{requirements.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Required Documents
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{requiredDocs.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Optional Documents
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{optionalDocs.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Document Requirements */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Lawyer Document Requirements</CardTitle>
            <CardDescription>
              Configure which documents lawyers must submit for verification in {country.name}
            </CardDescription>
          </div>
          <AddDocumentRequirementDialog countryId={countryId} />
        </CardHeader>
        <CardContent>
          {requirements.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-medium">No document requirements</h3>
              <p className="text-muted-foreground mb-4">
                Add document requirements that lawyers must submit for verification
              </p>
              <AddDocumentRequirementDialog countryId={countryId} />
            </div>
          ) : (
            <DocumentRequirementsList
              requirements={requirements}
              countryId={countryId}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
