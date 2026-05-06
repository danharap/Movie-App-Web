import { FavouritesPicker } from "./FavouritesPicker";
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
};

async function loadProfile() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [
    { data: profile },
    { data: watchedRows },
    { data: watchlistRows },
    { data: favouriteRows },
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("display_name, email")
      .eq("id", user.id)
      .maybeSingle(),
    supabase
      .from("watched_movies")
      .select(
        "watched_at, user_rating, notes, movies ( id, tmdb_id, title, release_year, poster_path, vote_average )",
      )
      .eq("user_id", user.id)
      .order("watched_at", { ascending: false }),
    supabase
      .from("watchlist")
      .select(
        "created_at, movies ( id, tmdb_id, title, release_year, poster_path, vote_average )",
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("favourite_movies")
      .select("position, movies ( id, tmdb_id, title, poster_path )")
      .eq("user_id", user.id)
      .order("position", { ascending: true }),
  ]);

  // --- Stats ---
  const watched = (watchedRows ?? []).flatMap((r) => {
    const m = r.movies as MovieRow | MovieRow[] | null;
    if (!m) return [];
    const movie = Array.isArray(m) ? m[0] : m;
    return movie
      ? [
          {
            movie,
            watched_at: r.watched_at as string,
            user_rating: r.user_rating as number | null,
            notes: r.notes as string | null,
          },
        ]
      : [];
  });

  const rated = watched.filter((w) => w.user_rating != null);
  const avgRating =
    rated.length > 0
      ? rated.reduce((s, w) => s + (w.user_rating ?? 0), 0) / rated.length
      : null;

  const watchlist = (watchlistRows ?? []).flatMap((r) => {
    const m = r.movies as MovieRow | MovieRow[] | null;
    if (!m) return [];
    const movie = Array.isArray(m) ? m[0] : m;
    return movie ? [{ movie }] : [];
  });

  // --- Favourites (4 slots) ---
  type FavRow = {
    position: number;
    movies: { id: number; tmdb_id: number; title: string; poster_path: string | null } | null;
  };

  const favouriteSlots: { position: 1 | 2 | 3 | 4; tmdb_id: number | null; title: string | null; poster_path: string | null }[] =
    [1, 2, 3, 4].map((pos) => {
      const row = (favouriteRows as FavRow[] | null)?.find(
        (r) => r.position === pos,
      );
      const m = row?.movies;
      return {
        position: pos as 1 | 2 | 3 | 4,
        tmdb_id: m?.tmdb_id ?? null,
        title: m?.title ?? null,
        poster_path: m?.poster_path ?? null,
      };
    });

  return {
    user,
    profile: profile ?? null,
    watched,
    watchlist,
    favouriteSlots,
    stats: {
      totalWatched: watched.length,
      totalRated: rated.length,
      avgRating,
    },
  };
}

