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
import { MoreHorizontal, Search, Ban, CheckCircle, Trash, Eye, RotateCcw, Pencil } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { suspendUser, unsuspendUser, deleteUser, restoreUser, updateUser } from '@/lib/admin/actions'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

interface UsersTableProps {
  users: any[]
  pagination: {
    page: number
    pageSize: number
    totalCount: number
    totalPages: number
  }
}

export function UsersTable({ users, pagination }: UsersTableProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [suspendDialogOpen, setSuspendDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editForm, setEditForm] = useState({
    full_name: '',
    phone: '',
    user_type: '',
  })
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '')
  const [userTypeFilter, setUserTypeFilter] = useState(
    searchParams.get('userType') || 'all'
  )
  const [statusFilter, setStatusFilter] = useState(
    searchParams.get('suspended') || 'all'
  )

  const handleSearch = () => {
    const params = new URLSearchParams(searchParams.toString())
    if (searchTerm) {
      params.set('search', searchTerm)
    } else {
      params.delete('search')
    }
    params.set('page', '1')
    router.push(`/admin/users?${params.toString()}`)
  }

  const handleFilter = (type: 'userType' | 'suspended', value: string) => {
    const params = new URLSearchParams(searchParams.toString())

    if (type === 'userType') {
      setUserTypeFilter(value)
      if (value !== 'all') {
        params.set('userType', value)
      } else {
        params.delete('userType')
      }
    } else {
      setStatusFilter(value)
      if (value !== 'all') {
        params.set('suspended', value)
      } else {
        params.delete('suspended')
      }
    }

    params.set('page', '1')
    router.push(`/admin/users?${params.toString()}`)
  }

  const handleSuspend = async (userId: string, reason: string) => {
    setIsLoading(true)
    try {
      await suspendUser(userId, reason)
      toast.success('User suspended successfully')
      router.refresh()
    } catch (error) {
      toast.error('Failed to suspend user')
      console.error(error)
    } finally {
      setIsLoading(false)
      setSuspendDialogOpen(false)
    }
  }

  const handleUnsuspend = async (userId: string) => {
    setIsLoading(true)
    try {
      await unsuspendUser(userId)
      toast.success('User unsuspended successfully')
      router.refresh()
    } catch (error) {
      toast.error('Failed to unsuspend user')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (userId: string) => {
    setIsLoading(true)
    try {
      await deleteUser(userId)
      toast.success('User deleted successfully')
      router.refresh()
    } catch (error) {
      toast.error('Failed to delete user')
      console.error(error)
    } finally {
      setIsLoading(false)
      setDeleteDialogOpen(false)
    }
  }

  const handleRestore = async (userId: string) => {
    setIsLoading(true)
    try {
      const result = await restoreUser(userId)
      if (result?.success) {
        toast.success('User restored successfully')
        router.refresh()
      } else if (result?.error) {
        toast.error(result.error)
        console.error('Restore error:', result.error)
      } else {
        toast.error('Failed to restore user')
      }
    } catch (error: any) {
      toast.error(error?.message || 'Failed to restore user')
      console.error('Restore error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const openEditDialog = (user: any) => {
    setSelectedUser(user)
    setEditForm({
      full_name: user.full_name || '',
      phone: user.phone || '',
      user_type: user.user_type || 'buyer',
    })
    setEditDialogOpen(true)
  }

  const handleUpdate = async () => {
    if (!selectedUser) return
    setIsLoading(true)
    try {
      const result = await updateUser(selectedUser.id, editForm)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('User updated successfully')
        router.refresh()
        setEditDialogOpen(false)
      }
    } catch (error) {
      toast.error('Failed to update user')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  // Helper to determine if user is deleted (by checking if name is [Deleted User] or is_deleted flag)
  const isUserDeleted = (user: any) => {
    return user.is_deleted || user.full_name === '[Deleted User]'
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 flex gap-2">
          <Input
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="flex-1"
          />
          <Button onClick={handleSearch}>
            <Search className="h-4 w-4" />
          </Button>
        </div>
        <Select value={userTypeFilter} onValueChange={(v) => handleFilter('userType', v)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="User Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="buyer">Buyers</SelectItem>
            <SelectItem value="seller">Sellers</SelectItem>
            <SelectItem value="lawyer">Lawyers</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={(v) => handleFilter('suspended', v)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active Only</SelectItem>
            <SelectItem value="false">Active</SelectItem>
            <SelectItem value="true">Suspended</SelectItem>
            <SelectItem value="deleted">Deleted</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Country</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="font-medium">{user.full_name || 'No name'}</div>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {user.user_type || 'N/A'}
                    </Badge>
                  </TableCell>
                  <TableCell>{user.country?.name || 'N/A'}</TableCell>
                  <TableCell>
                    {isUserDeleted(user) ? (
                      <Badge variant="outline" className="bg-gray-100 text-gray-600 border-gray-300">Deleted</Badge>
                    ) : user.is_suspended ? (
                      <Badge variant="destructive">Suspended</Badge>
                    ) : (
                      <Badge variant="default">Active</Badge>
                    )}
                  </TableCell>
                  <TableCell suppressHydrationWarning>
                    {new Date(user.created_at).toLocaleDateString()}
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
                          <Link href={`/admin/users/${user.id}`}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Link>
                        </DropdownMenuItem>
                        {!isUserDeleted(user) && (
                          <DropdownMenuItem
                            onClick={() => openEditDialog(user)}
                            disabled={isLoading}
                          >
                            <Pencil className="h-4 w-4 mr-2" />
                            Edit User
                          </DropdownMenuItem>
                        )}
                        {isUserDeleted(user) ? (
                          <DropdownMenuItem
                            onSelect={(e) => {
                              e.preventDefault()
                              handleRestore(user.id)
                            }}
                            disabled={isLoading}
                            className="text-green-600"
                          >
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Restore User
                          </DropdownMenuItem>
                        ) : user.is_suspended ? (
                          <DropdownMenuItem
                            onClick={() => handleUnsuspend(user.id)}
                            disabled={isLoading}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Unsuspend
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedUser(user)
                              setSuspendDialogOpen(true)
                            }}
                            disabled={isLoading}
                          >
                            <Ban className="h-4 w-4 mr-2" />
                            Suspend
                          </DropdownMenuItem>
                        )}
                        {!isUserDeleted(user) && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedUser(user)
                                setDeleteDialogOpen(true)
                              }}
                              disabled={isLoading}
                              className="text-red-600"
                            >
                              <Trash className="h-4 w-4 mr-2" />
                              Delete User
                            </DropdownMenuItem>
                          </>
                        )}
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
          {pagination.totalCount} users
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page === 1}
            onClick={() => {
              const params = new URLSearchParams(searchParams.toString())
              params.set('page', String(pagination.page - 1))
              router.push(`/admin/users?${params.toString()}`)
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
              router.push(`/admin/users?${params.toString()}`)
            }}
          >
            Next
          </Button>
        </div>
      </div>

      {/* Suspend Dialog */}
      <AlertDialog open={suspendDialogOpen} onOpenChange={setSuspendDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Suspend User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to suspend {selectedUser?.full_name || selectedUser?.email}?
              They will not be able to access the platform until unsuspended.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedUser && handleSuspend(selectedUser.id, 'Admin suspension')}
              className="bg-orange-500 hover:bg-orange-600"
            >
              Suspend User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete{' '}
              {selectedUser?.full_name || selectedUser?.email} and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedUser && handleDelete(selectedUser.id)}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user details for {selectedUser?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="full_name" className="text-right">
                Name
              </Label>
              <Input
                id="full_name"
                value={editForm.full_name}
                onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">
                Phone
              </Label>
              <Input
                id="phone"
                value={editForm.phone}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="user_type" className="text-right">
                User Type
              </Label>
              <Select
                value={editForm.user_type}
                onValueChange={(v) => setEditForm({ ...editForm, user_type: v })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select user type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="buyer">Buyer</SelectItem>
                  <SelectItem value="seller">Seller</SelectItem>
                  <SelectItem value="lawyer">Lawyer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
