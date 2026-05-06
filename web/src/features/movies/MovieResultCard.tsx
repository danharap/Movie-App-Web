"use client";

import {
  addToWatchlist,
  dismissMovie,
  markWatched,
} from "@/app/actions/library";
import { posterUrl } from "@/lib/tmdb/constants";
import type { RecommendedMovie } from "@/types/movie";
import Image from "next/image";
import Link from "next/link";
import { useState, useTransition } from "react";

type Props = { movie: RecommendedMovie };

export function MovieResultCard({ movie }: Props) {
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function run(action: () => Promise<void>, successMsg = "Saved.") {
    setMessage(null);
    startTransition(async () => {
      try {
        await action();
        setMessage(successMsg);
      } catch (e) {
        setMessage(e instanceof Error ? e.message : "Something went wrong.");
      }
    });
  }

  const poster = posterUrl(movie.poster_path, "w500");

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/50 shadow-xl shadow-black/40 transition hover:border-amber-200/25 hover:shadow-amber-900/10 md:flex-row">
      <Link
        href={`/movie/${movie.id}`}
        className="relative aspect-[2/3] w-full shrink-0 overflow-hidden bg-zinc-800 md:w-44 lg:w-52"
      >
        {poster ? (
          <Image
            src={poster}
            alt={movie.title}
            fill
            className="object-cover transition duration-500 group-hover:scale-[1.03]"
            sizes="(max-width:768px) 100vw, 208px"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-zinc-600">
            No poster
          </div>
        )}
      </Link>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          <div className="flex flex-wrap items-baseline gap-2">
            <h2 className="text-xl font-semibold tracking-tight text-white">
              <Link href={`/movie/${movie.id}`} className="hover:text-amber-100">
                {movie.title}
              </Link>
            </h2>
            {movie.release_year ? (
              <span className="text-sm text-zinc-500">{movie.release_year}</span>
            ) : null}
            {movie.runtime ? (
              <span className="text-sm text-zinc-500">{movie.runtime} min</span>
            ) : null}
          </div>
          <p className="mt-1 flex flex-wrap items-baseline gap-x-2 text-sm text-amber-100/80">
            <span>★ {movie.vote_average.toFixed(1)}</span>
            <span className="text-zinc-500">/ 10</span>
            {movie.vote_count ? (
              <span className="text-xs text-zinc-600">
                {movie.vote_count.toLocaleString()} votes
              </span>
            ) : null}
          </p>
        </div>
        <p className="line-clamp-4 text-sm leading-relaxed text-zinc-400">
          {movie.overview || "No overview available."}
        </p>
        <ul className="flex flex-wrap gap-2">
          {movie.reasons.map((r) => (
            <li
              key={r.label}
              className="rounded-full border border-amber-200/20 bg-amber-200/10 px-2.5 py-0.5 text-xs text-amber-100/90"
            >
              {r.label}
            </li>
          ))}
        </ul>
        <div className="mt-auto flex flex-wrap gap-2 pt-2">
          <button
            type="button"
            disabled={isPending}
            onClick={() => run(() => markWatched(movie.id), "Logged to diary.")}
            className="rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/15 disabled:opacity-50"
          >
            Watched
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={() => run(() => addToWatchlist(movie.id), "Added to watchlist.")}
            className="rounded-full border border-white/15 px-4 py-2 text-sm text-zinc-200 transition hover:border-amber-200/40 hover:text-white disabled:opacity-50"
          >
            Watchlist
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={() => run(() => dismissMovie(movie.id, "not_interested"), "Hidden from future runs.")}
            className="rounded-full px-4 py-2 text-sm text-zinc-500 transition hover:text-zinc-300 disabled:opacity-50"
          >
            Not for me
          </button>
        </div>
        {message ? (
          <p className="text-xs text-zinc-400" role="status">
            {message}
          </p>
        ) : null}
      </div>
    </article>
  );
}
