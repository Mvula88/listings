'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { MessageList } from './message-list'
import { MessageThread } from './message-thread'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MessageSquare, ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface MessagesViewProps {
  conversations: any[]
  currentUserId: string
  selectedConversationId: string | null
}

export function MessagesView({
  conversations,
  currentUserId,
  selectedConversationId
}: MessagesViewProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isMobile, setIsMobile] = useState(false)

  // Check if we're on mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const selectedConversation = selectedConversationId
    ? conversations.find(c => c.id === selectedConversationId)
    : null

  const handleBack = () => {
    router.push('/messages')
  }

  // Mobile view: Show either list or thread
  if (isMobile) {
    if (selectedConversation) {
      return (
        <div className="h-full flex flex-col">
          <MessageThread
            conversation={selectedConversation}
            currentUserId={currentUserId}
            onBack={handleBack}
            isMobile={true}
          />
        </div>
      )
    }

    return (
      <div className="h-full flex flex-col bg-background">
        <div className="p-4 border-b bg-card">
          <h1 className="text-xl font-semibold">Messages</h1>
          <p className="text-sm text-muted-foreground">
            {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex-1 overflow-y-auto">
          <MessageList
            conversations={conversations}
            currentUserId={currentUserId}
            selectedId={selectedConversationId || undefined}
          />
        </div>
      </div>
    )
  }

  // Desktop view: Side-by-side layout
  return (
    <div className="h-full flex bg-background rounded-lg border overflow-hidden">
      {/* Conversations List - Left Panel */}
      <div className="w-80 lg:w-96 border-r flex flex-col bg-card">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Messages</h2>
          <p className="text-sm text-muted-foreground">
            {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex-1 overflow-y-auto">
          <MessageList
            conversations={conversations}
            currentUserId={currentUserId}
            selectedId={selectedConversationId || undefined}
          />
        </div>
      </div>

      {/* Message Thread - Right Panel */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <MessageThread
            conversation={selectedConversation}
            currentUserId={currentUserId}
            isMobile={false}
          />
        ) : (
          <div className="h-full flex items-center justify-center bg-muted/30">
            <div className="text-center p-8">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">Select a conversation</h3>
              <p className="text-sm text-muted-foreground max-w-xs">
                Choose a conversation from the list to view messages
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
