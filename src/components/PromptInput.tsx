'use client'

import { useEffect, useRef, useState } from 'react'

type PromptInputProps = {
  value?: string
  onChange?: (text: string) => void
  onSubmit?: (text: string) => void
  placeholder?: string
  disabled?: boolean
  isLoading?: boolean
  showSuggestions?: boolean
  maxLength?: number
  className?: string
  suggestions?: string[]
}

export default function PromptInput({
  value: controlledValue,
  onChange,
  onSubmit,
  placeholder = 'Ask me anything...',
  disabled = false,
  isLoading = false,
  showSuggestions = true,
  maxLength = 4000,
  className = '',
  suggestions = [],
}: PromptInputProps) {
  const [value, setValue] = useState<string>(controlledValue ?? '')
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  const isDisabled = disabled || isLoading

  useEffect(() => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = '0px'
    const height = Math.max(40, ta.scrollHeight)
    ta.style.height = height + 'px'
  }, [value, controlledValue])

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const text = e.target.value
    if (text.length > maxLength) return
    if (onChange) onChange(text)
    if (controlledValue === undefined) setValue(text)
  }

  function submitCurrent() {
    if (isDisabled) return
    const text = controlledValue !== undefined ? controlledValue : value
    const trimmed = (text || '').trim()
    if (!trimmed) return
    if (onSubmit) onSubmit(trimmed)
    if (controlledValue === undefined) setValue('')
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submitCurrent()
    }
  }

  function insertSuggestion(s: string) {
    if (isDisabled) return
    if (controlledValue !== undefined) {
      onChange?.(s)
    } else {
      setValue(s)
    }
    textareaRef.current?.focus()
  }

  const currentLength =
    (controlledValue !== undefined ? controlledValue : value)?.length ?? 0

  return (
    <div className={`flex w-full max-w-2xl flex-col gap-2 ${className}`}>
      {showSuggestions && suggestions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {suggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => insertSuggestion(s)}
              disabled={isDisabled}
              className="border-border bg-accent-subtle font-mono cursor-pointer rounded-full border px-3 py-2 text-xs text-foreground/80 transition hover:bg-foreground/10 disabled:cursor-not-allowed disabled:opacity-50 sm:py-1.5"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <div className="border-border bg-surface rounded-2xl border p-4 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <textarea
              ref={textareaRef}
              name="prompt-input"
              id="prompt-input"
              value={controlledValue !== undefined ? controlledValue : value}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={isDisabled}
              aria-label="Prompt input"
              className="w-full resize-none overflow-hidden bg-transparent text-base leading-6 text-foreground/80 outline-none placeholder:text-muted sm:text-lg"
              rows={1}
            />

            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3 text-xs text-muted">
                <span>
                  {currentLength}/{maxLength}
                </span>
                <span className="font-mono hidden sm:inline">
                  Enter to send · Shift+Enter for newline
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (controlledValue === undefined) setValue('')
                    else onChange?.('')
                  }}
                  disabled={isDisabled || currentLength === 0}
                  className="cursor-pointer px-3 py-2 text-sm text-muted transition hover:text-foreground focus-visible:ring-2 focus-visible:ring-foreground/20 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Clear
                </button>

                <button
                  type="button"
                  onClick={submitCurrent}
                  disabled={isDisabled || currentLength === 0}
                  className="btn-accent inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white shadow-sm transition focus-visible:ring-2 focus-visible:ring-indigo-500/40 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isLoading ? 'Sending...' : 'Send'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
