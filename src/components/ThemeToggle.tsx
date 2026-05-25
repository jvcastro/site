'use client'

import { HiMoon, HiSun } from 'react-icons/hi2'
import { useTheme } from '@/components/ThemeProvider'

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="fixed top-4 right-4 z-50 inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-border bg-surface text-foreground/80 shadow-sm transition hover:bg-accent-subtle hover:text-foreground focus-visible:ring-2 focus-visible:ring-foreground/20 focus-visible:outline-none"
    >
      {isDark ? (
        <HiSun className="h-5 w-5" aria-hidden />
      ) : (
        <HiMoon className="h-5 w-5" aria-hidden />
      )}
    </button>
  )
}
