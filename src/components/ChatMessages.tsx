'use client'

import { useEffect, useRef } from 'react'
import type { ChatMessage } from '@/types/chat'

type ChatMessagesProps = {
  messages: ChatMessage[]
  isLoading: boolean
  error: string | null
  onDismissError?: () => void
}

export default function ChatMessages({
  messages,
  isLoading,
  error,
  onDismissError,
}: ChatMessagesProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading, error])

  if (messages.length === 0 && !isLoading && !error) {
    return null
  }

  return (
    <div className="mx-auto flex h-full min-h-0 w-full max-w-2xl flex-col gap-3">
      {error && (
        <div
          role="alert"
          className="flex shrink-0 items-start justify-between gap-3 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-200"
        >
          <p className="min-w-0 break-words">{error}</p>
          {onDismissError && (
            <button
              type="button"
              onClick={onDismissError}
              className="shrink-0 cursor-pointer px-2 py-1 text-xs text-red-700/80 transition hover:text-red-700 dark:text-red-200/80 dark:hover:text-red-100"
              aria-label="Dismiss error"
            >
              Dismiss
            </button>
          )}
        </div>
      )}

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed break-words sm:text-base ${
                message.role === 'user'
                  ? 'bg-foreground/10 text-foreground/90'
                  : 'border border-border bg-surface text-foreground/80'
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="rounded-2xl border border-border bg-surface px-4 py-3 text-sm text-muted">
              <span>Thinking</span>
              <span className="inline-flex w-6 animate-pulse">...</span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  )
}
