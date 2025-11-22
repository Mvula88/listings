// Email Client using Resend
// Handles all email sending operations

import { Resend } from 'resend'

if (!process.env.RESEND_API_KEY) {
  console.warn('RESEND_API_KEY not configured. Email notifications will be disabled.')
}

export const resend = new Resend(process.env.RESEND_API_KEY || 'dummy-key')

export const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@proplinka.com'
export const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || 'support@proplinka.com'

// Email templates
export interface EmailTemplate {
  to: string | string[]
  subject: string
  html: string
  text?: string
  replyTo?: string
}

/**
 * Send an email using Resend
 * @param template - Email template data
 * @returns Send result
 */
export async function sendEmail(template: EmailTemplate) {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.warn('Email not sent - RESEND_API_KEY not configured')
      return { success: false, error: 'Email service not configured' }
    }

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: template.to,
      subject: template.subject,
      html: template.html,
      text: template.text,
      replyTo: template.replyTo || SUPPORT_EMAIL,
    })

    if (error) {
      console.error('Email send error:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Email send exception:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Send email to multiple recipients (bulk)
 * @param templates - Array of email templates
 * @returns Array of send results
 */
export async function sendBulkEmails(templates: EmailTemplate[]) {
  const results = await Promise.allSettled(
    templates.map((template) => sendEmail(template))
  )

  return results.map((result, index) => ({
    email: templates[index].to,
    success: result.status === 'fulfilled' && result.value.success,
    error: result.status === 'rejected' ? result.reason : undefined,
  }))
}
