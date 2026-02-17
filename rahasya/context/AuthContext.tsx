import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

import { createApiClient } from '@/lib/api';
import { clearToken, getToken, saveToken } from '@/lib/storage';

type AuthUser = { id: string; name: string; email: string };

type AuthState = {
  isLoading: boolean;
  token: string | null;
  user: AuthUser | null;
  apiBaseUrl: string;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (params: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    masterPassword: string;
  }) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);

  const api = useMemo(
    () =>
      createApiClient({
        getAuthToken: async () => token,
        onUnauthorized: () => {
          setToken(null);
          setUser(null);
          clearToken().catch(() => undefined);
        },
      }),
    [token]
  );

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const stored = await getToken();
        if (!mounted) return;
        if (stored) {
          setToken(stored);
          try {
            const profile = await createApiClient({ getAuthToken: async () => stored }).getProfile();
            if (profile?.success && profile.data?.user) {
              setUser({
                id: profile.data.user.id,
                name: profile.data.user.name,
                email: profile.data.user.email,
              });
            }
          } catch {
            await clearToken();
            setToken(null);
            setUser(null);
          }
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  async function signIn(email: string, password: string) {
    const res = await api.login({ email, password });
    if (!res.success || !res.token || !res.user) throw new Error(res.message || 'Login failed');

    await saveToken(res.token);
    setToken(res.token);
    setUser(res.user);
  }

  async function signUp(params: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    masterPassword: string;
  }) {
    const res = await api.register(params);
    if (!res.success || !res.token || !res.user) throw new Error(res.message || 'Register failed');

    await saveToken(res.token);
    setToken(res.token);
    setUser(res.user);
  }

  async function signOut() {
    await clearToken();
    setToken(null);
    setUser(null);
  }

  const value: AuthState = {
    isLoading,
    token,
    user,
    apiBaseUrl: api.baseUrl,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
