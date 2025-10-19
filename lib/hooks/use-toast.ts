// ============================================================================
// TOAST NOTIFICATION HOOK
// ============================================================================
// Hook for accessing toast notifications from ToastProvider
// Usage: const { toast } = useToast()
//        toast.success('Saved successfully!')
// IMPORTANT: Requires <ToastProvider> wrapper in app layout
// ============================================================================

'use client'

import { useToastContext } from '@/components/providers/toast-provider'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
  id: string
  type: ToastType
  message: string
  duration?: number
}

export function useToast() {
  const context = useToastContext()

  return {
    toast: context.toast,
    toasts: context.toasts,
    removeToast: context.removeToast,
  }
}
