/**
 * Simple in-memory rate limiter for API routes.
 * 
 * Usage in any API route:
 *   import { rateLimit } from '@/lib/rate-limit'
 *   const limiter = rateLimit({ interval: 60000, limit: 10 })
 *   
 *   export async function POST(req: Request) {
 *     const ip = req.headers.get('x-forwarded-for') || 'unknown'
 *     const { success } = await limiter.check(ip)
 *     if (!success) return new Response('Too many requests', { status: 429 })
 *     // ... handle request
 *   }
 */

interface RateLimitConfig {
  interval: number // Window in ms (e.g. 60000 = 1 minute)
  limit: number // Max requests per window
}

interface TokenBucket {
  count: number
  lastReset: number
}

export function rateLimit({ interval, limit }: RateLimitConfig) {
  const buckets = new Map<string, TokenBucket>()

  // Cleanup old entries periodically
  setInterval(() => {
    const now = Date.now()
    for (const [key, bucket] of buckets.entries()) {
      if (now - bucket.lastReset > interval * 2) {
        buckets.delete(key)
      }
    }
  }, interval)

  return {
    check: async (identifier: string): Promise<{ success: boolean; remaining: number }> => {
      const now = Date.now()
      const bucket = buckets.get(identifier)

      if (!bucket || now - bucket.lastReset > interval) {
        // New window
        buckets.set(identifier, { count: 1, lastReset: now })
        return { success: true, remaining: limit - 1 }
      }

      if (bucket.count >= limit) {
        return { success: false, remaining: 0 }
      }

      bucket.count++
      return { success: true, remaining: limit - bucket.count }
    },
  }
}

// Pre-configured limiters for common use cases
export const authLimiter = rateLimit({ interval: 60000, limit: 5 }) // 5 attempts/min
export const apiLimiter = rateLimit({ interval: 60000, limit: 30 }) // 30 requests/min
export const orderLimiter = rateLimit({ interval: 60000, limit: 3 }) // 3 orders/min
