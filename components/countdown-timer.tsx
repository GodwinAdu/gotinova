'use client'

import { useEffect, useState } from 'react'
import { Flame } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CountdownTimerProps {
  endDate: Date | string
  className?: string
  variant?: 'badge' | 'full' | 'inline'
  onExpired?: () => void
}

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
  expired: boolean
}

function calculateTimeLeft(endDate: Date): TimeLeft {
  const now = new Date().getTime()
  const end = new Date(endDate).getTime()
  const diff = end - now

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true }
  }

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000),
    expired: false,
  }
}

export function CountdownTimer({ endDate, className, variant = 'full', onExpired }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => calculateTimeLeft(new Date(endDate)))
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const interval = setInterval(() => {
      const tl = calculateTimeLeft(new Date(endDate))
      setTimeLeft(tl)
      if (tl.expired) {
        clearInterval(interval)
        onExpired?.()
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [endDate, onExpired])

  if (!mounted) return null
  if (timeLeft.expired) return null

  if (variant === 'badge') {
    return (
      <div className={cn('flex items-center gap-1 px-2 py-0.5 bg-destructive text-white rounded-full text-[10px] font-bold', className)}>
        <Flame className="w-3 h-3" />
        {timeLeft.hours}h {timeLeft.minutes}m
      </div>
    )
  }

  if (variant === 'inline') {
    return (
      <span className={cn('text-xs font-mono font-bold text-destructive', className)}>
        {timeLeft.days > 0 && `${timeLeft.days}d `}
        {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
      </span>
    )
  }

  // Full variant
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="flex items-center gap-1">
        <Flame className="w-4 h-4 text-destructive" />
        <span className="text-xs font-semibold text-destructive">Ends in</span>
      </div>
      <div className="flex gap-1">
        {timeLeft.days > 0 && (
          <TimeBlock value={timeLeft.days} label="D" />
        )}
        <TimeBlock value={timeLeft.hours} label="H" />
        <TimeBlock value={timeLeft.minutes} label="M" />
        <TimeBlock value={timeLeft.seconds} label="S" />
      </div>
    </div>
  )
}

function TimeBlock({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex items-center gap-0.5">
      <span className="bg-foreground text-background text-xs font-bold px-1.5 py-0.5 rounded-md min-w-[1.75rem] text-center font-mono">
        {String(value).padStart(2, '0')}
      </span>
      <span className="text-[9px] text-muted-foreground font-medium">{label}</span>
    </div>
  )
}
