'use client'

import { useState } from 'react'
import { getTransactions, cancelTransaction } from '@/lib/admin/actions'
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Loader2, Search, X, ExternalLink, Eye, MessageSquare } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

const statusColors: Record<string, string> = {
  initiated: 'bg-blue-500',
  lawyers_selected: 'bg-purple-500',
  in_progress: 'bg-yellow-500',
  pending_payment: 'bg-orange-500',
  completed: 'bg-green-500',
  cancelled: 'bg-red-500',
}

const statusLabels: Record<string, string> = {
  initiated: 'Initiated',
  lawyers_selected: 'Lawyers Selected',
  in_progress: 'In Progress',
  pending_payment: 'Pending Payment',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

export function TransactionsTable({ initialData }: { initialData: any }) {
  const [data, setData] = useState(initialData)
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null)
  const [cancelReason, setCancelReason] = useState('')
  const [cancelling, setCancelling] = useState(false)

  async function handleSearch() {
    setLoading(true)
    try {
      const result = await getTransactions({
        page: 1,
        pageSize: 20,
        search,
        status: statusFilter || undefined,
      })
      setData(result)
    } catch (error) {
      toast.error('Failed to load transactions')
    } finally {
      setLoading(false)
    }
  }

  async function handleCancelTransaction() {
    if (!selectedTransaction || !cancelReason.trim()) {
      toast.error('Please provide a reason for cancellation')
      return
    }

    setCancelling(true)
    try {
      await cancelTransaction(selectedTransaction.id, cancelReason)
      toast.success('Transaction cancelled successfully')
      setCancelDialogOpen(false)
      setCancelReason('')
      setSelectedTransaction(null)

      // Refresh data
      const result = await getTransactions({
        page: data.pagination.page,
        pageSize: data.pagination.pageSize,
        search,
        status: statusFilter || undefined,
      })
      setData(result)
    } catch (error) {
      toast.error('Failed to cancel transaction')
    } finally {
      setCancelling(false)
    }
  }

  async function handlePageChange(newPage: number) {
    setLoading(true)
    try {
      const result = await getTransactions({
        page: newPage,
        pageSize: data.pagination.pageSize,
        search,
        status: statusFilter || undefined,
      })
      setData(result)
    } catch (error) {
      toast.error('Failed to load page')
    } finally {
      setLoading(false)
    }
  }

  function openCancelDialog(transaction: any) {
    setSelectedTransaction(transaction)
    setCancelDialogOpen(true)
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by property, buyer, or seller..."
              className="pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          {search && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setSearch('')
                handleSearch()
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        <Select value={statusFilter || "all"} onValueChange={(v) => setStatusFilter(v === "all" ? "" : v)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="initiated">Initiated</SelectItem>
            <SelectItem value="lawyers_selected">Lawyers Selected</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="pending_payment">Pending Payment</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>

        <Button onClick={handleSearch} disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Search
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Property</TableHead>
              <TableHead>Buyer</TableHead>
              <TableHead>Seller</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : data.transactions?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No transactions found
                </TableCell>
              </TableRow>
            ) : (
              data.transactions?.map((transaction: any) => (
                <TableRow key={transaction.id}>
                  <TableCell>
                    <div className="font-medium">{transaction.property?.title || 'N/A'}</div>
                    <div className="text-sm text-muted-foreground">
                      {transaction.property?.city || 'N/A'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>{transaction.buyer?.full_name || 'N/A'}</div>
                    <div className="text-sm text-muted-foreground">
                      {transaction.buyer?.email}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>{transaction.seller?.full_name || 'N/A'}</div>
                    <div className="text-sm text-muted-foreground">
                      {transaction.seller?.email}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">
                      {transaction.property?.currency || '$'}
                      {transaction.agreed_price?.toLocaleString() || transaction.property?.price?.toLocaleString() || '0'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={statusColors[transaction.status] || 'bg-gray-500'}>
                      {statusLabels[transaction.status] || transaction.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(transaction.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/admin/transactions/${transaction.id}`}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1"
                        >
                          <Eye className="h-4 w-4" />
                          <span className="hidden sm:inline">Details</span>
                        </Button>
                      </Link>
                      {transaction.property && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(`/properties/${transaction.property.id}`, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      )}
                      {transaction.status !== 'cancelled' && transaction.status !== 'completed' && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => openCancelDialog(transaction)}
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
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
          Showing {data.transactions?.length || 0} of {data.pagination.totalCount} transactions
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

      {/* Cancel Transaction Dialog */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Transaction</AlertDialogTitle>
            <AlertDialogDescription>
              This will cancel the transaction and notify all parties. Please provide a reason.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Cancellation Reason</Label>
              <Textarea
                id="reason"
                placeholder="Enter reason for cancellation..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={cancelling}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelTransaction}
              disabled={cancelling || !cancelReason.trim()}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {cancelling && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirm Cancellation
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
