/* ODHYAY style: Quiet Editorial — sign-in keeps the same calm, restrained treatment as the rest of the library. */
import { FormEvent, useState } from "react";
import { Link, useLocation } from "wouter";
import { ArrowRight } from "lucide-react";
import { Mark, PageFrame } from "@/components/OdhyayShell";
import { signInWithEmail } from "@/lib/supabase";

export function LoginPersistentPage() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const target = new URLSearchParams(window.location.search).get("next") || "/";

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setPending(true);
    try {
      await signInWithEmail(email.trim(), password);
      setLocation(target);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-in failed. Please try again.");
    } finally {
      setPending(false);
    }
  };

  return (
    <PageFrame>
      <main className="container flex min-h-[72vh] items-center justify-center py-16 lg:py-24">
        <div className="w-full max-w-md">
          <div className="border hairline bg-[#151219] p-8 lg:p-10">
            <Mark />
            <p className="eyebrow mt-8 text-amethyst">Library access</p>
            <h1 className="font-display mt-3 text-4xl">Sign in.</h1>
            <p className="mt-3 text-sm leading-7 text-[#8f8996]">
              Use your library account to save progress, keep favorites, and
              manage the shelves.
            </p>
            <form onSubmit={submit} className="mt-8 space-y-7">
              <label className="block">
                <span className="eyebrow text-[#817989]">Email</span>
                <input
                  required
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-3 w-full border-b border-[#4a4052] bg-transparent py-3 text-base text-[#f3eee6] outline-none focus:border-[#b7a4d7]"
                  placeholder="reader@example.com"
                />
              </label>
              <label className="block">
                <span className="eyebrow text-[#817989]">Password</span>
                <input
                  required
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-3 w-full border-b border-[#4a4052] bg-transparent py-3 text-base text-[#f3eee6] outline-none focus:border-[#b7a4d7]"
                  placeholder="••••••••"
                />
              </label>
              {error ? (
                <p className="border border-[#5c3a48] bg-[#25171f] px-4 py-3 text-xs leading-6 text-[#d7b7c2]">{error}</p>
              ) : null}
              <button
                disabled={pending}
                className="focus-ring inline-flex w-full items-center justify-center gap-3 bg-[#b7a4d7] px-5 py-3 text-xs font-bold uppercase tracking-[.15em] text-[#17121c] disabled:opacity-50"
              >
                {pending ? "Signing in…" : <>Sign in <ArrowRight size={15} /></>}
              </button>
            </form>
            <p className="mt-8 text-xs leading-6 text-[#716a79]">
              New readers are invited by the administrator. Need an account?{" "}
              <Link href="/about" className="text-amethyst hover:underline">Contact the library</Link>.
            </p>
          </div>
          <p className="mt-6 text-center text-xs text-[#8f8996]">
            <Link href="/" className="hover:text-amethyst">← Back to the library</Link>
          </p>
        </div>
      </main>
    </PageFrame>
  );
}