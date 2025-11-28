import * as Sentry from '@sentry/nextjs'

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogContext {
  userId?: string
  action?: string
  entity?: string
  entityId?: string
  metadata?: Record<string, unknown>
  [key: string]: unknown
}

interface LogEntry {
  level: LogLevel
  message: string
  context?: LogContext
  error?: Error
  timestamp: string
}

/**
 * Centralized logger that integrates with Sentry for error tracking
 * and provides structured logging for the application
 */
class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development'

  private formatMessage(entry: LogEntry): string {
    const contextStr = entry.context
      ? ` | ${JSON.stringify(entry.context)}`
      : ''
    return `[${entry.timestamp}] [${entry.level.toUpperCase()}] ${entry.message}${contextStr}`
  }

  private log(level: LogLevel, message: string, context?: LogContext, error?: Error) {
    const entry: LogEntry = {
      level,
      message,
      context,
      error,
      timestamp: new Date().toISOString(),
    }

    // Always log to console in development
    if (this.isDevelopment) {
      const formattedMessage = this.formatMessage(entry)
      switch (level) {
        case 'debug':
          console.debug(formattedMessage)
          break
        case 'info':
          console.info(formattedMessage)
          break
        case 'warn':
          console.warn(formattedMessage)
          break
        case 'error':
          console.error(formattedMessage, error)
          break
      }
    }

    // Send to Sentry based on level
    if (level === 'error' && error) {
      Sentry.captureException(error, {
        level: 'error',
        tags: {
          action: context?.action,
          entity: context?.entity,
        },
        extra: {
          message,
          ...context,
        },
        user: context?.userId ? { id: context.userId } : undefined,
      })
    } else if (level === 'warn') {
      Sentry.captureMessage(message, {
        level: 'warning',
        tags: {
          action: context?.action,
          entity: context?.entity,
        },
        extra: context,
        user: context?.userId ? { id: context.userId } : undefined,
      })
    } else if (level === 'info' && context?.action) {
      // Add breadcrumb for important info logs
      Sentry.addBreadcrumb({
        category: context.entity || 'app',
        message,
        level: 'info',
        data: context,
      })
    }
  }

  debug(message: string, context?: LogContext) {
    this.log('debug', message, context)
  }

  info(message: string, context?: LogContext) {
    this.log('info', message, context)
  }

  warn(message: string, context?: LogContext) {
    this.log('warn', message, context)
  }

  error(message: string, error?: Error, context?: LogContext) {
    this.log('error', message, context, error)
  }

  /**
   * Log an action for audit purposes
   */
  audit(action: string, context: LogContext) {
    this.info(`AUDIT: ${action}`, { ...context, action })

    // Also add to Sentry as a breadcrumb
    Sentry.addBreadcrumb({
      category: 'audit',
      message: action,
      level: 'info',
      data: context,
    })
  }

  /**
   * Log a security-related event
   */
  security(message: string, context?: LogContext) {
    this.warn(`SECURITY: ${message}`, context)

    // Send security events to Sentry immediately
    Sentry.captureMessage(`Security Event: ${message}`, {
      level: 'warning',
      tags: {
        type: 'security',
        action: context?.action,
      },
      extra: context,
    })
  }

  /**
   * Set user context for subsequent logs
   */
  setUser(userId: string, email?: string) {
    Sentry.setUser({
      id: userId,
      email,
    })
  }

  /**
   * Clear user context (e.g., on logout)
   */
  clearUser() {
    Sentry.setUser(null)
  }

  /**
   * Create a child logger with preset context
   */
  child(defaultContext: LogContext): ChildLogger {
    return new ChildLogger(this, defaultContext)
  }
}

class ChildLogger {
  constructor(
    private parent: Logger,
    private defaultContext: LogContext
  ) {}

  private mergeContext(context?: LogContext): LogContext {
    return { ...this.defaultContext, ...context }
  }

  debug(message: string, context?: LogContext) {
    this.parent.debug(message, this.mergeContext(context))
  }

  info(message: string, context?: LogContext) {
    this.parent.info(message, this.mergeContext(context))
  }

  warn(message: string, context?: LogContext) {
    this.parent.warn(message, this.mergeContext(context))
  }

  error(message: string, error?: Error, context?: LogContext) {
    this.parent.error(message, error, this.mergeContext(context))
  }
}

// Export singleton instance
export const logger = new Logger()

// Export types for consumers
export type { LogContext, LogLevel }

// Convenience functions for common logging patterns
export function logPropertyAction(
  action: string,
  propertyId: string,
  userId: string,
  metadata?: Record<string, unknown>
) {
  logger.audit(action, {
    entity: 'property',
    entityId: propertyId,
    userId,
    action,
    metadata,
  })
}

export function logTransactionAction(
  action: string,
  transactionId: string,
  userId: string,
  metadata?: Record<string, unknown>
) {
  logger.audit(action, {
    entity: 'transaction',
    entityId: transactionId,
    userId,
    action,
    metadata,
  })
}

export function logModerationAction(
  action: string,
  propertyId: string,
  moderatorId: string,
  metadata?: Record<string, unknown>
) {
  logger.audit(action, {
    entity: 'moderation',
    entityId: propertyId,
    userId: moderatorId,
    action,
    metadata,
  })
}

export function logPaymentEvent(
  event: string,
  userId: string,
  amount?: number,
  metadata?: Record<string, unknown>
) {
  logger.info(`Payment: ${event}`, {
    entity: 'payment',
    userId,
    action: event,
    metadata: { amount, ...metadata },
  })
}

export function logSecurityEvent(
  event: string,
  userId?: string,
  metadata?: Record<string, unknown>
) {
  logger.security(event, {
    userId,
    action: event,
    metadata,
  })
}
