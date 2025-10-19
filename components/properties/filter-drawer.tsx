'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { SlidersHorizontal, X } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { PropertyFilters } from './property-filters'

interface FilterDrawerProps {
  countries: any[]
  currentFilters: any
}

export function FilterDrawer({ countries, currentFilters }: FilterDrawerProps) {
  const [isOpen, setIsOpen] = useState(false)

  // Count active filters
  const activeFilterCount = Object.keys(currentFilters).filter(
    key => currentFilters[key] && key !== 'q'
  ).length

  return (
    <>
      {/* Mobile Filter Button */}
      <Button
        variant="outline"
        className="md:hidden w-full"
        onClick={() => setIsOpen(true)}
      >
        <SlidersHorizontal className="h-4 w-4 mr-2" />
        Filters
        {activeFilterCount > 0 && (
          <span className="ml-2 bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs">
            {activeFilterCount}
          </span>
        )}
      </Button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Filter Drawer */}
      <div
        className={cn(
          'fixed bottom-0 left-0 right-0 bg-background border-t rounded-t-2xl z-50 transform transition-transform duration-300 ease-in-out md:hidden max-h-[80vh] flex flex-col',
          isOpen ? 'translate-y-0' : 'translate-y-full'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">Filters</h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Filters Content */}
        <div className="flex-1 overflow-y-auto p-4">
          <PropertyFilters
            countries={countries}
            currentFilters={currentFilters}
          />
        </div>

        {/* Apply Button */}
        <div className="p-4 border-t">
          <Button
            className="w-full"
            onClick={() => setIsOpen(false)}
          >
            Apply Filters
          </Button>
        </div>
      </div>
    </>
  )
}
