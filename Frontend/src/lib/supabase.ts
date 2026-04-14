import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env file');
}

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    storageKey: 'nexora-auth',
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

let lastAuthEvent: string | null = null;

supabase.auth.onAuthStateChange(async (event, session) => {
  lastAuthEvent = event;
  
  if (event === 'TOKEN_REFRESHED' && !session) {
    console.warn('Session refresh failed - clearing invalid session');
    await supabase.auth.signOut();
    localStorage.removeItem('nexora-auth');
  }
  
  if (event === 'SIGNED_OUT') {
    localStorage.removeItem('nexora-auth');
  }
});

export const clearInvalidSession = async () => {
  console.warn('Clearing invalid session due to RLS 403');
  await supabase.auth.signOut();
  localStorage.removeItem('nexora-auth');
  window.location.href = '/login';
};
