"use client";

import { addToWatchlist, markWatched } from "@/app/actions/library";
import { posterUrl } from "@/lib/tmdb/constants";
import Image from "next/image";
import Link from "next/link";
import { useState, useTransition } from "react";

export type BrowseMovie = {
  id: number;
  title: string;
  release_date: string;
  poster_path: string | null;
  vote_average: number;
  vote_count: number;
  overview: string;
  genre_ids: number[];
};

type Props = {
  movie: BrowseMovie;
  isWatched?: boolean;
  isWatchlisted?: boolean;
  isLoggedIn: boolean;
};

export function BrowseMovieCard({ movie, isWatched, isWatchlisted, isLoggedIn }: Props) {
  const [status, setStatus] = useState<string | null>(null);
  const [watched, setWatched] = useState(isWatched ?? false);
  const [watchlisted, setWatchlisted] = useState(isWatchlisted ?? false);
  const [isPending, startTransition] = useTransition();

  const year = movie.release_date?.slice(0, 4) ?? "—";
  const poster = posterUrl(movie.poster_path, "w342");

  function run(action: () => Promise<void>, onSuccess: () => void, msg: string) {
    if (!isLoggedIn) {
      setStatus("Sign in to save films.");
      return;
    }
    setStatus(null);
    startTransition(async () => {
      try {
        await action();
        onSuccess();
        setStatus(msg);
      } catch (e) {
        setStatus(e instanceof Error ? e.message : "Something went wrong.");
      }
    });
  }

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/50 shadow-lg shadow-black/30 transition hover:border-amber-200/20">
      <Link
        href={`/movie/${movie.id}`}
        className="relative aspect-[2/3] w-full overflow-hidden bg-zinc-800"
      >
        {poster ? (
          <Image
            src={poster}
            alt={movie.title}
            fill
            className="object-cover transition duration-500 group-hover:scale-[1.03]"
            sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 20vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-zinc-600 text-xs">
            No poster
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-3">
        <div>
          <Link
            href={`/movie/${movie.id}`}
            className="line-clamp-2 text-sm font-medium text-white hover:text-amber-100"
          >
            {movie.title}
          </Link>
          <p className="text-xs text-zinc-500">
            {year} · ★ {movie.vote_average.toFixed(1)}
          </p>
        </div>

        <div className="mt-auto flex gap-1.5 pt-1">
          <button
            type="button"
            disabled={isPending}
            onClick={() =>
              run(
                () => markWatched(movie.id),
                () => setWatched(true),
                "Added to diary.",
              )
            }
            className={`flex-1 rounded-lg py-1.5 text-xs font-medium transition disabled:opacity-50 ${
              watched
                ? "border border-amber-200/30 bg-amber-200/10 text-amber-100"
                : "border border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10"
            }`}
          >
            {watched ? "Watched ✓" : "Watched"}
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={() =>
              run(
                () => addToWatchlist(movie.id),
                () => setWatchlisted(true),
                "Added to watchlist.",
              )
            }
            className={`flex-1 rounded-lg py-1.5 text-xs font-medium transition disabled:opacity-50 ${
              watchlisted
                ? "border border-white/20 bg-white/10 text-white"
                : "border border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10"
            }`}
          >
            {watchlisted ? "Queued ✓" : "Watchlist"}
          </button>
        </div>

        {status ? (
          <p className="text-xs text-zinc-400" role="status">
            {status}
          </p>
        ) : null}
      </div>
    </article>
  );
}
