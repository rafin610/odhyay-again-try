import { trpc } from "@/lib/trpc";
import { COOKIE_NAME } from "@shared/const";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink, TRPCClientError } from "@trpc/client";
import { createRoot } from "react-dom/client";
import superjson from "superjson";
import App from "./App";
import { getAccessToken, getSupabase, setAccessToken } from "./lib/supabase";
import "./index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 10_000, retry: false },
  },
});

const SESSION_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

function writeSessionCookie(token: string | null) {
  if (typeof document === "undefined") return;
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  if (!token) {
    document.cookie = `${COOKIE_NAME}=; Path=/; Max-Age=0; SameSite=Lax${secure}`;
    return;
  }
  document.cookie = `${COOKIE_NAME}=${token}; Path=/; Max-Age=${SESSION_COOKIE_MAX_AGE}; SameSite=Lax${secure}`;
}

const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: "/api/trpc",
      transformer: superjson,
      headers() {
        const token = getAccessToken();
        if (token) {
          return { Authorization: `Bearer ${token}` };
        }
        return {};
      },
      fetch(input, init) {
        return globalThis.fetch(input, {
          ...(init ?? {}),
          credentials: "include",
        });
      },
    }),
  ],
});

const logServerError = (error: unknown) => {
  if (!(error instanceof TRPCClientError)) return;
  console.error("[API Error]", error.message);
};

queryClient.getQueryCache().subscribe((event) => {
  if (event.type === "updated" && event.action.type === "error") {
    logServerError(event.query.state.error);
  }
});

queryClient.getMutationCache().subscribe((event) => {
  if (event.type === "updated" && event.action.type === "error") {
    logServerError(event.mutation.state.error);
  }
});

async function initializeAuth() {
  const supabase = getSupabase();
  if (!supabase) return;

  supabase.auth.onAuthStateChange((_event, session) => {
    const token = session?.access_token ?? null;
    setAccessToken(token);
    writeSessionCookie(token);
    void queryClient.invalidateQueries();
  });
}

void initializeAuth();

createRoot(document.getElementById("root")!).render(
  <trpc.Provider client={trpcClient} queryClient={queryClient}>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </trpc.Provider>
);