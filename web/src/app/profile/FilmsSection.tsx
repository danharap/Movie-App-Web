"use client";

import { posterUrl } from "@/lib/tmdb/constants";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

type Genre = { id: number; name: string };

export type WatchedFilm = {
  movie: {
    id: number;
    tmdb_id: number;
    title: string;
    poster_path: string | null;
    genres: Genre[] | null;
  };
  watched_at: string | null;
  user_rating: number | null;
};

type Sort = "date-desc" | "date-asc" | "rating-desc" | "rating-asc" | "title";

const SORT_LABELS: Record<Sort, string> = {
  "date-desc": "Date ↓",
  "date-asc": "Date ↑",
  "rating-desc": "Rating ↓",
  "rating-asc": "Rating ↑",
  title: "Title",
};

export function FilmsSection({
  films,
  total,
}: {
  films: WatchedFilm[];
  total: number;
}) {
  const [sort, setSort] = useState<Sort>("date-desc");
  const [genreFilter, setGenreFilter] = useState<number | null>(null);

  // Collect unique genres that appear in the watched list
  const availableGenres = useMemo<Genre[]>(() => {
    const map = new Map<number, string>();
    for (const { movie } of films) {
      for (const g of movie.genres ?? []) {
        if (!map.has(g.id)) map.set(g.id, g.name);
      }
    }
    return Array.from(map.entries())
      .sort((a, b) => a[1].localeCompare(b[1]))
      .map(([id, name]) => ({ id, name }));
  }, [films]);

  const sorted = useMemo(() => {
    let list = [...films];

    // Genre filter
    if (genreFilter !== null) {
      list = list.filter((f) =>
        (f.movie.genres ?? []).some((g) => g.id === genreFilter),
      );
    }

    // Sort
    switch (sort) {
      case "date-asc":
        list.sort((a, b) => (a.watched_at ?? "").localeCompare(b.watched_at ?? ""));
        break;
      case "date-desc":
        list.sort((a, b) => (b.watched_at ?? "").localeCompare(a.watched_at ?? ""));
        break;
      case "rating-desc":
        list.sort((a, b) => (b.user_rating ?? -1) - (a.user_rating ?? -1));
        break;
      case "rating-asc":
        list.sort((a, b) => (a.user_rating ?? 999) - (b.user_rating ?? 999));
        break;
      case "title":
        list.sort((a, b) => a.movie.title.localeCompare(b.movie.title));
        break;
    }

    return list;
  }, [films, sort, genreFilter]);

  return (
    <section className="mb-12">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">
          Films{" "}
          <span className="text-sm font-normal text-zinc-500">({total})</span>
        </h2>
        <Link href="/watched" className="text-xs text-amber-200/70 hover:text-amber-100">
          Edit diary →
        </Link>
      </div>

      {films.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/15 bg-zinc-900/30 px-6 py-12 text-center">
          <p className="text-sm text-zinc-400">No films logged yet.</p>
          <Link
            href="/browse"
            className="mt-4 inline-block text-sm font-medium text-amber-200 hover:text-amber-100"
          >
            Browse films to add →
          </Link>
        </div>
      ) : (
        <>
          {/* Controls */}
          <div className="mb-4 space-y-3">
            {/* Sort buttons */}
            <div className="flex flex-wrap gap-1.5">
              <span className="self-center text-xs text-zinc-500">Sort:</span>
              {(Object.keys(SORT_LABELS) as Sort[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setSort(s)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                    sort === s
                      ? "bg-amber-300/20 text-amber-200"
                      : "bg-zinc-800 text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  {SORT_LABELS[s]}
                </button>
              ))}
            </div>

            {/* Genre filter pills */}
            {availableGenres.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                <span className="self-center text-xs text-zinc-500">Genre:</span>
                <button
                  onClick={() => setGenreFilter(null)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                    genreFilter === null
                      ? "bg-amber-300/20 text-amber-200"
                      : "bg-zinc-800 text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  All
                </button>
                {availableGenres.map((g) => (
                  <button
                    key={g.id}
                    onClick={() => setGenreFilter(g.id === genreFilter ? null : g.id)}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                      genreFilter === g.id
                        ? "bg-amber-300/20 text-amber-200"
                        : "bg-zinc-800 text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    {g.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Results count when filtered */}
          {genreFilter !== null && (
            <p className="mb-3 text-xs text-zinc-500">
              {sorted.length} film{sorted.length !== 1 ? "s" : ""} in this genre
            </p>
          )}

          {/* Poster grid */}
          {sorted.length === 0 ? (
            <p className="text-sm text-zinc-500">No films match this filter.</p>
          ) : (
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-8">
              {sorted.map(({ movie, user_rating }) => {
                const poster = posterUrl(movie.poster_path, "w342");
                return (
                  <div key={movie.id} className="group relative">
                    <Link
                      href={`/movie/${movie.tmdb_id}`}
                      title={movie.title}
                      className="relative block aspect-[2/3] overflow-hidden rounded-lg bg-zinc-800"
                    >
                      {poster ? (
                        <Image
                          src={poster}
                          alt={movie.title}
                          fill
                          className="object-cover transition group-hover:scale-[1.03]"
                          sizes="(max-width:640px) 25vw, (max-width:1024px) 16vw, 12vw"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center p-1">
                          <span className="line-clamp-3 text-center text-[10px] text-zinc-500">
                            {movie.title}
                          </span>
                        </div>
                      )}
                    </Link>
                    {user_rating != null && (
                      <span className="absolute bottom-1 right-1 rounded bg-black/80 px-1 py-0.5 text-[9px] font-semibold text-amber-200 ring-1 ring-white/10">
                        {user_rating}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </section>
  );
}
