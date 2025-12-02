'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
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
import { Trash2, Loader2, Building } from 'lucide-react'
import { deletePropertyImage } from '@/lib/actions/moderation'
import { toast } from 'sonner'

interface PropertyImage {
  id: string
  url: string
  alt_text: string | null
  order_index: number
}

interface ImageManagementProps {
  propertyId: string
  images: PropertyImage[]
}

export function ImageManagement({ propertyId, images }: ImageManagementProps) {
  const router = useRouter()
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const sortedImages = [...images].sort((a, b) => a.order_index - b.order_index)

  const handleDelete = async (imageId: string) => {
    setDeletingId(imageId)
    const result = await deletePropertyImage(propertyId, imageId)

    if (result.success) {
      toast.success('Image deleted successfully')
      router.refresh()
    } else {
      toast.error(result.error || 'Failed to delete image')
    }
    setDeletingId(null)
  }

  if (images.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Building className="h-12 w-12 mx-auto mb-2 opacity-50" />
        <p>No images uploaded</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {sortedImages.map((image, index) => (
        <div
          key={image.id}
          className="relative aspect-video rounded-lg overflow-hidden border group"
        >
          <Image
            src={image.url}
            alt={image.alt_text || `Image ${index + 1}`}
            fill
            className="object-cover"
          />

          {/* Image number badge */}
          <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
            #{index + 1}
          </div>

          {/* Delete button */}
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  size="icon"
                  variant="destructive"
                  className="h-8 w-8"
                  disabled={deletingId === image.id}
                >
                  {deletingId === image.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Image?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete this image from the listing. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => handleDelete(image.id)}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      ))}
    </div>
  )
}
