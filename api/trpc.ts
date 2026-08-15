import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import type { IncomingMessage, ServerResponse } from "node:http";

type VercelRequest = IncomingMessage & {
  body?: unknown;
  query?: Record<string, unknown>;
};

type VercelResponse = ServerResponse & {
  status(code: number): VercelResponse;
  send(body: string): void;
};
import { appRouter } from "../server/routers.js";
import { authenticateRequest } from "../server/_core/auth.js";
import type { TrpcContext } from "../server/_core/context.js";

function headerValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value.join(",") : value;
}

function toHeaders(req: VercelRequest): Record<string, string | string[] | undefined> {
  return Object.fromEntries(Object.entries(req.headers));
}

function setCookie(res: VercelResponse, name: string, value: string, options: Record<string, unknown>) {
  const parts = [`${name}=${encodeURIComponent(value)}`, `Path=${options.path ?? "/"}`];
  if (options.httpOnly) parts.push("HttpOnly");
  if (options.secure) parts.push("Secure");
  if (options.sameSite) parts.push(`SameSite=${String(options.sameSite).replace(/^./, (char) => char.toUpperCase())}`);
  const existing = res.getHeader("Set-Cookie");
  const cookies = Array.isArray(existing) ? existing.map(String) : existing ? [String(existing)] : [];
  res.setHeader("Set-Cookie", [...cookies, parts.join("; ")]);
}

function clearCookie(res: VercelResponse, name: string, options: Record<string, unknown>) {
  setCookie(res, name, "", { ...options, maxAge: -1 });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const headers = toHeaders(req);
  const protocol = headerValue(req.headers["x-forwarded-proto"]) ?? "https";
  const url = new URL(req.url ?? "/api/trpc", `${protocol}://${req.headers.host ?? "localhost"}`);
  const requestHeaders = new Headers();
  for (const [key, value] of Object.entries(headers)) {
    if (value !== undefined) requestHeaders.set(key, Array.isArray(value) ? value.join(",") : value);
  }

  const body = req.method === "GET" || req.method === "HEAD" ? undefined : typeof req.body === "string" ? req.body : JSON.stringify(req.body ?? {});
  const request = new Request(url, {
    method: req.method,
    headers: requestHeaders,
    body,
  });

  const response = await fetchRequestHandler({
    endpoint: "/api/trpc",
    req: request,
    router: appRouter,
    createContext: async (): Promise<TrpcContext> => {
      let user = null;
      try {
        user = await authenticateRequest({ headers } as never);
      } catch {
        user = null;
      }
      return {
        req: { protocol, headers, query: req.query as Record<string, unknown> },
        res: {
          cookie: (name, value, options = {}) => setCookie(res, name, value, options),
          clearCookie: (name, options = {}) => clearCookie(res, name, options),
        },
        user,
      };
    },
  });

  res.status(response.status);
  response.headers.forEach((value, key) => {
    if (key.toLowerCase() !== "set-cookie") res.setHeader(key, value);
  });
  const setCookies = response.headers.get("set-cookie");
  if (setCookies) res.setHeader("Set-Cookie", setCookies);
  res.send(await response.text());
}
