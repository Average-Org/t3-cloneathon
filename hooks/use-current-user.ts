import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { User } from "@supabase/supabase-js";

type CurrentUser = {
  user: User | null; // logged-in user or null
  isLoading: boolean; // still fetching?
  error: Error | null; // network / auth errors
};

export function useCurrentUser(): CurrentUser {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    supabase.auth
      .getUser()
      .then(({ data, error }) => {
        if (!mounted) return;
        if (error) throw error;
        setUser(data.user ?? null);
      })
      .catch((err) => mounted && setError(err as Error))
      .finally(() => mounted && setLoading(false));

    const { data: subscription } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => {
      mounted = false;
      subscription?.subscription.unsubscribe();
    };
  }, []);

  return { user, isLoading, error };
}
