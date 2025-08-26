import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Create a function to get supabase client to avoid SSR issues
export const createSupabaseClient = () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase environment variables not configured');
    return null;
  }
  return createClient(supabaseUrl, supabaseAnonKey);
};

// Export a client instance for compatibility, but check if we're on client-side
export const supabase = typeof window !== 'undefined' ? createSupabaseClient() : null;

export type Database = {
  public: {
    Tables: {
      measurements: {
        Row: {
          id: string;
          user_id: string | null;
          decibel_level: number;
          category: string;
          timestamp: string;
          duration: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          decibel_level: number;
          category: string;
          timestamp: string;
          duration?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          decibel_level?: number;
          category?: string;
          timestamp?: string;
          duration?: number | null;
          created_at?: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          email: string;
          custom_threshold: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          custom_threshold?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          custom_threshold?: number | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};