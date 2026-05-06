import { BrowseMovieCard, type BrowseMovie } from "./BrowseMovieCard";
import { BrowseSearch } from "./BrowseSearch";
import { getPopularMovies, getTrendingMovies, getNowPlayingMovies } from "@/lib/tmdb/client";
import { posterUrl } from "@/lib/tmdb/constants";
import { createClient } from "@/lib/supabase/server";
import Image from "next/image";
import Link from "next/link";

export const dynamic = "force-dynamic";

async function loadBrowseData() {
  try {
    const [popular, trending, nowPlaying] = await Promise.all([
      getPopularMovies("1"),
      getTrendingMovies("week"),
      getNowPlayingMovies("1"),
    ]);
    return {
      popular: popular.results ?? [],
      trending: trending.results ?? [],
      nowPlaying: nowPlaying.results ?? [],
    };
  } catch (e) {
    console.error("[browse] failed to load TMDb data:", e);
    return { popular: [], trending: [], nowPlaying: [] };
  }
}

async function loadUserLibrary() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { watchedIds: new Set<number>(), watchlistIds: new Set<number>(), isLoggedIn: false };

    const [{ data: watched }, { data: watchlist }] = await Promise.all([
      supabase
        .from("watched_movies")
        .select("movies ( tmdb_id )")
        .eq("user_id", user.id),
      supabase
        .from("watchlist")
        .select("movies ( tmdb_id )")
        .eq("user_id", user.id),
    ]);

    const watchedIds = new Set<number>(
      (watched ?? []).flatMap((r) => {
        const m = r.movies as { tmdb_id: number } | { tmdb_id: number }[] | null;
        if (!m) return [];
        return Array.isArray(m) ? m.map((x) => x.tmdb_id) : [m.tmdb_id];
      }),
    );
    const watchlistIds = new Set<number>(
      (watchlist ?? []).flatMap((r) => {
        const m = r.movies as { tmdb_id: number } | { tmdb_id: number }[] | null;
        if (!m) return [];
        return Array.isArray(m) ? m.map((x) => x.tmdb_id) : [m.tmdb_id];
      }),
    );
    return { watchedIds, watchlistIds, isLoggedIn: true };
  } catch (e) {
    console.error("[browse] failed to load user library:", e);
    return { watchedIds: new Set<number>(), watchlistIds: new Set<number>(), isLoggedIn: false };
  }
}

function MovieGrid({
  movies,
  watchedIds,
  watchlistIds,
  isLoggedIn,
}: {
  movies: BrowseMovie[];
  watchedIds: Set<number>;
  watchlistIds: Set<number>;
  isLoggedIn: boolean;
}) {
  if (movies.length === 0) {
    return (
      <p className="py-16 text-center text-sm text-zinc-500">
        No movies found.
      </p>
    );
  }
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {movies.map((m) => (
        <BrowseMovieCard
          key={m.id}
          movie={m}
          isWatched={watchedIds.has(m.id)}
          isWatchlisted={watchlistIds.has(m.id)}
          isLoggedIn={isLoggedIn}
        />
      ))}
    </div>
  );
}

export default async function BrowsePage() {
  const [{ popular, trending, nowPlaying }, { watchedIds, watchlistIds, isLoggedIn }] =
    await Promise.all([loadBrowseData(), loadUserLibrary()]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <header className="mb-8 space-y-2">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-indigo-300/70">
          Discover
        </p>
        <h1 className="text-3xl font-semibold text-white">Browse Films</h1>
        <p className="text-sm text-zinc-400">
          Search for any film or explore what&apos;s trending this week.
        </p>
      </header>

      {/* Search bar */}
      <div className="mb-12">
        <BrowseSearch isLoggedIn={isLoggedIn} />
      </div>

      {/* Now in Theaters */}
      {nowPlaying.length > 0 && (
        <section className="mb-14">
          <div className="mb-4 flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <span className="relative flex size-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-red-500" />
              </span>
              <h2 className="text-lg font-semibold text-white">Now in Theaters</h2>
            </span>
            <span className="rounded-full bg-red-500/15 px-2.5 py-0.5 text-xs font-medium text-red-400">
              In cinemas
            </span>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-3 scrollbar-hide">
            {nowPlaying.slice(0, 20).map((movie) => {
              const poster = posterUrl(movie.poster_path, "w342");
              const year = movie.release_date?.slice(0, 4);
              return (
                <Link
                  key={movie.id}
                  href={`/movie/${movie.id}`}
                  className="group relative w-32 shrink-0 sm:w-36"
                >
                  <div className="relative aspect-[2/3] overflow-hidden rounded-xl border border-white/[0.08] bg-zinc-900 transition duration-300 group-hover:border-indigo-400/30 group-hover:shadow-lg group-hover:shadow-indigo-950/40">
                    {poster ? (
                      <Image
                        src={poster}
                        alt={movie.title}
                        fill
                        className="object-cover transition duration-300 group-hover:scale-[1.04]"
                        sizes="144px"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center p-2 text-center text-[11px] text-zinc-500">
                        {movie.title}
                      </div>
                    )}
                    {movie.vote_average > 0 && (
                      <div className="absolute right-1.5 top-1.5 rounded-md bg-black/70 px-1.5 py-0.5 text-[11px] font-semibold text-white backdrop-blur-sm">
                        {movie.vote_average.toFixed(1)}
                      </div>
                    )}
                  </div>
                  <p className="mt-2 truncate text-xs font-medium text-zinc-200 group-hover:text-white">
                    {movie.title}
                  </p>
                  {year && (
                    <p className="mt-0.5 text-[11px] text-zinc-600">{year}</p>
                  )}
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Trending section */}
      <section className="mb-12">
        <h2 className="mb-4 text-lg font-semibold text-white">
          Trending This Week
        </h2>
        <MovieGrid
          movies={trending.slice(0, 10) as BrowseMovie[]}
          watchedIds={watchedIds}
          watchlistIds={watchlistIds}
          isLoggedIn={isLoggedIn}
        />
      </section>

      {/* Popular section */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-white">Popular Now</h2>
        <MovieGrid
          movies={popular.slice(0, 20) as BrowseMovie[]}
          watchedIds={watchedIds}
          watchlistIds={watchlistIds}
          isLoggedIn={isLoggedIn}
        />
      </section>
    </div>
  );
}
