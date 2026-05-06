import { MovieActions } from "./MovieActions";
import { getMovieDetails } from "@/lib/tmdb/client";
import { posterUrl } from "@/lib/tmdb/constants";
import { createClient } from "@/lib/supabase/server";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ tmdbId: string }> };

export default async function MovieDetailPage({ params }: Props) {
  const { tmdbId: raw } = await params;
  const tmdbId = Number(raw);
  if (!Number.isFinite(tmdbId)) notFound();

  let movie;
  try {
    movie = await getMovieDetails(tmdbId);
  } catch {
    notFound();
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Load existing diary entry for this user + movie.
  let existing: { user_rating: number | null; notes: string | null } | null = null;
  if (user) {
    const { data: movieRow } = await supabase
      .from("movies")
      .select("id")
      .eq("tmdb_id", tmdbId)
      .maybeSingle();

    if (movieRow?.id) {
      const { data: entry } = await supabase
        .from("watched_movies")
        .select("user_rating, notes")
        .eq("user_id", user.id)
        .eq("movie_id", movieRow.id)
        .maybeSingle();

      if (entry) {
        existing = {
          user_rating: entry.user_rating as number | null,
          notes: entry.notes as string | null,
        };
      }
    }
  }

  const backdrop = posterUrl(movie.backdrop_path, "original");
  const poster = posterUrl(movie.poster_path, "w500");

  return (
    <article>
      <div className="relative h-56 w-full overflow-hidden sm:h-72 md:h-96">
        {backdrop ? (
          <Image
            src={backdrop}
            alt=""
            fill
            className="object-cover opacity-60"
            priority
            sizes="100vw"
            aria-hidden
          />
        ) : (
          <div className="h-full bg-zinc-900" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#070708] via-[#070708]/80 to-transparent" />
      </div>

      <div className="relative mx-auto max-w-4xl px-4 pb-20 sm:px-6">
        <div className="-mt-24 flex flex-col gap-6 md:flex-row md:items-end">
          <div className="relative mx-auto aspect-[2/3] w-44 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-zinc-900 shadow-2xl md:mx-0 md:w-52">
            {poster ? (
              <Image
                src={poster}
                alt={movie.title}
                fill
                className="object-cover"
                sizes="208px"
              />
            ) : null}
          </div>
          <div className="flex-1 space-y-3 text-center md:pb-2 md:text-left">
            <h1 className="text-3xl font-semibold text-white md:text-4xl">
              {movie.title}
            </h1>
            <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm text-zinc-400 md:justify-start">
              <span>{movie.release_date?.slice(0, 4)}</span>
              <span>·</span>
              <span>
                ★ {movie.vote_average?.toFixed(1)}{" "}
                <span className="text-zinc-600">
                  ({movie.vote_count?.toLocaleString()} votes)
                </span>
              </span>
              <span>·</span>
              <span>{movie.runtime ?? "—"} min</span>
            </div>
            {existing?.user_rating ? (
              <p className="text-sm text-amber-100/80">
                Your rating:{" "}
                <span className="font-semibold">{existing.user_rating}/10</span>
              </p>
            ) : null}
            <div className="flex flex-wrap justify-center gap-2 md:justify-start">
              {movie.genres.map((g) => (
                <span
                  key={g.id}
                  className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-xs text-zinc-300"
                >
                  {g.name}
                </span>
              ))}
            </div>
          </div>
        </div>

        <p className="mx-auto mt-10 max-w-3xl text-sm leading-relaxed text-zinc-400 md:text-base">
          {movie.overview || "No synopsis available."}
        </p>

        {existing?.notes ? (
          <div className="mt-6 rounded-xl border border-white/10 bg-zinc-900/40 px-4 py-3">
            <p className="text-xs text-zinc-500">Your notes</p>
            <p className="mt-1 text-sm leading-relaxed text-zinc-300">{existing.notes}</p>
          </div>
        ) : null}

        <MovieActions
          tmdbId={tmdbId}
          isLoggedIn={!!user}
          existing={existing}
        />

        {!user ? (
          <p className="mt-4 text-center text-xs text-zinc-600 md:text-left">
            <Link href="/login" className="text-zinc-500 underline-offset-2 hover:underline">
              Sign in
            </Link>{" "}
            to log this film, rate it, and exclude it from future suggestions.
          </p>
        ) : null}
      </div>
    </article>
  );
}
