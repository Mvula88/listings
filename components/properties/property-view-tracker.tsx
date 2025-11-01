'use client'

// Property View Tracker Component
// Automatically tracks property views and time spent

import { useEffect, useRef } from 'react'
import {
  trackPropertyView,
  updateViewDuration,
  generateSessionId,
} from '@/lib/utils/property-analytics'

interface PropertyViewTrackerProps {
  propertyId: string
}

export function PropertyViewTracker({ propertyId }: PropertyViewTrackerProps) {
  const sessionIdRef = useRef<string>()
  const startTimeRef = useRef<number>()
  const trackedRef = useRef(false)

  useEffect(() => {
    // Generate or get session ID
    sessionIdRef.current = generateSessionId()
    startTimeRef.current = Date.now()

    // Track view on mount (only once)
    if (!trackedRef.current) {
      trackPropertyView(propertyId, sessionIdRef.current)
      trackedRef.current = true
    }

    // Update duration on unmount or page visibility change
    const updateDuration = () => {
      if (startTimeRef.current && sessionIdRef.current) {
        const durationSeconds = (Date.now() - startTimeRef.current) / 1000
        updateViewDuration(propertyId, sessionIdRef.current, durationSeconds)
      }
    }

    // Handle page visibility changes (when user switches tabs)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        updateDuration()
      } else {
        // Reset start time when user returns
        startTimeRef.current = Date.now()
      }
    }

    // Handle page unload (when user leaves)
    const handleUnload = () => {
      updateDuration()
    }

    // Add event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('beforeunload', handleUnload)

    // Cleanup
    return () => {
      updateDuration()
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('beforeunload', handleUnload)
    }
  }, [propertyId])

  // This component doesn't render anything
  return null
}
