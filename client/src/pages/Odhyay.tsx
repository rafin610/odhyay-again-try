/* ODHYAY style: Quiet Editorial — About page */
import { Link } from "wouter";
import { PageFrame } from "@/components/OdhyayShell";

export function AboutPage() {
  return (
    <PageFrame>
      <main className="container py-16 lg:py-28">
        <div className="grid gap-16 lg:grid-cols-[1fr_1.4fr] lg:gap-28">
          <div>
            <p className="eyebrow text-amethyst">About ODHYAY</p>
            <h1 className="font-display mt-6 text-[clamp(3.5rem,8vw,7rem)] leading-[.92] tracking-[-.04em]">
              Make room<br />
              for a <span className="text-[#81788c]">book.</span>
            </h1>
          </div>
          <div className="max-w-xl pt-2 text-base leading-8 text-[#aaa2ae]">
            <p className="text-xl leading-9 text-[#e5dfe6]">
              ODHYAY is a calm digital library for curious minds.
            </p>
            <p className="mt-8">
              It exists for the moment before you begin reading: the small pause
              when you look for something that will stay with you. We keep
              discovery simple, the shelves considered, and the reader’s attention
              sacred.
            </p>
            <p className="mt-7">
              Our mission is to create an accessible digital space where people can
              discover and read books without distraction.
            </p>
            <div className="mt-12 border-t hairline pt-7">
              <p className="eyebrow text-[#817989]">The ODHYAY promise</p>
              <p className="mt-5 font-display text-3xl leading-tight text-[#f3eee6]">
                Find a book.<br />
                Open it.<br />
                <span className="text-amethyst">Read.</span>
              </p>
            </div>
          </div>
        </div>
      </main>
    </PageFrame>
  );
}
