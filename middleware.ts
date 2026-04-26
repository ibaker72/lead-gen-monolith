import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { Database } from '@/types/database'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        set(name: string, value: string, options: any) {
          request.cookies.set(name, value)
          supabaseResponse = NextResponse.next({ request })
          supabaseResponse.cookies.set(name, value, options)
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        remove(name: string, options: any) {
          request.cookies.set(name, '')
          supabaseResponse = NextResponse.next({ request })
          supabaseResponse.cookies.set(name, '', options)
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  if (pathname.startsWith('/contractor')) {
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/auth/login'
      url.searchParams.set('next', pathname)
      return NextResponse.redirect(url)
    }
  }

  if (pathname.startsWith('/admin')) {
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/auth/login'
      url.searchParams.set('next', pathname)
      return NextResponse.redirect(url)
    }

    const { data: adminRow } = await supabase
      .from('admins')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (!adminRow) {
      return NextResponse.redirect(new URL('/contractor/dashboard', request.url))
    }
  }

  if (user && (pathname === '/auth/login' || pathname === '/auth/signup')) {
    return NextResponse.redirect(new URL('/contractor/dashboard', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/contractor/:path*',
    '/admin/:path*',
    '/auth/login',
    '/auth/signup',
  ],
}
