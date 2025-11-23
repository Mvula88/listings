import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/types/database'

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
        const updateData: Database['public']['Tables']['lawyers']['Update'] = {
          suspended_for_non_payment: true,
          suspension_date: new Date().toISOString(),
          remittance_status: 'suspended',
          available: false
        }
        await supabase
          .from('lawyers')
          .update(updateData)
          .eq('id', transaction.lawyer_id)

        action = 'suspended'
        newStatus = 'suspended'

        console.log(`Suspended lawyer ${lawyer.firm_name} (${daysOverdue} days overdue)`)
      } else if (daysOverdue >= 45) {
        if (lawyer.remittance_status !== 'overdue') {
          const updateData: Database['public']['Tables']['lawyers']['Update'] = {
            remittance_status: 'overdue'
          }
          await supabase
            .from('lawyers')
            .update(updateData)
            .eq('id', transaction.lawyer_id)

          newStatus = 'overdue'
        }
        action = 'overdue_status'
      } else if (daysOverdue >= 15) {
        if (lawyer.remittance_status !== 'warning' && lawyer.remittance_status !== 'overdue') {
          const updateData: Database['public']['Tables']['lawyers']['Update'] = {
            remittance_status: 'warning'
          }
          await supabase
            .from('lawyers')
            .update(updateData)
            .eq('id', transaction.lawyer_id)

          newStatus = 'warning'
        }
        action = 'warning_status'
      }

      // Send email reminders on specific days
      const reminderDays = [1, 10, 20, 28, 35, 45, 55, 60]
      if (reminderDays.includes(daysOverdue)) {
        // TODO: Implement email sending via your email service
        // For now, just log the intent
        console.log(`Would send ${action} email to ${profile.email} (${daysOverdue} days overdue)`)

        // Update reminder timestamp
        const transactionUpdate: Database['public']['Tables']['transactions']['Update'] = {
          remittance_reminder_sent_at: new Date().toISOString()
        }
        await supabase
          .from('transactions')
          .update(transactionUpdate)
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
      .select('id')

    if (lawyers) {
      for (const lawyer of lawyers) {
        await supabase.rpc('update_lawyer_outstanding_fees', { lawyer_uuid: lawyer.id })
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
