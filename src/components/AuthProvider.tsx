'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { createSupabaseClient } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: async () => ({}),
  signUp: async () => ({}),
  signOut: async () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [supabase, setSupabase] = useState<ReturnType<typeof createSupabaseClient>>(null);

  useEffect(() => {
    // Initialize Supabase client on the client side
    const client = createSupabaseClient();
    setSupabase(client);

    if (!client) {
      console.warn('Supabase not configured, running in offline mode');
      setLoading(false);
      return;
    }

    // Get initial session
    client.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = client.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);

      // Create profile on signup
      if (event === 'SIGNED_IN' && session?.user) {
        await client
          .from('profiles')
          .insert({
            id: session.user.id,
            email: session.user.email!,
            custom_threshold: 85,
          })
          .select()
          .single();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    if (!supabase) {
      return { error: 'Authentication not available - Supabase not configured' };
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return { error: error?.message };
  };

  const signUp = async (email: string, password: string) => {
    if (!supabase) {
      return { error: 'Authentication not available - Supabase not configured' };
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    return { error: error?.message };
  };

  const signOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}