export default async function ProfilePage() {
  const data = await loadProfile();

  if (!data) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <h1 className="text-2xl font-semibold text-white">Your Profile</h1>
        <p className="mt-4 text-sm text-zinc-400">
          <Link href="/login" className="text-amber-200 hover:text-amber-100 underline underline-offset-2">
            Sign in
          </Link>{" "}
          to view and manage your profile.
        </p>
      </div>
    );
  }

  const { profile, watched, watchlist, favouriteSlots, stats } = data;

  const displayName =
    (profile?.display_name as string | null)?.trim() ||
    (profile?.email as string | null)?.split("@")[0] ||
    "Film fan";

  const recent = watched.slice(0, 6);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      {/* Profile header */}
      <div className="mb-10 flex items-center gap-5">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-2xl font-bold text-amber-200 select-none">
          {displayName.slice(0, 1).toUpperCase()}
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-white">{displayName}</h1>
          {profile?.email ? (
            <p className="text-sm text-zinc-500">{profile.email as string}</p>
          ) : null}
        </div>
      </div>

      {/* Stats */}
      <div className="mb-10 grid grid-cols-3 gap-3">
        {[
          { label: "Films", value: stats.totalWatched },
          { label: "Rated", value: stats.totalRated },
          {
            label: "Avg rating",
            value: stats.avgRating != null ? `${stats.avgRating.toFixed(1)}/10` : "—",
          },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="rounded-2xl border border-white/10 bg-zinc-900/40 px-4 py-5 text-center"
          >
            <p className="text-2xl font-bold text-white">{value}</p>
            <p className="mt-1 text-xs text-zinc-500">{label}</p>
          </div>
        ))}
      </div>

      {/* Top 4 favourites */}
      <section className="mb-12">
        <h2 className="mb-4 text-lg font-semibold text-white">
          Top 4 Favourites
        </h2>
        <p className="mb-4 text-xs text-zinc-500">
          Click a slot to pick or change a favourite film.
        </p>
        <FavouritesPicker slots={favouriteSlots} />
      </section>

      {/* Recent watches */}
      {recent.length > 0 ? (
        <section className="mb-12">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Recently Watched</h2>
            {watched.length > 6 ? (
              <Link href="/watched" className="text-xs text-amber-200/70 hover:text-amber-100">
                View all →
              </Link>
            ) : null}
          </div>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
            {recent.map(({ movie, user_rating }) => {
              const poster = posterUrl(movie.poster_path, "w342");
              return (
                <div key={movie.id} className="group relative">
                  <Link
                    href={`/movie/${movie.tmdb_id}`}
                    className="relative block aspect-[2/3] overflow-hidden rounded-xl bg-zinc-800"
                  >
                    {poster ? (
                      <Image
                        src={poster}
                        alt={movie.title}
                        fill
                        className="object-cover transition group-hover:scale-[1.03]"
                        sizes="(max-width:640px) 33vw, 120px"
                      />
                    ) : null}
                  </Link>
                  {user_rating != null ? (
                    <span className="absolute bottom-1.5 right-1.5 rounded-md bg-black/80 px-1.5 py-0.5 text-[10px] font-semibold text-amber-200 ring-1 ring-white/10">
                      {user_rating}/10
                    </span>
                  ) : null}
                </div>
              );
            })}
          </div>
        </section>
      ) : null}

      {/* Full diary */}
      {watched.length > 0 ? (
        <section className="mb-12">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">
              Diary ({stats.totalWatched})
            </h2>
            <Link href="/watched" className="text-xs text-amber-200/70 hover:text-amber-100">
              Edit diary →
            </Link>
          </div>
          <ul className="space-y-3">
            {watched.map(({ movie, watched_at, user_rating, notes }) => {
              const poster = posterUrl(movie.poster_path, "w92");
              return (
                <li
                  key={movie.id}
                  className="flex gap-3 rounded-xl border border-white/5 bg-zinc-900/30 p-3"
                >
                  <Link
                    href={`/movie/${movie.tmdb_id}`}
                    className="relative h-16 w-11 shrink-0 overflow-hidden rounded-lg bg-zinc-800"
                  >
                    {poster ? (
                      <Image
                        src={poster}
                        alt={movie.title}
                        fill
                        className="object-cover"
                        sizes="44px"
                      />
                    ) : null}
                  </Link>
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/movie/${movie.tmdb_id}`}
                      className="text-sm font-medium text-white hover:text-amber-100"
                    >
                      {movie.title}
                    </Link>
                    <p className="text-xs text-zinc-500">
                      {watched_at
                        ? new Date(watched_at).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })
                        : "—"}
                      {user_rating != null ? ` · ${user_rating}/10` : ""}
                    </p>
                    {notes ? (
                      <p className="line-clamp-1 text-xs italic text-zinc-500">
                        {notes}
                      </p>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      ) : (
        <section className="mb-12">
          <h2 className="mb-4 text-lg font-semibold text-white">Diary</h2>
          <div className="rounded-2xl border border-dashed border-white/15 bg-zinc-900/30 px-6 py-12 text-center">
            <p className="text-sm text-zinc-400">No films logged yet.</p>
            <Link
              href="/browse"
              className="mt-4 inline-block text-sm font-medium text-amber-200 hover:text-amber-100"
            >
              Browse films to add →
            </Link>
          </div>
        </section>
      )}

      {/* Watchlist */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">
            Watchlist ({watchlist.length})
          </h2>
          {watchlist.length > 0 ? (
            <Link href="/watchlist" className="text-xs text-amber-200/70 hover:text-amber-100">
              Manage →
            </Link>
          ) : null}
        </div>
        {watchlist.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/15 bg-zinc-900/30 px-6 py-12 text-center">
            <p className="text-sm text-zinc-400">Nothing queued up.</p>
            <Link
              href="/browse"
              className="mt-4 inline-block text-sm font-medium text-amber-200 hover:text-amber-100"
            >
              Browse films →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
            {watchlist.slice(0, 12).map(({ movie }) => {
              const poster = posterUrl(movie.poster_path, "w342");
              return (
                <Link
                  key={movie.id}
                  href={`/movie/${movie.tmdb_id}`}
                  className="group relative block aspect-[2/3] overflow-hidden rounded-xl bg-zinc-800"
                >
                  {poster ? (
                    <Image
                      src={poster}
                      alt={movie.title}
                      fill
                      className="object-cover transition group-hover:scale-[1.03]"
                      sizes="(max-width:640px) 33vw, 120px"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-zinc-600">
                      {movie.title.slice(0, 12)}
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        )}
        {watchlist.length > 12 ? (
          <Link
            href="/watchlist"
            className="mt-4 inline-block text-xs text-zinc-500 hover:text-zinc-300"
          >
            +{watchlist.length - 12} more in watchlist →
          </Link>
        ) : null}
      </section>
    </div>
  );
}
