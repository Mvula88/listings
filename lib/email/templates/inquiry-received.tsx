import * as React from 'react'

interface InquiryReceivedEmailProps {
  sellerName: string
  buyerName: string
  propertyTitle: string
  propertyUrl: string
  message: string
  messagesUrl: string
}

export const InquiryReceivedEmail = ({
  sellerName,
  buyerName,
  propertyTitle,
  propertyUrl,
  message,
  messagesUrl
}: InquiryReceivedEmailProps) => (
  <html>
    <body style={{ fontFamily: 'Arial, sans-serif', margin: 0, padding: 0, backgroundColor: '#f4f4f4' }}>
      <table width="100%" cellPadding="0" cellSpacing="0" style={{ backgroundColor: '#f4f4f4', padding: '40px 20px' }}>
        <tr>
          <td align="center">
            <table width="600" cellPadding="0" cellSpacing="0" style={{ backgroundColor: '#ffffff', borderRadius: '8px', overflow: 'hidden' }}>
              {/* Header */}
              <tr>
                <td style={{ backgroundColor: '#10b981', padding: '30px', textAlign: 'center' }}>
                  <h1 style={{ color: '#ffffff', margin: 0, fontSize: '28px' }}>New Inquiry Received!</h1>
                </td>
              </tr>

              {/* Body */}
              <tr>
                <td style={{ padding: '40px' }}>
                  <p style={{ fontSize: '16px', color: '#333333', lineHeight: '1.6', marginTop: 0 }}>
                    Hi {sellerName},
                  </p>

                  <p style={{ fontSize: '16px', color: '#333333', lineHeight: '1.6' }}>
                    Great news! Someone is interested in your property.
                  </p>

                  <div style={{ backgroundColor: '#f0fdf4', border: '2px solid #bbf7d0', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
                    <p style={{ fontSize: '14px', color: '#065f46', margin: '0 0 5px 0' }}>
                      <strong>Property:</strong> {propertyTitle}
                    </p>
                    <p style={{ fontSize: '14px', color: '#065f46', margin: '0 0 5px 0' }}>
                      <strong>From:</strong> {buyerName}
                    </p>
                  </div>

                  <div style={{ backgroundColor: '#f9fafb', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
                    <p style={{ fontSize: '14px', color: '#374151', margin: '0 0 10px 0', fontWeight: 'bold' }}>
                      Message:
                    </p>
                    <p style={{ fontSize: '14px', color: '#6b7280', margin: 0, lineHeight: '1.6', fontStyle: 'italic' }}>
                      "{message}"
                    </p>
                  </div>

                  <p style={{ fontSize: '16px', color: '#333333', lineHeight: '1.6' }}>
                    <strong>Respond quickly to increase your chances of a sale!</strong>
                  </p>

                  <div style={{ backgroundColor: '#eff6ff', border: '1px solid #3b82f6', padding: '15px', borderRadius: '6px', marginBottom: '20px' }}>
                    <p style={{ fontSize: '13px', color: '#1e40af', margin: 0 }}>
                      💡 Tip: Sellers who respond within 1 hour are 5x more likely to close the deal!
                    </p>
                  </div>

                  <div style={{ textAlign: 'center', margin: '30px 0' }}>
                    <a
                      href={messagesUrl}
                      style={{
                        backgroundColor: '#10b981',
                        color: '#ffffff',
                        padding: '14px 32px',
                        textDecoration: 'none',
                        borderRadius: '6px',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        display: 'inline-block',
                        marginRight: '10px'
                      }}
                    >
                      Reply Now
                    </a>
                    <a
                      href={propertyUrl}
                      style={{
                        backgroundColor: '#f3f4f6',
                        color: '#374151',
                        padding: '14px 32px',
                        textDecoration: 'none',
                        borderRadius: '6px',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        display: 'inline-block'
                      }}
                    >
                      View Property
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
