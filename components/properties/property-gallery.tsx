'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Grid3x3 } from 'lucide-react'
import type { PropertyImage } from '@/lib/types'

interface PropertyGalleryProps {
  images: PropertyImage[]
  title: string
}

export function PropertyGallery({ images, title }: PropertyGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showGrid, setShowGrid] = useState(false)
  
  const sortedImages = images?.sort((a, b) => a.order_index - b.order_index) || []
  const hasImages = sortedImages.length > 0

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? sortedImages.length - 1 : prev - 1))
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === sortedImages.length - 1 ? 0 : prev + 1))
  }

  if (!hasImages) {
    return (
      <div className="relative h-96 bg-muted flex items-center justify-center">
        <p className="text-muted-foreground">No images available</p>
      </div>
    )
  }

  if (showGrid) {
    return (
      <div className="relative">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 p-4 bg-black">
          {sortedImages.map((image, index) => (
            <div
              key={image.id}
              className="relative aspect-video cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => {
                setCurrentIndex(index)
                setShowGrid(false)
              }}
            >
              <Image
                src={image.url}
                alt={image.alt_text || `${title} - Image ${index + 1}`}
                fill
                className="object-cover"
              />
            </div>
          ))}
        </div>
        <Button
          onClick={() => setShowGrid(false)}
          className="absolute top-4 right-4"
          variant="secondary"
        >
          Close
        </Button>
      </div>
    )
  }

  return (
    <div className="relative h-[500px] bg-black">
      <Image
        src={sortedImages[currentIndex].url}
        alt={sortedImages[currentIndex].alt_text || title}
        fill
        className="object-contain"
        priority
      />
      
      {sortedImages.length > 1 && (
        <>
          <Button
            onClick={handlePrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2"
            size="icon"
            variant="secondary"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <Button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2"
            size="icon"
            variant="secondary"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1">
            {sortedImages.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentIndex ? 'bg-white' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
          
          <Button
            onClick={() => setShowGrid(true)}
            className="absolute bottom-4 right-4"
            size="sm"
            variant="secondary"
          >
            <Grid3x3 className="h-4 w-4 mr-2" />
            Show all ({sortedImages.length})
          </Button>
        </>
      )}
    </div>
  )
}