import { APP_NAME } from "@/config/brand";
import { listFeedback } from "@/features/feedback/service";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

// ---------------------------------------------------------------------------
// Feature icons
// ---------------------------------------------------------------------------

function IconSearch() {
  return (
    <svg className="size-5" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth={1.75} />
      <path d="M16.5 16.5L21 21" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" />
    </svg>
  );
}

function IconFilm() {
  return (
    <svg className="size-5" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" strokeWidth={1.75} />
      <path d="M7 5v14M17 5v14M2 9h5M17 9h5M2 15h5M17 15h5" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" />
    </svg>
  );
}

function IconBookmark() {
  return (
    <svg className="size-5" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M6 4h12v16l-6-3-6 3V4z" stroke="currentColor" strokeWidth={1.75} strokeLinejoin="round" />
    </svg>
  );
}

function IconUsers() {
  return (
    <svg className="size-5" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="9" cy="7" r="3.5" stroke="currentColor" strokeWidth={1.75} />
      <path d="M2 20c0-3.5 3.1-6 7-6s7 2.5 7 6" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" />
      <path d="M16 3.5a3.5 3.5 0 1 1 0 7M22 20c0-3.5-2.7-6-6-6" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" />
    </svg>
  );
}

function IconList() {
  return (
    <svg className="size-5" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" />
    </svg>
  );
}

function IconImport() {
  return (
    <svg className="size-5" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 3v13M8 12l4 4 4-4" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Feature grid data
// ---------------------------------------------------------------------------

const features = [
  {
    icon: <IconSearch />,
    title: "Find films by mood",
    body: "Tell us how tonight should feel — cozy, tense, funny, weird. We match the vibe to real films worth watching.",
    href: "/recommend",
  },
  {
    icon: <IconFilm />,
    title: "Track what you've seen",
    body: "Log every film with a personal rating and notes. Your diary, always there, always yours.",
    href: "/watched",
  },
  {
    icon: <IconBookmark />,
    title: "Save films for later",
    body: "Add anything to your watchlist so good picks don't disappear into the scroll.",
    href: "/watchlist",
  },
  {
    icon: <IconUsers />,
    title: "See what friends are watching",
    body: "Follow people, see their recent watches, and discover films through people you actually trust.",
    href: "/friends",
  },
  {
    icon: <IconList />,
    title: "Build lists on any theme",
    body: "Organise films into custom lists — top tens, comfort watches, date night picks — public or private.",
    href: "/profile",
  },
  {
    icon: <IconImport />,
    title: "Import from Letterboxd",
    body: "Already have a history? Bring your full diary over in minutes. Nothing gets left behind.",
    href: "/import",
  },
];

// ---------------------------------------------------------------------------
// How it works
// ---------------------------------------------------------------------------

const steps = [
  { n: "1", title: "Pick a vibe", body: "Choose a mood or genre — or both. Set a rough era, runtime, or rating floor if you want." },
  { n: "2", title: "Get a shortlist", body: "We pull from a massive movie database and return a tight handful of real, quality picks — not a wall of results." },
  { n: "3", title: "Log it after", body: "Watch something? Rate it, add notes, and it syncs to your diary so we never suggest it again." },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function Stars({ rating }: { rating: number }) {
  return (
    <span className="flex gap-0.5 text-sm" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} className={s <= rating ? "text-indigo-300" : "text-zinc-700"}>★</span>
      ))}
    </span>
  );
}

