import { Suspense } from 'react'
import { auth } from '@/lib/auth'
import { AuthForm } from '@/components/auth-form'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import Link from 'next/link'

export const metadata = {
  title: 'Sign In - GotiNova',
  description: 'Sign in to your GotiNova account to shop premium hair and wigs',
}

export default async function SignInPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (session?.user) {
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 flex flex-col">
      {/* Header */}
      <div className="p-4 sm:p-6">
        <Link href="/" className="inline-flex items-center gap-2 text-lg font-bold group">
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/70 rounded-xl flex items-center justify-center text-primary-foreground text-xs font-bold shadow-sm">
            GN
          </div>
          <span className="text-foreground">GotiNova</span>
        </Link>
      </div>

      {/* Main */}
      <div className="flex-1 flex items-center justify-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-sm space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Welcome Back</h1>
            <p className="text-sm text-muted-foreground">
              Sign in to continue shopping
            </p>
          </div>

          <Suspense fallback={<div className="h-64 animate-pulse bg-muted/30 rounded-2xl" />}>
            <AuthForm mode="sign-in" />
          </Suspense>

          {/* Admin link */}
          <div className="pt-4 border-t border-border">
            <Link
              href="/admin/login"
              className="block w-full rounded-xl border border-border/60 bg-muted/30 hover:bg-muted/60 py-2.5 text-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Admin Login →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
