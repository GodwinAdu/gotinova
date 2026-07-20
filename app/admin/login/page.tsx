import { Suspense } from 'react'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import Link from 'next/link'
import { db } from '@/lib/db'
import { adminUsers } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { AdminAuthForm } from './admin-auth-form'

export const metadata = {
  title: 'Admin Login - GotiNova',
  description: 'Admin portal for GotiNova management',
}

export default async function AdminLoginPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  
  if (session?.user) {
    const adminUser = await db
      .select()
      .from(adminUsers)
      .where(eq(adminUsers.userId, session.user.id))
      .limit(1)

    if (adminUser.length > 0) {
      redirect('/admin')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-background flex flex-col">
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-border">
        <Link href="/" className="inline-flex items-center gap-2 text-lg font-bold">
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/70 rounded-xl flex items-center justify-center text-primary-foreground text-xs font-bold shadow-sm">
            GN
          </div>
          <span className="text-primary">GotiNova Admin</span>
        </Link>
      </div>

      {/* Main */}
      <div className="flex-1 flex items-center justify-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-sm space-y-6">
          <div className="rounded-2xl bg-primary/10 border border-primary/20 p-4 space-y-1.5">
            <p className="text-sm font-semibold text-primary">Admin Portal</p>
            <p className="text-xs text-muted-foreground">
              Restricted to authorized administrators only.
            </p>
          </div>

          <div className="text-center space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Admin Login</h1>
            <p className="text-sm text-muted-foreground">
              Sign in with your admin credentials
            </p>
          </div>

          <Suspense fallback={<div className="h-64 animate-pulse bg-muted/30 rounded-2xl" />}>
            <AdminAuthForm />
          </Suspense>

          <Link
            href="/"
            className="block w-full rounded-xl border border-border/60 bg-muted/30 hover:bg-muted/60 py-2.5 text-center text-sm font-medium transition-colors"
          >
            ← Back to Store
          </Link>
        </div>
      </div>
    </div>
  )
}
