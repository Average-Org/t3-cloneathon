'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

type UserFullNameProps = {
  className?: string;
};

export default function UserFullName({ className }: UserFullNameProps) {
  const [fullName, setFullName] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        // full name is full_name
        const url = session.user.user_metadata?.full_name || null;
        setFullName(url);
      }
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const url = session.user.user_metadata?.full_name || null;
        setFullName(url);
      } else {
        setFullName(null);
      }
    });

    return () => subscription?.subscription.unsubscribe();
  }, [supabase]);

  if (!fullName) return <div>No full name</div>;

  return <h3 className={className}>{fullName}</h3>
}
