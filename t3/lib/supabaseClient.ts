import { createBrowserClient } from '@supabase/ssr'

// Use environment variables from .env.local
export const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
