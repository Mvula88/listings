import * as React from 'react'

interface RemittanceReminderEmailProps {
  lawyerName: string
  firmName: string
  transactionId: string
  amountDue: string
  daysOverdue: number
  dueDate: string
  dashboardUrl: string
  isWarning?: boolean
  isSuspension?: boolean
}

export const RemittanceReminderEmail = ({
  lawyerName,
  firmName,
  transactionId,
  amountDue,
  daysOverdue,
  dueDate,
  dashboardUrl,
  isWarning = false,
  isSuspension = false
}: RemittanceReminderEmailProps) => {
  const getHeaderColor = () => {
    if (isSuspension) return '#dc2626' // Red
    if (isWarning) return '#f59e0b' // Amber
    return '#3b82f6' // Blue
  }

  const getHeaderText = () => {
    if (isSuspension) return 'Account Suspended - Payment Required'
    if (isWarning) return 'Urgent: Payment Overdue'
    return 'Remittance Reminder'
  }

  return (
    <html>
      <body style={{ fontFamily: 'Arial, sans-serif', margin: 0, padding: 0, backgroundColor: '#f4f4f4' }}>
        <table width="100%" cellPadding="0" cellSpacing="0" style={{ backgroundColor: '#f4f4f4', padding: '40px 20px' }}>
          <tr>
            <td align="center">
              <table width="600" cellPadding="0" cellSpacing="0" style={{ backgroundColor: '#ffffff', borderRadius: '8px', overflow: 'hidden' }}>
                {/* Header */}
                <tr>
                  <td style={{ backgroundColor: getHeaderColor(), padding: '30px', textAlign: 'center' }}>
                    <h1 style={{ color: '#ffffff', margin: 0, fontSize: '24px' }}>{getHeaderText()}</h1>
                  </td>
                </tr>

                {/* Body */}
                <tr>
                  <td style={{ padding: '40px' }}>
                    <p style={{ fontSize: '16px', color: '#333333', lineHeight: '1.6', marginTop: 0 }}>
                      Dear {lawyerName},
                    </p>

                    {isSuspension ? (
                      <>
                        <p style={{ fontSize: '16px', color: '#dc2626', lineHeight: '1.6', fontWeight: 'bold' }}>
                          Your account has been suspended due to outstanding remittance payments.
                        </p>
                        <p style={{ fontSize: '16px', color: '#333333', lineHeight: '1.6' }}>
                          Your profile is no longer visible to clients, and you cannot receive new transactions until payment is made.
                        </p>
                      </>
                    ) : isWarning ? (
                      <p style={{ fontSize: '16px', color: '#333333', lineHeight: '1.6' }}>
                        This is an urgent reminder that your remittance payment is now <strong>{daysOverdue} days overdue</strong>.
                        Please make payment immediately to avoid account suspension.
                      </p>
                    ) : (
                      <p style={{ fontSize: '16px', color: '#333333', lineHeight: '1.6' }}>
                        This is a friendly reminder that you have an outstanding remittance payment due.
                      </p>
                    )}

                    <div style={{ backgroundColor: '#f9fafb', padding: '20px', borderRadius: '8px', margin: '20px 0', border: '1px solid #e5e7eb' }}>
                      <h3 style={{ color: '#1f2937', margin: '0 0 15px 0' }}>Payment Details</h3>
                      <table style={{ width: '100%', fontSize: '14px' }}>
                        <tr>
                          <td style={{ color: '#6b7280', padding: '5px 0' }}>Firm:</td>
                          <td style={{ color: '#1f2937', fontWeight: 'bold', padding: '5px 0' }}>{firmName}</td>
                        </tr>
                        <tr>
                          <td style={{ color: '#6b7280', padding: '5px 0' }}>Transaction ID:</td>
                          <td style={{ color: '#1f2937', padding: '5px 0' }}>{transactionId}</td>
                        </tr>
                        <tr>
                          <td style={{ color: '#6b7280', padding: '5px 0' }}>Amount Due:</td>
                          <td style={{ color: '#1f2937', fontWeight: 'bold', fontSize: '18px', padding: '5px 0' }}>{amountDue}</td>
                        </tr>
                        <tr>
                          <td style={{ color: '#6b7280', padding: '5px 0' }}>Original Due Date:</td>
                          <td style={{ color: '#1f2937', padding: '5px 0' }}>{dueDate}</td>
                        </tr>
                        <tr>
                          <td style={{ color: '#6b7280', padding: '5px 0' }}>Days Overdue:</td>
                          <td style={{ color: isSuspension || isWarning ? '#dc2626' : '#1f2937', fontWeight: 'bold', padding: '5px 0' }}>
                            {daysOverdue} days
                          </td>
                        </tr>
                      </table>
                    </div>

                    {!isSuspension && (
                      <div style={{ backgroundColor: '#fef3c7', padding: '15px', borderRadius: '8px', marginBottom: '20px', borderLeft: '4px solid #f59e0b' }}>
                        <p style={{ fontSize: '14px', color: '#92400e', margin: 0 }}>
                          <strong>Important:</strong> Accounts with payments overdue by 60+ days will be automatically suspended.
                        </p>
                      </div>
                    )}

                    <p style={{ fontSize: '16px', color: '#333333', lineHeight: '1.6' }}>
                      <strong>Payment Instructions:</strong>
                    </p>

                    <ul style={{ fontSize: '14px', color: '#555555', lineHeight: '1.8' }}>
                      <li>Bank: PropLinka Trust Account</li>
                      <li>Account Number: Contact support for details</li>
                      <li>Reference: {transactionId}</li>
                    </ul>

                    <div style={{ textAlign: 'center', margin: '30px 0' }}>
                      <a
                        href={dashboardUrl}
                        style={{
                          backgroundColor: isSuspension ? '#dc2626' : '#3b82f6',
                          color: '#ffffff',
                          padding: '14px 32px',
                          textDecoration: 'none',
                          borderRadius: '6px',
                          fontSize: '16px',
                          fontWeight: 'bold',
                          display: 'inline-block'
                        }}
                      >
                        View Dashboard
                      </a>
                    </div>

                    <p style={{ fontSize: '14px', color: '#666666' }}>
                      If you have already made this payment, please disregard this email and allow 1-2 business days for processing.
                    </p>

                    <p style={{ fontSize: '14px', color: '#666666', marginBottom: 0 }}>
                      Questions? Contact us at <a href="mailto:support@proplinka.com" style={{ color: '#3b82f6' }}>support@proplinka.com</a>
                    </p>

                    <p style={{ fontSize: '14px', color: '#666666', marginBottom: 0, marginTop: '20px' }}>
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
}
