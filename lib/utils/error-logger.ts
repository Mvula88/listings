// Centralized Error Logging Utility
// Integrates with Sentry and provides consistent error handling

import * as Sentry from '@sentry/nextjs'

export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export interface ErrorContext {
  userId?: string
  userEmail?: string
  propertyId?: string
  transactionId?: string
  page?: string
  action?: string
  metadata?: Record<string, any>
}

/**
 * Logs an error to Sentry with context
 */
export function logError(
  error: Error | string,
  severity: ErrorSeverity = ErrorSeverity.MEDIUM,
  context?: ErrorContext
) {
  const errorObj = typeof error === 'string' ? new Error(error) : error

  Sentry.withScope((scope) => {
    // Set severity level
    scope.setLevel(mapSeverityToSentryLevel(severity))

    // Set tags
    if (context?.page) {
      scope.setTag('page', context.page)
    }
    if (context?.action) {
      scope.setTag('action', context.action)
    }

    // Set user info
    if (context?.userId || context?.userEmail) {
      scope.setUser({
        id: context.userId,
        email: context.userEmail,
      })
    }

    // Set additional context
    if (context?.propertyId) {
      scope.setContext('property', { id: context.propertyId })
    }
    if (context?.transactionId) {
      scope.setContext('transaction', { id: context.transactionId })
    }
    if (context?.metadata) {
      scope.setContext('metadata', context.metadata)
    }

    // Capture the exception
    Sentry.captureException(errorObj)
  })

  // Also log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.error(`[${severity.toUpperCase()}]`, errorObj, context)
  }
}

/**
 * Logs a warning message to Sentry
 */
export function logWarning(message: string, context?: ErrorContext) {
  Sentry.withScope((scope) => {
    scope.setLevel('warning')

    if (context?.page) scope.setTag('page', context.page)
    if (context?.action) scope.setTag('action', context.action)
    if (context?.userId || context?.userEmail) {
      scope.setUser({ id: context.userId, email: context.userEmail })
    }
    if (context?.metadata) {
      scope.setContext('metadata', context.metadata)
    }

    Sentry.captureMessage(message, 'warning')
  })

  if (process.env.NODE_ENV === 'development') {
    console.warn('[WARNING]', message, context)
  }
}

/**
 * Logs an info message to Sentry
 */
export function logInfo(message: string, context?: ErrorContext) {
  Sentry.withScope((scope) => {
    scope.setLevel('info')

    if (context?.page) scope.setTag('page', context.page)
    if (context?.action) scope.setTag('action', context.action)
    if (context?.metadata) {
      scope.setContext('metadata', context.metadata)
    }

    Sentry.captureMessage(message, 'info')
  })

  if (process.env.NODE_ENV === 'development') {
    console.info('[INFO]', message, context)
  }
}

/**
 * Adds a breadcrumb for debugging context
 */
export function addBreadcrumb(
  message: string,
  category: string = 'user-action',
  data?: Record<string, any>
) {
  Sentry.addBreadcrumb({
    message,
    category,
    data,
    level: 'info',
    timestamp: Date.now() / 1000,
  })
}

/**
 * Wraps an async function with error handling
 */
export function withErrorHandling<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  context?: ErrorContext
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await fn(...args)
    } catch (error) {
      logError(
        error instanceof Error ? error : new Error(String(error)),
        ErrorSeverity.HIGH,
        context
      )
      throw error
    }
  }) as T
}

/**
 * Maps custom severity to Sentry severity level
 */
function mapSeverityToSentryLevel(severity: ErrorSeverity): Sentry.SeverityLevel {
  switch (severity) {
    case ErrorSeverity.LOW:
      return 'info'
    case ErrorSeverity.MEDIUM:
      return 'warning'
    case ErrorSeverity.HIGH:
      return 'error'
    case ErrorSeverity.CRITICAL:
      return 'fatal'
    default:
      return 'error'
  }
}

/**
 * Tracks performance metrics
 */
export function trackPerformance(name: string, duration: number, metadata?: Record<string, any>) {
  Sentry.addBreadcrumb({
    category: 'performance',
    message: `${name} took ${duration}ms`,
    data: { duration, ...metadata },
    level: 'info',
  })

  if (process.env.NODE_ENV === 'development') {
    console.log(`[PERFORMANCE] ${name}: ${duration}ms`, metadata)
  }
}

/**
 * Sets user context globally
 */
export function setUserContext(userId: string, email?: string, metadata?: Record<string, any>) {
  Sentry.setUser({
    id: userId,
    email,
    ...metadata,
  })
}

/**
 * Clears user context (on logout)
 */
export function clearUserContext() {
  Sentry.setUser(null)
}
