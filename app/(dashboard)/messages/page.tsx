import { createClient } from '@/lib/supabase/server'
import { MessageList } from '@/components/messages/message-list'
import { MessageThread } from '@/components/messages/message-thread'
import { Card, CardContent } from '@/components/ui/card'
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

  const selectedConversation = params.conversation
    ? conversationsWithParticipants.find(c => c.id === params.conversation)
    : null

  return (
    <div className="h-[calc(100vh-8rem)]">
      <div className="grid grid-cols-3 gap-6 h-full">
        {/* Conversations List */}
        <div className="col-span-1 border-r">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold">Messages</h2>
            <p className="text-sm text-muted-foreground">
              {conversationsWithParticipants.length} conversations
            </p>
          </div>
          
          <div className="overflow-y-auto h-[calc(100%-5rem)]">
            {conversationsWithParticipants.length > 0 ? (
              <MessageList 
                conversations={conversationsWithParticipants}
                currentUserId={user.id}
                selectedId={selectedConversation?.id}
              />
            ) : (
              <div className="p-8 text-center">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No messages yet</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Start by contacting a property seller
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Message Thread */}
        <div className="col-span-2">
          {selectedConversation ? (
            <MessageThread
              conversation={selectedConversation}
              currentUserId={user.id}
            />
          ) : (
            <Card className="h-full flex items-center justify-center">
              <CardContent className="text-center">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium">Select a conversation</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Choose a conversation from the list to view messages
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}