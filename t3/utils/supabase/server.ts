import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        /* Next 15 requires the “getAll / setAll” shape */
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          // Works in Route Handlers; silently no-ops in pure Server Components
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {/* ignore SC noop */}
        },
      },
    }
  );
}
