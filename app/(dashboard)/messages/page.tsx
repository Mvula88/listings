import { createClient } from '@/lib/supabase/server'
import { MessagesView } from '@/components/messages/messages-view'
import { MessageSquare } from 'lucide-react'

export default async function MessagesPage({
  searchParams
}: {
  searchParams: Promise<{ conversation?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // Get user's conversations
  const { data: conversations } = await supabase
    .from('conversations')
    .select(`
      *,
      property:properties (
        id,
        title,
        property_images (
          url
        )
      ),
      messages (
        id,
        content,
        created_at,
        sender_id,
        read
      )
    `)
    .contains('participants', [user.id])
    .order('created_at', { ascending: false })

  // Get participants info for each conversation
  const conversationsWithParticipants = await Promise.all(
    (conversations || []).map(async (conv: any) => {
      const otherParticipantId = conv.participants.find((id: string) => id !== user.id)

      const { data: participant } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .eq('id', otherParticipantId)
        .single()

      // Get last message
      const lastMessage = conv.messages
        ?.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]

      // Count unread messages
      const unreadCount = conv.messages
        ?.filter((m: any) => m.sender_id !== user.id && !m.read).length || 0

      return {
        ...conv,
        participant,
        lastMessage,
        unreadCount
      }
    })
  )

  const selectedConversationId = params.conversation || null

  return (
    <div className="h-[calc(100vh-8rem)] md:h-[calc(100vh-6rem)]">
      {conversationsWithParticipants.length > 0 ? (
        <MessagesView
          conversations={conversationsWithParticipants}
          currentUserId={user.id}
          selectedConversationId={selectedConversationId}
        />
      ) : (
        <div className="h-full flex items-center justify-center">
          <div className="text-center p-8">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No messages yet</h3>
            <p className="text-muted-foreground text-sm max-w-sm">
              Start a conversation by contacting a property seller or responding to inquiries about your listings.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
