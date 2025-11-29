'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { createNotification } from './notifications'

export interface Message {
  id: string
  conversation_id: string
  sender_id: string
  recipient_id: string
  content: string
  read: boolean
  created_at: string
  sender?: {
    id: string
    full_name: string
    avatar_url: string | null
  }
}

export interface Conversation {
  id: string
  inquiry_id: string | null
  property_id: string | null
  participants: string[]
  status: string
  created_at: string
  property?: {
    id: string
    title: string
    images?: { image_url: string }[]
  }
  last_message?: Message
  other_participant?: {
    id: string
    full_name: string
    avatar_url: string | null
  }
  unread_count: number
}

interface ActionResult {
  success: boolean
  error?: string
  message?: string
}

/**
 * Get all conversations for the current user
 */
export async function getConversations(): Promise<{
  conversations: Conversation[]
  error?: string
}> {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { conversations: [], error: 'Not authenticated' }
    }

    // Get conversations where user is a participant
    const { data: conversations, error } = await (supabase
      .from('conversations') as any)
      .select(`
        *,
        property:properties(
          id,
          title,
          images:property_images(image_url)
        )
      `)
      .contains('participants', [user.id])
      .eq('status', 'active')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching conversations:', error)
      return { conversations: [], error: 'Failed to fetch conversations' }
    }

    // For each conversation, get the last message and other participant info
    const conversationsWithDetails = await Promise.all(
      (conversations || []).map(async (conv: any) => {
        // Get last message
        const { data: lastMessages } = await (supabase
          .from('messages') as any)
          .select('*')
          .eq('conversation_id', conv.id)
          .order('created_at', { ascending: false })
          .limit(1)

        // Get unread count
        const { count: unreadCount } = await (supabase
          .from('messages') as any)
          .select('*', { count: 'exact', head: true })
          .eq('conversation_id', conv.id)
          .eq('recipient_id', user.id)
          .eq('read', false)

        // Get other participant info
        const otherParticipantId = conv.participants.find((p: string) => p !== user.id)
        let otherParticipant = null
        if (otherParticipantId) {
          const { data: participantData } = await (supabase
            .from('profiles') as any)
            .select('id, full_name, avatar_url')
            .eq('id', otherParticipantId)
            .single()
          otherParticipant = participantData
        }

        return {
          ...conv,
          last_message: lastMessages?.[0] || null,
          other_participant: otherParticipant,
          unread_count: unreadCount || 0,
        }
      })
    )

    // Sort by last message date
    conversationsWithDetails.sort((a, b) => {
      const dateA = a.last_message?.created_at || a.created_at
      const dateB = b.last_message?.created_at || b.created_at
      return new Date(dateB).getTime() - new Date(dateA).getTime()
    })

    return { conversations: conversationsWithDetails }
  } catch (error) {
    console.error('Get conversations error:', error)
    return { conversations: [], error: 'An unexpected error occurred' }
  }
}

/**
 * Get messages for a specific conversation
 */
export async function getMessages(conversationId: string): Promise<{
  messages: Message[]
  conversation: Conversation | null
  error?: string
}> {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { messages: [], conversation: null, error: 'Not authenticated' }
    }

    // Verify user is part of this conversation
    const { data: conversation, error: convError } = await (supabase
      .from('conversations') as any)
      .select(`
        *,
        property:properties(
          id,
          title,
          images:property_images(image_url)
        )
      `)
      .eq('id', conversationId)
      .contains('participants', [user.id])
      .single()

    if (convError || !conversation) {
      return { messages: [], conversation: null, error: 'Conversation not found' }
    }

    // Get other participant info
    const otherParticipantId = conversation.participants.find((p: string) => p !== user.id)
    let otherParticipant = null
    if (otherParticipantId) {
      const { data: participantData } = await (supabase
        .from('profiles') as any)
        .select('id, full_name, avatar_url')
        .eq('id', otherParticipantId)
        .single()
      otherParticipant = participantData
    }

    // Get messages
    const { data: messages, error: msgError } = await (supabase
      .from('messages') as any)
      .select(`
        *,
        sender:profiles!sender_id(
          id,
          full_name,
          avatar_url
        )
      `)
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })

    if (msgError) {
      console.error('Error fetching messages:', msgError)
      return { messages: [], conversation: null, error: 'Failed to fetch messages' }
    }

    // Mark messages as read
    await (supabase
      .from('messages') as any)
      .update({ read: true })
      .eq('conversation_id', conversationId)
      .eq('recipient_id', user.id)
      .eq('read', false)

    return {
      messages: messages || [],
      conversation: {
        ...conversation,
        other_participant: otherParticipant,
        unread_count: 0,
      },
    }
  } catch (error) {
    console.error('Get messages error:', error)
    return { messages: [], conversation: null, error: 'An unexpected error occurred' }
  }
}

