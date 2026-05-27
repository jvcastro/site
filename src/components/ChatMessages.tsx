'use client'

import { useEffect, useRef } from 'react'
import CopyButton from '@/components/CopyButton'
import MarkdownMessage from '@/components/MarkdownMessage'
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

      <div
        aria-live="polite"
        aria-relevant="additions text"
        className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain"
      >
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {message.role === 'user' ? (
              <div className="bg-foreground/10 text-foreground/90 max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed break-words sm:text-base">
                {message.content}
              </div>
            ) : (
              <div className="border-border bg-surface/80 relative max-w-[85%] rounded-2xl border border-l-[3px] border-l-indigo-500/70 px-4 py-3 text-sm leading-relaxed break-words backdrop-blur-sm sm:text-base">
                <MarkdownMessage content={message.content} />
                {message.content.trim() && (
                  <div className="mt-2 flex justify-end">
                    <CopyButton text={message.content} />
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        <div ref={bottomRef} />
      </div>
    </div>
  )
}
