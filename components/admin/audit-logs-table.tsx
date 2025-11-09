'use client'

import { useState } from 'react'
import { getAuditLogs } from '@/lib/admin/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Loader2, Search, Eye, X } from 'lucide-react'
import { toast } from 'sonner'

const actionColors: Record<string, string> = {
  'user.suspend': 'bg-red-500',
  'user.unsuspend': 'bg-green-500',
  'user.delete': 'bg-red-600',
  'property.approve': 'bg-green-500',
  'property.reject': 'bg-red-500',
  'property.feature': 'bg-blue-500',
  'property.delete': 'bg-red-600',
  'lawyer.verify': 'bg-green-500',
  'lawyer.unverify': 'bg-yellow-500',
  'transaction.cancel': 'bg-red-500',
  'content.moderate': 'bg-purple-500',
  'settings.update': 'bg-blue-500',
}

export function AuditLogsTable({ initialData }: { initialData: any }) {
  const [data, setData] = useState(initialData)
  const [loading, setLoading] = useState(false)
  const [actionFilter, setActionFilter] = useState<string>('')
  const [resourceTypeFilter, setResourceTypeFilter] = useState<string>('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
  const [selectedLog, setSelectedLog] = useState<any>(null)

  async function handleFilter() {
    setLoading(true)
    try {
      const result = await getAuditLogs({
        page: 1,
        pageSize: 50,
        action: actionFilter || undefined,
        resourceType: resourceTypeFilter || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      })
      setData(result)
    } catch (error) {
      toast.error('Failed to load audit logs')
    } finally {
      setLoading(false)
    }
  }

  async function handlePageChange(newPage: number) {
    setLoading(true)
    try {
      const result = await getAuditLogs({
        page: newPage,
        pageSize: data.pagination.pageSize,
        action: actionFilter || undefined,
        resourceType: resourceTypeFilter || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      })
      setData(result)
    } catch (error) {
      toast.error('Failed to load page')
    } finally {
      setLoading(false)
    }
  }

  function openDetailsDialog(log: any) {
    setSelectedLog(log)
    setDetailsDialogOpen(true)
  }

  function clearFilters() {
    setActionFilter('')
    setResourceTypeFilter('')
    setStartDate('')
    setEndDate('')
    handleFilter()
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="All Actions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value=" ">All Actions</SelectItem>
              <SelectItem value="user.suspend">User Suspend</SelectItem>
              <SelectItem value="user.unsuspend">User Unsuspend</SelectItem>
              <SelectItem value="user.delete">User Delete</SelectItem>
              <SelectItem value="property.approve">Property Approve</SelectItem>
              <SelectItem value="property.reject">Property Reject</SelectItem>
              <SelectItem value="property.feature">Property Feature</SelectItem>
              <SelectItem value="property.delete">Property Delete</SelectItem>
              <SelectItem value="lawyer.verify">Lawyer Verify</SelectItem>
              <SelectItem value="transaction.cancel">Transaction Cancel</SelectItem>
              <SelectItem value="content.moderate">Content Moderate</SelectItem>
            </SelectContent>
          </Select>

          <Select value={resourceTypeFilter} onValueChange={setResourceTypeFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Resources" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value=" ">All Resources</SelectItem>
              <SelectItem value="user">User</SelectItem>
              <SelectItem value="property">Property</SelectItem>
              <SelectItem value="lawyer">Lawyer</SelectItem>
              <SelectItem value="transaction">Transaction</SelectItem>
              <SelectItem value="content_flag">Content Flag</SelectItem>
              <SelectItem value="platform_settings">Settings</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={handleFilter} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Filter
          </Button>

          {(actionFilter || resourceTypeFilter || startDate || endDate) && (
            <Button variant="outline" onClick={clearFilters}>
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          )}
        </div>

        <div className="flex gap-3">
          <div className="flex-1">
            <Input
              type="date"
              placeholder="Start Date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="flex-1">
            <Input
              type="date"
              placeholder="End Date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Action</TableHead>
              <TableHead>Admin</TableHead>
              <TableHead>Resource</TableHead>
              <TableHead>IP Address</TableHead>
              <TableHead>Timestamp</TableHead>
              <TableHead className="text-right">Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : data.logs?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No audit logs found
                </TableCell>
              </TableRow>
            ) : (
              data.logs?.map((log: any) => (
                <TableRow key={log.id}>
                  <TableCell>
                    <Badge className={actionColors[log.action] || 'bg-gray-500'}>
                      {log.action}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{log.admin?.full_name || 'Unknown'}</div>
                    <div className="text-sm text-muted-foreground">
                      {log.admin?.email}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <span className="font-medium">{log.resource_type}</span>
                    </div>
                    <div className="text-xs text-muted-foreground font-mono">
                      {log.resource_id?.substring(0, 8)}...
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {log.ip_address || 'N/A'}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {new Date(log.created_at).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(log.created_at).toLocaleTimeString()}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openDetailsDialog(log)}
                    >
                      <Eye className="h-4 w-4" />
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
          Showing {data.logs?.length || 0} of {data.pagination.totalCount} logs
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

      {/* Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Audit Log Details</DialogTitle>
            <DialogDescription>
              Detailed information about this admin action
            </DialogDescription>
          </DialogHeader>

          {selectedLog && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium mb-1">Action</h4>
                  <Badge className={actionColors[selectedLog.action] || 'bg-gray-500'}>
                    {selectedLog.action}
                  </Badge>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-1">Resource Type</h4>
                  <p className="text-sm">{selectedLog.resource_type}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium mb-1">Admin</h4>
                  <p className="text-sm">{selectedLog.admin?.full_name}</p>
                  <p className="text-xs text-muted-foreground">{selectedLog.admin?.email}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-1">Timestamp</h4>
                  <p className="text-sm">
                    {new Date(selectedLog.created_at).toLocaleString()}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-1">Resource ID</h4>
                <p className="text-xs font-mono bg-muted p-2 rounded">
                  {selectedLog.resource_id}
                </p>
              </div>

              {selectedLog.ip_address && (
                <div>
                  <h4 className="text-sm font-medium mb-1">IP Address</h4>
                  <p className="text-sm font-mono">{selectedLog.ip_address}</p>
                </div>
              )}

              {selectedLog.user_agent && (
                <div>
                  <h4 className="text-sm font-medium mb-1">User Agent</h4>
                  <p className="text-xs text-muted-foreground break-all">
                    {selectedLog.user_agent}
                  </p>
                </div>
              )}

              {selectedLog.old_values && (
                <div>
                  <h4 className="text-sm font-medium mb-1">Old Values</h4>
                  <pre className="text-xs bg-muted p-3 rounded overflow-auto max-h-32">
                    {JSON.stringify(selectedLog.old_values, null, 2)}
                  </pre>
                </div>
              )}

              {selectedLog.new_values && (
                <div>
                  <h4 className="text-sm font-medium mb-1">New Values</h4>
                  <pre className="text-xs bg-muted p-3 rounded overflow-auto max-h-32">
                    {JSON.stringify(selectedLog.new_values, null, 2)}
                  </pre>
                </div>
              )}

              {selectedLog.metadata && Object.keys(selectedLog.metadata).length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-1">Metadata</h4>
                  <pre className="text-xs bg-muted p-3 rounded overflow-auto max-h-32">
                    {JSON.stringify(selectedLog.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
