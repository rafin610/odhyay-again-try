import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { ENV, isSupabaseConfigured } from "./env.js";

/**
 * Cached service-role Supabase client. The singleton is held at module scope so
 * Vercel serverless instances reuse a warm connection across invocations.
 */
let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!client) {
    if (!isSupabaseConfigured()) {
      throw new Error("Supabase is not configured on the server.");
    }
    client = createClient(ENV.supabaseUrl, ENV.supabaseServiceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }
  return client;
}