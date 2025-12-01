'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils/cn'
import { formatRelativeTime } from '@/lib/utils/format'
import { Send, User, Home, ArrowLeft, Loader2, Check, CheckCheck, MoreVertical } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { sendMessage as sendMessageAction, type Message } from '@/lib/actions/messages'
import { useToast } from '@/lib/hooks/use-toast'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface MessageThreadProps {
  conversation: any
  currentUserId: string
  onBack?: () => void
  isMobile?: boolean
}

export function MessageThread({ conversation, currentUserId, onBack, isMobile = false }: MessageThreadProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const supabase = createClient()
  const { toast } = useToast()

  useEffect(() => {
    async function loadMessages() {
      setLoading(true)
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversation.id)
        .order('created_at', { ascending: true })

      if (data) {
        setMessages(data)
      }
      setLoading(false)
    }

    async function markMessagesAsRead() {
      await (supabase.from('messages') as any)
        .update({ read: true })
        .eq('conversation_id', conversation.id)
        .eq('recipient_id', currentUserId)
        .eq('read', false)
    }

    loadMessages()
    markMessagesAsRead()

    // Subscribe to new messages
    const channel = supabase
      .channel(`messages:${conversation.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversation.id}`
        },
        (payload) => {
          const newMessage = payload.new as Message
          setMessages(prev => [...prev, newMessage])
          if (newMessage.sender_id !== currentUserId) {
            markMessagesAsRead()
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [conversation.id, currentUserId, supabase])

  useEffect(() => {
    // Scroll to bottom when messages change
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px'
    }
  }, [newMessage])

  async function sendMessage() {
    if (!newMessage.trim() || sending) return

    setSending(true)
    const messageContent = newMessage.trim()
    setNewMessage('')

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }

    // Create optimistic message
    const optimisticMessage: Message = {
      id: `temp-${Date.now()}`,
      conversation_id: conversation.id,
      sender_id: currentUserId,
      recipient_id: conversation.participant?.id,
      content: messageContent,
      read: false,
      created_at: new Date().toISOString(),
    }

    setMessages(prev => [...prev, optimisticMessage])

    try {
      const result = await sendMessageAction(conversation.id, messageContent)

      if (!result.success) {
        toast.error(result.error || 'Failed to send message')
        setMessages(prev => prev.filter(m => m.id !== optimisticMessage.id))
        setNewMessage(messageContent)
      } else if (result.message) {
        const realMessage = result.message
        setMessages(prev =>
          prev.map(m => m.id === optimisticMessage.id ? realMessage : m)
        )
      }
    } catch (error) {
      console.error('Error sending message:', error)
      toast.error('Failed to send message')
      setMessages(prev => prev.filter(m => m.id !== optimisticMessage.id))
      setNewMessage(messageContent)
    } finally {
      setSending(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const initials = conversation.participant?.full_name
    ?.split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  // Group messages by date
  const groupedMessages = messages.reduce((groups: { date: string; messages: Message[] }[], message) => {
    const date = new Date(message.created_at).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    })
    const lastGroup = groups[groups.length - 1]

    if (lastGroup && lastGroup.date === date) {
      lastGroup.messages.push(message)
    } else {
      groups.push({ date, messages: [message] })
    }
    return groups
  }, [])

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="border-b bg-card px-4 py-3 flex items-center gap-3 shrink-0">
        {isMobile && onBack && (
          <Button variant="ghost" size="icon" onClick={onBack} className="shrink-0 -ml-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}

        <Avatar className="h-10 w-10 shrink-0">
          <AvatarImage src={conversation.participant?.avatar_url} />
          <AvatarFallback className="bg-primary/10 text-primary font-medium">
            {initials || <User className="h-4 w-4" />}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <h2 className="font-semibold truncate">
            {conversation.participant?.full_name || 'Unknown User'}
          </h2>
          {conversation.property && (
            <Link
              href={`/properties/${conversation.property.id}`}
              className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 truncate"
            >
              <Home className="h-3 w-3 shrink-0" />
              <span className="truncate">{conversation.property.title}</span>
            </Link>
          )}
        </div>

        {conversation.property?.property_images?.[0] && (
          <Link
            href={`/properties/${conversation.property.id}`}
            className="relative h-10 w-10 rounded-lg overflow-hidden bg-muted shrink-0 hidden sm:block"
          >
            <Image
              src={conversation.property.property_images[0].url}
              alt={conversation.property.title}
              fill
              className="object-cover"
              sizes="40px"
            />
          </Link>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="shrink-0">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {conversation.property && (
              <DropdownMenuItem asChild>
                <Link href={`/properties/${conversation.property.id}`}>
                  View Property
                </Link>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Messages Area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 bg-muted/30"
      >
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <p className="text-muted-foreground mb-2">No messages yet</p>
              <p className="text-sm text-muted-foreground">Send a message to start the conversation</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {groupedMessages.map((group, groupIndex) => (
              <div key={group.date}>
                {/* Date separator */}
                <div className="flex items-center justify-center mb-4">
                  <div className="bg-background px-3 py-1 rounded-full text-xs text-muted-foreground border">
                    {group.date}
                  </div>
                </div>

                {/* Messages for this date */}
                <div className="space-y-3">
                  {group.messages.map((message, messageIndex) => {
                    const isOwn = message.sender_id === currentUserId
                    const isTemp = message.id.startsWith('temp-')
                    const prevMessage = messageIndex > 0 ? group.messages[messageIndex - 1] : null
                    const showAvatar = !isOwn && (!prevMessage || prevMessage.sender_id !== message.sender_id)

                    return (
                      <div
                        key={message.id}
                        className={cn(
                          'flex items-end gap-2',
                          isOwn ? 'justify-end' : 'justify-start'
                        )}
                      >
                        {/* Avatar for other person */}
                        {!isOwn && (
                          <div className="w-8 shrink-0">
                            {showAvatar && (
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={conversation.participant?.avatar_url} />
                                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                  {initials || <User className="h-3 w-3" />}
                                </AvatarFallback>
                              </Avatar>
                            )}
                          </div>
                        )}

                        {/* Message bubble */}
                        <div
                          className={cn(
                            'max-w-[85%] sm:max-w-[70%] rounded-2xl px-4 py-2.5 shadow-sm',
                            isOwn
                              ? 'bg-primary text-primary-foreground rounded-br-md'
                              : 'bg-card border rounded-bl-md',
                            isTemp && 'opacity-70'
                          )}
                        >
                          <p className="text-sm whitespace-pre-wrap break-words">
                            {message.content}
                          </p>
                          <div className={cn(
                            'flex items-center justify-end gap-1 mt-1',
                            isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'
                          )}>
                            <span className="text-[10px]">
                              {new Date(message.created_at).toLocaleTimeString('en-US', {
                                hour: 'numeric',
                                minute: '2-digit',
                                hour12: true
                              })}
                            </span>
                            {isOwn && (
                              isTemp ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : message.read ? (
                                <CheckCheck className="h-3.5 w-3.5" />
                              ) : (
                                <Check className="h-3.5 w-3.5" />
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t bg-card p-3 shrink-0">
        <div className="flex items-end gap-2">
          <Textarea
            ref={textareaRef}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            disabled={sending}
            className="min-h-[44px] max-h-[120px] resize-none rounded-2xl bg-muted/50 border-0 focus-visible:ring-1 focus-visible:ring-primary"
            rows={1}
          />
          <Button
            onClick={sendMessage}
            disabled={!newMessage.trim() || sending}
            size="icon"
            className="h-11 w-11 rounded-full shrink-0"
          >
            {sending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>
        <p className="text-[10px] text-muted-foreground text-center mt-2">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  )
}
