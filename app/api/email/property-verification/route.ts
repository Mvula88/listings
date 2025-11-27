import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const { to, propertyTitle, status, reason } = await request.json()

    if (!to || !propertyTitle || !status) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const isApproved = status === 'active'

    const emailHtml = isApproved
      ? getApprovalEmailHtml(propertyTitle)
      : getRejectionEmailHtml(propertyTitle, reason)

    const emailText = isApproved
      ? getApprovalEmailText(propertyTitle)
      : getRejectionEmailText(propertyTitle, reason)

    await resend.emails.send({
      from: 'PropLinka <noreply@proplinka.com>',
      to,
      subject: isApproved
        ? `Property Approved: ${propertyTitle}`
        : `Property Listing Update: ${propertyTitle}`,
      html: emailHtml,
      text: emailText,
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Email send error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

function getApprovalEmailHtml(propertyTitle: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Property Approved</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #10b981; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">✓ Property Approved!</h1>
        </div>

        <div style="background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px;">
          <p style="font-size: 16px; margin-bottom: 20px;">Great news!</p>

          <p style="font-size: 16px; margin-bottom: 20px;">
            Your property listing "<strong>${propertyTitle}</strong>" has been reviewed and approved by our team.
            It is now live on PropLinka and visible to potential buyers.
          </p>

          <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
            <h2 style="color: #10b981; margin-top: 0; font-size: 18px;">What Happens Next?</h2>
            <ul style="margin: 10px 0; padding-left: 20px;">
              <li style="margin-bottom: 10px;">Your property is now searchable on our platform</li>
              <li style="margin-bottom: 10px;">Buyers can view details and submit inquiries</li>
              <li style="margin-bottom: 10px;">You'll receive email notifications for all inquiries</li>
              <li style="margin-bottom: 10px;">Track your property's performance in your dashboard</li>
            </ul>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_URL}/dashboard"
               style="background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">
              View Your Dashboard
            </a>
          </div>

          <div style="background-color: #eff6ff; padding: 15px; border-radius: 6px; margin-top: 20px;">
            <p style="margin: 0; font-size: 14px; color: #1e40af;">
              <strong>Pro Tip:</strong> Properties with high-quality images and detailed descriptions receive 3x more inquiries.
              Consider adding more photos or updating your description to attract more buyers.
            </p>
          </div>
        </div>

        <div style="text-align: center; padding: 20px; color: #6b7280; font-size: 12px;">
          <p>Need help? Contact us at <a href="mailto:support@proplinka.com" style="color: #2563eb;">support@proplinka.com</a></p>
          <p style="margin-top: 10px;">© ${new Date().getFullYear()} PropLinka. All rights reserved.</p>
        </div>
      </body>
    </html>
  `
}

function getRejectionEmailHtml(propertyTitle: string, reason?: string): string {
  const reasonText = reason ? getRejectionReasonText(reason) : 'Please review your listing details and resubmit.'

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Property Listing Update</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #f59e0b; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">Property Listing Requires Attention</h1>
        </div>

        <div style="background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px;">
          <p style="font-size: 16px; margin-bottom: 20px;">Hello,</p>

          <p style="font-size: 16px; margin-bottom: 20px;">
            Thank you for submitting your property listing "<strong>${propertyTitle}</strong>" to PropLinka.
          </p>

          <p style="font-size: 16px; margin-bottom: 20px;">
            After careful review, we need you to make some updates before we can publish your listing.
          </p>

          <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
            <h2 style="color: #f59e0b; margin-top: 0; font-size: 18px;">Reason for Update Required:</h2>
            <p style="margin: 10px 0; font-size: 15px;">${reasonText}</p>
          </div>

          <div style="background-color: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; font-size: 16px; color: #1e40af;">How to Fix This:</h3>
            <ol style="margin: 10px 0; padding-left: 20px;">
              <li style="margin-bottom: 10px;">Log in to your PropLinka dashboard</li>
              <li style="margin-bottom: 10px;">Navigate to your property listing</li>
              <li style="margin-bottom: 10px;">Make the necessary updates</li>
              <li style="margin-bottom: 10px;">Resubmit for review</li>
            </ol>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_URL}/dashboard"
               style="background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">
              Edit Your Listing
            </a>
          </div>

          <p style="font-size: 14px; color: #6b7280; margin-top: 20px;">
            Our verification process ensures all listings on PropLinka meet our quality standards,
            protecting both buyers and sellers. We appreciate your cooperation.
          </p>
        </div>

        <div style="text-align: center; padding: 20px; color: #6b7280; font-size: 12px;">
          <p>Questions? Contact us at <a href="mailto:support@proplinka.com" style="color: #2563eb;">support@proplinka.com</a></p>
          <p style="margin-top: 10px;">© ${new Date().getFullYear()} PropLinka. All rights reserved.</p>
        </div>
      </body>
    </html>
  `
}

function getApprovalEmailText(propertyTitle: string): string {
  return `
Property Approved!

Great news! Your property listing "${propertyTitle}" has been reviewed and approved by our team. It is now live on PropLinka and visible to potential buyers.

What Happens Next?
- Your property is now searchable on our platform
- Buyers can view details and submit inquiries
- You'll receive email notifications for all inquiries
- Track your property's performance in your dashboard

View Your Dashboard: ${process.env.NEXT_PUBLIC_URL}/dashboard

Pro Tip: Properties with high-quality images and detailed descriptions receive 3x more inquiries.

Need help? Contact us at support@proplinka.com

© ${new Date().getFullYear()} PropLinka. All rights reserved.
  `
}

function getRejectionEmailText(propertyTitle: string, reason?: string): string {
  const reasonText = reason ? getRejectionReasonText(reason) : 'Please review your listing details and resubmit.'

  return `
Property Listing Update Required

Hello,

Thank you for submitting your property listing "${propertyTitle}" to PropLinka.

After careful review, we need you to make some updates before we can publish your listing.

Reason: ${reasonText}

How to Fix This:
1. Log in to your PropLinka dashboard
2. Navigate to your property listing
3. Make the necessary updates
4. Resubmit for review

Edit Your Listing: ${process.env.NEXT_PUBLIC_URL}/dashboard

Our verification process ensures all listings on PropLinka meet our quality standards, protecting both buyers and sellers.

Questions? Contact us at support@proplinka.com

© ${new Date().getFullYear()} PropLinka. All rights reserved.
  `
}

function getRejectionReasonText(reason: string): string {
  const reasons: Record<string, string> = {
    incomplete_info: 'Your listing is missing some required information. Please ensure all fields are filled out completely, including property details, description, and contact information.',
    poor_quality_images: 'The images provided do not meet our quality standards. Please upload clear, well-lit photos that accurately represent your property. We recommend at least 5 high-quality images.',
    suspicious_listing: 'We detected some concerns with your listing that require verification. Please contact our support team to resolve this issue.',
    duplicate_listing: 'This property appears to already be listed on our platform. If you believe this is an error, please contact our support team.',
    incorrect_pricing: 'The pricing for this property seems inconsistent with market values. Please review and update your pricing, or contact us if you need assistance.',
    inappropriate_content: 'Your listing contains content that violates our community guidelines. Please review our listing policies and update your content accordingly.',
    missing_documents: 'Required verification documents are missing. Please upload the necessary proof of ownership or authorization to list this property.',
    property_not_available: 'We were unable to verify that this property is available for sale/rent. Please ensure the property is currently available and update the listing status.',
    other: 'Please review your listing carefully and ensure it meets all our listing requirements. Contact support if you need specific guidance.',
  }

  return reasons[reason] || reasons.other
}
