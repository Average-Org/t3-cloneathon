import { createClient } from '@supabase/supabase-js'

// Use environment variables from .env.local
export const supabase = createClient(
    "https://zjsfmgebojzvrldemdfv.supabase.co"!,
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpqc2ZtZ2Vib2p6dnJsZGVtZGZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk0MDQwMjYsImV4cCI6MjA2NDk4MDAyNn0.8G-0DErq1vNDJB0y5hvS-314o9ZPNTip2Rrr8pFzAKU"!
  )
