import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/types/database'
import { sendRemittanceReminderEmail } from '@/lib/email/send-emails'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    // Verify cron secret to prevent unauthorized access
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createClient()

    // Call the database function to mark overdue remittances
    const { data: overdueTransactions, error } = await supabase
      .rpc('mark_overdue_remittances') as {
        data: Array<{
          transaction_id: string
          lawyer_id: string
          days_overdue: number
        }> | null
        error: any
      }

    if (error) {
      console.error('Error marking overdue remittances:', error)
      throw error
    }

    console.log(`Found ${overdueTransactions?.length || 0} overdue transactions`)

    // Process each overdue transaction
    const processedTransactions = []
    for (const transaction of (overdueTransactions || [])) {
      const daysOverdue = transaction.days_overdue

      // Get lawyer details
      const { data: lawyer, error: lawyerError } = await supabase
        .from('lawyers')
        .select('profile_id, firm_name, remittance_status, suspended_for_non_payment')
        .eq('id', transaction.lawyer_id)
        .single() as {
          data: {
            profile_id: string
            firm_name: string
            remittance_status: string
            suspended_for_non_payment: boolean
          } | null
          error: any
        }

      if (lawyerError || !lawyer) {
        console.error(`Lawyer not found for transaction ${transaction.transaction_id}`)
        continue
      }

      // Get lawyer profile/email
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('email, full_name')
        .eq('id', lawyer.profile_id)
        .single() as {
          data: {
            email: string
            full_name: string
          } | null
          error: any
        }

      if (profileError || !profile) {
        console.error(`Profile not found for lawyer ${transaction.lawyer_id}`)
        continue
      }

      // Determine action based on days overdue
      let action = 'none'
      let newStatus = lawyer.remittance_status

      if (daysOverdue >= 60 && !lawyer.suspended_for_non_payment) {
        // Suspend lawyer account
        await (supabase
          .from('lawyers') as any)
          .update({
            suspended_for_non_payment: true,
            suspension_date: new Date().toISOString(),
            remittance_status: 'suspended',
            available: false
          })
          .eq('id', transaction.lawyer_id)

        action = 'suspended'
        newStatus = 'suspended'

        console.log(`Suspended lawyer ${lawyer.firm_name} (${daysOverdue} days overdue)`)
      } else if (daysOverdue >= 45) {
        if (lawyer.remittance_status !== 'overdue') {
          await (supabase
            .from('lawyers') as any)
            .update({ remittance_status: 'overdue' })
            .eq('id', transaction.lawyer_id)

          newStatus = 'overdue'
        }
        action = 'overdue_status'
      } else if (daysOverdue >= 15) {
        if (lawyer.remittance_status !== 'warning' && lawyer.remittance_status !== 'overdue') {
          await (supabase
            .from('lawyers') as any)
            .update({ remittance_status: 'warning' })
            .eq('id', transaction.lawyer_id)

          newStatus = 'warning'
        }
        action = 'warning_status'
      }

      // Send email reminders on specific days
      const reminderDays = [1, 10, 20, 28, 35, 45, 55, 60]
      if (reminderDays.includes(daysOverdue)) {
        // Get transaction details for the email
        const { data: transactionDetails } = await (supabase
          .from('transactions') as any)
          .select('id, platform_fee_amount, currency, remittance_due_date')
          .eq('id', transaction.transaction_id)
          .single()

        const amountDue = transactionDetails
          ? `${transactionDetails.currency || 'R'}${transactionDetails.platform_fee_amount?.toLocaleString() || '0'}`
          : 'Amount pending'

        const dueDate = transactionDetails?.remittance_due_date
          ? new Date(transactionDetails.remittance_due_date).toLocaleDateString('en-ZA', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })
          : 'N/A'

        // Send email
        const emailResult = await sendRemittanceReminderEmail({
          to: profile.email,
          lawyerName: profile.full_name,
          firmName: lawyer.firm_name,
          transactionId: transaction.transaction_id.slice(0, 8).toUpperCase(),
          amountDue,
          daysOverdue,
          dueDate,
          dashboardUrl: `${process.env.NEXT_PUBLIC_URL}/dashboard/transactions`,
          isWarning: daysOverdue >= 30,
          isSuspension: action === 'suspended',
        })

        if (emailResult.success) {
          console.log(`Sent ${action} email to ${profile.email} (${daysOverdue} days overdue)`)
        } else {
          console.error(`Failed to send email to ${profile.email}:`, emailResult.error)
        }

        // Update reminder timestamp
        await (supabase
          .from('transactions') as any)
          .update({ remittance_reminder_sent_at: new Date().toISOString() })
          .eq('id', transaction.transaction_id)
      }

      processedTransactions.push({
        transaction_id: transaction.transaction_id,
        lawyer_id: transaction.lawyer_id,
        firm_name: lawyer.firm_name,
        days_overdue: daysOverdue,
        action,
        new_status: newStatus
      })
    }

    // Update lawyer outstanding fees
    const { data: lawyers } = await supabase
      .from('lawyers')
      .select('id') as {
        data: Array<{ id: string }> | null
        error: any
      }

    if (lawyers) {
      for (const lawyer of lawyers) {
        await (supabase as any).rpc('update_lawyer_outstanding_fees', { lawyer_uuid: lawyer.id })
      }
    }

    return NextResponse.json({
      success: true,
      processedTransactions: processedTransactions.length,
      details: processedTransactions
    })
  } catch (error) {
    console.error('Error checking overdue remittances:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: (error as Error).message },
      { status: 500 }
    )
  }
}
