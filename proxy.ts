import { NextRequest, NextResponse } from 'next/server'

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Protected routes
  const protectedRoutes = ['/account', '/orders', '/wishlist', '/checkout']
  const adminRoutes = ['/admin']

  // Admin login page should not be protected
  if (pathname === '/admin/login') {
    return NextResponse.next()
  }

  // Check if the route is protected
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
  const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route))

  // Get auth token from cookies - better-auth uses 'better-auth.session_token'
  const authToken = request.cookies.get('better-auth.session_token')?.value
    || request.cookies.get('better-auth.session_token.0')?.value
    || request.cookies.get('__Secure-better-auth.session_token')?.value

  // If accessing protected route without auth, redirect to sign-in
  if ((isProtectedRoute || isAdminRoute) && !authToken) {
    const url = request.nextUrl.clone()
    url.pathname = '/sign-in'
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api (API routes)
     * - public assets
     */
    '/((?!_next/static|_next/image|favicon.ico|api|public).*)',
  ],
}
