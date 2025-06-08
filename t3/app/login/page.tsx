// app/page.tsx or app/home/page.tsx

"use client"

import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabaseClient"

export default function Home() {
  const handleLogin = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "github",
    })

    if (error) {
      console.error("Github login error:", error.message)
    }
  }

  return (
    <main>
      <div className="flex flex-col justify-center items-center h-screen space-y-4">
        <h1 className="text-2xl font-semibold">Login to t3.chat</h1>
        <form onSubmit={(e) => e.preventDefault()}>
          <Button
            variant="default"
            size="xlg"
            className="font-bold text-lg"
            onClick={handleLogin}
          >
            Continue with Github
          </Button>
        </form>
      </div>
    </main>
  )
}
