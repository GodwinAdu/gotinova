import { auth } from '@/lib/auth'
import { toNextJsHandler } from 'better-auth/next-js'
import { authLimiter } from '@/lib/rate-limit'
import { NextRequest, NextResponse } from 'next/server'

const { GET: authGET, POST: authPOST } = toNextJsHandler(auth)

export const GET = authGET

// Rate limit POST requests (sign-in, sign-up attempts)
export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || req.headers.get('x-real-ip') || 'unknown'

  const { success } = await authLimiter.check(ip)
  if (!success) {
    return NextResponse.json(
      { error: 'Too many attempts. Please wait a minute and try again.' },
      { status: 429 }
    )
  }

  return authPOST(req)
}
