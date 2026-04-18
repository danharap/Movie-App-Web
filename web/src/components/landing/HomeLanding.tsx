import { APP_NAME } from "@/config/brand";
import Link from "next/link";

function IconSpark() {
  return (
    <svg className="size-5 text-amber-200/90" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 2l1.2 4.2L18 8l-4.8 1.8L12 14l-1.2-4.2L6 8l4.8-1.8L12 2z"
        fill="currentColor"
        opacity={0.9}
      />
      <path
        d="M19 14l.6 2.1L22 17l-2.4.9L19 20l-.6-2.1L16 17l2.4-.9L19 14z"
        fill="currentColor"
        opacity={0.5}
      />
    </svg>
  );
}

function IconList() {
  return (
    <svg className="size-5 text-amber-200/90" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconBookmark() {
  return (
    <svg className="size-5 text-amber-200/90" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6 4h12v16l-6-3-6 3V4z"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinejoin="round"
      />
    </svg>
  );
}

const steps = [
  {
    n: "01",
    title: "Say how you feel",
    body: "Vibe chips, optional strict genres, runtime, era — guided, not endless filters.",
  },
  {
    n: "02",
    title: "Get a real shortlist",
    body: "We pull from TMDb and rank for quality, fit, and variety — not noise.",
  },
  {
    n: "03",
    title: "Keep what matters",
    body: "Signed-in? Watched and watchlist sync so we never suggest repeats.",
  },
];

const pillars = [
  {
    icon: <IconSpark />,
    title: "Emotion-first matching",
    body: "Vibes map to genres and discover rules you can tune over time.",
  },
  {
    icon: <IconList />,
    title: "Curated, not crowded",
    body: "A handful of strong picks so “what should we watch?” has an answer.",
  },
  {
    icon: <IconBookmark />,
    title: "Your viewing memory",
    body: "Letterboxd-style watched log and watchlist — stored securely in Supabase.",
  },
];

export function HomeLanding() {
  return (
    <div className="relative">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute -left-1/4 top-0 h-[520px] w-[70%] rounded-full bg-amber-400/[0.07] blur-3xl" />
        <div className="absolute -right-1/4 top-32 h-[420px] w-[60%] rounded-full bg-violet-500/[0.06] blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-px w-1/3 bg-gradient-to-r from-transparent via-amber-200/20 to-transparent" />
      </div>

      <section className="mx-auto max-w-6xl px-4 pb-20 pt-14 sm:px-6 sm:pt-20 lg:pt-28">
        <div className="mx-auto max-w-3xl text-center">
          <p className="reveal inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-xs font-medium uppercase tracking-[0.2em] text-amber-200/85">
            {APP_NAME}
          </p>
          <h1 className="reveal mt-8 text-4xl font-semibold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
            A calmer way to{" "}
            <span className="bg-gradient-to-r from-amber-100 via-amber-200 to-amber-100 bg-clip-text text-transparent">
              choose a film
            </span>
          </h1>
          <p className="reveal mx-auto mt-6 max-w-xl text-pretty text-base leading-relaxed text-zinc-400 sm:text-lg">
            Tell us how you want the night to feel. We return a tight, credible
            shortlist — posters, scores, and context — so you spend less time
            scrolling and more time on the couch.
          </p>
          <div className="reveal mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <Link
              href="/recommend"
              className="inline-flex w-full min-w-[200px] items-center justify-center rounded-2xl bg-gradient-to-r from-amber-200 via-amber-100 to-amber-200 px-8 py-4 text-base font-semibold text-zinc-950 shadow-lg shadow-amber-950/30 transition hover:brightness-[1.03] sm:w-auto"
            >
              Start picking
            </Link>
            <Link
              href="/login"
              className="inline-flex w-full min-w-[200px] items-center justify-center rounded-2xl border border-white/15 bg-white/[0.03] px-8 py-4 text-base font-medium text-zinc-100 backdrop-blur-sm transition hover:border-amber-200/35 hover:bg-white/[0.06] sm:w-auto"
            >
              Sign in to save lists
            </Link>
          </div>
          <p className="reveal mt-6 text-xs text-zinc-600">
            Works signed out for discovery · Supabase keeps your library when you
            create an account
          </p>
        </div>

        <div className="reveal mx-auto mt-20 grid max-w-4xl gap-4 sm:grid-cols-3">
          {steps.map((s, i) => (
            <div
              key={s.n}
              className="rounded-2xl border border-white/[0.08] bg-zinc-950/40 p-6 text-left backdrop-blur-md"
              style={{ animationDelay: `${0.05 * (i + 1)}s` }}
            >
              <span className="font-mono text-xs text-amber-200/50">{s.n}</span>
              <h2 className="mt-3 text-sm font-semibold text-white">{s.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-zinc-500">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-white/[0.06] bg-black/20 py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-200/75">
              Why it feels different
            </h2>
            <p className="mt-4 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              Built like a product, not a weekend demo
            </p>
            <p className="mt-4 text-sm leading-relaxed text-zinc-500 sm:text-base">
              Polished motion respects reduced motion. Server-side TMDb calls keep
              keys off the client. Row-level security in Supabase keeps your data
              yours.
            </p>
          </div>
          <ul className="mx-auto mt-14 grid max-w-5xl gap-6 sm:grid-cols-3">
            {pillars.map((p, i) => (
              <li
                key={p.title}
                className="reveal flex flex-col rounded-2xl border border-white/[0.08] bg-gradient-to-b from-zinc-900/80 to-zinc-950/80 p-6"
                style={{ animationDelay: `${0.08 * i}s` }}
              >
                <div className="flex size-10 items-center justify-center rounded-xl border border-amber-200/15 bg-amber-200/5">
                  {p.icon}
                </div>
                <h3 className="mt-5 text-base font-semibold text-white">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-500">{p.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6 sm:py-24">
        <blockquote className="reveal text-lg font-medium leading-relaxed text-zinc-300 sm:text-xl">
          “The goal isn’t more movies on screen. It’s one clear recommendation you
          actually trust.”
        </blockquote>
        <p className="reveal mt-6 text-xs uppercase tracking-[0.18em] text-zinc-600">
          {APP_NAME} — product direction
        </p>
      </section>

      <section className="border-t border-white/[0.06] bg-gradient-to-b from-zinc-950/80 to-black/80 px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto flex max-w-4xl flex-col items-center justify-between gap-8 text-center sm:flex-row sm:text-left">
          <div>
            <h2 className="text-2xl font-semibold text-white sm:text-3xl">
              Ready when you are
            </h2>
            <p className="mt-2 max-w-md text-sm text-zinc-500">
              Two minutes of honest inputs. A shortlist you can start tonight.
            </p>
          </div>
          <Link
            href="/recommend"
            className="shrink-0 rounded-2xl bg-amber-200/90 px-10 py-4 text-base font-semibold text-zinc-950 transition hover:bg-amber-200"
          >
            Find a film
          </Link>
        </div>
      </section>
    </div>
  );
}
