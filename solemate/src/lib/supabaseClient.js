import { createClient } from '@supabase/supabase-js';

// Retrieve the Supabase URL and Anon Key from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// During SSR/build without env vars, provide stub values so the module loads.
// Actual API calls only happen client-side where the real env vars are present.
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);
