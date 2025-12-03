'use client'

import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { MoreHorizontal, Search, CheckCircle, XCircle, Star, Trash, Eye, StarOff } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  approveProperty,
  rejectProperty,
  featureProperty,
  unfeatureProperty,
  deleteProperty,
} from '@/lib/admin/actions'
import { toast } from 'sonner'
import Image from 'next/image'

interface PropertiesTableProps {
  properties: any[]
  pagination: {
    page: number
    pageSize: number
    totalCount: number
    totalPages: number
  }
}

export function PropertiesTable({ properties, pagination }: PropertiesTableProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [selectedProperty, setSelectedProperty] = useState<any>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '')
  const [statusFilter, setStatusFilter] = useState(
    searchParams.get('status') || 'all'
  )
  const [moderationFilter, setModerationFilter] = useState(
    searchParams.get('moderationStatus') || 'all'
  )

  const handleSearch = () => {
    const params = new URLSearchParams(searchParams.toString())
    if (searchTerm) {
      params.set('search', searchTerm)
    } else {
      params.delete('search')
    }
    params.set('page', '1')
    router.push(`/admin/properties?${params.toString()}`)
  }

  const handleFilter = (type: 'status' | 'moderationStatus', value: string) => {
    const params = new URLSearchParams(searchParams.toString())

    if (type === 'status') {
      setStatusFilter(value)
      if (value !== 'all') {
        params.set('status', value)
      } else {
        params.delete('status')
      }
    } else {
      setModerationFilter(value)
      if (value !== 'all') {
        params.set('moderationStatus', value)
      } else {
        params.delete('moderationStatus')
      }
    }

    params.set('page', '1')
    router.push(`/admin/properties?${params.toString()}`)
  }

  const handleApprove = async (propertyId: string) => {
    setIsLoading(true)
    try {
      await approveProperty(propertyId)
      toast.success('Property approved successfully')
      router.refresh()
    } catch (error) {
      toast.error('Failed to approve property')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleReject = async (propertyId: string, reason: string) => {
    setIsLoading(true)
    try {
      await rejectProperty(propertyId, reason)
      toast.success('Property rejected')
      router.refresh()
    } catch (error) {
      toast.error('Failed to reject property')
      console.error(error)
    } finally {
      setIsLoading(false)
      setRejectDialogOpen(false)
      setRejectionReason('')
    }
  }

  const handleFeature = async (propertyId: string) => {
    setIsLoading(true)
    try {
      await featureProperty(propertyId)
      toast.success('Property featured successfully')
      router.refresh()
    } catch (error) {
      toast.error('Failed to feature property')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUnfeature = async (propertyId: string) => {
    setIsLoading(true)
    try {
      await unfeatureProperty(propertyId)
      toast.success('Property unfeatured')
      router.refresh()
    } catch (error) {
      toast.error('Failed to unfeature property')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (propertyId: string) => {
    setIsLoading(true)
    try {
      await deleteProperty(propertyId)
      toast.success('Property deleted successfully')
      router.refresh()
    } catch (error) {
      toast.error('Failed to delete property')
      console.error(error)
    } finally {
      setIsLoading(false)
      setDeleteDialogOpen(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 flex gap-2">
          <Input
            placeholder="Search properties..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="flex-1"
          />
          <Button onClick={handleSearch}>
            <Search className="h-4 w-4" />
          </Button>
        </div>
        <Select value={statusFilter} onValueChange={(v) => handleFilter('status', v)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="sold">Sold</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={moderationFilter}
          onValueChange={(v) => handleFilter('moderationStatus', v)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Moderation" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Moderation</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-x-auto">
        <Table className="min-w-[1000px]">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Image</TableHead>
              <TableHead>Property</TableHead>
              <TableHead>Seller</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Moderation</TableHead>
              <TableHead>Views</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {properties.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                  No properties found
                </TableCell>
              </TableRow>
            ) : (
              properties.map((property) => (
                <TableRow key={property.id}>
                  <TableCell>
                    <div className="relative h-12 w-12 rounded-md overflow-hidden bg-muted">
                      {property.property_images?.[0]?.url ? (
                        <Image
                          src={property.property_images[0].url}
                          alt={property.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-xs text-muted-foreground">
                          No image
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-[250px]">
                      <div className="font-medium truncate">{property.title}</div>
                      <div className="text-sm text-muted-foreground truncate">
                        {property.city}, {property.country?.name}
                      </div>
                      {property.featured && (
                        <Badge variant="secondary" className="mt-1">
                          <Star className="h-3 w-3 mr-1" />
                          Featured
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {property.seller?.full_name || 'Unknown'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">
                      {property.country?.currency_symbol}
                      {new Intl.NumberFormat('en-ZA').format(property.price)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        property.status === 'active'
                          ? 'default'
                          : property.status === 'sold'
                            ? 'secondary'
                            : 'outline'
                      }
                    >
                      {property.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        property.moderation_status === 'approved'
                          ? 'default'
                          : property.moderation_status === 'pending'
                            ? 'secondary'
                            : 'destructive'
                      }
                    >
                      {property.moderation_status || 'pending'}
                    </Badge>
                  </TableCell>
                  <TableCell>{property.view_count || 0}</TableCell>
                  <TableCell>
                    {new Date(property.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href={`/properties/${property.id}`} target="_blank">
                            <Eye className="h-4 w-4 mr-2" />
                            View Property
                          </Link>
                        </DropdownMenuItem>
                        {property.moderation_status === 'pending' && (
                          <>
                            <DropdownMenuItem
                              onClick={() => handleApprove(property.id)}
                              disabled={isLoading}
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Approve
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedProperty(property)
                                setRejectDialogOpen(true)
                              }}
                              disabled={isLoading}
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Reject
                            </DropdownMenuItem>
                          </>
                        )}
                        <DropdownMenuSeparator />
                        {property.featured ? (
                          <DropdownMenuItem
                            onClick={() => handleUnfeature(property.id)}
                            disabled={isLoading}
                          >
                            <StarOff className="h-4 w-4 mr-2" />
                            Unfeature
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            onClick={() => handleFeature(property.id)}
                            disabled={isLoading}
                          >
                            <Star className="h-4 w-4 mr-2" />
                            Feature Property
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedProperty(property)
                            setDeleteDialogOpen(true)
                          }}
                          disabled={isLoading}
                          className="text-red-600"
                        >
                          <Trash className="h-4 w-4 mr-2" />
                          Delete Property
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {(pagination.page - 1) * pagination.pageSize + 1} to{' '}
          {Math.min(pagination.page * pagination.pageSize, pagination.totalCount)} of{' '}
          {pagination.totalCount} properties
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page === 1}
            onClick={() => {
              const params = new URLSearchParams(searchParams.toString())
              params.set('page', String(pagination.page - 1))
              router.push(`/admin/properties?${params.toString()}`)
            }}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page >= pagination.totalPages}
            onClick={() => {
              const params = new URLSearchParams(searchParams.toString())
              params.set('page', String(pagination.page + 1))
              router.push(`/admin/properties?${params.toString()}`)
            }}
          >
            Next
          </Button>
        </div>
      </div>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Property</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this property. The seller will be notified.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Enter rejection reason..."
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            rows={4}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() =>
                selectedProperty && handleReject(selectedProperty.id, rejectionReason)
              }
              disabled={!rejectionReason || isLoading}
              variant="destructive"
            >
              Reject Property
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Property</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this property and all
              associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedProperty && handleDelete(selectedProperty.id)}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete Property
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
