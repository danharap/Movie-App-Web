import { removeWatchlistItem } from "./actions";
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
  overview: string | null;
};

export default async function WatchlistPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: rows } = await supabase
    .from("watchlist")
    .select("id, created_at, movies ( id, tmdb_id, title, release_year, poster_path, vote_average, overview )")
    .order("created_at", { ascending: false });

  const items =
    rows?.flatMap((r) => {
      const m = r.movies as MovieRow | MovieRow[] | null;
      if (!m) return [];
      const movie = Array.isArray(m) ? m[0] : m;
      return movie ? [{ rowId: r.id, movie }] : [];
    }) ?? [];

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <header className="mb-10 space-y-2">
        <h1 className="text-3xl font-semibold text-white">Watchlist</h1>
        <p className="text-sm text-zinc-400">
          Films you&apos;re keeping on deck.{" "}
          {!user ? "Sign in to sync this list across devices." : null}
        </p>
      </header>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/15 bg-zinc-900/30 px-6 py-16 text-center">
          <p className="text-zinc-400">Nothing saved yet.</p>
          <Link
            href="/recommend"
            className="mt-6 inline-block text-sm font-medium text-amber-200 hover:text-amber-100"
          >
            Find something to queue →
          </Link>
        </div>
      ) : (
        <ul className="flex flex-col gap-4">
          {items.map(({ rowId, movie }) => {
            const p = posterUrl(movie.poster_path, "w342");
            return (
              <li
                key={rowId}
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
                  {movie.release_year ? (
                    <p className="text-xs text-zinc-500">{movie.release_year}</p>
                  ) : null}
                  {movie.vote_average != null ? (
                    <p className="text-xs text-amber-100/80">
                      ★ {Number(movie.vote_average).toFixed(1)}
                    </p>
                  ) : null}
                  <form action={removeWatchlistItem} className="mt-3">
                    <input type="hidden" name="tmdbId" value={movie.tmdb_id} />
                    <button
                      type="submit"
                      className="text-xs text-zinc-500 underline-offset-2 hover:text-zinc-300 hover:underline"
                    >
                      Remove
                    </button>
                  </form>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
