import { auth } from '@/lib/auth'
import { AuthForm } from '@/components/auth-form'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import Link from 'next/link'

export const metadata = {
  title: 'Create Account - LuxeHair',
  description: 'Create a new LuxeHair account and start shopping premium hair and wigs',
}

export default async function SignUpPage() {
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
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Create Account</h1>
            <p className="text-sm md:text-base text-muted-foreground">
              Join LuxeHair to access exclusive products and benefits
            </p>
          </div>

          {/* Auth form */}
          <AuthForm mode="sign-up" />

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs md:text-sm uppercase">
              <span className="bg-background px-2 text-muted-foreground">Already have an account?</span>
            </div>
          </div>

          {/* Sign in link */}
          <Link
            href="/sign-in"
            className="block w-full rounded-lg border border-border bg-secondary/50 hover:bg-secondary py-3 text-center font-medium transition-colors"
          >
            Sign In
          </Link>

          {/* Terms info */}
          <div className="text-center text-xs text-muted-foreground space-y-2">
            <p>By creating an account, you agree to our</p>
            <div className="flex justify-center gap-2 flex-wrap">
              <Link href="/" className="hover:text-primary transition-colors underline">
                Terms of Service
              </Link>
              <span>and</span>
              <Link href="/" className="hover:text-primary transition-colors underline">
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
