import { resend, FROM_EMAIL } from './resend'
import { render } from '@react-email/render'
import { PropertyApprovedEmail } from './templates/property-approved'
import { PropertyRejectedEmail } from './templates/property-rejected'
import { InquiryReceivedEmail } from './templates/inquiry-received'
import { RemittanceReminderEmail } from './templates/remittance-reminder'
import { FeaturedExpiredEmail } from './templates/featured-expired'

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

export async function sendRemittanceReminderEmail(data: {
  to: string
  lawyerName: string
  firmName: string
  transactionId: string
  amountDue: string
  daysOverdue: number
  dueDate: string
  dashboardUrl: string
  isWarning?: boolean
  isSuspension?: boolean
}) {
  if (!process.env.RESEND_API_KEY) {
    console.log('[Email] Skipping remittance reminder email (RESEND_API_KEY not set)')
    return { success: false, message: 'Email service not configured' }
  }

  try {
    const emailHtml = await render(
      RemittanceReminderEmail({
        lawyerName: data.lawyerName,
        firmName: data.firmName,
        transactionId: data.transactionId,
        amountDue: data.amountDue,
        daysOverdue: data.daysOverdue,
        dueDate: data.dueDate,
        dashboardUrl: data.dashboardUrl,
        isWarning: data.isWarning,
        isSuspension: data.isSuspension,
      })
    )

    let subject = `Remittance Reminder - ${data.firmName}`
    if (data.isSuspension) {
      subject = `URGENT: Account Suspended - ${data.firmName}`
    } else if (data.isWarning) {
      subject = `Payment Overdue (${data.daysOverdue} days) - ${data.firmName}`
    }

    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: data.to,
      subject,
      html: emailHtml,
    })

    console.log('[Email] Remittance reminder email sent:', result)
    return { success: true, data: result }
  } catch (error) {
    console.error('[Email] Failed to send remittance reminder email:', error)
    return { success: false, error }
  }
}

export async function sendFeaturedExpiredEmail(data: {
  to: string
  sellerName: string
  propertyTitle: string
  propertyUrl: string
  renewUrl: string
}) {
  if (!process.env.RESEND_API_KEY) {
    console.log('[Email] Skipping featured expired email (RESEND_API_KEY not set)')
    return { success: false, message: 'Email service not configured' }
  }

  try {
    const emailHtml = await render(
      FeaturedExpiredEmail({
        sellerName: data.sellerName,
        propertyTitle: data.propertyTitle,
        propertyUrl: data.propertyUrl,
        renewUrl: data.renewUrl,
      })
    )

    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: data.to,
      subject: `Featured Listing Expired: ${data.propertyTitle}`,
      html: emailHtml,
    })

    console.log('[Email] Featured expired email sent:', result)
    return { success: true, data: result }
  } catch (error) {
    console.error('[Email] Failed to send featured expired email:', error)
    return { success: false, error }
  }
}
