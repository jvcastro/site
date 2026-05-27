'use client'

import { useEffect, useState } from 'react'

type CursorGridProps = {
  children: React.ReactNode
  className?: string
}

export default function CursorGrid({ children, className = '' }: CursorGridProps) {
  const [enabled, setEnabled] = useState(() => {
    if (typeof window === 'undefined') return false
    return !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  })

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setEnabled(!media.matches)
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])

  function handleMouseMove(event: React.MouseEvent<HTMLDivElement>) {
    if (!enabled) return
    const target = event.currentTarget
    const rect = target.getBoundingClientRect()
    const x = ((event.clientX - rect.left) / rect.width) * 100
    const y = ((event.clientY - rect.top) / rect.height) * 100
    target.style.setProperty('--cursor-x', `${x}%`)
    target.style.setProperty('--cursor-y', `${y}%`)
  }

  return (
    <div
      className={`cursor-grid ${className}`}
      onMouseMove={handleMouseMove}
    >
      {children}
    </div>
  )
}
