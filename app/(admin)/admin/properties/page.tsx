import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PropertiesTable } from '@/components/admin/properties-table'
import { getProperties } from '@/lib/admin/actions'
import { Building, Download, CheckCircle, Clock, XCircle } from 'lucide-react'

interface PageProps {
  searchParams: Promise<{
    page?: string
    search?: string
    status?: string
    moderationStatus?: string
  }>
}

export default async function PropertiesPage({ searchParams }: PageProps) {
  const params = await searchParams
  const page = Number(params.page) || 1
  const search = params.search || ''
  const status = params.status || ''
  const moderationStatus = params.moderationStatus || ''

  const { properties, pagination } = await getProperties({
    page,
    pageSize: 20,
    search,
    status,
    moderationStatus,
  })

  const supabase = await createClient()

  // Get counts for different statuses
  const { count: pendingCount } = await supabase
    .from('properties')
    .select('id', { count: 'exact', head: true })
    .eq('moderation_status', 'pending')

  const { count: approvedCount } = await supabase
    .from('properties')
    .select('id', { count: 'exact', head: true })
    .eq('moderation_status', 'approved')

  const { count: rejectedCount } = await supabase
    .from('properties')
    .select('id', { count: 'exact', head: true })
    .eq('moderation_status', 'rejected')

  const { count: featuredCount } = await supabase
    .from('properties')
    .select('id', { count: 'exact', head: true })
    .eq('featured', true)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Property Management</h1>
          <p className="text-muted-foreground mt-1">
            Review, approve, and manage property listings
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-500" />
              Pending Review
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">
              {pendingCount || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Approved
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {approvedCount || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-500" />
              Rejected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              {rejectedCount || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Building className="h-4 w-4 text-blue-500" />
              Featured
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">
              {featuredCount || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Properties Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Properties</CardTitle>
          <CardDescription>
            Search, filter, and manage property listings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PropertiesTable properties={properties} pagination={pagination} />
        </CardContent>
      </Card>
    </div>
  )
}
