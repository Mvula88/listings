'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  FileText,
  Download,
  Trash2,
  CheckCircle,
  Clock,
  User,
  Loader2,
  ExternalLink,
} from 'lucide-react'
import { deleteDocument } from '@/lib/actions/documents'
import { documentTypeLabels, DocumentType } from '@/lib/types/documents'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'

interface Document {
  id: string
  document_type: DocumentType
  document_name: string
  file_url: string
  file_size: number
  mime_type: string
  uploaded_by: string
  uploaded_by_role: string
  verified: boolean
  verified_at: string | null
  notes: string | null
  created_at: string
  uploader: {
    id: string
    full_name: string
    avatar_url: string | null
  }
  verifier: {
    id: string
    full_name: string
  } | null
}

interface DocumentListProps {
  documents: Document[]
  currentUserId: string
  userRole: 'buyer' | 'seller'
}

export function DocumentList({ documents, currentUserId, userRole }: DocumentListProps) {
  const router = useRouter()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (documentId: string) => {
    setDeletingId(documentId)
    const result = await deleteDocument(documentId)

    if (result.success) {
      toast.success('Document deleted')
      router.refresh()
    } else {
      toast.error(result.error || 'Failed to delete document')
    }
    setDeletingId(null)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const getFileIcon = (mimeType: string) => {
    if (mimeType === 'application/pdf') {
      return <FileText className="h-8 w-8 text-red-500" />
    }
    if (mimeType.startsWith('image/')) {
      return <FileText className="h-8 w-8 text-blue-500" />
    }
    return <FileText className="h-8 w-8 text-gray-500" />
  }

  // Group documents by role
  const buyerDocs = documents.filter(d => d.uploaded_by_role === 'buyer')
  const sellerDocs = documents.filter(d => d.uploaded_by_role === 'seller')

  const renderDocument = (doc: Document) => (
    <Card key={doc.id} className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {getFileIcon(doc.mime_type)}
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center gap-2">
              <p className="font-medium truncate">{doc.document_name}</p>
              {doc.verified ? (
                <Badge className="bg-green-500 gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Verified
                </Badge>
              ) : (
                <Badge variant="outline" className="gap-1 text-orange-600">
                  <Clock className="h-3 w-3" />
                  Pending
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {documentTypeLabels[doc.document_type as DocumentType] || doc.document_type}
            </p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>{formatFileSize(doc.file_size)}</span>
              <span className="flex items-center gap-1">
                <User className="h-3 w-3" />
                {doc.uploader.full_name}
              </span>
              <span>{formatDistanceToNow(new Date(doc.created_at), { addSuffix: true })}</span>
            </div>
            {doc.notes && (
              <p className="text-sm text-muted-foreground mt-2 italic">
                "{doc.notes}"
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-1" />
                View
              </a>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a href={doc.file_url} download={doc.document_name}>
                <Download className="h-4 w-4" />
              </a>
            </Button>
            {doc.uploaded_by === currentUserId && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-destructive">
                    {deletingId === doc.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Document</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete "{doc.document_name}"? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleDelete(doc.id)}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )

  if (documents.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold">No documents yet</h3>
          <p className="text-muted-foreground text-center max-w-sm">
            Documents uploaded by you and the other party will appear here
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Buyer Documents */}
      <div>
        <h3 className="text-lg font-semibold mb-3">
          Buyer Documents ({buyerDocs.length})
        </h3>
        {buyerDocs.length === 0 ? (
          <p className="text-sm text-muted-foreground">No buyer documents uploaded yet</p>
        ) : (
          <div className="space-y-3">
            {buyerDocs.map(renderDocument)}
          </div>
        )}
      </div>

      {/* Seller Documents */}
      <div>
        <h3 className="text-lg font-semibold mb-3">
          Seller Documents ({sellerDocs.length})
        </h3>
        {sellerDocs.length === 0 ? (
          <p className="text-sm text-muted-foreground">No seller documents uploaded yet</p>
        ) : (
          <div className="space-y-3">
            {sellerDocs.map(renderDocument)}
          </div>
        )}
      </div>
    </div>
  )
}
