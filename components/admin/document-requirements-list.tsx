'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import {
  AlertCircle,
  CheckCircle,
  Edit,
  Trash2,
  GripVertical,
  FileText,
  Loader2,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  updateDocumentRequirement,
  deleteDocumentRequirement,
} from '@/lib/actions/admin-countries'
import { toast } from 'sonner'

interface DocumentRequirement {
  id: string
  country_id: string
  document_name: string
  document_key: string
  description: string | null
  help_text: string | null
  is_required: boolean
  accepted_file_types: string[]
  max_file_size_mb: number
  display_order: number
  is_active: boolean
}

interface Props {
  requirements: DocumentRequirement[]
  countryId: string
}

export function DocumentRequirementsList({ requirements, countryId }: Props) {
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedRequirement, setSelectedRequirement] = useState<DocumentRequirement | null>(null)
  const [loading, setLoading] = useState(false)

  // Form state for editing
  const [editForm, setEditForm] = useState({
    document_name: '',
    description: '',
    help_text: '',
    is_required: true,
    max_file_size_mb: 5,
  })

  function openEditDialog(req: DocumentRequirement) {
    setSelectedRequirement(req)
    setEditForm({
      document_name: req.document_name,
      description: req.description || '',
      help_text: req.help_text || '',
      is_required: req.is_required,
      max_file_size_mb: req.max_file_size_mb,
    })
    setEditDialogOpen(true)
  }

  function openDeleteDialog(req: DocumentRequirement) {
    setSelectedRequirement(req)
    setDeleteDialogOpen(true)
  }

  async function handleToggleActive(req: DocumentRequirement) {
    setLoading(true)
    try {
      const result = await updateDocumentRequirement(req.id, {
        is_active: !req.is_active,
      })
      if (result.success) {
        toast.success(req.is_active ? 'Requirement disabled' : 'Requirement enabled')
      } else {
        toast.error(result.error || 'Failed to update')
      }
    } catch (error) {
      toast.error('An error occurred')
    } finally {
      setLoading(false)
    }
  }

  async function handleSaveEdit() {
    if (!selectedRequirement) return

    setLoading(true)
    try {
      const result = await updateDocumentRequirement(selectedRequirement.id, {
        document_name: editForm.document_name,
        description: editForm.description || undefined,
        help_text: editForm.help_text || undefined,
        is_required: editForm.is_required,
        max_file_size_mb: editForm.max_file_size_mb,
      })

      if (result.success) {
        toast.success('Requirement updated')
        setEditDialogOpen(false)
      } else {
        toast.error(result.error || 'Failed to update')
      }
    } catch (error) {
      toast.error('An error occurred')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    if (!selectedRequirement) return

    setLoading(true)
    try {
      const result = await deleteDocumentRequirement(selectedRequirement.id)
      if (result.success) {
        toast.success('Requirement deleted')
        setDeleteDialogOpen(false)
      } else {
        toast.error(result.error || 'Failed to delete')
      }
    } catch (error) {
      toast.error('An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="space-y-3">
        {requirements.map((req, index) => (
          <div
            key={req.id}
            className={`flex items-center justify-between p-4 rounded-lg border ${
              req.is_active ? 'bg-card' : 'bg-muted/50 opacity-60'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="text-muted-foreground cursor-grab">
                <GripVertical className="h-5 w-5" />
              </div>
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{req.document_name}</span>
                  {req.is_required ? (
                    <Badge variant="destructive" className="text-xs">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Required
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-xs">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Optional
                    </Badge>
                  )}
                  {!req.is_active && (
                    <Badge variant="outline" className="text-xs">
                      Disabled
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground line-clamp-1">
                  {req.description || 'No description'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Key: <code className="bg-muted px-1 rounded">{req.document_key}</code>
                  {' • '}Max size: {req.max_file_size_mb}MB
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Switch
                checked={req.is_active}
                onCheckedChange={() => handleToggleActive(req)}
                disabled={loading}
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => openEditDialog(req)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => openDeleteDialog(req)}
                className="text-red-500 hover:text-red-600"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Document Requirement</DialogTitle>
            <DialogDescription>
              Update the details for this document requirement
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="document_name">Document Name</Label>
              <Input
                id="document_name"
                value={editForm.document_name}
                onChange={(e) =>
                  setEditForm({ ...editForm, document_name: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={editForm.description}
                onChange={(e) =>
                  setEditForm({ ...editForm, description: e.target.value })
                }
                placeholder="Brief description of the document"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="help_text">Help Text</Label>
              <Textarea
                id="help_text"
                value={editForm.help_text}
                onChange={(e) =>
                  setEditForm({ ...editForm, help_text: e.target.value })
                }
                placeholder="Instructions shown to lawyers when uploading"
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="is_required">Required Document</Label>
              <Switch
                id="is_required"
                checked={editForm.is_required}
                onCheckedChange={(checked) =>
                  setEditForm({ ...editForm, is_required: checked })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="max_file_size">Max File Size (MB)</Label>
              <Input
                id="max_file_size"
                type="number"
                min={1}
                max={50}
                value={editForm.max_file_size_mb}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    max_file_size_mb: parseInt(e.target.value) || 5,
                  })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Document Requirement</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedRequirement?.document_name}"?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={loading}
            >
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
