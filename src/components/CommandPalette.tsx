'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { siteConfig } from '@/config/site'
import { useTheme } from '@/components/ThemeProvider'

export type CommandAction = {
  id: string
  label: string
  keywords?: string[]
  group: string
  run: () => void
}

type CommandPaletteProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAskQuestion: (question: string) => void
  onNewConversation: () => void
}

export default function CommandPalette({
  open,
  onOpenChange,
  onAskQuestion,
  onNewConversation,
}: CommandPaletteProps) {
  const { toggleTheme } = useTheme()
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const actions = useMemo<CommandAction[]>(() => {
    const { chat, links } = siteConfig

    const askActions = chat.suggestions.map((suggestion, index) => ({
      id: `ask-${index}`,
      label: suggestion,
      keywords: ['ask', 'chat', 'question'],
      group: 'Ask',
      run: () => onAskQuestion(suggestion),
    }))

    const linkActions: CommandAction[] = [
      {
        id: 'github',
        label: 'Open GitHub',
        group: 'Links',
        run: () => window.open(links.github, '_blank', 'noopener,noreferrer'),
      },
      {
        id: 'linkedin',
        label: 'Open LinkedIn',
        group: 'Links',
        run: () =>
          window.open(links.linkedin, '_blank', 'noopener,noreferrer'),
      },
      {
        id: 'email',
        label: 'Send email',
        group: 'Links',
        run: () => {
          window.location.href = links.email
        },
      },
    ]

    if (links.resumeUrl) {
      linkActions.push({
        id: 'resume',
        label: 'Download resume',
        group: 'Links',
        run: () =>
          window.open(links.resumeUrl!, '_blank', 'noopener,noreferrer'),
      })
    }

    return [
      ...askActions,
      ...linkActions,
      {
        id: 'new-chat',
        label: 'Start new conversation',
        keywords: ['reset', 'clear'],
        group: 'Chat',
        run: onNewConversation,
      },
      {
        id: 'theme',
        label: 'Toggle theme',
        keywords: ['dark', 'light'],
        group: 'Preferences',
        run: toggleTheme,
      },
    ]
  }, [onAskQuestion, onNewConversation, toggleTheme])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return actions

    return actions.filter((action) => {
      const haystack = [action.label, action.group, ...(action.keywords ?? [])]
        .join(' ')
        .toLowerCase()
      return haystack.includes(q)
    })
  }, [actions, query])

  const close = useCallback(() => {
    onOpenChange(false)
    setQuery('')
    setActiveIndex(0)
  }, [onOpenChange])

  const runAction = useCallback(
    (action: CommandAction) => {
      action.run()
      close()
    },
    [close],
  )

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const isPaletteShortcut =
        (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k'

      if (isPaletteShortcut) {
        event.preventDefault()
        if (!open) {
          setQuery('')
          setActiveIndex(0)
        }
        onOpenChange(!open)
        return
      }

      if (!open) return

      if (event.key === 'Escape') {
        event.preventDefault()
        close()
        return
      }

      if (event.key === 'ArrowDown') {
        event.preventDefault()
        setActiveIndex((index) =>
          filtered.length === 0 ? 0 : (index + 1) % filtered.length,
        )
        return
      }

      if (event.key === 'ArrowUp') {
        event.preventDefault()
        setActiveIndex((index) =>
          filtered.length === 0
            ? 0
            : (index - 1 + filtered.length) % filtered.length,
        )
        return
      }

      if (event.key === 'Enter' && filtered[activeIndex]) {
        event.preventDefault()
        runAction(filtered[activeIndex])
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [activeIndex, close, filtered, onOpenChange, open, runAction])

  useEffect(() => {
    if (open) {
      window.setTimeout(() => inputRef.current?.focus(), 0)
    }
  }, [open])

  useEffect(() => {
    if (!open || !listRef.current) return
    const active = listRef.current.querySelector('[data-active="true"]')
    active?.scrollIntoView({ block: 'nearest' })
  }, [activeIndex, open])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center bg-black/40 p-4 pt-[12vh] backdrop-blur-sm"
      onClick={close}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        className="border-border bg-surface w-full max-w-lg overflow-hidden rounded-xl border shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="border-border border-b px-4 py-3">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value)
              setActiveIndex(0)
            }}
            placeholder="Search commands..."
            aria-label="Search commands"
            className="w-full bg-transparent text-sm text-foreground/90 outline-none placeholder:text-muted"
          />
          <p className="text-muted mt-2 font-mono text-[10px]">
            ↑↓ navigate · Enter run · Esc close · ⌘K toggle
          </p>
        </div>

        <div ref={listRef} className="max-h-72 overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <p className="text-muted px-3 py-6 text-center text-sm">
              No commands found.
            </p>
          ) : (
            filtered.map((action, index) => (
              <button
                key={action.id}
                type="button"
                data-active={index === activeIndex}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => runAction(action)}
                className={`flex w-full cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition ${
                  index === activeIndex
                    ? 'bg-accent-subtle text-foreground'
                    : 'text-foreground/80 hover:bg-accent-subtle/70'
                }`}
              >
                <span>{action.label}</span>
                <span className="text-muted font-mono text-[10px]">
                  {action.group}
                </span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
