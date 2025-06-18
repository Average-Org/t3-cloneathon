"use client"

import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabaseClient"
import { useCallback } from "react"

export default function Login() {
  const loginWithGithub = useCallback(async() => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: `${location.origin}/login/callback`,
      }
    })

    if (error) {
      console.error("Github login error:", error.message)
    }
  }, []);

  return (
    <main>
      <div className="flex flex-col justify-center items-center h-screen space-y-4">
        <h1 className="text-2xl font-semibold">Login to RJ3.chat</h1>
        <form onSubmit={(e) => e.preventDefault()}>
          <Button
            variant="default"
            size="xlg"
            className="font-bold text-lg"
            onClick={loginWithGithub}
          >
            Continue with Github
          </Button>
        </form>
      </div>
    </main>
  )
}
