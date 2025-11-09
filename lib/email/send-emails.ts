import { resend, FROM_EMAIL } from './resend'
import { render } from '@react-email/render'
import { PropertyApprovedEmail } from './templates/property-approved'
import { PropertyRejectedEmail } from './templates/property-rejected'
import { InquiryReceivedEmail } from './templates/inquiry-received'

export async function sendPropertyApprovedEmail(data: {
  to: string
  sellerName: string
  propertyTitle: string
  propertyUrl: string
  propertyImage?: string
}) {
  if (!process.env.RESEND_API_KEY) {
    console.log('[Email] Skipping property approved email (RESEND_API_KEY not set)')
    return { success: false, message: 'Email service not configured' }
  }

  try {
    const emailHtml = await render(
      PropertyApprovedEmail({
        sellerName: data.sellerName,
        propertyTitle: data.propertyTitle,
        propertyUrl: data.propertyUrl,
        propertyImage: data.propertyImage,
      })
    )

    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: data.to,
      subject: `Property Approved: ${data.propertyTitle}`,
      html: emailHtml,
    })

    console.log('[Email] Property approved email sent:', result)
    return { success: true, data: result }
  } catch (error) {
    console.error('[Email] Failed to send property approved email:', error)
    return { success: false, error }
  }
}

export async function sendPropertyRejectedEmail(data: {
  to: string
  sellerName: string
  propertyTitle: string
  reason?: string
}) {
  if (!process.env.RESEND_API_KEY) {
    console.log('[Email] Skipping property rejected email (RESEND_API_KEY not set)')
    return { success: false, message: 'Email service not configured' }
  }

  try {
    const emailHtml = await render(
      PropertyRejectedEmail({
        sellerName: data.sellerName,
        propertyTitle: data.propertyTitle,
        reason: data.reason,
      })
    )

    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: data.to,
      subject: `Property Requires Updates: ${data.propertyTitle}`,
      html: emailHtml,
    })

    console.log('[Email] Property rejected email sent:', result)
    return { success: true, data: result }
  } catch (error) {
    console.error('[Email] Failed to send property rejected email:', error)
    return { success: false, error }
  }
}

export async function sendInquiryReceivedEmail(data: {
  to: string
  sellerName: string
  buyerName: string
  propertyTitle: string
  propertyUrl: string
  message: string
  messagesUrl: string
}) {
  if (!process.env.RESEND_API_KEY) {
    console.log('[Email] Skipping inquiry received email (RESEND_API_KEY not set)')
    return { success: false, message: 'Email service not configured' }
  }

  try {
    const emailHtml = await render(
      InquiryReceivedEmail({
        sellerName: data.sellerName,
        buyerName: data.buyerName,
        propertyTitle: data.propertyTitle,
        propertyUrl: data.propertyUrl,
        message: data.message,
        messagesUrl: data.messagesUrl,
      })
    )

    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: data.to,
      subject: `New Inquiry: ${data.propertyTitle}`,
      html: emailHtml,
    })

    console.log('[Email] Inquiry received email sent:', result)
    return { success: true, data: result }
  } catch (error) {
    console.error('[Email] Failed to send inquiry received email:', error)
    return { success: false, error }
  }
}
