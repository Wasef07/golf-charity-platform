import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

export async function middleware(req) {
  let res = NextResponse.next({
    request: {
      headers: req.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            req.cookies.set(name, value)
            res = NextResponse.next({ request: req })
            res.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // THIS IS THE KEY FIX — getUser() refreshes the token properly
  const { data: { user }, error } = await supabase.auth.getUser()

  const protectedRoutes = ['/dashboard', '/scores', '/admin']
  const isProtected = protectedRoutes.some(route =>
    req.nextUrl.pathname.startsWith(route)
  )
  const isAuthPage =
    req.nextUrl.pathname === '/login' ||
    req.nextUrl.pathname === '/signup'

  if (!user && isProtected) {
    const redirectUrl = new URL('/login', req.url)
    redirectUrl.searchParams.set('redirected', 'true')
    return NextResponse.redirect(redirectUrl)
  }

  if (user && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  return res
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/scores/:path*',
    '/admin/:path*',
    '/login',
    '/signup',
  ],
}