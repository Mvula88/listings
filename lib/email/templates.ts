// Email Templates for PropLinka Platform
// All transactional and marketing email templates

import type { Property, Profile, Transaction, Inquiry } from '@/lib/types'
import { formatPrice } from '@/lib/utils/format'

const PLATFORM_NAME = 'PropLinka'
const PLATFORM_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://proplinka.com'
// const PLATFORM_LOGO = `${PLATFORM_URL}/logo.png`
const FROM_EMAIL = 'support@proplinka.com'

// Base email layout
function emailLayout(content: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${PLATFORM_NAME}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5; color: #18181b;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background-color: #0ea5e9; padding: 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">${PLATFORM_NAME}</h1>
              <p style="margin: 8px 0 0 0; color: #e0f2fe; font-size: 14px;">Commission-Free Property Marketplace</p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f4f4f5; padding: 30px; text-align: center; border-top: 1px solid #e4e4e7;">
              <p style="margin: 0 0 10px 0; color: #71717a; font-size: 14px;">
                © ${new Date().getFullYear()} ${PLATFORM_NAME}. All rights reserved.
              </p>
              <p style="margin: 0; font-size: 12px;">
                <a href="${PLATFORM_URL}" style="color: #0ea5e9; text-decoration: none; margin: 0 10px;">Visit Website</a>
                <a href="${PLATFORM_URL}/settings" style="color: #0ea5e9; text-decoration: none; margin: 0 10px;">Settings</a>
                <a href="${PLATFORM_URL}/unsubscribe" style="color: #0ea5e9; text-decoration: none; margin: 0 10px;">Unsubscribe</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `
}

// Button component
function button(text: string, url: string, color: string = '#0ea5e9'): string {
  return `
    <a href="${url}" style="display: inline-block; padding: 14px 28px; background-color: ${color}; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; margin: 20px 0;">${text}</a>
  `
}

// ==========================
// INQUIRY NOTIFICATIONS
// ==========================

export function newInquiryEmail(
  seller: Profile,
  buyer: Profile,
  property: Property,
  inquiry: Inquiry
) {
  const content = `
    <h2 style="margin: 0 0 20px 0; color: #18181b; font-size: 24px;">New Inquiry on Your Property</h2>

    <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 1.6; color: #3f3f46;">
      Hi ${seller.full_name},
    </p>

    <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 1.6; color: #3f3f46;">
      Great news! Someone is interested in your property:
    </p>

    <div style="background-color: #f4f4f5; padding: 20px; border-radius: 6px; margin: 20px 0;">
      <h3 style="margin: 0 0 12px 0; font-size: 18px; color: #18181b;">${property.title}</h3>
      <p style="margin: 0 0 8px 0; font-size: 16px; color: #0ea5e9; font-weight: 600;">${formatPrice(property.price, property.currency || 'ZAR')}</p>
      <p style="margin: 0; font-size: 14px; color: #71717a;">${property.city}, ${property.province}</p>
    </div>

    <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 20px 0;">
      <p style="margin: 0 0 8px 0; font-weight: 600; color: #92400e;">From: ${buyer.full_name}</p>
      <p style="margin: 0; color: #78350f;">"${inquiry.message}"</p>
    </div>

    <p style="margin: 20px 0 0 0; font-size: 16px; line-height: 1.6; color: #3f3f46;">
      Respond quickly to increase your chances of closing a deal!
    </p>

    ${button('View Inquiry & Respond', `${PLATFORM_URL}/dashboard/messages?inquiry=${inquiry.id}`)}

    <p style="margin: 30px 0 0 0; font-size: 14px; color: #71717a; border-top: 1px solid #e4e4e7; padding-top: 20px;">
      <strong>Tip:</strong> Quick responses lead to better outcomes. Reply within 24 hours for the best results.
    </p>
  `

  return {
    subject: `New Inquiry: ${property.title}`,
    html: emailLayout(content),
  }
}

export function inquiryResponseEmail(
  buyer: Profile,
  seller: Profile,
  property: Property,
  responseMessage: string
) {
  const content = `
    <h2 style="margin: 0 0 20px 0; color: #18181b; font-size: 24px;">The Seller Responded to Your Inquiry</h2>

    <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 1.6; color: #3f3f46;">
      Hi ${buyer.full_name},
    </p>

    <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 1.6; color: #3f3f46;">
      ${seller.full_name} has responded to your inquiry about:
    </p>

    <div style="background-color: #f4f4f5; padding: 20px; border-radius: 6px; margin: 20px 0;">
      <h3 style="margin: 0 0 12px 0; font-size: 18px; color: #18181b;">${property.title}</h3>
      <p style="margin: 0 0 8px 0; font-size: 16px; color: #0ea5e9; font-weight: 600;">${formatPrice(property.price, property.currency || 'ZAR')}</p>
    </div>

    <div style="background-color: #dbeafe; border-left: 4px solid #0ea5e9; padding: 16px; margin: 20px 0;">
      <p style="margin: 0; color: #1e40af;">"${responseMessage}"</p>
    </div>

    ${button('View Message & Reply', `${PLATFORM_URL}/dashboard/messages`)}
  `

  return {
    subject: `Response to your inquiry: ${property.title}`,
    html: emailLayout(content),
  }
}

// ==========================
// TRANSACTION NOTIFICATIONS
// ==========================

export function transactionInitiatedEmail(
  user: Profile,
  property: Property,
  transaction: Transaction,
  userRole: 'buyer' | 'seller'
) {
  const content = `
    <h2 style="margin: 0 0 20px 0; color: #18181b; font-size: 24px;">Transaction Started! 🎉</h2>

    <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 1.6; color: #3f3f46;">
      Hi ${user.full_name},
    </p>

    <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 1.6; color: #3f3f46;">
      Great news! A transaction has been initiated for:
    </p>

    <div style="background-color: #f4f4f5; padding: 20px; border-radius: 6px; margin: 20px 0;">
      <h3 style="margin: 0 0 12px 0; font-size: 18px; color: #18181b;">${property.title}</h3>
      <p style="margin: 0 0 8px 0; font-size: 16px; color: #0ea5e9; font-weight: 600;">${formatPrice(transaction.agreed_price || property.price, property.currency || 'ZAR')}</p>
      <p style="margin: 0; font-size: 14px; color: #71717a;">Transaction ID: ${transaction.id.slice(0, 8)}</p>
    </div>

    <h3 style="margin: 30px 0 16px 0; font-size: 18px; color: #18181b;">Next Steps:</h3>
    <ol style="margin: 0; padding-left: 24px; color: #3f3f46;">
      <li style="margin-bottom: 12px;">Select your conveyancer (lawyer) from our verified list</li>
      <li style="margin-bottom: 12px;">Both parties must choose and agree on lawyers</li>
      <li style="margin-bottom: 12px;">Your lawyer will handle the legal process</li>
      <li style="margin-bottom: 12px;">Complete the transaction with ${userRole === 'buyer' ? 'massive savings!' : 'no commission fees!'}</li>
    </ol>

    ${button('Select Your Lawyer', `${PLATFORM_URL}/dashboard/transactions/${transaction.id}/select-lawyers`)}

    <div style="background-color: #dcfce7; border-left: 4px solid #22c55e; padding: 16px; margin: 30px 0;">
      <p style="margin: 0; font-weight: 600; color: #166534;">💰 You're saving thousands!</p>
      <p style="margin: 8px 0 0 0; color: #15803d; font-size: 14px;">No agent commissions = More money in your pocket</p>
    </div>
  `

  return {
    subject: `Transaction Started: ${property.title}`,
    html: emailLayout(content),
  }
}

export function lawyerSelectedEmail(
  user: Profile,
  lawyer: { firm_name: string; full_name: string },
  property: Property,
  selectedBy: 'buyer' | 'seller'
) {
  const content = `
    <h2 style="margin: 0 0 20px 0; color: #18181b; font-size: 24px;">Lawyer Selected</h2>

    <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 1.6; color: #3f3f46;">
      Hi ${user.full_name},
    </p>

    <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 1.6; color: #3f3f46;">
      The ${selectedBy} has selected a lawyer for the transaction of <strong>${property.title}</strong>:
    </p>

    <div style="background-color: #f4f4f5; padding: 20px; border-radius: 6px; margin: 20px 0;">
      <h3 style="margin: 0 0 8px 0; font-size: 18px; color: #18181b;">${lawyer.firm_name}</h3>
      <p style="margin: 0; font-size: 14px; color: #71717a;">${lawyer.full_name}</p>
    </div>

    <p style="margin: 20px 0 0 0; font-size: 16px; line-height: 1.6; color: #3f3f46;">
      ${selectedBy === 'buyer' ? 'Now it\'s your turn to select your lawyer.' : 'Both parties have now selected their lawyers. The transaction will proceed.'}
    </p>

    ${button('View Transaction', `${PLATFORM_URL}/dashboard/transactions`)}
  `

  return {
    subject: `Lawyer Selected: ${property.title}`,
    html: emailLayout(content),
  }
}

// ==========================
// SAVED SEARCH ALERTS
// ==========================

export function newPropertyMatchEmail(
  user: Profile,
  searchName: string,
  properties: Property[]
) {
  const propertyListHtml = properties
    .map(
      (p) => `
      <div style="background-color: #f4f4f5; padding: 20px; border-radius: 6px; margin: 16px 0;">
        <h3 style="margin: 0 0 12px 0; font-size: 18px; color: #18181b;">${p.title}</h3>
        <p style="margin: 0 0 8px 0; font-size: 16px; color: #0ea5e9; font-weight: 600;">${formatPrice(p.price, p.currency || 'ZAR')}</p>
        <p style="margin: 0 0 12px 0; font-size: 14px; color: #71717a;">${p.bedrooms} bed • ${p.bathrooms} bath • ${p.square_meters}m² • ${p.city}</p>
        <a href="${PLATFORM_URL}/properties/${p.id}" style="color: #0ea5e9; text-decoration: none; font-weight: 600;">View Property →</a>
      </div>
    `
    )
    .join('')

  const content = `
    <h2 style="margin: 0 0 20px 0; color: #18181b; font-size: 24px;">New Properties Match Your Search! 🏡</h2>

    <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 1.6; color: #3f3f46;">
      Hi ${user.full_name},
    </p>

    <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 1.6; color: #3f3f46;">
      We found ${properties.length} new ${properties.length === 1 ? 'property' : 'properties'} matching your saved search "<strong>${searchName}</strong>":
    </p>

    ${propertyListHtml}

    ${button('View All Matches', `${PLATFORM_URL}/browse`)}

    <p style="margin: 30px 0 0 0; font-size: 14px; color: #71717a; border-top: 1px solid #e4e4e7; padding-top: 20px;">
      <a href="${PLATFORM_URL}/settings/saved-searches" style="color: #0ea5e9; text-decoration: none;">Manage your saved searches</a>
    </p>
  `

  return {
    subject: `${properties.length} New ${properties.length === 1 ? 'Property' : 'Properties'} Match Your Search`,
    html: emailLayout(content),
  }
}

// ==========================
// LAWYER NOTIFICATIONS
// ==========================

export function dealAssignedToLawyerEmail(
  lawyer: Profile,
  property: Property,
  transaction: Transaction,
  role: 'buyer' | 'seller'
) {
  const content = `
    <h2 style="margin: 0 0 20px 0; color: #18181b; font-size: 24px;">New Deal Assigned to You</h2>

    <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 1.6; color: #3f3f46;">
      Hi ${lawyer.full_name},
    </p>

    <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 1.6; color: #3f3f46;">
      You have been selected as the ${role}'s conveyancer for a new property transaction:
    </p>

    <div style="background-color: #f4f4f5; padding: 20px; border-radius: 6px; margin: 20px 0;">
      <h3 style="margin: 0 0 12px 0; font-size: 18px; color: #18181b;">${property.title}</h3>
      <p style="margin: 0 0 8px 0; font-size: 16px; color: #0ea5e9; font-weight: 600;">${formatPrice(transaction.agreed_price || property.price, property.currency || 'ZAR')}</p>
      <p style="margin: 0 0 8px 0; font-size: 14px; color: #71717a;">Transaction ID: ${transaction.id.slice(0, 8)}</p>
      <p style="margin: 0; font-size: 14px; color: #71717a;">Platform Fee: ${formatPrice(transaction.platform_fee_amount || 0, property.currency || 'ZAR')}</p>
    </div>

    <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 20px 0;">
      <p style="margin: 0; font-weight: 600; color: #92400e;">⚠️ Important Reminder</p>
      <p style="margin: 8px 0 0 0; color: #78350f; font-size: 14px;">Please collect the platform fee at closing and remit to PropLinka within 30 days.</p>
    </div>

    ${button('View Deal Details', `${PLATFORM_URL}/dashboard/lawyer-deals/${transaction.id}`)}
  `

  return {
    subject: `New Deal Assigned: ${property.title}`,
    html: emailLayout(content),
  }
}

// ==========================
// WELCOME & ONBOARDING
// ==========================

export function welcomeEmail(user: Profile) {
  const content = `
    <h2 style="margin: 0 0 20px 0; color: #18181b; font-size: 24px;">Welcome to ${PLATFORM_NAME}! 🎉</h2>

    <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 1.6; color: #3f3f46;">
      Hi ${user.full_name},
    </p>

    <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 1.6; color: #3f3f46;">
      Thank you for joining ${PLATFORM_NAME}, the commission-free property marketplace. You're about to save thousands on your next property deal!
    </p>

    <div style="background-color: #dcfce7; border-radius: 6px; padding: 24px; margin: 30px 0;">
      <h3 style="margin: 0 0 16px 0; font-size: 20px; color: #166534;">How It Works:</h3>
      <ol style="margin: 0; padding-left: 24px; color: #15803d;">
        <li style="margin-bottom: 12px;"><strong>Browse</strong> thousands of properties commission-free</li>
        <li style="margin-bottom: 12px;"><strong>Connect</strong> directly with buyers or sellers</li>
        <li style="margin-bottom: 12px;"><strong>Choose</strong> a verified conveyancer from our network</li>
        <li style="margin-bottom: 12px;"><strong>Save</strong> 50-90% compared to traditional agents!</li>
      </ol>
    </div>

    ${button('Start Browsing Properties', `${PLATFORM_URL}/browse`)}

    <p style="margin: 30px 0 0 0; font-size: 14px; color: #71717a; border-top: 1px solid #e4e4e7; padding-top: 20px;">
      Need help? Our support team is here for you at <a href="mailto:${FROM_EMAIL}" style="color: #0ea5e9; text-decoration: none;">${FROM_EMAIL}</a>
    </p>
  `

  return {
    subject: `Welcome to ${PLATFORM_NAME} - Start Saving Today!`,
    html: emailLayout(content),
  }
}

// ==========================
// WEEKLY DIGEST
// ==========================

export function weeklyDigestEmail(
  user: Profile,
  newProperties: number,
  savedSearchMatches: number,
  unreadMessages: number
) {
  const content = `
    <h2 style="margin: 0 0 20px 0; color: #18181b; font-size: 24px;">Your Weekly ${PLATFORM_NAME} Summary</h2>

    <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.6; color: #3f3f46;">
      Hi ${user.full_name}, here's what happened this week:
    </p>

    <div style="display: flex; gap: 16px; margin: 30px 0;">
      <div style="flex: 1; background-color: #dbeafe; padding: 20px; border-radius: 6px; text-align: center;">
        <div style="font-size: 32px; font-weight: 700; color: #0ea5e9; margin-bottom: 8px;">${newProperties}</div>
        <div style="font-size: 14px; color: #1e40af;">New Properties</div>
      </div>

      <div style="flex: 1; background-color: #dcfce7; padding: 20px; border-radius: 6px; text-align: center;">
        <div style="font-size: 32px; font-weight: 700; color: #22c55e; margin-bottom: 8px;">${savedSearchMatches}</div>
        <div style="font-size: 14px; color: #166534;">Search Matches</div>
      </div>

      <div style="flex: 1; background-color: #fef3c7; padding: 20px; border-radius: 6px; text-align: center;">
        <div style="font-size: 32px; font-weight: 700; color: #f59e0b; margin-bottom: 8px;">${unreadMessages}</div>
        <div style="font-size: 14px; color: #92400e;">Unread Messages</div>
      </div>
    </div>

    ${button('Visit Dashboard', `${PLATFORM_URL}/dashboard`)}

    <p style="margin: 30px 0 0 0; font-size: 14px; color: #71717a; border-top: 1px solid #e4e4e7; padding-top: 20px;">
      <a href="${PLATFORM_URL}/settings/notifications" style="color: #0ea5e9; text-decoration: none;">Update your email preferences</a>
    </p>
  `

  return {
    subject: `Your Weekly ${PLATFORM_NAME} Summary`,
    html: emailLayout(content),
  }
}
