import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendInquiryReceivedEmail } from '@/lib/email/send-emails'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { inquiryId, conversationId } = await request.json()

    if (!inquiryId) {
      return NextResponse.json(
        { error: 'Missing inquiry ID' },
        { status: 400 }
      )
    }

    // Get inquiry details with property, buyer, and seller info
    const { data: inquiry, error } = await supabase
      .from('inquiries')
      .select(`
        *,
        property:properties(id, title),
        buyer:profiles!buyer_id(full_name, email),
        seller:profiles!seller_id(full_name, email)
      `)
      .eq('id', inquiryId)
      .single() as {
        data: {
          message: string;
          property: { id: string; title: string };
          buyer: { full_name: string | null; email: string };
          seller: { full_name: string | null; email: string };
        } | null;
        error: any;
      }

    if (error || !inquiry) {
      console.error('Failed to get inquiry:', error)
      return NextResponse.json(
        { error: 'Inquiry not found' },
        { status: 404 }
      )
    }

    // Send email to seller
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const messagesUrl = conversationId
      ? `${appUrl}/messages?conversation=${conversationId}`
      : `${appUrl}/messages`

    const result = await sendInquiryReceivedEmail({
      to: inquiry.seller.email,
      sellerName: inquiry.seller.full_name || 'there',
      buyerName: inquiry.buyer.full_name || 'A buyer',
      propertyTitle: inquiry.property.title,
      propertyUrl: `${appUrl}/properties/${inquiry.property.id}`,
      message: inquiry.message,
      messagesUrl,
    })

    if (result.success) {
      return NextResponse.json({ success: true })
    } else {
      console.error('Failed to send email:', result)
      return NextResponse.json(
        { error: 'Failed to send email' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error sending inquiry notification:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
