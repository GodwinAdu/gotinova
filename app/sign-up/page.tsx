import { Suspense } from 'react'
import { auth } from '@/lib/auth'
import { AuthForm } from '@/components/auth-form'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import Link from 'next/link'

export const metadata = {
  title: 'Create Account - GotiNova',
  description: 'Create a new GotiNova account and start shopping premium hair and wigs',
}

export default async function SignUpPage() {
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
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Create Account</h1>
            <p className="text-sm text-muted-foreground">
              Join GotiNova for exclusive products and offers
            </p>
          </div>

          <Suspense fallback={<div className="h-64 animate-pulse bg-muted/30 rounded-2xl" />}>
            <AuthForm mode="sign-up" />
          </Suspense>

          {/* Terms */}
          <div className="text-center text-[11px] text-muted-foreground">
            <p>By creating an account, you agree to our</p>
            <div className="flex justify-center gap-1.5 mt-0.5">
              <Link href="/terms" className="text-primary hover:underline">Terms</Link>
              <span>&</span>
              <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
