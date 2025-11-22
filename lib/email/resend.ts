import { Resend } from 'resend'

if (!process.env.RESEND_API_KEY) {
  console.warn('RESEND_API_KEY is not set. Email notifications will not work.')
}

export const resend = new Resend(process.env.RESEND_API_KEY || 're_placeholder')

export const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@proplinka.com'
export const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || 'support@proplinka.com'
