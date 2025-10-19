'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils/cn'
import { formatRelativeTime } from '@/lib/utils/format'
import { User } from 'lucide-react'
import type { Conversation } from '@/lib/types'

interface MessageListProps {
  conversations: Conversation[]
  currentUserId: string
  selectedId?: string
}

export function MessageList({ conversations, currentUserId, selectedId }: MessageListProps) {
  return (
    <div className="divide-y">
      {conversations.map((conversation: any) => {
        const isSelected = conversation.id === selectedId
        const initials = conversation.participant?.full_name
          ?.split(' ')
          .map((n: string) => n[0])
          .join('')
          .toUpperCase()

        return (
          <Link
            key={conversation.id}
            href={`/messages?conversation=${conversation.id}`}
            className={cn(
              'block p-4 hover:bg-muted/50 transition-colors',
              isSelected && 'bg-muted'
            )}
          >
            <div className="flex gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={conversation.participant?.avatar_url} />
                <AvatarFallback>
                  {initials || <User className="h-4 w-4" />}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-1">
                  <p className="font-medium truncate">
                    {conversation.participant?.full_name || 'Unknown User'}
                  </p>
                  {conversation.lastMessage && (
                    <span className="text-xs text-muted-foreground">
                      {formatRelativeTime(conversation.lastMessage.created_at)}
                    </span>
                  )}
                </div>
                
                {conversation.property && (
                  <p className="text-xs text-muted-foreground truncate mb-1">
                    {conversation.property.title}
                  </p>
                )}
                
                {conversation.lastMessage && (
                  <p className="text-sm text-muted-foreground truncate">
                    {conversation.lastMessage.sender_id === currentUserId && (
                      <span className="text-muted-foreground">You: </span>
                    )}
                    {conversation.lastMessage.content}
                  </p>
                )}
                
                {conversation.unreadCount > 0 && (
                  <Badge variant="default" className="mt-2">
                    {conversation.unreadCount} new
                  </Badge>
                )}
              </div>
              
              {conversation.property?.property_images?.[0] && (
                <div className="relative h-12 w-12 rounded overflow-hidden bg-muted">
                  <Image
                    src={conversation.property.property_images[0].url}
                    alt={conversation.property.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
            </div>
          </Link>
        )
      })}
    </div>
  )
}