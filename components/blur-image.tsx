'use client'

import Image, { ImageProps } from 'next/image'
import { useState } from 'react'

// Generic 10x10 blurred SVG placeholder
const shimmerBase64 =
  'data:image/svg+xml;base64,' +
  Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10">
      <filter id="b" color-interpolation-filters="sRGB">
        <feGaussianBlur stdDeviation="2"/>
      </filter>
      <rect width="100%" height="100%" fill="#e2e2e2" filter="url(#b)"/>
    </svg>`
  ).toString('base64')

interface BlurImageProps extends Omit<ImageProps, 'placeholder' | 'blurDataURL'> {
  blurDataURL?: string
}

export function BlurImage({ blurDataURL, className, ...props }: BlurImageProps) {
  const [loaded, setLoaded] = useState(false)

  return (
    <div className="relative overflow-hidden">
      {/* Shimmer animation while loading */}
      {!loaded && (
        <div className="absolute inset-0 z-10">
          <div className="w-full h-full bg-muted animate-pulse" />
          <div
            className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite]"
            style={{
              background:
                'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)',
            }}
          />
        </div>
      )}
      <Image
        {...props}
        placeholder="blur"
        blurDataURL={blurDataURL || shimmerBase64}
        className={`transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'} ${className || ''}`}
        onLoad={() => setLoaded(true)}
      />
    </div>
  )
}
