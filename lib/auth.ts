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

// Get all trusted origins - includes wildcard for v0 development
const getTrustedOrigins = () => {
  const origins = new Set<string>()
  
  // Add base URL
  origins.add(getBaseURL())
  
  // Add v0 runtime URL if available
  if (process.env.V0_RUNTIME_URL) {
    origins.add(process.env.V0_RUNTIME_URL)
  }
  
  // Add Vercel URLs
  if (process.env.VERCEL_URL) {
    origins.add(`https://${process.env.VERCEL_URL}`)
    origins.add(`http://${process.env.VERCEL_URL}`)
  }
  
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    origins.add(`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`)
  }
  
  // Add localhost for development
  if (process.env.NODE_ENV === 'development') {
    origins.add('http://localhost:3000')
    origins.add('http://localhost:3001')
    origins.add('http://localhost')
    
    return [...Array.from(origins)]
  }
  
  return Array.from(origins)
}

const authConfig = {
  database: pool,
  baseURL: getBaseURL(),
  baseURLPath: '/api/auth',
  secret: process.env.BETTER_AUTH_SECRET || 'dev-secret-key-change-in-production-32-chars-min',
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    },
  },
  advanced: {
    defaultCookieAttributes: {
      sameSite: process.env.NODE_ENV === 'development' ? 'none' as const : ('lax' as const),
      secure: process.env.NODE_ENV === 'development' ? true : true,
    },
    disableCSRFCheck: process.env.NODE_ENV === 'development',
  },
}

// Add trustedOrigins only in production
if (process.env.NODE_ENV !== 'development') {
  (authConfig as any).trustedOrigins = getTrustedOrigins()
}

export const auth = betterAuth(authConfig)
