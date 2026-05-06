"use client";

import { STORAGE_KEY_LAST_RECOMMENDATION } from "@/config/brand";
import { MovieResultCard } from "@/features/movies/MovieResultCard";
import type { FinderMeta, RecommendedMovie } from "@/types/movie";
import Link from "next/link";
import { useEffect, useState } from "react";

type Stored = {
  input: unknown;
  movies: RecommendedMovie[];
  finderMeta?: FinderMeta;
};

export function ResultsClient() {
  const [data, setData] = useState<Stored | null | undefined>(undefined);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY_LAST_RECOMMENDATION);
      setData(raw ? (JSON.parse(raw) as Stored) : null);
    } catch {
      setData(null);
    }
  }, []);

  if (data === undefined) {
    return (
      <div className="mx-auto max-w-2xl space-y-4 px-4 py-24">
        <div className="skeleton h-10 w-2/3 rounded-lg" />
        <div className="skeleton h-32 w-full rounded-xl" />
        <div className="skeleton h-32 w-full rounded-xl" />
      </div>
    );
  }

  if (!data?.movies?.length) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <h1 className="text-2xl font-semibold text-white">No results here yet</h1>
        <p className="mt-3 text-sm text-zinc-400">
          Run the picker first — we keep your shortlist in this browser session
          until you refresh.
        </p>
        <Link
          href="/recommend"
          className="mt-8 inline-flex rounded-full bg-amber-200/90 px-6 py-3 text-sm font-semibold text-zinc-950 hover:bg-amber-200"
        >
          Start narrowing down
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-10 px-4 py-12 sm:px-6">
      <header className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-amber-200/70">
          Your shortlist
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-white">
          Here are a few films worth your evening
        </h1>
        <p className="text-sm text-zinc-400">
          Save what resonates — we&apos;ll remember what you&apos;ve seen once you&apos;re
          signed in.
        </p>
      </header>

      {data.finderMeta?.conflictDetected && data.finderMeta.userMessage ? (
        <div className="rounded-xl border border-amber-200/20 bg-amber-200/[0.06] px-4 py-3 text-sm text-amber-100/80">
          <span className="mr-2 font-medium text-amber-200">Mixed preferences detected —</span>
          {data.finderMeta.userMessage}
        </div>
      ) : null}
      <ul className="flex flex-col gap-6">
        {data.movies.map((m, i) => (
          <li
            key={m.id}
            className="reveal"
            style={{ animationDelay: `${0.06 * i}s` }}
          >
            <MovieResultCard movie={m} />
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap gap-3">
        <Link
          href="/recommend"
          className="rounded-full border border-white/15 px-4 py-2 text-sm text-zinc-300 hover:border-amber-200/40 hover:text-white"
        >
          Different vibe
        </Link>
        <Link
          href="/watchlist"
          className="rounded-full border border-white/15 px-4 py-2 text-sm text-zinc-300 hover:border-amber-200/40 hover:text-white"
        >
          Open watchlist
        </Link>
      </div>
    </div>
  );
}
