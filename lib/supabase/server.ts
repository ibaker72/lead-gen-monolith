import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: Record<string, unknown>) {
          try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            cookieStore.set(name, value, options as any)
          } catch {
            // Called from Server Component — safe to ignore
          }
        },
        remove(name: string, options: Record<string, unknown>) {
          try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            cookieStore.set(name, '', options as any)
          } catch {
            // Called from Server Component — safe to ignore
          }
        },
      },
    }
  )
}
