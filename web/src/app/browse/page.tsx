import { BrowseMovieCard, type BrowseMovie } from "./BrowseMovieCard";
import { BrowseSearch } from "./BrowseSearch";
import { getPopularMovies, getTrendingMovies } from "@/lib/tmdb/client";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

async function loadBrowseData() {
  try {
    const [popular, trending] = await Promise.all([
      getPopularMovies("1"),
      getTrendingMovies("week"),
    ]);
    return {
      popular: popular.results ?? [],
      trending: trending.results ?? [],
    };
  } catch (e) {
    console.error("[browse] failed to load TMDb data:", e);
    return { popular: [], trending: [] };
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
  const [{ popular, trending }, { watchedIds, watchlistIds, isLoggedIn }] =
    await Promise.all([loadBrowseData(), loadUserLibrary()]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <header className="mb-8 space-y-2">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-amber-200/70">
          Discover
        </p>
        <h1 className="text-3xl font-semibold text-white">Browse Films</h1>
        <p className="text-sm text-zinc-400">
          Search for any film or explore what&apos;s trending this week.
        </p>
      </header>

      {/* Search bar */}
      <div className="mb-10">
        <BrowseSearch isLoggedIn={isLoggedIn} />
      </div>

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
