import { createClient } from '@supabase/supabase-js'

// Use environment variables from .env.local
export const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
