'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import {
  ChevronLeft,
  ChevronRight,
  X,
  Expand,
  Grid3x3,
  ZoomIn
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import type { PropertyImage } from '@/lib/types'

interface PropertyGalleryProps {
  images: PropertyImage[]
  title: string
}

export function PropertyGallery({ images, title }: PropertyGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showLightbox, setShowLightbox] = useState(false)
  const [showGrid, setShowGrid] = useState(false)

  const sortedImages = images?.sort((a, b) => a.order_index - b.order_index) || []
  const hasImages = sortedImages.length > 0
  const hasMultipleImages = sortedImages.length > 1

  const handlePrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? sortedImages.length - 1 : prev - 1))
  }, [sortedImages.length])

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev === sortedImages.length - 1 ? 0 : prev + 1))
  }, [sortedImages.length])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showLightbox) {
        if (e.key === 'ArrowLeft') handlePrevious()
        if (e.key === 'ArrowRight') handleNext()
        if (e.key === 'Escape') setShowLightbox(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [showLightbox, handlePrevious, handleNext])

  if (!hasImages) {
    return (
      <div className="relative h-64 md:h-96 bg-muted flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-muted-foreground/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <ZoomIn className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">No images available</p>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Main Gallery */}
      <div className="bg-muted">
        <div className="container mx-auto px-4">
          {/* Desktop: Grid Layout for Multiple Images */}
          <div className="hidden md:block">
            {sortedImages.length >= 5 ? (
              // 5+ images: Bento grid layout
              <div className="grid grid-cols-4 grid-rows-2 gap-2 h-[500px] py-4">
                {/* Main large image */}
                <div
                  className="col-span-2 row-span-2 relative rounded-l-xl overflow-hidden cursor-pointer group"
                  onClick={() => { setCurrentIndex(0); setShowLightbox(true) }}
                >
                  <Image
                    src={sortedImages[0].url}
                    alt={sortedImages[0].alt_text || title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    priority
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                </div>

                {/* Side images */}
                {sortedImages.slice(1, 5).map((image, idx) => (
                  <div
                    key={image.id}
                    className={cn(
                      "relative overflow-hidden cursor-pointer group",
                      idx === 1 && "rounded-tr-xl",
                      idx === 3 && "rounded-br-xl"
                    )}
                    onClick={() => { setCurrentIndex(idx + 1); setShowLightbox(true) }}
                  >
                    <Image
                      src={image.url}
                      alt={image.alt_text || `${title} - Image ${idx + 2}`}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />

                    {/* Show more button on last image */}
                    {idx === 3 && sortedImages.length > 5 && (
                      <button
                        onClick={(e) => { e.stopPropagation(); setShowGrid(true) }}
                        className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-semibold hover:bg-black/60 transition-colors"
                      >
                        <div className="text-center">
                          <Grid3x3 className="h-6 w-6 mx-auto mb-1" />
                          +{sortedImages.length - 5} more
                        </div>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : sortedImages.length >= 3 ? (
              // 3-4 images: Simpler grid
              <div className="grid grid-cols-3 gap-2 h-[450px] py-4">
                <div
                  className="col-span-2 relative rounded-l-xl overflow-hidden cursor-pointer group"
                  onClick={() => { setCurrentIndex(0); setShowLightbox(true) }}
                >
                  <Image
                    src={sortedImages[0].url}
                    alt={sortedImages[0].alt_text || title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    priority
                  />
                </div>
                <div className="flex flex-col gap-2">
                  {sortedImages.slice(1, 3).map((image, idx) => (
                    <div
                      key={image.id}
                      className={cn(
                        "relative flex-1 overflow-hidden cursor-pointer group",
                        idx === 0 && "rounded-tr-xl",
                        idx === 1 && "rounded-br-xl"
                      )}
                      onClick={() => { setCurrentIndex(idx + 1); setShowLightbox(true) }}
                    >
                      <Image
                        src={image.url}
                        alt={image.alt_text || `${title} - Image ${idx + 2}`}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              // 1-2 images: Simple layout
              <div
                className="relative h-[450px] rounded-xl overflow-hidden cursor-pointer group my-4"
                onClick={() => setShowLightbox(true)}
              >
                <Image
                  src={sortedImages[0].url}
                  alt={sortedImages[0].alt_text || title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <Button
                  className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
                  variant="secondary"
                >
                  <Expand className="h-4 w-4 mr-2" />
                  View Photos
                </Button>
              </div>
            )}
          </div>

          {/* Mobile: Carousel */}
          <div className="md:hidden relative h-72 sm:h-80">
            <Image
              src={sortedImages[currentIndex].url}
              alt={sortedImages[currentIndex].alt_text || title}
              fill
              className="object-cover"
              priority
            />

            {/* Navigation arrows */}
            {hasMultipleImages && (
              <>
                <button
                  onClick={handlePrevious}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-colors"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={handleNext}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-colors"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}

            {/* Dots indicator */}
            {hasMultipleImages && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                {sortedImages.slice(0, 5).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={cn(
                      "w-2 h-2 rounded-full transition-all",
                      index === currentIndex
                        ? "bg-white w-4"
                        : "bg-white/60 hover:bg-white/80"
                    )}
                  />
                ))}
                {sortedImages.length > 5 && (
                  <span className="text-white text-xs ml-1">+{sortedImages.length - 5}</span>
                )}
              </div>
            )}

            {/* View all button */}
            <button
              onClick={() => setShowLightbox(true)}
              className="absolute bottom-4 right-4 bg-white/90 hover:bg-white rounded-full px-3 py-1.5 text-sm font-medium shadow-lg flex items-center gap-1.5 transition-colors"
            >
              <Expand className="h-4 w-4" />
              {currentIndex + 1}/{sortedImages.length}
            </button>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      <Dialog open={showLightbox} onOpenChange={setShowLightbox}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] w-full h-full p-0 bg-black border-0">
          <div className="relative w-full h-full flex flex-col">
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 bg-gradient-to-b from-black/50 to-transparent">
              <span className="text-white font-medium">
                {currentIndex + 1} / {sortedImages.length}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowGrid(!showGrid)}
                  className="text-white hover:bg-white/20"
                >
                  <Grid3x3 className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowLightbox(false)}
                  className="text-white hover:bg-white/20"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {showGrid ? (
              // Grid view
              <div className="flex-1 overflow-y-auto p-4 pt-16">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {sortedImages.map((image, index) => (
                    <div
                      key={image.id}
                      className={cn(
                        "relative aspect-video cursor-pointer rounded-lg overflow-hidden",
                        index === currentIndex && "ring-2 ring-white"
                      )}
                      onClick={() => {
                        setCurrentIndex(index)
                        setShowGrid(false)
                      }}
                    >
                      <Image
                        src={image.url}
                        alt={image.alt_text || `${title} - Image ${index + 1}`}
                        fill
                        className="object-cover hover:scale-105 transition-transform"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              // Single image view
              <div className="flex-1 flex items-center justify-center p-4 pt-16">
                <div className="relative w-full h-full">
                  <Image
                    src={sortedImages[currentIndex].url}
                    alt={sortedImages[currentIndex].alt_text || title}
                    fill
                    className="object-contain"
                  />
                </div>

                {/* Navigation */}
                {hasMultipleImages && (
                  <>
                    <button
                      onClick={handlePrevious}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
                    >
                      <ChevronLeft className="h-6 w-6 text-white" />
                    </button>
                    <button
                      onClick={handleNext}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
                    >
                      <ChevronRight className="h-6 w-6 text-white" />
                    </button>
                  </>
                )}
              </div>
            )}

            {/* Thumbnail strip */}
            {!showGrid && hasMultipleImages && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                <div className="flex gap-2 justify-center overflow-x-auto pb-2">
                  {sortedImages.map((image, index) => (
                    <button
                      key={image.id}
                      onClick={() => setCurrentIndex(index)}
                      className={cn(
                        "relative w-16 h-12 rounded-md overflow-hidden flex-shrink-0 transition-all",
                        index === currentIndex
                          ? "ring-2 ring-white scale-110"
                          : "opacity-60 hover:opacity-100"
                      )}
                    >
                      <Image
                        src={image.url}
                        alt={image.alt_text || `Thumbnail ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
