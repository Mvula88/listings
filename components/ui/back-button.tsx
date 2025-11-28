'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

interface BackButtonProps {
  fallbackUrl?: string
  variant?: 'default' | 'ghost' | 'outline'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  className?: string
}

export function BackButton({
  fallbackUrl = '/browse',
  variant = 'ghost',
  size = 'icon',
  className
}: BackButtonProps) {
  const router = useRouter()

  const handleBack = () => {
    // Check if there's history to go back to
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back()
    } else {
      // Fallback to the provided URL if no history
      router.push(fallbackUrl)
    }
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleBack}
      className={className}
      aria-label="Go back"
    >
      <ArrowLeft className="h-4 w-4" />
    </Button>
  )
}
