import { betterAuth } from 'better-auth'
import { pool } from './db'

const getBaseURL = () => {
  if (process.env.BETTER_AUTH_URL) return process.env.BETTER_AUTH_URL
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }
  return process.env.V0_RUNTIME_URL || 'http://localhost:3000'
}

export const auth = betterAuth({
  database: pool,
  baseURL: getBaseURL(),
  baseURLPath: '/api/auth',
  trustedOrigins: [
    getBaseURL(),
    ...(process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? [`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`]
      : []),
    ...(process.env.VERCEL_URL ? [`https://${process.env.VERCEL_URL}`] : []),
    ...(process.env.V0_RUNTIME_URL ? [process.env.V0_RUNTIME_URL] : []),
  ].filter(Boolean),
  secret: process.env.NEON_AUTH_COOKIE_SECRET,
  emailAndPassword: {
    enabled: true,
  },
  advanced: {
    defaultCookieAttributes: {
      sameSite: process.env.NODE_ENV === 'development' ? 'none' : 'lax',
      secure: process.env.NODE_ENV === 'development' ? true : true,
    },
  },
})
