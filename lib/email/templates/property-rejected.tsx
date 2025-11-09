import * as React from 'react'

interface PropertyRejectedEmailProps {
  sellerName: string
  propertyTitle: string
  reason?: string
}

export const PropertyRejectedEmail = ({
  sellerName,
  propertyTitle,
  reason
}: PropertyRejectedEmailProps) => (
  <html>
    <body style={{ fontFamily: 'Arial, sans-serif', margin: 0, padding: 0, backgroundColor: '#f4f4f4' }}>
      <table width="100%" cellPadding="0" cellSpacing="0" style={{ backgroundColor: '#f4f4f4', padding: '40px 20px' }}>
        <tr>
          <td align="center">
            <table width="600" cellPadding="0" cellSpacing="0" style={{ backgroundColor: '#ffffff', borderRadius: '8px', overflow: 'hidden' }}>
              {/* Header */}
              <tr>
                <td style={{ backgroundColor: '#ef4444', padding: '30px', textAlign: 'center' }}>
                  <h1 style={{ color: '#ffffff', margin: 0, fontSize: '28px' }}>Property Requires Updates</h1>
                </td>
              </tr>

              {/* Body */}
              <tr>
                <td style={{ padding: '40px' }}>
                  <p style={{ fontSize: '16px', color: '#333333', lineHeight: '1.6', marginTop: 0 }}>
                    Hi {sellerName},
                  </p>

                  <p style={{ fontSize: '16px', color: '#333333', lineHeight: '1.6' }}>
                    Thank you for listing your property on DealDirect. After review, we need some updates to your listing before it can go live:
                  </p>

                  <div style={{ backgroundColor: '#fef2f2', border: '2px solid #fecaca', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
                    <h3 style={{ color: '#991b1b', margin: '0 0 10px 0' }}>{propertyTitle}</h3>
                    {reason && (
                      <p style={{ fontSize: '14px', color: '#7f1d1d', margin: 0, lineHeight: '1.6' }}>
                        <strong>Reason:</strong> {reason}
                      </p>
                    )}
                  </div>

                  <p style={{ fontSize: '16px', color: '#333333', lineHeight: '1.6' }}>
                    <strong>What you need to do:</strong>
                  </p>

                  <ul style={{ fontSize: '14px', color: '#555555', lineHeight: '1.8' }}>
                    <li>Review the feedback provided above</li>
                    <li>Update your listing with the required changes</li>
                    <li>Resubmit for review</li>
                  </ul>

                  <p style={{ fontSize: '14px', color: '#666666', lineHeight: '1.6' }}>
                    If you have any questions or need assistance, please don't hesitate to contact our support team.
                  </p>

                  <div style={{ textAlign: 'center', margin: '30px 0' }}>
                    <a
                      href={`${process.env.NEXT_PUBLIC_APP_URL}/dashboard`}
                      style={{
                        backgroundColor: '#3b82f6',
                        color: '#ffffff',
                        padding: '14px 32px',
                        textDecoration: 'none',
                        borderRadius: '6px',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        display: 'inline-block'
                      }}
                    >
                      Go to Dashboard
                    </a>
                  </div>

                  <p style={{ fontSize: '14px', color: '#666666', marginBottom: 0 }}>
                    Best regards,<br />
                    The DealDirect Team
                  </p>
                </td>
              </tr>

              {/* Footer */}
              <tr>
                <td style={{ backgroundColor: '#f9fafb', padding: '20px', textAlign: 'center' }}>
                  <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>
                    © 2024 DealDirect. All rights reserved.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>
)
