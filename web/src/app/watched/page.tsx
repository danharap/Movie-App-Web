import { WatchedAddSearch } from "./WatchedAddSearch";
import { WatchedEntryActions } from "./WatchedEntryActions";
import { posterUrl } from "@/lib/tmdb/constants";
import { createClient } from "@/lib/supabase/server";
import Image from "next/image";
import Link from "next/link";

export const dynamic = "force-dynamic";

type MovieRow = {
  id: number;
  tmdb_id: number;
  title: string;
  release_year: number | null;
  poster_path: string | null;
  vote_average: number | null;
  vote_count?: number | null;
};

export default async function WatchedPage() {
  const supabase = await createClient();

  const { data: rows } = await supabase
    .from("watched_movies")
    .select(
      "watched_at, user_rating, notes, movies ( id, tmdb_id, title, release_year, poster_path, vote_average, vote_count )",
    )
    .order("watched_at", { ascending: false });

  const items =
    rows?.flatMap((r) => {
      const m = r.movies as MovieRow | MovieRow[] | null;
      if (!m) return [];
      const movie = Array.isArray(m) ? m[0] : m;
      return movie
        ? [
            {
              watched_at: r.watched_at,
              user_rating: r.user_rating,
              notes: r.notes,
              movie,
            },
          ]
        : [];
    }) ?? [];

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <header className="mb-8 space-y-2">
        <h1 className="text-3xl font-semibold text-white">Watched</h1>
        <p className="text-sm text-zinc-400">
          Your diary — titles here are excluded from future shortlists.
        </p>
      </header>

      <WatchedAddSearch
        alreadyWatchedTmdbIds={items.map(({ movie }) => movie.tmdb_id)}
      />

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/15 bg-zinc-900/30 px-6 py-16 text-center">
          <p className="text-zinc-400">No films logged yet.</p>
          <Link
            href="/results"
            className="mt-6 inline-block text-sm font-medium text-amber-200 hover:text-amber-100"
          >
            Mark something from your last run →
          </Link>
        </div>
      ) : (
        <ul className="flex flex-col gap-4">
          {items.map(({ watched_at, user_rating, notes, movie }) => {
            const p = posterUrl(movie.poster_path, "w342");
            return (
              <li
                key={`${movie.id}-${watched_at}`}
                className="flex gap-4 rounded-2xl border border-white/10 bg-zinc-900/40 p-4"
              >
                <Link
                  href={`/movie/${movie.tmdb_id}`}
                  className="relative h-28 w-20 shrink-0 overflow-hidden rounded-lg bg-zinc-800"
                >
                  {p ? (
                    <Image
                      src={p}
                      alt={movie.title}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  ) : null}
                </Link>
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/movie/${movie.tmdb_id}`}
                    className="font-medium text-white hover:text-amber-100"
                  >
                    {movie.title}
                  </Link>
                  <p className="text-xs text-zinc-500">
                    Watched{" "}
                    {watched_at
                      ? new Date(watched_at).toLocaleDateString()
                      : "—"}
                  </p>
                  {movie.vote_average != null ? (
                    <p className="text-xs text-zinc-500">
                      TMDb ★ {Number(movie.vote_average).toFixed(1)}
                      {movie.vote_count
                        ? ` · ${movie.vote_count.toLocaleString()} votes`
                        : ""}
                    </p>
                  ) : null}
                  {notes ? (
                    <p className="mt-1 line-clamp-2 text-xs text-zinc-400 italic">
                      &ldquo;{notes}&rdquo;
                    </p>
                  ) : null}
                  <WatchedEntryActions
                    tmdbId={movie.tmdb_id}
                    initialRating={user_rating ?? null}
                    initialNotes={notes ?? null}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
