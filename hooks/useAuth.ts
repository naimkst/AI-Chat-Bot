// hooks/useAuth.ts
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type User = {
  userId: string;
  email?: string;
  name?: string;
};

export function useAuth(redirectTo = '/login') {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/me', {
          method: 'GET',
          credentials: 'include',
        });

        if (res.ok) {
          const data = await res.json();
          setAuthenticated(true);
          setUser(data.user);
        } else {
          router.replace(redirectTo);
        }
      } catch (err) {
        router.replace(redirectTo);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router, redirectTo]);

  return { loading, authenticated, user };
}