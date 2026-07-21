'use client'

import { useRef, useState, useCallback } from 'react'

interface PullToRefreshProps {
  children: React.ReactNode
}

export function PullToRefresh({ children }: PullToRefreshProps) {
  const [pullDistance, setPullDistance] = useState(0)
  const [refreshing, setRefreshing] = useState(false)
  const startY = useRef<number>(0)
  const pulling = useRef<boolean>(false)

  const THRESHOLD = 80

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (window.scrollY === 0) {
      startY.current = e.touches[0].clientY
      pulling.current = true
    }
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!pulling.current) return

    const currentY = e.touches[0].clientY
    const diff = currentY - startY.current

    if (diff > 0) {
      // Apply resistance: the further you pull, the harder it gets
      const distance = Math.min(diff * 0.5, 120)
      setPullDistance(distance)
    }
  }, [])

  const handleTouchEnd = useCallback(() => {
    if (!pulling.current) return
    pulling.current = false

    if (pullDistance >= THRESHOLD) {
      setRefreshing(true)
      setPullDistance(THRESHOLD)
      // Trigger refresh
      setTimeout(() => {
        window.location.reload()
      }, 600)
    } else {
      setPullDistance(0)
    }
  }, [pullDistance])

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative"
    >
      {/* Spinner indicator */}
      <div
        className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center transition-all duration-200 ease-out z-50"
        style={{
          top: `${pullDistance - 40}px`,
          opacity: Math.min(pullDistance / THRESHOLD, 1),
        }}
      >
        <div
          className={`w-8 h-8 rounded-full border-2 border-primary border-t-transparent ${
            refreshing ? 'animate-spin' : ''
          }`}
          style={{
            transform: refreshing
              ? undefined
              : `rotate(${(pullDistance / THRESHOLD) * 360}deg)`,
          }}
        />
      </div>

      {/* Page content with pull offset */}
      <div
        className="transition-transform duration-200 ease-out"
        style={{
          transform: `translateY(${pullDistance}px)`,
        }}
      >
        {children}
      </div>
    </div>
  )
}
