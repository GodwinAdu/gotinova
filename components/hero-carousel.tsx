'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'

const HERO_SLIDES = [
  {
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&q=80&auto=format&fit=crop',
    alt: 'Beautiful woman with premium hair styling',
  },
  {
    image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&q=80&auto=format&fit=crop',
    alt: 'Luxury beauty products and cosmetics',
  },
  {
    image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&q=80&auto=format&fit=crop',
    alt: 'Professional hair salon styling',
  },
  {
    image: 'https://images.unsplash.com/photo-1487412912498-0447578fcca8?w=800&q=80&auto=format&fit=crop',
    alt: 'Fashion and lifestyle products',
  },
]

const SLIDE_INTERVAL = 5000 // 5 seconds per slide

export function HeroCarousel() {
  const [current, setCurrent] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)

  const nextSlide = useCallback(() => {
    setIsTransitioning(true)
    setTimeout(() => {
      setCurrent((prev) => (prev + 1) % HERO_SLIDES.length)
      setIsTransitioning(false)
    }, 300)
  }, [])

  useEffect(() => {
    const interval = setInterval(nextSlide, SLIDE_INTERVAL)
    return () => clearInterval(interval)
  }, [nextSlide])

  return (
    <div className="relative aspect-[4/5] sm:aspect-[3/4] lg:aspect-[4/5] max-w-md mx-auto lg:max-w-none rounded-3xl overflow-hidden shadow-2xl shadow-primary/10">
      {/* Images */}
      {HERO_SLIDES.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-all duration-700 ease-in-out ${
            index === current
              ? 'opacity-100 scale-100'
              : 'opacity-0 scale-105'
          }`}
        >
          <Image
            src={slide.image}
            alt={slide.alt}
            fill
            className="object-cover"
            priority={index === 0}
            sizes="(max-width: 768px) 90vw, (max-width: 1200px) 45vw, 500px"
          />
        </div>
      ))}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent z-10" />

      {/* Slide indicators */}
      <div className="absolute bottom-20 sm:bottom-24 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
        {HERO_SLIDES.map((_, index) => (
          <button
            key={index}
            onClick={() => { setCurrent(index); setIsTransitioning(false) }}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              index === current
                ? 'w-6 bg-white'
                : 'w-1.5 bg-white/50 hover:bg-white/70'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Floating badge */}
      <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 z-20">
        <div className="bg-white/90 dark:bg-card/90 backdrop-blur-md rounded-2xl p-3 sm:p-4 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <div>
              <p className="text-xs sm:text-sm font-semibold text-foreground">New Arrivals Weekly</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground">Fresh styles just dropped</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
