import { FriendButton } from "@/components/social/FriendButton";
import { Avatar } from "@/components/ui/Avatar";
import { getProfileByUsername, getFriendshipStatus } from "@/features/users/service";
import { posterUrl } from "@/lib/tmdb/constants";
import { createClient } from "@/lib/supabase/server";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

type MovieRow = {
  id: number;
  tmdb_id: number;
  title: string;
  poster_path: string | null;
  vote_average: number | null;
};

type FavRow = {
  position: number;
  movies: { id: number; tmdb_id: number; title: string; poster_path: string | null } | null;
};

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const target = await getProfileByUsername(username);

  if (!target || !target.is_public) notFound();

  const supabase = await createClient();
  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser();

  const isSelf = currentUser?.id === target.id;

  // If same user, redirect to own profile
  if (isSelf) {
    const { redirect } = await import("next/navigation");
    redirect("/profile");
  }

  const [friendshipStatus, { data: watchedRows }, { data: favouriteRows }, { data: watchlistRows }, { data: friendCount }] =
    await Promise.all([
      currentUser
        ? getFriendshipStatus(currentUser.id, target.id)
        : Promise.resolve("none" as const),
      supabase
        .from("watched_movies")
        .select("user_rating, movies ( id, tmdb_id, title, poster_path, vote_average )")
        .eq("user_id", target.id)
        .order("watched_at", { ascending: false })
        .limit(24),
      supabase
        .from("favourite_movies")
        .select("position, movies ( id, tmdb_id, title, poster_path )")
        .eq("user_id", target.id)
        .order("position"),
      // Watchlist only if public
      target.watchlist_public
        ? supabase
            .from("watchlist")
            .select("movies ( id, tmdb_id, title, poster_path )")
            .eq("user_id", target.id)
            .order("created_at", { ascending: false })
            .limit(12)
        : Promise.resolve({ data: null }),
      supabase
        .from("friendships")
        .select("id", { count: "exact" })
        .or(`requester_id.eq.${target.id},addressee_id.eq.${target.id}`)
        .eq("status", "accepted"),
    ]);

  const watched = (watchedRows ?? []).flatMap((r) => {
    const m = r.movies as MovieRow | MovieRow[] | null;
    if (!m) return [];
    const movie = Array.isArray(m) ? m[0] : m;
    return movie ? [{ movie, user_rating: r.user_rating as number | null }] : [];
  });

  const favourites = [1, 2, 3, 4].map((pos) => {
    const row = (favouriteRows as FavRow[] | null)?.find((r) => r.position === pos);
    return { position: pos, movie: row?.movies ?? null };
  });

  const watchlist = target.watchlist_public
    ? (watchlistRows ?? []).flatMap((r) => {
        const m = r.movies as MovieRow | MovieRow[] | null;
        if (!m) return [];
        const movie = Array.isArray(m) ? m[0] : m;
        return movie ? [movie] : [];
      })
    : [];

  const displayName = target.display_name?.trim() || target.username || "Film fan";

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">

      {/* ── Header ── */}
      <div className="mb-10 flex flex-col items-center gap-6 sm:flex-row sm:items-start">
        <Avatar url={target.avatar_url} name={displayName} size={80} />

        <div className="flex-1 space-y-2 text-center sm:text-left">
          <div>
            <h1 className="text-2xl font-bold text-white">{displayName}</h1>
            {target.username ? (
              <p className="text-sm text-zinc-500">@{target.username}</p>
            ) : null}
          </div>
          {target.bio ? (
            <p className="max-w-md text-sm leading-relaxed text-zinc-400">{target.bio}</p>
          ) : null}
          <p className="text-xs text-zinc-500">
            <span className="font-semibold text-white">{friendCount?.length ?? 0}</span> friends ·{" "}
            <span className="font-semibold text-white">{watched.length}</span> films watched
          </p>
          {currentUser && !isSelf ? (
            <FriendButton targetId={target.id} initial={friendshipStatus} />
          ) : !currentUser ? (
            <Link
              href="/login"
              className="inline-block rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs text-zinc-300 hover:text-white"
            >
              Sign in to add friend
            </Link>
          ) : null}
        </div>
      </div>

      {/* ── Top 4 Favourites ── */}
      {favourites.some((f) => f.movie) ? (
        <section className="mb-12">
          <h2 className="mb-4 text-lg font-semibold text-white">Top 4 Favourites</h2>
          <div className="grid grid-cols-4 gap-3">
            {favourites.map(({ position, movie }) => {
              const poster = movie ? posterUrl(movie.poster_path, "w342") : null;
              return (
                <div key={position}>
                  {movie ? (
                    <Link
                      href={`/movie/${movie.tmdb_id}`}
                      className="group relative block aspect-[2/3] overflow-hidden rounded-xl bg-zinc-800"
                    >
                      {poster ? (
                        <Image
                          src={poster}
                          alt={movie.title}
                          fill
                          className="object-cover transition group-hover:scale-[1.03]"
                          sizes="(max-width:640px) 25vw, 120px"
                        />
                      ) : null}
                    </Link>
                  ) : (
                    <div className="aspect-[2/3] rounded-xl bg-zinc-800/40" />
                  )}
                </div>
              );
            })}
          </div>
        </section>
      ) : null}

      {/* ── Recent Watched ── */}
      {watched.length > 0 ? (
        <section className="mb-12">
          <h2 className="mb-4 text-lg font-semibold text-white">
            Films ({watched.length})
          </h2>
          <div className="grid grid-cols-4 gap-3 sm:grid-cols-6">
            {watched.map(({ movie, user_rating }) => {
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
                        sizes="(max-width:640px) 25vw, 100px"
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
      ) : (
        <section className="mb-12">
          <h2 className="mb-4 text-lg font-semibold text-white">Films</h2>
          <p className="text-sm text-zinc-500">No films logged yet.</p>
        </section>
      )}

      {/* ── Watchlist (if public) ── */}
      {target.watchlist_public && watchlist.length > 0 ? (
        <section>
          <h2 className="mb-4 text-lg font-semibold text-white">
            Watchlist ({watchlist.length})
          </h2>
          <div className="grid grid-cols-4 gap-3 sm:grid-cols-6">
            {watchlist.map((movie) => {
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
                      sizes="(max-width:640px) 25vw, 100px"
                    />
                  ) : null}
                </Link>
              );
            })}
          </div>
        </section>
      ) : null}
    </div>
  );
}
