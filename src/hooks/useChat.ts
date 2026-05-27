'use client'

import { useCallback, useState } from 'react'
import { parseClientSseStream } from '@/lib/parse-dify-stream'
import type { ChatMessage } from '@/types/chat'

const USER_ID_STORAGE_KEY = 'site-chat-user-id'

function getOrCreateUserId() {
  if (typeof window === 'undefined') return ''

  const existing = sessionStorage.getItem(USER_ID_STORAGE_KEY)
  if (existing) return existing

  const userId = crypto.randomUUID()
  sessionStorage.setItem(USER_ID_STORAGE_KEY, userId)
  return userId
}

export function useChat() {
  const [showPrompt, setShowPrompt] = useState(false)
  const [hasStartedChat, setHasStartedChat] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const startNewConversation = useCallback(() => {
    setMessages([])
    setConversationId(null)
    setHasStartedChat(false)
    setIsLoading(false)
    setError(null)
    setShowPrompt(true)
  }, [])

  const sendMessage = useCallback(
    async (text: string) => {
      const currentUserId = getOrCreateUserId()
      if (!text.trim() || isLoading || !currentUserId) return

      const userMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'user',
        content: text.trim(),
      }

      const assistantId = crypto.randomUUID()
      const assistantPlaceholder: ChatMessage = {
        id: assistantId,
        role: 'assistant',
        content: '',
      }

      setHasStartedChat(true)
      setMessages((prev) => [...prev, userMessage, assistantPlaceholder])
      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: text.trim(),
            conversationId: conversationId ?? undefined,
            userId: currentUserId,
          }),
        })

        if (!response.ok) {
          const data = (await response.json()) as { error?: string }
          throw new Error(data.error ?? 'Unable to get a response.')
        }

        if (!response.body) {
          throw new Error('No response stream received.')
        }

        let accumulated = ''

        for await (const frame of parseClientSseStream(response.body)) {
          if (frame.event === 'chunk') {
            const chunkText = frame.data.text
            if (typeof chunkText === 'string') {
              accumulated = chunkText.startsWith(accumulated)
                ? chunkText
                : accumulated + chunkText
              const content = accumulated
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === assistantId ? { ...msg, content } : msg,
                ),
              )
            }
          }

          if (frame.event === 'meta') {
            const nextConversationId = frame.data.conversationId
            if (typeof nextConversationId === 'string') {
              setConversationId(nextConversationId)
            }
          }

          if (frame.event === 'error') {
            const message = frame.data.message
            throw new Error(
              typeof message === 'string'
                ? message
                : 'Something went wrong. Please try again.',
            )
          }
        }

        if (!accumulated.trim()) {
          throw new Error('Received an empty response. Please try again.')
        }
      } catch (err) {
        setMessages((prev) => prev.filter((msg) => msg.id !== assistantId))
        setError(
          err instanceof Error
            ? err.message
            : 'Something went wrong. Please try again.',
        )
      } finally {
        setIsLoading(false)
      }
    },
    [conversationId, isLoading],
  )

  return {
    showPrompt,
    setShowPrompt,
    hasStartedChat,
    messages,
    isLoading,
    error,
    setError,
    sendMessage,
    startNewConversation,
  }
}
