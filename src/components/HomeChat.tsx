'use client'

import { useCallback, useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import ChatMessages from '@/components/ChatMessages'
import CommandPalette from '@/components/CommandPalette'
import PromptInput from '@/components/PromptInput'
import SiteHeader from '@/components/SiteHeader'
import ThemeToggle from '@/components/ThemeToggle'
import { siteConfig } from '@/config/site'
import { useChat } from '@/hooks/useChat'

const Typewriter = dynamic(() => import('typewriter-effect'), { ssr: false })

export default function HomeChat() {
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  })

  const {
    showPrompt,
    setShowPrompt,
    hasStartedChat,
    messages,
    isLoading,
    error,
    setError,
    sendMessage,
    startNewConversation,
  } = useChat()

  const { chat } = siteConfig

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setPrefersReducedMotion(media.matches)
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])

  const handleAskQuestion = useCallback(
    (question: string) => {
      void sendMessage(question)
    },
    [sendMessage],
  )

  const handleNewConversation = useCallback(() => {
    startNewConversation()
  }, [startNewConversation])

  return (
    <>
      <ThemeToggle />

      {hasStartedChat && (
        <button
          type="button"
          onClick={handleNewConversation}
          className="border-border bg-surface text-foreground/80 hover:text-foreground fixed top-4 left-4 z-50 cursor-pointer rounded-full border px-3 py-2 text-xs font-medium shadow-sm transition hover:bg-accent-subtle focus-visible:ring-2 focus-visible:ring-foreground/20 focus-visible:outline-none"
        >
          New chat
        </button>
      )}

      <CommandPalette
        open={paletteOpen}
        onOpenChange={setPaletteOpen}
        onAskQuestion={handleAskQuestion}
        onNewConversation={handleNewConversation}
      />

      <SiteHeader compact={hasStartedChat} />

      <section className="relative z-10 mx-auto flex min-h-0 w-full max-w-5xl flex-1 flex-col overflow-hidden px-4 sm:px-6 lg:px-8">
        <div className="flex min-h-0 flex-1 flex-col items-center overflow-hidden">
          {!hasStartedChat && (
            <div className="flex min-h-0 flex-1 items-center justify-center">
              {prefersReducedMotion ? (
                <h2 className="text-foreground/70 text-center text-xl font-semibold tracking-tight sm:text-2xl md:text-3xl">
                  {chat.heroPrompt}
                </h2>
              ) : (
                <h2
                  className={`text-foreground/70 text-center text-xl font-semibold tracking-tight transition-opacity duration-700 sm:text-2xl md:text-3xl ${
                    showPrompt ? 'opacity-0' : 'opacity-100'
                  }`}
                >
                  <Typewriter
                    onInit={(typewriter) => {
                      typewriter
                        .typeString(chat.heroPrompt)
                        .pauseFor(500)
                        .deleteAll()
                        .callFunction(() => {
                          setShowPrompt(true)
                        })
                        .start()
                    }}
                    options={{
                      autoStart: true,
                      loop: false,
                      deleteSpeed: 1,
                    }}
                  />
                </h2>
              )}
            </div>
          )}

          {hasStartedChat && (
            <div className="flex min-h-0 w-full flex-1 flex-col items-center pt-2">
              <ChatMessages
                messages={messages}
                isLoading={isLoading}
                error={error}
                onDismissError={() => setError(null)}
              />
            </div>
          )}
        </div>

        <footer
          className={`mx-auto w-full max-w-2xl shrink-0 pt-2 pb-4 transition-opacity duration-700 ${
            showPrompt || prefersReducedMotion
              ? 'opacity-100'
              : 'pointer-events-none opacity-0'
          }`}
        >
          <PromptInput
            onSubmit={sendMessage}
            isLoading={isLoading}
            showSuggestions={!hasStartedChat}
            suggestions={chat.suggestions}
          />
        </footer>
      </section>
    </>
  )
}
