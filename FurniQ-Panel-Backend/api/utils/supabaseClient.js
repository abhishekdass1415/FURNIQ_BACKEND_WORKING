// api/utils/supabaseClient.js
import { createClient } from "@supabase/supabase-js";

// Use non-public env names on the backend
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // eslint-disable-next-line no-console
  console.warn("Supabase env vars missing on backend: set SUPABASE_URL and SUPABASE_ANON_KEY");
}

export const supabase = createClient(supabaseUrl || "", supabaseAnonKey || "");