function Initials({ name }: { name: string }) {
  const init = name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-400/10 text-xs font-bold text-indigo-300 select-none">
      {init}
    </div>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

export async function HomeLanding() {
  const [reviews, supabase] = await Promise.all([
    listFeedback(1),
    createClient(),
  ]);
  const { data: { user } } = await supabase.auth.getUser();

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : null;
  const preview = reviews.slice(0, 3);
  const hasReviewed = user ? reviews.some((r) => r.user_id === user.id) : false;

  return (
    <div className="relative overflow-x-hidden">
      {/* Ambient background */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -left-1/3 top-0 h-[600px] w-[80%] rounded-full bg-indigo-600/[0.07] blur-[120px]" />
        <div className="absolute -right-1/4 top-40 h-[500px] w-[60%] rounded-full bg-violet-600/[0.05] blur-[100px]" />
      </div>

      {/* ── Hero ── */}
      <section className="mx-auto max-w-4xl px-4 pb-16 pt-16 text-center sm:px-6 sm:pt-24 lg:pt-32">
        {/* Eyebrow */}
        <p className="reveal inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-indigo-300/80">
          {APP_NAME}
        </p>

        {/* Headline — 3 punchy lines */}
        <h1 className="reveal mt-8 text-[2.6rem] font-bold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-[3.8rem]">
          Find something to watch
          <br className="hidden sm:block" />
          <span className="bg-gradient-to-r from-indigo-200 via-indigo-300 to-violet-300 bg-clip-text text-transparent">
            {" "}in under two minutes.
          </span>
        </h1>

        <p className="reveal mx-auto mt-6 max-w-lg text-base leading-relaxed text-zinc-400 sm:text-lg">
          Tell us the vibe. Get a curated shortlist of films worth your time.
          Track what you watch, save what&apos;s next, and share with friends.
        </p>

        {/* CTAs */}
        <div className="reveal mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/recommend"
            className="inline-flex w-full items-center justify-center rounded-2xl bg-indigo-500 px-8 py-4 text-base font-semibold text-white shadow-xl shadow-indigo-950/60 transition hover:bg-indigo-400 active:scale-[0.98] sm:w-auto"
          >
            Find a film tonight →
          </Link>
          {!user && (
            <Link
              href="/signup"
              className="inline-flex w-full items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] px-8 py-4 text-base font-medium text-zinc-100 backdrop-blur-sm transition hover:border-white/20 hover:bg-white/[0.06] sm:w-auto"
            >
              Create a free account
            </Link>
          )}
        </div>

        <p className="reveal mt-5 text-xs text-zinc-600">
          Free to use · No credit card · Works without an account
        </p>
      </section>

      {/* ── Feature grid ── */}
      <section className="border-y border-white/[0.05] bg-black/20 py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-300/70">
              Everything in one place
            </p>
            <h2 className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">
              {APP_NAME} lets you…
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <Link
                key={f.title}
                href={f.href}
                className="reveal group flex flex-col gap-4 rounded-2xl border border-white/[0.07] bg-zinc-900/50 p-6 transition hover:border-indigo-400/25 hover:bg-zinc-900/80"
                style={{ animationDelay: `${0.04 * i}s` }}
              >
                <div className="flex size-10 items-center justify-center rounded-xl border border-indigo-400/15 bg-indigo-400/8 text-indigo-300 transition group-hover:bg-indigo-400/15">
                  {f.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-white">{f.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-zinc-500">{f.body}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="mx-auto max-w-4xl px-4 py-20 sm:px-6 sm:py-24">
        <div className="mb-12 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-300/70">
            How it works
          </p>
          <h2 className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">
            A film picked in minutes, not hours
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {steps.map((s, i) => (
            <div
              key={s.n}
              className="reveal relative rounded-2xl border border-white/[0.07] bg-zinc-950/60 p-6 backdrop-blur-sm"
              style={{ animationDelay: `${0.06 * (i + 1)}s` }}
            >
              <span className="flex size-8 items-center justify-center rounded-full bg-indigo-500/15 text-sm font-bold text-indigo-300">
                {s.n}
              </span>
              <h3 className="mt-4 font-semibold text-white">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-500">{s.body}</p>
              {i < steps.length - 1 && (
                <span
                  aria-hidden
                  className="absolute -right-3 top-1/2 hidden -translate-y-1/2 text-zinc-700 sm:block"
                >
                  →
                </span>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── Reviews ── */}
      {(preview.length > 0 || !user) && (
        <section className="border-t border-white/[0.05] bg-black/10 px-4 py-20 sm:px-6 sm:py-24">
          <div className="mx-auto max-w-5xl">
            <div className="mb-12 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-300/70">Reviews</p>
                <h2 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                  What people are saying
                </h2>
              </div>
              {avgRating !== null && reviews.length > 0 && (
                <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] px-5 py-3 text-center">
                  <p className="text-3xl font-bold text-white">{avgRating.toFixed(1)}</p>
                  <Stars rating={Math.round(avgRating)} />
                  <p className="mt-1 text-xs text-zinc-600">
                    {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
                  </p>
                </div>
              )}
            </div>

            {preview.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {preview.map((r) => (
                  <div
                    key={r.id}
                    className="reveal flex flex-col gap-4 rounded-2xl border border-white/[0.07] bg-zinc-900/50 p-5"
                  >
                    <div className="flex items-center gap-3">
                      <Initials name={r.reviewer_display_name} />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-white">{r.reviewer_display_name}</p>
                        <p className="text-xs text-zinc-600">{formatDate(r.created_at)}</p>
                      </div>
                      <Stars rating={r.rating} />
                    </div>
                    <p className="line-clamp-4 flex-1 text-sm leading-relaxed text-zinc-400">{r.body}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-white/[0.08] bg-white/[0.02] px-6 py-14 text-center">
                <p className="text-sm text-zinc-500">No reviews yet — you could be the first.</p>
              </div>
            )}

            <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              {user ? (
                hasReviewed ? (
                  <Link href="/feedback" className="rounded-full border border-white/10 px-6 py-2.5 text-sm text-zinc-300 transition hover:border-white/25 hover:text-white">
                    Edit your review →
                  </Link>
                ) : (
                  <Link href="/feedback" className="rounded-full bg-indigo-500 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-400">
                    Leave a review ★
                  </Link>
                )
              ) : (
                <Link href="/login?redirect=/feedback" className="rounded-full bg-indigo-500 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-400">
                  Sign in to leave a review ★
                </Link>
              )}
              {reviews.length > 3 && (
                <Link href="/feedback" className="text-sm text-zinc-500 transition hover:text-zinc-300">
                  See all {reviews.length} reviews →
                </Link>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ── Final CTA ── */}
      <section className="relative overflow-hidden border-t border-white/[0.05] px-4 py-20 sm:px-6 sm:py-24">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center">
          <div className="h-96 w-96 rounded-full bg-indigo-600/[0.12] blur-[80px]" />
        </div>
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Done scrolling for tonight?
          </h2>
          <p className="mx-auto mt-4 max-w-md text-base text-zinc-400">
            Tell us the vibe. Get a shortlist. Watch something good.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/recommend"
              className="inline-flex w-full items-center justify-center rounded-2xl bg-indigo-500 px-10 py-4 text-base font-semibold text-white shadow-xl shadow-indigo-950/50 transition hover:bg-indigo-400 active:scale-[0.98] sm:w-auto"
            >
              Find a film now →
            </Link>
            {!user && (
              <Link
                href="/signup"
                className="inline-flex w-full items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] px-8 py-4 text-base font-medium text-zinc-100 transition hover:border-white/20 sm:w-auto"
              >
                Create a free account
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
