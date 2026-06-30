import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Protected routes
  const protectedRoutes = ['/account', '/orders', '/wishlist', '/checkout']
  const adminRoutes = ['/admin']

  // Check if the route is protected
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
  const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route))

  // Get auth token from cookies
  const authToken = request.cookies.get('auth')?.value

  // If accessing protected route without auth, redirect to sign-in
  if ((isProtectedRoute || isAdminRoute) && !authToken) {
    const url = request.nextUrl.clone()
    url.pathname = '/sign-in'
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  // For admin routes, you would typically check role here
  // This is a basic implementation

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}
