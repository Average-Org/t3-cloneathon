'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function UserProfilePicture() {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        // profile picture is here
        const url = session.user.user_metadata?.avatar_url || null;
        setAvatarUrl(url);
      }
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const url = session.user.user_metadata?.avatar_url || null;
        setAvatarUrl(url);
      } else {
        setAvatarUrl(null);
      }
    });

    return () => subscription?.subscription.unsubscribe();
  }, [supabase]);

  if (!avatarUrl) return <div>No profile picture</div>;

  return (
    <img
      src={avatarUrl}
      alt="User Profile Picture"
      style={{ width: 32, height: 32, borderRadius: '50%' }}
    />
  );
}
