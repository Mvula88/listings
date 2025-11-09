import * as React from 'react'

interface PropertyApprovedEmailProps {
  sellerName: string
  propertyTitle: string
  propertyUrl: string
  propertyImage?: string
}

export const PropertyApprovedEmail = ({
  sellerName,
  propertyTitle,
  propertyUrl,
  propertyImage
}: PropertyApprovedEmailProps) => (
  <html>
    <body style={{ fontFamily: 'Arial, sans-serif', margin: 0, padding: 0, backgroundColor: '#f4f4f4' }}>
      <table width="100%" cellPadding="0" cellSpacing="0" style={{ backgroundColor: '#f4f4f4', padding: '40px 20px' }}>
        <tr>
          <td align="center">
            <table width="600" cellPadding="0" cellSpacing="0" style={{ backgroundColor: '#ffffff', borderRadius: '8px', overflow: 'hidden' }}>
              {/* Header */}
              <tr>
                <td style={{ backgroundColor: '#3b82f6', padding: '30px', textAlign: 'center' }}>
                  <h1 style={{ color: '#ffffff', margin: 0, fontSize: '28px' }}>Property Approved! ✓</h1>
                </td>
              </tr>

              {/* Body */}
              <tr>
                <td style={{ padding: '40px' }}>
                  <p style={{ fontSize: '16px', color: '#333333', lineHeight: '1.6', marginTop: 0 }}>
                    Hi {sellerName},
                  </p>

                  <p style={{ fontSize: '16px', color: '#333333', lineHeight: '1.6' }}>
                    Great news! Your property listing has been approved and is now live on DealDirect.
                  </p>

                  {propertyImage && (
                    <img
                      src={propertyImage}
                      alt={propertyTitle}
                      style={{ width: '100%', height: 'auto', borderRadius: '8px', marginBottom: '20px' }}
                    />
                  )}

                  <div style={{ backgroundColor: '#f9fafb', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
                    <h3 style={{ color: '#1f2937', margin: '0 0 10px 0' }}>{propertyTitle}</h3>
                    <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
                      Your listing is now visible to thousands of potential buyers!
                    </p>
                  </div>

                  <p style={{ fontSize: '16px', color: '#333333', lineHeight: '1.6' }}>
                    <strong>What's next?</strong>
                  </p>

                  <ul style={{ fontSize: '14px', color: '#555555', lineHeight: '1.8' }}>
                    <li>You'll receive notifications when buyers inquire about your property</li>
                    <li>Respond quickly to inquiries to increase your chances of a sale</li>
                    <li>Consider featuring your property for 3-10x more visibility</li>
                  </ul>

                  <div style={{ textAlign: 'center', margin: '30px 0' }}>
                    <a
                      href={propertyUrl}
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
                      View Your Listing
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
