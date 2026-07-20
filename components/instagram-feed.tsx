'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
    </svg>
  )
}

/**
 * Instagram Feed Integration
 * 
 * Uses the Instagram Basic Display API to show your latest posts.
 * 
 * Setup:
 * 1. Go to https://developers.facebook.com/
 * 2. Create an app → Add Instagram Basic Display
 * 3. Generate a long-lived access token
 * 4. Add to .env: NEXT_PUBLIC_INSTAGRAM_TOKEN=your_token
 * 5. Add your handle: NEXT_PUBLIC_INSTAGRAM_HANDLE=luxehair_gh
 * 
 * If no token is configured, shows placeholder grid with CTA.
 */

interface InstaPost {
  id: string
  media_url: string
  permalink: string
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM'
  caption?: string
}

const INSTAGRAM_HANDLE = process.env.NEXT_PUBLIC_INSTAGRAM_HANDLE || 'luxehair_gh'

export function InstagramFeed() {
  const [posts, setPosts] = useState<InstaPost[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    const token = process.env.NEXT_PUBLIC_INSTAGRAM_TOKEN
    if (!token || token === 'your_token') {
      // No token — use placeholder
      return
    }

    try {
      const res = await fetch(
        `https://graph.instagram.com/me/media?fields=id,media_url,permalink,media_type,caption&limit=6&access_token=${token}`
      )
      if (res.ok) {
        const data = await res.json()
        setPosts(data.data?.filter((p: InstaPost) => p.media_type !== 'VIDEO').slice(0, 6) || [])
      }
    } catch {
      // Silently fail
    }
  }

  if (!mounted) return null

  return (
    <section className="py-10 sm:py-14 border-t">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <InstagramIcon className="w-5 h-5 text-pink-500" />
            <h2 className="text-xl sm:text-2xl font-bold">Follow Us on Instagram</h2>
          </div>
          <a
            href={`https://instagram.com/${INSTAGRAM_HANDLE}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs sm:text-sm text-primary font-medium hover:underline"
          >
            @{INSTAGRAM_HANDLE}
          </a>
        </div>

        {/* Grid */}
        {posts.length > 0 ? (
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3">
            {posts.map((post) => (
              <a
                key={post.id}
                href={post.permalink}
                target="_blank"
                rel="noopener noreferrer"
                className="aspect-square rounded-xl overflow-hidden bg-muted group relative"
              >
                <img
                  src={post.media_url}
                  alt={post.caption?.slice(0, 50) || 'Instagram post'}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <InstagramIcon className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </a>
            ))}
          </div>
        ) : (
          /* Placeholder when no token configured */
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <a
                key={i}
                href={`https://instagram.com/${INSTAGRAM_HANDLE}`}
                target="_blank"
                rel="noopener noreferrer"
                className="aspect-square rounded-xl bg-gradient-to-br from-pink-100 to-purple-100 dark:from-pink-900/20 dark:to-purple-900/20 flex items-center justify-center group hover:scale-[1.02] transition-transform"
              >
                <InstagramIcon className="w-6 h-6 text-pink-400/50 group-hover:text-pink-500 transition-colors" />
              </a>
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="text-center mt-5">
          <a
            href={`https://instagram.com/${INSTAGRAM_HANDLE}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-medium text-pink-600 hover:text-pink-700 transition-colors"
          >
            <InstagramIcon className="w-4 h-4" />
            Follow @{INSTAGRAM_HANDLE} for daily inspiration
          </a>
        </div>
      </div>
    </section>
  )
}
