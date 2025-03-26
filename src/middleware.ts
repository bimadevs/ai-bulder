import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  // Create a Supabase client configured to use cookies
  const { supabase, response } = createClient(request)

  // Refresh session if expired - required for Server Components
  await supabase.auth.getSession()

  // Authentication logic
  const { data: { session } } = await supabase.auth.getSession()

  // Auth required paths
  const authRequiredPaths = [
    '/dashboard',
    '/projects',
    '/settings',
    '/api-keys',
  ]

  // Auth non-required paths
  const authNonRequiredPaths = [
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
  ]

  const path = request.nextUrl.pathname

  // Check if the request is for a protected route
  const isAuthRequired = authRequiredPaths.some(p => path.startsWith(p))
  const isAuthNonRequired = authNonRequiredPaths.some(p => path === p)

  // Redirect logic based on authentication status
  if (isAuthRequired && !session) {
    // Not authenticated, redirect to login
    const redirectUrl = new URL('/login', request.url)
    redirectUrl.searchParams.set('redirect', path)
    return NextResponse.redirect(redirectUrl)
  }

  if (isAuthNonRequired && session) {
    // Already authenticated, redirect to dashboard
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
} 