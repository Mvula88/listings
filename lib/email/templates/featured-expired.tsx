import * as React from 'react'

interface FeaturedExpiredEmailProps {
  sellerName: string
  propertyTitle: string
  propertyUrl: string
  renewUrl: string
}

export const FeaturedExpiredEmail = ({
  sellerName,
  propertyTitle,
  propertyUrl,
  renewUrl
}: FeaturedExpiredEmailProps) => (
  <html>
    <body style={{ fontFamily: 'Arial, sans-serif', margin: 0, padding: 0, backgroundColor: '#f4f4f4' }}>
      <table width="100%" cellPadding="0" cellSpacing="0" style={{ backgroundColor: '#f4f4f4', padding: '40px 20px' }}>
        <tr>
          <td align="center">
            <table width="600" cellPadding="0" cellSpacing="0" style={{ backgroundColor: '#ffffff', borderRadius: '8px', overflow: 'hidden' }}>
              {/* Header */}
              <tr>
                <td style={{ backgroundColor: '#f59e0b', padding: '30px', textAlign: 'center' }}>
                  <h1 style={{ color: '#ffffff', margin: 0, fontSize: '24px' }}>Featured Listing Expired</h1>
                </td>
              </tr>

              {/* Body */}
              <tr>
                <td style={{ padding: '40px' }}>
                  <p style={{ fontSize: '16px', color: '#333333', lineHeight: '1.6', marginTop: 0 }}>
                    Hi {sellerName},
                  </p>

                  <p style={{ fontSize: '16px', color: '#333333', lineHeight: '1.6' }}>
                    Your featured listing has expired and is no longer receiving premium visibility on PropLinka.
                  </p>

                  <div style={{ backgroundColor: '#f9fafb', padding: '20px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #e5e7eb' }}>
                    <h3 style={{ color: '#1f2937', margin: '0 0 10px 0' }}>{propertyTitle}</h3>
                    <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
                      This listing is now displayed with regular properties
                    </p>
                  </div>

                  <div style={{ backgroundColor: '#fef3c7', padding: '15px', borderRadius: '8px', marginBottom: '20px', borderLeft: '4px solid #f59e0b' }}>
                    <p style={{ fontSize: '14px', color: '#92400e', margin: 0 }}>
                      <strong>Did you know?</strong> Featured listings get 3-10x more views and inquiries than regular listings!
                    </p>
                  </div>

                  <p style={{ fontSize: '16px', color: '#333333', lineHeight: '1.6' }}>
                    <strong>Benefits of renewing:</strong>
                  </p>

                  <ul style={{ fontSize: '14px', color: '#555555', lineHeight: '1.8' }}>
                    <li>Appear at the top of search results</li>
                    <li>Featured badge on your listing</li>
                    <li>Priority placement on homepage</li>
                    <li>More visibility = faster sale</li>
                  </ul>

                  <div style={{ textAlign: 'center', margin: '30px 0' }}>
                    <a
                      href={renewUrl}
                      style={{
                        backgroundColor: '#3b82f6',
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
                      Renew Featured Listing
                    </a>
                  </div>

                  <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                    <a
                      href={propertyUrl}
                      style={{
                        color: '#3b82f6',
                        fontSize: '14px',
                        textDecoration: 'underline'
                      }}
                    >
                      View Your Listing
                    </a>
                  </div>

                  <p style={{ fontSize: '14px', color: '#666666', marginBottom: 0 }}>
                    Best regards,<br />
                    The PropLinka Team
                  </p>
                </td>
              </tr>

              {/* Footer */}
              <tr>
                <td style={{ backgroundColor: '#f9fafb', padding: '20px', textAlign: 'center' }}>
                  <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>
                    © {new Date().getFullYear()} PropLinka. All rights reserved.
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
