import type { Request } from "express";
import { COOKIE_NAME } from "../../shared/const.js";
import type { User } from "../types.js";
import { ForbiddenError } from "../../shared/_core/errors.js";
import { getSupabase } from "./supabase.js";
import { getOrCreateUserFromAuth } from "../db.js";

/**
 * Parse a Cookie header into a map of cookie -> value.
 */
export function parseCookies(cookieHeader?: string | null): Map<string, string> {
  if (!cookieHeader) return new Map();
  const map = new Map<string, string>();
  for (const part of cookieHeader.split(";")) {
    const idx = part.indexOf("=");
    if (idx === -1) continue;
    map.set(part.slice(0, idx).trim(), part.slice(idx + 1).trim());
  }
  return map;
}

/**
 * Resolve a session bearer token from either the session cookie or an
 * Authorization: Bearer header (takes the cookie first, matching legacy flow).
 */
export function extractSessionToken(req: Pick<Request, "headers">): string | null {
  const cookies = parseCookies(req.headers.cookie);
  const fromCookie = cookies.get(COOKIE_NAME);
  if (fromCookie) return fromCookie;
  const authHeader = req.headers.authorization;
  if (typeof authHeader === "string" && authHeader.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }
  return null;
}

/**
 * Validate a Supabase access token and return the app user row. The token is
 * verified server-side by Supabase (service role), so forged JWT/cookies are
 * rejected even though the app no longer signs its own sessions.
 */
export async function authenticateRequest(req: Pick<Request, "headers">): Promise<User> {
  const token = extractSessionToken(req);
  if (!token) {
    throw ForbiddenError("Invalid session cookie");
  }
  const { data, error } = await getSupabase().auth.getUser(token);
  if (error || !data.user) {
    throw ForbiddenError("Invalid session cookie");
  }
  return getOrCreateUserFromAuth(data.user);
}