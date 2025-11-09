'use client'

import { useState } from 'react'
import { getContentFlags, reviewContentFlag } from '@/lib/admin/actions'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Loader2, Eye } from 'lucide-react'
import { toast } from 'sonner'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-500',
  approved: 'bg-green-500',
  rejected: 'bg-red-500',
  flagged: 'bg-orange-500',
}

export function ModerationTable({ initialData }: { initialData: any }) {
  const [data, setData] = useState(initialData)
  const [loading, setLoading] = useState(false)
  const [resourceTypeFilter, setResourceTypeFilter] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false)
  const [selectedFlag, setSelectedFlag] = useState<any>(null)
  const [resolutionNotes, setResolutionNotes] = useState('')
  const [reviewing, setReviewing] = useState(false)

  async function handleFilter() {
    setLoading(true)
    try {
      const result = await getContentFlags({
        page: 1,
        pageSize: 20,
        resourceType: resourceTypeFilter || undefined,
        status: statusFilter || undefined,
      })
      setData(result)
    } catch (error) {
      toast.error('Failed to load content flags')
    } finally {
      setLoading(false)
    }
  }

  async function handleReview(status: 'approved' | 'rejected') {
    if (!selectedFlag) return

    setReviewing(true)
    try {
      await reviewContentFlag(selectedFlag.id, status, resolutionNotes)
      toast.success(`Content ${status} successfully`)
      setReviewDialogOpen(false)
      setResolutionNotes('')
      setSelectedFlag(null)

      // Refresh data
      const result = await getContentFlags({
        page: data.pagination.page,
        pageSize: data.pagination.pageSize,
        resourceType: resourceTypeFilter || undefined,
        status: statusFilter || undefined,
      })
      setData(result)
    } catch (error) {
      toast.error('Failed to review content')
    } finally {
      setReviewing(false)
    }
  }

  async function handlePageChange(newPage: number) {
    setLoading(true)
    try {
      const result = await getContentFlags({
        page: newPage,
        pageSize: data.pagination.pageSize,
        resourceType: resourceTypeFilter || undefined,
        status: statusFilter || undefined,
      })
      setData(result)
    } catch (error) {
      toast.error('Failed to load page')
    } finally {
      setLoading(false)
    }
  }

  function openReviewDialog(flag: any) {
    setSelectedFlag(flag)
    setReviewDialogOpen(true)
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Select value={resourceTypeFilter} onValueChange={setResourceTypeFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value=" ">All Types</SelectItem>
            <SelectItem value="property">Property</SelectItem>
            <SelectItem value="review">Review</SelectItem>
            <SelectItem value="message">Message</SelectItem>
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value=" ">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="flagged">Flagged</SelectItem>
          </SelectContent>
        </Select>

        <Button onClick={handleFilter} disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Filter
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Flagged By</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : data.flags?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No content flags found
                </TableCell>
              </TableRow>
            ) : (
              data.flags?.map((flag: any) => (
                <TableRow key={flag.id}>
                  <TableCell className="font-medium capitalize">
                    {flag.resource_type}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{flag.reason}</div>
                    <div className="text-sm text-muted-foreground line-clamp-1">
                      {flag.description}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>{flag.flagged_by_user?.full_name || 'Unknown'}</div>
                    <div className="text-sm text-muted-foreground">
                      {flag.flagged_by_user?.email}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={statusColors[flag.status] || 'bg-gray-500'}>
                      {flag.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(flag.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openReviewDialog(flag)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Review
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {data.flags?.length || 0} of {data.pagination.totalCount} flags
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(data.pagination.page - 1)}
            disabled={data.pagination.page === 1 || loading}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(data.pagination.page + 1)}
            disabled={data.pagination.page >= data.pagination.totalPages || loading}
          >
            Next
          </Button>
        </div>
      </div>

      {/* Review Dialog */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review Flagged Content</DialogTitle>
            <DialogDescription>
              Review the flagged content and decide whether to approve or reject it
            </DialogDescription>
          </DialogHeader>

          {selectedFlag && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Type</Label>
                  <p className="text-sm capitalize">{selectedFlag.resource_type}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Reason</Label>
                  <p className="text-sm">{selectedFlag.reason}</p>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Description</Label>
                <p className="text-sm text-muted-foreground">{selectedFlag.description}</p>
              </div>

              <div>
                <Label className="text-sm font-medium">Flagged By</Label>
                <p className="text-sm">
                  {selectedFlag.flagged_by_user?.full_name} ({selectedFlag.flagged_by_user?.email})
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="resolution">Resolution Notes</Label>
                <Textarea
                  id="resolution"
                  placeholder="Enter your resolution notes..."
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  rows={4}
                />
              </div>
            </div>
          )}

          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => handleReview('approved')}
              disabled={reviewing}
            >
              {reviewing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Approve
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleReview('rejected')}
              disabled={reviewing}
            >
              {reviewing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
