'use client'

import { useState, useTransition } from 'react'
import { Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toggleFavorite } from '@/lib/actions/favorites'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils/cn'

interface FavoriteButtonProps {
  propertyId: string
  initialFavorited?: boolean
  variant?: 'default' | 'icon'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  className?: string
}

export function FavoriteButton({
  propertyId,
  initialFavorited = false,
  variant = 'default',
  size = 'default',
  className
}: FavoriteButtonProps) {
  const [isFavorited, setIsFavorited] = useState(initialFavorited)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    startTransition(async () => {
      const result = await toggleFavorite(propertyId)

      if (result.success) {
        setIsFavorited(result.favorited!)
      } else if (result.error === 'Not authenticated') {
        router.push('/login')
      }
    })
  }

  if (variant === 'icon') {
    return (
      <Button
        size="icon"
        variant="secondary"
        className={cn(
          "h-8 w-8 rounded-full transition-all",
          isFavorited ? "bg-red-100 hover:bg-red-200" : "bg-white/80 hover:bg-white",
          className
        )}
        onClick={handleToggle}
        disabled={isPending}
      >
        <Heart
          className={cn(
            "h-4 w-4 transition-all",
            isFavorited ? "fill-red-500 text-red-500" : "text-gray-700"
          )}
        />
      </Button>
    )
  }

  return (
    <Button
      variant={isFavorited ? "default" : "outline"}
      size={size}
      className={className}
      onClick={handleToggle}
      disabled={isPending}
    >
      <Heart
        className={cn(
          "h-4 w-4 mr-2",
          isFavorited && "fill-current"
        )}
      />
      {isFavorited ? 'Saved' : 'Save'}
    </Button>
  )
}
