// Email Client using Resend
// Handles all email sending operations with retry logic

import { Resend } from 'resend'

if (!process.env.RESEND_API_KEY) {
  console.warn('RESEND_API_KEY not configured. Email notifications will be disabled.')
}

export const resend = new Resend(process.env.RESEND_API_KEY || 'dummy-key')

export const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@proplinka.com'
export const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || 'support@proplinka.com'

// Retry configuration
const DEFAULT_MAX_RETRIES = 3
const DEFAULT_INITIAL_DELAY_MS = 1000 // 1 second
const DEFAULT_MAX_DELAY_MS = 30000 // 30 seconds

// Email templates
export interface EmailTemplate {
  to: string | string[]
  subject: string
  html: string
  text?: string
  replyTo?: string
}

export interface SendEmailOptions {
  maxRetries?: number
  initialDelayMs?: number
  maxDelayMs?: number
}

/**
 * Delay execution for a specified duration
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Calculate exponential backoff delay with jitter
 */
function calculateBackoff(attempt: number, initialDelayMs: number, maxDelayMs: number): number {
  // Exponential backoff: delay = initialDelay * 2^attempt
  const exponentialDelay = initialDelayMs * Math.pow(2, attempt)
  // Add jitter (random 0-25% of delay)
  const jitter = exponentialDelay * (Math.random() * 0.25)
  // Cap at maxDelay
  return Math.min(exponentialDelay + jitter, maxDelayMs)
}

/**
 * Check if an error is retryable
 */
function isRetryableError(error: any): boolean {
  // Retry on network errors, rate limits, and server errors
  if (error?.statusCode) {
    // 429 = rate limit, 5xx = server errors
    return error.statusCode === 429 || error.statusCode >= 500
  }

  // Retry on network-related errors
  const retryableMessages = [
    'ECONNRESET',
    'ETIMEDOUT',
    'ECONNREFUSED',
    'network',
    'timeout',
    'rate limit',
    'too many requests',
  ]

  const errorMessage = error?.message?.toLowerCase() || ''
  return retryableMessages.some(msg => errorMessage.includes(msg.toLowerCase()))
}

/**
 * Send an email using Resend with retry logic
 * @param template - Email template data
 * @param options - Retry options
 * @returns Send result
 */
export async function sendEmail(
  template: EmailTemplate,
  options: SendEmailOptions = {}
) {
  const {
    maxRetries = DEFAULT_MAX_RETRIES,
    initialDelayMs = DEFAULT_INITIAL_DELAY_MS,
    maxDelayMs = DEFAULT_MAX_DELAY_MS,
  } = options

  if (!process.env.RESEND_API_KEY) {
    console.warn('Email not sent - RESEND_API_KEY not configured')
    return { success: false, error: 'Email service not configured' }
  }

  let lastError: any = null

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const { data, error } = await resend.emails.send({
        from: FROM_EMAIL,
        to: template.to,
        subject: template.subject,
        html: template.html,
        text: template.text,
        replyTo: template.replyTo || SUPPORT_EMAIL,
      })

      if (error) {
        lastError = error

        // Check if error is retryable
        if (attempt < maxRetries && isRetryableError(error)) {
          const backoffDelay = calculateBackoff(attempt, initialDelayMs, maxDelayMs)
          console.warn(
            `[Email] Attempt ${attempt + 1}/${maxRetries + 1} failed: ${error.message}. ` +
            `Retrying in ${Math.round(backoffDelay / 1000)}s...`
          )
          await delay(backoffDelay)
          continue
        }

        console.error('[Email] Send error (not retrying):', error)
        return { success: false, error: error.message }
      }

      if (attempt > 0) {
        console.log(`[Email] Sent successfully after ${attempt + 1} attempts`)
      }

      return { success: true, data }
    } catch (error: any) {
      lastError = error

      // Check if error is retryable
      if (attempt < maxRetries && isRetryableError(error)) {
        const backoffDelay = calculateBackoff(attempt, initialDelayMs, maxDelayMs)
        console.warn(
          `[Email] Attempt ${attempt + 1}/${maxRetries + 1} exception: ${error.message}. ` +
          `Retrying in ${Math.round(backoffDelay / 1000)}s...`
        )
        await delay(backoffDelay)
        continue
      }

      console.error('[Email] Send exception (not retrying):', error)
    }
  }

  // All retries exhausted
  console.error(`[Email] Failed after ${maxRetries + 1} attempts:`, lastError)
  return {
    success: false,
    error: lastError instanceof Error ? lastError.message : 'Unknown error after retries',
    attempts: maxRetries + 1,
  }
}

/**
 * Send email to multiple recipients (bulk) with retry logic
 * @param templates - Array of email templates
 * @param options - Retry options applied to each email
 * @returns Array of send results
 */
export async function sendBulkEmails(
  templates: EmailTemplate[],
  options: SendEmailOptions = {}
) {
  const results = await Promise.allSettled(
    templates.map((template) => sendEmail(template, options))
  )

  return results.map((result, index) => ({
    email: templates[index].to,
    success: result.status === 'fulfilled' && result.value.success,
    error: result.status === 'rejected'
      ? result.reason
      : (result.status === 'fulfilled' && !result.value.success ? result.value.error : undefined),
  }))
}

/**
 * Send email with high priority (more retries, shorter delays)
 */
export async function sendEmailHighPriority(template: EmailTemplate) {
  return sendEmail(template, {
    maxRetries: 5,
    initialDelayMs: 500,
    maxDelayMs: 15000,
  })
}

/**
 * Send email with low priority (fewer retries, longer delays to avoid rate limits)
 */
export async function sendEmailLowPriority(template: EmailTemplate) {
  return sendEmail(template, {
    maxRetries: 2,
    initialDelayMs: 2000,
    maxDelayMs: 60000,
  })
}
