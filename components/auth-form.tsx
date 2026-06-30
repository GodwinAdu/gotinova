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
    <div className="w-full max-w-md mx-auto p-6">
      <div className="bg-card rounded-lg border shadow-sm p-8">
        <h1 className="text-2xl font-bold mb-6 text-center">
          {mode === 'sign-in' ? 'Sign In' : 'Create Account'}
        </h1>

        {error && <div className="mb-4 p-3 bg-destructive/10 text-destructive rounded text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'sign-up' && (
            <div>
              <label className="block text-sm font-medium mb-2">Full Name</label>
              <Input
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <Input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (mode === 'sign-in' ? 'Signing in...' : 'Creating account...') : mode === 'sign-in' ? 'Sign In' : 'Sign Up'}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm">
          {mode === 'sign-in' ? (
            <>
              Don&apos;t have an account?{' '}
              <Link href="/sign-up" className="text-primary hover:underline font-medium">
                Sign up
              </Link>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <Link href="/sign-in" className="text-primary hover:underline font-medium">
                Sign in
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