/**
 * Send a message in a conversation
 */
export async function sendMessage(
  conversationId: string,
  content: string
): Promise<ActionResult & { message?: Message }> {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    if (!content.trim()) {
      return { success: false, error: 'Message cannot be empty' }
    }

    // Verify user is part of this conversation and get recipient
    const { data: conversation, error: convError } = await (supabase
      .from('conversations') as any)
      .select('*, property:properties(title)')
      .eq('id', conversationId)
      .contains('participants', [user.id])
      .single()

    if (convError || !conversation) {
      return { success: false, error: 'Conversation not found' }
    }

    const recipientId = conversation.participants.find((p: string) => p !== user.id)
    if (!recipientId) {
      return { success: false, error: 'Recipient not found' }
    }

    // Create message
    const { data: message, error: msgError } = await (supabase
      .from('messages') as any)
      .insert({
        conversation_id: conversationId,
        sender_id: user.id,
        recipient_id: recipientId,
        content: content.trim(),
        read: false,
      })
      .select(`
        *,
        sender:profiles!sender_id(
          id,
          full_name,
          avatar_url
        )
      `)
      .single()

    if (msgError) {
      console.error('Error sending message:', msgError)
      return { success: false, error: 'Failed to send message' }
    }

    // Get sender's name for notification
    const { data: sender } = await (supabase
      .from('profiles') as any)
      .select('full_name')
      .eq('id', user.id)
      .single()

    // Create notification for recipient
    await createNotification({
      userId: recipientId,
      type: 'message',
      title: 'New Message',
      message: `${sender?.full_name || 'Someone'} sent you a message${conversation.property?.title ? ` about "${conversation.property.title}"` : ''}`,
      data: {
        conversation_id: conversationId,
        property_id: conversation.property_id,
        sender_id: user.id,
        sender_name: sender?.full_name,
      },
    })

    revalidatePath('/messages')
    return { success: true, message }
  } catch (error) {
    console.error('Send message error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

/**
 * Start a new conversation (or return existing one)
 */
export async function startConversation(
  recipientId: string,
  propertyId?: string,
  inquiryId?: string,
  initialMessage?: string
): Promise<ActionResult & { conversationId?: string }> {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    if (recipientId === user.id) {
      return { success: false, error: 'Cannot start a conversation with yourself' }
    }

    // Check if conversation already exists between these users for this property
    const { data: existingConversation } = await (supabase
      .from('conversations') as any)
      .select('id')
      .contains('participants', [user.id, recipientId])
      .eq('property_id', propertyId || null)
      .eq('status', 'active')
      .single()

    let conversationId: string

    if (existingConversation) {
      conversationId = existingConversation.id
    } else {
      // Create new conversation
      const { data: newConversation, error: convError } = await (supabase
        .from('conversations') as any)
        .insert({
          participants: [user.id, recipientId],
          property_id: propertyId || null,
          inquiry_id: inquiryId || null,
          status: 'active',
        })
        .select('id')
        .single()

      if (convError || !newConversation) {
        console.error('Error creating conversation:', convError)
        return { success: false, error: 'Failed to create conversation' }
      }

      conversationId = newConversation.id
    }

    // Send initial message if provided
    if (initialMessage?.trim()) {
      await sendMessage(conversationId, initialMessage)
    }

    revalidatePath('/messages')
    return { success: true, conversationId }
  } catch (error) {
    console.error('Start conversation error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

/**
 * Get total unread message count for current user
 */
export async function getUnreadMessageCount(): Promise<number> {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return 0
    }

    const { count } = await (supabase
      .from('messages') as any)
      .select('*', { count: 'exact', head: true })
      .eq('recipient_id', user.id)
      .eq('read', false)

    return count || 0
  } catch (error) {
    console.error('Get unread count error:', error)
    return 0
  }
}

/**
 * Archive a conversation
 */
export async function archiveConversation(conversationId: string): Promise<ActionResult> {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    const { error } = await (supabase
      .from('conversations') as any)
      .update({ status: 'archived' })
      .eq('id', conversationId)
      .contains('participants', [user.id])

    if (error) {
      console.error('Error archiving conversation:', error)
      return { success: false, error: 'Failed to archive conversation' }
    }

    revalidatePath('/messages')
    return { success: true }
  } catch (error) {
    console.error('Archive conversation error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}
