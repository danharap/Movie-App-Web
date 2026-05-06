"use client";

import { addToWatchlist, markWatched } from "@/app/actions/library";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

type ExistingEntry = {
  user_rating: number | null;
  notes: string | null;
} | null;

type Props = {
  tmdbId: number;
  isLoggedIn: boolean;
  existing: ExistingEntry;
};

const RATING_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;

export function MovieActions({ tmdbId, isLoggedIn, existing }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showRateForm, setShowRateForm] = useState(false);
  const [rating, setRating] = useState<number>(existing?.user_rating ?? 0);
  const [notes, setNotes] = useState(existing?.notes ?? "");
  const [message, setMessage] = useState<string | null>(null);
  const [messageKind, setMessageKind] = useState<"ok" | "err">("ok");

  function flash(msg: string, kind: "ok" | "err" = "ok") {
    setMessage(msg);
    setMessageKind(kind);
    setTimeout(() => setMessage(null), 3000);
  }

  function run(action: () => Promise<void>, successMsg = "Saved.") {
    setMessage(null);
    startTransition(async () => {
      try {
        await action();
        flash(successMsg);
        router.refresh();
      } catch (e) {
        flash(e instanceof Error ? e.message : "Something went wrong.", "err");
      }
    });
  }

  if (!isLoggedIn) {
    return (
      <div className="mt-10 flex flex-wrap items-center justify-center gap-3 md:justify-start">
        <Link
          href={`/login?redirect=/movie/${tmdbId}`}
          className="rounded-full bg-white/10 px-5 py-2.5 text-sm font-medium text-white hover:bg-white/15"
        >
          Sign in to log / rate
        </Link>
        <Link
          href="/recommend"
          className="rounded-full px-5 py-2.5 text-sm text-zinc-500 hover:text-zinc-300"
        >
          Find similar
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-10 space-y-4">
      {/* Primary actions */}
      <div className="flex flex-wrap justify-center gap-3 md:justify-start">
        <button
          type="button"
          disabled={isPending}
          onClick={() => setShowRateForm((p) => !p)}
          className={`rounded-full px-5 py-2.5 text-sm font-medium transition disabled:opacity-50 ${
            existing
              ? "border border-amber-200/40 bg-amber-200/10 text-amber-100 hover:bg-amber-200/20"
              : "bg-white/10 text-white hover:bg-white/15"
          }`}
        >
          {existing ? `Logged · ${existing.user_rating ? `${existing.user_rating}/10` : "no rating"}` : "Log / Rate"}
        </button>

        <button
          type="button"
          disabled={isPending}
          onClick={() => run(() => addToWatchlist(tmdbId), "Added to watchlist.")}
          className="rounded-full border border-white/15 px-5 py-2.5 text-sm text-zinc-200 transition hover:border-amber-200/40 hover:text-white disabled:opacity-50"
        >
          Watchlist
        </button>

        <Link
          href="/recommend"
          className="rounded-full px-5 py-2.5 text-sm text-zinc-500 hover:text-zinc-300"
        >
          Find similar
        </Link>
      </div>

      {/* Rate form */}
      {showRateForm ? (
        <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-5 space-y-4">
          <p className="text-sm font-medium text-zinc-300">
            {existing ? "Update your log" : "Log this film"}
          </p>

          {/* 1–10 star/number rating */}
          <div className="space-y-1">
            <p className="text-xs text-zinc-500">Your rating (optional)</p>
            <div className="flex flex-wrap gap-2">
              {RATING_OPTIONS.map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRating((prev) => (prev === n ? 0 : n))}
                  className={`h-9 w-9 rounded-lg border text-sm font-semibold transition ${
                    rating === n
                      ? "border-amber-200/50 bg-amber-200/15 text-amber-100"
                      : "border-white/10 text-zinc-500 hover:border-white/25 hover:text-zinc-300"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1">
            <label htmlFor="movie-notes" className="text-xs text-zinc-500">
              Notes (optional)
            </label>
            <textarea
              id="movie-notes"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Thoughts, watch date, who you watched with…"
              className="w-full resize-none rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none placeholder:text-zinc-600 focus:ring-2 focus:ring-amber-200/30"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              disabled={isPending}
              onClick={() =>
                run(
                  () =>
                    markWatched(
                      tmdbId,
                      rating > 0 ? rating : null,
                      notes.trim() || null,
                    ),
                  existing ? "Log updated." : "Logged!",
                )
              }
              className="rounded-full bg-amber-200/90 px-5 py-2.5 text-sm font-semibold text-zinc-950 transition hover:bg-amber-200 disabled:opacity-60"
            >
              {isPending ? "Saving…" : existing ? "Update" : "Save"}
            </button>
            <button
              type="button"
              onClick={() => setShowRateForm(false)}
              className="rounded-full border border-white/15 px-4 py-2.5 text-sm text-zinc-400 hover:text-zinc-200"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}

      {message ? (
        <p
          className={`text-xs ${messageKind === "ok" ? "text-emerald-400/90" : "text-red-300/90"}`}
          role="status"
        >
          {message}
        </p>
      ) : null}
    </div>
  );
}
