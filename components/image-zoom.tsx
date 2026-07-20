'use client'

import { useState, useRef, useCallback } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface ImageZoomProps {
  src: string
  alt: string
  className?: string
}

/**
 * Image with zoom-on-hover effect.
 * On desktop: shows a zoomed lens that follows the cursor.
 * On mobile: pinch-to-zoom via CSS touch-action.
 */
export function ImageZoom({ src, alt, className }: ImageZoomProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isZooming, setIsZooming] = useState(false)
  const [position, setPosition] = useState({ x: 50, y: 50 })

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100

    setPosition({ x, y })
  }, [])

  const handleMouseEnter = () => setIsZooming(true)
  const handleMouseLeave = () => setIsZooming(false)

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative overflow-hidden cursor-zoom-in rounded-2xl bg-muted',
        className
      )}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Base image */}
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 100vw, 50vw"
        priority
      />

      {/* Zoom overlay — only visible on hover (desktop) */}
      {isZooming && (
        <div
          className="absolute inset-0 hidden sm:block pointer-events-none"
          style={{
            backgroundImage: `url(${src})`,
            backgroundSize: '250%',
            backgroundPosition: `${position.x}% ${position.y}%`,
            backgroundRepeat: 'no-repeat',
          }}
        />
      )}

      {/* Zoom hint */}
      {!isZooming && (
        <div className="absolute bottom-3 right-3 hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-black/50 backdrop-blur-sm text-white text-[10px] font-medium rounded-full opacity-70">
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
          </svg>
          Hover to zoom
        </div>
      )}
    </div>
  )
}
