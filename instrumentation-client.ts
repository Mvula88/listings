import * as Sentry from '@sentry/nextjs'

// Client-side Sentry initialization
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Environment
  environment: process.env.NODE_ENV || 'development',

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  // Capture 100% of errors, but only 10% of sessions in production for replay
  replaysOnErrorSampleRate: 1.0,
  replaysSessionSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Integrations
  integrations: [
    Sentry.replayIntegration({
      // Mask sensitive data
      maskAllText: false,
      blockAllMedia: false,
      maskAllInputs: true,
    }),
    Sentry.browserTracingIntegration(),
    Sentry.captureConsoleIntegration({
      levels: ['error'],
    }),
  ],

  // Filter out noisy errors
  beforeSend(event, hint) {
    // Don't send errors in development unless explicitly enabled
    if (process.env.NODE_ENV === 'development' && !process.env.NEXT_PUBLIC_SENTRY_DEBUG) {
      console.error('[Sentry Client]', hint.originalException || hint.syntheticException)
      return null
    }

    // Filter out common non-actionable errors
    const error = hint.originalException
    if (error instanceof Error) {
      // Ignore ResizeObserver errors (browser quirks)
      if (error.message?.includes('ResizeObserver')) {
        return null
      }
      // Ignore network errors from ad blockers
      if (error.message?.includes('blocked by client')) {
        return null
      }
    }

    return event
  },

  // Ignore certain URLs for performance tracing
  tracePropagationTargets: [
    'localhost',
    /^https:\/\/[^/]*\.proplinka\.com/,
    /^https:\/\/[^/]*\.vercel\.app/,
  ],
})
