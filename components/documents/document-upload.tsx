'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { Upload, Loader2, FileText, X } from 'lucide-react'
import { uploadDocument } from '@/lib/actions/documents'
import { DocumentType, documentTypeLabels, buyerDocumentTypes, sellerDocumentTypes } from '@/lib/types/documents'
import { toast } from 'sonner'

interface DocumentUploadProps {
  transactionId: string
  userRole: 'buyer' | 'seller'
}

export function DocumentUpload({ transactionId, userRole }: DocumentUploadProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [documentType, setDocumentType] = useState<DocumentType | ''>('')
  const [notes, setNotes] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const allowedTypes = userRole === 'buyer' ? buyerDocumentTypes : sellerDocumentTypes

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      const allowedMimeTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
      if (!allowedMimeTypes.includes(file.type)) {
        toast.error('Invalid file type. Please upload PDF, JPG, PNG, or WebP files.')
        return
      }
      // Validate file size (10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File too large. Maximum size is 10MB.')
        return
      }
      setSelectedFile(file)
    }
  }

  const handleUpload = async () => {
    if (!documentType || !selectedFile) {
      toast.error('Please select a document type and file')
      return
    }

    setLoading(true)
    const result = await uploadDocument(transactionId, documentType, selectedFile, notes || undefined)

    if (result.success) {
      toast.success('Document uploaded successfully')
      setOpen(false)
      setDocumentType('')
      setNotes('')
      setSelectedFile(null)
      router.refresh()
    } else {
      toast.error(result.error || 'Failed to upload document')
    }
    setLoading(false)
  }

  const clearFile = () => {
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Upload className="h-4 w-4 mr-2" />
          Upload Document
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload Document</DialogTitle>
          <DialogDescription>
            Upload documents required for this transaction. Accepted formats: PDF, JPG, PNG, WebP (max 10MB)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="type">Document Type</Label>
            <Select value={documentType} onValueChange={(v) => setDocumentType(v as DocumentType)}>
              <SelectTrigger>
                <SelectValue placeholder="Select document type" />
              </SelectTrigger>
              <SelectContent>
                {allowedTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {documentTypeLabels[type]}
                  </SelectItem>
                ))}
                <SelectItem value="other">Other Document</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>File</Label>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.webp"
              onChange={handleFileSelect}
              className="hidden"
            />
            {selectedFile ? (
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <FileText className="h-8 w-8 text-primary" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{selectedFile.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(selectedFile.size / 1024).toFixed(1)} KB
                  </p>
                </div>
                <Button variant="ghost" size="icon" onClick={clearFile}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button
                type="button"
                variant="outline"
                className="w-full h-24 border-dashed"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="flex flex-col items-center gap-2">
                  <Upload className="h-6 w-6 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Click to select file</span>
                </div>
              </Button>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional notes about this document..."
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleUpload} disabled={loading || !documentType || !selectedFile}>
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Upload
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
