'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils/cn'
import { formatRelativeTime } from '@/lib/utils/format'
import { User, Home, Check, CheckCheck } from 'lucide-react'
import type { Conversation } from '@/lib/types'

interface MessageListProps {
  conversations: Conversation[]
  currentUserId: string
  selectedId?: string
}

export function MessageList({ conversations, currentUserId, selectedId }: MessageListProps) {
  if (conversations.length === 0) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">No conversations yet</p>
      </div>
    )
  }

  return (
    <div className="divide-y">
      {conversations.map((conversation: any) => {
        const isSelected = conversation.id === selectedId
        const hasUnread = conversation.unreadCount > 0
        const initials = conversation.participant?.full_name
          ?.split(' ')
          .map((n: string) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2)

        const isOwnLastMessage = conversation.lastMessage?.sender_id === currentUserId

        return (
          <Link
            key={conversation.id}
            href={`/messages?conversation=${conversation.id}`}
            className={cn(
              'block p-4 transition-all duration-200',
              'hover:bg-accent/50 active:bg-accent',
              isSelected && 'bg-accent border-l-4 border-l-primary',
              hasUnread && !isSelected && 'bg-primary/5'
            )}
          >
            <div className="flex gap-3">
              {/* Avatar with online indicator potential */}
              <div className="relative flex-shrink-0">
                <Avatar className="h-12 w-12 ring-2 ring-background">
                  <AvatarImage src={conversation.participant?.avatar_url} />
                  <AvatarFallback className="bg-primary/10 text-primary font-medium">
                    {initials || <User className="h-5 w-5" />}
                  </AvatarFallback>
                </Avatar>
                {hasUnread && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-[10px] text-primary-foreground font-bold">
                      {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                    </span>
                  </span>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                {/* Header row */}
                <div className="flex items-center justify-between gap-2 mb-0.5">
                  <h3 className={cn(
                    'font-medium truncate',
                    hasUnread && 'font-semibold text-foreground'
                  )}>
                    {conversation.participant?.full_name || 'Unknown User'}
                  </h3>
                  {conversation.lastMessage && (
                    <span className={cn(
                      'text-xs flex-shrink-0',
                      hasUnread ? 'text-primary font-medium' : 'text-muted-foreground'
                    )}>
                      {formatRelativeTime(conversation.lastMessage.created_at)}
                    </span>
                  )}
                </div>

                {/* Property info */}
                {conversation.property && (
                  <div className="flex items-center gap-1.5 mb-1">
                    <Home className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                    <p className="text-xs text-muted-foreground truncate">
                      {conversation.property.title}
                    </p>
                  </div>
                )}

                {/* Last message preview */}
                {conversation.lastMessage && (
                  <div className="flex items-start gap-1.5">
                    {isOwnLastMessage && (
                      <span className="flex-shrink-0 mt-0.5">
                        {conversation.lastMessage.read ? (
                          <CheckCheck className="h-3.5 w-3.5 text-primary" />
                        ) : (
                          <Check className="h-3.5 w-3.5 text-muted-foreground" />
                        )}
                      </span>
                    )}
                    <p className={cn(
                      'text-sm line-clamp-2',
                      hasUnread ? 'text-foreground' : 'text-muted-foreground'
                    )}>
                      {isOwnLastMessage && <span className="text-muted-foreground">You: </span>}
                      {conversation.lastMessage.content}
                    </p>
                  </div>
                )}
              </div>

              {/* Property thumbnail */}
              {conversation.property?.property_images?.[0] && (
                <div className="relative h-14 w-14 rounded-lg overflow-hidden bg-muted flex-shrink-0 hidden sm:block">
                  <Image
                    src={conversation.property.property_images[0].url}
                    alt={conversation.property.title}
                    fill
                    className="object-cover"
                    sizes="56px"
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
