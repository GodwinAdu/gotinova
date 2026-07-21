'use client'

import { useRef, useState, useCallback } from 'react'
import { Trash2 } from 'lucide-react'

interface SwipeToDeleteProps {
  children: React.ReactNode
  onDelete: () => void
}

export function SwipeToDelete({ children, onDelete }: SwipeToDeleteProps) {
  const [offsetX, setOffsetX] = useState(0)
  const [swiping, setSwiping] = useState(false)
  const startX = useRef<number>(0)
  const startY = useRef<number>(0)
  const isHorizontal = useRef<boolean | null>(null)

  const THRESHOLD = 80

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX
    startY.current = e.touches[0].clientY
    isHorizontal.current = null
    setSwiping(true)
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!swiping) return

    const currentX = e.touches[0].clientX
    const currentY = e.touches[0].clientY
    const diffX = currentX - startX.current
    const diffY = currentY - startY.current

    // Determine swipe direction on first significant move
    if (isHorizontal.current === null) {
      if (Math.abs(diffX) > 5 || Math.abs(diffY) > 5) {
        isHorizontal.current = Math.abs(diffX) > Math.abs(diffY)
      }
      return
    }

    // Only handle horizontal swipes
    if (!isHorizontal.current) return

    // Only allow swiping left (negative direction)
    if (diffX < 0) {
      const distance = Math.max(diffX * 0.8, -150)
      setOffsetX(distance)
    }
  }, [swiping])

  const handleTouchEnd = useCallback(() => {
    setSwiping(false)
    isHorizontal.current = null

    if (Math.abs(offsetX) >= THRESHOLD) {
      // Animate out and delete
      setOffsetX(-300)
      setTimeout(() => {
        onDelete()
      }, 200)
    } else {
      // Spring back
      setOffsetX(0)
    }
  }, [offsetX, onDelete])

  return (
    <div className="relative overflow-hidden rounded-2xl">
      {/* Red delete background */}
      <div className="absolute inset-0 bg-destructive flex items-center justify-end px-6 rounded-2xl">
        <div className="flex flex-col items-center gap-1 text-white">
          <Trash2 className="w-5 h-5" />
          <span className="text-xs font-medium">Delete</span>
        </div>
      </div>

      {/* Swipeable content */}
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="relative z-10"
        style={{
          transform: `translateX(${offsetX}px)`,
          transition: swiping ? 'none' : 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        }}
      >
        {children}
      </div>
    </div>
  )
}
