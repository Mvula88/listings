// ============================================================================
// TOAST PROVIDER
// ============================================================================
// Global toast notification provider
// Wrap your app with this to enable toast notifications
// Usage: <ToastProvider>{children}</ToastProvider>
// ============================================================================

'use client'

import { createContext, useContext, useState, useCallback } from 'react'
import { ToastComponent } from '@/components/ui/toast'
import type { Toast, ToastType } from '@/lib/hooks/use-toast'

interface ToastContextValue {
  toasts: Toast[]
  addToast: (type: ToastType, message: string, duration?: number) => string
  removeToast: (id: string) => void
  toast: {
    success: (message: string, duration?: number) => string
    error: (message: string, duration?: number) => string
    warning: (message: string, duration?: number) => string
    info: (message: string, duration?: number) => string
  }
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined)

export function useToastContext() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToastContext must be used within ToastProvider')
  }
  return context
}

let toastId = 0

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const addToast = useCallback((type: ToastType, message: string, duration = 5000) => {
    const id = `toast-${toastId++}`
    const toast: Toast = { id, type, message, duration }

    setToasts((prev) => [...prev, toast])

    return id
  }, [])

  const contextValue: ToastContextValue = {
    toasts,
    addToast,
    removeToast,
    toast: {
      success: (message, duration) => addToast('success', message, duration),
      error: (message, duration) => addToast('error', message, duration),
      warning: (message, duration) => addToast('warning', message, duration),
      info: (message, duration) => addToast('info', message, duration),
    },
  }

  return (
    <ToastContext.Provider value={contextValue}>
      {children}

      {/* Toast Container */}
      <div
        className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none"
        aria-live="polite"
        aria-atomic="true"
      >
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastComponent toast={toast} onClose={removeToast} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
