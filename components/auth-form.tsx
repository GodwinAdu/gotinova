'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'

interface AuthFormProps {
  mode: 'sign-in' | 'sign-up'
}

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (mode === 'sign-up') {
        await authClient.signUp.email(
          {
            email,
            password,
            name,
          },
          {
            onRequest: () => {
              setLoading(true)
            },
            onSuccess: () => {
              router.push('/')
              router.refresh()
            },
            onError: (ctx) => {
              setError(ctx.error.message || 'Sign up failed')
            },
          }
        )
      } else {
        await authClient.signIn.email(
          {
            email,
            password,
          },
          {
            onRequest: () => {
              setLoading(true)
            },
            onSuccess: () => {
              router.push('/')
              router.refresh()
            },
            onError: (ctx) => {
              setError(ctx.error.message || 'Sign in failed')
            },
          }
        )
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full space-y-4">
      <div className="bg-card rounded-lg border shadow-sm p-4 md:p-6 space-y-4">
        {error && (
          <div className="p-3 bg-destructive/10 text-destructive rounded-lg text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'sign-up' && (
            <div className="space-y-2">
              <label className="block text-sm font-medium">Full Name</label>
              <Input
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={loading}
                className="h-11 text-base md:text-sm"
              />
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-sm font-medium">Email Address</label>
            <Input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              className="h-11 text-base md:text-sm"
              autoComplete="email"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium">Password</label>
              {mode === 'sign-in' && (
                <Link href="/" className="text-xs text-primary hover:underline">
                  Forgot?
                </Link>
              )}
            </div>
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              className="h-11 text-base md:text-sm"
              autoComplete={mode === 'sign-in' ? 'current-password' : 'new-password'}
            />
          </div>

          {mode === 'sign-up' && (
            <p className="text-xs text-muted-foreground">
              By creating an account, you agree to our Terms of Service and Privacy Policy
            </p>
          )}

          <Button
            type="submit"
            className="w-full h-11 text-base md:text-sm font-medium"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 border-2 border-transparent border-t-current rounded-full animate-spin" />
                {mode === 'sign-in' ? 'Signing in...' : 'Creating account...'}
              </div>
            ) : mode === 'sign-in' ? (
              'Sign In'
            ) : (
              'Create Account'
            )}
          </Button>
        </form>
      </div>

      {/* Footer link - kept outside card for better mobile layout */}
      <div className="text-center text-sm text-muted-foreground">
        {mode === 'sign-in' ? (
          <>
            Don&apos;t have an account?{' '}
            <Link href="/sign-up" className="text-primary hover:underline font-medium">
              Sign up here
            </Link>
          </>
        ) : (
          <>
            Already have an account?{' '}
            <Link href="/sign-in" className="text-primary hover:underline font-medium">
              Sign in here
            </Link>
          </>
        )}
      </div>
    </div>
  )
}
