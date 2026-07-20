'use client'

import { useEffect, useState } from 'react'
import { Sun, Moon, Monitor } from 'lucide-react'
import { cn } from '@/lib/utils'

type Theme = 'light' | 'dark' | 'system'

const STORAGE_KEY = 'luxehair-theme'

function getStoredTheme(): Theme {
  if (typeof window === 'undefined') return 'system'
  return (localStorage.getItem(STORAGE_KEY) as Theme) || 'system'
}

function applyTheme(theme: Theme) {
  const root = document.documentElement
  root.classList.remove('light', 'dark')

  if (theme === 'system') {
    // Let the CSS prefers-color-scheme handle it (no class)
    return
  }

  root.classList.add(theme)
}

export function ThemeToggle({ className }: { className?: string }) {
  const [theme, setTheme] = useState<Theme>('system')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const stored = getStoredTheme()
    setTheme(stored)
    applyTheme(stored)
  }, [])

  const cycleTheme = () => {
    const next: Theme = theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light'
    setTheme(next)
    localStorage.setItem(STORAGE_KEY, next)
    applyTheme(next)
  }

  if (!mounted) {
    return (
      <button className={cn('p-2 rounded-xl text-muted-foreground', className)} aria-label="Theme">
        <Monitor className="w-4 h-4" />
      </button>
    )
  }

  const icons = {
    light: <Sun className="w-4 h-4" />,
    dark: <Moon className="w-4 h-4" />,
    system: <Monitor className="w-4 h-4" />,
  }

  const labels = {
    light: 'Light mode',
    dark: 'Dark mode',
    system: 'System default',
  }

  return (
    <button
      onClick={cycleTheme}
      className={cn(
        'p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all',
        className
      )}
      aria-label={labels[theme]}
      title={labels[theme]}
    >
      {icons[theme]}
    </button>
  )
}

/**
 * Inline theme toggle with labels — for settings pages
 */
export function ThemeSelector({ className }: { className?: string }) {
  const [theme, setTheme] = useState<Theme>('system')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setTheme(getStoredTheme())
  }, [])

  const selectTheme = (t: Theme) => {
    setTheme(t)
    localStorage.setItem(STORAGE_KEY, t)
    applyTheme(t)
  }

  if (!mounted) return null

  const options: { value: Theme; icon: React.ReactNode; label: string }[] = [
    { value: 'light', icon: <Sun className="w-4 h-4" />, label: 'Light' },
    { value: 'dark', icon: <Moon className="w-4 h-4" />, label: 'Dark' },
    { value: 'system', icon: <Monitor className="w-4 h-4" />, label: 'System' },
  ]

  return (
    <div className={cn('flex gap-1 p-1 bg-muted rounded-xl', className)}>
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => selectTheme(opt.value)}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all',
            theme === opt.value
              ? 'bg-card text-foreground shadow-sm font-medium'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          {opt.icon}
          <span className="hidden sm:inline">{opt.label}</span>
        </button>
      ))}
    </div>
  )
}
