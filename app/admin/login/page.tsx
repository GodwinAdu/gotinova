import { auth } from '@/lib/auth'
import { AuthForm } from '@/components/auth-form'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import Link from 'next/link'
import { db } from '@/lib/db'
import { adminUsers } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export const metadata = {
  title: 'Admin Login - LuxeHair',
  description: 'Admin portal for LuxeHair management',
}

export default async function AdminLoginPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  
  if (session?.user) {
    // Check if user is admin
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
      <div className="p-4 md:p-6 border-b border-border">
        <Link href="/" className="inline-flex items-center gap-2 text-lg md:text-xl font-bold text-primary">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-primary rounded-lg flex items-center justify-center text-white text-xs md:text-sm font-bold">
            LH
          </div>
          LuxeHair Admin
        </Link>
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center px-4 py-8 md:py-12">
        <div className="w-full max-w-sm space-y-6">
          {/* Security notice */}
          <div className="rounded-lg bg-primary/10 border border-primary/20 p-4 space-y-2">
            <p className="text-sm font-semibold text-primary">Admin Portal</p>
            <p className="text-xs md:text-sm text-muted-foreground">
              This area is restricted to authorized administrators only. Unauthorized access attempts are logged.
            </p>
          </div>

          {/* Welcome section */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Admin Login</h1>
            <p className="text-sm md:text-base text-muted-foreground">
              Sign in with your admin credentials
            </p>
          </div>

          {/* Auth form */}
          <AuthForm mode="sign-in" />

          {/* Back to store */}
          <Link
            href="/"
            className="block w-full rounded-lg border border-border bg-secondary/50 hover:bg-secondary py-3 text-center font-medium transition-colors text-sm md:text-base"
          >
            Back to Store
          </Link>

          {/* Support */}
          <div className="text-center text-xs text-muted-foreground">
            <p>Having issues? Contact support</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-border p-4 md:p-6 text-center text-xs text-muted-foreground">
        <p>Protected by enterprise-grade security encryption</p>
      </div>
    </div>
  )
}
