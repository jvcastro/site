'use client'

import { useState } from 'react'
import { HiCheck, HiOutlineClipboard } from 'react-icons/hi2'

type CopyButtonProps = {
  text: string
  className?: string
}

export default function CopyButton({ text, className = '' }: CopyButtonProps) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    if (!text.trim()) return

    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard unavailable
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={copied ? 'Copied' : 'Copy message'}
      className={`text-muted hover:text-foreground inline-flex cursor-pointer items-center gap-1 rounded px-2 py-1 text-xs transition focus-visible:ring-2 focus-visible:ring-foreground/20 focus-visible:outline-none ${className}`}
    >
      {copied ? (
        <>
          <HiCheck className="h-3.5 w-3.5" aria-hidden />
          Copied
        </>
      ) : (
        <>
          <HiOutlineClipboard className="h-3.5 w-3.5" aria-hidden />
          Copy
        </>
      )}
    </button>
  )
}
