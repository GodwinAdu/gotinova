import { auth } from '@/lib/auth'
import { AuthForm } from '@/components/auth-form'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import Link from 'next/link'

export const metadata = {
  title: 'Sign In - LuxeHair',
  description: 'Sign in to your LuxeHair account to shop premium hair and wigs',
}

export default async function SignInPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (session?.user) {
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 flex flex-col">
      {/* Header with logo */}
      <div className="p-4 md:p-6">
        <Link href="/" className="inline-flex items-center gap-2 text-lg md:text-xl font-bold text-primary">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-primary rounded-lg" />
          LuxeHair
        </Link>
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center px-4 py-8 md:py-12">
        <div className="w-full max-w-sm space-y-6">
          {/* Welcome section */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Welcome Back</h1>
            <p className="text-sm md:text-base text-muted-foreground">
              Sign in to your account to continue shopping
            </p>
          </div>

          {/* Auth form */}
          <AuthForm mode="sign-in" />

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs md:text-sm uppercase">
              <span className="bg-background px-2 text-muted-foreground">New to LuxeHair?</span>
            </div>
          </div>

          {/* Sign up link */}
          <Link
            href="/sign-up"
            className="block w-full rounded-lg border border-border bg-secondary/50 hover:bg-secondary py-3 text-center font-medium transition-colors"
          >
            Create Account
          </Link>

          {/* Admin link */}
          <div className="border-t border-border pt-4">
            <p className="text-xs md:text-sm text-center text-muted-foreground mb-3">
              Are you an admin?
            </p>
            <Link
              href="/admin/login"
              className="block w-full rounded-lg border border-primary/20 bg-primary/5 hover:bg-primary/10 py-3 text-center font-medium text-primary transition-colors"
            >
              Admin Login
            </Link>
          </div>

          {/* Footer info */}
          <div className="text-center text-xs text-muted-foreground space-y-1">
            <p>Protected by industry-standard security</p>
            <div className="flex justify-center gap-4">
              <Link href="/about" className="hover:text-primary transition-colors">
                About
              </Link>
              <Link href="/" className="hover:text-primary transition-colors">
                Help
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
