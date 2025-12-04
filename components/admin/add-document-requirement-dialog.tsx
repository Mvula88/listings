'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Plus, Loader2 } from 'lucide-react'
import { addDocumentRequirement } from '@/lib/actions/admin-countries'
import { toast } from 'sonner'

interface Props {
  countryId: string
}

export function AddDocumentRequirementDialog({ countryId }: Props) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    document_name: '',
    document_key: '',
    description: '',
    help_text: '',
    is_required: true,
    max_file_size_mb: 5,
  })

  function generateKey(name: string) {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '_')
      .substring(0, 50)
  }

  function handleNameChange(value: string) {
    setForm({
      ...form,
      document_name: value,
      document_key: generateKey(value),
    })
  }

  async function handleSubmit() {
    if (!form.document_name.trim()) {
      toast.error('Document name is required')
      return
    }

    if (!form.document_key.trim()) {
      toast.error('Document key is required')
      return
    }

    setLoading(true)
    try {
      const result = await addDocumentRequirement(countryId, {
        document_name: form.document_name.trim(),
        document_key: form.document_key.trim(),
        description: form.description.trim() || undefined,
        help_text: form.help_text.trim() || undefined,
        is_required: form.is_required,
        max_file_size_mb: form.max_file_size_mb,
      })

      if (result.success) {
        toast.success('Document requirement added')
        setOpen(false)
        setForm({
          document_name: '',
          document_key: '',
          description: '',
          help_text: '',
          is_required: true,
          max_file_size_mb: 5,
        })
      } else {
        toast.error(result.error || 'Failed to add requirement')
      }
    } catch (error) {
      toast.error('An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Document
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Document Requirement</DialogTitle>
          <DialogDescription>
            Add a new document that lawyers must submit for verification
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="add_document_name">Document Name *</Label>
            <Input
              id="add_document_name"
              value={form.document_name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g., Practicing Certificate"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="add_document_key">Document Key</Label>
            <Input
              id="add_document_key"
              value={form.document_key}
              onChange={(e) => setForm({ ...form, document_key: e.target.value })}
              placeholder="e.g., practicing_certificate"
              className="font-mono"
            />
            <p className="text-xs text-muted-foreground">
              Unique identifier for this document type. Auto-generated from name.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="add_description">Description</Label>
            <Textarea
              id="add_description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Brief description of this document"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="add_help_text">Help Text</Label>
            <Textarea
              id="add_help_text"
              value={form.help_text}
              onChange={(e) => setForm({ ...form, help_text: e.target.value })}
              placeholder="Instructions shown to lawyers when uploading this document"
              rows={3}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="add_is_required">Required Document</Label>
              <p className="text-xs text-muted-foreground">
                Lawyers must provide this to be verified
              </p>
            </div>
            <Switch
              id="add_is_required"
              checked={form.is_required}
              onCheckedChange={(checked) =>
                setForm({ ...form, is_required: checked })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="add_max_file_size">Max File Size (MB)</Label>
            <Input
              id="add_max_file_size"
              type="number"
              min={1}
              max={50}
              value={form.max_file_size_mb}
              onChange={(e) =>
                setForm({
                  ...form,
                  max_file_size_mb: parseInt(e.target.value) || 5,
                })
              }
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Add Requirement
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
