import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Browser-side Supabase client. Lazy so the app still boots (and the public
 * library still renders) when the environment is not configured yet.
 */
let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
  if (!url || !anonKey) {
    if (import.meta.env.DEV) {
      console.warn(
        "[Supabase] Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY. Set them in .env.local to enable sign-in and storage.",
      );
    }
    return null;
  }
  if (!client) {
    client = createClient(url, anonKey);
  }
  return client;
}

/**
 * We mirror the current access token into localStorage so tRPC requests can
 * synchronously attach it as Authorization: Bearer on every request, and so
 * quick page loads never flash a logged-out state before Supabase restores the
 * session.
 */
const SESSION_TOKEN_KEY = "odhyay_supabase_token";

export function getAccessToken(): string | null {
  try {
    return window.localStorage.getItem(SESSION_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setAccessToken(token: string | null) {
  try {
    if (token) {
      window.localStorage.setItem(SESSION_TOKEN_KEY, token);
    } else {
      window.localStorage.removeItem(SESSION_TOKEN_KEY);
    }
  } catch {
    // storage unavailable (privacy mode) — session still works via cookie
  }
}

export async function signInWithGoogle(next = "/") {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase is not configured.");
  const redirectTo = `${window.location.origin}${next}`;
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo },
  });
  if (error) throw error;
  if (data.url) window.location.assign(data.url);
}

export async function signInWithEmail(email: string, password: string) {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase is not configured.");
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const supabase = getSupabase();
  if (!supabase) return;
  await supabase.auth.signOut();
}