'use client'

import Image from 'next/image'
import { FaGithub, FaLinkedin } from 'react-icons/fa'
import { useCallback, useState } from 'react'
import dynamic from 'next/dynamic'
import PromptInput from '@/components/PromptInput'
import ChatMessages from '@/components/ChatMessages'
import ThemeToggle from '@/components/ThemeToggle'
import type {
  ChatErrorResponse,
  ChatMessage,
  ChatSuccessResponse,
} from '@/types/chat'

const Typewriter = dynamic(() => import('typewriter-effect'), { ssr: false })

const USER_ID_STORAGE_KEY = 'site-chat-user-id'

function getOrCreateUserId() {
  if (typeof window === 'undefined') return ''

  const existing = sessionStorage.getItem(USER_ID_STORAGE_KEY)
  if (existing) return existing

  const userId = crypto.randomUUID()
  sessionStorage.setItem(USER_ID_STORAGE_KEY, userId)
  return userId
}

export default function Home() {
  const [showPrompt, setShowPrompt] = useState(false)
  const [hasStartedChat, setHasStartedChat] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const sendMessage = useCallback(
    async (text: string) => {
      const currentUserId = getOrCreateUserId()
      if (!text.trim() || isLoading || !currentUserId) return

      const userMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'user',
        content: text.trim(),
      }

      setHasStartedChat(true)
      setMessages((prev) => [...prev, userMessage])
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

        const data = (await response.json()) as
          | ChatSuccessResponse
          | ChatErrorResponse

        if (!response.ok) {
          throw new Error(
            'error' in data ? data.error : 'Unable to get a response.',
          )
        }

        const success = data as ChatSuccessResponse

        setConversationId(success.conversationId)
        setMessages((prev) => [
          ...prev,
          {
            id: success.messageId,
            role: 'assistant',
            content: success.answer,
          },
        ])
      } catch (err) {
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

  return (
    <div className="bg-background text-foreground flex h-dvh flex-col overflow-hidden">
      <ThemeToggle />

      <header className="mx-auto w-full max-w-5xl shrink-0 px-4 pt-6 sm:px-6 sm:pt-8 lg:px-8">
        <div className="flex flex-col items-center gap-3">
          <Image
            src="/vince-ai.png"
            alt="Portrait of John Vincent Castro"
            width={144}
            height={144}
            priority
            className="ring-foreground/10 h-24 w-24 rounded-full ring-2 sm:h-32 sm:w-32"
          />

          <h1 className="text-foreground/90 text-center text-2xl font-semibold tracking-tight sm:text-3xl md:text-4xl">
            Hi, I'm Vince! 👋
          </h1>

          <div className="flex items-center gap-2">
            <a
              href="https://github.com/jvcastro"
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub"
              className="text-foreground/70 hover:text-foreground cursor-pointer p-2 transition-colors"
            >
              <FaGithub className="h-5 w-5" aria-hidden />
            </a>
            <a
              href="https://www.linkedin.com/in/johnvincentcastro/"
              target="_blank"
              rel="noreferrer"
              aria-label="LinkedIn"
              className="text-foreground/70 hover:text-foreground cursor-pointer p-2 transition-colors"
            >
              <FaLinkedin className="h-5 w-5" aria-hidden />
            </a>
          </div>
        </div>
      </header>

      <section className="mx-auto flex min-h-0 w-full max-w-5xl flex-1 flex-col overflow-hidden px-4 sm:px-6 lg:px-8">
        <div className="flex min-h-0 flex-1 flex-col items-center overflow-hidden">
          {!hasStartedChat && (
            <div className="flex min-h-0 flex-1 items-center justify-center">
              <h2
                className={`text-foreground/70 text-center text-xl font-semibold tracking-tight transition-opacity duration-700 sm:text-2xl md:text-3xl ${
                  showPrompt ? 'opacity-0' : 'opacity-100'
                }`}
              >
                <Typewriter
                  onInit={(typewriter) => {
                    typewriter
                      .typeString('Do you want to know more about me?')
                      .pauseFor(500)
                      .deleteAll()
                      .typeString('Ask me anything.')
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
            showPrompt ? 'opacity-100' : 'pointer-events-none opacity-0'
          }`}
        >
          <PromptInput
            onSubmit={sendMessage}
            isLoading={isLoading}
            showSuggestions={!hasStartedChat}
          />
        </footer>
      </section>
    </div>
  )
}
