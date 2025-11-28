import * as Sentry from '@sentry/nextjs'

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Server-side Sentry initialization
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

      // Environment
      environment: process.env.NODE_ENV || 'development',

      // Adjust this value in production, or use tracesSampler for greater control
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

      // Setting this option to true will print useful information to the console while you're setting up Sentry.
      debug: false,

      // Capture unhandled promise rejections
      integrations: [
        Sentry.captureConsoleIntegration({
          levels: ['error', 'warn'],
        }),
      ],

      // Filter out noisy errors
      beforeSend(event, hint) {
        // Don't send errors in development unless explicitly enabled
        if (process.env.NODE_ENV === 'development' && !process.env.SENTRY_DEBUG) {
          console.error('[Sentry Server]', hint.originalException || hint.syntheticException)
          return null
        }
        return event
      },
    })
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    // Edge runtime Sentry initialization
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

      // Environment
      environment: process.env.NODE_ENV || 'development',

      // Adjust this value in production
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

      // Setting this option to true will print useful information to the console while you're setting up Sentry.
      debug: false,
    })
  }
}

export const onRequestError = Sentry.captureRequestError
