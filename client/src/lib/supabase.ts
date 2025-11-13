import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const FALLBACK_URL = "http://localhost:54321";
const FALLBACK_ANON = "local-anon-key";

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (!isSupabaseConfigured) {
  console.warn(
    "[supabase] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Falling back to local Supabase defaults. Update your environment variables to connect to a hosted project."
  );
}

export const supabase = createClient<Database>(
  isSupabaseConfigured ? supabaseUrl! : FALLBACK_URL,
  isSupabaseConfigured ? supabaseAnonKey! : FALLBACK_ANON,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);
