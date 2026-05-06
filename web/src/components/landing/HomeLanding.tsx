import { APP_NAME } from "@/config/brand";
import { listFeedback } from "@/features/feedback/service";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

// ---------------------------------------------------------------------------
// Icons
// ---------------------------------------------------------------------------

function IconSpark() {
  return (
    <svg className="size-5 text-amber-200/90" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 2l1.2 4.2L18 8l-4.8 1.8L12 14l-1.2-4.2L6 8l4.8-1.8L12 2z" fill="currentColor" opacity={0.9} />
      <path d="M19 14l.6 2.1L22 17l-2.4.9L19 20l-.6-2.1L16 17l2.4-.9L19 14z" fill="currentColor" opacity={0.5} />
    </svg>
  );
}

function IconList() {
  return (
    <svg className="size-5 text-amber-200/90" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
    </svg>
  );
}

function IconBookmark() {
  return (
    <svg className="size-5 text-amber-200/90" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M6 4h12v16l-6-3-6 3V4z" stroke="currentColor" strokeWidth={2} strokeLinejoin="round" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Static content
// ---------------------------------------------------------------------------

const steps = [
  { n: "01", title: "Say how you feel", body: "Vibe chips, optional strict genres, runtime, era — guided, not endless filters." },
  { n: "02", title: "Get a real shortlist", body: "We pull from TMDb and rank for quality, fit, and variety — not noise." },
  { n: "03", title: "Keep what matters", body: "Signed-in? Watched and watchlist sync so we never suggest repeats." },
];

const pillars = [
  { icon: <IconSpark />, title: "Emotion-first matching", body: "Vibes map to genres and discover rules you can tune over time." },
  { icon: <IconList />, title: "Curated, not crowded", body: "A handful of strong picks so the question of what to watch has an answer." },
  { icon: <IconBookmark />, title: "Your viewing memory", body: "Letterboxd-style watched log and watchlist — stored securely in Supabase." },
];

// ---------------------------------------------------------------------------
// Small helpers
// ---------------------------------------------------------------------------

function Stars({ rating, size = "sm" }: { rating: number; size?: "sm" | "lg" }) {
  const cls = size === "lg" ? "text-2xl" : "text-sm";
  return (
    <span className={`flex gap-0.5 ${cls}`} aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} className={s <= rating ? "text-amber-300" : "text-zinc-700"}>★</span>
      ))}
    </span>
  );
}

function Initials({ name }: { name: string }) {
  const init = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-200/10 text-xs font-bold text-amber-200 select-none">
      {init}
    </div>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

// ---------------------------------------------------------------------------
// Main component (async server component)
// ---------------------------------------------------------------------------

export async function HomeLanding() {
  // Fetch reviews + auth in parallel
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
    <div className="relative">
      {/* Background blobs */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-1/4 top-0 h-[520px] w-[70%] rounded-full bg-amber-400/[0.07] blur-3xl" />
        <div className="absolute -right-1/4 top-32 h-[420px] w-[60%] rounded-full bg-violet-500/[0.06] blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-px w-1/3 bg-gradient-to-r from-transparent via-amber-200/20 to-transparent" />
      </div>

      {/* ── Hero ── */}
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
            Tell us how you want the night to feel. We return a tight, credible shortlist — posters,
            scores, and context — so you spend less time scrolling and more time on the couch.
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
            Works signed out for discovery · Supabase keeps your library when you create an account
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

      {/* ── Why it's different ── */}
      <section className="border-y border-white/[0.06] bg-black/20 py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-200/75">Why it feels different</h2>
            <p className="mt-4 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              Built like a product, not a weekend demo
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

      {/* ── Reviews section ── */}
      <section className="mx-auto max-w-5xl px-4 py-20 sm:px-6 sm:py-28">
        {/* Header row */}
        <div className="mb-12 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-200/70">Reviews</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              What people are saying
            </h2>
          </div>

          {/* Aggregate score */}
          {avgRating !== null && reviews.length > 0 ? (
            <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-3">
              <div className="text-center">
                <p className="text-3xl font-bold text-white">{avgRating.toFixed(1)}</p>
                <Stars rating={Math.round(avgRating)} size="sm" />
                <p className="mt-1 text-xs text-zinc-600">
                  {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
                </p>
              </div>
            </div>
          ) : null}
        </div>

        {/* Review cards */}
        {preview.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {preview.map((r) => (
              <div
                key={r.id}
                className="reveal flex flex-col gap-4 rounded-2xl border border-white/[0.08] bg-zinc-900/50 p-5"
              >
                <div className="flex items-center gap-3">
                  <Initials name={r.reviewer_display_name} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-white">
                      {r.reviewer_display_name}
                    </p>
                    <p className="text-xs text-zinc-600">{formatDate(r.created_at)}</p>
                  </div>
                  <Stars rating={r.rating} size="sm" />
                </div>
                <p className="line-clamp-4 flex-1 text-sm leading-relaxed text-zinc-400">
                  {r.body}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-14 text-center">
            <p className="text-sm text-zinc-500">No reviews yet — you could be the first.</p>
          </div>
        )}

        {/* CTAs */}
        <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          {user ? (
            hasReviewed ? (
              <Link
                href="/feedback"
                className="rounded-full border border-white/15 px-6 py-2.5 text-sm text-zinc-300 transition hover:border-white/30 hover:text-white"
              >
                Edit your review →
              </Link>
            ) : (
              <Link
                href="/feedback"
                className="rounded-full bg-amber-200/90 px-6 py-2.5 text-sm font-semibold text-zinc-950 transition hover:bg-amber-200"
              >
                Leave a review ★
              </Link>
            )
          ) : (
            <Link
              href="/login?redirect=/feedback"
              className="rounded-full bg-amber-200/90 px-6 py-2.5 text-sm font-semibold text-zinc-950 transition hover:bg-amber-200"
            >
              Sign in to leave a review ★
            </Link>
          )}
          {reviews.length > 3 && (
            <Link
              href="/feedback"
              className="text-sm text-zinc-500 hover:text-zinc-300 transition"
            >
              See all {reviews.length} reviews →
            </Link>
          )}
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="border-t border-white/[0.06] bg-gradient-to-b from-zinc-950/80 to-black/80 px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto flex max-w-4xl flex-col items-center justify-between gap-8 text-center sm:flex-row sm:text-left">
          <div>
            <h2 className="text-2xl font-semibold text-white sm:text-3xl">Ready when you are</h2>
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
