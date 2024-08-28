import { createClient } from '@supabase/supabase-js';



// Retrieve the Supabase URL and Anon Key from environment variables
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Check if the environment variables are set
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL and anon key are required.");
}

// Create the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
