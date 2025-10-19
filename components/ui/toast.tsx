// ============================================================================
// TOAST NOTIFICATION COMPONENT
// ============================================================================
// Visual toast notification with animations
// Used by ToastProvider to display notifications
// ============================================================================

'use client'

import { useEffect } from 'react'
import { X, CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react'
import type { Toast, ToastType } from '@/lib/hooks/use-toast'

interface ToastComponentProps {
  toast: Toast
  onClose: (id: string) => void
}

const toastIcons: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle className="h-5 w-5" />,
  error: <XCircle className="h-5 w-5" />,
  warning: <AlertCircle className="h-5 w-5" />,
  info: <Info className="h-5 w-5" />,
}

const toastStyles: Record<ToastType, string> = {
  success: 'bg-green-50 border-green-200 text-green-900',
  error: 'bg-red-50 border-red-200 text-red-900',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-900',
  info: 'bg-blue-50 border-blue-200 text-blue-900',
}

const toastIconStyles: Record<ToastType, string> = {
  success: 'text-green-600',
  error: 'text-red-600',
  warning: 'text-yellow-600',
  info: 'text-blue-600',
}

export function ToastComponent({ toast, onClose }: ToastComponentProps) {
  useEffect(() => {
    if (toast.duration && toast.duration > 0) {
      const timer = setTimeout(() => {
        onClose(toast.id)
      }, toast.duration)

      return () => clearTimeout(timer)
    }
  }, [toast.id, toast.duration, onClose])

  return (
    <div
      className={`
        flex items-start gap-3 p-4 rounded-lg border shadow-lg
        animate-in slide-in-from-right-full duration-300
        ${toastStyles[toast.type]}
      `}
      role="alert"
      aria-live="polite"
    >
      <div className={toastIconStyles[toast.type]}>
        {toastIcons[toast.type]}
      </div>

      <div className="flex-1 text-sm">
        {toast.message}
      </div>

      <button
        onClick={() => onClose(toast.id)}
        className="text-current opacity-70 hover:opacity-100 transition-opacity"
        aria-label="Close notification"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
