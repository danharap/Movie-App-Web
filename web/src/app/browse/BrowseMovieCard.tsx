"use client";

import { addToWatchlist, markWatched } from "@/app/actions/library";
import { posterUrl } from "@/lib/tmdb/constants";
import Image from "next/image";
import Link from "next/link";
import { useState, useTransition } from "react";
import { toast } from "sonner";

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
  const [watched, setWatched] = useState(isWatched ?? false);
  const [watchlisted, setWatchlisted] = useState(isWatchlisted ?? false);
  const [isPending, startTransition] = useTransition();

  const year = movie.release_date?.slice(0, 4) ?? "—";
  const poster = posterUrl(movie.poster_path, "w342");

  function run(action: () => Promise<void>, onSuccess: () => void, msg: string) {
    if (!isLoggedIn) {
      toast.error("Sign in to save films.");
      return;
    }
    startTransition(async () => {
      try {
        await action();
        onSuccess();
        toast.success(msg);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Something went wrong.");
      }
    });
  }

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-white/[0.07] bg-zinc-900/60 shadow-lg shadow-black/30 transition-all duration-300 hover:border-indigo-400/20 hover:-translate-y-0.5 hover:shadow-indigo-950/20">
      <Link
        href={`/movie/${movie.id}`}
        className="relative aspect-[2/3] w-full overflow-hidden bg-zinc-800"
      >
        {poster ? (
          <Image
            src={poster}
            alt={movie.title}
            fill
            className="object-cover transition duration-500 group-hover:scale-[1.04]"
            sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 20vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center p-2 text-zinc-600 text-xs text-center">
            {movie.title}
          </div>
        )}
        {/* Score badge */}
        {movie.vote_average > 0 && (
          <div className="absolute left-2 top-2 rounded-md bg-black/70 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-200 backdrop-blur-sm ring-1 ring-white/10">
            ★ {movie.vote_average.toFixed(1)}
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-3">
        <div>
          <Link
            href={`/movie/${movie.id}`}
            className="line-clamp-2 text-sm font-medium text-white transition hover:text-indigo-200"
          >
            {movie.title}
          </Link>
          <p className="mt-0.5 text-xs text-zinc-500">{year}</p>
        </div>

        <div className="mt-auto flex gap-1.5 pt-1">
          <button
            type="button"
            disabled={isPending}
            onClick={() =>
              run(
                () => markWatched(movie.id),
                () => setWatched(true),
                "Added to your diary.",
              )
            }
            className={`flex-1 rounded-lg py-1.5 text-xs font-medium transition disabled:opacity-50 ${
              watched
                ? "border border-indigo-400/30 bg-indigo-400/10 text-indigo-200"
                : "border border-white/[0.08] bg-white/[0.04] text-zinc-400 hover:bg-white/[0.08] hover:text-white"
            }`}
          >
            {watched ? "✓ Watched" : "Watched"}
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
                : "border border-white/[0.08] bg-white/[0.04] text-zinc-400 hover:bg-white/[0.08] hover:text-white"
            }`}
          >
            {watchlisted ? "✓ Queued" : "Watchlist"}
          </button>
        </div>
      </div>
    </article>
  );
}
